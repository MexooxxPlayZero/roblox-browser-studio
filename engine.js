{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = `
      .ro-win{position:fixed!important;width:1000px;height:700px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:12px;z-index:9999999!important;display:flex;flex-direction:column;border:1px solid #444;left:20px;top:20px;box-shadow:0 20px 60px #000;overflow:hidden}
      .ro-win.minimized{width:64px!important;height:64px!important;border-radius:18px!important;background:#000!important;border:2px solid #0084ff!important;cursor:pointer}
      .ro-win.minimized * {display:none!important}
      .ro-win.minimized::after{content:'';position:absolute;inset:15px;background:url('https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg') no-repeat center;background-size:contain;filter:invert(1);display:block!important}

      .ro-bar{height:40px;background:#222;display:flex;align-items:center;padding:0 15px;cursor:move;border-bottom:1px solid #333;flex-shrink:0}
      .ro-tabs{display:flex;background:#25252b;padding:0 10px;border-bottom:1px solid #333;flex-shrink:0}
      .ro-tab{padding:12px 18px;font-size:11px;text-transform:uppercase;font-weight:bold;cursor:pointer;color:#888;border-bottom:2px solid transparent}
      .ro-tab.active{color:#fff;border-bottom:2px solid #0084ff;background:rgba(255,255,255,0.05)}
      
      .ro-body{flex:1;display:flex;background:#1b1b1f;position:relative;overflow:hidden}
      .side-panel{width:280px;padding:20px;border-right:1px solid #333;display:flex;flex-direction:column;gap:15px;background:#1b1b1f;z-index:100}
      .side-panel.collapsed{display:none}
      
      .color-grid{display:grid;grid-template-columns:repeat(5, 1fr);gap:6px;margin-top:10px}
      .color-dot{width:100%;aspect-ratio:1;border-radius:4px;cursor:pointer;border:1px solid #444}
      .color-dot:hover{border-color:#fff;transform:scale(1.1)}

      #canvas-container{flex:1;background:#000;position:relative;z-index:50!important}
      #canvas-container canvas{width:100%!important;height:100%!important;display:block}
      
      #ro-menu-btn{position:absolute;top:15px;left:15px;width:38px;height:38px;background:rgba(0,0,0,0.8);border-radius:8px;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:200;border:1px solid #444}
      #ro-menu-btn img{width:20px;filter:invert(1)}
      
      .btn-ui{background:#333;border:none;color:#fff;padding:10px;border-radius:6px;cursor:pointer;font-weight:bold;font-size:12px}
      .btn-ui:hover{background:#444}
      .hidden{display:none!important}
    `;
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.id = 'main-app';
    roWin.innerHTML = `
      <div class="ro-bar">
        <span style="font-size:10px;font-weight:bold;color:#0084ff">STUDIO PRO v0.9.7</span>
        <div style="margin-left:auto;display:flex;gap:8px">
          <button class="btn-ui" id="btn-mute" style="padding:4px 8px">🔊</button>
          <button class="btn-ui" id="btn-min" style="padding:4px 10px">−</button>
          <button class="btn-ui" style="padding:4px 10px;background:#ff4b4b" onclick="location.reload()">×</button>
        </div>
      </div>
      <div class="ro-tabs" id="editor-tabs">
        <div class="ro-tab active" data-t="tab-av">Avatar</div>
        <div class="ro-tab" data-t="tab-wd">World</div>
        <div class="ro-tab" data-t="tab-ed">Editor</div>
      </div>
      <div class="ro-body">
        <div class="side-panel" id="side-panel">
          <div id="tab-av" class="t-pane">
            <label style="font-size:10px;color:#888">BODY COLOR</label>
            <select id="body-part-select" class="btn-ui" style="width:100%;margin-top:5px;background:#2a2a30">
              <option value="head">Head</option><option value="torso">Torso</option>
              <option value="larm">L-Arm</option><option value="rarm">R-Arm</option>
              <option value="lleg">L-Leg</option><option value="rleg">R-Leg</option>
            </select>
            <div class="color-grid" id="adv-colors"></div>
          </div>
          <div id="tab-wd" class="t-pane hidden">
            <button class="btn-ui" id="btn-spawn" style="width:100%">Spawn Cube</button>
          </div>
          <button id="btn-play" class="btn-ui" style="background:#28a745;margin-top:auto;padding:15px">▶ PLAY TEST</button>
        </div>
        <div id="canvas-container">
          <div id="ro-menu-btn"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg"></div>
        </div>
      </div>`;
    document.body.appendChild(roWin);

    // Minimize System
    var isMin = false;
    document.getElementById('btn-min').onclick = (e) => { e.stopPropagation(); isMin = true; roWin.classList.add('minimized'); };
    roWin.onclick = () => { if(isMin) { isMin = false; roWin.classList.remove('minimized'); } };

    var start = () => {
      if (!window['THREE']) return setTimeout(start, 100);
      var T = window['THREE'], con = document.getElementById('canvas-container');
      
      var scene = new T.Scene();
      var cam = new T.PerspectiveCamera(45, con.offsetWidth/con.offsetHeight, 0.1, 2000);
      var rend = new T.WebGLRenderer({antialias:true});
      rend.setSize(con.offsetWidth, con.offsetHeight);
      rend.setClearColor(0x75bbfd, 1);
      con.appendChild(rend.domElement);
      
      scene.add(new T.AmbientLight(0xffffff, 1.4));

      var char = new T.Group(), parts = {}, isPlaying = false;
      var mk = (w,h,d,x,y) => {
        var m = new T.Mesh(new T.BoxGeometry(w,h,d), new T.MeshLambertMaterial({color:0xe5e5e5}));
        m.position.set(x,y,0); return m;
      };
      parts.head=mk(1.2,1.2,1.2,0,1.8); parts.torso=mk(2,2,1,0,0);
      parts.larm=mk(1,2,1,-1.5,0); parts.rarm=mk(1,2,1,1.5,0);
      parts.lleg=mk(1,2,1,-0.5,-2.1); parts.rleg=mk(1,2,1,0.5,-2.1);
      Object.values(parts).forEach(p => char.add(p)); scene.add(char);

      var floor = new T.Mesh(new T.PlaneGeometry(1000,1000), new T.MeshLambertMaterial({color:0xffffff}));
      floor.rotation.x = -Math.PI/2; floor.position.y = -3.1; scene.add(floor);

      // Colors
      const rbxColors = ['#f5f5f5','#1b1b1f','#ff0000','#00ff00','#0000ff','#ffff00','#ffaa00','#ffffff','#a3a2a5','#31c5e8'];
      const grid = document.getElementById('adv-colors');
      rbxColors.forEach(c => {
        let d = document.createElement('div'); d.className = 'color-dot'; d.style.background = c;
        d.onclick = () => { parts[document.getElementById('body-part-select').value].material.color.set(c); };
        grid.appendChild(d);
      });

      var loop = () => {
        requestAnimationFrame(loop);
        if (!isPlaying) {
          char.rotation.y += 0.005; 
          cam.position.set(0, 4, 12); 
          cam.lookAt(char.position);
        }
        rend.render(scene, cam);
      };
      loop();

      // Interactions
      document.querySelectorAll('.ro-tab').forEach(tab => {
        tab.onclick = () => {
          document.querySelectorAll('.ro-tab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.t-pane').forEach(p => p.classList.add('hidden'));
          tab.classList.add('active');
          document.getElementById(tab.dataset.t).classList.remove('hidden');
        };
      });

      document.getElementById('btn-play').onclick = () => {
        isPlaying = true;
        document.getElementById('side-panel').classList.add('collapsed');
        document.getElementById('editor-tabs').classList.add('hidden');
        document.getElementById('ro-menu-btn').style.display = 'flex';
        rend.setSize(con.offsetWidth, con.offsetHeight);
      };
    };
    start();
  };
  setup();
}
