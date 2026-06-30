"""
Deterministic Health Score Engine.
Applies a strict scoring matrix to the extracted nutrition and ingredients.
"""

def _get_val(nutrition: dict, key: str, default=None):
    """Helper to safely extract numeric values. Returns default if missing."""
    item = nutrition.get(key, {})
    if not item:
        return default
    val = item.get("value")
    return float(val) if val is not None else default

def _get_sodium_mg(nutrition: dict) -> float:
    """Extracts sodium and converts from grams to mg if necessary."""
    item = nutrition.get("sodium", {})
    if not item:
        return None
    val = item.get("value")
    if val is None:
        return None
    val = float(val)
    unit = str(item.get("unit", "")).lower().strip()
    if unit == "g":
        return val * 1000
    return val

def calculate_health_score(nutrition: dict, ingredients: list, allergens: list) -> dict:
    score = 60
    reasoning_points = []
    
    def add_point(reason: str, points: int):
        nonlocal score
        score += points
        reasoning_points.append({
            "reason": reason,
            "points": points,
            "type": "positive" if points > 0 else "negative"
        })

    # --- POSITIVE RULES ---
    
    # Protein
    protein = _get_val(nutrition, "protein")
    if protein is not None:
        if protein >= 10:
            add_point("High protein content", 10)
        elif protein >= 8:
            add_point("Good protein content", 8)
        elif protein >= 5:
            add_point("Moderate protein content", 5)
            
    # Fiber
    fiber = _get_val(nutrition, "fiber")
    if fiber is not None:
        if fiber >= 5:
            add_point("High fiber", 10)
        elif fiber >= 3:
            add_point("Good fiber", 7)
        elif fiber >= 2:
            add_point("Moderate fiber", 4)
            
    # Whole Grains
    whole_grains = ["whole grain", "whole wheat", "oats", "rolled oats", "multigrain", "brown rice", "millets", "quinoa"]
    ingredients_lower = [i.lower() for i in ingredients]
    if any(any(wg in ing for wg in whole_grains) for ing in ingredients_lower):
        add_point("Contains whole grains", 10)
        
    # Healthy Nuts & Seeds
    nuts_seeds = ["almond", "walnut", "pumpkin seed", "chia", "flaxseed", "sunflower seed"]
    if any(any(ns in ing for ns in nuts_seeds) for ing in ingredients_lower):
        add_point("Contains healthy nuts or seeds", 5)
        
    # Low Saturated Fat
    sat_fat = _get_val(nutrition, "saturated_fat")
    if sat_fat is not None:
        if sat_fat <= 1:
            add_point("Low saturated fat", 5)
            
    # Low Sodium
    sodium = _get_sodium_mg(nutrition)
    if sodium is not None:
        if sodium <= 120:
            add_point("Low sodium", 5)

    # --- NEGATIVE RULES ---
    
    # Added Sugar (fallback to Total Sugar)
    added_sugar = _get_val(nutrition, "added_sugar")
    if added_sugar is None:
        added_sugar = _get_val(nutrition, "sugar") # fallback
        
    if added_sugar is not None:
        if added_sugar >= 20:
            add_point("Very high added sugar", -20)
        elif added_sugar >= 10:
            add_point("High added sugar", -10)
        elif added_sugar >= 5:
            add_point("Moderate added sugar", -5)
            
    # High Saturated Fat
    if sat_fat is not None:
        if sat_fat >= 5:
            add_point("High saturated fat", -15)
        elif sat_fat >= 2:
            add_point("Moderate saturated fat", -8)
            
    # Trans Fat
    trans_fat = _get_val(nutrition, "trans_fat")
    if trans_fat is not None and trans_fat > 0:
        add_point("Contains trans fat", -20)
        
    # High Sodium
    if sodium is not None:
        if sodium >= 400:
            add_point("High sodium", -15)
            
    # Calories
    calories = _get_val(nutrition, "calories")
    if calories is not None and calories > 400:
        add_point("High calories", -10)
        
    # Specific negative ingredients
    if any("artificial flavor" in ing or "artificial flavour" in ing for ing in ingredients_lower):
        add_point("Contains artificial flavour", -5)
        
    if any("artificial color" in ing or "artificial colour" in ing for ing in ingredients_lower):
        add_point("Contains artificial colour", -5)
        
    if any("hydrogenated" in ing for ing in ingredients_lower):
        add_point("Contains hydrogenated oil", -15)
        
    if any("high fructose corn syrup" in ing or "hfcs" in ing for ing in ingredients_lower):
        add_point("Contains high fructose corn syrup", -10)
        
    if any("palm oil" in ing for ing in ingredients_lower):
        add_point("Contains palm oil", -5)
        
    # --- FOOD ADDITIVES ---
    if any("ins 320" in ing or "ins320" in ing or "bha" in ing for ing in ingredients_lower):
        add_point("Contains BHA (INS 320)", -3)
        
    if any("ins 321" in ing or "ins321" in ing or "bht" in ing for ing in ingredients_lower):
        add_point("Contains BHT (INS 321)", -3)
        
    if any("ins 211" in ing or "ins211" in ing or "sodium benzoate" in ing for ing in ingredients_lower):
        add_point("Contains Sodium Benzoate (INS 211)", -2)

    # --- CLAMP & RATING ---
    score = max(0, min(100, score))
    
    rating = "Poor"
    if score >= 85:
        rating = "Excellent"
    elif score >= 70:
        rating = "Good"
    elif score >= 50:
        rating = "Moderate"
        
    return {
        "score": score,
        "rating": rating,
        "reasoning_points": reasoning_points
    }
