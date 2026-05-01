if (window.__roStudioLoaded) {
  document.querySelector('.ro-win')?.remove();
}
window.__roStudioLoaded = true;

const style = document.createElement('style');
style.textContent = `
  .ro-win { position: fixed; width: 750px; height: 500px; background: #18181c; color: #fff; font-family: sans-serif; border-radius: 8px; z-index: 999999; display: flex; flex-direction: column; border: 1px solid #333; left: 50px; top: 50px; box-shadow: 0 10px 40px #000; overflow: hidden; }
  .ro-bar { height: 35px; background: #222; display: flex; align-items: center; padding: 0 10px; cursor: move; border-bottom: 1px solid #333; }
  .ro-tabs { display: flex; background: #2b2b32; padding: 5px 5px 0 5px; gap: 2px; }
  .ro-tab { padding: 8px 15px; background: #333; font-size: 11px; cursor: pointer; border-radius: 4px 4px 0 0; color: #999; transition: 0.2s; }
  .ro-tab.active { background: #18181c; color: #fff; font-weight: bold; }
  .ro-body { flex: 1; padding: 15px; background: #18181c; overflow-y: auto; display: flex; gap: 20px; }
  .ro-pane { display: none; width: 100%; height: 100%; }
  .ro-pane.active { display: flex; gap: 20px; }
  .ro-close { margin-left: auto; background: #ff4b4b; border: none; color: #fff; cursor: pointer; border-radius: 4px; padding: 2px 8px; font-weight: bold; }
  
  /* Avatar Layout */
  .avatar-left { flex: 1; display: flex; flex-direction: column; gap: 15px; }
  .avatar-right { width: 220px; background: #111; border-radius: 8px; border: 1px solid #333; display: flex; flex-direction: column; align-items: center; padding: 15px; position: relative; }
  
  /* R6 Body CSS */
  .r6-container { position: relative; width: 120px; height: 180px; margin-top: 20px; }
  .r6-part { position: absolute; background: #d3d3d3; border: 1px solid rgba(0,0,0,0.2); transition: 0.3s; background-size: cover; }
  .head { width: 30px; height: 30px; left: 45px; top: 0; border-radius: 4px; }
  .torso { width: 60px; height: 60px; left: 30px; top: 32px; }
  .l-arm { width: 28px; height: 60px; left: 0; top: 32px; }
  .r-arm { width: 28px; height: 60px; left: 92px; top: 32px; }
  .l-leg { width: 28px; height: 60px; left: 30px; top: 94px; }
  .r-leg { width: 28px; height: 60px; left: 62px; top: 94px; }

  .catalog-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; overflow-y: auto; max-height: 250px; padding-right: 5px; }
  .item-card { background: #25252b; border: 1px solid #333; padding: 10px; border-radius: 6px; text-align: center; }
  .item-img { width: 100%; height: 70px; background: #111; border-radius: 4px; margin-bottom: 8px; background-size: contain; background-repeat: no-repeat; background-position: center; }
  
  .ro-btn-blue { background: #0084ff; border: none; color: #fff; padding: 6px 12px; cursor: pointer; border-radius: 4px; width: 100%; font-size: 11px; font-weight: bold; }
  .ro-btn-blue:hover { background: #00a2ff; }
  .mode-badge { position: absolute; top: 5px; right: 5px; background: #444; font-size: 9px; padding: 2px 5px; border-radius: 3px; color: #0f0; }
`;
document.head.appendChild(style);

