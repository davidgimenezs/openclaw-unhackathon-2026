// ============================================================
// Internet Dependency Graph — Data Model
// ============================================================

export type NodeStatus = 'healthy' | 'degraded' | 'down';

export type InfraType =
  | 'dns'
  | 'cdn'
  | 'cloud'
  | 'saas'
  | 'finance'
  | 'social'
  | 'government'
  | 'user';

export interface InfraNode {
  id: string;
  label: string;
  type: InfraType;
  emoji: string;
  status: NodeStatus;
  userCount: number;          // millions of users affected
  financialImpactPerHour: number; // millions USD / hour
}

export interface InfraEdge {
  source: string; // dependency (upstream)
  target: string; // dependent  (downstream)
  critical: boolean;
}

export interface InternetGraph {
  nodes: InfraNode[];
  edges: InfraEdge[];
}

// ---- Node definitions ------------------------------------------------

export const defaultNodes: InfraNode[] = [
  // DNS layer
  { id: 'dns-root',       label: 'Root DNS',          type: 'dns',        emoji: '🌐', status: 'healthy', userCount: 4500,  financialImpactPerHour: 0 },
  { id: 'cloudflare-dns', label: 'Cloudflare DNS',    type: 'dns',        emoji: '🌐', status: 'healthy', userCount: 500,   financialImpactPerHour: 0 },
  { id: 'google-dns',     label: 'Google DNS',        type: 'dns',        emoji: '🌐', status: 'healthy', userCount: 500,   financialImpactPerHour: 0 },

  // Cloud layer
  { id: 'aws',            label: 'AWS',               type: 'cloud',      emoji: '☁️', status: 'healthy', userCount: 1000,  financialImpactPerHour: 0 },
  { id: 'gcp',            label: 'Google Cloud',      type: 'cloud',      emoji: '☁️', status: 'healthy', userCount: 400,   financialImpactPerHour: 0 },
  { id: 'azure',          label: 'Azure',             type: 'cloud',      emoji: '☁️', status: 'healthy', userCount: 300,   financialImpactPerHour: 0 },

  // CDN layer
  { id: 'cloudflare-cdn', label: 'Cloudflare CDN',    type: 'cdn',        emoji: '📡', status: 'healthy', userCount: 800,   financialImpactPerHour: 0 },
  { id: 'fastly-cdn',     label: 'Fastly CDN',        type: 'cdn',        emoji: '📡', status: 'healthy', userCount: 300,   financialImpactPerHour: 0 },
  { id: 'akamai-cdn',     label: 'Akamai CDN',        type: 'cdn',        emoji: '📡', status: 'healthy', userCount: 400,   financialImpactPerHour: 0 },

  // SaaS / Applications
  { id: 'netflix',        label: 'Netflix',           type: 'saas',       emoji: '🎬', status: 'healthy', userCount: 250,   financialImpactPerHour: 30 },
  { id: 'shopify',        label: 'Shopify',           type: 'saas',       emoji: '🛒', status: 'healthy', userCount: 50,    financialImpactPerHour: 20 },
  { id: 'gmail',          label: 'Gmail',             type: 'saas',       emoji: '📧', status: 'healthy', userCount: 1800,  financialImpactPerHour: 15 },
  { id: 'github',         label: 'GitHub',            type: 'saas',       emoji: '💻', status: 'healthy', userCount: 100,   financialImpactPerHour: 10 },

  // Social media
  { id: 'twitter',        label: 'X / Twitter',       type: 'social',     emoji: '🐦', status: 'healthy', userCount: 400,   financialImpactPerHour: 5 },

  // Finance
  { id: 'stripe',         label: 'Stripe',            type: 'finance',    emoji: '💳', status: 'healthy', userCount: 100,   financialImpactPerHour: 100 },
  { id: 'bank-app',       label: 'Banking Services',  type: 'finance',    emoji: '🏦', status: 'healthy', userCount: 500,   financialImpactPerHour: 200 },

  // Government
  { id: 'gov-services',   label: 'Gov Services',      type: 'government', emoji: '🏛️', status: 'healthy', userCount: 300,   financialImpactPerHour: 50 },

  // End users
  { id: 'users',          label: 'End Users',         type: 'user',       emoji: '👤', status: 'healthy', userCount: 4500,  financialImpactPerHour: 0 },
];

// ---- Edge definitions ------------------------------------------------

export const defaultEdges: InfraEdge[] = [
  // DNS root feeds every DNS resolver
  { source: 'dns-root',       target: 'cloudflare-dns', critical: true },
  { source: 'dns-root',       target: 'google-dns',     critical: true },

  // DNS resolvers feed CDNs
  { source: 'cloudflare-dns', target: 'cloudflare-cdn', critical: true },
  { source: 'google-dns',     target: 'gcp',            critical: false },

  // Cloud feeds services
  { source: 'aws',            target: 'netflix',        critical: true },
  { source: 'aws',            target: 'shopify',        critical: true },
  { source: 'aws',            target: 'stripe',         critical: true },
  { source: 'aws',            target: 'github',         critical: true },
  { source: 'aws',            target: 'bank-app',       critical: false },
  { source: 'gcp',            target: 'gmail',          critical: true },
  { source: 'azure',          target: 'gov-services',   critical: true },
  { source: 'azure',          target: 'bank-app',       critical: true },

  // CDN feeds services
  { source: 'cloudflare-cdn', target: 'netflix',        critical: false },
  { source: 'cloudflare-cdn', target: 'twitter',        critical: false },
  { source: 'cloudflare-cdn', target: 'shopify',        critical: false },
  { source: 'fastly-cdn',     target: 'twitter',        critical: true },
  { source: 'fastly-cdn',     target: 'github',         critical: false },
  { source: 'akamai-cdn',     target: 'bank-app',       critical: false },
  { source: 'akamai-cdn',     target: 'gov-services',   critical: false },

  // DNS direct dependencies
  { source: 'dns-root',       target: 'bank-app',       critical: true },
  { source: 'dns-root',       target: 'gov-services',   critical: true },
  { source: 'dns-root',       target: 'stripe',         critical: false },
  { source: 'google-dns',     target: 'gmail',          critical: true },

  // Services feed users
  { source: 'netflix',        target: 'users',          critical: false },
  { source: 'twitter',        target: 'users',          critical: false },
  { source: 'gmail',          target: 'users',          critical: false },
  { source: 'github',         target: 'users',          critical: false },
  { source: 'shopify',        target: 'users',          critical: false },
  { source: 'stripe',         target: 'users',          critical: false },
  { source: 'bank-app',       target: 'users',          critical: true },
  { source: 'gov-services',   target: 'users',          critical: false },
];

