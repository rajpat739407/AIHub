import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { TextField, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { FaSearch, FaStar, FaCalendarAlt } from "react-icons/fa";

const MovieRecommendation = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  // const inputRef = useRef(null);

  // 🔍 Fetch movie suggestions from backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/movies/titles?q=${query}`
        );

        // 🖥️ Log movie titles in console
        console.log("🎬 [BACKEND] Title suggestions:", res.data.results);

        setSuggestions(res.data.results);
      } catch (error) {
        console.error("❌ Error fetching movie titles:", error);
      }
    };
    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // 🎬 Fetch movie recommendations
  const handleSearch = async (title) => {
    if (!title) return;
    setLoading(true);
    setSelectedMovie(title);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/movies/recommend?title=${title}`
      );

      // 🖥️ Log raw backend response for recommendations
      console.log("🎥 [BACKEND] Movie recommendations for:", title);
      console.log(res.data);

      setRecommendations(res.data.recommendations || []);
      toast.success(`Showing recommendations for "${title}"`);
    } catch (err) {
      console.error("❌ Error fetching recommendations:", err);
      toast.error("No recommendations found!");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center py-10 px-6">
      <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
        🎬 Movie Recommendation System
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-7xl">
        {/* Left: Search Movies */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-semibold mb-6 text-yellow-400 flex items-center gap-2">
            <FaSearch /> Search Movies
          </h2>

          <div className="relative w-full mb-6">
            <TextField
              placeholder="Type a movie name..."
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
              sx={{
                input: { color: "white" },
                label: { color: "#ccc" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#666" },
                  "&:hover fieldset": { borderColor: "#FFD700" },
                  "&.Mui-focused fieldset": { borderColor: "#FFD700" },
                },
              }}
            />
          </div>

          {suggestions.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scroll">
              {suggestions.map((title, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer transition-all hover:shadow-yellow-400/40 ${
                    selectedMovie === title ? "border-yellow-400" : ""
                  }`}
                  onClick={() => handleSearch(title)}
                >
                  <h3 className="text-lg font-semibold text-yellow-300">
                    {title}
                  </h3>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">Start typing to see results...</p>
          )}
        </motion.div>

        {/* Right: Recommended Movies */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-semibold mb-6 text-orange-400">
            🎥 Recommended Movies
          </h2>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <CircularProgress color="inherit" />
            </div>
          )}

          {!loading && recommendations.length === 0 && (
            <p className="text-gray-400 italic">
              Select a movie on the left to view recommendations.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendations.map((movie, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="relative bg-white/10 border border-white/10 rounded-2xl overflow-hidden hover:shadow-orange-400/40 transition-all duration-300"
              >
                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full h-64 object-cover opacity-90 hover:opacity-100 transition-all duration-300"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-orange-300">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-400 mt-2">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />{" "}
                      {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-blue-400" />{" "}
                      {movie.release_date || "Unknown"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-3 line-clamp-4">
                    {movie.overview || "No description available."}
                  </p>
                  <p className="text-xs mt-2 text-gray-400 italic">
                    {movie.genres || "Unknown"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MovieRecommendation;
