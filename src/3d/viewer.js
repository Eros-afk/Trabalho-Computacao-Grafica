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
  texture.encoding = THREE.sRGBColorSpace;

  const skyboxGeometry = new THREE.SphereGeometry(500, 32, 32);
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false
  });
  
  const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  scene.add(skybox);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
}

function createGroundShadow(scene, THREE) {
  
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  
  const ctx = canvas.getContext("2d");
  
  // Preencher com branco transparente
  ctx.fillStyle = "rgba(255, 255, 255, 0)";
  ctx.fillRect(0, 0, 512, 512);
  
  // Radial gradient (escuro no centro, transparente nas bordas)
  const radialGradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  radialGradient.addColorStop(0, "rgba(0, 0, 0, 0.4)");        // Escuro no centro
  radialGradient.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");      // Média sombra
  radialGradient.addColorStop(1, "rgba(0, 0, 0, 0)");          // Transparente nas bordas
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, 512, 512);
  
  const shadowTexture = new THREE.CanvasTexture(canvas);
  shadowTexture.encoding = THREE.sRGBColorSpace;
  
  // Plano de sombra
  const shadowGeometry = new THREE.PlaneGeometry(8, 4);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide
  });
  
  const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadowMesh.position.y = 0.02; // Levemente acima do chão para evitar z-fighting
  shadowMesh.rotation.x = -Math.PI / 2;
  
  scene.add(shadowMesh);
}

function createVignetteOverlay(scene, camera, THREE) {
  
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  
  const ctx = canvas.getContext("2d");
  
  const radialGradient = ctx.createRadialGradient(128, 128, 50, 128, 128, 180);
  radialGradient.addColorStop(0, "rgba(0, 0, 0, 0)");           // Transparente no centro
  radialGradient.addColorStop(0.6, "rgba(0, 0, 0, 0.15)");     // Início do sombreado
  radialGradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");        // Escuro nas bordas
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, 256, 256);
  
  const vignetteTexture = new THREE.CanvasTexture(canvas);
  
  // Plano que acompanha a câmera
  const vignetteGeometry = new THREE.PlaneGeometry(20, 20);
  const vignetteMaterial = new THREE.MeshBasicMaterial({
    map: vignetteTexture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide
  });
  
  const vignetteMesh = new THREE.Mesh(vignetteGeometry, vignetteMaterial);
  
  // Vignette como filho da câmera
  // Assim ele se move e rotaciona junto com ela
  vignetteMesh.position.z = -0.1;
  camera.add(vignetteMesh);
  
  return vignetteMesh;
}


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
    
    // Adicionar skybox
    createSkybox(scene, THREE);
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xfaf9f7, 1);
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
    
    // Sombra em baixo do objeto
    createGroundShadow(scene, THREE);
    
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
      //currentModel.position.y = size.y / 2;
      currentModel.position.y = 0;
      currentModel.scale.multiplyScalar(3 / Math.max(size.x, size.y, size.z));
      
      scene.add(currentModel);
    } catch (e) {
      console.error("Erro modelo:", e.message);
    }
    
    // Adicionar vignette na frente da camera
    createVignetteOverlay(scene, camera, THREE);
    
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