/**
 * interactions.js — Dev 3
 * Responsabilidades:
 *   - Raycasting: detectar clique nos objetos 3D
 *   - Seleção visual: highlight no objeto clicado (emissive glow)
 *   - Animações básicas: girar objeto, animação de abertura (armário/gaveta)
 *   - Deselecionar ao clicar fora
 */

// ── Estado interno ──────────────────────────────────────────────────────────

let _THREE       = null;
let _scene       = null;
let _camera      = null;
let _renderer    = null;
let _model       = null;
let _raycaster   = null;
let _mouse       = null;
let _controls    = null;

let selectedMesh      = null;    // mesh atualmente selecionado
let originalEmissive  = null;    // cor emissive original do mesh selecionado
let originalRotationY = 0;       // rotação Y original do objeto
let isSpinning        = false;   // estado da animação de giro
let spinCallbackRef   = null;    // referência para remover do loop
let isResetting       = false;   // estado da animação de reset
let resetCallbackRef  = null;    // referência da animação de reset
let isOpen            = false;   // estado da animação de abertura
let openAnimRef       = null;    // referência da animação de abertura
let isEntering        = false;   // estado da animação de entrada
let enterAnimRef      = null;    // referência da animação de entrada
let originalPosition = null; // posição Y calculada para escala 1.0

const HIGHLIGHT_COLOR = { r: 0.08, g: 0.35, b: 0.55 }; // azul suave
const ANIM_SPEED      = 0.03;    // radianos por frame
const ENTER_SCALE_SPEED = 0.08;  // velocidade da animação de entrada

// ── Setup ───────────────────────────────────────────────────────────────────

/**
 * Inicializa o sistema de interações.
 * Deve ser chamado depois que a cena, câmera e renderer estiverem prontos.
 *
 * @param {object} deps
 * @param {THREE}            deps.THREE    - instância do Three.js
 * @param {THREE.Scene}      deps.scene
 * @param {THREE.Camera}     deps.camera
 * @param {THREE.WebGLRenderer} deps.renderer
 * @param {OrbitControls}    deps.controls
 * @param {function}         deps.addToLoop   - SceneCore.addToLoop ou equivalente
 * @param {function}         deps.removeFromLoop
 */
export function initInteractions({ THREE, scene, camera, renderer, controls, addToLoop, removeFromLoop }) {
  _THREE    = THREE;
  _scene    = scene;
  _camera   = camera;
  _renderer = renderer;
  _controls = controls;

  _raycaster = new THREE.Raycaster();
  _mouse     = new THREE.Vector2();

  // Armazena referências de addToLoop/removeFromLoop para animações
  _addToLoop    = addToLoop;
  _removeFromLoop = removeFromLoop;

  renderer.domElement.addEventListener("click", _onClick);
  renderer.domElement.style.cursor = "crosshair";

  console.log("[Interactions] ✅ Sistema de interações iniciado.");
}

/**
 * Atualiza o modelo 3D alvo das interações (chamado quando um novo modelo carrega).
 * @param {THREE.Object3D} model
 */
export function setInteractionModel(model) {
  // Limpa seleção anterior ao trocar modelo
  _clearSelection();
  stopSpin();
  stopReset();
  closeObject();
  stopEnter();
  _model = model;

  // Inicia animação de entrada
  if (_model) {
    startEnter();
  }
}

/**
 * Remove todos os listeners (cleanup ao fechar o viewer).
 */
export function destroyInteractions() {
  if (_renderer) {
    _renderer.domElement.removeEventListener("click", _onClick);
  }
  _clearSelection();
  stopSpin();
  stopReset();
  stopEnter();
  _THREE = _scene = _camera = _renderer = _controls = _model = null;
  _raycaster = _mouse = null;
  console.log("[Interactions] 🗑️  Interações destruídas.");
}

// ── Referências internas (preenchidas pelo initInteractions) ────────────────
let _addToLoop    = null;
let _removeFromLoop = null;

// ── Raycasting + Seleção ────────────────────────────────────────────────────

function _onClick(event) {
  if (!_raycaster || !_model) return;

  // Coordenadas normalizadas do clique
  const rect = _renderer.domElement.getBoundingClientRect();
  _mouse.x =  ((event.clientX - rect.left)  / rect.width)  * 2 - 1;
  _mouse.y = -((event.clientY - rect.top)   / rect.height) * 2 + 1;

  _raycaster.setFromCamera(_mouse, _camera);

  const intersects = _raycaster.intersectObjects(_model ? [_model] : [], true);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    if (hit === selectedMesh) {
      // Clicou no mesmo objeto: deseleciona
      _clearSelection();
      _hideInfoPanel();
    } else {
      _selectMesh(hit);
    }
  } else {
    // Clicou no fundo: deseleciona
    _clearSelection();
    _hideInfoPanel();
  }
}

