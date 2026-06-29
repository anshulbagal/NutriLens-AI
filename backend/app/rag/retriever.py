"""
RAG pipeline - chunking, embedding, and retrieval via ChromaDB + LangChain.
"""

import os
import glob

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

KNOWLEDGE_BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "knowledge_base")
VECTOR_DB_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "vector_db")

# Free, local embedding model (no API cost) - good enough quality for
# ingredient/nutrition reference text. Swap for a larger model if needed.
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_embeddings = None
_vectorstore = None


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    return _embeddings


def build_knowledge_base():
    """
    Load every PDF in knowledge_base/, chunk it, embed it, and persist
    the embeddings to vector_db/. Run this once after adding new reference
    documents (ingredient glossaries, FDA/WHO guidance, allergen info, etc).
    """
    pdf_paths = glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.pdf"))
    if not pdf_paths:
        raise FileNotFoundError(
            f"No PDFs found in {KNOWLEDGE_BASE_DIR}. Add reference documents first."
        )

    all_docs = []
    for path in pdf_paths:
        loader = PyPDFLoader(path)
        all_docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = splitter.split_documents(all_docs)

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=get_embeddings(),
        persist_directory=VECTOR_DB_DIR,
    )
    vectorstore.persist()
    return {"documents_loaded": len(pdf_paths), "chunks_created": len(chunks)}


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
    Semantic search against the persisted ChromaDB store for chunks relevant
    to a given ingredient (or general nutrition question). Returns a list of
    plain-text chunk strings, ready to drop into an LLM prompt.
    """
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search(ingredient_query, k=k)
    return [doc.page_content for doc in results]


def retrieve_context_for_ingredients(ingredients: list, k_per_ingredient: int = 2) -> list:
    """
    Convenience wrapper: retrieve context for a whole ingredient list at once,
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
