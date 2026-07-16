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

const COMPANY_COLORS_RGB = {
  'A': [34, 197, 94],
  'B': [148, 163, 184],
  'C': [239, 68, 68],
  'D': [59, 130, 246],
  'E': [249, 115, 22],
  'F': [127, 29, 29],
  'G': [234, 179, 8],
  'H': [51, 65, 85],
  'Unspecified': [156, 163, 175],
};

/**
 * Generate a comprehensive PDF deficiency report for the given week.
 */
export function exportDeficiencyPdf({ activeWeek, deficiencies, companySeverity, sortedCourses, specialConcernCadets, groupedData }) {
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

  // ─── Color palette ───
  const navy = [15, 23, 42];
  const slate = [100, 116, 139];
  const crimson = [220, 38, 38];
  const blue = [59, 130, 246];
  const orange = [249, 115, 22];
  const yellow = [202, 138, 4];
  const green = [22, 163, 74];
  const white = [255, 255, 255];
  const lightGray = [241, 245, 249];
  const midGray = [203, 213, 225];

  // Severity tier definitions
  const SEVERITY_TIERS = [
    { tier: 'Critical', color: crimson, threshold: '≥ 15.00', desc: 'Cadets are deeply behind; immediate academic intervention required.' },
    { tier: 'High', color: orange, threshold: '10.00 – 14.99', desc: 'Significant academic risk; close monitoring and remedial action needed.' },
    { tier: 'Moderate', color: yellow, threshold: '5.00 – 9.99', desc: 'Noticeable deficiency gap; preventive measures recommended.' },
    { tier: 'Low', color: green, threshold: '< 5.00', desc: 'Minor deficiency; cadets are near passing threshold.' },
  ];

  // ─── Helper: draw a header bar on each page ───
  function drawPageHeader() {
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...white);
    doc.text('PHILIPPINE MILITARY ACADEMY', margin, 8);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Fort Del Pilar, Loakan Road, Baguio, 2600 Benguet', margin, 13);
    doc.setFont('helvetica', 'bold');
    doc.text(`WEEK ${activeWeek} DEFICIENCY REPORT`, pageWidth - margin, 8, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Generated: ${dateStr} ${timeStr}`, pageWidth - margin, 13, { align: 'right' });
  }

  function drawPageFooter(pageNum, totalPages) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    doc.text('CONFIDENTIAL — Academic Council, CCAFP', margin, pageHeight - 6);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  /**
   * Draw a horizontal bar chart.
   * @param {number} x - Left x position
   * @param {number} y - Top y position
   * @param {number} w - Total width available
   * @param {string} title - Chart title
   * @param {Array} data - Array of { label, value, color }
   * @param {string} unit - Unit label for values (e.g., '' or ' pts')
   * @returns {number} The y position after the chart
   */
  function drawHorizontalBarChart(x, y, w, title, data, unit = '') {
    const barHeight = 7;
    const barGap = 3;
    const labelWidth = 38;
    const valueWidth = 20;
    const barAreaWidth = w - labelWidth - valueWidth - 4;
    const maxVal = Math.max(...data.map(d => d.value), 1);

    // Title
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text(title, x, y);
    y += 5;

    // Bars
    data.forEach((item) => {
      // Label
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...navy);
      doc.text(item.label, x, y + barHeight * 0.65, { maxWidth: labelWidth - 2 });

      // Background track
      const barX = x + labelWidth;
      doc.setFillColor(...lightGray);
      doc.roundedRect(barX, y, barAreaWidth, barHeight, 1.5, 1.5, 'F');

      // Filled bar
      const barW = Math.max((item.value / maxVal) * barAreaWidth, 1);
      doc.setFillColor(...(item.color || blue));
      doc.roundedRect(barX, y, barW, barHeight, 1.5, 1.5, 'F');

      // Value label
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navy);
      doc.text(`${item.value}${unit}`, barX + barAreaWidth + 2, y + barHeight * 0.65);

      y += barHeight + barGap;
    });

    return y;
  }

  /**
   * Draw a grouped bar chart (two bars per row).
   * @returns {number} The y position after the chart
   */
  function drawGroupedBarChart(x, y, w, title, data, key1, key2, label1, label2, color1, color2) {
    const barHeight = 5;
    const groupGap = 4;
    const labelWidth = 38;
    const valueWidth = 18;
    const barAreaWidth = w - labelWidth - valueWidth - 4;
    const maxVal = Math.max(...data.map(d => Math.max(d[key1], d[key2])), 1);

    // Title
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text(title, x, y);
    y += 3;

    // Legend
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setFillColor(...color1);
    doc.roundedRect(x + w - 80, y - 2, 5, 3, 0.5, 0.5, 'F');
    doc.setTextColor(...slate);
    doc.text(label1, x + w - 74, y);
    doc.setFillColor(...color2);
    doc.roundedRect(x + w - 40, y - 2, 5, 3, 0.5, 0.5, 'F');
    doc.text(label2, x + w - 34, y);
    y += 4;

    data.forEach((item) => {
      // Label
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...navy);
      doc.text(item.label, x, y + barHeight * 0.7);

      const barX = x + labelWidth;

      // Bar 1
      doc.setFillColor(...lightGray);
      doc.roundedRect(barX, y, barAreaWidth, barHeight, 1, 1, 'F');
      const barW1 = Math.max((item[key1] / maxVal) * barAreaWidth, 0.5);
      doc.setFillColor(...color1);
      doc.roundedRect(barX, y, barW1, barHeight, 1, 1, 'F');
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color1);
      doc.text(String(item[key1]), barX + barAreaWidth + 2, y + barHeight * 0.7);

      y += barHeight + 1;

      // Bar 2
      doc.setFillColor(...lightGray);
      doc.roundedRect(barX, y, barAreaWidth, barHeight, 1, 1, 'F');
      const barW2 = Math.max((item[key2] / maxVal) * barAreaWidth, 0.5);
      doc.setFillColor(...color2);
      doc.roundedRect(barX, y, barW2, barHeight, 1, 1, 'F');
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color2);
      doc.text(String(item[key2]), barX + barAreaWidth + 2, y + barHeight * 0.7);

      y += barHeight + groupGap;
    });

    return y;
  }


  // ═══════════════════════════════════════════════════════════════
  // PAGE 1 — COVER / EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════════════════════════
  drawPageHeader();
  let y = 28;

  // Title block
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text('Deficiency Report', margin, y);
  y += 8;
  doc.setFontSize(14);
  doc.setTextColor(...blue);
  doc.text(`AY 2026-2027  •  1st Term  •  Week ${activeWeek}`, margin, y);
  y += 5;

  // Divider
  doc.setDrawColor(...midGray);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Summary cards row
  const cardW = (contentWidth - 6) / 3;
  const cardH = 28;
  const cards = [
    { label: 'TOTAL DEFICIENCY RECORDS', value: String(totalRecords), color: crimson },
    { label: 'UNIQUE DEFICIENT CADETS', value: String(uniqueCadets), color: blue },
    { label: 'COURSES WITH DEFICIENCIES', value: String(sortedCourses.length), color: orange },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + 3);
    doc.setFillColor(...lightGray);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F');
    doc.setDrawColor(...card.color);
    doc.setLineWidth(0.8);
    doc.line(x, y, x, y + cardH);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...card.color);
    doc.text(card.value, x + 6, y + 14);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    doc.text(card.label, x + 6, y + 22);
  });
  y += cardH + 10;

  // ─── Company Severity Table ───
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text('Company Severity Breakdown', margin, y);
  y += 2;

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
    headStyles: { fillColor: navy, textColor: white, fontSize: 8, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8, halign: 'center' },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      5: { fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: lightGray },
    didParseCell: function(data) {
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

  // ─── Class & Course Breakdown Tables (Side-by-Side) ───
  if (y + 10 < pageHeight - 25) {
    const halfWidth = (contentWidth - 10) / 2;
    const startY = y;

    // Class Data
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

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text('Deficiencies by Class', margin, y);
    
    autoTable(doc, {
      startY: y + 2,
      margin: { left: margin, right: margin + halfWidth + 10 },
      head: [['Class', 'Deficiency Records']],
      body: classData.map(([cls, count]) => [cls, String(count)]),
      headStyles: { fillColor: navy, textColor: white, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center' } },
      alternateRowStyles: { fillColor: lightGray },
      theme: 'grid',
      styles: { lineColor: midGray, lineWidth: 0.2 },
    });

    const finalYClass = doc.lastAutoTable.finalY;

    // Course Data
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text('Deficiencies by Course', margin + halfWidth + 10, startY);

    autoTable(doc, {
      startY: startY + 2,
      margin: { left: margin + halfWidth + 10, right: margin },
      head: [['Course', 'Deficiency Records']],
      body: sortedCourses.map(([crs, data]) => [crs, String(data.total)]),
      headStyles: { fillColor: navy, textColor: white, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center' } },
      alternateRowStyles: { fillColor: lightGray },
      theme: 'grid',
      styles: { lineColor: midGray, lineWidth: 0.2 },
    });

    y = Math.max(finalYClass, doc.lastAutoTable.finalY) + 10;
  }

  // ═══════════════════════════════════════════════════════════════
  // PAGE 2 — CHARTS + SEVERITY LEGEND
  // ═══════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader();
  y = 26;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text('Visual Analysis & Severity Classification', margin, y);
  y += 3;
  doc.setDrawColor(...midGray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ─── Stacked charts ───
  const chartWidth = contentWidth;

  // Prepare data sorted by count (descending)
  const companiesByCount = [...companySeverity].sort((a, b) => b.count - a.count);
  const countChartData = companiesByCount.map(s => ({
    label: COMPANY_NAMES[s.coy] || s.coy,
    value: s.count,
    color: COMPANY_COLORS_RGB[s.coy] || COMPANY_COLORS_RGB['Unspecified'],
  }));

  // Prepare data sorted by total pts (descending)
  const companiesByPts = [...companySeverity].sort((a, b) => b.totalPts - a.totalPts);
  const ptsChartData = companiesByPts.map(s => ({
    label: COMPANY_NAMES[s.coy] || s.coy,
    value: s.totalPts,
    color: COMPANY_COLORS_RGB[s.coy] || COMPANY_COLORS_RGB['Unspecified'],
  }));

  let chartY = y;
  // Top chart: Deficiency Count
  chartY = drawHorizontalBarChart(margin, chartY, chartWidth, 'Deficiency Count by Company', countChartData);

  chartY += 6;

  // Bottom chart: Total Points
  chartY = drawHorizontalBarChart(margin, chartY, chartWidth, 'Total Deficiency Points by Company', ptsChartData, ' pts');

  y = chartY + 10;

  // ─── Grouped "Count vs Severity" chart ───
  const groupedData2 = [...companySeverity].sort((a, b) => b.totalPts - a.totalPts).map(s => ({
    label: COMPANY_NAMES[s.coy] || s.coy,
    count: s.count,
    totalPts: s.totalPts,
  }));

  const groupedChartHeight = 10 + groupedData2.length * 15;
  if (y + groupedChartHeight > pageHeight - 15) {
    doc.addPage();
    drawPageHeader();
    y = 26;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text('Visual Analysis & Severity Classification (Cont.)', margin, y);
    y += 3;
    doc.setDrawColor(...midGray);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  y = drawGroupedBarChart(
    margin, y, contentWidth,
    'Count vs Total Points — Side-by-Side Comparison',
    groupedData2, 'count', 'totalPts',
    'Deficiency Count', 'Total Points (abs)',
    [147, 197, 253], orange
  );

  y += 6;

  // ─── SEVERITY CLASSIFICATION LEGEND ───
  // Check if enough space, otherwise new page
  if (y + 55 > pageHeight - 15) {
    doc.addPage();
    drawPageHeader();
    y = 26;
  }

  doc.setDrawColor(...midGray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text('Severity Classification Legend', margin, y);
  y += 3;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...slate);
  doc.text('Severity is determined by the Average Deficiency Points per Cadet within each company. Higher average points indicate deeper academic trouble across cadets.', margin, y, { maxWidth: contentWidth });
  y += 7;

  const legendBoxH = 10;
  const legendColW = (contentWidth - 9) / 4;

  SEVERITY_TIERS.forEach((tier, i) => {
    const lx = margin + i * (legendColW + 3);

    // Background box
    doc.setFillColor(...tier.color);
    doc.roundedRect(lx, y, legendColW, legendBoxH, 1.5, 1.5, 'F');

    // Tier name
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...white);
    doc.text(tier.tier.toUpperCase(), lx + 3, y + 4.5);

    // Threshold
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Avg Pts/Cadet: ${tier.threshold}`, lx + 3, y + 8.5);
  });
  y += legendBoxH + 3;

  // Description under each
  SEVERITY_TIERS.forEach((tier, i) => {
    const lx = margin + i * (legendColW + 3);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    doc.text(tier.desc, lx, y, { maxWidth: legendColW - 2 });
  });

  y += 14;

  // ─── Additional classification notes ───
  if (y + 30 < pageHeight - 15) {
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
    doc.setDrawColor(...blue);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin, y + 22);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text('How to Read This Report', margin + 5, y + 5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    const notes = [
      '• A company with fewer deficiencies but a higher severity tier indicates its cadets are, on average, further from passing — requiring more targeted intervention.',
      '• "Cadets of Special Concern" are flagged when a cadet accumulates > 20 total deficiency points OR is deficient in 3 or more subjects simultaneously.',
      '• Deficiency points (Pts) represent how far below the passing threshold a cadet scored. Larger absolute values = more severe academic risk.',
    ];
    notes.forEach((note, i) => {
      doc.text(note, margin + 5, y + 10 + i * 4.5, { maxWidth: contentWidth - 10 });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PAGE 3+ — CADETS OF SPECIAL CONCERN
  // ═══════════════════════════════════════════════════════════════
  if (specialConcernCadets.length > 0) {
    doc.addPage();
    drawPageHeader();
    y = 26;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...crimson);
    doc.text('Cadets of Special Concern', margin, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    doc.text('Cadets with more than 20 deficiency points or deficient in 3 or more subjects.', margin, y);
    y += 3;

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
      headStyles: { fillColor: crimson, textColor: white, fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 7.5, halign: 'center' },
      columnStyles: { 0: { cellWidth: 10 }, 1: { halign: 'left', fontStyle: 'bold' }, 3: { halign: 'left' } },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      theme: 'grid',
      styles: { lineColor: midGray, lineWidth: 0.2 },
      didParseCell: function(data) {
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
  // REMAINING PAGES — FULL RECORDS BY CLASS → COURSE
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
    doc.addPage();
    drawPageHeader();
    y = 26;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text(`${cls} — Full Deficiency Records`, margin, y);
    y += 6;

    const sortedCoursesForClass = Object.entries(courses).sort(([a], [b]) => a.localeCompare(b));

    for (const [crs, courseDefs] of sortedCoursesForClass) {
      // Check if we need a new page
      if (y > pageHeight - 40) {
        doc.addPage();
        drawPageHeader();
        y = 26;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...blue);
      doc.text(`${crs}`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slate);
      doc.text(`  (${courseDefs.length} records)`, margin + doc.getTextWidth(crs) + 1, y);
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
        headStyles: { fillColor: navy, textColor: white, fontSize: 7, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 7, halign: 'center' },
        columnStyles: { 
          0: { cellWidth: 8 },
          1: { halign: 'left', fontStyle: 'bold', cellWidth: 55 },
          2: { cellWidth: 16 },
          3: { cellWidth: 12 },
          4: { cellWidth: 18 },
          5: { cellWidth: 18 },
          6: { cellWidth: 22 },
        },
        alternateRowStyles: { fillColor: lightGray },
        theme: 'grid',
        styles: { lineColor: midGray, lineWidth: 0.15, cellPadding: 1.5 },
        didParseCell: function(data) {
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

  // ─── Add page numbers to all pages ───
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  // ─── Save ───
  doc.save(`Deficiency_Report_Week${activeWeek}_${now.toISOString().slice(0, 10)}.pdf`);
}
