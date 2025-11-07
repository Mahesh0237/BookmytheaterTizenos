import React, { useEffect, useState, useRef } from 'react';
import bankLogo from '../../../public/assets/banklogo.png';
import { useUserdetails } from '../zustand/useUserdetails';
import Userapi from '../api/Userapi'

const BankAccountDetails = ({ onNavigate, isActive }) => {
  const contentRef = useRef(null);
  const { userInfo } = useUserdetails();
  const [isLoading, setIsLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 6;

  const user_id = userInfo?.id || null;

  async function getBankAccounts(newPage, newLimit, useruid) {
    setIsLoading(true);
    try {
      const response = await Userapi.get('fetchuserbankaccounts',
        {
          params: { page: newPage, limit: newLimit, user_id: user_id },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;
      if (data.status === 'error') {
        setErrorMessage(data.message || 'Error fetching data');
        return;
      }
      setBankAccounts(data.userbankaccounts || []);
      setTotalPages(data.totalpages || 1);
      setErrorMessage('');

    } catch (error) {
      setErrorMessage(error?.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        if (onNavigate) {
          onNavigate("ArrowLeft");
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
  }, [isActive, onNavigate]);

  useEffect(() => {
    getBankAccounts(page, limit, user_id);
  }, [page]);

  return (
    <div ref={contentRef} className="w-full h-screen bg-linear-to-b from-black to-[#5B0203] px-6 py-8 text-white overflow-y-auto scrollbar-hide">
      {/* === Header === */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <h1 className="text-[#C02628] text-3xl font-bold mb-2 md:mb-0">
          Bank Accounts
        </h1>
        <p className="text-sm md:text-right leading-6 max-w-md">
          Visit{' '}
          <a
            href="https://uat.bookmytheatre.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#d94b4b] underline"
          >
            https://uat.bookmytheatre.com
          </a>{' '}
          for more information
        </p>
      </div>

      {/* === Error Message === */}
      {errorMessage && (
        <p className="text-red-500 text-center mb-4">{errorMessage}</p>
      )}

      {/* === Content Area === */}
      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : bankAccounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankAccounts.map((item, index) => (
            <div
              key={index}
              className="relative bg-linear-to-br from-[#B73A3A] to-[#8B2B2B] rounded-xl p-6 h-56 shadow-lg shadow-black/40 overflow-hidden"
            >
              {/* Watermark Logo */}
              <img
                src={bankLogo}
                alt="Bank Logo"
                className="absolute right-3 bottom-3 w-20 h-20 opacity-30"
              />

              {/* Bank Info */}
              <div>
                <h2 className="text-white text-xl font-bold mb-1 truncate">
                  {item.label || item.bank_name || 'Bank Name'}
                </h2>
                <p className="text-sm opacity-80 mb-1">Account Number</p>
                <p className="text-lg font-semibold tracking-wider mb-2">
                  {item.account_number || 'XXXXXXXXXX'}
                </p>

                {item.ifsc_code && (
                  <p className="text-sm opacity-90">IFSC: {item.ifsc_code}</p>
                )}
                {item.routing_number && (
                  <p className="text-sm opacity-90">
                    Routing: {item.routing_number}
                  </p>
                )}
                {item.swift_code && (
                  <p className="text-sm opacity-90">SWIFT: {item.swift_code}</p>
                )}
                {item.iban && (
                  <p className="text-sm opacity-90">IBAN: {item.iban}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center mt-10 text-lg">No bank accounts found.</p>
      )}

      {/* === Pagination === */}
      {totalPages > 1 && !isLoading && (
        <div className="flex justify-center items-center gap-6 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className={`px-6 py-2 rounded-full ${page <= 1
              ? 'bg-gray-600 opacity-50 cursor-not-allowed'
              : 'bg-[#C02628] hover:bg-[#a11e1e]'
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
            className={`px-6 py-2 rounded-full ${page >= totalPages
              ? 'bg-gray-600 opacity-50 cursor-not-allowed'
              : 'bg-[#C02628] hover:bg-[#a11e1e]'
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BankAccountDetails;

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
      <div className="space-y-3">
        {/* Bank Name */}
        <div className="h-6 bg-gray-600 rounded w-3/4"></div>
        {/* "Account Number" label */}
        <div className="h-4 bg-gray-600 rounded w-1/3"></div>
        {/* Account Number */}
        <div className="h-5 bg-gray-500 rounded w-1/2"></div>
        {/* Spacer */}
        <div className="pt-2"></div>
        {/* IFSC/Routing/etc. */}
        <div className="h-4 bg-gray-600 rounded w-2/5"></div>
      </div>
    </div>
  );
};