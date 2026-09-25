import React from 'react';

interface GuidelinesProps {
  onNavigateToWrite: () => void;
}

export const Guidelines: React.FC<GuidelinesProps> = ({ onNavigateToWrite }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto 80px' }}>
      <span className="eyebrow">EDITORIAL ETHICS</span>
      <h1 style={{ fontSize: '42px', letterSpacing: '-0.05em', marginBottom: '14px' }}>
        Community Guidelines
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--ink-secondary)', lineHeight: '1.6', marginBottom: '36px' }}>
        MACE Confessions is created to give voice to unspoken thoughts, shared campus stories, gratitude, and good-natured memories. To protect everyone at Mar Athanasius College of Engineering, all submissions follow these core standards.
      </p>

      <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
        <div className="admin-submission-card">
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>1. Strict Anonymity & Privacy</h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6' }}>
            We do not log IP addresses or request accounts. In return, please do not post someone's private contact numbers, home addresses, social security/student IDs, or private chat screenshots.
          </p>
        </div>

        <div className="admin-submission-card">
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>2. No Targeted Harassment & Bullying</h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6' }}>
            Confessions intended to humiliate, intimidate, smear reputations, or systematically attack an individual student or staff member will not be approved for publication.
          </p>
        </div>

        <div className="admin-submission-card">
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>3. No Unverified Criminal Accusations</h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6' }}>
            Serious academic malpractice or criminal allegations presented as fact without proof will be discarded. An anonymous confession platform is not a judicial forum.
          </p>
        </div>

        <div className="admin-submission-card">
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>4. What We Love to Publish</h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6' }}>
            Unsent love letters, gratitude to teachers, appreciation for friends, department inside jokes, campus nostalgia, encouraging words before exams, and unspoken truths.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={onNavigateToWrite} className="btn btn-primary">
          READY? WRITE A CONFESSION →
        </button>
      </div>
    </div>
  );
};
