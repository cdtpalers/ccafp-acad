import { AlertCircle, UserX, ChevronUp, ChevronDown, ArrowUpDown, Lock, Eye, EyeOff, Calendar, Download, Activity, TrendingUp, TrendingDown, BookOpen, Users, Zap, Flame, FileDown } from 'lucide-react';
import { Fragment } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WEEKS, WEEK_CSV_FILES, COMPANY_NAMES, COMPANY_COLORS } from '../utils/constants';
import { parseCSV } from '../utils/csvParser';

const AnimatedNumber = ({ value, isFloat = false }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500; // 1.5 seconds
    const startValue = 0;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + easeProgress * (value - startValue);
      setDisplayValue(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return isFloat ? displayValue.toFixed(2) : Math.floor(displayValue);
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
  const [activeWeek, setActiveWeek] = useState(11);
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

  const validWeeks = useMemo(() => {
    return Object.keys(allWeeksData).map(w => parseInt(w)).sort((a, b) => a - b);
  }, [allWeeksData]);

  const prevWeek = useMemo(() => {
    if (!validWeeks.length) return null;
    const idx = validWeeks.indexOf(activeWeek);
    return idx > 0 ? validWeeks[idx - 1] : null;
  }, [validWeeks, activeWeek]);

  // 2. Derive active week and prev week deficiencies
  const deficiencies = allWeeksData[activeWeek] || [];
  const prevDeficiencies = prevWeek ? (allWeeksData[prevWeek] || []) : [];

  // 3. Dynamically compute the trend across all weeks based on current filters
  const allWeeksTrend = useMemo(() => {
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
  }, [validWeeks, allWeeksData, selectedClassFilter, selectedCompanyFilter, searchTerm]);

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

  // Custom charts animation state
  const [animateBars, setAnimateBars] = useState(false);
  useEffect(() => {
    setAnimateBars(false);
    const timer = setTimeout(() => setAnimateBars(true), 100);
    return () => clearTimeout(timer);
  }, [viewMode, activeWeek, filteredData]);

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
    if (viewMode !== 'comparison' || !prevWeek) return null;
    
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
    const classUniqueCadets = { '1CL': { prev: new Set(), curr: new Set() }, '2CL': { prev: new Set(), curr: new Set() }, '3CL': { prev: new Set(), curr: new Set() } };

    currentData.forEach(d => { 
      if (classCounts[d.class]) {
        classCounts[d.class].curr++;
        if (d.cadet) classUniqueCadets[d.class].curr.add(d.cadet);
      }
    });
    prevData.forEach(d => { 
      if (classCounts[d.class]) {
        classCounts[d.class].prev++;
        if (d.cadet) classUniqueCadets[d.class].prev.add(d.cadet);
      }
    });
    
    const chartData = [
      { 
        name: '1CL', 
        [`Records W${prevWeek}`]: classCounts['1CL'].prev, 
        [`Records W${activeWeek}`]: classCounts['1CL'].curr,
        [`Cadets W${prevWeek}`]: classUniqueCadets['1CL'].prev.size,
        [`Cadets W${activeWeek}`]: classUniqueCadets['1CL'].curr.size
      },
      { 
        name: '2CL', 
        [`Records W${prevWeek}`]: classCounts['2CL'].prev, 
        [`Records W${activeWeek}`]: classCounts['2CL'].curr,
        [`Cadets W${prevWeek}`]: classUniqueCadets['2CL'].prev.size,
        [`Cadets W${activeWeek}`]: classUniqueCadets['2CL'].curr.size
      },
      { 
        name: '3CL', 
        [`Records W${prevWeek}`]: classCounts['3CL'].prev, 
        [`Records W${activeWeek}`]: classCounts['3CL'].curr,
        [`Cadets W${prevWeek}`]: classUniqueCadets['3CL'].prev.size,
        [`Cadets W${activeWeek}`]: classUniqueCadets['3CL'].curr.size
      },
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
      [`Week ${prevWeek}`]: companyCountsPrev[coy] || 0,
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

    // Chronic Cadets and Worsened/Improved
    const chronicCadets = [...currentUniqueCadets].filter(c => prevUniqueCadets.has(c));
    const chronicCount = chronicCadets.length;
    
    const worsenedCadets = [];
    const improvedCadets = [];
    
    chronicCadets.forEach(c => {
      const prevPts = prevData.filter(d => d.cadet === c).reduce((sum, d) => sum + Math.abs(parseFloat(d.pts) || 0), 0);
      const currPts = currentData.filter(d => d.cadet === c).reduce((sum, d) => sum + Math.abs(parseFloat(d.pts) || 0), 0);
      if (currPts > prevPts) {
        worsenedCadets.push({ name: c, class: cadetClassMap[c] || 'N/A', diff: currPts - prevPts });
      } else if (currPts < prevPts) {
        improvedCadets.push({ name: c, class: cadetClassMap[c] || 'N/A', diff: prevPts - currPts });
      }
    });

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
      newlyDeficient: newlyDeficient.map(c => ({ name: c, class: cadetClassMap[c] || 'N/A' })),
      chronicCadets: chronicCadets.map(c => ({ name: c, class: cadetClassMap[c] || 'N/A' })),
      worsenedCadets: worsenedCadets.sort((a, b) => b.diff - a.diff),
      improvedCadets: improvedCadets.sort((a, b) => b.diff - a.diff)
    };
  }, [viewMode, filteredData, prevDeficiencies, selectedClassFilter, selectedCompanyFilter, searchTerm, activeWeek, prevWeek]);

  const specialConcernCadets = useMemo(() => {
    const cadetStats = {};
    deficiencies.forEach(def => {
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
      cadetStats[name].totalPts += Math.abs(parseFloat(def.pts) || 0);
      cadetStats[name].subjectCount += 1;
    });
    
    return Object.values(cadetStats)
      .filter(c => c.totalPts > 20 || c.subjectCount >= 3)
      .sort((a, b) => b.totalPts - a.totalPts || b.subjectCount - a.subjectCount);
  }, [deficiencies]);

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
            {prefix} saw a net <strong>{stats.diffTotal <= 0 ? 'decrease' : 'increase'} of {Math.abs(stats.diffTotal)}</strong> deficiency records from Week {prevWeek} to Week {activeWeek}. 
            {stats.cleared.length > 0 && ` Encouragingly, ${stats.cleared.length} cadets managed to completely clear their deficient status.`}
            {stats.newlyDeficient.length > 0 && ` However, ${stats.newlyDeficient.length} new cadets fell into deficient status.`}
          </p>
          {stats.cleared.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--success)' }}>
              <strong>Cleared:</strong> {stats.cleared.map(c => c.name).join(', ')}
            </div>
          )}
          {stats.newlyDeficient.length > 0 && (
            <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--accent-crimson)' }}>
              <strong>Newly Deficient:</strong> {stats.newlyDeficient.map(c => c.name).join(', ')}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span> Severity Trend
          </h4>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Total deficiency points across the tracked group {stats.diffTotalPts > 0 ? 'worsened' : 'improved'} by <strong>{Math.abs(stats.diffTotalPts).toFixed(2)} pts</strong>. 
            {stats.diffTotalPts > 0 ? " This indicates that existing academic struggles are deepening, even if headcounts remain stable." : " This shows a tangible recovery in grades and academic standing."}
          </p>
          {stats.worsenedCadets?.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--accent-crimson)' }}>
              <strong>Worsened (Increased Pts):</strong> {stats.worsenedCadets.map(c => `${c.name} (+${c.diff.toFixed(2)})`).join(', ')}
            </div>
          )}
          {stats.improvedCadets?.length > 0 && (
            <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--success)' }}>
              <strong>Improved (Decreased Pts):</strong> {stats.improvedCadets.map(c => `${c.name} (-${c.diff.toFixed(2)})`).join(', ')}
            </div>
          )}
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
            Out of {stats.currentCadets} currently deficient cadets, <strong>{stats.chronicCount}</strong> are considered 'chronic' (deficient in both Week {prevWeek} and Week {activeWeek}). 
            This represents {stats.currentCadets > 0 ? Math.round((stats.chronicCount / stats.currentCadets) * 100) : 0}% of the struggling population.
          </p>
          {stats.chronicCadets?.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Chronic Cadets:</strong> {stats.chronicCadets.map(c => c.name).join(', ')}
            </div>
          )}
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
            onClick={async () => {
              const { exportDeficiencyPdf } = await import('./exportDeficiencyPdf');
              exportDeficiencyPdf({ activeWeek, deficiencies, companySeverity, sortedCourses, specialConcernCadets, groupedData });
            }}
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
      <div className="glass-panel" style={{ marginBottom: '1rem', padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
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

      {/* ── Search & Filter Controls (Shared across Data & Comparative Insights) ── */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p className="text-muted" style={{ marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Search Cadets / Courses</p>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, course, company, or CN..."
            className="input-field"
            style={{ width: '100%', height: '38px', fontSize: '0.85rem' }}
          />
        </div>
        <div>
          <p className="text-muted" style={{ marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Company</p>
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-background)', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none', height: '38px', fontSize: '0.85rem' }}
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
          <p className="text-muted" style={{ marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Class</p>
          <div className="tabs-container" style={{ height: '38px' }}>
            {['All', '1CL', '2CL', '3CL'].map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClassFilter(cls)}
                className={`tab-item ${selectedClassFilter === cls ? 'active' : ''}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
        {(selectedClassFilter !== 'All' || selectedCompanyFilter !== 'All' || searchTerm.trim()) && (
          <div>
            <button
              onClick={() => {
                setSelectedClassFilter('All');
                setSelectedCompanyFilter('All');
                setSearchTerm('');
              }}
              className="btn"
              style={{
                height: '38px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                color: 'var(--accent-crimson)',
                background: 'color-mix(in srgb, var(--accent-crimson) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent-crimson) 25%, transparent)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
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
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '380px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                    {selectedClassFilter === 'All' && selectedCompanyFilter === 'All' && !searchTerm.trim()
                      ? 'Cadet Corps Deficiency Trend'
                      : `${selectedClassFilter !== 'All' ? `${selectedClassFilter} ` : ''}${selectedCompanyFilter !== 'All' ? `${COMPANY_NAMES[selectedCompanyFilter] || selectedCompanyFilter} ` : ''}${searchTerm.trim() ? `"${searchTerm.trim()}" ` : ''}Deficiency Trend`.trim()}
                  </h3>
                  <p className="text-muted" style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
                    Multi-week comparison across all recorded academic weeks (Click legend items to toggle metrics)
                  </p>
                </div>
                {(selectedClassFilter !== 'All' || selectedCompanyFilter !== 'All' || searchTerm.trim()) && (
                  <span className="badge" style={{ background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', color: 'var(--accent-primary)', fontSize: '0.75rem' }}>
                    Filtered View
                  </span>
                )}
              </div>
              <div style={{ flex: 1, width: '100%', minHeight: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={allWeeksTrend} margin={{ top: 15, right: activeLines.avgGrade ? 30 : 15, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                      dy={10} 
                    />
                    <YAxis 
                      yAxisId="count" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                      allowDecimals={false}
                    />
                    {activeLines.avgGrade && (
                      <YAxis 
                        yAxisId="grade" 
                        orientation="right" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#10B981', fontSize: 12 }} 
                        domain={[0, 10]}
                        tickFormatter={(val) => `${val}`}
                      />
                    )}
                    <Tooltip 
                      cursor={{ stroke: 'var(--surface-border)', strokeWidth: 1 }} 
                      contentStyle={{ 
                        backgroundColor: 'var(--surface-glass)', 
                        borderColor: 'var(--surface-border)', 
                        borderRadius: '8px',
                        backdropFilter: 'blur(8px)',
                        boxShadow: 'var(--shadow-md)',
                        color: 'var(--text-primary)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'Average Grade') return [`${value} pts`, name];
                        if (name === 'Affected Cadets') return [`${value} cadets`, name];
                        if (name === 'Total Deficiencies') return [`${value} records`, name];
                        return [value, name];
                      }}
                    />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} 
                      onClick={(e) => {
                        const { dataKey } = e;
                        setActiveLines(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
                      }}
                      formatter={(value, entry) => {
                        const { dataKey } = entry;
                        const isActive = activeLines[dataKey];
                        return (
                          <span style={{ 
                            color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', 
                            transition: 'color 0.2s', 
                            cursor: 'pointer', 
                            opacity: isActive ? 1 : 0.45,
                            fontWeight: isActive ? 600 : 400
                          }}>
                            {value}
                          </span>
                        );
                      }}
                    />
                    {activeLines.totalDeficiencies && (
                      <Line 
                        yAxisId="count" 
                        type="monotone" 
                        dataKey="totalDeficiencies" 
                        name="Total Deficiencies" 
                        stroke="#93C5FD" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#1e3a8a' }} 
                        activeDot={{ r: 6 }} 
                      />
                    )}
                    {activeLines.uniqueCadets && (
                      <Line 
                        yAxisId="count" 
                        type="monotone" 
                        dataKey="uniqueCadets" 
                        name="Affected Cadets" 
                        stroke="#3B82F6" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#1d4ed8' }} 
                        activeDot={{ r: 6 }} 
                      />
                    )}
                    {activeLines.avgGrade && (
                      <Line 
                        yAxisId="grade" 
                        type="monotone" 
                        dataKey="avgGrade" 
                        name="Average Grade" 
                        stroke="#10B981" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#065f46' }} 
                        activeDot={{ r: 6 }} 
                      />
                    )}
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

          {/* 4 Cards Top Summary Stats */}
          <div className="grid-cols-4" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <BookOpen size={16} /> Total Deficiencies
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <h3 style={{ fontSize: '2.5rem', margin: 0 }}><AnimatedNumber value={comparisonStats.currentTotal} /></h3>
                <Pill value={comparisonStats.diffTotal} label={`from W${prevWeek}`} positiveIsGood={false} />
              </div>
            </div>
            
            <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', animationDelay: '0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <Users size={16} /> Affected Cadets
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <h3 style={{ fontSize: '2.5rem', margin: 0 }}><AnimatedNumber value={comparisonStats.currentCadets} /></h3>
                <Pill value={comparisonStats.diffCadets} label={`from W${prevWeek}`} positiveIsGood={false} />
              </div>
            </div>
            
            <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', animationDelay: '0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <TrendingUp size={16} /> Average Grade
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <h3 style={{ fontSize: '2.5rem', margin: 0 }}><AnimatedNumber value={comparisonStats.currentAvg} isFloat={true} /></h3>
                <Pill value={comparisonStats.diffAvg} label={`pts`} positiveIsGood={true} isFloat={true} />
              </div>
            </div>
          </div>

          <div className="glass-panel animate-fade-in-up" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '1rem 1.5rem' }} onClick={() => setIsComparisonChartsCollapsed(!isComparisonChartsCollapsed)}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Activity size={20} />
              Comparative Charts
            </h3>
            {isComparisonChartsCollapsed ? <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} />}
          </div>
          
          {!isComparisonChartsCollapsed && (
            <>
          <div className="grid-cols-2" style={{ marginBottom: '3rem' }}>
            <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '400px', animationDelay: '0.1s' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                Deficiencies & Cadets per Class (W{prevWeek} vs W{activeWeek})
              </h3>
              <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonStats.chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'var(--surface-overlay)' }} contentStyle={{ backgroundColor: 'var(--surface-glass)', border: '1px solid var(--surface-border)', borderRadius: '8px' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                    <Bar dataKey={`Records W${prevWeek}`} fill="#93C5FD" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={`Records W${activeWeek}`} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={`Cadets W${prevWeek}`} fill="#86EFAC" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={`Cadets W${activeWeek}`} fill="#22C55E" radius={[4, 4, 0, 0]} />
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
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>CLEARED (W{prevWeek} to W{activeWeek})</span>
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
              <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
              Deficiencies per Company (W{prevWeek} vs W{activeWeek})
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
                  <Bar dataKey={`Week ${prevWeek}`} fill="#93C5FD" radius={[4, 4, 0, 0]} />
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
          {/* ── Row 1: Key Metrics ── */}
          {(() => {
            const classCadets = {};
            deficiencies.forEach(d => {
              const cls = d.class || 'Unknown';
              if (!classCadets[cls]) classCadets[cls] = new Set();
              if (d.cadet) classCadets[cls].add(d.cadet);
            });
            const totalUnique = new Set(deficiencies.map(d => d.cadet).filter(Boolean)).size;
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Card 1: Cadets with class breakdown */}
                <div className="glass-card" style={{ borderTop: '2px solid var(--accent-crimson)', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '2.25rem', margin: 0, lineHeight: 1 }}><AnimatedNumber value={totalUnique} /></h3>
                    <p className="text-muted" style={{ margin: 0 }}>Deficient Cadets</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {['1CL', '2CL', '3CL'].filter(c => classCadets[c]).map(c => (
                      <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{classCadets[c].size}</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Records + top course */}
                <div className="glass-card" style={{ borderTop: '2px solid var(--accent-primary)', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '2.25rem', margin: 0, lineHeight: 1 }}><AnimatedNumber value={deficiencies.length} /></h3>
                    <p className="text-muted" style={{ margin: 0 }}>Deficiency Records</p>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Top course: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{topCourse}</span>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>{topCourseCount}</span>
                  </div>
                </div>

                {/* Card 3: Special Concern count */}
                <div className="glass-card" style={{ borderTop: `2px solid ${specialConcernCadets.length > 0 ? 'var(--accent-crimson)' : 'var(--surface-border)'}`, padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '2.25rem', margin: 0, lineHeight: 1, color: specialConcernCadets.length > 0 ? 'var(--accent-crimson)' : 'var(--text-primary)' }}>
                      <AnimatedNumber value={specialConcernCadets.length} />
                    </h3>
                    <p className="text-muted" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle size={14} />
                      Special Concern
                    </p>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {'>'} 20 pts or {'≥'} 3 subjects deficient
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── Company Severity Breakdown (Full-Width Hero) ── */}
          <div className="glass-panel" style={{ padding: '0', marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-overlay)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <Zap size={18} style={{ color: '#f97316' }} />
                  Company Severity Breakdown
                </h3>
                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Ranked by avg deficiency pts per cadet</p>
              </div>
            </div>
            <div className="table-container">
              <table className="data-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th style={{ textAlign: 'center' }}>Cadets</th>
                    <th style={{ textAlign: 'center' }}>Defs</th>
                    <th style={{ textAlign: 'center' }}>Total Pts</th>
                    <th style={{ textAlign: 'center', minWidth: '140px' }}>Avg Pts/Cadet</th>
                    <th style={{ textAlign: 'center' }}>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {[...companySeverity].sort((a, b) => b.avgPtsPerCadet - a.avgPtsPerCadet).map((sev) => (
                    <tr key={sev.coy}>
                      <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: sev.color, flexShrink: 0, border: '1px solid var(--surface-border)' }}></div>
                        {sev.name}
                      </td>
                      <td style={{ textAlign: 'center' }}>{sev.uniqueCadets}</td>
                      <td style={{ textAlign: 'center' }}>{sev.count}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{sev.totalPts}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                          <div style={{ width: '60px', height: '6px', background: 'var(--surface-overlay)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: animateBars ? `${Math.min((sev.avgPtsPerCadet / maxAvgPts) * 100, 100)}%` : '0%', height: '100%', background: sev.tierColor, borderRadius: '3px', transition: 'width 0.8s ease' }}></div>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem', minWidth: '35px' }}>{sev.avgPtsPerCadet}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <span style={{ 
                            fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px',
                            background: `color-mix(in srgb, ${sev.tierColor} 15%, transparent)`, 
                            color: sev.tierColor 
                          }}>
                            {sev.tier === 'Critical' && <Flame size={11} style={{ marginRight: '0.2rem', verticalAlign: 'middle' }} />}
                            {sev.tier}
                          </span>
                          <button
                            onClick={async () => {
                              const { exportCompanyDeficiencyPdf } = await import('./exportCompanyDeficiencyPdf');
                              exportCompanyDeficiencyPdf(sev.coy, activeWeek, deficiencies);
                            }}
                            title={`Export ${sev.name} Report`}
                            style={{ 
                              background: 'transparent', border: 'none', cursor: 'pointer', 
                              color: 'var(--text-secondary)', padding: '0.2rem', display: 'flex', alignItems: 'center',
                              transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                          >
                            <FileDown size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Row 2: Course Breakdown + Count vs Severity Chart ── */}
          <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem' }}>Deficiencies by Course</h3>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '1.25rem' }}>Stacked by company contribution</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, justifyContent: 'space-between' }}>
                {sortedCourses.map(([crs, data]) => (
                  <div key={crs}>
                    <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }} title={crs}>{crs}</span>
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
                            width: animateBars ? `${(count / maxCourseCount) * 100}%` : '0%', 
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

            {companySeverity.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '380px' }}>
                <h3 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                  Count vs Severity
                </h3>
                <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>Fewer deficiencies can still mean higher total points</p>
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
          </div>

          {specialConcernCadets.length > 0 && (
            <div className="glass-panel animate-fade-in-up" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-crimson)' }}>
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
          {/* ── Results count ── */}
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
              <div key={cls} style={{ marginBottom: '1.5rem' }}>
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
