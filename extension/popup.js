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
  const metricsCard = document.getElementById('metricsCard');


  // charts stuff not working
  // Chart instances (will remain null if Chart.js isn't loaded or canvas missing)
  let assistChart = null;
  let clicksChart = null;
  let confidenceChart = null;

  // Initialize charts only if Chart is available
  function initCharts() {
    if (typeof Chart === 'undefined') return;
    const assistCtx = document.getElementById('assistChart').getContext('2d');
    const clicksCtx = document.getElementById('clicksChart').getContext('2d');
    const confidenceCtx = document.getElementById('confidenceChart').getContext('2d');


    assistChart = createLineChart(
      assistCtx,
      "Assistance Events",
      sessionData.assistEvents
    );

    clicksChart = createLineChart(
      clicksCtx,
      "Clicks Stabilized",
      sessionData.clicks
    );

    confidenceChart = createLineChart(
      confidenceCtx,
      "Confidence",
      sessionData.confidence,
      0,
      100
    );
  }

  function createLineChart(ctx, label, data, minY = 0, maxY = null) {
    return new Chart(ctx, {
      type: "line",
      data: {
        labels: sessionData.timestamps,
        datasets: [
          {
            label,
            data,
            fill: false,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,

        scales: {
          y: {
            beginAtZero: true,
            min: minY,
            max: maxY
          }
        },

        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  function recordMetrics(assist, clicks, confidence) {
    const time = new Date().toLocaleTimeString();

    sessionData.timestamps.push(time);
    sessionData.assistEvents.push(assist);
    sessionData.clicks.push(clicks);
    sessionData.confidence.push(confidence);

    refreshCharts();
  }

  function refreshCharts() {
    if (!assistChart) return;

    assistChart.update();
    clicksChart.update();
    confidenceChart.update();
  }


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

      // Initialize charts (in case Chart is already loaded)
      initCharts();

      // Show stats if available
      if (result.stats && (result.stats.assistCount > 0 || result.stats.clickCount > 0 || result.stats.misclickCount)) {
        statsCard.style.display = 'block';
        metricsCard.style.display = 'block';
        updateStats(result.stats);
        recordMetrics(result.stats); // update chart visuals from saved stats
      } else {
        statsCard.style.display = 'none';
        // keep metrics hidden until stats exist
        // metricsCard.style.display = 'none';
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
        stats: { assistCount: 0, clickCount: 0, confidenceLevel: 0, misclickCount: 0 },
      });

      statsCard.style.display = 'none';
      metricsCard.style.display = 'none';

      // reset charts to zeros (if present)
      recordMetrics({ assistCount: 0, clickCount: 0, confidenceLevel: 0, misclickCount });

      sendMessageToActiveTab({
        type: 'RESET_LEARNING',
      });
    }
  });

  // Helper function to safely send messages
  function sendMessageToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
          // Ignore errors - content script might not be ready
          if (chrome.runtime.lastError) {
            console.log('Message not sent:', chrome.runtime.lastError.message);
          }
        });
      }
    });
  }

  // Listen for stats updates from content script
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'STATS_UPDATE') {
      statsCard.style.display = 'block';
      metricsCard.style.display = 'block';
      updateStats(request.stats);
      recordMetrics(request.stats); // refresh charts when new stats arrive
    }
  });

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
    document.getElementById('misclickCount').textContent = stats.misclickCount || 0;
    document.getElementById('metricsCard').style.display = 'block';

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