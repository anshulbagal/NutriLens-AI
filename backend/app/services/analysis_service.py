"""
Orchestrates the single-product analysis pipeline:
image -> OCR -> parse -> (Phase 2: RAG + LLM) -> structured result.
"""

from app.ocr.extractor import extract_text
from app.services.llm_service import extract_structured_data


def analyze_image(image_path: str) -> dict:
    """
    Run OCR + LLM structured extraction on a single label image.
    Returns a dict with raw text, extracted ingredients, nutrition, and allergen mentions.

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

    # Use LLM to extract structured data from raw OCR text
    structured_data = extract_structured_data(raw_text)

    # Attach raw_text back to the structured payload
    structured_data["raw_text"] = raw_text

    return structured_data
