'use strict';
// Áreas nominales aproximadas tomadas del proyecto de referencia, en cm².
const REBARS = [
  {number:3, diameter:'3/8″', area:0.71},
  {number:4, diameter:'1/2″', area:1.27},
  {number:5, diameter:'5/8″', area:1.98},
  {number:6, diameter:'3/4″', area:2.85},
  {number:8, diameter:'1″', area:5.07}
];
function estimateColumn({width,height,percentage}) {
  if (![width,height,percentage].every(Number.isFinite) || width < 1 || width > 200 || height < 1 || height > 200 || percentage < .5 || percentage > 4) throw new Error('Ingresa lados de 1 a 200 cm y una cuantía de 0.5 a 4%.');
  const section = width * height;
  const steel = section * percentage / 100;
  const options = REBARS.map(bar => {
    const count = Math.ceil(Number((steel / bar.area).toFixed(10)));
    return {...bar,count,provided:count*bar.area};
  });
  return {width,height,percentage,section,steel,options};
}
if (typeof module !== 'undefined') module.exports = {estimateColumn,REBARS};

// Intercambio local: acepta el resumen TXT de Varilla o «30 × 40 cm al 1%».
function parseColumnText(text) {
  if (typeof text !== 'string' || text.length > 16384) return null;
  const section = /(?:^|\n)(?:Sección:\s*)?(\d{1,3}(?:[.,]\d)?)\s*[×x]\s*(\d{1,3}(?:[.,]\d)?)\s*cm\b/im.exec(text.trim());
  if (!section) return null;
  const percentage = /^(?:[ \t]*(?:al\s+)?(\d(?:[.,]\d)?)\s*%)\s*$/i.exec(text.trim().slice(section.index + section[0].length))
    || /^Cuantía:\s*(\d(?:[.,]\d)?)\s*%\s*$/im.exec(text);
  if (!percentage) return null;
  const decimal = value => Number(value.replace(',', '.'));
  try {
    return estimateColumn({width:decimal(section[1]),height:decimal(section[2]),percentage:decimal(percentage[1])});
  } catch { return null; }
}

function isColumnAction(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'web+varilla:' && url.hostname === 'calcular' && !url.username && !url.password && !url.port && ['', '/'].includes(url.pathname);
  } catch { return false; }
}
if (typeof module !== 'undefined') Object.assign(module.exports, {parseColumnText,isColumnAction});
