// ============================================================
// Cascading Failure Propagation Engine
// ============================================================

import type { InfraNode, InfraEdge, NodeStatus, InfraType } from '../data/internetGraph';

export interface StatusChange {
  nodeId: string;
  newStatus: NodeStatus;
  reason: string;
}

export type Wave = StatusChange[];

// ---- Propagation logic -----------------------------------------------

export function propagateFailure(
  nodes: InfraNode[],
  edges: InfraEdge[],
  killedNodeIds: string[],
): Wave[] {
  // Build status map
  const statusMap = new Map<string, NodeStatus>();
  for (const n of nodes) statusMap.set(n.id, n.status);

  // Build adjacency: source → [{ target, critical }]
  const downstream = new Map<string, { target: string; critical: boolean }[]>();
  for (const e of edges) {
    if (!downstream.has(e.source)) downstream.set(e.source, []);
    downstream.get(e.source)!.push({ target: e.target, critical: e.critical });
  }

  const waves: Wave[] = [];

  // Wave 0: manually killed nodes
  const wave0: Wave = killedNodeIds
    .filter((id) => statusMap.get(id) !== 'down')
    .map((id) => ({
      nodeId: id,
      newStatus: 'down' as NodeStatus,
      reason: 'Directly impacted — service offline.',
    }));

  if (wave0.length === 0) return waves;
  waves.push(wave0);
  for (const c of wave0) statusMap.set(c.nodeId, c.newStatus);

  // Subsequent waves: BFS propagation
  let changed = true;
  while (changed) {
    changed = false;
    const wave: Wave = [];

    for (const node of nodes) {
      const currentStatus = statusMap.get(node.id)!;
      if (currentStatus === 'down') continue; // already dead

      // Find all incoming edges (edges where target === this node)
      const incomingEdges = edges.filter((e) => e.target === node.id);
      if (incomingEdges.length === 0) continue;

      let shouldBeDown = false;
      let shouldBeDegraded = false;
      let reason = '';

      for (const edge of incomingEdges) {
        const sourceStatus = statusMap.get(edge.source)!;

        if (sourceStatus === 'down') {
          if (edge.critical) {
            shouldBeDown = true;
            const sourceNode = nodes.find((n) => n.id === edge.source);
            reason = `Critical dependency ${sourceNode?.label ?? edge.source} is down.`;
            break;
          } else {
            shouldBeDegraded = true;
            const sourceNode = nodes.find((n) => n.id === edge.source);
            reason = `Non-critical dependency ${sourceNode?.label ?? edge.source} is down.`;
          }
        } else if (sourceStatus === 'degraded') {
          if (edge.critical) {
            shouldBeDegraded = true;
            const sourceNode = nodes.find((n) => n.id === edge.source);
            reason = `Critical dependency ${sourceNode?.label ?? edge.source} is degraded.`;
          }
        }
      }

      let newStatus: NodeStatus = currentStatus;
      if (shouldBeDown) newStatus = 'down';
      else if (shouldBeDegraded && currentStatus === 'healthy') newStatus = 'degraded';

      if (newStatus !== currentStatus) {
        wave.push({ nodeId: node.id, newStatus, reason });
      }
    }

    if (wave.length > 0) {
      waves.push(wave);
      for (const c of wave) statusMap.set(c.nodeId, c.newStatus);
      changed = true;
    }
  }

  return waves;
}

// ---- Propagation from current state (for click-to-kill) ---------------

export function propagateFromState(
  nodes: InfraNode[],
  edges: InfraEdge[],
  currentStatusMap: Map<string, NodeStatus>,
  newKillIds: string[],
): Wave[] {
  const statusMap = new Map(currentStatusMap);

  // Wave 0: kill the new nodes
  const wave0: Wave = newKillIds
    .filter((id) => statusMap.get(id) !== 'down')
    .map((id) => {
      const node = nodes.find((n) => n.id === id);
      return {
        nodeId: id,
        newStatus: 'down' as NodeStatus,
        reason: `Manually killed — ${node?.label ?? id} taken offline.`,
      };
    });

  if (wave0.length === 0) return [];
  for (const c of wave0) statusMap.set(c.nodeId, c.newStatus);
  const waves: Wave[] = [wave0];

  // Subsequent waves: BFS propagation from current state
  let changed = true;
  while (changed) {
    changed = false;
    const wave: Wave = [];

    for (const node of nodes) {
      const currentStatus = statusMap.get(node.id)!;
      if (currentStatus === 'down') continue;

      const incomingEdges = edges.filter((e) => e.target === node.id);
      if (incomingEdges.length === 0) continue;

      let shouldBeDown = false;
      let shouldBeDegraded = false;
      let reason = '';

      for (const edge of incomingEdges) {
        const sourceStatus = statusMap.get(edge.source)!;
        if (sourceStatus === 'down') {
          if (edge.critical) {
            shouldBeDown = true;
            const sourceNode = nodes.find((n) => n.id === edge.source);
            reason = `Critical dependency ${sourceNode?.label ?? edge.source} is down.`;
            break;
          } else {
            shouldBeDegraded = true;
            const sourceNode = nodes.find((n) => n.id === edge.source);
            reason = `Non-critical dependency ${sourceNode?.label ?? edge.source} is down.`;
          }
        } else if (sourceStatus === 'degraded') {
          if (edge.critical) {
            shouldBeDegraded = true;
            const sourceNode = nodes.find((n) => n.id === edge.source);
            reason = `Critical dependency ${sourceNode?.label ?? edge.source} is degraded.`;
          }
        }
      }

      let newStatus: NodeStatus = currentStatus;
      if (shouldBeDown) newStatus = 'down';
      else if (shouldBeDegraded && currentStatus === 'healthy') newStatus = 'degraded';

      if (newStatus !== currentStatus) {
        wave.push({ nodeId: node.id, newStatus, reason });
      }
    }

    if (wave.length > 0) {
      waves.push(wave);
      for (const c of wave) statusMap.set(c.nodeId, c.newStatus);
      changed = true;
    }
  }

  return waves;
}

