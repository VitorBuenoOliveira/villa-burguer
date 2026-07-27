const fs = require('fs');

let content;
try {
  content = fs.readFileSync('scratch/original_index.html', 'utf16le');
} catch(e) {
  content = fs.readFileSync('index.html', 'utf8');
}

const lines = content.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('<section') || line.includes('class="page') || line.includes('id="page') || line.includes('id="sec-') || line.includes('<!-- =====')) {
    console.log(`L${idx+1}: ${line.trim()}`);
  }
});
