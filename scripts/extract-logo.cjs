const fs = require('fs');
const path = require('path');
const svg = fs.readFileSync(path.join(__dirname, '../src/images/ncis-logo.svg'), 'utf8');
const m = svg.match(/xlink:href="(data:image\/png;base64,[^"]+)"/);
if (m) {
  const b64 = m[1].replace(/^data:image\/png;base64,/, '');
  const outDir = path.join(__dirname, '../public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'ncsi-logo.png'), Buffer.from(b64, 'base64'));
  console.log('Wrote public/ncsi-logo.png');
} else {
  console.log('No base64 PNG found in SVG');
}