// ---- Metrics computation ---------------------------------------------

export interface Metrics {
  percentOperational: number;
  affectedUsers: number;       // millions
  financialImpact: number;     // millions USD / hour
  servicesDown: number;
  servicesDegraded: number;
  servicesHealthy: number;
}

export function computeMetrics(
  nodes: InfraNode[],
  statusMap: Map<string, NodeStatus>,
): Metrics {
  let totalWeight = 0;
  let healthyWeight = 0;
  let affectedUsers = 0;
  let financialImpact = 0;
  let servicesDown = 0;
  let servicesDegraded = 0;
  let servicesHealthy = 0;

  for (const node of nodes) {
    if (node.type === 'user') continue; // users are the output, not a service

    const status = statusMap.get(node.id) ?? 'healthy';
    totalWeight += node.userCount;

    if (status === 'healthy') {
      healthyWeight += node.userCount;
      servicesHealthy++;
    } else if (status === 'degraded') {
      healthyWeight += node.userCount * 0.5;
      affectedUsers += node.userCount * 0.5;
      financialImpact += node.financialImpactPerHour * 0.3;
      servicesDegraded++;
    } else {
      affectedUsers += node.userCount;
      financialImpact += node.financialImpactPerHour;
      servicesDown++;
    }
  }

  const percentOperational = totalWeight > 0 ? Math.round((healthyWeight / totalWeight) * 100) : 100;

  return {
    percentOperational,
    affectedUsers: Math.round(affectedUsers),
    financialImpact: Math.round(financialImpact),
    servicesDown,
    servicesDegraded,
    servicesHealthy,
  };
}

// ---- Insights / centrality -------------------------------------------

