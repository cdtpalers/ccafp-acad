import { defData } from './deficienciesData.js';
const deficiencies = defData["Week 8"] || Object.values(defData)[0];
const cadetStats = {};
deficiencies.forEach(def => {
  const name = def.cadet;
  if (!name) return;
  if (!cadetStats[name]) {
    cadetStats[name] = { name, totalPts: 0, subjectCount: 0 };
  }
  cadetStats[name].totalPts += (parseFloat(def.pts) || 0);
  cadetStats[name].subjectCount += 1;
});
console.log(Object.values(cadetStats).filter(c => c.totalPts > 20));
