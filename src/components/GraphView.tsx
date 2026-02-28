// ============================================================
// Graph Visualization — React Flow
// ============================================================

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import InfraNodeComponent from './InfraNode';
import { useSimulation } from '../context/SimulationContext';
import { getNodePositions } from '../data/internetGraph';
import type { NodeStatus } from '../data/internetGraph';

const nodeTypes = { infra: InfraNodeComponent };

const statusEdgeColors: Record<NodeStatus, string> = {
  healthy: '#334155',
  degraded: '#f59e0b',
  down: '#ef4444',
};

export default function GraphView() {
  const { nodes: infraNodes, edges: infraEdges, statusMap, killNode, isRunning } = useSimulation();
  const positions = useMemo(() => getNodePositions(), []);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (!isRunning) {
      killNode(node.id);
    }
  }, [killNode, isRunning]);

  const flowNodes: Node[] = useMemo(() => {
    return infraNodes.map((n) => {
      const pos = positions.find((p) => p.id === n.id);
      // Custom site nodes get placed prominently in the app row
      const isCustom = n.id.startsWith('custom-');
      const customPos = isCustom ? { x: 8.5 * 200, y: 3 * 180 } : null;
      return {
        id: n.id,
        type: 'infra',
        position: { x: customPos?.x ?? pos?.x ?? 0, y: customPos?.y ?? pos?.y ?? 0 },
        data: {
          label: n.label,
          emoji: n.emoji,
          status: statusMap.get(n.id) ?? 'healthy',
          infraType: n.type,
          isCustom,
        },
      };
    });
  }, [infraNodes, statusMap, positions]);

  const flowEdges: Edge[] = useMemo(() => {
    return infraEdges.map((e, i) => {
      const sourceStatus = statusMap.get(e.source) ?? 'healthy';
      const targetStatus = statusMap.get(e.target) ?? 'healthy';
      const worstStatus: NodeStatus =
        sourceStatus === 'down' || targetStatus === 'down'
          ? 'down'
          : sourceStatus === 'degraded' || targetStatus === 'degraded'
            ? 'degraded'
            : 'healthy';

      return {
        id: `e-${e.source}-${e.target}-${i}`,
        source: e.source,
        target: e.target,
        animated: worstStatus !== 'healthy',
        style: {
          stroke: statusEdgeColors[worstStatus],
          strokeWidth: e.critical ? 2.5 : 1.5,
          strokeDasharray: e.critical ? undefined : '5,5',
          transition: 'stroke 0.6s ease',
        },
        label: e.critical ? '' : '',
      };
    });
  }, [infraEdges, statusMap]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const status = (node.data as { status?: NodeStatus }).status ?? 'healthy';
            return status === 'healthy' ? '#10b981' : status === 'degraded' ? '#f59e0b' : '#ef4444';
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
          style={{ background: '#0f172a' }}
        />
      </ReactFlow>
    </div>
  );
}
