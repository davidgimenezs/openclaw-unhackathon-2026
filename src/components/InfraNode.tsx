// ============================================================
// Custom React Flow Node — Infrastructure Node
// ============================================================

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeStatus } from '../data/internetGraph';

interface InfraNodeData {
  label: string;
  emoji: string;
  status: NodeStatus;
  infraType: string;
  isCustom?: boolean;
  [key: string]: unknown;
}

const statusColors: Record<NodeStatus, string> = {
  healthy:  '#10b981',
  degraded: '#f59e0b',
  down:     '#ef4444',
};

const statusBg: Record<NodeStatus, string> = {
  healthy:  'rgba(16, 185, 129, 0.15)',
  degraded: 'rgba(245, 158, 11, 0.15)',
  down:     'rgba(239, 68, 68, 0.15)',
};

const statusGlow: Record<NodeStatus, string> = {
  healthy:  '0 0 12px rgba(16, 185, 129, 0.3)',
  degraded: '0 0 16px rgba(245, 158, 11, 0.5)',
  down:     '0 0 20px rgba(239, 68, 68, 0.6)',
};

function InfraNodeComponent({ data }: { data: InfraNodeData }) {
  const status = data.status ?? 'healthy';
  const color = statusColors[status];
  const isCustom = data.isCustom ?? false;

  const pulseClass = status === 'down' ? 'infra-pulse-down' : status === 'degraded' ? 'infra-pulse-degraded' : '';

  return (
    <div
      className={pulseClass}
      style={{
        background: isCustom && status === 'healthy'
          ? 'rgba(56, 189, 248, 0.15)'
          : statusBg[status],
        border: isCustom
          ? `2px solid ${status === 'healthy' ? '#38bdf8' : color}`
          : `2px solid ${color}`,
        borderRadius: 12,
        padding: '10px 16px',
        minWidth: 140,
        textAlign: 'center',
        boxShadow: isCustom && status === 'healthy'
          ? '0 0 20px rgba(56, 189, 248, 0.4), 0 0 40px rgba(56, 189, 248, 0.15)'
          : statusGlow[status],
        transition: 'all 0.6s ease',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {isCustom && (
        <div style={{
          position: 'absolute',
          top: -8,
          right: -8,
          background: '#38bdf8',
          color: '#020617',
          fontSize: 8,
          fontWeight: 800,
          padding: '2px 6px',
          borderRadius: 4,
          letterSpacing: '0.08em',
        }}>
          YOUR SITE
        </div>
      )}
      <Handle type="target" position={Position.Top} style={{ background: color, border: 'none', width: 8, height: 8 }} />
      <div style={{ fontSize: 24, marginBottom: 4 }}>{data.emoji}</div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#e2e8f0',
          letterSpacing: '0.02em',
        }}
      >
        {data.label}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color,
          textTransform: 'uppercase',
          marginTop: 4,
          letterSpacing: '0.08em',
        }}
      >
        {status === 'healthy' ? '● ONLINE' : status === 'degraded' ? '◐ DEGRADED' : '✕ DOWN'}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

export default memo(InfraNodeComponent);
