# from fastapi import APIRouter, Query
# from app.services.movie_service import get_recommendations, get_movie_titles

# router = APIRouter(prefix="/movies", tags=["Movies"])

# @router.get("/titles")
# def fetch_titles(q: str = Query("", description="Partial movie title to search")):
#     """Return list of movie titles for autocomplete"""
#     data = get_movie_titles(q)
#     return {"results": data}

# @router.get("/recommend")
# def recommend_movie(title: str = Query(..., description="Movie title for recommendations")):
#     """Return recommended movies similar to given title"""
#     data = get_recommendations(title)
#     return {"query": title, "recommendations": data}

from fastapi import APIRouter, HTTPException
from app.services.movie_service import get_recommendations, get_movie_titles

router = APIRouter(prefix="/movies", tags=["Movies"])

@router.get("/titles")
def all_titles():
    return {"titles": get_movie_titles()}

@router.get("/recommend")
def recommend(title: str):
    recs = get_recommendations(title)
    if not recs:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {"query": title, "recommendations": recs}
