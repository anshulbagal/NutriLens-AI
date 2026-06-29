"""
Parses raw OCR text into structured ingredient and nutrition data.

OCR text from food labels is messy: inconsistent spacing, broken lines,
misread punctuation. These parsers use pragmatic regex + heuristics rather
than expecting a perfectly structured input.
"""

import re

# Nutrition fields we try to extract, and the regex patterns/aliases that
# commonly appear on labels (case-insensitive). Order matters: more specific
# patterns (e.g. "added sugar") are checked before generic ones (e.g. "sugar").
NUTRITION_FIELDS = [
    ("calories", [r"calories", r"energy"]),
    ("protein", [r"protein"]),
    ("total_fat", [r"total fat", r"fat\b"]),
    ("saturated_fat", [r"saturated fat", r"sat\.? fat"]),
    ("trans_fat", [r"trans fat"]),
    ("total_carbohydrate", [r"total carbohydrate", r"carbohydrate"]),
    ("added_sugar", [r"added sugars?"]),
    ("sugar", [r"\bsugars?\b"]),
    ("fiber", [r"dietary fiber", r"fiber"]),
    ("sodium", [r"sodium"]),
    ("cholesterol", [r"cholesterol"]),
]

# Matches a number (int or decimal) followed optionally by a unit like g, mg, kcal, %
VALUE_PATTERN = re.compile(
    r"([\d]+(?:\.\d+)?)\s*(mg|g|kcal|cal|mcg|%)?", re.IGNORECASE
)

# Common section headers that signal where the ingredient list starts/ends
INGREDIENTS_START_PATTERN = re.compile(r"ingredients\s*[:\-]?", re.IGNORECASE)
INGREDIENTS_END_MARKERS = re.compile(
    r"(nutrition facts|allerg(en|y)|contains|manufactured|best before|net wt)",
    re.IGNORECASE,
)


def clean_text(raw_text: str) -> str:
    """Normalize whitespace and strip stray OCR artifacts."""
    text = raw_text.replace("|", "I")  # common OCR misread
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def parse_ingredients(raw_text: str) -> list:
    """
    Extract the ingredient list as a list of individual ingredient strings.
    Looks for an "Ingredients:" marker, then splits the following block on
    commas (with basic handling for parenthetical sub-ingredients).
    """
    text = clean_text(raw_text)

    start_match = INGREDIENTS_START_PATTERN.search(text)
    if not start_match:
        return []

    after_start = text[start_match.end():]

    end_match = INGREDIENTS_END_MARKERS.search(after_start)
    ingredient_block = after_start[: end_match.start()] if end_match else after_start

    # Replace newlines with spaces inside the block before splitting on commas,
    # since OCR often wraps long ingredient lists across multiple lines.
    ingredient_block = ingredient_block.replace("\n", " ")

    raw_items = re.split(r",(?![^()]*\))", ingredient_block)

    ingredients = []
    for item in raw_items:
        cleaned = item.strip().strip(".").strip()
        if cleaned and len(cleaned) > 1:
            ingredients.append(cleaned)

    return ingredients


def _find_value_near(text: str, label_pos_end: int, window: int = 40) -> dict:
    """Look for a numeric value + unit shortly after a matched label."""
    snippet = text[label_pos_end: label_pos_end + window]
    match = VALUE_PATTERN.search(snippet)
    if not match:
        return {"value": None, "unit": None}
    value_str, unit = match.groups()
    try:
        value = float(value_str)
    except (TypeError, ValueError):
        value = None
    return {"value": value, "unit": (unit or "").lower() or None}


def parse_nutrition(raw_text: str) -> dict:
    """
    Extract nutrition facts as {field: {"value": float, "unit": str}}.
    Uses the first matching alias per field; if not found, value is None.
    """
    text = clean_text(raw_text)
    nutrition = {}

    # Track which character spans have already been "claimed" by a more specific
    # field (e.g. "added sugar") so the generic field (e.g. "sugar") doesn't
    # re-match the same text.
    claimed_spans = []

    for field, patterns in NUTRITION_FIELDS:
        found = None
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                span = match.span()
                if any(span[0] >= s and span[0] < e for s, e in claimed_spans):
                    continue
                found = match
                break
            if found:
                break

        if found:
            claimed_spans.append(found.span())
            nutrition[field] = _find_value_near(text, found.end())
        else:
            nutrition[field] = {"value": None, "unit": None}

    return nutrition


def extract_allergen_mentions(raw_text: str) -> list:
    """
    Pull out any explicit allergen statements, e.g. lines starting with
    "Contains:" or "Allergy Information:". Returns raw allergen text snippets
    for downstream RAG/LLM processing rather than trying to classify them here.
    """
    text = clean_text(raw_text)
    pattern = re.compile(
        r"(contains|allerg(?:en|y) (?:information|advice)?)\s*[:\-]?\s*([^\n.]+)",
        re.IGNORECASE,
    )
    return [match.group(2).strip() for match in pattern.finditer(text)]
