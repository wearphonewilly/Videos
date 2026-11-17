// Props de entorno reutilizables: losa diorama, granero, silo, vallas, árboles, pacas, nubes, edificios, señales.
import * as THREE from 'three';
import { C, box, cyl, cone, ico, sph, prism, group, rng, mat } from './kit.js';

/** Losa tipo diorama: césped superior + capas de tierra. x0..x1, z0..z1, top en y=0. */
export function slab(x0, x1, z0, z1, o = {}) {
  const { top = C.grass, depth = 1.6, parent } = o; const g = group({ parent });
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  box(w, 0.5, d, top, { parent: g, pos: [cx, -0.25, cz], r: 0.12 });
  box(w - 0.1, depth * 0.45, d - 0.1, C.soil, { parent: g, pos: [cx, -0.5 - depth * 0.225, cz], r: 0.1 });
  box(w - 0.5, depth * 0.45, d - 0.5, C.soil2, { parent: g, pos: [cx, -0.5 - depth * 0.675, cz], r: 0.1 });
  box(w - 1.3, depth * 0.35, d - 1.3, '#5f4636', { parent: g, pos: [cx, -0.5 - depth * 1.0, cz], r: 0.1 });
  return g;
}
export function patch(w, d, color, o = {}) { return box(w, 0.06, d, color, { pos: [o.x || 0, o.y ?? 0.02, o.z || 0], r: 0.02, parent: o.parent, rot: o.rot, receive: true, cast: false }); }

export function tree(o = {}) {
  const { seed = 1, h = 3.2, kind = 'round' } = o; const R = rng(seed); const g = group({ pos: o.pos || [0, 0, 0] });
  cyl(0.16, 0.22, h * 0.45, C.trunk, { parent: g, pos: [0, h * 0.225, 0], seg: 6 });
  if (kind === 'pine') { for (let i = 0; i < 3; i++) cone(1.15 - i * 0.28, 1.4, i % 2 ? C.leaf2 : C.leaf, { parent: g, pos: [0, h * 0.5 + i * 0.85, 0], seg: 6 }); }
  else { ico(1.2, C.leaf, { parent: g, pos: [0, h * 0.7, 0], scale: [1, 0.95, 1] }); ico(0.85, C.leaf2, { parent: g, pos: [0.55 * (R() - 0.3), h * 0.7 + 0.8, 0.4 * (R() - 0.5)] }); }
  g.rotation.y = R() * 6; if (o.parent) o.parent.add(g); const s = o.scale || 1; g.scale.setScalar(s); return g;
}
export function bush(o = {}) { const g = group({ pos: o.pos || [0, 0, 0] }); ico(0.5, C.leaf2, { parent: g, pos: [0, 0.35, 0], scale: [1.2, 0.8, 1] }); ico(0.35, C.leaf, { parent: g, pos: [0.4, 0.28, 0.1] }); if (o.parent) o.parent.add(g); return g; }
export function rock(o = {}) { const g = group({ pos: o.pos || [0, 0, 0] }); ico(0.45 * (o.s || 1), C.rock, { parent: g, pos: [0, 0.2, 0], scale: [1.2, 0.7, 1], detail: 0 }); if (o.parent) o.parent.add(g); return g; }
export function flowers(parent, cx, cz, n = 10, seed = 5, spread = 3) {
  const R = rng(seed); for (let i = 0; i < n; i++) { const x = cx + (R() - 0.5) * spread, z = cz + (R() - 0.5) * spread; const col = ['#ffffff', '#f6d86a', '#f4a6b8'][i % 3]; box(0.06, 0.2, 0.06, C.leaf2, { parent, pos: [x, 0.1, z], cast: false }); ico(0.09, col, { parent, pos: [x, 0.24, z], detail: 0, cast: false }); }
}
export function hayBale(o = {}) { const g = group({ pos: o.pos || [0, 0, 0], rot: o.rot }); cyl(0.55, 0.55, 0.9, C.hay, { parent: g, pos: [0, 0.55, 0], rot: [0, 0, Math.PI / 2], seg: 10 }); cyl(0.56, 0.56, 0.05, '#caa545', { parent: g, pos: [0, 0.55, 0], rot: [0, 0, Math.PI / 2], seg: 10, cast: false, scale: [1, 1.05, 1] }); if (o.parent) o.parent.add(g); return g; }
export function crate(o = {}) { const g = group({ pos: o.pos || [0, 0, 0], rot: o.rot }); const s = o.s || 0.9; box(s, s, s, C.wood, { parent: g, pos: [0, s / 2, 0], r: 0.04 }); box(s + 0.02, 0.08, s + 0.02, C.woodDark, { parent: g, pos: [0, s * 0.2, 0] }); box(s + 0.02, 0.08, s + 0.02, C.woodDark, { parent: g, pos: [0, s * 0.8, 0] }); if (o.parent) o.parent.add(g); return g; }
export function trough(o = {}) { const g = group({ pos: o.pos || [0, 0, 0], rot: o.rot }); box(2.2, 0.5, 0.7, C.concrete2, { parent: g, pos: [0, 0.25, 0], r: 0.06 }); box(2.0, 0.05, 0.5, '#7fb8d9', { parent: g, pos: [0, 0.5, 0], cast: false, m: { rough: 0.2 } }); if (o.parent) o.parent.add(g); return g; }
export function cone_(o = {}) { const g = group({ pos: o.pos || [0, 0, 0] }); box(0.5, 0.06, 0.5, C.dark, { parent: g, pos: [0, 0.03, 0] }); cone(0.2, 0.6, C.orange, { parent: g, pos: [0, 0.36, 0], seg: 8 }); cyl(0.14, 0.15, 0.1, '#fff', { parent: g, pos: [0, 0.34, 0], seg: 8 }); if (o.parent) o.parent.add(g); return g; }

