// Zona de supervisión a la llegada (escena 4): edificio de recepción, inspectora con tablet/portapapeles, verificaciones sobre cada animal.
import * as THREE from 'three';
import { C, box, cyl, group, clamp, rng } from '../lib/kit.js';
import { patch, building, lamp, tree, bush, cone_, signPost, crate, fenceLoop, checkMark, magnifier, badge } from '../lib/props.js';
import { makeHuman, idle, walk, clipboardPose, addClipboard, pointPose } from '../lib/people.js';

export const ARRIVE_X = 126;

export function buildArrival(ctx, S) {
  const g = group({ parent: ctx.scene, name: 'arrival' }); const R = rng(5);
  patch(34, 15, C.concrete, { parent: g, x: 130, z: 0, y: 0.045 });
  for (let i = 0; i < 8; i++) box(0.12, 0.05, 14.8, C.concrete2, { parent: g, pos: [115 + i * 4.2, 0.075, 0], cast: false });
  building({ parent: g, pos: [136.5, 0, -8.6], w: 10, d: 5, h: 3.6, wall: '#eef3f8' });
  building({ parent: g, pos: [118.5, 0, -9.0], w: 6, d: 4, h: 3.0, wall: '#dfe8f1', roof: C.blue });
  lamp({ parent: g, pos: [121, 0, 6.4] }); lamp({ parent: g, pos: [140, 0, 6.2] });
  for (const [x, z] of [[118, 4.8], [122, 6.2], [134, 5.6], [141, 3]]) cone_({ parent: g, pos: [x, 0, z] });
  crate({ parent: g, pos: [141.5, 0, -4.4] }); crate({ parent: g, pos: [142.6, 0, -4.2], rot: [0, 0.3, 0] });
  signPost({ parent: g, pos: [114.5, 0, 5.4], rot: [0, -0.5, 0], col: C.green });
  for (let i = 0; i < 9; i++) tree({ parent: g, pos: [114 + i * 4 + R() * 2, 0, 10 + R() * 2.2], seed: 90 + i, scale: 0.9 + R() * 0.4, kind: i % 3 ? 'round' : 'pine' });
  for (let i = 0; i < 5; i++) tree({ parent: g, pos: [141 + i * 1.8, 0, -12 + R()], seed: 120 + i, scale: 1.0, kind: 'round' });
  // inspectora
  const insp = makeHuman({ shirt: '#f0f3f6', pants: '#26405f', vest: C.orange, hat: 'hard', hair: '#2b2118', hairStyle: 'long', female: true, skin: C.skin2 }); g.add(insp.root); addClipboard(insp); S.inspector = insp;
  const mate = makeHuman({ shirt: '#3b6ea5', pants: '#3a3f47', hat: 'cap', hair: '#3a2a22', skin: C.skin1 }); mate.root.position.set(120.0, 0, 6.2); mate.root.rotation.y = 2.0; g.add(mate.root);
  // marcas de verificación sobre cada animal y lupa
  const T = S.truck; const rigC = group({ parent: T.root });
  S.checks = S.loaded.map((c, i) => { const m = checkMark({ parent: rigC }); m.position.set(-1.5 + c.root.position.x, 4.6, c.root.position.z * 1.0); m.scale.setScalar(0.001); m.visible = false; return m; });
  S.heroCheck = checkMark({ parent: rigC }); S.heroCheck.position.set(-1.5 - 2.9, 4.6, -0.62); S.heroCheck.scale.setScalar(0.001); S.heroCheck.visible = false;
  S.checkA = { k: [0, 0, 0, 0, 0, 0, 0] };
  const mag = group({ parent: g }); magnifier({ parent: mag }); mag.scale.setScalar(0.001); S.mag = mag; S.magA = { k: 0 };
  const scanRing = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.05, 6, 40), new THREE.MeshBasicMaterial({ color: '#3fc38a', transparent: true, opacity: 0.0 })); scanRing.rotation.x = Math.PI / 2; g.add(scanRing); S.scanRing = scanRing;
  S.inspA = { x: 119.4 };
  const cam = ctx.stage.camera; const qp = new THREE.Quaternion();
  ctx.updates.push((t) => {
    insp.root.visible = t > 24.2; const x = S.inspA.x; const walking = x < 123.9 && t > 25.8; insp.root.position.set(x, 0, 3.7); insp.root.rotation.y = Math.PI * 0.5 * (walking ? 1 : 0.0) + (walking ? 0 : 0.0);
    idle(insp, t); if (walking) { walk(insp, (x - 119.4) / 0.9 * Math.PI * 2 * 0.5, 0.9); } 
    // al detenerse mira al camión y hace anotaciones
    if (!walking) { clipboardPose(insp, t, 0.2); insp.root.rotation.y = x >= 123.9 ? Math.PI * 0.9 : Math.PI / 2; } else { insp.armL.sh.rotation.x = -0.7; insp.armL.el.rotation.x = -1.5; }
    idle(mate, t); mate.head.rotation.y = 0.2 * Math.sin(t * 0.5);
    [...S.checks, S.heroCheck].forEach((m, i) => { const k = S.checkA.k[i] || 0; m.visible = k > 0.001; if (!m.visible) return; m.scale.setScalar(Math.max(0.001, k) * 1.0); m.position.y = 4.55 + 0.12 * Math.sin(t * 2.2 + i); T.root.getWorldQuaternion(qp).invert(); m.quaternion.copy(cam.quaternion).premultiply(qp); });
    mag.visible = S.magA.k > 0.001; mag.scale.setScalar(Math.max(0.001, S.magA.k) * 1.15); mag.position.set(x + 1.0, 2.6 + 0.12 * Math.sin(t * 2.4), 4.7); mag.quaternion.copy(cam.quaternion);
    scanRing.visible = scanRing.material.opacity > 0.01;
  });
  return g;
}
