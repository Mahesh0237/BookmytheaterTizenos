import React, { useEffect, useState, useCallback, memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SectionHeading from "../../shared/Sectionheading";
import ErrorPanelCardView from "../../shared/Errorpanelcardview";
import Lottie from "lottie-react";
import skeletonAnimation from "../../../public/assets/skeleton.json";
import Movieapi from "../api/Movieapi";
import useDpadNavigation from "../../shared/useDpadNavigation";
import MovieThumbnail from "../../shared/MovieThumbnail";

const TrendingMovies = ({ isActive, onNavigate }) => {
  const navigate = useNavigate();

  const [trendingMoviesList, setTrendingMoviesList] = useState([]);
  const [isLoadingEffect, setIsLoadingEffect] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // ✅ Fetch Trending Movies
  const { selectedIndex, containerRef } = useDpadNavigation({
    totalItems: trendingMoviesList.length,
    columns: trendingMoviesList.length,
    enabled: isActive && trendingMoviesList.length > 0,
    onEnter: (index) => {
      if (trendingMoviesList[index]) {
        handleMoviePress(trendingMoviesList[index]);
      }
    },
    onDirectionChange: (key, handled) => {
      if (!handled) onNavigate(key);
      else if (key === 'ArrowLeft' && selectedIndex === 0) onNavigate(key);
    },
  });
  const fetchTrendingMovies = useCallback(async () => {
    try {
      setErrorMessage(null);
      setIsLoadingEffect(true);

      const res = await Movieapi.get("trendingmovies");
      const data = res.data;

      // Check if response was successful
      if (data.success !== "success") {
        throw new Error(data.message || "Failed to fetch trending movies");
      }

      const movies = data?.trending_movie_details || [];
      setTrendingMoviesList(movies);
    } catch (err) {
      setErrorMessage({
        status: "error",
        message: err.message || "Failed to load trending movies.",
      });
    } finally {
      setIsLoadingEffect(false);
    }
  }, []);

  console.log("trendingMoviesList:", trendingMoviesList)

  useEffect(() => {
    fetchTrendingMovies();
  }, [fetchTrendingMovies]);

  const handleMoviePress = useCallback(
    (movie) => {
      navigate(`/movie/${movie.uuid}`);
    },
    [navigate]
  );

  return (
    <div className="relative my-6">
      <div>

      </div>
      {/* ✅ Section heading */}
      <div className="px-6 mb-3">
        <SectionHeading title="Trending Movies" />
      </div>

      {/* ✅ Loading Skeleton */}
      {isLoadingEffect ? (
        <div className="flex space-x-5 overflow-x-auto pl-6 pr-3 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="w-[200px] h-[300px] bg-[#1a1a1a] overflow-hidden rounded-md flex-shrink-0"
            >
              <Lottie animationData={skeletonAnimation} loop={true} />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        // ✅ Error Panel Card View
        <div className="px-6">
          <ErrorPanelCardView
            errorMessages={errorMessage}
            retry={fetchTrendingMovies}
          />
        </div>
      ) : trendingMoviesList.length === 0 ? (
        // ✅ No Data Found
        <div className="flex justify-center items-center w-full h-52 bg-transparent mt-6 rounded-lg mx-6">
          <p className="text-lg font-semibold text-white">
            No Trending Movies Found.
          </p>
        </div>
      ) : (
        // ✅ Movie Thumbnails
        <div ref={containerRef} className="flex space-x-5 overflow-x-auto pl-6 pr-3 scrollbar-hide pb-2">
          {trendingMoviesList.map((movie, idx) => (
            <MovieThumbnail
              key={`trending-movie-${idx}`}
              onClick={() => handleMoviePress(movie)}
              source={movie.main_thumbnail}
              alt={movie.title}
              isFocused={isActive && selectedIndex === idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(TrendingMovies);
