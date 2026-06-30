const fs = require('fs');
const path = require('path');

// 1. Update app/page.tsx
const pagePath = path.join(__dirname, '..', 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Replace the huge base64 src with /logo.png
const newPageContent = pageContent.replace(
  /src="data:image\/png;base64,[^"]+"/,
  'src="/logo.png"'
);

fs.writeFileSync(pagePath, newPageContent, 'utf8');
console.log('Successfully updated app/page.tsx to use /logo.png');

// 2. Update app/auth/page.tsx
const authPath = path.join(__dirname, '..', 'app', 'auth', 'page.tsx');
if (fs.existsSync(authPath)) {
  let authContent = fs.readFileSync(authPath, 'utf8');
  
  const newAuthContent = authContent.replace(
    /src="data:image\/png;base64,[^"]+"/,
    'src="/logo.png"'
  );
  
  fs.writeFileSync(authPath, newAuthContent, 'utf8');
  console.log('Successfully updated app/auth/page.tsx to use /logo.png');
} else {
  console.log('app/auth/page.tsx not found');
}
