// == Roblox Browser Studio – Full Core Shell ==

if (window.__roStudioLoaded) {
  console.log("Roblox Browser Studio already running.");
} else {
  window.__roStudioLoaded = true;

  // 1. STYLES
  const style = document.createElement("style");
  style.textContent = `
    .ro-win {
      position: fixed; width: 700px; height: 450px;
      background: #18181c; color: #fff;
      font-family: 'Segoe UI', Tahoma, sans-serif;
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
      justify-content: center; font-size: 14px;
    }
    .ro-btn-min { background: #3a3a40; color: #fff; }
    .ro-btn-close { background: #ff4b4b; color: #fff; }

    /* Tab System Styles */
    .ro-tabs {
      display: flex; background: #2b2b32; padding: 5px 5px 0 5px;
      gap: 2px; border-bottom: 1px solid #111;
    }
    .ro-tab {
      padding: 6px 15px; background: #33333a; font-size: 11px;
      cursor: pointer; border-radius: 4px 4px 0 0; color: #aaa;
      transition: 0.2s;
    }
    .ro-tab:hover { background: #3e3e46; color: #fff; }
    .ro-tab.active { background: #18181c; color: #fff; font-weight: bold; }

    .ro-content { flex: 1; display: flex; flex-direction: column; background: #18181c; }
    .ro-view-pane { display: none; flex: 1; padding: 15px; font-size: 13px; line-height: 1.5; }
    .ro-view-pane.active { display: block; }

    /* Minimized Icon Styles */
    .ro-min {
      position: fixed; width: 45px; height: 45px; background: #18181c;
      border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 999999; border: 1px solid #444;
    }
    .ro-min-icon {
      width: 24px; height: 24px; background: #444; border-radius: 4px; position: relative;
    }
    .ro-min-icon::after {
      content: ""; position: absolute; inset: 6px; background: #18181c; transform: rotate(45deg);
    }
  `;
  document.head.appendChild(style);

  // 2. MAIN WINDOW ELEMENTS
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
  btnMin.className = "ro-btn ro-btn-min"; btnMin.innerHTML = "&#8211;";
  const btnClose = document.createElement("button");
  btnClose.className = "ro-btn ro-btn-close"; btnClose.innerHTML = "&times;";

  btnRow.appendChild(btnMin);
  btnRow.appendChild(btnClose);
  titlebar.appendChild(title);
  titlebar.appendChild(btnRow);

  // 3. TAB LOGIC
  const tabsContainer = document.createElement("div");
  tabsContainer.className = "ro-tabs";

  const contentContainer = document.createElement("div");
  contentContainer.className = "ro-content";

  const sections = [
    { id: 'home', name: 'Home', content: '<b>Welcome to Mini Roblox Studio</b><br><br>Status: <span style="color:#4caf50">Engine Ready</span><br>Next step: Integrate Three.js Viewport.' },
    { id: 'avatar', name: 'Avatar', content: 'Avatar Loader: Coming Soon...<br>This tab will allow fetching Roblox User IDs.' },
    { id: 'viewport', name: 'Viewport', content: '<div style="width:100%; height:100%; background:#000; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#555">3D Canvas Placeholder</div>' }
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

  // 4. DRAG LOGIC
  (function makeDraggable(el, handle) {
    let offsetX = 0, offsetY = 0, dragging = false;
    handle.addEventListener("
