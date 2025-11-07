import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import laughterImg from '../../public/laughter.png';
import Sidebar from '../components/Sidebar';
import GradientCard from '../shared/GradientCard'
import angerImg from '../../public/anger.png';
import courageImg from '../../public/courage.png';
import disgustImg from '../../public/disgust.png';
import fearImg from '../../public/fear.png';
import loveImg from '../../public/love.png';
import peaceImg from '../../public/peace.png';
import sarrowImg from '../../public/sarrow.png';
import wonderImg from '../../public/wonder.png';
import Sectionheading from '../shared/Sectionheading'
import Movieapi from '../components/api/Movieapi';
import skeletonAnimation from '../../public/assets/skeleton.json';
import Errorpanelcardview from '../shared/Errorpanelcardview';
import Skeletongradientcard from '../shared/Skeletongradientcard';
import Lottie from 'lottie-react';
import MovieThumbnail from '../shared/MovieThumbnail';

const categoryAssets = {
  Laughter: { color: 'rgba(192, 38, 40, 0.7)', image: laughterImg },
  Anger: { color: 'rgba(40, 40, 40, 1)', image: angerImg },
  Courage: { color: 'rgba(192, 38, 40, 0.7)', image: courageImg },
  Disgust: { color: 'rgba(40, 40, 40, 1)', image: disgustImg },
  Fear: { color: 'rgba(192, 38, 40, 0.7)', image: fearImg },
  Love: { color: 'rgba(40, 40, 40, 1)', image: loveImg },
  Peace: { color: 'rgba(192, 38, 40, 0.7)', image: peaceImg },
  Sorrow: { color: 'rgba(40, 40, 40, 1)', image: sarrowImg },
  Wonder: { color: 'rgba(192, 38, 40, 0.7)', image: wonderImg },
};

