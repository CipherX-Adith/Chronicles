import React from 'react';

interface SuccessProps {
  reference: string;
  onWriteAnother: () => void;
  onGoHome: () => void;
}

export const Success: React.FC<SuccessProps> = ({
  reference,
  onWriteAnother,
  onGoHome,
}) => {
  return (
    <div className="container">
      <div className="success-card">
        <div className="success-stamp">✦</div>

        <h1 className="success-title">It's been left here.</h1>

        <p className="success-desc">
          Your message has been received anonymously. No account, no identifiers, no pressure.
        </p>

        {reference && (
          <div className="reference-pill">
            <span className="reference-label">REFERENCE</span>
            <span className="reference-code">{reference}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onWriteAnother} className="btn btn-primary">
            WRITE ANOTHER CONFESSION →
          </button>
          <button onClick={onGoHome} className="btn btn-secondary">
            RETURN HOME
          </button>
        </div>
      </div>
    </div>
  );
};
