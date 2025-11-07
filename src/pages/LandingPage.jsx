import React, { useRef, useEffect, useState, useCallback } from "react";
import HeroSection from '../components/landingpage/HeroSection';
import TrendingMoviesLanding from "../components/landingpage/TrendingMoviesLanding";
import FeatureGrid from "../components/landingpage/FeatureGrid";
import FAQSection from "../components/landingpage/FAQSection";
import { useNavigate } from "react-router-dom";

const SECTIONS = {
    HERO: 0,
    TRENDING: 1,
    NONE: -1, // No section has focus, normal scroll
};

const LandingPage = () => {
    const navigation = useNavigate();
    const scrollRef = useRef(null);
    const [activeSection, setActiveSection] = useState(SECTIONS.HERO);

    const handleVerticalNavigation = useCallback(
        (key) => {
            let sectionChanged = false;
            if (key === "ArrowDown") {
                setActiveSection((prev) => {
                    if (prev === SECTIONS.HERO) { sectionChanged = true; return SECTIONS.TRENDING; }
                    if (prev === SECTIONS.TRENDING) { sectionChanged = true; return SECTIONS.NONE; }
                    return prev;
                });
            } else if (key === "ArrowUp") {
                setActiveSection((prev) => {
                    if (prev === SECTIONS.TRENDING) { sectionChanged = true; return SECTIONS.HERO; }
                    // If we are scrolled down, going up should reactivate trending
                    if (prev === SECTIONS.NONE) { sectionChanged = true; return SECTIONS.TRENDING; }
                    return prev;
                });
            }
            return sectionChanged;
        },
        []
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                // First, try to handle vertical navigation between sections
                const sectionWasChanged = handleVerticalNavigation(e.key);

                if (sectionWasChanged) {
                    e.preventDefault(); // Prevent default scroll if we changed sections
                } else if (activeSection === SECTIONS.NONE && scrollRef.current) {
                    // If no section was activated/deactivated, and we are in NONE state, then scroll
                    if (e.key === "ArrowDown") {
                        scrollRef.current.scrollBy({ top: 200, behavior: "smooth" });
                    } else if (e.key === "ArrowUp") {
                        scrollRef.current.scrollBy({ top: -200, behavior: "smooth" });
                    }
                    e.preventDefault(); // Prevent default browser scroll if we handled it
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeSection, handleVerticalNavigation]);

    return (
        <div className="flex flex-col  bg-[#712728] h-screen">
            {/* ✅ Scrollable content */}
            <div
                ref={scrollRef}
                className="flex-1 w-full overflow-y-auto scroll-smooth focus:outline-none scrollbar-hide"
                tabIndex={-1}
            >
                <HeroSection navigation={navigation} isActive={activeSection === SECTIONS.HERO} onNavigate={handleVerticalNavigation} />
                <TrendingMoviesLanding isActive={activeSection === SECTIONS.TRENDING} onNavigate={handleVerticalNavigation} />
                <FeatureGrid />
                <FAQSection />
            </div>
        </div>
    );
};

export default LandingPage;


// import React from 'react'

// function LandingPage() {
//   return (
//     // Simple placeholder for Landing Page
//     <div className="flex items-center justify-center w-full h-full bg-blue-500">
//       <h1 className="text-4xl font-bold text-white">Welcome to the Landing Page</h1>
//     </div>
//   )
// }

// export default LandingPage