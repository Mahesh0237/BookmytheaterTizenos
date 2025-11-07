import React, { forwardRef, useEffect, useRef } from "react";

const Contactus = forwardRef(({ onNavigate, isActive }, ref) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        if (onNavigate) {
          onNavigate("ArrowLeft");
        }
      } else if (e.key === "ArrowDown") {
        if (contentRef.current) {
          contentRef.current.scrollBy({ top: 100, behavior: "smooth" });
        }
      } else if (e.key === "ArrowUp") {
        if (contentRef.current) {
          contentRef.current.scrollBy({ top: -100, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNavigate, isActive]);


  return (
    <div ref={contentRef} className="text-white flex-1 h-screen overflow-y-auto">
      {/* Header Row */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <h1 className="!text-3xl font-bold text-[#d94b4b]">Contact Us</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 flex flex-col lg:flex-row gap-10">
        {/* Left Column */}
        <div className="lg:w-1/2">
          <h2 className="text-xl font-bold text-[#d94b4b] mb-4">
            Get in Touch with Book My Theatre
          </h2>
          <p className="text-gray-300 leading-relaxed">
            At Book My Theatre, we’re here to help you reach your learning goals
            with personalized support. Contact us today to start your journey
            toward success!
          </p>
        </div>

        {/* Right Column */}
        <div className="lg:w-1/2 space-y-6">
          <div className="bg-white/5 p-5 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Customer Support</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Email: support@bookmytheatre.com <br />
              Phone: +1-555-0123 <br />
              Hours: 24/7
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Business Inquiries</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Email: business@bookmytheatre.com <br />
              Phone: +1-555-0124
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Technical Support</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Email: tech@bookmytheatre.com <br />
              Response Time: Within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Contactus;
