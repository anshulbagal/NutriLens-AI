# Knowledge Base

Drop reference PDFs in this folder for the RAG pipeline to chunk and embed.
Good sources (per the project blueprint):

- Ingredient/additive glossaries (e.g. an E-number additive guide)
- FDA / WHO nutrition guidance documents
- Allergen reference sheets
- General nutrition science guides

After adding PDFs, rebuild the vector store by calling:

```
POST /admin/build-knowledge-base
```

or running directly:

```python
from app.rag.retriever import build_knowledge_base
build_knowledge_base()
```

This re-chunks and re-embeds every PDF here into `vector_db/`.
