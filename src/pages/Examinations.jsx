import { Search, Calendar as CalendarIcon, FileText, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

// Lightweight CSV parser
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

export default function Examinations() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // 🔴 PASTE YOUR EXAMINATIONS CSV LINK HERE:
  // Expected Columns: Course, Type (LE/UE), Date, Time, Class, Coverage, Room
  const SHEET_CSV_URL = '';

  useEffect(() => {
    async function fetchData() {
      try {
        if (!SHEET_CSV_URL) {
          setExams([]);
          setLoading(false);
          return;
        }

        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        const data = parseCSV(csvText);
        setExams(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sheet data:", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredExams = exams.filter(exam => {
    const matchesSearch = !searchTerm || 
      exam.Course?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      exam.Coverage?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'All Classes' || exam.Class === classFilter;
    const matchesType = typeFilter === 'All Types' || exam.Type === typeFilter;

    return matchesSearch && matchesClass && matchesType;
  });

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Examinations</h1>
          <p className="text-muted">Monitor upcoming Lesson Exams (LE) and Unit Exams (UE)</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="flex-between" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search by course or coverage..."
              className="input-field"
              style={{ paddingLeft: '2.75rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select className="input-field" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="All Classes">All Classes</option>
              <option value="1CL">1CL</option>
              <option value="2CL">2CL</option>
              <option value="3CL">3CL</option>
              <option value="4CL">4CL</option>
            </select>
            <select className="input-field" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All Types">All Types</option>
              <option value="LE">Lesson Exam (LE)</option>
              <option value="UE">Unit Exam (UE)</option>
              <option value="CE">Comprehensive Exam (CE)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading exam data...</div>
      ) : !SHEET_CSV_URL ? (
         <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'grayscale(1)' }}>📝</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Data Source Configured</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto' }}>
            Please add your Google Sheets CSV link in the code to fetch upcoming examinations.
          </p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No exams match your filters.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredExams.map((exam, i) => (
            <div key={i} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <span className={`badge ${exam.Type === 'UE' ? 'badge-urgent' : 'badge-info'}`} style={{ fontSize: '0.75rem' }}>
                  {exam.Type || 'Exam'}
                </span>
                {exam.Class && (
                  <span className="badge" style={{ background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)' }}>
                    {exam.Class}
                  </span>
                )}
              </div>
              
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} className="text-accent-gold" />
                {exam.Course || 'Unknown Course'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CalendarIcon size={16} style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{exam.Date || 'TBA'}</span>
                    {exam.Time && <span className="text-muted" style={{ fontSize: '0.85rem' }}>{exam.Time}</span>}
                  </div>
                </div>
                
                {exam.Room && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>📍</div>
                    <span style={{ fontSize: '0.9rem' }}>{exam.Room}</span>
                  </div>
                )}

                {exam.Coverage && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem', background: 'var(--surface-overlay)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <FileText size={16} style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }} />
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                      <strong>Coverage:</strong><br/>
                      {exam.Coverage}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
