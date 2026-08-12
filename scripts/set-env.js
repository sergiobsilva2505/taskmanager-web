const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../src/environments/environment.prod.ts');
let content = fs.readFileSync(envFilePath, 'utf8');

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';

content = content.replace('%%GOOGLE_CLIENT_ID%%', googleClientId);

fs.writeFileSync(envFilePath, content);
console.log('✅ Environment variables injected successfully.');
 
