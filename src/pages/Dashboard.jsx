import { Bell, AlertCircle, TrendingUp, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ACADEMIC_QUOTES = [
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Excellence is not a gift, but a skill that takes practice. We are what we repeatedly do.", author: "Aristotle" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" }
];

// A lightweight CSV parser to handle quotes and commas properly
function parseCSV(csv) {
  const lines = [];
  let currentLine = [];
  let currentVal = '';
  let insideQuotes = false;
  
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentVal += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      currentLine.push(currentVal);
      currentVal = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') ++i;
      currentLine.push(currentVal);
      lines.push(currentLine);
      currentLine = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentLine.length > 0) {
    currentLine.push(currentVal);
    lines.push(currentLine);
  }
  
  const headers = lines[0].map(h => h.trim());
  return lines.slice(1).filter(line => line.join('').trim() !== '').map(line => {
    return headers.reduce((obj, header, i) => {
      obj[header] = line[i] ? line[i].trim() : '';
      return obj;
    }, {});
  });
}

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [deficiencies, setDeficiencies] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔴 PASTE YOUR CSV LINKS HERE (Same as the ones in other pages)
  const ANNOUNCEMENTS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQODxASqFgFWPJObis_gXQ-mcN31Kfqn1p0rRriC00czwJ_QZadUp1MQscXRGVwB1vZKP0xAvsBJI3J/pub?gid=0&single=true&output=csv';
  const DEFICIENCIES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyMaWhymCt9ILdDWzRItpgd44kbvhGQR5SJHJzoVoCeRPX1WLMKTYB04Q6TmyXLR_ZqU2VDdi7EhEj/pub?gid=0&single=true&output=csv';

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchCSV = async (url) => {
          if (!url) return [];
          const res = await fetch(url);
          return parseCSV(await res.text());
        };

        const [annData, defData] = await Promise.all([
          fetchCSV(ANNOUNCEMENTS_CSV_URL),
          fetchCSV(DEFICIENCIES_CSV_URL)
        ]);

        setAnnouncements(annData);
        setDeficiencies(defData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dash data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const navigate = useNavigate();

  const stats = [
    { label: 'Active Announcements', value: announcements.length || '0', icon: <Bell size={18} />, trend: 'View Feed', path: '/announcements', code: 'ANN-01', accent: 'var(--accent-primary)', glow: 'card-glow--teal' },
    { label: 'Total Deficiencies', value: new Set(deficiencies.map(d => d.cadet).filter(Boolean)).size || '0', icon: <AlertCircle size={18} />, trend: 'View Board', path: '/deficiencies', code: 'DEF-02', accent: 'var(--accent-gold)', glow: 'card-glow--gold' },
    { label: 'Upcoming Classes', value: '4CL-1CL', icon: <TrendingUp size={18} />, trend: 'View Schedule', path: '/schedule', code: 'SCH-03', accent: 'var(--accent-violet)', glow: 'card-glow--violet' },
  ];

  return (
    <div className="dashboard">
      {/* ---- Masthead ---- */}
      <header className="page-header">
        <span className="eyebrow">CCAFP // Academic Command</span>
        <div className="flex-between" style={{ alignItems: 'flex-end', gap: '1.5rem' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.1rem)', lineHeight: 1.05, margin: 0 }}>
              Academic Council
              <span style={{ display: 'block', color: 'var(--accent-primary)', fontStyle: 'italic' }}>Dashboard</span>
            </h1>
            <p className="text-muted" style={{ marginTop: '0.85rem', maxWidth: '46ch' }}>
              Centralized academic dissemination for the Cadet Corps AFP.
            </p>
          </div>
          <div className="label-tactical hide-mobile" style={{ textAlign: 'right', lineHeight: 1.9, flexShrink: 0 }}>
            <div>A.Y. 2026&ndash;2027</div>
            <div style={{ color: 'var(--accent-primary)' }}>1st Term &middot; Active</div>
          </div>
        </div>
      </header>

      {/* ---- Mission status bar ---- */}
      <div
        className="tactical-grid"
        style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', padding: '0.75rem 1.1rem', marginBottom: '1.25rem',
          borderRadius: 'var(--radius-md)', background: 'var(--surface-overlay)',
          border: '1px solid var(--surface-border)',
          backdropFilter: 'blur(var(--blur-sm))', WebkitBackdropFilter: 'blur(var(--blur-sm))'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span
            className="pulse-dot"
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)', flexShrink: 0 }}
          />
          <span className="label-tactical" style={{ color: 'var(--text-primary)' }}>
            System Status
          </span>
          <span className="label-tactical" style={{ color: 'var(--success)' }}>
            {loading ? 'Syncing\u2026' : 'Live \u00b7 Synced'}
          </span>
        </div>
        <span className="label-tactical">Overview &middot; April 2026</span>
      </div>

      {/* ---- Bento grid ---- */}
      <div className="bento-grid">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-card stat-card-interactive bento-span-4 animate-fade-in-up"
            onClick={() => navigate(stat.path)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(stat.path); } }}
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              cursor: 'pointer', minHeight: '196px',
              animationDelay: `${i * 0.07}s`
            }}
          >
            <div className={`card-glow ${stat.glow}`} />

            <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
              <div>
                <div className="label-tactical" style={{ color: stat.accent, marginBottom: '0.3rem' }}>{stat.code}</div>
                <span className="label-tactical" style={{ color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>{stat.label}</span>
              </div>
              <div style={{
                border: `1px solid color-mix(in srgb, ${stat.accent} 30%, transparent)`,
                padding: '0.6rem', borderRadius: 'var(--radius-sm)', display: 'flex',
                background: `color-mix(in srgb, ${stat.accent} 12%, transparent)`,
                color: stat.accent, flexShrink: 0
              }}>
                {stat.icon}
              </div>
            </div>

            <div>
              <h3 className="stat-value" style={{ fontSize: '3.4rem', margin: 0 }}>{stat.value}</h3>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {i === 0 && (
                  <span className="label-tactical" style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
                    Live
                  </span>
                )}
                <span className="label-tactical" style={{ color: stat.accent }}>{stat.trend} &rarr;</span>
              </div>
            </div>
          </div>
        ))}

        {/* Daily quote — serif editorial block */}
        {(() => {
          const todayIdx = new Date().getDate() % ACADEMIC_QUOTES.length;
          const dailyQuote = ACADEMIC_QUOTES[todayIdx];
          return (
            <div
              className="glass-panel bento-span-5 animate-fade-in-up"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '270px', padding: '2rem', animationDelay: '0.21s' }}
            >
              <div className="card-glow card-glow--violet" />
              <div style={{ position: 'absolute', top: '-12%', right: '-6%', opacity: 0.04, transform: 'rotate(-10deg)', pointerEvents: 'none' }}>
                <Quote size={190} />
              </div>

              <span className="eyebrow">Daily Maxim</span>
              <Quote className="text-accent-primary" size={28} style={{ marginBottom: '1.1rem' }} />
              <p className="font-serif" style={{ fontSize: 'clamp(1.25rem, 2.1vw, 1.6rem)', color: 'var(--text-primary)', fontWeight: 400, fontStyle: 'italic', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                &ldquo;{dailyQuote.text}&rdquo;
              </p>
              <p className="label-tactical" style={{ color: 'var(--accent-primary)' }}>
                &mdash; {dailyQuote.author}
              </p>
            </div>
          );
        })()}

        {/* Recent announcements */}
        <div
          className="glass-panel bento-span-7 animate-fade-in-up"
          style={{ display: 'flex', flexDirection: 'column', minHeight: '270px', padding: '2rem', animationDelay: '0.28s' }}
        >
          <div className="card-glow card-glow--teal" />

          <div className="flex-between" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
            <div>
              <span className="eyebrow">Feed</span>
              <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>Recent Announcements</h3>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem' }}
              onClick={() => navigate('/announcements')}
            >
              View all
            </button>
          </div>

          <div className="announcement-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? (
              <p className="label-tactical">Loading from Sheets&hellip;</p>
            ) : announcements.length === 0 ? (
              <p className="label-tactical">No recent announcements.</p>
            ) : (
              announcements.slice(0, 3).map((ann, i) => (
                <div key={i} className="bento-subcard">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, letterSpacing: '-0.01em' }}>{ann.title}</h4>
                    <span className={`badge badge-${ann.type?.toLowerCase() || 'info'}`} style={{ flexShrink: 0 }}>
                      {ann.type?.toUpperCase() || 'INFO'}
                    </span>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.45 }}>
                    {ann.content ? ann.content.substring(0, 80) + '\u2026' : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
