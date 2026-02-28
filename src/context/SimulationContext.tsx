// ============================================================
// Shared simulation state via React Context
// ============================================================

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  defaultNodes,
  defaultEdges,
  applyDecentralization,
  scenarios,
} from '../data/internetGraph';
import type {
  InfraNode,
  InfraEdge,
  NodeStatus,
  ScenarioId,
} from '../data/internetGraph';
import {
  propagateFailure,
  propagateFromState,
  computeMetrics,
  computeInsights,
  generateNarrativeForWave,
  generateFinalAnalysis,
} from '../engine/propagation';
import type { Metrics, Insight, NarrativeMessage, Wave } from '../engine/propagation';
import { analyzeSite, generateSiteNarrative } from '../engine/siteAnalyzer';
import type { SiteAnalysis } from '../engine/siteAnalyzer';
import { playFailure, playDegraded, playAlarm, playReset } from '../utils/sound';

export interface SimulationState {
  nodes: InfraNode[];
  edges: InfraEdge[];
  statusMap: Map<string, NodeStatus>;
  metrics: Metrics;
  comparisonMetrics: Metrics | null;
  insights: Insight[];
  narrativeLog: NarrativeMessage[];
  isRunning: boolean;
  currentWave: number;
  totalWaves: number;
  decentralization: number;
  activeScenario: ScenarioId | null;
  analyzedSite: SiteAnalysis | null;
}

export interface SimulationActions {
  runScenario: (scenarioId: ScenarioId) => void;
  killNode: (nodeId: string) => void;
  analyzeSiteUrl: (url: string) => void;
  reset: () => void;
  setDecentralization: (level: number) => void;
}

const defaultMetrics: Metrics = {
  percentOperational: 100,
  affectedUsers: 0,
  financialImpact: 0,
  servicesDown: 0,
  servicesDegraded: 0,
  servicesHealthy: defaultNodes.filter((n) => n.type !== 'user').length,
};

