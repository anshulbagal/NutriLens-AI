"""
Phase 2 orchestration: takes Phase 1's structured extraction (ingredients,
nutrition, allergens) and enriches it with RAG-grounded explanation,
health scoring, and an AI summary via Gemini.
"""

from app.rag.retriever import retrieve_context_for_ingredients
from app.services.llm_service import generate_explanation


def explain_product(extraction: dict) -> dict:
    """
    extraction: the dict returned by analysis_service.analyze_image()
    (raw_text, ingredients, nutrition, allergen_mentions).

    Returns the extraction dict merged with a new "explanation" key containing
    the LLM's grounded output (ingredient_explanations, health_score, summary, etc).
    """
    ingredients = extraction.get("ingredients", [])

    context_chunks = []
    if ingredients:
        try:
            context_chunks = retrieve_context_for_ingredients(ingredients)
        except Exception:
            # Vector DB may not be built yet (knowledge_base empty / not indexed).
            # Degrade gracefully rather than failing the whole analysis.
            context_chunks = []

    explanation = generate_explanation(
        ingredients=ingredients,
        nutrition=extraction.get("nutrition", {}),
        allergen_mentions=extraction.get("allergen_mentions", []),
        retrieved_context=context_chunks,
    )

    return {**extraction, "explanation": explanation}
