import React, { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from '../../components/Sidebar'
import Browse from "../../components/browse/Browse";
import TrendingMovies from "../../components/browse/TrendingMovies";
import LatestRelease from "../../components/browse/LatestRelease";
import ComingSoon from "../../components/browse/ComingSoon";
import ContinueWatching from "../../components/browse/ContinueWatching";
import Movieapi from "../../components/api/Movieapi";

const SECTIONS = {
  SIDEBAR: "SIDEBAR",
  BROWSE: "BROWSE",
  CONTINUE_WATCHING: "CONTINUE_WATCHING",
  LATEST_RELEASE: "LATEST_RELEASE",
  TRENDING_MOVIES: "TRENDING_MOVIES",
  COMING_SOON: "COMING_SOON",
};

const BrowsePage = () => {
  const [scheduleMoviesCount, setScheduleMoviesCount] = useState(0);
  const [isLoadingEffect, setIsLoadingEffect] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeSection, setActiveSection] = useState(SECTIONS.BROWSE);
  const pageRef = useRef(null);

  const sectionRefs = {
    [SECTIONS.BROWSE]: useRef(null),
    [SECTIONS.CONTINUE_WATCHING]: useRef(null),
    [SECTIONS.LATEST_RELEASE]: useRef(null),
    [SECTIONS.TRENDING_MOVIES]: useRef(null),
    [SECTIONS.COMING_SOON]: useRef(null),
  };

  const sectionOrder = [
    SECTIONS.BROWSE,
    SECTIONS.CONTINUE_WATCHING,
    SECTIONS.LATEST_RELEASE,
    SECTIONS.TRENDING_MOVIES,
    ...(scheduleMoviesCount > 0 ? [SECTIONS.COMING_SOON] : []),
  ];

  const handleNavigation = useCallback((key, fromSection) => {
    const currentSectionIndex = sectionOrder.indexOf(fromSection);

    if (key === "ArrowDown" && currentSectionIndex < sectionOrder.length - 1) {
      setActiveSection(sectionOrder[currentSectionIndex + 1]);
    } else if (key === "ArrowUp" && currentSectionIndex > 0) {
      setActiveSection(sectionOrder[currentSectionIndex - 1]);
    } else if (key === "ArrowLeft") {
      setActiveSection(SECTIONS.SIDEBAR);
    } else if (key === "ArrowRight" && fromSection === SECTIONS.SIDEBAR) {
      // Find the first available content section to focus on
      setActiveSection(sectionOrder[0]);
    }
  }, [sectionOrder]);

  const fetchScheduleMovies = async () => {
    try {
      setIsLoadingEffect(true);
      const response = await Movieapi.get("getscheduledmoviescount");
      const data = response.data;

      if (data.status === "error") {
        setErrorMessage(data.message);
        setIsLoadingEffect(false);
        return;
      }

      setScheduleMoviesCount(data.scheduleMoviesCount || 0);
      setErrorMessage(null);
      setIsLoadingEffect(false);
    } catch (error) {
      console.error("Error fetching scheduled movies:", error);
      setErrorMessage("Something went wrong while fetching movies.");
      setIsLoadingEffect(false);
    }
  };

  useEffect(() => {
    fetchScheduleMovies();
  }, []);

  useEffect(() => {
    if (activeSection && sectionRefs[activeSection]?.current) {
      const timer = setTimeout(() => {
        sectionRefs[activeSection].current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 50); // A small delay is usually sufficient
      return () => clearTimeout(timer);
    }
  }, [activeSection]);

  return (
    <div className="flex h-screen bg-gradient-to-b from-black to-[#5B0203] text-white">
      {/* === Sidebar === */}
      <Sidebar isActive={activeSection === SECTIONS.SIDEBAR} onNavigate={(key) => handleNavigation(key, SECTIONS.SIDEBAR)} />

      {/* === Main Content === */}
      <div ref={pageRef} className="flex-1 overflow-y-auto relative h-screen bg-gradient-to-r from-black/95 via-black/55 to-transparent scrollbar-hide" >
        {/* Gradient overlay effect */}
        <div className="absolute inset-0 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-10 mb-10">
          <div ref={sectionRefs.BROWSE}><Browse isActive={activeSection === SECTIONS.BROWSE} onNavigate={(key) => handleNavigation(key, SECTIONS.BROWSE)} /></div>
          <div ref={sectionRefs.CONTINUE_WATCHING}><ContinueWatching isActive={activeSection === SECTIONS.CONTINUE_WATCHING} onNavigate={(key) => handleNavigation(key, SECTIONS.CONTINUE_WATCHING)} /></div>
          <div ref={sectionRefs.LATEST_RELEASE}><LatestRelease isActive={activeSection === SECTIONS.LATEST_RELEASE} onNavigate={(key) => handleNavigation(key, SECTIONS.LATEST_RELEASE)} /></div>
          <div ref={sectionRefs.TRENDING_MOVIES}><TrendingMovies isActive={activeSection === SECTIONS.TRENDING_MOVIES} onNavigate={(key) => handleNavigation(key, SECTIONS.TRENDING_MOVIES)} /></div>
          {scheduleMoviesCount > 0 && <div ref={sectionRefs.COMING_SOON}><ComingSoon isActive={activeSection === SECTIONS.COMING_SOON} onNavigate={(key) => handleNavigation(key, SECTIONS.COMING_SOON)} /></div>}
        </div>

        {/* Loading or Error UI */}
        {isLoadingEffect && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/50">
            <p className="text-gray-300 text-lg animate-pulse">
              Loading movies...
            </p>
          </div>
        )}
        {errorMessage && !isLoadingEffect && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/50">
            <p className="text-red-500 text-lg">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
