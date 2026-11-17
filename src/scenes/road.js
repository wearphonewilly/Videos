// Carretera, paisaje y las insignias 3D (temperatura, espacio, duración, condiciones) de la escena 3.
import * as THREE from 'three';
import { C, box, cyl, ico, cone, group, rng, clamp, lerp } from '../lib/kit.js';
import { road, tree, bush, rock, pole, signPost, guardrail, fenceLoop, flowers, hayBale, badge, patch } from '../lib/props.js';
import { makeCow, cowIdle } from '../lib/animals.js';

export function buildRoad(ctx, S) {
  const g = group({ parent: ctx.scene, name: 'road' }); const R = rng(77);
  road(g, 20, 147);
  // colinas suaves al fondo
  for (let i = 0; i < 11; i++) { const h = ico(5 + R() * 5, i % 2 ? C.leaf : '#7fb676', { parent: g, pos: [34 + i * 7.5 + R() * 4, -1.5, -12.5 - R() * 2], detail: 1, scale: [1.6, 0.6, 1] }); h.castShadow = false; }
  // árboles y arbustos a ambos lados
  for (let x = 40; x < 114; x += 3.2 + R() * 3.2) {
    const side = R() < 0.55 ? -1 : 1; const z = side * (6.6 + R() * 5.2); tree({ parent: g, pos: [x, 0, z], seed: Math.floor(x), kind: R() < 0.3 ? 'pine' : 'round', scale: 0.8 + R() * 0.55 });
    if (R() < 0.5) bush({ parent: g, pos: [x + 1.2, 0, side * (5.3 + R() * 1.2)] });
  }
  for (let x = 44; x < 114; x += 14) { rock({ parent: g, pos: [x + R() * 5, 0, (R() < 0.5 ? -1 : 1) * (6 + R() * 3)], s: 0.8 + R() }); }
  // postes eléctricos con cable
  const poles = []; for (let x = 42; x <= 114; x += 12) { pole({ parent: g, pos: [x, 0, -4.7] }); poles.push(x); }
  for (let i = 0; i < poles.length - 1; i++) for (const dz of [-0.55, 0, 0.55]) { const x0 = poles[i], x1 = poles[i + 1]; box(x1 - x0, 0.03, 0.03, '#3a4048', { parent: g, pos: [(x0 + x1) / 2, 5.4 + (dz ? 0 : 0.2), -4.7 + dz], cast: false }); }
  guardrail(g, 52, 76, 4.2); guardrail(g, 84, 100, 4.2);
  signPost({ parent: g, pos: [48, 0, 4.6], rot: [0, -0.2, 0] }); signPost({ parent: g, pos: [96, 0, -4.4], rot: [0, 0.2, 0], col: C.green });
  // prados con vacas y vallas junto a la carretera
  const field = (x0, x1, z0, z1) => { fenceLoop(g, [[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0, z0]]); };
  field(56, 76, 7.2, 12.5); field(80, 98, -12, -7.4);
  S.roadCows = [[62, 9.4, 0.8, 41], [68, 10.8, -1.2, 43], [72, 8.9, 2.4, 45], [87, -9.5, 2.0, 47], [92, -10.6, 0.3, 49]].map(([x, z, ry, seed], i) => { const c = makeCow({ seed, scale: 0.95, brown: i % 3 === 1 }); c.root.position.set(x, 0, z); c.root.rotation.y = ry; g.add(c.root); c.ph = i; return c; });
  hayBale({ parent: g, pos: [74.2, 0, 11.3], rot: [0, 0.4, 0] });
  flowers(g, 60, -7.5, 18, 8, 8); flowers(g, 100, 8, 14, 9, 10);

  // ---- insignias flotantes anclada al camión
  const T = S.truck; const rig = group({ parent: T.root, pos: [-0.3, 0, 0] });
  const defs = [['temp', [-4.2, 4.9, 0.5], 'TEMPERATURA'], ['space', [-1.4, 6.3, 0.5], 'ESPACIO'], ['clock', [1.4, 4.9, 0.5], 'DURACIÓN'], ['shield', [4.2, 6.3, 0.5], 'CONDICIONES']];
  S.badges = defs.map(([k, pos, label], i) => { const b = badge(k, { parent: rig }); b.position.set(...pos); b.userData = { ...b.userData, label, base: new THREE.Vector3(...pos), i }; b.scale.setScalar(0.001); b.visible = false; return b; });
  S.badgeA = S.badges.map(() => ({ k: 0 }));
  const q = new THREE.Quaternion(), qp = new THREE.Quaternion();
  ctx.updates.push((t) => {
    const cam = ctx.stage.camera;
    S.badges.forEach((b, i) => {
      const k = S.badgeA[i].k; b.visible = k > 0.001; if (!b.visible) return;
      b.scale.setScalar(Math.max(0.001, k) * 0.82);
      b.position.y = b.userData.base.y + 0.22 * Math.sin(t * 2.0 + i * 1.3);
      T.root.getWorldQuaternion(qp).invert(); b.quaternion.copy(cam.quaternion).premultiply(qp);
      b.userData.inner.rotation.y = 0.45 * Math.sin(t * 1.6 + i);
      if (b.userData.hands) { b.userData.hands[0].rotation.z = -t * 1.6; b.userData.hands[1].rotation.z = -t * 0.13; }
    });
    S.roadCows.forEach((c) => cowIdle(c, t, { ph: c.ph, graze: 0.5 + 0.5 * Math.sin(t * 0.4 + c.ph) }));
  });
  return g;
}
