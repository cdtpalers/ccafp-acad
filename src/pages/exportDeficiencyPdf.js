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

/**
 * Generate a comprehensive PDF deficiency report for the given week.
 */
export function exportDeficiencyPdf({ activeWeek, deficiencies, companySeverity, sortedCourses, specialConcernCadets, groupedData }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
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
  const white = [255, 255, 255];
  const lightGray = [241, 245, 249];
  const midGray = [203, 213, 225];

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
        else if (tier === 'Moderate') data.cell.styles.textColor = [202, 138, 4];
        else data.cell.styles.textColor = [22, 163, 74];
      }
    },
    theme: 'grid',
    styles: { lineColor: midGray, lineWidth: 0.2 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ─── Course Breakdown Table ───
  if (y + 10 < pageHeight - 25) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text('Deficiencies by Course', margin, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Course', 'Deficiency Records']],
      body: sortedCourses.map(([crs, data]) => [crs, String(data.total)]),
      headStyles: { fillColor: navy, textColor: white, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'center' } },
      alternateRowStyles: { fillColor: lightGray },
      theme: 'grid',
      styles: { lineColor: midGray, lineWidth: 0.2 },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PAGE 2+ — CADETS OF SPECIAL CONCERN
  // ═══════════════════════════════════════════════════════════════
  if (specialConcernCadets.length > 0) {
    doc.addPage();
    drawPageHeader();
    y = 26;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...crimson);
    doc.text('⚠  Cadets of Special Concern', margin, y);
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
