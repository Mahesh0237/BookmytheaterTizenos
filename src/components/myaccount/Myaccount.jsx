import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  IconHeadphones,
  IconQuestionMark,
  IconFileText,
  IconUser,
  IconFileDescription,
  IconShieldLock,
  IconLogin,
  IconBuildingBank,
  IconUsersGroup,
  IconDeviceAnalytics,
  IconTransactionRupee,
} from "@tabler/icons-react";
import AboutUs from "./Aboutus"; // Assuming AboutUs exists
import ContactUs from "./Contactus";
import FAQs from "./Faq";
import AllPlans from "./Allplans";
import TermsOfUse from "./Terms";
import PrivacyPolicy from "./Privacypolicy";
import Bankaccountdetails from "./Bankaccountdetails";
import Affiliate from "./Affiliate";
import Devicedetails from "./Devicedetails";
import Paymenthistory from "./Paymenthistory";
import { useNavigate, Routes, Route } from "react-router-dom";
import useDpadNavigation from '../../shared/useDpadNavigation';
import { useUserdetails } from "../zustand/useUserdetails";

const accountMenu = [
  { id: 1, label: "Contact Us", icon: "headset", component: "contact" },
  { id: 2, label: "FAQ's", icon: "faq", component: "faqs" },
  { id: 3, label: "All Plans", icon: "plans", component: "plans" },
  { id: 4, label: "About Us", icon: "about", component: "about" },
  { id: 5, label: "Terms of Use", icon: "terms", component: "terms" },
  { id: 6, label: "Privacy Policy", icon: "privacy", component: "privacy" },
  { id: 7, label: "Affiliate Program", icon: "affiliate", component: "affiliate" },
  { id: 8, label: "Bank Accounts", icon: "bank", component: "mybankaccounts" },
  { id: 9, label: "Device Details", icon: "device", component: "Devicedetails" },
  { id: 10, label: "Payment History", icon: "paymenthistory", component: "paymenthistory" },
  { id: 11, label: "Log Out", icon: "logout", component: "logout" },
];

// ✅ CircleButton Component
const CircleButton = ({ item, onClick, isFocused }) => {
  const renderIcon = (color) => {
    const iconClass = "cursor-pointer pointer-events-auto";
    switch (item.icon) {
      case "headset":
        return <IconHeadphones size={60} color={color} className={iconClass} />;
      case "faq":
        return <IconQuestionMark size={60} color={color} className={iconClass} />;
      case "plans":
        return <IconFileText size={60} color={color} className={iconClass} />;
      case "about":
        return <IconUser size={60} color={color} className={iconClass} />;
      case "terms":
        return <IconFileDescription size={60} color={color} className={iconClass} />;
      case "privacy":
        return <IconShieldLock size={60} color={color} className={iconClass} />;
      case "affiliate":
        return <IconUsersGroup size={60} color={color} className={iconClass} />;
      case "bank":
        return <IconBuildingBank size={60} color={color} className={iconClass} />;
      case "device":
        return <IconDeviceAnalytics size={60} color={color} className={iconClass} />;
      case "paymenthistory":
        return <IconTransactionRupee size={60} color={color} className={iconClass} />;
      case "logout":
        return <IconLogin size={60} color={color} className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <motion.button
      onClick={() => onClick(item)}
      whileHover={{ scale: 1.12 }}
      transition={{ duration: 0.25 }}
      className={`w-44 h-44 rounded-full flex flex-col items-center justify-center text-center shadow-lg cursor-pointer outline-none transition-all duration-200
        ${isFocused
          ? "scale-110 ring-4 ring-white bg-[#A12222]"
          : "bg-[#D9D0C4] hover:shadow-xl"
        }`
      }
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {renderIcon(isFocused ? "#fff" : "#1a1a1a")}
      <span
        className={`text-md font-bold cursor-pointer mt-3 px-2 ${isFocused ? "text-white" : "text-black"
          }`}
      >
        {item.label}
      </span>
    </motion.button>
  );
};

// ✅ Main MyAccount Component
const Myaccount = ({ isActive, onNavigate }) => {
  const { resetAuthdetails } = useUserdetails();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      localStorage.removeItem("user_info");
      localStorage.removeItem("access_token");
      resetAuthdetails();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleMenuClick = (item) => {
    if (item.component === "logout") {
      handleLogOut();
    } else if (item.component) {
      navigate(`/myaccount/${item.component}`);
    }
  };

  const { selectedIndex, containerRef } = useDpadNavigation({
    totalItems: accountMenu.length,
    columns: 8, // There are 5 items per row in the grid
    enabled: isActive,
    onEnter: (index) => {
      const selectedItem = accountMenu[index];
      if (selectedItem) {
        handleMenuClick(selectedItem);
      }
    },
    onDirectionChange: (key, handled) => {
      // If ArrowLeft is pressed on the first column, it's not handled internally.
      if (!handled) {
        // This will trigger for ArrowLeft on the first column, as it's unhandled by the hook.
        onNavigate(key); 
      }
    },
  });

  const renderMainScreen = () => (
    <div className="w-full flex flex-col min-h-screen text-white px-6 py-8">
      <h1 className="text-4xl font-bold mb-12">My Account</h1>

      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-row flex-wrap gap-12" ref={containerRef}>
          {accountMenu.map((item, index) => (
            <div key={item.id} className="flex justify-center">
              <CircleButton
                item={item}
                onClick={handleMenuClick}
                isFocused={isActive && selectedIndex === index}
              />
            </div>
          ))}
        </div>
      </div>

      <p className="text-md text-right mt-auto">
        Visit{" "}
        <a
          href="https://uat.bookmytheatre.com"
          className="text-orange-400 underline hover:text-orange-300 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://uat.bookmytheatre.com
        </a>{" "}
        for more information
      </p>
    </div>
  );

  return (
    <div className="flex-1 h-screen overflow-y-auto scrollbar-hide">
      <Routes>
        <Route path="/" element={renderMainScreen()} />
        <Route path="/about" element={<AboutUs onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
        <Route path="/contact" element={<ContactUs onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
        <Route path="/faqs" element={<FAQs onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
        <Route path="/plans" element={<AllPlans onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
        <Route path="/terms" element={<TermsOfUse onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
        <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
        <Route path="/affiliate" element={<Affiliate onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
        <Route path="/Devicedetails" element={<Devicedetails onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
        <Route path="/mybankaccounts" element={<Bankaccountdetails onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
        <Route path="/paymenthistory" element={<Paymenthistory onBack={() => navigate(-1)} onNavigate={onNavigate} isActive={isActive} />} />
      </Routes>
    </div>
  );
};

export default Myaccount;
