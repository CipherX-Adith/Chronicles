import React from 'react';

interface FooterProps {
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <span>UNTOLD LETTERBOX</span>
          <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
          <span style={{ color: 'var(--muted-light)' }}>NO ACCOUNTS · NO PROFILES · 100% ANONYMOUS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>UNTOLD LETTERBOX ARCHIVE</span>
          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              aria-label="Admin Portal"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted-light)',
                cursor: 'pointer',
                fontSize: '11px',
                opacity: 0.35,
                transition: 'opacity 0.2s',
                padding: '2px 4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.35')}
              title="Editorial"
            >
              ✦
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
