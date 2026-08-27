import re

with open('src/pages/Deficiencies.jsx', 'r') as f:
    content = f.read()

def get_block(regex_start):
    # finds the ResponsiveContainer following the start regex
    match = re.search(regex_start + r'.*?(<ResponsiveContainer.*?</ResponsiveContainer>)', content, re.DOTALL)
    if not match:
        print("Not found for", regex_start)
        return ""
    return match.group(1)

trend_chart = get_block(r'setZoomedChart\(\'trend\'\)')
class_comp_chart = get_block(r'setZoomedChart\(\'class_comparison\'\)')
coy_comp_chart = get_block(r'setZoomedChart\(\'company_comparison\'\)')
course_chart = get_block(r'setZoomedChart\(\'course\'\)')
severity_chart = get_block(r'setZoomedChart\(\'severity\'\)')
class_coy_chart = get_block(r'setZoomedChart\(\'class_coy\'\)')

modal_jsx = f"""
      {{zoomedChart && (
        <div 
          style={{{{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}}}
          onClick={{() => setZoomedChart(null)}}
        >
          <div 
            className="glass-panel" 
            style={{{{ width: '90vw', height: '85vh', display: 'flex', flexDirection: 'column', position: 'relative', background: 'var(--surface-background)' }}}}
            onClick={{(e) => e.stopPropagation()}}
          >
            <button 
              onClick={{() => setZoomedChart(null)}} 
              style={{{{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--surface-overlay)', border: '1px solid var(--surface-border)', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}}}
            >
              <X size={{20}} style={{{{ color: 'var(--text-primary)' }}}} />
            </button>
            <div style={{{{ flex: 1, padding: '2rem 1rem 1rem 1rem', width: '100%', height: '100%' }}}}>
              {{zoomedChart === 'trend' && (
                {trend_chart.replace('\n', '\n                ')}
              )}}
              {{zoomedChart === 'class_comparison' && (
                {class_comp_chart.replace('\n', '\n                ')}
              )}}
              {{zoomedChart === 'company_comparison' && (
                {coy_comp_chart.replace('\n', '\n                ')}
              )}}
              {{zoomedChart === 'course' && (
                {course_chart.replace('\n', '\n                ')}
              )}}
              {{zoomedChart === 'severity' && (
                {severity_chart.replace('\n', '\n                ')}
              )}}
              {{zoomedChart === 'class_coy' && (
                {class_coy_chart.replace('\n', '\n                ')}
              )}}
            </div>
          </div>
        </div>
      )}}
"""

# Insert modal right before the final </div> of the page.
# The end of the file is:
#       )}
#     </div>
#   );
# }

new_content = content.replace("    </div>\n  );\n}", modal_jsx + "\n    </div>\n  );\n}")

with open('src/pages/Deficiencies.jsx', 'w') as f:
    f.write(new_content)

print("Modal added!")
