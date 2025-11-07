import React, { useEffect, useRef } from 'react';

const Affiliate = ({ onNavigate, isActive }) => {
  const contentRef = useRef(null);

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

  const cards = [
    {
      title: 'How It Works?',
      desc: `Instant Activation: Purchase a film and instantly get affiliate rights. No extra steps.
Get Your Link: Share your referral link from your dashboard.
Earn As You Share: Earn 30% of net revenue from each successful referral.`,
    },
    {
      title: 'Transparent Earnings',
      desc: `Payouts Every Quarter: 90% of earnings paid quarterly to your bank account.
Annual Bonus: 10% of each quarter’s earnings paid out fully on March 31st each year.`,
    },
    {
      title: 'Real-Time Dashboard Access',
      desc: `Viewers / Distributors: Track purchases, earnings, and referral stats.
Filmmakers: Monitor ticket sales, language performance, and impact.`,
    },
    {
      title: 'Built for Global Impact',
      desc: `Multilingual film versions
Available worldwide
Scalable, secure real-time infrastructure`,
    },
  ];

  return (
    <div ref={contentRef} className="w-full h-screen flex flex-col bg-linear-to-b from-black to-[#5B0203] text-white overflow-y-auto scrollbar-hide">
      <div className="p-6 pb-8">
        {/* === Header === */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex flex-row items-center gap-3">
            <h1 className="text-3xl font-bold text-white mb-2 sm:mb-0">
              Affiliate Program
            </h1>
          </div>
          <p className="text-sm text-right">
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

        {/* === Section 1 === */}
        <h2 className="text-lg font-bold mt-6 mb-2">Share & Earn</h2>
        <p className="text-sm text-white/90 leading-6 mb-6 whitespace-pre-line">
          The Book My Theatre Way
          {'\n'}Watch. Share. Earn.
          {'\n'}No Signups. No Barriers.
          {'\n'}At Book My Theatre, the moment you watch a film — you become
          more than just a viewer.
          {'\n'}You become a distributor.
        </p>

        {/* === Cards === */}
        <div className="space-y-4">
          {cards.map((item, i) => (
            <div
              key={i}
              className="bg-[#B73A3A] rounded-md p-4 shadow-md transition-transform hover:scale-[1.01]"
            >
              <h3 className="font-bold text-sm mb-2">{item.title}</h3>
              <p className="text-xs leading-6 whitespace-pre-line">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Affiliate;
