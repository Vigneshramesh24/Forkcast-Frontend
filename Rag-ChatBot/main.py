from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import sys
import time
import uuid
import io
from pathlib import Path

# Add app directory to path so we can import utils
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

# === Import your existing logic ===
# Use the LLM-based analyzer (correct parser)
from utils.document_analyzer import analyze_document_for_restaurant_report
from utils.prepare_vectordb import get_vectorstore
from utils.chatbot import get_response

app = FastAPI(
    title="Restaurant PDF API",
    description="Endpoints for JSON extraction, PDF history, and chat history.",
    version="1.1.0"
)

# -------------------------------------------------------------------
# IN-MEMORY DATABASES
# -------------------------------------------------------------------
PDF_HISTORY = {}       # {pdf_id: {"filename": "...", "timestamp": 1234, "json": {...}}}
CHAT_HISTORY = []      # list of {"id": "...", "question": "...", "answer": "...", "timestamp": 1234}

# Ensure docs folder exists for temporary storage of uploaded PDFs
os.makedirs("docs", exist_ok=True)

# -------------------------------------------------------------------
# 1) JSON EXTRACTION ENDPOINT + SAVE HISTORY
# -------------------------------------------------------------------
@app.post("/extract-json")
async def extract_json_endpoint(pdf: UploadFile = File(...)):
    """
    Upload a PDF and return the extracted restaurant analytics JSON.
    Saves to in-memory history for later retrieval.
    """
    pdf_id = str(uuid.uuid4())
    timestamp = int(time.time())

    # Save locally with unique ID prefix
    safe_name = os.path.basename(pdf.filename)
    dest_path = os.path.join("docs", f"{pdf_id}_{safe_name}")

    try:
        with open(dest_path, "wb") as f:
            f.write(await pdf.read())

        # Extract JSON using the LLM-based analyzer
        result = analyze_document_for_restaurant_report(dest_path)

        # Save to history
        PDF_HISTORY[pdf_id] = {
            "pdf_id": pdf_id,
            "filename": safe_name,
            "timestamp": timestamp,
            "json": result
        }

        return {
            "pdf_id": pdf_id,
            "filename": safe_name,
            "timestamp": timestamp,
            "report": result
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


# -------------------------------------------------------------------
# 2) LIST ALL PDFs PROCESSED
# -------------------------------------------------------------------
@app.get("/pdfs")
async def list_pdfs():
    """
    Get list of all PDFs processed.
    Returns PDF metadata without the full JSON.
    """
    return [
        {
            "pdf_id": pdf_data["pdf_id"],
            "filename": pdf_data["filename"],
            "timestamp": pdf_data["timestamp"]
        }
        for pdf_data in PDF_HISTORY.values()
    ]


# -------------------------------------------------------------------
# 3) GET JSON REPORT FOR SPECIFIC PDF
# -------------------------------------------------------------------
@app.get("/pdf/{pdf_id}")
async def get_pdf_report(pdf_id: str):
    """
    Get the extracted JSON report for a specific PDF by ID.
    """
    if pdf_id not in PDF_HISTORY:
        return JSONResponse(
            status_code=404,
            content={"error": f"PDF with ID {pdf_id} not found"}
        )
    return PDF_HISTORY[pdf_id]["json"]


# -------------------------------------------------------------------
# 4) CHAT ENDPOINT (NOW LOGGING HISTORY)
# -------------------------------------------------------------------
@app.post("/chat")
async def chat_endpoint(
    question: str = Form(...),
    pdf_files: Optional[List[UploadFile]] = None
):
    """
    Chat about PDF documents using vectorDB + RAG.
    Also logs all Q&A pairs to chat history.

    Inputs:
      - question: text input
      - pdf_files: optional list of PDF uploads
    """
    timestamp = int(time.time())

    # Load and build vector DB if PDFs provided
    vectordb = None
    if pdf_files:
        pdf_file_objs = []
        for file in pdf_files:
            safe_name = os.path.basename(file.filename)
            dest_path = os.path.join("docs", safe_name)
            content = await file.read()
            # Save a copy on disk for traceability
            with open(dest_path, "wb") as f:
                f.write(content)

            # Create a file-like object compatible with prepare_vectordb.extract_pdf_text
            # which expects objects with a .getvalue() method (e.g., io.BytesIO)
            pdf_file_objs.append(io.BytesIO(content))

        # Build vectorstore from file-like objects
        vectordb = get_vectorstore(pdf_file_objs)

    # If no vectordb → block
    if vectordb is None:
        return JSONResponse(
            status_code=400,
            content={"error": "No PDFs were provided to build context."}
        )

    # No persistent chat history used in RAG — only logging
    response, context = get_response(question, [], vectordb)

    # Save log entry
    chat_entry = {
        "id": str(uuid.uuid4()),
        "timestamp": timestamp,
        "question": question,
        "answer": response
    }
    CHAT_HISTORY.append(chat_entry)

    return {
        "answer": response,
        "context_count": len(context),
        "chat_id": chat_entry["id"]
    }


# -------------------------------------------------------------------
# 5) FULL CHAT HISTORY API
# -------------------------------------------------------------------
@app.get("/chat-history")
async def get_chat_history():
    """
    Get all chat history entries (Q&A pairs with timestamps).
    """
    return CHAT_HISTORY
