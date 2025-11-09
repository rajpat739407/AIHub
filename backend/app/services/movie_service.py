import os
import pandas as pd
import gdown
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

DATA_DIR = "app/data/movies"
os.makedirs(DATA_DIR, exist_ok=True)

# Google Drive file IDs
MOVIES_METADATA_ID = "11_a3rVTXVw_F6mv1qqsq-XGjZ_e7QHuO"
CREDITS_ID = "1r0yOgYMSdz6_LAxqd4ueEsoGGjI-R6wd"
KEYWORDS_ID = "1Vei57ijtxCwZP5rBx6MwWPIPZKBrtq-f"
RATINGS_ID = "1v0tyeehPs5b0ce25q5m1E6WjuXHGMlJ2"

FILES = {
    "movies_metadata.csv": MOVIES_METADATA_ID,
    "credits.csv": CREDITS_ID,
    "keywords.csv": KEYWORDS_ID,
    "ratings_small.csv": RATINGS_ID,
}

def download_from_drive():
    """Download CSVs from Google Drive if not found locally."""
    for fname, fid in FILES.items():
        fpath = os.path.join(DATA_DIR, fname)
        if not os.path.exists(fpath):
            print(f"📥 Downloading {fname} from Google Drive...")
            url = f"https://drive.google.com/uc?id={fid}"
            gdown.download(url, fpath, quiet=False)
    print("✅ All datasets ready.")

def load_and_prepare_movies():
    """Load and preprocess merged movie dataset."""
    download_from_drive()

    movies = pd.read_csv(os.path.join(DATA_DIR, "movies_metadata.csv"), low_memory=False)
    credits = pd.read_csv(os.path.join(DATA_DIR, "credits.csv"))
    
    # Basic cleaning
    movies = movies[['id', 'title', 'overview', 'genres', 'poster_path', 'vote_average', 'release_date']]
    credits = credits[['movie_id', 'cast', 'crew']]
    credits.rename(columns={'movie_id': 'id'}, inplace=True)
    
    # Merge both datasets
    df = movies.merge(credits, on="id", how="left")

    # Handle missing
    df.dropna(subset=['overview'], inplace=True)
    df.fillna('', inplace=True)

    # Build combined tags
    df['tags'] = df['overview'] + " " + df['genres'].astype(str) + " " + df['cast'].astype(str)

    # TF-IDF vectorization
    tfidf = TfidfVectorizer(max_features=5000, stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['tags'])
    
    # Similarity matrix (memory-safe linear_kernel)
    similarity = linear_kernel(tfidf_matrix, tfidf_matrix)
    print("✅ Model trained successfully!")

    # Save for later use
    df.to_csv(os.path.join(DATA_DIR, "merged_movies_with_posters.csv"), index=False)
    return df, similarity

# Load on startup
movies, similarity = load_and_prepare_movies()

def get_recommendations(title, num=10):
    """Recommend similar movies given a title."""
    mask = movies['title'].astype(str).str.lower() == title.lower()
    if not mask.any():
        return []
    idx = movies[mask].index[0]
    scores = list(enumerate(similarity[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)[1:num+1]
    recs = []
    for i, s in scores:
        row = movies.iloc[i]
        poster = None
        if isinstance(row.get("poster_path"), str) and len(row["poster_path"]) > 3:
            poster = f"https://image.tmdb.org/t/p/w500{row['poster_path']}"
        recs.append({
            "title": row["title"],
            "overview": row["overview"],
            "genres": row["genres"],
            "poster_path": poster,
            "rating": float(row.get("vote_average", 0)),
            "release_date": row.get("release_date", ""),
        })
    return recs
