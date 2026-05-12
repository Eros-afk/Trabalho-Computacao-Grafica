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

// Callbacks do loop de animação (equivalente ao SceneCore.addToLoop)
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
    const THREE              = await import("three");
    const { OrbitControls }  = await import("three/addons/controls/OrbitControls.js");
    const { GLTFLoader }     = await import("three/addons/loaders/GLTFLoader.js");

    container.innerHTML = "";

    const width  = container.clientWidth  || 800;
    const height = container.clientHeight || 500;

    // ── Cena ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf9f7);

    // ── Câmera ────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5);

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

      const box    = new THREE.Box3().setFromObject(currentModel);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());

      currentModel.position.x -= center.x;
      currentModel.position.z -= center.z;
      currentModel.scale.multiplyScalar(3 / Math.max(size.x, size.y, size.z));

      // Recalcula bounding box após escalar e ajusta somente a altura
      const scaledBox = new THREE.Box3().setFromObject(currentModel);
      currentModel.position.y -= scaledBox.min.y;

      scene.add(currentModel);
    } catch (e) {
      console.error("[Viewer] Erro ao carregar modelo:", e.message);
    }

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

    // Zoom customizado (scroll suave sem orbitar)
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

    // Define o modelo-alvo das interações
    if (currentModel) setInteractionModel(currentModel);

    // ── Salva referências globais do viewer ────────────────────────────────
    viewer3D = { scene, camera, renderer, controls, active: true, THREE };

    // ── Loop de renderização ───────────────────────────────────────────────
    const animate = () => {
      if (!viewer3D || !viewer3D.active) return;
      requestAnimationFrame(animate);
      controls.update();
      // Executa callbacks do Dev 3 (animações de giro, abertura, etc.)
      for (const cb of _loopCallbacks) cb();
      renderer.render(scene, camera);
    };

    animate();

    // ── Resize ────────────────────────────────────────────────────────────
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

// ── Fecha o viewer ──────────────────────────────────────────────────────────

export function close3DViewer() {
  // Dev 3: destrói interações antes de fechar
  destroyInteractions();

  // Limpa callbacks de animação
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

// ── Troca de material ───────────────────────────────────────────────────────

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

// ── Controles de material (UI) ──────────────────────────────────────────────

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
