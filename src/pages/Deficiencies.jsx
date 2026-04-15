import { AlertCircle, UserX, ChevronUp, ChevronDown, ArrowUpDown, Lock, Eye, EyeOff } from 'lucide-react';
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

export default function Deficiencies() {
  const [deficiencies, setDeficiencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 🔴 PASTE YOUR DEFICIENCIES CSV LINK HERE:
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyMaWhymCt9ILdDWzRItpgd44kbvhGQR5SJHJzoVoCeRPX1WLMKTYB04Q6TmyXLR_ZqU2VDdi7EhEj/pub?gid=0&single=true&output=csv';

  useEffect(() => {
    async function fetchData() {
      try {
        if (!SHEET_CSV_URL) {
          setDeficiencies([]);
          setLoading(false);
          return;
        }

        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const data = parseCSV(csvText);
        setDeficiencies(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sheet data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = selectedClassFilter === 'All'
    ? deficiencies
    : deficiencies.filter(d => (d.class || '').toUpperCase() === selectedClassFilter);

  const groupedData = filteredData.reduce((acc, def) => {
    const cls = def.class || 'Unspecified Class';
    const crs = def.course || 'Unspecified Course';
    if (!acc[cls]) acc[cls] = {};
    if (!acc[cls][crs]) acc[cls][crs] = [];
    acc[cls][crs].push(def);
    return acc;
  }, {});

  const courseCounts = deficiencies.reduce((acc, def) => {
    const crs = def.course || 'Unspecified';
    acc[crs] = (acc[crs] || 0) + 1;
    return acc;
  }, {});

  let topCourse = "N/A";
  let topCourseCount = 0;
  Object.entries(courseCounts).forEach(([crs, count]) => {
    if (count > topCourseCount) {
      topCourse = crs;
      topCourseCount = count;
    }
  });

  const companyCounts = deficiencies.reduce((acc, def) => {
    const coy = def.company || def.coy || 'Unspecified';
    acc[coy] = (acc[coy] || 0) + 1;
    return acc;
  }, {});

  let topCompany = "N/A";
  let topCompanyCount = 0;
  Object.entries(companyCounts).forEach(([coy, count]) => {
    if (count > topCompanyCount) {
      topCompany = coy;
      topCompanyCount = count;
    }
  });

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ padding: '3rem', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-crimson) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Lock size={28} style={{ color: 'var(--accent-crimson)' }} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Restricted Access</h2>
          <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>This section contains sensitive cadet records. Please enter the access code to continue.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'betterccafp') {
              setIsAuthenticated(true);
              setAuthError('');
            } else {
              setAuthError('Incorrect password. Access denied.');
            }
          }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                placeholder="Enter access code..."
                className="input-field"
                style={{ width: '100%', paddingRight: '3rem' }}
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {authError && (
              <p style={{ color: 'var(--accent-crimson)', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</p>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle className="text-accent-crimson" size={28} />
            Academic Deficiency List
          </h1>
          <p className="text-muted">Monitoring of cadets with academic flags and delinquent standings</p>
        </div>
      </div>

      <div className="grid-cols-3" style={{ marginBottom: '3rem' }}>
        <div className="glass-card" style={{ borderTop: '2px solid var(--accent-crimson)' }}>
          <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{new Set(deficiencies.map(d => d.cadet).filter(Boolean)).size}</h3>
          <p className="text-muted">Deficient Cadets</p>
        </div>
        <div className="glass-card" style={{ borderTop: '2px solid var(--accent-gold)' }}>
          <h3 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={topCompany}>
            {topCompany}
          </h3>
          <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Company with Most Deficiencies</span>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{topCompanyCount}</span>
          </p>
        </div>
        <div className="glass-card" style={{ borderTop: '2px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={topCourse}>
            {topCourse}
          </h3>
          <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Course with the Most Deficient Cadets</span>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{topCourseCount}</span>
          </p>
        </div>
      </div>

      <div>
        <p className="text-muted" style={{ marginBottom: '0.75rem', fontWeight: 500, fontSize: '0.85rem' }}>Filter by Class</p>
        <div className="tabs-container">
          {['All', '1CL', '2CL', '3CL', '4CL'].map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClassFilter(cls)}
              className={`tab-item ${selectedClassFilter === cls ? 'active' : ''}`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p className="text-muted">Loading records...</p>
        </div>
      ) : Object.keys(groupedData).length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <p className="text-muted">No deficiencies reported.</p>
        </div>
      ) : (
        Object.entries(groupedData).map(([cls, courses]) => (
          <div key={cls} style={{ marginBottom: '3rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '4px', height: '1.5rem', background: 'var(--accent-gold)', borderRadius: '2px' }}></div>
              {cls} Records
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {Object.entries(courses).map(([crs, courseDefs]) => (
                <div key={crs} className="glass-panel table-container">
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-overlay)' }} className="flex-between">
                    <h3 style={{ margin: 0 }}>{crs}</h3>
                    <span className="badge badge-warning">{courseDefs.length} Deficiencies</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('cadet')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Cadet Name {sortConfig.key === 'cadet' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                        </th>
                        <th onClick={() => handleSort('company')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Company {sortConfig.key === 'company' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                        </th>
                        <th onClick={() => handleSort('grade')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Grade/Status {sortConfig.key === 'grade' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                        </th>
                        <th onClick={() => handleSort('def')} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Deficiency Points {sortConfig.key === 'def' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...courseDefs].sort((a, b) => {
                        if (!sortConfig.key) return 0;

                        let aVal = a[sortConfig.key] || '';
                        let bVal = b[sortConfig.key] || '';

                        if (sortConfig.key === 'company') {
                          aVal = a.company || a.coy || '';
                          bVal = b.company || b.coy || '';
                        }

                        if (sortConfig.key === 'def') {
                          aVal = a.pts || a.def || a.points || 0;
                          bVal = b.pts || b.def || b.points || 0;
                          aVal = parseFloat(aVal) || 0;
                          bVal = parseFloat(bVal) || 0;
                        } else {
                          aVal = String(aVal).toLowerCase();
                          bVal = String(bVal).toLowerCase();
                        }

                        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                        return 0;
                      }).map((def, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{def.cadet}</td>
                          <td>{def.company || def.coy || '-'}</td>
                          <td style={{ fontWeight: 'bold' }}>{def.grade}</td>
                          <td>
                            <span className="badge badge-urgent">
                              {def.pts || def.def || def.points || 0} pts
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>Review</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
