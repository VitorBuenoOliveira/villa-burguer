const fs = require('fs');

function cleanCssFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<style>/g, '').replace(/<\/style>/g, '');
  // Remove BOM if present
  content = content.replace(/^\uFEFF/, '');
  fs.writeFileSync(filePath, content.trim(), 'utf8');
  console.log(`✨ ${filePath} limpo e formatado em CSS puro.`);
}

cleanCssFile('css/tokens.css');
cleanCssFile('css/base.css');
cleanCssFile('css/pages/kds.css');
cleanCssFile('css/pages/track.css');
cleanCssFile('css/pages/motoboy.css');
cleanCssFile('css/pages/admin.css');
