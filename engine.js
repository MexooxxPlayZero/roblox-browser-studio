if (window.__roStudioLoaded) {
  console.log("Already running.");
} else {
  window.__roStudioLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .ro-win { position: fixed; width: 600px; height: 400px; background: #18181c; color: #fff; font-family: sans-serif; border-radius: 8px; z-index: 999999; display: flex; flex-direction: column; border: 1px solid #333; left: 50px; top: 50px; }
    .ro-bar { height: 35px; background: #222; display: flex; align-items: center; padding: 0 10px; cursor: move; }
    .ro-tabs { display: flex; background: #2b2b32; gap: 2px; }
    .ro-tab { padding: 5px 15px; background: #333; font-size: 11px; cursor: pointer; }
    .ro-tab.active { background: #18181c; }
    .ro-body { flex: 1; padding: 20px; background: #18181c; }
    .ro-pane { display: none; }
    .ro-pane.active { display: block; }
    .ro-close { margin-left: auto; background: #f44; border: none; color: #fff; cursor: pointer; border-radius: 3px; }
  `;
  document.head.appendChild(style);

  const win = document.createElement('div');
  win.className = 'ro-win';

  const bar = document.createElement('div');
  bar.className = 'ro-bar';
  bar.innerHTML = '<span>Mini Studio</span><button class="ro-close">X</button>';
  
  const tabs = document.createElement('div');
  tabs.className = 'ro-tabs';
  
  const body = document.createElement('div');
  body.className = 'ro-body';

  const pages = ['Home', 'Avatar', 'Viewport'];
  pages.forEach((name, i) => {
    const t = document.createElement('div');
    t.className = 'ro-tab' + (i === 0 ? ' active' : '');
    t.textContent = name;
    tabs.appendChild(t);

    const p = document.createElement('div');
    p.className = 'ro-pane' + (i === 0 ? ' active' : '');
    p.innerHTML = 'Section: ' + name;
    body.appendChild(p);

    t.onclick = () => {
      document.querySelectorAll('.ro-tab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.ro-pane').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      p.classList.add('active');
    };
  });

  win.appendChild(bar);
  win.appendChild(tabs);
  win.appendChild(body);
  document.body.appendChild(win);

  // Simplified Drag
  let dragging = false, px, py;
  bar.onmousedown = (e) => { dragging = true; px = e.clientX - win.offsetLeft; py = e.clientY - win.offsetTop; };
  window.onmousemove = (e) => { if (dragging) { win.style.left = (e.clientX - px) + 'px'; win.style.top = (e.clientY - py) + 'px'; } };
  window.onmouseup = () => { dragging = false; };

  win.querySelector('.ro-close').onclick = () => { win.remove(); style.remove(); window.__roStudioLoaded = false; };
}
