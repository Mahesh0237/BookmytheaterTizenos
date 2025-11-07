import React, { forwardRef } from 'react';

const GradientCard = forwardRef(({ item, onFocus, onPress, isFocused }, ref) => {
  return (
    <div
      ref={ref}
      onFocus={onFocus}
      onClick={onPress}
      onMouseEnter={onFocus} // Simulate focus for mouse users
      className="group cursor-pointer outline-none"
    >
      <div
        className={`h-[140px] w-80 mr-6 transition-all duration-200 ease-in-out border-2 
          ${
            isFocused
              ? 'border-red-700'
              : 'border-transparent'
          }`}
      >
        <div
          className="flex flex-row items-center p-1 gap-3.5 h-full w-full bg-linear-from-to-br from-[rgba(192,38,40,0.7)] to-[#282828]"
        >
          <img
            src={item.image}
            alt={item.name}
            className={`w-[55%] h-full object-cover transition-transform duration-200 ease-in-out ${isFocused ? 'scale-105' : 'scale-100'}`}
          />
          <div className="w-[45%] justify-center items-start">
            <p className="text-white text-[26px] font-extrabold italic">
              {item.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GradientCard;
