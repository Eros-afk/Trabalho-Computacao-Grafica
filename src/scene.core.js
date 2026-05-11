/**
 * scene-core.js — Kill: Cena Base
 * Dev 1 — Responsabilidades:
 *   - Setup do Three.js
 *   - Câmera + OrbitControls
 *   - Render loop
 *   - Iluminação mínima (Dev 3 complementa)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const SceneCore = (() => {
  // Estado interno
  let scene, camera, renderer, controls;
  let animationId = null;
  const loopCallbacks = new Set();

  // Configurações default
  const CONFIG = {
    camera: {
      fov: 45,
      near: 0.1,
      far: 100,
      position: { x: 0, y: 1.6, z: 5 },
    },
    controls: {
      enableDamping: true,
      dampingFactor: 0.06,
      minDistance: 1,
      maxDistance: 20,
      maxPolarAngle: Math.PI / 2 - 0.05,
      target: { x: 0, y: 0.5, z: 0 },
    },
    renderer: {
      antialias: true,
      shadowMap: THREE.PCFSoftShadowMap,
      outputColorSpace: THREE.SRGBColorSpace,
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1.2,
    },
    background: new THREE.Color(0xf5f0ea),
  };

  // ── Setup ──────────────────────────────────────────────────────────────────

  function initScene() {
    scene = new THREE.Scene();
    scene.background = CONFIG.background;
    scene.fog = new THREE.Fog(CONFIG.background, 15, 40);
  }

  function initCamera(w, h) {
    camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      w / h,
      CONFIG.camera.near,
      CONFIG.camera.far
    );
    const { x, y, z } = CONFIG.camera.position;
    camera.position.set(x, y, z);
  }

  function initRenderer(canvas, w, h) {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: CONFIG.renderer.antialias,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = CONFIG.renderer.shadowMap;
    renderer.outputColorSpace  = CONFIG.renderer.outputColorSpace;
    renderer.toneMapping       = CONFIG.renderer.toneMapping;
    renderer.toneMappingExposure = CONFIG.renderer.toneMappingExposure;
  }

  function initControls(canvas) {
    controls = new OrbitControls(camera, canvas);

    const c = CONFIG.controls;
    controls.enableDamping = c.enableDamping;
    controls.dampingFactor = c.dampingFactor;
    controls.minDistance   = c.minDistance;
    controls.maxDistance   = c.maxDistance;
    controls.maxPolarAngle = c.maxPolarAngle;
    controls.target.set(c.target.x, c.target.y, c.target.z);
    controls.update();
  }

  // ── Objetos base ───────────────────────────────────────────────────────────

  function addFloor() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.9, metalness: 0 })
    );
    floor.rotation.x  = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.name = 'floor';
    scene.add(floor);
  }

  function addDefaultLighting() {
    // Luz ambiente suave
    const ambient = new THREE.AmbientLight(0xfff5e6, 0.5);
    ambient.name = 'default_ambient';
    scene.add(ambient);

    // Luz direcional básica
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(4, 8, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near   = 0.5;
    sun.shadow.camera.far    = 30;
    sun.shadow.camera.left   = -6;
    sun.shadow.camera.right  =  6;
    sun.shadow.camera.top    =  6;
    sun.shadow.camera.bottom = -6;
    sun.name = 'default_sun';
    scene.add(sun);
  }

  // ── Render loop ────────────────────────────────────────────────────────────

  function loop() {
    animationId = requestAnimationFrame(loop);
    controls.update();
    for (const cb of loopCallbacks) cb();
    renderer.render(scene, camera);
  }

  // ── Resize ─────────────────────────────────────────────────────────────────

  function onResize() {
    const canvas = renderer.domElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  // ── API pública ────────────────────────────────────────────────────────────

  function init(canvasId = 'canvas3d') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) throw new Error(`[SceneCore] Canvas #${canvasId} não encontrado.`);

    const w = canvas.clientWidth  || canvas.parentElement.clientWidth  || window.innerWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight || window.innerHeight;

    initScene();
    initCamera(w, h);
    initRenderer(canvas, w, h);
    initControls(canvas);
    addFloor();
    addDefaultLighting();

    window.addEventListener('resize', onResize);

    loop();

    console.log('[SceneCore] ✅ Cena inicializada.');
    return { scene, camera, renderer, controls };
  }

  function dispose() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    controls.dispose();
    loopCallbacks.clear();
    console.log('[SceneCore] 🗑️  Cena destruída.');
  }

  return {
    init,
    dispose,
    getScene:      () => scene,
    getCamera:     () => camera,
    getRenderer:   () => renderer,
    getControls:   () => controls,
    addToLoop:     (fn) => loopCallbacks.add(fn),
    removeFromLoop:(fn) => loopCallbacks.delete(fn),
    resize:        onResize,
  };
})();

export default SceneCore;
