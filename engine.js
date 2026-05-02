{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = ".ro-win{position:fixed!important;width:850px;height:600px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:8px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:50px;top:50px;box-shadow:0 20px 60px #000;overflow:hidden}.ro-bar{height:38px;background:#222;display:flex;align-items:center;padding:0 12px;cursor:move;border-bottom:1px solid #333}.ro-body{flex:1;display:flex;background:#1b1b1f}#canvas-container{flex:1;background:#000!important;position:relative;cursor:grab;border-left:1px solid #333}.side-panel{width:280px;padding:15px;border-right:1px solid #333;display:flex;flex-direction:column;gap:10px;background:#1b1b1f;overflow-y:auto}.ro-input{background:#2a2a30;border:1px solid #444;color:#fff;padding:8px;border-radius:4px;width:calc(100% - 20px);font-size:12px}.ro-btn-blue{background:#0084ff;border:none;color:#fff;padding:10px;cursor:pointer;border-radius:4px;font-weight:bold;font-size:11px;width:100%}.ro-btn-green{background:#28a745;border:none;color:#fff;padding:10px;cursor:pointer;border-radius:4px;font-weight:bold;font-size:11px;width:100%}.ro-close{margin-left:auto;background:#ff4b4b;border:none;color:#fff;cursor:pointer;border-radius:4px;padding:2px 10px}label{font-size:10px;color:#888;margin-top:5px;text-transform:uppercase;letter-spacing:1px}";
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.innerHTML = `
      <div class="ro-bar"><span>Roblox Studio v0.5.6 [PART COLOR FIX]</span><button class="ro-close">X</button></div>
      <div class="ro-body">
        <div class="side-panel">
          <label>1. Global Paint (All Parts)</label>
          <input type="color" id="color-global" style="width:100%;height:30px;cursor:pointer" value="#cccccc">
          
          <hr style="border:0;border-top:1px solid #333;margin:10px 0">
          
          <label>2. Targeted Part Editor</label>
          <select id="part-select" class="ro-input">
            <option value="head">Head</option>
            <option value="torso">Torso</option>
            <option value="larm">Left Arm</option>
            <option value="rarm">Right Arm</option>
            <option value="lleg">Left Leg</option>
            <option value="rleg">Right Leg</option>
          </select>
          
          <div style="display:flex; gap:5px; align-items:center; margin-top:5px;">
            <input type="color" id="color-part" style="flex:1; height:40px; cursor:pointer" value="#0084ff">
            <button id="btn-apply-part" class="ro-btn-green" style="flex:2">PAINT SELECTED</button>
          </div>

          <hr style="border:0;border-top:1px solid #333;margin:10px 0">
          
          <label>3. Advanced Image</label>
          <input type="text" id="img-url" class="ro-input" placeholder="Paste Image URL...">
          <button id="btn-apply-img" class="ro-btn-blue" style="background:#444">Apply to Selected Part</button>
          
          <label style="margin-top:20px">User Loader</label>
          <input type="text" id="u-in" class="ro-input" placeholder="Username/ID">
          <button id="u-btn" class="ro-btn-blue">FETCH PLAYER</button>
          
          <button id="btn-reset" class="ro-btn-blue" style="background:#ff4b4b;margin-top:20px">FULL RESET</button>
        </div>
        <div id="canvas-container"></div>
      </div>`;
    document.body.appendChild(roWin);

    var scene, cam, rend, char, parts = {};
    var init3D = () => {
      if (!window.THREE) return setTimeout(init3D, 100);
      var con = document.getElementById('canvas-container');
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(45, con.clientWidth/con.clientHeight, 0.1, 1000);
      cam.position.set(0, 1, 12);
      rend = new THREE.WebGLRenderer({antialias:true});
      rend.setSize(con.clientWidth, con.clientHeight);
      rend.setClearColor(0x000000, 1);
      con.appendChild(rend.domElement);
      scene.add(new THREE.AmbientLight(0xffffff, 1.4));
      
      char = new THREE.Group();
      var mk = (w,h,d,x,y) => {
        var m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color:0xcccccc}));
        m.position.set(x,y,0); return m;
      };
      parts.head = mk(1.2,1.2,1.2,0,1.8); parts.head.material.color.setHex(0xffcc00);
      parts.torso = mk(2,2,1,0,0);
      parts.larm = mk(1,2,1,-1.5,0);
      parts.rarm = mk(1,2,1,1.5,0);
      parts.lleg = mk(1,2,1,-0.5,-2.1);
      parts.rleg = mk(1,2,1,0.5,-2.1);
      
      Object.values(parts).forEach(p => char.add(p));
      scene.add(char);

      var drg = false, lx, ly;
      con.onmousedown = (e) => { drg = true; lx = e.clientX; ly = e.clientY; };
      window.onmousemove = (e) => {
        if (drg) {
          char.rotation.y += (e.clientX - lx) * 0.01;
          var nX = char.rotation.x + (e.clientY - ly) * 0.01;
          if(nX > -0.7 && nX < 0.7) char.rotation.x = nX;
          lx = e.clientX; ly = e.clientY;
        }
      };
      window.onmouseup = () => drg = false;
      var anim = () => { requestAnimationFrame(anim); rend.render(scene, cam); };
      anim();
    };

    if (!window.THREE) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = init3D;
      document.head.appendChild(s);
    } else { init3D(); }

    // 1. Global Color (Still exists, but you use it for the base)
    document.getElementById('color-global').oninput = (e) => {
      Object.values(parts).forEach(p => p.material.color.set(e.target.value));
    };

    // 2. TARGETED PART PAINTING (The fix!)
    document.getElementById('btn-apply-part').onclick = () => {
      var target = document.getElementById('part-select').value;
      var color = document.getElementById('color-part').value;
      // We create a unique material so it doesn't share with others
      parts[target].material = new THREE.MeshLambertMaterial({color: color});
    };

    // 3. Image Logic
    document.getElementById('btn-apply-img').onclick = () => {
      var p = document.getElementById('part-select').value;
      var url = document.getElementById('img-url').value;
      if(!url) return;
      new THREE.TextureLoader().load(url, (t) => {
        parts[p].material = new THREE.MeshLambertMaterial({map: t});
      });
    };

    // Player Loader
    document.getElementById('u-btn').onclick = async () => {
      var val = document.getElementById('u-in').value;
      if(!val) return;
      var id = val;
      if (isNaN(val)) {
        var r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({usernames: [val], excludeBannedUsers: true})
        });
        var d = await r.json();
        if(d.data && d.data[0]) id = d.data[0].id;
      }
      var tUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+id+'&width=150&height=150&format=png');
      var res = await fetch(tUrl);
      var b = await res.blob();
      new THREE.TextureLoader().load(URL.createObjectURL(b), (t) => {
        parts.head.material = new THREE.MeshLambertMaterial({map: t});
      });
    };

    document.getElementById('btn-reset').onclick = () => {
      Object.values(parts).forEach(p => p.material = new THREE.MeshLambertMaterial({color: 0xcccccc}));
      parts.head.material.color.setHex(0xffcc00);
    };

    roWin.querySelector('.ro-close').onclick = () => { roWin.remove(); roStyle.remove(); window.__roStudioLoaded = false; };
  };
  setup();
}
