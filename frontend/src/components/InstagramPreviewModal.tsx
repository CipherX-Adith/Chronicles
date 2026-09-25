import React, { useEffect, useRef, useState } from 'react';
import { drawInstagramPost, openInstagramPosting } from '../lib/igCanvas';
import { AdminSubmission, api } from '../lib/api';

interface InstagramPreviewModalProps {
  submission: AdminSubmission;
  token: string;
  onClose: () => void;
  onStatusUpdated: () => void;
  showToast: (msg: string) => void;
}

export const InstagramPreviewModal: React.FC<InstagramPreviewModalProps> = ({
  submission,
  token,
  onClose,
  onStatusUpdated,
  showToast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPostingWorkflow, setIsPostingWorkflow] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPublished, setIsPublished] = useState(
    submission.status === 'APPROVED' ||
      submission.status === ('PUBLISHED' as any) ||
      submission.instagramPost?.status === 'PUBLISHED' ||
      submission.instagramPost?.status === 'POSTED'
  );

  // Format participant strings
  const fromPrimary = submission.fromName?.trim() || 'Anonymous';
  const fromSecondary = [submission.fromClass, submission.fromDepartment]
    .filter(Boolean)
    .join(' · ');

  const toPrimary = submission.toName?.trim() || 'Everyone';
  const toSecondary = [submission.toClass, submission.toDepartment]
    .filter(Boolean)
    .join(' · ');

  const fromFull = [fromPrimary, fromSecondary].filter(Boolean).join(' · ');
  const toFull = [toPrimary, toSecondary].filter(Boolean).join(' · ');

  const captionText = `“${submission.message}”
—
Confession ${submission.publicId}
From: ${fromFull}
To: ${toFull}

Say it. Leave it here.
Link in bio to drop an anonymous note.
#MACE #MACEConfessions #CampusNotes #Anonymous`;

  useEffect(() => {
    if (canvasRef.current) {
      drawInstagramPost(canvasRef.current, {
        publicId: submission.publicId,
        from: {
          primary: fromPrimary,
          secondary: fromSecondary || undefined,
        },
        to: {
          primary: toPrimary,
          secondary: toSecondary || undefined,
        },
        message: submission.message,
      });
    }
  }, [submission, fromPrimary, fromSecondary, toPrimary, toSecondary]);

  // Main Action: Trigger Instagram post workflow & redirect on device
  const handlePostToInstagram = async () => {
    if (!canvasRef.current) return;
    try {
      showToast('Opening Instagram on your device & caption copied...');
      await openInstagramPosting(canvasRef.current, submission.publicId, captionText);
      setIsPostingWorkflow(true);
    } catch (err: any) {
      showToast('Error preparing Instagram post. Please try again.');
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setIsCopied(true);
    showToast('Caption copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirmPublished = async () => {
    setIsConfirming(true);
    try {
      await api.publishInstagram(token, submission.id, { caption: captionText });
      setIsPublished(true);
      setIsPostingWorkflow(false);
      showToast(`Confession ${submission.publicId} marked as PUBLISHED!`);
      onStatusUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to update publishing state.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelPostingWorkflow = () => {
    setIsPostingWorkflow(false);
    showToast('Confession remains in current state.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '14px',
          }}
        >
          <div>
            <span className="eyebrow">INSTAGRAM POST GENERATOR</span>
            <h2 style={{ fontSize: '24px', letterSpacing: '-0.03em' }}>
              Preview & Export — {submission.publicId}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px 14px' }}
          >
            ✕ Close
          </button>
        </div>

        <div className="ig-preview-grid">
          {/* Canvas Rendering Preview (1080x1350) */}
          <div className="ig-canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>

          {/* Controls & Instagram Workflow */}
          <div className="ig-controls">
            {/* Section 1: Post to Instagram */}
            <div>
              <h4 style={{ fontSize: '15px', marginBottom: '8px' }}>
                1. Post to Instagram
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px' }}>
                Share this generated confession directly to Instagram from this device. Caption will be copied automatically.
              </p>

              <button
                onClick={handlePostToInstagram}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px',
                  fontSize: '12px',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                {isPublished ? 'RE-OPEN INSTAGRAM TO POST' : 'POST TO INSTAGRAM'}
              </button>
            </div>

            {/* Section 2: Formatted Caption */}
            <div>
              <h4 style={{ fontSize: '15px', marginBottom: '8px' }}>
                2. Formatted Caption
              </h4>
              <div className="caption-box">{captionText}</div>
              <button
                onClick={handleCopyCaption}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                {isCopied ? '✓ CAPTION COPIED' : '📋 COPY INSTAGRAM CAPTION'}
              </button>
            </div>

            {/* Section 3: Publishing State & Confirmation Workflow */}
            <div
              style={{
                borderTop: '1px dashed var(--line)',
                paddingTop: '16px',
                marginTop: '6px',
              }}
            >
              <h4 style={{ fontSize: '15px', marginBottom: '8px' }}>
                3. Publishing State
              </h4>

              {isPostingWorkflow ? (
                <div
                  style={{
                    background: '#fbf9f4',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '14px',
                    marginTop: '8px',
                  }}
                >
                  <p
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--ink)',
                      marginBottom: '12px',
                    }}
                  >
                    Have you successfully posted this confession to Instagram?
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleCancelPostingWorkflow}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '10px 12px' }}
                    >
                      NOT YET
                    </button>
                    <button
                      onClick={handleConfirmPublished}
                      className="btn btn-accent"
                      style={{ flex: 1.3, padding: '10px 12px' }}
                      disabled={isConfirming}
                    >
                      {isConfirming ? 'CONFIRMING...' : 'YES, POSTED'}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Status:{' '}
                    <strong style={{ color: 'var(--ink)' }}>
                      {isPublished ? 'PUBLISHED' : 'GENERATED'}
                    </strong>
                  </div>

                  {isPublished ? (
                    <button
                      className="btn btn-accent"
                      style={{
                        padding: '10px 18px',
                        cursor: 'default',
                        opacity: 0.9,
                      }}
                      disabled
                    >
                      ✓ ALREADY POSTED
                    </button>
                  ) : (
                    <button
                      onClick={handlePostToInstagram}
                      className="btn btn-primary"
                      style={{ padding: '10px 16px', fontSize: '11px' }}
                    >
                      POST TO INSTAGRAM →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
