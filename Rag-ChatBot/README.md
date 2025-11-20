# RAG PDF Chatbot

Chat with your PDF documents using AI. This application allows you to upload PDF files and ask questions about them in natural language. It uses Retrieval-Augmented Generation (RAG) with Google's Gemini model to provide accurate answers based only on your documents.

## ✨ Features

- **📤 Easy Upload**: Upload PDFs directly through the web interface
- **💬 Natural Conversations**: Ask questions in plain language
- **🔍 Source Attribution**: See exactly which pages were used for each answer
- **📚 Multiple Documents**: Upload and search across multiple PDFs
- **💾 Persistent Storage**: Documents are saved between sessions
- **🔒 Privacy First**: PDFs and embeddings stored locally, only chat queries sent to API
- **📊 Restaurant Report Generation**: Automatically analyzes uploaded documents and generates structured JSON reports with sales data, menu items, revenue, expenses, and insights

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up API Key
Create a `.env` file in the project root:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 3. Run the Application
```bash
cd app
streamlit run app.py
```

The app will open in your browser at `http://localhost:8501`

## 📤 How to Use

### Upload Documents
1. **Click "Browse files"** in the sidebar
2. **Select your PDF file(s)**
3. **Click "Process"** button
4. **Wait** for the success message (first run downloads ~80MB embedding model)
5. **Automatic Report Generation**: The system will analyze your document and generate a structured JSON report
6. **Start chatting!**

### Ask Questions
- "What is this document about?"
- "Summarize the main points"
- "What does it say about [topic]?"
- "Explain [concept] from the document"

### View Sources
Check the sidebar to see:
- Which document pages were used
- Number of relevant chunks retrieved
- Exact page numbers for each source

### Access Generated Reports
In the sidebar under "📊 Generated Reports":
- **View reports**: Click on any report to expand and view the JSON data
- **Download reports**: Use the "⬇️ Download JSON" button to save the report locally
- **Use for visualizations**: The JSON follows a structured schema perfect for frontend charts and graphs

## 🔧 How it Works

1. **Upload PDF**: Documents are saved to the `app/docs/` folder
2. **Text Extraction**: PDF content is extracted and split into chunks
3. **Create Embeddings**: Each chunk is converted to a vector representation using a local embedding model
4. **Store in Database**: Vectors are stored in ChromaDB (`Vector_DB - Documents/` folder)
5. **Generate Restaurant Report**: The entire document is analyzed by Gemini AI to extract structured data into a JSON report (`app/reports/` folder)
6. **Question Processing**: Your question is converted to a vector
7. **Similarity Search**: The top 5 most similar document chunks are retrieved
8. **Generate Answer**: Gemini AI reads the chunks and answers your question
9. **Show Sources**: The sidebar displays which pages were used

### Technical Stack
- **LLM**: Google Gemini 2.5 Flash
- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2 (runs locally)
- **Vector Store**: ChromaDB
- **Framework**: LangChain + Streamlit 

## 📁 Project Structure

```
RAG-Test/
├── app/
│   ├── app.py                       # Main application
│   ├── docs/                        # Your uploaded PDFs (auto-managed)
│   ├── reports/                     # Generated JSON reports (auto-created)
│   ├── restaurant_report_schema.json # JSON schema reference
│   ├── utils/
│   │   ├── chatbot.py              # Chat logic and LLM integration
│   │   ├── prepare_vectordb.py     # Vector database creation
│   │   ├── save_docs.py            # Document upload handling
│   │   ├── document_analyzer.py    # Restaurant report generation
│   │   └── session_state.py        # Session management
│   └── Vector_DB - Documents/      # Vector database (auto-created)
├── requirements.txt                 # Python dependencies
├── .env                            # API keys (you create this)
└── README.md                       # This file
```

## 🛠️ Configuration

### Change Embedding Model
Edit `app/utils/prepare_vectordb.py`:
```python
model_name="sentence-transformers/all-mpnet-base-v2"  # Better quality, slower
```

### Change LLM Model
Edit `app/utils/chatbot.py`:
```python
model="gemini-1.5-pro"  # More powerful model
```

### Adjust Chunk Size
Edit `app/utils/prepare_vectordb.py`:
```python
chunk_size=8000,      # Larger chunks = more context
chunk_overlap=800     # Overlap between chunks
```

### Retrieve More Documents
Edit `app/utils/chatbot.py`:
```python
search_kwargs={"k": 10}  # Retrieve top 10 chunks instead of 5
```

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| "Please upload a PDF document to start chatting" | Upload a PDF via the sidebar |
| Processing takes long (first time) | First run downloads embedding model (~80MB) |
| "No context retrieved from documents" | Re-upload your PDF and ensure processing completes |
| Browser shows "Failed to fetch module" | Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) |
| "GEMINI_API_KEY not found" | Create `.env` file with your API key |

