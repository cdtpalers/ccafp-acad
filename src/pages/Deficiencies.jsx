import { AlertCircle, UserX, ChevronUp, ChevronDown, ArrowUpDown, Lock, Eye, EyeOff, Calendar, Download, Activity, TrendingUp, TrendingDown, BookOpen, Users, Zap, Flame, FileDown } from 'lucide-react';
import { Fragment } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportDeficiencyPdf } from './exportDeficiencyPdf';

function parseCSV(csv) {
  const lines = [];
  let currentLine = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentVal += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      currentLine.push(currentVal);
      currentVal = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') ++i;
      currentLine.push(currentVal);
      lines.push(currentLine);
      currentLine = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentLine.length > 0) {
    currentLine.push(currentVal);
    lines.push(currentLine);
  }

  const headers = lines[0].map(h => h.trim());
  return lines.slice(1).filter(line => line.join('').trim() !== '').map(line => {
    return headers.reduce((obj, header, i) => {
      obj[header] = line[i] ? line[i].trim() : '';
      return obj;
    }, {});
  });
}

const WEEKS = [7, 6, 5, 4, 3, 2, 1];

const WEEK_CSV_FILES = {
  1: '/week1_deficiencies.csv',
  2: '/week2_deficiencies.csv',
  3: '/week3_deficiencies.csv',
  4: '/week4_deficiencies.csv',
  5: '/week5_deficiencies.csv',
  6: '/week6_deficiencies.csv',
  7: '/week7_deficiencies.csv',
};

const COMPANY_NAMES = {
  'A': 'Alfa Company',
  'B': 'Bravo Company',
  'C': 'Charlie Company',
  'D': 'Delta Company',
  'E': 'Echo Company',
  'F': 'Foxtrot Company',
  'G': 'Golf Company',
  'H': 'Hawk Company',
};

const COMPANY_COLORS = {
  'A': '#22c55e', // Green
  'B': '#f8fafc', // White
  'C': '#ef4444', // Red
  'D': '#3b82f6', // Blue
  'E': '#f97316', // Orange
  'F': '#7f1d1d', // Maroon
  'G': '#eab308', // Yellow
  'H': '#334155', // Dark colored
  'Unspecified': '#9ca3af', // Gray
};

