# 🤖 AI Assistant Chrome Extension

A powerful Chrome extension that processes selected text using AI. Select any text on any webpage, right-click, and let AI help you translate, summarize, explain, or transform it based on your custom prompts.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-yellow)

## ✨ Features

- 🎯 **Context Menu Integration** - Right-click on any selected text to process
- 🚀 **Custom AI Prompts** - Use any prompt: translate, summarize, explain, rewrite, etc.
- ⚡ **Fast & Responsive** - Get AI results in seconds
- 🎨 **Beautiful UI** - Modern, intuitive popup interface
- 💾 **Persistent Settings** - Your default prompt is saved automatically
- 🔒 **Privacy Focused** - Text processed securely via backend API

## 🚀 Quick Start

### Prerequisites

- Google Chrome or Chromium-based browser (Edge, Brave, etc.)
- Backend server running (see [Backend Setup](https://github.com/HaMinhDung/AI_Extension))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-assistant-extension.git
   cd ai-assistant-extension
   ```

2. **Load extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select this extension folder
   - The extension icon will appear in your toolbar

3. **Configure settings (optional)**
   - Click the extension icon in Chrome toolbar
   - Set your default prompt (e.g., "Translate to Vietnamese")
   - Click **Save Settings**

### Usage

1. **Select any text** on any webpage
2. **Right-click** to open context menu
3. **Click "Process with AI"**
4. **Enter or modify your prompt** in the popup
5. **Click "🚀 Process with AI"** button
6. **View the result** instantly

**Keyboard shortcut:** Press `Ctrl+Enter` in the prompt field to submit

## 🎯 Example Prompts

```
Translate to Vietnamese
Translate to English
Summarize this in 3 bullet points
Explain this like I'm 5 years old
Make this more formal
Make this more casual
Fix grammar and spelling
Extract key information
Generate questions from this text
Simplify this technical jargon
```

## 🏗️ Architecture

### Frontend (Chrome Extension)
- **Manifest V3** - Latest Chrome extension architecture
- **Service Worker** - Background script for lifecycle management
- **Content Script** - Injected into web pages for UI
- **Popup** - Settings interface

### Backend Connection

The extension connects to a Spring Boot backend API:

**API Endpoint:** `https://ai-extension-api.duckdns.org/api/generate`

**Code Location:** [content.js](content.js#L263-L285)

```javascript
// Backend API call
const response = await fetch(`${backendUrl}/api/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8'
  },
  body: JSON.stringify({
    text: selectedText,
    prompt: userPrompt
  })
});
```

**Request Format:**
```json
{
  "text": "Selected text from webpage",
  "prompt": "Your AI instruction"
}
```

**Response Format:**
```json
{
  "result": "AI-generated output"
}
```

## 🛠️ Tech Stack

### Frontend
- Chrome Extension Manifest V3
- Vanilla JavaScript (no frameworks)
- Chrome APIs (storage, contextMenus, scripting)

### Backend
- Spring Boot REST API
- Google Gemini AI API
- CORS enabled for extension origin

## 📁 Project Structure

```
ai-assistant-extension/
├── manifest.json          # Extension configuration
├── config.js              # Configuration (backend URL, settings)
├── background.js          # Service worker (background script)
├── content.js            # Content script (injected into pages)
├── popup.html            # Settings popup UI
├── popup.js              # Settings popup logic
├── styles.css            # Popup styles
├── icons/                # Extension icons
├── README.md             # This file
└── BACKEND_CORS_FIX.md   # Backend CORS configuration guide
```

## ⚙️ Backend Setup

### Requirements
- Java 17+
- Spring Boot 3.x
- Google Gemini API key

### Backend Must Enable CORS

Add to your Spring Boot application:

```java
@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("chrome-extension://*")
                        .allowedMethods("POST", "GET", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
```

See [BACKEND_CORS_FIX.md](BACKEND_CORS_FIX.md) for detailed backend configuration.

### Backend API Endpoint

Create a controller with this endpoint:

```java
@PostMapping("/api/generate")
public ResponseEntity<Map<String, String>> generate(
    @RequestBody Map<String, String> request) {
    
    String text = request.get("text");
    String prompt = request.get("prompt");
    
    // Process with Google Gemini API
    String result = geminiService.processText(text, prompt);
    
    return ResponseEntity.ok(Map.of("result", result));
}
```

### Update Backend URL

If your backend URL is different, edit [config.js](config.js):

```javascript
const CONFIG = {
  BACKEND_URL: 'https://your-backend-url.com',
  API: {
    GENERATE: '/api/generate'
  }
};
```

You can also create `config.local.js` for local development (this file is gitignored).

## 🐛 Troubleshooting

### "Cannot connect to backend!"

1. **Check backend is running:** Visit your backend URL in browser
2. **Verify CORS is enabled:** Check backend logs for CORS errors
3. **Check URL:** Ensure backend URL in `content.js` is correct
4. **Check network:** Open DevTools → Network tab to see failed requests

### Extension not appearing

1. **Enable Developer mode** in `chrome://extensions/`
2. **Reload extension** after making changes
3. **Check for errors** in extension details page

### Context menu not showing

1. **Refresh the page** after installing extension
2. **Try reloading the extension** from `chrome://extensions/`
3. **Check console** for errors (right-click extension → Inspect)

## 🔧 Development

### Making Changes

1. Edit files in your code editor
2. Go to `chrome://extensions/`
3. Click the **Reload** button on your extension
4. Refresh any open web pages to load new content script

### Debugging

- **Background script:** Right-click extension icon → Inspect
- **Content script:** Open DevTools on webpage → Console tab
- **Popup:** Right-click extension popup → Inspect

### Testing

Use the included PowerShell script to check backend connectivity:

```powershell
.\check-backend.ps1
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author

[Ha Minh Dung](https://github.com/HaMinhDung)

## 🙏 Acknowledgments

- Powered by Google Gemini AI API
- Built with Chrome Extension Manifest V3
- Icons and UI inspired by modern design principles

---

**⭐ If you find this project useful, please consider giving it a star!**
