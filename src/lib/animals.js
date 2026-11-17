// Animales low-poly: vaca, oveja, cerdo. Orientados hacia +z. Cada uno devuelve partes articuladas.
import * as THREE from 'three';
import { C, box, cyl, cone, sph, ico, group, rng } from './kit.js';

export function makeCow(o = {}) {
  const { seed = 1, base = C.cowWhite, patch = C.cowBlack, scale = 1, brown = false } = o;
  const R = rng(seed); const root = group(); const P = { root, kind: 'cow' };
  const body = group({ parent: root, pos: [0, 0, 0] }); P.body = body;
  const patchCol = brown ? '#9a6a4a' : patch;
  box(0.98, 0.92, 1.9, base, { parent: body, pos: [0, 1.14, 0], r: 0.22 });
  box(0.82, 0.55, 0.5, base, { parent: body, pos: [0, 1.08, 0.82], r: 0.15 });
  const nP = 4 + Math.floor(R() * 3);
  for (let i = 0; i < nP; i++) {
    const z = -0.7 + R() * 1.4, side = R() < 0.5 ? -1 : 1, y = 1.1 + (R() - 0.3) * 0.5;
    const w = 0.28 + R() * 0.3, h = 0.25 + R() * 0.3;
    box(0.025, h, w, patchCol, { parent: body, pos: [side * 0.49, y, z], cast: false });
  }
  box(0.5, 0.025, 0.55, patchCol, { parent: body, pos: [(R() - 0.5) * 0.3, 1.6, -0.2 + R() * 0.4], cast: false });
  box(0.22, 0.2, 0.3, C.pink, { parent: body, pos: [0, 0.72, -0.55], r: 0.07 });
  P.legs = [];
  for (const [x, z] of [[-0.3, 0.68], [0.3, 0.68], [-0.3, -0.68], [0.3, -0.68]]) {
    const hip = group({ parent: body, pos: [x, 0.78, z] });
    box(0.22, 0.52, 0.24, base, { parent: hip, pos: [0, -0.2, 0], r: 0.05 });
    const knee = group({ parent: hip, pos: [0, -0.44, 0] });
    box(0.19, 0.38, 0.2, base, { parent: knee, pos: [0, -0.19, 0], r: 0.04 });
    box(0.21, 0.1, 0.23, '#4a4036', { parent: knee, pos: [0, -0.37, 0.01], r: 0.03 });
    P.legs.push({ hip, knee });
  }
  const neck = group({ parent: body, pos: [0, 1.45, 0.88] }); P.neck = neck;
  box(0.5, 0.5, 0.5, base, { parent: neck, pos: [0, -0.05, 0.1], r: 0.12, rot: [0.3, 0, 0] });
  const head = group({ parent: neck, pos: [0, 0.04, 0.34] }); P.head = head;
  box(0.52, 0.5, 0.52, base, { parent: head, pos: [0, 0, 0.1], r: 0.12 });
  box(0.4, 0.3, 0.26, '#f1c9c0', { parent: head, pos: [0, -0.12, 0.42], r: 0.09 });
  box(0.07, 0.07, 0.03, '#a8736b', { parent: head, pos: [-0.09, -0.1, 0.56], cast: false }); box(0.07, 0.07, 0.03, '#a8736b', { parent: head, pos: [0.09, -0.1, 0.56], cast: false });
  box(0.07, 0.09, 0.04, '#1b1d22', { parent: head, pos: [-0.2, 0.07, 0.34], cast: false }); box(0.07, 0.09, 0.04, '#1b1d22', { parent: head, pos: [0.2, 0.07, 0.34], cast: false });
  box(0.3, 0.2, 0.18, patchCol, { parent: head, pos: [0, 0.18, 0.1], r: 0.05, cast: false });
  P.earL = group({ parent: head, pos: [-0.3, 0.15, 0.02] }); P.earR = group({ parent: head, pos: [0.3, 0.15, 0.02] });
  box(0.26, 0.08, 0.16, base, { parent: P.earL, pos: [-0.1, 0, 0], r: 0.03 }); box(0.2, 0.05, 0.1, '#f1c9c0', { parent: P.earL, pos: [-0.1, 0, 0.01], cast: false });
  box(0.26, 0.08, 0.16, base, { parent: P.earR, pos: [0.1, 0, 0], r: 0.03 }); box(0.2, 0.05, 0.1, '#f1c9c0', { parent: P.earR, pos: [0.1, 0, 0.01], cast: false });
  cone(0.05, 0.2, '#efe3c4', { parent: head, pos: [-0.2, 0.34, 0.02], seg: 5, rot: [0, 0, 0.35] }); cone(0.05, 0.2, '#efe3c4', { parent: head, pos: [0.2, 0.34, 0.02], seg: 5, rot: [0, 0, -0.35] });
  P.tail = group({ parent: body, pos: [0, 1.5, -0.95] });
  box(0.07, 0.7, 0.07, base, { parent: P.tail, pos: [0, -0.34, -0.05], r: 0.02 }); box(0.13, 0.2, 0.13, patchCol, { parent: P.tail, pos: [0, -0.74, -0.05], r: 0.04 });
  root.scale.setScalar(scale);
  return P;
}
export function cowIdle(P, t, o = {}) {
  const { graze = 0, ph = 0, look = 0 } = o;
  P.body.scale.set(1, 1 + 0.012 * Math.sin(t * 1.9 + ph), 1);
  P.body.position.y = 0; P.body.rotation.z = 0;
  P.head.rotation.set(0.1 * Math.sin(t * 0.8 + ph) + graze * 0.55, look + 0.12 * Math.sin(t * 0.55 + ph), 0.05 * Math.sin(t * 0.7 + ph));
  P.neck.rotation.x = graze * 0.3;
  const flick = Math.max(0, Math.sin(t * 0.9 + ph * 3)); P.earL.rotation.z = 0.1 + 0.35 * flick * flick * Math.sin(t * 18); P.earR.rotation.z = -0.1;
  P.tail.rotation.set(0.15 * Math.sin(t * 1.7 + ph), 0, 0.25 * Math.sin(t * 2.3 + ph));
  for (const l of P.legs) { l.hip.rotation.x = 0; l.knee.rotation.x = 0; }
}
export function cowWalk(P, phase) {
  const s = Math.sin(phase), c = Math.cos(phase);
  P.legs.forEach((l, i) => { const sg = (i === 0 || i === 3) ? 1 : -1; l.hip.rotation.x = -0.45 * s * sg; l.knee.rotation.x = 0.55 * Math.max(0, c * sg); });
  P.body.position.y = 0.025 * Math.abs(Math.cos(phase)); P.body.rotation.z = 0.02 * s;
  P.head.rotation.set(0.05 + 0.06 * s, 0, 0); P.tail.rotation.z = 0.3 * s;
}

