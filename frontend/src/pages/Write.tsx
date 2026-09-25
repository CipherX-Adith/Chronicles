import React from 'react';
import { ConfessionComposer } from '../components/ConfessionComposer';

interface WriteProps {
  onSuccess: (reference: string) => void;
  showToast: (msg: string) => void;
}

export const Write: React.FC<WriteProps> = ({ onSuccess, showToast }) => {
  return (
    <div className="composer-wrapper">
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">CONFESSION BOX</span>
      </div>
      <ConfessionComposer onSuccess={onSuccess} showToast={showToast} />
    </div>
  );
};