const win = document.createElement('div');
win.className = 'ro-win';
win.innerHTML = `
  <div class="ro-bar">
    <span style="font-size:12px; font-weight:bold; color:#aaa;">Roblox Browser Studio v0.3</span>
    <button class="ro-close">X</button>
  </div>
  <div class="ro-tabs">
    <div class="ro-tab active" data-target="avatar">Avatar Customization</div>
    <div class="ro-tab" data-target="home">Home</div>
  </div>
  <div class="ro-body">
    <div class="ro-pane active" id="pane-avatar">
      <div class="avatar-left">
        <div style="display:flex; gap:10px;">
          <input type="text" id="u-in" class="ro-input" style="flex:1; background:#222; border:1px solid #444; color:#fff; padding:8px; border-radius:4px;" placeholder="Search Username...">
          <button id="u-btn" class="ro-btn-blue" style="width:auto;">Load Player</button>
        </div>
        <div style="font-size:12px; font-weight:bold; color:#888;">CATALOG ITEMS</div>
        <div class="catalog-grid" id="catalog">
          </div>
      </div>
      <div class="avatar-right">
        <div class="mode-badge">R6 MODE</div>
        <div id="u-res" style="font-size:11px; margin-bottom:10px; color:#aaa;">No Player Loaded</div>
        <div class="r6-container" id="r6-body">
          <div class="r6-part head" id="p-head"></div>
          <div class="r6-part torso" id="p-torso"></div>
          <div class="r6-part l-arm" id="p-l-arm"></div>
          <div class="r6-part r-arm" id="p-r-arm"></div>
          <div class="r6-part l-leg" id="p-l-leg"></div>
          <div class="r6-part r-leg" id="p-r-leg"></div>
        </div>
        <button class="ro-btn-blue" style="margin-top:20px; background:#444;" onclick="location.reload()">Reset Character</button>
      </div>
    </div>
    <div class="ro-pane" id="pane-home"><h3>Welcome</h3><p>V0.3: R6 Preview Engine Active.</p></div>
  </div>
`;

document.body.appendChild(win);

// Catalog Data
const freeItems = [
  { name: 'Red Roblox Shirt', id: 'p-torso', img: '👕', color: '#ff4b4b' },
  { name: 'Blue Jeans', id: 'p-legs', img: '👖', color: '#33333a' },
  { name: 'Green Limbs', id: 'p-arms', img: '💪', color: '#4caf50' },
  { name: 'Classic Gold', id: 'p-head', img: '😎', color: '#ffcc00' }
];

const catEl = win.querySelector('#catalog');
freeItems.forEach(item => {
  const div = document.createElement('div');
  div.className = 'item-card';
  div.innerHTML = `
    <div class="item-img" style="font-size:30px; display:flex; align-items:center; justify-content:center;">${item.img}</div>
    <div style="font-size:10px; margin-bottom:8px;">${item.name}</div>
    <button class="ro-btn-blue">WEAR</button>
  `;
  div.querySelector('button').onclick = () => {
    if(item.id === 'p-legs') {
      win.querySelector('#p-l-leg').style.background = item.color;
      win.querySelector('#p-r-leg').style.background = item.color;
    } else if(item.id === 'p-arms') {
      win.querySelector('#p-l-arm').style.background = item.color;
      win.querySelector('#p-r-arm').style.background = item.color;
    } else {
      win.querySelector('#'+item.id).style.background = item.color;
    }
  };
  catEl.appendChild(div);
});

// Tab Switching
win.querySelectorAll('.ro-tab').forEach(t => {
  t.onclick = () => {
    win.querySelectorAll('.ro-tab, .ro-pane').forEach(el => el.classList.remove('active'));
    t.classList.add('active');
    win.querySelector('#pane-' + t.dataset.target).classList.add('active');
  };
});

// Search Logic
const btn = win.querySelector('#u-btn');
btn.onclick = async () => {
  const name = win.querySelector('#u-in').value;
  const res = win.querySelector('#u-res');
  if(!name) return;
  res.innerText = 'Fetching...';
  try {
    const response = await fetch(`https://corsproxy.io/?https://users.roblox.com/v1/usernames/users`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({usernames: [name], excludeBannedUsers: true})
    });
    const data = await response.json();
    if(data.data && data.data[0]) {
      const id = data.data[0].id;
      res.innerHTML = `<strong>${data.data[0].displayName}</strong>`;
      win.querySelector('#p-head').style.backgroundImage = `url(https://www.roblox.com/headshot-thumbnail/image?userId=${id}&width=100&height=100&format=png)`;
    } else { res.innerText = 'User not found.'; }
  } catch (e) { res.innerText = 'Error loading user.'; }
};

// Drag Logic
let d=false,x,y;
win.querySelector('.ro-bar').onmousedown=(e)=>{d=true;x=e.clientX-win.offsetLeft;y=e.clientY-win.offsetTop;};
window.onmousemove=(e)=>{if(d){win.style.left=(e.clientX-x)+'px';win.style.top=(e.clientY-y)+'px';}};
window.onmouseup=()=>{d=false;};
win.querySelector('.ro-close').onclick=()=>{win.remove();style.remove();window.__roStudioLoaded=false;};
