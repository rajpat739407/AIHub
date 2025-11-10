import os
import pickle
import pandas as pd
import gdown

# =========================================
# 🎬 AIHub - Movie Recommendation Service
# =========================================

# Data directory
DATA_DIR = "app/data/movies"
os.makedirs(DATA_DIR, exist_ok=True)

# Google Drive file IDs for precomputed pickle files
MOVIES_PKL_ID = "1hmDviByo0HOYWb21GXkQyxRDpfIS-gGg"
SIMILARITY_PKL_ID = "1LqL-A-hNiKD-wBuWhetFQDgWNwd_jqe6"

MOVIES_PKL_PATH = os.path.join(DATA_DIR, "movies.pkl")
SIMILARITY_PKL_PATH = os.path.join(DATA_DIR, "similarity.pkl")

# =========================================
# 📥 Utility to download from Google Drive
# =========================================
def download_from_drive(file_id: str, output_path: str):
    """Download a file from Google Drive if it does not already exist locally."""
    if not os.path.exists(output_path):
        print(f"📥 Downloading {os.path.basename(output_path)} from Google Drive...")
        url = f"https://drive.google.com/uc?id={file_id}"
        gdown.download(url, output_path, quiet=False)
        print(f"✅ Downloaded: {output_path}")
    else:
        print(f"✅ Found local file: {output_path}")

# =========================================
# 🧠 Load Pickle Data (Movies + Similarity)
# =========================================
def load_pickled_data():
    """Ensure pickle files exist locally and load them."""
    download_from_drive(MOVIES_PKL_ID, MOVIES_PKL_PATH)
    download_from_drive(SIMILARITY_PKL_ID, SIMILARITY_PKL_PATH)

    # Load data
    with open(MOVIES_PKL_PATH, "rb") as f:
        movies = pickle.load(f)
    with open(SIMILARITY_PKL_PATH, "rb") as f:
        similarity = pickle.load(f)

    # Convert to DataFrame if necessary
    if not isinstance(movies, pd.DataFrame):
        movies = pd.DataFrame(movies)

    print("✅ Movie data and similarity model loaded successfully.")
    return movies, similarity

# Load on startup
movies, similarity = load_pickled_data()

# =========================================
# 🎥 Recommendation Function
# =========================================
def get_recommendations(title: str, num: int = 10):
    """
    Recommend similar movies for a given title.
    Returns a list of dicts containing title, overview, genres, poster, rating, and release date.
    """
    if not isinstance(title, str) or title.strip() == "":
        return []

    # Case-insensitive match
    mask = movies['title'].astype(str).str.lower() == title.strip().lower()
    if not mask.any():
        # Try partial match
        mask = movies['title'].astype(str).str.contains(title.strip(), case=False, na=False)
        if not mask.any():
            print(f"⚠️ No match found for title: {title}")
            return []

    idx = movies[mask].index[0]
    sim_scores = list(enumerate(similarity[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:num+1]

    recs = []
    for i, score in sim_scores:
        row = movies.iloc[i]
        poster = None
        if isinstance(row.get("poster_path"), str) and len(row["poster_path"]) > 3:
            poster = f"https://image.tmdb.org/t/p/w500{row['poster_path']}"
        recs.append({
            "title": row.get("title", "Unknown Title"),
            "overview": row.get("overview", ""),
            "genres": row.get("genres", ""),
            "poster_path": poster,
            "rating": float(row.get("vote_average", 0)),
            "release_date": row.get("release_date", ""),
            "similarity_score": round(float(score), 4)
        })
    return recs

# =========================================
# 🎯 Helper: Get all available movie titles
# =========================================
def get_movie_titles():
    """Return list of all available movie titles."""
    return movies["title"].dropna().tolist()