// ---- Scenario definitions -------------------------------------------

export type ScenarioId = 'dns-collapse' | 'cdn-outage' | 'aws-outage';

export interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  killNodes: string[];
}

export const scenarios: Scenario[] = [
  {
    id: 'dns-collapse',
    label: 'DNS Collapse',
    description: 'Root DNS servers fail — name resolution breaks globally.',
    killNodes: ['dns-root'],
  },
  {
    id: 'cdn-outage',
    label: 'CDN Outage',
    description: 'All major CDN providers go down simultaneously.',
    killNodes: ['cloudflare-cdn', 'fastly-cdn', 'akamai-cdn'],
  },
  {
    id: 'aws-outage',
    label: 'AWS Outage',
    description: 'Amazon Web Services suffers a complete outage.',
    killNodes: ['aws'],
  },
];

// ---- Decentralization helper ----------------------------------------

export function applyDecentralization(
  nodes: InfraNode[],
  edges: InfraEdge[],
  level: number, // 0–100
): { nodes: InfraNode[]; edges: InfraEdge[] } {
  if (level <= 10) return { nodes: [...nodes], edges: [...edges] };

  const newEdges = edges.map((e) => ({ ...e }));
  const extra: InfraEdge[] = [];

  const factor = level / 100;

  // At higher decentralization levels, add redundant providers and
  // downgrade critical edges to non-critical.
  if (factor >= 0.3) {
    // Netflix failover to GCP
    extra.push({ source: 'gcp', target: 'netflix', critical: false });
    // Shopify failover to Azure
    extra.push({ source: 'azure', target: 'shopify', critical: false });
  }

  if (factor >= 0.5) {
    // Bank gets backup DNS via Google
    extra.push({ source: 'google-dns', target: 'bank-app', critical: false });
    // GitHub failover to Azure
    extra.push({ source: 'azure', target: 'github', critical: false });
    // Stripe failover to GCP
    extra.push({ source: 'gcp', target: 'stripe', critical: false });
  }

  if (factor >= 0.7) {
    // Downgrade sole-provider critical edges
    for (const e of newEdges) {
      if (e.critical) {
        // Check if we added redundancy for this target
        const hasAlt = extra.some((x) => x.target === e.target) ||
                       newEdges.filter((x) => x.target === e.target).length > 1;
        if (hasAlt) {
          e.critical = false;
        }
      }
    }
    // Gmail failover
    extra.push({ source: 'aws', target: 'gmail', critical: false });
    // Gov Services failover DNS
    extra.push({ source: 'google-dns', target: 'gov-services', critical: false });
  }

  // Deduplicate
  const allEdges = [...newEdges, ...extra];
  const seen = new Set<string>();
  const deduped = allEdges.filter((e) => {
    const key = `${e.source}->${e.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { nodes: [...nodes], edges: deduped };
}

// ---- Manual layout positions (4-row layout) -------------------------

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export function getNodePositions(): NodePosition[] {
  const xSpacing = 200;
  const ySpacing = 180;

  return [
    // Row 0 — DNS layer
    { id: 'dns-root',       x: 2 * xSpacing, y: 0 },
    { id: 'cloudflare-dns', x: 1 * xSpacing, y: ySpacing },
    { id: 'google-dns',     x: 3 * xSpacing, y: ySpacing },

    // Row 1 — Infrastructure (Cloud + CDN)
    { id: 'aws',            x: 0 * xSpacing, y: 2 * ySpacing },
    { id: 'gcp',            x: 2 * xSpacing, y: 2 * ySpacing },
    { id: 'azure',          x: 4 * xSpacing, y: 2 * ySpacing },
    { id: 'cloudflare-cdn', x: 1 * xSpacing, y: 2 * ySpacing },
    { id: 'fastly-cdn',     x: 3 * xSpacing, y: 2 * ySpacing },
    { id: 'akamai-cdn',     x: 5 * xSpacing, y: 2 * ySpacing },

    // Row 2 — Applications
    { id: 'netflix',        x: 0 * xSpacing, y: 3 * ySpacing },
    { id: 'shopify',        x: 1 * xSpacing, y: 3 * ySpacing },
    { id: 'stripe',         x: 2 * xSpacing, y: 3 * ySpacing },
    { id: 'github',         x: 3 * xSpacing, y: 3 * ySpacing },
    { id: 'gmail',          x: 4 * xSpacing, y: 3 * ySpacing },
    { id: 'twitter',        x: 5 * xSpacing, y: 3 * ySpacing },
    { id: 'bank-app',       x: 6 * xSpacing, y: 3 * ySpacing },
    { id: 'gov-services',   x: 7 * xSpacing, y: 3 * ySpacing },

    // Row 3 — Users
    { id: 'users',          x: 3.5 * xSpacing, y: 4 * ySpacing },
  ];
}
