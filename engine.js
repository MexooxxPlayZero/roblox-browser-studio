{
  // 1. CLEANUP PREVIOUS RUNS
  if (window.__roStudioLoaded) {
    var checkWin = document.querySelector('.ro-win');
    if(checkWin) checkWin.remove();
    var checkStyle = document.getElementById('ro-core-style');
    if(checkStyle) checkStyle.remove();
  }
  window.__roStudioLoaded = true;

  // 2. STYLES (Solid Backgrounds & Fixed Z-Index)
  var roStyle = document.createElement('style');
  roStyle.id = 'ro-core-style';
  roStyle.textContent = `
    .ro-win { position: fixed; width: 800px; height: 550px; background: #1b1b1f !important; color: #fff; font-family: sans-serif; border-radius: 8px; z-index: 9999999; display: flex; flex-direction: column; border: 1px solid #444; left: 50px; top: 50px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); overflow: hidden; }
    .ro-bar { height: 38px; background: #222; display: flex; align-items: center; padding: 0 12px; cursor: move; border-bottom: 1px solid #333; user-select: none; }
    .ro-tabs { display: flex; background: #2b2b32; padding: 5px 5px 0 5px; gap: 2px; }
    .ro-tab { padding: 8px 18px; background: #333; font-size: 11px; cursor: pointer; border-radius: 4px 4px 0 0; color: #999; }
    .ro-tab.active { background: #1b1b1f; color: #fff; font-weight: bold; }
    .ro-body { flex: 1; display: flex; background: #1b1b1f; }
    .ro-close { margin-left: auto; background: #ff4b4b; border: none; color: #fff; cursor: pointer; border-radius: 4px; padding: 2px 10px; font-weight: bold; }
    .side-panel { width: 260px; padding: 15px; border-right: 1px solid #333; display: flex; flex-direction: column; gap: 12px; background: #1b1b1f; }
    #canvas-container { flex: 1; background: #0c0c0e; position: relative; cursor: grab; }
    .ro-input { background: #2a2a30; border: 1px solid #444; color: #fff; padding: 10px; border-radius: 4px; outline: none; width: calc(100% - 22px); }
    .ro-btn-blue { background: #0084ff; border: none; color: #fff; padding: 10px; cursor: pointer; border-radius: 4px; font-weight: bold; font-size: 11px; width: 100%; }
    .ro-btn-blue:hover { background: #0095ff; }
  `;
  document.head.appendChild(roStyle);

  // 3. UI STRUCTURE
  var roWin = document.createElement('div');
  roWin.className = 'ro-win';
  roWin.innerHTML = `
    <div class="ro-bar"><span style="font-size:12px; font-weight:bold; color:#eee;">Roblox Browser Studio v0.4.2</span><button class="ro-close">X</button></div>
    <div class="ro-tabs"><div class="ro-tab active">3D Avatar</div><div class="ro-tab">World</div></div>
    <div class="ro-body">
      <div class="side-panel">
        <input type="text" id="u-in" class="ro-input" placeholder="Roblox Username...">
        <button id="u-btn" class="ro-btn-blue">LOAD 3D AVATAR</button>
        <div style="margin-top:15px; font-size:10px; color:#555; letter-spacing:1px;">CATALOG</div>
        <div style="background:#25252b; padding:12px; border-radius:8px; border:1px solid #333; text-align:center;">
          <div style="font-size:24px; margin-bottom:5px;">👕</div>
          <div style="font-size:11px; margin-bottom:10px; color:#bbb;">Classic Builder Shirt</div>
          <button class="ro-btn-blue" style="background:#3a3a42;">WEAR ITEM</button>
        </div>
      </div>
      <div id="canvas-container">
        <div style="position:absolute; bottom:15px; width:100%; text-align:center; font-size:10px; color:#444; pointer-events:none;">CLICK + DRAG TO ROTATE</div>
      </div>
    </div>
  `;
  document.body.appendChild(roWin);

  // 4. 3D ENGINE
  var roScene, roCam, roRenderer, roChar, roHeadMesh;

  function roInit3D() {
    if (!window.THREE) {
      var threeLoad = document.createElement('script');
      threeLoad.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      threeLoad.onload = roInit3D;
      document.head.appendChild(threeLoad);
      return;
    }
    
    var container = document.getElementById('canvas-container');
    if(!container) return;

    roScene = new THREE.Scene();
    roCam = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    roCam.position.set(0, 1, 11);

    roRenderer = new THREE.WebGLRenderer({ antialias: true });
    roRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(roRenderer.domElement);

    roScene.add(new THREE.AmbientLight(0xffffff, 0.9));
    
    roChar = new THREE.Group();
    var createBox = (w, h, d, x, y, color) => {
      var g = new THREE.BoxGeometry(w, h, d);
      var m = new THREE.MeshLambertMaterial({ color: color });
      var mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, 0);
      return mesh;
    };

    roHeadMesh = createBox(1.1, 1.1, 1.1, 0, 1.6, 0xffcc00);
    roChar.add(roHeadMesh);
    roChar.add(createBox(2, 2, 1, 0, 0, 0xcccccc));      // Torso
    roChar.add(createBox(1, 2, 1, -1.5, 0, 0xcccccc));   // L-Arm
    roChar.add(createBox(1, 2, 1, 1.5, 0, 0xcccccc));    // R-Arm
    roChar.add(createBox(1, 2, 1, -0.5, -2.1, 0xcccccc));// L-Leg
    roChar.add(createBox(1, 2, 1, 0.5, -2.1, 0xcccccc)); // R-Leg
    
    roScene.add(roChar);

    var isDrag = false, lX = 0;
    container.onmousedown = (e) => { isDrag = true; lX = e.clientX; };
    window.onmousemove = (e) => {
      if (isDrag) {
        roChar.rotation.y += (e.clientX - lX) * 0.015;
        lX = e.clientX;
      }
    };
    window.onmouseup = () => { isDrag = false; };
    container.oncontextmenu = (e) => e.preventDefault();

    function roLoop() {
      requestAnimationFrame(roLoop);
      roRenderer.render(roScene, roCam);
    }
    roLoop();
  }
  roInit3D();

  // 5. SEARCH LOGIC
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
        var headUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+d.data[0].id+'&width=150&height=150&format=png');
        roHeadMesh.material = new THREE.MeshLambertMaterial({ map: loader.load(headUrl) });
      }
    } catch (e) { console.log("Load error"); }
  };

  // 6. DRAG WINDOW
  var isMove = false, mX, mY;
  roWin.querySelector('.ro-bar').onmousedown = (e) => { isMove = true; mX = e.clientX - roWin.offsetLeft; mY = e.clientY - roWin.offsetTop; };
  window.onmousemove = (e) => { if(isMove) { roWin.style.left = (e.clientX - mX) + 'px'; roWin.style.top = (e.clientY - mY) + 'px'; } };
  window.onmouseup = () => { isMove = false; };
  roWin.querySelector('.ro-close').onclick = () => { roWin.remove(); roStyle.remove(); window.__roStudioLoaded = false; };
}
