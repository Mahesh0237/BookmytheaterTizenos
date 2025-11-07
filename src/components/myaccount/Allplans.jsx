import React, { useEffect, useRef } from "react";

const Allplans = ({ onBack, onNavigate, isActive }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        if (onNavigate) {
          onNavigate("ArrowLeft");
        }
      } else if (e.key === "ArrowDown") {
        if (contentRef.current) {
          contentRef.current.scrollBy({ top: 100, behavior: "smooth" });
        }
      } else if (e.key === "ArrowUp") {
        if (contentRef.current) {
          contentRef.current.scrollBy({ top: -100, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onNavigate, isActive]);
  
  const plans = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "Access to limited content",
        "Standard streaming quality",
        "Basic support",
      ],
    },
    {
      name: "Premium",
      price: "$9.99/month",
      features: [
        "Access to all content",
        "HD streaming",
        "Priority support",
        "Offline viewing",
      ],
    },
    {
      name: "Creator",
      price: "Custom",
      features: [
        "All Premium features",
        "Revenue sharing",
        "Analytics dashboard",
        "Dedicated support",
      ],
    },
  ];

  return (
    <div ref={contentRef} className="w-full bg-custom-gradient text-white flex-1 h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex items-center px-6 py-8 border-b border-gray-700">
        <h1 className="text-3xl font-bold">All Plans</h1>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <h2 className="text-center text-3xl font-bold mb-10">
          Choose Your Plan
        </h2>

        <div className="grid grid-cols-1 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all 
                 flex flex-col h-full" // Important: flex + h-full
            >
              <div className="flex-1"> {/* This grows to push button down */}
                <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                <p className="text-[#D9D0C4] text-xl font-semibold mb-5">
                  {plan.price}
                </p>

                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-gray-200 text-base leading-relaxed">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button is now aligned at the bottom of each card */}
              <button className="w-full bg-[#7a1717] py-3 rounded-lg font-bold text-white hover:bg-[#a31b1b] transition mt-auto">
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Allplans;
