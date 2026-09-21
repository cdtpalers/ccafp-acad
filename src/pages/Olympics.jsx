import React, { useState } from 'react';
import { Medal, BookOpen, AlertCircle, TrendingUp, X } from 'lucide-react';
import olympicsLogo from '../assets/new_olympics_logo.jpg';
import { competitionsData } from '../data/olympicsRules';

export default function Olympics() {
  const [activeTab, setActiveTab] = useState('standings');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Placeholder data for standings (Company A-H)
  const standings = [
    { company: 'Alfa', gold: 0, silver: 0, bronze: 0, points: 0 },
    { company: 'Bravo', gold: 0, silver: 0, bronze: 0, points: 0 },
    { company: 'Charlie', gold: 0, silver: 0, bronze: 0, points: 0 },
    { company: 'Delta', gold: 0, silver: 0, bronze: 0, points: 0 },
    { company: 'Echo', gold: 0, silver: 0, bronze: 0, points: 0 },
    { company: 'Foxtrot', gold: 0, silver: 0, bronze: 0, points: 0 },
    { company: 'Golf', gold: 0, silver: 0, bronze: 0, points: 0 },
    { company: 'Hawk', gold: 0, silver: 0, bronze: 0, points: 0 },
  ];

  const competitions = competitionsData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Hero Section */}
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'radial-gradient(circle at 50% -20%, var(--accent-primary) 0%, transparent 60%)', 
          opacity: 0.1 
        }} />
        <img 
          src={olympicsLogo} 
          alt="Academic Olympics Background" 
          style={{ 
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translate(50%, -50%)',
            height: '180%',
            opacity: 0.15,
            pointerEvents: 'none'
          }} 
        />
        <h1 className="font-serif" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Academic Olympics 2027</h1>
        <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          Corps-wide academic competitions tracker. Monitor company standings and review event rules.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
        <button 
          onClick={() => setActiveTab('standings')}
          style={{ 
            padding: '1rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'standings' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'standings' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'standings' ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.05rem',
            transition: 'all 0.2s'
          }}
        >
          <TrendingUp size={18} />
          Standings
        </button>
        <button 
          onClick={() => setActiveTab('rules')}
          style={{ 
            padding: '1rem 1.5rem', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'rules' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'rules' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'rules' ? 600 : 400,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.05rem',
            transition: 'all 0.2s'
          }}
        >
          <BookOpen size={18} />
          Rules & Events
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'standings' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
              <h2 className="font-serif" style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Medal size={24} color="var(--accent-primary)" />
                Company Leaderboard
              </h2>
              <span className="badge badge-info">Live Updates Pending</span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                    <th style={{ textAlign: 'left' }}>Company</th>
                    <th style={{ textAlign: 'center' }}><span style={{ color: '#FFD700', fontSize: '1.2rem' }}>🥇</span> Gold</th>
                    <th style={{ textAlign: 'center' }}><span style={{ color: '#C0C0C0', fontSize: '1.2rem' }}>🥈</span> Silver</th>
                    <th style={{ textAlign: 'center' }}><span style={{ color: '#CD7F32', fontSize: '1.2rem' }}>🥉</span> Bronze</th>
                    <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((co, index) => (
                    <tr key={co.company}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>-</td>
                      <td style={{ fontWeight: 600 }}>{co.company}</td>
                      <td style={{ textAlign: 'center' }}>{co.gold}</td>
                      <td style={{ textAlign: 'center' }}>{co.silver}</td>
                      <td style={{ textAlign: 'center' }}>{co.bronze}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{co.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: '50%', color: 'var(--accent-primary)' }}>
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>General Guidelines</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                  The Academic Olympics 2027 will consist of multiple events designed to test the academic prowess, critical thinking, and collaborative skills of each company. Final rules and specific mechanics will be published here once finalized by the Academic Council.
                </p>
                <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-primary)', lineHeight: '1.8' }}>
                    <li>All participants must be in proper uniform during events.</li>
                    <li>Points are awarded as follows: Gold (5 pts), Silver (3 pts), Bronze (1 pt).</li>
                    <li>Any academic dishonesty will result in automatic disqualification for the company in that event.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {competitions.map((comp, i) => (
                <div 
                  key={i} 
                  className="glass-card" 
                  style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
                  onClick={() => setSelectedEvent(comp)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{comp.title}</h4>
                  <span className="badge badge-secondary" style={{ marginBottom: '1rem', display: 'inline-block' }}>{comp.type}</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {comp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setSelectedEvent(null)}>
          <div className="glass-panel modal-inner" style={{ background: 'var(--bg-color)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
              <X size={18} />
            </button>
            <div className="flex-between" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
              <span className="badge badge-secondary">{selectedEvent.type}</span>
            </div>
            <h1 style={{ marginBottom: '1.5rem', fontSize: '1.8rem', color: 'var(--accent-primary)', lineHeight: 1.3 }}>{selectedEvent.title}</h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
              {selectedEvent.desc}
            </p>
            <div className="rules-content" style={{ color: 'var(--text-primary)', lineHeight: '1.7', fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: selectedEvent.rulesHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}
