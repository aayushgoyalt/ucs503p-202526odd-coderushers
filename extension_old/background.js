// background.js - Service Worker for the extension

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('LeetCode Tracker installed');
    
    // Initialize storage with empty array
    chrome.storage.local.set({
      leetcodeAttempts: []
    });
  } else if (details.reason === 'update') {
    console.log('LeetCode Tracker updated');
  }
});

// Handle messages from content script (if needed for future features)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'SAVE_ATTEMPT':
      handleSaveAttempt(request.data, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'GET_ATTEMPTS':
      handleGetAttempts(sendResponse);
      return true;
      
    default:
      console.log('Unknown message type:', request.type);
  }
});

// Save attempt to storage
function handleSaveAttempt(attemptData, sendResponse) {
  chrome.storage.local.get(['leetcodeAttempts']).then((result) => {
    const attempts = result.leetcodeAttempts || [];
    
    attempts.push({
      ...attemptData,
      id: generateId(),
      timestamp: new Date().toISOString()
    });
    
    return chrome.storage.local.set({ leetcodeAttempts: attempts });
  }).then(() => {
    sendResponse({ success: true });
  }).catch((error) => {
    console.error('Error saving attempt:', error);
    sendResponse({ success: false, error: error.message });
  });
}

// Get all attempts from storage
function handleGetAttempts(sendResponse) {
  chrome.storage.local.get(['leetcodeAttempts']).then((result) => {
    const attempts = result.leetcodeAttempts || [];
    sendResponse({ success: true, attempts });
  }).catch((error) => {
    console.error('Error getting attempts:', error);
    sendResponse({ success: false, error: error.message });
  });
}

// Generate unique ID for attempts
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Handle tab updates (useful for detecting navigation to LeetCode)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only act when the page has finished loading
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('leetcode.com/problems/')) {
    // The content script will handle the tracking
    console.log('LeetCode problem page loaded:', tab.url);
  }
});

// Optional: Badge text to show attempt count
function updateBadge() {
  chrome.storage.local.get(['leetcodeAttempts']).then((result) => {
    const attempts = result.leetcodeAttempts || [];
    const count = attempts.length;
    
    if (count > 0) {
      chrome.action.setBadgeText({
        text: count > 99 ? '99+' : count.toString()
      });
      chrome.action.setBadgeBackgroundColor({ color: '#2196F3' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }).catch((error) => {
    console.error('Error updating badge:', error);
  });
}

// Update badge when storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.leetcodeAttempts) {
    updateBadge();
  }
});

// Initialize badge on startup
updateBadge();