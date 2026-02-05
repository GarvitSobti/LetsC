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
  let userTremorPattern = null;
  let assistedElement = null;

  // Stats
  let stats = {
    assistCount: 0,
    clickCount: 0,
    confidenceLevel: 0,
    successfulClicks: 0,
    missedClicks: 0,
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

    // Load settings and learned patterns
    chrome.storage.local.get(
      ['enabled', 'sensitivity', 'visualFeedback', 'autoAdapt', 'userTremorPattern'],
      function (result) {
        console.log('⚙️ Settings loaded:', result);
        isEnabled = result.enabled !== false;
        sensitivity = result.sensitivity || 3;
        visualFeedback = result.visualFeedback !== false;
        autoAdapt = result.autoAdapt !== false;
        userTremorPattern = result.userTremorPattern || { severity: 'unknown', frequency: 0, amplitude: 0 };

        if (isEnabled) {
          console.log('✅ Assistance enabled, attaching listeners');
          console.log('📊 Learned tremor pattern:', userTremorPattern);
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
        stats = { assistCount: 0, clickCount: 0, confidenceLevel: 0, successfulClicks: 0, missedClicks: 0 };
        userTremorPattern = { severity: 'unknown', frequency: 0, amplitude: 0 };
        cursorHistory = [];
        chrome.storage.local.set({ userTremorPattern: userTremorPattern });
        clearAllAssistance();
        break;
    }
  }

  function handleMouseMove(e) {
    if (!isEnabled) return;

    try {
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
    } catch (error) {
      // Extension context may be invalidated after reload
      if (error.message.includes('context invalidated')) {
        console.warn('⚠️ Extension reloaded. Please refresh the page.');
      }
    }
  }

  function handleMouseOver(e) {
    if (!isEnabled) return;

    const element = e.target;
    console.log('🖱️ MOUSEOVER:', element.tagName, '| isInteractive:', isInteractiveElement(element), '| sensitivity:', sensitivity);

    // Check if element is interactive
    if (isInteractiveElement(element)) {
      // Only clear previous assistedElement if we're moving to a DIFFERENT element
      if (currentTarget && currentTarget !== element) {
        assistedElement = null; // Clear any previous assisted element
      }
      
      currentTarget = element;
      
      // Start hesitation timer
      clearTimeout(hesitationTimer);
      const hesitationTime = config.hesitationThreshold / sensitivity;
      console.log('⏱️ HESITATION TIMER SET for', hesitationTime + 'ms on', element.tagName);
      
      hesitationTimer = setTimeout(() => {
        detectHesitation(element);
      }, hesitationTime);
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
    
    console.log('🖱️ CLICK detected. assistedElement:', assistedElement ? assistedElement.tagName : 'null', 'clickCount:', stats.clickCount);
    
    // Find the actual interactive element that was clicked
    let clickedElement = e.target;
    while (clickedElement && !isInteractiveElement(clickedElement)) {
      clickedElement = clickedElement.parentElement;
    }

    // Only count stats if assistance was active
    if (assistedElement) {
      // Check if they clicked the exact assisted element
      if (clickedElement === assistedElement) {
        stats.successfulClicks++;
        stats.confidenceLevel = Math.min(100, stats.confidenceLevel + 5);
        console.log('✅ SUCCESS - Clicked assisted element. successfulClicks:', stats.successfulClicks);
      } else {
        // Clicked a different element
        stats.missedClicks++;
        stats.confidenceLevel = Math.max(0, stats.confidenceLevel - 3);
        console.log('❌ MISS - Clicked different element. missedClicks:', stats.missedClicks, {
          assisted: assistedElement.tagName,
          clicked: clickedElement ? clickedElement.tagName : 'none'
        });
      }

      // Clear assistance immediately
      if (assistedElement && assistedElement.hasAttribute('data-steady-assist')) {
        clearTimeout(hesitationTimer);
        setTimeout(() => {
          clearAssistanceForElement(assistedElement);
        }, 100);
      }
      assistedElement = null; // Clear for next interaction
    } else {
      console.log('ℹ️ Click without prior assistance');
    }

    updateStats();
  }

  function analyzeCursorBehavior() {
    if (cursorHistory.length < 3) return;

    const recent = cursorHistory.slice(-3);
    const speed = calculateSpeed(recent);
    const currentPos = recent[recent.length - 1];

    // Analyze tremor patterns from cursor history
    const tremorData = analyzeTremorPatternML(cursorHistory);
    
    // Update learned tremor pattern periodically
    if (stats.clickCount % 5 === 0 && tremorData.severity !== 'unknown') {
      userTremorPattern = tremorData;
      chrome.storage.local.set({ userTremorPattern: userTremorPattern });
    }

    // Detect slow/hesitant movement
    if (speed < config.speedThreshold) {
      const nearbyTargets = findNearbyInteractiveElements(currentPos);

      if (nearbyTargets.length > 0) {
        // ML-based prediction using cursor history
        const predictedTarget = predictIntendedTargetML(cursorHistory, nearbyTargets);

        if (predictedTarget) {
          applyAssistance(predictedTarget, 'predicted');
          assistedElement = predictedTarget;
          
          // Apply snap-to-target if cursor is within snap radius
          applySnapToTarget(predictedTarget, currentPos, tremorData);
        }
      }
    }
  }

  function detectHesitation(element) {
    if (!isEnabled || !element) return;

    console.log('😰 HESITATION DETECTED on', element.tagName, '| visualFeedback:', visualFeedback);
    isHesitating = true;
    applyAssistance(element, 'hesitation');
  }

  function applyAssistance(element, reason) {
    if (!visualFeedback) {
      console.log('❌ VISUAL FEEDBACK DISABLED - Not applying assistance');
      return;
    }
    if (!element) {
      console.log('❌ NO ELEMENT - Cannot apply assistance');
      return;
    }

    console.log('🎯 ASSISTANCE APPLIED - element:', element.tagName, 'reason:', reason);

    // Set this as the assisted element for click tracking
    assistedElement = element;

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
    // Smart button simplification: Hide nearby interactive elements to prevent mis-clicks
    const rect = element.getBoundingClientRect();
    const SIMPLIFICATION_RADIUS = 120; // Hide buttons within 120px radius
    
    console.log('🧹 Simplifying surroundings for:', element.tagName);
    
    // Find only actual interactive elements (a, button, input, select, textarea)
    const interactiveSelectors = 'a, button, input, select, textarea';
    const allInteractive = document.querySelectorAll(interactiveSelectors);
    let hiddenCount = 0;

    allInteractive.forEach(el => {
      // Skip the assisted element itself
      if (el === element) {
        return;
      }

      const elRect = el.getBoundingClientRect();
      const distance = calculateDistance(rect, elRect);

      // Hide nearby interactive elements (buttons, links, inputs)
      if (distance < SIMPLIFICATION_RADIUS && distance > 0) {
        el.style.opacity = '0.15'; // Make them barely visible
        el.style.pointerEvents = 'none'; // Prevent accidental clicks
        el.style.cursor = 'not-allowed'; // Show it's disabled
        el.setAttribute('data-steady-hidden', 'true');
        hiddenCount++;
        console.log('  Hidden nearby button:', el.tagName, 'distance:', distance.toFixed(0) + 'px');
      }
    });

    // Also fade non-interactive visual clutter nearby
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el === element || element.contains(el) || el.contains(element)) {
        return;
      }
      
      if (isInteractiveElement(el)) {
        return; // Skip interactive elements (already handled above)
      }

      const elRect = el.getBoundingClientRect();
      const distance = calculateDistance(rect, elRect);

      // Fade non-interactive elements that are very close
      if (distance < SIMPLIFICATION_RADIUS * 0.6 && distance > 0) {
        const fadeAmount = 0.3; // Fade to 30%
        el.style.opacity = fadeAmount.toString();
        el.setAttribute('data-steady-faded', 'true');
      }
    });

    if (hiddenCount > 0) {
      console.log('✅ Simplified ' + hiddenCount + ' nearby buttons');
    }
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

    // Restore hidden interactive elements
    document.querySelectorAll('[data-steady-hidden]').forEach(el => {
      el.style.opacity = '';
      el.style.pointerEvents = '';
      el.removeAttribute('data-steady-hidden');
    });

    // Clean up
    element.removeAttribute('data-steady-assist');
    element.classList.remove('steady-assist-active');
  }

  function clearAssistanceForElement(element) {
    if (!element) return; // Guard against null element
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

  // ML-based prediction using cursor trajectory
  function predictIntendedTargetML(cursorHistory, targets) {
    if (targets.length === 0) return null;
    if (targets.length === 1) return targets[0];

    if (cursorHistory.length < 3) {
      return targets[0];
    }

    // Calculate cursor velocity and direction
    const velocity = calculateVelocityML(cursorHistory);
    const direction = calculateDirectionML(cursorHistory);

    // Project cursor path forward
    const projectedPath = projectCursorPathML(cursorHistory, direction, 150);

    // Score each target
    const scored = targets.map(element => ({
      element: element,
      score: scoreTargetML(element, cursorHistory, velocity, direction),
    }));

    // Return highest scoring target
    scored.sort((a, b) => b.score - a.score);
    return scored[0].element;
  }

  function predictIntendedTarget(targets, cursorPath) {
    // Fallback to ML-based prediction
    return predictIntendedTargetML(cursorHistory, targets);
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
    console.log('📤 Sending STATS_UPDATE from content script:', stats);
    
    // Safely send message with error handling
    try {
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'STATS_UPDATE',
          stats: stats,
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Message send acknowledged with error:', chrome.runtime.lastError.message);
          }
        });
      }
    } catch (error) {
      console.log('Error sending message:', error.message);
    }
  }

  // ==================== ML HELPER FUNCTIONS ====================

  function calculateVelocityML(cursorHistory) {
    if (cursorHistory.length < 2) return 0;

    const recent = cursorHistory.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const distance = Math.sqrt(
      Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
    );

    const time = (last.timestamp - first.timestamp) / 1000;
    return time > 0 ? distance / time : 0;
  }

  function calculateDirectionML(cursorHistory) {
    if (cursorHistory.length < 2) return { angle: 0, dx: 0, dy: 0 };

    const recent = cursorHistory.slice(-3);
    const first = recent[0];
    const last = recent[recent.length - 1];

    const dx = last.x - first.x;
    const dy = last.y - first.y;
    const angle = Math.atan2(dy, dx);

    return { angle, dx, dy };
  }

  function projectCursorPathML(cursorHistory, direction, distance) {
    const last = cursorHistory[cursorHistory.length - 1];
    const points = [];

    for (let i = 0; i <= distance; i += 10) {
      points.push({
        x: last.x + Math.cos(direction.angle) * i,
        y: last.y + Math.sin(direction.angle) * i,
      });
    }

    return points;
  }

  function scoreTargetML(element, cursorHistory, velocity, direction) {
    let score = 0;
    const rect = element.getBoundingClientRect();
    const last = cursorHistory[cursorHistory.length - 1];

    // Distance score (closer is better) - weight: 40%
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const distance = Math.sqrt(
      Math.pow(last.x - center.x, 2) + Math.pow(last.y - center.y, 2)
    );
    score += Math.max(0, 100 - distance) * 0.4;

    // Size score (larger buttons easier to hit) - weight: 20%
    const area = rect.width * rect.height;
    score += Math.min(50, area / 100) * 0.2;

    // Alignment score (is cursor moving toward it?) - weight: 40%
    const targetAngle = Math.atan2(center.y - last.y, center.x - last.x);
    const angleDiff = Math.abs(targetAngle - direction.angle);
    score += Math.max(0, 50 - angleDiff * 10) * 0.4;

    return score;
  }

  function analyzeTremorPatternML(cursorHistory) {
    if (cursorHistory.length < 10) {
      return { severity: 'unknown', frequency: 0, amplitude: 0 };
    }

    const microMovements = detectMicroMovementsML(cursorHistory);
    const frequency = calculateTremorFrequencyML(microMovements);
    const amplitude = calculateTremorAmplitudeML(microMovements);

    let severity = 'none';
    if (amplitude > 5 && frequency > 3) severity = 'severe';
    else if (amplitude > 3 && frequency > 2) severity = 'moderate';
    else if (amplitude > 1 && frequency > 1) severity = 'mild';

    return { severity, frequency, amplitude, pattern: microMovements };
  }

  function detectMicroMovementsML(cursorHistory) {
    const movements = [];

    for (let i = 1; i < cursorHistory.length; i++) {
      const prev = cursorHistory[i - 1];
      const curr = cursorHistory[i];

      const distance = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );

      const timeDelta = curr.timestamp - prev.timestamp;

      if (distance > 0 && distance < 10 && timeDelta < 100) {
        movements.push({ distance, timeDelta, timestamp: curr.timestamp });
      }
    }

    return movements;
  }

  function calculateTremorFrequencyML(microMovements) {
    if (microMovements.length < 2) return 0;

    const recent = microMovements.filter(
      m => Date.now() - m.timestamp < 1000
    );

    return recent.length;
  }

  function calculateTremorAmplitudeML(microMovements) {
    if (microMovements.length === 0) return 0;

    const distances = microMovements.map(m => m.distance);
    const avg = distances.reduce((a, b) => a + b, 0) / distances.length;

    return avg;
  }

  function willClickMissML(cursorPos, targetElement, tremorData) {
    const rect = targetElement.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const distance = Math.sqrt(
      Math.pow(cursorPos.x - center.x, 2) +
        Math.pow(cursorPos.y - center.y, 2)
    );

    const threshold =
      tremorData.severity === 'severe'
        ? 30
        : tremorData.severity === 'moderate'
          ? 20
          : 10;

    return distance > threshold;
  }

  function applySnapToTarget(targetElement, cursorPos, tremorData) {
    if (!targetElement || !visualFeedback) return;

    const rect = targetElement.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(cursorPos.x - (rect.left + rect.width / 2), 2) +
        Math.pow(cursorPos.y - (rect.top + rect.height / 2), 2)
    );

    // Only snap if within 20px radius
    const snapRadius = 20;
    if (distance <= snapRadius) {
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      // Calculate snap offset (5-10px based on tremor severity)
      const snapStrength =
        tremorData.severity === 'severe'
          ? 0.5
          : tremorData.severity === 'moderate'
            ? 0.35
            : 0.2;

      const dx = center.x - cursorPos.x;
      const dy = center.y - cursorPos.y;

      const snapOffset = {
        x: dx * snapStrength,
        y: dy * snapStrength,
      };

      // Apply subtle visual nudge effect
      targetElement.style.transform = `translate(${snapOffset.x * 0.3}px, ${snapOffset.y * 0.3}px)`;
      targetElement.setAttribute('data-snap-active', 'true');
    }
  }

  console.log('Steady Assist: Ready with AI Cursor Prediction');
})();
