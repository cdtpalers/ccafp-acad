import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

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

// Helper to convert Google Drive share links to direct image URLs
function resolveImageUrl(url) {
  if (!url) return null;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  const driveOpenMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (url.includes('drive.google.com') && driveOpenMatch && driveOpenMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${driveOpenMatch[1]}`;
  }
  return url.trim();
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // 🔴 PASTE YOUR ANNOUNCEMENTS CSV LINK HERE:
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQODxASqFgFWPJObis_gXQ-mcN31Kfqn1p0rRriC00czwJ_QZadUp1MQscXRGVwB1vZKP0xAvsBJI3J/pub?gid=0&single=true&output=csv';

  useEffect(() => {
    async function fetchData() {
      try {
        if (!SHEET_CSV_URL) {
          setAnnouncements([]);
          setLoading(false);
          return;
        }

        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const data = parseCSV(csvText);
        setAnnouncements(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sheet data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Announcements</h1>
          <p className="text-muted">Corps-wide broadcasts and urgent academic updates</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="flex-between" style={{ gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search announcements..."
              className="input-field"
              style={{ paddingLeft: '2.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select className="input-field" style={{ width: 'auto' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All Types">All Types</option>
              <option value="Urgent">Urgent</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data from Google Sheets...</div>
      ) : (() => {
        const filtered = announcements.filter(ann => {
          const matchesType = typeFilter === 'All Types' || ann.type?.toLowerCase() === typeFilter.toLowerCase();
          const matchesSearch = !searchTerm || 
            ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            ann.content?.toLowerCase().includes(searchTerm.toLowerCase());
          
          return matchesType && matchesSearch;
        });

        if (filtered.length === 0) {
          return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No announcements match your filters.</div>;
        }

        return (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {filtered.map((ann, i) => (
              <div key={i} className="glass-card" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => setSelectedAnn(ann)}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className={`badge badge-${ann.type?.toLowerCase() || 'info'}`}>{ann.type?.toUpperCase() || 'INFO'}</span>
                    {ann.class && <span className="badge badge-secondary" style={{ background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)' }}>{ann.class}</span>}
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>{ann.date}</span>
                </div>
                <h2 style={{ marginBottom: '1rem' }}>{ann.title}</h2>
                {ann.image && (
                  <div style={{ marginBottom: '1rem', width: '100%', maxHeight: '300px', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                    <img src={resolveImageUrl(ann.image)} alt={ann.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {ann.content && ann.content.length > 150 ? ann.content.substring(0, 150) + '...' : ann.content}
                </p>
                <div style={{ marginTop: '1rem', color: 'var(--accent-gold)', fontSize: '0.875rem', fontWeight: 500 }}>
                  Read full announcement →
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {selectedAnn && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedAnn(null)}>
          <div className="glass-panel" style={{ background: 'var(--bg-color)', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedAnn(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
              <X size={18} />
            </button>
            <div className="flex-between" style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
              <span className={`badge badge-${selectedAnn.type?.toLowerCase() || 'info'}`}>{selectedAnn.type?.toUpperCase() || 'INFO'}</span>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>{selectedAnn.date}</span>
            </div>
            <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>{selectedAnn.title}</h1>
            {selectedAnn.image && (
                <div style={{ marginBottom: '2rem', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={resolveImageUrl(selectedAnn.image)} alt={selectedAnn.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
            )}
            <div style={{ color: 'var(--text-primary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '1.05rem' }}>
              {selectedAnn.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
