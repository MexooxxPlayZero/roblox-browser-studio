// CACHE KILLER v0.4 - 3D ENGINE
if (window.__roStudioLoaded) {
  document.querySelector('.ro-win')?.remove();
}
window.__roStudioLoaded = true;

// Inject Three.js for 3D Rendering
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
document.head.appendChild(script);

const style = document.createElement('style');
style.textContent = `
  .ro-win { position: fixed; width: 800px; height: 550px; background: #1b1b1f !important; color: #fff; font-family: sans-serif; border-radius: 8px; z-index: 999999; display: flex; flex-direction: column; border: 2px solid #333; left: 50px; top: 50px; box-shadow: 0 20px 50px #000; overflow: hidden; opacity: 1 !important; }
  .ro-bar { height: 35px; background: #222; display: flex; align-items: center; padding: 0 10px; cursor: move; border-bottom: 1px solid #333; }
  /* ... rest of the v0.4 code from my last message ... */
`;
// ... ensure the rest of the 3D logic is there ...
