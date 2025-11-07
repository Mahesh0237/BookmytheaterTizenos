import React, { useEffect, useState, useCallback, memo } from "react";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import Sectionheading from "../../shared/Sectionheading";
import Errorpanelcardview from "../../shared/Errorpanelcardview";
import Movieapi from "../api/Movieapi";
import skeletonAnimation from '../../../public/assets/skeleton.json'
import useDpadNavigation from "../../shared/useDpadNavigation";
import MovieThumbnail from "../../shared/MovieThumbnail";

const Latestrelease = ({ isActive, onNavigate }) => {
  const navigate = useNavigate();

  const [latestMoviesList, setLatestMoviesList] = useState([]);
  const [isLoadingEffect, setIsLoadingEffect] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // ✅ Fetch Latest Release Movies
  const { selectedIndex, containerRef } = useDpadNavigation({
    totalItems: latestMoviesList.length,
    columns: latestMoviesList.length,
    enabled: isActive && latestMoviesList.length > 0,
    onEnter: (index) => {
      if (latestMoviesList[index]) {
        handleMoviePress(latestMoviesList[index]);
      }
    },
    onDirectionChange: (key, handled) => {
      if (!handled) onNavigate(key);
      else if (key === 'ArrowLeft' && selectedIndex === 0) onNavigate(key);
    },
  });
  const fetchLatestMovies = useCallback(async () => {
    try {
      setErrorMessage(null);
      setIsLoadingEffect(true);

      const res = await Movieapi.get("new-on-bookmytheatre-movies");
      const data = res.data;

      if (data.status === "error") throw new Error(data.message);

      const movies = data?.new_on_bookmytheatre_details || [];
      setLatestMoviesList(movies);
    } catch (err) {
      setErrorMessage({
        status: "error",
        message: err.message || "Failed to load latest releases.",
      });
    } finally {
      setIsLoadingEffect(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestMovies();
  }, [fetchLatestMovies]);

  // ✅ Navigate to Single Movie
  const handleMoviePress = useCallback(
    (movie) => {
      navigate(`/movie/${movie.uuid}`);
    },
    [navigate]
  );

  return (
    <div className="relative my-6">
      {/* ✅ Section Heading */}
      <div className="px-6 mb-3">
        <Sectionheading title="Latest Release" />
      </div>

      {/* ✅ Loading State (Skeleton Cards) */}
      {isLoadingEffect ? (
        <div className="flex space-x-5 overflow-x-auto pl-6 pr-3 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="w-[200px] h-[300px] rounded-md overflow-hidden bg-[#1a1a1a] flex-shrink-0"
            >
              <Lottie
                animationData={skeletonAnimation}
                loop
                autoplay
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        // ✅ Error Message Panel
        <div className="px-6">
          <Errorpanelcardview
            errorMessages={errorMessage}
            retry={fetchLatestMovies}
          />
        </div>
      ) : latestMoviesList.length === 0 ? (
        // ✅ Empty Fallback
        <div className="flex justify-center items-center w-full h-[200px] mt-6 rounded-lg bg-transparent mx-6">
          <p className="text-lg font-bold text-white">
            No Latest Releases Found.
          </p>
        </div>
      ) : (
        // ✅ Movie Thumbnails List
        <div ref={containerRef} className="flex space-x-5 overflow-x-auto pl-6 pr-3 scrollbar-hide pb-2">
          {latestMoviesList.map((movie, idx) => (
            <MovieThumbnail
              key={`latest-movie-${idx}`}
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

export default memo(Latestrelease);
