import os
import json
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# Inside backend/services/ai_service.py

def analyze_item_with_ai(image_files_data):
    prompt = """
    Analyze these photos carefully. 
    1. First, check if all provided photos depict the EXACT SAME physical item from different angles, labels, or close-ups.
    2. If the photos show completely different, unrelated items, you MUST return a JSON object with this exact key:
       {"error": "The uploaded photos appear to show different, unrelated items. Please upload pictures of the same single item."}
    
    If they are the same item, return a JSON object with these exact keys:
    - "item_name": A clear, descriptive title of the item.
    - "confidence": Estimated match confidence percentage (e.g., "98.5%").
    - "era": Estimated manufacturing date or time period.
    - "materials": A list of strings detailing the material composition.
    - "authenticity_notes": Brief notes on authenticity or style traits.
    - "description": A concise 2-3 sentence overview of the item's background.
    
    Return ONLY valid raw JSON without any markdown formatting or code blocks.
    """

    # Build contents array with the prompt text first
    contents = [prompt]

    # Append each uploaded image as a binary part
    for img in image_files_data:
        image_part = types.Part.from_bytes(
            data=img["bytes"],
            mime_type=img["mime_type"]
        )
        contents.append(image_part)

    max_retries = 3
    delay = 2

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-3.6-flash',
                contents=contents
            )

            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            return json.loads(raw_text.strip())

        except Exception as e:
            error_message = str(e)
            if ("503" in error_message or "UNAVAILABLE" in error_message) and attempt < max_retries - 1:
                time.sleep(delay)
                delay *= 2
                continue

            print(f"AI Vision Error: {error_message}")
            return {"error": f"AI service temporarily busy. Details: {error_message}"}