export interface Insight {
  label: string;
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function computeInsights(
  nodes: InfraNode[],
  edges: InfraEdge[],
): Insight[] {
  const insights: Insight[] = [];

  // Degree centrality: outgoing edges per node
  const outDegree = new Map<string, number>();
  for (const e of edges) {
    outDegree.set(e.source, (outDegree.get(e.source) ?? 0) + 1);
  }

  // Most critical node
  let maxNode = '';
  let maxDeg = 0;
  for (const [id, deg] of outDegree) {
    if (deg > maxDeg) {
      maxDeg = deg;
      maxNode = id;
    }
  }
  const maxNodeLabel = nodes.find((n) => n.id === maxNode)?.label ?? maxNode;
  insights.push({
    label: 'Most critical node',
    value: `${maxNodeLabel} (${maxDeg} dependencies)`,
    severity: maxDeg > 5 ? 'critical' : maxDeg > 3 ? 'high' : 'medium',
  });

  // DNS centralization
  const dnsNodes = nodes.filter((n) => n.type === 'dns');
  const dnsDeps = edges.filter((e) => dnsNodes.some((d) => d.id === e.source)).length;
  insights.push({
    label: 'DNS centralization risk',
    value: `${dnsDeps} services depend on ${dnsNodes.length} DNS providers`,
    severity: dnsNodes.length <= 2 ? 'critical' : 'medium',
  });

  // Cloud concentration
  const cloudNodes = nodes.filter((n) => n.type === 'cloud');
  const cloudDeps = new Map<string, number>();
  for (const e of edges) {
    if (cloudNodes.some((c) => c.id === e.source)) {
      cloudDeps.set(e.source, (cloudDeps.get(e.source) ?? 0) + 1);
    }
  }
  let topCloud = '';
  let topCloudDeps = 0;
  for (const [id, count] of cloudDeps) {
    if (count > topCloudDeps) {
      topCloudDeps = count;
      topCloud = id;
    }
  }
  const topCloudLabel = nodes.find((n) => n.id === topCloud)?.label ?? topCloud;
  insights.push({
    label: 'Cloud concentration',
    value: `${topCloudLabel} hosts ${topCloudDeps} services`,
    severity: topCloudDeps >= 4 ? 'high' : 'medium',
  });

  // CDN dependency
  const cdnNodes = nodes.filter((n) => n.type === 'cdn');
  const cdnDeps = edges.filter((e) => cdnNodes.some((c) => c.id === e.source)).length;
  insights.push({
    label: 'CDN dependency density',
    value: `${cdnDeps} services rely on CDN layer`,
    severity: cdnDeps > 5 ? 'high' : 'medium',
  });

  // Single points of failure
  const spofs = [...outDegree.entries()]
    .filter(([, deg]) => deg >= 3)
    .map(([id]) => nodes.find((n) => n.id === id)?.label ?? id);
  if (spofs.length > 0) {
    insights.push({
      label: 'Single points of failure',
      value: spofs.join(', '),
      severity: 'critical',
    });
  }

  return insights;
}

// ---- Narrative generation (scripted fallback) ------------------------

export interface NarrativeMessage {
  timestamp: string;
  text: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'analysis';
}

const nodeTypeLabels: Record<InfraType, string> = {
  dns: 'DNS provider',
  cdn: 'CDN service',
  cloud: 'cloud provider',
  saas: 'SaaS platform',
  finance: 'financial service',
  social: 'social media platform',
  government: 'government service',
  user: 'end user segment',
};

export function generateNarrativeForWave(
  waveIndex: number,
  wave: Wave,
  nodes: InfraNode[],
  totalWaves: number,
): NarrativeMessage[] {
  const messages: NarrativeMessage[] = [];
  const now = new Date();
  now.setSeconds(now.getSeconds() + waveIndex * 3);

  const ts = () => {
    now.setMilliseconds(now.getMilliseconds() + Math.floor(Math.random() * 800) + 200);
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (waveIndex === 0) {
    messages.push({
      timestamp: ts(),
      text: '🦞 OpenClaw Chaos Agent initializing resilience scan...',
      type: 'info',
    });
  }

  for (const change of wave) {
    const node = nodes.find((n) => n.id === change.nodeId);
    if (!node) continue;

    const typeLabel = nodeTypeLabels[node.type];

    if (waveIndex === 0) {
      // Direct failure
      messages.push({
        timestamp: ts(),
        text: `Attempting to reach ${node.label} (${typeLabel})...`,
        type: 'info',
      });
      messages.push({
        timestamp: ts(),
        text: `Connection refused. ${node.label} is OFFLINE.`,
        type: 'error',
      });
      messages.push({
        timestamp: ts(),
        text: `Retrying via alternative endpoint...`,
        type: 'warning',
      });
      messages.push({
        timestamp: ts(),
        text: `Timeout after 2000ms. No fallback available.`,
        type: 'error',
      });
    } else {
      // Cascading failure
      if (change.newStatus === 'down') {
        messages.push({
          timestamp: ts(),
          text: `Attempting to access ${node.label}...`,
          type: 'info',
        });
        messages.push({
          timestamp: ts(),
          text: `${change.reason}`,
          type: 'error',
        });
        messages.push({
          timestamp: ts(),
          text: `${node.label} — STATUS: DOWN. ${node.userCount}M users affected.`,
          type: 'error',
        });
      } else {
        messages.push({
          timestamp: ts(),
          text: `${node.label} responding slowly... ${change.reason}`,
          type: 'warning',
        });
        messages.push({
          timestamp: ts(),
          text: `${node.label} — STATUS: DEGRADED. Partial functionality available.`,
          type: 'warning',
        });
      }
    }
  }

  // Final wave summary
  if (waveIndex === totalWaves - 1) {
    messages.push({
      timestamp: ts(),
      text: `Cascade propagation complete. Analyzing systemic impact...`,
      type: 'analysis',
    });
  }

  return messages;
}

export function generateFinalAnalysis(
  metrics: Metrics,
  insights: Insight[],
): NarrativeMessage[] {
  const now = new Date();
  const ts = () => {
    now.setMilliseconds(now.getMilliseconds() + 500);
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const messages: NarrativeMessage[] = [];

  messages.push({
    timestamp: ts(),
    text: `━━━ RESILIENCE ANALYSIS REPORT ━━━`,
    type: 'analysis',
  });
  messages.push({
    timestamp: ts(),
    text: `Internet operational: ${metrics.percentOperational}%  |  Affected users: ${metrics.affectedUsers}M  |  Financial impact: $${metrics.financialImpact}M/hr`,
    type: metrics.percentOperational < 50 ? 'error' : 'warning',
  });
  messages.push({
    timestamp: ts(),
    text: `Services down: ${metrics.servicesDown}  |  Degraded: ${metrics.servicesDegraded}  |  Healthy: ${metrics.servicesHealthy}`,
    type: 'info',
  });

  for (const insight of insights) {
    const icon = insight.severity === 'critical' ? '🔴' : insight.severity === 'high' ? '🟠' : '🟡';
    messages.push({
      timestamp: ts(),
      text: `${icon} ${insight.label}: ${insight.value}`,
      type: insight.severity === 'critical' ? 'error' : 'warning',
    });
  }

  messages.push({
    timestamp: ts(),
    text: `Conclusion: Modern internet infrastructure is optimized for efficiency, not resilience.`,
    type: 'analysis',
  });

  return messages;
}
