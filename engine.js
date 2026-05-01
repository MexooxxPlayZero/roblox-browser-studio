{
  // 1. CLEANUP & INITIALIZATION
  if (window.__roStudioLoaded) {
    var oldWin = document.querySelector('.ro-win');
    if(oldWin) oldWin.remove();
    var oldStyle = document.getElementById('ro-style');
    if(oldStyle) oldStyle.remove();
  }
  window.__roStudioLoaded = true;

  // 2. LOAD THREE.JS (Only if missing)
  if (!window.THREE) {
    var loaderScript = document.createElement('script');
    loaderScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    document.head.appendChild(loaderScript);
  }

  // 3. STYLES (Solid Backgrounds)
  var style = document.createElement('style');
  style.id = 'ro-style';
  style.textContent = `
    .ro-win { position: fixed; width: 800px; height: 550px; background: #1b1b1f !important; color: #fff; font-family: sans-serif; border-radius: 8px; z-index: 999999; display: flex; flex-direction: column; border: 2px solid #333; left: 50px; top: 50px; box-shadow: 0 20px 50px #000; overflow: hidden; }
    .ro-bar { height: 35px; background: #222; display: flex; align-items: center; padding: 0 10px; cursor: move; border-bottom: 1px solid #444; }
    .ro-tabs { display: flex; background: #2b2b32; padding: 5px 5px 0 5px; gap: 2px; }
    .ro-tab { padding: 8px 15px; background: #333; font-size: 11px; cursor: pointer; border-radius: 4px 4px 0 0; color: #999; }
    .ro-tab.active { background: #1b1b1f; color: #fff; font-weight: bold; }
    .ro-body { flex: 1; display: flex; background: #1b1b1f; }
    .ro-close { margin-left: auto; background: #ff4b4b; border: none; color: #fff; cursor: pointer; border-radius: 4px; padding: 2px 8px; font-weight: bold; }
    .side-panel { width: 260px; padding: 15px; border-right: 1px solid #333; display: flex; flex-direction: column; gap: 12px; background: #1b1b1f; }
    #canvas-container { flex: 1; background: #0c0c0e; position: relative; cursor: grab; }
    #canvas-container:active { cursor: grabbing; }
    .ro-input { background: #222; border: 1px solid #444; color: #fff; padding: 10px; border-radius: 4px; outline: none; }
    .ro-btn-blue { background: #0084ff; border: none; color: #fff; padding: 8px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 11px; }
  `;
  document.head.appendChild(style);

  // 4. UI STRUCTURE
  var win = document.createElement('div');
  win.className = 'ro-win';
  win.innerHTML = `
    <div class="ro-bar"><span>Roblox Browser Studio v0.4.1</span><button class="ro-close">X</button></div>
    <div class="ro-tabs"><div class="ro-tab active">Avatar 3D</div><div class="ro-tab">Studio</div></div>
    <div class="ro-body">
      <div class="side-panel">
        <input type="text" id="u-in" class="ro-input" placeholder="Username...">
        <button id="u-btn" class="ro-btn-blue">LOAD 3D PLAYER</button>
        <div style="margin-top:10px; font-size:10px; color:#666;">ITEM SHOP (R6)</div>
        <div style="background:#25252b; padding:10px; border-radius:6px; border:1px solid #333;">
          <div style="margin-bottom:5px; font-size:11px;">👕 Roblox Classic</div>
          <button class="ro-btn-blue" style="background:#444;">WEAR</button>
        </div>
      </div>
      <div id="canvas-container">
        <div style="position:absolute; bottom:10px; left:10px; font-size:9px; color:#444; pointer-events:none;">HOLD RIGHT-CLICK TO ROTATE</div>
      </div>
    </div>
  `;
  document.body.appendChild(win);

  // 5. 3D ENGINE LOGIC
  var scene, camera, renderer, charGroup, headMesh;

  function initEngine() {
    if (!window.THREE) { setTimeout(initEngine, 100); return; }
    
    var container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    
    charGroup = new THREE.Group();
    var createBox = (w, h, d, x, y, color) => {
      var g = new THREE.BoxGeometry(w, h, d);
      var m = new THREE.MeshLambertMaterial({ color: color });
      var mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, 0);
      return mesh;
    };

    headMesh = createBox(1.1, 1.1, 1.1, 0, 1.6, 0xffcc00);
    charGroup.add(headMesh); // Head
    charGroup.add(createBox(2, 2, 1, 0, 0, 0xcccccc));      // Torso
    charGroup.add(createBox(1, 2, 1, -1.5, 0, 0xcccccc));   // L-Arm
    charGroup.add(createBox(1, 2, 1, 1.5, 0, 0xcccccc));    // R-Arm
    charGroup.add(createBox(1, 2, 1, -0.5, -2.1, 0xcccccc));// L-Leg
    charGroup.add(createBox(1, 2, 1, 0.5, -2.1, 0xcccccc)); // R-Leg
    
    scene.add(charGroup);

    // 3D Rotation (Hold Right Click)
    var isDragging = false;
    var lastX = 0;
    container.onmousedown = (e) => { isDragging = true; lastX = e.clientX; };
    window.onmousemove = (e) => {
      if (isDragging) {
        charGroup.rotation.y += (e.clientX - lastX) * 0.01;
        lastX = e.clientX;
      }
    };
    window.onmouseup = () => { isDragging = false; };
    container.oncontextmenu = (e) => e.preventDefault();

    function renderLoop() {
      requestAnimationFrame(renderLoop);
      renderer.render(scene, camera);
    }
    renderLoop();
  }
  initEngine();

  // 6. LOAD PLAYER LOGIC
  win.querySelector('#u-btn').onclick = async function() {
    var name = win.querySelector('#u-in').value;
    if(!name) return;
    try {
      var r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({usernames: [name], excludeBannedUsers: true})
      });
      var d = await r.json();
      if(d.data && d.data[0]) {
        var id = d.data[0].id;
        var texLoader = new THREE.TextureLoader();
        texLoader.setCrossOrigin('anonymous');
        var headUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+id+'&width=150&height=150&format=png');
        headMesh.material = new THREE.MeshLambertMaterial({ map: texLoader.load(headUrl) });
      }
    } catch (err) { console.error("Avatar fetch failed."); }
  };

  // 7. DRAG & CLOSE UI
  var isMoving = false, mX, mY;
  win.querySelector('.ro-bar').onmousedown = (e) => { isMoving = true; mX = e.clientX - win.offsetLeft; mY = e.clientY - win.offsetTop; };
  window.onmousemove = (e) => { if(isMoving) { win.style.left = (e.clientX - mX) + 'px'; win.style.top = (e.clientY - mY) + 'px'; } };
  window.onmouseup = () => { isMoving = false; };
  win.querySelector('.ro-close').onclick = () => { win.remove(); style.remove(); window.__roStudioLoaded = false; };
}
