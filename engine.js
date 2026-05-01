if (window.__roStudioLoaded) {
  console.log('Reloading UI...');
  document.querySelector('.ro-win')?.remove();
}
window.__roStudioLoaded = true;

const style = document.createElement('style');
style.textContent = `
  .ro-win { position: fixed; width: 600px; height: 450px; background: #18181c; color: #fff; font-family: sans-serif; border-radius: 8px; z-index: 999999; display: flex; flex-direction: column; border: 1px solid #333; left: 50px; top: 50px; box-shadow: 0 10px 30px #000; overflow: hidden; }
  .ro-bar { height: 35px; background: #222; display: flex; align-items: center; padding: 0 10px; cursor: move; }
  .ro-tabs { display: flex; background: #2b2b32; padding: 5px 5px 0 5px; gap: 2px; }
  .ro-tab { padding: 8px 15px; background: #333; font-size: 11px; cursor: pointer; border-radius: 4px 4px 0 0; color: #999; }
  .ro-tab.active { background: #18181c; color: #fff; }
  .ro-body { flex: 1; padding: 15px; background: #18181c; overflow-y: auto; }
  .ro-pane { display: none; }
  .ro-pane.active { display: block; }
  .ro-close { margin-left: auto; background: #f44; border: none; color: #fff; cursor: pointer; border-radius: 3px; }
  
  .avatar-ui { display: flex; flex-direction: column; gap: 15px; }
  .search-row { display: flex; gap: 10px; }
  .ro-input { background: #25252b; border: 1px solid #444; color: #fff; padding: 8px; flex: 1; border-radius: 4px; }
  .ro-btn-blue { background: #0084ff; border: none; color: #fff; padding: 8px 15px; cursor: pointer; border-radius: 4px; }
  
  .catalog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
  .item-card { background: #25252b; border: 1px solid #333; padding: 10px; border-radius: 6px; text-align: center; }
  .item-thumb { width: 100%; height: 60px; background: #111; margin-bottom: 5px; border-radius: 4px; display:flex; align-items:center; justify-content:center; font-size:20px; }
`;
document.head.appendChild(style);

const win = document.createElement('div');
win.className = 'ro-win';
win.innerHTML = `
  <div class="ro-bar"><span>Studio v0.2</span><button class="ro-close">X</button></div>
  <div class="ro-tabs">
    <div class="ro-tab active" data-target="home">Home</div>
    <div class="ro-tab" data-target="avatar">Avatar Shop</div>
  </div>
  <div class="ro-body">
    <div class="ro-pane active" id="pane-home"><h3>Welcome</h3><p>Ready to build.</p></div>
    <div class="ro-pane" id="pane-avatar">
      <div class="avatar-ui">
        <div class="search-row">
          <input type="text" class="ro-input" id="u-in" placeholder="Username...">
          <button class="ro-btn-blue" id="u-btn">Search</button>
        </div>
        <div id="u-res" style="text-align:center; padding:10px; background:#111; border-radius:5px;">Enter a name to fetch avatar</div>
        <hr style="border:0; border-top:1px solid #333; width:100%;">
        <div style="font-weight:bold; font-size:12px; color:#888;">FREE ITEMS</div>
        <div class="catalog-grid">
          <div class="item-card"><div class="item-thumb">👕</div>Blue Shirt<br><button class="ro-btn-blue" style="font-size:10px; padding:2px 5px; margin-top:5px;">WEAR</button></div>
          <div class="item-card"><div class="item-thumb">👖</div>Black Jeans<br><button class="ro-btn-blue" style="font-size:10px; padding:2px 5px; margin-top:5px;">WEAR</button></div>
          <div class="item-card"><div class="item-thumb">🗡️</div>Sword<br><button class="ro-btn-blue" style="font-size:10px; padding:2px 5px; margin-top:5px;">WEAR</button></div>
        </div>
      </div>
    </div>
  </div>
`;

document.body.appendChild(win);

// Tab Switching
win.querySelectorAll('.ro-tab').forEach(t => {
  t.onclick = () => {
    win.querySelectorAll('.ro-tab, .ro-pane').forEach(el => el.classList.remove('active'));
    t.classList.add('active');
    win.querySelector('#pane-' + t.dataset.target).classList.add('active');
  };
});

// Search Logic (Improved)
const btn = win.querySelector('#u-btn');
btn.onclick = async () => {
  const name = win.querySelector('#u-in').value;
  const res = win.querySelector('#u-res');
  if(!name) return;
  res.innerText = 'Connecting to Roblox...';
  
  try {
    const response = await fetch(`https://corsproxy.io/?https://users.roblox.com/v1/usernames/users`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({usernames: [name], excludeBannedUsers: true})
    });
    const data = await response.json();
    if(data.data && data.data[0]) {
      const id = data.data[0].id;
      res.innerHTML = `<img src="https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=100&height=100&format=png" style="border-radius:50%;"><br><strong>${data.data[0].displayName}</strong>`;
    } else {
      res.innerText = 'User not found.';
    }
  } catch (e) {
    res.innerText = 'API Error (CORS Blocked). Try on a different website.';
  }
};

// Drag & Close
let d=false,x,y;
win.querySelector('.ro-bar').onmousedown=(e)=>{d=true;x=e.clientX-win.offsetLeft;y=e.clientY-win.offsetTop;};
window.onmousemove=(e)=>{if(d){win.style.left=(e.clientX-x)+'px';win.style.top=(e.clientY-y)+'px';}};
window.onmouseup=()=>{d=false;};
win.querySelector('.ro-close').onclick=()=>{win.remove();style.remove();window.__roStudioLoaded=false;};
