// ============================================================
// Control Panel — Left sidebar with scenario buttons + slider
// ============================================================

import { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { scenarios } from '../data/internetGraph';
import type { ScenarioId } from '../data/internetGraph';

const scenarioEmojis: Record<ScenarioId, string> = {
  'dns-collapse': '🌐',
  'cdn-outage': '📡',
  'aws-outage': '☁️',
};

export default function ControlPanel() {
  const {
    runScenario,
    killNode,
    reset,
    isRunning,
    decentralization,
    setDecentralization,
    activeScenario,
    analyzeSiteUrl,
    analyzedSite,
    nodes,
  } = useSimulation();

  const [urlInput, setUrlInput] = useState('');

  const handleAnalyze = () => {
    if (!urlInput.trim() || isRunning) return;
    analyzeSiteUrl(urlInput.trim());
    setUrlInput('');
  };

  const killAll = () => {
    if (isRunning) return;
    // Kill root DNS first, let cascade handle the rest
    reset();
    setTimeout(() => {
      const infraNodes = nodes.filter(n => n.type !== 'user');
      // Kill all dns nodes to cause maximum cascade
      const dnsIds = infraNodes.filter(n => n.type === 'dns').map(n => n.id);
      if (dnsIds.length > 0) {
        killNode(dnsIds[0]);
      }
    }, 300);
  };

  return (
    <div style={panelStyle}>
      <h2 style={titleStyle}>⚡ Scenarios</h2>

      <div style={buttonGroupStyle}>
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => runScenario(s.id)}
            disabled={isRunning}
            style={{
              ...buttonStyle,
              borderColor: activeScenario === s.id ? '#ef4444' : '#334155',
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            <span style={{ fontSize: 20 }}>{scenarioEmojis[s.id]}</span>
            <span style={{ fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.description}</span>
          </button>
        ))}

        {/* Apocalypse mode */}
        <button
          onClick={killAll}
          disabled={isRunning}
          style={{
            ...buttonStyle,
            borderColor: '#dc2626',
            background: 'rgba(239, 68, 68, 0.1)',
            opacity: isRunning ? 0.5 : 1,
          }}
        >
          <span style={{ fontSize: 20 }}>☠️</span>
          <span style={{ fontWeight: 600, color: '#fca5a5' }}>Apocalypse</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>Full infrastructure collapse</span>
        </button>
      </div>

      <button
        onClick={reset}
        style={{
          ...resetButtonStyle,
          opacity: isRunning ? 0.5 : 1,
        }}
        disabled={isRunning}
      >
        🔄 Reset
      </button>

      {/* URL Analyzer */}
      <div style={urlSection}>
        <h3 style={urlTitle}>🔎 Analyze a Site</h3>
        <p style={urlDesc}>
          Enter any URL to see how it would be affected by infrastructure failures.
        </p>
        <div style={urlInputRow}>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="e.g. spotify.com"
            disabled={isRunning}
            style={urlInputStyle}
          />
          <button
            onClick={handleAnalyze}
            disabled={isRunning || !urlInput.trim()}
            style={{
              ...analyzeButtonStyle,
              opacity: isRunning || !urlInput.trim() ? 0.4 : 1,
            }}
          >
            ⚡
          </button>
        </div>
        {analyzedSite && (
          <div style={analyzedBadge}>
            <span style={{ fontSize: 14 }}>{analyzedSite.node.emoji}</span>
            <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>
              {analyzedSite.domain}
            </span>
            <span style={{ fontSize: 9, color: '#475569' }}>
              {analyzedSite.dependencyIds.length} deps
            </span>
          </div>
        )}
      </div>

      <div style={sliderSection}>
        <h3 style={sliderTitle}>
          🌍 Decentralization
          <span style={sliderValue}>{decentralization}%</span>
        </h3>
        <p style={sliderDesc}>
          Higher = more redundant providers, fewer single points of failure.
        </p>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={decentralization}
          onChange={(e) => setDecentralization(Number(e.target.value))}
          disabled={isRunning}
          style={sliderStyle}
        />
        <div style={sliderLabels}>
          <span>Centralized</span>
          <span>Distributed</span>
        </div>
      </div>

      <div style={brandingStyle}>
        <div style={{ fontSize: 28 }}>🦞</div>
        <div style={{ fontSize: 11, color: '#64748b' }}>Powered by OpenClaw</div>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 6, lineHeight: 1.4 }}>
          💡 Click any node on the graph to manually kill it
        </div>
      </div>
    </div>
  );
}

// ---- Styles ----------------------------------------------------------

const panelStyle: React.CSSProperties = {
  width: 240,
  background: '#0f172a',
  borderRight: '1px solid #1e293b',
  display: 'flex',
  flexDirection: 'column',
  padding: 16,
  gap: 12,
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

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const buttonStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: '10px 12px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  color: '#e2e8f0',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.2s ease',
  fontSize: 13,
};

const resetButtonStyle: React.CSSProperties = {
  padding: '10px 12px',
  background: 'transparent',
  border: '1px solid #334155',
  borderRadius: 8,
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  transition: 'all 0.2s ease',
};

const sliderSection: React.CSSProperties = {
  marginTop: 12,
  padding: '12px 0',
  borderTop: '1px solid #1e293b',
};

const sliderTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#e2e8f0',
  margin: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const sliderValue: React.CSSProperties = {
  fontSize: 14,
  color: '#38bdf8',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
};

const sliderDesc: React.CSSProperties = {
  fontSize: 11,
  color: '#64748b',
  margin: '6px 0 10px',
  lineHeight: 1.4,
};

const sliderStyle: React.CSSProperties = {
  width: '100%',
  accentColor: '#38bdf8',
  cursor: 'pointer',
};

const sliderLabels: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 10,
  color: '#475569',
  marginTop: 4,
};

const brandingStyle: React.CSSProperties = {
  marginTop: 'auto',
  textAlign: 'center',
  paddingTop: 16,
  borderTop: '1px solid #1e293b',
};

const urlSection: React.CSSProperties = {
  marginTop: 8,
  padding: '12px 0',
  borderTop: '1px solid #1e293b',
};

const urlTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#e2e8f0',
  margin: 0,
};

const urlDesc: React.CSSProperties = {
  fontSize: 10,
  color: '#64748b',
  margin: '4px 0 8px',
  lineHeight: 1.4,
};

const urlInputRow: React.CSSProperties = {
  display: 'flex',
  gap: 4,
};

const urlInputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 10px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 6,
  color: '#e2e8f0',
  fontSize: 12,
  outline: 'none',
  fontFamily: 'inherit',
};

const analyzeButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: '#38bdf8',
  border: 'none',
  borderRadius: 6,
  color: '#020617',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const analyzedBadge: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  marginTop: 8,
  background: 'rgba(56, 189, 248, 0.1)',
  border: '1px solid rgba(56, 189, 248, 0.3)',
  borderRadius: 6,
};
