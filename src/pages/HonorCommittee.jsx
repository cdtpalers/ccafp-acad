import { Shield, AlertTriangle, Book, CheckCircle, Scale, Eye } from 'lucide-react';

export default function HonorCommittee() {
  const reminders = [
    {
      title: "Academic Integrity",
      description: "Submit only your original work. Plagiarism or unauthorized collaboration will be strictly penalized.",
      icon: <Book size={24} style={{ color: 'var(--accent-gold)' }} />
    },
    {
      title: "Reporting Violations",
      description: "It is your duty to report any suspected honor code violations to the committee immediately.",
      icon: <AlertTriangle size={24} style={{ color: 'var(--accent-crimson)' }} />
    },
    {
      title: "Examination Conduct",
      description: "No talking, glancing, or using unauthorized materials during graded exercises and exams.",
      icon: <Eye size={24} style={{ color: 'var(--text-secondary)' }} />
    },
    {
      title: "Truthfulness",
      description: "Always speak the truth. Making false official statements violates the core tenets of the institution.",
      icon: <CheckCircle size={24} style={{ color: 'var(--text-primary)' }} />
    }
  ];

  return (
    <div className="honor-committee-page">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={28} style={{ color: 'var(--accent-gold)' }} />
            Honor Committee
          </h1>
          <p className="text-muted">Honor Code reminders and guidelines for all cadets</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginBottom: '3rem', borderTop: '4px solid var(--accent-gold)' }}>
        <Shield size={48} style={{ color: 'var(--accent-gold)', marginBottom: '1rem', display: 'inline-block' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '1px', fontFamily: 'serif', fontStyle: 'italic' }}>
          "We, the cadets, do not lie, cheat, steal, nor tolerate among us those who do."
        </h2>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          The Honor Code is the most fundamental aspect of your cadetship. It binds the Cadet Corps together and sets the foundation for your character as future leaders.
        </p>
      </div>

      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '4px', height: '1.5rem', background: 'var(--accent-gold)', borderRadius: '2px' }}></div>
        Key Reminders
      </h3>

      <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
        {reminders.map((reminder, idx) => (
          <div key={idx} className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.5rem' }}>
            <div style={{ 
              background: 'var(--surface-overlay)', 
              padding: '1rem', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--surface-border)'
            }}>
              {reminder.icon}
            </div>
            <div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{reminder.title}</h4>
              <p className="text-muted" style={{ lineHeight: '1.5' }}>{reminder.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="glass-panel" style={{ marginTop: '3rem', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', borderLeft: '4px solid var(--surface-border)' }}>
        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Have questions or need guidance?</h4>
          <p className="text-muted">Reach out to your respective company honor representatives.</p>
        </div>
        <button className="btn btn-primary" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', fontWeight: 600 }}>
          Contact Representatives
        </button>
      </div>
    </div>
  );
}
