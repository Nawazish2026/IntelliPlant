import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-layout">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <div className="global-page-header">
          Bharat Petroleum, Jamnagar
        </div>
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-2)',
            color: 'var(--text-0)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font)',
            fontSize: '13px',
            boxShadow: 'var(--shadow-md)',
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg-2)' } },
          error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--bg-2)' } },
        }}
      />
    </div>
  );
}