function _selectMesh(mesh) {
  // Restaura emissive do anterior
  _clearSelection();

  selectedMesh = mesh;
  originalRotationY = _model ? (_model.rotation.y || 0) : 0;

  // Salva e aplica emissive de highlight
  if (mesh.material) {
    originalEmissive = mesh.material.emissive
      ? mesh.material.emissive.clone()
      : new _THREE.Color(0x000000);

    mesh.material.emissive = new _THREE.Color(
      HIGHLIGHT_COLOR.r,
      HIGHLIGHT_COLOR.g,
      HIGHLIGHT_COLOR.b
    );
  }

  console.log("[Interactions] 🎯 Selecionado:", mesh.name || mesh.uuid);
  _showInfoPanel(mesh);
}

function _clearSelection() {
  if (selectedMesh && selectedMesh.material && originalEmissive) {
    selectedMesh.material.emissive.copy(originalEmissive);
  }
  selectedMesh     = null;
  originalEmissive = null;
}

// ── Painel de info (HUD simples) ────────────────────────────────────────────

function _showInfoPanel(mesh) {
  let panel = document.getElementById("interaction-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "interaction-panel";
    panel.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 10, 10, 0.82);
      backdrop-filter: blur(8px);
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      display: flex;
      gap: 12px;
      align-items: center;
      z-index: 200;
      border: 1px solid rgba(255,255,255,0.1);
      pointer-events: all;
    `;
    // Adiciona no container do viewer se existir, senão no body
    const container = document.getElementById("viewer-3d-canvas") || document.body;
    container.style.position = "relative";
    container.appendChild(panel);
  }

  const name = mesh.name && mesh.name !== "" ? mesh.name : "Parte do objeto";
  const currentRotation = _model ? (_model.rotation.y || 0) : 0;
  const hasRotated = Math.abs(currentRotation - originalRotationY) > 0.01;

  panel.innerHTML = `
    <span style="color:#a0c4ff">⬡ ${name}</span>
    <button id="btn-spin" style="${_btnStyle()}" title="Girar objeto">↻ Girar</button>
    ${hasRotated ? `<button id="btn-reset" style="${_btnStyle('reset')}" title="Voltar ao original">⊙ Voltar</button>` : ''}
    <button id="btn-open" style="${_btnStyle()}" title="Abrir/fechar">⇅ Abrir</button>
    <button id="btn-deselect" style="${_btnStyle('close')}" title="Desselecionar">✕</button>
  `;

  document.getElementById("btn-spin").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSpin();
  });

  if (hasRotated && document.getElementById("btn-reset")) {
    document.getElementById("btn-reset").addEventListener("click", (e) => {
      e.stopPropagation();
      resetRotation();
    });
  }

  document.getElementById("btn-open").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleOpen();
  });
  document.getElementById("btn-deselect").addEventListener("click", (e) => {
    e.stopPropagation();
    _clearSelection();
    _hideInfoPanel();
  });

  panel.style.display = "flex";
}

function _hideInfoPanel() {
  const panel = document.getElementById("interaction-panel");
  if (panel) panel.style.display = "none";
}

function _btnStyle(type = "default") {
  const base = `
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s;
  `;
  if (type === "close") return base + "background: rgba(255,60,60,0.2);";
  if (type === "reset") return base + "background: rgba(100,200,255,0.2);";
  return base;
}

// ── Animação: Girar ─────────────────────────────────────────────────────────

/**
 * Liga/desliga animação de giro contínuo no modelo inteiro.
 */
export function toggleSpin() {
  if (isSpinning) {
    stopSpin();
  } else {
    startSpin();
  }
}

export function startSpin() {
  if (isSpinning || !_model) return;
  isSpinning = true;

  // Desabilita o OrbitControls enquanto está girando automaticamente
  if (_controls) _controls.enabled = false;

  spinCallbackRef = () => {
    if (_model) _model.rotation.y += 0.012;
  };

  if (_addToLoop) {
    _addToLoop(spinCallbackRef);
  }

  // Atualiza o botão visualmente
  const btn = document.getElementById("btn-spin");
  if (btn) btn.style.background = "rgba(80,160,255,0.35)";

  console.log("[Interactions] ▶ Girando.");
}

export function stopSpin() {
  if (!isSpinning) return;
  isSpinning = false;

  if (_removeFromLoop && spinCallbackRef) {
    _removeFromLoop(spinCallbackRef);
  }
  spinCallbackRef = null;

  if (_controls) _controls.enabled = true;

  const btn = document.getElementById("btn-spin");
  if (btn) btn.style.background = "rgba(255,255,255,0.1)";

  _updateInfoPanel();

  console.log("[Interactions] ⏸ Giro parado.");
}

// ── Animação: Reset de rotação ──────────────────────────────────────────

export function resetRotation() {
  if (isResetting || !_model) return;
  isResetting = true;

  if (_controls) _controls.enabled = false;

  const target = _model;
  const targetY = originalRotationY;

  resetCallbackRef = () => {
    if (!target) { _removeFromLoop && _removeFromLoop(resetCallbackRef); return; }
    const diff = targetY - target.rotation.y;
    if (Math.abs(diff) < 0.005) {
      target.rotation.y = targetY;
      _removeFromLoop && _removeFromLoop(resetCallbackRef);
      resetCallbackRef = null;
      isResetting = false;
      if (_controls) _controls.enabled = true;
      _updateInfoPanel();
    } else {
      target.rotation.y += diff * ANIM_SPEED * 3;
    }
  };

  if (_addToLoop) _addToLoop(resetCallbackRef);

  console.log("[Interactions] 🔄 Resetando rotação para original.");
}

function stopReset() {
  if (!isResetting) return;
  isResetting = false;

  if (_removeFromLoop && resetCallbackRef) {
    _removeFromLoop(resetCallbackRef);
  }
  resetCallbackRef = null;

  if (_controls) _controls.enabled = true;

  console.log("[Interactions] ⏸ Reset cancelado.");
}

function _updateInfoPanel() {
  if (selectedMesh) {
    _hideInfoPanel();
    _showInfoPanel(selectedMesh);
  }
}

// ── Animação: Abrir objeto (ex: porta de armário, gaveta) ───────────────────

const OPEN_ROTATION  = Math.PI / 2;  // 90° — simula porta abrindo

/**
 * Liga/desliga animação de abertura no mesh selecionado.
 * Se nenhum mesh estiver selecionado, anima o modelo inteiro.
 */
export function toggleOpen() {
  if (isOpen) {
    closeObject();
  } else {
    openObject();
  }
}

export function openObject() {
  if (isOpen) return;
  const target = selectedMesh || _model;
  if (!target) return;

  isOpen = true;
  const targetY = (target.rotation.y || 0) + OPEN_ROTATION;

  openAnimRef = () => {
    if (!target) { _removeFromLoop && _removeFromLoop(openAnimRef); return; }
    const diff = targetY - target.rotation.y;
    if (Math.abs(diff) < 0.005) {
      target.rotation.y = targetY;
      _removeFromLoop && _removeFromLoop(openAnimRef);
      openAnimRef = null;
    } else {
      target.rotation.y += diff * ANIM_SPEED * 3;
    }
  };

  if (_addToLoop) _addToLoop(openAnimRef);

  const btn = document.getElementById("btn-open");
  if (btn) { btn.style.background = "rgba(80,200,120,0.35)"; btn.textContent = "⇅ Fechar"; }

  console.log("[Interactions] 📂 Abrindo objeto.");
}

export function closeObject() {
  if (!isOpen) return;
  const target = selectedMesh || _model;
  if (!target) { isOpen = false; return; }

  isOpen = false;
  const targetY = (target.rotation.y || 0) - OPEN_ROTATION;

  const closeRef = () => {
    if (!target) { _removeFromLoop && _removeFromLoop(closeRef); return; }
    const diff = targetY - target.rotation.y;
    if (Math.abs(diff) < 0.005) {
      target.rotation.y = targetY;
      _removeFromLoop && _removeFromLoop(closeRef);
    } else {
      target.rotation.y += diff * ANIM_SPEED * 3;
    }
  };

  if (_addToLoop) _addToLoop(closeRef);

  const btn = document.getElementById("btn-open");
  if (btn) { btn.style.background = "rgba(255,255,255,0.1)"; btn.textContent = "⇅ Abrir"; }

  console.log("[Interactions] 📁 Fechando objeto.");
}

// ── Animação: Entrada (scale up) ────────────────────────────────────────────

function startEnter() {
  if (isEntering || !_model) return;
  isEntering = true;

  const target = _model;

  // Salva posição e escala originais
  const savedPos   = target.position.clone();
  const savedScale = target.scale.clone(); // escala já normalizada pelo viewer

  // Começa pequeno mas mantém a posição intacta
  target.scale.set(0.001, 0.001, 0.001);

  enterAnimRef = () => {
    if (!target) {
      _removeFromLoop?.(enterAnimRef);
      enterAnimRef = null;
      isEntering = false;
      return;
    }

    const diff = savedScale.x - target.scale.x;

    if (Math.abs(diff) < 0.01) {
      target.scale.copy(savedScale);
      target.position.copy(savedPos); // garante que não derivou
      _removeFromLoop?.(enterAnimRef);
      enterAnimRef = null;
      isEntering = false;
    } else {
      const s = target.scale.x + diff * ENTER_SCALE_SPEED;
      target.scale.set(s, s, s);
    }
  };

  _addToLoop?.(enterAnimRef);
}

function stopEnter() {
  if (!isEntering) return;
  isEntering = false;

  if (_removeFromLoop && enterAnimRef) {
    _removeFromLoop(enterAnimRef);
  }
  enterAnimRef = null;

  if (_model) {
    _model.scale.set(1.0, 1.0, 1.0);
  }

  console.log("[Interactions] ⏸ Entrada cancelada.");
}

// ── Getters de estado (para uso externo se necessário) ──────────────────────

export function getSelectedMesh()  { return selectedMesh; }
export function isObjectSpinning() { return isSpinning; }
export function isObjectOpen()     { return isOpen; }
