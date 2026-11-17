// Motor: arranca el proyecto indicado (?project=nombre) y expone window.renderFrame(t) determinista.
import * as THREE from 'three';
import { createStage } from './stage.js';

const q = new URLSearchParams(location.search);
const name = q.get('project') || 'transporte';
const W = +(q.get('w') || 1080), H = +(q.get('h') || 1920);
if (q.get('debug')) document.body.classList.add('debug');
const stageEl = document.getElementById('stage');
stageEl.style.transform = `scale(${W / 1080})`;
document.body.style.width = W + 'px'; document.body.style.height = H + 'px';

const { default: project } = await import(`/projects/${name}/project.js`);
const stage = createStage({ canvas: document.getElementById('gl'), width: W, height: H, aspect: 1080 / 1920 });
const tl = gsap.timeline({ paused: true });
gsap.ticker.lagSmoothing(0);
const ctx = { THREE, gsap, tl, stage, scene: stage.scene, rig: stage.rig, project, updates: [], dom: (id) => document.getElementById(id), q };
await project.build(ctx);
// asegurar que todas las mallas proyectan/reciben sombra según flags ya definidos
let last = -1;
window.PROJECT = { duration: project.duration, fps: project.fps, width: 1080, height: 1920 };
window.renderFrame = (t) => {
  tl.seek(t, false);
  for (const u of ctx.updates) u(t);
  stage.rig.apply(stage.camera, ctx);
  stage.render();
  return t;
};
window.__ready = true;
