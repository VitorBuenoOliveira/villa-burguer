const fs = require('fs');

const content = fs.readFileSync('scratch/original_index.html', 'utf16le');

// Extrai as linhas do HTML (das páginas até a tag script)
const lines = content.split('\n');
const htmlLines = lines.slice(1560, 2139);

fs.writeFileSync('scratch/restored_html.html', htmlLines.join('\n'), 'utf8');
console.log('Extraído com sucesso:', htmlLines.length, 'linhas.');
