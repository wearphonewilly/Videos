// Capas HTML: títulos en pantalla, subtítulos, etiquetas ancladas a objetos 3D y cierre de marca. Todo determinista (función de t).
import * as THREE from 'three';

const md = (s) => s.replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');

export function setupOverlay(ctx, cfg, timing) {
  const { gsap, tl } = ctx; const $ = ctx.dom;
  // ---- Títulos
  const box = $('titleBox');
  cfg.titles.forEach((T, i) => {
    const wrap = document.createElement('div'); wrap.style.cssText = 'position:absolute;left:0;top:0;display:flex;flex-direction:column;gap:10px;align-items:flex-start;opacity:0';
    const lines = T.lines.map((l) => { const d = document.createElement('div'); d.className = 'tline'; d.innerHTML = md(l); wrap.appendChild(d); return d; });
    box.appendChild(wrap);
    tl.set(wrap, { opacity: 1 }, T.start);
    tl.fromTo(lines, { opacity: 0, y: 40, scale: 0.9, rotate: -1.5 }, { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(1.6)', stagger: 0.13 }, T.start);
    tl.to(lines, { opacity: 0, y: -30, duration: 0.35, ease: 'power2.in', stagger: 0.05 }, T.end - 0.4);
    tl.set(wrap, { opacity: 0 }, T.end + 0.2);
  });
  // ---- Subtítulos
  const subs = $('subs'); let lastIdx = -2;
  ctx.updates.push((t) => {
    let idx = -1; for (let i = 0; i < timing.cues.length; i++) { const c = timing.cues[i]; if (t >= c.start && t < c.end) { idx = i; break; } }
    if (idx !== lastIdx) { subs.innerHTML = idx >= 0 ? timing.cues[idx].html : ''; lastIdx = idx; }
    if (idx >= 0) { const c = timing.cues[idx]; const a = Math.min(1, (t - c.start) / 0.12), b = Math.min(1, (c.end - t) / 0.1); const o = Math.max(0, Math.min(a, b)); subs.style.opacity = o; subs.style.transform = `translateY(${(1 - a) * 14}px) scale(${0.96 + 0.04 * a})`; subs.style.top = (t >= cfg.brand.start - 0.1 ? 1340 : 1215) + 'px'; }
  });
  // ---- Etiquetas 3D
  const labelsEl = $('labels'); const labels = [];
  ctx.labels = {
    add(text, anchor, { offset = [0, 0, 0], start, end, dy = 0, html = null }) {
      const el = document.createElement('div'); el.className = 'lab'; el.innerHTML = html || text; labelsEl.appendChild(el);
      const L = { el, anchor, offset, start, end, dy, v: new THREE.Vector3() }; labels.push(L);
      tl.fromTo(el, { scale: 0.6 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' }, start);
      return L;
    },
  };
  ctx.updates.push((t) => {
    const cam = ctx.stage.camera; cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    for (const L of labels) {
      const a = Math.min(1, Math.max(0, (t - L.start) / 0.25)), b = Math.min(1, Math.max(0, (L.end - t) / 0.3)); const o = Math.min(a, b);
      L.el.style.opacity = o; if (o <= 0) continue;
      L.anchor.getWorldPosition(L.v); L.v.add(new THREE.Vector3(...L.offset)); L.v.project(cam);
      L.el.style.left = ((L.v.x * 0.5 + 0.5) * 1080) + 'px'; L.el.style.top = ((-L.v.y * 0.5 + 0.5) * 1920 + L.dy) + 'px';
    }
  });
  // ---- Cierre de marca
  const b = cfg.brand; $('btag').textContent = b.tagline; $('wm').textContent = b.name; $('wm2').textContent = b.sub;
  const cta = $('bcta'); if (b.cta) { cta.textContent = b.cta; cta.classList.add('on'); } else cta.style.visibility = 'hidden';
  $('bweb').textContent = b.web || '';
  const ls = $('logoslot'); if (b.logoAvailable) { const im = document.createElement('img'); im.src = '/' + b.logo; ls.appendChild(im); $('wm').style.display = 'none'; $('wm2').style.display = 'none'; } else ls.style.display = 'none';
  $('brand').style.paddingBottom = '420px';
  tl.fromTo($('brand'), { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, b.start);
  tl.fromTo(['#wm', '#wm2', '#logoslot'], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12 }, b.start + 0.45);
  tl.fromTo('#bbar', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, b.start + 0.9);
  tl.fromTo(['#btag', '#bcta', '#bweb'], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.12 }, b.start + 1.1);
}
