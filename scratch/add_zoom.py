import re

with open('src/pages/Deficiencies.jsx', 'r') as f:
    content = f.read()

# 1. Trend chart
content = re.sub(
    r'(<span className="badge" style={{ background: \'color-mix\(in srgb, var\(--accent-primary\) 15%, transparent\)\', color: \'var\(--accent-primary\)\', fontSize: \'0\.75rem\' }}>\s*Filtered View\s*</span>\s*)}',
    r'\1}\n                  <button onClick={() => setZoomedChart(\'trend\')} className="btn" style={{ padding: \'0.25rem 0.5rem\', background: \'transparent\', border: \'1px solid var(--surface-border)\', color: \'var(--text-secondary)\' }}><Maximize2 size={16} /></button>',
    content
)
# Add button if filtered view is NOT there... wait, the filtered view is conditional.
# Let's add the button to the parent div instead.
