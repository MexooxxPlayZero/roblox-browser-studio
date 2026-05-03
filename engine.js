{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = ".ro-win{position:fixed!important;width:850px;height:620px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:8px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:50px;top:50px;box-shadow:0 20px 60px #000;overflow:hidden}.ro-bar{height:38px;background:#222;display:flex;align-items:center;padding:0 12px;cursor:move;border-bottom:1px solid #333}.ro-tabs{display:flex;background:#25252b;padding:0 10px;gap:5px;border-bottom:1px solid #333}.ro-tab{padding:8px 15px;font-size:11px;cursor:pointer;color:#888;border-bottom:2px solid transparent}.ro-tab.active{color:#fff;border-bottom:2px solid #0084ff;background:rgba(255,255,255,0.05)}.ro-body{flex:1;display:flex;background:#1b1b1f}#canvas-container{flex:1;background:#000!important;position:relative;display:flex;align-items:center;justify-content:center}.side-panel{width:280px;padding:15px;border-right:1px solid #333;display:flex;flex-direction:column;gap:10px;background:#1b1b1f;overflow-y:auto}.ro-input{background:#2a2a30;border:1px solid #444;color:#fff;padding:8px;border-radius:4px;width:calc(100% - 20px);font-size:12px}.ro-btn-blue{background:#0084ff;border:none;color:#fff;padding:10px;cursor:pointer;border-radius:4px;font-weight:bold;font-size:11px;width:100%}.hidden{display:none!important}";
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.innerHTML = '<div class="ro-bar"><span>Roblox Studio v0.6.3</span><button style="margin-left:auto;background:#ff4b4b;border:none;color:#fff;cursor:pointer;border-radius:4px;padding:2px 10px" onclick="this.closest(\'.ro-win\').remove()">X</button></div><div class="ro-tabs"><div class="ro-tab active" id="t-av">Avatar</div><div class="ro-tab" id="t-wd">World</div><div class="ro-tab" id="t-an">Animations</div></div><div class="ro-body"><div class="side-panel" id="p-av"><label style="font-size:10px;color:#888">USER LOADER</label><input type="text" id="u-in" class="ro-input" placeholder="Username..."><button id="u-btn" class="ro-btn-blue">FETCH FACE</button><hr style="border:0;border-top:1px solid #333"><label style="font-size:10px;color:#888">COLORS</label><select id="part-select" class="ro-input"><option value="head">Head</option><option value="torso">Torso</option><option value="larm">Left Arm</option><option value="rarm">Right Arm</option><option value="lleg">Left Leg</option><option value="rleg">Right Leg</option></select><input type="color" id="color-part" style="width:100%;height:35px" value="#cccccc"><button id="btn-apply-part" class="ro-btn-blue">PAINT PART</button><button id="btn-save-prog" class="ro-btn-blue" style="background:#28a745;margin-top:10px">💾 SAVE</button><button id="btn-load-prog" class="ro-btn-blue" style="background:#6610f2">📂 LOAD</button></div><div class="side-panel hidden" id="p-wd"><button id="btn-floor" class="ro-btn-blue">Toggle Baseplate</button></div><div class="side-panel hidden" id="p-an"><button class="an-b ro-btn-blue" data-anim="idle">IDLE</button><button class="an-b ro-btn-blue" data-anim="walk" style="margin-top:5px">WALK</button><button class="an-b ro-btn-blue" data-anim="stop" style="background:#444;margin-top:5px">STOP</button></div><div id="canvas-container">Wait...</div></div>';
    document.body.appendChild(roWin);

    var start = () => {
      if (!window['THREE']) return setTimeout(start, 100);
      var T = window['THREE'];
      var con = document.getElementById('canvas-container');
      con.innerHTML = "";
      var clock = new T.Clock(), scene = new T.Scene(), cam = new T.PerspectiveCamera(45, con.clientWidth/con.clientHeight, 0.1, 1000);
      cam.position.set(0, 2, 15);
      var rend = new T.WebGLRenderer({antialias:true});
      rend.setSize(con.clientWidth, con.clientHeight);
      rend.setClearColor(0x000000, 1);
      con.appendChild(rend.domElement);
      scene.add(new T.AmbientLight(0xffffff, 1.4));
      var char = new T.Group(), parts = {}, anim = "stop";
      var mk = (w,h,d,x,y) => {
        var m = new T.Mesh(new T.BoxGeometry(w,h,d), new T.MeshLambertMaterial({color:0xcccccc}));
        m.position.set(x,y,0); return m;
      };
      parts.head = mk(1.2,1.2,1.2,0,1.8); parts.torso = mk(2,2,1,0,0);
      parts.larm = mk(1,2,1,-1.5,0); parts.rarm = mk(1,2,1,1.5,0);
      parts.lleg = mk(1,2,1,-0.5,-2.1); parts.rleg = mk(1,2,1,0.5,-2.1);
      Object.values(parts).forEach(p => char.add(p));
      scene.add(char);
      var floor = new T.Mesh(new T.PlaneGeometry(100,100), new T.MeshLambertMaterial({color:0x333333}));
      floor.rotation.x = -Math.PI/2; floor.position.y = -3.1; floor.visible = false;
      scene.add(floor);

      var loop = () => {
        requestAnimationFrame(loop);
        var t = clock.getElapsedTime();
        if(anim === "walk") {
          parts.larm.rotation.x = Math.sin(t*8)*0.7; parts.rarm.rotation.x = -Math.sin(t*8)*0.7;
          parts.lleg.rotation.x = -Math.sin(t*8)*0.7; parts.rleg.rotation.x = Math.sin(t*8)*0.7;
        } else if(anim === "stop") { Object.values(parts).forEach(p => p.rotation.set(0,0,0)); }
        rend.render(scene, cam);
      };
      loop();

      document.getElementById('btn-apply-part').onclick = () => parts[document.getElementById('part-select').value].material.color.set(document.getElementById('color-part').value);
      document.getElementById('btn-floor').onclick = () => floor.visible = !floor.visible;
      document.querySelectorAll('.an-b').forEach(b => b.onclick = () => anim = b.dataset.anim);
      document.getElementById('u-btn').onclick = async () => {
        var v = document.getElementById('u-in').value, id = v;
        if(isNaN(v)) {
          var r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usernames:[v],excludeBannedUsers:true})});
          var d = await r.json(); if(d.data && d.data[0]) id = d.data[0].id;
        }
        new T.TextureLoader().load('https://corsproxy.io/?' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+id+'&width=150&height=150&format=png'), (t) => { parts.head.material = new T.MeshLambertMaterial({map:t}); });
      };
      var ts = ["av","wd","an"];
      ts.forEach(t => document.getElementById('t-'+t).onclick = () => { ts.forEach(x=>{document.getElementById('p-'+x).classList.add('hidden');document.getElementById('t-'+x).classList.remove('active');});document.getElementById('p-'+t).classList.remove('hidden');document.getElementById('t-'+t).classList.add('active');});
    };

    if (!window['THREE']) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.onload = start;
      document.head.appendChild(s);
    } else { start(); }
  };
  setup();
}
