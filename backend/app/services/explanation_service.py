"""
Phase 2 orchestration: takes Phase 1's structured extraction (ingredients,
nutrition, allergens) and enriches it with RAG-grounded explanation,
health scoring, and an AI summary via Gemini.
"""

from app.rag.retriever import retrieve_context_for_ingredients
from app.services.llm_service import generate_explanation
from app.services.health_score import calculate_health_score


def explain_product(extraction: dict) -> dict:
    """
    extraction: the dict returned by analysis_service.analyze_image()
    (raw_text, ingredients, nutrition, allergen_mentions).

    Returns the extraction dict merged with a new "explanation" key containing
    the LLM's grounded output (ingredient_explanations, summary, etc) combined
    with the deterministic health score.
    """
    ingredients = extraction.get("ingredients", [])
    nutrition = extraction.get("nutrition", {})
    allergen_mentions = extraction.get("allergen_mentions", [])
    
    # 1. Deterministic Health Score
    health_score_data = calculate_health_score(nutrition, ingredients, allergen_mentions)

    # 2. RAG Context Retrieval
    context_chunks = []
    if ingredients:
        try:
            context_chunks = retrieve_context_for_ingredients(ingredients)
        except Exception:
            # Vector DB may not be built yet (knowledge_base empty / not indexed).
            # Degrade gracefully rather than failing the whole analysis.
            context_chunks = []

    # 3. LLM Explanation Generation
    explanation = generate_explanation(
        ingredients=ingredients,
        nutrition=nutrition,
        allergen_mentions=allergen_mentions,
        retrieved_context=context_chunks,
        health_score_data=health_score_data,
    )
    
    # 4. Merge deterministic score with LLM explanation payload
    # so the frontend receives it exactly where it expects `health_score`
    explanation["health_score"] = health_score_data.get("score")
    explanation["health_rating"] = health_score_data.get("rating")
    explanation["health_reasoning_points"] = health_score_data.get("reasoning_points")

    return {**extraction, "explanation": explanation}
