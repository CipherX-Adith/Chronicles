import React from 'react';

interface FooterProps {
  onNavigateToAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          UNTOLD LETTERBOX · NO ACCOUNTS · NO PROFILES · 100% ANONYMOUS
        </div>
        <div className="footer-right">
          <span
            onClick={onNavigateToAdmin}
            style={{
              cursor: onNavigateToAdmin ? 'pointer' : 'default',
            }}
            title={onNavigateToAdmin ? 'Editorial Access' : undefined}
          >
            MAR ATHANASIUS COLLEGE OF ENGINEERING →
          </span>
        </div>
      </div>
    </footer>
  );
};