/** Valla recta entre dos puntos (plano XZ). */
export function fence(parent, x0, z0, x1, z1, o = {}) {
  const { h = 1.0, col = C.wood, gap = 1.6 } = o; const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz); const n = Math.max(1, Math.round(len / gap));
  const g = group({ parent, pos: [x0, 0, z0] }); g.rotation.y = Math.atan2(-dz, dx);
  for (let i = 0; i <= n; i++) box(0.12, h, 0.12, C.woodDark, { parent: g, pos: [i * len / n, h / 2, 0] });
  for (const y of [h * 0.45, h * 0.85]) box(len, 0.08, 0.07, col, { parent: g, pos: [len / 2, y, 0] });
  return g;
}
export function fenceLoop(parent, pts, o = {}) { for (let i = 0; i < pts.length - 1; i++) fence(parent, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], o); }
/** Valla metálica de manga/embarcadero (azul-gris). */
export function chute(parent, x0, x1, z, o = {}) {
  const g = group({ parent, pos: [0, 0, z] }); const len = x1 - x0;
  for (let i = 0; i <= 6; i++) box(0.1, 1.5, 0.1, C.steel, { parent: g, pos: [x0 + i * len / 6, 0.75, 0] });
  for (const y of [0.35, 0.7, 1.05, 1.4]) box(len, 0.07, 0.06, C.mist, { parent: g, pos: [(x0 + x1) / 2, y, 0], m: { metal: 0.2 } });
  return g;
}

