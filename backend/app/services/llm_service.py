"""
Wraps calls to the Groq API for grounded explanations, comparisons, and chat.
"""

import os
import json
from groq import Groq

from app.prompts.templates import (
    EXPLANATION_PROMPT_TEMPLATE,
    COMPARISON_PROMPT_TEMPLATE,
    CHAT_PROMPT_TEMPLATE,
)

MODEL_NAME = "llama-3.3-70b-versatile"

_client = None


def get_client():
    global _client

    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set in the environment.")

        _client = Groq(api_key=api_key)

    return _client


def ask_llm(prompt: str) -> str:

    client = get_client()

    response = client.chat.completions.create(
        model=MODEL_NAME,
        temperature=0.2,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content


def _extract_json(text: str) -> dict:

    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")

        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]

    return json.loads(cleaned.strip())


def generate_explanation(
    ingredients: list,
    nutrition: dict,
    allergen_mentions: list,
    retrieved_context: list,
) -> dict:

    prompt = EXPLANATION_PROMPT_TEMPLATE.format(
        ingredients=json.dumps(ingredients, indent=2),
        nutrition=json.dumps(nutrition, indent=2),
        allergen_mentions=json.dumps(allergen_mentions, indent=2),
        context="\n---\n".join(retrieved_context)
        if retrieved_context
        else "No reference context retrieved.",
    )

    response = ask_llm(prompt)

    try:
        return _extract_json(response)

    except Exception:

        return {
            "raw_response": response
        }


def generate_comparison(
    product_a: dict,
    product_b: dict,
    retrieved_context: list,
) -> dict:

    prompt = COMPARISON_PROMPT_TEMPLATE.format(
        ingredients_a=json.dumps(product_a.get("ingredients", []), indent=2),
        nutrition_a=json.dumps(product_a.get("nutrition", {}), indent=2),
        ingredients_b=json.dumps(product_b.get("ingredients", []), indent=2),
        nutrition_b=json.dumps(product_b.get("nutrition", {}), indent=2),
        context="\n---\n".join(retrieved_context)
        if retrieved_context
        else "No reference context retrieved.",
    )

    response = ask_llm(prompt)

    try:
        return _extract_json(response)

    except Exception:

        return {
            "raw_response": response
        }


def chat_response(
    history: list,
    user_message: str,
    product_context: dict,
) -> str:

    formatted_history = "\n".join(
        f"{turn['role'].capitalize()}: {turn['content']}"
        for turn in history
    )

    prompt = CHAT_PROMPT_TEMPLATE.format(
        product_context=json.dumps(product_context, indent=2),
        history=formatted_history or "(no prior messages)",
        user_message=user_message,
    )

    return ask_llm(prompt)