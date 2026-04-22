const fs = require('fs');
const data = JSON.parse(fs.readFileSync('openapi.json'));
fs.writeFileSync('admin_schema_out.txt', JSON.stringify(data.components.schemas.AdminResponse, null, 2), 'utf8');
