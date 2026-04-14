const http = require('http');
const url = 'http://localhost:5000/api/marketplace';

http.get(url, (res) => {
  console.log('statusCode', res.statusCode);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => { console.log('body:', data); process.exit(0); });
}).on('error', (err) => {
  console.error('error', err.message);
  process.exit(1);
});
