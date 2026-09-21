import os
import requests
from dotenv import load_dotenv

load_dotenv()

SERPAPI_KEY = os.getenv("SERPAPI_API_KEY")


def search_global_marketprices(item_name: str):
    """
    Searches Google Shopping via SerpAPI using the item name
    to fetch global store listings and prices.
    """
    if not SERPAPI_KEY:
        # Fallback dummy data if API key isn't provided yet
        return [
            {"store": "Global Store (Demo)", "price": "$100.00",
             "localConverted": "$100.00 USD", "link": "#"}
        ]

    url = "https://serpapi.com/search"
    params = {
        "engine": "google_shopping",
        "q": item_name,
        "api_key": SERPAPI_KEY,
        "hl": "en",
        "gl": "us"
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        shopping_results = data.get("shopping_results", [])
        formatted_results = []

        # Parse top 3-4 results
        for item in shopping_results[:4]:
            formatted_results.append({
                "store": item.get("source", "Online Marketplace"),
                "price": item.get("price", "Price varies"),
                # Can add currency conversion logic here later
                "localConverted": item.get("price", "N/A"),
                "link": item.get("link", "#")
            })

        if not formatted_results:
            return [{"store": "No direct store matches found", "price": "N/A", "localConverted": "N/A", "link": "#"}]

        return formatted_results

    except Exception as e:
        print(f"SerpAPI Error: {e}")
        return [{"error": "Failed to fetch market prices"}]
