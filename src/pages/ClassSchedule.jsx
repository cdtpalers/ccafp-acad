import { Calendar, Search, Filter, Info, ArrowLeftRight } from 'lucide-react';
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

const CLASSES = ['1CL', '2CL', '3CL', '4CL', 'MWF Rooms', 'TTh Rooms'];

const renderGroupKey = (groupKey, selectedClass) => {
  const getColor = (letter) => {
    if (selectedClass === '1CL') {
      if (['A','B','C','D'].includes(letter)) return '#56b6c2'; // Light Blue
      if (['E','F','G','H'].includes(letter)) return '#98c379'; // Green
      if (['I','J','K','L'].includes(letter)) return '#3b82f6'; // Dark Blue
    } else if (selectedClass === '2CL') {
      if (['A','B','C','D','E'].includes(letter)) return '#56b6c2'; // Light Blue
      if (['F','G','H','I','J'].includes(letter)) return '#98c379'; // Green
      if (['K','L','M','N','O'].includes(letter)) return '#3b82f6'; // Dark Blue
    }
    return 'inherit';
  };

  return groupKey.split('').map((char, index) => {
    const upperChar = char.toUpperCase();
    if (/[A-Z]/.test(upperChar)) {
      return <span key={index} style={{ color: getColor(upperChar), fontWeight: 600 }}>{char}</span>;
    }
    return <span key={index}>{char}</span>;
  });
};

