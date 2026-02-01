/**
 * Popup Script - Handles settings for AI Assistant
 */

// DOM Elements
let defaultPromptInput;
let saveBtn;
let statusMessage;

/**
 * Initialize popup when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  defaultPromptInput = document.getElementById('defaultPrompt');
  saveBtn = document.getElementById('saveBtn');
  statusMessage = document.getElementById('statusMessage');

  // Load saved settings
  loadSettings();

  // Attach event listeners
  saveBtn.addEventListener('click', saveSettings);
});

/**
 * Load settings from chrome.storage.sync
 */
function loadSettings() {
  // Default settings
  const defaults = {
    defaultPrompt: 'Translate to Vietnamese'
  };

  // Load from chrome.storage.sync
  chrome.storage.sync.get(defaults, (items) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading settings:', chrome.runtime.lastError);
      showStatus('❌ Error loading settings', 'error');
      return;
    }
    
    // Populate form with loaded settings
    defaultPromptInput.value = items.defaultPrompt || '';
  });
}

/**
 * Save settings to chrome.storage.sync
 */
function saveSettings() {
  // Get values from form
  const settings = {
    defaultPrompt: defaultPromptInput.value.trim() || 'Translate to Vietnamese'
  };

  // Save to chrome.storage.sync
  chrome.storage.sync.set(settings, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving settings:', chrome.runtime.lastError);
      showStatus('❌ Error saving settings', 'error');
      return;
    }
    
    // Show success message
    showStatus('✅ Settings saved successfully!', 'success');
  });
}

/**
 * Show status message to user
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
  
  // Hide after 4 seconds
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 4000);
}
