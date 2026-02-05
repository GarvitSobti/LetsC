// Background service worker
// Handles cross-tab communication and data persistence

chrome.runtime.onInstalled.addListener(details => {
  console.log('Steady Assist installed');

  // Set default settings
  chrome.storage.local.set({
    enabled: true,
    sensitivity: 3,
    visualFeedback: true,
    autoAdapt: true,
    motorImpaired: false,
    visualImpaired: false,
    visualImpairedScale: 2,
    stats: {
      assistCount: 0,
      clickCount: 0,
      confidenceLevel: 0,
      successfulClicks: 0,
      missedClicks: 0,
    },
    userTremorPattern: {
      severity: 'unknown',
      frequency: 0,
      amplitude: 0,
    },
    userPatterns: {},
  });

  // Trigger tutorial on first install
  if (details.reason === 'install') {
    chrome.storage.local.set({
      tutorialCompleted: false,
      showTutorialOnNextPage: true,
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'STATS_UPDATE') {
    // Broadcast stats update to popup if open
    try {
      chrome.runtime.sendMessage(request, () => {
        // Ignore if no receiver (popup closed)
        if (chrome.runtime.lastError) return;
      });
    } catch (err) {
      // Ignore context errors
    }
  }
  return true; // Keep message channel open
  // Forward demo control messages to all tabs so content scripts receive them
  if (
    request.type &&
    request.type.startsWith &&
    request.type.startsWith('DEMO')
  ) {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, request, function () {
            // ignore per-tab errors
            if (chrome.runtime.lastError) {
              // console.log('Forward to tab failed', chrome.runtime.lastError.message);
            }
          });
        }
      });
    });
  }
});
