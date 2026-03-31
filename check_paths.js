const fs = require('fs');
const data = JSON.parse(fs.readFileSync('openapi.json'));
const paths = Object.keys(data.paths).filter(k=>k.includes('business-information'));
console.log(paths.join('\n'));
