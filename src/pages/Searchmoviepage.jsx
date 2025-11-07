import React, { useState, useEffect, useRef, useCallback } from "react";
import Movieapi from '../components/api/Movieapi'
import Sidebar from '../components/Sidebar';
import Lottie from 'lottie-react';
import skeletonAnimation from '../../public/assets/skeleton.json';
import Errorpanelcardview from '../shared/Errorpanelcardview';
import { useNavigate } from "react-router-dom";
import MovieThumbnail from "../shared/MovieThumbnail";

const SearchMoviePage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCapsLock, setIsCapsLock] = useState(false);
    const [isSpecialChars, setIsSpecialChars] = useState(false);
    const limit = 50;

    // D-Pad Navigation State
    const [activeSection, setActiveSection] = useState('KEYBOARD'); // 'SIDEBAR', 'INPUT', 'KEYBOARD', 'MOVIES'
    const [focusedIndexes, setFocusedIndexes] = useState({
        keyboard: { row: 0, col: 0 },
        movies: 0
    });

    const movieRefs = useRef([]);
    const keyboardRefs = useRef([]);
    const inputRef = useRef(null);

    // Regular keyboard layout
    const regularKeyboard = [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l", "@"],
        ["$%^", "↑", "z", "x", "c", "v", "b", "n", "m", "⌫"],
        ["Space"]
    ];

    // Special characters keyboard layout
    const specialCharsKeyboard = [
        ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
        ["-", "_", "=", "+", "[", "]", "{", "}", "|", "\\"],
        [";", ":", "'", "\"", ",", "<", ".", ">", "/", "?"],
        ["$%^", "↑", "`", "~", "¡", "™", "£", "¢", "∞", "⌫"],
        ["Space"]
    ];

    // Get current keyboard based on state
    const getCurrentKeyboard = () => {
        if (isSpecialChars) {
            return specialCharsKeyboard;
        }
        return regularKeyboard;
    };

    const handleKeyPress = (key) => {
        switch (key) {
            case "⌫":
                setSearchQuery((prev) => prev.slice(0, -1));
                break;
            case "Space":
                setSearchQuery((prev) => prev + " ");
                break;
            case "↑": // Caps lock
                setIsCapsLock(!isCapsLock);
                break;
            case "$%^": // Special characters toggle
                setIsSpecialChars(!isSpecialChars);
                break;
            default:
                if (key.length === 1) {
                    const finalKey = isCapsLock && !isSpecialChars ? key.toUpperCase() : key;
                    setSearchQuery((prev) => prev + finalKey);
                }
                break;
        }
    };

    const fetchMovies = async (isLoadMore = false) => {
        try {
            setIsLoading(true);
            const currentPage = isLoadMore ? page + 1 : 1;
            const endpoint =
                searchQuery.trim() === ""
                    ? `getsearchmovies?page=${currentPage}&limit=${limit}&random=true`
                    : `getsearchmovies?query=${encodeURIComponent(
                        searchQuery
                    )}&page=${currentPage}&limit=${limit}`;

            const response = await Movieapi.get(endpoint);
            const data = response.data;

            if (data.status === "success") {
                if (isLoadMore) {
                    const newMovies = data.results.filter(
                        (movie) => !searchResults.find((m) => m.id === movie.id)
                    );
                    setSearchResults((prev) => [...prev, ...newMovies]);
                    setPage(currentPage);
                } else {
                    setSearchResults(data.results);
                    setPage(1);
                    setFocusedIndexes(prev => ({ ...prev, movies: 0 }));
                }
                setHasMore(data.totalcount > searchResults.length);
            } else {
                setErrorMessage("No results found");
                setSearchResults([]);
                setHasMore(false);
            }
        } catch (err) {
            setErrorMessage("Error fetching movies");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies(false);
    }, [searchQuery]);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !isLoading) {
            fetchMovies(true);
        }
    };

    const handleMoviePress = useCallback((movie) => {
        navigate(`/movie/${movie.uuid}`);
    }, [navigate]);

    // --- D-Pad Navigation Logic ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault();
            const currentKeyboard = getCurrentKeyboard();

            switch (activeSection) {
                case 'SIDEBAR':
                    if (e.key === 'ArrowRight') {
                        setActiveSection('INPUT');
                        inputRef.current?.focus();
                    }
                    break;

                case 'INPUT':
                    if (e.key === 'ArrowLeft') {
                        setActiveSection('SIDEBAR');
                    } else if (e.key === 'ArrowRight') {
                        setActiveSection('KEYBOARD');
                    } else if (e.key === 'Enter') {
                        setActiveSection('KEYBOARD');
                    }
                    break;

                case 'KEYBOARD':
                    const { row, col } = focusedIndexes.keyboard;
                    const currentRow = currentKeyboard[row];

                    if (e.key === 'ArrowUp') {
                        if (row === 0) {
                            setActiveSection('INPUT');
                            inputRef.current?.focus();
                        } else {
                            const newRow = row - 1;
                            const maxCol = Math.min(col, currentKeyboard[newRow].length - 1);
                            setFocusedIndexes(prev => ({
                                ...prev,
                                keyboard: { row: newRow, col: maxCol }
                            }));
                        }
                    } else if (e.key === 'ArrowDown') {
                        if (row < currentKeyboard.length - 1) {
                            const newRow = row + 1;
                            const maxCol = Math.min(col, currentKeyboard[newRow].length - 1);
                            setFocusedIndexes(prev => ({
                                ...prev,
                                keyboard: { row: newRow, col: maxCol }
                            }));
                        } else {
                            setActiveSection('MOVIES');
                        }
                    } else if (e.key === 'ArrowLeft') {
                        if (col > 0) {
                            setFocusedIndexes(prev => ({
                                ...prev,
                                keyboard: { row, col: col - 1 }
                            }));
                        }
                    } else if (e.key === 'ArrowRight') {
                        if (col < currentRow.length - 1) {
                            setFocusedIndexes(prev => ({
                                ...prev,
                                keyboard: { row, col: col + 1 }
                            }));
                        }
                    } else if (e.key === 'Enter') {
                        const focusedKey = currentKeyboard[row][col];
                        if (focusedKey) {
                            handleKeyPress(focusedKey);
                        }
                    }
                    break;

                case 'MOVIES':
                    const currentMovieIndex = focusedIndexes.movies;
                    const moviesPerRow = 6; // Adjust based on your grid layout

                    if (e.key === 'ArrowUp') {
                        const nextIndex = currentMovieIndex - moviesPerRow;
                        if (nextIndex < 0) {
                            setActiveSection('KEYBOARD');
                        } else {
                            setFocusedIndexes(prev => ({ ...prev, movies: nextIndex }));
                        }
                    } else if (e.key === 'ArrowDown') {
                        const nextIndex = Math.min(searchResults.length - 1, currentMovieIndex + moviesPerRow);
                        setFocusedIndexes(prev => ({ ...prev, movies: nextIndex }));
                    } else if (e.key === 'ArrowLeft') {
                        if (currentMovieIndex % moviesPerRow === 0) {
                            setActiveSection('SIDEBAR');
                        } else {
                            setFocusedIndexes(prev => ({ ...prev, movies: Math.max(0, prev.movies - 1) }));
                        }
                    } else if (e.key === 'ArrowRight') {
                        const nextIndex = Math.min(searchResults.length - 1, currentMovieIndex + 1);
                        setFocusedIndexes(prev => ({ ...prev, movies: nextIndex }));
                    } else if (e.key === 'Enter') {
                        const focusedMovie = searchResults[currentMovieIndex];
                        if (focusedMovie) {
                            handleMoviePress(focusedMovie);
                        }
                    }
                    break;

                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeSection, focusedIndexes, searchResults, isSpecialChars]);

    // Effect to focus elements when state changes
    useEffect(() => {
        if (activeSection === 'INPUT') {
            inputRef.current?.focus();
        } else if (activeSection === 'KEYBOARD') {
            const { row, col } = focusedIndexes.keyboard;
            const refKey = `${row}-${col}`;
            const targetRef = keyboardRefs.current[refKey];
            targetRef?.focus();
        } else if (activeSection === 'MOVIES') {
            movieRefs.current[focusedIndexes.movies]?.focus();
        }
    }, [activeSection, focusedIndexes]);

    // Auto-scroll for focused elements
    useEffect(() => {
        if (activeSection === 'MOVIES') {
            movieRefs.current[focusedIndexes.movies]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }, [focusedIndexes.movies, activeSection]);

    // Reset movie refs when search results change
    useEffect(() => {
        movieRefs.current = [];
    }, [searchResults]);

    const currentKeyboard = getCurrentKeyboard();

    return (
        <div className="flex flex-row gap-5 h-screen text-white bg-linear-to-b from-black to-[#5B0203]">
            <Sidebar isActive={activeSection === 'SIDEBAR'} />

            <div className="w-full">
                <div className="flex flex-row gap-6 my-10 px-5 w-full">
                    {/* Search Input */}
                    {/* <div className="relative w-[35%]">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            placeholder="Search movies..."
                            className={`search-input w-full text-xl px-6 py-4 rounded-lg border-2 bg-transparent text-white outline-none transition-all duration-200 ${activeSection === 'INPUT'
                                ? "border-red-600 bg-white bg-opacity-10"
                                : "border-gray-600"
                                }`}
                            onFocus={() => setActiveSection('INPUT')}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            tabIndex="0"
                        />
                    </div> */}
                    
                    {/* Search Input - Custom Div */}
                    <div
                        ref={inputRef}
                        className={`relative w-[35%] h-16 text-xl px-6 py-4 rounded-lg border-2 bg-transparent text-white outline-none transition-all duration-200 flex items-center cursor-text ${activeSection === 'INPUT'
                            ? "border-red-600 bg-white bg-opacity-10"
                            : "border-gray-600"
                            }`}
                        onFocus={() => setActiveSection('INPUT')}
                        onClick={() => setActiveSection('INPUT')}
                        tabIndex="0"
                        role="textbox"
                        aria-label="Search movies"
                    >
                        {searchQuery ? (
                            <span className="text-white">{searchQuery}</span>
                        ) : (
                            <span className="text-gray-400">Search movies...</span>
                        )}
                        {activeSection === 'INPUT' && (
                            <span className="ml-1 animate-pulse text-white">|</span>
                        )}
                    </div>

                    {/* Virtual Keyboard */}
                    <div className="w-[43%] p-5 bg-[#1d2228] rounded-lg">
                        {currentKeyboard.map((row, rIdx) => (
                            <div key={rIdx} className="flex flex-row mb-2 justify-start gap-2">
                                {row.map((key, kIdx) => {
                                    const isKeyFocused = activeSection === 'KEYBOARD' &&
                                        focusedIndexes.keyboard.row === rIdx &&
                                        focusedIndexes.keyboard.col === kIdx;

                                    let buttonClass = "key h-12 px-3 rounded text-lg font-medium transition-all duration-200 ";

                                    // Special styling for function keys
                                    if (["$%^", "↑", "⌫", "Space"].includes(key)) {
                                        buttonClass += "bg-[#5B0203] text-[#fff] ";
                                    } else {
                                        buttonClass += "bg-[#2A3139] text-white ";
                                    }

                                    // Focus state
                                    if (isKeyFocused) {
                                        buttonClass += "bg-white !text-[#000] transform scale-105 ";
                                    }

                                    // Adjust width for different keys
                                    if (key === "Space") {
                                        buttonClass += "w-[100%] ";
                                    } else {
                                        buttonClass += "min-w-[63px] min-h-[65px] ";
                                    }

                                    return (
                                        <button
                                            key={kIdx}
                                            ref={el => keyboardRefs.current[`${rIdx}-${kIdx}`] = el}
                                            className={buttonClass}
                                            tabIndex="-1"
                                            onClick={() => {
                                                handleKeyPress(key);
                                                setFocusedIndexes(prev => ({
                                                    ...prev,
                                                    keyboard: { row: rIdx, col: kIdx }
                                                }));
                                                setActiveSection('KEYBOARD');
                                            }}
                                        >
                                            {key === "↑" && isCapsLock ? "⇧" : key}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-[calc(100vh-500px)] overflow-y-auto overflow-x-hidden" onScroll={handleScroll}>
                    {isLoading ? (
                        <div className="flex flex-row overflow-x-auto no-scrollbar">
                            {[1, 2, 3, 4, 5, 6].map(item => (
                                <div
                                    key={item}
                                    className="w-[200px] h-[300px] rounded-sm overflow-hidden mr-3 relative"
                                >
                                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                                        <Lottie
                                            animationData={skeletonAnimation}
                                            loop
                                            autoplay
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : errorMessage ? (
                        <div className="px-6 w-full">
                            <Errorpanelcardview
                                errorMessages={errorMessage}
                                retry={() => fetchMovies(false)}
                            />
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="flex flex-row justify-center items-center h-[150px] bg-[#222] w-full">
                            <p className="text-white font-semibold text-xl">No movies found</p>
                        </div>
                    ) : (
                        <div
                            className="flex flex-row flex-wrap justify-start gap-y-4 gap-x-4 px-2"
                        >
                            {searchResults.map((movie, index) => (
                                <div
                                    ref={el => (movieRefs.current[index] = el)}
                                    key={movie.id}
                                    className="rounded-lg focus:outline-none"
                                    tabIndex="-1"
                                >
                                    <MovieThumbnail
                                        source={movie.main_thumbnail}
                                        alt={movie.title}
                                        // style={{ width: "200px", height: "300px" }}
                                        isFocused={activeSection === 'MOVIES' && index === focusedIndexes.movies}
                                        onClick={() => handleMoviePress(movie)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchMoviePage;