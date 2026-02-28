// ============================================================
// Shared layout for mock service pages
// ============================================================

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  title: string;
  subtitle: string;
  status: string;
  children: ReactNode;
}

export default function MockPageLayout({ title, subtitle, status, children }: Props) {
  const statusColor =
    status === 'down' ? '#ef4444' : status === 'degraded' ? '#f59e0b' : '#10b981';

  return (
    <div style={pageStyle}>
      <nav style={navStyle}>
        <Link to="/" style={backLink}>← Back to Dashboard</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
              display: 'inline-block',
            }}
          />
          <span style={{ color: statusColor, fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            {status}
          </span>
        </div>
      </nav>
      <header style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: 22, color: '#e2e8f0' }}>{title}</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{subtitle}</p>
      </header>
      <main style={mainStyle}>{children}</main>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0f172a',
  color: '#e2e8f0',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 24px',
  borderBottom: '1px solid #1e293b',
  background: '#020617',
};

const backLink: React.CSSProperties = {
  color: '#38bdf8',
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 600,
};

const headerStyle: React.CSSProperties = {
  padding: '20px 24px',
  borderBottom: '1px solid #1e293b',
};

const mainStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: '0 auto',
};
