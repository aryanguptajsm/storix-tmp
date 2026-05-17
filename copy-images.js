const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\h0p000\\.gemini\\antigravity\\brain\\4e2c429f-b32b-4d74-b536-827e8cae150b';
const destDir = path.join(__dirname, 'public', 'images', 'demo');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (file.startsWith('demo_product_') && file.endsWith('.png')) {
    const destName = file.replace(/_\d+\.png$/, '.png'); // Simplify name
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, destName));
    console.log('Copied', file, 'to', destName);
  }
}
