{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = `
      .ro-win{position:fixed!important;width:1050px;height:750px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:8px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:20px;top:20px;box-shadow:0 20px 60px #000;overflow:hidden}
      .ro-bar{height:38px;background:#222;display:flex;align-items:center;padding:0 12px;cursor:move;border-bottom:1px solid #333}
      .ro-tabs{display:flex;background:#25252b;padding:0 5px;border-bottom:1px solid #333}
      .ro-tab{padding:12px 18px;font-size:12px;cursor:pointer;color:#888;transition:0.2s}
      .ro-tab.active{color:#fff;border-bottom:2px solid #0084ff;background:rgba(255,255,255,0.05)}
      .ro-body{flex:1;display:flex;background:#1b1b1f}
      #canvas-container{flex:1;background:#000;position:relative}
      .side-panel{width:300px;padding:20px;border-right:1px solid #333;display:flex;flex-direction:column;gap:15px;background:#1b1b1f;overflow-y:auto}
      .ro-input{background:#2a2a30;border:1px solid #444;color:#fff;padding:10px;border-radius:4px;width:calc(100% - 22px)}
      .ro-btn-blue{background:#0084ff;border:none;color:#fff;padding:12px;cursor:pointer;border-radius:4px;font-weight:bold}
      .ro-btn-play{background:#28a745;border:none;color:#fff;padding:15px;cursor:pointer;border-radius:4px;font-weight:bold;font-size:16px}
      #esc-menu{position:absolute;inset:0;background:rgba(0,0,0,0.8);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(5px)}
      .esc-box{width:350px;background:#25252b;padding:25px;border-radius:10px;border:1px solid #444;display:flex;flex-direction:column;gap:12px}
      #lock-ui{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;border:2px solid white;border-radius:50%;display:none;pointer-events:none;z-index:10}
      .hidden{display:none!important}
    `;
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.innerHTML = `
      <div class="ro-bar"><span>Roblox Studio v0.8.8</span><button style="margin-left:auto;background:#ff4b4b;border:none;color:#fff;cursor:pointer;border-radius:4px;padding:2px 10px" onclick="location.reload()">X</button></div>
      <div class="ro-tabs" id="nav-tabs">
        <div class="ro-tab active" data-tab="p-av">Avatar</div>
        <div class="ro-tab" data-tab="p-st">Studio</div>
        <div class="ro-tab" data-tab="p-se">Settings</div>
      </div>
      <div class="ro-body">
        <div class="side-panel" id="side-editor">
          <div id="p-av" class="tab-content">
            <label style="font-size:11px;color:#888">AVATAR PREVIEW</label>
            <input type="text" id="u-in" class="ro-input" placeholder="Enter Username...">
            <button id="u-btn" class="ro-btn-blue" style="margin-bottom:10px;width:100%">LOAD FACE</button>
            <select id="part-select" class="ro-input">
              <option value="head">Head</option><option value="torso">Torso</option>
              <option value="larm">Left Arm</option><option value="rarm">Right Arm</option>
              <option value="lleg">Left Leg</option><option value="rleg">Right Leg</option>
            </select>
            <input type="color" id="color-part" style="width:100%;height:40px;margin:10px 0" value="#cccccc">
            <button id="btn-paint" class="ro-btn-blue" style="width:100%">APPLY COLOR</button>
          </div>
          <div id="p-st" class="tab-content hidden">
            <label style="font-size:11px;color:#888">BUILDING TOOLS</label>
            <button id="btn-spawn" class="ro-btn-blue" style="width:100%;background:#6610f2">Spawn Part</button>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:10px">
              <button class="ro-btn-blue">Move</button><button class="ro-btn-blue">Scale</button>
              <button class="ro-btn-blue">Rotate</button><button class="ro-btn-blue">Delete</button>
            </div>
          </div>
          <div id="p-se" class="tab-content hidden"><p style="color:#666">No settings available yet.</p></div>
          <button id="btn-play" class="ro-btn-play" style="margin-top:auto">▶ PLAY TEST</button>
        </div>
        <div id="canvas-container">
          <div id="lock-ui"></div>
          <div id="esc-menu">
            <div class="esc-box">
              <h2 style="margin:0;text-align:center">Paused</h2>
              <button class="ro-btn-blue" id="esc-resume">Resume</button>
              <button class="ro-btn-blue" id="esc-reset" style="background:#444">Reset Character</button>
              <button class="ro-btn-blue" id="esc-leave" style="background:#ff4b4b">Stop Test</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(roWin);

    var start = () => {
      if (!window['THREE']) return setTimeout(start, 100);
      var T = window['THREE'], con = document.getElementById('canvas-container');
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(45, con.clientWidth/con.clientHeight, 0.1, 2000);
      var rend = new T.WebGLRenderer({antialias:true});
      rend.setSize(con.clientWidth, con.clientHeight);
      rend.setClearColor(0x75bbfd, 1);
      con.appendChild(rend.domElement);
      scene.add(new T.AmbientLight(0xffffff, 1.3));

      // Player & State
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

      // --- WHITE STUDDED BASEPLATE ---
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
        if(e.code === "ControlLeft" && isPlaying && !isPaused) {
          shiftLock = !shiftLock;
          document.getElementById('lock-ui').style.display = shiftLock ? 'block' : 'none';
        }
        keys[e.code]=true;
      };
      window.onkeyup=(e)=>keys[e.code]=false;

      window.addEventListener('mousemove',(e)=>{ 
        if(isPlaying && !isPaused) {
          if(shiftLock || keys['MouseDown']) { // Shift-lock or holding mouse
            char.rotation.y -= e.movementX * 0.003;
          }
        }
      });

      var toggleEsc = () => {
        isPaused = !isPaused;
        document.getElementById('esc-menu').style.display = isPaused ? 'flex' : 'none';
        if(!isPaused) con.requestPointerLock(); else document.exitPointerLock();
      };

      var loop = () => {
        requestAnimationFrame(loop);
        if (isPlaying && !isPaused) {
          var speed = 0.2, moving = (keys['KeyW']||keys['KeyS']||keys['KeyA']||keys['KeyD']);
          if (keys['KeyW']) char.translateZ(-speed);
          if (keys['KeyS']) char.translateZ(speed);
          if (keys['KeyA']) char.translateX(-speed);
          if (keys['KeyD']) char.translateX(speed);
          
          if (keys['Space'] && isGrounded) { velY = 0.25; isGrounded = false; }
          char.position.y += velY;
          if (char.position.y > 0) { velY -= 0.012; } else { char.position.y = 0; velY = 0; isGrounded = true; }

          var t = Date.now() * 0.01;
          if (!isGrounded) { parts.larm.rotation.x = -1.2; parts.rarm.rotation.x = -1.2; }
          else if (moving) {
             parts.larm.rotation.x = Math.sin(t)*1.2; parts.rarm.rotation.x = -Math.sin(t)*1.2;
             parts.lleg.rotation.x = -Math.sin(t)*1.2; parts.rleg.rotation.x = Math.sin(t)*1.2;
          } else { Object.values(parts).forEach(p => p.rotation.x = 0); }
          
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

      // UI Actions
      document.querySelectorAll('.ro-tab').forEach(btn => {
        btn.onclick = () => {
          document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
          document.querySelectorAll('.ro-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          document.getElementById(btn.dataset.tab).classList.remove('hidden');
        }
      });

      document.getElementById('btn-play').onclick = () => {
        isPlaying = true;
        document.getElementById('side-editor').classList.add('hidden');
        document.getElementById('nav-tabs').classList.add('hidden');
        con.requestPointerLock();
      };

      document.getElementById('btn-spawn').onclick = () => {
        var p = new T.Mesh(new T.BoxGeometry(4,4,4), new T.MeshLambertMaterial({color: Math.random()*0xffffff}));
        p.position.set(Math.random()*10, 0, Math.random()*10);
        scene.add(p);
      };

      document.getElementById('esc-resume').onclick = toggleEsc;
      document.getElementById('esc-leave').onclick = () => {
        isPlaying = false; isPaused = false; shiftLock = false;
        document.getElementById('lock-ui').style.display = 'none';
        document.getElementById('esc-menu').style.display = 'none';
        document.getElementById('side-editor').classList.remove('hidden');
        document.getElementById('nav-tabs').classList.remove('hidden');
        document.exitPointerLock();
      };
      document.getElementById('esc-reset').onclick = () => { char.position.set(0,0,0); toggleEsc(); };

      document.getElementById('btn-paint').onclick = () => { 
        parts[document.getElementById('part-select').value].material.color.set(document.getElementById('color-part').value); 
      };
    };

    if (!window['THREE']) {
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = start; document.head.appendChild(s);
    } else { start(); }
  };
  setup();
}
