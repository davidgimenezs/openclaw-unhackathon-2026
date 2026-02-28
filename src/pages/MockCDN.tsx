// ============================================================
// Mock CDN Status Page
// ============================================================

import { useSearchParams } from 'react-router-dom';
import MockPageLayout from './MockPageLayout';

export default function MockCDN() {
  const [params] = useSearchParams();
  const status = params.get('status') ?? 'healthy';
  const isDown = status === 'down';
  const isDegraded = status === 'degraded';

  const regions = [
    { name: 'North America', pops: 48 },
    { name: 'Europe', pops: 36 },
    { name: 'Asia Pacific', pops: 28 },
    { name: 'South America', pops: 12 },
    { name: 'Africa', pops: 8 },
    { name: 'Middle East', pops: 6 },
  ];

  return (
    <MockPageLayout
      title="CloudFront CDN — Status"
      subtitle="Global Content Delivery Network"
      status={status}
    >
      <div style={{ padding: 24 }}>
        {isDown ? (
          <>
            <div style={banner('#ef4444')}>
              🔴 MAJOR INCIDENT — CDN edge network offline. All PoPs unreachable.
            </div>
            <div style={incidentTimeline}>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 12px', fontSize: 14 }}>
                Incident Timeline
              </h3>
              <div style={timelineEntry}>
                <span style={{ color: '#ef4444' }}>19:41 UTC</span> — Edge servers stopped responding
              </div>
              <div style={timelineEntry}>
                <span style={{ color: '#ef4444' }}>19:42 UTC</span> — All 138 PoPs confirmed offline
              </div>
              <div style={timelineEntry}>
                <span style={{ color: '#f59e0b' }}>19:43 UTC</span> — Engineering team notified
              </div>
              <div style={timelineEntry}>
                <span style={{ color: '#64748b' }}>19:44 UTC</span> — Investigating root cause
              </div>
            </div>
            <div style={regionGrid}>
              {regions.map((r) => (
                <div key={r.name} style={regionCard}>
                  <div style={{ color: '#ef4444', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: '#ef4444', fontSize: 12 }}>
                    0/{r.pops} PoPs online
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : isDegraded ? (
          <>
            <div style={banner('#f59e0b')}>
              🟡 PARTIAL DEGRADATION — Some edge locations experiencing issues.
            </div>
            <div style={regionGrid}>
              {regions.map((r, i) => (
                <div key={r.name} style={regionCard}>
                  <div style={{ color: i < 3 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                    {r.name}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>
                    {i < 3 ? `${Math.floor(r.pops * 0.6)}/${r.pops}` : `${r.pops}/${r.pops}`} PoPs online
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={banner('#10b981')}>
              🟢 ALL SYSTEMS OPERATIONAL — 138 PoPs across 6 continents.
            </div>
            <div style={statsRow}>
              <div style={statBox}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>99.99%</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Uptime (30d)</div>
              </div>
              <div style={statBox}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#38bdf8' }}>4.2ms</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Avg Latency</div>
              </div>
              <div style={statBox}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#a78bfa' }}>138</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>PoPs Online</div>
              </div>
            </div>
            <div style={regionGrid}>
              {regions.map((r) => (
                <div key={r.name} style={regionCard}>
                  <div style={{ color: '#10b981', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>
                    {r.pops}/{r.pops} PoPs online
                  </div>
                </div>
              ))}
            </div>
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

const incidentTimeline: React.CSSProperties = {
  padding: 16,
  background: '#1e293b',
  borderRadius: 8,
  border: '1px solid #334155',
  marginBottom: 20,
};

const timelineEntry: React.CSSProperties = {
  padding: '6px 0',
  fontSize: 13,
  color: '#94a3b8',
  borderBottom: '1px solid #0f172a',
};

const regionGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 10,
};

const regionCard: React.CSSProperties = {
  padding: 14,
  background: '#1e293b',
  borderRadius: 8,
  border: '1px solid #334155',
  textAlign: 'center',
};

const statsRow: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  marginBottom: 20,
};

const statBox: React.CSSProperties = {
  flex: 1,
  padding: 16,
  background: '#1e293b',
  borderRadius: 8,
  border: '1px solid #334155',
  textAlign: 'center',
};
