import { AlertCircle, UserX, ChevronUp, ChevronDown, ArrowUpDown, Lock, Eye, EyeOff, Calendar, Download } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

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

const WEEKS = [7, 6, 5, 4, 3, 2, 1];

// Map week number to CSV file path (only populated weeks will load data)
const WEEK_CSV_FILES = {
  1: '/week1_deficiencies.csv',
  2: '/week2_deficiencies.csv',
  3: '/week3_deficiencies.csv',
};

export default function Deficiencies() {
  const [deficiencies, setDeficiencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeWeek, setActiveWeek] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleWeekChange = (week) => {
    setActiveWeek(week);
    setSelectedClassFilter('All');
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const csvUrl = WEEK_CSV_FILES[activeWeek];
        if (!csvUrl) {
          setDeficiencies([]);
          setLoading(false);
          return;
        }

        const response = await fetch(csvUrl);
        if (!response.ok) {
          setDeficiencies([]);
          setLoading(false);
          return;
        }
        const csvText = await response.text();
        const data = parseCSV(csvText);
        setDeficiencies(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching deficiency data:", error);
        setDeficiencies([]);
        setLoading(false);
      }
    }
    fetchData();
  }, [activeWeek]);

  const filteredData = useMemo(() => {
    let data = selectedClassFilter === 'All'
      ? deficiencies
      : deficiencies.filter(d => (d.class || '').toUpperCase() === selectedClassFilter);
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(d => 
        (d.cadet || '').toLowerCase().includes(term) ||
        (d.course || '').toLowerCase().includes(term) ||
        (d.course_name || '').toLowerCase().includes(term) ||
        (d.company || '').toLowerCase().includes(term) ||
        (d.cn || '').toLowerCase().includes(term)
      );
    }
    
    return data;
  }, [deficiencies, selectedClassFilter, searchTerm]);

  const groupedData = useMemo(() => {
    return filteredData.reduce((acc, def) => {
      const cls = def.class || 'Unspecified Class';
      const crs = def.course_name ? `${def.course} - ${def.course_name}` : (def.course || 'Unspecified Course');
      if (!acc[cls]) acc[cls] = {};
      if (!acc[cls][crs]) acc[cls][crs] = [];
      acc[cls][crs].push(def);
      return acc;
    }, {});
  }, [filteredData]);

  const courseCounts = useMemo(() => {
    return deficiencies.reduce((acc, def) => {
      const crs = def.course || 'Unspecified';
      acc[crs] = (acc[crs] || 0) + 1;
      return acc;
    }, {});
  }, [deficiencies]);

  const sortedCourses = useMemo(() => Object.entries(courseCounts).sort((a, b) => b[1] - a[1]), [courseCounts]);
  const topCourse = sortedCourses.length > 0 ? sortedCourses[0][0] : "N/A";
  const topCourseCount = sortedCourses.length > 0 ? sortedCourses[0][1] : 0;
  const maxCourseCount = sortedCourses.length > 0 ? sortedCourses[0][1] : 1;

  const companyCounts = useMemo(() => {
    return deficiencies.reduce((acc, def) => {
      const coy = def.company || def.coy || 'Unspecified';
      acc[coy] = (acc[coy] || 0) + 1;
      return acc;
    }, {});
  }, [deficiencies]);

  const sortedCompanies = useMemo(() => Object.entries(companyCounts).sort((a, b) => b[1] - a[1]), [companyCounts]);
  const topCompany = sortedCompanies.length > 0 ? sortedCompanies[0][0] : "N/A";
  const topCompanyCount = sortedCompanies.length > 0 ? sortedCompanies[0][1] : 0;
  const maxCompanyCount = sortedCompanies.length > 0 ? sortedCompanies[0][1] : 1;

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-card modal-inner" style={{ padding: '3rem', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
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

      {/* Week Tabs */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {WEEKS.map(week => (
          <button
            key={week}
            onClick={() => handleWeekChange(week)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: activeWeek === week ? 'var(--accent-crimson)' : 'transparent',
              color: activeWeek === week ? '#fff' : 'var(--text-primary)',
              fontWeight: activeWeek === week ? '600' : '400',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <Calendar size={18} />
            Week {week}
          </button>
        ))}
      </div>

      {!WEEK_CSV_FILES[activeWeek] ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'inline-block' }} />
          <h3>No Deficiency Data Available</h3>
          <p className="text-muted">Deficiency reports for Week {activeWeek} have not been processed yet.</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
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
                <span>Company with Most Deficient Cadets</span>
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

          {/* Charts */}
          <div className="grid-cols-2" style={{ marginBottom: '3rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Deficiencies by Company</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedCompanies.map(([coy, count]) => (
                  <div key={coy}>
                    <div className="flex-between" style={{ marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                      <span>{coy}</span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-overlay)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(count / maxCompanyCount) * 100}%`, height: '100%', background: 'var(--accent-gold)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>
                ))}
                {sortedCompanies.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem' }}>No data available.</p>}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Deficiencies by Course</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedCourses.map(([crs, count]) => (
                  <div key={crs}>
                    <div className="flex-between" style={{ marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }} title={crs}>{crs}</span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-overlay)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(count / maxCourseCount) * 100}%`, height: '100%', background: 'var(--accent-crimson)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>
                ))}
                {sortedCourses.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem' }}>No data available.</p>}
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>Search Cadets</p>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, course, company, or CN..."
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>Filter by Class</p>
              <div className="tabs-container">
                {['All', '1CL', '2CL', '3CL'].map(cls => (
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
          </div>

          {/* Results count */}
          <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            Showing {filteredData.length} of {deficiencies.length} deficiency records
          </p>

          {loading ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="text-muted">Loading records...</p>
            </div>
          ) : Object.keys(groupedData).length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="text-muted">No deficiencies reported{searchTerm ? ' matching your search' : ''}.</p>
            </div>
          ) : (
            Object.entries(groupedData).sort(([a], [b]) => a.localeCompare(b)).map(([cls, courses]) => (
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Grade {sortConfig.key === 'grade' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                            </th>
                            <th onClick={() => handleSort('pts')} style={{ cursor: 'pointer' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Deficiency Points {sortConfig.key === 'pts' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                            </th>
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

                            if (sortConfig.key === 'pts' || sortConfig.key === 'grade') {
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
                              <td data-label="Cadet Name" style={{ fontWeight: 600 }}>{def.cadet}</td>
                              <td data-label="Company">{def.company || def.coy || '-'}</td>
                              <td data-label="Grade" style={{ fontWeight: 'bold' }}>{def.grade}</td>
                              <td data-label="Deficiency Points">
                                <span className="badge badge-urgent">
                                  {def.pts || 0} pts
                                </span>
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
        </>
      )}
    </div>
  );
}
