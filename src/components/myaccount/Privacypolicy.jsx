import React, { useEffect, useRef } from 'react';

const Privacypolicy = ({ onNavigate, isActive }) => {
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
    <div ref={contentRef} className="w-full h-screen flex flex-col bg-gradient-to-b from-black to-[#5B0203] text-white overflow-y-auto scrollbar-hide">
      <div className="px-6 py-8">
        {/* === Header === */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex flex-row items-center gap-3">
            <h1 className="text-3xl font-bold text-[#d94b4b] mb-2 sm:mb-0">
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-right text-white">
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

        {/* === Section 1 === */}
        <h2 className="text-white font-bold text-md mt-6 mb-1">
          1. Data Collection
        </h2>
        <p className="text-[#d6d6d6] text-xs leading-6 mb-4">
          We collect only essential user information (e.g., email, phone number)
          for account setup and transactions.
          <br />
          We do not collect unnecessary personal data.
        </p>

        {/* === Section 2 === */}
        <h2 className="text-white font-bold text-md mt-4 mb-1">
          2. Data Usage
        </h2>
        <p className="text-[#d6d6d6] text-sm leading-6 mb-4">
          Process transactions
          <br />
          Provide customer support
          <br />
          Enhance user experience
          <br />
          Comply with legal obligations
        </p>

        {/* === Section 3 === */}
        <h2 className="text-white font-bold text-md mt-4 mb-1">3. Security</h2>
        <p className="text-[#d6d6d6] text-sm leading-6 mb-4">
          We do not sell or share personal data with third parties for
          marketing.
          <br />
          Data may be shared with trusted partners only for service delivery
          (e.g., payment processing)
        </p>

        {/* === Section 4 === */}
        <h2 className="text-white font-bold text-md mt-4 mb-1">
          4. Your Rights
        </h2>
        <p className="text-[#d6d6d6] text-sm leading-6 mb-4">
          We do not sell or share personal data with third parties for
          marketing.
          <br />
          Data may be shared with trusted partners only for service delivery
          (e.g., payment processing)
        </p>

        {/* === Section 5 === */}
        <h2 className="text-white font-bold text-md mt-4 mb-1">5. Cookies</h2>
        <p className="text-[#d6d6d6] text-sm leading-6 mb-4">
          We use cookies to optimize performance.
          <br />
          Users may choose to block cookies in browser settings.
        </p>
      </div>
    </div>
  );
};

export default Privacypolicy;
