if (window.__roStudioLoaded) {
  console.log('Already running.');
} else {
  window.__roStudioLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .ro-win { position: fixed; width: 650px; height: 500px; background: #18181c; color: #fff; font-family: sans-serif; border-radius: 8px; z-index: 999999; display: flex; flex-direction: column; border: 1px solid #333; left: 50px; top: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow: hidden; }
    .ro-bar { height: 35px; background: #222; display: flex; align-items: center; padding: 0 10px; cursor: move; border-bottom: 1px solid #333; }
    .ro-tabs { display: flex; background: #2b2b32; gap: 2px; padding: 5px 5px 0 5px; }
    .ro-tab { padding: 8px 20px; background: #333; font-size: 11px; cursor: pointer; border-radius: 4px 4px 0 0; color: #999; }
    .ro-tab.active { background: #18181c; color: #fff; font-weight: bold; }
    .ro-body { flex: 1; padding: 15px; background: #18181c; overflow-y: auto; }
    .ro-pane { display: none; }
    .ro-pane.active { display: block; }
    .ro-close { margin-left: auto; background: #f44; border: none; color: #fff; cursor: pointer; border-radius: 3px; padding: 0 5px; }
    
    .search-row { display: flex; gap: 5px; margin-bottom: 15px; }
    .ro-input { background: #25252b; border: 1px solid #444; color: #fff; padding: 8px; border-radius: 4px; flex: 1; outline: none; }
    .ro-btn-blue { background: #0084ff; border: none; color: #fff; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
    
    .avatar-preview { display: flex; gap: 15px; background: #111; padding: 15px; border-radius: 8px; border: 1px solid #333; }
    #avatar-pic { width: 120px; height: 120px; background: #222; border-radius: 6px; background-size: cover; }
    
    .catalog-shelf { margin-top: 15px; }
    .shelf-title { font-size: 12px; color: #888; margin-bottom: 8px; text-transform: uppercase; }
    .item-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; }
    .item-card { background: #25252b; border: 1px solid #333; padding: 5px; border-radius: 4px; text-align: center; cursor: pointer; font-size: 10px; }
    .item-card:hover { border-color: #0084ff; }
    .item-img-sm { width: 100%; height: 50px; background: #111; margin-bottom: 5px; border-radius: 2px; }
  `;
  document.head.appendChild(style);

  const win = document.createElement('div');
  win.className = 'ro-win';

  const bar = document.createElement('div');
  bar.className = 'ro-bar';
  bar.innerHTML = '<span style="font-size:11px;color:#888">STUDIO v0.2</span><button class="ro-close">X</button>';
  
  const tabs = document.createElement('div');
  tabs.className = 'ro-tabs';
  
  const body = document.createElement('div');
  body.className = 'ro-body';

  const sections = [
    { id: 'Home', html: '<h3>Welcome to Studio</h3><p>Status: <span style="color:#0f0">Online</span></p>' },
    { id: 'Avatar', html: `
      <div class="search-row">
        <input type="text" class="ro-input" id="inp-user" placeholder="Username...">
        <button class="ro-btn-blue" id="btn-search">Load Player</button>
      </div>
      <div class="avatar-preview">
        <div id="avatar-pic"></div>
        <div>
          <div id="res-name" style="font-weight:bold; font-size:16px;">Unknown</div>
          <div id="res-id" style="color:#777; font-size:12px;">ID: 0</div>
        </div>
      </div>
      <div class="catalog-shelf">
        <div class="shelf-title">Free Starter Items</div>
        <div class="item-grid">
          <div class="item-card" onclick="alert('Item Applied!')"><div class="item-img-sm"></div>Black Slacks</div>
          <div class="item-card" onclick="alert('Item Applied!')"><div class="item-img-sm"></div>Blue Shirt</div>
          <div class="item-card" onclick="alert('Item Applied!')"><div class="item-img-sm"></div>Roblox Cap</div>
          <div class="item-card" onclick="alert('Item Applied!')"><div class="item-img-sm"></div>Classic Sword</div>
        </div>
      </div>
    ` },
    { id: 'Viewport', html: '<p>Engine Core: Loading Shaders...</p>' }
  ];

  sections.forEach((sec, i) => {
    const t = document.createElement('div');
    t.className = 'ro-tab' + (i === 0 ? ' active' : '');
    t.textContent = sec.id;
    tabs.appendChild(t);
    const p = document.createElement('div');
    p.className = 'ro-pane' + (i === 0 ? ' active' : '');
    p.innerHTML = sec.html;
    body.appendChild(p);
    t.onclick = () => {
      win.querySelectorAll('.ro-tab').forEach(x => x.classList.remove('active'));
      win.querySelectorAll('.ro-pane').forEach(x => x.classList.remove('active'));
      t.classList.add('active'); p.classList.add('active');
    };
  });

  win.appendChild(bar); win.appendChild(tabs); win.appendChild(body);
  document.body.appendChild(win);

  const searchBtn = win.querySelector('#btn-search');
  searchBtn.onclick = async () => {
    const user = win.querySelector('#inp-user').value;
    if (!user) return;
    try {
      const r = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://users.roblox.com/v1/usernames/users'), {
        method: 'POST', body: JSON.stringify({usernames:[user], excludeBannedUsers:true}),
        headers: {'Content-Type':'application/json'}
      });
      const d = await r.json();
      if(d.data && d.data[0]) {
        const id = d.data[0].id;
        win.querySelector('#res-name').innerText = d.data[0].displayName;
        win.querySelector('#res-id').innerText = 'ID: ' + id;
        const tr = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds='+id+'&size=150x150&format=Png&isCircular=false'));
        const td = await tr.json();
        win.querySelector('#avatar-pic').style.backgroundImage = "url('" + td.data[0].imageUrl + "')";
      }
    } catch(e) { console.error(e); }
  };

  let drag = false, ox, oy;
  bar.onmousedown = (e) => { drag = true; ox = e.clientX - win.offsetLeft; oy = e.clientY - win.offsetTop; };
  window.onmousemove = (e) => { if (drag) { win.style.left = (e.clientX - ox) + 'px'; win.style.top = (e.clientY - oy) + 'px'; } };
  window.onmouseup = () => { drag = false; };
  win.querySelector('.ro-close').onclick = () => { win.remove(); style.remove(); window.__roStudioLoaded = false; };
}
