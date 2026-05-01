if (window.__roStudioLoaded) {
  document.querySelector('.ro-win')?.remove();
}
window.__roStudioLoaded = true;

// Inject Three.js for 3D Rendering
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
document.head.appendChild(script);

const style = document.createElement('style');
style.textContent = `
  .ro-win { position: fixed; width: 800px; height: 550px; background: #1b1b1f; color: #fff; font-family: sans-serif; border-radius: 8px; z-index: 999999; display: flex; flex-direction: column; border: 2px solid #333; left: 50px; top: 50px; box-shadow: 0 20px 50px #000; overflow: hidden; opacity: 1 !important; }
  .ro-bar { height: 35px; background: #222; display: flex; align-items: center; padding: 0 10px; cursor: move; border-bottom: 1px solid #333; }
  .ro-tabs { display: flex; background: #2b2b32; padding: 5px 5px 0 5px; gap: 2px; }
  .ro-tab { padding: 8px 15px; background: #333; font-size: 11px; cursor: pointer; border-radius: 4px 4px 0 0; color: #999; }
  .ro-tab.active { background: #1b1b1f; color: #fff; font-weight: bold; }
  .ro-body { flex: 1; display: flex; background: #1b1b1f; overflow: hidden; }
  .ro-pane { display: none; width: 100%; height: 100%; flex-direction: row; }
  .ro-pane.active { display: flex; }
  .ro-close { margin-left: auto; background: #ff4b4b; border: none; color: #fff; cursor: pointer; border-radius: 4px; padding: 2px 8px; }
  
  .side-panel { width: 250px; padding: 15px; border-right: 1px solid #333; display: flex; flex-direction: column; gap: 10px; z-index: 10; background: #1b1b1f; }
  #canvas-container { flex: 1; background: #000; position: relative; cursor: grab; }
  #canvas-container:active { cursor: grabbing; }
  
  .item-card { background: #25252b; border: 1px solid #444; padding: 8px; border-radius: 6px; text-align: center; margin-bottom: 8px; font-size: 11px; }
  .ro-btn-blue { background: #0084ff; border: none; color: #fff; padding: 6px; cursor: pointer; border-radius: 4px; width: 100%; font-weight: bold; }
`;
document.head.appendChild(style);

const win = document.createElement('div');
win.className = 'ro-win';
win.innerHTML = `
  <div class="ro-bar">
    <span style="font-size:12px; font-weight:bold; color:#fff;">Roblox Browser Studio v0.4 [3D VIEW]</span>
    <button class="ro-close">X</button>
  </div>
  <div class="ro-tabs">
    <div class="ro-tab active">Avatar Editor</div>
    <div class="ro-tab">World Studio</div>
  </div>
  <div class="ro-body">
    <div class="ro-pane active">
      <div class="side-panel">
        <input type="text" id="u-in" style="background:#222; border:1px solid #444; color:#fff; padding:8px; border-radius:4px;" placeholder="Username...">
        <button id="u-btn" class="ro-btn-blue">Load 3D Player</button>
        <div style="font-size:11px; color:#888; margin-top:10px;">SHOP ITEMS</div>
        <div class="item-card">👕 Red Shirt <button class="ro-btn-blue" id="wear-shirt" style="margin-top:5px;">WEAR</button></div>
        <div class="item-card">👖 Blue Pants <button class="ro-btn-blue" id="wear-pants" style="margin-top:5px;">WEAR</button></div>
      </div>
      <div id="canvas-container">
        <div style="position:absolute; top:10px; left:10px; font-size:10px; color:#555; pointer-events:none;">RIGHT CLICK + DRAG TO ROTATE</div>
      </div>
    </div>
  </div>
`;

document.body.appendChild(win);

// --- THREE.JS 3D ENGINE ---
let scene, camera, renderer, character, head;

function init3D() {
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);
  
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 2, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  // Build R6 Character Group
  character = new THREE.Group();
  
  const createPart = (w, h, d, y, color) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshLambertMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = y;
    return mesh;
  };

  head = createPart(1, 1, 1, 1.6, 0xffcc00); // Head
  const torso = createPart(2, 2, 1, 0, 0xdddddd); // Torso
  const lArm = createPart(1, 2, 1, 0, 0xdddddd); lArm.position.set(-1.5, 0, 0);
  const rArm = createPart(1, 2, 1, 0, 0xdddddd); rArm.position.set(1.5, 0, 0);
  const lLeg = createPart(1, 2, 1, -2, 0xdddddd); lLeg.position.set(-0.5, -2, 0);
  const rLeg = createPart(1, 2, 1, -2, 0xdddddd); rLeg.position.set(0.5, -2, 0);

  character.add(head, torso, lArm, rArm, lLeg, rLeg);
  scene.add(character);

  // Rotation Logic (Right Click to Drag)
  let isDragging = false;
  let previousMouseX = 0;

  container.onmousedown = (e) => { if(e.button === 2 || e.button === 0) isDragging = true; };
  window.onmouseup = () => isDragging = false;
  window.onmousemove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - previousMouseX;
      character.rotation.y += deltaX * 0.01;
    }
    previousMouseX = e.clientX;
  };
  container.oncontextmenu = (e) => e.preventDefault(); // Prevent menu on right click

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

// Initialize 3D after script loads
script.onload = () => {
  setTimeout(init3D, 100);
};

// Search Logic
win.querySelector('#u-btn').onclick = async () => {
  const name = win.querySelector('#u-in').value;
  if(!name) return;
  try {
    const response = await fetch(`https://corsproxy.io/?https://users.roblox.com/v1/usernames/users`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({usernames: [name], excludeBannedUsers: true})
    });
    const data = await response.json();
    if(data.data && data.data[0]) {
      const id = data.data[0].id;
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      const texture = loader.load(`https://corsproxy.io/?https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=150&height=150&format=png`);
      head.material = new THREE.MeshLambertMaterial({ map: texture });
    }
  } catch (e) { alert("CORS Blocked User Fetch"); }
};

// Drag & Close Window Logic
let d=false,ox,oy;
win.querySelector('.ro-bar').onmousedown=(e)=>{d=true;ox=e.clientX-win.offsetLeft;oy=e.clientY-win.offsetTop;};
window.onmousemove=(e)=>{if(d){win.style.left=(e.clientX-ox)+'px';win.style.top=(e.clientY-oy)+'px';}};
window.onmouseup=()=>{d=false;};
win.querySelector('.ro-close').onclick=()=>{win.remove();style.remove();window.__roStudioLoaded=false;};
