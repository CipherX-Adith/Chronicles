import React, { useState } from 'react';
import { api, SubmissionPayload } from '../lib/api';

interface ConfessionComposerProps {
  onSuccess: (reference: string) => void;
  showToast: (msg: string) => void;
}

export const ConfessionComposer: React.FC<ConfessionComposerProps> = ({
  onSuccess,
  showToast,
}) => {
  const [fromName, setFromName] = useState('');
  const [fromClass, setFromClass] = useState('');
  const [fromDept, setFromDept] = useState('');

  const [toName, setToName] = useState('');
  const [toClass, setToClass] = useState('');
  const [toDept, setToDept] = useState('');

  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMsg = message.trim();
    if (trimmedMsg.length < 3) {
      showToast('Please write at least a few words before submitting.');
      return;
    }

    if (!agreed) {
      showToast('Please confirm the community guideline checkbox below.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: SubmissionPayload = {
        from: {
          name: fromName.trim(),
          class: fromClass.trim(),
          department: fromDept.trim(),
        },
        to: {
          name: toName.trim(),
          class: toClass.trim(),
          department: toDept.trim(),
        },
        message: trimmedMsg,
      };

      const res = await api.submitConfession(payload);

      if (res.received) {
        onSuccess(res.reference);
      } else {
        showToast('Something unexpected happened. Please try again.');
      }
    } catch (err: any) {
      showToast(err.message || 'Submission failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="composer-card">
      <aside className="composer-aside">
        <div className="composer-aside-title">
          WRITE<br />YOUR<br />CONFESSION
        </div>
        <div className="composer-aside-rule"></div>
        <div>
          EVERYTHING<br />IS OPTIONAL<br />EXCEPT YOUR<br />MESSAGE.
        </div>
        <div className="composer-aside-notes" style={{ marginTop: '20px' }}>
          No accounts.<br />
          No IP logging.<br />
          Direct drop.
        </div>
      </aside>

      <div className="composer-main">
        <h1>What do you want to say?</h1>
        <p className="composer-sub">
          Add only the details you know or feel comfortable sharing. Your name is never required.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="composer-context">
            {/* FROM Box */}
            <div className="context-box">
              <div className="context-box-head">
                <span>FROM</span>
                <span className="optional">(OPTIONAL)</span>
              </div>
              <div className="fields-grid">
                <input
                  type="text"
                  className="full-width"
                  placeholder="Name — leave blank for Anonymous"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  maxLength={60}
                />
                <input
                  type="text"
                  placeholder="Class / Year (e.g. 3rd Year)"
                  value={fromClass}
                  onChange={(e) => setFromClass(e.target.value)}
                  maxLength={40}
                />
                <input
                  type="text"
                  placeholder="Department (e.g. EC)"
                  value={fromDept}
                  onChange={(e) => setFromDept(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="context-help">Your name is never required.</div>
            </div>

            {/* TO Box */}
            <div className="context-box">
              <div className="context-box-head">
                <span>TO</span>
                <span className="optional">(OPTIONAL)</span>
              </div>
              <div className="fields-grid">
                <input
                  type="text"
                  className="full-width"
                  placeholder="Name (if you know it)"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                  maxLength={60}
                />
                <input
                  type="text"
                  placeholder="Class / Year"
                  value={toClass}
                  onChange={(e) => setToClass(e.target.value)}
                  maxLength={40}
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={toDept}
                  onChange={(e) => setToDept(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="context-help">You can leave any of these blank.</div>
            </div>
          </div>

          <textarea
            className="message-textarea"
            placeholder="Start writing what you wanted to say..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1500}
            rows={7}
            required
          />

          <div className="char-counter">
            <span>Minimum 3 characters</span>
            <span>{message.length} / 1500</span>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I understand this confession may be shared on the official Instagram page. I confirm this note does not contain private contact information, doxxing, or malicious harassment.
            </span>
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'LEAVING NOTE...' : 'POST ANONYMOUSLY →'}
          </button>
        </form>
      </div>
    </div>
  );
};
