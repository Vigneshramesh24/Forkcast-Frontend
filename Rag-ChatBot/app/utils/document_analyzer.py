from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv
import os
import json
import re
import tempfile

def analyze_document_for_restaurant_report_memory(pdf_file):
    """
    Analyze a PDF file object (in-memory) and generate a structured JSON report for restaurant data.

    Parameters:
    - pdf_file: Uploaded PDF file object from Streamlit

    Returns:
    - dict: Structured restaurant report as a dictionary, or None if analysis fails
    """
    # Create a temporary file to process the PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
        tmp_file.write(pdf_file.getvalue())
        tmp_path = tmp_file.name

    try:
        result = analyze_document_for_restaurant_report(tmp_path)
        return result
    finally:
        # Clean up the temporary file
        os.unlink(tmp_path)


def analyze_document_for_restaurant_report(pdf_path):
    """
    Analyze a PDF document and generate a structured JSON report for restaurant data.

    Parameters:
    - pdf_path (str): Path to the PDF document

    Returns:
    - dict: Structured restaurant report as a dictionary, or None if analysis fails
    """
    load_dotenv()

    try:
        # Load and extract text from PDF
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()

        # Combine all pages into a single text
        full_text = "\n\n".join([doc.page_content for doc in documents])

        # Initialize the LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0,  # Set to 0 for more deterministic outputs
            convert_system_message_to_human=True,
            google_api_key=os.environ.get("GEMINI_API_KEY")
        )

        # Create the analysis prompt
        prompt = f"""You are a data extraction specialist. Analyze the following document and extract restaurant sales and financial data.

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY a valid JSON object - no additional text, explanations, or markdown formatting
2. Do NOT include ```json or ``` markers
3. Do NOT include any text before or after the JSON
4. If data is not available in the document, use appropriate default values (0 for numbers, empty string for text, empty arrays for lists)
5. Follow the exact schema structure provided below

SCHEMA TO FOLLOW:
{{
  "restaurant_report": {{
    "metadata": {{
      "month": "YYYY-MM",
      "restaurant_name": "Extract from document or use empty string"
    }},
    "top_selling_item": {{
      "item_name": "",
      "units_sold": 0,
      "percentage_of_sales": 0.0
    }},
    "top_5_selling_items": [
      {{
        "item_name": "",
        "units_sold": 0,
        "percentage_of_sales": 0.0
      }}
    ],
    "bottom_5_selling_items": [
      {{
        "item_name": "",
        "units_sold": 0,
        "percentage_of_sales": 0.0
      }}
    ],
    "menu_items": [
      {{
        "item_name": "",
        "category": "",
        "price": 0.0
      }}
    ],
    "daily_sales_summary": [
      {{
        "date": "YYYY-MM-DD",
        "day_of_week": "",
        "week_number": 0,
        "number_of_sales": 0,
        "units_sold": 0,
        "total_sales_amount": 0.0
      }}
    ],
    "total_month_sales": {{
      "number_of_sales": 0,
      "units_sold": 0,
      "total_sales_amount": 0.0
    }},
    "expenses_over_time": [
      {{
        "date": "YYYY-MM-DD",
        "expense_category": "",
        "amount": 0.0
      }}
    ],
    "revenue_over_time": [
      {{
        "date": "YYYY-MM-DD",
        "revenue": 0.0
      }}
    ],
    "profit_over_time": [
      {{
        "date": "YYYY-MM-DD",
        "profit": 0.0
      }}
    ],
    "sales_percentages_by_item": [
      {{
        "item_name": "",
        "percentage_of_total_sales": 0.0
      }}
    ],
    "tips": [
      {{
        "tip_title": "",
        "tip_description": ""
      }}
    ]
  }}
}}

DOCUMENT TEXT:
{full_text}

Generate the JSON report now (JSON ONLY, no other text):"""

        # Invoke the LLM
        response = llm.invoke(prompt)

        # Extract the content from the response
        if hasattr(response, 'content'):
            json_text = response.content
        else:
            json_text = str(response)

        # Clean up the response - remove markdown code blocks if present
        json_text = json_text.strip()
        json_text = re.sub(r'^```json\s*', '', json_text)
        json_text = re.sub(r'^```\s*', '', json_text)
        json_text = re.sub(r'\s*```$', '', json_text)
        json_text = json_text.strip()

        # Parse the JSON
        report_data = json.loads(json_text)

        return report_data

    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response text: {json_text[:500]}")  # Print first 500 chars for debugging
        return None
    except Exception as e:
        print(f"Error analyzing document: {e}")
        return None


def save_report_to_file(report_data, pdf_name):
    """
    Save the generated report to a JSON file.

    Parameters:
    - report_data (dict): The restaurant report data
    - pdf_name (str): Name of the PDF file (used to name the JSON file)

    Returns:
    - str: Path to the saved JSON file, or None if save fails
    """
    try:
        # Create reports directory if it doesn't exist
        reports_dir = "reports"
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)

        # Generate JSON filename based on PDF name
        json_filename = os.path.splitext(pdf_name)[0] + "_report.json"
        json_path = os.path.join(reports_dir, json_filename)

        # Save to file with pretty formatting
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)

        return json_path

    except Exception as e:
        print(f"Error saving report: {e}")
        return None


def get_all_reports_from_session(st):
    """
    Get all generated reports from session state.

    Parameters:
    - st: Streamlit module

    Returns:
    - list: List of report dictionaries from session state
    """
    if hasattr(st, 'session_state') and 'generated_reports' in st.session_state:
        return st.session_state.generated_reports
    return []
