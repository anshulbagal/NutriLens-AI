"""
Phase 4 orchestration: runs the full Phase 1+2 pipeline on two product images
and produces a structured side-by-side comparison.
"""

from app.services.analysis_service import analyze_image
from app.rag.retriever import retrieve_context_for_ingredients
from app.services.llm_service import generate_comparison


def compare_products(image_path_a: str, image_path_b: str) -> dict:
    extraction_a = analyze_image(image_path_a)
    extraction_b = analyze_image(image_path_b)

    combined_ingredients = list(
        set(extraction_a.get("ingredients", []) + extraction_b.get("ingredients", []))
    )

    context_chunks = []
    if combined_ingredients:
        try:
            context_chunks = retrieve_context_for_ingredients(combined_ingredients)
        except Exception:
            context_chunks = []

    comparison = generate_comparison(
        product_a=extraction_a,
        product_b=extraction_b,
        retrieved_context=context_chunks,
    )

    return {
        "product_a": extraction_a,
        "product_b": extraction_b,
        "comparison": comparison,
    }
