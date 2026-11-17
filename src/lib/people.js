// Personajes humanos low-poly estilizados con articulaciones (cadera, rodilla, hombro, codo, cuello).
import * as THREE from 'three';
import { C, box, cyl, sph, group, cone, mat, clamp } from './kit.js';

export function makeHuman(o = {}) {
  const { skin = C.skin1, shirt = C.blue, pants = C.navy, hair = '#3a2a22', boots = '#3b3f46', vest = null, hat = null, female = false, hairStyle = 'short', scale = 0.92, glasses = false } = o;
  const root = group(); const body = group({ parent: root, pos: [0, 0.88, 0] }); // pelvis
  const P = { root, body };
  // piernas
  const mkLeg = (sx) => {
    const thigh = group({ parent: body, pos: [sx * 0.15, 0, 0] });
    box(0.22, 0.46, 0.24, pants, { parent: thigh, pos: [0, -0.21, 0], r: 0.05 });
    const shin = group({ parent: thigh, pos: [0, -0.43, 0] });
    box(0.2, 0.42, 0.22, pants, { parent: shin, pos: [0, -0.2, 0], r: 0.05 });
    box(0.23, 0.12, 0.34, boots, { parent: shin, pos: [0, -0.4, 0.05], r: 0.04 });
    return { thigh, shin };
  };
  P.legL = mkLeg(-1); P.legR = mkLeg(1);
  // torso
  const torso = group({ parent: body, pos: [0, 0, 0] }); P.torso = torso;
  box(0.56, 0.2, 0.3, pants, { parent: torso, pos: [0, 0.06, 0], r: 0.05 });
  box(female ? 0.5 : 0.58, 0.66, 0.32, shirt, { parent: torso, pos: [0, 0.4, 0], r: 0.09 });
  if (vest) { box(0.6, 0.5, 0.345, vest, { parent: torso, pos: [0, 0.44, 0], r: 0.07 }); box(0.62, 0.07, 0.355, '#e8edf2', { parent: torso, pos: [0, 0.36, 0] }); box(0.62, 0.07, 0.355, '#e8edf2', { parent: torso, pos: [0, 0.55, 0] }); }
  // cabeza
  const neck = group({ parent: torso, pos: [0, 0.74, 0] }); P.neck = neck;
  cyl(0.07, 0.08, 0.1, skin, { parent: neck, pos: [0, 0.03, 0], seg: 6 });
  const head = group({ parent: neck, pos: [0, 0.07, 0] }); P.head = head;
  box(0.4, 0.42, 0.4, skin, { parent: head, pos: [0, 0.21, 0], r: 0.1 });
  box(0.055, 0.075, 0.03, '#23262c', { parent: head, pos: [-0.1, 0.24, 0.205], cast: false });
  box(0.055, 0.075, 0.03, '#23262c', { parent: head, pos: [0.1, 0.24, 0.205], cast: false });
  box(0.1, 0.025, 0.03, '#a8604f', { parent: head, pos: [0, 0.1, 0.205], cast: false });
  box(0.07, 0.07, 0.05, skin, { parent: head, pos: [0, 0.18, 0.215], r: 0.02, cast: false });
  if (glasses) { box(0.34, 0.045, 0.02, '#23262c', { parent: head, pos: [0, 0.25, 0.215], cast: false }); }
  // pelo
  if (hairStyle === 'short') { box(0.43, 0.16, 0.43, hair, { parent: head, pos: [0, 0.38, -0.01], r: 0.06 }); box(0.43, 0.3, 0.12, hair, { parent: head, pos: [0, 0.26, -0.17], r: 0.05 }); }
  if (hairStyle === 'long') { box(0.44, 0.17, 0.44, hair, { parent: head, pos: [0, 0.38, -0.01], r: 0.06 }); box(0.46, 0.55, 0.14, hair, { parent: head, pos: [0, 0.12, -0.18], r: 0.06 }); box(0.07, 0.3, 0.3, hair, { parent: head, pos: [-0.215, 0.25, -0.05] }); box(0.07, 0.3, 0.3, hair, { parent: head, pos: [0.215, 0.25, -0.05] }); }
  if (hairStyle === 'bun') { box(0.43, 0.16, 0.43, hair, { parent: head, pos: [0, 0.38, -0.01], r: 0.06 }); sph(0.12, hair, { parent: head, pos: [0, 0.5, -0.15] }); }
  if (hat === 'cap') { box(0.44, 0.13, 0.44, o.hatColor || C.navy, { parent: head, pos: [0, 0.43, 0], r: 0.05 }); box(0.36, 0.04, 0.2, o.hatColor || C.navy, { parent: head, pos: [0, 0.4, 0.3] }); }
  if (hat === 'hard') { box(0.46, 0.15, 0.46, o.hatColor || C.yellow, { parent: head, pos: [0, 0.43, 0], r: 0.07 }); box(0.4, 0.04, 0.5, o.hatColor || C.yellow, { parent: head, pos: [0, 0.38, 0.03] }); }
  if (hat === 'straw') { cyl(0.34, 0.34, 0.03, '#e6c777', { parent: head, pos: [0, 0.4, 0], seg: 10 }); cyl(0.2, 0.2, 0.14, '#e6c777', { parent: head, pos: [0, 0.47, 0], seg: 8 }); }
  // brazos
  const mkArm = (sx) => {
    const sh = group({ parent: torso, pos: [sx * 0.39, 0.7, 0] });
    sph(0.1, shirt, { parent: sh, seg: 6 });
    box(0.17, 0.38, 0.17, shirt, { parent: sh, pos: [0, -0.18, 0], r: 0.05 });
    const el = group({ parent: sh, pos: [0, -0.37, 0] });
    box(0.15, 0.17, 0.15, shirt, { parent: el, pos: [0, -0.04, 0], r: 0.04 });
    box(0.14, 0.26, 0.14, skin, { parent: el, pos: [0, -0.2, 0], r: 0.04 });
    const hand = sph(0.085, skin, { parent: el, pos: [0, -0.36, 0], seg: 6 });
    return { sh, el, hand };
  };
  P.armL = mkArm(-1); P.armR = mkArm(1);
  root.scale.setScalar(scale);
  P.height = 1.95 * scale;
  idle(P, 0); return P;
}

