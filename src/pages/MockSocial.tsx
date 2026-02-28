// ============================================================
// Mock Social Media Page
// ============================================================

import { useSearchParams } from 'react-router-dom';
import MockPageLayout from './MockPageLayout';

export default function MockSocial() {
  const [params] = useSearchParams();
  const status = params.get('status') ?? 'healthy';
  const isDown = status === 'down';
  const isDegraded = status === 'degraded';

  return (
    <MockPageLayout
      title="X / Twitter"
      subtitle="What's happening"
      status={status}
    >
      <div style={{ padding: 24 }}>
        {isDown ? (
          <div style={errorPage}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🐦</div>
            <h2 style={{ color: '#ef4444', margin: 0 }}>
              Something went wrong.
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: 400, margin: '12px auto 0' }}>
              We're having trouble connecting to our servers.
              This is likely related to an infrastructure outage.
            </p>
            <div style={errorDetail}>
              <code style={{ color: '#ef4444', fontSize: 12 }}>
                ERR_CONNECTION_REFUSED — cdn.x.com unreachable
              </code>
            </div>
            <button style={retryBtn}>Try Again</button>
          </div>
        ) : isDegraded ? (
          <div>
            <div style={degradedBanner}>
              ⚠️ Timeline loading slowly. Images may not display.
            </div>
            {fakeTweets.slice(0, 2).map((t, i) => (
              <div key={i} style={{ ...tweetCard, opacity: 0.6 }}>
                <div style={tweetHeader}>
                  <span style={{ fontWeight: 600 }}>{t.user}</span>
                  <span style={{ color: '#64748b' }}>· {t.time}</span>
                </div>
                <div style={{ marginTop: 6, color: '#e2e8f0' }}>{t.text}</div>
                <div style={tweetMeta}>
                  ⏳ Loading slowly...
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {fakeTweets.map((t, i) => (
              <div key={i} style={tweetCard}>
                <div style={tweetHeader}>
                  <span style={{ fontWeight: 600 }}>{t.user}</span>
                  <span style={{ color: '#64748b' }}>· {t.time}</span>
                </div>
                <div style={{ marginTop: 6, color: '#e2e8f0' }}>{t.text}</div>
                <div style={tweetMeta}>
                  💬 {t.replies} &nbsp; 🔁 {t.retweets} &nbsp; ❤️ {t.likes}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MockPageLayout>
  );
}

const fakeTweets = [
  {
    user: '@cloudstatus',
    time: '2m',
    text: 'All systems nominal. Global CDN latency at 4.2ms average.',
    replies: 12,
    retweets: 45,
    likes: 230,
  },
  {
    user: '@devops_daily',
    time: '5m',
    text: 'Reminder: always have redundant DNS providers. Single points of failure are technical debt.',
    replies: 89,
    retweets: 342,
    likes: 1200,
  },
  {
    user: '@internet_health',
    time: '12m',
    text: 'Global internet health score: 99.7%. All major infrastructure providers reporting green.',
    replies: 5,
    retweets: 23,
    likes: 156,
  },
  {
    user: '@sre_memes',
    time: '18m',
    text: '"It\'s always DNS." — Every SRE, every outage, since the beginning of time.',
    replies: 203,
    retweets: 1500,
    likes: 8900,
  },
];

const errorPage: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px 24px',
};

const errorDetail: React.CSSProperties = {
  marginTop: 20,
  padding: 12,
  background: '#1e293b',
  borderRadius: 6,
  display: 'inline-block',
};

const retryBtn: React.CSSProperties = {
  marginTop: 20,
  padding: '10px 24px',
  background: '#38bdf8',
  border: 'none',
  borderRadius: 20,
  color: 'white',
  fontWeight: 600,
  cursor: 'pointer',
};

const degradedBanner: React.CSSProperties = {
  padding: 14,
  background: 'rgba(245, 158, 11, 0.1)',
  border: '1px solid #f59e0b',
  borderRadius: 8,
  color: '#f59e0b',
  fontWeight: 600,
  fontSize: 13,
  marginBottom: 16,
};

const tweetCard: React.CSSProperties = {
  padding: 16,
  borderBottom: '1px solid #1e293b',
  fontSize: 14,
};

const tweetHeader: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  fontSize: 14,
  color: '#e2e8f0',
};

const tweetMeta: React.CSSProperties = {
  marginTop: 10,
  fontSize: 13,
  color: '#64748b',
};
