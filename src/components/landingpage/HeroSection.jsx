import React, { useEffect, useState, useCallback } from "react";
import Movieapi from '../api/Movieapi';
import useDpadNavigation from '../../shared/useDpadNavigation';
import logo from '../../../public/assets/logo.png'
const HeroSection = ({ navigation, isActive, onNavigate }) => {
  const [movieCarouselList, setMovieCarouselList] = useState([]);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [isLoadingEffect, setIsLoadingEffect] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const { selectedIndex, containerRef } = useDpadNavigation({
    totalItems: 2,
    columns: 2,
    // Only enable D-Pad navigation if the section is active AND movie data is loaded
    enabled: isActive && !!currentMovie,
    onEnter: (index) => {
      if (index === 0) navigation(`/movie/${currentMovie.uuid}`);
      if (index === 1) navigation("/login");
    },
    onDirectionChange: (key, handled) => {
      if (!handled && (key === "ArrowDown" || key === "ArrowUp")) onNavigate(key);
    },
  });

  const fetchMoviesCarousel = useCallback(async () => {
    try {
      setIsLoadingEffect(true);
      setErrorMessage(null);

      const res = await Movieapi.get("getlandingmoviescarousel");
      const data = res.data;
      if (data.status === "error") throw new Error(data.message);

      if (data.movies_carousel_details?.length > 0) {
        setMovieCarouselList(data.movies_carousel_details);
        setCurrentMovie(data.movies_carousel_details[0]);
      } else {
        throw new Error("No movies found for carousel.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to fetch carousel movies.");
    } finally {
      setIsLoadingEffect(false);
    }
  }, []);

  useEffect(() => {
    fetchMoviesCarousel();
  }, [fetchMoviesCarousel]);

  if (isLoadingEffect) {
    return (
      <div className="relative w-full bg-gray-900 h-[500px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-lg">
          Loading hero section...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-900 text-red-400">
        {errorMessage}
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="flex justify-center items-center w-full bg-[#222] h-[500px] rounded-lg">
        <p className="text-white text-lg font-bold">No Carousel Movies Found.</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[500px] bg-cover bg-center"
      style={{ backgroundImage: `url(${currentMovie.main_banner})` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 px-6 pt-20 pb-16 max-w-[700px]">
        <img
          src={logo}
          alt="Logo"
          className="w-[100px] h-10 object-contain mb-4"
        />

        <h1 className="text-white text-5xl font-bold mb-4 drop-shadow-lg">
          {currentMovie.title}
        </h1>

        <p className="text-white text-sm leading-6 mb-5 max-w-[500px] opacity-90">
          {currentMovie.short_description || "No description available."}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap mb-6">
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
          <button
            onClick={() =>
              navigation?.(`/movie/${currentMovie.uuid}`)
            }
            className={`bg-[#C1272D] hover:bg-[#E13B3F] text-white font-bold px-7 py-2.5 rounded-md flex items-center gap-2 transition-transform duration-300
            ${isActive && selectedIndex === 0 ? "scale-110 ring-4 ring-white" : ""}`}
          >
            ▶ Play
          </button>

          <button
            onClick={() => navigation?.("/login")}
            className={`bg-gray-600/80 hover:bg-gray-500 text-white font-semibold px-5 py-2.5 rounded-md transition-transform duration-300
            ${isActive && selectedIndex === 1 ? "scale-110 ring-4 ring-white" : ""}`}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
