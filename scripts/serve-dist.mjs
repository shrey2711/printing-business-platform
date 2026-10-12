// Serves dist/ the way Vercel does: a file if it exists, otherwise the
// directory's index.html (so /products/foo gets the PRERENDERED page), otherwise
// the SPA shell. `vite preview` skips the middle step, so it never shows the
// prerendered HTML — use this to test what a crawler is actually served.
//
//   npm run build && node scripts/serve-dist.mjs [port]   (default 4173)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'dist');
const PORT = Number(process.argv[2]) || 4173;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain'
};

const isFile = (p) => stat(p).then((s) => s.isFile()).catch(() => false);

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, '');
  let file = join(ROOT, safe);
  if (!(await isFile(file))) file = join(ROOT, safe, 'index.html');
  if (!(await isFile(file))) {
    if (path.startsWith('/api/')) { res.writeHead(503); return res.end('no api'); }
    file = join(ROOT, 'index.html');
  }
  const body = await readFile(file);
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(body);
}).listen(PORT, () => console.log(`serving dist/ on http://localhost:${PORT}`));
