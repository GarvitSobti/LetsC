// Demo Mode: Simulate tremor and auto-run scenarios for presentation
(function () {
  'use strict';

  console.log('Demo Mode: loaded');

  // Expose a global flag for quick detection in page console
  try {
    window.__STEADY_DEMO_LOADED__ = true;
  } catch (e) {
    // ignore
  }

  // Create a small visible badge to make the demo active state obvious
  function ensureBadge() {
    if (document.getElementById('steady-demo-badge')) return;
    const b = document.createElement('div');
    b.id = 'steady-demo-badge';
    b.textContent = 'Demo';
    b.style.position = 'fixed';
    b.style.right = '8px';
    b.style.bottom = '8px';
    b.style.zIndex = 2147483646;
    b.style.background = 'rgba(59,130,246,0.95)';
    b.style.color = 'white';
    b.style.padding = '6px 8px';
    b.style.borderRadius = '6px';
    b.style.fontFamily = 'Arial, sans-serif';
    b.style.fontSize = '12px';
    b.style.pointerEvents = 'none';
    document.body.appendChild(b);
  }

  function removeBadge() {
    const b = document.getElementById('steady-demo-badge');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }

  // Send an alive ping to background so popup or background can detect content script
  try {
    chrome.runtime.sendMessage({ type: 'DEMO_ALIVE' });
  } catch (e) {
    // ignore in pages where chrome.runtime isn't available
  }

  // Show badge immediately so it's easy to detect the script
  try {
    ensureBadge();
  } catch (e) {
    // ignore
  }

  let enabled = false;
  let simulate = true;
  let severity = 2; // 1=mild,2=moderate,3=severe
  let autorun = false;
  let autorunHandle = null;
  let playbackSpeed = 4; // 1..5 where 4 === 1x (default)

  // Overlay cursor element
  let overlay = null;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'steady-demo-cursor';
    overlay.style.position = 'fixed';
    overlay.style.zIndex = 2147483647; // top
    overlay.style.width = '14px';
    overlay.style.height = '14px';
    overlay.style.borderRadius = '50%';
    overlay.style.background = 'rgba(59,130,246,0.9)';
    overlay.style.boxShadow = '0 0 8px rgba(59,130,246,0.6)';
    overlay.style.pointerEvents = 'none';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.transition = 'transform 0.02s linear';
    document.body.appendChild(overlay);
    return overlay;
  }

  function removeOverlay() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  function randomTremorOffset(sev) {
    // severity 1..3 => amplitude 2..12 px, frequency approx via step randomness
    const ampMap = { 1: 2, 2: 6, 3: 12 };
    const amp = ampMap[sev] || 6;
    return (Math.random() - 0.5) * 2 * amp;
  }

  function simulateTremorPath(x, y, sev) {
    // return a small jittered path around (x,y)
    const points = [];
    const steps = 12; // number of micro-steps
    for (let i = 0; i < steps; i++) {
      points.push({
        x: x + randomTremorOffset(sev),
        y: y + randomTremorOffset(sev),
        t: 20 + Math.random() * 30,
      });
    }
    return points;
  }

  function moveOverlayTo(x, y) {
    ensureOverlay();
    overlay.style.left = x + 'px';
    overlay.style.top = y + 'px';
  }

  function dispatchMouseEvent(type, target, clientX, clientY) {
    const evt = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: clientX,
      clientY: clientY,
    });
    target.dispatchEvent(evt);
  }

  function findDemoTargets() {
    // Simple heuristic: find visible buttons/links near center
    const rect = document.body.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const candidates = Array.from(document.querySelectorAll('button,a,input[type=submit],[role=button]'))
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 10 && r.height > 10 && r.top >= 0 && r.left >= 0 && r.bottom <= (window.innerHeight || document.documentElement.clientHeight) && r.right <= (window.innerWidth || document.documentElement.clientWidth);
      });

    candidates.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const da = Math.hypot(ra.left + ra.width / 2 - cx, ra.top + ra.height / 2 - cy);
      const db = Math.hypot(rb.left + rb.width / 2 - cx, rb.top + rb.height / 2 - cy);
      return da - db;
    });

    return candidates.slice(0, 6); // top 6 targets
  }

  async function playScenarioOnce() {
    const targets = findDemoTargets();
    if (targets.length === 0) return;

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const r = t.getBoundingClientRect();
      const centerX = Math.round(r.left + r.width / 2);
      const centerY = Math.round(r.top + r.height / 2);

      // start slightly away
      const startX = centerX - 60;
      const startY = centerY - 60;
      let curX = startX;
      let curY = startY;

      // move toward target with simulated tremor
      const path = simulateTremorPath(centerX, centerY, severity);
      const speedMultiplier = playbackSpeed / 4; // 4 => 1x
      for (let p of path) {
        curX = curX + (p.x - curX) * 0.35;
        curY = curY + (p.y - curY) * 0.35;
        moveOverlayTo(curX, curY);
        // dispatch synthetic mousemove to underlying element
        const el = document.elementFromPoint(curX, curY) || document.body;
        dispatchMouseEvent('mousemove', el, Math.round(curX), Math.round(curY));
        await new Promise(r => setTimeout(r, Math.round(p.t / speedMultiplier)));
      }

      // final click
      moveOverlayTo(centerX, centerY);
      const elAtCenter = document.elementFromPoint(centerX, centerY) || t;
      dispatchMouseEvent('mousemove', elAtCenter, centerX, centerY);
  await new Promise(r => setTimeout(r, Math.round(80 / (playbackSpeed / 4))));
      dispatchMouseEvent('mousedown', elAtCenter, centerX, centerY);
      await new Promise(r => setTimeout(r, 40));
      dispatchMouseEvent('mouseup', elAtCenter, centerX, centerY);
      dispatchMouseEvent('click', elAtCenter, centerX, centerY);

      // small gap between actions
      await new Promise(r => setTimeout(r, Math.round(350 / (playbackSpeed / 4))));
    }
  }

  function startAutorun() {
    if (autorun) return;
    autorun = true;
    const intervalBase = 4000; // base interval between scenario runs
    autorunHandle = setInterval(() => {
      playScenarioOnce().catch(e => console.error(e));
    }, Math.round(intervalBase / (playbackSpeed / 4)));
  }

  function stopAutorun() {
    autorun = false;
    if (autorunHandle) clearInterval(autorunHandle);
    autorunHandle = null;
  }

  // Handle messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
      case 'DEMO_TOGGLE':
        enabled = !!request.enabled;
        if (!enabled) {
          stopAutorun();
          removeOverlay();
          removeBadge();
        }
        else {
          ensureBadge();
        }
        break;
      case 'DEMO_OPTIONS':
        if (typeof request.simulate !== 'undefined') simulate = !!request.simulate;
        if (typeof request.severity !== 'undefined') severity = request.severity;
        if (typeof request.playbackSpeed !== 'undefined') {
          playbackSpeed = request.playbackSpeed;
          // if autorun is active, restart it to respect new speed
          if (autorun) {
            stopAutorun();
            startAutorun();
          }
        }
        break;
      case 'DEMO_RUN':
        if (request.mode === 'autorun') {
          startAutorun();
        } else if (request.mode === 'pause') {
          stopAutorun();
        } else if (request.mode === 'once') {
          // run single pass
          playScenarioOnce();
        }
        break;
    }
  });

  // Clean up overlay when navigating away
  window.addEventListener('beforeunload', () => {
    stopAutorun();
    removeOverlay();
  });

})();
