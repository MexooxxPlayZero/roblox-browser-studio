if (window.__roStudioLoaded) {
  console.log("Roblox Browser Studio already running.");
} else {
  window.__roStudioLoaded = true;

  const style = document.createElement("style");
  style.textContent = `
    .ro-win {
      position: fixed; width: 700px; height: 450px;
      background: #18181c; color: #fff;
      font-family: sans-serif;
      border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.8);
      top: 50px; left: 50px; display: flex; flex-direction: column;
      z-index: 999999; overflow: hidden; border: 1px solid #333;
    }
    .ro-titlebar {
      height: 35px; background: #222228; display: flex;
      align-items: center; padding: 0 10px; cursor: move; user-select: none;
    }
    .ro-title { font-size: 12px; font-weight: 600; flex: 1; color: #bbb; }
    .ro-btn-row { display: flex; gap: 6px; }
    .ro-btn {
      width: 22px; height: 22px; border-radius: 4px; border: none;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; font-size: 14px; background: #3a3a40; color: #fff;
    }
    .ro-btn-close { background: #ff4b4b; }
    .ro-tabs {
      display: flex; background: #2b2b32; padding: 5px 5px 0 5px;
      gap: 2px; border-bottom: 1px solid #111;
    }
    .ro-tab {
      padding: 6px 15px; background: #33333a; font-size: 11px;
      cursor: pointer; border-radius: 4px 4px 0 0; color: #aaa;
    }
    .ro-tab.active { background: #18181c; color: #fff; font-weight: bold; }
    .ro-content { flex: 1; display: flex; flex-direction: column; background: #18181c; }
    .ro-view-pane { display: none; flex: 1; padding: 15px; font-size: 13px; }
    .ro-view-pane.active { display: block; }
  `;
  document.head.appendChild(style);

  const win = document.createElement("div");
  win.className = "ro-win";

  const titlebar = document.createElement("div");
  titlebar.className = "ro-titlebar";
  const title = document.createElement("div");
  title.className = "ro-title";
  title.textContent = "Roblox Browser Studio v0.1";

  const btnRow = document.createElement("div");
  btnRow.className = "ro-btn-row";
  const btnMin = document.createElement("button");
  btnMin.className = "ro-btn"; btnMin.textContent = "-";
  const btnClose = document.createElement("button");
  btnClose.className = "ro-btn ro-btn-close"; btnClose.textContent = "X";

  btnRow.appendChild(btnMin);
  btnRow.appendChild(btnClose);
  titlebar.appendChild(title);
  titlebar.appendChild(btnRow);

  const tabsContainer = document.createElement("div");
  tabsContainer.className = "ro-tabs";
  const contentContainer = document.createElement("div");
  contentContainer.className = "ro-content";

  const sections = [
    { id: 'home', name: 'Home', content: 'Studio Ready.' },
    { id: 'avatar', name: 'Avatar', content: 'Avatar Shop Loading...' },
    { id: 'viewport', name: 'Viewport', content: '3D Viewport placeholder.' }
  ];

  sections.forEach((sec, index) => {
    const tab = document.createElement("div");
    tab.className = "ro-tab" + (index === 0 ? " active" : "");
    tab.textContent = sec.name;
    tabsContainer.appendChild(tab);

    const pane = document.createElement("div");
    pane.className = "ro-view-pane" + (index === 0 ? " active" : "");
    pane.innerHTML = sec.content;
    contentContainer.appendChild(pane);

    tab.onclick = () => {
      win.querySelectorAll('.ro-tab').forEach(t => t.classList.remove('active'));
      win.querySelectorAll('.ro-view-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      pane.classList.add('active');
    };
  });

  win.appendChild(titlebar);
  win.appendChild(tabsContainer);
  win.appendChild(contentContainer);
  document.body.appendChild(win);

  let offX = 0, offY = 0, isDragging = false;
  titlebar.onmousedown = (e) => {
    isDragging = true;
    offX = e.clientX - win.offsetLeft;
    offY = e.clientY - win.offsetTop;
  };
  window.onmousemove = (e) => {
    if (!isDragging) return;
    win.style.left = (e.clientX - offX) + "px";
    win.style.top = (e.clientY - offY) + "px";
  };
  window.onmouseup = () => { isDragging = false; };

  btnMin.onclick = () => { win.style.display = "none"; alert("Studio Minimized. Refresh to restore (Temporary)."); };
  btnClose.onclick = () => { win.remove(); style.remove(); window.__roStudioLoaded = false; };
}
