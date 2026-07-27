const fs = require('fs');

// Função para garantir UTF-8 limpo
function makeUtf8(filePath) {
  let content;
  try {
    const raw = fs.readFileSync(filePath);
    if (raw[0] === 0xff && raw[1] === 0xfe) {
      content = raw.toString('utf16le');
    } else {
      content = raw.toString('utf8');
    }
  } catch(e) {
    return;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${filePath} convertido para UTF-8 limpo.`);
}

makeUtf8('css/tokens.css');
makeUtf8('css/base.css');
makeUtf8('css/pages/kds.css');
makeUtf8('css/pages/track.css');
makeUtf8('css/pages/motoboy.css');
makeUtf8('css/pages/admin.css');
makeUtf8('index.html');
