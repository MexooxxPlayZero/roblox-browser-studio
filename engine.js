{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = `
      .ro-win{position:fixed!important;width:1000px;height:700px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:12px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:20px;top:20px;box-shadow:0 20px 60px #000;overflow:hidden;transition:all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)}
      
      /* The Rounded Square Minimize Mode */
      .ro-win.minimized{width:60px!important;height:60px!important;border-radius:15px!important;background:#000!important;border:2px solid #333!important;cursor:pointer}
      .ro-win.minimized .ro-bar, .ro-win.minimized .ro-body{display:none}
      .ro-win.minimized::after{content:'';position:absolute;inset:12px;background:url('https://www.roblox.com/images/logos/rebrand/metric_2020/Roblox_Logo_White_64.png') no-repeat center;background-size:contain;filter:brightness(1)}

      .ro-bar{height:40px;background:#222;display:flex;align-items:center;padding:0 15px;cursor:move;border-bottom:1px solid #333}
      .ro-tabs{display:flex;background:#25252b;padding:0 10px;border-bottom:1px solid #333;gap:5px}
      .ro-tab{padding:10px 15px;font-size:12px;cursor:pointer;color:#888;border-bottom:2px solid transparent}
      .ro-tab.active{color:#fff;border-bottom:2px solid #0084ff;background:rgba(255,255,255,0.05)}
      
      .ro-body{flex:1;display:flex;background:#1b1b1f;position:relative}
      .side-panel{width:280px;padding:20px;border-right:1px solid #333;display:flex;flex-direction:column;gap:15px;background:#1b1b1f;transition:0.3s}
      .side-panel.collapsed{width:0;padding:0;opacity:0;pointer-events:none}
      
      #canvas-container{flex:1;background:#000;position:relative}
      #ro-menu-btn{position:absolute;top:15px;left:15px;width:35px;height:35px;background:#000;border-radius:8px;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:100;border:1px solid #444}
      #ro-menu-btn img{width:20px}
      
      #esc-menu{position:absolute;inset:0;background:rgba(0,0,0,0.85);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(8px)}
      .esc-box{width:320px;background:#222;padding:25px;border-radius:15px;border:1px solid #444;display:flex;flex-direction:column;gap:12px}
      .btn-ui{background:#333;border:none;color:#fff;padding:12px;border-radius:6px;cursor:pointer;font-weight:bold;transition:0.2s}
      .btn-ui:hover{background:#444}
      .btn-play{background:#28a745;margin-top:auto}
      .hidden{display:none!important}
    `;
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.id = 'main-app';
    roWin.innerHTML = `
      <div class="ro-bar">
        <span style="font-size:11px;letter-spacing:1px">ROBLOX STUDIO</span>
        <div style="margin-left:auto;display:flex;gap:8px">
          <button class="btn-ui" id="btn-mute" style="padding:2px 8px">🔊</button>
          <button class="btn-ui" id="btn-min" style="padding:2px 8px">−</button>
          <button class="btn-ui" style="padding:2px 8px;background:#ff4b4b" onclick="location.reload()">×</button>
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
            <label style="font-size:10px;color:#666">AVATAR PREVIEW</label>
            <input type="text" id="u-in" style="width:100%;background:#2a2a30;border:1px solid #444;color:#fff;padding:8px;margin:8px 0;border-radius:4px" placeholder="Username...">
            <button class="btn-ui" id="u-btn" style="width:100%;background:#0084ff">Update Preview</button>
          </div>
          <div id="tab-wd" class="t-pane hidden">
            <label style="font-size:10px;color:#666">WORLD OBJECTS</label>
            <button class="btn-ui" id="btn-spawn" style="width:100%;margin-top:8px">Spawn Part</button>
          </div>
          <div id="tab-ed" class="t-pane hidden">
            <p style="font-size:11px;color:#666">Advanced Editor Settings coming soon...</p>
          </div>
          <button id="btn-play" class="btn-ui btn-play">▶ PLAY TEST</button>
        </div>
        <div id="canvas-container">
          <div id="ro-menu-btn"><img src="https://www.roblox.com/images/logos/rebrand/metric_2020/Roblox_Logo_White_64.png"></div>
          <div id="esc-menu">
            <div class="esc-box">
              <h2 style="margin:0;text-align:center">Paused</h2>
              <button class="btn-ui" id="esc-resume">Resume</button>
              <button class="btn-ui" id="esc-reset">Reset Character</button>
              <button class="btn-ui" id="esc-leave" style="background:#ff4b4b">Stop Test</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(roWin);

    // Minimize Snap Logic
    var isMin = false;
    document.getElementById('btn-min').onclick = () => {
      isMin = true;
      roWin.classList.add('minimized');
    };
    roWin.onclick = (e) => {
      if(isMin) {
        isMin = false;
        roWin.classList.remove('minimized');
      }
    };

    var start = () => {
      if (!window['THREE']) return setTimeout(start, 100);
      var T = window['THREE'], con = document.getElementById('canvas-container');
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(45, con.clientWidth/con.clientHeight, 0.1, 2000);
      var rend = new T.WebGLRenderer({antialias:true});
      rend.setSize(con.clientWidth, con.clientHeight);
      rend.setClearColor(0x75bbfd, 1);
      con.appendChild(rend.domElement);
      scene.add(new T.AmbientLight(0xffffff, 1.4));

      var char = new T.Group(), parts = {}, isPlaying = false, isPaused = false, shiftLock = false;
      var mk = (w,h,d,x,y) => {
        var m = new T.Mesh(new T.BoxGeometry(w,h,d), new T.MeshLambertMaterial({color:0xcccccc}));
        m.position.set(x,y,0); return m;
      };
      parts.head=mk(1.2,1.2,1.2,0,1.8); parts.torso=mk(2,2,1,0,0);
      parts.larm=mk(1,2,1,-1.5,0); parts.rarm=mk(1,2,1,1.5,0);
      parts.lleg=mk(1,2,1,-0.5,-2.1); parts.rleg=mk(1,2,1,0.5,-2.1);
      Object.values(parts).forEach(p => char.add(p));
      scene.add(char);

      var loader = new T.TextureLoader();
      var studs = loader.load('https://raw.githubusercontent.com/ClreS/Roblox-Assets/master/Textures/Studs.png', (t)=>{
        t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(200, 200);
      });
      var floor = new T.Mesh(new T.PlaneGeometry(1000,1000), new T.MeshLambertMaterial({map: studs, color: 0xffffff}));
      floor.rotation.x = -Math.PI/2; floor.position.y = -3.1;
      scene.add(floor);

      var keys = {}, velY = 0, isGrounded = true;

      window.onkeydown=(e)=>{
        if(e.code === "Escape" && isPlaying) toggleEsc();
        if(e.code === "ControlLeft" && isPlaying && !isPaused) shiftLock = !shiftLock;
        keys[e.code]=true;
      };
      window.onkeyup=(e)=>keys[e.code]=false;

      window.addEventListener('mousemove',(e)=>{ 
        if(isPlaying && !isPaused && (shiftLock || keys['MouseDown'])) char.rotation.y -= e.movementX * 0.003;
      });

      var toggleEsc = () => {
        isPaused = !isPaused;
        document.getElementById('esc-menu').style.display = isPaused ? 'flex' : 'none';
        if(!isPaused) con.requestPointerLock(); else document.exitPointerLock();
      };

      var loop = () => {
        requestAnimationFrame(loop);
        if (isPlaying && !isPaused) {
          var speed = 0.2;
          if (keys['KeyW']) char.translateZ(-speed);
          if (keys['KeyS']) char.translateZ(speed);
          if (keys['KeyA']) char.translateX(-speed);
          if (keys['KeyD']) char.translateX(speed);
          
          if (keys['Space'] && isGrounded) { velY = 0.25; isGrounded = false; }
          char.position.y += velY;
          if (char.position.y > 0) { velY -= 0.012; } else { char.position.y = 0; velY = 0; isGrounded = true; }
          
          var offset = new T.Vector3(shiftLock ? 2 : 0, 7, 18).applyQuaternion(char.quaternion);
          cam.position.copy(char.position).add(offset);
          cam.lookAt(char.position.clone().add(new T.Vector3(0,2,0)));
        } else if (!isPlaying) {
          char.rotation.y += 0.01;
          cam.position.set(0, 4, 12);
          cam.lookAt(char.position);
        }
        rend.render(scene, cam);
      };
      loop();

      // Tab Swapping
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
        setTimeout(() => rend.setSize(con.clientWidth, con.clientHeight), 350);
        con.requestPointerLock();
      };

      document.getElementById('ro-menu-btn').onclick = toggleEsc;
      document.getElementById('esc-resume').onclick = toggleEsc;
      document.getElementById('esc-leave').onclick = () => {
        isPlaying = false; isPaused = false;
        document.getElementById('esc-menu').style.display = 'none';
        document.getElementById('ro-menu-btn').style.display = 'none';
        document.getElementById('side-panel').classList.remove('collapsed');
        document.getElementById('editor-tabs').classList.remove('hidden');
        setTimeout(() => rend.setSize(con.clientWidth, con.clientHeight), 350);
        document.exitPointerLock();
      };
    };

    start();
  };
  setup();
}
