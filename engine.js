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
    .ro-win { 
      position: fixed !important; 
      width: 800px; 
      height: 550px; 
      background: #1b1b1f !important; 
      color: #fff !important; 
      font-family: sans-serif; 
      border-radius: 8px; 
      z-index: 2147483647 !important; 
      display: flex; 
      flex-direction: column; 
      border: 1px solid #444; 
      left: 50px; 
      top: 50px; 
      box-shadow: 0 20px 60px rgba(0,0,0,0.8); 
      overflow: hidden;
      pointer-events: auto !important;
    }
    .ro-bar { height: 38px; background: #222; display: flex; align-items: center; padding: 0 12px; cursor: move; border-bottom: 1px solid #333; user-select: none; }
    .ro-tabs { display: flex; background: #2b2b32; padding: 5px 5px 0 5px; gap: 2px; }
    .ro-tab { padding: 8px 18px; background: #333; font-size: 11px; cursor: pointer; border-radius: 4px 4px 0 0; color: #999; }
    .ro-tab.active { background: #1b1b1f; color: #fff; font-weight: bold; }
    .ro-body { flex: 1; display: flex; background: #1b1b1f; pointer-events: auto !important; }
    .ro-close { margin-left: auto; background: #ff4b4b; border: none; color: #fff; cursor: pointer; border-radius: 4px; padding: 2px 10px; font-weight: bold; }
    .side-panel { width: 260px; padding: 15px; border-right: 1px solid #333; display: flex; flex-direction: column; gap: 12px; background: #1b1b1f; z-index: 10; }
    #canvas-container { flex: 1; background: #0c0c0e; position: relative; cursor: grab; }
    .ro-input { background: #2a2a30; border: 1px solid #444; color: #fff; padding: 10px; border-radius: 4px; outline: none; width: calc(100% - 22px); pointer-events: auto !important; }
    .ro-btn-blue { background: #0084ff; border: none; color: #fff; padding: 10px; cursor: pointer !important; border-radius: 4px; font-weight: bold; font-size: 11px; width: 100%; pointer-events: auto !important; }
  `;
  document.head.appendChild(roStyle);

  var roWin = document.createElement('div');
  roWin.className = 'ro-win';
  roWin.innerHTML = `
    <div class="ro-bar"><span style="font-size:12px; font-weight:bold;">Roblox Browser Studio v0.4.3</span><button class="ro-close">X</button></div>
    <div class="ro-tabs"><div class="ro-tab active">3D Avatar</div><div class="ro-tab">World</div></div>
    <div class="ro-body">
      <div class="side-panel">
        <input type="text" id="u-in" class="ro-input" placeholder="Enter Username...">
        <button id="u-btn" class="ro-btn-blue">LOAD 3D AVATAR</button>
        <div style="margin-top:15px; font-size:10px; color:#555;">INTERACTABLE SHOP</div>
        <div style="background:#25252b; padding:12px; border-radius:8px; border:1px solid #333; text-align:center;">
          <div style="font-size:24px;">👕</div>
          <button class="ro-btn-blue" id="btn-wear-red" style="margin-top:10px;">WEAR RED</button>
        </div>
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
    roCam.position.set(0, 1, 11);
    roRenderer = new THREE.WebGLRenderer({ antialias: true });
    roRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(roRenderer.domElement);
    roScene.add(new THREE.AmbientLight(0xffffff, 1));
    
    roChar = new THREE.Group();
    var mkBox = (w, h, d, x, y, c) => {
      var g = new THREE.BoxGeometry(w, h, d);
      var m = new THREE.MeshLambertMaterial({ color: c });
      var ms = new THREE.Mesh(g, m);
      ms.position.set(x, y, 0);
      return ms;
    };

    roHead = mkBox(1.1, 1.1, 1.1, 0, 1.6, 0xffcc00);
    roTorso = mkBox(2, 2, 1, 0, 0, 0xcccccc);
    roChar.add(roHead, roTorso, mkBox(1,2,1,-1.5,0,0xcccccc), mkBox(1,2,1,1.5,0,0xcccccc), mkBox(1,-2,1,-0.5,-2.1,0xcccccc), mkBox(1,2,1,0.5,-2.1,0xcccccc));
    roScene.add(roChar);

    var drag = false, lastX = 0;
    container.onmousedown = (e) => { drag = true; lastX = e.clientX; };
    window.onmousemove = (e) => {
      if (drag) { roChar.rotation.y += (e.clientX - lastX) * 0.02; lastX = e.clientX; }
    };
    window.onmouseup = () => { drag = false; };
    
    function loop() { requestAnimationFrame(loop); roRenderer.render(roScene, roCam); }
    loop();
  }
  init3D();

  // Interaction: Wear Red
  document.getElementById('btn-wear-red').onclick = () => {
    roTorso.material.color.setHex(0xff0000);
    console.log("Shirt Changed!");
  };

  // Interaction: Load User
  document.getElementById('u-btn').onclick = async function() {
    var val = document.getElementById('u-in').value;
    if(!val) return;
    try {
      var r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({usernames: [val], excludeBannedUsers: true})
      });
      var d = await r.json();
      if(d.data && d.data[0]) {
        var loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        var url = 'https://corsproxy.io/?' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+d.data[0].id+'&width=150&height=150&format=png');
        roHead.material = new THREE.MeshLambertMaterial({ map: loader.load(url) });
      }
    } catch(e) {}
  };

  // Interaction: Move Window
  var mv = false, mx, my;
  roWin.querySelector('.ro-bar').onmousedown = (e) => { mv = true; mx = e.clientX - roWin.offsetLeft; my = e.clientY - roWin.offsetTop; };
  window.onmousemove = (e) => { if(mv) { roWin.style.left = (e.clientX - mx) + 'px'; roWin.style.top = (e.clientY - my) + 'px'; } };
  window.onmouseup = () => { mv = false; };
  roWin.querySelector('.ro-close').onclick = () => { roWin.remove(); roStyle.remove(); window.__roStudioLoaded = false; };
}
