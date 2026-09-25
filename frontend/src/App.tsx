import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Write } from './pages/Write';
import { Success } from './pages/Success';
import { Guidelines } from './pages/Guidelines';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { api } from './lib/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [submittedReference, setSubmittedReference] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('mace_admin_token');
  });
  const [adminUser, setAdminUser] = useState<any>(null);

  // Synchronize hash in URL for pleasant navigation & direct /admin bookmarking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'write', 'guidelines', 'admin'].includes(hash)) {
        setCurrentTab(hash);
      } else if (window.location.pathname === '/admin') {
        setCurrentTab('admin');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Validate stored token on boot
  useEffect(() => {
    if (adminToken) {
      api
        .getAdminMe(adminToken)
        .then((res) => setAdminUser(res.admin))
        .catch(() => {
          sessionStorage.removeItem('mace_admin_token');
          setAdminToken(null);
          setAdminUser(null);
        });
    }
  }, [adminToken]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const navigate = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmissionSuccess = (reference: string) => {
    setSubmittedReference(reference);
    setCurrentTab('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogin = (token: string, admin: any) => {
    sessionStorage.setItem('mace_admin_token', token);
    setAdminToken(token);
    setAdminUser(admin);
    setCurrentTab('admin');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('mace_admin_token');
    setAdminToken(null);
    setAdminUser(null);
    setCurrentTab('home');
    showToast('Signed out of Admin Deck.');
  };

  return (
    <div>
      <div className="container">
        <Navbar
          currentTab={currentTab}
          onNavigate={navigate}
        />

        <main>
          {currentTab === 'home' && (
            <Home
              onNavigateToWrite={() => navigate('write')}
              onNavigateToGuidelines={() => navigate('guidelines')}
            />
          )}

          {currentTab === 'write' && (
            <Write
              onSuccess={handleSubmissionSuccess}
              showToast={showToast}
            />
          )}

          {currentTab === 'success' && (
            <Success
              reference={submittedReference}
              onWriteAnother={() => navigate('write')}
              onGoHome={() => navigate('home')}
            />
          )}

          {currentTab === 'guidelines' && (
            <Guidelines onNavigateToWrite={() => navigate('write')} />
          )}

          {currentTab === 'admin' && (
            <div>
              {adminToken ? (
                <AdminDashboard
                  token={adminToken}
                  adminUser={adminUser}
                  onLogout={handleAdminLogout}
                  showToast={showToast}
                />
              ) : (
                <AdminLogin
                  onLoginSuccess={handleAdminLogin}
                  showToast={showToast}
                />
              )}
            </div>
          )}
        </main>
      </div>

      <Footer onNavigateToAdmin={() => navigate('admin')} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <span>✦</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