export function barn(o = {}) {
  const g = group({ pos: o.pos || [0, 0, 0], rot: o.rot });
  const w = 6.5, d = 8, h = 3.6;
  box(w, h, d, C.barn, { parent: g, pos: [0, h / 2, 0], r: 0.06 });
  prism(w + 0.7, 2.4, d + 0.7, C.barnDark, { parent: g, pos: [0, h, 0] });
  prism(w - 0.9, 1.6, 0.08, '#8e3f30', { parent: g, pos: [0, h + 0.1, d / 2 + 0.38] }); // frontón
  box(2.8, 2.6, 0.12, '#f4ece1', { parent: g, pos: [0, 1.3, d / 2 + 0.02] }); box(0.14, 2.6, 0.16, C.barnDark, { parent: g, pos: [0, 1.3, d / 2 + 0.06] });
  for (const s of [-1, 1]) { const a = Math.atan2(2.6, 1.4); box(0.12, 3.0, 0.14, '#e0d4c3', { parent: g, pos: [s * 0.7, 1.3, d / 2 + 0.08], rot: [0, 0, s * a - s * 0.0 ] , cast: false }); }
  box(1.0, 1.0, 0.12, '#f4ece1', { parent: g, pos: [0, h + 0.9, d / 2 + 0.38], r: 0.04 }); box(0.8, 0.8, 0.14, C.glass, { parent: g, pos: [0, h + 0.9, d / 2 + 0.4], cast: false });
  box(w + 0.1, 0.12, 0.12, '#f4ece1', { parent: g, pos: [0, 0.06, d / 2 + 0.03] });
  if (o.parent) o.parent.add(g); return g;
}
export function silo(o = {}) { const g = group({ pos: o.pos || [0, 0, 0] }); cyl(1.4, 1.4, 6, C.concrete, { parent: g, pos: [0, 3, 0], seg: 10 }); for (const y of [1.5, 3, 4.5]) cyl(1.43, 1.43, 0.12, C.steel, { parent: g, pos: [0, y, 0], seg: 10 }); cone(1.5, 1.3, C.blue, { parent: g, pos: [0, 6.6, 0], seg: 10 }); if (o.parent) o.parent.add(g); return g; }

export function building(o = {}) {
  const { w = 8, d = 6, h = 3.4, wall = C.white, roof = C.navy, sign = true } = o; const g = group({ pos: o.pos || [0, 0, 0], rot: o.rot });
  box(w, h, d, wall, { parent: g, pos: [0, h / 2, 0], r: 0.08 });
  box(w + 0.6, 0.35, d + 0.6, roof, { parent: g, pos: [0, h + 0.17, 0], r: 0.06 });
  box(w - 0.4, 0.15, d - 0.4, C.steel, { parent: g, pos: [0, h + 0.42, 0], r: 0.05 });
  const nW = Math.floor(w / 2.2);
  for (let i = 0; i < nW; i++) { const x = -w / 2 + (i + 0.5) * (w / nW); box(1.1, 1.2, 0.1, C.glass, { parent: g, pos: [x, h * 0.58, d / 2 + 0.02], cast: false, m: { rough: 0.2 } }); box(1.3, 0.1, 0.14, C.mist, { parent: g, pos: [x, h * 0.58 - 0.66, d / 2 + 0.05], cast: false }); }
  box(1.4, 2.1, 0.12, C.blue, { parent: g, pos: [w / 2 - 1.2, 1.05, d / 2 + 0.03], r: 0.03 });
  box(w, 0.25, 0.12, C.green, { parent: g, pos: [0, 0.95, d / 2 + 0.04], cast: false });
  if (o.parent) o.parent.add(g); return g;
}
export function lamp(o = {}) { const g = group({ pos: o.pos || [0, 0, 0] }); cyl(0.07, 0.09, 4, C.steel, { parent: g, pos: [0, 2, 0], seg: 6 }); box(0.9, 0.12, 0.3, C.steel, { parent: g, pos: [0.4, 4, 0] }); box(0.4, 0.1, 0.26, '#fff6d8', { parent: g, pos: [0.65, 3.93, 0], m: { emissive: '#fff0c0', ei: 0.6 }, cast: false }); if (o.parent) o.parent.add(g); return g; }
export function signPost(o = {}) { const g = group({ pos: o.pos || [0, 0, 0], rot: o.rot }); cyl(0.05, 0.05, 2.6, C.steel, { parent: g, pos: [0, 1.3, 0], seg: 5 }); box(1.0, 0.7, 0.07, o.col || C.blue, { parent: g, pos: [0, 2.5, 0], r: 0.04 }); box(0.8, 0.12, 0.08, '#fff', { parent: g, pos: [0, 2.5, 0.01], cast: false }); if (o.parent) o.parent.add(g); return g; }
export function pole(o = {}) { const g = group({ pos: o.pos || [0, 0, 0] }); cyl(0.09, 0.11, 6, C.woodDark, { parent: g, pos: [0, 3, 0], seg: 6 }); box(2.0, 0.1, 0.1, C.woodDark, { parent: g, pos: [0, 5.6, 0] }); box(1.2, 0.08, 0.1, C.woodDark, { parent: g, pos: [0, 5.0, 0] }); if (o.parent) o.parent.add(g); return g; }
export function guardrail(parent, x0, x1, z) { const n = Math.round((x1 - x0) / 2.5); for (let i = 0; i <= n; i++) box(0.08, 0.7, 0.08, C.steel, { parent, pos: [x0 + i * (x1 - x0) / n, 0.35, z], cast: false }); box(x1 - x0, 0.25, 0.05, C.concrete, { parent, pos: [(x0 + x1) / 2, 0.62, z] }); }

