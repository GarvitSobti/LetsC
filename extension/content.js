// Content script - runs on every webpage
// This is where the magic happens: cursor tracking, hesitation detection, UI adaptation

console.log('🔵 CONTENT SCRIPT FILE LOADED - TOP OF FILE');
const STEADY_ASSIST_BUILD = 'v30';
console.log(`-----working------${STEADY_ASSIST_BUILD}`);

(function () {
  'use strict';

  console.log('🟢 INSIDE IIFE - SCRIPT STARTING');

  // State
  let isEnabled = true;
  let sensitivity = 3;
  let visualFeedback = true;
  let autoAdapt = true;
  let motorImpaired = false;
  let visualImpaired = false;
  let visualImpairedScale = 2;

  // Cursor tracking
  let cursorHistory = [];
  let currentTarget = null;
  let hesitationTimer = null;
  let isHesitating = false;
  let inactivityTimer = null;
  const inactivityRestoreDelay = 800;
  let lastMousePos = { x: 0, y: 0 };
  let activeAssistedElement = null;
  const magneticRadiusPx = 40;
  const magneticSampleStep = 12;
  const originalMetrics = new WeakMap();

  // Stats
  let stats = {
    assistCount: 0,
    clickCount: 0,
    confidenceLevel: 0,
  };

  // Configuration
  const config = {
    hesitationThreshold: 1500, // ms of hovering before considering hesitation
    speedThreshold: 100, // pixels/second, below this is "slow"
    historyLength: 10, // number of cursor positions to track
    assistanceRadius: 100, // pixels around cursor to look for targets
    confidenceDecayRate: 0.95, // how fast confidence decreases without interaction
  };

  // Initialize
  console.log('🚀 Steady Assist: Script loaded!');
  init();

  function init() {
    console.log('🔧 Steady Assist: Initializing...');
    console.log(`🧪 Steady Assist build tag (init): ${STEADY_ASSIST_BUILD}`);
    injectAssistStyles();

    // Load settings
    chrome.storage.local.get(
      [
        'enabled',
        'sensitivity',
        'visualFeedback',
        'autoAdapt',
        'motorImpaired',
        'visualImpaired',
        'visualImpairedScale',
      ],
      function (result) {
        console.log('⚙️ Settings loaded:', result);
        isEnabled = result.enabled !== false;
        sensitivity = result.sensitivity || 3;
        visualFeedback = result.visualFeedback !== false;
        autoAdapt = result.autoAdapt !== false;
        motorImpaired = result.motorImpaired === true;
        visualImpaired = result.visualImpaired === true;
        visualImpairedScale = result.visualImpairedScale || 2;

        if (isEnabled) {
          console.log('✅ Assistance enabled, attaching listeners');
          attachListeners();
        } else {
          console.log('❌ Assistance disabled');
        }
      }
    );

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(handleMessage);

    // Clean up on unload to avoid using invalidated extension context
    window.addEventListener('beforeunload', () => {
      clearTimeout(hesitationTimer);
      clearTimeout(inactivityTimer);
      clearAllAssistance();
    });
  }

  function attachListeners() {
    console.log('👂 Attaching event listeners');
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    console.log('✅ Steady Assist: Ready and listening!');
  }

  function detachListeners() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    clearAllAssistance();
  }

  function handleMessage(request, sender, sendResponse) {
    switch (request.type) {
      case 'TOGGLE_ASSISTANCE':
        isEnabled = request.enabled;
        if (isEnabled) {
          attachListeners();
        } else {
          detachListeners();
        }
        break;

      case 'UPDATE_SENSITIVITY':
        sensitivity = request.sensitivity;
        break;

      case 'UPDATE_VISUAL_FEEDBACK':
        visualFeedback = request.enabled;
        if (!visualFeedback) {
          clearAllAssistance();
        }
        break;

      case 'UPDATE_MOTOR_IMPAIRED':
        motorImpaired = request.enabled;
        if (!motorImpaired) {
          clearTimeout(hesitationTimer);
          clearTimeout(inactivityTimer);
          isHesitating = false;
          currentTarget = null;
          clearAllAssistance();
        }
        break;

      case 'UPDATE_VISUAL_IMPAIRED':
        visualImpaired = request.enabled;
        if (!visualImpaired) {
          clearTimeout(hesitationTimer);
          clearTimeout(inactivityTimer);
          isHesitating = false;
          currentTarget = null;
          clearAllAssistance();
        }
        break;

      case 'UPDATE_VISUAL_IMPAIRED_SCALE':
        visualImpairedScale = Math.min(2, request.value || 2);
        clearAllAssistance();
        break;

      case 'RESET_LEARNING':
        stats = { assistCount: 0, clickCount: 0, confidenceLevel: 0 };
        cursorHistory = [];
        clearAllAssistance();
        break;
    }
  }

  function handleMouseMove(e) {
    if (!isEnabled) return;
    if (!motorImpaired && !visualImpaired) return;

    lastMousePos = { x: e.clientX, y: e.clientY };

    const hoveredNow = document.elementFromPoint(
      lastMousePos.x,
      lastMousePos.y
    );
    let hoveredButton = getButtonLikeElement(hoveredNow);

    if (motorImpaired) {
      if (!hoveredButton) {
        hoveredButton = findButtonNearCursor(
          lastMousePos.x,
          lastMousePos.y,
          magneticRadiusPx,
          magneticSampleStep
        );
      }

      // Magnetic assist: only for motor-impaired mode
      if (!hoveredButton) {
        const magneticButton = findClosestButtonWithinRadius(
          lastMousePos.x,
          lastMousePos.y,
          magneticRadiusPx
        );
        if (magneticButton) {
          hoveredButton = magneticButton;
        }
      }
    }

    if (!hoveredButton && activeAssistedElement) {
      const dist = distanceToRect(
        activeAssistedElement.getBoundingClientRect(),
        lastMousePos.x,
        lastMousePos.y
      );
      if (dist <= magneticRadiusPx) {
        hoveredButton = activeAssistedElement;
      }
    }

    if (hoveredButton) {
      // Immediate assist on hover for shaky hands
      applyAssistance(hoveredButton, 'hover');
      activeAssistedElement = hoveredButton;
    }

    document.querySelectorAll('[data-steady-assist]').forEach(el => {
      if (el !== hoveredButton && el !== activeAssistedElement) {
        graduallyRestoreUI(el);
      }
    });
    if (hoveredButton && hoveredButton.hasAttribute('data-steady-assist')) {
      activeAssistedElement = hoveredButton;
    }

    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    inactivityTimer = setTimeout(() => {
      const hovered = document.elementFromPoint(
        lastMousePos.x,
        lastMousePos.y
      );
      document.querySelectorAll('[data-steady-assist]').forEach(el => {
        if (el !== hovered) {
          graduallyRestoreUI(el);
        }
      });
    }, inactivityRestoreDelay);

    // Track cursor position
    const position = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    };

    cursorHistory.push(position);

    // Keep history limited
    if (cursorHistory.length > config.historyLength) {
      cursorHistory.shift();
    }

    // Analyze cursor behavior
    analyzeCursorBehavior();
  }

  function handleMouseOver(e) {
    if (!isEnabled) return;
    if (!motorImpaired && !visualImpaired) return;

    const element = getButtonLikeElement(e.target);
    if (!element) return;

    // Check if element is interactive
    if (isInteractiveElement(element)) {
      currentTarget = element;

      // Start hesitation timer
      clearTimeout(hesitationTimer);
      hesitationTimer = setTimeout(() => {
        detectHesitation(element);
      }, config.hesitationThreshold / sensitivity);
    }
  }

  function handleMouseOut(e) {
    if (!isEnabled) return;
    if (!motorImpaired && !visualImpaired) return;

    const element = getButtonLikeElement(e.target);
    if (!element) return;

    // Clear hesitation timer when mouse leaves
    if (element === currentTarget) {
      clearTimeout(hesitationTimer);
      currentTarget = null;
      isHesitating = false;

      // Restore element if it was assisted
      if (element.hasAttribute('data-steady-assist')) {
        setTimeout(() => {
          graduallyRestoreUI(element);
        }, 500); // Small delay to check if click happened
      }
    }
  }

  function handleClick(e) {
    if (!isEnabled) return;

    stats.clickCount++;

    // Increase confidence when successful click
    stats.confidenceLevel = Math.min(100, stats.confidenceLevel + 5);

    // Clear assistance immediately after successful click
    const element = e.target;
    if (element.hasAttribute('data-steady-assist')) {
      clearTimeout(hesitationTimer);
      setTimeout(() => {
        clearAssistanceForElement(element);
      }, 200); // Quick restore after click
    }

    updateStats();
  }

  function analyzeCursorBehavior() {
    if (!motorImpaired && !visualImpaired) return;
    if (cursorHistory.length < 3) return;

    const recent = cursorHistory.slice(-3);
    const speed = calculateSpeed(recent);

    // Detect slow/hesitant movement
    if (speed < config.speedThreshold) {
      const nearbyTargets = findNearbyInteractiveElements(
        recent[recent.length - 1]
      );

      if (nearbyTargets.length > 0) {
        // Predict which target they're aiming for
        const predictedTarget = predictIntendedTarget(nearbyTargets, recent);

        if (predictedTarget) {
          applyAssistance(predictedTarget, 'predicted');
        }
      }
    }
  }

  function detectHesitation(element) {
    if (!isEnabled || !element) return;

    isHesitating = true;
    applyAssistance(element, 'hesitation');
  }

  function applyAssistance(element, reason) {
    if (!visualFeedback) return;
    if (!motorImpaired && !visualImpaired) return;

    // Mark element as assisted
    element.setAttribute('data-steady-assist', reason);
    activeAssistedElement = element;

    // Apply visual and functional assistance
    element.classList.add('steady-assist-active');
    const activeMode = motorImpaired ? 'motor' : visualImpaired ? 'visual' : null;
    if (activeMode === 'motor') {
      element.classList.add('steady-assist-motor');
      element.classList.add('steady-assist-lock');
    } else if (activeMode === 'visual') {
      element.classList.add('steady-assist-visual');
      element.classList.add('steady-assist-lock');
    }

    // Lock font size so label doesn't change independently
    const metrics = getOriginalMetrics(element);
    if (metrics && metrics.fontSize) {
      if (activeMode === 'visual') {
        const baseSize = parseFloat(metrics.fontSize) || 0;
        if (baseSize > 0) {
          element.style.fontSize = `${baseSize * visualImpairedScale}px`;
        }
      } else {
        element.style.fontSize = metrics.fontSize;
      }
    }
    // Do not override transforms to avoid breaking site-specific styles

    // Expand clickable area
    expandClickArea(element, activeMode);

    // Simplify surrounding area (disabled per request)

    // Add visual highlight
    if (visualFeedback) {
      addVisualHighlight(element);
    }

    // Ensure we restore when the cursor leaves this element
    attachExitListeners(element);

    stats.assistCount++;
    updateStats();

    // Auto-restore after timeout if no interaction
    setTimeout(() => {
      const hoveredElement = document.elementFromPoint(
        lastMousePos.x,
        lastMousePos.y
      );
      const hoveredButton = getButtonLikeElement(hoveredElement);
      const hovered =
        element.matches(':hover') ||
        hoveredButton === element ||
        (hoveredButton && hoveredButton.contains(hoveredElement));
      if (element.hasAttribute('data-steady-assist') && !hovered) {
        graduallyRestoreUI(element);
      }
    }, 1500); // Faster restore when idle
  }

  function expandClickArea(element, activeMode) {
    // Increase padding for layout shift (no transform to avoid mirroring)
    const metrics = getOriginalMetrics(element);
    const sizeScale =
      activeMode === 'motor'
        ? 1.5
        : activeMode === 'visual'
          ? Math.min(2, visualImpairedScale)
          : 2;
    const maxAdd =
      (Math.min(metrics.width, metrics.height) * (sizeScale - 1)) / 2;
    const additionalPadding = maxAdd;

    element.style.paddingTop = `${metrics.top + additionalPadding}px`;
    element.style.paddingRight = `${metrics.right + additionalPadding}px`;
    element.style.paddingBottom = `${metrics.bottom + additionalPadding}px`;
    element.style.paddingLeft = `${metrics.left + additionalPadding}px`;

    if (activeMode === 'visual') {
      element.style.minHeight = `${metrics.height * sizeScale}px`;
      element.style.minWidth = `${metrics.width * sizeScale}px`;
    }

    element.style.removeProperty('transform');
    element.style.removeProperty('transform-origin');
  }

  function attachExitListeners(element) {
    if (element.hasAttribute('data-steady-exit-listener')) return;

    const onLeave = () => {
      if (element.hasAttribute('data-steady-assist')) {
        graduallyRestoreUI(element);
      }
    };

    element.addEventListener('mouseleave', onLeave, { passive: true });
    element.addEventListener('pointerleave', onLeave, { passive: true });
    element.setAttribute('data-steady-exit-listener', 'true');
  }

  function simplifySurroundings(element) {
    // Fade out nearby non-essential elements
    const rect = element.getBoundingClientRect();
    const allElements = document.querySelectorAll('*');

    allElements.forEach(el => {
      if (el === element || element.contains(el) || el.contains(element))
        return;

      const elRect = el.getBoundingClientRect();
      const distance = calculateDistance(rect, elRect);

      // Fade elements based on distance
      if (distance < 200 && !isInteractiveElement(el)) {
        const fadeAmount = 1 - (distance / 200) * 0.5; // Fade up to 50%
        el.style.opacity = fadeAmount.toString();
        el.setAttribute('data-steady-faded', 'true');
      }
    });
  }

  function addVisualHighlight(element) {
    // Add subtle glow/halo effect
    element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.3)';
    element.style.transition = 'all 0.3s ease';
  }

  function graduallyRestoreUI(element) {
    // Gradually restore original UI
    element.style.transition = 'all 0.8s ease';

    // Restore padding
    const metrics = originalMetrics.get(element);
    if (metrics) {
      element.style.padding = metrics.padding;
      element.style.fontSize = metrics.fontSize;
      element.style.minHeight = '';
      element.style.minWidth = '';
    } else {
      element.style.padding = '';
      element.style.fontSize = '';
      element.style.minHeight = '';
      element.style.minWidth = '';
    }

    // Remove highlight
    element.style.boxShadow = '';

    // Restore faded elements
    document.querySelectorAll('[data-steady-faded]').forEach(el => {
      el.style.opacity = '';
      el.removeAttribute('data-steady-faded');
    });

    // Clean up
    element.removeAttribute('data-steady-assist');
    element.removeAttribute('data-steady-exit-listener');
    element.classList.remove('steady-assist-active');
    element.classList.remove('steady-assist-lock');
    element.classList.remove('steady-assist-motor');
    element.classList.remove('steady-assist-visual');
    if (activeAssistedElement === element) {
      activeAssistedElement = null;
    }
  }

  function clearAssistanceForElement(element) {
    if (element.hasAttribute('data-steady-assist')) {
      graduallyRestoreUI(element);
    }
  }

  function clearAllAssistance() {
    document.querySelectorAll('[data-steady-assist]').forEach(element => {
      graduallyRestoreUI(element);
    });
  }

  // Helper functions
  function getOriginalMetrics(element) {
    let metrics = originalMetrics.get(element);
    if (!metrics) {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      metrics = {
        padding: styles.padding,
        fontSize: styles.fontSize,
        top: parseFloat(styles.paddingTop) || 0,
        right: parseFloat(styles.paddingRight) || 0,
        bottom: parseFloat(styles.paddingBottom) || 0,
        left: parseFloat(styles.paddingLeft) || 0,
        width: rect.width,
        height: rect.height,
      };
      originalMetrics.set(element, metrics);
    }
    return metrics;
  }

  function injectAssistStyles() {
    if (document.getElementById('steady-assist-style')) return;
    const style = document.createElement('style');
    style.id = 'steady-assist-style';
    style.textContent = `
      .steady-assist-active * {
        font-size: inherit !important;
        line-height: inherit !important;
      }
      .steady-assist-lock {
        pointer-events: auto !important;
      }
      .steady-assist-lock * {
        pointer-events: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
  }


  function isInteractiveElement(element) {
    return isButtonElement(element);
  }

  function isButtonElement(element) {
    if (!element || !element.tagName) return false;
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'button') return true;

    if (tagName === 'input') {
      const type = (element.getAttribute('type') || '').toLowerCase();
      return type === 'button' || type === 'submit' || type === 'reset';
    }

    const role = (element.getAttribute('role') || '').toLowerCase();
    if (role === 'button') return true;

    if (window.getComputedStyle(element).cursor === 'pointer') {
      const nonButtons = ['input', 'textarea', 'select'];
      if (!nonButtons.includes(tagName)) return true;
    }

    return false;
  }

  function getButtonLikeElement(element) {
    if (!element) return null;
    if (isButtonElement(element)) return element;

    const candidate = element.closest(
      'button, input, [role="button"], a, div, span'
    );
    if (!candidate) return null;

    if (isButtonElement(candidate)) return candidate;

    const tagName = candidate.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select')
      return null;

    if ((candidate.getAttribute('role') || '').toLowerCase() === 'button')
      return candidate;
    if (window.getComputedStyle(candidate).cursor === 'pointer')
      return candidate;

    return null;
  }

  function findNearbyInteractiveElements(position) {
    const elements = document.elementsFromPoint(position.x, position.y);
    const nearby = [];
    const seen = new Set();

    elements.forEach(el => {
      const buttonEl = getButtonLikeElement(el);
      if (buttonEl && isInteractiveElement(buttonEl) && !seen.has(buttonEl)) {
        seen.add(buttonEl);
        nearby.push(buttonEl);
      }
    });

    return nearby;
  }

  function predictIntendedTarget(targets, cursorPath) {
    // Simple prediction: closest to cursor trajectory
    if (targets.length === 0) return null;
    if (targets.length === 1) return targets[0];

    // TODO: Implement ML-based prediction here
    // For now, return the largest interactive element (easier to click)
    return targets.reduce((largest, current) => {
      const currentArea = current.offsetWidth * current.offsetHeight;
      const largestArea = largest.offsetWidth * largest.offsetHeight;
      return currentArea > largestArea ? current : largest;
    });
  }

  function calculateSpeed(positions) {
    if (positions.length < 2) return 0;

    const first = positions[0];
    const last = positions[positions.length - 1];

    const distance = Math.sqrt(
      Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
    );

    const time = (last.timestamp - first.timestamp) / 1000; // seconds

    return time > 0 ? distance / time : 0;
  }

  function calculateDistance(rect1, rect2) {
    const centerX1 = rect1.left + rect1.width / 2;
    const centerY1 = rect1.top + rect1.height / 2;
    const centerX2 = rect2.left + rect2.width / 2;
    const centerY2 = rect2.top + rect2.height / 2;

    return Math.sqrt(
      Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2)
    );
  }

  function distanceToRect(rect, x, y) {
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function findButtonNearCursor(x, y, radius, step) {
    for (let r = step; r <= radius; r += step) {
      for (let dx = -r; dx <= r; dx += step) {
        for (let dy = -r; dy <= r; dy += step) {
          const el = document.elementFromPoint(x + dx, y + dy);
          const button = getButtonLikeElement(el);
          if (button) return button;
        }
      }
    }
    return null;
  }

  function findClosestButtonWithinRadius(x, y, radius) {
    const candidates = document.querySelectorAll(
      'button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]'
    );
    let closest = null;
    let bestDist = radius + 1;

    candidates.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dist = distanceToRect(rect, x, y);
      if (dist <= radius && dist < bestDist) {
        bestDist = dist;
        closest = el;
      }
    });

    return closest;
  }

  function updateStats() {
    // Send stats to popup (guard against extension context invalidated)
    if (!chrome?.runtime?.id) return;
    try {
      chrome.storage?.local?.set({ stats: stats });
      chrome.runtime.sendMessage({
        type: 'STATS_UPDATE',
        stats: stats,
      });
    } catch (err) {
      // Extension may be reloaded or navigated; ignore
    }
  }

  console.log('Steady Assist: Ready');
})();
