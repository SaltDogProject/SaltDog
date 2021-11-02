const fs = require('fs');
var pdf = fs.readFileSync(
    'C:\\Users\\Dorapocket\\Desktop\\Arithmetic-Intensity-Guided Fault Tolerance for Neural Network Inference on GPUs.pdf'
);
window._pdfFileBuffer = pdf.buffer;
console.log('init pdf.js', pdf.buffer);
