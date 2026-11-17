// Explotación ganadera + zona de carga (escenas 1 y 2). Coordenadas en metros; granja en x<14, zona de carga x 14..36.
import * as THREE from 'three';
import { C, box, cyl, group, rng, mat } from '../lib/kit.js';
import { slab, patch, tree, bush, rock, flowers, hayBale, crate, trough, fence, fenceLoop, chute, barn, silo, building, lamp, signPost, cone_, cloud } from '../lib/props.js';
import { makeCow, cowIdle, makeSheep, sheepIdle, makePig, pigIdle } from '../lib/animals.js';
import { makeHuman, idle, clipboardPose, addClipboard, pointPose, wavePose, walk } from '../lib/people.js';

export function buildFarm(ctx, S) {
  const { scene } = ctx; const g = group({ parent: scene, name: 'farm' }); const R = rng(11);
  S.farmG = g; S.ground = slab(-18, 150, -16, 14, { parent: g });
  // variaciones de césped
  for (let i = 0; i < 70; i++) { const x = -17 + R() * 166, z = -15 + R() * 28; if (z > -6 && z < 6 && x > 10 && x < 148) continue; patch(1.5 + R() * 4, 1.5 + R() * 3, R() < 0.5 ? C.grass2 : '#a8d396', { parent: g, x, z, y: 0.015 + R() * 0.01 }); }
  // edificio principal
  const b = barn({ parent: g, pos: [-7.5, 0, -8.2], rot: [0, 0.18, 0] });
  silo({ parent: g, pos: [-13.2, 0, -7.2] });
  hayBale({ parent: g, pos: [-2.2, 0, -5.6], rot: [0, 0.5, 0] }); hayBale({ parent: g, pos: [-1.0, 0, -6.2], rot: [0, 0.2, 0] }); hayBale({ parent: g, pos: [-1.6, 1.1, -5.9], rot: [0, 0.4, 0] });
  // corral
  patch(13, 12, '#cdb98d', { parent: g, x: 3.5, z: 0, y: 0.03 });
  fenceLoop(g, [[-3, -6], [10, -6], [10, -1.6]]); fenceLoop(g, [[10, 1.6], [10, 6], [-3, 6], [-3, -6]]);
  chute(g, 10, 17.4, -1.6); chute(g, 10, 17.4, 1.6);
  trough({ parent: g, pos: [0.2, 0, -4.6] }); trough({ parent: g, pos: [1.0, 0, 4.7], rot: [0, 0.2, 0] });
  hayBale({ parent: g, pos: [8.2, 0, -4.4], rot: [0, 1.0, 0] });
  // camino hasta la zona de carga
  patch(12, 5, C.path, { parent: g, x: 14, z: 0, y: 0.04 });
  patch(22, 14.5, C.concrete, { parent: g, x: 26, z: 0, y: 0.045 });
  patch(22, 14.5 - 0.0, C.concrete2, { parent: g, x: 26, z: 0, y: 0.04 });
  for (let i = 0; i < 6; i++) box(0.12, 0.05, 14.4, C.concrete2, { parent: g, pos: [15.5 + i * 3.7, 0.075, 0], cast: false });
  // árboles y vegetación del fondo
  const spots = [[-16, 4], [-15, 9.5], [13, -10], [18, -11], [24, -11], [30, -11.5], [-16, -12], [-3.5, -13], [4, -13], [10, -12.5], [38, 10.5], [41, -10.5]];
  spots.forEach(([x, z], i) => tree({ parent: g, pos: [x, 0, z], seed: i + 3, kind: i % 4 === 0 ? 'pine' : 'round', scale: 0.9 + R() * 0.5 }));
  for (let i = 0; i < 12; i++) { const x = -15 + R() * 50; const z = R() < 0.6 ? -9.5 - R() * 3 : 8.4 + R() * 2.5; bush({ parent: g, pos: [x, 0, z] }); }
  rock({ parent: g, pos: [-5.5, 0, 8.5], s: 1.3 }); rock({ parent: g, pos: [12.5, 0, 8.4] }); flowers(g, 5, 9, 14, 3, 6); flowers(g, 16, -8.6, 12, 4, 6);
  // edificio de recepción de ganado en la zona de carga + iluminación
  building({ parent: g, pos: [31.5, 0, -9.2], w: 7, d: 4.5, h: 3.2 });
  lamp({ parent: g, pos: [16.5, 0, -6.2] }); lamp({ parent: g, pos: [35.5, 0, 6.2] });
  signPost({ parent: g, pos: [12.6, 0, 7.0], rot: [0, -0.4, 0] });
  for (const [x, z] of [[18, 5.4], [24, 6], [34, -5.8], [36, 2]]) cone_({ parent: g, pos: [x, 0, z] });
  crate({ parent: g, pos: [32.2, 0, -5.2], s: 0.9 }); crate({ parent: g, pos: [33.2, 0, -5.4], s: 0.9, rot: [0, 0.3, 0] }); crate({ parent: g, pos: [32.7, 0.9, -5.3], s: 0.8 });

  // ---- animales del corral
  S.cows = [];
  const hero = makeCow({ seed: 4, scale: 1.0 }); hero.root.position.set(6.2, 0, 3.4); hero.root.rotation.order = "YXZ"; hero.root.rotation.y = 0.55; g.add(hero.root); S.hero = hero;
  const others = [[-0.8, -1.2, 2.3, 7, 1], [5.5, -3.0, -0.6, 9, 0], [1.8, 1.4, 3.9, 12, 1], [8.0, -0.4, 1.0, 21, 0]];
  const farmCows = others.map(([x, z, ry, seed, gr], i) => { const c = makeCow({ seed, scale: 0.97, brown: i === 1 }); c.root.position.set(x, 0, z); c.root.rotation.y = ry; g.add(c.root); c.ph = i * 1.7; c.gr = gr; return c; });
  const sheep = [[-1.5, 3.0, 1.2], [-1.8, 4.6, -0.3], [3.0, 4.4, 2.2]].map(([x, z, ry], i) => { const s = makeSheep({ seed: i + 5, scale: 0.95 }); s.root.position.set(x, 0, z); s.root.rotation.y = ry; g.add(s.root); return s; });
  const pig = makePig({ scale: 1.0 }); pig.root.position.set(8.4, 0, -2.4); pig.root.rotation.y = 2.2; g.add(pig.root);
  // clima de nubes
  const clouds = []; for (let i = 0; i < 14; i++) { const c = cloud({ parent: g, pos: [-20 + i * 11 + R() * 5, 22 + R() * 9, -18 + R() * 40], seed: i + 2 }); c.scale.setScalar(1.5 + R()); clouds.push(c); }
  // ---- personajes
  S.farmer = makeHuman({ shirt: '#4f7a9c', pants: '#6b5a44', hat: 'straw', hair: '#6b4a2e', skin: C.skin2 }); S.farmer.root.position.set(12.2, 0, -3.1); S.farmer.root.rotation.y = -0.5; g.add(S.farmer.root);
  S.vet = makeHuman({ shirt: '#f0f3f6', pants: '#26405f', vest: C.orange, hat: 'hard', hair: '#2b2118', female: true, hairStyle: 'bun', skin: C.skin1 }); S.vet.root.position.set(15.8, 0, 2.9); S.vet.root.rotation.y = -2.0; g.add(S.vet.root); addClipboard(S.vet);
  S.farmerWalkPhase = 0;

  ctx.updates.push((t) => {
    cowIdle(hero, t, { ph: 0.4, graze: 0, look: S.heroLook ?? 0 });
    farmCows.forEach((c) => cowIdle(c, t, { ph: c.ph, graze: c.gr ? 0.5 + 0.5 * Math.sin(t * 0.5 + c.ph) : 0 }));
    sheep.forEach((s, i) => sheepIdle(s, t, i * 2.1, i === 1 ? 0.7 : 0.2)); pigIdle(pig, t, 0.5, 0.3);
    clouds.forEach((c, i) => { c.position.x = c.userData.x0 ?? (c.userData.x0 = c.position.x); c.position.x = c.userData.x0 + t * 0.35; });
    idle(S.farmer, t); if (S.farmerWave > 0) wavePose(S.farmer, t); S.farmer.head.rotation.y = -0.5; S.farmer.torso.rotation.y = 0.1;
    idle(S.vet, t); clipboardPose(S.vet, t, 0.4 + 0.4 * Math.sin(t * 0.5));
  });
  return g;
}
