import React, { useEffect, useRef } from 'react';

const Devicedetails = ({ onNavigate, isActive }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        if (onNavigate) {
          onNavigate("ArrowLeft");
        }
      } else if (e.key === "ArrowDown") {
        contentRef.current?.scrollBy({ top: 100, behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        contentRef.current?.scrollBy({ top: -100, behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, onNavigate]);
  return (
    <div ref={contentRef} className="w-full h-screen flex flex-col bg-linear-to-b from-black to-[#5B0203] text-white overflow-y-auto scrollbar-hide">
      <div className="p-6 pb-8">
        {/* === Top right link === */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex flex-row items-center gap-3">
            <h1 className="text-3xl font-bold text-[#d94b4b] mb-2 sm:mb-0">
              Device Details
            </h1>
          </div>
          <p className="text-sm text-right">
            Visit{' '}
            <a
              href="https://uat.bookmytheatre.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d94b4b] underline"
            >
              https://uat.bookmytheatre.com
            </a>{' '}
            for more information
          </p>
        </div>

        {/* === Content === */}
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-md font-bold text-white mb-1">ESN</h2>
            <p className="text-sm text-gray-300 leading-6">
              Electronic Serial Number Nj jdduhjfufhnviuvii9weudnc vn vmvkvnvmn
              hj cffghjkkdjdkkldkncjc37489defdefdmnlnclndlnlnklncdncl
            </p>
          </div>

          <div>
            <h2 className="text-md font-bold text-white mb-1">
              Software Version
            </h2>
            <p className="text-sm text-gray-300 leading-6">0.121.97</p>
          </div>

          <div>
            <h2 className="text-md font-bold text-white mb-1">
              Book My Theater Version
            </h2>
            <p className="text-sm text-gray-300 leading-6">0.0012.3</p>
          </div>

          <div>
            <h2 className="text-md font-bold text-white mb-1">DNS Servers</h2>
            <p className="text-sm text-gray-300 leading-6">192.185.0.1</p>
          </div>

          <div>
            <h2 className="text-md font-bold text-white mb-1">
              Check your network
            </h2>
            <p className="text-sm text-gray-300 leading-6">
              Test your internet connection for any problems that might prevent
              you from using Book My Theatre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Devicedetails;
