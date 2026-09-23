from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from services.ai_service import analyze_item_with_ai
from services.search_service import search_global_marketprices

# Load environment variables
load_dotenv()

app = FastAPI(
    title="World Item Scanner API",
    description="Backend for AI-powered visual recognition and global product intelligence.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Welcome to World Item Scanner API! Backend is running successfully 🚀"}


@app.post("/api/v1/analyze")
async def analyze_item(files: List[UploadFile] = File(...)):
    """
    Receives up to 5 uploaded images, processes them through Gemini Vision AI,
    fetches global prices via SerpAPI, and returns structured intelligence data.
    """
    if len(files) > 5:
        raise HTTPException(
            status_code=400, detail="Maximum 5 images allowed per scan."
        )

    image_files_data = []
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, detail=f"Invalid file type for {file.filename}. Please upload images only."
            )

        # Read image bytes in memory
        image_bytes = await file.read()
        image_files_data.append({
            "bytes": image_bytes,
            "mime_type": file.content_type
        })

    # 1. Pass all image bytes and mime types to the multi-image AI vision service
    ai_result = analyze_item_with_ai(image_files_data)

    if "error" in ai_result:
        raise HTTPException(status_code=500, detail=ai_result["error"])

    # 2. Extract item name and fetch global marketplace pricing
    item_name = ai_result.get("item_name", "Unknown Item")
    pricing_results = search_global_marketprices(item_name)

    # Attach global prices to the final response data dictionary
    ai_result["global_prices"] = pricing_results

    return {
        "status": "success",
        "total_images_analyzed": len(files),
        "data": ai_result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
