const { spawn } = require('child_process');
const http = require('http');

const server = spawn(process.execPath, ['backend/server.cjs'], { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] });
let started = false;
let stderr = '';
let stdout = '';

server.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  stdout += text;
  process.stdout.write(text);
  if (!started && text.includes('Server running on http://localhost:5000')) {
    started = true;
    http.get('http://localhost:5000/api/marketplace', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('RESPONSE_STATUS', res.statusCode);
        console.log('RESPONSE_BODY', data);
        server.kill();
      });
    }).on('error', (err) => {
      console.error('REQUEST_ERROR', err.message);
      server.kill();
    });
  }
});

server.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  stderr += text;
  process.stderr.write(text);
});

server.on('close', (code) => {
  console.log('SERVER_EXIT', code);
  process.exit(code);
});
