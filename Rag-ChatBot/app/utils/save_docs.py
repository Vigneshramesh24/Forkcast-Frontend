import streamlit as st
from utils.prepare_vectordb import get_vectorstore
from utils.document_analyzer import analyze_document_for_restaurant_report_memory

def process_uploaded_docs(pdf_docs):
    """
    Process uploaded PDF documents in-memory and create vectorstore

    Parameters:
    - pdf_docs (list): List of uploaded PDF file objects from Streamlit
    """
    # Get the names of already processed PDFs
    processed_names = [pdf.name for pdf in st.session_state.uploaded_pdfs]

    # Filter out files that have already been processed
    new_files = [pdf for pdf in pdf_docs if pdf.name not in processed_names]

    if new_files and st.button("Process"):
        # Add new files to the uploaded list
        st.session_state.uploaded_pdfs.extend(new_files)

        # Display the processing message
        with st.spinner("Processing your document(s)... This may take a minute on first run."):
            # Create vectorstore from all uploaded PDFs (in-memory)
            all_pdfs = st.session_state.uploaded_pdfs
            st.session_state.vectordb = get_vectorstore(all_pdfs)
            st.success(f"✅ Successfully processed {len(new_files)} document(s)!")

        # Generate restaurant reports for each new file
        with st.spinner("Analyzing document(s) and generating restaurant reports..."):
            reports_generated = []
            for pdf in new_files:
                report_data = analyze_document_for_restaurant_report_memory(pdf)

                if report_data:
                    # Store report in session state with the PDF name
                    st.session_state.generated_reports.append({
                        "pdf_name": pdf.name,
                        "report_data": report_data
                    })
                    reports_generated.append(pdf.name)
                    st.success(f"📊 Generated report for: {pdf.name}")
                else:
                    st.warning(f"⚠️ Could not analyze: {pdf.name}")

            if reports_generated:
                st.success(f"✅ Successfully generated {len(reports_generated)} restaurant report(s)!")