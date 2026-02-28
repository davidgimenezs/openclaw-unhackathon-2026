// ============================================================
// Mock DNS Status Page
// ============================================================

import { useSearchParams } from 'react-router-dom';
import MockPageLayout from './MockPageLayout';

export default function MockDNS() {
  const [params] = useSearchParams();
  const status = params.get('status') ?? 'healthy';
  const isDown = status === 'down';
  const isDegraded = status === 'degraded';

  return (
    <MockPageLayout
      title="Global DNS Root Server Network"
      subtitle="Root Server System Status Dashboard"
      status={status}
    >
      <div style={{ padding: 24 }}>
        {isDown ? (
          <>
            <div style={alertBanner('#ef4444')}>
              🔴 CRITICAL INCIDENT — All root DNS servers are unreachable.
              Name resolution is failing globally.
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Server</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {dnsServers.map((s) => (
                  <tr key={s.name}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{s.location}</td>
                    <td style={tdStyle}>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>SERVFAIL</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: '#ef4444' }}>TIMEOUT</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={errorLog}>
              <code>
                {`[ERR] 19:42:01 - Root zone transfer failed (all 13 root servers unreachable)
[ERR] 19:42:03 - DNSSEC validation chain broken
[ERR] 19:42:05 - Recursive resolution impossible - no root hints responding
[ERR] 19:42:07 - Cached records expiring in T-47 minutes
[WRN] 19:42:09 - Estimated 4.5 billion users affected`}
              </code>
            </div>
          </>
        ) : isDegraded ? (
          <>
            <div style={alertBanner('#f59e0b')}>
              🟡 DEGRADED — Some root servers experiencing elevated latency.
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Server</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {dnsServers.map((s, i) => (
                  <tr key={s.name}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{s.location}</td>
                    <td style={tdStyle}>
                      <span style={{ color: i % 2 === 0 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                        {i % 2 === 0 ? 'SLOW' : 'OK'}
                      </span>
                    </td>
                    <td style={tdStyle}>{i % 2 === 0 ? '2340ms' : '12ms'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <div style={alertBanner('#10b981')}>
              🟢 ALL SYSTEMS OPERATIONAL — Root DNS infrastructure nominal.
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Server</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {dnsServers.map((s) => (
                  <tr key={s.name}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}>{s.location}</td>
                    <td style={tdStyle}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>OK</span>
                    </td>
                    <td style={tdStyle}>{s.latency}</td>
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

const dnsServers = [
  { name: 'a.root-servers.net', location: 'Verisign, VA', latency: '4ms' },
  { name: 'b.root-servers.net', location: 'USC-ISI, CA', latency: '8ms' },
  { name: 'c.root-servers.net', location: 'Cogent, DC', latency: '3ms' },
  { name: 'd.root-servers.net', location: 'UMD, MD', latency: '6ms' },
  { name: 'e.root-servers.net', location: 'NASA, CA', latency: '11ms' },
  { name: 'f.root-servers.net', location: 'ISC, CA', latency: '5ms' },
];

const alertBanner = (color: string): React.CSSProperties => ({
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
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 14px',
  borderBottom: '1px solid #334155',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid #1e293b',
  color: '#e2e8f0',
};

const errorLog: React.CSSProperties = {
  marginTop: 20,
  padding: 16,
  background: '#020617',
  borderRadius: 8,
  border: '1px solid #1e293b',
  fontFamily: 'monospace',
  fontSize: 12,
  color: '#ef4444',
  lineHeight: 1.8,
  whiteSpace: 'pre-wrap',
};
