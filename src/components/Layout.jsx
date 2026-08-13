import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bell, ShieldAlert, Calendar, Menu, X, Info, Moon, Sun, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import acadLogo from '../assets/acad_logo.webp';
import DateTimeWidget from './DateTimeWidget';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const navItems = [
    { path: '/', label: 'Overview', icon: <Home size={20} /> },
    { path: '/announcements', label: 'Announcements', icon: <Bell size={20} /> },
    { path: '/deficiencies', label: 'Deficiencies', icon: <ShieldAlert size={20} /> },
    { path: '/schedule', label: 'HAG CLASS SCHED', icon: <Calendar size={20} /> },
    { path: '/grades', label: 'Grade Reports', icon: <FileText size={20} /> },
    { path: '/about', label: 'About', icon: <Info size={20} /> }
  ];

  return (
    <div className="layout-wrapper">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="brand flex-center">
          <img src={acadLogo} alt="Academic Council Logo" className="brand-icon-img" />
          <span className="brand-text">Academic Council</span>
        </div>
        <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header hide-mobile">
          <div className="flex-between brand-header" style={{ width: '100%', alignItems: 'center' }}>
            <div className="brand flex-center">
              <img src={acadLogo} alt="Academic Council Logo" className="brand-icon-img" />
              <div className="brand-text-container" style={{ marginLeft: '0.75rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Acad Council</h2>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="text-muted" style={{ fontSize: '0.90rem', fontWeight: 500 }}>CCAFP</span>
                  <p style={{ 
                    fontSize: '0.65rem', 
                    color: 'var(--accent-primary)', 
                    fontStyle: 'italic', 
                    marginTop: '0.15rem', 
                    letterSpacing: '0.3px',
                    opacity: 0.9
                  }}>
                    "Faster, better, stronger CCAFP"
                  </p>
                </div>
              </div>
            </div>
            <button className="desktop-toggle" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)' }} onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <DateTimeWidget isCollapsed={isCollapsed} />

        <div className="sidebar-footer">
          <button
            className="nav-link"
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
