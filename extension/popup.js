// Popup UI logic
document.addEventListener('DOMContentLoaded', function () {
  const mainToggle = document.getElementById('mainToggle');
  const statusText = document.getElementById('statusText');
  const statusDot = document.querySelector('.status-dot');
  const sensitivitySlider = document.getElementById('sensitivity');
  const sensitivityValue = document.getElementById('sensitivityValue');
  const visualFeedback = document.getElementById('visualFeedback');
  const autoAdapt = document.getElementById('autoAdapt');
  const resetBtn = document.getElementById('resetBtn');
  const statsCard = document.getElementById('statsCard');

  // Load saved settings
  chrome.storage.local.get(
    ['enabled', 'sensitivity', 'visualFeedback', 'autoAdapt', 'stats'],
    function (result) {
      mainToggle.checked = result.enabled !== false; // default true
      sensitivitySlider.value = result.sensitivity || 3;
      visualFeedback.checked = result.visualFeedback !== false;
      autoAdapt.checked = result.autoAdapt !== false;

      updateSensitivityLabel(result.sensitivity || 3);
      updateStatus(mainToggle.checked);

      // Show stats if available
      if (result.stats && result.stats.assistCount > 0) {
        statsCard.style.display = 'block';
        updateStats(result.stats);
      }
    }
  );

  // Main toggle change
  mainToggle.addEventListener('change', function () {
    const enabled = mainToggle.checked;

    chrome.storage.local.set({ enabled: enabled });
    updateStatus(enabled);

    // Send message to content script
    sendMessageToActiveTab({
      type: 'TOGGLE_ASSISTANCE',
      enabled: enabled,
    });
  });

  // Sensitivity change
  sensitivitySlider.addEventListener('input', function () {
    const value = parseInt(sensitivitySlider.value);
    updateSensitivityLabel(value);

    chrome.storage.local.set({ sensitivity: value });

    // Send to content script
    sendMessageToActiveTab({
      type: 'UPDATE_SENSITIVITY',
      sensitivity: value,
    });
  });

  // Visual feedback toggle
  visualFeedback.addEventListener('change', function () {
    chrome.storage.local.set({ visualFeedback: visualFeedback.checked });

    sendMessageToActiveTab({
      type: 'UPDATE_VISUAL_FEEDBACK',
      enabled: visualFeedback.checked,
    });
  });

  // Auto-adapt toggle
  autoAdapt.addEventListener('change', function () {
    chrome.storage.local.set({ autoAdapt: autoAdapt.checked });
  });

  // Reset button
  resetBtn.addEventListener('click', function () {
    if (confirm('Reset all learned patterns? This cannot be undone.')) {
      chrome.storage.local.set({
        userPatterns: {},
        stats: { assistCount: 0, clickCount: 0, confidenceLevel: 0 },
      });

      statsCard.style.display = 'none';

      sendMessageToActiveTab({
        type: 'RESET_LEARNING',
      });
    }
  });

  // Demo mode controls
  const demoToggle = document.getElementById('demoToggle');
  const simulateTremor = document.getElementById('simulateTremor');
  const tremorSeverity = document.getElementById('tremorSeverity');
  const tremorSeverityValue = document.getElementById('tremorSeverityValue');
  const demoRunBtn = document.getElementById('demoRunBtn');
  const demoPauseBtn = document.getElementById('demoPauseBtn');
  const demoOnceBtn = document.getElementById('demoOnceBtn');
  const demoSpeed = document.getElementById('demoSpeed');
  const demoSpeedValue = document.getElementById('demoSpeedValue');

  function updateTremorLabel(v) {
    const labels = ['Mild', 'Moderate', 'Severe'];
    tremorSeverityValue.textContent = labels[v - 1];
  }

  // Initialize demo controls from storage (non-blocking)
  chrome.storage.local.get(['demoMode', 'demoSeverity'], function (res) {
    demoToggle.checked = !!res.demoMode;
    tremorSeverity.value = res.demoSeverity || 2;
    updateTremorLabel(parseInt(tremorSeverity.value));
  demoSpeed.value = res.demoSpeed || 4;
  demoSpeedValue.textContent = (demoSpeed.value / 4).toFixed(1) + 'x';
  });

  demoToggle.addEventListener('change', function () {
    chrome.storage.local.set({ demoMode: demoToggle.checked });
    sendMessageToActiveTab({ type: 'DEMO_TOGGLE', enabled: demoToggle.checked });
  });

  simulateTremor.addEventListener('change', function () {
    chrome.storage.local.set({ demoSimulate: simulateTremor.checked });
    sendMessageToActiveTab({ type: 'DEMO_OPTIONS', simulate: simulateTremor.checked });
  });

  tremorSeverity.addEventListener('input', function () {
    const value = parseInt(tremorSeverity.value);
    updateTremorLabel(value);
    chrome.storage.local.set({ demoSeverity: value });
    sendMessageToActiveTab({ type: 'DEMO_OPTIONS', severity: value });
  });

  demoRunBtn.addEventListener('click', function () {
    sendMessageToActiveTab({ type: 'DEMO_RUN', mode: 'autorun' });
    demoRunBtn.style.display = 'none';
    demoPauseBtn.style.display = '';
  });

  demoPauseBtn.addEventListener('click', function () {
    sendMessageToActiveTab({ type: 'DEMO_RUN', mode: 'pause' });
    demoPauseBtn.style.display = 'none';
    demoRunBtn.style.display = '';
  });

  demoOnceBtn.addEventListener('click', function () {
    sendMessageToActiveTab({ type: 'DEMO_RUN', mode: 'once' });
  });

  demoSpeed.addEventListener('input', function () {
    const v = parseInt(demoSpeed.value);
    demoSpeedValue.textContent = (v / 4).toFixed(1) + 'x';
    chrome.storage.local.set({ demoSpeed: v });
    sendMessageToActiveTab({ type: 'DEMO_OPTIONS', playbackSpeed: v });
  });

  // Helper function to safely send messages
  function sendMessageToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
          // Ignore errors - content script might not be ready
          if (chrome.runtime.lastError) {
            console.log('Message not sent to active tab:', chrome.runtime.lastError.message);
            // Fallback: send to background to forward to content scripts
            try {
              chrome.runtime.sendMessage(message);
            } catch (e) {
              console.log('Fallback runtime.sendMessage failed', e && e.message);
            }
          }
        });
      }
    });
  }

  // Listen for stats updates from content script
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.type === 'STATS_UPDATE') {
        statsCard.style.display = 'block';
        updateStats(request.stats);
      }
    }
  );

  function updateStatus(enabled) {
    if (enabled) {
      statusText.textContent = 'Active on this page';
      statusDot.classList.add('active');
    } else {
      statusText.textContent = 'Disabled';
      statusDot.classList.remove('active');
    }
  }

  function updateSensitivityLabel(value) {
    const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    sensitivityValue.textContent = labels[value - 1];
  }

  function updateStats(stats) {
    document.getElementById('assistCount').textContent = stats.assistCount || 0;
    document.getElementById('clickCount').textContent = stats.clickCount || 0;

    const confidence = stats.confidenceLevel || 0;
    if (confidence === 0) {
      document.getElementById('confidenceLevel').textContent = 'Learning...';
    } else if (confidence < 30) {
      document.getElementById('confidenceLevel').textContent = 'Building...';
    } else if (confidence < 70) {
      document.getElementById('confidenceLevel').textContent = 'Good';
    } else {
      document.getElementById('confidenceLevel').textContent = 'Excellent';
    }
  }
});
