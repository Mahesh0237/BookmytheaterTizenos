

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, ShoppingBag, Send } from 'lucide-react';
import Movieapi from '../components/api/Movieapi';
import Moviestatapi from '../components/api/Moviestatapi';
import { useUserdetails } from '../components/zustand/useUserdetails';
import Errorpanelcardview from '../shared/Errorpanelcardview';
import IndividialMovieCard from '../components/Individualmoviecard';
import IndividialCardSkeleton from '../components/Individualcardskeleton';
import Sidebar from '../components/Sidebar';
import Sectionheading from '../shared/Sectionheading';

export default function SingleMoviePage() {
  const { uuid } = useParams();
  const movie_uid = uuid;
  const navigate = useNavigate();

  // State
  const [movieDetails, setMovieDetails] = useState(null);
  const [castDetails, setCastDetails] = useState([]);
  const [movieCarouselList, setMovieCarouselList] = useState([]);
  const [userMoviePermission, setUserMoviePermission] = useState(false);
  const [isTrailerExists, setIsTrailerExists] = useState(true);
  const [isMovieExists, setIsMovieExists] = useState(true);
  const [languageId, setLanguageId] = useState(null);

  // D-Pad Navigation State
  const [activeSection, setActiveSection] = useState('BUTTONS'); // SIDEBAR, BUTTONS, MOVIES
  const [focusedIndexes, setFocusedIndexes] = useState({ buttons: 0, movies: 0 });

  // Loading/Error states
  const [isMainLoading, setIsMainLoading] = useState(true);
  const [isMovieDetailsLoading, setIsMovieDetailsLoading] = useState(true);
  const [isCastLoading, setIsCastLoading] = useState(true);
  const [isTrailerMovieCheckLoading, setIsTrailerMovieCheckLoading] = useState(true);
  const [isUserMoviePermissionLoading, setIsUserMoviePermissionLoading] = useState(true);
  const [isPlayActionLoading, setIsPlayActionLoading] = useState(false);
  const [mainError, setMainError] = useState('');
  const [playMovieError, setPlayMovieError] = useState('');
  const [playTrailerError, setPlayTrailerError] = useState('');

  // Zustand state
  const { userInfo, isLogged } = useUserdetails();
  const user_id = userInfo?.id || null;
  const user_uid = userInfo?.uuid || null;
  const userAffiliateCode = userInfo?.affiliateCode || null;

  // Refs for focusable elements
  const buttonRefs = useRef([]);
  const movieRefs = useRef([]);

  // -------------------- API calls --------------------
  const fetchMovieDetails = useCallback(async () => {
    if (!movie_uid) return;
    try {
      setIsMovieDetailsLoading(true);
      const response = await Movieapi.get(`movie/${movie_uid}`);
      const data = response.data;
      if (data.status === 'error') {
        setMainError({ message: data.message, server_res: data });
        return;
      }
      setMovieDetails(data.movie_details);
      setMainError('');
    } catch (error) {
      setMainError({ message: error.response?.data?.message || error.message || 'Failed to fetch movie details', server_res: error.response?.data || null });
    } finally {
      setIsMovieDetailsLoading(false);
    }
  }, [movie_uid]);

  const fetchCastAndCrewDetails = useCallback(async () => {
    if (!movie_uid) return;
    try {
      setIsCastLoading(true);
      const response = await Movieapi.get(`getcastdetails/${movie_uid}`);
      const data = response.data;
      if (data.status === 'error') {
        setMainError({ message: data.message, server_res: data });
        return;
      }
      setCastDetails(data.cast_details || []);
      setMainError('');
    } catch (error) {
      setMainError({ message: error.response?.data?.message || error.message || 'Failed to fetch cast details', server_res: error.response?.data || null });
    } finally {
      setIsCastLoading(false);
    }
  }, [movie_uid]);

  const checkForTrailerAndMovie = useCallback(async () => {
    if (!movie_uid) return;
    try {
      setIsTrailerMovieCheckLoading(true);
      const response = await Moviestatapi.get('checkformovieandtrailer', { params: { movie_uid } });
      const data = response.data;
      if (data.status === 'error') throw new Error(data.message);
      setIsMovieExists(data.ismovieexists);
      setIsTrailerExists(data.istrailerexists);
      setLanguageId(data.language_id);
      setMainError('');
    } catch (error) {
      setMainError({ message: error.response?.data?.message || error.message || 'Failed to check movie and trailer', server_res: error.response?.data || null });
    } finally {
      setIsTrailerMovieCheckLoading(false);
    }
  }, [movie_uid]);

  const fetchUserMoviePermission = useCallback(async () => {
    if (!user_uid || !movie_uid) {
      setIsUserMoviePermissionLoading(false);
      return;
    }
    try {
      setIsUserMoviePermissionLoading(true);
      const response = await Movieapi.get('/getusermoviepermission', { params: { user_uid, movie_uid } });
      const data = response.data;
      if (data.status === 'errorMessage') throw new Error(data.message);
      setUserMoviePermission(data?.isMovieInUserMovies || false);
      setMainError('');
    } catch (error) {
      setMainError({ message: error.response?.data?.message || error.message || 'Failed to fetch user movie permission', server_res: error.response?.data || null });
    } finally {
      setIsUserMoviePermissionLoading(false);
    }
  }, [user_uid, movie_uid]);

  const fetchMoviesCarousel = useCallback(async () => {
    try {
      const response = await Movieapi.get('getmoviescourosel');
      const data = response.data;
      if (data.status === 'error') {
        setMainError({ message: data.message, server_res: data });
        return;
      }
      setMovieCarouselList(data.movies_carousel_details || []);
      setMainError('');
    } catch (error) {
      setMainError({ message: error.response?.data?.message || error.message || 'Failed to fetch movie carousel', server_res: error.response?.data || null });
    }
  }, []);

  const retryMainData = useCallback(async () => {
    setMainError('');
    setIsMainLoading(true);
    await Promise.all([fetchMovieDetails(), fetchCastAndCrewDetails(), checkForTrailerAndMovie(), fetchUserMoviePermission(), fetchMoviesCarousel()]);
  }, [fetchMovieDetails, fetchCastAndCrewDetails, checkForTrailerAndMovie, fetchUserMoviePermission, fetchMoviesCarousel]);

  // -------------------- Actions --------------------
  const addWatchHistory = useCallback(async (type, watch_time) => {
    if (!user_id || !movie_uid) return;
    try {
      await Moviestatapi.post('/addwatchhistory', { user_id, movie_uid, video_type: type, watch_time });
    } catch (error) {
      console.error('Failed to add watch history:', error);
    }
  }, [user_id, movie_uid]);

  console.log('Movie Details:', movie_uid);

  const playMovie = useCallback(async () => {
    if (!user_id || !movie_uid) {
      alert('User information is missing');
      return;
    }
    try {
      setIsPlayActionLoading(true);
      setPlayMovieError('');
      const response = await Moviestatapi.post('/getmovie', { movie_uid, user_id });
      const data = response.data;
      if (data.status === 'error') throw new Error(data.message);
      addWatchHistory('Movie', data.data.watch_time);

      // Navigate to player - pass state so player can use it
      navigate('/player', {
        state: {
          movie_uuid: movie_uid,
          type: 'Movie',
          user_uid,
          language_Id: languageId,
          videoUrl: data.data.movie_url,
          movieWatchTime: data.data.watch_time,
          referenceUid: data.data.reference_uid,
          user_id,
        }
      });
    } catch (error) {
      setPlayMovieError({ message: error.response?.data?.message || error.message || 'Failed to play movie', server_res: error.response?.data || null });
    } finally {
      setIsPlayActionLoading(false);
    }
  }, [user_id, movie_uid, user_uid, languageId, navigate, addWatchHistory]);

  const playTrailer = useCallback(async () => {
    if (!user_id || !movie_uid) {
      alert('User information is missing');
      return;
    }
    try {
      setIsPlayActionLoading(true);
      setPlayTrailerError('');
      const response = await Moviestatapi.post('/gettrailer', { movie_uid, user_id });
      const data = response.data;
      if (data.status === 'error') throw new Error(data.message);
      addWatchHistory('Trailer', 0);

      navigate('/player', {
        state: {
          movie_uuid: movie_uid,
          type: 'Trailer',
          user_uid,
          language_Id: languageId,
          videoUrl: data.trailer_url || data.data?.trailer_url,
          movieWatchTime: 0,
          referenceUid: data.reference_uid || data.data?.reference_uid,
          user_id,
        }
      });
    } catch (error) {
      setPlayTrailerError({ message: error.response?.data?.message || error.message || 'Failed to play trailer', server_res: error.response?.data || null });
    } finally {
      setIsPlayActionLoading(false);
    }
  }, [user_id, movie_uid, user_uid, languageId, navigate, addWatchHistory]);

  const handleBuyNow = useCallback(() => {
    if (!isLogged) {
      navigate('/login');
      return;
    }
    // Open buy modal (we'll keep a simple browser alert for TV fallback)
    alert('To buy this movie, please use our mobile app or website.');
  }, [isLogged, navigate]);

  const handleShare = useCallback(() => {
    if (!movieDetails) return;
    const shareTitle = movieDetails.title || 'Check out this movie!';
    const shareDescription = movieDetails.short_description || 'Watch this amazing movie!';
    const shareUrl = `${window.location.origin}/movie/${movieDetails.uuid}?affiliate=${userAffiliateCode}`;
    console.log('Share URL:', `${shareTitle}\n${shareDescription}\n${shareUrl}`);
    alert('Share URL copied to console (TV implementation pending).');
  }, [movieDetails, userAffiliateCode]);

  // -------------------- Effects --------------------
  useEffect(() => {
    if (movie_uid) retryMainData();
  }, [movie_uid, retryMainData]);

  useEffect(() => {
    const allLoaded = !isMovieDetailsLoading && !isCastLoading && !isTrailerMovieCheckLoading && !isUserMoviePermissionLoading;
    if (allLoaded) {
      const timer = setTimeout(() => setIsMainLoading(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isMovieDetailsLoading, isCastLoading, isTrailerMovieCheckLoading, isUserMoviePermissionLoading]);

  // --- D-Pad Navigation Logic ---
  const availableButtons = [];
  if (isTrailerExists) availableButtons.push('trailer');
  if (movieDetails?.status !== 'Schedule') {
    if (isLogged && userMoviePermission && isMovieExists) {
      availableButtons.push('play');
    } else {
      availableButtons.push('buy');
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();

      switch (activeSection) {
        case 'SIDEBAR':
          if (e.key === 'ArrowRight') {
            setActiveSection('BUTTONS');
          }
          break;

        case 'BUTTONS':
          if (e.key === 'ArrowLeft') {
            if (focusedIndexes.buttons === 0) {
              setActiveSection('SIDEBAR');
            } else {
              setFocusedIndexes(prev => ({ ...prev, buttons: prev.buttons - 1 }));
            }
          } else if (e.key === 'ArrowRight') {
            setFocusedIndexes(prev => ({ ...prev, buttons: Math.min(availableButtons.length - 1, prev.buttons + 1) }));
          } else if (e.key === 'ArrowDown') {
            if (movieCarouselList.length > 0) {
              setActiveSection('MOVIES');
            }
          } else if (e.key === 'Enter') {
            buttonRefs.current[focusedIndexes.buttons]?.click();
          }
          break;

        case 'MOVIES':
          const moviesPerRow = 7;
          const currentIndex = focusedIndexes.movies;

          if (e.key === 'ArrowUp') {
            const nextIndex = currentIndex - moviesPerRow;
            if (nextIndex < 0) {
              setActiveSection('BUTTONS');
            } else {
              setFocusedIndexes(prev => ({ ...prev, movies: nextIndex }));
            }
          } else if (e.key === 'ArrowDown') {
            setFocusedIndexes(prev => ({ ...prev, movies: Math.min(movieCarouselList.length - 1, currentIndex + moviesPerRow) }));
          } else if (e.key === 'ArrowLeft') {
            if (currentIndex % moviesPerRow === 0) {
              setActiveSection('SIDEBAR');
            } else {
              setFocusedIndexes(prev => ({ ...prev, movies: Math.max(0, currentIndex - 1) }));
            }
          } else if (e.key === 'ArrowRight') {
            setFocusedIndexes(prev => ({ ...prev, movies: Math.min(movieCarouselList.length - 1, currentIndex + 1) }));
          } else if (e.key === 'Enter') {
            movieRefs.current[currentIndex]?.click();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, focusedIndexes, availableButtons.length, movieCarouselList.length]);

  // Effect to scroll focused elements into view
  useEffect(() => {
    let targetElement;
    if (activeSection === 'BUTTONS') {
      targetElement = buttonRefs.current[focusedIndexes.buttons];
    } else if (activeSection === 'MOVIES') {
      targetElement = movieRefs.current[focusedIndexes.movies];
    }

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [activeSection, focusedIndexes]);

  useEffect(() => {
    movieRefs.current = movieRefs.current.slice(0, movieCarouselList.length);
  }, [movieCarouselList]);

  // Periodic watch history update (every 15s) while user is on page
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // If player is not playing, we still update some watch history of page visit
  //     addWatchHistory('PageView', 0);
  //   }, 15000);
  //   return () => clearInterval(interval);
  // }, [addWatchHistory]);

  // -------------------- UI Helpers --------------------
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // -------------------- Render --------------------
  if (isMainLoading || !movieDetails) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-black to-[#5B0203] flex">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="w-full h-[500px] bg-gray-800 animate-pulse" />
          <div className="px-6 py-4">
            <div className="w-2/5 h-8 bg-gray-700 rounded mb-3 animate-pulse" />
            <div className="w-1/3 h-6 bg-gray-700 rounded mb-6 animate-pulse" />
            <div className="flex gap-4 flex-wrap">
              {Array.from({ length: 6 }).map((_, i) => <IndividialCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mainError && !movieDetails) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-black to-[#5B0203] flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-6">
          <Errorpanelcardview errorMessages={mainError} retry={retryMainData} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-black to-[#5B0203] flex text-white">
      <Sidebar isActive={activeSection === 'SIDEBAR'} isLogged={isLogged} forceRedirect="/login" />

      <main className="flex-1 overflow-auto">
        {/* Banner */}
        <div
          className="w-full h-[650px] bg-center bg-cover relative"
          style={{ backgroundImage: `url('${movieDetails?.main_banner || movieDetails?.main_thumbnail || 'https://via.placeholder.com/1280x720'}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
          <div className="absolute bottom-8 left-8 right-8">
            <h1 className="text-5xl font-bold mb-4">{movieDetails?.title}</h1>
            <div className="flex gap-4 items-center">
              {isTrailerExists && (
                <button
                  onClick={playTrailer}
                  ref={el => buttonRefs.current[availableButtons.indexOf('trailer')] = el}
                  disabled={isPlayActionLoading}
                  tabIndex={0}
                  className={`flex items-center gap-3 px-6 py-3 rounded bg-black/40 transition-all duration-200 ${activeSection === 'BUTTONS' && focusedIndexes.buttons === availableButtons.indexOf('trailer') ? 'scale-110 ring-4 ring-white' : ''}`}
                >
                  {isPlayActionLoading ? (
                    <div className="w-4 h-4 border-white border-t-2 rounded animate-spin" />
                  ) : (
                    <>
                      <Play size={18} />
                      <span className="text-lg font-bold">Trailer</span>
                    </>
                  )}
                </button>
              )}

              {movieDetails?.status !== 'Schedule' && (
                isLogged && userMoviePermission && isMovieExists ? (
                  <button
                    onClick={playMovie}
                    ref={el => buttonRefs.current[availableButtons.indexOf('play')] = el}
                    disabled={isPlayActionLoading}
                    tabIndex={0}
                    className={`flex items-center gap-3 px-6 py-3 rounded bg-[#c02628] transition-all duration-200 ${activeSection === 'BUTTONS' && focusedIndexes.buttons === availableButtons.indexOf('play') ? 'scale-110 ring-4 ring-white' : ''}`}
                  >
                    {isPlayActionLoading ? (
                      <div className="w-4 h-4 border-white border-t-2 rounded animate-spin" />
                    ) : (
                      <>
                        <Play size={18} />
                        <span className="text-lg font-bold">Play</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleBuyNow}
                    ref={el => buttonRefs.current[availableButtons.indexOf('buy')] = el}
                    tabIndex={0}
                    className={`flex items-center gap-3 px-6 py-3 rounded bg-[#c02628] transition-all duration-200 ${activeSection === 'BUTTONS' && focusedIndexes.buttons === availableButtons.indexOf('buy') ? 'scale-110 ring-4 ring-white' : ''}`}
                  >
                    <ShoppingBag size={18} />
                    <span className="text-lg font-bold">Buy Now</span>
                  </button>
                )
              )}

            </div>
          </div>
        </div>

        {/* Error panels for play actions */}
        <div className="px-8 py-6">
          {playMovieError && <Errorpanelcardview errorMessages={playMovieError} retry={playMovie} />}
          {playTrailerError && <Errorpanelcardview errorMessages={playTrailerError} retry={playTrailer} />}

          {/* Details + Cast */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Sectionheading title="Details" />
              <div className="text-gray-300 mb-4">
                <div className="mb-2">
                  <strong>Year:</strong> {movieDetails?.release_date ? new Date(movieDetails.release_date).getFullYear() : '---'}
                  &nbsp;|&nbsp;
                  <strong>Duration:</strong> {movieDetails?.duration && movieDetails.duration.includes(':') ? `${parseInt(movieDetails.duration.split(':')[0], 10)}h ${parseInt(movieDetails.duration.split(':')[1], 10)}m` : '---'}
                </div>
                <div className="mb-2"><strong>Languages:</strong> {movieDetails?.languages?.length > 0 ? movieDetails.languages.join(', ') : '---'}</div>
                <div className="mb-2"><strong>Genres:</strong> {Array.isArray(movieDetails?.categories) ? movieDetails.categories.map(cat => cat.name).join(', ') : 'N/A'}</div>
              </div>

              <div className="mb-6">
                <h4 className="text-white font-bold mb-2">Description</h4>
                <p className="text-gray-300 leading-relaxed">{movieDetails?.description || movieDetails?.short_description || 'No description available.'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">Cast & Crew</h3>
              <div className="flex overflow-x-auto gap-6">
                {Array.isArray(castDetails) && castDetails.length > 0 ? (
                  castDetails.map(person => (
                    <div key={person.uuid || person.id} className="flex flex-col items-center w-24">
                      <img src={person?.image ? encodeURI(person.image) : 'https://via.placeholder.com/64'} alt={person?.name} className="w-16 h-16 rounded-full border border-white mb-2 object-cover" />
                      <div className="text-white text-xs text-center font-semibold truncate w-full">{person?.name || 'N/A'}</div>
                      <div className="text-gray-400 text-xs text-center truncate w-full">{person?.title || person?.department || 'N/A'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No cast details available</div>
                )}
              </div>
            </div>
          </div>

          {/* More Like This */}
          <div className="mt-8">
            <Sectionheading title="More Like This" />
            <div className="grid grid-cols-7 gap-6">
              {movieCarouselList.length === 0 ? (
                Array.from({ length: 8 }).map((_, i) => <IndividialCardSkeleton key={i} />)
              ) : (
                movieCarouselList.map((m, index) => (
                  <div
                    key={m.id}
                    ref={el => movieRefs.current[index] = el}
                    onClick={() => navigate(`/movie/${m.uuid || m.id}`)}
                    className={`transition-transform duration-200 rounded-lg ${activeSection === 'MOVIES' && focusedIndexes.movies === index ? 'scale-110 ring-4 ring-[#c02628]/50' : ''}`}
                    tabIndex={0}
                    onFocus={() => setActiveSection('MOVIES')}
                  >
                    <IndividialMovieCard movie={m} onClick={() => navigate(`/movie/${m.uuid || m.id}`)} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
