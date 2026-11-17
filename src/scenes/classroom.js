// Aula de formación 3D (escena 5). Se "construye" pieza a pieza sobre una isla flotante.
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { C, box, cyl, ico, sph, group, mat, clamp, ease, rng } from '../lib/kit.js';
import { slab, badge } from '../lib/props.js';
import { makeHuman, idle, typePose, sitPose, pointPose, wavePose, clipboardPose } from '../lib/people.js';
import { makeCow, cowIdle } from '../lib/animals.js';

export const CLASS_X = 163;

function screenTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 576; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 1024, 576); g.addColorStop(0, '#1b3557'); g.addColorStop(1, '#2f5d8f'); x.fillStyle = g; x.fillRect(0, 0, 1024, 576);
  x.fillStyle = '#3fc38a'; x.fillRect(48, 56, 10, 120);
  x.fillStyle = '#fff'; x.font = '900 70px Inter, sans-serif'; x.fillText('BIENESTAR ANIMAL', 80, 110); x.font = '600 44px Inter, sans-serif'; x.fillStyle = '#cfe0f0'; x.fillText('durante el transporte', 80, 170);
  const items = ['Preparación del viaje', 'Condiciones del transporte', 'Atención a los animales'];
  items.forEach((t, i) => { const y = 260 + i * 82; x.fillStyle = '#3fc38a'; x.beginPath(); x.arc(92, y - 14, 24, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(80, y - 14); x.lineTo(90, y - 4); x.lineTo(106, y - 28); x.stroke(); x.fillStyle = '#fff'; x.font = '600 44px Inter, sans-serif'; x.fillText(t, 140, y); });
  // vaca esquemática
  x.fillStyle = '#f4f2ec'; x.fillRect(720, 300, 200, 100); x.fillRect(900, 270, 70, 70); x.fillStyle = '#2c3038'; x.fillRect(760, 310, 50, 40); x.fillRect(850, 340, 40, 40); x.fillStyle = '#f4f2ec'; [730, 770, 860, 895].forEach((px) => x.fillRect(px, 395, 22, 70));
  x.fillStyle = '#7ff0bd'; x.font = '800 34px Inter, sans-serif'; x.fillText('INOKUO Formación', 80, 540);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function posterTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 340; const x = c.getContext('2d'); x.fillStyle = '#f4f7fa'; x.fillRect(0, 0, 256, 340); x.fillStyle = '#3b6ea5'; x.fillRect(0, 0, 256, 60); x.fillStyle = '#fff'; x.font = '800 28px Inter'; x.fillText('BIENESTAR', 40, 40);
  x.fillStyle = '#3fc38a'; x.beginPath(); x.arc(128, 170, 60, 0, 7); x.fill(); x.fillStyle = '#fff'; x.fillRect(100, 160, 56, 14); x.fillRect(121, 139, 14, 56); x.fillStyle = '#1b3557'; x.fillRect(40, 260, 176, 12); x.fillRect(60, 290, 136, 12);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export async function buildClassroom(ctx, S) {
  const root = group({ parent: ctx.scene, pos: [CLASS_X, -30, 0], name: 'classroom' }); S.room = root; const R = rng(21);
  const pieces = []; // {obj, d (retardo 0..0.8)}
  const piece = (obj, d) => { obj.userData.s0 = obj.scale.clone(); pieces.push({ obj, d }); return obj; };
  // isla
  const island = slab(-6.2, 6.2, -5.2, 5.2, { parent: root, top: '#d9b88a', depth: 2.4 }); piece(island, 0);
  const floor = box(11.6, 0.1, 9.6, '#e4c79b', { parent: root, pos: [0, 0.03, 0], r: 0.02 }); piece(floor, 0.02);
  const rug = box(5.6, 0.04, 3.6, C.blue, { parent: root, pos: [-0.2, 0.1, 1.6], r: 0.02, cast: false }); box(5.2, 0.05, 3.2, '#4b7fb5', { parent: root, pos: [-0.2, 0.11, 1.6], cast: false }); piece(rug, 0.1);
  // paredes (crecen desde el suelo)
  const wallG = (w, h, d, x, z, col) => { const gr = group({ parent: root, pos: [x, 0, z] }); box(w, h, d, col, { parent: gr, pos: [0, h / 2, 0], r: 0.04 }); return piece(gr, 0.12); };
  const back = wallG(11.6, 3.7, 0.3, 0, -4.65, '#eaf1f7'); const left = wallG(0.3, 3.7, 9.6, -5.65, 0, '#dfe9f2');
  box(11.6, 0.35, 0.34, C.navy, { parent: back, pos: [0, 0.18, 0.02], cast: false }); box(0.34, 0.35, 9.6, C.navy, { parent: left, pos: [0, 0.18, 0], cast: false });
  box(11.7, 0.18, 0.4, C.green, { parent: back, pos: [0, 3.6, 0.02], cast: false });
  // ventana en la pared izquierda
  const win = group({ parent: left, pos: [0.18, 2.1, -1.2] }); box(0.12, 1.5, 2.4, '#f4f7fa', { parent: win, r: 0.03 }); box(0.14, 1.3, 2.2, '#bfe0f5', { parent: win, pos: [0.01, 0, 0], cast: false, m: { rough: 0.2 } }); box(0.16, 1.3, 0.1, '#f4f7fa', { parent: win, cast: false }); box(0.16, 0.1, 2.2, '#f4f7fa', { parent: win, cast: false });
  // reloj y póster
  const clock = group({ parent: back, pos: [-4.0, 2.7, 0.2] }); cyl(0.42, 0.42, 0.1, '#f4f7fa', { parent: clock, rot: [Math.PI / 2, 0, 0], seg: 16 }); box(0.05, 0.28, 0.04, C.navy, { parent: clock, pos: [0, 0.12, 0.07], cast: false }); box(0.05, 0.2, 0.04, C.green, { parent: clock, pos: [0.08, 0, 0.07], rot: [0, 0, -1.2], cast: false });
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.66), new THREE.MeshBasicMaterial({ map: posterTexture() })); poster.position.set(-2.6, 2.2, 0.16); back.add(poster);
  // pantalla
  const scr = group({ parent: back, pos: [1.0, 2.15, 0.2] });
  box(4.4, 2.6, 0.18, '#12161c', { parent: scr, r: 0.06 });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 2.31), new THREE.MeshBasicMaterial({ map: screenTexture(), toneMapped: false })); sm.position.z = 0.1; scr.add(sm);
  box(1.2, 0.1, 0.3, '#12161c', { parent: scr, pos: [0, -1.4, 0.05] });
  // rótulo 3D INOKUO sobre la pantalla
  try {
    const font = await new Promise((res, rej) => new FontLoader().load('/node_modules/three/examples/fonts/helvetiker_bold.typeface.json', res, undefined, rej));
    const tg = new TextGeometry('INOKUO', { font, size: 0.62, depth: 0.16, curveSegments: 4, bevelEnabled: false }); tg.computeBoundingBox(); const w = tg.boundingBox.max.x - tg.boundingBox.min.x; tg.translate(-w / 2, 0, 0);
    const txt = new THREE.Mesh(tg, mat(C.navy)); txt.position.set(1.0, 3.6, 0.16); txt.castShadow = true; txt.scale.set(1, 1, 1); back.add(txt);
    box(w + 0.1, 0.1, 0.12, C.green, { parent: back, pos: [1.0, 3.5, 0.2], cast: false });
  } catch (e) { console.warn('font', e); }
  // estantería
  const shelf = group({ parent: left, pos: [0.4, 0, 2.6] }); box(0.6, 2.2, 2.4, C.wood, { parent: shelf, pos: [0, 1.1, 0], r: 0.04 }); for (const y of [0.55, 1.1, 1.65]) { box(0.62, 0.05, 2.35, C.woodDark, { parent: shelf, pos: [0.0, y, 0] }); for (let i = 0; i < 8; i++) box(0.3, 0.3 + R() * 0.15, 0.17, [C.blue, C.green, '#f2c84b', '#d9534f', C.navy, '#8fb7d9'][i % 6], { parent: shelf, pos: [0.18, y + 0.2, -1.0 + i * 0.27], cast: false }); }
  piece(shelf, 0.35);
  // plantas
  const plant = (x, z, s = 1) => { const p = group({ parent: root, pos: [x, 0, z] }); cyl(0.3 * s, 0.22 * s, 0.5 * s, '#c9d6e2', { parent: p, pos: [0, 0.25 * s, 0], seg: 8 }); for (let i = 0; i < 5; i++) ico(0.28 * s, i % 2 ? C.leaf : C.leaf2, { parent: p, pos: [Math.cos(i * 1.3) * 0.2 * s, 0.75 * s + (i % 3) * 0.2 * s, Math.sin(i * 1.3) * 0.2 * s] }); return piece(p, 0.5); };
  plant(-4.9, -3.9, 1.3); plant(4.9, -3.9, 1.1); plant(4.9, 3.8, 0.9);
  // mesas, sillas, portátiles y alumnos
  const students = [];
  const desk = (x, z) => { const d = group({ parent: root, pos: [x, 0, z] }); box(1.7, 0.08, 0.8, '#f1f5f9', { parent: d, pos: [0, 0.78, 0], r: 0.02 }); box(1.7, 0.03, 0.82, C.blue, { parent: d, pos: [0, 0.745, 0], cast: false }); for (const [lx, lz] of [[-0.78, -0.33], [0.78, -0.33], [-0.78, 0.33], [0.78, 0.33]]) box(0.07, 0.74, 0.07, C.steel, { parent: d, pos: [lx, 0.37, lz] });
    const lap = group({ parent: d, pos: [0, 0.82, 0.05] }); box(0.5, 0.03, 0.34, '#aeb8c4', { parent: lap, r: 0.01 }); const lid = group({ parent: lap, pos: [0, 0.015, -0.17], rot: [-0.25, 0, 0] }); box(0.5, 0.34, 0.025, '#aeb8c4', { parent: lid, pos: [0, 0.17, 0] }); box(0.44, 0.28, 0.01, '#6fb7e9', { parent: lid, pos: [0, 0.17, 0.015], cast: false, m: { emissive: '#4ea6e6', ei: 0.7 } });
    return piece(d, 0.3 + R() * 0.2); };
  const chair = (x, z) => { const c = group({ parent: root, pos: [x, 0, z] }); box(0.55, 0.07, 0.55, C.navy, { parent: c, pos: [0, 0.46, 0], r: 0.03 }); box(0.55, 0.5, 0.07, C.navy, { parent: c, pos: [0, 0.78, 0.27], r: 0.03 }); cyl(0.04, 0.04, 0.45, C.steel, { parent: c, pos: [0, 0.23, 0], seg: 5 }); box(0.5, 0.04, 0.5, C.steel, { parent: c, pos: [0, 0.03, 0] }); return piece(c, 0.4 + R() * 0.2); };
  const look = [[-2.9, 1.0, '#3b6ea5', C.skin3, 'short', '#1d1a18', 0], [0.5, 1.0, '#f08a3c', C.skin1, 'long', '#7a4a2a', 1], [-2.9, 3.1, '#3fc38a', C.skin2, 'bun', '#2b2118', 2], [0.5, 3.1, '#d9534f', C.skin1, 'short', '#c98a3b', 3]];
  look.forEach(([x, z, shirt, skin, hs, hair, i]) => { desk(x, z); chair(x, z + 0.85); const st = makeHuman({ shirt, skin, hair, hairStyle: hs, pants: '#2f3e55', female: hs !== 'short' }); st.root.position.set(x, 0, z + 0.85); st.root.rotation.y = Math.PI; root.add(st.root); st.i = i; students.push(st); piece(st.root, 0.55 + 0.08 * i); });
  // profesor
  const teacher = makeHuman({ shirt: '#ffffff', pants: '#26405f', hair: '#3a2a22', skin: C.skin2, vest: null }); teacher.root.position.set(-2.9, 0, -3.3); teacher.root.rotation.y = 0.55; root.add(teacher.root); box(0.14, 0.62, 0.05, C.navy, { parent: teacher.torso, pos: [0, 0.4, 0.17], r: 0.02 }); piece(teacher.root, 0.62);
  const ptr = box(0.04, 1.3, 0.04, '#e8c565', { parent: teacher.armR.el, pos: [0, -0.7, 0.3], rot: [-1.0, 0, 0] });
  // holograma: pedestal con vaca, escudo y corazón
  const ped = group({ parent: root, pos: [3.6, 0, -2.0] }); cyl(0.9, 1.0, 0.3, C.navy, { parent: ped, pos: [0, 0.15, 0], seg: 16 }); cyl(0.75, 0.75, 0.06, '#7ff0bd', { parent: ped, pos: [0, 0.33, 0], seg: 16, m: { emissive: '#3fc38a', ei: 0.9 }, cast: false });
  const holo = makeCow({ seed: 8, scale: 0.55 }); holo.root.position.set(0, 0.95, 0); ped.add(holo.root); const hb1 = badge('heart', { parent: ped }); hb1.position.set(-0.5, 2.5, 0); hb1.scale.setScalar(0.5); const hb2 = badge('shield', { parent: ped }); hb2.position.set(0.9, 2.9, 0); hb2.scale.setScalar(0.5); piece(ped, 0.7);
  S.classroom = { students, teacher };
  S.classK = { k: 0 }; S.roomY = { y: -30 };
  const cam = ctx.stage.camera; const qi = new THREE.Quaternion();
  ctx.updates.push((t) => {
    const K = S.classK.k; root.position.y = S.roomY.y; root.visible = S.roomY.y > -29.9;
    for (const p of pieces) { const k = ease.back((K * 1.45 - p.d) / 0.5); p.obj.scale.set(p.obj.userData.s0.x * Math.max(0.0001, k), p.obj.userData.s0.y * Math.max(0.0001, k), p.obj.userData.s0.z * Math.max(0.0001, k)); p.obj.visible = k > 0.001; }
    students.forEach((s, i) => { idle(s, t + i); sitPose(s); if (i === 1 && t > 41.2 && t < 43) { s.armR.sh.rotation.set(0, 0, -2.9 + 0.1 * Math.sin(t * 5)); s.armR.el.rotation.set(0, 0, 0); typePose(s, t + i); s.armR.sh.rotation.set(0, 0, -2.9 + 0.1 * Math.sin(t * 5)); s.armR.el.rotation.set(0, 0, 0); } else typePose(s, t + i * 0.7); s.head.rotation.y = 0.2 * Math.sin(t * 0.6 + i); s.head.rotation.x = -0.05 + 0.04 * Math.sin(t * 1.3 + i); });
    idle(teacher, t); pointPose(teacher, t); teacher.head.rotation.y = 0.2 * Math.sin(t * 0.8) - 0.15; teacher.torso.rotation.y = -0.35;
    cowIdle(holo, t, { ph: 1 }); holo.root.rotation.y = t * 0.9; for (const b of [hb1, hb2]) { b.quaternion.copy(cam.quaternion); ped.getWorldQuaternion(qi).invert(); b.quaternion.premultiply(qi); b.position.y += 0; }
    hb1.position.y = 2.5 + 0.15 * Math.sin(t * 2); hb2.position.y = 2.9 + 0.15 * Math.sin(t * 2 + 1.5);
  });
  return root;
}
