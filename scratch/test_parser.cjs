const fs = require('fs');

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

const csvText = fs.readFileSync('public/week3_deficiencies.csv', 'utf-8');
const data = parseCSV(csvText);

const counts = {};
data.forEach(def => {
    const coy = def.company || def.coy || 'Unspecified';
    counts[coy] = (counts[coy] || 0) + 1;
});
console.log(counts);
