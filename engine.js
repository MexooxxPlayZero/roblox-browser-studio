{
  // Cleanup old window if it exists
  if (window.__roStudioLoaded) {
    var oldWin = document.querySelector('.ro-win');
    if(oldWin) oldWin.remove();
  }
  window.__roStudioLoaded = true;

  // Load Three.js safely
  if (!window.THREE) {
    var threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    document.head.appendChild(threeScript);
  }

  var styleId = 'ro-studio-style';
  var oldStyle = document.getElementById(styleId);
  if(oldStyle) oldStyle.remove();

  var style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .ro-win { position: fixed; width: 800px; height: 550px; background: #1b1b1f !important; color: #fff; font-family: sans-serif; border-radius: 8px; z-index: 999999; display: flex; flex-direction: column; border: 2px solid #333; left: 50px; top: 50px; box-shadow: 0 20px 50px #000; overflow: hidden; opacity: 1 !important; }
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
    .item-card { background: #25252b; border: 1px solid #444; padding: 8px; border-radius: 6px; text-align: center; margin-bottom: 8px; font-size: 11px; }
    .ro-btn-blue { background: #0084ff; border: none; color: #fff; padding: 6px; cursor: pointer; border-radius: 4px; width: 100%; font-weight: bold; }
  `;
  document.head.appendChild(style);

  var win = document.createElement('div');
  win.className = 'ro-win';
  win.innerHTML = `
    <div class="ro-bar"><span style="font-size:12px; font-weight:bold;">Roblox Browser Studio v0.4.1</span><button class="ro-close">X</button></div>
    <div class="ro-tabs"><div class="ro-tab active">Avatar Editor</div><div class="ro-tab">World Studio</div></div>
    <div class="ro-body">
      <div class="ro-pane active">
        <div class="side-panel">
          <input type="text" id="u-in" style="background:#222; border:1px solid #444; color:#fff; padding:8px; border-radius:4px;" placeholder="Username...">
          <button id="u-btn" class="ro-btn-blue">Load 3D Player</button>
          <div style="font-size:11px; color:#888; margin-top:10px;">SHOP ITEMS</div>
          <div class="item-card">👕 Red Shirt <button class="ro-btn-blue" id="wear-shirt" style="margin-top:5px;">WEAR</button></div>
          <div class="item-card">👖 Blue Pants <button class="ro-btn-blue" id="wear-pants" style="margin-top:5px;">WEAR</button></div>
        </div>
        <div id="canvas-container"><div style="position:absolute; top:10px; left:10px; font-size:10px; color:#555; pointer-events:none;">RIGHT CLICK + DRAG TO ROTATE</div></div>
      </div>
    </div>
  `;
  document.body.appendChild(win);

  // --- 3D ENGINE ---
  var scene, camera, renderer, charGroup, headMesh;

  function run3D() {
    if (!window.THREE) { setTimeout(run3D, 100); return; }
    var container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    
    charGroup = new THREE.Group();
    var createP = (w, h, d, y, x, color) => {
      var g = new THREE.BoxGeometry(w, h, d);
      var m = new THREE.MeshLambertMaterial({ color: color });
      var mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, 0);
      return mesh;
    };

    headMesh = createP(1, 1, 1, 1.6, 0, 0xffcc00);
    charGroup.add(headMesh);
    charGroup.add(createP(2, 2, 1, 0, 0, 0xcccccc)); // torso
    charGroup.add(createP(1, 2, 1, 0, -1.5, 0xcccccc)); // larm
    charGroup.add(createP(1, 2, 1, 0, 1.5, 0xcccccc)); // rarm
    charGroup.add(createP(1, 2, 1, -2, -0.5, 0xcccccc)); // lleg
    charGroup.add(createP(1, 2, 1, -2, 0.5, 0xcccccc)); // rleg
    scene.add(charGroup);

    var isDragging = false, lastX = 0;
    container.onmousedown = (e) => { isDragging = true; };
    window.onmouseup = () => isDragging = false;
    window.onmousemove = (e) => {
      if (isDragging) { charGroup.rotation.y += (e.clientX - lastX) * 0.01; }
      lastX = e.clientX;
    };
    container.oncontextmenu = (e) => e.preventDefault();
    function anim() { requestAnimationFrame(anim); renderer.render(scene, camera); }
    anim();
  }
  run3D();

  // Search Logic
  win.querySelector('#u-btn').onclick = async () => {
    var name = win.querySelector('#u-in').value;
    if(!name) return;
    try {
      var r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({usernames: [name], excludeBannedUsers: true})
      });
      var d = await r.json();
      if(d.data && d.data[0]) {
        var loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        var tex = loader.load('https://corsproxy.io/?' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+d.data[0].id+'&width=150&height=150&format=png'));
        headMesh.material = new THREE.MeshLambertMaterial({ map: tex });
      }
    } catch (e) { console.log("Search failed"); }
  };

  // Drag/Close
  var drg=false, dx, dy;
  win.querySelector('.ro-bar').onmousedown=(e)=>{drg=true; dx=e.clientX-win.offsetLeft; dy=e.clientY-win.offsetTop;};
  window.onmousemove=(e)=>{if(drg){win.style.left=(e.clientX-dx)+'px';win.style.top=(e.clientY-dy)+'px';}};
  window.onmouseup=()=>{drg=false;};
  win.querySelector('.ro-close').onclick=()=>{win.remove(); style.remove(); window.__roStudioLoaded=false;};
}
