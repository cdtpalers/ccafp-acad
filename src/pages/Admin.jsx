import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Send, AlertCircle } from 'lucide-react';

export default function Admin() {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Info',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    image: '',
    content: '',
    class: '',
    isHtml: false,
    council: 'Academic Council'
  });
  
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: false });
    
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([
          {
            title: formData.title,
            type: formData.type,
            date: formData.date,
            image: formData.image,
            content: formData.content,
            class: formData.class,
            isHtml: formData.isHtml,
            council: formData.council
          }
        ]);
        
      if (error) throw error;
      
      setStatus({ loading: false, error: null, success: true });
      // Reset form
      setFormData({
        title: '',
        type: 'Info',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        image: '',
        content: '',
        class: '',
        isHtml: false,
        council: 'Academic Council'
      });
      
      setTimeout(() => setStatus(prev => ({...prev, success: false})), 3000);
      
    } catch (err) {
      console.error('Error adding announcement:', err);
      setStatus({ loading: false, error: err.message, success: false });
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Add Event / Announcement</h1>
          <p className="text-muted">Create a new post in the Supabase database</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {status.error && (
          <div style={{ padding: '1rem', background: 'var(--accent-crimson)', color: '#fff', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            {status.error}
          </div>
        )}
        
        {status.success && (
          <div style={{ padding: '1rem', background: 'var(--success)', color: '#fff', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            Successfully added the announcement!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title *</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="input-field" 
                style={{ width: '100%' }}
                required 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Council / Origin *</label>
              <select 
                name="council" 
                value={formData.council} 
                onChange={handleChange} 
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="Academic Council">Academic Council</option>
                <option value="Exo Council">Exo Council</option>
                <option value="Honor Committee">Honor Committee</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-2" style={{ gap: '1.5rem' }}>
             <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange} 
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="Info">Info</option>
                <option value="Important">Important</option>
                <option value="Event">Event</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date</label>
              <input 
                type="text" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="input-field" 
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Target Class (Optional)</label>
            <input 
              type="text" 
              name="class" 
              value={formData.class} 
              onChange={handleChange} 
              placeholder="e.g. 1CL, 2CL, 3CL, 4CL or leave blank"
              className="input-field" 
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Image URL (Optional)</label>
            <input 
              type="text" 
              name="image" 
              value={formData.image} 
              onChange={handleChange} 
              placeholder="Google Drive link or direct image URL"
              className="input-field" 
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Content *</label>
            <textarea 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              className="input-field" 
              style={{ width: '100%', minHeight: '150px', resize: 'vertical' }}
              required 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="isHtml" 
              name="isHtml" 
              checked={formData.isHtml} 
              onChange={handleChange} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isHtml" style={{ cursor: 'pointer', fontWeight: 500 }}>Content is raw HTML</label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={status.loading}
            style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {status.loading ? 'Adding...' : (
              <>
                <Send size={18} />
                Publish Announcement
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
