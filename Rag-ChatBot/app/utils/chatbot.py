import streamlit as st
from collections import defaultdict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from dotenv import load_dotenv
import os

def get_context_retriever_chain(vectordb):
    """
    Create a context retriever chain for generating responses based on the chat history and vector database

    Parameters:
    - vectordb: Vector database used for context retrieval

    Returns:
    - retrieval_chain: Context retriever chain for generating responses
    """
    # Load environment variables (gets api keys for the models)
    load_dotenv()
    # Initialize the model with GEMINI_API_KEY, set the retreiver and prompt for the chatbot
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
        convert_system_message_to_human=True,
        google_api_key=os.environ.get("GEMINI_API_KEY")
    )
    retriever = vectordb.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5}  # Retrieve top 5 most relevant chunks
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that answers questions based on the provided PDF documents. "
                   "Use the following context from the documents to answer the user's question. "
                   "If the context contains relevant information, provide a comprehensive answer based on it. "
                   "If the context doesn't contain enough information to answer the question, say so and ask for clarification or suggest what information might be helpful. "
                   "Do not make up information that is not in the context.\n\n"
                   "Context from documents: {context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])
    # Create chain for generating responses and a retrieval chain
    chain = create_stuff_documents_chain(llm=llm, prompt=prompt)
    retrieval_chain = create_retrieval_chain(retriever, chain)
    return retrieval_chain

def get_response(question, chat_history, vectordb):
    """
    Generate a response to the user's question based on the chat history and vector database

    Parameters:
    - question (str): The user's question
    - chat_history (list): List of previous chat messages
    - vectordb: Vector database used for context retrieval

    Returns:
    - response: The generated response
    - context: The context associated with the response
    """
    chain = get_context_retriever_chain(vectordb)
    response = chain.invoke({"input": question, "chat_history": chat_history})
    return response["answer"], response["context"]

def chat(chat_history, vectordb):
    """
    Handle the chat functionality of the application

    Parameters:
    - chat_history (list): List of previous chat messages
    - vectordb: Vector database used for context retrieval

    Returns:
    - chat_history: Updated chat history
    """
    user_query = st.chat_input("Ask a question:")
    if user_query is not None and user_query != "":
        # Generate response based on user's query, chat history and vectorstore
        response, context = get_response(user_query, chat_history, vectordb)
        # Update chat history. The model uses up to 10 previous messages to incorporate into the response
        chat_history = chat_history + [HumanMessage(content=user_query), AIMessage(content=response)]
        # Display source of the response on sidebar
        with st.sidebar:
            st.subheader("📚 Sources")
            if context:
                st.write(f"Retrieved {len(context)} relevant chunks")
                metadata_dict = defaultdict(list)
                for metadata in [doc.metadata for doc in context]:
                    metadata_dict[metadata['source']].append(metadata['page'])
                for source, pages in metadata_dict.items():
                    st.write(f"**Source:** {source}")
                    st.write(f"**Pages:** {', '.join(map(str, pages))}")
                    st.write("---")
            else:
                st.warning("No context retrieved from documents")
    # Display chat history
    for message in chat_history:
            with st.chat_message("AI" if isinstance(message, AIMessage) else "Human"):
                st.write(message.content)
    return chat_history