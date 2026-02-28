// ============================================================
// Mock Bank Page
// ============================================================

import { useSearchParams } from 'react-router-dom';
import MockPageLayout from './MockPageLayout';

export default function MockBank() {
  const [params] = useSearchParams();
  const status = params.get('status') ?? 'healthy';
  const isDown = status === 'down';
  const isDegraded = status === 'degraded';

  return (
    <MockPageLayout
      title="SecureBank™ Online Banking"
      subtitle="Trusted by 500 million customers worldwide"
      status={status}
    >
      <div style={{ padding: 24 }}>
        {isDown ? (
          <div style={errorContainer}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏦</div>
            <h2 style={{ color: '#ef4444', margin: 0 }}>503 — Service Unavailable</h2>
            <p style={{ color: '#94a3b8', marginTop: 8 }}>
              We are currently unable to connect to our banking systems.
              <br />
              This is likely due to an upstream infrastructure failure.
            </p>
            <div style={retryBox}>
              <div style={{ fontSize: 13, color: '#f59e0b' }}>
                ⚠️ DNS resolution for api.securebank.com failed
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Error: NXDOMAIN — Domain name cannot be resolved
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                Auto-retry in 30 seconds...
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 20 }}>
              If you need immediate assistance, call 1-800-SECURE-BANK
            </p>
          </div>
        ) : isDegraded ? (
          <div>
            <div style={warningBanner}>
              ⚠️ Some banking features may be slow or temporarily unavailable.
            </div>
            <div style={loginForm}>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 16px' }}>Sign In</h3>
              <input style={inputStyle} placeholder="Username" disabled />
              <input style={inputStyle} placeholder="Password" type="password" disabled />
              <button style={loginBtnDegraded}>Sign In (Slow)</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={successBanner}>
              🟢 All banking systems operational. Your accounts are secure.
            </div>
            <div style={loginForm}>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 16px' }}>Sign In</h3>
              <input style={inputStyle} placeholder="Username" />
              <input style={inputStyle} placeholder="Password" type="password" />
              <button style={loginBtn}>Sign In</button>
            </div>
            <div style={balancePreview}>
              <div style={{ fontSize: 12, color: '#64748b' }}>Welcome back, Demo User</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981', marginTop: 8 }}>
                $42,857.93
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Available Balance</div>
            </div>
          </div>
        )}
      </div>
    </MockPageLayout>
  );
}

const errorContainer: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px 24px',
};

const retryBox: React.CSSProperties = {
  marginTop: 20,
  padding: 16,
  background: '#1e293b',
  borderRadius: 8,
  border: '1px solid #334155',
  textAlign: 'left',
};

const warningBanner: React.CSSProperties = {
  padding: 16,
  background: 'rgba(245, 158, 11, 0.1)',
  border: '1px solid #f59e0b',
  borderRadius: 8,
  color: '#f59e0b',
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 20,
};

const successBanner: React.CSSProperties = {
  padding: 16,
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid #10b981',
  borderRadius: 8,
  color: '#10b981',
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 20,
};

const loginForm: React.CSSProperties = {
  maxWidth: 360,
  margin: '0 auto',
  padding: 24,
  background: '#1e293b',
  borderRadius: 12,
  border: '1px solid #334155',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  marginBottom: 12,
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 6,
  color: '#e2e8f0',
  fontSize: 14,
  boxSizing: 'border-box',
};

const loginBtn: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  background: '#10b981',
  border: 'none',
  borderRadius: 6,
  color: 'white',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
};

const loginBtnDegraded: React.CSSProperties = {
  ...loginBtn,
  background: '#f59e0b',
  opacity: 0.7,
};

const balancePreview: React.CSSProperties = {
  marginTop: 20,
  padding: 20,
  background: '#1e293b',
  borderRadius: 12,
  border: '1px solid #334155',
  textAlign: 'center',
  maxWidth: 360,
  margin: '20px auto 0',
};
