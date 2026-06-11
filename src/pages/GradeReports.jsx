import { FileText, Info, Calendar, BookOpen } from 'lucide-react';
import { useState } from 'react';

const WEEKS = [1, 2, 3, 4, 5, 6, 7];

const WEEK_REPORTS = {
  1: [
    "COM431.pdf", "ENGG431.pdf", "GIS231.pdf", "HRP431.pdf", "IT331.pdf", 
    "LAW231.pdf", "LDM331.pdf", "OM231.pdf", "PHI231.pdf", "PHY331.pdf", 
    "RES331.pdf", "RES431.pdf", "RM431.pdf", "SGD231.pdf", "TI331.pdf"
  ]
};

export default function GradeReports() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [selectedReport, setSelectedReport] = useState(WEEK_REPORTS[1][0]);
  const [loading, setLoading] = useState(true);

  const handleWeekChange = (week) => {
    setActiveWeek(week);
    if (WEEK_REPORTS[week] && WEEK_REPORTS[week].length > 0) {
      setSelectedReport(WEEK_REPORTS[week][0]);
    } else {
      setSelectedReport(null);
    }
    setLoading(true);
  };

  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
    setLoading(true);
  };

  const getPdfUrl = () => {
    if (!selectedReport) return '';
    return `/week${activeWeek}(def)/${selectedReport}#toolbar=0&navpanes=0&scrollbar=0`;
  };

  return (
    <div className="grade-reports-page">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Deficiency Reports</h1>
          <p className="text-muted">Weekly Deficiency Reports (1CL - 3CL)</p>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {WEEKS.map(week => (
          <button
            key={week}
            onClick={() => handleWeekChange(week)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: activeWeek === week ? 'var(--accent-gold)' : 'transparent',
              color: activeWeek === week ? '#000' : 'var(--text-primary)',
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

      {!WEEK_REPORTS[activeWeek] ? (
        <div className="glass-panel" style={{ marginBottom: '2.5rem', padding: '2rem', textAlign: 'center' }}>
          <Info size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'inline-block' }} />
          <h3>No Reports Available</h3>
          <p className="text-muted">Deficiency reports for Week {activeWeek} have not been uploaded yet.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', height: '75vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} style={{ color: 'var(--accent-gold)' }} />
              <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Document Viewer</h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BookOpen size={18} style={{ color: 'var(--text-muted)' }} />
              <select 
                value={selectedReport || ''} 
                onChange={handleReportChange}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  background: 'var(--surface-background)',
                  border: '1px solid var(--surface-border)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {WEEK_REPORTS[activeWeek].map(report => (
                  <option key={report} value={report}>
                    {report.replace('.pdf', '')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', background: 'var(--surface-background)' }}>
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '3px solid var(--surface-border)', 
                  borderTopColor: 'var(--accent-gold)', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading Document...</p>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            
            {selectedReport && (
              <iframe 
                key={selectedReport}
                src={getPdfUrl()}
                title="Deficiency Report PDF Viewer"
                width="100%"
                height="100%"
                style={{ border: 'none', position: 'relative', zIndex: 1, background: 'transparent' }}
                onLoad={() => setLoading(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
