import os
import requests
from dotenv import load_dotenv

load_dotenv()

SERPAPI_KEY = os.getenv("SERPAPI_API_KEY")


def search_global_marketprices(item_name: str):
    """
    Searches Google Shopping via SerpAPI and extracts active merchant links.
    """
    if not SERPAPI_KEY:
        return [
            {
                "store": "Global Vintage Hub (Demo)",
                "price": "$125.00",
                "thumbnail": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
                "link": "https://www.google.com/shopping"
            }
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

        for item in shopping_results[:12]:
            destination_link = item.get(
                "link") or item.get("product_link") or "#"

            formatted_results.append({
                "store": item.get("source", "Online Marketplace"),
                "price": item.get("price", "Price varies"),
                "thumbnail": item.get("thumbnail", "https://via.placeholder.com/150"),
                "link": destination_link
            })

        if not formatted_results:
            return [{
                "store": "No direct store matches found",
                "price": "N/A",
                "thumbnail": "https://via.placeholder.com/150",
                "link": "#"
            }]

        return formatted_results

    except Exception as e:
        print(f"SerpAPI Error: {e}")
        return [{"error": "Failed to fetch market prices"}]
