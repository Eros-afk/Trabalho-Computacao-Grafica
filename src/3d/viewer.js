/**
 * viewer.js — Dev 2 + 4 (base) + Dev 3 (iluminação e interações integradas)
 *
 * Integração Dev 3:
 *   - setupLights()       de lights.js
 *   - initInteractions()  de interactions.js
 *   - setInteractionModel() chamado após cada modelo carregar
 *   - destroyInteractions() chamado no close3DViewer()
 */

import { $, $$ } from "../utils/dom.js";
import { setupLights } from "./lights.js";
import {
  initInteractions,
  setInteractionModel,
  destroyInteractions,
} from "./interactions.js";

let viewer3D = null;
let currentModel = null;
let originalMaterials = null;

// Callbacks do loop de animação
const _loopCallbacks = new Set();
function _addToLoop(fn)    { _loopCallbacks.add(fn); }
function _removeFromLoop(fn) { _loopCallbacks.delete(fn); }

const customMaterials = {
  default: null,
  wood:    { color: 0x8B4513, roughness: 0.8, metalness: 0.0 },
  metal:   { color: 0xAAAAAA, roughness: 0.1, metalness: 0.9 },
  leather: { color: 0x3d2314, roughness: 0.6, metalness: 0.0 },
  white:   { color: 0xF5F5F5, roughness: 0.3, metalness: 0.0 },
};

// ── Funções de ambiente e utilitários ───────────────────────────────────────

function createSkybox(scene, THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#d8bf94");    // Bege claro (topo)
  gradient.addColorStop(0.5, "#E8DCC8");  // Bege médio
  gradient.addColorStop(1, "#F5EFE1");    // Bege muito claro (horizonte)
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const skyboxGeometry = new THREE.SphereGeometry(500, 32, 32);
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  scene.add(skybox);
}

function createGroundShadow(scene, THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(255, 255, 255, 0)";
  ctx.fillRect(0, 0, 512, 512);

  const radialGradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  radialGradient.addColorStop(0, "rgba(0, 0, 0, 0.4)");
  radialGradient.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
  radialGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, 512, 512);

  const shadowTexture = new THREE.CanvasTexture(canvas);
  shadowTexture.colorSpace = THREE.SRGBColorSpace;

  const shadowGeometry = new THREE.PlaneGeometry(8, 4);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  });

  const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadowMesh.position.y = 0.02;
  shadowMesh.rotation.x = -Math.PI / 2;

  scene.add(shadowMesh);
}

function createVignetteOverlay(scene, camera, THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  const radialGradient = ctx.createRadialGradient(128, 128, 50, 128, 128, 180);
  radialGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  radialGradient.addColorStop(0.6, "rgba(0, 0, 0, 0.15)");
  radialGradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, 256, 256);

  const vignetteTexture = new THREE.CanvasTexture(canvas);

  const vignetteGeometry = new THREE.PlaneGeometry(20, 20);
  const vignetteMaterial = new THREE.MeshBasicMaterial({
    map: vignetteTexture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide,
  });

  const vignetteMesh = new THREE.Mesh(vignetteGeometry, vignetteMaterial);
  vignetteMesh.position.z = -0.1;
  camera.add(vignetteMesh);

  return vignetteMesh;
}

// ── Init ────────────────────────────────────────────────────────────────────

