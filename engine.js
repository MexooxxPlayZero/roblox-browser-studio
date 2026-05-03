{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = `
      .ro-win{position:fixed!important;width:1000px;height:700px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:8px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:20px;top:20px;box-shadow:0 20px 60px #000;overflow:hidden}
      .ro-bar{height:38px;background:#222;display:flex;align-items:center;padding:0 12px;cursor:move;border-bottom:1px solid #333}
      .ro-body{flex:1;display:flex;background:#1b1b1f}
      #canvas-container{flex:1;background:#000;position:relative}
      .side-panel{width:300px;padding:20px;border-right:1px solid #333;display:flex;flex-direction:column;gap:15px;background:#1b1b1f}
      .ro-input{background:#2a2a30;border:1px solid #444;color:#fff;padding:10px;border-radius:4px;width:calc(100% - 22px)}
      .ro-btn-blue{background:#0084ff;border:none;color:#fff;padding:12px;cursor:pointer;border-radius:4px;font-weight:bold}
      .ro-btn-play{background:#28a745;border:none;color:#fff;padding:15px;cursor:pointer;border-radius:4px;font-weight:bold;font-size:16px}
      
      /* Esc Menu Styling */
      #esc-menu{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(5px)}
      .esc-box{width:350px;background:#25252b;padding:20px;border-radius:10px;border:1px solid #444;display:flex;flex-direction:column;gap:10px}
      .esc-btn{padding:12px;border:none;border-radius:5px;cursor:pointer;font-weight:bold;color:white;background:#3a3a42}
      .esc-btn:hover{background:#4a4a54}
      .esc-btn.red{background:#ff4b4b}
      .hidden{display:none!important}
    `;
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.innerHTML = `
      <div class="ro-bar"><span>Roblox Studio v0.8.5 [PRO ENGINE]</span><button style="margin-left:auto;background:#ff4b4b;border:none;color:#fff;cursor:pointer;border-radius:4px;padding:2px 10px" onclick="location.reload()">X</button></div>
      <div class="ro-body">
        <div class="side-panel" id="side-editor">
          <h3 style="margin:0">Editor</h3>
          <label style="font-size:11px;color:#888">USERNAME PREVIEW</label>
          <input type="text" id="u-in" class="ro-input" placeholder="Enter Username...">
          <button id="u-btn" class="ro-btn-blue">UPDATE AVATAR</button>
          <hr style="border:0;border-top:1px solid #333;width:100%">
          <label style="font-size:11px;color:#888">PART COLOR</label>
          <select id="part-select" class="ro-input">
            <option value="head">Head</option><option value="torso">Torso</option>
            <option value="larm">Left Arm</option><option value="rarm">Right Arm</option>
            <option value="lleg">Left Leg</option><option value="rleg">Right Leg</option>
          </select>
          <input type="color" id="color-part" style="width:100%;height:40px" value="#cccccc">
          <button id="btn-paint" class="ro-btn-blue">APPLY COLOR</button>
          <button id="btn-play" class="ro-btn-play" style="margin-top:auto">START PLAY TEST</button>
        </div>
        <div id="canvas-container">
          <div id="esc-menu">
            <div class="esc-box">
              <h2 style="margin:0;text-align:center">Paused</h2>
              <button class="esc-btn" id="esc-resume">Resume</button>
              <button class="esc-btn" id="esc-reset">Reset Character</button>
              <button class="esc-btn" id="esc-settings">Settings</button>
              <button class="esc-btn red" id="esc-leave">Stop Test</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(roWin);

    var start = () => {
      if (!window['THREE']) return setTimeout(start, 100);
      var T = window['THREE'], con = document.getElementById('canvas-container');
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(45, con.clientWidth/con.clientHeight, 0.1, 1000);
      var rend = new T.WebGLRenderer({antialias:true});
      rend.setSize(con.clientWidth, con.clientHeight);
      rend.setClearColor(0x75bbfd, 1);
      con.appendChild(rend.domElement);
      scene.add(new T.AmbientLight(0xffffff, 1.2));

      // Player
      var char = new T.Group(), parts = {}, isPlaying = false, isPaused = false;
      var mk = (w,h,d,x,y) => {
        var m = new T.Mesh(new T.BoxGeometry(w,h,d), new T.MeshLambertMaterial({color:0xcccccc}));
        m.position.set(x,y,0); return m;
      };
      parts.head=mk(1.2,1.2,1.2,0,1.8); parts.torso=mk(2,2,1,0,0);
      parts.larm=mk(1,2,1,-1.5,0); parts.rarm=mk(1,2,1,1.5,0);
      parts.lleg=mk(1,2,1,-0.5,-2.1); parts.rleg=mk(1,2,1,0.5,-2.1);
      Object.values(parts).forEach(p => char.add(p));
      scene.add(char);

      var floor = new T.Mesh(new T.PlaneGeometry(500,500), new T.MeshLambertMaterial({color:0x3a6e3a}));
      floor.rotation.x = -Math.PI/2; floor.position.y = -3.1;
      scene.add(floor);

      cam.position.set(0, 5, 15);
      var keys = {}, velY = 0, isGrounded = true;

      window.onkeydown=(e)=>{
        if(e.code === "Escape" && isPlaying) toggleEsc();
        keys[e.code]=true;
      };
      window.onkeyup=(e)=>keys[e.code]=false;

      window.addEventListener('mousemove',(e)=>{ 
        if(isPlaying && !isPaused) {
          char.rotation.y -= e.movementX * 0.003; // Real Shift-Lock Mouse Look
        }
      });

      var toggleEsc = () => {
        isPaused = !isPaused;
        document.getElementById('esc-menu').style.display = isPaused ? 'flex' : 'none';
        if(!isPaused) con.requestPointerLock();
        else document.exitPointerLock();
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

          var t = Date.now() * 0.01;
          if (!isGrounded) {
             parts.larm.rotation.x = parts.rarm.rotation.x = -1.2;
          } else if (keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD']) {
             parts.larm.rotation.x = Math.sin(t)*1.2; parts.rarm.rotation.x = -Math.sin(t)*1.2;
             parts.lleg.rotation.x = -Math.sin(t)*1.2; parts.rleg.rotation.x = Math.sin(t)*1.2;
          }
          
          var offset = new T.Vector3(0, 6, 18).applyQuaternion(char.quaternion);
          cam.position.copy(char.position).add(offset);
          cam.lookAt(char.position.clone().add(new T.Vector3(0,2,0)));
        } else if (!isPlaying) {
          char.rotation.y += 0.01; // Preview Spin
          cam.position.set(0, 2, 10);
          cam.lookAt(char.position);
        }
        rend.render(scene, cam);
      };
      loop();

      // UI Actions
      document.getElementById('btn-play').onclick = () => {
        isPlaying = true;
        document.getElementById('side-editor').classList.add('hidden');
        con.requestPointerLock();
      };

      document.getElementById('esc-resume').onclick = toggleEsc;
      document.getElementById('esc-leave').onclick = () => {
        isPlaying = false; isPaused = false;
        document.getElementById('esc-menu').style.display = 'none';
        document.getElementById('side-editor').classList.remove('hidden');
        document.exitPointerLock();
      };
      document.getElementById('esc-reset').onclick = () => {
        char.position.set(0,0,0); toggleEsc();
      };

      document.getElementById('btn-paint').onclick = () => { 
        parts[document.getElementById('part-select').value].material.color.set(document.getElementById('color-part').value); 
      };
      
      document.getElementById('u-btn').onclick = async () => {
        var v = document.getElementById('u-in').value;
        var r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usernames:[v],excludeBannedUsers:true})});
        var d = await r.json();
        if(d.data && d.data[0]) {
           new T.TextureLoader().load('https://corsproxy.io/?' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+d.data[0].id+'&width=150&height=150&format=png'), (t) => { parts.head.material = new T.MeshLambertMaterial({map:t}); });
        }
      };
    };

    if (!window['THREE']) {
      var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = start; document.head.appendChild(s);
    } else { start(); }
  };
  setup();
}
