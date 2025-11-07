import React from "react";
import SectionHeading from "../../shared/Sectionheading"

const faqs = [
  { question: "What is Book My Theatre?", answer: "Book My Theatre (BMT) is a digital streaming and movie-sharing platform designed for global audiences and creators." },
  { question: "How can I earn money on Book My Theatre?", answer: "You can earn by sharing movies using your referral link. You get a commission when someone watches through your link." },
  { question: "Is Book My Theatre free to use?", answer: "Yes, registration is free. Some premium movies require a one-time payment or rent." },
  { question: "Do I need a subscription to watch movies?", answer: "No monthly subscription — you only pay for what you watch." },
  { question: "How do filmmakers earn from Book My Theatre?", answer: "Filmmakers receive fair revenue every time their movie is watched on the platform." },
  { question: "Can I upload my own movie?", answer: "Yes, verified creators can upload films through the BMT Creator Portal." },
  { question: "What types of movies are available?", answer: "BMT offers regional, independent, short films, and global cinema across genres." },
  { question: "Is Book My Theatre available worldwide?", answer: "Yes, it's a global platform with localized recommendations and payments." },
  { question: "Does BMT support multiple languages?", answer: "Yes, users can browse and stream content in multiple languages." },
  { question: "How is BMT different from other OTT platforms?", answer: "BMT combines streaming, affiliate earnings, and fair creator payouts." },
  { question: "Is my payment information secure?", answer: "Yes, all payments are processed via secure, encrypted gateways." },
  { question: "Can I watch offline?", answer: "Currently, offline downloads are not supported but streaming is seamless." },
  { question: "How do I become an affiliate?", answer: "Sign up, verify, and start sharing referral links to earn instantly." },
  { question: "Can I watch on my Smart TV?", answer: "Yes! BMT supports Android TV, Firestick, and web browsers." },
  { question: "Does BMT have subtitles?", answer: "Yes, most titles have subtitles, and more languages are coming soon." },
  { question: "Is there an age restriction on content?", answer: "Some content is restricted by age. Parental guidance is advised." },
  { question: "Can I share movies with my friends?", answer: "Yes! Share your link and earn rewards for every successful watch." },
  { question: "How do I contact support?", answer: "You can email support@bookmytheatre.com or use the Help section in-app." },
  { question: "Can I request a refund?", answer: "Refunds are handled on a case-by-case basis per the refund policy." },
  { question: "Does Book My Theatre work on all devices?", answer: "Yes, you can use BMT on mobile, web, and TV platforms." },
  { question: "Is Book My Theatre legal and safe?", answer: "Absolutely. BMT is fully licensed, secure, and respects creator rights." },
];

const FAQSection = () => {
  const mid = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, mid);
  const rightColumn = faqs.slice(mid);

  return (
    <div className="bg-[#712728] py-10 px-6 ml-2">
      <SectionHeading title="Frequently Asked Questions" />

      <div className="flex flex-wrap justify-between mt-8 gap-4">
        {/* Left Column */}
        <div className="w-full md:w-[48%]">
          {leftColumn.map((faq, idx) => (
            <div
              key={idx}
              className="bg-black border border-[#B54445] rounded-2xl p-4 mb-4 flex"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center mr-3">
                <p className="text-[#FFD700]/70 font-bold">{idx + 1}</p>
              </div>
              <div>
                <p className="text-[#FFD700]/70 text-base font-semibold mb-2">
                  {faq.question}
                </p>
                <p className="text-white text-sm leading-5">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="w-full md:w-[48%]">
          {rightColumn.map((faq, idx) => (
            <div
              key={idx + mid}
              className="bg-black border border-[#B54445] rounded-2xl p-4 mb-4 flex"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center mr-3">
                <p className="text-[#FFD700]/70 font-bold">{idx + mid + 1}</p>
              </div>
              <div>
                <p className="text-[#FFD700]/70 text-base font-semibold mb-2">
                  {faq.question}
                </p>
                <p className="text-white text-sm leading-5">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
