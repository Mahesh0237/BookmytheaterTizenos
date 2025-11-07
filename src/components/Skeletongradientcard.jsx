// components/shared/SkeletonGradientCard.js
import React from "react";

const Skeletongradientcard = ({ isLastItem }) => {
  return (
    <div
      className={`h-[140px] w-80 mr-6 rounded-xl overflow-hidden ${
        isLastItem ? "mr-0" : "mr-6"
      }`}
    >
      {/* Gradient background to match real card */}
      <div
        className="h-full w-full flex flex-row items-center p-1 gap-3.5 rounded-xl overflow-hidden bg-gradient-to-br from-[#3a3a3a] to-[#1e1e1e]"
      >
        {/* Left image placeholder */}
        <div className="w-[55%] h-full rounded-lg overflow-hidden bg-[#222]"></div>

        {/* Right text placeholder */}
        <div className="w-[45%] h-[60%] justify-center rounded-lg overflow-hidden bg-[#333]"></div>
      </div>
    </div>
  );
};

export default Skeletongradientcard;
