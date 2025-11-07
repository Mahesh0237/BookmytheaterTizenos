import React from "react";
import { Play } from "lucide-react"; // lucide-react for web icons
import { useNavigate } from "react-router-dom";

const IndividualMovieCard = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#2f2f2f] rounded-lg flex flex-col gap-2 h-76 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Movie Poster */}
      <div
        onClick={() => navigate(`/movie/${movie.uuid}`)}
        className="cursor-pointer"
      >
        <img
          src={movie.main_banner || "https://via.placeholder.com/300x400"}
          alt={movie.title}
          className="w-full h-32 object-cover rounded-t-lg"
        />
      </div>

      {/* Movie Info */}
      <div className="p-4 flex flex-col gap-2 text-white">
        <h3
          className="text-sm font-medium cursor-pointer hover:text-yellow-400 transition-colors"
          onClick={() => navigate(`/movie/${movie.uuid}`)}
        >
          {movie.title.length > 15
            ? `${movie.title.slice(0, 10)}...`
            : movie.title}
        </h3>

        <p className="text-white/90 text-xs font-poppins">
          {new Date(movie.release_date).getFullYear()} •{" "}
          <span className="text-white font-light">
            {movie?.duration && movie.duration.includes(":")
              ? `${parseInt(movie.duration.split(":")[0], 10)}h ${parseInt(
                movie.duration.split(":")[1],
                10
              )}m`
              : "---"}
          </span>
          {movie?.languages?.length > 0 && (
            <>
              {" • "}
              {movie.languages.join(", ")}
            </>
          )}
        </p>

        <p className="text-white/80 text-xs font-poppins line-clamp-3">
          {movie.short_description || "No description available."}
        </p>
      </div>

      {/* Play Button */}
      <div className="pb-3 px-2 mt-auto">
        <button
          onClick={() => navigate(`/movie/${movie.uuid}`)}
          className="w-full h-10 bg-gradient-to-br from-[#6a6a6a] to-[#5b5b5b] rounded-lg flex items-center justify-center gap-2 hover:from-[#7a7a7a] hover:to-[#646464] transition-all duration-200"
        >
          <span className="text-white text-sm font-semibold">Play Now</span>
          <Play size={16} color="white" />
        </button>
      </div>
    </div>
  );
};

export default IndividualMovieCard;
