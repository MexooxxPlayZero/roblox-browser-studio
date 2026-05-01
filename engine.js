{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = ".ro-win{position:fixed!important;width:800px;height:550px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:8px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:50px;top:50px;box-shadow:0 20px 60px #000;overflow:hidden;pointer-events:auto!important}.ro-bar{height:38px;background:#222;display:flex;align-items:center;padding:0 12px;cursor:move;border-bottom:1px solid #333;user-select:none}.ro-body{flex:1;display:flex;background:#1b1b1f}.ro-close{margin-left:auto;background:#ff4b4b;border:none;color:#fff;cursor:pointer;border-radius:4px;padding:2px 10px;font-weight:bold}.side-panel{width:260px;padding:15px;border-right:1px solid #333;display:flex;flex-direction:column;gap:12px;background:#1b1b1f}#canvas-container{flex:1;background:#0c0c0e;position:relative;cursor:grab}.ro-input{background:#2a2a30;border:1px solid #444;color:#fff;padding:10px;border-radius:4px;outline:none;width:calc(100% - 22px)}.ro-btn-blue{background:#0084ff;border:none;color:#fff;padding:10px;cursor:pointer!important;border-radius:4px;font-weight:bold;font-size:11px;width:100%;margin-top:5px}";
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.innerHTML = '<div class="ro-bar"><span>Roblox Studio v0.4.5</span><button class="ro-close">X</button></div><div class="ro-body"><div class="side-panel"><input type="text" id="u-in" class="ro-input" placeholder="User ID..."><button id="u-btn" class="ro-btn-blue">LOAD ID</button><hr style="border:0;border-top:1px solid #333;width:100%"><button class="ro-btn-blue" id="btn-red">RED SHIRT</button><button class="ro-btn-blue" id="btn-blue" style="background:#0055ff">BLUE SHIRT</button></div><div id="canvas-container"></div></div>';
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
          char.rotation.x += (e.clientY - ly) * 0.01;
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
    document.getElementById('u-btn').onclick = () => {
      var id = document.getElementById('u-in').value;
      if(!id) return;
      var tex = new THREE.TextureLoader();
      tex.setCrossOrigin('anonymous');
      var url = 'https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&url=' + encodeURIComponent('https://www.roblox.com/headshot-thumbnail/image?userId='+id+'&width=150&height=150&format=png');
      head.material = new THREE.MeshLambertMaterial({map: tex.load(url)});
    };

    var mv = false, mx, my;
    roWin.querySelector('.ro-bar').onmousedown = (e) => { mv = true; mx = e.clientX - roWin.offsetLeft; my = e.clientY - roWin.offsetTop; };
    window.onmousemove = (e) => { if(mv) { roWin.style.left = (e.clientX - mx) + 'px'; roWin.style.top = (e.clientY - my) + 'px'; } };
    window.onmouseup = () => mv = false;
    roWin.querySelector('.ro-close').onclick = () => { roWin.remove(); roStyle.remove(); window.__roStudioLoaded = false; };
    console.log("Studio v0.4.5 Loaded Successfully");
  };
  setup();
}
