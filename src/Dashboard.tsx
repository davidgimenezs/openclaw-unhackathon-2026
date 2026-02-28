// ============================================================
// Dashboard — 3-panel layout + bottom narrative
// ============================================================

import ControlPanel from './components/ControlPanel';
import GraphView from './components/GraphView';
import MetricsPanel from './components/MetricsPanel';
import AgentNarrative from './components/AgentNarrative';

export default function Dashboard() {
  return (
    <div style={shellStyle}>
      {/* Title bar */}
      <header style={headerStyle}>
        <div style={titleRow}>
          <span style={{ fontSize: 24 }}>🌐</span>
          <div>
            <h1 style={titleStyle}>What If The Internet Broke?</h1>
            <p style={subtitleStyle}>
              Interactive infrastructure failure cascade simulator
            </p>
          </div>
        </div>
        <div style={tagline}>
          "Modern internet infrastructure is optimized for <em>efficiency</em>, not <em>resilience</em>."
        </div>
      </header>

      {/* Main content: Left panel | Graph | Right panel */}
      <div style={mainRow}>
        <ControlPanel />
        <div style={graphContainer}>
          <GraphView />
        </div>
        <MetricsPanel />
      </div>

      {/* Bottom narrative log */}
      <AgentNarrative />
    </div>
  );
}

const shellStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  background: '#0f172a',
  color: '#e2e8f0',
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  background: '#020617',
  borderBottom: '1px solid #1e293b',
  flexShrink: 0,
};

const titleRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: '-0.02em',
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: '#64748b',
};

const tagline: React.CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  textAlign: 'right',
  maxWidth: 340,
  fontStyle: 'italic',
};

const mainRow: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
};

const graphContainer: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  background: '#0f172a',
};
