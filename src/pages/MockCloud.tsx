// ============================================================
// Mock Cloud Provider (AWS) Page
// ============================================================

import { useSearchParams } from 'react-router-dom';
import MockPageLayout from './MockPageLayout';

export default function MockCloud() {
  const [params] = useSearchParams();
  const status = params.get('status') ?? 'healthy';
  const isDown = status === 'down';
  const isDegraded = status === 'degraded';

  const services = [
    { name: 'EC2', region: 'us-east-1' },
    { name: 'S3', region: 'us-east-1' },
    { name: 'Lambda', region: 'us-east-1' },
    { name: 'RDS', region: 'us-east-1' },
    { name: 'CloudFront', region: 'Global' },
    { name: 'DynamoDB', region: 'us-east-1' },
    { name: 'ECS', region: 'us-west-2' },
    { name: 'SQS', region: 'eu-west-1' },
  ];

  return (
    <MockPageLayout
      title="AWS Service Health Dashboard"
      subtitle="Amazon Web Services — Real-time Service Status"
      status={status}
    >
      <div style={{ padding: 24 }}>
        {isDown ? (
          <>
            <div style={banner('#ef4444')}>
              🔴 MAJOR OUTAGE — Multiple AWS services are experiencing failures across all regions.
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Region</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.name}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{s.region}</td>
                    <td style={tdStyle}>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>● OUTAGE</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={impactNote}>
              <strong>Impact:</strong> Estimated 1B+ users affected. Services including
              Netflix, Stripe, GitHub, and Shopify are reporting cascading failures.
            </div>
          </>
        ) : isDegraded ? (
          <>
            <div style={banner('#f59e0b')}>
              🟡 PERFORMANCE ISSUES — Some services degraded in us-east-1.
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Region</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={s.name}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{s.region}</td>
                    <td style={tdStyle}>
                      <span style={{ color: i < 4 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                        {i < 4 ? '◐ DEGRADED' : '● NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <div style={banner('#10b981')}>
              🟢 ALL SERVICES OPERATIONAL — No issues detected.
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Service</th>
                  <th style={thStyle}>Region</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.name}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{s.region}</td>
                    <td style={tdStyle}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>● NORMAL</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </MockPageLayout>
  );
}

const banner = (color: string): React.CSSProperties => ({
  padding: '16px 20px',
  background: `${color}15`,
  border: `1px solid ${color}`,
  borderRadius: 8,
  color,
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 20,
});

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  borderBottom: '1px solid #334155',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid #1e293b',
  color: '#e2e8f0',
  fontSize: 13,
};

const impactNote: React.CSSProperties = {
  marginTop: 20,
  padding: 16,
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid #ef4444',
  borderRadius: 8,
  color: '#fca5a5',
  fontSize: 13,
  lineHeight: 1.6,
};
