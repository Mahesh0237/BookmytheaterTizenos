import React, { useEffect, useRef } from "react";

const Terms = ({ onNavigate, isActive }) => {
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
    <div ref={contentRef} className="w-full h-screen bg-custom-gradient text-white overflow-y-auto scrollbar-hide">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex flex-row items-center gap-3">
            <h1 className="text-3xl font-bold text-[#d94b4b] mb-2 sm:mb-0">
              Terms & Conditions
            </h1>
          </div>

          <p className="text-sm text-right">
            Visit{" "}
            <a
              href="https://uat.bookmytheatre.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d94b4b] hover:underline"
            >
              https://uat.bookmytheatre.com
            </a>{" "}
            for more information
          </p>
        </div>

        {/* Section 1 */}
        <h2 className="text-white font-bold text-base mb-2">1. Definitions</h2>
        <p className="text-gray-300 text-sm leading-6 mb-5">
          <strong>Platform:</strong> Refers to the Book My Theatre website,
          applications, services, and technologies. <br />
          <strong>User:</strong> Anyone accessing or using the platform,
          including viewers and affiliates. <br />
          <strong>Filmmaker:</strong> A content creator submitting films or
          trailers. <br />
          <strong>Affiliate:</strong> A user who shares films via referral links
          and earns from successful referrals. <br />
          <strong>Net Revenue:</strong> Gross income after deducting applicable
          taxes, platform fees, and transaction costs.
        </p>

        {/* Section 2 */}
        <h2 className="text-white font-bold text-base mb-2">2. Platform Use</h2>
        <p className="text-gray-300 text-sm leading-6 mb-5">
          Users must be 18 years or older, or use the platform under the
          supervision of a parent or guardian. <br />
          Users agree not to use the platform for illegal activity, fraud, or
          copyright violations. <br />
          Book My Theatre may suspend or terminate any account found to violate
          these rules.
        </p>

        {/* Section 3 */}
        <h2 className="text-white font-bold text-base mb-2">
          3. Intellectual Property & Anti-Cloning Policy
        </h2>
        <p className="text-gray-300 text-sm leading-6 mb-5">
          Users must be 18 years or older, or use the platform under the
          supervision of a parent or guardian. <br />
          Users agree not to use the platform for illegal activity, fraud, or
          copyright violations. <br />
          Book My Theatre may suspend or terminate any account found to violate
          these rules.
        </p>

        {/* Section 4 */}
        <h2 className="text-white font-bold text-base mb-2">
          4. User Responsibilities
        </h2>
        <p className="text-gray-300 text-sm leading-6 mb-5">
          Users are responsible for maintaining the confidentiality of their
          account information and password. <br />
          Users must promptly notify Book My Theatre of any unauthorized use of
          their account or any other breach of security.
        </p>
      </div>
    </div>
  );
};

export default Terms;
