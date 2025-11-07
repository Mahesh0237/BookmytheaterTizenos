import React, { useEffect, useRef } from "react";

const Aboutus = ({ onBack, onNavigate, isActive }) => {
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

  const highlights = [
    {
      title: "For Creators, By a Creator",
      desc: "Founded by an award-winning independent filmmaker who knows the struggle of being unheard.",
    },
    {
      title: "Built-in Affiliate Model",
      desc: "Every viewer becomes a distributor the moment they purchase a ticket.",
    },
    {
      title: "Smart, Transparent, and Fair",
      desc: "Revenue shares, real-time wallets, no subscriptions, and region-based pricing.",
    },
    {
      title: "Multi-Language, Multi-Talent, One Vision",
      desc: "We celebrate cultural diversity across regions and industries under a single platform.",
    },
  ];

  return (
    <div
      ref={contentRef}
      className="h-screen w-full bg-custom-gradient text-white overflow-y-auto flex-1 scrollbar-hide">
      <div className="px-6 py-8">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <h1 className="!text-3xl font-bold text-red-500 mb-2 sm:mb-0">
            About Us
          </h1>
          <p className="text-xs sm:text-sm text-right">
            Visit{" "}
            <a
              href="https://uat.bookmytheatre.com"
              target="_blank"
              rel="noreferrer"
              className="text-red-500 underline"
            >
              https://uat.bookmytheatre.com
            </a>{" "}
            for more information
          </p>
        </div>

        {/* Data Collection */}
        <h2 className="text-lg font-semibold mb-1">1. Data Collection</h2>
        <p className="opacity-90 mb-4">
          More Than a Platform. A Global Stage for Stories That Matter.
        </p>

        <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
        <p className="mb-6 leading-relaxed">
          To empower independent filmmakers, elevate global cinema, and give
          every user a voice and a stake in the stories they love.
        </p>

        <h4 className="text-center font-semibold text-base uppercase mb-4">
          What Makes Us Different
        </h4>

        {/* Highlights Cards */}
        {highlights.map((item, i) => (
          <div
            key={i}
            className="bg-red-700/80 rounded-md p-4 mb-4 transition hover:bg-red-700"
          >
            <h5 className="font-semibold text-sm mb-2">{item.title}</h5>
            <p className="text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}

        {/* Divider */}
        <div className="h-px bg-white opacity-30 my-10" />

        {/* Why It Matters */}
        <h2 className="text-2xl font-bold text-center mb-6">Why It Matters</h2>

        <p className="text-lg leading-7 mb-5 text-center">
          We're not here to compete with the giants. <br />
          We're here to change the rules.
        </p>

        <p className="text-lg leading-7 mb-5 text-center">
          Because talent isn't exclusive. <br />
          Opportunity shouldn't be either.
        </p>

        <p className="italic opacity-90 text-center text-base mb-10">
          This is for the dreamers who edit in silence, the writers who rewrite
          until dawn, and the filmmakers who fight for every frame.
        </p>

        {/* Divider */}
        <div className="h-px bg-white opacity-30 my-10" />

        {/* Founder Quote */}
        <h3 className="text-lg font-bold mb-4">From the Founder</h3>

        <p className="text-center opacity-90 leading-7 mb-6">
          "I didn't create Book My Theatre because I had a plan. I created it
          because I had no choice. I realized how broken the system is for real
          creators. This platform is for everyone who believes that stories are
          not made in studios — they're made in hearts.
          <br />
          <br />
          I'm not asking you to believe in me. I'm asking you to believe in the
          power of your own story."
        </p>

        <p className="text-center font-semibold opacity-90">
          — Saga Reddy Thumma <br /> Founder & CEO
        </p>
      </div>
    </div>
  );
};

export default Aboutus;
