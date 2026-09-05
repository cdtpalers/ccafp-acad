import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

const COMPANIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/* Mirrors COMPANY_COLORS in utils/constants.js so the printed matrices
   read the same as the on-screen ones. B and G are light enough that they
   take dark text, exactly as the web tables do. */
const COMPANY_COLORS_RGB = {
  'A': [34, 197, 94],
  'B': [226, 232, 240],
  'C': [239, 68, 68],
  'D': [59, 130, 246],
  'E': [249, 115, 22],
  'F': [127, 29, 29],
  'G': [234, 179, 8],
  'H': [51, 65, 85],
  'Unspecified': [156, 163, 175],
};

const DARK_TEXT_COMPANIES = ['B', 'G'];

/**
 * Generate a comprehensive PDF deficiency report for the given week.
 *
 * Visual language follows the CAMPTrack design system used by the app:
 * dark brand blocks with tactical grid lines, teal/gold accents, and a
 * serif + sans + mono type mix. Data pages stay light so the report is
 * still legible and economical when printed.
 */
export function exportDeficiencyPdf({
  activeWeek,
  deficiencies,
  companySeverity,
  sortedCourses,
  specialConcernCadets,
  groupedData,
  performanceDataByClass = {},
  performanceComparisonByClass = null,
  classByCompanyData = [],
  prevWeek = null,
  selectedClassFilter = 'All',
  selectedCompanyFilter = 'All',
  searchTerm = '',
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const uniqueCadets = new Set(deficiencies.map(d => d.cadet).filter(Boolean)).size;
  const totalRecords = deficiencies.length;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ─── CAMPTrack palette ───
  const ink = [7, 11, 20];          // #070B14 base
  const panel = [14, 22, 38];       // #0E1626 card
  const teal = [45, 212, 191];      // #2DD4BF primary
  const tealDeep = [13, 148, 136];  // print-safe teal on white
  const gold = [245, 165, 36];      // #F5A524 secondary
  const violet = [139, 122, 246];   // #A78BFA
  const crimson = [225, 45, 75];    // #F43F5E
  const orange = [249, 115, 22];
  const yellow = [202, 138, 4];
  const green = [22, 163, 74];
  const slate = [100, 116, 139];
  const white = [255, 255, 255];
  const lightGray = [241, 245, 249];
  const midGray = [203, 213, 225];
  const gridInk = [30, 44, 68];     // grid lines on dark blocks

  // Type stacks mirroring the app: Playfair -> times, Jakarta -> helvetica,
  // JetBrains Mono -> courier.
  const SERIF = 'times';
  const SANS = 'helvetica';
  const MONO = 'courier';

  const SEVERITY_TIERS = [
    { tier: 'Critical', color: crimson, threshold: '>= 15.00', desc: 'Cadets are deeply behind; immediate academic intervention required.' },
    { tier: 'High', color: orange, threshold: '10.00 - 14.99', desc: 'Significant academic risk; close monitoring and remedial action needed.' },
    { tier: 'Moderate', color: yellow, threshold: '5.00 - 9.99', desc: 'Noticeable deficiency gap; preventive measures recommended.' },
    { tier: 'Low', color: green, threshold: '< 5.00', desc: 'Minor deficiency; cadets are near passing threshold.' },
  ];

  // Describes which slice of the data this export represents.
  const activeFilters = [];
  if (selectedClassFilter !== 'All') activeFilters.push(selectedClassFilter);
  if (selectedCompanyFilter !== 'All') activeFilters.push(COMPANY_NAMES[selectedCompanyFilter] || selectedCompanyFilter);
  if (searchTerm && searchTerm.trim()) activeFilters.push(`"${searchTerm.trim()}"`);
  const scopeLabel = activeFilters.length ? activeFilters.join('  /  ') : 'Cadet Corps Overview';

  // ─── Primitives ───

  /** Tactical micro-label: uppercase mono with wide tracking. */
  function tacticalLabel(text, x, y, { size = 6.5, color = slate, align = 'left', spacing = 0.6 } = {}) {
    doc.setFont(MONO, 'bold');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(String(text).toUpperCase(), x, y, { align, charSpace: spacing });
  }

  /** The aesthetic grid lines, clipped to a rectangle. */
  function drawGrid(x, y, w, h, { spacing = 6, color = gridInk, weight = 0.15 } = {}) {
    doc.setDrawColor(...color);
    doc.setLineWidth(weight);
    for (let gx = x + spacing; gx < x + w; gx += spacing) doc.line(gx, y, gx, y + h);
    for (let gy = y + spacing; gy < y + h; gy += spacing) doc.line(x, gy, x + w, gy);
  }

  /** Section heading: mono eyebrow + serif title + accent rule. */
  function sectionHeading(eyebrow, title, y, accent = tealDeep) {
    tacticalLabel(eyebrow, margin, y, { color: accent, size: 6.5 });
    y += 5.5;
    doc.setFont(SERIF, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...ink);
    doc.text(title, margin, y);
    y += 2.5;
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.7);
    doc.line(margin, y, margin + 26, y);
    doc.setDrawColor(...midGray);
    doc.setLineWidth(0.25);
    doc.line(margin + 27, y, pageWidth - margin, y);
    return y + 6;
  }

  function drawPageHeader() {
    const bandH = 17;
    doc.setFillColor(...panel);
    doc.rect(0, 0, pageWidth, bandH, 'F');
    drawGrid(0, 0, pageWidth, bandH, { spacing: 5.5, color: gridInk, weight: 0.12 });

    // Teal rule along the bottom of the band
    doc.setDrawColor(...teal);
    doc.setLineWidth(0.5);
    doc.line(0, bandH, pageWidth, bandH);

    doc.setFont(SERIF, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...white);
    doc.text('Philippine Military Academy', margin, 7.5);

    tacticalLabel('Fort Del Pilar, Loakan Road, Baguio, 2600 Benguet', margin, 12.5, { size: 5.6, color: [148, 163, 184], spacing: 0.35 });

    tacticalLabel(`Week ${activeWeek} Deficiency Report`, pageWidth - margin, 7.5, { size: 7, color: teal, align: 'right' });
    tacticalLabel(`Generated ${dateStr} ${timeStr}`, pageWidth - margin, 12.5, { size: 5.6, color: [148, 163, 184], align: 'right', spacing: 0.35 });
  }

  function drawPageFooter(pageNum, totalPages) {
    doc.setDrawColor(...midGray);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    tacticalLabel('Confidential - Academic Council, CCAFP', margin, pageHeight - 5.5, { size: 5.6, spacing: 0.35 });
    tacticalLabel(`Page ${pageNum} / ${totalPages}`, pageWidth - margin, pageHeight - 5.5, { size: 5.6, align: 'right', spacing: 0.35 });
  }

  /** Starts a fresh page and returns the starting y. */
  function newPage() {
    doc.addPage();
    drawPageHeader();
    return 26;
  }

  /** Ensures `needed` mm of room, breaking the page if not. */
  function ensureSpace(y, needed) {
    if (y + needed > pageHeight - 16) return newPage();
    return y;
  }

  /** Shared style block for the company matrices. */
  function matrixColumnStyles(firstColWidth) {
    const styles = { 0: { cellWidth: firstColWidth, halign: 'left', fontStyle: 'bold', fillColor: lightGray, textColor: ink } };
    COMPANIES.forEach((c, i) => {
      styles[i + 1] = {
        fillColor: COMPANY_COLORS_RGB[c],
        textColor: DARK_TEXT_COMPANIES.includes(c) ? ink : white,
        fontStyle: 'bold',
      };
    });
    styles[COMPANIES.length + 1] = { fillColor: [71, 85, 105], textColor: white, fontStyle: 'bold' };
    return styles;
  }

  function drawHorizontalBarChart(x, y, w, title, data, unit = '') {
    const barHeight = 7;
    const barGap = 3;
    const labelWidth = 38;
    const valueWidth = 20;
    const barAreaWidth = w - labelWidth - valueWidth - 4;
    const maxVal = Math.max(...data.map(d => d.value), 1);

    doc.setFont(SANS, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...ink);
    doc.text(title, x, y);
    y += 5;

    data.forEach((item) => {
      doc.setFont(SANS, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...ink);
      doc.text(item.label, x, y + barHeight * 0.65, { maxWidth: labelWidth - 2 });

      const barX = x + labelWidth;
      doc.setFillColor(...lightGray);
      doc.roundedRect(barX, y, barAreaWidth, barHeight, 1.5, 1.5, 'F');

      const barW = Math.max((item.value / maxVal) * barAreaWidth, 1);
      doc.setFillColor(...(item.color || tealDeep));
      doc.roundedRect(barX, y, barW, barHeight, 1.5, 1.5, 'F');

      doc.setFont(MONO, 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...ink);
      doc.text(`${item.value}${unit}`, barX + barAreaWidth + 2, y + barHeight * 0.65);

      y += barHeight + barGap;
    });

    return y;
  }

  function drawGroupedBarChart(x, y, w, title, data, key1, key2, label1, label2, color1, color2) {
    const barHeight = 5;
    const groupGap = 4;
    const labelWidth = 38;
    const valueWidth = 18;
    const barAreaWidth = w - labelWidth - valueWidth - 4;
    const maxVal = Math.max(...data.map(d => Math.max(d[key1], d[key2])), 1);

    doc.setFont(SANS, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...ink);
    doc.text(title, x, y);
    y += 3;

    doc.setFont(MONO, 'normal');
    doc.setFontSize(6.5);
    doc.setFillColor(...color1);
    doc.roundedRect(x + w - 80, y - 2, 5, 3, 0.5, 0.5, 'F');
    doc.setTextColor(...slate);
    doc.text(label1, x + w - 74, y);
    doc.setFillColor(...color2);
    doc.roundedRect(x + w - 40, y - 2, 5, 3, 0.5, 0.5, 'F');
    doc.text(label2, x + w - 34, y);
    y += 4;

    data.forEach((item) => {
      doc.setFont(SANS, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...ink);
      doc.text(item.label, x, y + barHeight * 0.7);

      const barX = x + labelWidth;

      doc.setFillColor(...lightGray);
      doc.roundedRect(barX, y, barAreaWidth, barHeight, 1, 1, 'F');
      const barW1 = Math.max((item[key1] / maxVal) * barAreaWidth, 0.5);
      doc.setFillColor(...color1);
      doc.roundedRect(barX, y, barW1, barHeight, 1, 1, 'F');
      doc.setFont(MONO, 'bold');
      doc.setFontSize(6);
      doc.setTextColor(...color1);
      doc.text(String(item[key1]), barX + barAreaWidth + 2, y + barHeight * 0.7);

      y += barHeight + 1;

      doc.setFillColor(...lightGray);
      doc.roundedRect(barX, y, barAreaWidth, barHeight, 1, 1, 'F');
      const barW2 = Math.max((item[key2] / maxVal) * barAreaWidth, 0.5);
      doc.setFillColor(...color2);
      doc.roundedRect(barX, y, barW2, barHeight, 1, 1, 'F');
      doc.setFont(MONO, 'bold');
      doc.setFontSize(6);
      doc.setTextColor(...color2);
      doc.text(String(item[key2]), barX + barAreaWidth + 2, y + barHeight * 0.7);

      y += barHeight + groupGap;
    });

    return y;
  }

  // ═══════════════════════════════════════════════════════════════
  // PAGE 1 — DARK HERO + EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════════════════════════
  drawPageHeader();

  // ─── Dark hero block with grid lines and a gold accent rail ───
  const heroY = 17;
  const heroH = 46;
  doc.setFillColor(...ink);
  doc.rect(0, heroY, pageWidth, heroH, 'F');
  drawGrid(0, heroY, pageWidth, heroH, { spacing: 6, color: gridInk, weight: 0.14 });

  // Soft "glow" suggestion: stacked translucent-looking bands in the corner
  doc.setFillColor(...panel);
  doc.roundedRect(pageWidth - 70, heroY + 4, 62, heroH - 8, 3, 3, 'F');
  drawGrid(pageWidth - 70, heroY + 4, 62, heroH - 8, { spacing: 5, color: [24, 36, 58], weight: 0.12 });

  tacticalLabel('Deficiency Command', margin, heroY + 12, { color: teal, size: 7 });

  doc.setFont(SERIF, 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...white);
  doc.text('Deficiency Report', margin, heroY + 24);

  doc.setFont(SERIF, 'italic');
  doc.setFontSize(13);
  doc.setTextColor(...teal);
  doc.text(`AY 2026-2027  .  1st Term  .  Week ${activeWeek}`, margin, heroY + 33);

  tacticalLabel(scopeLabel, margin, heroY + 40, { color: [148, 163, 184], size: 6, spacing: 0.4 });

  // Hero right panel: headline count
  doc.setFont(SERIF, 'bold');
  doc.setFontSize(30);
  doc.setTextColor(...gold);
  doc.text(String(totalRecords), pageWidth - 62, heroY + 26);
  tacticalLabel('Total Records', pageWidth - 62, heroY + 33, { color: [148, 163, 184], size: 6 });

  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.line(margin, heroY + heroH, pageWidth - margin, heroY + heroH);

  let y = heroY + heroH + 10;

  // ─── Bento stat cards ───
  const cardW = (contentWidth - 6) / 3;
  const cardH = 26;
  const cards = [
    { label: 'Total Deficiency Records', value: String(totalRecords), color: crimson },
    { label: 'Unique Deficient Cadets', value: String(uniqueCadets), color: tealDeep },
    { label: 'Courses With Deficiencies', value: String(sortedCourses.length), color: gold },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + 3);
    doc.setFillColor(...lightGray);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F');
    // Accent rail, echoing the card-glow rails in the app
    doc.setFillColor(...card.color);
    doc.roundedRect(x, y, 1.6, cardH, 0.8, 0.8, 'F');

    doc.setFont(SERIF, 'bold');
    doc.setFontSize(21);
    doc.setTextColor(...card.color);
    doc.text(card.value, x + 6, y + 13);
    tacticalLabel(card.label, x + 6, y + 20, { size: 5.6, spacing: 0.35 });
  });
  y += cardH + 11;

  // ─── Company Severity Table ───
  y = sectionHeading('Severity', 'Company Severity Breakdown', y);

  const severityData = [...companySeverity].sort((a, b) => b.avgPtsPerCadet - a.avgPtsPerCadet);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Company', 'Cadets', 'Deficiencies', 'Total Pts', 'Avg Pts/Cadet', 'Severity']],
    body: severityData.map(s => [
      s.name,
      String(s.uniqueCadets),
      String(s.count),
      String(s.totalPts),
      String(s.avgPtsPerCadet),
      s.tier,
    ]),
    headStyles: { fillColor: panel, textColor: white, fontSize: 7.5, fontStyle: 'bold', halign: 'center', font: SANS },
    bodyStyles: { fontSize: 8, halign: 'center', font: SANS },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      1: { font: MONO }, 2: { font: MONO }, 3: { font: MONO }, 4: { font: MONO },
      5: { fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: lightGray },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 5) {
        const tier = data.cell.raw;
        if (tier === 'Critical') data.cell.styles.textColor = crimson;
        else if (tier === 'High') data.cell.styles.textColor = orange;
        else if (tier === 'Moderate') data.cell.styles.textColor = yellow;
        else data.cell.styles.textColor = green;
      }
    },
    theme: 'grid',
    styles: { lineColor: midGray, lineWidth: 0.2 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ─── Class & Course Breakdown (side-by-side) ───
  if (y + 20 < pageHeight - 25) {
    const halfWidth = (contentWidth - 10) / 2;
    const startY = y;

    const classCounts = deficiencies.reduce((acc, def) => {
      const cls = def.class || 'Unknown';
      acc[cls] = (acc[cls] || 0) + 1;
      return acc;
    }, {});
    const classData = Object.entries(classCounts).sort((a, b) => {
      const order = ['1CL', '2CL', '3CL', '4CL'];
      const aIdx = order.indexOf(a[0]);
      const bIdx = order.indexOf(b[0]);
      if (aIdx === -1 && bIdx === -1) return a[0].localeCompare(b[0]);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

    tacticalLabel('By Class', margin, startY, { color: tealDeep });
    autoTable(doc, {
      startY: startY + 2,
      margin: { left: margin, right: margin + halfWidth + 10 },
      head: [['Class', 'Deficiency Records']],
      body: classData.map(([cls, count]) => [cls, String(count)]),
      headStyles: { fillColor: panel, textColor: white, fontSize: 7.5, fontStyle: 'bold', font: SANS },
      bodyStyles: { fontSize: 8, font: SANS },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center', font: MONO } },
      alternateRowStyles: { fillColor: lightGray },
      theme: 'grid',
      styles: { lineColor: midGray, lineWidth: 0.2 },
    });

    const finalYClass = doc.lastAutoTable.finalY;

    tacticalLabel('By Course', margin + halfWidth + 10, startY, { color: tealDeep });
    autoTable(doc, {
      startY: startY + 2,
      margin: { left: margin + halfWidth + 10, right: margin },
      head: [['Course', 'Deficiency Records']],
      body: sortedCourses.map(([crs, data]) => [crs, String(data.total)]),
      headStyles: { fillColor: panel, textColor: white, fontSize: 7.5, fontStyle: 'bold', font: SANS },
      bodyStyles: { fontSize: 8, font: SANS },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center', font: MONO } },
      alternateRowStyles: { fillColor: lightGray },
      theme: 'grid',
      styles: { lineColor: midGray, lineWidth: 0.2 },
    });

    y = Math.max(finalYClass, doc.lastAutoTable.finalY) + 10;
  }

  // ═══════════════════════════════════════════════════════════════
  // ACADEMIC PERFORMANCE SUMMARY — mirrors the on-screen matrices
  // ═══════════════════════════════════════════════════════════════
  const performanceClasses = Object.entries(performanceDataByClass || {})
    .filter(([, v]) => v)
    .sort(([a], [b]) => a.localeCompare(b));

  if (performanceClasses.length > 0) {
    y = newPage();
    y = sectionHeading('Academic Performance', `Week ${activeWeek} Performance Summary`, y, violet);

    doc.setFont(SANS, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...slate);
    doc.text(
      'Company-by-company deficiency distribution per class, matching the Academic Performance Summary shown in the tracker. Cell colours follow the standing company colour codes.',
      margin, y, { maxWidth: contentWidth }
    );
    y += 9;

    for (const [cls, classData] of performanceClasses) {
      const { subjects, multDefs } = classData;
      const subjectRows = Object.entries(subjects || {}).sort(([a], [b]) => a.localeCompare(b));

      // Keep a class heading with at least the first rows of its table.
      y = ensureSpace(y, 46);

      tacticalLabel(`${cls}  .  Week ${activeWeek}`, margin, y, { color: violet, size: 7 });
      y += 5;
      doc.setFont(SERIF, 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...ink);
      doc.text(`${cls} Academic Performance`, margin, y);
      y += 3;

      // ── Subjects x Company matrix ──
      if (subjectRows.length > 0) {
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Subject', ...COMPANIES, 'TOTAL']],
          body: subjectRows.map(([crs, counts]) => [
            crs,
            ...COMPANIES.map(c => (counts[c] ? String(counts[c]) : '')),
            counts.TOTAL ? String(counts.TOTAL) : '',
          ]),
          headStyles: { fillColor: panel, textColor: white, fontSize: 7, fontStyle: 'bold', halign: 'center', font: SANS },
          bodyStyles: { fontSize: 7.5, halign: 'center', font: MONO },
          columnStyles: matrixColumnStyles(34),
          theme: 'grid',
          styles: { lineColor: midGray, lineWidth: 0.15, cellPadding: 1.4 },
        });
        y = doc.lastAutoTable.finalY + 6;
      }

      // ── Cadets with multiple deficiencies ──
      if (multDefs) {
        y = ensureSpace(y, 34);
        tacticalLabel('Number of Cadets With Multiple Deficiency', margin, y, { color: violet, size: 6.2 });
        y += 2.5;

        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['No. of Subjects', ...COMPANIES, 'TOTAL']],
          body: [2, 3, '4+', 'TOTAL'].map(row => [
            row === '4+' ? '4+' : String(row),
            ...COMPANIES.map(c => (multDefs[row]?.[c] ? String(multDefs[row][c]) : '')),
            multDefs[row]?.TOTAL ? String(multDefs[row].TOTAL) : '',
          ]),
          headStyles: { fillColor: panel, textColor: white, fontSize: 7, fontStyle: 'bold', halign: 'center', font: SANS },
          bodyStyles: { fontSize: 7.5, halign: 'center', font: MONO },
          columnStyles: matrixColumnStyles(34),
          theme: 'grid',
          styles: { lineColor: midGray, lineWidth: 0.15, cellPadding: 1.4 },
          didParseCell: function (data) {
            // The TOTAL row reads as a summary band, like the web table.
            if (data.section === 'body' && data.row.index === 3) {
              data.cell.styles.fillColor = [71, 85, 105];
              data.cell.styles.textColor = white;
              data.cell.styles.fontStyle = 'bold';
            }
          },
        });
        y = doc.lastAutoTable.finalY + 6;
      }

      // ── Week-over-week comparison for this class ──
      const compData = performanceComparisonByClass?.[cls];
      if (prevWeek && compData && compData.length > 0) {
        const prevKey = `Week ${prevWeek}`;
        const currKey = `Week ${activeWeek}`;
        const hasMovement = compData.some(r => (r[prevKey] || 0) !== 0 || (r[currKey] || 0) !== 0);

        if (hasMovement) {
          y = ensureSpace(y, 34);
          tacticalLabel(`Week ${prevWeek} vs Week ${activeWeek} by Company`, margin, y, { color: tealDeep, size: 6.2 });
          y += 2.5;

          autoTable(doc, {
            startY: y,
            margin: { left: margin, right: margin },
            head: [['Company', ...compData.map(r => r.name)]],
            body: [
              [prevKey, ...compData.map(r => String(r[prevKey] ?? 0))],
              [currKey, ...compData.map(r => String(r[currKey] ?? 0))],
              ['Change', ...compData.map(r => {
                const delta = (r[currKey] ?? 0) - (r[prevKey] ?? 0);
                return delta > 0 ? `+${delta}` : String(delta);
              })],
            ],
            headStyles: { fillColor: panel, textColor: white, fontSize: 7, fontStyle: 'bold', halign: 'center', font: SANS },
            bodyStyles: { fontSize: 7.5, halign: 'center', font: MONO },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold', fillColor: lightGray, textColor: ink, cellWidth: 34, font: SANS } },
            theme: 'grid',
            styles: { lineColor: midGray, lineWidth: 0.15, cellPadding: 1.4 },
            didParseCell: function (data) {
              // Colour the delta row: more deficiencies is bad, fewer is good.
              if (data.section === 'body' && data.row.index === 2 && data.column.index > 0) {
                const val = parseFloat(data.cell.raw);
                if (val > 0) data.cell.styles.textColor = crimson;
                else if (val < 0) data.cell.styles.textColor = green;
                else data.cell.styles.textColor = slate;
                data.cell.styles.fontStyle = 'bold';
              }
            },
          });
          y = doc.lastAutoTable.finalY + 10;
        }
      }
    }
  }

  // ─── Cadet distribution by class and company ───
  if (classByCompanyData && classByCompanyData.length > 0) {
    const hasAny = classByCompanyData.some(r => (r['1CL'] || 0) + (r['2CL'] || 0) + (r['3CL'] || 0) > 0);
    if (hasAny) {
      y = ensureSpace(y, 56);
      y = sectionHeading('Distribution', 'Deficient Cadets by Class and Company', y, gold);

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Class', ...classByCompanyData.map(r => r.name), 'TOTAL']],
        body: ['1CL', '2CL', '3CL'].map(cls => {
          const rowTotal = classByCompanyData.reduce((sum, r) => sum + (r[cls] || 0), 0);
          return [cls, ...classByCompanyData.map(r => (r[cls] ? String(r[cls]) : '')), String(rowTotal)];
        }),
        headStyles: { fillColor: panel, textColor: white, fontSize: 7, fontStyle: 'bold', halign: 'center', font: SANS },
        bodyStyles: { fontSize: 7.5, halign: 'center', font: MONO },
        columnStyles: matrixColumnStyles(26),
        theme: 'grid',
        styles: { lineColor: midGray, lineWidth: 0.15, cellPadding: 1.6 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CHARTS + SEVERITY LEGEND
  // ═══════════════════════════════════════════════════════════════
  y = newPage();
  y = sectionHeading('Visual Analysis', 'Distribution & Severity Classification', y);

  const companiesByCount = [...companySeverity].sort((a, b) => b.count - a.count);
  const countChartData = companiesByCount.map(s => ({
    label: COMPANY_NAMES[s.coy] || s.coy,
    value: s.count,
    color: COMPANY_COLORS_RGB[s.coy] || COMPANY_COLORS_RGB['Unspecified'],
  }));

  const companiesByPts = [...companySeverity].sort((a, b) => b.totalPts - a.totalPts);
  const ptsChartData = companiesByPts.map(s => ({
    label: COMPANY_NAMES[s.coy] || s.coy,
    value: s.totalPts,
    color: COMPANY_COLORS_RGB[s.coy] || COMPANY_COLORS_RGB['Unspecified'],
  }));

  let chartY = y;
  chartY = drawHorizontalBarChart(margin, chartY, contentWidth, 'Deficiency Count by Company', countChartData);
  chartY += 6;
  chartY = drawHorizontalBarChart(margin, chartY, contentWidth, 'Total Deficiency Points by Company', ptsChartData, ' pts');
  y = chartY + 10;

  const groupedData2 = [...companySeverity].sort((a, b) => b.totalPts - a.totalPts).map(s => ({
    label: COMPANY_NAMES[s.coy] || s.coy,
    count: s.count,
    totalPts: s.totalPts,
  }));

  const groupedChartHeight = 10 + groupedData2.length * 15;
  if (y + groupedChartHeight > pageHeight - 15) {
    y = newPage();
    y = sectionHeading('Visual Analysis', 'Distribution & Severity (Cont.)', y);
  }

  y = drawGroupedBarChart(
    margin, y, contentWidth,
    'Count vs Total Points - Side-by-Side Comparison',
    groupedData2, 'count', 'totalPts',
    'Deficiency Count', 'Total Points (abs)',
    tealDeep, gold
  );

  y += 6;

  // ─── Severity legend ───
  y = ensureSpace(y, 58);
  y = sectionHeading('Reference', 'Severity Classification Legend', y);

  doc.setFont(SANS, 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slate);
  doc.text(
    'Severity is determined by the Average Deficiency Points per Cadet within each company. Higher average points indicate deeper academic trouble across cadets.',
    margin, y, { maxWidth: contentWidth }
  );
  y += 8;

  const legendBoxH = 10;
  const legendColW = (contentWidth - 9) / 4;

  SEVERITY_TIERS.forEach((tier, i) => {
    const lx = margin + i * (legendColW + 3);
    doc.setFillColor(...tier.color);
    doc.roundedRect(lx, y, legendColW, legendBoxH, 1.5, 1.5, 'F');
    doc.setFont(SANS, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...white);
    doc.text(tier.tier.toUpperCase(), lx + 3, y + 4.5);
    doc.setFont(MONO, 'normal');
    doc.setFontSize(6.2);
    doc.text(`Avg/Cadet ${tier.threshold}`, lx + 3, y + 8.3);
  });
  y += legendBoxH + 3;

  SEVERITY_TIERS.forEach((tier, i) => {
    const lx = margin + i * (legendColW + 3);
    doc.setFont(SANS, 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...slate);
    doc.text(tier.desc, lx, y, { maxWidth: legendColW - 2 });
  });

  y += 14;

  // ─── How to read ───
  if (y + 30 < pageHeight - 15) {
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');
    doc.setFillColor(...tealDeep);
    doc.roundedRect(margin, y, 1.6, 26, 0.8, 0.8, 'F');

    tacticalLabel('How to Read This Report', margin + 6, y + 6, { color: tealDeep, size: 6.5 });

    doc.setFont(SANS, 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...slate);
    const notes = [
      'A company with fewer deficiencies but a higher severity tier indicates its cadets are, on average, further from passing - requiring more targeted intervention.',
      '"Cadets of Special Concern" are flagged when a cadet accumulates more than 20 total deficiency points OR is deficient in 3 or more subjects simultaneously.',
      'Deficiency points (Pts) represent how far below the passing threshold a cadet scored. Larger absolute values mean more severe academic risk.',
    ];
    notes.forEach((note, i) => {
      doc.text(`- ${note}`, margin + 6, y + 11.5 + i * 4.5, { maxWidth: contentWidth - 12 });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CADETS OF SPECIAL CONCERN
  // ═══════════════════════════════════════════════════════════════
  if (specialConcernCadets.length > 0) {
    y = newPage();
    y = sectionHeading('Priority', 'Cadets of Special Concern', y, crimson);

    doc.setFont(SANS, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text('Cadets with more than 20 deficiency points or deficient in 3 or more subjects.', margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Cadet Name', 'Class', 'Company', 'Subjects Deficient', 'Total Points']],
      body: specialConcernCadets.map((c, i) => [
        String(i + 1),
        c.name,
        c.class,
        COMPANY_NAMES[c.company] || c.company,
        String(c.subjectCount),
        (c.totalPts % 1 === 0 ? c.totalPts : c.totalPts.toFixed(1)) + ' pts',
      ]),
      headStyles: { fillColor: crimson, textColor: white, fontSize: 7.5, fontStyle: 'bold', halign: 'center', font: SANS },
      bodyStyles: { fontSize: 7.5, halign: 'center', font: SANS },
      columnStyles: {
        0: { cellWidth: 10, font: MONO },
        1: { halign: 'left', fontStyle: 'bold', cellWidth: 55 },
        3: { halign: 'left' },
        4: { font: MONO },
        5: { font: MONO },
      },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      theme: 'grid',
      styles: { lineColor: midGray, lineWidth: 0.2 },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 5) {
          const ptsVal = parseFloat(data.cell.raw);
          if (ptsVal > 20) data.cell.styles.textColor = crimson;
          else data.cell.styles.textColor = orange;
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.section === 'body' && data.column.index === 4) {
          const count = parseInt(data.cell.raw);
          if (count >= 3) {
            data.cell.styles.textColor = crimson;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // FULL RECORDS BY CLASS -> COURSE
  // ═══════════════════════════════════════════════════════════════
  const classOrder = ['1CL', '2CL', '3CL'];
  const orderedClasses = Object.entries(groupedData).sort(([a], [b]) => {
    const aIdx = classOrder.indexOf(a);
    const bIdx = classOrder.indexOf(b);
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  for (const [cls, courses] of orderedClasses) {
    y = newPage();
    y = sectionHeading('Full Records', `${cls} - Full Deficiency Records`, y);

    const sortedCoursesForClass = Object.entries(courses).sort(([a], [b]) => a.localeCompare(b));

    for (const [crs, courseDefs] of sortedCoursesForClass) {
      y = ensureSpace(y, 34);

      doc.setFont(SANS, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...tealDeep);
      doc.text(`${crs}`, margin, y);
      doc.setFont(MONO, 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...slate);
      doc.text(`(${courseDefs.length} records)`, margin + doc.getTextWidth(crs) + 3, y);
      y += 2;

      const sorted = [...courseDefs].sort((a, b) => {
        const aP = Math.abs(parseFloat(a.pts) || 0);
        const bP = Math.abs(parseFloat(b.pts) || 0);
        return bP - aP;
      });

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['#', 'Cadet Name', 'CN', 'Sec', 'Company', 'Grade', 'Def. Points']],
        body: sorted.map((d, i) => [
          String(i + 1),
          d.cadet || '-',
          d.cn || '-',
          d.sec || '-',
          d.company || d.coy || '-',
          d.grade || '-',
          (d.pts || '0') + ' pts',
        ]),
        headStyles: { fillColor: panel, textColor: white, fontSize: 6.8, fontStyle: 'bold', halign: 'center', font: SANS },
        bodyStyles: { fontSize: 7, halign: 'center', font: SANS },
        columnStyles: {
          0: { cellWidth: 8, font: MONO },
          // 'auto' lets the name column absorb the leftover width so the
          // fixed columns add up to the full text block. Pinning it to a
          // fixed 55mm left 33mm unused and made autoTable log a spurious
          // "could not fit page" error on every records table.
          1: { halign: 'left', fontStyle: 'bold', cellWidth: 'auto' },
          2: { cellWidth: 16, font: MONO },
          3: { cellWidth: 12, font: MONO },
          4: { cellWidth: 18, font: MONO },
          5: { cellWidth: 18, font: MONO },
          6: { cellWidth: 22, font: MONO },
        },
        alternateRowStyles: { fillColor: lightGray },
        theme: 'grid',
        styles: { lineColor: midGray, lineWidth: 0.15, cellPadding: 1.5 },
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 6) {
            const ptsVal = Math.abs(parseFloat(data.cell.raw));
            if (ptsVal >= 10) data.cell.styles.textColor = crimson;
            else if (ptsVal >= 5) data.cell.styles.textColor = orange;
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // ─── Footers ───
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  doc.save(`Deficiency_Report_Week${activeWeek}_${now.toISOString().slice(0, 10)}.pdf`);
}
