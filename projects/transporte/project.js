// Proyecto: "Lo que ocurre durante el transporte de un animal" — INOKUO Formación.
// Estructura: config.json (tiempos, textos, marca) + escenas 3D (src/scenes) + línea de tiempo GSAP (aquí).
import * as THREE from 'three';
import { buildFarm } from '/src/scenes/farm.js';
import { buildTruck, TRUCK_LOAD_X } from '/src/scenes/truck.js';
import { buildRoad } from '/src/scenes/road.js';
import { buildArrival, ARRIVE_X } from '/src/scenes/arrival.js';
import { buildClassroom, CLASS_X } from '/src/scenes/classroom.js';
import { setupOverlay } from '/src/engine/overlay.js';

const cfg = await (await fetch('/projects/transporte/config.json')).json();
const timing = await (await fetch('/script/timing.json')).json();
cfg.brand.logoAvailable = await fetch('/' + cfg.brand.logo, { method: 'HEAD' }).then((r) => r.ok && /image/.test(r.headers.get('content-type') || '')).catch(() => false);

export default {
  id: cfg.id, fps: cfg.fps, duration: cfg.duration,
  async build(ctx) {
    const { tl, gsap, stage } = ctx; const S = { A: { truckX: 64, ramp: 0, roof: 1, heroP: 0 } };
    stage.scene.background = null;
    buildFarm(ctx, S); buildTruck(ctx, S); buildRoad(ctx, S); buildArrival(ctx, S); await buildClassroom(ctx, S);
    const A = S.A, rig = stage.rig;
    setupOverlay(ctx, cfg, timing);

    // -------- cámara: fotogramas clave completos (robusto a saltos de tiempo) --------
    const K = (t, v, ease = 'power2.inOut') => ({ t, ease, v });
    const def = { fov: 26, roll: 0, shift: 70, fx: 0, fy: 0, fz: 0, fw: 0 };
    const keys = [
      K(0.0, { tx: 4.0, ty: 1.6, tz: 1.5, yaw: 0.95, pitch: 0.46, dist: 38 }),
      K(5.4, { tx: 6.0, ty: 1.35, tz: 3.4, yaw: 0.4, pitch: 0.2, dist: 10 }, 'sine.inOut'),
      K(6.2, { tx: 8.5, ty: 1.4, tz: 2.4, yaw: 0.3, pitch: 0.3, dist: 13 }, 'power2.inOut'),
      K(9.4, { tx: 17.5, ty: 1.8, tz: 0.5, yaw: -0.15, pitch: 0.5, dist: 34 }, 'power2.inOut'),
      K(12.4, { tx: 21.0, ty: 2.2, tz: 0.0, yaw: -0.62, pitch: 0.46, dist: 26 }, 'sine.inOut'),
      K(14.4, { tx: 25.0, ty: 2.4, tz: 0.0, yaw: -0.25, pitch: 0.42, dist: 32 }, 'sine.inOut'),
      K(17.2, { tx: 40.0, ty: 4.1, tz: 0.0, yaw: 0.55, pitch: 0.38, dist: 37, fw: 1 }, 'sine.inOut'),
      K(19.4, { tx: 60.0, ty: 4.2, tz: 0.0, yaw: 0.95, pitch: 0.42, dist: 37, fw: 1 }, 'sine.inOut'),
      K(20.8, { tx: 70.0, ty: 3.0, tz: 0.0, yaw: 0.6, pitch: 1.05, dist: 21, fw: 1 }, 'power2.inOut'),
      K(22.6, { tx: 90.0, ty: 3.4, tz: 0.0, yaw: 0.3, pitch: 0.55, dist: 30, fw: 1 }, 'power2.inOut'),
      K(25.3, { tx: 118.0, ty: 3.0, tz: 0.0, yaw: 0.65, pitch: 0.42, dist: 34, fw: 1 }, 'sine.inOut'),
      K(27.0, { tx: 124.5, ty: 2.4, tz: 2.0, yaw: 0.55, pitch: 0.3, dist: 23, fw: 0 }, 'power2.inOut'),
      K(30.0, { tx: 126.0, ty: 2.8, tz: 0.5, yaw: 0.95, pitch: 0.38, dist: 25, fw: 0 }, 'sine.inOut'),
      K(32.6, { tx: 154.0, ty: 3.0, tz: 0.0, yaw: 0.75, pitch: 0.5, dist: 46, fw: 0 }, 'power2.inOut'),
      K(35.2, { tx: CLASS_X, ty: 2.0, tz: -0.3, yaw: 0.85, pitch: 0.5, dist: 33, fw: 0 }, 'power2.inOut'),
      K(38.0, { tx: CLASS_X + 0.9, ty: 2.3, tz: -2.6, yaw: 0.45, pitch: 0.3, dist: 29, fw: 0 }, 'sine.inOut'),
      K(41.2, { tx: CLASS_X - 0.5, ty: 1.3, tz: 1.8, yaw: 1.05, pitch: 0.45, dist: 17, fw: 0 }, 'sine.inOut'),
      K(44.6, { tx: CLASS_X, ty: 2.5, tz: 0.0, yaw: 0.75, pitch: 0.6, dist: 42, fw: 0 }, 'power2.inOut'),
      K(50.0, { tx: CLASS_X, ty: 3.0, tz: 0.0, yaw: 0.65, pitch: 0.75, dist: 70, fw: 0 }, 'power1.inOut'),
    ];
    for (const k of keys) k.v = { ...def, ...k.v };
    Object.assign(rig.s, keys[0].v);
    for (let i = 1; i < keys.length; i++) tl.fromTo(rig.s, { ...keys[i - 1].v }, { ...keys[i].v, duration: keys[i].t - keys[i - 1].t, ease: keys[i].ease, immediateRender: false }, keys[i - 1].t);
    // seguimiento del camión: el objetivo se mezcla con la posición del camión
    rig.modifiers.push((s) => { const tx = A.truckX + s.fx; s.tx = THREE.MathUtils.lerp(s.tx, tx, s.fw); });

    // -------- animaciones narrativas --------
    // Escena 1: la protagonista nos mira y levanta la cabeza
    const look = { v: 0 }; S.heroLook = 0;
    tl.fromTo(look, { v: 0 }, { v: 0.5, duration: 1.4, ease: 'sine.inOut', immediateRender: false }, 1.2);
    tl.to(look, { v: 0, duration: 1.2, ease: 'sine.inOut' }, 3.4);
    ctx.updates.push(() => { S.heroLook = look.v * -0.0; });
    S.farmerWave = 1;
    // Escena 2: el camión llega marcha atrás, abre la rampa y la vaca sube
    tl.fromTo(A, { truckX: 64 }, { truckX: TRUCK_LOAD_X, duration: 4.0, ease: 'power3.out', immediateRender: false }, 6.4);
    tl.fromTo(A, { ramp: 0 }, { ramp: 1, duration: 0.9, ease: 'power2.out', immediateRender: false }, 10.5);
    tl.fromTo(A, { heroP: 0 }, { heroP: 1, duration: 8.4, ease: 'sine.inOut', immediateRender: false }, 5.6);
    tl.fromTo(A, { ramp: 1 }, { ramp: 0, duration: 1.0, ease: 'power2.inOut', immediateRender: false }, 13.4);
    // Escena 3: sale, transparenta el techo, aparecen indicadores
    tl.fromTo(A, { truckX: TRUCK_LOAD_X }, { truckX: ARRIVE_X, duration: 11.0, ease: 'power2.inOut', immediateRender: false }, 14.4);
    tl.fromTo(A, { roof: 1 }, { roof: 0.1, duration: 0.8, ease: 'power2.out', immediateRender: false }, 19.7);
    [[0, 15.9], [1, 17.3], [2, 18.7], [3, 20.1]].forEach(([i, t0]) => { tl.fromTo(S.badgeA[i], { k: 0 }, { k: 1, duration: 0.6, ease: 'back.out(2.2)', immediateRender: false }, t0); tl.to(S.badgeA[i], { k: 0, duration: 0.35, ease: 'power2.in' }, 23.7); });
    ['TEMPERATURA', 'ESPACIO', 'DURACIÓN', 'CONDICIONES'].forEach((txt, i) => { const t0 = [15.9, 17.3, 18.7, 20.1][i]; ctx.labels.add(txt, S.badges[i], { offset: [0, -1.15, 0], start: t0 + 0.25, end: 23.5, dy: 0 }); });
    // Escena 4: inspección
    tl.fromTo(S.inspA, { x: 119.4 }, { x: 124.0, duration: 2.6, ease: 'sine.inOut', immediateRender: false }, 25.9);
    tl.fromTo(S.magA, { k: 0 }, { k: 1, duration: 0.5, ease: 'back.out(2)', immediateRender: false }, 28.4); tl.to(S.magA, { k: 0, duration: 0.3 }, 32.2);
    S.checkA.k.forEach((_, i) => { const t0 = 29.0 + i * 0.35; const o = S.checkA; const proxy = { k: 0 }; tl.fromTo(proxy, { k: 0 }, { k: 1, duration: 0.45, ease: 'back.out(2.4)', immediateRender: false, onUpdate: () => { o.k[i] = proxy.k; } }, t0); tl.to(proxy, { k: 0, duration: 0.3, onUpdate: () => { o.k[i] = proxy.k; } }, 33.0); });
    // Escena 5: aula se construye
    tl.fromTo(S.roomY, { y: -30 }, { y: 0, duration: 2.6, ease: 'power3.out', immediateRender: false }, 31.6);
    tl.fromTo(S.classK, { k: 0 }, { k: 1, duration: 3.2, ease: 'none', immediateRender: false }, 32.0);

    // modo previsualización de capas
    ctx.cfg = cfg;
  },
};
