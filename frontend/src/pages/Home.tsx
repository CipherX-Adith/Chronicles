import React from 'react';
import { MessageCard } from '../components/MessageCard';

interface HomeProps {
  onNavigateToWrite: () => void;
  onNavigateToGuidelines: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onNavigateToWrite,
  onNavigateToGuidelines,
}) => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-grid">
          <div>
            <span className="eyebrow">MACE CONFESSIONS</span>
            <h1 className="hero-title">
              <span>Say it.</span>
              <span>Leave it</span>
              <span>here.</span>
            </h1>
            <p className="hero-subtitle">
              No account. No profile. No pressure to reveal who you are.
              Just write what you wanted to say.
            </p>
            <button onClick={onNavigateToWrite} className="btn btn-primary">
              WRITE A CONFESSION →
            </button>
            <div className="hero-note">
              “maybe this is where you finally say it.”
            </div>
          </div>

          <div className="hero-visual">
            <MessageCard />
          </div>
        </div>
      </section>

      {/* Small Explanation */}
      <section className="info-section">
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <span className="eyebrow">THE PHILOSOPHY</span>
          <h2 style={{ fontSize: '32px', letterSpacing: '-0.04em', margin: '12px 0 16px' }}>
            A quiet place for unspoken thoughts.
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--ink-secondary)', lineHeight: '1.65' }}>
            Sometimes there are things you want to say without having to attach your name.
            Write it. Drop it into the box. We’ll take it from there.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="info-section">
        <div className="section-header">
          <span className="eyebrow">THE PROCESS</span>
          <h2 className="section-title">How it works.</h2>
        </div>

        <div className="step-grid">
          <div className="step-card">
            <div className="step-number">01 — WRITE</div>
            <h3 className="step-title">Write</h3>
            <p className="step-desc">
              Write whatever you’ve been meaning to say to a classmate, batchmate, department, or everyone.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02 — SEND</div>
            <h3 className="step-title">Send Anonymously</h3>
            <p className="step-desc">
              No login, no name requirement, no IP address logging. Everything is private and decoupled.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03 — WE READ</div>
            <h3 className="step-title">We Review</h3>
            <p className="step-desc">
              The editorial team reads submissions to ensure community safety and prevent targeted harassment.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04 — SHARE</div>
            <h3 className="step-title">Share</h3>
            <p className="step-desc">
              Selected confessions are formatted into editorial graphics and published to the campus Instagram page.
            </p>
          </div>
        </div>
      </section>

      {/* Community Guidelines Summary */}
      <section className="info-section">
        <div className="guidelines-box">
          <div className="guidelines-side">
            <span className="eyebrow">RESPECT & SAFETY</span>
            <h3>Community Standards</h3>
            <p>
              MACE Confessions exists for heartfelt notes, shared humor, and campus moments.
            </p>
            <button
              onClick={onNavigateToGuidelines}
              className="btn btn-ghost"
              style={{ marginTop: '16px', fontSize: '10px' }}
            >
              READ FULL GUIDELINES →
            </button>
          </div>

          <div className="guidelines-list">
            <div className="guideline-item">
              <span className="icon">✕</span>
              <p><strong>No Doxxing:</strong> Never include phone numbers, personal addresses, or private credentials.</p>
            </div>
            <div className="guideline-item">
              <span className="icon">✕</span>
              <p><strong>No Harassment:</strong> Bullying, intimidation, or hate speech will not be published.</p>
            </div>
            <div className="guideline-item">
              <span className="icon">✕</span>
              <p><strong>No Criminal Allegations:</strong> Serious unverified accusations will be discarded immediately.</p>
            </div>
            <div className="guideline-item">
              <span className="icon">✓</span>
              <p><strong>Safe Unspoken Words:</strong> Crushes, thank-yous, shared memories, department banter, and honesty.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <div className="cta-banner">
        <div>
          <h2>Still thinking about it?</h2>
          <p>You don't need an account. You don't need to tell anyone who you are.</p>
        </div>
        <button onClick={onNavigateToWrite} className="btn btn-accent">
          WRITE A CONFESSION →
        </button>
      </div>
    </div>
  );
};
