import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../docs/brand/desk');
const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowed = new Set(['sidepanel/sidepanel.html', 'sidepanel/sidepanel.css', 'sidepanel/sidepanel.js', 'shared/schema.js', 'content/content.js', 'content/content.css', 'icons/icon-16.png', 'icons/icon-32.png', 'icons/icon-48.png', 'icons/icon-128.png']);
const local = new Set(['index.html', 'form.html', 'bridge.js']);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.css': 'text/css; charset=utf-8' };
http.createServer(async (req, res) => {
  try {
    const route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const name = route === '/' ? 'index.html' : route.slice(1);
    const upstream = name.startsWith('source/') ? name.slice(7) : null;
    if (!(upstream ? allowed.has(upstream) : local.has(name))) { res.writeHead(404); res.end('Not found'); return; }
    let bytes = await readFile(path.join(upstream ? source : root, upstream || name));
    if (upstream === 'sidepanel/sidepanel.html') bytes = Buffer.from(bytes.toString().replace('<head>', '<head><script src="/bridge.js"></script>'));
    res.writeHead(200, { 'Content-Type': types[path.extname(upstream || name)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(bytes);
  } catch { res.writeHead(404); res.end('Source file unavailable'); }
}).listen(Number(process.argv[2]||4199), '127.0.0.1', () => console.log('ApplyFlow controlled material desk: http://127.0.0.1:4199/'));
