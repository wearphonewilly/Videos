// Calcula tiempos de palabras y subtítulos a partir del guion + duraciones medidas de la locución.
// Uso: node tools/make_timing.mjs projects/transporte/config.json
import fs from 'node:fs';
import path from 'node:path';
const cfgPath = process.argv[2] || 'projects/transporte/config.json';
const root = path.resolve(path.dirname(cfgPath), '../..');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const guion = JSON.parse(fs.readFileSync(path.join(root, 'script/guion.json'), 'utf8'));
const dur = JSON.parse(fs.readFileSync(path.join(root, 'script/durations.json'), 'utf8'));
const strip = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const cues = []; const words = [];
for (const l of guion.lines) {
  const t0 = cfg.voice[l.id], d = dur[l.id]; const ws = l.text.split(/\s+/);
  const weights = ws.map((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length + (/[,.;:?!]$/.test(w) ? 2.5 : 0) + 1.2);
  const S = weights.reduce((a, b) => a + b, 0); let acc = 0; const wt = [];
  ws.forEach((w, i) => { const a = t0 + 0.05 + (d - 0.1) * acc / S; acc += weights[i]; const b = t0 + 0.05 + (d - 0.1) * acc / S; wt.push({ w, start: a, end: b }); });
  words.push(...wt.map((x) => ({ ...x, line: l.id })));
  // agrupar en subtítulos (máx. ~38 caracteres, 2 líneas)
  let cur = [];
  const flush = () => { if (!cur.length) return; cues.push({ line: l.id, start: cur[0].start - 0.04, endWord: cur[cur.length - 1].end, words: cur }); cur = []; };
  for (const x of wt) {
    const len = [...cur, x].map((y) => y.w).join(' ').length;
    if (len > 40) flush();
    cur.push(x);
    if (/[.?!]$/.test(x.w) || (/[,;]$/.test(x.w) && cur.length >= 3)) flush();
  }
  flush();
}
cues.forEach((c, i) => { const next = cues[i + 1]; c.end = next && next.line === c.line ? next.start : c.endWord + 0.45; });
const hlSet = Object.fromEntries(guion.lines.map((l) => [l.id, new Set(l.hl.map(strip))]));
for (const c of cues) c.html = c.words.map((x) => (hlSet[c.line].has(strip(x.w)) ? `<span class="hl">${x.w}</span>` : x.w)).join(' ');
const out = { cues: cues.map(({ start, end, html, line, words: w }) => ({ line, start: +start.toFixed(3), end: +end.toFixed(3), html, text: w.map((x) => x.w).join(' ') })), words };
fs.writeFileSync(path.join(root, 'script/timing.json'), JSON.stringify(out, null, 1));
const f = (s) => { const ms = Math.round(s * 1000); const p = (n, k = 2) => String(n).padStart(k, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
fs.mkdirSync(path.join(root, 'output'), { recursive: true });
fs.writeFileSync(path.join(root, 'output/subtitulos.srt'), out.cues.map((c, i) => `${i + 1}\n${f(c.start)} --> ${f(c.end)}\n${c.text}\n`).join('\n'));
console.log(out.cues.map((c) => `${c.start.toFixed(2)}-${c.end.toFixed(2)} ${c.text}`).join('\n'));
