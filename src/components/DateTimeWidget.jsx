import React, { useState, useEffect } from 'react';

export default function DateTimeWidget({ isCollapsed }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isCollapsed) return null;

  const pad = (n) => n.toString().padStart(2, '0');

  const timeBlocks = [
    { value: pad(time.getHours()), label: 'HOURS' },
    { value: pad(time.getMinutes()), label: 'MINS' },
    { value: pad(time.getSeconds()), label: 'SECS' }
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="datetime-monitor" style={{
      margin: '0.5rem 1rem 1.5rem 1rem',
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(var(--blur-md))',
      WebkitBackdropFilter: 'blur(var(--blur-md))',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--surface-border)',
      color: 'var(--text-primary)',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
        {timeBlocks.map((b, i) => (
          <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{
              background: 'var(--surface-overlay)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.2rem',
              width: '100%',
              fontSize: '1.4rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--accent-primary)',
              letterSpacing: '0.5px',
              marginBottom: '0.4rem',
              border: '1px solid var(--surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {b.value}
            </div>
            <div className="label-tactical" style={{ fontSize: '0.55rem', letterSpacing: '0.16em' }}>{b.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'color-mix(in srgb, var(--accent-primary) 12%, transparent)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem',
        border: '1px solid var(--surface-border)'
      }}>
        <div className="label-tactical" style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', marginBottom: '0.3rem' }}>Current Date</div>
        <div className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📅</span>
          {dayName[time.getDay()]}, {monthNames[time.getMonth()]} {time.getDate()}
        </div>
        <div className="label-tactical" style={{ fontSize: '0.62rem' }}>A.Y. 2026&ndash;2027 &middot; 1st Term</div>
      </div>
    </div>
  );
}
