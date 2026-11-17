// Captura de fotogramas sueltos: node render/frames.mjs <proyecto> <w> <h> t1 t2 ...  -> /tmp/.../shots/f_<t>.png
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs'; import { serve } from './serve.mjs';
const require = createRequire('/usr/local/lib/node_modules_global/'); const { chromium } = require('playwright');
const [proj, w, h, outDir, ...ts] = process.argv.slice(2); fs.mkdirSync(outDir, { recursive: true });
const { srv, port } = await serve(0);
const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const pg = await br.newPage({ viewport: { width: +w, height: +h } });
pg.on('console', (m) => { const t = m.text(); if (!/GPU stall|swiftshader/i.test(t)) console.log('[page]', t.slice(0, 300)); }); pg.on('pageerror', (e) => console.log('[pageerror]', e.message));
await pg.goto(`http://localhost:${port}/?project=${proj}&w=${w}&h=${h}${process.env.DEBUG ? '&debug=1' : ''}`);
await pg.waitForFunction('window.__ready===true', null, { timeout: 120000 });
for (const t of ts) { const t0 = Date.now(); await pg.evaluate((t) => window.renderFrame(+t), t); await pg.screenshot({ path: path.join(outDir, `f_${String(t).padStart(5, '0')}.png`) }); console.log('t=', t, Date.now() - t0, 'ms'); }
await br.close(); srv.close();
