import React from "react";
import SectionHeading from "../../shared/Sectionheading"

const features = [
  {
    icon: "🚀",
    title: "Stream. Share. Earn. Power in your hands",
    desc: "With Book My Theatre, share a movie and earn 30% of the net revenue when someone watches via your link. Our patented model ensures you get paid quarterly with a 10% bonus every March 31st.",
  },
  {
    icon: "🌍",
    title: "Fair prices, Everywhere. Cinema Without Borders.",
    desc: "Our gen-based pricing ensures that whether you’re in New York or Nairobi, watching world-class films is affordable and accessible.",
  },
  {
    icon: "💸",
    title: "Your Wallet is Legit. Instant, Clear, Secure.",
    desc: "Track every rupee in real-time through our blockchain-secured wallet. Transparent. Secure. Always in control.",
  },
  {
    icon: "🎬",
    title: "Back Creators. Shape Tomorrow",
    desc: "Each ticket you help move is direct support to those making cinema happen. This is more than streaming—it’s a creator-powered revolution.",
  },
];

const FeatureGrid = () => {
  return (
    <div className=" px-6 ml-2">
      <SectionHeading title="Why Book My Theatre?" />

      <div className="flex flex-wrap justify-between mt-6 gap-4">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center bg-[#eee6e6] rounded-2xl p-5 w-[23%] min-w-[250px]"
          >
            <div className="text-2xl mb-2 text-[#772728]">{f.icon}</div>
            <h3 className="text-black font-bold text-center mb-1">
              {f.title}
            </h3>
            <p className="text-black/70 text-sm text-justify">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureGrid;
