import React, { useState } from 'react';
import { Medal, BookOpen, AlertCircle, TrendingUp } from 'lucide-react';
import olympicsLogo from '../assets/acad_olympics_logo.png';

export default function Olympics() {
  const [activeTab, setActiveTab] = useState('standings');

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

  const competitions = [
    { title: 'Robotics Competition: Autonomous Ground Drone Racing Challenge', type: 'Team Event', desc: 'High-intensity autonomous ground drone racing challenge testing rapid integration, autonomous programming, sensor utilization, and mission-oriented decision-making.' },
    { title: 'Python Programming', type: 'Team Event', desc: 'Python-based programming challenge testing logic formulation, algorithmic thinking, and basic data handling relevant to military scenarios.' },
    { title: 'Data Analytics and Artificial Intelligence Datathon', type: 'Team Event', desc: 'Structured competition for cadets to exhibit systematic use of data, algorithms, and intelligent systems to support military decision-making.' },
    { title: 'Defense Systems Innovation Challenge', type: 'Team Event', desc: 'Interdisciplinary competition to conceptualize, design, and develop innovative military systems supporting modern Multi-Domain Operations.' },
    { title: 'SIMEX: Inter-Company Crisis Management Simulation Exercise', type: 'Team Event', desc: 'A national security decision simulation where company teams operate simultaneously analyzing and responding to identical scenario injects.' },
    { title: 'Academic Mustering: Military Undergraduate Symposium', type: 'Team Event', desc: 'Culminating research competition challenging companies to conduct original research and defend their work before a panel of evaluators.' },
    { title: 'Advocacy Film', type: 'Team Event', desc: 'Creative messaging competition to develop communication skills, critical thinking, and artistic expression through visual storytelling.' },
    { title: 'Position Paper Challenge', type: 'Team Event', desc: 'Cadets prepare a position paper based on a contemporary issue or operational scenario, emphasizing critical thinking and analytical writing.' },
    { title: 'Magsaysay Cup: Debate Open', type: 'Team Event', desc: 'Asian Parliamentary format debate testing effective communication, persuasion, and critical thinking on motions revolving around national security.' },
    { title: 'Language Proficiency Contest', type: 'Team Event', desc: 'Academic competition promoting the development and enhancement of English language skills in reading, listening, vocabulary, and grammar.' },
    { title: 'Company Mural', type: 'Team Event', desc: 'Focused on creative thinking and artistic expression that leads toward civic engagement, education, and advocacy demonstration.' },
    { title: 'Mathenik: Mathematical Excellence and Knowledge Challenge', type: 'Team Event', desc: 'Mathematics competition designed to develop and showcase mathematical knowledge, analytical thinking, teamwork, and problem-solving skills.' },
    { title: 'Lawpardy: A Law Jeopardy Game', type: 'Team Event', desc: 'Jeopardy-inspired competition to reinforce knowledge of law subjects like Law and Discipline, Human Rights, and International Humanitarian Law.' },
    { title: 'Tactix: The E-games Challenge', type: 'Team Event', desc: 'E-games competition (World of Warships, CoH3, Wargame: Red Dragon) to enhance decision-making and performance in tactical operations.' }
  ];

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
          alt="Academic Olympics 2027 Logo" 
          style={{ width: '140px', height: '140px', objectFit: 'contain', margin: '0 auto 1.5rem', display: 'block', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }} 
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
                <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
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
    </div>
  );
}
