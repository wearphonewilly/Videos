import * as THREE from 'three';

export function createStage({ canvas, width, height, aspect }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1); renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, aspect, 1, 600);
  const hemi = new THREE.HemisphereLight('#ffffff', '#9db4c9', 1.55); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff3df', 2.35); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.06; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight('#cfe3ff', 0.45); fill.position.set(20, 10, 30); scene.add(fill);
  const sunDir = new THREE.Vector3(-0.55, 1.0, 0.62).normalize();

  const rig = {
    // estado de cámara animable con GSAP
    s: { tx: 0, ty: 1, tz: 0, yaw: 0.7, pitch: 0.55, dist: 30, fov: 26, roll: 0, shift: 70, fx: 0, fy: 0, fz: 0, fw: 0 },
    modifiers: [],
    apply(cam, ctx) {
      const s = { ...this.s }; for (const m of this.modifiers) m(s);
      const cp = Math.cos(s.pitch);
      cam.position.set(s.tx + s.dist * cp * Math.sin(s.yaw), s.ty + s.dist * Math.sin(s.pitch), s.tz + s.dist * cp * Math.cos(s.yaw));
      cam.up.set(0, 1, 0); cam.lookAt(s.tx, s.ty, s.tz); if (s.roll) cam.rotateZ(s.roll);
      cam.fov = s.fov; if (s.shift) cam.setViewOffset(width, height, 0, -s.shift * width / 1080, width, height); else cam.clearViewOffset(); cam.updateProjectionMatrix();
      // sombra siguiendo el foco
      const R = Math.min(36, Math.max(13, s.dist * 0.34 + 6));
      sun.position.set(s.tx + sunDir.x * 50, s.ty + sunDir.y * 50, s.tz + sunDir.z * 50); sun.target.position.set(s.tx, s.ty, s.tz); sun.target.updateMatrixWorld();
      const sc = sun.shadow.camera; sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 1; sc.far = 120; sc.updateProjectionMatrix();
      this.cur = s;
    },
  };
  return { renderer, scene, camera, rig, sun, hemi, render() { renderer.render(scene, camera); } };
}
