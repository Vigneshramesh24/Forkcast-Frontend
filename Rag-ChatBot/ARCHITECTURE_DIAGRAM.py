#!/usr/bin/env python3
"""
VISUAL ARCHITECTURE DIAGRAM
FastAPI Backend with PDF & Chat History
"""

ARCHITECTURE = """
╔═══════════════════════════════════════════════════════════════════════════╗
║                     FASTAPI BACKEND ARCHITECTURE                         ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────┐
│ CLIENT (Streamlit, Browser, Mobile, Desktop)                             │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ FastAPI Server (main.py)                                                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Endpoints                                                        │  │
│  │                                                                  │  │
│  │  POST /extract-json                                             │  │
│  │    ├─ Receive PDF file                                          │  │
│  │    ├─ Save to docs/                                             │  │
│  │    ├─ Extract JSON via analytics_extractor                      │  │
│  │    ├─ Save to PDF_HISTORY                                       │  │
│  │    └─ Return pdf_id + report                                    │  │
│  │                                                                  │  │
│  │  GET /pdfs                                                      │  │
│  │    └─ Return list of PDFs from PDF_HISTORY                      │  │
│  │                                                                  │  │
│  │  GET /pdf/{pdf_id}                                              │  │
│  │    └─ Return cached JSON from PDF_HISTORY                       │  │
│  │                                                                  │  │
│  │  POST /chat                                                     │  │
│  │    ├─ Receive question + PDFs                                   │  │
│  │    ├─ Build vectorstore via get_vectorstore()                   │  │
│  │    ├─ Get response via get_response() (RAG)                     │  │
│  │    ├─ Save Q&A to CHAT_HISTORY                                  │  │
│  │    └─ Return answer + context_count                             │  │
│  │                                                                  │  │
│  │  GET /chat-history                                              │  │
│  │    └─ Return all Q&A pairs from CHAT_HISTORY                    │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ In-Memory Storage                                                │  │
│  │                                                                  │  │
│  │  PDF_HISTORY (Dict)                                             │  │
│  │  {                                                               │  │
│  │    "uuid-1": {pdf_id, filename, timestamp, json},              │  │
│  │    "uuid-2": {pdf_id, filename, timestamp, json},              │  │
│  │    ...                                                           │  │
│  │  }                                                               │  │
│  │                                                                  │  │
│  │  CHAT_HISTORY (List)                                            │  │
│  │  [                                                               │  │
│  │    {id, timestamp, question, answer},                           │  │
│  │    {id, timestamp, question, answer},                           │  │
│  │    ...                                                           │  │
│  │  ]                                                               │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
           │                                              │
           │ HTTP Responses                              │
           │                                              │
           │                         ┌────────────────────┘
           │                         │
           ▼                         ▼
    ┌─────────────────┐      ┌──────────────────┐
    │ Streamlit       │      │ File System      │
    │ - Sidebar       │      │ docs/            │
    │ - PDF List      │      │ - report.pdf     │
    │ - Chat History  │      │ - sales.pdf      │
    │ - Chat Input    │      │ - ...            │
    └─────────────────┘      └──────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATA FLOW EXAMPLES

1. Upload PDF & Extract JSON
───────────────────────────────────────────────────────────────────────────
  User selects PDF
       ↓
  POST /extract-json (with file)
       ↓
  Generate UUID (a1b2c3d4-...)
       ↓
  Save to docs/a1b2c3d4-report.pdf
       ↓
  Extract JSON using extract_restaurant_analytics()
       ↓
  Save to PDF_HISTORY[a1b2c3d4] = {id, filename, timestamp, json}
       ↓
  Return {pdf_id, filename, timestamp, report}
       ↓
  Streamlit displays report


2. View Saved Reports
───────────────────────────────────────────────────────────────────────────
  User clicks PDF in sidebar
       ↓
  Streamlit calls GET /pdfs
       ↓
  API returns list from PDF_HISTORY (no file I/O)
       ↓
  User clicks specific PDF
       ↓
  Streamlit calls GET /pdf/{pdf_id}
       ↓
  API returns cached json from PDF_HISTORY[pdf_id]
       ↓
  Streamlit displays JSON (instant!)


3. Chat Session
───────────────────────────────────────────────────────────────────────────
  User asks question + uploads PDF
       ↓
  POST /chat (with question + files)
       ↓
  Save PDFs to docs/
       ↓
  Build vectorstore via get_vectorstore()
       ↓
  Get RAG response via get_response()
       ↓
  Generate chat UUID (c3d4e5f6-...)
       ↓
  Save to CHAT_HISTORY = [..., {id, timestamp, question, answer}]
       ↓
  Return {answer, context_count, chat_id}
       ↓
  User clicks "View Chat History"
       ↓
  GET /chat-history
       ↓
  API returns all entries from CHAT_HISTORY
       ↓
  Streamlit displays conversation


4. Streamlit Integration Loop
───────────────────────────────────────────────────────────────────────────
  Loop:
    1. Sidebar shows POST /pdfs (refreshes list)
    2. User clicks PDF → GET /pdf/{id}
    3. User uploads PDF → POST /extract-json
    4. User asks question → POST /chat
    5. User clicks "History" → GET /chat-history
    (Loop back to 1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STORAGE PERSISTENCE

┌─────────────────────┐        ┌────────────────────┐
│ IN-MEMORY           │        │ ON-DISK            │
│ (Lost on Restart)   │        │ (Persists)         │
├─────────────────────┤        ├────────────────────┤
│ PDF_HISTORY dict    │        │ docs/              │
│ CHAT_HISTORY list   │        │ ├── uuid_name1.pdf │
│                     │        │ ├── uuid_name2.pdf │
│ Fast lookups        │        │ └── uuid_name3.pdf │
│ Low memory overhead │        │                    │
│                     │        │ Can re-process     │
│ Easy to test        │        │ if needed          │
└─────────────────────┘        └────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUEST/RESPONSE FLOW

REQUEST:
┌──────────────────────────────┐
│ POST /extract-json           │
│ Content-Type: multipart/form │
│ Body: PDF file (binary)      │
└──────────────────────────────┘
         ↓
PROCESSING:
┌──────────────────────────────┐
│ Generate UUID                │
│ Save file                    │
│ Extract JSON                 │
│ Save to history              │
└──────────────────────────────┘
         ↓
RESPONSE:
┌──────────────────────────────────┐
│ 200 OK                           │
│ Content-Type: application/json   │
│ Body:                            │
│ {                                │
│   "pdf_id": "a1b2c3d4-...",     │
│   "filename": "report.pdf",      │
│   "timestamp": 1737064667,       │
│   "report": { ...full JSON... }  │
│ }                                │
└──────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ERROR HANDLING

Endpoint              Error Case           Response Code  Message
─────────────────────┼────────────────────┼──────────────┼─────────────
GET /pdf/{pdf_id}    PDF not found        404            "PDF not found"
POST /chat            No PDFs provided     400            "No PDFs..."
*                     Server error         500            Error message

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PERFORMANCE METRICS

Operation                    Time          Depends On
──────────────────────────────┼────────────┼──────────────────────
POST /extract-json             2-5 sec     PDF size, complexity
GET /pdfs                      <10 ms      Number of PDFs
GET /pdf/{pdf_id}              <1 ms       In-memory lookup
POST /chat                     5-30 sec    Model inference time
GET /chat-history              <10 ms      Number of chat entries

Memory Usage:
  - Per PDF: ~100 KB - 1 MB (JSON report size)
  - Per Chat Entry: ~1-2 KB
  - 100 PDFs: ~10-100 MB
  - 1000 Chat entries: ~2-4 MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UPGRADE PATH (When Scaling)

Current (In-Memory):
  PDF_HISTORY = {} (dict)
  CHAT_HISTORY = [] (list)

Option 1: SQLite
  CREATE TABLE pdfs (id, filename, timestamp, json)
  CREATE TABLE chats (id, timestamp, question, answer)

Option 2: PostgreSQL
  Same as SQLite but with connection pooling

Option 3: MongoDB
  db.pdfs.insertOne({_id, filename, timestamp, json})
  db.chats.insertOne({_id, timestamp, question, answer})

Code changes needed:
  - Replace dict lookups with database queries
  - Add connection pooling
  - Add indexes for performance
  - Add migrations for schema changes

"""

print(ARCHITECTURE)

# Save to file
with open("ARCHITECTURE_DIAGRAM.txt", "w") as f:
    f.write(ARCHITECTURE)
    print("\n✅ Saved to ARCHITECTURE_DIAGRAM.txt")
