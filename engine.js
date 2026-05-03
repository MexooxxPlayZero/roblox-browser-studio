{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = `
      .ro-win{position:fixed!important;width:1050px;height:750px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:8px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:20px;top:20px;box-shadow:0 20px 60px #000;overflow:hidden;transition:all 0.3s ease}
      .ro-win.minimized{height:38px!important;width:300px!important}
      .ro-bar{height:38px;background:#222;display:flex;align-items:center;padding:0 12px;cursor:move;border-bottom:1px solid #333}
      .bar-btns{margin-left:auto;display:flex;gap:6px}
      .bar-btn{background:#333;border:none;color:#fff;cursor:pointer;padding:2px 8px;border-radius:4px;font-size:14px;line-height:1}
      .bar-btn:hover{background:#444}
      .ro-body{flex:1;display:flex;background:#1b1b1f;position:relative}
      #canvas-container{flex:1;background:#000;position:relative;transition: all 0.3s ease}
      .side-panel{width:280px;padding:15px;border-right:1px solid #333;display:flex;flex-direction:column;gap:12px;background:#1b1b1f;transition: width 0.3s ease, padding 0.3s ease;overflow:hidden}
      .side-panel.collapsed{width:0;padding:0;border:none}
      .ro-btn-play{background:#28a745;border:none;color:#fff;padding:12px;cursor:pointer;border-radius:4px;font-weight:bold;width:100%;margin-top:auto}
      
      /* Roblox Icon Button */
      #ro-menu-icon{position:absolute;top:10px;left:10px;width:32px;height:32px;cursor:pointer;display:none;z-index:1001;filter: drop-shadow(0 0 5px rgba(0,0,0,0.5))}
      
      #esc-menu{position:absolute;inset:0;background:rgba(0,0,0,0.8);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(5px)}
      .esc-box{width:320px;background:#25252b;padding:20px;border-radius:10px;border:1px solid #444;display:flex;flex-direction:column;gap:10px}
    `;
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.id = 'main-window';
    roWin.innerHTML = `
      <div class="ro-bar">
        <span>Studio v0.9.0</span>
        <div class="bar-btns">
          <button class="bar-btn" id="btn-mute">🔊</button>
          <button class="bar-btn" id="btn-min">−</button>
          <button class="bar-btn" id="btn-res" style="display:none">❐</button>
          <button class="bar-btn" style="background:#ff4b4b" onclick="location.reload()">X</button>
        </div>
      </div>
      <div class="ro-body">
        <div class="side-panel" id="side-editor">
          <h4 style="margin:0">Explorer</h4>
          <button id="btn-spawn" style="background:#0084ff;border:none;color:#fff;padding:8px;cursor:pointer;border-radius:4px">Insert Part</button>
          <div style="margin-top:10px; font-size:11px; color:#888">
            <b>Controls:</b><br>
            Ctrl: Shift Lock<br>
            Esc / Icon: Menu
          </div>
          <button id="btn-play" class="ro-btn-play">▶ PLAY</button>
        </div>
        <div id="canvas-container">
          <img id="ro-menu-icon" src="https://www.roblox.com/images/logos/rebrand/metric_2020/Roblox_Logo_White_64.png">
          <div id="esc-menu">
            <div class="esc-box">
              <h3 style="margin:0;text-align:center">Menu</h3>
              <button class="bar-btn" style="padding:12px; background:#3a3a42" id="esc-resume">Resume</button>
              <button class="bar-btn" style="padding:12px; background:#444" id="esc-reset">Reset Character</button>
              <button class="bar-btn" style="padding:12px; background:#ff4b4b" id="esc-leave">Leave Game</button>
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
      scene.add(new T.AmbientLight(0xffffff, 1.4));

      var char = new T.Group(), parts = {}, isPlaying = false, isPaused = false, shiftLock = false, muted = false;
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

          if (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD']) {
             parts.larm.rotation.x = Math.sin(Date.now() * 0.01)*1.2;
             parts.rarm.rotation.x = -Math.sin(Date.now() * 0.01)*1.2;
          }
          
          var offset = new T.Vector3(shiftLock ? 2 : 0, 7, 20).applyQuaternion(char.quaternion);
          cam.position.copy(char.position).add(offset);
          cam.lookAt(char.position.clone().add(new T.Vector3(0,2,0)));
        } else if (!isPlaying) {
          cam.position.set(0, 4, 15);
          cam.lookAt(char.position);
        }
        rend.render(scene, cam);
      };
      loop();

      // BUTTON LOGIC
      document.getElementById('btn-play').onclick = () => {
        isPlaying = true;
        document.getElementById('side-editor').classList.add('collapsed');
        document.getElementById('ro-menu-icon').style.display = 'block';
        setTimeout(() => rend.setSize(con.clientWidth, con.clientHeight), 350);
        con.requestPointerLock();
      };

      document.getElementById('ro-menu-icon').onclick = toggleEsc;
      document.getElementById('esc-resume').onclick = toggleEsc;
      document.getElementById('esc-reset').onclick = () => { char.position.set(0,0,0); toggleEsc(); };
      document.getElementById('esc-leave').onclick = () => {
        isPlaying = false; isPaused = false;
        document.getElementById('esc-menu').style.display = 'none';
        document.getElementById('ro-menu-icon').style.display = 'none';
        document.getElementById('side-editor').classList.remove('collapsed');
        setTimeout(() => rend.setSize(con.clientWidth, con.clientHeight), 350);
        document.exitPointerLock();
      };

      document.getElementById('btn-mute').onclick = () => {
        muted = !muted;
        document.getElementById('btn-mute').innerText = muted ? "🔇" : "🔊";
      };

      document.getElementById('btn-min').onclick = () => {
        document.getElementById('main-window').classList.add('minimized');
        document.getElementById('btn-min').style.display = 'none';
        document.getElementById('btn-res').style.display = 'inline';
      };

      document.getElementById('btn-res').onclick = () => {
        document.getElementById('main-window').classList.remove('minimized');
        document.getElementById('btn-min').style.display = 'inline';
        document.getElementById('btn-res').style.display = 'none';
      };

      document.getElementById('btn-spawn').onclick = () => {
        var p = new T.Mesh(new T.BoxGeometry(4,4,4), new T.MeshLambertMaterial({color: 0x888888}));
        p.position.set(Math.random()*10, 0, Math.random()*10); scene.add(p);
      };
    };

    if (!window['THREE']) {
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = start; document.head.appendChild(s);
    } else { start(); }
  };
  setup();
}
