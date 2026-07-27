const fs = require('fs');
const content = fs.readFileSync('scratch/original_index.html', 'utf16le');
const lines = content.split('\n');
const jsLines = lines.slice(2138);

fs.writeFileSync('scratch/original_js.js', jsLines.join('\n'), 'utf8');
console.log('JS extraído:', jsLines.length, 'linhas.');
