import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

let currentModel = null;
let activeMaterialType = 'default';
const originalMaterials = new Map();

const modelPaths = {
  'chair': 'side_chair',
  'sofa': 'sofa/sofa_03',
  'table': 'table',
  'desk': 'desk',
  'lamp': 'lamp',
  'shelf': 'shelf',
  'bed': 'bed',
  'stool': 'stool',
  'armchair': 'armchair',
  'cabinet': 'cabinet'
};

const customMaterials = {
  plastic: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8, metalness: 0.0 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.1, metalness: 0.9 })
};

const loader = new GLTFLoader();

function loadFurniture(modelKey) {
  const folder = modelPaths[modelKey];
  if (!folder) return;

  if (currentModel) {
    scene.remove(currentModel);
    originalMaterials.clear(); 
    currentModel.traverse(node => {
      if (node.isMesh) {
        node.geometry.dispose();
        if (node.material.map) node.material.map.dispose();
      }
    });
  }

  loader.load(`./models/${folder}/scene.gltf`, (gltf) => {
    currentModel = gltf.scene;

    currentModel.traverse((child) => {
      if (child.isMesh) {
        originalMaterials.set(child.uuid, child.material.clone());
      }
    });

    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    currentModel.position.sub(center);

    applyMaterial(activeMaterialType);

    scene.add(currentModel);
  }, 
  undefined, 
  (error) => console.error("Erro ao carregar:", error));
}

function applyMaterial(materialType) {
  activeMaterialType = materialType;
  if (!currentModel) return;

  currentModel.traverse((child) => {
    if (child.isMesh) {
      if (materialType === 'default') {
        const original = originalMaterials.get(child.uuid);
        if (original) child.material = original.clone();
      } else if (customMaterials[materialType]) {
        child.material = customMaterials[materialType];
      }
    }
  });
}

function createUI() {
  const ui = document.createElement('div');
  ui.style.cssText = 'position:fixed; top:20px; left:20px; background:rgba(0,0,0,0.8); padding:20px; color:white; border-radius:10px; display:flex; flex-direction:column; gap:12px; font-family: sans-serif; z-index: 100;';
  
  let html = '<div><b>Móvel:</b><br><select id="modelSelect" style="width:100%; margin-top:5px; padding:5px;">';
  Object.keys(modelPaths).forEach(key => {
    html += `<option value="${key}">${key.toUpperCase()}</option>`;
  });
  html += '</select></div>';

  html += '<div><b>Material:</b><div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-top:5px;">';
  html += '<button onclick="window.changeMat(\'default\')">Original</button>';
  html += '<button onclick="window.changeMat(\'plastic\')">Plástico</button>';
  html += '<button onclick="window.changeMat(\'wood\')">Madeira</button>';
  html += '<button onclick="window.changeMat(\'metal\')">Metal</button>';
  html += '</div></div>';

  ui.innerHTML = html;
  document.body.appendChild(ui);

  document.getElementById('modelSelect').addEventListener('change', (e) => loadFurniture(e.target.value));
}

window.changeMat = (type) => applyMaterial(type);

camera.position.set(0, 2, 5);
const topLight = new THREE.DirectionalLight(0xffffff, 2);
topLight.position.set(5, 5, 5);
scene.add(topLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

createUI();
loadFurniture('chair'); 
animate();