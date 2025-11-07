import React from "react";
import { AlertCircle } from "lucide-react";

const Errorpanelcardview = ({ errorMessages, retry }) => {
  if (!errorMessages) return null;

  return (
    <div className="bg-red-500/10 border border-red-400 rounded-lg p-4 mt-4">
      <div className="flex items-center">
        <AlertCircle size={22} color="#FF4444" />
        <p className="ml-2 text-red-400 font-semibold flex-1">
          {typeof errorMessages === "string"
            ? errorMessages
            : "Something went wrong. Please try again later."}
        </p>
      </div>

      {retry && (
        <button
          onClick={retry}
          className="mt-3 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-white font-medium self-end"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default Errorpanelcardview;
