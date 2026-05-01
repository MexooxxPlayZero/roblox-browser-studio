{
  if (window.__roStudioLoaded) {
    var oldWin = document.querySelector('.ro-win');
    if(oldWin) oldWin.remove();
    var oldStyle = document.getElementById('ro-core-style');
    if(oldStyle) oldStyle.remove();
  }
  window.__roStudioLoaded = true;

  var roStyle = document.createElement('style');
  roStyle.id = 'ro-core-style';
  roStyle.textContent = `
    .ro-win { position: fixed !important; width: 800px; height: 550px; background: #1b1b1f !important; color: #fff !important; font-family: sans-serif; border-radius: 8px; z-index: 2147483647 !important; display: flex; flex-direction: column; border: 1px solid #444; left: 50px; top: 50px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); overflow: hidden; pointer-events: auto !important; }
    .ro-bar { height: 38px; background: #222; display: flex; align-items: center; padding: 0 12px; cursor: move; border-bottom: 1px solid #333; user-select: none; }
    .ro-body { flex: 1; display: flex; background: #1b1b1f; pointer-events: auto !important; }
    .ro-close { margin-left: auto; background: #ff4b4b; border: none; color: #fff; cursor: pointer; border-radius: 4px; padding: 2px 10px; font-weight: bold; }
    .side-panel { width: 260px; padding: 15px; border-right: 1px solid #333; display: flex; flex-direction: column; gap: 12px; background: #1b1b1f; z-index: 10; }
    #canvas-container { flex: 1; background: #0c0c0e; position: relative; cursor: grab; }
    .ro-input { background: #2a2a30; border: 1px solid #444; color: #fff; padding: 10px; border-radius: 4px; outline: none; width: calc(100% - 22px); pointer-events: auto !important; }
    .ro-btn-blue { background: #0084ff; border: none; color: #fff; padding: 10px; cursor: pointer !important; border-radius: 4px; font-weight: bold; font-size: 11px; width: 100%; pointer-events: auto !important; margin-top: 5px; }
  `;
  document.head.appendChild(roStyle);

  var roWin = document.createElement('div');
  roWin.className = 'ro-win';
  roWin.innerHTML = `
    <div class="ro-bar"><span style="font-size:12px; font-weight:bold;">Roblox Browser Studio v0.4.4</span><button class="ro-close">X</button></div>
    <div class="ro-body">
      <div class="side-panel">
        <input type="text" id="u-in" class="ro-input" placeholder="User ID (e.g. 1)">
        <button id="u-btn" class="ro-btn-blue">LOAD BY ID</button>
        <p style="font-size:9px; color:#666;">Note: Use UserID if name-search is blocked by CORS.</p>
        <hr style="border:0; border-top:1px solid #333; width:100%;">
        <div style="font-size:10px; color:#555;">INTERACTABLE SHOP</div>
        <button class="ro-btn-blue" id="btn-wear-red">WEAR RED SHIRT</button>
        <button class="ro-btn-blue" id="btn-wear-blue" style="background:#0055ff;">WEAR BLUE SHIRT</button>
        <button class="ro-btn-blue" id="btn-reset-char" style="background:#444;">RESET COLOR</button>
      </div>
      <div id="canvas-container"></div>
    </div>
  `;
  document.body.appendChild(roWin);

  var roScene, roCam, roRenderer, roChar, roHead, roTorso;

  function init3D() {
    if (!window.THREE) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = init3D;
      document.head.appendChild(s);
      return;
    }
    
    var container = document.getElementById('canvas-container');
    roScene = new THREE.Scene();
    roCam = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    roCam.position.set(0, 1, 12);
    roRenderer = new THREE.WebGLRenderer({ antialias: true });
    roRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(roRenderer.domElement);
    roScene.add(new THREE.AmbientLight(0xffffff, 1.2));
    
    roChar = new THREE.Group();
    var mkBox = (w, h, d, x, y,
