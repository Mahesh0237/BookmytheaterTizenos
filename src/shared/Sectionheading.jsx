import React, { useState, useRef, useEffect } from "react";

const SectionHeading = ({ title = "Trending Movies", styleclass = "",}) => {
  const [textWidth, setTextWidth] = useState(0);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth);
    }
  }, [title]);

  return (
    <div className={`mb-3 ${styleclass}`}>
      <div className="inline-block">
        <h2
          ref={textRef}
          className="text-white text-[22px] font-bold inline-block"
        >
          {title}
        </h2>
        {/* Underline at 70% of text width */}
        <div
          className="h-1 bg-[#D94444] mt-1 rounded-full transition-all duration-300"
          style={{ width: `${textWidth * 0.7}px` }}
        ></div>
      </div>
    </div>
  );
};

export default SectionHeading;
