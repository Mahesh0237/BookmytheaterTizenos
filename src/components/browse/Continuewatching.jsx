import React, { useCallback, useEffect, useState, memo } from "react";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import Moviestatapi from "../api/Moviestatapi";
import Movieapi from "../api/Movieapi";
import { useUserdetails } from '../zustand/useUserdetails';
import Errorpanelcardview from "../../shared/Errorpanelcardview";
import Sectionheading from "../../shared/Sectionheading";
import MovieThumbnail from "../../shared/MovieThumbnail";
import skeletonAnimation from '../../../public/assets/skeleton.json'
import useDpadNavigation from "../../shared/useDpadNavigation";

const Continuewatching = ({ isActive, onNavigate, onHasItems }) => {
  const navigate = useNavigate();

  const [isLoadingEffect, setIsLoadingEffect] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [continueMovies, setContinueMovies] = useState([]);
  const [playMovieError, setPlayMovieError] = useState(null);

  const userInfo = useUserdetails((state) => state.userInfo);
  const user_id = userInfo?.id || null;
  const user_uid = userInfo?.uuid || null;

  const { selectedIndex, containerRef } = useDpadNavigation({
    totalItems: continueMovies.length,
    columns: continueMovies.length, // Single row
    enabled: isActive && continueMovies.length > 0,
    onEnter: (index) => {
      if (continueMovies[index]) {
        playMovie(continueMovies[index].movie_uid, continueMovies[index].language_id);
      }
    },
    onDirectionChange: (key, handled) => {
      if (!handled) onNavigate(key);
      else if (key === 'ArrowLeft' && selectedIndex === 0) onNavigate(key);
    },
  });

  // --- Add Watch History
  const addWatchHistory = useCallback(
    async (type, watch_time, movie_uid) => {
      try {
        await Moviestatapi.post("/addwatchhistory", {
          user_id,
          movie_uid,
          video_type: type,
          watch_time,
        });
      } catch (error) {
        console.log("Watch history error:", error.message);
      }
    },
    [user_id]
  );

  // --- Play Movie
  const playMovie = useCallback(
    async (movie_uid, language_id) => {
      try {
        setPlayMovieError(null);

        const response = await Moviestatapi.post("/getmovie", {
          movie_uid,
          user_id,
        });

        const data = response.data;
        if (data.status === "error") throw new Error(data.message);

        // Add watch history in background
        addWatchHistory("Movie", data.data.watch_time, movie_uid);

        // Navigate to player
        navigate(`/player`, {
          state: {
            movie_uid,
            type: "Movie",
            user_uid,
            language_Id: language_id,
            videoUrl: data.data.movie_url,
            movieWatchTime: data.data.watch_time,
            referenceUid: data.data.reference_uid,
            user_id,
          },
        });
      } catch (error) {
        setPlayMovieError({
          status: "error",
          message: error.message || "Failed to play movie. Please try again.",
        });
      }
    },
    [user_id, user_uid, navigate, addWatchHistory]
  );

  // --- Retry Play
  const retryPlayMovie = useCallback(
    (movie_uid, language_id) => {
      setPlayMovieError(null);
      playMovie(movie_uid, language_id);
    },
    [playMovie]
  );

  // --- Fetch Continue Watching Movies
  const getContinueMovies = useCallback(async () => {
    try {
      setIsLoadingEffect(true);
      setErrorMessage(null);

      const response = await Movieapi.get("/continue-watching", {
        params: { user_id },
      });

      const data = response.data;
      if (data.status === "error") throw new Error(data.message);

      setContinueMovies(data.continue_movies || []);
    } catch (error) {
      setErrorMessage({
        status: "error",
        message: error.message || "Failed to fetch continue watching movies.",
      });
    } finally {
      setIsLoadingEffect(false);
    }
  }, [user_id]);

  useEffect(() => {
    getContinueMovies();
  }, [getContinueMovies]);

  useEffect(() => {
    // Inform parent if there are items to show for navigation ordering
    if (onHasItems) onHasItems(continueMovies.length > 0);
  }, [continueMovies, onHasItems]);

  // --- Empty State
  if (!isLoadingEffect && continueMovies.length === 0 && !errorMessage) {
    return null;
  }

  return (
    <div className="">
      {/* Heading */}
      <div className="px-6 mb-3">
        <Sectionheading title="Continue Watching" />
      </div>

      {/* Loader */}
      {isLoadingEffect ? (
        <div className="flex space-x-5 overflow-x-auto pl-6 pr-3 scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map((item) => (
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
        <div className="px-6">
          <Errorpanelcardview
            errorMessages={errorMessage}
            retry={getContinueMovies}
          />
        </div>
      ) : continueMovies.length === 0 ? (
        <div className="flex justify-center items-center w-full h-[200px] mt-6 rounded-lg bg-[#222]">
          <p className="text-lg font-semibold text-white">
            No Continue Watching Movies Found.
          </p>
        </div>
      ) : (
        <>
          {/* Movie List */}
          <div ref={containerRef} className="flex space-x-5 overflow-x-auto pl-6 pr-3 scrollbar-hide pb-2">
            {continueMovies.map((movie, idx) => (
              <MovieThumbnail
                key={movie.movie_uid}
                isFocused={isActive && selectedIndex === idx}
                source={movie.thumbnail}
                alt={movie.title}
                onClick={() => playMovie(movie.movie_uid, movie.language_id)}
              />
            ))}
          </div>

          {/* Play Error */}
          {playMovieError && (
            <div className="mt-4 px-6">
              <Errorpanelcardview
                errorMessages={playMovieError}
                retry={retryPlayMovie}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default memo(Continuewatching);
