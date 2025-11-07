import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo_white from '../../public/logo_white.png';
import {
  IconCategory,
  IconHome,
  IconSearch,
  IconUser,
} from '@tabler/icons-react';

const SidebarItem = React.forwardRef(({ name, to, routeNames, isFocused, isLogged, forceRedirect }, ref) => {
  const location = useLocation();
  
  // Check if the current path starts with the item's 'to' link.
  // This ensures parent routes like '/myaccount' stay active for child routes like '/myaccount/about'.
  // A special case for '/' to only match the exact home path.
  const isSelected = to === '/' 
    ? location.pathname === '/' 
    : location.pathname.startsWith(to);

  // If a forceRedirect is active and the user is not logged in, override the destination.
  const destination = (forceRedirect && !isLogged) ? forceRedirect : to;


  const renderIcon = color => {
    const size = 32; // Standard size for web icons
    if (name === 'Search') return <IconSearch size={size} color={color} />;
    if (name === 'Home') return <IconHome size={size} color={color} />;
    if (name === 'Categories') return <IconCategory size={size} color={color} />;
    return <IconUser size={size} color={color} />;
  };

  // Icon color changes based on selection or focus
  const iconColor = isSelected || isFocused ? '#c02628' : 'white';

  return (
    <Link to={destination} ref={ref} className="w-full flex justify-center p-1 group outline-none">
      <div
        className={`p-4 rounded-lg transition-all duration-200 ease-in-out 
          ${isSelected || isFocused
            ? 'bg-white/20 scale-110'
            : 'group-hover:bg-white/10 group-hover:scale-105 group-focus:bg-white/20 group-focus:scale-110'
          }`}
      >
        {renderIcon(iconColor)}
      </div>
    </Link>
  );
});

const Sidebar = ({ isActive, onNavigate, isLogged, forceRedirect }) => {
  const location = useLocation();
  const navItems = [
    {
      name: 'Search',
      to: '/searchmovie',
      routeNames: ['searchmovie'],
    },
    {
      name: 'Home',
      to: '/browse',
      routeNames: ['browse', 'home'], 
    },
    {
      name: 'Categories',
      to: '/categories',
      routeNames: ['categories'],
    },
    {
      name: 'Profile',
      to: '/myaccount',
      routeNames: ['myaccount'],
    },
  ];

  const getInitialIndex = () => {
    const currentPath = location.pathname.replace('/', '');
    // Find the best match. For '/myaccount/about', it should match '/myaccount'.
    const activeIndex = navItems.findIndex(item => location.pathname.startsWith(item.to));
    // // Fallback for the root path which might not be covered by startsWith logic if `to` is `/browse`
    // if (location.pathname === '/') {
    //   return navItems.findIndex(item => item.to === '/browse'); // Or whatever your home route is
    // }
    return activeIndex !== -1 ? activeIndex : 1; // Default to 'Home' if no match
  };

  const [focusedIndex, setFocusedIndex] = useState(getInitialIndex);
  const itemRefs = useRef([]);

  // Set initial focus based on the current route
  useEffect(() => {
    if (isActive) {
      const initialIndex = getInitialIndex();
      setFocusedIndex(initialIndex);
      itemRefs.current[initialIndex]?.focus();
    }
  }, [isActive, location.pathname]); // Re-run when route changes or when it becomes active

  // Handle D-pad navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isActive) return; // Only navigate if the sidebar is the active section

      if (e.key === 'ArrowDown') {
        const nextIndex = (focusedIndex + 1) % navItems.length;
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        const nextIndex = (focusedIndex - 1 + navItems.length) % navItems.length;
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
      } else if (e.key === 'ArrowRight') {
        // If onNavigate is provided, use it to signal a move to the main content
        if (onNavigate) {
          onNavigate(e.key);
        }
      } else if (e.key === 'Enter') {
        // Programmatically click the focused link
        itemRefs.current[focusedIndex]?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, focusedIndex, navItems.length, onNavigate]);

  return (
    <div className="w-32 bg-transparent flex flex-col items-center pt-5">
      <img
        src={logo_white}
        alt="Logo"
        className="w-20 h-14 mx-auto mb-10 mt-3"
      />

      <div className="flex flex-col items-center space-y-4 pb-8">
        {navItems.map((item, index) => {
          return (
            <SidebarItem
              ref={el => itemRefs.current[index] = el}
              key={index}
              name={item.name}
              to={item.to}
              routeNames={item.routeNames}
              isFocused={isActive && focusedIndex === index}
              isLogged={isLogged}
              forceRedirect={forceRedirect}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