export function makeSheep(o = {}) {
  const { seed = 3, scale = 1 } = o; const R = rng(seed); const root = group(); const P = { root, kind: 'sheep' };
  const body = group({ parent: root }); P.body = body;
  ico(0.5, C.wool, { parent: body, pos: [0, 0.75, 0], scale: [1, 0.9, 1.3], detail: 1 });
  for (let i = 0; i < 5; i++) ico(0.25, C.wool, { parent: body, pos: [(R() - 0.5) * 0.5, 0.95 + R() * 0.1, (R() - 0.5) * 0.9], detail: 1 });
  const head = group({ parent: body, pos: [0, 0.85, 0.62] }); P.head = head;
  box(0.28, 0.3, 0.32, '#3d3a38', { parent: head, pos: [0, 0, 0.1], r: 0.08 });
  box(0.05, 0.06, 0.03, '#fff', { parent: head, pos: [-0.09, 0.05, 0.27], cast: false }); box(0.05, 0.06, 0.03, '#fff', { parent: head, pos: [0.09, 0.05, 0.27], cast: false });
  box(0.2, 0.05, 0.1, '#3d3a38', { parent: head, pos: [-0.2, 0.05, 0.02], rot: [0, 0, 0.3] }); box(0.2, 0.05, 0.1, '#3d3a38', { parent: head, pos: [0.2, 0.05, 0.02], rot: [0, 0, -0.3] });
  ico(0.17, C.wool, { parent: head, pos: [0, 0.2, 0.0] });
  P.legs = [];
  for (const [x, z] of [[-0.2, 0.3], [0.2, 0.3], [-0.2, -0.3], [0.2, -0.3]]) { const hip = group({ parent: body, pos: [x, 0.45, z] }); box(0.11, 0.45, 0.11, '#3d3a38', { parent: hip, pos: [0, -0.2, 0], r: 0.03 }); P.legs.push({ hip }); }
  root.scale.setScalar(scale); return P;
}
export function sheepIdle(P, t, ph = 0, graze = 0) { P.body.scale.y = 1 + 0.015 * Math.sin(t * 2 + ph); P.head.rotation.x = 0.1 * Math.sin(t * 0.9 + ph) + graze * 0.6; }

export function makePig(o = {}) {
  const { scale = 1 } = o; const root = group(); const P = { root, kind: 'pig' }; const body = group({ parent: root }); P.body = body;
  box(0.75, 0.62, 1.2, C.pink, { parent: body, pos: [0, 0.55, 0], r: 0.2 });
  const head = group({ parent: body, pos: [0, 0.65, 0.62] }); P.head = head;
  box(0.46, 0.44, 0.4, C.pink, { parent: head, r: 0.12, pos: [0, 0, 0.1] }); box(0.26, 0.2, 0.12, C.pinkDark, { parent: head, pos: [0, -0.06, 0.34], r: 0.05 });
  box(0.05, 0.06, 0.03, '#222', { parent: head, pos: [-0.14, 0.08, 0.3], cast: false }); box(0.05, 0.06, 0.03, '#222', { parent: head, pos: [0.14, 0.08, 0.3], cast: false });
  cone(0.1, 0.14, C.pinkDark, { parent: head, pos: [-0.17, 0.27, 0.05], seg: 4, rot: [0.4, 0, 0.3] }); cone(0.1, 0.14, C.pinkDark, { parent: head, pos: [0.17, 0.27, 0.05], seg: 4, rot: [0.4, 0, -0.3] });
  P.tail = group({ parent: body, pos: [0, 0.7, -0.62] }); cyl(0.025, 0.025, 0.22, C.pinkDark, { parent: P.tail, pos: [0, 0.08, -0.04], rot: [0.7, 0, 0], seg: 5 });
  for (const [x, z] of [[-0.24, 0.4], [0.24, 0.4], [-0.24, -0.4], [0.24, -0.4]]) box(0.14, 0.3, 0.14, C.pinkDark, { parent: body, pos: [x, 0.15, z], r: 0.04 });
  root.scale.setScalar(scale); return P;
}
export function pigIdle(P, t, ph = 0, graze = 0) { P.body.scale.y = 1 + 0.02 * Math.sin(t * 2.3 + ph); P.head.rotation.x = 0.08 * Math.sin(t * 1.1 + ph) + graze * 0.5; P.tail.rotation.z = 0.4 * Math.sin(t * 3 + ph); }
