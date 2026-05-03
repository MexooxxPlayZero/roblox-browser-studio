{
  var setup = () => {
    if (window.__roStudioLoaded) {
      ['.ro-win', '#ro-core-style'].forEach(sel => document.querySelector(sel)?.remove());
    }
    window.__roStudioLoaded = true;

    var roStyle = document.createElement('style');
    roStyle.id = 'ro-core-style';
    roStyle.textContent = `
      .ro-win{position:fixed!important;width:1000px;height:700px;background:#1b1b1f!important;color:#fff!important;font-family:sans-serif;border-radius:12px;z-index:2147483647!important;display:flex;flex-direction:column;border:1px solid #444;left:20px;top:20px;box-shadow:0 20px 60px #000;overflow:hidden;transition:all 0.3s cubic-bezier(0.1, 0.9, 0.2, 1)}
      .ro-win.minimized{width:64px!important;height:64px!important;border-radius:18px!important;background:#000!important;border:2px solid #0084ff!important;cursor:pointer}
      .ro-win.minimized .ro-bar, .ro-win.minimized .ro-body{display:none!important}
      .ro-win.minimized::after{content:'';position:absolute;inset:15px;background:url('https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg') no-repeat center;background-size:contain;filter:invert(1)}

      .ro-bar{height:40px;background:#222;display:flex;align-items:center;padding:0 15px;cursor:move;border-bottom:1px solid #333}
      .ro-tabs{display:flex;background:#25252b;padding:0 10px;border-bottom:1px solid #333;z-index:5}
      .ro-tab{padding:12px 18px;font-size:12px;cursor:pointer;color:#888;border-bottom:2px solid transparent;transition:0.2s}
      .ro-tab.active{color:#fff;border-bottom:2px solid #0084ff;background:rgba(255,255,255,0.05)}
      
      .ro-body{flex:1;display:flex;background:#1b1b1f;position:relative;overflow:hidden}
      .side-panel{width:300px;padding:20px;border-right:1px solid #333;display:flex;flex-direction:column;gap:15px;background:#1b1b1f;z-index:10;transition:0.3s}
      .side-panel.collapsed{margin-left:-300px;opacity:0}
      
      #canvas-container{flex:1;background:#000;position:relative}
      #ro-menu-btn{position:absolute;top:15px;left:15px;width:38px;height:38px;background:rgba(0,0,0,0.6);border-radius:8px;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:100;border:1px solid rgba(255,255,255,0.2)}
      #ro-menu-btn img{width:22px;filter:invert(1)}
      
      /* Advanced Color Grid */
      .color-grid{display:grid;grid-template-columns:repeat(5, 1fr);gap:5px;margin-top:10px}
      .color-dot{width:100%;aspect-ratio:1;border-radius:3px;cursor:pointer;border:1px solid rgba(255,255,255,0.1)}
      .color-dot:hover{transform:scale(1.1);border-color:#fff}

      #esc-menu{position:absolute;inset:0;background:rgba(0,0,0,0.8);display:none;flex-direction:column;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(10px)}
      .btn-ui{background:#333;border:none;color:#fff;padding:10px;border-radius:6px;cursor:pointer;font-weight:bold}
      .btn-ui:hover{background:#444}
      .btn-play{background:#28a745;padding:15px;font-size:14px}
      .hidden{display:none!important}
    `;
    document.head.appendChild(roStyle);

    var roWin = document.createElement('div');
    roWin.className = 'ro-win';
    roWin.id = 'main-app';
    roWin.innerHTML = `
      <div class="ro-bar">
        <span style="font-size:11px;font-weight:800;color:#0084ff">ROBLOX STUDIO</span>
        <div style="margin-left:auto;display:flex;gap:8px">
          <button class="btn-ui" id="btn-mute" style="padding:2px 8px">🔊</button>
          <button class="btn-ui" id="btn-min" style="padding:2px 8px">−</button>
          <button class="btn-ui" style="padding:2px 8px;background:#ff4b4b" id="close-all">×</button>
        </div>
      </div>
      <div class="ro-tabs" id="editor-tabs">
        <div class="ro-tab active" data-t
