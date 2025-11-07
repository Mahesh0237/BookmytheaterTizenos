import React from "react";

const MovieThumbnail = ({ source, style, alt, onClick, isFocused }) => {
  const defaultStyle = { width: "200px", height: "300px" };
  const finalStyle = style || defaultStyle;

  return (
    <button
      onClick={onClick}
      className={`relative items-center mt-2 overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 focus:scale-105 outline-none flex-shrink-0
        ${isFocused ? 'ring-4 ring-red-500 ring-offset-2 ring-offset-black' : ''}
      `}
      style={finalStyle}
    >
      <div className="rounded-lg overflow-hidden shadow-md bg-white w-full h-full">
        <img
          src={source}
          alt={alt || "Movie thumbnail"}
          className="object-cover w-full h-full"
        />
      </div>
    </button>
  );
};

export default MovieThumbnail;
