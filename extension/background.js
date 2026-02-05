// Background service worker
// Handles cross-tab communication and data persistence

chrome.runtime.onInstalled.addListener(() => {
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
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'STATS_UPDATE') {
    // Broadcast stats update to popup if open
    chrome.runtime.sendMessage(request);
  }
});
