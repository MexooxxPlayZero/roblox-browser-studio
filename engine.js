{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = ".ro-win{position:fixed!important;width:820px;height:550px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:8px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:50px;top:50px;box-shadow:0 20px 60px #000;overflow:hidden}.ro-bar{height:38px;background:#222;display:flex;align-items:center;padding:0 12px;cursor:move;border-bottom:1px solid #333}.ro-body{flex:1;display:flex;background:#1b1b1f;position:relative}.side-panel{width:260px;padding:15px;border-right:1px solid #333;display:flex;flex-direction:column;gap:12px;background:#1b1b1f;z-index:20}#canvas-container{flex:1;background:#000!important;position:relative;cursor:grab;z-index:10}.ro-input{background:#2a2a30;border:1px solid #444;color:#fff;padding:10px;border-radius:4px;width:calc(100% - 22px)}.ro-btn-blue{background:#0084ff;border:none;color:#fff;padding:10px;cursor:pointer;border-radius:4px;font-weight:bold;font-size:11px;width:100%;margin-top:5px}.ro-close{margin-left:auto;background:#ff4b4b;border:none;color:#fff;cursor:pointer;border-radius:4px;padding:2px 10px}";
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.innerHTML = '<div class="ro-bar"><span>Roblox Studio v0.4.7</span><button class="ro-close">X</button></div><div class="ro-body"><div class="side-panel"><label style="font-size:10px;color:#888">USER OR ID:</label><input type="text" id="u-in" class="ro-input" placeholder="Name or ID..."><button id="u-btn" class="ro-btn-blue">UPDATE PLAYER</button><hr style="border:0;border-top:1px solid #333;width:100%"><button class="ro-btn-blue" id="btn-red">RED SHIRT</button><button class="ro-btn-blue" id="btn-blue" style="background:#0055ff">BLUE SHIRT</button><button class="ro-btn-blue" id="btn-reset" style="background:#444">RESET ALL</button></div><div id="canvas-container"></div></div>';
    document.body.appendChild(roWin);

    var scene, cam, rend, char, head, torso;
    var init3D = () => {
      if (!window.THREE) return setTimeout(init3D, 100);
      var con = document.getElementById('canvas-container');
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(45, con.clientWidth/con.clientHeight, 0.1, 1000);
      cam.position.set(0, 1, 12);
      rend = new THREE.WebGLRenderer({antialias:true});
      rend.setSize(con.clientWidth, con.clientHeight);
      con.appendChild(rend.domElement);
      scene.add(new THREE.AmbientLight(0xffffff, 1.2));
      
      char = new THREE.Group();
      var box = (w,h,d,x,y,c) => {
        var m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshLambertMaterial({color:c}));
        m.position.set(x,y,0); return m;
      };
      head = box(1.2,1.2,1.2,0,1.8,0xffcc00);
      torso = box(2,2,1,0,0,0xcccccc);
      char.add(head, torso, box(1,2,1,-1.5,0,0xcccccc), box(1,2,1,1.5,0,0xcccccc), box(1,2,1,-0.5,-2.1,0xcccccc), box(1,2,1,0.5,-2.1,0xcccccc));
      scene.add(char);

      var drg = false, lx, ly;
      con.onmousedown = (e) => { drg = true; lx = e.clientX; ly = e.clientY; };
      window.onmousemove = (e) => {
        if (drg) {
          char.rotation.y += (e.clientX - lx) * 0.01;
          var nX = char.rotation.x + (e.clientY - ly) * 0.01;
          if(nX > -0.6 && nX < 0.6) char.rotation.x = nX;
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

    document.getElementById('btn-red').onclick = () => torso.material.color.setHex(0xff0000);
    document.getElementById('btn-blue').onclick = () => torso.material.color.setHex(0x0055ff);
    document.getElementById('btn-reset').onclick = () => {
        torso.material.color.setHex(0xcccccc);
        head.material = new THREE.MeshLambertMaterial({color: 0xffcc00});
    };

    document.getElementById('u-btn').onclick = async () => {
      var val = document.getElementById('u-in').value;
      if(!val) return;
      var targetId = val;
      
      // If it's a name, convert to ID first
      if (isNaN(val)) {
        try {
          var r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({usernames: [val], excludeBannedUsers: true})
          });
          var d = await r.json();
          if(d.data && d.data[0]) targetId = d.data[0].id;
        } catch(e) { console.log("Name search failed"); }
      }

      var texLoader = new THREE.TextureLoader();
      texLoader.setCrossOrigin('anonymous');
      var thumbUrl = 'https://tr.rbxcdn.com/avatar-headshot?userId=' + targetId + '&width=150&height=150&format=png';
      
      texLoader.load(thumbUrl, (texture) => {
          head.material = new THREE.MeshLambertMaterial({map: texture});
      }, undefined, () => { head.material.color.setHex(0xff00ff); });
    };

    var mv = false, mx, my;
    roWin.querySelector('.ro-bar').onmousedown = (e) => { mv = true; mx = e.clientX - roWin.offsetLeft; my = e.clientY - roWin.offsetTop; };
    window.onmousemove = (e) => { if(mv) { roWin.style.left = (e.clientX - mx) + 'px'; roWin.style.top = (e.clientY - my) + 'px'; } };
    window.onmouseup = () => mv = false;
    roWin.querySelector('.ro-close').onclick = () => { roWin.remove(); roStyle.remove(); window.__roStudioLoaded = false; };
  };
  setup();
}
