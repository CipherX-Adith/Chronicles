import React, { useEffect, useState, useCallback } from 'react';
import { api, AdminSubmission } from '../lib/api';
import { InstagramPreviewModal } from '../components/InstagramPreviewModal';

interface AdminDashboardProps {
  token: string;
  adminUser: any;
  onLogout: () => void;
  showToast: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminUser,
  onLogout,
  showToast,
}) => {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, archived: 0 });
  const [currentStatus, setCurrentStatus] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForIG, setSelectedForIG] = useState<AdminSubmission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminSubmissions(token, currentStatus, searchQuery);
      setSubmissions(res.submissions);
      setCounts(res.counts);
    } catch (err: any) {
      if (err.message?.includes('token') || err.message?.includes('Unauthorized')) {
        showToast('Session expired. Please log in again.');
        onLogout();
      } else {
        showToast(err.message || 'Failed to load submissions.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, currentStatus, searchQuery, onLogout, showToast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = async (id: string) => {
    try {
      await api.approveSubmission(token, id);
      showToast(`Submission approved.`);
      fetchSubmissions();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve.');
    }
  };

  const handleDelete = async (id: string, publicId: string) => {
    if (!window.confirm(`Permanently delete submission ${publicId}?`)) return;
    try {
      await api.deleteSubmission(token, id);
      showToast(`Submission ${publicId} deleted.`);
      fetchSubmissions();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete submission.');
    }
  };

  const handleOpenIGModal = async (sub: AdminSubmission) => {
    try {
      await api.generateInstagramPost(token, sub.id);
      setSelectedForIG(sub);
    } catch (err: any) {
      showToast(err.message || 'Failed to initialize IG post data.');
    }
  };

  return (
    <div style={{ padding: '30px 0 80px' }}>
      {/* Header Bar */}
      <div className="admin-header">
        <div>
          <span className="eyebrow">EDITORIAL DESK</span>
          <h1 className="admin-title">Submission Review</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Logged in as <strong>{adminUser?.email || 'admin@mace.edu'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchSubmissions} className="btn btn-secondary">
            ↻ REFRESH
          </button>
          <button onClick={onLogout} className="btn btn-ghost">
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div className="admin-tabs" style={{ margin: 0, border: 'none', padding: 0 }}>
          <button
            onClick={() => setCurrentStatus('PENDING')}
            className={`admin-tab-btn ${currentStatus === 'PENDING' ? 'active' : ''}`}
          >
            Pending <span className="tab-badge">{counts.pending}</span>
          </button>
          <button
            onClick={() => setCurrentStatus('APPROVED')}
            className={`admin-tab-btn ${currentStatus === 'APPROVED' ? 'active' : ''}`}
          >
            Approved <span className="tab-badge">{counts.approved}</span>
          </button>
          <button
            onClick={() => setCurrentStatus('ARCHIVED')}
            className={`admin-tab-btn ${currentStatus === 'ARCHIVED' ? 'active' : ''}`}
          >
            Archived <span className="tab-badge">{counts.archived}</span>
          </button>
          <button
            onClick={() => setCurrentStatus('ALL')}
            className={`admin-tab-btn ${currentStatus === 'ALL' ? 'active' : ''}`}
          >
            All Submissions <span className="tab-badge">{counts.total}</span>
          </button>
        </div>

        <div style={{ width: '280px' }}>
          <input
            type="text"
            placeholder="Search notes, names, IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Submissions Feed */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div
          className="admin-submission-card"
          style={{ textAlign: 'center', padding: '60px 20px' }}
        >
          <h3 style={{ fontSize: '20px', color: 'var(--muted)', marginBottom: '8px' }}>
            No submissions in this queue.
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--muted-light)' }}>
            When students leave notes in the confession box, they appear here for private editorial review.
          </p>
        </div>
      ) : (
        <div className="submission-feed">
          {submissions.map((sub) => {
            const fromStr = [
              sub.fromName || 'Anonymous',
              sub.fromClass,
              sub.fromDepartment,
            ]
              .filter(Boolean)
              .join(' · ');

            const toStr = [sub.toName || 'Everyone', sub.toClass, sub.toDepartment]
              .filter(Boolean)
              .join(' · ');

            return (
              <article
                key={sub.id}
                className={`admin-submission-card ${sub.isCaution ? 'caution' : ''}`}
              >
                <div className="sub-meta-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ fontSize: '12px', color: 'var(--ink)' }}>
                      {sub.publicId}
                    </strong>
                    <span>{new Date(sub.createdAt).toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {sub.instagramPost?.status === 'PUBLISHED' && (
                      <span
                        className="status-badge"
                        style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}
                      >
                        ✓ POSTED ON IG
                      </span>
                    )}
                    <span className={`status-badge ${sub.status}`}>
                      {sub.status}
                    </span>
                  </div>
                </div>

                {/* Safety Flags Warning if Detected */}
                {sub.safetyFlags && sub.safetyFlags.length > 0 && (
                  <div
                    style={{
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      marginBottom: '14px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: '#9f1239',
                    }}
                  >
                    ⚠️ <strong>Moderation Note:</strong> {sub.safetyFlags.join(', ')}
                  </div>
                )}

                {/* Participants */}
                <div className="sub-participants">
                  <div>
                    <div className="sub-party-label">FROM</div>
                    <div className="sub-party-val">{fromStr}</div>
                  </div>
                  <div>
                    <div className="sub-party-label">TO</div>
                    <div className="sub-party-val">{toStr}</div>
                  </div>
                </div>

                {/* Confession Message Content */}
                <div className="sub-message-box">“{sub.message}”</div>

                {/* Action Buttons */}
                <div className="sub-actions">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {sub.status === 'PENDING' && (
                      <button
                        onClick={() => handleApprove(sub.id)}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '10px' }}
                      >
                        ✓ APPROVE
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenIGModal(sub)}
                      className="btn btn-accent"
                      style={{ padding: '8px 16px', fontSize: '10px' }}
                    >
                      📸 GENERATE INSTAGRAM POST
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(sub.id, sub.publicId)}
                    className="btn btn-ghost"
                    style={{ padding: '8px 12px', fontSize: '10px', color: '#b91c1c' }}
                  >
                    DELETE
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Instagram Preview Modal */}
      {selectedForIG && (
        <InstagramPreviewModal
          submission={selectedForIG}
          token={token}
          onClose={() => setSelectedForIG(null)}
          onStatusUpdated={() => {
            fetchSubmissions();
            setSelectedForIG(null);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};
