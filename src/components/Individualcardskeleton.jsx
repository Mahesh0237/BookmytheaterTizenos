import React from "react";

const IndividualCardSkeleton = () => {
  return (
    <div className="bg-[#2f2f2f] rounded-lg flex flex-col gap-2 w-44 h-72 mr-4 animate-pulse">
      <div className="w-full h-32 bg-gray-700 rounded-t-lg" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-700 rounded w-3/4 mt-1" />
      </div>
    </div>
  );
};

export default IndividualCardSkeleton;
