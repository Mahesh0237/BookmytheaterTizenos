import React, { useCallback, useEffect, useRef, useState } from "react";
import ErrorPanelCardView from '../../shared/Errorpanelcardview';
import { useNavigate } from "react-router-dom";
import Movieapi from '../api/Movieapi';
import useDpadNavigation from "../../shared/useDpadNavigation";

const Browse = ({ isActive, onNavigate }) => {
  const [movieCarouselList, setMovieCarouselList] = useState([]);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [isLoadingEffect, setIsLoadingEffect] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { selectedIndex, containerRef } = useDpadNavigation({
    totalItems: 3, // Play, Trailer, Add
    columns: 3,
    enabled: isActive && !!currentMovie,
    onEnter: (index) => {
      if (currentMovie) handleMoviePress(currentMovie);
    },
    onDirectionChange: (key, handled) => {
      if (!handled) {
        onNavigate(key);
      } else if (key === 'ArrowLeft' && selectedIndex === 0) {
        onNavigate(key); // Navigate to sidebar from the first item
      }
    },
  });

  const navigate = useNavigate();

  /** ✨ Shimmer Skeleton Component */
  const ShimmerSkeleton = ({ width, height, borderRadius = "0.25rem", className = "" }) => (
    <div
      className={`relative overflow-hidden bg-[#1a1a1a] ${className}`}
      style={{ width, height, borderRadius }}
    >
      <div className="absolute inset-0 bg-[#2a2a2a]" />
      <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );

  /** 🧩 Fetch Movies Carousel */
  const fetchMoviesCarousel = useCallback(async () => {
    try {
      setErrorMessage(null);
      setIsLoadingEffect(true);
      const res = await Movieapi.get("getmoviescouroselbrowse");
      const data = res.data;

      if (data.status === "error") throw new Error(data.message);

      if (!data.movies_carousel_browse_details?.length) {
        setMovieCarouselList([]);
        setCurrentMovie(null);
      } else {
        setMovieCarouselList(data.movies_carousel_browse_details);
        setCurrentMovie(data.movies_carousel_browse_details[0]);
      }
    } catch (err) {
      setErrorMessage({
        status: "error",
        message: err.message || "Failed to load carousel movies.",
      });
    } finally {
      setIsLoadingEffect(false);
    }
  }, []);

  useEffect(() => {
    fetchMoviesCarousel();
  }, [fetchMoviesCarousel]);

  const handleMoviePress = (movie) => {
    navigate(`/movie/${movie.uuid}`);
  };

  /** 🌀 Loading State */
  if (isLoadingEffect) {
    return (
      <div className="relative w-full overflow-hidden bg-gray-900">
        <div className="w-full h-[650px] flex flex-col justify-end pb-10 bg-gray-900">
          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent" />

          <div className="relative z-10 px-6 pb-10 max-w-[600px]">
            {/* Title */}
            <ShimmerSkeleton width="320px" height="48px" className="mb-3" />

            {/* Description */}
            <div className="flex flex-col space-y-2 mb-6">
              <ShimmerSkeleton width="320px" height="16px" />
              <ShimmerSkeleton width="280px" height="16px" />
              <ShimmerSkeleton width="250px" height="16px" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap mb-8 gap-2">
              {[1, 2, 3].map((i) => (
                <ShimmerSkeleton key={i} width="70px" height="28px" borderRadius="14px" />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <ShimmerSkeleton width="100px" height="42px" borderRadius="6px" />
              <ShimmerSkeleton width="85px" height="42px" borderRadius="6px" />
              <ShimmerSkeleton width="42px" height="42px" borderRadius="50%" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** ❌ Error Message */
  if (errorMessage) {
    return (
      <div className="px-6 mt-6">
        <ErrorPanelCardView errorMessages={errorMessage} retry={fetchMoviesCarousel} />
      </div>
    );
  }

  /** 🕳️ No Movies */
  if (!currentMovie) {
    return (
      <div className="w-full h-[650px] flex justify-center items-center bg-black/80">
        <p className="text-white text-lg font-semibold">No movies available.</p>
      </div>
    );
  }

  /** 🎬 Main Content */
  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="w-full h-[650px] bg-cover bg-center flex flex-col justify-end pb-10"
        style={{
          backgroundImage: `url(${currentMovie?.main_banner})`,
        }}
      >
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-black/90 to-transparent" />

        <div className="relative z-10 px-6 pb-12 max-w-[600px]">
          <h1 className="text-5xl font-bold mb-3 text-white drop-shadow-lg tracking-wide">
            {currentMovie.title}
          </h1>

          <p className="text-gray-200 text-sm leading-5 mb-4 max-w-[450px] line-clamp-3 drop-shadow-md">
            {currentMovie.description}
          </p>

          <div className="flex flex-wrap items-center mb-6">
            {currentMovie?.categories?.map((tag, i) => (
              <span
                key={i}
                className="bg-white/20 text-white rounded px-2.5 py-1 mr-2 mb-2 text-xs font-semibold"
              >
                {tag?.name}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div ref={containerRef} className="flex items-center gap-3">
            {/* Play */}
            <button
              onClick={() => handleMoviePress(currentMovie)}
              className={`flex items-center justify-center px-6 py-2.5 rounded-md text-white font-semibold text-base transition-all duration-300 outline-none
                ${isActive && selectedIndex === 0 ? "bg-[#E13B3F] ring-4 ring-white scale-110" : "bg-[#C1272D]"}`}
            >
              ▶ <span className="ml-2">Play</span>
            </button>

            {/* Trailer */}
            <button
              onClick={() => handleMoviePress(currentMovie)}
              className={`px-5 py-2.5 rounded-md text-white font-semibold text-base transition-all duration-300 outline-none
                ${isActive && selectedIndex === 1 ? "bg-gray-500 ring-4 ring-white scale-110" : "bg-gray-600/80"}`}
            >
              Trailer
            </button>

            {/* Add */}
            <button
              onClick={() => handleMoviePress(currentMovie)}
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 outline-none
                ${isActive && selectedIndex === 2 ? "border-white bg-gray-700 ring-4 ring-white scale-110" : "border-gray-400 bg-black/40"}`}
            >
              <span className="text-white text-2xl leading-none">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
