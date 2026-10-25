const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/' || url === '/cutlist') {
    url = '/public/plugins/sketchup/noithatpro_cutlist/ui/index.html';
  } else if (url === '/profile') {
    url = '/public/plugins/sketchup/noithatpro_profile/ui/index.html';
  }

  const filePath = path.join(root, url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found: ' + url);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const PORT = 4567;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Preview server running at http://127.0.0.1:${PORT}`);
});
