"""
Orchestrates the single-product analysis pipeline:
image -> OCR -> parse -> (Phase 2: RAG + LLM) -> structured result.
"""

from app.ocr.extractor import extract_text
from app.services.parser import parse_ingredients, parse_nutrition, extract_allergen_mentions


def analyze_image(image_path: str) -> dict:
    """
    Run OCR + parsing on a single label image.
    Returns a dict with raw text, parsed ingredients, nutrition, and allergen mentions.

    NOTE: RAG-grounded explanation, health scoring, and AI summary are added
    in Phase 2 (see app/services/explanation_service.py) on top of this
    structured extraction.
    """
    raw_text = extract_text(image_path)

    if not raw_text.strip():
        return {
            "raw_text": "",
            "ingredients": [],
            "nutrition": {},
            "allergen_mentions": [],
            "warning": "No text could be detected in this image. Try a clearer, "
                       "well-lit photo of the label.",
        }

    ingredients = parse_ingredients(raw_text)
    nutrition = parse_nutrition(raw_text)
    allergen_mentions = extract_allergen_mentions(raw_text)

    return {
        "raw_text": raw_text,
        "ingredients": ingredients,
        "nutrition": nutrition,
        "allergen_mentions": allergen_mentions,
    }
