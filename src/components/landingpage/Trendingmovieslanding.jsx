import React, { useState, useEffect, useCallback, useRef } from "react";
// import Movieapi from "../api/Movieapi";
import Movieapi from '../api/Movieapi'
import SectionHeading from '../../shared/Sectionheading';
import MovieThumbnail from "../../shared/MovieThumbnail";
import useDpadNavigation from "../../shared/useDpadNavigation";// ✅ Import the component
import { useNavigate } from "react-router-dom";

const TrendingMoviesLanding = ({ isActive, onNavigate }) => {
  const [isLoadingEffect, setIsLoadingEffect] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [trendingMoviesList, setTrendingMoviesList] = useState([]);
  const navigate = useNavigate();

  const { selectedIndex, containerRef } = useDpadNavigation({
    totalItems: trendingMoviesList.length,
    columns: trendingMoviesList.length, // Treat as a single row for horizontal nav
    enabled: isActive && trendingMoviesList.length > 0,
    onEnter: (index) => {
      const movie = trendingMoviesList[index];
      if (movie) navigate(`/movie/${movie.uuid}`);
    },
    onDirectionChange: (key, handled) => {
      if (!handled && (key === "ArrowDown" || key === "ArrowUp")) onNavigate(key);
    },
  });
  
  const scrollRef = useRef(null);
 
  // ✅ Fetch trending movies
  const fetchTrendingMovies = useCallback(async () => {
    try {
      setIsLoadingEffect(true);
      setErrorMessage(null);
      const res = await Movieapi.get("trendingmovieslanding");
      const data = res.data;
      if (data.status === "error") throw new Error(data.message);
      setTrendingMoviesList(data?.trending_movie_details || []);
    } catch (err) {
      setErrorMessage(err.message || "Failed to fetch trending movies.");
    } finally {
      setIsLoadingEffect(false);
    }
  }, []);
 
  useEffect(() => {
    fetchTrendingMovies();
  }, [fetchTrendingMovies]);
 
  // ✅ Handle TV remote key navigation (Left/Right)
  const handleKeyDown = useCallback((e) => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
 
    if (e.key === "ArrowRight") {
      scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
    } else if (e.key === "ArrowLeft") {
      scrollContainer.scrollBy({ left: -300, behavior: "smooth" });
    }
  }, []);
 
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
 
  const handleMoviePress = useCallback(
    (movie) => {
      navigate(`/movie/${movie.uuid}`);
    },
    [navigate]
  );
 
  return (
    <div className="relative py-10 bg-gradient-to-b from-[#0a0a0a] to-[#702728]">
      <div className="px-6 mb-6">
        <SectionHeading title="Trending Movies" styleclass="ml-2" />
      </div>
 
      {/* ✅ Loading Skeletons */}
      {isLoadingEffect ? (
        <div className="flex gap-6 overflow-x-auto px-6 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-[200px] h-[300px] bg-gray-800 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : errorMessage ? (
        <div className="text-center text-red-400">{errorMessage}</div>
      ) : trendingMoviesList.length === 0 ? (
        <div className="text-center text-white">No Trending Movies Found.</div>
      ) : (
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto px-6 pb-6 scrollbar-hide focus:outline-none"
        >
          {/* ✅ Use MovieThumbnail Component */}
          {trendingMoviesList.map((movie, idx) => (
            <MovieThumbnail
              key={idx}
              isFocused={isActive && selectedIndex === idx}
              source={movie.main_thumbnail}
              alt={movie.title}
              onClick={() => handleMoviePress(movie)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingMoviesLanding;
