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
  const metricsSection = document.getElementById('metricsSection');

  // Chart instances
  let accuracyChart = null;
  let ratioChart = null;

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

      // Show stats and metrics if available
      if (result.stats && result.stats.assistCount > 0) {
        statsCard.style.display = 'block';
        metricsSection.style.display = 'block';
        updateStats(result.stats);
        initializeCharts(result.stats);
      }
    }
  );

  // Setup metrics tab switching
  const metricsTabs = document.querySelectorAll('.metrics-tab');
  metricsTabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      const tabName = this.getAttribute('data-tab');

      // Update active tab
      metricsTabs.forEach((t) => t.classList.remove('active'));
      this.classList.add('active');

      // Update visible content
      document.getElementById('accuracyTab').style.display = 'none';
      document.getElementById('ratioTab').style.display = 'none';

      if (tabName === 'accuracy') {
        document.getElementById('accuracyTab').style.display = 'block';
        setTimeout(() => {
          if (accuracyChart) accuracyChart.resize();
        }, 50);
      } else {
        document.getElementById('ratioTab').style.display = 'block';
        setTimeout(() => {
          if (ratioChart) ratioChart.resize();
        }, 50);
      }
    });
  });

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
        stats: {
          assistCount: 0,
          clickCount: 0,
          confidenceLevel: 0,
          successfulClicks: 0,
          missedClicks: 0,
        },
      });

      statsCard.style.display = 'none';
      metricsSection.style.display = 'none';

      if (accuracyChart) accuracyChart.destroy();
      if (ratioChart) ratioChart.destroy();

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
      metricsSection.style.display = 'block';
      updateStats(request.stats);
      updateCharts(request.stats);
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

  function initializeCharts(stats) {
    // Initialize accuracy chart
    const accuracyCtx = document
      .getElementById('accuracyChart')
      .getContext('2d');

    const successfulClicks = stats.successfulClicks || 0;
    const missedClicks = stats.missedClicks || 0;
    const total = successfulClicks + missedClicks;
    const successRate = total > 0 ? ((successfulClicks / total) * 100).toFixed(1) : 0;

    accuracyChart = new Chart(accuracyCtx, {
      type: 'doughnut',
      data: {
        labels: ['Successful', 'Missed'],
        datasets: [
          {
            data: [successfulClicks, missedClicks],
            backgroundColor: ['#22c55e', '#ef4444'],
            borderColor: ['#dcfce7', '#fee2e2'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12 },
              padding: 16,
            },
          },
        },
      },
    });

    // Update accuracy stats
    document.getElementById('successRate').textContent = successRate + '%';
    document.getElementById('successfulClicksValue').textContent = successfulClicks;
    document.getElementById('missedClicksValue').textContent = missedClicks;

    // Initialize ratio chart
    const ratioCtx = document.getElementById('ratioChart').getContext('2d');

    const assistedClicks = stats.assistCount || 0;
    const unassistedClicks = (stats.clickCount || 0) - assistedClicks;
    const assistanceRatio =
      (stats.clickCount || 0) > 0
        ? ((assistedClicks / (stats.clickCount || 1)) * 100).toFixed(1)
        : 0;

    ratioChart = new Chart(ratioCtx, {
      type: 'doughnut',
      data: {
        labels: ['Assisted', 'Unassisted'],
        datasets: [
          {
            data: [assistedClicks, unassistedClicks],
            backgroundColor: ['#3b82f6', '#94a3b8'],
            borderColor: ['#dbeafe', '#e2e8f0'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12 },
              padding: 16,
            },
          },
        },
      },
    });

    // Update ratio stats
    document.getElementById('assistedClicksValue').textContent = assistedClicks;
    document.getElementById('unassistedClicksValue').textContent = unassistedClicks;
    document.getElementById('assistanceRatio').textContent = assistanceRatio + '%';
  }

  function updateCharts(stats) {
    // Update accuracy chart
    if (accuracyChart) {
      const successfulClicks = stats.successfulClicks || 0;
      const missedClicks = stats.missedClicks || 0;
      const total = successfulClicks + missedClicks;
      const successRate =
        total > 0 ? ((successfulClicks / total) * 100).toFixed(1) : 0;

      accuracyChart.data.datasets[0].data = [successfulClicks, missedClicks];
      accuracyChart.update();

      document.getElementById('successRate').textContent = successRate + '%';
      document.getElementById('successfulClicksValue').textContent =
        successfulClicks;
      document.getElementById('missedClicksValue').textContent = missedClicks;
    }

    // Update ratio chart
    if (ratioChart) {
      const assistedClicks = stats.assistCount || 0;
      const unassistedClicks = (stats.clickCount || 0) - assistedClicks;
      const assistanceRatio =
        (stats.clickCount || 0) > 0
          ? ((assistedClicks / (stats.clickCount || 1)) * 100).toFixed(1)
          : 0;

      ratioChart.data.datasets[0].data = [assistedClicks, unassistedClicks];
      ratioChart.update();

      document.getElementById('assistedClicksValue').textContent = assistedClicks;
      document.getElementById('unassistedClicksValue').textContent =
        unassistedClicks;
      document.getElementById('assistanceRatio').textContent =
        assistanceRatio + '%';
    }
  }
});
