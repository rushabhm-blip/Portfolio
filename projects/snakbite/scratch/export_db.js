const fs = require('fs');
let c = fs.readFileSync('assets/snake_observations_data.js', 'utf8').trim();
if (c.endsWith(';')) c = c.slice(0, -1);
c += '; if (typeof window !== "undefined") { window.DB = DB; window.SNC_DB = DB; } if (typeof module !== "undefined") { module.exports = DB; }\n';
fs.writeFileSync('assets/snake_observations_data.js', c);
console.log('Successfully updated assets/snake_observations_data.js');