## 🗑️ Managing Documents

### Start Fresh
```bash
cd app
rm docs/*.pdf
rm reports/*.json
rm -rf "Vector_DB - Documents"
streamlit run app.py
```

### Files Are Git-Ignored
Your PDFs, reports, and vector database won't be committed to version control:
- `app/docs/*.pdf` - Ignored
- `app/reports/` - Ignored
- `Vector_DB - Documents/` - Ignored

## 📊 Restaurant Report Schema

When you upload a document, the system automatically generates a structured JSON report containing:

- **Metadata**: Month and restaurant name
- **Top Selling Items**: Individual and top 5 items with sales data
- **Bottom Selling Items**: Bottom 5 performers
- **Menu Items**: Complete list with categories and prices
- **Daily Sales Summary**: Day-by-day breakdown with sales metrics
- **Monthly Totals**: Aggregate sales numbers
- **Expenses Over Time**: Expense tracking by category
- **Revenue & Profit**: Time-series financial data
- **Sales Percentages**: Item-wise sales distribution
- **Tips**: AI-generated insights and recommendations

If specific data isn't found in your document, the fields will contain appropriate default values (0 for numbers, empty strings, empty arrays).

See [restaurant_report_schema.json](app/restaurant_report_schema.json) for the complete schema structure.

## 💡 Tips for Best Results

1. **Upload via web interface** - Don't manually copy files to docs folder
2. **Wait for "Successfully processed" message** before chatting
3. **Check sidebar sources** to verify answer accuracy
4. **Ask specific questions** for better results
5. **Use follow-up questions** - The chatbot remembers your conversation
6. **For best reports** - Upload documents with clear tabular data, sales figures, and menu information

## 🔧 Restaurant Report Implementation Details

### How Report Generation Works

When you upload a PDF document:
1. The document is saved and processed for chat functionality
2. **Automatic Analysis**: The entire document text is sent to Gemini 2.5 Flash
3. **Structured Extraction**: AI extracts data following the restaurant report schema
4. **JSON Generation**: A strictly formatted JSON file is created
5. **Storage**: Report saved to `app/reports/{filename}_report.json`
6. **UI Display**: Report appears in sidebar with view/download options

### Key Features

- **Strict JSON Output**: Prompt engineered to output only valid JSON (no markdown, no explanations)
- **Default Values**: Missing data represented as 0, empty strings, or empty arrays
- **Error Handling**: Graceful degradation if analysis fails (chat still works)
- **Temperature 0**: Deterministic outputs for consistency
- **Frontend-Ready**: JSON structure perfect for charts, graphs, and dashboards

### Files Involved

- **`/app/utils/document_analyzer.py`**: Core analysis engine
  - `analyze_document_for_restaurant_report()`: Main analysis function
  - `save_report_to_file()`: Saves JSON reports
  - `get_all_reports()`: Lists available reports
  - `load_report()`: Loads saved reports

- **`/app/utils/save_docs.py`**: Updated to trigger analysis after upload
- **`/app/app.py`**: Updated with report viewing UI in sidebar
- **`/app/restaurant_report_schema.json`**: Schema reference file

### Customization Options

**Change Analysis Model** (in `utils/document_analyzer.py`):
```python
model="gemini-2.5-flash"  # or "gemini-1.5-pro" for higher quality
```

**Adjust Temperature**:
```python
temperature=0  # Increase (0-1) for more creative analysis
```

**Modify Schema**: Edit the prompt in `document_analyzer.py` to change report structure

### Frontend Integration

The JSON reports are ready for visualization frameworks. Each report contains:

```json
{
  "restaurant_report": {
    "metadata": { "month": "...", "restaurant_name": "..." },
    "top_selling_item": { "item_name": "...", "units_sold": 0, "percentage_of_sales": 0.0 },
    "daily_sales_summary": [...],
    "revenue_over_time": [...],
    "profit_over_time": [...],
    "tips": [...]
  }
}
```

**Suggested Visualizations**:
- Line charts for revenue/profit over time
- Bar charts for top/bottom selling items
- Pie charts for sales percentages
- Tables for menu items and daily summaries
- Metric cards for monthly totals

### Troubleshooting Reports

| Issue | Solution |
|-------|----------|
| Report not generating | Check console for errors, verify GEMINI_API_KEY is set |
| Empty/default data | Document may not contain restaurant data, or format not recognized |
| JSON parsing errors | Check document format, may need to adjust analysis prompt |
| Slow generation | Normal for large documents (10-30 seconds), uses Gemini Flash for speed |

### API Usage & Costs

- **Model**: Gemini 2.5 Flash (cost-efficient)
- **API Calls**: One per uploaded document
- **Token Usage**: Proportional to document size
- **Timeout**: None (waits for complete response)

## 📄 License

This project is open source and available for educational and personal use.
