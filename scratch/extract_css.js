const fs = require('fs');
const content = fs.readFileSync('scratch/original_index.html', 'utf16le');
const lines = content.split('\n');
const cssLines = lines.slice(26, 1562);

fs.writeFileSync('scratch/original_css.css', cssLines.join('\n'), 'utf8');
console.log('CSS extraído:', cssLines.length, 'linhas.');
