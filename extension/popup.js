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
      mainToggle.checked = result.enabled !== false;
      sensitivitySlider.value = result.sensitivity || 3;
      visualFeedback.checked = result.visualFeedback !== false;
      autoAdapt.checked = result.autoAdapt !== false;

      updateSensitivityLabel(result.sensitivity || 3);
      updateStatus(mainToggle.checked);

      if (result.stats && result.stats.assistCount > 0) {
        statsCard.style.display = 'block';
        updateStats(result.stats);
      }

      startStatsPolling();
    }
  );

  function startStatsPolling() {
    setInterval(function() {
      chrome.storage.local.get(['stats'], function(result) {
        if (result.stats && result.stats.assistCount > 0) {
          statsCard.style.display = 'block';
          updateStats(result.stats);
        }
      });
    }, 500);
  }

  mainToggle.addEventListener('change', function () {
    const enabled = mainToggle.checked;
    chrome.storage.local.set({ enabled: enabled });
    updateStatus(enabled);
    sendMessageToActiveTab({
      type: 'TOGGLE_ASSISTANCE',
      enabled: enabled,
    });
  });

  sensitivitySlider.addEventListener('input', function () {
    const value = parseInt(sensitivitySlider.value);
    updateSensitivityLabel(value);
    chrome.storage.local.set({ sensitivity: value });
    sendMessageToActiveTab({
      type: 'UPDATE_SENSITIVITY',
      sensitivity: value,
    });
  });

  visualFeedback.addEventListener('change', function () {
    chrome.storage.local.set({ visualFeedback: visualFeedback.checked });
    sendMessageToActiveTab({
      type: 'UPDATE_VISUAL_FEEDBACK',
      enabled: visualFeedback.checked,
    });
  });

  autoAdapt.addEventListener('change', function () {
    chrome.storage.local.set({ autoAdapt: autoAdapt.checked });
  });

  resetBtn.addEventListener('click', function () {
    if (confirm('Reset all learned patterns? This cannot be undone.')) {
      chrome.storage.local.set({
        userPatterns: {},
        stats: { assistCount: 0, clickCount: 0, confidenceLevel: 0, successfulClicks: 0, missedClicks: 0 },
      });
      statsCard.style.display = 'none';
      sendMessageToActiveTab({
        type: 'RESET_LEARNING',
      });
    }
  });

  function sendMessageToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
          if (chrome.runtime.lastError) {
            console.log('Message not sent:', chrome.runtime.lastError.message);
          }
        });
      }
    });
  }

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
