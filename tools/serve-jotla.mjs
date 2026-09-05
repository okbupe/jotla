// Tiny static server: http://127.0.0.1:PORT/jotla/... maps to the jotla-web repo
// folder, because the export is built for the /jotla/ base path.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2] || 8791);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/jotla') {
      res.writeHead(302, { Location: '/jotla/' });
      res.end();
      return;
    }
    if (!url.startsWith('/jotla/')) {
      res.writeHead(404).end('not under /jotla/');
      return;
    }
    let rel = url.slice('/jotla/'.length);
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(path.resolve(ROOT))) {
      res.writeHead(403).end('no');
      return;
    }
    fs.readFile(file, (err, buf) => {
      if (err) {
        // Single page app: an unknown path is still the app.
        fs.readFile(path.join(ROOT, 'index.html'), (e2, html) => {
          if (e2) {
            res.writeHead(404).end('not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': TYPES['.html'] }).end(html);
        });
        return;
      }
      const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(buf);
    });
  })
  .listen(PORT, '127.0.0.1', () => console.log('serving ' + ROOT + ' at http://127.0.0.1:' + PORT + '/jotla/'));
