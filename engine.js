{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = `
      .ro-win{position:fixed!important;width:850px;height:620px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:8px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:50px;top:50px;box-shadow:0 20px 60px #000;overflow:hidden}
      .ro-bar{height:38px;background:#222;display:flex;align-items:center;padding:0 12px;cursor:move;border-bottom:1px solid #333}
      .ro-tabs{display:flex;background:#25252b;padding:0 10px;gap:5px;border-bottom:1px solid #333}
      .ro-tab{padding:8px 15px;font-size:11px;cursor:pointer;color:#888;border-bottom:2px solid transparent}
      .ro-tab.active{color:#fff;border-bottom:2px solid #0084ff;background:rgba(255,255,255,0.05)}
      .ro-body{flex:1;display:flex;background:#1b1b1f}
      #canvas-container{flex:1;background:#000!important;position:relative;display:flex;align-items:center;justify-content:center}
      .side-panel{width:280px;padding:15px;border-right:1px solid #333;display:flex;flex-direction:column;gap:10px;background:#1b1b1f;overflow-y:auto}
      .ro-input{background:#2a2a30;border:1px solid #444;color:#fff;padding:8px;border-radius:4px;width:calc(100% - 20px);font-size:12px}
      .ro-btn-blue{background:#0084ff;border:none;color:#fff;padding:10px;cursor:pointer;border-radius:4px;font-weight:bold;font-size:11px;width:100%}
      .hidden{display:none!important}
      #load-msg{color:#555;font-size:12px;font-style:italic}
    `;
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.innerHTML = `
      <div class="ro-bar"><span>Roblox Studio v0.6.2</span><button style="margin-left:auto;background:#ff4b4b;border:none;color:#fff;cursor:pointer;border-radius:4px;padding:2px 10px" onclick="this.closest('.ro-win').remove()">X</button></div>
      <div class="ro-tabs">
        <div class="ro-tab active" id="tab-btn-avatar">Avatar</div>
        <div class="ro-tab" id="tab-btn-world">World</div>
        <div class="ro-tab" id="tab-btn-anim">Animations</div>
      </div>
      <div class="ro-body">
        <div class="side-panel" id="panel-avatar">
          <label style="font-size:10px;color:#888">USER LOADER</label>
          <input type="text" id="u-in" class="ro-input" placeholder="Type Username...">
          <button id="u-btn" class="ro-btn-blue">FETCH FACE</button>
          <hr style="border:0;border-top:1px solid #333">
          <label style="font-size:10px;color:#888">BODY COLORING</label>
          <select id="part-select" class="ro-input">
            <option value="head">Head</option><option value="torso">Torso</option>
            <option value="larm">Left Arm</option><option value="rarm">Right Arm</option>
            <option value="lleg">Left Leg</option><option value="rleg">Right Leg</option>
          </select>
          <input type="color" id="color-part" style="width:100%;height:35px;cursor:pointer" value="#cccccc">
          <button id="btn-apply-part" class="ro-btn-blue">PAINT PART</button>
          <button id="btn-save-prog" class="ro-btn-blue" style="background:#28a745;margin-top:10px">💾 SAVE PROGRESS</button>
          <button id="btn-load-prog" class="ro-btn-blue" style="background:#6610f2">📂 LOAD SAVED</button>
        </div>
        <div class="side-panel hidden" id="panel-world">
          <button id="btn-toggle-floor" class="ro-btn-blue">Toggle Baseplate</button>
          <label style="margin-top:10px">Sky Color</label>
          <input type="color" id="color-sky" style="width:100%;height:35px" value="#000000">
        </div>
        <div class="side-panel hidden" id="panel-anim">
          <button class="anim-btn ro-btn-blue" data-anim="idle">IDLE</button>
          <button class="anim-btn ro-btn-blue" data-anim="walk">WALK (RETRO)</button>
          <button class="anim-btn ro-btn-blue" data-anim="stop" style="background:#444">STOP</button>
        </div>
        <div id="canvas-container"><span id="load-msg">Loading 3D Engine...</span></div>
      </div>`;
    document.body.appendChild(roWin);

    var scene, cam, rend, char, parts = {}, floor, clock, currentAnim = "stop";

    var startEngine = () => {
      // Check if THREE is loaded. If not, wait.
      if (typeof THREE === 'undefined') return setTimeout(startEngine, 100);
      
      var container = document.getElementById('canvas-container');
      container.innerHTML = ""; // Clear loading message
      
      clock = new THREE.Clock();
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 1000);
      cam.position.set(0, 2, 15);
      
      rend = new THREE.WebGLRenderer({antialias:true});
      rend.setSize(container.clientWidth, container.clientHeight);
      rend.setClearColor(0x000000, 1);
      container.appendChild(rend.domElement);
      
      scene.add(new THREE.AmbientLight(0xffffff, 1.4));
      
      char = new THREE.Group();
      var mk = (w,h,d,x,y) => {
        var m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color:0xcccccc}));
        m.position.set(x,y,0); return m;
      };
      parts.head = mk(1.2,1.2,1.2,0,1.8);
      parts.torso = mk(2,2,1,0,0);
      parts.larm = mk(1,2,1,-1.5,0);
      parts.rarm = mk(1,2,1,1.5,0);
      parts.lleg = mk(1,2,1,-0.5,-2.1);
      parts.rleg = mk(1,2,1,0.5,-2.1);
      Object.values(parts).forEach(p => char.add(p));
      scene.add(char);

      floor = new THREE.Mesh(new THREE.PlaneGeometry(100,100), new THREE.MeshLambertMaterial({color:0x333333}));
      floor.rotation.x = -Math.PI/2; floor.position.y = -3.1;
      floor.visible = false;
      scene.add(floor);

      var loop = () => {
        requestAnimationFrame(loop);
        var t = clock.getElapsedTime();
        if(currentAnim === "walk") {
          parts.larm.rotation.x = Math.sin(t * 8) * 0.7;
          parts.rarm.rotation.x = -Math.sin(t * 8) * 0.7;
          parts.lleg.rotation.x = -Math.sin(t * 8) * 0.7;
          parts.rleg.rotation.x = Math.sin(t * 8) * 0.7;
        } else if(currentAnim === "idle") {
          parts.rarm.rotation.z = Math.sin(t * 2) * 0.05 + 0.1;
          parts.larm.rotation.z = -(Math.sin(t * 2) * 0.05 + 0.1);
        } else if(currentAnim === "stop") {
          Object.values(parts).forEach(p => p.rotation.set(0,0,0));
        }
        rend.render(scene, cam);
      };
      loop();

      // UI Bindings
      document.getElementById('btn-apply-part').onclick = () => {
        parts[document.getElementById('part-select').value].material.color.set(document.getElementById('color-part').value);
      };

      document.getElementById('u-btn').onclick = async () => {
        var val = document.getElementById('u-in').value;
        if(!val) return;
        var id = val;
        if(isNaN(val)) {
          try {
            var r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {
              method: 'POST', headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({usernames: [val], excludeBannedUsers: true})
            });
            var d = await r.json();
            if(d.data && d.data[0]) id = d.data[0].id;
          } catch(e) {}
        }
        var thumbUrl = 'https://corsproxy.io/?' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+id+'&width=150&height=150&format=png');
        new THREE.TextureLoader().load(thumbUrl, (t) => { parts.head.material = new THREE.MeshLambertMaterial({map: t}); });
      };

      document.getElementById('btn-save-prog').onclick = () => {
        var s = {}; Object.keys(parts).forEach(k => s[k] = "#" + parts[k].material.color.getHexString());
        localStorage.setItem('ro_save', JSON.stringify(s));
        alert("Progress Saved!");
      };

      document.getElementById('btn-load-prog').onclick = () => {
        var s = JSON.parse(localStorage.getItem('ro_save'));
        if(s) Object.keys(s).forEach(k => parts[k].material.color.set(s[k]));
      };

      document.getElementById('btn-toggle-floor').onclick = () => floor.visible = !floor.visible;
      document.getElementById('color-sky').oninput = (e) => rend.setClearColor(e.target.value, 1);
      document.querySelectorAll('.anim-btn').forEach(b => b.onclick = () => currentAnim = b.dataset.anim);
      
      var tabs = ["avatar", "world", "anim"];
      tabs.forEach(t => {
        document.getElementById('tab-btn-'+t).onclick = () => {
          tabs.forEach(x => {
            document.getElementById('panel-'+x).classList.add('hidden');
            document.getElementById('tab-btn-'+x).classList.remove('active');
          });
          document.getElementById('panel-'+t).classList.remove('hidden');
          document.getElementById('tab-btn-'+t).classList.add('active');
        };
      });
    };

    if (typeof THREE === 'undefined') {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = startEngine;
      document.head.appendChild(s);
    } else { startEngine(); }
  };
  setup();
}
