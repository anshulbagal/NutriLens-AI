"""
OCR module - wraps EasyOCR for label text extraction.
"""

import easyocr

_ocr_engine = None


def get_ocr_engine() -> easyocr.Reader:
    """Lazily initialize a single shared EasyOCR instance (expensive to load)."""
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = easyocr.Reader(["en"])
    return _ocr_engine


def extract_text(image_path: str) -> str:
    """
    Run EasyOCR on an image file and return the extracted text,
    line by line, in detected order (top-to-bottom).
    """
    engine = get_ocr_engine()
    result = engine.readtext(image_path)

    if not result:
        return ""

    lines = [item[1] for item in result]
    return "\n".join(lines)
