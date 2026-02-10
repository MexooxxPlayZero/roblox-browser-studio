// == Roblox Browser Studio – core window shell ==

// avoid double-inject
if (window.__roStudioLoaded) {
  console.log("Roblox Browser Studio already running.");
} else {
  window.__roStudioLoaded = true;

  // create styles
  const style = document.createElement("style");
  style.textContent = `
  .ro-win {
    position: fixed;
    width: 700px;
    height: 400px;
    background: #18181c;
    color: #fff;
    font-family: system-ui, sans-serif;
    border-radius: 8px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.6);
    top: 80px;
    left: 80px;
    display: flex;
    flex-direction: column;
    z-index: 999999;
  }
  .ro-titlebar {
    height: 32px;
    background: linear-gradient(#26262c,#18181c);
    display: flex;
    align-items: center;
    padding: 0 8px;
    cursor: move;
    user-select: none;
  }
  .ro-title {
    font-size: 13px;
    font-weight: 600;
    flex: 1;
  }
  .ro-btn-row {
    display: flex;
    gap: 4px;
  }
  .ro-btn {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    padding: 0;
  }
  .ro-btn-min { background:#3a3a40; color:#fff; }
  .ro-btn-close { background:#ff4b4b; color:#fff; }

  .ro-body {
    flex: 1;
    padding: 8px;
    background:#202028;
    border-radius: 0 0 8px 8px;
  }

  .ro-min {
    position: fixed;
    width: 40px;
    height: 40px;
    background:#101015;
    border-radius: 8px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 999999;
  }
  .ro-min-tab {
    border-radius: 12px;
  }
  .ro-min-icon {
    width: 24px;
    height: 24px;
    background:#333;
    border-radius: 6px;
    position: relative;
  }
  .ro-min-icon::before {
    content:"";
    position:absolute;
    inset:6px;
    background:#111;
    transform:rotate(45deg);
    border-radius:4px;
  }
  `;
  document.head.appendChild(style);

  // create main window
  const win = document.createElement("div");
  win.className = "ro-win";

  const titlebar = document.createElement("div");
  titlebar.className = "ro-titlebar";

  const title = document.createElement("div");
  title.className = "ro-title";
  title.textContent = "Mini Roblox Studio";

  const btnRow = document.createElement("div");
  btnRow.className = "ro-btn-row";

  const btnMin = document.createElement("button");
  btnMin.className = "ro-btn ro-btn-min";
  btnMin.textContent = "–";

  const btnClose = document.createElement("button");
  btnClose.className = "ro-btn ro-btn-close";
  btnClose.textContent = "×";

  btnRow.appendChild(btnMin);
  btnRow.appendChild(btnClose);
  titlebar.appendChild(title);
  titlebar.appendChild(btnRow);

  const body = document.createElement("div");
  body.className = "ro-body";
  body.textContent = "Studio shell loaded. Next: tabs, .roPlace, avatar shop…";

  win.appendChild(titlebar);
  win.appendChild(body);
  document.body.appendChild(win);

  // drag logic
  (function makeDraggable(el, handle) {
    let offsetX=0, offsetY=0, dragging=false;

    handle.addEventListener("mousedown", e=>{
      dragging=true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    function onMove(e){
      if (!dragging) return;
      el.style.left = (e.clientX - offsetX) + "px";
      el.style.top  = (e.clientY - offsetY) + "px";
    }
    function onUp(){
      dragging=false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
  })(win, titlebar);

  // minimized icon
  let minIcon = null;

  function createMinIcon() {
    if (minIcon) return minIcon;
    minIcon = document.createElement("div");
    minIcon.className = "ro-min";
    minIcon.style.left = "20px";
    minIcon.style.bottom = "20px";

    const icon = document.createElement("div");
    icon.className = "ro-min-icon";
    minIcon.appendChild(icon);

    document.body.appendChild(minIcon);

    // drag + edge snap
    let dragging=false, offX=0, offY=0;

    minIcon.addEventListener("mousedown", e=>{
      dragging=true;
      offX = e.clientX - minIcon.offsetLeft;
      offY = e.clientY - minIcon.offsetTop;
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });

    function move(e){
      if (!dragging) return;
      minIcon.classList.remove("ro-min-tab");
      minIcon.style.left = (e.clientX - offX) + "px";
      minIcon.style.top  = (e.clientY - offY) + "px";
    }

    function up(){
      dragging=false;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = minIcon.getBoundingClientRect();

      const distTop = rect.top;
      const distLeft = rect.left;
      const distRight = vw - (rect.left + rect.width);
      const distBottom = vh - (rect.top + rect.height);

      const minDist = Math.min(distTop, distLeft, distRight, distBottom);

      // snap to nearest edge
      if (minDist === distTop) {
        minIcon.style.top = "0px";
        minIcon.classList.add("ro-min-tab");
        minIcon.style.width = "120px";
        minIcon.style.height = "32px";
      } else if (minDist === distBottom) {
        minIcon.style.top = (vh - rect.height) + "px";
        minIcon.classList.add("ro-min-tab");
        minIcon.style.width = "120px";
        minIcon.style.height = "32px";
      } else if (minDist === distLeft) {
        minIcon.style.left = "0px";
        minIcon.classList.add("ro-min-tab");
        minIcon.style.width = "32px";
        minIcon.style.height = "120px";
      } else {
        minIcon.style.left = (vw - rect.width) + "px";
        minIcon.classList.add("ro-min-tab");
        minIcon.style.width = "32px";
        minIcon.style.height = "120px";
      }
    }

    // restore on click
    minIcon.addEventListener("click", ()=>{
      win.style.display = "flex";
      minIcon.remove();
      minIcon = null;
    });

    return minIcon;
  }

  // button actions
  btnMin.addEventListener("click", ()=>{
    win.style.display = "none";
    createMinIcon();
  });

  btnClose.addEventListener("click", ()=>{
    win.remove();
    if (minIcon) minIcon.remove();
    style.remove();
    window.__roStudioLoaded = false;
  });
}
