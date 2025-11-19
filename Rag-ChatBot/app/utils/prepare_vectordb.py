from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
import os
import tempfile

def extract_pdf_text(pdf_files):
    """
    Extract text from PDF file objects (in-memory)

    Parameters:
    - pdf_files (list): List of uploaded PDF file objects from Streamlit

    Returns:
    - docs: List of text extracted from PDF documents
    """
    docs = []
    for pdf_file in pdf_files:
        # Create a temporary file to process the PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(pdf_file.getvalue())
            tmp_path = tmp_file.name

        try:
            # Load text from the PDF
            docs.extend(PyPDFLoader(tmp_path).load())
        finally:
            # Clean up the temporary file
            os.unlink(tmp_path)

    return docs

def get_text_chunks(docs):
    """
    Split text into chunks

    Parameters:
    - docs (list): List of text documents

    Returns:
    - chunks: List of text chunks
    """
    # Chunk size is configured to be an approximation to the model limit of 2048 tokens
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=8000, chunk_overlap=800, separators=["\n\n", "\n", " ", ""])
    chunks = text_splitter.split_documents(docs)
    return chunks

def get_vectorstore(pdf_files):
    """
    Create a temporary in-memory vectorstore from PDF file objects using HuggingFace embeddings

    Parameters:
    - pdf_files (list): List of uploaded PDF file objects from Streamlit

    Returns:
    - vectordb: The created vectorstore (in-memory, no persistence)
    """
    load_dotenv()

    # Use HuggingFace embeddings with a reliable model
    # Using sentence-transformers/all-MiniLM-L6-v2 - a popular, lightweight model
    # Alternative: "sentence-transformers/all-mpnet-base-v2" for better quality but slower
    hf_embedding = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )

    docs = extract_pdf_text(pdf_files)
    chunks = get_text_chunks(docs)
    # Create in-memory vectorstore (no persist_directory means it's temporary)
    vectordb = Chroma.from_documents(documents=chunks, embedding=hf_embedding)
    return vectordb