/** Carretera a lo largo de +x en z=0. */
export function road(parent, x0, x1, o = {}) {
  const w = o.w || 5.6; const g = group({ parent }); const len = x1 - x0, cx = (x0 + x1) / 2;
  box(len, 0.1, w + 1.0, C.concrete2, { parent: g, pos: [cx, 0.03, 0], r: 0.03, cast: false });
  box(len, 0.12, w, C.asphalt, { parent: g, pos: [cx, 0.06, 0], r: 0.02, cast: false });
  for (const s of [-1, 1]) box(len, 0.13, 0.12, C.line, { parent: g, pos: [cx, 0.07, s * (w / 2 - 0.35)], cast: false });
  for (let x = x0 + 2; x < x1 - 2; x += 5) box(2.4, 0.14, 0.14, C.yellow, { parent: g, pos: [x, 0.07, 0], cast: false });
  return g;
}
export function cloud(o = {}) {
  const g = group({ pos: o.pos || [0, 0, 0] }); const R = rng(o.seed || 1);
  const m = mat('#ffffff', { rough: 1 });
  for (let i = 0; i < 5; i++) { const s = 1.4 + R() * 1.2; const b = ico(s, m, { parent: g, pos: [(i - 2) * 1.6 + R(), R() * 0.5, (R() - 0.5) * 1.2], detail: 1, cast: false }); b.scale.y = 0.7; b.receiveShadow = false; }
  if (o.parent) o.parent.add(g); return g;
}

