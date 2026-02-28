// ============================================================
// URL → Infrastructure Dependency Analyzer
// ============================================================
//
// Given a URL, infer which infrastructure nodes the site likely
// depends on, and produce a custom node + edges for the graph.
// ============================================================

import type { InfraNode, InfraEdge, InfraType } from '../data/internetGraph';

export interface SiteAnalysis {
  url: string;
  domain: string;
  node: InfraNode;
  edges: InfraEdge[];
  dependencyIds: string[];
  summary: string;
}

// ---- Known domain → infrastructure mapping --------------------------

interface DomainProfile {
  cloud: string[];      // IDs of cloud providers
  cdn: string[];        // IDs of CDN providers
  dns: string[];        // IDs of DNS providers
  extraDeps: string[];  // any other graph node IDs
  type: InfraType;
  emoji: string;
  userCount: number;
  financialImpact: number;
}

const knownDomains: Record<string, DomainProfile> = {
  // Big tech
  'google.com':      { cloud: ['gcp'], cdn: [], dns: ['google-dns'], extraDeps: [], type: 'saas', emoji: '🔍', userCount: 4000, financialImpact: 200 },
  'youtube.com':     { cloud: ['gcp'], cdn: ['cloudflare-cdn'], dns: ['google-dns'], extraDeps: [], type: 'saas', emoji: '📺', userCount: 2500, financialImpact: 80 },
  'gmail.com':       { cloud: ['gcp'], cdn: [], dns: ['google-dns'], extraDeps: ['gmail'], type: 'saas', emoji: '📧', userCount: 1800, financialImpact: 15 },
  'facebook.com':    { cloud: ['aws'], cdn: ['akamai-cdn'], dns: ['dns-root'], extraDeps: [], type: 'social', emoji: '📘', userCount: 3000, financialImpact: 60 },
  'instagram.com':   { cloud: ['aws'], cdn: ['cloudflare-cdn', 'akamai-cdn'], dns: ['dns-root'], extraDeps: [], type: 'social', emoji: '📸', userCount: 2000, financialImpact: 40 },
  'twitter.com':     { cloud: ['aws'], cdn: ['fastly-cdn'], dns: ['dns-root'], extraDeps: ['twitter'], type: 'social', emoji: '🐦', userCount: 400, financialImpact: 5 },
  'x.com':           { cloud: ['aws'], cdn: ['fastly-cdn'], dns: ['dns-root'], extraDeps: ['twitter'], type: 'social', emoji: '🐦', userCount: 400, financialImpact: 5 },
  'reddit.com':      { cloud: ['aws'], cdn: ['fastly-cdn', 'cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'social', emoji: '🤖', userCount: 800, financialImpact: 5 },
  'tiktok.com':      { cloud: ['aws', 'gcp'], cdn: ['akamai-cdn', 'cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'social', emoji: '🎵', userCount: 1500, financialImpact: 30 },
  'linkedin.com':    { cloud: ['azure'], cdn: ['akamai-cdn'], dns: ['dns-root'], extraDeps: [], type: 'saas', emoji: '💼', userCount: 900, financialImpact: 15 },
  'whatsapp.com':    { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['dns-root'], extraDeps: [], type: 'social', emoji: '💬', userCount: 2000, financialImpact: 10 },

  // Development
  'github.com':      { cloud: ['azure'], cdn: ['fastly-cdn'], dns: ['dns-root'], extraDeps: ['github'], type: 'saas', emoji: '💻', userCount: 100, financialImpact: 10 },
  'gitlab.com':      { cloud: ['gcp'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '🦊', userCount: 30, financialImpact: 5 },
  'stackoverflow.com': { cloud: ['aws'], cdn: ['fastly-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '📚', userCount: 100, financialImpact: 2 },
  'npmjs.com':       { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '📦', userCount: 20, financialImpact: 8 },
  'vercel.com':      { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'cloud', emoji: '▲', userCount: 10, financialImpact: 3 },
  'netlify.com':     { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['dns-root'], extraDeps: [], type: 'cloud', emoji: '🌐', userCount: 5, financialImpact: 2 },

  // E-commerce & Finance
  'amazon.com':      { cloud: ['aws'], cdn: ['cloudflare-cdn', 'akamai-cdn'], dns: ['dns-root'], extraDeps: ['stripe'], type: 'saas', emoji: '📦', userCount: 2000, financialImpact: 400 },
  'shopify.com':     { cloud: ['gcp'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: ['shopify', 'stripe'], type: 'saas', emoji: '🛒', userCount: 50, financialImpact: 20 },
  'stripe.com':      { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['dns-root'], extraDeps: ['stripe'], type: 'finance', emoji: '💳', userCount: 100, financialImpact: 100 },
  'paypal.com':      { cloud: ['gcp', 'aws'], cdn: ['akamai-cdn'], dns: ['dns-root'], extraDeps: [], type: 'finance', emoji: '💰', userCount: 400, financialImpact: 150 },
  'ebay.com':        { cloud: ['gcp'], cdn: ['akamai-cdn'], dns: ['dns-root'], extraDeps: ['stripe'], type: 'saas', emoji: '🏷️', userCount: 150, financialImpact: 30 },

  // Streaming & Entertainment
  'netflix.com':     { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['dns-root'], extraDeps: ['netflix'], type: 'saas', emoji: '🎬', userCount: 250, financialImpact: 30 },
  'spotify.com':     { cloud: ['gcp'], cdn: ['fastly-cdn', 'cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '🎵', userCount: 500, financialImpact: 15 },
  'twitch.tv':       { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['dns-root'], extraDeps: [], type: 'saas', emoji: '🎮', userCount: 140, financialImpact: 5 },
  'disney.com':      { cloud: ['aws'], cdn: ['akamai-cdn'], dns: ['dns-root'], extraDeps: [], type: 'saas', emoji: '🏰', userCount: 200, financialImpact: 20 },

  // Cloud/SaaS
  'zoom.us':         { cloud: ['aws', 'azure'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '📹', userCount: 300, financialImpact: 25 },
  'slack.com':       { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '💬', userCount: 30, financialImpact: 15 },
  'notion.so':       { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '📝', userCount: 30, financialImpact: 3 },
  'figma.com':       { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '🎨', userCount: 10, financialImpact: 5 },
  'openai.com':      { cloud: ['azure'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '🤖', userCount: 200, financialImpact: 20 },
  'chatgpt.com':     { cloud: ['azure'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '🤖', userCount: 200, financialImpact: 20 },

  // News & Media
  'nytimes.com':     { cloud: ['gcp'], cdn: ['fastly-cdn'], dns: ['dns-root'], extraDeps: [], type: 'saas', emoji: '📰', userCount: 100, financialImpact: 2 },
  'bbc.com':         { cloud: ['aws'], cdn: ['akamai-cdn'], dns: ['dns-root'], extraDeps: [], type: 'saas', emoji: '📰', userCount: 400, financialImpact: 3 },
  'cnn.com':         { cloud: ['aws'], cdn: ['fastly-cdn', 'akamai-cdn'], dns: ['dns-root'], extraDeps: [], type: 'saas', emoji: '📰', userCount: 200, financialImpact: 2 },
  'wikipedia.org':   { cloud: [], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], extraDeps: [], type: 'saas', emoji: '📖', userCount: 1500, financialImpact: 0 },

  // Government
  'irs.gov':         { cloud: ['aws'], cdn: ['akamai-cdn'], dns: ['dns-root'], extraDeps: ['gov-services'], type: 'government', emoji: '🏛️', userCount: 50, financialImpact: 100 },
  'usa.gov':         { cloud: ['aws'], cdn: ['akamai-cdn'], dns: ['dns-root'], extraDeps: ['gov-services'], type: 'government', emoji: '🏛️', userCount: 30, financialImpact: 20 },
  'gov.uk':          { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['dns-root'], extraDeps: ['gov-services'], type: 'government', emoji: '🏛️', userCount: 60, financialImpact: 30 },
};

// ---- TLD → likely infrastructure inference --------------------------

const tldInference: Record<string, Partial<DomainProfile>> = {
  '.gov':    { cloud: ['aws'], cdn: ['akamai-cdn'], dns: ['dns-root'], type: 'government', emoji: '🏛️' },
  '.edu':    { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['dns-root'], type: 'saas', emoji: '🎓' },
  '.org':    { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['dns-root'], type: 'saas', emoji: '🌍' },
  '.io':     { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], type: 'saas', emoji: '💻' },
  '.dev':    { cloud: ['gcp'], cdn: ['cloudflare-cdn'], dns: ['google-dns'], type: 'saas', emoji: '🔧' },
  '.app':    { cloud: ['gcp'], cdn: ['cloudflare-cdn'], dns: ['google-dns'], type: 'saas', emoji: '📱' },
  '.co':     { cloud: ['aws'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], type: 'saas', emoji: '🏢' },
  '.ai':     { cloud: ['aws', 'gcp'], cdn: ['cloudflare-cdn'], dns: ['cloudflare-dns'], type: 'saas', emoji: '🤖' },
};

// ---- Public API -----------------------------------------------------

export function analyzeSite(rawUrl: string): SiteAnalysis {
  // Normalize the URL
  let url = rawUrl.trim();
  if (!url.match(/^https?:\/\//)) url = `https://${url}`;

  let domain: string;
  try {
    domain = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  }

  // Check known domains
  const known = knownDomains[domain];
  const tld = Object.keys(tldInference).find((t) => domain.endsWith(t));
  const tldProfile = tld ? tldInference[tld] : null;

  const profile: DomainProfile = known ?? {
    cloud: tldProfile?.cloud ?? ['aws'],
    cdn: tldProfile?.cdn ?? ['cloudflare-cdn'],
    dns: tldProfile?.dns ?? ['dns-root'],
    extraDeps: [],
    type: tldProfile?.type ?? 'saas',
    emoji: tldProfile?.emoji ?? '🌐',
    userCount: 10,
    financialImpact: 1,
  };

  // Build the custom node
  const nodeId = `custom-${domain.replace(/\./g, '-')}`;
  const node: InfraNode = {
    id: nodeId,
    label: domain,
    type: profile.type,
    emoji: profile.emoji,
    status: 'healthy',
    userCount: profile.userCount,
    financialImpactPerHour: profile.financialImpact,
  };

  // Build edges from infrastructure → this site
  const edges: InfraEdge[] = [];
  const dependencyIds: string[] = [];

  // DNS dependencies (always critical — can't reach a site without DNS)
  for (const dns of profile.dns) {
    edges.push({ source: dns, target: nodeId, critical: true });
    if (!dependencyIds.includes(dns)) dependencyIds.push(dns);
  }

  // Cloud dependencies (critical — the site is hosted there)
  for (const cloud of profile.cloud) {
    edges.push({ source: cloud, target: nodeId, critical: profile.cloud.length === 1 });
    if (!dependencyIds.includes(cloud)) dependencyIds.push(cloud);
  }

  // CDN dependencies (non-critical — site works without CDN but slower)
  for (const cdn of profile.cdn) {
    edges.push({ source: cdn, target: nodeId, critical: false });
    if (!dependencyIds.includes(cdn)) dependencyIds.push(cdn);
  }

  // Extra known dependencies
  for (const dep of profile.extraDeps) {
    if (!dependencyIds.includes(dep)) dependencyIds.push(dep);
  }

  // Edge to end users
  edges.push({ source: nodeId, target: 'users', critical: false });

  // Generate summary
  const cloudNames = profile.cloud.length > 0 ? profile.cloud.join(', ') : 'unknown';
  const cdnNames = profile.cdn.length > 0 ? profile.cdn.join(', ') : 'none detected';
  const dnsNames = profile.dns.join(', ');

  const vulnerabilities: string[] = [];
  if (profile.cloud.length === 1) vulnerabilities.push(`single cloud provider (${cloudNames})`);
  if (profile.dns.includes('dns-root')) vulnerabilities.push('depends on root DNS');
  if (profile.cdn.length === 0) vulnerabilities.push('no CDN detected');
  if (profile.cloud.length === 0) vulnerabilities.push('unknown hosting');

  const summary = [
    `Analysis of ${domain}:`,
    `  Cloud: ${cloudNames}`,
    `  CDN: ${cdnNames}`,
    `  DNS: ${dnsNames}`,
    `  Est. users: ${profile.userCount}M`,
    vulnerabilities.length > 0
      ? `  Vulnerabilities: ${vulnerabilities.join('; ')}`
      : `  No major single-point vulnerabilities detected.`,
  ].join('\n');

  return { url, domain, node, edges, dependencyIds, summary };
}

/** Generate narrative messages for the site analysis */
export function generateSiteNarrative(analysis: SiteAnalysis): Array<{
  timestamp: string;
  text: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'analysis';
}> {
  const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const messages: Array<{ timestamp: string; text: string; type: 'info' | 'warning' | 'error' | 'success' | 'analysis' }> = [];

  messages.push({ timestamp: ts(), text: `━━━ SITE ANALYSIS: ${analysis.domain.toUpperCase()} ━━━`, type: 'analysis' });
  messages.push({ timestamp: ts(), text: `🦞 OpenClaw scanning ${analysis.url}...`, type: 'info' });
  messages.push({ timestamp: ts(), text: `Resolving DNS for ${analysis.domain}...`, type: 'info' });
  messages.push({ timestamp: ts(), text: `Infrastructure detected — mapping dependencies...`, type: 'info' });

  // Report what was found
  const cloudDeps = analysis.edges.filter(e => ['aws', 'gcp', 'azure'].includes(e.source));
  const cdnDeps = analysis.edges.filter(e => e.source.includes('cdn'));
  const dnsDeps = analysis.edges.filter(e => e.source.includes('dns'));

  for (const d of dnsDeps) {
    messages.push({ timestamp: ts(), text: `DNS → ${d.source} (${d.critical ? 'CRITICAL' : 'non-critical'})`, type: d.critical ? 'warning' : 'info' });
  }
  for (const d of cloudDeps) {
    messages.push({ timestamp: ts(), text: `Cloud → ${d.source} (${d.critical ? 'CRITICAL' : 'failover available'})`, type: d.critical ? 'warning' : 'success' });
  }
  for (const d of cdnDeps) {
    messages.push({ timestamp: ts(), text: `CDN → ${d.source} (performance layer)`, type: 'info' });
  }

  if (cloudDeps.length === 1) {
    messages.push({ timestamp: ts(), text: `⚠️  SINGLE CLOUD PROVIDER — no failover detected!`, type: 'error' });
  }
  if (dnsDeps.some(d => d.source === 'dns-root')) {
    messages.push({ timestamp: ts(), text: `⚠️  Relies on root DNS — vulnerable to DNS-level attacks`, type: 'warning' });
  }

  messages.push({ timestamp: ts(), text: `${analysis.domain} added to dependency graph. Click scenarios to see impact.`, type: 'success' });

  return messages;
}
