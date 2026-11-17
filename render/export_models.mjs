// Exporta los modelos procedurales a GLB (models/*.glb) para reutilizarlos en Blender u otros motores.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { serve } from './serve.mjs';
const require = createRequire('/usr/local/lib/node_modules_global/'); const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); const outDir = path.join(root, 'models'); fs.mkdirSync(outDir, { recursive: true });
const { srv, port } = await serve(0);
const br = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const pg = await br.newPage();
pg.on('pageerror', (e) => console.log('[pageerror]', e.message));
await pg.goto(`http://localhost:${port}/export.html`); await pg.waitForFunction('window.__ready===true');
for (const n of await pg.evaluate('window.modelNames')) { const b64 = await pg.evaluate((n) => window.exportModel(n), n); if (b64.startsWith('ERR')) { console.log(n, b64); continue; } fs.writeFileSync(path.join(outDir, n + '.glb'), Buffer.from(b64, 'base64')); console.log('models/' + n + '.glb'); }
await br.close(); srv.close();
