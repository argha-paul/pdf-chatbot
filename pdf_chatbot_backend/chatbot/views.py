from django.shortcuts import render

# Create your views here.
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import google.generativeai as genai
import tempfile

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Extract text from uploaded PDF files
def get_pdf_text(pdf_files):
    text = ""
    for pdf in pdf_files:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

# Split the extracted text into chunks for vector embedding
def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
    return text_splitter.split_text(text)

# Create or load vector embeddings for text chunks
def get_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local("faiss_index")

# Load the conversational model chain
def get_conversational_chain():
    prompt_template = """
    Answer the question as detailed as possible from the provided context, make sure to provide all the details, if the answer is not in
    provided context just say, "answer is not available in the context", don't provide the wrong answer\n\n
    Context:\n {context}?\n
    Question: \n{question}\n

    Answer:
    """
    model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    return load_qa_chain(model, chain_type="stuff", prompt=prompt)

# Process PDF files and generate a vector store
@csrf_exempt
def process_pdf(request):
    print("Hello")
    if request.method == 'POST':
        pdf_files = request.FILES.getlist('pdf_files')
        with tempfile.TemporaryDirectory() as temp_dir:
            file_paths = []
            for pdf in pdf_files:
                path = os.path.join(temp_dir, pdf.name)
                with open(path, 'wb') as f:
                    f.write(pdf.read())
                file_paths.append(path)

            raw_text = get_pdf_text(file_paths)
            text_chunks = get_text_chunks(raw_text)
            get_vector_store(text_chunks)
            
        return JsonResponse({"message": "PDF processed and vector store created"})

# Handle user questions and return answers
@csrf_exempt
def ask_question(request):
    if request.method == 'POST':
        user_question = request.POST['question']
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.load_local("faiss_index", embeddings, allow_dangerous_deserialization=True)
        
        docs = vector_store.similarity_search(user_question)
        chain = get_conversational_chain()
        
        response = chain({"input_documents": docs, "question": user_question}, return_only_outputs=True)
        
        return JsonResponse({"answer": response["output_text"]})
    
# def index(request):
#     return render(request, 'index.html')