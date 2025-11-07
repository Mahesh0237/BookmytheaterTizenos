import React, { useEffect, useRef } from "react";

const Faq = ({ onBack, onNavigate, isActive }) => {
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

  const faqs = [
    {
      question: "How do I create an account?",
      answer:
        "Click on the Sign Up button and follow the registration process.",
    },
    {
      question: "How does the affiliate model work?",
      answer:
        "Every viewer becomes a distributor when they purchase a ticket and can earn commissions.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept credit cards, debit cards, and various digital payment methods.",
    },
    {
      question: "Can I watch content offline?",
      answer:
        "Currently, we only support online streaming for security reasons.",
    },
  ];

  return (
    <div ref={contentRef} className="w-full h-screen bg-custom-gradient text-white overflow-y-auto">
      <div className="flex items-center px-6 py-8 border-b border-gray-700">
        <h1 className="!text-3xl font-bold text-[#d94b4b]">Frequently Asked Questions</h1>
      </div>

      <div className="px-6 py-8">
        {faqs.map((faq, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              Q: {faq.question}
            </h3>
            <p className="text-gray-300 text-base leading-relaxed">
              A: {faq.answer}
            </p>
            {index < faqs.length - 1 && (
              <div className="h-px bg-gray-700 mt-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
