const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

// Regex to find the base64 logo
const logoRegex = /src="data:image\/png;base64,([^"]+)"/;
const match = pageContent.match(logoRegex);

if (match && match[1]) {
  const base64Data = match[1];
  const buffer = Buffer.from(base64Data, 'base64');
  
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'logo.png'), buffer);
  console.log('Successfully extracted logo to public/logo.png!');
} else {
  console.log('Logo base64 not found in page.tsx');
}
