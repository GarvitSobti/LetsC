// Content script - runs on every webpage
// This is where the magic happens: cursor tracking, hesitation detection, UI adaptation

console.log('🔵 CONTENT SCRIPT FILE LOADED - TOP OF FILE');

(function () {
  'use strict';

  console.log('🟢 INSIDE IIFE - SCRIPT STARTING');

  // State
  let isEnabled = true;
  let sensitivity = 3;
  let visualFeedback = true;
  let autoAdapt = true;

  // Cursor tracking
  let cursorHistory = [];
  let currentTarget = null;
  let hesitationTimer = null;
  let isHesitating = false;

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

    // Load settings
    chrome.storage.local.get(
      ['enabled', 'sensitivity', 'visualFeedback', 'autoAdapt'],
      function (result) {
        console.log('⚙️ Settings loaded:', result);
        isEnabled = result.enabled !== false;
        sensitivity = result.sensitivity || 3;
        visualFeedback = result.visualFeedback !== false;
        autoAdapt = result.autoAdapt !== false;

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

      case 'RESET_LEARNING':
        stats = { assistCount: 0, clickCount: 0, confidenceLevel: 0 };
        cursorHistory = [];
        clearAllAssistance();
        break;
    }
  }

  function handleMouseMove(e) {
    if (!isEnabled) return;

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

    const element = e.target;

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

    const element = e.target;

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

    // Mark element as assisted
    element.setAttribute('data-steady-assist', reason);

    // Apply visual and functional assistance
    element.classList.add('steady-assist-active');

    // Expand clickable area
    expandClickArea(element);

    // Simplify surrounding area
    simplifySurroundings(element);

    // Add visual highlight
    if (visualFeedback) {
      addVisualHighlight(element);
    }

    stats.assistCount++;
    updateStats();

    // Auto-restore after timeout if no interaction
    setTimeout(() => {
      if (element.hasAttribute('data-steady-assist')) {
        graduallyRestoreUI(element);
      }
    }, 3000); // Reduced from 5s to 3s
  }

  function expandClickArea(element) {
    // Increase padding to make element easier to click
    const currentPadding =
      parseInt(window.getComputedStyle(element).padding) || 0;
    const additionalPadding = 8 * (sensitivity / 3); // Scale with sensitivity

    element.style.padding = `${currentPadding + additionalPadding}px`;
    element.setAttribute('data-original-padding', currentPadding);
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
    element.style.transition = 'all 0.5s ease';

    // Restore padding
    const originalPadding = element.getAttribute('data-original-padding');
    if (originalPadding) {
      element.style.padding = `${originalPadding}px`;
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
    element.classList.remove('steady-assist-active');
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

  function isInteractiveElement(element) {
    const tagName = element.tagName.toLowerCase();
    const interactive = ['a', 'button', 'input', 'select', 'textarea'];

    return (
      interactive.includes(tagName) ||
      element.onclick !== null ||
      element.getAttribute('role') === 'button' ||
      window.getComputedStyle(element).cursor === 'pointer'
    );
  }

  function findNearbyInteractiveElements(position) {
    const elements = document.elementsFromPoint(position.x, position.y);
    const nearby = [];

    elements.forEach(el => {
      if (isInteractiveElement(el)) {
        nearby.push(el);
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

  function updateStats() {
    // Send stats to popup
    chrome.storage.local.set({ stats: stats });
    chrome.runtime.sendMessage({
      type: 'STATS_UPDATE',
      stats: stats,
    });
  }

  console.log('Steady Assist: Ready');
})();