const SimulationContext = createContext<(SimulationState & SimulationActions) | null>(null);

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [statusMap, setStatusMap] = useState<Map<string, NodeStatus>>(
    () => new Map(defaultNodes.map((n) => [n.id, 'healthy']))
  );
  const [metrics, setMetrics] = useState<Metrics>(defaultMetrics);
  const [comparisonMetrics, setComparisonMetrics] = useState<Metrics | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [narrativeLog, setNarrativeLog] = useState<NarrativeMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentWave, setCurrentWave] = useState(0);
  const [totalWaves, setTotalWaves] = useState(0);
  const [decentralization, setDecentralizationState] = useState(0);
  const [activeScenario, setActiveScenario] = useState<ScenarioId | null>(null);
  const [analyzedSite, setAnalyzedSite] = useState<SiteAnalysis | null>(null);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const killedNodesRef = useRef<string[]>([]);
  const graphRef = useRef<{ nodes: InfraNode[]; edges: InfraEdge[] }>({
    nodes: defaultNodes,
    edges: defaultEdges,
  });

  /** Compute what metrics would look like with 100% decentralization */
  const computeComparison = useCallback((killIds: string[]) => {
    const altGraph = applyDecentralization(defaultNodes, defaultEdges, 100);
    const altWaves = propagateFailure(altGraph.nodes, altGraph.edges, killIds);
    const altStatus = new Map(altGraph.nodes.map((n) => [n.id, 'healthy' as NodeStatus]));
    for (const w of altWaves) for (const c of w) altStatus.set(c.nodeId, c.newStatus);
    return computeMetrics(altGraph.nodes, altStatus);
  }, []);

  const setDecentralization = useCallback((level: number) => {
    setDecentralizationState(level);
    const { nodes: newNodes, edges: newEdges } = applyDecentralization(
      defaultNodes,
      defaultEdges,
      level,
    );
    graphRef.current = { nodes: newNodes, edges: newEdges };
  }, []);

  const reset = useCallback(() => {
    // Clear timers
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];

    const newStatusMap = new Map(defaultNodes.map((n) => [n.id, 'healthy' as NodeStatus]));
    setStatusMap(newStatusMap);
    setMetrics(defaultMetrics);
    setComparisonMetrics(null);
    setInsights([]);
    setNarrativeLog([]);
    setIsRunning(false);
    setCurrentWave(0);
    setTotalWaves(0);
    setActiveScenario(null);
    setAnalyzedSite(null);
    killedNodesRef.current = [];
    // Restore graph without custom site node
    const { nodes: baseNodes, edges: baseEdges } = applyDecentralization(defaultNodes, defaultEdges, decentralization);
    graphRef.current = { nodes: baseNodes, edges: baseEdges };
    playReset();
  }, [decentralization]);

  const killNode = useCallback(
    (nodeId: string) => {
      if (isRunning) return; // ignore during animation

      const { nodes: currentNodes, edges: currentEdges } = graphRef.current;
      const node = currentNodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Get current status — don't kill already-down nodes
      const currentStatus = statusMap.get(nodeId);
      if (currentStatus === 'down') return;

      killedNodesRef.current = [...killedNodesRef.current, nodeId];
      setComparisonMetrics(null);

      // Compute cascading waves from current state
      const waves: Wave[] = propagateFromState(currentNodes, currentEdges, statusMap, [nodeId]);
      if (waves.length === 0) return;

      setIsRunning(true);
      setActiveScenario(null);
      setTotalWaves(waves.length);
      setCurrentWave(0);

      // Add narrative for manual kill
      const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setNarrativeLog((prev) => [
        ...prev,
        { timestamp: ts(), text: `\u2501\u2501\u2501 MANUAL KILL: ${node.label.toUpperCase()} \u2501\u2501\u2501`, type: 'analysis' },
        { timestamp: ts(), text: `Operator manually terminated ${node.label}. Analyzing cascade...`, type: 'warning' },
      ]);

      playAlarm();

      // Animate waves
      const WAVE_DELAY = 1200;
      waves.forEach((wave, waveIndex) => {
        const timer = setTimeout(() => {
          setStatusMap((prev) => {
            const next = new Map(prev);
            for (const c of wave) {
              next.set(c.nodeId, c.newStatus);
              if (c.newStatus === 'down') playFailure();
              else if (c.newStatus === 'degraded') playDegraded();
            }
            return next;
          });

          setStatusMap((prev) => {
            const m = computeMetrics(currentNodes, prev);
            setMetrics(m);
            return prev;
          });

          setCurrentWave(waveIndex + 1);

          const messages = generateNarrativeForWave(waveIndex, wave, currentNodes, waves.length);
          setNarrativeLog((prev) => [...prev, ...messages]);

          if (waveIndex === waves.length - 1) {
            const finalTimer = setTimeout(() => {
              setStatusMap((prev) => {
                const finalMetrics = computeMetrics(currentNodes, prev);
                setMetrics(finalMetrics);
                const finalInsights = computeInsights(currentNodes, currentEdges);
                setInsights(finalInsights);
                const analysis = generateFinalAnalysis(finalMetrics, finalInsights);
                setNarrativeLog((p) => [...p, ...analysis]);
                return prev;
              });
              // Compute comparison metrics (what if 100% decentralized?)
              setComparisonMetrics(computeComparison(killedNodesRef.current));
              setIsRunning(false);
            }, 1000);
            timersRef.current.push(finalTimer);
          }
        }, (waveIndex + 1) * WAVE_DELAY);
        timersRef.current.push(timer);
      });
    },
    [isRunning, statusMap, computeComparison],
  );

  const analyzeSiteUrl = useCallback(
    (url: string) => {
      if (isRunning) return;

      // Run analysis
      const analysis = analyzeSite(url);
      setAnalyzedSite(analysis);

      // Add custom node + edges to the graph
      const current = graphRef.current;
      // Remove any previous custom node
      const cleanNodes = current.nodes.filter((n) => !n.id.startsWith('custom-'));
      const cleanEdges = current.edges.filter(
        (e) => !e.source.startsWith('custom-') && !e.target.startsWith('custom-'),
      );

      graphRef.current = {
        nodes: [...cleanNodes, analysis.node],
        edges: [...cleanEdges, ...analysis.edges],
      };

      // Reset status map to include the new node
      const newStatusMap = new Map(
        graphRef.current.nodes.map((n) => [n.id, 'healthy' as NodeStatus]),
      );
      setStatusMap(newStatusMap);
      setMetrics(computeMetrics(graphRef.current.nodes, newStatusMap));

      // Add narrative
      const narrativeMessages = generateSiteNarrative(analysis);
      setNarrativeLog((prev) => [...prev, ...narrativeMessages]);

      playAlarm();
    },
    [isRunning],
  );

  const runScenario = useCallback(
    (scenarioId: ScenarioId) => {
      // Clear previous
      for (const t of timersRef.current) clearTimeout(t);
      timersRef.current = [];

      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (!scenario) return;

      // Reset status
      const freshStatusMap = new Map(defaultNodes.map((n) => [n.id, 'healthy' as NodeStatus]));

      // Get current graph (with decentralization applied)
      const { nodes: currentNodes, edges: currentEdges } = graphRef.current;

      // Compute waves
      const waves: Wave[] = propagateFailure(currentNodes, currentEdges, scenario.killNodes);

      killedNodesRef.current = scenario.killNodes;
      setComparisonMetrics(null);
      setIsRunning(true);
      setActiveScenario(scenarioId);
      setTotalWaves(waves.length);
      setCurrentWave(0);
      setStatusMap(freshStatusMap);
      setMetrics(defaultMetrics);
      setInsights([]);

      playAlarm();

      setNarrativeLog([{
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: `━━━ SCENARIO: ${scenario.label.toUpperCase()} ━━━`,
        type: 'analysis',
      }, {
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        text: scenario.description,
        type: 'info',
      }]);

      // Animate waves with delays
      const WAVE_DELAY = 1200; // ms between waves

      waves.forEach((wave, waveIndex) => {
        const timer = setTimeout(() => {
          // Apply status changes
          setStatusMap((prev) => {
            const next = new Map(prev);
            for (const c of wave) {
              next.set(c.nodeId, c.newStatus);
              if (c.newStatus === 'down') playFailure();
              else if (c.newStatus === 'degraded') playDegraded();
            }
            return next;
          });

          // Update metrics
          setStatusMap((prev) => {
            const m = computeMetrics(currentNodes, prev);
            setMetrics(m);
            return prev;
          });

          setCurrentWave(waveIndex + 1);

          // Add narrative messages
          const messages = generateNarrativeForWave(waveIndex, wave, currentNodes, waves.length);
          setNarrativeLog((prev) => [...prev, ...messages]);

          // On last wave
          if (waveIndex === waves.length - 1) {
            const finalTimer = setTimeout(() => {
              setStatusMap((prev) => {
                const finalMetrics = computeMetrics(currentNodes, prev);
                setMetrics(finalMetrics);
                const finalInsights = computeInsights(currentNodes, currentEdges);
                setInsights(finalInsights);
                const analysis = generateFinalAnalysis(finalMetrics, finalInsights);
                setNarrativeLog((p) => [...p, ...analysis]);
                return prev;
              });
              // Compute comparison metrics (what if 100% decentralized?)
              setComparisonMetrics(computeComparison(killedNodesRef.current));
              setIsRunning(false);
            }, 1000);
            timersRef.current.push(finalTimer);
          }
        }, (waveIndex + 1) * WAVE_DELAY);
        timersRef.current.push(timer);
      });
    },
    [computeComparison],
  );

  return (
    <SimulationContext.Provider
      value={{
        nodes: graphRef.current.nodes,
        edges: graphRef.current.edges,
        statusMap,
        metrics,
        comparisonMetrics,
        insights,
        narrativeLog,
        isRunning,
        currentWave,
        totalWaves,
        decentralization,
        activeScenario,
        analyzedSite,
        runScenario,
        killNode,
        analyzeSiteUrl,
        reset,
        setDecentralization,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}
