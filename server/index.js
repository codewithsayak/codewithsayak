import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import { createApp } from './app.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const production = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
if (production) process.env.NODE_ENV = 'production';
const port = Number(process.env.PORT || 3000);
const app = createApp();
const server = createServer(app);
let vite;

if (production) {
  const dist = path.join(root, 'dist');
  app.use(express.static(dist, {
    maxAge: '1y',
    immutable: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    },
  }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || !req.accepts('html')) return next();
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(dist, 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  vite = await createViteServer({
    root,
    appType: 'spa',
    server: {
      middlewareMode: true,
      host: '0.0.0.0',
      allowedHosts: true,
      ws: { server },
    },
  });
  app.use(vite.middlewares);
}

app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (!res.headersSent) res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`\n  Code with character.\n  http://0.0.0.0:${port}  ·  ${production ? 'production' : 'development'}\n`);
});

async function shutdown() {
  await vite?.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
