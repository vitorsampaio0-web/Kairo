const http = require('http');
const fs = require('fs');
const path = require('path');

const mime = {
  '.html': 'text/html','.css': 'text/css','.js': 'application/javascript',
  '.json': 'application/json','.png': 'image/png','.webp': 'image/webp',
  '.ico': 'image/x-icon','.svg': 'image/svg+xml','.txt': 'text/plain'
};

const srv = http.createServer((req, res) => {
  let filePath = path.join(process.cwd(), decodeURIComponent(req.url).split('?')[0]);
  if (filePath.endsWith('/')) filePath += 'index.html';
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not found');
    } else {
      const cache = ext === '.html' ? 'max-age=0' : 'max-age=31536000';
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream', 'Cache-Control': cache });
      res.end(data);
    }
  });
});
srv.listen(8765, () => console.log('OK http://localhost:8765'));
setInterval(()=>{}, 60000);