/** Insignia flotante: disco navy + icono 3D. kind: temp | space | clock | shield | check | heart */
export function badge(kind, o = {}) {
  const g = group({ parent: o.parent }); const inner = group({ parent: g }); g.userData.inner = inner;
  cyl(1.05, 1.05, 0.25, C.navy, { parent: inner, rot: [Math.PI / 2, 0, 0], seg: 24, pos: [0, 0, -0.1] });
  cyl(1.12, 1.12, 0.1, C.white, { parent: inner, rot: [Math.PI / 2, 0, 0], seg: 24, pos: [0, 0, -0.2] });
  const f = group({ parent: inner, pos: [0, 0, 0.12] });
  if (kind === 'temp') {
    cyl(0.14, 0.14, 1.2, C.white, { parent: f, pos: [0, 0.15, 0], seg: 10, m: { rough: 0.3 } });
    cyl(0.07, 0.07, 0.9, C.red, { parent: f, pos: [0, 0.0, 0.0], seg: 8, m: { emissive: '#ff5050', ei: 0.4 } });
    sph(0.3, C.white, { parent: f, pos: [0, -0.5, 0], seg: 10 }); sph(0.22, C.red, { parent: f, pos: [0, -0.5, 0.02], seg: 10, m: { emissive: '#ff5050', ei: 0.4 } });
    for (let i = 0; i < 4; i++) box(0.2, 0.04, 0.04, C.steel, { parent: f, pos: [0.26, 0.05 + i * 0.22, 0], cast: false });
  }
  if (kind === 'space') {
    for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { box(0.5, 0.12, 0.12, C.green, { parent: f, pos: [sx * 0.55, sy * 0.62, 0], r: 0.03 }); box(0.12, 0.5, 0.12, C.green, { parent: f, pos: [sx * 0.74, sy * 0.43, 0], r: 0.03 }); }
    box(0.7, 0.45, 0.14, C.white, { parent: f, pos: [0, 0, 0], r: 0.06 }); box(0.3, 0.3, 0.16, C.cowBlack, { parent: f, pos: [-0.1, 0.0, 0], r: 0.04 }); box(0.2, 0.22, 0.16, C.cowBlack, { parent: f, pos: [0.22, 0.04, 0], r: 0.04 });
  }
  if (kind === 'clock') {
    cyl(0.78, 0.78, 0.14, C.white, { parent: f, rot: [Math.PI / 2, 0, 0], seg: 20 });
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; box(0.05, i % 3 ? 0.1 : 0.17, 0.05, C.navy, { parent: f, pos: [Math.sin(a) * 0.64, Math.cos(a) * 0.64, 0.09], rot: [0, 0, -a], cast: false }); }
    const hm = group({ parent: f, pos: [0, 0, 0.12] }), hh = group({ parent: f, pos: [0, 0, 0.14] });
    box(0.06, 0.52, 0.04, C.navy, { parent: hm, pos: [0, 0.24, 0], r: 0.01 }); box(0.07, 0.36, 0.04, C.green, { parent: hh, pos: [0, 0.16, 0], r: 0.01 });
    sph(0.07, C.navy, { parent: f, pos: [0, 0, 0.16], seg: 6 }); g.userData.hands = [hm, hh];
  }
  if (kind === 'shield' || kind === 'check') {
    const s = new THREE.Shape(); s.moveTo(0, 0.85); s.lineTo(0.7, 0.62); s.lineTo(0.7, 0.0); s.quadraticCurveTo(0.65, -0.55, 0, -0.85); s.quadraticCurveTo(-0.65, -0.55, -0.7, 0.0); s.lineTo(-0.7, 0.62); s.closePath();
    const e = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1, curveSegments: 5 }), mat(C.green)); e.position.z = -0.1; e.castShadow = true; f.add(e);
    box(0.42, 0.14, 0.12, C.white, { parent: f, pos: [-0.14, -0.05, 0.2], rot: [0, 0, -0.78], r: 0.04 }); box(0.8, 0.14, 0.12, C.white, { parent: f, pos: [0.18, 0.1, 0.2], rot: [0, 0, 0.78], r: 0.04 });
  }
  if (kind === 'heart') {
    const s = new THREE.Shape(); s.moveTo(0, -0.6); s.bezierCurveTo(-1.0, 0.1, -0.6, 0.8, 0, 0.35); s.bezierCurveTo(0.6, 0.8, 1.0, 0.1, 0, -0.6);
    const e = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 1, curveSegments: 6 }), mat('#ef6a7a')); e.position.z = -0.1; f.add(e);
  }
  if (o.parent) o.parent.add(g); return g;
}
export function checkMark(o = {}) { const g = group({ parent: o.parent }); const m = mat(C.green, { emissive: '#2ee89a', ei: 0.35 }); cyl(0.45, 0.45, 0.14, C.white, { parent: g, rot: [Math.PI / 2, 0, 0], seg: 16 }); box(0.2, 0.07, 0.1, m, { parent: g, pos: [-0.1, -0.05, 0.1], rot: [0, 0, -0.78], r: 0.02 }); box(0.4, 0.07, 0.1, m, { parent: g, pos: [0.07, 0.04, 0.1], rot: [0, 0, 0.78], r: 0.02 }); return g; }
export function magnifier(o = {}) { const g = group({ parent: o.parent }); torus(0.45, 0.07, C.navy, g); return g; }
function torus(R, r, col, parent) { const t = new THREE.Mesh(new THREE.TorusGeometry(R, r, 6, 20), mat(col)); t.castShadow = true; parent.add(t); cyl(0.4, 0.4, 0.04, C.glass, { parent, rot: [Math.PI / 2, 0, 0], seg: 18, m: { opacity: 0.45, rough: 0.2 }, cast: false }); box(0.1, 0.55, 0.1, C.navy, { parent, pos: [0.45, -0.55, 0], rot: [0, 0, -0.78], r: 0.03 }); }
