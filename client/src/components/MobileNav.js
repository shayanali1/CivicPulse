import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function MobileNav() {
  const location = useLocation();
  const { isDark } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const citizenLinks = [
    { path: '/map', icon: 'map', label: 'Map' },
    { path: '/report', icon: 'add_location', label: 'Report' },
    { path: '/dashboard', icon: 'dashboard', label: 'Activity' },
  ];

  const officialLinks = [
    { path: '/map', icon: 'map', label: 'Map' },
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  ];

  const links = user.role === 'official' ? officialLinks : citizenLinks;

  return (
    <div className={`${isDark ? 'dark' : ''}`}>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0f1729] border-t border-gray-200 dark:border-[#424754] md:hidden">
        <div className="flex items-center justify-around px-4 py-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive(link.path)
                  ? 'text-blue-500'
                  : 'text-gray-500 dark:text-[#c2c6d6]'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive(link.path) ? 'text-blue-500' : ''}`}>
                {link.icon}
              </span>
              <span className="text-xs font-medium">{link.label}</span>
              {isActive(link.path) && (
                <div className="h-1 w-4 bg-blue-500 rounded-full" />
              )}
            </Link>
          ))}

          {/* Profile */}
          <div className="flex flex-col items-center gap-1 px-4 py-2">
            <div className="h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-[#c2c6d6]">Profile</span>
          </div>
        </div>
      </nav>
    </div>
  );
}