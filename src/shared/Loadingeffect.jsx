import React from "react";

const Loadingeffect = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]">
      <div className="flex flex-col items-center justify-center bg-white p-10 gap-y-3 rounded-lg w-[400px]">
        <div className="w-10 h-10 border-4 border-[#621012] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-semibold text-black">Please Wait....</p>
      </div>
    </div>
  );
};

export default Loadingeffect;