// --- Main Screen Component ---
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [focusedCategory, setFocusedCategory] = useState(null);

  // D-Pad Navigation State
  const [activeSection, setActiveSection] = useState('CATEGORIES'); // 'SIDEBAR', 'CATEGORIES', 'MOVIES', 'ALL_CATEGORIES_MOVIES'
  const [focusedIndexes, setFocusedIndexes] = useState({ categories: 0, movies: 0, allCatRow: 0, allCatCol: 0 });
  const categoryRefs = useRef([]);
  const allCategoriesMovieRefs = useRef([]);
  const movieRefs = useRef([]);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await Movieapi.get('/getallcategories');
      if (response.data && response.data.status === 'success') {
        const formattedCategories = response.data.categories.map(cat => ({
          ...cat,
          ...categoryAssets[cat.name],
        }));
        setCategories(formattedCategories);
      } else {
        setError(response.data?.message || 'Failed to fetch categories.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const [categoryName, setCategoryName] = useState('');
  const [singleCategoryMovies, setSingleCategoryMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 50;
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const fetchindividualcategoryMovie = useCallback(
    async (category, pageNum = 1, isLoadMore = false) => {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setIsInitialLoading(true);
        setSingleCategoryMovies([]);
      }

      try {
        const response = await Movieapi.get(
          'getindividualcategorymoviesfortv',
          {
            params: {
              category: category,
              limit: limit,
              page: pageNum,
            },
            headers: {
              Accept: 'application/json',
            },
          },
        );
        const data = response.data;

        if (data.status === 'success') {
          if (isLoadMore) {
            setSingleCategoryMovies(prevMovies => {
              const existingIds = new Set(prevMovies.map(movie => movie.id));
              const newMovies = data.movies.filter(
                movie => !existingIds.has(movie.id),
              );
              return [...prevMovies, ...newMovies];
            });
          } else {
            setSingleCategoryMovies(data.movies || []);
          }

          setPage(pageNum);
          setHasMore(pageNum < data.totalPages);
          setErrorMessage('');
        } else if (data.status === 'error') {
          let finalresponse = {
            message: data.message,
            server_res: data,
          };
          setErrorMessage(finalresponse);
          if (!isLoadMore) {
            setSingleCategoryMovies([]);
          }
        }
      } catch (error) {
        let finalresponse;
        if (error.response !== undefined) {
          finalresponse = {
            message: error.message,
            server_res: error.response.data,
          };
        } else {
          finalresponse = {
            message: error.message,
            server_res: null,
          };
        }
        setErrorMessage(finalresponse);
        if (!isLoadMore) {
          setSingleCategoryMovies([]);
        }
      } finally {
        if (isLoadMore) {
          setIsLoadingMore(false);
        } else {
          setIsInitialLoading(false);
        }
      }
    },
    [limit],
  );

  const updateCategoryName = name => {
    setCategoryName(name);
    setPage(1); // Reset to first page when category changes
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categoryName) {
      fetchindividualcategoryMovie(categoryName, 1, false);
    }
  }, [categoryName, fetchindividualcategoryMovie]);

  // Reset movie focus when category changes
  useEffect(() => {
    setFocusedIndexes(prev => ({ ...prev, movies: 0, allCatRow: 0, allCatCol: 0 }));
    movieRefs.current = [];
  }, [singleCategoryMovies]);

  // --- D-Pad Navigation Logic ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (activeSection) {
        case 'SIDEBAR':
          // The Sidebar component handles its own Up/Down navigation.
          // The parent page only needs to handle navigating *out* of the sidebar.
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            setActiveSection('CATEGORIES');
          }
          // For 'Enter', 'ArrowUp', 'ArrowDown', we do NOT preventDefault,
          // allowing the browser's default link behavior or the Sidebar's own handler to work.
          break;
        case 'CATEGORIES':
          e.preventDefault();
          if (e.key === 'ArrowLeft') {
            const catIndex = focusedIndexes.categories;
            // If a category is selected, ArrowLeft from the first item goes to sidebar
            if (categoryName && catIndex === 0) {
              setActiveSection('SIDEBAR');
              // If no category is selected, ArrowLeft from first item goes to sidebar
            } else if (!categoryName && catIndex === 0) {
              setActiveSection('SIDEBAR');
            } else {
              setFocusedIndexes(prev => ({ ...prev, categories: Math.max(0, prev.categories - 1) }));
            }
          } else if (e.key === 'ArrowRight') {
            setFocusedIndexes(prev => ({ ...prev, categories: Math.min(categories.length - 1, prev.categories + 1) }));
          } else if (e.key === 'ArrowDown') {
            if (categoryName) {
              setActiveSection('MOVIES');
            } else {
              setActiveSection('ALL_CATEGORIES_MOVIES');
            }
          } else if (e.key === 'Enter') {
            const focusedCat = categories[focusedIndexes.categories];
            if (focusedCat) {
              updateCategoryName(focusedCat.name);
            }
          }
          break;
        case 'MOVIES':
          e.preventDefault();
          const moviesPerRow = 7; // Adjust based on your layout
          const currentMovieIndex = focusedIndexes.movies;

          if (e.key === 'ArrowUp') {
            const nextIndex = currentMovieIndex - moviesPerRow;
            if (nextIndex < 0) {
              setActiveSection('CATEGORIES');
            } else {
              setFocusedIndexes(prev => ({ ...prev, movies: nextIndex }));
            }
          } else if (e.key === 'ArrowDown') {
            const nextIndex = Math.min(singleCategoryMovies.length - 1, currentMovieIndex + moviesPerRow);
            setFocusedIndexes(prev => ({ ...prev, movies: nextIndex }));
          } else if (e.key === 'ArrowLeft') {
            if (currentMovieIndex % moviesPerRow === 0) {
              setActiveSection('SIDEBAR');
            } else {
              setFocusedIndexes(prev => ({ ...prev, movies: Math.max(0, prev.movies - 1) }));
            }
          } else if (e.key === 'ArrowRight') {
            const nextIndex = Math.min(singleCategoryMovies.length - 1, currentMovieIndex + 1);
            setFocusedIndexes(prev => ({ ...prev, movies: nextIndex }));
          } else if (e.key === 'Enter') {
            const focusedMovie = singleCategoryMovies[currentMovieIndex];
            if (focusedMovie) {
              handleMoviePress(focusedMovie);
            }
          }
          break;
        case 'ALL_CATEGORIES_MOVIES':
          e.preventDefault();
          const { allCatRow, allCatCol } = focusedIndexes;
          const currentCategory = categories[allCatRow];
          const moviesInRow = currentCategory?.movies?.length || 0;

          if (e.key === 'ArrowUp') {
            if (allCatRow === 0) {
              setActiveSection('CATEGORIES');
            } else {
              setFocusedIndexes(prev => ({ ...prev, allCatRow: prev.allCatRow - 1, allCatCol: 0 }));
            }
          } else if (e.key === 'ArrowDown') {
            if (allCatRow < categories.length - 1) {
              setFocusedIndexes(prev => ({ ...prev, allCatRow: prev.allCatRow + 1, allCatCol: 0 }));
            }
          } else if (e.key === 'ArrowLeft') {
            if (allCatCol === 0) {
              setActiveSection('SIDEBAR');
            } else {
              setFocusedIndexes(prev => ({ ...prev, allCatCol: prev.allCatCol - 1 }));
            }
          } else if (e.key === 'ArrowRight') {
            if (allCatCol < moviesInRow - 1) {
              setFocusedIndexes(prev => ({ ...prev, allCatCol: prev.allCatCol + 1 }));
            }
          } else if (e.key === 'Enter') {
            const movie = currentCategory?.movies?.[allCatCol];
            if (movie) {
              handleMoviePress(movie);
            }
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, focusedIndexes, categories, singleCategoryMovies]);

  // Effect to focus elements when state changes
  useEffect(() => {
    if (activeSection === 'CATEGORIES') {
      categoryRefs.current[focusedIndexes.categories]?.focus();
    } else if (activeSection === 'MOVIES') {
      movieRefs.current[focusedIndexes.movies]?.focus();
    } else if (activeSection === 'ALL_CATEGORIES_MOVIES') {
      const refKey = `${focusedIndexes.allCatRow}-${focusedIndexes.allCatCol}`;
      const targetRef = allCategoriesMovieRefs.current[refKey];
      targetRef?.focus();
    }
  }, [activeSection, focusedIndexes]);

  // Auto-scroll for horizontal category list
  useEffect(() => {
    if (activeSection === 'CATEGORIES') {
      categoryRefs.current[focusedIndexes.categories]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
    if (activeSection === 'ALL_CATEGORIES_MOVIES') {
      const refKey = `${focusedIndexes.allCatRow}-${focusedIndexes.allCatCol}`;
      const targetRef = allCategoriesMovieRefs.current[refKey];
      targetRef?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [focusedIndexes.categories, focusedIndexes.allCatCol, activeSection]);

  const handleScroll = e => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // Check if user has scrolled near the bottom (within 100 pixels)
    const isCloseToBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (
      isCloseToBottom &&
      hasMore &&
      !isLoadingMore &&
      !isInitialLoading &&
      categoryName
    ) {
      fetchindividualcategoryMovie(categoryName, page + 1, true);
    }
  };

  const handleMoviePress = movie => {
    navigate(`/movie/${movie.uuid}`);
  };

  if (error) {
    return (
      <div
        className="flex-1 justify-center items-center bg-linear-to-b from-black to-[#5B0203]"
      >
        <p className="text-red-500 text-2xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-screen bg-linear-to-b from-black to-[#5B0203]">
      <Sidebar isActive={activeSection === 'SIDEBAR'} />
      {/* === 2. Content Area (Scrollable) === */}
      {/* <div className="flex"> */}
      <div className="flex-1 overflow-x-hidden">
        <div
          className="h-full overflow-y-auto pb-5"
          onScroll={handleScroll}
        >
          <h1 className="text-white text-3xl font-bold mb-4 mt-4 pl-4">
            Categories
          </h1>

          {/* === Horizontal Category Icons Row (Top Row) === */}
          <div
            className="flex flex-row overflow-x-auto! mb-3 ml-0 pl-4 no-scrollbar"
          >
            {isLoading ? (
              <>
                {[1, 2, 3, 4, 5].map((i, index) => (
                  <Skeletongradientcard key={i} isLastItem={index === 4} />
                ))}
              </>
            ) : (
              categories.map((cat, index) => {
                return (
                  <GradientCard
                    ref={el => (categoryRefs.current[index] = el)}
                    key={cat.id}
                    item={cat}
                    isFocused={activeSection === 'CATEGORIES' && focusedIndexes.categories === index}
                    onFocus={() => setActiveSection('CATEGORIES')}
                    onPress={() => updateCategoryName(cat.name)}
                  />
                );
              })
            )}
          </div>

          {isLoading ? (
            <div className="mt-4 pl-6 w-full">
              <div className="h-8 w-48 bg-gray-700 rounded mb-4"></div>
              <div
                className="flex flex-row overflow-x-auto no-scrollbar"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(item => (
                  <div
                    key={item}
                    className="w-[200px] h-[300px] bg-[#1a1a1a] overflow-hidden rounded-md shrink-0"
                  >
                    <Lottie animationData={skeletonAnimation} loop={true} />
                  </div>
                ))}
              </div>
            </div>
          ) : categoryName ? (
            <div className="mt-4 px-6 w-full">
              <Sectionheading title={categoryName} styleclass="ml-2" />
              <div className="flex flex-row flex-wrap justify-start gap-x-5 gap-y-4 mt-4">
                {isInitialLoading ? (
                  <div
                    className="flex flex-row overflow-x-auto no-scrollbar"
                  >
                    {[1, 2, 3, 4, 5, 6].map(item => (
                      <div
                        key={item}
                        className="w-[200px] h-[300px] bg-[#1a1a1a] overflow-hidden rounded-md shrink-0"
                      >
                        <Lottie animationData={skeletonAnimation} loop={true} />
                      </div>
                    ))}
                  </div>
                ) : errorMessage ? (
                  <div className="px-6 w-full">
                    <Errorpanelcardview
                      errorMessages={errorMessage}
                      retry={() =>
                        fetchindividualcategoryMovie(categoryName, 1, false)
                      }
                    />
                  </div>
                ) : singleCategoryMovies.length === 0 ? (
                  <div className="flex flex-row justify-center items-center h-[150px] bg-[#222] w-full">
                    <p className="text-white font-semibold">
                      No movies found.
                    </p>
                  </div>
                ) : (
                  singleCategoryMovies.map((item, index) => (
                    <div
                      ref={el => (movieRefs.current[index] = el)}
                      key={`${item.id}-${index}`}
                      className="rounded-lg focus:outline-none ml-2 mt-2"
                    >
                      <MovieThumbnail
                        key={`${item.id}-${index}`}
                        source={item.main_thumbnail}
                        isFocused={activeSection === 'MOVIES' && focusedIndexes.movies === index}
                        alt={item.title}
                        onPress={() => handleMoviePress(item)}
                      />
                    </div>
                  ))
                )}
              </div>
              {/* Loading indicator for infinite scroll */}
              {isLoadingMore && (
                <div className="flex flex-col justify-center items-center mt-4 py-4">
                  <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <p className="text-white mt-2">Loading more movies...</p>
                </div>
              )}
            </div>
          ) : (
            categories.map((cat, catIndex) => {
              const catMovies = cat.movies;
              return (
                <div key={cat.id} className="mb-3 pl-4">
                  <Sectionheading title={cat.name} styleclass="ml-2" />
                  <div className="flex flex-row overflow-x-auto no-scrollbar overflow-y-hidden gap-5 mt-4">
                    {catMovies && catMovies.length > 0 ? (
                      catMovies.map((movie, movieIndex) => {
                        const isFocused = activeSection === 'ALL_CATEGORIES_MOVIES' && focusedIndexes.allCatRow === catIndex && focusedIndexes.allCatCol === movieIndex;
                        return (
                          <div ref={el => allCategoriesMovieRefs.current[`${catIndex}-${movieIndex}`] = el} className="focus:outline-none pl-2 pb-2" tabIndex={-1}>
                            <MovieThumbnail
                              source={movie.main_thumbnail}
                              alt={`${movie.title}-${cat.name}`}
                              isFocused={isFocused}
                              key={movieIndex}
                              onPress={() => handleMoviePress(movie)}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-row justify-center items-center h-[150px] bg-[#222] w-full">
                        <p className="text-white font-semibold">
                          No movies in this category.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;