const http = require('http');

async function checkHeadersAndMeta() {
  return new Promise((resolve) => {
    http.get('http://localhost:4000/', (res) => {
      console.log('--- 1. HTTP HEADERS ---');
      console.log('HTTP Status Code:', res.statusCode);
      console.log('Referrer-Policy Header:', res.headers['referrer-policy']);
      
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('\n--- 2. HTML META TAG ---');
        const metaTagRegex = /<meta\s+name=["']referrer["']\s+content=["']strict-origin-when-cross-origin["']\s*\/?>/i;
        const match = body.match(metaTagRegex);
        console.log('Meta Referrer-Policy tag match:', match ? match[0] : 'NÃO ENCONTRADA');
        resolve();
      });
    });
  });
}

checkHeadersAndMeta();
