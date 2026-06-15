const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
};

const API_ROUTES = {
  '/api/chat': require('./api/chat'),
  '/api/order': require('./api/order'),
  '/api/doordash-quote': require('./api/doordash-quote'),
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { req.body = JSON.parse(body); } catch { req.body = {}; }
      resolve();
    });
  });
}

http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];
  const handler = API_ROUTES[urlPath];

  if (handler) {
    await parseBody(req);
    req.query = Object.fromEntries(new URL(req.url, `http://localhost`).searchParams);
    return handler(req, res);
  }

  let filePath = path.join(__dirname, urlPath === '/' ? '/index.html' : urlPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Server running on port ${PORT}`));
