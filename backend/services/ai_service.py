import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()


# Make sure it looks like this:
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_item_with_ai(image_bytes: bytes, mime_type: str):
    """
    Sends the uploaded image to Gemini Vision to identify the item,
    extract materials, era, and description.
    """
    prompt = """
    Analyze this product image carefully. Provide a JSON response containing:
    - "item_name": The exact or most likely name of the product/item.
    - "confidence": Estimated confidence score (e.g., "95%").
    - "era": Estimated manufacturing decade or year (e.g., "1970s" or "Modern").
    - "materials": A list of core materials detected (e.g., ["Stainless Steel", "Leather"]).
    - "description": A brief 2-sentence summary of the item's background.
    - "authenticity_notes": Any notes regarding style or unique markings.
    Return ONLY valid JSON format without markdown code blocks.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                ),
                prompt
            ]
        )

        # Clean up response string in case it includes markdown tags
        clean_text = response.text.replace(
            "```json", "").replace("```", "").strip()
        import json
        return json.loads(clean_text)

    except Exception as e:
        print(f"AI Vision Error: {e}")
        return {
            "error": "Failed to analyze image with AI vision model.",
            "details": str(e)
        }
