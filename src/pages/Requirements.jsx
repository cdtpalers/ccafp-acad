import { Download, Filter, X } from 'lucide-react';
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

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function Requirements() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Status: All');
  const [selectedReq, setSelectedReq] = useState(null);

  // 🔴 PASTE YOUR REQUIREMENTS CSV LINK HERE:
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC5hLbaoyuSdfdYY-xb6lkLFbfnS4iTMGNDIhc6WwSZhjKjhwgowGdT06rgDO-jEVJHhq1yUbKpm0r/pub?gid=162719649&single=true&output=csv';

  useEffect(() => {
    async function fetchData() {
      try {
        if (!SHEET_CSV_URL) {
          setRequirements([]);
          setLoading(false);
          return;
        }

        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const data = parseCSV(csvText);
        setRequirements(data);
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
          <h1>Academic Requirements/Examinations</h1>
          <p className="text-muted">Track per-class deliverables and lesson examinations</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <p className="text-muted" style={{ marginBottom: '0.75rem', fontWeight: 500, fontSize: '0.85rem' }}>Filter by Class</p>
            <div className="tabs-container" style={{ marginBottom: 0 }}>
              {['All', '1CL', '2CL', '3CL', '4CL'].map((cls) => (
                <button
                  key={cls}
                  className={`tab-item ${classFilter === cls ? 'active' : ''}`}
                  onClick={() => setClassFilter(cls)}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-between">
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select className="input-field" style={{ width: '200px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="Status: All">Status: All</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <button className="btn btn-secondary">
              <Filter size={18} /> More Filters
            </button>
          </div>
        </div>
      </div>

      {(() => {
        const filtered = requirements.filter((req) => {
          const matchClass = classFilter === 'All' || (req.class && req.class.toUpperCase() === classFilter);
          const matchStatus = statusFilter === 'Status: All' || (req.status && req.status.toLowerCase() === statusFilter.toLowerCase());
          return matchClass && matchStatus;
        });

        const grouped = filtered.reduce((acc, req) => {
          const course = req.course || 'Unspecified Course';
          if (!acc[course]) acc[course] = [];
          acc[course].push(req);
          return acc;
        }, {});

        const courseKeys = Object.keys(grouped);

        if (loading) {
          return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="text-muted">Loading requirements...</p>
            </div>
          );
        }

        if (courseKeys.length === 0) {
          return (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', filter: 'grayscale(1)' }}>📋</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No Requirements Found</h3>
              <p className="text-muted">No requirements match the current filters.</p>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {courseKeys.map((course) => (
              <div key={course}>
                <div className="flex-between" style={{ marginBottom: '0.75rem', padding: '0 0.5rem' }}>
                  <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '6px', height: '22px', background: 'var(--accent-gold)', borderRadius: '3px' }}></div>
                    {course}
                  </h2>
                  <span className="badge badge-info">{grouped[course].length} {grouped[course].length === 1 ? 'Requirement' : 'Requirements'}</span>
                </div>

                <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr style={{ background: 'var(--surface-overlay)' }}>
                          <th style={{ padding: '1rem 1.25rem' }}>Class</th>
                          <th>Requirement Title</th>
                          <th>Due Date</th>
                          <th>Submission Type</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grouped[course].map((req, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600, padding: '1rem 1.25rem' }}>{req.class}</td>
                            <td>{req.title}</td>
                            <td>{formatDate(req.due)}</td>
                            <td>{req.submission}</td>
                            <td>
                              <span className={`badge ${['Active', 'Submitted', 'Completed', 'Done'].includes(req.status) ? 'badge-success' : 'badge-warning'}`}>
                                {req.status}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={() => setSelectedReq(req)}>
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {selectedReq && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedReq(null)}>
          <div className="glass-panel" style={{ background: 'var(--bg-color)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedReq(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
              <X size={18} />
            </button>
            <div className="flex-between" style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
              <span className={`badge ${['Active', 'Submitted', 'Completed', 'Done'].includes(selectedReq.status) ? 'badge-success' : 'badge-warning'}`}>
                {selectedReq.status}
              </span>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>Due: {selectedReq.due}</span>
            </div>

            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', color: 'var(--accent-gold)' }}>{selectedReq.course}</h2>
            <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>{selectedReq.title}</h1>

            <div style={{ padding: '1.5rem', background: 'var(--surface-highlight)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Target Class</p>
                  <p style={{ fontWeight: 600 }}>{selectedReq.class}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Submissions</p>
                  <p style={{ fontWeight: 600 }}>{selectedReq.submission}</p>
                </div>
              </div>
            </div>

            <div style={{ color: 'var(--text-primary)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '1rem' }}>
              {selectedReq.details || selectedReq.description || "No additional details or description provided for this requirement in the database."}
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedReq(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
