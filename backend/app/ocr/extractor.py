"""
OCR module - wraps PaddleOCR for label text extraction.
"""

from paddleocr import PaddleOCR

_ocr_engine = None


def get_ocr_engine() -> PaddleOCR:
    """Lazily initialize a single shared PaddleOCR instance (expensive to load)."""
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(use_angle_cls=True, lang="en")
    return _ocr_engine


def extract_text(image_path: str) -> str:
    """
    Run PaddleOCR on an image file and return the extracted text,
    line by line, in the order PaddleOCR detected it (top-to-bottom).
    """
    engine = get_ocr_engine()
    result = engine.ocr(image_path, cls=True)

    if not result or result[0] is None:
        return ""

    lines = [line[1][0] for line in result[0]]
    return "\n".join(lines)
