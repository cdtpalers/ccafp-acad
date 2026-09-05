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
    { label: 'Active Announcements', value: announcements.length || '0', icon: <Bell size={18} />, trend: 'View Feed', path: '/announcements' },
    { label: 'Total Deficiencies', value: new Set(deficiencies.map(d => d.cadet).filter(Boolean)).size || '0', icon: <AlertCircle size={18} />, trend: 'View Board', path: '/deficiencies' },
    { label: 'Upcoming Classes', value: '4CL-1CL', icon: <TrendingUp size={18} />, trend: 'View Schedule', path: '/schedule' },
  ];

  return (
    <div className="dashboard">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>Academic Council Dashboard</h1>
          <p className="text-muted" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Overview • April 2026</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="glass-card stat-card-interactive" 
            onClick={() => navigate(stat.path)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '1.5rem',
              cursor: 'pointer',
              minHeight: '180px',
              justifyContent: 'space-between'
            }}
          >
            <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <span className="text-muted" style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
              <div style={{ border: '1px solid var(--surface-border)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', background: 'var(--surface-overlay)', color: 'var(--accent-primary)' }}>
                {stat.icon}
              </div>
            </div>
            
            <div>
              <h3 className="font-serif" style={{ fontSize: '3.5rem', fontWeight: 500, margin: 0, lineHeight: 1, color: 'var(--text-primary)' }}>{stat.value}</h3>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {i === 0 && <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div> Live</span>}
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{stat.trend} →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {(() => {
          const todayIdx = new Date().getDate() % ACADEMIC_QUOTES.length;
          const dailyQuote = ACADEMIC_QUOTES[todayIdx];
          return (
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: '250px', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.03, transform: 'rotate(-10deg)' }}>
                <Quote size={180} weight="fill" />
              </div>
              <Quote className="text-accent-primary" size={32} style={{ marginBottom: '1.5rem' }} />
              <p className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 400, fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.4 }}>
                "{dailyQuote.text}"
              </p>
              <p className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                — {dailyQuote.author}
              </p>
            </div>
          );
        })()}

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 className="font-serif" style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 500 }}>Recent Announcements</h3>
          <div className="announcement-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p className="text-muted">Loading from Sheets...</p>
            ) : announcements.length === 0 ? (
              <p className="text-muted">No recent announcements.</p>
            ) : (
              announcements.slice(0, 3).map((ann, i) => (
                <div key={i} style={{ padding: '1rem', background: 'var(--surface-overlay)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{ann.title}</h4>
                    <span className={`badge badge-${ann.type?.toLowerCase() || 'info'}`} style={{ fontSize: '0.7rem' }}>
                      {ann.type?.toUpperCase() || 'INFO'}
                    </span>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                    {ann.content ? ann.content.substring(0, 80) + '...' : ''}
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
