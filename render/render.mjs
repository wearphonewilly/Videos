// Renderizado determinista fotograma a fotograma con Chromium (WebGL por software) en varios procesos.
// Uso: node render/render.mjs [--project transporte] [--workers 3] [--out render/_frames] [--scale 1] [--from 0] [--to N] [--debug]
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs';
import { fileURLToPath } from 'node:url'; import { serve } from './serve.mjs';
const require = createRequire('/usr/local/lib/node_modules_global/'); const { chromium } = require('playwright');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const proj = arg('project', 'transporte'); const workers = +arg('workers', 3); const scale = +arg('scale', 1);
const out = path.resolve(arg('out', path.join(root, 'render/_frames'))); fs.mkdirSync(out, { recursive: true });
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'projects', proj, 'config.json'), 'utf8'));
const W = Math.round(cfg.width * scale), H = Math.round(cfg.height * scale); const total = Math.round(cfg.duration * cfg.fps);
const from = +arg('from', 0), to = Math.min(total, +arg('to', total)); const step = +arg('step', 1);
const { srv, port } = await serve(0);
const todo = []; for (let i = from; i < to; i += step) if (!fs.existsSync(path.join(out, String(i).padStart(5, '0') + '.jpg'))) todo.push(i);
console.log(`Renderizando ${todo.length} fotogramas a ${W}x${H} con ${workers} procesos...`);
const chunk = Math.ceil(todo.length / workers); const t0 = Date.now(); let done = 0;
async function worker(list, id) {
  if (!list.length) return;
  const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-dev-shm-usage'] });
  const pg = await br.newPage({ viewport: { width: W, height: H } });
  pg.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await pg.goto(`http://localhost:${port}/?project=${proj}&w=${W}&h=${H}${arg('debug') !== undefined ? '&debug=1' : ''}`);
  await pg.waitForFunction('window.__ready===true', null, { timeout: 180000 }); await pg.evaluate('document.fonts.ready');
  await pg.evaluate((s) => window.renderFrame(0), 0); // arranque en 0 para que GSAP resuelva valores iniciales en orden
  for (const i of list) {
    await pg.evaluate((t) => window.renderFrame(t), i / cfg.fps);
    await pg.screenshot({ path: path.join(out, String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 96 });
    done++; if (done % 30 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${todo.length}  ${(done / el).toFixed(2)} fps  ETA ${((todo.length - done) / (done / el) / 60).toFixed(1)} min`); }
  }
  await br.close();
}
const lists = Array.from({ length: workers }, (_, k) => todo.slice(k * chunk, (k + 1) * chunk));
await Promise.all(lists.map((l, k) => worker(l, k)));
srv.close(); console.log('Fotogramas listos en', out, ((Date.now() - t0) / 60000).toFixed(1), 'min');
