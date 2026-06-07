import { FileText, Info } from 'lucide-react';
import { useState } from 'react';

export default function GradeReports() {
  const [loading, setLoading] = useState(true);

  // We expect the file to be placed in the public folder as grade_report.pdf
  const pdfUrl = '/grade_report.pdf#toolbar=0&navpanes=0&scrollbar=0';

  return (
    <div className="grade-reports-page">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Grade Reports</h1>
          <p className="text-muted">Weekly Grade Report (1CL - 3CL)</p>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2.5rem', padding: '1rem 1.5rem', borderLeft: '4px solid var(--accent-gold)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Info size={20} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
          <p style={{ margin: 0 }}>
            <strong>Placeholder Notice:</strong> The document <code>grade_report.pdf</code> needs to be uploaded to the <code>public</code> folder. Once uploaded, it will automatically appear in the viewer below.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', height: '75vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-overlay)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={20} style={{ color: 'var(--accent-gold)' }} />
          <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Document Viewer</h2>
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
              <p style={{ color: 'var(--text-secondary)' }}>Loading Viewer...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}
          
          <iframe 
            src={pdfUrl}
            title="Grade Report PDF Viewer"
            width="100%"
            height="100%"
            style={{ border: 'none', position: 'relative', zIndex: 1, background: 'transparent' }}
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
