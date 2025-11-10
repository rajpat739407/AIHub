from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from app.routes import movie_routes
# from app.routes import ocr_routes
from app.routes import movie_routes, text_routes, ocr_routes

app = FastAPI(title="RajAIHub API", description="Image to Text + Movie Recommendation")

# ✅ Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aihub-iw78.onrender.com"],
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
    return {"message": "AIHub Backend is Live!"}

