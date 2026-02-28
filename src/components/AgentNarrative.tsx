// ============================================================
// Agent Narrative Panel — Bottom terminal log
// ============================================================

import { useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';

const typeColors: Record<string, string> = {
  info: '#94a3b8',
  warning: '#f59e0b',
  error: '#ef4444',
  success: '#10b981',
  analysis: '#38bdf8',
};

export default function AgentNarrative() {
  const { narrativeLog } = useSimulation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [narrativeLog]);

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <span style={headerDot} />
        <span style={{ fontWeight: 700 }}>🦞 OpenClaw Chaos Agent</span>
        <span style={headerBadge}>
          {narrativeLog.length > 0 ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>
      <div ref={containerRef} style={logContainerStyle}>
        {narrativeLog.length === 0 && (
          <div style={emptyState}>
            Awaiting scenario activation... Select a scenario to begin resilience analysis.
          </div>
        )}
        {narrativeLog.map((msg, i) => (
          <div key={i} style={logLine}>
            <span style={timestampStyle}>[{msg.timestamp}]</span>
            <span style={{ color: typeColors[msg.type] || '#94a3b8' }}>
              {msg.text}
            </span>
          </div>
        ))}
        {narrativeLog.length > 0 && (
          <div style={cursorLine}>
            <span style={blinkingCursor}>▋</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Styles ----------------------------------------------------------

const panelStyle: React.CSSProperties = {
  background: '#020617',
  borderTop: '1px solid #1e293b',
  display: 'flex',
  flexDirection: 'column',
  height: 200,
  minHeight: 160,
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  background: '#0f172a',
  borderBottom: '1px solid #1e293b',
  fontSize: 12,
  color: '#e2e8f0',
};

const headerDot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#10b981',
  boxShadow: '0 0 6px #10b981',
};

const headerBadge: React.CSSProperties = {
  marginLeft: 'auto',
  fontSize: 10,
  fontWeight: 700,
  color: '#10b981',
  letterSpacing: '0.1em',
};

const logContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '8px 14px',
  fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  fontSize: 12,
  lineHeight: 1.8,
};

const emptyState: React.CSSProperties = {
  color: '#475569',
  fontStyle: 'italic',
};

const logLine: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  whiteSpace: 'pre-wrap',
};

const timestampStyle: React.CSSProperties = {
  color: '#475569',
  flexShrink: 0,
  fontVariantNumeric: 'tabular-nums',
};

const cursorLine: React.CSSProperties = {
  marginTop: 4,
};

const blinkingCursor: React.CSSProperties = {
  color: '#38bdf8',
  animation: 'blink 1s step-end infinite',
};
