import { Users, Medal } from 'lucide-react';

export default function ExoCouncil() {
  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '3rem' }}>
        <div>
          <h1>Exo Council</h1>
          <p className="text-muted">Extracurricular Operations and Initiatives</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <Users className="text-accent-gold" />
          Exo Council Members
        </h2>
        
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Detailed structure and members of the Exo Council will be displayed here.
        </p>
      </div>
    </div>
  );
}
