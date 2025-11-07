import React, { useEffect, useState, useCallback, memo } from "react";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import Sectionheading from "../../shared/Sectionheading";
import Errorpanelcardview from "../../shared/Errorpanelcardview";
import Movieapi from "../api/Movieapi";
import skeletonAnimation from '../../../public/assets/skeleton.json'
import useDpadNavigation from "../../shared/useDpadNavigation";
import MovieThumbnail from "../../shared/MovieThumbnail";

const Comingsoon = ({ isActive, onNavigate }) => {
  const navigate = useNavigate();

  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [isLoadingEffect, setIsLoadingEffect] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // ✅ Fetch Coming Soon Movies
  const { selectedIndex, containerRef } = useDpadNavigation({
    totalItems: comingSoonMovies.length,
    columns: comingSoonMovies.length,
    enabled: isActive && comingSoonMovies.length > 0,
    onEnter: (index) => {
      if (comingSoonMovies[index]) {
        handleMoviePress(comingSoonMovies[index]);
      }
    },
    onDirectionChange: (key, handled) => {
      if (!handled) onNavigate(key);
      else if (key === 'ArrowLeft' && selectedIndex === 0) onNavigate(key);
    },
  });
  const fetchComingSoonMovies = useCallback(async () => {
    try {
      setErrorMessage(null);
      setIsLoadingEffect(true);

      const res = await Movieapi.get("coming-soon-movies");
      const data = res.data;

      if (data.status === "error") throw new Error(data.message);

      const movies = data?.coming_soon_movies || [];

      if (movies.length === 0) {
        setComingSoonMovies([]);
      } else {
        setComingSoonMovies(movies);
      }
    } catch (err) {
      setErrorMessage({
        status: "error",
        message: err.message || "Failed to load coming soon movies.",
      });
    } finally {
      setIsLoadingEffect(false);
    }
  }, []);

  useEffect(() => {
    fetchComingSoonMovies();
  }, [fetchComingSoonMovies]);

  const handleMoviePress = useCallback(
    (movie) => {
      console.log("Movie pressed:", movie.title);
      navigate(`/movie/${movie.uuid}`);
    },
    [navigate]
  );

  return (
    <div className="relative my-8">
      {/* ✅ Section Heading */}
      <div className="px-6 mb-4">
        <Sectionheading title="Coming Soon" />
      </div>

      {/* ✅ Loading Skeleton Effect */}
      {isLoadingEffect ? (
        <div className="flex space-x-5 overflow-x-auto pl-6 pr-3 scrollbar-hide">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="w-[200px] h-[300px] bg-[#1a1a1a] rounded-md overflow-hidden flex-shrink-0"
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
        // ✅ Error Panel
        <div className="px-6">
          <Errorpanelcardview
            errorMessages={errorMessage}
            retry={fetchComingSoonMovies}
          />
        </div>
      ) : comingSoonMovies.length === 0 ? (
        // ✅ Empty State
        <div className="flex justify-center items-center w-full h-[200px] bg-transparent mt-6 rounded-lg mx-6">
          <p className="text-lg font-semibold text-white">
            No Coming Soon Movies Found.
          </p>
        </div>
      ) : (
        // ✅ Movies Scroll List
        <div ref={containerRef} className="flex space-x-5 overflow-x-auto pl-6 pr-3 scrollbar-hide pb-2">
          {comingSoonMovies.map((movie, idx) => (
            <MovieThumbnail
              key={`coming-soon-movie-${idx}`}
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

export default memo(Comingsoon);
