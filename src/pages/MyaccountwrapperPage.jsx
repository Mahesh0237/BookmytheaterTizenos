import React, { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar'
import Myaccount from '../components/myaccount/Myaccount'

const SECTIONS = {
  SIDEBAR: 'SIDEBAR',
  MYACCOUNT: 'MYACCOUNT',
};

const MyaccountWrapperPage = () => {
  const [activeSection, setActiveSection] = useState(SECTIONS.SIDEBAR);

  const handleNavigation = useCallback((key, fromSection) => {
    if (key === 'ArrowRight' && fromSection === SECTIONS.SIDEBAR) {
      setActiveSection(SECTIONS.MYACCOUNT);
    } else if (key === 'ArrowLeft' && fromSection === SECTIONS.MYACCOUNT) {
      // This is called when the Myaccount component can't navigate further left
      setActiveSection(SECTIONS.SIDEBAR);
    }
  }, []);

  return (
    <div className="flex flex-row min-h-screen bg-linear-to-b from-black to-[#5B0203]">
      <Sidebar isActive={activeSection === SECTIONS.SIDEBAR} onNavigate={(key) => handleNavigation(key, SECTIONS.SIDEBAR)} />

      <Myaccount isActive={activeSection === SECTIONS.MYACCOUNT} onNavigate={(key) => handleNavigation(key, SECTIONS.MYACCOUNT)} />
    </div>
  );
};

export default MyaccountWrapperPage;
