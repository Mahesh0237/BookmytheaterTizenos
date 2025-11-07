import React, { useEffect, useState, useRef } from "react";
import { useUserdetails } from "../zustand/useUserdetails";
import paymentLogo from "../../../public/assets/paymenthistory.png";
import Paymentapi from "../api/Paymentapi";

const PaymentHistory = ({ onNavigate, isActive }) => {
  const contentRef = useRef(null);
  const { userInfo } = useUserdetails();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentsData, setPaymentsData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [focusedButtonIndex, setFocusedButtonIndex] = useState(null); // 0: Prev, 1: Next
  const limit = 6;

  const user_uid = userInfo?.uuid || null;

  async function getAllPayments(newPage, newLimit, useruid) {
    setIsLoading(true);
    try {
      const response = await Paymentapi.get("getallpayments", {
        params: { page: newPage, limit: newLimit, user_uid: useruid },
      });

      const data = response.data;
      if (data.status === "error") {
        setErrorMessage(data.message || "Error fetching payments");
        return;
      }

      setPaymentsData(data.paymentdata || []);
      setTotalPages(data.totalpages || 1);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isActive) {
      setFocusedButtonIndex(null); // Reset focus when component is not active
      return;
    }

    // Set initial focus on the 'Prev' button if pagination is visible
    if (totalPages > 1 && focusedButtonIndex === null) {
      setFocusedButtonIndex(0);
    }

    const handleKeyDown = (e) => {
      e.preventDefault(); // Prevent event from bubbling up

      if (e.key === "ArrowLeft") {
        if (focusedButtonIndex === 1) { // If 'Next' is focused, move to 'Prev'
          setFocusedButtonIndex(0);
        } else { // If 'Prev' is focused (or nothing), navigate to sidebar
          onNavigate("ArrowLeft");
        }
      } else if (e.key === "ArrowRight") {
        if (focusedButtonIndex === 0 && page < totalPages) { // If 'Prev' is focused, move to 'Next'
          setFocusedButtonIndex(1);
        }
      } else if (e.key === "Enter") {
        if (focusedButtonIndex === 0 && page > 1) {
          setPage((p) => Math.max(p - 1, 1));
        } else if (focusedButtonIndex === 1 && page < totalPages) {
          setPage((p) => Math.min(p + 1, totalPages));
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
  }, [isActive, onNavigate, focusedButtonIndex, page, totalPages]);

  useEffect(() => {
    getAllPayments(page, limit, user_uid);
  }, [page]);

  return (
    <div ref={contentRef} className="w-full h-screen -to-b from-black to-[#5B0203] text-white px-6 py-8 overflow-y-auto scrollbar-hide">
      {/* === Header === */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <h1 className="text-[#C02628] text-3xl font-bold mb-2 md:mb-0">
          Payment History
        </h1>
        <p className="text-sm md:text-right leading-6 max-w-md">
          Visit{" "}
          <a
            href="https://uat.bookmytheatre.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#d94b4b] underline"
          >
            https://uat.bookmytheatre.com
          </a>{" "}
          for more information
        </p>
      </div>

      {/* === Error Message === */}
      {errorMessage && (
        <p className="text-red-500 text-center mb-4">{errorMessage}</p>
      )}

      {/* === Loading Skeleton === */}
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : paymentsData && paymentsData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentsData.map((item, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden bg-linear-to-b from-[#282828] to-[#C02628] p-6 h-56 shadow-lg shadow-black/40"
            >
              {/* Watermark Logo */}
              <img
                src={paymentLogo}
                alt="Payment Logo"
                className="absolute right-3 bottom-3 w-20 h-20 opacity-30"
              />

              {/* Movie Details */}
              <div>
                <h2 className="text-white text-xl font-bold mb-1 truncate">
                  {item.movie_details?.title || "N/A"}
                </h2>
                <p className="text-white text-sm opacity-80 mb-1">
                  {item.payment_ref_uid}
                </p>
                <p className="text-white text-base mb-3">
                  Date:{" "}
                  {new Date(item.payment_date_time).toLocaleString("en-IN")}
                </p>

                {/* Status and Amount */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white px-2 py-1 rounded-md">
                    <span className="h-2 w-2 rounded-full bg-[#0CA201] mr-2"></span>
                    <p className="text-[#0CA201] text-sm font-semibold">
                      {item.payment_status}
                    </p>
                  </div>
                  <p className="text-[#36FE27] text-lg font-bold">
                    {item.currency_symbol || "₹"}
                    {item.amount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center mt-10 text-lg">No payments found.</p>
      )}

      {/* === Pagination === */}
      {totalPages > 1 && !isLoading && (
        <div className="flex justify-center items-center gap-6 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className={`px-6 py-2 rounded-full transition-all duration-200 ${page <= 1
              ? "bg-gray-600 opacity-50 cursor-not-allowed"
              : `bg-[#C02628] hover:bg-[#a11e1e] ${
                  isActive && focusedButtonIndex === 0 ? "scale-110 ring-4 ring-white" : ""
                }`
              }`}
          >
            Prev
          </button>

          <p className="text-lg">
            Page {page} of {totalPages}
          </p>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className={`px-6 py-2 rounded-full transition-all duration-200 ${page >= totalPages
              ? "bg-gray-600 opacity-50 cursor-not-allowed"
              : `bg-[#C02628] hover:bg-[#a11e1e] ${
                  isActive && focusedButtonIndex === 1 ? "scale-110 ring-4 ring-white" : ""
                }`
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

/* === Skeleton Components === */
const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="relative rounded-xl bg-[#282828] p-6 h-56 shadow-lg shadow-black/40 animate-pulse">
      <div className="space-y-4">
        {/* Title */}
        <div className="h-6 bg-gray-600 rounded w-3/4"></div>
        {/* Ref ID */}
        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        {/* Date */}
        <div className="h-4 bg-gray-600 rounded w-5/6"></div>
        {/* Status and Amount */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-8 bg-gray-500 rounded-md w-24"></div>
          <div className="h-7 bg-gray-500 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};
