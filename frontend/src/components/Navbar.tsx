import React from 'react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  return (
    <header className="site-header">
      <a
        href="#home"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('home');
        }}
        className="brand-link"
      >
        <div className="brand-mark">U</div>
        <div className="brand-text">
          <span className="brand-title">UNTOLD LETTERBOX</span>
          <span className="brand-subtitle">ANONYMOUS OPEN SPACE</span>
        </div>
      </a>

      <nav className="nav-links">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
        >
          About
        </a>
        <a
          href="#guidelines"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('guidelines');
          }}
          className={`nav-link ${currentTab === 'guidelines' ? 'active' : ''}`}
        >
          Guidelines
        </a>
        <a
          href="#write"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('write');
          }}
          className={`nav-link ${currentTab === 'write' ? 'active' : ''}`}
        >
          Write
        </a>
      </nav>
    </header>
  );
};
