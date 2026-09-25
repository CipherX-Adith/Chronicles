import React from 'react';

interface MessageCardProps {
  id?: string;
  fromName?: string;
  fromDetails?: string;
  toName?: string;
  toDetails?: string;
  message?: string;
  tag?: string;
  interactive?: boolean;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  id = 'CONFESSION #0042',
  fromName = 'Anonymous',
  fromDetails = '3rd Year · EC',
  toName = 'Someone',
  toDetails = '2nd Year · EC',
  message = "I've wanted to tell you this for a while. Maybe this is the easiest way to finally say it.",
  tag = 'YOU CAN SAY IT HERE.',
}) => {
  return (
    <div className="art-container">
      <div className="tape-strip"></div>
      <article className="physical-card">
        <div className="card-top">
          <div className="card-avatar">✦</div>
          <div className="card-person">
            <span>FROM</span>
            <strong>{fromName}</strong>
            {fromDetails && <span>{fromDetails}</span>}
          </div>
          <div className="card-recipient">
            <span>TO</span>
            <strong>{toName}</strong>
            {toDetails && <span>{toDetails}</span>}
          </div>
        </div>

        <div className="card-message">
          “{message}”
        </div>

        <div className="card-signature">
          <span>{id}</span>
          <span>ANONYMOUS</span>
        </div>

        {tag && <div className="card-tag">{tag}</div>}
      </article>
    </div>
  );
};
