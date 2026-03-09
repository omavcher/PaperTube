const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'client', 'src', 'app', 'profile', 'page.tsx');
let content = fs.readFileSync(filepath, 'utf8');

const idx = content.indexOf('generateInvoice(tx)');
const raw = content.substring(idx - 200, idx + 500);
// Print as hex so we can see all chars
const buf = Buffer.from(raw, 'utf8');
let out = '';
for (let i = 0; i < buf.length; i++) {
  const b = buf[i];
  if (b >= 32 && b < 127) out += String.fromCharCode(b);
  else out += `\\x${b.toString(16).padStart(2,'0')}`;
}
console.log(out);
