/**
 * lights.js — Dev 3
 * Responsabilidades:
 *   - Luz ambiente
 *   - Luz direcional principal com sombras
 *   - Luz de preenchimento (fill)
 *   - Luz pontual de ambiente interno (point light)
 *   - Função para remover iluminação padrão e substituir pela completa
 */

/**
 * Configura toda a iluminação da cena.
 * @param {THREE} THREE  - instância do Three.js
 * @param {THREE.Scene} scene - cena onde as luzes serão adicionadas
 */
export function setupLights(THREE, scene) {
  // Remove iluminação default que já possa existir na cena
  const toRemove = [];
  scene.traverse((obj) => {
    if (obj.isLight) toRemove.push(obj);
  });
  toRemove.forEach((l) => scene.remove(l));

  // ── 1. Luz ambiente — iluminação geral suave e quente ──────────────────────
  const ambient = new THREE.AmbientLight(0xfff5e6, 0.6);
  ambient.name = "ambient_light";
  scene.add(ambient);

  // ── 2. Luz direcional principal (sol) — com sombras ───────────────────────
  const sunLight = new THREE.DirectionalLight(0xfff0d0, 2.0);
  sunLight.position.set(5, 8, 5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width  = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near   = 0.5;
  sunLight.shadow.camera.far    = 30;
  sunLight.shadow.camera.left   = -8;
  sunLight.shadow.camera.right  =  8;
  sunLight.shadow.camera.top    =  8;
  sunLight.shadow.camera.bottom = -8;
  sunLight.shadow.bias = -0.001;
  sunLight.name = "sun_light";
  scene.add(sunLight);

  // ── 3. Luz de preenchimento (fill) — elimina sombras muito duras ──────────
  const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.6);
  fillLight.position.set(-5, 3, -5);
  fillLight.name = "fill_light";
  scene.add(fillLight);

  // ── 4. Luz pontual de ambiente interno — simula lâmpada no teto ───────────
  const pointLight = new THREE.PointLight(0xffeedd, 1.2, 15, 2);
  pointLight.position.set(0, 5, 0);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width  = 1024;
  pointLight.shadow.mapSize.height = 1024;
  pointLight.name = "point_ceiling";
  scene.add(pointLight);

  console.log("[Lights] ✅ Iluminação configurada.");
}

/**
 * Atualiza a intensidade da luz ambiente (útil para dia/noite).
 * @param {THREE.Scene} scene
 * @param {number} intensity
 */
export function setAmbientIntensity(scene, intensity) {
  const ambient = scene.getObjectByName("ambient_light");
  if (ambient) ambient.intensity = intensity;
}

/**
 * Atualiza a posição da luz principal.
 * @param {THREE.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
export function setSunPosition(scene, x, y, z) {
  const sun = scene.getObjectByName("sun_light");
  if (sun) sun.position.set(x, y, z);
}