export default function ClassSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('4CL');
  
  // Class shifting starts on July 13, 2026
  const [isShifted, setIsShifted] = useState(() => {
    const shiftDate = new Date('2026-07-13T00:00:00+08:00');
    return new Date() >= shiftDate;
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let url = `/sched_${selectedClass.toLowerCase()}.csv`;
        if (selectedClass === 'MWF Rooms') {
          url = '/classroom_assignment_MWF(1).csv';
        } else if (selectedClass === 'TTh Rooms') {
          url = '/classroom_assignment_TTH.csv';
        }
        const res = await fetch(url);
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
  const groups = (selectedClass !== 'MWF Rooms' && selectedClass !== 'TTh Rooms') ? schedule.reduce((acc, row) => {
    const group = row['Section Group'] || row['Section'] || 'Unknown';
    if (!acc[group]) acc[group] = [];
    acc[group].push(row);
    return acc;
  }, {}) : {};

  const groupKeys = Object.keys(groups);

  return (
    <div className="schedule-page">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>HAG CLASS SCHED</h1>
          <p className="text-muted">Master Schedule • Term Overview</p>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', borderLeft: '4px solid var(--accent-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Info size={20} style={{ color: 'var(--accent-primary)' }} />
          <p style={{ margin: 0 }}>
            <strong>Note:</strong> The formation time IFMH is 10 mins minus the first call in melchor/HAG
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-overlay)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
          <button 
            className={`btn ${!isShifted ? 'btn-primary' : ''}`}
            style={{ 
              background: !isShifted ? 'var(--surface-background)' : 'transparent',
              color: !isShifted ? 'var(--text-primary)' : 'var(--text-muted)',
              border: !isShifted ? '1px solid var(--surface-border)' : 'none',
              boxShadow: !isShifted ? 'var(--shadow-sm)' : 'none',
              padding: '0.5rem 1rem'
            }}
            onClick={() => setIsShifted(false)}
          >
            Regular Schedule
          </button>
          <button 
            className={`btn ${isShifted ? 'btn-primary' : ''}`}
            style={{ 
              background: isShifted ? 'var(--accent-primary-light)' : 'transparent',
              color: isShifted ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: isShifted ? '1px solid var(--accent-primary)' : 'none',
              boxShadow: isShifted ? 'var(--shadow-md)' : 'none',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem'
            }}
            onClick={() => setIsShifted(true)}
            title="Starts July 13 (MWF and TTh swapped)"
          >
            <ArrowLeftRight size={16} />
            Shifted Schedule
          </button>
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
            {cls === 'MWF Rooms' || cls === 'TTh Rooms' ? cls : `${cls} Cadets`}
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
      ) : schedule.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'grayscale(1)' }}>📅</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Schedule Not Found</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto' }}>
            The schedule for <strong>{selectedClass}</strong> has not been uploaded yet. 
            Please check back later or contact the Academic Group.
          </p>
        </div>
      ) : (selectedClass === 'MWF Rooms' || selectedClass === 'TTh Rooms') ? (
        <div style={{ marginBottom: '3rem' }}>
          <div className="flex-between" style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '24px', background: 'var(--accent-primary)', borderRadius: '4px' }}></div>
              {selectedClass === 'MWF Rooms' ? 'MWF' : 'TTh'} Classroom Assignments
            </h2>
            <span className="badge badge-info">{schedule.length} Rooms</span>
          </div>
          
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr style={{ background: 'var(--surface-overlay)' }}>
                    <th style={{ padding: '1.25rem', width: '150px' }}>Rooms</th>
                    <th style={{ width: '150px' }}>Subject</th>
                    <th>1st</th>
                    <th>2nd</th>
                    <th>3rd</th>
                    <th>4th</th>
                    <th>5th</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <tr key={i} style={{ transition: 'background 0.2s' }}>
                      <td data-label="Rooms" style={{ fontWeight: 600, padding: '1.25rem' }}>{row['ROOMS'] || '-'}</td>
                      <td data-label="Subject" style={{ fontWeight: 500 }}>{row['SUBJ'] || '-'}</td>
                      <td data-label="1st">{row['1ST'] || '-'}</td>
                      <td data-label="2nd">{row['2ND'] || '-'}</td>
                      <td data-label="3rd">{row['3RD'] || '-'}</td>
                      <td data-label="4th">{row['4TH'] || '-'}</td>
                      <td data-label="5th">{row['5TH'] || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        groupKeys.map((groupKey) => (
          <div key={groupKey} style={{ marginBottom: '3rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '24px', background: 'var(--accent-primary)', borderRadius: '4px' }}></div>
                Section Group: {renderGroupKey(groupKey, selectedClass)}
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
                    {groups[groupKey].map((row, i) => {
                      let mon = row['Monday (M)'] || row['Monday'] || '-';
                      let tue = row['Tuesday (T)'] || row['Tuesday'] || '-';
                      let wed = row['Wednesday (W)'] || row['Wednesday'] || '-';
                      let thu = row['Thursday (TH)'] || row['Thursday'] || '-';
                      const fri = row['Friday (F)'] || row['Friday'] || '-';

                      if (isShifted) {
                        const tempMon = mon;
                        mon = tue;
                        tue = tempMon;

                        const tempWed = wed;
                        wed = thu;
                        thu = tempWed;
                      }

                      return (
                        <tr key={i} style={{ transition: 'background 0.2s' }}>
                          <td data-label="Period" style={{ fontWeight: 600, padding: '1.25rem' }}>{row['Period']}</td>
                          <td data-label="Time" className="text-muted" style={{ fontSize: '0.85rem' }}>{row['Time']}</td>
                          <td data-label="Monday" style={{ fontWeight: mon !== '-' ? 500 : 400, color: isShifted && mon !== '-' ? 'var(--accent-primary)' : 'inherit' }}>{mon}</td>
                          <td data-label="Tuesday" style={{ fontWeight: tue !== '-' ? 500 : 400, color: isShifted && tue !== '-' ? 'var(--accent-primary)' : 'inherit' }}>{tue}</td>
                          <td data-label="Wednesday" style={{ fontWeight: wed !== '-' ? 500 : 400, color: isShifted && wed !== '-' ? 'var(--accent-primary)' : 'inherit' }}>{wed}</td>
                          <td data-label="Thursday" style={{ fontWeight: thu !== '-' ? 500 : 400, color: isShifted && thu !== '-' ? 'var(--accent-primary)' : 'inherit' }}>{thu}</td>
                          <td data-label="Friday" style={{ fontWeight: fri !== '-' ? 500 : 400 }}>{fri}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}

    </div>
  );
}
