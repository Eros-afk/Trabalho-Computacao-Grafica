import { $, $$ } from "../utils/dom.js";

let viewer3D = null;
let currentModel = null;
let originalMaterials = null;

const customMaterials = {
  default: null,
  wood: { color: 0x8B4513, roughness: 0.8, metalness: 0.0 },
  metal: { color: 0xAAAAAA, roughness: 0.1, metalness: 0.9 },
  leather: { color: 0x3d2314, roughness: 0.6, metalness: 0.0 },
  white: { color: 0xF5F5F5, roughness: 0.3, metalness: 0.0 }
};

export async function init3DViewer(modelPath) {
  const modal = $("#viewer-3d");
  const container = $("#viewer-3d-canvas");
  
  if (!modal || !container) {
    return;
  }
  
  modal.classList.remove("hidden");
  renderMaterialControls();
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const w = container.clientWidth;
  const h = container.clientHeight;
  
  if (w === 0 || h === 0) {
    container.style.minHeight = "500px";
    container.style.minWidth = "600px";
  }
  
  try {
    const THREE = await import("three");
    const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    
    container.innerHTML = "";
    
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf9f7);
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-5, 3, -5);
    scene.add(fill);
    
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ opacity: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    const loader = new GLTFLoader();
    originalMaterials = new Map();
    
    try {
      const gltf = await loader.loadAsync(`/3d_visualization/models/${modelPath}/scene.gltf`);
      currentModel = gltf.scene;
      
      currentModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          originalMaterials.set(child.uuid, child.material.clone());
        }
      });
      
      const box = new THREE.Box3().setFromObject(currentModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      currentModel.position.sub(center);
      currentModel.position.y = size.y / 2;
      currentModel.scale.multiplyScalar(3 / Math.max(size.x, size.y, size.z));
      
      scene.add(currentModel);
    } catch (e) {
      console.error("Erro modelo:", e.message);
    }
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.5, 0);
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    
    viewer3D = { scene, camera, renderer, controls, active: true, THREE };
    
    const animate = () => {
      if (viewer3D && viewer3D.active) {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
    };
    
    animate();
    
  } catch (error) {
    console.error("Erro visualizador:", error);
    alert("Erro: " + error.message);
  }
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
          color: mat.color,
          roughness: mat.roughness,
          metalness: mat.metalness
        });
      }
    }
  });
  
  $$(".material-option").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.material === materialType) {
      btn.classList.add("active");
    }
  });
}

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

window.changeMaterial = applyMaterial;

export function close3DViewer() {
  currentModel = null;
  originalMaterials = null;
  
  if (viewer3D) {
    viewer3D.active = false;
    if (viewer3D.renderer) viewer3D.renderer.dispose();
    if (viewer3D.controls) viewer3D.controls.dispose();
    viewer3D = null;
  }
  $("#viewer-3d").classList.add("hidden");
}