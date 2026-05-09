import { $ } from "../utils/dom.js";

let viewer3D = null;

export async function init3DViewer(modelPath) {
  const modal = $("#viewer-3d");
  const container = $("#viewer-3d-canvas");
  
  if (!modal || !container) {
    return;
  }
  
  modal.classList.remove("hidden");
  
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
    
    scene.add(new THREE.GridHelper(10, 20, 0xcccccc, 0xe5e5e5));
    
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ opacity: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    const loader = new GLTFLoader();
    
    try {
      const gltf = await loader.loadAsync(`/3d_visualization/models/${modelPath}/scene.gltf`);
      const model = gltf.scene;
      
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      model.position.sub(center);
      model.position.y = size.y / 2;
      model.scale.multiplyScalar(3 / Math.max(size.x, size.y, size.z));
      
      scene.add(model);
    } catch (e) {
      console.error("Erro modelo:", e.message);
    }
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.5, 0);
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    
    viewer3D = { scene, camera, renderer, controls, active: true };
    
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

export function close3DViewer() {
  if (viewer3D) {
    viewer3D.active = false;
    if (viewer3D.renderer) viewer3D.renderer.dispose();
    if (viewer3D.controls) viewer3D.controls.dispose();
    viewer3D = null;
  }
  $("#viewer-3d").classList.add("hidden");
}