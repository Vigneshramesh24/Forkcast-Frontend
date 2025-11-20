# FastAPI Backend - PDF & Chat History

## 🎯 5 API Endpoints

### 1️⃣ Extract JSON from PDF

**POST** `/extract-json`

Upload a PDF and extract restaurant analytics. Automatically saves to history.

```bash
curl -X POST "http://127.0.0.1:8000/extract-json" \
  -F "pdf=@report.pdf"
```

**Response:**

```json
{
  "pdf_id": "a1b2c3d4-e5f6-7890...",
  "filename": "report.pdf",
  "timestamp": 1737064667,
  "report": {
    "restaurant_report": { ... }
  }
}
```

---

### 2️⃣ List All PDFs Processed

**GET** `/pdfs`

View all PDFs ever uploaded with metadata.

```bash
curl "http://127.0.0.1:8000/pdfs"
```

**Response:**

```json
[
  {
    "pdf_id": "a1b2c3d4-e5f6-7890...",
    "filename": "sales_january.pdf",
    "timestamp": 1737064667
  },
  {
    "pdf_id": "b2c3d4e5-f6a7-8901...",
    "filename": "sales_february.pdf",
    "timestamp": 1737151067
  }
]
```

---

### 3️⃣ Get JSON Report for Specific PDF

**GET** `/pdf/{pdf_id}`

Retrieve the JSON analytics report for a specific PDF by its ID.

```bash
curl "http://127.0.0.1:8000/pdf/a1b2c3d4-e5f6-7890"
```

**Response:**

```json
{
  "restaurant_report": {
    "metadata": { ... },
    "top_selling_item": { ... },
    "menu_items": [ ... ],
    ...
  }
}
```

---

### 4️⃣ Chat About PDFs (RAG)

**POST** `/chat`

Ask questions about your PDFs. Chat entries are automatically logged.

```bash
curl -X POST "http://127.0.0.1:8000/chat" \
  -F "question=What is the top selling item?" \
  -F "pdf_files=@report.pdf"
```

**Response:**

```json
{
  "answer": "The top selling item is Grilled Salmon with 450 units sold.",
  "context_count": 5,
  "chat_id": "c3d4e5f6-a7b8-9012..."
}
```

---

### 5️⃣ Get Chat History

**GET** `/chat-history`

View all Q&A pairs ever asked.

```bash
curl "http://127.0.0.1:8000/chat-history"
```

**Response:**

```json
[
  {
    "id": "c3d4e5f6-a7b8-9012...",
    "timestamp": 1737064700,
    "question": "What is the top selling item?",
    "answer": "The top selling item is Grilled Salmon with 450 units sold."
  },
  {
    "id": "d4e5f6a7-b8c9-0123...",
    "timestamp": 1737064750,
    "question": "How much revenue was generated?",
    "answer": "Total revenue was $45,230 for the month."
  }
]
```

---

## 🔄 Workflow Example

### Step 1: Upload PDF

```bash
curl -X POST "http://127.0.0.1:8000/extract-json" -F "pdf=@report.pdf"
```

Returns: `pdf_id`, `filename`, `timestamp`, full JSON report

### Step 2: View All PDFs

```bash
curl "http://127.0.0.1:8000/pdfs"
```

Returns: List of all PDFs with metadata

### Step 3: Click on PDF → Get Report

```bash
curl "http://127.0.0.1:8000/pdf/{pdf_id}"
```

Returns: Full JSON analytics for that specific PDF

### Step 4: Chat About PDF

```bash
curl -X POST "http://127.0.0.1:8000/chat" \
  -F "question=Top items?" \
  -F "pdf_files=@report.pdf"
```

Returns: Answer + context count

### Step 5: View All Chats

```bash
curl "http://127.0.0.1:8000/chat-history"
```

Returns: All Q&A history

---

## 🗂️ In-Memory Storage

### PDF_HISTORY

```python
{
  "pdf_id_1": {
    "pdf_id": "a1b2c3...",
    "filename": "report.pdf",
    "timestamp": 1737064667,
    "json": { full JSON report }
  },
  "pdf_id_2": { ... }
}
```

### CHAT_HISTORY

```python
[
  {
    "id": "c3d4e5f6...",
    "timestamp": 1737064700,
    "question": "What is...?",
    "answer": "..."
  }
]
```

---

## 📝 Notes

- **Storage:** In-memory (Python dicts/lists) — resets on server restart
- **Easy Upgrade Path:** Replace `PDF_HISTORY` dict and `CHAT_HISTORY` list with SQLite, PostgreSQL, or MongoDB
- **PDF Files:** Saved to `docs/` folder with `{pdf_id}_{filename}` naming
- **Timestamps:** Unix epoch (seconds since 1970)

---

## 🚀 Start Server

```bash
uvicorn main:app --reload
```

Then visit:

- **API Docs:** http://127.0.0.1:8000/docs
- **API ReDoc:** http://127.0.0.1:8000/redoc

---

## 🎨 Streamlit Integration Example

```python
import requests

# Show PDF history in sidebar
st.sidebar.header("📄 PDF History")
pdfs = requests.get("http://127.0.0.1:8000/pdfs").json()
for pdf in pdfs:
    if st.sidebar.button(f"📋 {pdf['filename']}"):
        # When clicked, fetch and display the JSON report
        report = requests.get(
            f"http://127.0.0.1:8000/pdf/{pdf['pdf_id']}"
        ).json()
        st.json(report)

# Show chat history
st.sidebar.header("💬 Chat History")
if st.sidebar.button("View All Chats"):
    history = requests.get("http://127.0.0.1:8000/chat-history").json()
    for chat in history:
        st.write(f"**Q:** {chat['question']}")
        st.write(f"**A:** {chat['answer']}")
        st.divider()
```

---

✅ **Status:** Production ready. Test with curl or Swagger UI at `/docs`