export async function init3DViewer(modelPath) {
  const modal     = $("#viewer-3d");
  const container = $("#viewer-3d-canvas");

  if (!modal || !container) return;

  modal.classList.remove("hidden");
  renderMaterialControls();

  await new Promise((resolve) => setTimeout(resolve, 200));

  const w = container.clientWidth;
  const h = container.clientHeight;

  if (w === 0 || h === 0) {
    container.style.minHeight = "500px";
    container.style.minWidth  = "600px";
  }

  try {
    const THREE             = await import("three");
    const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
    const { GLTFLoader }    = await import("three/addons/loaders/GLTFLoader.js");

    container.innerHTML = "";

    const width  = container.clientWidth  || 800;
    const height = container.clientHeight || 500;

    // ── Cena ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf9f7);

    createSkybox(scene, THREE);

    // ── Câmera ────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5);
    scene.add(camera);

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Dev 3: Iluminação completa ─────────────────────────────────────────
    setupLights(THREE, scene);

    // ── Chão ──────────────────────────────────────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.9, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    createGroundShadow(scene, THREE);

    // ── Modelo GLTF ───────────────────────────────────────────────────────
    const loader = new GLTFLoader();
    originalMaterials = new Map();

    try {
      const gltf = await loader.loadAsync(
        `./3d_visualization/models/${modelPath}/scene.gltf`
      );
      currentModel = gltf.scene;

      currentModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow    = true;
          child.receiveShadow = true;
          originalMaterials.set(child.uuid, child.material.clone());
        }
      });
      
      currentModel.updateMatrixWorld(true);

      const box = new THREE.Box3();
      currentModel.traverse((child) => {
        if (child.isMesh) {
          box.expandByObject(child);
        }
      });

      if (box.isEmpty()) box.setFromObject(currentModel);

      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = maxDim > 0 ? (3 / maxDim) : 1;
      

      currentModel.scale.setScalar(scaleFactor);

      currentModel.position.x = -center.x * scaleFactor;
      currentModel.position.y = -box.min.y * scaleFactor;
      currentModel.position.z = -center.z * scaleFactor;

      scene.add(currentModel);
    } catch (e) {
      console.error("[Viewer] Erro ao carregar modelo:", e.message);
    }

    createVignetteOverlay(scene, camera, THREE);

    // ── OrbitControls ─────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.08;
    controls.enableZoom     = false;
    controls.target.set(0, 0, 0);
    controls.minDistance    = 2;
    controls.maxDistance    = 15;
    controls.maxPolarAngle  = Math.PI / 2 - 0.1;
    controls.autoRotate     = false;

    // Zoom customizado
    let lastDistance = camera.position.length();
    renderer.domElement.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1.05 : 0.95;
      const direction = camera.position.clone().normalize();
      lastDistance *= delta;
      lastDistance = Math.max(2, Math.min(15, lastDistance));
      camera.position.copy(direction.multiplyScalar(lastDistance));
    }, { passive: false });

    // ── Dev 3: Interações ──────────────────────────────────────────────────
    initInteractions({
      THREE,
      scene,
      camera,
      renderer,
      controls,
      addToLoop:    _addToLoop,
      removeFromLoop: _removeFromLoop,
    });

    if (currentModel) setInteractionModel(currentModel);

    viewer3D = { scene, camera, renderer, controls, active: true, THREE };

    const animate = () => {
      if (!viewer3D || !viewer3D.active) return;
      requestAnimationFrame(animate);
      controls.update();
      for (const cb of _loopCallbacks) cb();
      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      const w = container.clientWidth  || 800;
      const h = container.clientHeight || 500;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    viewer3D._onResize = onResize;

  } catch (error) {
    console.error("[Viewer] Erro geral:", error);
    alert("Erro ao iniciar visualizador: " + error.message);
  }
}

export function close3DViewer() {
  destroyInteractions();
  _loopCallbacks.clear();
  currentModel      = null;
  originalMaterials = null;

  if (viewer3D) {
    viewer3D.active = false;
    if (viewer3D._onResize) window.removeEventListener("resize", viewer3D._onResize);
    if (viewer3D.renderer)  viewer3D.renderer.dispose();
    if (viewer3D.controls)  viewer3D.controls.dispose();
    viewer3D = null;
  }

  $("#viewer-3d").classList.add("hidden");
}

function applyMaterial(materialType) {
  if (!currentModel || !viewer3D || !originalMaterials) return;
  const THREE = viewer3D.THREE;

  currentModel.traverse((child) => {
    if (child.isMesh) {
      if (materialType === "default") {
        const original = originalMaterials.get(child.uuid);
        if (original) child.material = original.clone();
      } else if (customMaterials[materialType]) {
        const mat = customMaterials[materialType];
        child.material = new THREE.MeshStandardMaterial({
          color:     mat.color,
          roughness: mat.roughness,
          metalness: mat.metalness,
        });
      }
    }
  });

  $$(".material-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.material === materialType);
  });
}

window.changeMaterial = applyMaterial;

function renderMaterialControls() {
  const controlsContainer = $("#viewer-3d-material-controls");
  if (!controlsContainer) return;

  controlsContainer.innerHTML = `
    <div class="viewer-3d-material-title">Material</div>
    <div class="viewer-3d-material-options">
      <button class="material-option active" data-material="default" onclick="window.changeMaterial('default')">
        <span class="material-swatch" style="background: linear-gradient(135deg, #8B4513 0%, #654321 100%)"></span>
        Original
      </button>
      <button class="material-option" data-material="wood" onclick="window.changeMaterial('wood')">
        <span class="material-swatch" style="background: linear-gradient(135deg, #8B4513 0%, #5D3A1A 100%)"></span>
        Madeira
      </button>
      <button class="material-option" data-material="metal" onclick="window.changeMaterial('metal')">
        <span class="material-swatch" style="background: linear-gradient(135deg, #CCCCCC 0%, #888888 100%)"></span>
        Metal
      </button>
      <button class="material-option" data-material="leather" onclick="window.changeMaterial('leather')">
        <span class="material-swatch" style="background: linear-gradient(135deg, #3D2314 0%, #2A1A0F 100%)"></span>
        Couro
      </button>
      <button class="material-option" data-material="white" onclick="window.changeMaterial('white')">
        <span class="material-swatch" style="background: linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)"></span>
        Branco
      </button>
    </div>
  `;
}