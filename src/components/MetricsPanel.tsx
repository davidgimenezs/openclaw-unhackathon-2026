// ============================================================
// Metrics Panel — Right sidebar with stats + insights
// ============================================================

import { useSimulation } from '../context/SimulationContext';
import AnimatedNumber from './AnimatedNumber';

export default function MetricsPanel() {
  const {
    metrics,
    comparisonMetrics,
    insights,
    isRunning,
    currentWave,
    totalWaves,
  } = useSimulation();

  const healthColor =
    metrics.percentOperational >= 80
      ? '#10b981'
      : metrics.percentOperational >= 50
        ? '#f59e0b'
        : '#ef4444';

  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>📊 Internet Health</h2>

      {/* Big health number */}
      <div style={healthBlock}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: healthColor,
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.5s ease',
            lineHeight: 1,
          }}
        >
          <AnimatedNumber value={metrics.percentOperational} suffix="%" />
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
          OPERATIONAL
        </div>
      </div>

      {/* Wave indicator */}
      {(isRunning || totalWaves > 0) && (
        <div style={waveBlock}>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
            CASCADE WAVE
          </div>
          <div style={waveBar}>
            <div
              style={{
                ...waveBarFill,
                width: totalWaves > 0 ? `${(currentWave / totalWaves) * 100}%` : '0%',
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
            {currentWave} / {totalWaves}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div style={statsGrid}>
        <StatCard label="Affected Users" value={metrics.affectedUsers} suffix="M" icon="👥" />
        <StatCard label="Financial Impact" value={metrics.financialImpact} prefix="$" suffix="M/hr" icon="💰" />
        <StatCard
          label="Services Down"
          value={metrics.servicesDown}
          icon="🔴"
        />
        <StatCard
          label="Degraded"
          value={metrics.servicesDegraded}
          icon="🟡"
        />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div style={insightsSection}>
          <h3 style={insightsTitle}>🔍 Systems Insight</h3>
          {insights.map((insight, i) => (
            <div key={i} style={insightCard}>
              <div style={insightLabel}>
                <span style={severityDot(insight.severity)} />
                {insight.label}
              </div>
              <div style={insightValue}>{insight.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Before/After Comparison */}
      {comparisonMetrics && !isRunning && (
        <div style={comparisonSection}>
          <h3 style={insightsTitle}>⚖️ What If Decentralized?</h3>
          <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 8px' }}>
            Same attack, 100% decentralized infrastructure:
          </p>
          <div style={comparisonGrid}>
            <ComparisonRow
              label="Health"
              current={metrics.percentOperational}
              alt={comparisonMetrics.percentOperational}
              suffix="%"
            />
            <ComparisonRow
              label="Services Down"
              current={metrics.servicesDown}
              alt={comparisonMetrics.servicesDown}
              invert
            />
            <ComparisonRow
              label="Users Affected"
              current={metrics.affectedUsers}
              alt={comparisonMetrics.affectedUsers}
              suffix="M"
              invert
            />
            <ComparisonRow
              label="Cost"
              current={metrics.financialImpact}
              alt={comparisonMetrics.financialImpact}
              prefix="$"
              suffix="M/hr"
              invert
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Sub-components --------------------------------------------------

function StatCard({ label, value, icon, prefix, suffix }: { label: string; value: number; icon: string; prefix?: string; suffix?: string }) {
  return (
    <div style={statCardStyle}>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div style={{ fontSize: 10, color: '#64748b' }}>{label}</div>
    </div>
  );
}

function ComparisonRow({
  label,
  current,
  alt,
  prefix = '',
  suffix = '',
  invert = false,
}: {
  label: string;
  current: number;
  alt: number;
  prefix?: string;
  suffix?: string;
  invert?: boolean; // true = lower is better (costs, downtime)
}) {
  const diff = alt - current;
  const improved = invert ? diff < 0 : diff > 0;
  const diffStr = diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${diff}`;

  return (
    <div style={comparisonRow}>
      <span style={{ fontSize: 10, color: '#94a3b8', flex: 1 }}>{label}</span>
      <span style={{ fontSize: 11, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
        {prefix}{current}{suffix}
      </span>
      <span style={{ fontSize: 11, color: '#475569', margin: '0 4px' }}>→</span>
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        color: improved ? '#10b981' : diff === 0 ? '#64748b' : '#f59e0b',
      }}>
        {prefix}{alt}{suffix}
      </span>
      <span style={{
        fontSize: 9,
        fontWeight: 600,
        color: improved ? '#10b981' : diff === 0 ? '#64748b' : '#f59e0b',
        marginLeft: 4,
      }}>
        ({diffStr})
      </span>
    </div>
  );
}

// ---- Styles ----------------------------------------------------------

const panelStyle: React.CSSProperties = {
  width: 260,
  background: '#0f172a',
  borderLeft: '1px solid #1e293b',
  display: 'flex',
  flexDirection: 'column',
  padding: 16,
  gap: 14,
  overflowY: 'auto',
};

const titleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#e2e8f0',
  margin: 0,
  paddingBottom: 8,
  borderBottom: '1px solid #1e293b',
};

const healthBlock: React.CSSProperties = {
  textAlign: 'center',
  padding: '16px 0',
};

const waveBlock: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '8px 0',
};

const waveBar: React.CSSProperties = {
  height: 4,
  background: '#1e293b',
  borderRadius: 2,
  overflow: 'hidden',
};

const waveBarFill: React.CSSProperties = {
  height: '100%',
  background: '#ef4444',
  borderRadius: 2,
  transition: 'width 0.5s ease',
};

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
};

const statCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  padding: '12px 8px',
  background: '#1e293b',
  borderRadius: 8,
  border: '1px solid #334155',
};

const insightsSection: React.CSSProperties = {
  borderTop: '1px solid #1e293b',
  paddingTop: 12,
};

const insightsTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#e2e8f0',
  margin: '0 0 8px',
};

const insightCard: React.CSSProperties = {
  padding: '8px 10px',
  background: '#1e293b',
  borderRadius: 6,
  marginBottom: 6,
};

const insightLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const insightValue: React.CSSProperties = {
  fontSize: 12,
  color: '#e2e8f0',
  marginTop: 2,
};

const severityColors = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

const severityDot = (severity: string): React.CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: severityColors[severity as keyof typeof severityColors] ?? '#64748b',
  display: 'inline-block',
  flexShrink: 0,
});

const comparisonSection: React.CSSProperties = {
  borderTop: '1px solid #1e293b',
  paddingTop: 12,
};

const comparisonGrid: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: '8px 10px',
  background: '#1e293b',
  borderRadius: 6,
  border: '1px solid rgba(16, 185, 129, 0.2)',
};

const comparisonRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  fontVariantNumeric: 'tabular-nums',
};