export function idle(P, t, k = 1) {
  P.torso.rotation.set(0.01 * Math.sin(t * 1.6) * k, 0, 0);
  P.torso.position.y = 0.012 * Math.sin(t * 1.6) * k;
  P.armL.sh.rotation.set(0.05 * Math.sin(t * 1.3), 0, 0.09 + 0.02 * Math.sin(t * 1.6)); P.armR.sh.rotation.set(-0.05 * Math.sin(t * 1.3), 0, -0.09 - 0.02 * Math.sin(t * 1.6));
  P.armL.el.rotation.set(-0.12, 0, 0); P.armR.el.rotation.set(-0.12, 0, 0);
  for (const l of [P.legL, P.legR]) { l.thigh.rotation.set(0, 0, 0); l.shin.rotation.set(0, 0, 0); }
  P.body.position.y = 0.88; P.head.rotation.set(0, 0.12 * Math.sin(t * 0.7) * k, 0);
}
/** Ciclo de caminar; phase en radianes. */
export function walk(P, phase, amp = 1) {
  const s = Math.sin(phase), c = Math.cos(phase);
  P.legL.thigh.rotation.x = -0.6 * s * amp; P.legR.thigh.rotation.x = 0.6 * s * amp;
  P.legL.shin.rotation.x = 0.8 * Math.max(0, c) * amp; P.legR.shin.rotation.x = 0.8 * Math.max(0, -c) * amp;
  P.armL.sh.rotation.x = 0.5 * s * amp; P.armR.sh.rotation.x = -0.5 * s * amp;
  P.armL.el.rotation.x = -0.3 - 0.3 * Math.max(0, -s) * amp; P.armR.el.rotation.x = -0.3 - 0.3 * Math.max(0, s) * amp;
  P.body.position.y = 0.88 - 0.03 * amp + 0.045 * amp * Math.abs(Math.cos(phase)); P.torso.rotation.y = 0.08 * s * amp; P.head.rotation.y = -0.05 * s * amp;
}
export function clipboardPose(P, t = 0, look = 0) {
  P.armL.sh.rotation.set(-0.7, 0, 0.1); P.armL.el.rotation.set(-1.5, 0, 0);
  P.armR.sh.rotation.set(-0.5 + 0.1 * Math.sin(t * 1.4), 0, -0.1); P.armR.el.rotation.set(-1.3 + 0.1 * Math.sin(t * 1.4), 0, 0);
  P.head.rotation.set(0.25 * (1 - look), look, 0);
}
export function addClipboard(P) {
  const g = group({ parent: P.armL.el, pos: [0.04, -0.34, 0.1], rot: [0.2, 0, 0.15] });
  box(0.3, 0.4, 0.03, C.wood, { parent: g, r: 0.01 }); box(0.25, 0.34, 0.034, '#ffffff', { parent: g, pos: [0, -0.01, 0.004] });
  for (let i = 0; i < 4; i++) box(0.17, 0.018, 0.037, '#7f9bb5', { parent: g, pos: [-0.01, 0.1 - i * 0.065, 0.006], cast: false });
  box(0.07, 0.04, 0.045, '#8892a0', { parent: g, pos: [0, 0.2, 0.01] });
  return g;
}
export function pointPose(P, t = 0) {
  P.armR.sh.rotation.set(-1.25 + 0.05 * Math.sin(t * 2), 0, -0.5); P.armR.el.rotation.set(-0.15, 0, 0);
  P.head.rotation.y = 0.35;
}
export function wavePose(P, t) {
  P.armR.sh.rotation.set(0, 0, -2.5 + 0.15 * Math.sin(t * 7)); P.armR.el.rotation.set(0, 0, -0.3 * Math.sin(t * 7));
}
export function typePose(P, t) {
  P.armL.sh.rotation.set(-0.9, 0, 0.1); P.armR.sh.rotation.set(-0.9, 0, -0.1);
  P.armL.el.rotation.set(-0.8 + 0.06 * Math.sin(t * 9), 0, 0); P.armR.el.rotation.set(-0.8 + 0.06 * Math.sin(t * 9 + 2), 0, 0);
  P.head.rotation.set(0.18, 0, 0);
}
export function sitPose(P) {
  P.body.position.y = 0.58;
  for (const l of [P.legL, P.legR]) { l.thigh.rotation.set(-1.5, 0, 0); l.shin.rotation.set(1.5, 0, 0); }
}
