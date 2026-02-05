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
    stats: {
      assistCount: 0,
      clickCount: 0,
      confidenceLevel: 0,
    },
    userPatterns: {},
  });

  // Trigger tutorial on first install
  if (details.reason === 'install') {
    chrome.storage.local.set({
      tutorialCompleted: false,
      showTutorialOnNextPage: true,
    });

    // Open a simple page to run tutorial
    chrome.tabs.create({
      url: 'https://www.google.com',
      active: true,
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'STATS_UPDATE') {
    // Broadcast stats update to popup if open
    chrome.runtime.sendMessage(request);
  }
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
