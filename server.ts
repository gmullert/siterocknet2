import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.resolve(__dirname, 'public')));

const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}
const dbFile = path.resolve(dataDir, 'db.json');

app.get('/api/site-data', (_req, res) => {
  try {
    if (fs.existsSync(dbFile)) {
      const content = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(content);
      return res.json({ success: true, data: parsed });
    }
    return res.json({ success: false, data: null });
  } catch (err) {
    console.error('Error reading data/db.json:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.post('/api/site-data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Dados inválidos fornecidos' });
    }
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    // Atomic write via temp file then rename
    const tempFile = path.resolve(dataDir, `db.tmp.${Date.now()}`);
    fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
    fs.renameSync(tempFile, dbFile);
    return res.json({ success: true, message: 'Dados do site salvos com sucesso no servidor' });
  } catch (err) {
    console.error('Error writing data/db.json:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.get('/api/support-image', (_req, res) => {
  const publicDir = path.resolve(__dirname, 'public');
  const candidates = ['tecnico-rock-net2.png', 'tecnico-rock-net2.webp', 'tecnico-rock-net2.jpg'];
  for (const filename of candidates) {
    if (fs.existsSync(path.resolve(publicDir, filename))) {
      return res.json({ exists: true, url: `/${filename}` });
    }
  }
  return res.json({ exists: false, url: null });
});

app.post('/api/upload-support-image', (req, res) => {
  const { dataUrl } = req.body;
  if (!dataUrl || typeof dataUrl !== 'string') {
    return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  }
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Formato de imagem inválido' });
    }
    let ext = matches[1].toLowerCase();
    if (ext.includes('png')) ext = 'png';
    else if (ext.includes('jpeg') || ext.includes('jpg')) ext = 'jpg';
    else if (ext.includes('webp')) ext = 'webp';

    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `tecnico-rock-net2.${ext}`;
    const publicDir = path.resolve(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const filePath = path.resolve(publicDir, filename);
    fs.writeFileSync(filePath, buffer);

    // Also write to dist/ if dist folder exists
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      try {
        fs.writeFileSync(path.resolve(distDir, filename), buffer);
      } catch {}
    }

    const cacheBustUrl = `/${filename}?t=${Date.now()}`;
    return res.json({ success: true, url: cacheBustUrl });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/upload-favicon', (req, res) => {
  const { dataUrl } = req.body;
  if (!dataUrl || typeof dataUrl !== 'string') {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Formato de arquivo inválido. Envie PNG, SVG, ICO, JPG ou WebP.' });
    }
    let ext = matches[1].toLowerCase();
    if (ext.includes('svg')) ext = 'svg';
    else if (ext.includes('png')) ext = 'png';
    else if (ext.includes('ico') || ext.includes('icon')) ext = 'ico';
    else if (ext.includes('webp')) ext = 'webp';
    else if (ext.includes('jpeg') || ext.includes('jpg')) ext = 'jpg';
    else ext = 'png';

    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `custom-favicon.${ext}`;
    const publicDir = path.resolve(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const filePath = path.resolve(publicDir, filename);
    fs.writeFileSync(filePath, buffer);

    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      try {
        fs.writeFileSync(path.resolve(distDir, filename), buffer);
      } catch {}
    }

    const cacheBustUrl = `/${filename}?t=${Date.now()}`;
    return res.json({ success: true, url: cacheBustUrl });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

async function start() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
