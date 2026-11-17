// Kit de primitivas low-poly: materiales cacheados, cajas redondeadas, prismas, etc.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const C = {
  // Paleta INOKUO (azules + acento verde) + naturaleza suave
  navy: '#1b3557', blue: '#3b6ea5', steel: '#7f9bb5', mist: '#dbe6f0', white: '#f5f8fb', green: '#3fc38a', greenDark: '#2a9a6b',
  grass: '#9cc98a', grass2: '#88b878', soil: '#8c6a50', soil2: '#755641', path: '#e1d7c5', concrete: '#c8d0d8', concrete2: '#b4bec8',
  asphalt: '#4d5766', asphalt2: '#3f4955', line: '#f4f1e6', barn: '#c9604a', barnDark: '#a64a38', wood: '#c39464', woodDark: '#9a6f45',
  hay: '#e8c565', leaf: '#6fae6c', leaf2: '#58975a', trunk: '#8a6445', rock: '#a9b2bb', glass: '#a8d2ec',
  cowWhite: '#f4f2ec', cowBlack: '#2c3038', pink: '#f1b0a8', pinkDark: '#d98d86', wool: '#f1efe9', dark: '#2a2f38',
  skin1: '#eab99a', skin2: '#c98f69', skin3: '#8f5c3d', yellow: '#f2c84b', orange: '#f08a3c', red: '#d9534f', sky: '#bcd3e6',
};

const mcache = new Map();
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (mcache.has(key)) return mcache.get(key);
  const { rough = 0.85, metal = 0, flat = true, emissive = null, ei = 1, opacity = 1, side } = o;
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, flatShading: flat });
  if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = ei; }
  if (opacity < 1) { m.transparent = true; m.opacity = opacity; }
  if (side) m.side = side;
  mcache.set(key, m); return m;
}
export const uniqueMat = (color, o = {}) => { const m = mat(color, o).clone(); return m; };

const gcache = new Map();
function geo(key, f) { if (!gcache.has(key)) gcache.set(key, f()); return gcache.get(key); }

function finish(mesh, o) {
  const { pos, rot, parent, name, scale, cast = true, receive = true } = o;
  if (pos) mesh.position.set(pos[0], pos[1], pos[2]);
  if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
  if (scale) typeof scale === 'number' ? mesh.scale.setScalar(scale) : mesh.scale.set(...scale);
  if (name) mesh.name = name;
  mesh.castShadow = cast; mesh.receiveShadow = receive;
  if (parent) parent.add(mesh);
  return mesh;
}
const M = (c, o) => (c && c.isMaterial) ? c : mat(c, o && o.m);

/** Caja (con radio opcional de redondeo) centrada en su origen. */
export function box(w, h, d, color, o = {}) {
  const r = o.r || 0;
  const g = r > 0 ? geo(`rb${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, Math.min(w, h, d) / 2 - 0.001)))
                  : geo(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d));
  return finish(new THREE.Mesh(g, M(color, o)), o);
}
export function cyl(rt, rb, h, color, o = {}) {
  const seg = o.seg || 8;
  return finish(new THREE.Mesh(geo(`c${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg)), M(color, o)), o);
}
export const cone = (r, h, color, o = {}) => cyl(0, r, h, color, o);
export function ico(r, color, o = {}) {
  const det = o.detail ?? 1;
  return finish(new THREE.Mesh(geo(`i${r},${det}`, () => new THREE.IcosahedronGeometry(r, det)), M(color, o)), o);
}
export function sph(r, color, o = {}) {
  return finish(new THREE.Mesh(geo(`s${r},${o.seg || 10}`, () => new THREE.SphereGeometry(r, o.seg || 10, o.seg ? Math.max(6, o.seg - 3) : 7)), M(color, o)), o);
}
/** Prisma triangular (tejado a dos aguas): base w (x), alto h (y), largo d (z). */
export function prism(w, h, d, color, o = {}) {
  const g = geo(`p${w},${h},${d}`, () => {
    const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
    const e = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); e.translate(0, 0, -d / 2); return e;
  });
  return finish(new THREE.Mesh(g, M(color, o)), o);
}
export function torus(R, r, color, o = {}) {
  return finish(new THREE.Mesh(geo(`t${R},${r}`, () => new THREE.TorusGeometry(R, r, 6, o.seg || 16)), M(color, o)), o);
}
export function extrude(shape, depth, color, o = {}) {
  const e = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: o.bevel ?? 0.04, bevelSize: o.bevel ?? 0.04, bevelSegments: 1, curveSegments: o.curve || 6 });
  e.translate(0, 0, -depth / 2);
  return finish(new THREE.Mesh(e, M(color, o)), o);
}
export const group = (o = {}) => { const g = new THREE.Group(); if (o.pos) g.position.set(...o.pos); if (o.rot) g.rotation.set(...o.rot); if (o.parent) o.parent.add(g); if (o.name) g.name = o.name; return g; };
export const add = (parent, ...kids) => { kids.forEach((k) => parent.add(k)); return parent; };

// utilidades
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const ease = { out3: (x) => 1 - Math.pow(1 - clamp(x), 3), inOut: smooth, back: (x) => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); } };
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
