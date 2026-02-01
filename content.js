/**
 * Content Script - Runs on all web pages
 * Handles selected text with AI processing popup
 */

let translationPopup = null;

/**
 * Initialize content script
 */
(function init() {
  console.log('🌐 AI Assistant content script loaded');
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showTranslationPopup') {
      console.log('📝 AI request received for:', request.selectedText);
      showTranslationPopup(request.selectedText, request.settings);
      sendResponse({ success: true });
    }
  });
})();

/**
 * Create and show translation popup
 */
function showTranslationPopup(selectedText, settings) {
  // Remove existing popup if any
  closeTranslationPopup();
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'ai-assistant-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Create popup element
  translationPopup = document.createElement('div');
  translationPopup.id = 'ai-assistant-popup';
  translationPopup.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 999999;
    width: 600px;
    max-width: 90vw;
    max-height: 80vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-size: 15px;
    display: flex;
    flex-direction: column;
  `;
  
  // Create popup content
  translationPopup.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 24px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <h2 style="margin: 0; font-size: 18px; font-weight: 600;">🤖 AI Assistant</h2>
      <button id="close-popup-btn" style="
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      ">×</button>
    </div>
    
    <div style="padding: 24px; overflow-y: auto; flex: 1;">
      <div style="margin-bottom: 24px;">
        <div style="
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        ">Selected Text</div>
        <div style="
          padding: 16px;
          background: #f8f9fa;
          border-left: 4px solid #667eea;
          border-radius: 4px;
          line-height: 1.6;
          color: #333;
          max-height: 200px;
          overflow-y: auto;
        ">${escapeHtml(selectedText)}</div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <div style="
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        ">AI Prompt</div>
        <textarea id="prompt-input" style="
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        " placeholder="Example: Translate to Vietnamese">${escapeHtml(settings.defaultPrompt || 'Translate to Vietnamese')}</textarea>
        <button id="process-btn" style="
          margin-top: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          width: 100%;
          transition: transform 0.2s, box-shadow 0.2s;
        ">🚀 Process with AI</button>
      </div>
      
      <div style="margin-bottom: 0;">
        <div style="
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        ">Result</div>
        <div id="translation-result" style="
          padding: 16px;
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
          border-radius: 4px;
          line-height: 1.8;
          color: #1b5e20;
          min-height: 80px;
          max-height: 300px;
          overflow-y: auto;
          font-size: 16px;
        ">
          <div style="color: #999; font-style: italic;">Press "Process with AI" to start...</div>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      #close-popup-btn:hover {
        background: rgba(255, 255, 255, 0.3) !important;
      }
      #prompt-input:focus {
        outline: none;
        border-color: #667eea;
      }
      #process-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      #process-btn:active {
        transform: translateY(0);
      }
    </style>
  `;
  
  backdrop.appendChild(translationPopup);
  document.body.appendChild(backdrop);
  
  // Attach close button event
  document.getElementById('close-popup-btn').addEventListener('click', closeTranslationPopup);
  
  // Attach process button event
  document.getElementById('process-btn').addEventListener('click', () => {
    const promptInput = document.getElementById('prompt-input');
    const prompt = promptInput.value.trim();
    if (prompt) {
      processText(selectedText, prompt);
    } else {
      const resultDiv = document.getElementById('translation-result');
      resultDiv.innerHTML = '<span style="color: #f44336;">❌ Please enter a prompt</span>';
    }
  });
  
  // Allow Enter key in textarea but Ctrl+Enter to submit
  document.getElementById('prompt-input').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      document.getElementById('process-btn').click();
    }
  });
  
  // Close when clicking backdrop
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeTranslationPopup();
    }
  });
  
  // Prevent closing when clicking inside popup
  translationPopup.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

/**
 * Close translation popup
 */
function closeTranslationPopup() {
  const backdrop = document.getElementById('ai-assistant-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
  translationPopup = null;
}

/**
 * Process text using AI API
 */
async function processText(text, prompt) {
  const resultDiv = document.getElementById('translation-result');
  
  // Show loading
  resultDiv.innerHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      Processing...
    </div>
  `;
  
  try {
    const backendUrl = 'https://ai-extension-api.duckdns.org';
    
    console.log('🔄 Sending request to:', `${backendUrl}/api/generate`);
    console.log('📝 Request body:', { text, prompt });
    
    // Call AI API
    const response = await fetch(`${backendUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      credentials: 'omit',
      body: JSON.stringify({
        text: text,
        prompt: prompt
      })
    });
    
    console.log('📥 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error response:', errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Response received:', data);
    
    // Display result
    if (data.result) {
      resultDiv.innerHTML = escapeHtml(data.result);
      resultDiv.style.color = '#333';
    } else {
      throw new Error('No result received from API');
    }
    
  } catch (error) {
    console.error('❌ Processing error:', error);
    
    let errorMessage = error.message;
    
    // Add helpful hints for common errors
    if (errorMessage.includes('Failed to fetch')) {
      errorMessage = `Cannot connect to backend!\n\n` +
                    `• Is the backend running?\n` +
                    `• URL: https://ai-extension-api.duckdns.org\n` +
                    `• Backend needs to enable CORS for extension`;
    }
    
    resultDiv.innerHTML = `<span style="color: #f44336;">❌ ${escapeHtml(errorMessage)}</span>`;
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}