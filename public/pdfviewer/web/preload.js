const fs = require('fs');
var pdf = fs.readFileSync('C:\\Users\\Dorapocket\\Desktop\\系统与计算神经科学\\1-s2.0-S0304394018304671-main.pdf');
window._pdfFileBuffer = pdf.buffer;
console.log('init pdf.js', pdf.buffer);
