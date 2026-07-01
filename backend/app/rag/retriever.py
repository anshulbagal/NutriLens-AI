"""
RAG pipeline - chunking, embedding, and retrieval via ChromaDB + LangChain.
Supports both PDF and TXT files in knowledge_base/.
"""

import os
import glob

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document

KNOWLEDGE_BASE_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "knowledge_base"
)
VECTOR_DB_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "vector_db"
)

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_embeddings = None
_vectorstore = None


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    return _embeddings


def load_documents() -> list:
    """Load all PDF and TXT files from knowledge_base/."""
    all_docs = []

    # Load TXT files
    txt_paths = glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.txt"))
    for path in txt_paths:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        all_docs.append(Document(
            page_content=text,
            metadata={"source": os.path.basename(path)}
        ))

    # Load PDF files
    pdf_paths = glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.pdf"))
    if pdf_paths:
        from langchain_community.document_loaders import PyPDFLoader
        for path in pdf_paths:
            loader = PyPDFLoader(path)
            all_docs.extend(loader.load())

    return all_docs


def build_knowledge_base():
    """
    Load every TXT/PDF in knowledge_base/, chunk it, embed it, and persist
    the embeddings to vector_db/. Run this once after adding new reference
    documents or on startup if vector_db is empty.
    """
    all_docs = load_documents()

    if not all_docs:
        raise FileNotFoundError(
            f"No documents found in {KNOWLEDGE_BASE_DIR}. "
            "Add .txt or .pdf reference documents first."
        )

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = splitter.split_documents(all_docs)

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=get_embeddings(),
        persist_directory=VECTOR_DB_DIR,
    )
    vectorstore.persist()

    return {
        "documents_loaded": len(all_docs),
        "chunks_created": len(chunks)
    }


def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = Chroma(
            persist_directory=VECTOR_DB_DIR,
            embedding_function=get_embeddings(),
        )
    return _vectorstore


def retrieve_context(ingredient_query: str, k: int = 3) -> list:
    """
    Semantic search against the persisted ChromaDB store.
    Returns a list of plain-text chunk strings.
    """
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search(ingredient_query, k=k)
    return [doc.page_content for doc in results]


def retrieve_context_for_ingredients(ingredients: list, k_per_ingredient: int = 2) -> list:
    """
    Retrieve context for a whole ingredient list at once,
    deduplicating repeated chunks across ingredients.
    """
    seen = set()
    context_chunks = []
    for ingredient in ingredients:
        for chunk in retrieve_context(ingredient, k=k_per_ingredient):
            if chunk not in seen:
                seen.add(chunk)
                context_chunks.append(chunk)
    return context_chunks