export default function Deficiencies() {
  const [allWeeksData, setAllWeeksData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeWeek, setActiveWeek] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('data');
  const [hoveredBar, setHoveredBar] = useState(null);
  
  // Collapse States
  const [isDataChartsCollapsed, setIsDataChartsCollapsed] = useState(false);
  const [isSpecialConcernCollapsed, setIsSpecialConcernCollapsed] = useState(false);
  const [isComparisonChartsCollapsed, setIsComparisonChartsCollapsed] = useState(false);
  
  // Interactive Legend State for Trend Chart
  const [activeLines, setActiveLines] = useState({ totalDeficiencies: true, uniqueCadets: true, avgGrade: false });

  // 1. Fetch ALL data on mount
  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      try {
        const promises = Object.keys(WEEK_CSV_FILES).map(async (weekStr) => {
          const week = parseInt(weekStr);
          const url = WEEK_CSV_FILES[week];
          const text = await fetch(url).then(r => r.ok ? r.text() : null);
          if (!text) return { week, data: [] };
          return { week, data: parseCSV(text) };
        });
        
        const results = await Promise.all(promises);
        const newAllData = {};
        results.forEach(r => {
          newAllData[r.week] = r.data;
        });
        setAllWeeksData(newAllData);
      } catch (error) {
        console.error("Error fetching all weeks data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  // 2. Derive active week and prev week deficiencies
  const deficiencies = allWeeksData[activeWeek] || [];
  const prevDeficiencies = activeWeek > 1 ? (allWeeksData[activeWeek - 1] || []) : [];

  // 3. Dynamically compute the trend across all weeks based on current filters
  const allWeeksTrend = useMemo(() => {
    const validWeeks = Object.keys(allWeeksData).map(w => parseInt(w)).sort((a, b) => a - b);
    if (validWeeks.length === 0) return [];
    
    return validWeeks.map(week => {
      let data = allWeeksData[week] || [];
      
      // Apply filters
      if (selectedClassFilter !== 'All') {
        data = data.filter(d => (d.class || '').toUpperCase() === selectedClassFilter);
      }
      if (selectedCompanyFilter !== 'All') {
        data = data.filter(d => (d.company || d.coy || '') === selectedCompanyFilter);
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        data = data.filter(d => 
          (d.cadet || '').toLowerCase().includes(term) ||
          (d.course || '').toLowerCase().includes(term) ||
          (d.course_name || '').toLowerCase().includes(term) ||
          (d.company || '').toLowerCase().includes(term) ||
          (d.cn || '').toLowerCase().includes(term)
        );
      }
      
      const uniqueCadets = new Set(data.map(d => d.cadet).filter(Boolean)).size;
      const grades = data.map(d => parseFloat(d.grade)).filter(g => !isNaN(g));
      const avgGrade = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length) : 0;
      
      return {
        week,
        name: `Week ${week}`,
        totalDeficiencies: data.length,
        uniqueCadets,
        avgGrade: parseFloat(avgGrade.toFixed(2))
      };
    });
  }, [allWeeksData, selectedClassFilter, selectedCompanyFilter, searchTerm]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleWeekChange = (week) => {
    setActiveWeek(week);
    setSelectedClassFilter('All');
    setSelectedCompanyFilter('All');
    setSearchTerm('');
    setSortConfig({ key: null, direction: 'asc' });
    if (week === 1) setViewMode('data');
  };

  const filteredData = useMemo(() => {
    let data = selectedClassFilter === 'All'
      ? deficiencies
      : deficiencies.filter(d => (d.class || '').toUpperCase() === selectedClassFilter);
    
    if (selectedCompanyFilter !== 'All') {
      data = data.filter(d => (d.company || d.coy || '') === selectedCompanyFilter);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(d => 
        (d.cadet || '').toLowerCase().includes(term) ||
        (d.course || '').toLowerCase().includes(term) ||
        (d.course_name || '').toLowerCase().includes(term) ||
        (d.company || '').toLowerCase().includes(term) ||
        (d.cn || '').toLowerCase().includes(term)
      );
    }
    
    return data;
  }, [deficiencies, selectedClassFilter, selectedCompanyFilter, searchTerm]);

  const groupedData = useMemo(() => {
    return filteredData.reduce((acc, def) => {
      const cls = def.class || 'Unspecified Class';
      const crs = def.course_name ? `${def.course} - ${def.course_name}` : (def.course || 'Unspecified Course');
      if (!acc[cls]) acc[cls] = {};
      if (!acc[cls][crs]) acc[cls][crs] = [];
      acc[cls][crs].push(def);
      return acc;
    }, {});
  }, [filteredData]);

  const courseCounts = useMemo(() => {
    return deficiencies.reduce((acc, def) => {
      const crs = def.course || 'Unspecified';
      const coy = def.company || def.coy || 'Unspecified';
      if (!acc[crs]) acc[crs] = { total: 0, companies: {} };
      acc[crs].total += 1;
      acc[crs].companies[coy] = (acc[crs].companies[coy] || 0) + 1;
      return acc;
    }, {});
  }, [deficiencies]);

  const sortedCourses = useMemo(() => Object.entries(courseCounts).sort((a, b) => b[1].total - a[1].total), [courseCounts]);
  const topCourse = sortedCourses.length > 0 ? sortedCourses[0][0] : "N/A";
  const topCourseCount = sortedCourses.length > 0 ? sortedCourses[0][1].total : 0;
  const maxCourseCount = sortedCourses.length > 0 ? sortedCourses[0][1].total : 1;

  const companyCounts = useMemo(() => {
    return deficiencies.reduce((acc, def) => {
      const coy = def.company || def.coy || 'Unspecified';
      acc[coy] = (acc[coy] || 0) + 1;
      return acc;
    }, {});
  }, [deficiencies]);

  const sortedCompanies = useMemo(() => Object.entries(companyCounts).sort((a, b) => b[1] - a[1]), [companyCounts]);
  const topCompany = sortedCompanies.length > 0 ? sortedCompanies[0][0] : "N/A";
  const topCompanyCount = sortedCompanies.length > 0 ? sortedCompanies[0][1] : 0;
  const maxCompanyCount = sortedCompanies.length > 0 ? sortedCompanies[0][1] : 1;

  // Severity analysis per company
  const companySeverity = useMemo(() => {
    const stats = {};
    deficiencies.forEach(def => {
      const coy = def.company || def.coy || 'Unspecified';
      const pts = Math.abs(parseFloat(def.pts) || 0);
      if (!stats[coy]) stats[coy] = { count: 0, totalPts: 0, cadets: {} };
      stats[coy].count += 1;
      stats[coy].totalPts += pts;
      const cadetName = def.cadet || 'Unknown';
      if (!stats[coy].cadets[cadetName]) stats[coy].cadets[cadetName] = { totalPts: 0, subjectCount: 0 };
      stats[coy].cadets[cadetName].totalPts += pts;
      stats[coy].cadets[cadetName].subjectCount += 1;
    });
    
    return Object.entries(stats).map(([coy, data]) => {
      const uniqueCadets = Object.keys(data.cadets).length;
      const avgPtsPerCadet = uniqueCadets > 0 ? data.totalPts / uniqueCadets : 0;
      const avgPtsPerDef = data.count > 0 ? data.totalPts / data.count : 0;
      // Severity tier based on avg pts per cadet
      let tier = 'Low';
      let tierColor = 'var(--success)';
      if (avgPtsPerCadet >= 15) { tier = 'Critical'; tierColor = '#dc2626'; }
      else if (avgPtsPerCadet >= 10) { tier = 'High'; tierColor = '#f97316'; }
      else if (avgPtsPerCadet >= 5) { tier = 'Moderate'; tierColor = '#eab308'; }
      
      return {
        coy,
        name: COMPANY_NAMES[coy] || coy,
        count: data.count,
        uniqueCadets,
        totalPts: parseFloat(data.totalPts.toFixed(2)),
        avgPtsPerCadet: parseFloat(avgPtsPerCadet.toFixed(2)),
        avgPtsPerDef: parseFloat(avgPtsPerDef.toFixed(2)),
        tier,
        tierColor,
        color: COMPANY_COLORS[coy] || COMPANY_COLORS['Unspecified'],
      };
    }).sort((a, b) => b.totalPts - a.totalPts);
  }, [deficiencies]);

  const mostSevereCompany = companySeverity.length > 0 ? companySeverity[0] : null;
  const maxTotalPts = companySeverity.length > 0 ? Math.max(...companySeverity.map(c => c.totalPts)) : 1;
  const maxAvgPts = companySeverity.length > 0 ? Math.max(...companySeverity.map(c => c.avgPtsPerCadet)) : 1;

  const comparisonStats = useMemo(() => {
    if (viewMode !== 'comparison') return null;
    
    const currentData = filteredData; 
    
    let prevData = selectedClassFilter === 'All'
      ? prevDeficiencies
      : prevDeficiencies.filter(d => (d.class || '').toUpperCase() === selectedClassFilter);
    
    if (selectedCompanyFilter !== 'All') {
      prevData = prevData.filter(d => (d.company || d.coy || '') === selectedCompanyFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      prevData = prevData.filter(d => 
        (d.cadet || '').toLowerCase().includes(term) ||
        (d.course || '').toLowerCase().includes(term) ||
        (d.course_name || '').toLowerCase().includes(term) ||
        (d.company || '').toLowerCase().includes(term) ||
        (d.cn || '').toLowerCase().includes(term)
      );
    }

    const currentTotal = currentData.length;
    const prevTotal = prevData.length;
    
    const currentUniqueCadets = new Set(currentData.map(d => d.cadet).filter(Boolean));
    const prevUniqueCadets = new Set(prevData.map(d => d.cadet).filter(Boolean));
    
    const currentGrades = currentData.map(d => parseFloat(d.grade)).filter(g => !isNaN(g));
    const prevGrades = prevData.map(d => parseFloat(d.grade)).filter(g => !isNaN(g));
    
    const currentAvg = currentGrades.length ? (currentGrades.reduce((a, b) => a + b, 0) / currentGrades.length) : 0;
    const prevAvg = prevGrades.length ? (prevGrades.reduce((a, b) => a + b, 0) / prevGrades.length) : 0;

    const classCounts = { '1CL': { prev: 0, curr: 0 }, '2CL': { prev: 0, curr: 0 }, '3CL': { prev: 0, curr: 0 } };
    currentData.forEach(d => { if (classCounts[d.class]) classCounts[d.class].curr++; });
    prevData.forEach(d => { if (classCounts[d.class]) classCounts[d.class].prev++; });
    
    const chartData = [
      { name: '1CL', [`Week ${activeWeek - 1}`]: classCounts['1CL'].prev, [`Week ${activeWeek}`]: classCounts['1CL'].curr },
      { name: '2CL', [`Week ${activeWeek - 1}`]: classCounts['2CL'].prev, [`Week ${activeWeek}`]: classCounts['2CL'].curr },
      { name: '3CL', [`Week ${activeWeek - 1}`]: classCounts['3CL'].prev, [`Week ${activeWeek}`]: classCounts['3CL'].curr },
    ];

    const companyCountsCurr = {};
    const companyCountsPrev = {};
    currentData.forEach(d => {
      const coy = d.company || d.coy || 'Unspecified';
      companyCountsCurr[coy] = (companyCountsCurr[coy] || 0) + 1;
    });
    prevData.forEach(d => {
      const coy = d.company || d.coy || 'Unspecified';
      companyCountsPrev[coy] = (companyCountsPrev[coy] || 0) + 1;
    });
    
    const allCompanies = [...new Set([...Object.keys(companyCountsCurr), ...Object.keys(companyCountsPrev)])].sort();
    const companyChartData = allCompanies.map(coy => ({
      name: coy,
      fullName: COMPANY_NAMES[coy] || coy,
      [`Week ${activeWeek - 1}`]: companyCountsPrev[coy] || 0,
      [`Week ${activeWeek}`]: companyCountsCurr[coy] || 0,
    }));

    const cleared = [...prevUniqueCadets].filter(c => !currentUniqueCadets.has(c));
    const newlyDeficient = [...currentUniqueCadets].filter(c => !prevUniqueCadets.has(c));
    
    const cadetClassMap = {};
    prevData.concat(currentData).forEach(d => {
      if (d.cadet && d.class) cadetClassMap[d.cadet] = d.class;
    });

    // Total Points
    const currentTotalPts = currentData.reduce((sum, d) => sum + (parseFloat(d.pts) || 0), 0);
    const prevTotalPts = prevData.reduce((sum, d) => sum + (parseFloat(d.pts) || 0), 0);
    const diffTotalPts = currentTotalPts - prevTotalPts;

    // Course Volatility
    const courseCountsCurr = {};
    const courseCountsPrev = {};
    currentData.forEach(d => {
      const crs = d.course || 'Unknown';
      courseCountsCurr[crs] = (courseCountsCurr[crs] || 0) + 1;
    });
    prevData.forEach(d => {
      const crs = d.course || 'Unknown';
      courseCountsPrev[crs] = (courseCountsPrev[crs] || 0) + 1;
    });
    
    const allCourses = [...new Set([...Object.keys(courseCountsCurr), ...Object.keys(courseCountsPrev)])];
    let maxCourseIncrease = { course: null, diff: 0 };
    let maxCourseDecrease = { course: null, diff: 0 };
    
    allCourses.forEach(crs => {
      const diff = (courseCountsCurr[crs] || 0) - (courseCountsPrev[crs] || 0);
      if (diff > maxCourseIncrease.diff) maxCourseIncrease = { course: crs, diff };
      if (diff < maxCourseDecrease.diff) maxCourseDecrease = { course: crs, diff };
    });

    // Company Shifts
    let maxCompanyIncrease = { company: null, diff: 0 };
    let maxCompanyDecrease = { company: null, diff: 0 };
    allCompanies.forEach(coy => {
      const diff = (companyCountsCurr[coy] || 0) - (companyCountsPrev[coy] || 0);
      if (diff > maxCompanyIncrease.diff) maxCompanyIncrease = { company: coy, diff };
      if (diff < maxCompanyDecrease.diff) maxCompanyDecrease = { company: coy, diff };
    });

    // Chronic Cadets
    const chronicCadets = [...currentUniqueCadets].filter(c => prevUniqueCadets.has(c));
    const chronicCount = chronicCadets.length;

    return {
      currentTotal, prevTotal, diffTotal: currentTotal - prevTotal,
      currentCadets: currentUniqueCadets.size, prevCadets: prevUniqueCadets.size, diffCadets: currentUniqueCadets.size - prevUniqueCadets.size,
      currentAvg, prevAvg, diffAvg: currentAvg - prevAvg,
      currentTotalPts, prevTotalPts, diffTotalPts,
      maxCourseIncrease, maxCourseDecrease,
      maxCompanyIncrease, maxCompanyDecrease,
      chronicCount,
      chartData,
      companyChartData,
      cleared: cleared.map(c => ({ name: c, class: cadetClassMap[c] || 'N/A' })),
      newlyDeficient: newlyDeficient.map(c => ({ name: c, class: cadetClassMap[c] || 'N/A' }))
    };
  }, [viewMode, filteredData, prevDeficiencies, selectedClassFilter, selectedCompanyFilter, searchTerm, activeWeek]);

  const specialConcernCadets = useMemo(() => {
    const cadetStats = {};
    filteredData.forEach(def => {
      const name = def.cadet;
      if (!name) return;
      if (!cadetStats[name]) {
        cadetStats[name] = { 
          name, 
          totalPts: 0, 
          subjectCount: 0, 
          company: def.company || def.coy || '-', 
          class: def.class || '-' 
        };
      }
      cadetStats[name].totalPts += (parseFloat(def.pts) || 0);
      cadetStats[name].subjectCount += 1;
    });
    
    return Object.values(cadetStats)
      .filter(c => c.totalPts > 20 || c.subjectCount >= 3)
      .sort((a, b) => b.totalPts - a.totalPts || b.subjectCount - a.subjectCount);
  }, [filteredData]);

  const renderComparativeInsights = (stats) => {
    if (!stats) return null;
    let prefix = selectedClassFilter === 'All' ? 'The Cadet Corps' : `${selectedClassFilter}`;
    if (selectedCompanyFilter !== 'All') {
      prefix = `${prefix} (${COMPANY_NAMES[selectedCompanyFilter] || selectedCompanyFilter})`;
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📊</span> The Big Picture
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {prefix} saw a net <strong>{stats.diffTotal <= 0 ? 'decrease' : 'increase'} of {Math.abs(stats.diffTotal)}</strong> deficiency records from Week {activeWeek - 1} to Week {activeWeek}. 
            {stats.cleared.length > 0 && ` Encouragingly, ${stats.cleared.length} cadets managed to completely clear their deficient status.`}
            {stats.newlyDeficient.length > 0 && ` However, ${stats.newlyDeficient.length} new cadets fell into deficient status.`}
          </p>
        </div>

        <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span> Severity Trend
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Total deficiency points across the tracked group {stats.diffTotalPts > 0 ? 'worsened' : 'improved'} by <strong>{Math.abs(stats.diffTotalPts).toFixed(2)} pts</strong>. 
            {stats.diffTotalPts > 0 ? " This indicates that existing academic struggles are deepening, even if headcounts remain stable." : " This shows a tangible recovery in grades and academic standing."}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-crimson)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📈</span> Biggest Concern
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {stats.maxCourseIncrease.course && stats.maxCourseIncrease.diff > 0 ? (
                <li><strong>{stats.maxCourseIncrease.course}</strong> spiked with {stats.maxCourseIncrease.diff} new records.</li>
              ) : <li>No significant course spikes.</li>}
              {stats.maxCompanyIncrease.company && stats.maxCompanyIncrease.diff > 0 ? (
                <li><strong>{COMPANY_NAMES[stats.maxCompanyIncrease.company] || stats.maxCompanyIncrease.company}</strong> saw the highest surge (+{stats.maxCompanyIncrease.diff} records).</li>
              ) : <li>No significant company surges.</li>}
            </ul>
          </div>
          
          <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📉</span> Biggest Win
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {stats.maxCourseDecrease.course && stats.maxCourseDecrease.diff < 0 ? (
                <li><strong>{stats.maxCourseDecrease.course}</strong> showed the best recovery ({stats.maxCourseDecrease.diff} records).</li>
              ) : <li>No significant course recoveries.</li>}
              {stats.maxCompanyDecrease.company && stats.maxCompanyDecrease.diff < 0 ? (
                <li><strong>{COMPANY_NAMES[stats.maxCompanyDecrease.company] || stats.maxCompanyDecrease.company}</strong> improved the most ({stats.maxCompanyDecrease.diff} records).</li>
              ) : <li>No significant company recoveries.</li>}
            </ul>
          </div>
        </div>

        <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⏱️</span> Chronic Watch
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Out of {stats.currentCadets} currently deficient cadets, <strong>{stats.chronicCount}</strong> are considered 'chronic' (deficient in both Week {activeWeek - 1} and Week {activeWeek}). 
            This represents {stats.currentCadets > 0 ? Math.round((stats.chronicCount / stats.currentCadets) * 100) : 0}% of the struggling population.
          </p>
        </div>
      </div>
    );
  };

  const Pill = ({ value, label, positiveIsGood = true, isFloat = false }) => {
    const isZero = Math.abs(value) < 0.001;
    const isPositive = value > 0;
    const isGood = positiveIsGood ? isPositive : !isPositive;
    
    if (isZero) return <span className="badge" style={{ background: 'var(--surface-overlay)', color: 'var(--text-secondary)' }}>No Change</span>;
    
    const displayValue = isFloat ? value.toFixed(2) : value;
    const sign = isPositive ? '+' : '';
    
    return (
      <span className="badge" style={{ 
        background: isGood ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--accent-crimson) 15%, transparent)',
        color: isGood ? 'var(--success)' : 'var(--accent-crimson)',
        fontWeight: 600,
        fontSize: '0.75rem',
        padding: '0.2rem 0.5rem'
      }}>
        {sign}{displayValue} {label}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-card modal-inner" style={{ padding: '3rem', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'color-mix(in srgb, var(--accent-crimson) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Lock size={28} style={{ color: 'var(--accent-crimson)' }} />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Restricted Access</h2>
          <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>This section contains sensitive cadet records. Please enter the access code to continue.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'betterccafp') {
              setIsAuthenticated(true);
              setAuthError('');
            } else {
              setAuthError('Incorrect password. Access denied.');
            }
          }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                placeholder="Enter access code..."
                className="input-field"
                style={{ width: '100%', paddingRight: '3rem' }}
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {authError && (
              <p style={{ color: 'var(--accent-crimson)', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</p>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="deficiencies-page">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle className="text-accent-crimson" size={28} />
            Academic Deficiencies Tracker
          </h1>
          <p className="text-muted" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>{selectedClassFilter === 'All' ? 'Cadet Corps Overview' : `${selectedClassFilter} Overview`}</p>
        </div>
        {WEEK_CSV_FILES[activeWeek] && deficiencies.length > 0 && (
          <button
            onClick={() => exportDeficiencyPdf({ activeWeek, deficiencies, companySeverity, sortedCourses, specialConcernCadets, groupedData })}
            className="btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              background: 'var(--surface-overlay)',
              border: '1px solid var(--surface-border)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <FileDown size={18} />
            Export PDF
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-overlay)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--surface-border)', width: 'fit-content', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${viewMode === 'data' ? 'btn-primary' : ''}`}
          style={{ 
            background: viewMode === 'data' ? 'var(--surface-background)' : 'transparent',
            color: viewMode === 'data' ? 'var(--text-primary)' : 'var(--text-muted)',
            border: viewMode === 'data' ? '1px solid var(--surface-border)' : 'none',
            boxShadow: viewMode === 'data' ? 'var(--shadow-sm)' : 'none',
            padding: '0.5rem 1rem',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setViewMode('data')}
        >
          Week {activeWeek} Data
        </button>
        {activeWeek > 1 && (
          <button 
            className={`btn ${viewMode === 'comparison' ? 'btn-primary' : ''}`}
            style={{ 
              background: viewMode === 'comparison' ? 'var(--accent-primary-light)' : 'transparent',
              color: viewMode === 'comparison' ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: viewMode === 'comparison' ? '1px solid var(--accent-primary)' : 'none',
              boxShadow: viewMode === 'comparison' ? 'var(--shadow-md)' : 'none',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setViewMode('comparison')}
          >
            <Activity size={16} />
            Comparative Insights
          </button>
        )}
      </div>

      {/* Week Tabs */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {WEEKS.map(week => (
          <button
            key={week}
            onClick={() => handleWeekChange(week)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: activeWeek === week ? 'var(--accent-primary)' : 'transparent',
              color: activeWeek === week ? '#fff' : 'var(--text-primary)',
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

      {!WEEK_CSV_FILES[activeWeek] ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'inline-block' }} />
          <h3>No Deficiency Data Available</h3>
          <p className="text-muted">Deficiency reports for Week {activeWeek} have not been processed yet.</p>
        </div>
      ) : viewMode === 'comparison' && comparisonStats ? (
        <>
          {allWeeksTrend.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '350px', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                Cadet Corps Deficiency Trend
              </h3>
              <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={allWeeksTrend} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Tooltip cursor={{ stroke: 'var(--surface-border)', strokeWidth: 1 }} contentStyle={{ backgroundColor: 'var(--surface-glass)', border: '1px solid var(--surface-border)', borderRadius: '8px' }} />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} 
                      onClick={(e) => {
                        const { dataKey } = e;
                        setActiveLines(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
                      }}
                      formatter={(value, entry, index) => {
                        const { dataKey } = entry;
                        const isActive = activeLines[dataKey];
                        return <span style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'color 0.2s', cursor: 'pointer', opacity: isActive ? 1 : 0.5 }}>{value}</span>;
                      }}
                    />
                    {activeLines.totalDeficiencies && <Line yAxisId="left" type="monotone" dataKey="totalDeficiencies" name="Total Deficiencies" stroke="#93C5FD" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />}
                    {activeLines.uniqueCadets && <Line yAxisId="right" type="monotone" dataKey="uniqueCadets" name="Affected Cadets" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />}
                    {activeLines.avgGrade && <Line yAxisId="right" type="monotone" dataKey="avgGrade" name="Average Grade" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ marginBottom: '1.5rem', background: 'color-mix(in srgb, var(--accent-primary) 5%, var(--surface-glass))', border: '1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)', position: 'relative', overflow: 'hidden' }}>
            <Activity size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', color: 'var(--accent-primary)', opacity: 0.05 }} />
            <h3 style={{ color: 'var(--accent-primary)', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} />
              AI Generated Comparison
            </h3>
            <div style={{ marginTop: '0.5rem' }}>
              {renderComparativeInsights(comparisonStats)}
            </div>
          </div>

          <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <BookOpen size={16} /> Total Deficiencies
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{comparisonStats.currentTotal}</h3>
                <Pill value={comparisonStats.diffTotal} label={`from W${activeWeek - 1}`} positiveIsGood={false} />
              </div>
            </div>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <Users size={16} /> Affected Cadets
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{comparisonStats.currentCadets}</h3>
                <Pill value={comparisonStats.diffCadets} label={`from W${activeWeek - 1}`} positiveIsGood={false} />
              </div>
            </div>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <TrendingUp size={16} /> Average Grade
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{comparisonStats.currentAvg.toFixed(2)}</h3>
                <Pill value={comparisonStats.diffAvg} label={`pts`} positiveIsGood={true} isFloat={true} />
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '1rem 1.5rem' }} onClick={() => setIsComparisonChartsCollapsed(!isComparisonChartsCollapsed)}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Activity size={20} />
              Comparative Charts
            </h3>
            {isComparisonChartsCollapsed ? <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} />}
          </div>
          
          {!isComparisonChartsCollapsed && (
            <>
          <div className="grid-cols-2" style={{ marginBottom: '3rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '400px' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart size={18} style={{ color: 'var(--accent-primary)' }} />
                Deficiencies per Class (W{activeWeek - 1} vs W{activeWeek})
              </h3>
              <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonStats.chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'var(--surface-overlay)' }} contentStyle={{ backgroundColor: 'var(--surface-glass)', border: '1px solid var(--surface-border)', borderRadius: '8px' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Bar dataKey={`Week ${activeWeek - 1}`} fill="#93C5FD" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={`Week ${activeWeek}`} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '400px', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-overlay)' }}>
                <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} style={{ color: 'var(--success)' }} />
                  Cadet Progress Tracker
                </h3>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {comparisonStats.cleared.length === 0 && comparisonStats.newlyDeficient.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>No changes in cadet status between weeks.</p>
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {comparisonStats.cleared.map((c, i) => (
                      <li key={`cleared-${i}`} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.class}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>CLEARED (W{activeWeek - 1} to W{activeWeek})</span>
                      </li>
                    ))}
                    {comparisonStats.newlyDeficient.map((c, i) => (
                      <li key={`new-${i}`} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.class}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-crimson)' }}>NEW (W{activeWeek})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '400px', marginBottom: '3rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart size={18} style={{ color: 'var(--accent-primary)' }} />
              Deficiencies per Company (W{activeWeek - 1} vs W{activeWeek})
            </h3>
            <div style={{ flex: 1, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonStats.companyChartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--surface-overlay)' }} 
                    contentStyle={{ backgroundColor: 'var(--surface-glass)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                    labelFormatter={(label) => COMPANY_NAMES[label] || label}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Bar dataKey={`Week ${activeWeek - 1}`} fill="#93C5FD" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={`Week ${activeWeek}`} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          </>
          )}
        </>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            <div className="glass-card" style={{ borderTop: '2px solid var(--accent-crimson)' }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{new Set(deficiencies.map(d => d.cadet).filter(Boolean)).size}</h3>
              <p className="text-muted">Deficient Cadets</p>
            </div>
            <div className="glass-card" style={{ borderTop: '2px solid var(--accent-primary)' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={COMPANY_NAMES[topCompany] || topCompany}>
                {COMPANY_NAMES[topCompany] || topCompany}
              </h3>
              <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Most Deficient Cadets</span>
                <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{topCompanyCount}</span>
              </p>
            </div>
            {mostSevereCompany && (
              <div className="glass-card" style={{ borderTop: '2px solid #f97316' }}>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }} title={mostSevereCompany.name}>
                  <Flame size={22} style={{ color: '#f97316', flexShrink: 0 }} />
                  {mostSevereCompany.name}
                </h3>
                <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Most Severe (Total Pts)</span>
                  <span className="badge badge-urgent" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{mostSevereCompany.totalPts} pts</span>
                </p>
              </div>
            )}
            <div className="glass-card" style={{ borderTop: '2px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={topCourse}>
                {topCourse}
              </h3>
              <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Course with Most Deficients</span>
                <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{topCourseCount}</span>
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="glass-panel" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '1rem 1.5rem' }} onClick={() => setIsDataChartsCollapsed(!isDataChartsCollapsed)}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Activity size={20} />
              Visual Analysis & Charts
            </h3>
            {isDataChartsCollapsed ? <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} />}
          </div>

          {!isDataChartsCollapsed && (
            <>
              <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '0.25rem' }}>Deficiencies by Company</h3>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '1.25rem' }}>Count of deficiency records per company</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, justifyContent: 'space-between' }}>
                {sortedCompanies.map(([coy, count]) => {
                  const sevData = companySeverity.find(c => c.coy === coy);
                  return (
                    <div key={coy}>
                      <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {COMPANY_NAMES[coy] || coy}
                          {sevData && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '4px', background: `color-mix(in srgb, ${sevData.tierColor} 15%, transparent)`, color: sevData.tierColor }}>
                              {sevData.tier}
                            </span>
                          )}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{count}</span>
                      </div>
                      <div style={{ width: '100%', height: '12px', background: 'var(--surface-overlay)', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div 
                          onMouseEnter={(e) => setHoveredBar({ x: e.clientX, y: e.clientY, text: `${COMPANY_NAMES[coy] || coy}: ${count} deficiencies • ${sevData ? sevData.totalPts : 0} total pts • Avg ${sevData ? sevData.avgPtsPerCadet : 0} pts/cadet` })}
                          onMouseLeave={() => setHoveredBar(null)}
                          onMouseMove={(e) => setHoveredBar({ x: e.clientX, y: e.clientY, text: `${COMPANY_NAMES[coy] || coy}: ${count} deficiencies • ${sevData ? sevData.totalPts : 0} total pts • Avg ${sevData ? sevData.avgPtsPerCadet : 0} pts/cadet` })}
                          style={{ width: `${(count / maxCompanyCount) * 100}%`, height: '100%', backgroundColor: COMPANY_COLORS[coy] || COMPANY_COLORS['Unspecified'], borderRadius: '6px', transition: 'width 1s ease-out', cursor: 'pointer' }}>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {sortedCompanies.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem' }}>No data available.</p>}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '0.25rem' }}>Severity by Company</h3>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '1.25rem' }}>Total deficiency points accumulated per company</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, justifyContent: 'space-between' }}>
                {companySeverity.map((sev) => (
                  <div key={sev.coy}>
                    <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {sev.name}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({sev.count} defs)</span>
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: sev.tierColor }}>{sev.totalPts} pts</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'var(--surface-overlay)', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div 
                        onMouseEnter={(e) => setHoveredBar({ x: e.clientX, y: e.clientY, text: `${sev.name}: ${sev.totalPts} total pts • ${sev.uniqueCadets} cadets • Avg ${sev.avgPtsPerCadet} pts/cadet` })}
                        onMouseLeave={() => setHoveredBar(null)}
                        onMouseMove={(e) => setHoveredBar({ x: e.clientX, y: e.clientY, text: `${sev.name}: ${sev.totalPts} total pts • ${sev.uniqueCadets} cadets • Avg ${sev.avgPtsPerCadet} pts/cadet` })}
                        style={{ 
                          width: `${(sev.totalPts / maxTotalPts) * 100}%`, 
                          height: '100%', 
                          background: `linear-gradient(90deg, ${sev.color}, ${sev.tierColor})`,
                          borderRadius: '6px', 
                          transition: 'width 1s ease-out', 
                          cursor: 'pointer'
                        }}>
                      </div>
                    </div>
                  </div>
                ))}
                {companySeverity.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem' }}>No data available.</p>}
              </div>
            </div>
          </div>

          {/* Course chart + Severity Analysis Table */}
          <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Deficiencies by Course</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, justifyContent: 'space-between' }}>
                {sortedCourses.map(([crs, data]) => (
                  <div key={crs}>
                    <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }} title={crs}>{crs}</span>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{data.total}</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'var(--surface-overlay)', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)', display: 'flex' }}>
                      {Object.entries(data.companies).sort((a, b) => b[1] - a[1]).map(([coy, count]) => (
                        <div 
                          key={coy} 
                          onMouseEnter={(e) => setHoveredBar({ x: e.clientX, y: e.clientY, text: `${COMPANY_NAMES[coy] || coy}: ${count}` })}
                          onMouseLeave={() => setHoveredBar(null)}
                          onMouseMove={(e) => setHoveredBar({ x: e.clientX, y: e.clientY, text: `${COMPANY_NAMES[coy] || coy}: ${count}` })}
                          style={{ 
                            width: `${(count / maxCourseCount) * 100}%`, 
                            height: '100%', 
                            backgroundColor: COMPANY_COLORS[coy] || COMPANY_COLORS['Unspecified'],
                            transition: 'width 1s ease-out',
                            cursor: 'pointer'
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {sortedCourses.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem' }}>No data available.</p>}
              </div>
            </div>

            {/* Company Severity Breakdown Table */}
            <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-overlay)' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Zap size={18} style={{ color: '#f97316' }} />
                  Company Severity Breakdown
                </h3>
                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Ranked by average deficiency points per cadet — reveals which companies have the deepest academic trouble</p>
              </div>
              <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th style={{ textAlign: 'center' }}>Cadets</th>
                      <th style={{ textAlign: 'center' }}>Defs</th>
                      <th style={{ textAlign: 'center' }}>Total Pts</th>
                      <th style={{ textAlign: 'center' }}>Avg Pts/Cadet</th>
                      <th style={{ textAlign: 'center' }}>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...companySeverity].sort((a, b) => b.avgPtsPerCadet - a.avgPtsPerCadet).map((sev, i) => (
                      <tr key={sev.coy}>
                        <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: sev.color, flexShrink: 0, border: '1px solid var(--surface-border)' }}></div>
                          {sev.name}
                        </td>
                        <td style={{ textAlign: 'center' }}>{sev.uniqueCadets}</td>
                        <td style={{ textAlign: 'center' }}>{sev.count}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{sev.totalPts}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                            <div style={{ width: '40px', height: '6px', background: 'var(--surface-overlay)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min((sev.avgPtsPerCadet / maxAvgPts) * 100, 100)}%`, height: '100%', background: sev.tierColor, borderRadius: '3px', transition: 'width 0.8s ease' }}></div>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{sev.avgPtsPerCadet}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px',
                            background: `color-mix(in srgb, ${sev.tierColor} 15%, transparent)`, 
                            color: sev.tierColor 
                          }}>
                            {sev.tier === 'Critical' && <Flame size={11} style={{ marginRight: '0.2rem', verticalAlign: 'middle' }} />}
                            {sev.tier}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Severity Recharts Bar Chart - Count vs Total Pts side by side */}
          {companySeverity.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', flexDirection: 'column', height: '380px' }}>
              <h3 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                <Zap size={18} style={{ color: '#f97316' }} />
                Count vs Severity by Company
              </h3>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>Side-by-side comparison — a company can have fewer deficiencies but much higher total points</p>
              <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companySeverity.map(s => ({ name: s.coy, fullName: s.name, 'Deficiency Count': s.count, 'Total Points': s.totalPts, 'Avg Pts/Cadet': s.avgPtsPerCadet }))} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: 'var(--surface-overlay)' }} 
                      contentStyle={{ backgroundColor: 'var(--surface-glass)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                      labelFormatter={(label) => COMPANY_NAMES[label] || label}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    <Bar yAxisId="left" dataKey="Deficiency Count" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="Total Points" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          </>
          )}

          {/* Cadets of Special Concern */}
          {specialConcernCadets.length > 0 && (
            <div className="glass-panel" style={{ marginBottom: '3rem', borderLeft: '4px solid var(--accent-crimson)' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isSpecialConcernCollapsed ? 0 : '1.5rem' }} 
                onClick={() => setIsSpecialConcernCollapsed(!isSpecialConcernCollapsed)}
              >
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--accent-crimson)' }}>
                  <AlertCircle size={20} />
                  Cadets of Special Concern
                </h3>
                {isSpecialConcernCollapsed ? <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} />}
              </div>
              
              {!isSpecialConcernCollapsed && (
                <>
                  <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Cadets with more than 20 deficiency points or deficient in 3 or more subjects.
                  </p>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Cadet Name</th>
                          <th>Class</th>
                          <th>Company</th>
                          <th>Subjects Deficient</th>
                          <th>Total Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specialConcernCadets.map((cadet, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{cadet.name}</td>
                            <td>{cadet.class}</td>
                            <td>{cadet.company}</td>
                            <td>
                              <span className={cadet.subjectCount >= 3 ? "badge badge-urgent" : "badge"}>
                                {cadet.subjectCount}
                              </span>
                            </td>
                            <td>
                              <span className={cadet.totalPts > 20 ? "badge badge-urgent" : "badge badge-warning"}>
                                {cadet.totalPts % 1 === 0 ? cadet.totalPts : cadet.totalPts.toFixed(1)} pts
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>Search Cadets</p>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, course, company, or CN..."
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>Filter by Company</p>
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-background)', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none', height: '38px', fontSize: '0.9rem' }}
              >
                <option value="All">All Companies</option>
                {Object.entries(COMPANY_NAMES)
                  .filter(([key]) => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(key))
                  .map(([key, name]) => (
                    <option key={key} value={key}>{key === 'A' ? 'Alfa Company' : name}</option>
                  ))}
              </select>
            </div>
            <div>
              <p className="text-muted" style={{ marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem' }}>Filter by Class</p>
              <div className="tabs-container">
                {['All', '1CL', '2CL', '3CL'].map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClassFilter(cls)}
                    className={`tab-item ${selectedClassFilter === cls ? 'active' : ''}`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
            Showing {filteredData.length} of {deficiencies.length} deficiency records
          </p>

          {loading ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="text-muted">Loading records...</p>
            </div>
          ) : Object.keys(groupedData).length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
              <p className="text-muted">No deficiencies reported{searchTerm ? ' matching your search' : ''}.</p>
            </div>
          ) : (
            Object.entries(groupedData).sort(([a], [b]) => a.localeCompare(b)).map(([cls, courses]) => (
              <div key={cls} style={{ marginBottom: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '4px', height: '1.5rem', background: 'var(--accent-gold)', borderRadius: '2px' }}></div>
                  {cls} Records
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {Object.entries(courses).map(([crs, courseDefs]) => (
                    <div key={crs} className="glass-panel table-container">
                      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-overlay)' }} className="flex-between">
                        <h3 style={{ margin: 0 }}>{crs}</h3>
                        <span className="badge badge-warning">{courseDefs.length} Deficiencies</span>
                      </div>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th onClick={() => handleSort('cadet')} style={{ cursor: 'pointer' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Cadet Name {sortConfig.key === 'cadet' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                            </th>
                            <th onClick={() => handleSort('company')} style={{ cursor: 'pointer' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Company {sortConfig.key === 'company' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                            </th>
                            <th onClick={() => handleSort('grade')} style={{ cursor: 'pointer' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Grade {sortConfig.key === 'grade' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                            </th>
                            <th onClick={() => handleSort('pts')} style={{ cursor: 'pointer' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>Deficiency Points {sortConfig.key === 'pts' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={14} style={{ opacity: 0.3 }} />}</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...courseDefs].sort((a, b) => {
                            if (!sortConfig.key) return 0;

                            let aVal = a[sortConfig.key] || '';
                            let bVal = b[sortConfig.key] || '';

                            if (sortConfig.key === 'company') {
                              aVal = a.company || a.coy || '';
                              bVal = b.company || b.coy || '';
                            }

                            if (sortConfig.key === 'pts' || sortConfig.key === 'grade') {
                              aVal = parseFloat(aVal) || 0;
                              bVal = parseFloat(bVal) || 0;
                            } else {
                              aVal = String(aVal).toLowerCase();
                              bVal = String(bVal).toLowerCase();
                            }

                            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                            return 0;
                          }).map((def, i) => (
                            <tr key={i}>
                              <td data-label="Cadet Name" style={{ fontWeight: 600 }}>{def.cadet}</td>
                              <td data-label="Company">{def.company || def.coy || '-'}</td>
                              <td data-label="Grade" style={{ fontWeight: 'bold' }}>{def.grade}</td>
                              <td data-label="Deficiency Points">
                                <span className="badge badge-urgent">
                                  {def.pts || 0} pts
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}
      {hoveredBar && (
        <div style={{
          position: 'fixed',
          top: hoveredBar.y - 40,
          left: hoveredBar.x + 10,
          background: 'var(--surface-overlay)',
          border: '1px solid var(--surface-border)',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 9999,
          pointerEvents: 'none',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-primary)'
        }}>
          {hoveredBar.text}
        </div>
      )}
    </div>
  );
}
