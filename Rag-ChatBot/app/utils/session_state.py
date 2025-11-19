def initialize_session_state_variables(st):
    """
    Initialize session state variables for the Streamlit application

    Parameters:
    - st (streamlit.delta_generator.DeltaGenerator): Streamlit's DeltaGenerator object used for rendering elements
    """
    # List of session state variables to initialize
    variables_to_initialize = ["chat_history", "uploaded_pdfs", "vectordb", "generated_reports"]
    # Iterate over the variables and initializes them if not present in the session state
    for variable in variables_to_initialize:
        if variable not in st.session_state:
            if variable == "vectordb":
                # Always start with None - requires user to upload files
                st.session_state.vectordb = None
            elif variable == "generated_reports":
                # Store reports in memory as a list of dicts
                st.session_state.generated_reports = []
            else:
                # Initialize as empty list
                st.session_state[variable] = []