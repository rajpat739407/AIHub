import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure module imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import routes
from app.routes import movie_routes, text_routes, ocr_routes

app = FastAPI(title="RajAIHub API", description="Image to Text + Movie Recommendation")

# ✅ Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during deploy; restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include route files
app.include_router(ocr_routes.router)
app.include_router(movie_routes.router)
app.include_router(text_routes.router)


@app.get("/")
def root():
    return {"message": "🚀 AIHub Backend is Live and Running on Render!"}


@app.on_event("startup")
async def startup_event():
    print("✅ AIHub Backend started successfully on Render.")


# ✅ Explicitly start uvicorn for Render
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🔗 Starting server on port {port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
