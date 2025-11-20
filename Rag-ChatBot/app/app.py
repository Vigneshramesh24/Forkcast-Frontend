import streamlit as st
import json
from utils.save_docs import process_uploaded_docs
from utils.session_state import initialize_session_state_variables
from utils.chatbot import chat
from utils.document_analyzer import get_all_reports_from_session

class ChatApp:
    """
    A Streamlit application for chatting with PDF documents

    This class encapsulates the functionality for uploading PDF documents, processing them,
    and enabling users to chat with the documents using a chatbot. All data is stored in-memory
    and cleared when the app restarts.
    """
    def __init__(self):
        """
        Initializes the ChatApp class

        This method sets Streamlit page configurations and initializes session state variables
        """
        # Configurations and session state initialization
        st.set_page_config(page_title="Chat with PDFS :books:")
        st.title("Chat with PDFS :books:")
        initialize_session_state_variables(st)

    def run(self):
        """
        Runs the Streamlit app for chatting with PDFs

        This method handles the frontend for document upload, unlocks the chat when documents are uploaded,
        and locks the chat until documents are uploaded. All data is stored in-memory.
        """
        # Sidebar frontend for document upload
        with st.sidebar:
            st.subheader("Your documents")
            if st.session_state.uploaded_pdfs:
                st.write("Uploaded Documents:")
                uploaded_names = [pdf.name for pdf in st.session_state.uploaded_pdfs]
                st.text(", ".join(uploaded_names))
            else:
                st.info("No documents uploaded yet.")

            # Display available reports from session state
            st.subheader("📊 Generated Reports")
            reports = get_all_reports_from_session(st)
            if reports:
                st.write(f"Available reports: {len(reports)}")
                for report in reports:
                    report_name = report['pdf_name']
                    report_data = report['report_data']
                    with st.expander(f"📄 {report_name}_report"):
                        st.json(report_data)
                        # Provide download button
                        json_str = json.dumps(report_data, indent=2, ensure_ascii=False)
                        st.download_button(
                            label="⬇️ Download JSON",
                            data=json_str,
                            file_name=f"{report_name}_report.json",
                            mime="application/json"
                        )
            else:
                st.info("No reports generated yet.")

            st.subheader("Upload PDF documents")
            pdf_docs = st.file_uploader("Select a PDF document and click on 'Process'", type=['pdf'], accept_multiple_files=True)
            if pdf_docs:
                process_uploaded_docs(pdf_docs)

        # Unlocks the chat when document is uploaded
        if st.session_state.uploaded_pdfs:
            # Only chat if vectordb is available
            if st.session_state.vectordb is not None:
                st.session_state.chat_history = chat(st.session_state.chat_history, st.session_state.vectordb)
            else:
                st.warning("Please click 'Process' to create the vector database.")

        # Locks the chat until a document is uploaded
        if not st.session_state.uploaded_pdfs:
            st.info("Upload a PDF file to chat with it. All data will be cleared when you restart the app.")

if __name__ == "__main__":
    app = ChatApp()
    app.run()