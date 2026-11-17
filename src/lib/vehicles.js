// Camión ganadero con carrocería de listones, techo "rayos X", rampa trasera y ruedas. Avanza hacia +x.
import * as THREE from 'three';
import { C, box, cyl, group, mat, uniqueMat } from './kit.js';

export function makeTruck() {
  const root = group(); const T = { root, wheels: [] };
  const body = group({ parent: root }); T.body = body;
  box(10.6, 0.3, 2.1, '#2e343d', { parent: body, pos: [-0.3, 0.85, 0], r: 0.05 });
  box(10.2, 0.18, 2.5, C.concrete2, { parent: body, pos: [-0.5, 1.1, 0], r: 0.04 });
  const cab = group({ parent: body, pos: [4.2, 0, 0] }); T.cab = cab;
  box(2.3, 1.35, 2.4, C.navy, { parent: cab, pos: [0, 1.75, 0], r: 0.18 });
  box(2.25, 1.35, 2.38, C.white, { parent: cab, pos: [0.0, 3.0, 0], r: 0.2 });
  box(0.04, 1.0, 2.1, C.glass, { parent: cab, pos: [1.12, 2.95, 0], cast: false, m: { rough: 0.2 } });
  box(1.2, 0.95, 0.04, C.glass, { parent: cab, pos: [0.15, 2.95, 1.2], cast: false }); box(1.2, 0.95, 0.04, C.glass, { parent: cab, pos: [0.15, 2.95, -1.2], cast: false });
  box(1.6, 0.35, 2.0, C.white, { parent: cab, pos: [-0.2, 3.85, 0], r: 0.12 });
  box(0.12, 0.7, 2.2, '#2e343d', { parent: cab, pos: [1.2, 1.35, 0], r: 0.04 });
  for (const z of [-0.8, 0.8]) box(0.06, 0.2, 0.4, C.yellow, { parent: cab, pos: [1.17, 1.78, z], m: { emissive: '#ffd27a', ei: 0.8 }, cast: false });
  for (let i = 0; i < 3; i++) box(0.04, 0.07, 1.3, '#aab4be', { parent: cab, pos: [1.17, 2.05 + i * 0.12, 0], cast: false });
  box(0.14, 0.55, 0.1, '#2e343d', { parent: cab, pos: [1.0, 3.0, 1.35], r: 0.03 }); box(0.14, 0.55, 0.1, '#2e343d', { parent: cab, pos: [1.0, 3.0, -1.35], r: 0.03 });
  box(2.32, 0.1, 2.42, C.green, { parent: cab, pos: [0, 2.28, 0], cast: false });
  const box_ = group({ parent: body, pos: [-1.5, 0, 0] }); T.box = box_;
  const L = 7.9, W = 2.5;
  box(L, 0.09, W, C.concrete, { parent: box_, pos: [0, 1.24, 0] });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) box(L, 0.13, 0.07, C.white, { parent: box_, pos: [0, 1.55 + i * 0.4, s * (W / 2)], r: 0.02 });
    for (let k = 0; k <= 8; k++) box(0.1, 2.2, 0.1, C.steel, { parent: box_, pos: [-L / 2 + k * (L / 8), 2.35, s * (W / 2)], r: 0.02 });
    box(L, 0.1, 0.14, C.navy, { parent: box_, pos: [0, 1.3, s * (W / 2)], r: 0.02 });
    box(L, 0.1, 0.12, C.navy, { parent: box_, pos: [0, 3.45, s * (W / 2)], r: 0.02 });
  }
  box(0.1, 2.2, W, C.white, { parent: box_, pos: [L / 2, 2.35, 0], r: 0.03 });
  box(0.1, 0.9, W - 0.2, C.blue, { parent: box_, pos: [L / 2 + 0.03, 2.0, 0], cast: false });
  for (const s of [-1, 1]) box(0.1, 2.2, 0.12, C.steel, { parent: box_, pos: [-L / 2, 2.35, s * (W / 2)], r: 0.02 });
  const roofMat = uniqueMat(C.white); roofMat.transparent = true; T.roofMat = roofMat;
  T.roof = group({ parent: box_, pos: [0, 3.5, 0] });
  box(L + 0.1, 0.09, W + 0.1, roofMat, { parent: T.roof, r: 0.03 });
  T.ramp = group({ parent: box_, pos: [-L / 2 - 0.05, 1.28, 0], rot: [0, 0, -Math.PI / 2] });
  box(3.0, 0.09, W - 0.1, C.concrete, { parent: T.ramp, pos: [-1.5, 0, 0] });
  for (let i = 0; i < 6; i++) box(0.07, 0.05, W - 0.15, C.steel, { parent: T.ramp, pos: [-0.35 - i * 0.5, 0.07, 0], cast: false });
  for (const s of [-1, 1]) box(3.0, 0.3, 0.06, C.navy, { parent: T.ramp, pos: [-1.5, 0.17, s * (W / 2 - 0.05)] });
  const mkWheel = (x, z, r = 0.55) => {
    const w = group({ parent: body, pos: [x, r, z] }); const spin = group({ parent: w });
    cyl(r, r, 0.38, '#262a31', { parent: spin, rot: [Math.PI / 2, 0, 0], seg: 14 });
    cyl(r * 0.55, r * 0.55, 0.4, '#c3ccd4', { parent: spin, rot: [Math.PI / 2, 0, 0], seg: 10 });
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; box(0.1, 0.1, 0.44, '#59626d', { parent: spin, pos: [Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.38, 0], cast: false }); }
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; box(0.14, 0.12, 0.4, '#1b1e23', { parent: spin, pos: [Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98, 0], rot: [0, 0, a], cast: false }); }
    T.wheels.push({ spin, r }); return w;
  };
  for (const z of [-1.1, 1.1]) { mkWheel(5.0, z); mkWheel(0.8, z); mkWheel(-0.45, z); mkWheel(-3.9, z); mkWheel(-5.1, z); }
  for (const x of [5.0, 0.8, -0.45, -3.9, -5.1]) box(0.6, 0.2, 1.8, '#2e343d', { parent: body, pos: [x, 0.55, 0] });
  for (const s of [-1, 1]) { box(0.05, 0.18, 0.3, C.red, { parent: body, pos: [-5.45, 1.0, s * 1.0], m: { emissive: '#ff4040', ei: 0.4 }, cast: false }); box(L - 0.4, 0.3, 0.02, C.green, { parent: box_, pos: [0, 1.62, s * (W / 2 + 0.04)], cast: false }); }
  return T;
}
export function spinWheels(T, dist) { for (const w of T.wheels) w.spin.rotation.z = -dist / w.r; }
/** k: 0 rampa cerrada (vertical), 1 abierta apoyada en el suelo */
export function setRamp(T, k) { T.ramp.rotation.z = THREE.MathUtils.lerp(-Math.PI / 2, 0.405, k); }
// bisagra de la rampa en coordenadas locales del camión: x=-1.5-3.95-0.05=-5.5, y=1.28; longitud 3.0
export const RAMP = { hinge: [-5.5, 1.28], length: 3.0 };
