from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from services.ai_service import analyze_item_with_ai

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
async def analyze_item(file: UploadFile = File(...)):
    """
    Receives an uploaded image, processes it through Gemini Vision AI,
    and returns structured product intelligence data.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Please upload an image."
        )

    # Read image bytes in memory
    image_bytes = await file.read()

    # Pass image bytes and mime type to the AI vision service
    ai_result = analyze_item_with_ai(image_bytes, file.content_type)

    if "error" in ai_result:
        raise HTTPException(status_code=500, detail=ai_result["error"])

    return {
        "status": "success",
        "filename": file.filename,
        "content_type": file.content_type,
        "data": ai_result
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
