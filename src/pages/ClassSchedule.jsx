import { Calendar, Search, Filter, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

// Specialized CSV parser that handles the PPM metadata comments
function parseScheduleCSV(csv) {
  const lines = [];
  let currentLine = [];
  let currentVal = '';
  let insideQuotes = false;
  
  // Split into lines and filter out both comments and empty/whitespace lines
  const rawLines = csv.split('\n').filter(l => {
    const trimmed = l.trim();
    return trimmed !== '' && !trimmed.startsWith('#');
  });
  const cleanedCsv = rawLines.join('\n');

  for (let i = 0; i < cleanedCsv.length; i++) {
    const char = cleanedCsv[i];
    const nextChar = cleanedCsv[i + 1];

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

const CLASSES = ['1CL', '2CL', '3CL', '4CL'];

export default function ClassSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('4CL');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/sched_${selectedClass.toLowerCase()}.csv`);
        if (!res.ok) {
           setSchedule([]);
           setLoading(false);
           return;
        }
        const text = await res.text();
        const data = parseScheduleCSV(text);
        setSchedule(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setSchedule([]);
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedClass]);

  // Group schedule by Section Group
  const groups = schedule.reduce((acc, row) => {
    const group = row['Section Group'] || 'Unknown';
    if (!acc[group]) acc[group] = [];
    acc[group].push(row);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups);

  return (
    <div className="schedule-page">
      <div className="flex-between" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Class Schedule</h1>
          <p className="text-muted">Master Schedule • Term Overview</p>
        </div>
      </div>

      {/* Class Selector Tabs */}
      <div className="tabs-container">
        {CLASSES.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`tab-item ${selectedClass === cls ? 'active' : ''}`}
          >
            {cls} Cadets
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner"></div> {/* Basic placeholder or just text */}
            Loading {selectedClass} schedule...
          </div>
        </div>
      ) : groupKeys.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'grayscale(1)' }}>📅</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Schedule Not Found</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto' }}>
            The schedule for <strong>{selectedClass}</strong> has not been uploaded yet. 
            Please check back later or contact the Academic Group.
          </p>
        </div>
      ) : (
        groupKeys.map((groupKey) => (
          <div key={groupKey} style={{ marginBottom: '3rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '24px', background: 'var(--accent-gold)', borderRadius: '4px' }}></div>
                Section Group: {groupKey}
              </h2>
              <span className="badge badge-info">{groups[groupKey].length} Periods</span>
            </div>
            
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr style={{ background: 'var(--surface-overlay)' }}>
                      <th style={{ padding: '1.25rem', width: '100px' }}>Period</th>
                      <th style={{ width: '150px' }}>Time</th>
                      <th>Monday</th>
                      <th>Tuesday</th>
                      <th>Wednesday</th>
                      <th>Thursday</th>
                      <th>Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups[groupKey].map((row, i) => (
                      <tr key={i} style={{ transition: 'background 0.2s' }}>
                        <td style={{ fontWeight: 600, padding: '1.25rem' }}>{row['Period']}</td>
                        <td className="text-muted" style={{ fontSize: '0.85rem' }}>{row['Time']}</td>
                        <td style={{ fontWeight: row['Monday (M)'] ? 500 : 400 }}>{row['Monday (M)'] || '-'}</td>
                        <td style={{ fontWeight: row['Tuesday (T)'] ? 500 : 400 }}>{row['Tuesday (T)'] || '-'}</td>
                        <td style={{ fontWeight: row['Wednesday (W)'] ? 500 : 400 }}>{row['Wednesday (W)'] || '-'}</td>
                        <td style={{ fontWeight: row['Thursday (TH)'] ? 500 : 400 }}>{row['Thursday (TH)'] || '-'}</td>
                        <td style={{ fontWeight: row['Friday (F)'] ? 500 : 400 }}>{row['Friday (F)'] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}

      {groupKeys.length > 0 && (
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <div className="glass-card" style={{ flex: 1, padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Info size={16} className="text-accent-gold" /> Schedule Legend
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div className="flex-between"><span>MAT132</span> <span className="text-muted">Mathematics</span></div>
              <div className="flex-between"><span>PHI132</span> <span className="text-muted">Philosophy</span></div>
              <div className="flex-between"><span>POM132</span> <span className="text-muted">Prin. of Management</span></div>
              <div className="flex-between"><span>ECO132</span> <span className="text-muted">Economics</span></div>
              <div className="flex-between"><span>STES132</span> <span className="text-muted">Science & Tech</span></div>
              <div className="flex-between"><span>SD/PD</span> <span className="text-muted">Svc Drills / Phys Dev</span></div>
              <div className="flex-between"><span>ARD332</span> <span className="text-muted">Adv. R&D</span></div>
              <div className="flex-between"><span>STIT332</span> <span className="text-muted">Science, Tech, & IT</span></div>
              <div className="flex-between"><span>ENGG352</span> <span className="text-muted">Engineering Sci.</span></div>
              <div className="flex-between"><span>LDM332</span> <span className="text-muted">Leadership & Mgmt</span></div>
              <div className="flex-between"><span>RES332</span> <span className="text-muted">Research Methods</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
