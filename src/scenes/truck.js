// Camión + vaca protagonista subiendo por la rampa + vacas cargadas. Estado animable en S.A (GSAP) y actualizado cada frame.
import * as THREE from 'three';
import { C, group, clamp, lerp, smooth } from '../lib/kit.js';
import { makeTruck, spinWheels, setRamp, RAMP } from '../lib/vehicles.js';
import { makeCow, cowIdle, cowWalk } from '../lib/animals.js';
import { makeHuman, idle, walk, clipboardPose, addClipboard } from '../lib/people.js';

export const TRUCK_LOAD_X = 26;

export function buildTruck(ctx, S) {
  const { scene } = ctx; const T = makeTruck(); S.truck = T; scene.add(T.root);
  const A = S.A = { truckX: 64, ramp: 0, roof: 1, heroP: 0, ...(S.A || {}) };
  T.root.position.set(A.truckX, 0, 0);
  // vacas cargadas (coordenadas locales de la caja)
  const slots = [[-0.8, -0.62], [-0.8, 0.62], [1.3, -0.62], [1.3, 0.62], [3.0, -0.62], [-2.9, 0.62]];
  S.loaded = slots.map(([x, z], i) => { const c = makeCow({ seed: 30 + i, scale: 0.85, brown: i === 2 }); c.root.position.set(x, 1.285, z); c.root.rotation.y = Math.PI / 2; T.box.add(c.root); c.ph = i * 1.3; return c; });

  // ---- trayectoria de la vaca protagonista (mundo)
  const rampEnd = [TRUCK_LOAD_X - 5.5 - 3 * Math.cos(0.405), 0.14], hinge = [TRUCK_LOAD_X - 5.5, 1.33];
  const pts = [[6.2, 0, 3.4], [7.8, 0, 1.6], [9.6, 0, 0.3], [11.5, 0, 0], [rampEnd[0] - 0.4, 0.0, 0], [rampEnd[0], rampEnd[1], 0], [hinge[0], hinge[1], 0], [hinge[0] + 1.5, 1.33, -0.3], [TRUCK_LOAD_X - 1.5 - 2.9, 1.335, -0.62]].map((p) => new THREE.Vector3(...p));
  const seg = []; let L = 0; for (let i = 0; i < pts.length - 1; i++) { const d = pts[i].distanceTo(pts[i + 1]); seg.push(d); L += d; }
  S.heroPath = { pts, seg, L };
  const hero = S.hero; const heroPos = new THREE.Vector3(); let hp = 0;
  function sample(p) { let d = p * L; for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = clamp(d / seg[i]); return { pos: pts[i].clone().lerp(pts[i + 1], k), dir: pts[i + 1].clone().sub(pts[i]).normalize(), i }; } d -= seg[i]; } }
  S.sample = sample;

  // personal en zona de carga: el guía y el conductor
  const lastX = { v: A.truckX };
  ctx.updates.push((t) => {
    const x = A.truckX; const moving = Math.abs(x - lastX.v) > 1e-4; lastX.v = x;
    T.root.position.x = x; T.root.position.y = moving ? 0.015 * Math.sin(x * 3.1) + 0.01 * Math.sin(x * 7.3) : 0; spinWheels(T, x);
    T.body.rotation.z = moving ? 0.004 * Math.sin(x * 1.7) : 0;
    setRamp(T, A.ramp); T.roofMat.opacity = A.roof; T.roofMat.depthWrite = A.roof > 0.98; T.roof.visible = A.roof > 0.02;
    S.loaded.forEach((c, i) => { cowIdle(c, t, { ph: c.ph, graze: 0, look: 0 }); c.root.position.y = 1.285 + (moving ? 0.01 * Math.sin(x * 4 + i) : 0); if (i === 5) c.root.visible = true; });
    // vaca protagonista
    const p = A.heroP;
    if (p <= 0) { hero.root.position.set(6.2, 0, 3.4); hero.root.rotation.set(0, 0.55, 0); }
    else {
      const s = sample(Math.min(1, p)); hero.root.position.copy(s.pos);
      const yaw = Math.atan2(s.dir.x, s.dir.z); const pitch = -Math.asin(clamp(s.dir.y, -1, 1));
      hero.root.rotation.y = yaw; hero.root.rotation.x = pitch * 0.9;
      const walking = p < 0.995; const phase = (p * L) / 1.6 * Math.PI * 2;
      if (walking) cowWalk(hero, phase); else cowIdle(hero, t, { ph: 0.4 });
      if (p >= 0.995) { hero.root.rotation.y = Math.PI / 2; hero.root.rotation.x = 0; }
      const inside = s.i >= 7;
      if (inside) {
        if (hero.root.parent !== T.box) T.box.add(hero.root);
        hero.root.position.set(s.pos.x - (TRUCK_LOAD_X - 1.5), s.pos.y, s.pos.z);
      } else if (hero.root.parent !== S.farmG) S.farmG.add(hero.root);
    }
    if (p <= 0 && hero.root.parent !== S.farmG) S.farmG.add(hero.root);
  });
}
