{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = ".ro-win{position:fixed!important;width:900px;height:650px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:8px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:50px;top:50px;box-shadow:0 20px 60px #000;overflow:hidden}.ro-bar{height:38px;background:#222;display:flex;align-items:center;padding:0 12px;cursor:move;border-bottom:1px solid #333}.ro-tabs{display:flex;background:#25252b;padding:0 10px;gap:5px;border-bottom:1px solid #333}.ro-tab{padding:10px 15px;font-size:11px;cursor:pointer;color:#888;border-bottom:2px solid transparent}.ro-tab.active{color:#fff;border-bottom:2px solid #0084ff;background:rgba(255,255,255,0.05)}.ro-body{flex:1;display:flex;background:#1b1b1f}#canvas-container{flex:1;background:#000!important;position:relative;cursor:crosshair}.side-panel{width:280px;padding:15px;border-right:1px solid #333;display:flex;flex-direction:column;gap:10px;background:#1b1b1f;overflow-y:auto}.ro-input{background:#2a2a30;border:1px solid #444;color:#fff;padding:8px;border-radius:4px;width:calc(100% - 20px);font-size:12px}.ro-btn-blue{background:#0084ff;border:none;color:#fff;padding:10px;cursor:pointer;border-radius:4px;font-weight:bold;font-size:11px;width:100%}.ro-btn-play{background:#28a745;border:none;color:#fff;padding:12px;cursor:pointer;border-radius:4px;font-weight:bold;font-size:14px;width:100%;margin-top:auto}.hidden{display:none!important}.game-card{background:#2a2a30;padding:10px;border-radius:5px;margin-bottom:10px;border:1px solid #444;text-align:center}";
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.innerHTML = `
      <div class="ro-bar"><span>Roblox Studio v0.8.0</span><button style="margin-left:auto;background:#ff4b4b;border:none;color:#fff;cursor:pointer;border-radius:4px;padding:2px 10px" onclick="location.reload()">X</button></div>
      <div class="ro-tabs" id="studio-tabs">
        <div class="ro-tab active" id="t-av">Avatar</div>
        <div class="ro-tab" id="t-wd">World</div>
        <div class="ro-tab" id="t-gm">Games</div>
      </div>
      <div class="ro-body">
        <div class="side-panel" id="side-ctrl">
          <div id="p-av">
            <label style="font-size:10px;color:#888">AVATAR CUSTOMIZER</label>
            <input type="text" id="u-in" class="ro-input" placeholder="Username...">
            <button id="u-btn" class="ro-btn-blue" style="margin-bottom:10px">LOAD FACE</button>
            <select id="part-select" class="ro-input">
              <option value="head">Head</option><option value="torso">Torso</option>
              <option value="larm">Left Arm</option><option value="rarm">Right Arm</option>
              <option value="lleg">Left Leg</option><option value="rleg">Right Leg</option>
            </select>
            <input type="color" id="color-part" style="width:100%;height:35px" value="#cccccc">
            <button id="btn-paint" class="ro-btn-blue">PAINT</button>
          </div>
          <div id="p-wd" class="hidden">
            <label style="font-size:10px;color:#888">WORLD SETTINGS</label>
            <button id="btn-studs" class="ro-btn-blue">Toggle Studs</button>
            <p style="font-size:10px;color:#555;margin-top:10px">CONTROLS:<br>WASD - Move<br>SPACE - Jump<br>MOUSE - Look</p>
          </div>
          <div id="p-gm" class="hidden">
            <label style="font-size:10px;color:#888">DISCOVER GAMES</label>
            <div class="game-card">
              <div style="font-weight:bold;font-size:12px">Classic Crossroads</div>
              <div style="font-size:10px;color:#888">Status: Coming Soon</div>
              <button class="ro-btn-blue" style="background:#444;margin-top:5px" disabled>PLAY</button>
            </div>
          </div>
          <button id="btn-play" class="ro-btn-play">▶ PLAY TEST</button>
        </div>
        <div id="canvas-container"></div>
      </div>`;
    document.body.appendChild(roWin);

    var start = () => {
      if (!window['THREE']) return setTimeout(start, 100);
      var T = window['THREE'], con = document.getElementById('canvas-container');
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(45, con.clientWidth/con.clientHeight, 0.1, 2000);
      var rend = new T.WebGLRenderer({antialias:true});
      rend.setSize(con.clientWidth, con.clientHeight);
      rend.setClearColor(0x75bbfd, 1); // Sky blue
      con.appendChild(rend.domElement);
      scene.add(new T.AmbientLight(0xffffff, 1.2));
      var sun = new T.DirectionalLight(0xffffff, 0.5); sun.position.set(10,20,10); scene.add(sun);

      // Player
      var char = new T.Group(), parts = {}, isPlaying = false;
      var mk = (w,h,d,x,y) => {
        var m = new T.Mesh(new T.BoxGeometry(w,h,d), new T.MeshLambertMaterial({color:0xcccccc}));
        m.position.set(x,y,0); return m;
      };
      parts.head=mk(1.2,1.2,1.2,0,1.8); parts.torso=mk(2,2,1,0,0);
      parts.larm=mk(1,2,1,-1.5,0); parts.rarm=mk(1,2,1,1.5,0);
      parts.lleg=mk(1,2,1,-0.5,-2.1); parts.rleg=mk(1,2,1,0.5,-2.1);
      Object.values(parts).forEach(p => char.add(p));
      scene.add(char);

      // Studded Baseplate
      var loader = new T.TextureLoader();
      var studsTex = loader.load('https://i.imgur.com/7Y9pZUn.png'); // Stud texture
      studsTex.wrapS = studsTex.wrapT = T.RepeatWrapping;
      studsTex.repeat.set(50, 50);
      var floorMat = new T.MeshLambertMaterial({map: studsTex, color: 0x333333});
      var floor = new T.Mesh(new T.PlaneGeometry(200,200), floorMat);
      floor.rotation.x = -Math.PI/2; floor.position.y = -3.1;
      scene.add(floor);

      // Movement Logic
      var keys = {}, velY = 0, isGrounded = true;
      window.onkeydown=(e)=>keys[e.code]=true; window.onkeyup=(e)=>keys[e.code]=false;
      window.addEventListener('mousemove',(e)=>{ if(isPlaying) char.rotation.y -= e.movementX*0.005; });

      var loop = () => {
        requestAnimationFrame(loop);
        if (isPlaying) {
          var speed = 0.2;
          var moving = (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD']);
          
          if (keys['KeyW']) char.translateZ(-speed);
          if (keys['KeyS']) char.translateZ(speed);
          if (keys['KeyA']) char.translateX(-speed);
          if (keys['KeyD']) char.translateX(speed);
          
          // JUMP & GRAVITY
          if (keys['Space'] && isGrounded) { velY = 0.25; isGrounded = false; }
          char.position.y += velY;
          if (char.position.y > 0) { 
            velY -= 0.012; // Gravity
          } else { 
            char.position.y = 0; velY = 0; isGrounded = true; 
          }

          // FULL ANIMATION SET
          var t = Date.now() * 0.01;
          if (!isGrounded) {
             // Jump/Fall Anim: Arms out, legs slightly split
             parts.larm.rotation.x = parts.rarm.rotation.x = -1.2;
             parts.lleg.rotation.x = 0.3; parts.rleg.rotation.x = -0.3;
          } else if (moving) {
             // Walk Anim
             parts.larm.rotation.x = Math.sin(t) * 1.0;
             parts.rarm.rotation.x = -Math.sin(t) * 1.0;
             parts.lleg.rotation.x = -Math.sin(t) * 1.0;
             parts.rleg.rotation.x = Math.sin(t) * 1.0;
          } else {
             // Idle
             parts.larm.rotation.x = parts.rarm.rotation.x = 0;
             parts.lleg.rotation.x = parts.rleg.rotation.x = 0;
             parts.larm.rotation.z = -0.1; parts.rarm.rotation.z = 0.1;
          }

          var offset = new T.Vector3(0, 8, 20).applyQuaternion(char.quaternion);
          cam.position.copy(char.position).add(offset);
          cam.lookAt(char.position);
        }
        rend.render(scene, cam);
      };
      loop();

      // UI Logic
      document.getElementById('btn-play').onclick = () => {
        isPlaying = !isPlaying;
        document.getElementById('side-ctrl').classList.toggle('hidden');
        document.getElementById('studio-tabs').classList.toggle('hidden');
        if(isPlaying) { con.requestPointerLock(); document.getElementById('btn-play').innerText = "⏹ STOP"; }
      };

      document.getElementById('btn-studs').onclick = () => { floor.material.map = floor.material.map ? null : studsTex; floor.material.needsUpdate = true; };
      
      document.getElementById('btn-paint').onclick = () => { parts[document.getElementById('part-select').value].material.color.set(document.getElementById('color-part').value); };

      document.getElementById('u-btn').onclick = async () => {
        var v = document.getElementById('u-in').value;
        var r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usernames:[v],excludeBannedUsers:true})});
        var d = await r.json();
        if(d.data && d.data[0]) {
           new T.TextureLoader().load('https://corsproxy.io/?' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+d.data[0].id+'&width=150&height=150&format=png'), (t) => { parts.head.material = new T.MeshLambertMaterial({map:t}); });
        }
      };

      var ts = ["av","wd","gm"];
      ts.forEach(t => document.getElementById('t-'+t).onclick = () => { 
        ts.forEach(x=>{document.getElementById('p-'+x).classList.add('hidden');document.getElementById('t-'+x).classList.remove('active');});
        document.getElementById('p-'+t).classList.remove('hidden');document.getElementById('t-'+t).classList.add('active');
      });
    };

    if (!window['THREE']) {
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = start; document.head.appendChild(s);
    } else { start(); }
  };
  setup();
}
