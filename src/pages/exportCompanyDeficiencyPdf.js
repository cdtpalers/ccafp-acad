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

export function exportCompanyDeficiencyPdf(companyCode, activeWeek, allDeficiencies) {
  const companyName = COMPANY_NAMES[companyCode] || companyCode;
  const deficiencies = allDeficiencies.filter(d => (d.company || d.coy || 'Unspecified') === companyCode);
  
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  
  const uniqueCadets = new Set(deficiencies.map(d => d.cadet).filter(Boolean)).size;
  const totalRecords = deficiencies.length;
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // ─── Color palette ───
  const navy = [15, 23, 42];
  const white = [255, 255, 255];
  const slate = [100, 116, 139];
  const lightGray = [241, 245, 249];
  const midGray = [203, 213, 225];
  const crimson = [220, 38, 38];
  const orange = [249, 115, 22];

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
    doc.text(`WEEK ${activeWeek} - ${companyName.toUpperCase()}`, pageWidth - margin, 8, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Generated: ${dateStr} ${timeStr}`, pageWidth - margin, 13, { align: 'right' });
  }

  function drawPageFooter(pageNum, totalPages) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    doc.text(`CONFIDENTIAL — ${companyName} Deficiency Report`, margin, pageHeight - 6);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  drawPageHeader();
  let y = 28;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text(`${companyName} Deficiency Report`, margin, y);
  y += 8;
  
  doc.setFontSize(12);
  doc.setTextColor(...slate);
  doc.text(`AY 2026-2027 • 1st Term • Week ${activeWeek}`, margin, y);
  y += 5;

  doc.setDrawColor(...midGray);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Summary stats
  doc.setFontSize(10);
  doc.setTextColor(...navy);
  doc.text(`Total Deficiency Records: ${totalRecords}`, margin, y);
  y += 6;
  doc.text(`Unique Cadets Deficient: ${uniqueCadets}`, margin, y);
  y += 10;
  
  // Group by Class, then Course
  const groupedData = deficiencies.reduce((acc, def) => {
    const cls = def.class || 'Unspecified';
    const crs = def.course_name ? `${def.course} - ${def.course_name}` : (def.course || 'Unspecified');
    if (!acc[cls]) acc[cls] = {};
    if (!acc[cls][crs]) acc[cls][crs] = [];
    acc[cls][crs].push(def);
    return acc;
  }, {});
  
  const classOrder = ['1CL', '2CL', '3CL', '4CL'];
  const orderedClasses = Object.entries(groupedData).sort(([a], [b]) => {
    const aIdx = classOrder.indexOf(a);
    const bIdx = classOrder.indexOf(b);
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  for (const [cls, courses] of orderedClasses) {
    if (y > pageHeight - 40) {
      doc.addPage();
      drawPageHeader();
      y = 26;
    }
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navy);
    doc.text(`${cls} Deficiencies`, margin, y);
    y += 6;

    const sortedCoursesForClass = Object.entries(courses).sort(([a], [b]) => a.localeCompare(b));

    for (const [crs, courseDefs] of sortedCoursesForClass) {
      if (y > pageHeight - 30) {
        doc.addPage();
        drawPageHeader();
        y = 26;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...[59, 130, 246]); // blue
      doc.text(`${crs} (${courseDefs.length} records)`, margin, y);
      y += 2;

      const sorted = [...courseDefs].sort((a, b) => {
        const aP = Math.abs(parseFloat(a.pts) || 0);
        const bP = Math.abs(parseFloat(b.pts) || 0);
        return bP - aP;
      });

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['#', 'Cadet Name', 'CN', 'Sec', 'Grade', 'Def. Points']],
        body: sorted.map((d, i) => [
          String(i + 1),
          d.cadet || '-',
          d.cn || '-',
          d.sec || '-',
          d.grade || '-',
          (d.pts || '0') + ' pts',
        ]),
        headStyles: { fillColor: navy, textColor: white, fontSize: 8, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, halign: 'center' },
        columnStyles: { 
          0: { cellWidth: 10 },
          1: { halign: 'left', fontStyle: 'bold', cellWidth: 70 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
        },
        alternateRowStyles: { fillColor: lightGray },
        theme: 'grid',
        styles: { lineColor: midGray, lineWidth: 0.15, cellPadding: 1.5 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 5) {
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

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  doc.save(`Deficiency_Report_${companyCode}_Week${activeWeek}_${now.toISOString().slice(0, 10)}.pdf`);
}
