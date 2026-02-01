/**
 * Background Service Worker (Manifest V3)
 * Handles extension lifecycle and communication
 */

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('✅ AI Assistant Extension installed');
    
    // Set default settings on first install
    const defaultSettings = {
      defaultPrompt: 'Translate to Vietnamese'
    };
    
    chrome.storage.sync.set(defaultSettings, () => {
      console.log('📝 Default settings initialized');
    });
  } else if (details.reason === 'update') {
    console.log('🔄 Extension updated to version', chrome.runtime.getManifest().version);
  }
  
  // Create context menu (remove old ones first to prevent duplicates)
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'translateAI',
      title: 'Process with AI',
      contexts: ['selection']
    });
  });
});

/**
 * Handle context menu click
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'translateAI' && info.selectionText) {
    // Validate tab
    if (!tab || !tab.id) {
      console.error('❌ Invalid tab');
      return;
    }

    // Check if page is accessible (not chrome:// or extension pages)
    if (tab.url && (tab.url.startsWith('chrome://') || 
                     tab.url.startsWith('chrome-extension://') ||
                     tab.url.startsWith('edge://') ||
                     tab.url.startsWith('about:'))) {
      showNotification('Cannot process on system pages');
      return;
    }
    
    // Get settings from storage with error handling
    let settings;
    try {
      settings = await chrome.storage.sync.get(['defaultPrompt']);
    } catch (error) {
      console.error('❌ Failed to get settings:', error);
      settings = { defaultPrompt: 'Translate to Vietnamese' };
    }
    
    // Send message to content script to show popup
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showTranslationPopup',
        selectedText: info.selectionText.trim(),
        settings: settings
      });
    } catch (error) {
      // Content script not loaded, inject it first
      console.log('📥 Content script not loaded, injecting...');
      
      try {
        // Inject content script
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Wait for script to initialize
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Try sending message again
        await chrome.tabs.sendMessage(tab.id, {
          action: 'showTranslationPopup',
          selectedText: info.selectionText.trim(),
          settings: settings
        });
        
        console.log('✅ Content script injected and message sent');
      } catch (injectError) {
        console.error('❌ Failed to inject content script:', injectError);
        showNotification('Cannot process on this page. Please reload and try again.');
      }
    }
  }
});

/**
 * Show notification to user
 */
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'AI Assistant',
    message: message
  });
}

/**
 * Handle messages from content script or popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['defaultPrompt'], (result) => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }
});
