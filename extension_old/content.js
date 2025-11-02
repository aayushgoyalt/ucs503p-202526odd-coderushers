// content.js - Runs on LeetCode problem pages
class LeetCodeTracker {
  constructor() {
    this.startTime = null;
    this.currentProblem = null;
    this.isTracking = false;
    this.hasAskedPermission = false;
    this.userOptedIn = false;
    
    this.init();
  }

  init() {
    // Wait for page to fully load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.checkAndShowPermission();
        this.createManualButton();
      });
    } else {
      this.checkAndShowPermission();
      this.createManualButton();
    }
  }

  async checkAndShowPermission() {
    // Check if user has already made a choice for this session
    try {
      const result = await chrome.storage.local.get(['trackingPermissionAsked', 'autoStartTracking']);
      
      // If user has already been asked and chose auto-start, start immediately
      if (result.autoStartTracking) {
        this.userOptedIn = true;
        this.startTracking();
        return;
      }
      
      // If never asked before, show the permission dialog
      if (!result.trackingPermissionAsked) {
        this.showPermissionDialog();
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      this.showPermissionDialog(); // Fallback to showing dialog
    }
  }

  showPermissionDialog() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'leetcode-tracker-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 450px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      text-align: center;
    `;

    dialog.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 15px;">🚀</div>
        <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">LeetCode Practice Tracker</h2>
        <p style="color: #666; margin: 0; font-size: 16px;">Track your coding practice automatically</p>
      </div>
      
      <div style="text-align: left; margin: 20px 0; color: #555; font-size: 14px;">
        <p><strong>This extension will:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>⏱️ Track time spent on problems</li>
          <li>📝 Log your attempts and results</li>
          <li>💾 Store data locally in your browser</li>
          <li>📊 Show your progress in the popup</li>
        </ul>
      </div>
      
      <div style="margin-top: 25px;">
        <button id="start-tracking-btn" style="
          background: #2196F3;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 10px;
        ">Start Tracking</button>
        
        <button id="not-now-btn" style="
          background: #f5f5f5;
          color: #666;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
        ">Not Now</button>
        
        <button id="always-track-btn" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
        ">Always Track</button>
      </div>
      
      <p style="font-size: 12px; color: #999; margin-top: 15px;">
        You can change this setting anytime in the extension popup
      </p>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Add button event listeners
    document.getElementById('start-tracking-btn').addEventListener('click', () => {
      this.handlePermissionChoice('once');
    });

    document.getElementById('not-now-btn').addEventListener('click', () => {
      this.handlePermissionChoice('no');
    });

    document.getElementById('always-track-btn').addEventListener('click', () => {
      this.handlePermissionChoice('always');
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.handlePermissionChoice('no');
      }
    });
  }

  async handlePermissionChoice(choice) {
    // Remove the dialog
    const overlay = document.getElementById('leetcode-tracker-overlay');
    if (overlay) {
      overlay.remove();
    }

    try {
      // Save the user's choice
      await chrome.storage.local.set({ 
        trackingPermissionAsked: true,
        autoStartTracking: choice === 'always'
      });

      if (choice === 'once' || choice === 'always') {
        this.userOptedIn = true;
        this.startTracking();
        
        if (choice === 'always') {
          this.showNotification('✅ Auto-tracking enabled for future visits!', '#4CAF50');
        }
      } else {
        this.showNotification('❌ Tracking disabled for this session', '#ff9800');
      }
    } catch (error) {
      console.error('Error saving permission choice:', error);
    }
  }

  async extractProblemInfo() {
    // Try to extract slug from URL
    const urlMatch = window.location.pathname.match(/\/problems\/([^\/]+)/);
    let slug = null;
    if (urlMatch) {
      slug = urlMatch[1];
    }
    let usedApi = false;
    if (slug) {
      try {
        // Query LeetCode GraphQL API
        const query = `
          query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              title
              difficulty
              topicTags { name }
            }
          }
        `;
        const response = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { titleSlug: slug }
          })
        });
        if (!response.ok) {
          throw new Error(`GraphQL API HTTP error: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.data && data.data.question) {
          const q = data.data.question;
          this.currentProblem = {
            title: q.title || (slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
            difficulty: q.difficulty || 'Unknown',
            tags: (q.topicTags || []).map(t => t.name),
            url: window.location.href
          };
          usedApi = true;
          console.log('LeetCode Tracker: Extracted problem info from API:', this.currentProblem);
        }
      } catch (err) {
        console.error('LeetCode Tracker: Error fetching problem info from API:', err);
      }
    }
    if (!usedApi) {
      // Fallback to old DOM scraping logic
      // Try multiple selectors for problem title (LeetCode changes these frequently)
      const titleSelectors = [
        'h1[data-cy="question-title"]',
        'div[data-cy="question-title"]', 
        '.css-v3d350',
        'h1.text-title-large',
        'div.text-title-large',
        'h1',
        '.question-title h1',
        '[class*="title"]'
      ];
      let titleElement = null;
      for (const selector of titleSelectors) {
        titleElement = document.querySelector(selector);
        if (titleElement && titleElement.textContent.trim()) break;
      }
      // Extract difficulty with more selectors
      const difficultySelectors = [
        'div[diff]',
        '[class*="difficulty"]',
        '.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard',
        '[data-degree]',
        '.text-olive, .text-yellow, .text-pink',
        '.text-green, .text-orange, .text-red',
        '[class*="easy"], [class*="medium"], [class*="hard"]',
        'span:contains("Easy"), span:contains("Medium"), span:contains("Hard")'
      ];
      let difficultyElement = null;
      for (const selector of difficultySelectors) {
        if (selector.includes(':contains')) continue;
        difficultyElement = document.querySelector(selector);
        if (difficultyElement && difficultyElement.textContent.trim()) {
          console.log('LeetCode Tracker: Found difficulty element:', difficultyElement, 'text:', difficultyElement.textContent);
          break;
        }
      }
      // Extract tags
      const tagElements = document.querySelectorAll('a[href*="/tag/"], .topic-tag, [class*="tag"]');
      // Try to get title from URL if element not found
      let title = 'Unknown Problem';
      if (titleElement && titleElement.textContent.trim()) {
        title = titleElement.textContent.trim();
      } else if (slug) {
        title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      this.currentProblem = {
        title,
        difficulty: this.parseDifficulty(difficultyElement),
        tags: Array.from(tagElements).map(el => el.textContent.trim()).filter(tag => tag.length > 0 && tag.length < 30),
        url: window.location.href
      };
      console.log('LeetCode Tracker: Extracted problem info (fallback):', this.currentProblem);
    }
  }

  parseDifficulty(element) {
    // If already have difficulty from API, use that
    if (this.currentProblem && this.currentProblem.difficulty && this.currentProblem.difficulty !== 'Unknown') {
      return this.currentProblem.difficulty;
    }
    if (!element) {
      // Try to find difficulty by searching all text content
      return this.findDifficultyInPage();
    }
    const text = element.textContent.toLowerCase().trim();
    const className = element.className.toLowerCase();
    // Check text content
    if (text.includes('easy') || text === 'easy') return 'Easy';
    if (text.includes('medium') || text === 'medium') return 'Medium';
    if (text.includes('hard') || text === 'hard') return 'Hard';
    // Check class names
    if (className.includes('easy')) return 'Easy';
    if (className.includes('medium')) return 'Medium';
    if (className.includes('hard')) return 'Hard';
    // Check specific LeetCode color classes
    if (className.includes('text-olive') || className.includes('text-green')) return 'Easy';
    if (className.includes('text-yellow') || className.includes('text-orange')) return 'Medium';
    if (className.includes('text-pink') || className.includes('text-red')) return 'Hard';
    // Try parent element
    if (element.parentElement) {
      return this.parseDifficulty(element.parentElement);
    }
    return this.findDifficultyInPage();
  }

  findDifficultyInPage() {
    // If already have difficulty from API, use that
    if (this.currentProblem && this.currentProblem.difficulty && this.currentProblem.difficulty !== 'Unknown') {
      return this.currentProblem.difficulty;
    }
    // Search through all elements for difficulty text
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      const text = element.textContent.toLowerCase().trim();
      // Look for exact matches in small elements (likely difficulty badges)
      if (element.children.length === 0 && text.length < 10) {
        if (text === 'easy') return 'Easy';
        if (text === 'medium') return 'Medium'; 
        if (text === 'hard') return 'Hard';
      }
      // Look for elements with difficulty in class names
      const className = element.className.toLowerCase();
      if (className.includes('difficulty')) {
        if (text.includes('easy') || className.includes('easy')) return 'Easy';
        if (text.includes('medium') || className.includes('medium')) return 'Medium';
        if (text.includes('hard') || className.includes('hard')) return 'Hard';
      }
    }
    // Try to find by common color patterns
    const colorElements = document.querySelectorAll(
      '.text-olive, .text-green, .text-yellow, .text-orange, .text-pink, .text-red, ' +
      '[style*="color"], [class*="color"]'
    );
    for (const element of colorElements) {
      const text = element.textContent.toLowerCase().trim();
      if (text === 'easy' || text === 'medium' || text === 'hard') {
        return text.charAt(0).toUpperCase() + text.slice(1);
      }
    }
    console.log('LeetCode Tracker: Could not find difficulty, trying URL pattern');
    return this.getDifficultyFromUrl();
  }

  getDifficultyFromUrl() {
    // Some LeetCode URLs or page data might indicate difficulty
    // This is a last resort - you could maintain a lookup table of known problems
    const problemMatch = window.location.pathname.match(/\/problems\/([^\/]+)/);
    if (problemMatch) {
      const slug = problemMatch[1];
      // For now, just return Unknown, but you could add a lookup table here
      console.log('LeetCode Tracker: Problem slug:', slug, '- difficulty lookup not implemented');
    }
    
    return 'Unknown';
  }

  startTimer() {
    this.startTime = Date.now();
    this.isTracking = true;
  }

  startTracking() {
    if (this.isTracking) return;
    this.isTracking = true;
    this.startTime = Date.now();
    this.extractProblemInfo();
    this.setupSubmitListener();
    this.showNotification('🚀 Tracking started for this problem!', '#2196F3');
  }

  setupSubmitListener() {
    // Look for submit button and add listener
    this.observeSubmitButtons();
    
    // Also listen for navigation changes (SPA routing)
    this.observeUrlChanges();
  }

  observeSubmitButtons() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.attachSubmitListeners(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also check existing buttons
    this.attachSubmitListeners(document);
  }

  attachSubmitListeners(container) {
    // Look for submit buttons with multiple selectors
    const submitSelectors = [
      'button[data-e2e-locator="console-submit-button"]',
      'button[data-e2e-locator*="submit"]',
      '[data-cy="submit-code-btn"]',
      'button[class*="submit"]',
      'button[id*="submit"]'
    ];
    
    let submitButtons = [];
    for (const selector of submitSelectors) {
      const buttons = container.querySelectorAll(selector);
      submitButtons = [...submitButtons, ...Array.from(buttons)];
    }

    // Also look for buttons with text "Submit" or "Run"
    const allButtons = container.querySelectorAll('button');
    allButtons.forEach(button => {
      const text = button.textContent.trim().toLowerCase();
      if ((text === 'submit' || text.includes('submit')) && 
          !button.hasAttribute('data-tracker-listener')) {
        submitButtons.push(button);
      }
    });

    // Add listeners to found buttons
    submitButtons.forEach(button => {
      if (!button.hasAttribute('data-tracker-listener')) {
        button.setAttribute('data-tracker-listener', 'true');
        button.addEventListener('click', () => {
          console.log('LeetCode Tracker: Submit button clicked');
          this.handleSubmit();
        });
        console.log('LeetCode Tracker: Added listener to submit button:', button);
      }
    });

    console.log('LeetCode Tracker: Found', submitButtons.length, 'submit buttons');
  }

  handleSubmit() {
    if (!this.isTracking || !this.startTime) {
      console.log('LeetCode Tracker: Not tracking or no start time');
      return;
    }

    console.log('LeetCode Tracker: Submit detected, will check result in 5 seconds');
    const timeSpent = Date.now() - this.startTime;
    
    // Show immediate feedback
    this.showNotification('⏱️ Tracking submission...', '#2196F3');
    
    // Wait longer for the result to appear (LeetCode can be slow)
    setTimeout(() => {
      this.checkResult(timeSpent);
    }, 5000);
  }

  checkResult(timeSpent) {
    const attempt = {
      ...this.currentProblem,
      timeSpent: Math.round(timeSpent / 1000), // in seconds
      timestamp: new Date().toISOString(),
      result: this.detectResult()
    };
    this.showConfirmPopup(attempt);
  }

  detectResult() {
    // Look for various result indicators with more comprehensive selectors
    const elements = document.querySelectorAll('*');
    
    // Check for "Accepted" text first (most reliable)
    for (const element of elements) {
      const text = element.textContent.toLowerCase();
      if (text.includes('accepted') && !text.includes('not accepted')) {
        console.log('LeetCode Tracker: Found "Accepted" result');
        return 'Accepted';
      }
    }
    
    // Check for failure indicators
    const failureKeywords = [
      'wrong answer',
      'time limit exceeded', 
      'runtime error',
      'memory limit exceeded',
      'output limit exceeded',
      'compilation error'
    ];
    
    for (const element of elements) {
      const text = element.textContent.toLowerCase();
      for (const keyword of failureKeywords) {
        if (text.includes(keyword)) {
          console.log('LeetCode Tracker: Found failure result:', keyword);
          return 'Not Accepted';
        }
      }
    }
    
    // Check for green/red colored elements that might indicate results
    const coloredElements = document.querySelectorAll(
      '.text-green, .text-red, .text-success, .text-danger, .text-error, ' +
      '[class*="success"], [class*="error"], [class*="accepted"], [class*="wrong"]'
    );
    
    for (const element of coloredElements) {
      const text = element.textContent.toLowerCase();
      if (text.includes('accepted') || text.includes('correct')) {
        console.log('LeetCode Tracker: Found colored success element');
        return 'Accepted';
      }
      if (text.includes('wrong') || text.includes('error') || text.includes('failed')) {
        console.log('LeetCode Tracker: Found colored failure element');
        return 'Not Accepted';
      }
    }

    console.log('LeetCode Tracker: Could not detect result, marking as attempted');
    return 'Attempted';
  }

  async saveAttempt(attempt) {
    const BACKEND_URL = await this.getBackendUrl(); // from settings or default
    const endpoint = (BACKEND_URL || 'https://your-backend.example.com').replace(/\/+$/, '') + '/api/extension/submission';
    try {
      // POST attempt to backend for verification & saving
      const payload = {
        // attempt should already contain title, slug, difficulty, timeSpent, result, url, etc.
        attempt,
        source: 'leetcode-extension',
        timestamp: new Date().toISOString()
      };
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit'
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error('LeetCode Tracker: Backend responded with error', resp.status, text);
        // fallback: save locally so user doesn't lose data
        await this._saveLocally(attempt);
        this.showNotification(`Saved locally (backend error)`);
        return;
      }
      const data = await resp.json();
      if (data && data.valid) {
        // Backend confirmed this is a valid OA question and saved it
        this.showPopupMessage('Submission recorded ✅', `Your submission for "${attempt.title}" was verified and recorded.`);
        // Optionally show a small success notification
        this.showNotification(`OA Verified: ${attempt.title}`);
      } else {
        // Not a valid OA question (or backend rejected)
        this.showPopupMessage('Not part of OA ❌', `This problem was not recognized as a valid OA question.`);
        // Optionally save locally for user's review
        await this._saveLocally(attempt);
        this.showNotification(`Saved locally: ${attempt.title}`);
      }
    } catch (error) {
      console.error('LeetCode Tracker: Error posting attempt to backend', error);
      // fallback to local save
      await this._saveLocally(attempt);
      this.showNotification(`Saved locally (network error)`);
    }
  }

  // helper to save locally as a fallback
  async _saveLocally(attempt) {
    try {
      const result = await chrome.storage.local.get(['leetcodeAttempts']);
      const attempts = result.leetcodeAttempts || [];
      attempts.push({
        ...attempt,
        id: this.generateId ? this.generateId() : ('local-'+Date.now()),
        timestamp: new Date().toISOString()
      });
      await chrome.storage.local.set({ leetcodeAttempts: attempts });
      console.log('LeetCode Tracker: Saved attempt locally', attempt);
    } catch (err) {
      console.error('LeetCode Tracker: Failed to save locally', err);
    }
  }

  // helper to read backend URL from storage (user can set in popup settings)
  async getBackendUrl() {
    try {
      const res = await chrome.storage.sync.get(['backendUrl']);
      return res.backendUrl || null;
    } catch (err) {
      return null;
    }
  }

  showNotification(message, color = '#4CAF50') {
    // Remove any existing notification first
    const existing = document.querySelector('.leetcode-tracker-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'leetcode-tracker-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
      word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  }

  resetTracking() {
    this.startTime = null;
    this.isTracking = false;
  }

  observeUrlChanges() {
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        if (url.includes('/problems/')) {
          // New problem loaded, restart tracking
          setTimeout(() => this.init(), 1000);
        }
      }
    }).observe(document, { subtree: true, childList: true });
  }

  createManualButton() {
    // Avoid duplicating the button
    if (document.getElementById('manual-track-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'manual-track-btn';
    btn.textContent = 'Start Tracking';
    btn.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 40px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      cursor: pointer;
      z-index: 999999;
      opacity: 0.9;
      transition: background 0.2s, opacity 0.2s;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.opacity = '1';
      btn.style.background = '#1769aa';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.opacity = '0.9';
      btn.style.background = '#2196F3';
    });
    btn.addEventListener('click', () => {
      this.startTracking();
      this.showNotification('🚀 Tracking started for this problem!', '#2196F3');
    });
    document.body.appendChild(btn);
  }

  showConfirmPopup(attempt) {
    // Remove existing popup if present
    const prev = document.getElementById('leetcode-track-confirm-overlay');
    if (prev) prev.remove();
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'leetcode-track-confirm-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.45);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    // Modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: #fff;
      border-radius: 14px;
      padding: 32px 28px 22px 28px;
      box-shadow: 0 10px 32px rgba(0,0,0,0.25);
      min-width: 320px;
      max-width: 95vw;
      text-align: center;
    `;
    // Build modal content
    modal.innerHTML = `
      <h2 style="margin-bottom: 10px; font-size: 22px; color: #222;">Track Attempt</h2>
      <div style="margin-bottom: 14px;">
        <strong>${attempt.title || 'LeetCode Problem'}</strong>
      </div>
      <div style="margin-bottom: 18px; color: #555;">
        <span style="padding: 3px 10px; border-radius: 8px; background: #f5f5f5; font-size: 13px;">
          Difficulty: <span id="confirm-diff">${attempt.difficulty || 'Unknown'}</span>
        </span>
      </div>
      <div style="margin-bottom: 16px;">
        <label style="font-size: 15px; color: #333; margin-right: 4px;">Time Spent (sec):</label>
        <input type="number" id="confirm-time" min="1" value="${attempt.timeSpent || 0}" style="
          width: 70px; padding: 4px 6px; border-radius: 4px; border: 1px solid #ccc; font-size: 15px; text-align: center;">
      </div>
      <div style="margin-bottom: 18px;">
        <label style="font-size: 15px; color: #333; margin-right: 4px;">Result:</label>
        <select id="confirm-result" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc; font-size: 15px;">
          <option value="Accepted"${attempt.result === 'Accepted' ? ' selected' : ''}>Accepted</option>
          <option value="Not Accepted"${attempt.result === 'Not Accepted' ? ' selected' : ''}>Not Accepted</option>
          <option value="Attempted"${attempt.result === 'Attempted' ? ' selected' : ''}>Attempted</option>
        </select>
      </div>
      <div>
        <button id="confirm-save-btn" style="
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 12px;
        ">Save</button>
        <button id="confirm-cancel-btn" style="
          background: #eee;
          color: #666;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 15px;
          cursor: pointer;
        ">Cancel</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    // Button listeners
    modal.querySelector('#confirm-save-btn').addEventListener('click', () => {
      // Update attempt with edited values
      const timeInput = modal.querySelector('#confirm-time');
      const resultSel = modal.querySelector('#confirm-result');
      let timeVal = parseInt(timeInput.value, 10);
      if (isNaN(timeVal) || timeVal < 0) timeVal = attempt.timeSpent || 0;
      attempt.timeSpent = timeVal;
      attempt.result = resultSel.value;
      this.saveAttempt(attempt);
      this.resetTracking();
      overlay.remove();
    });
    modal.querySelector('#confirm-cancel-btn').addEventListener('click', () => {
      this.resetTracking();
      overlay.remove();
    });
    // Allow closing with Escape key
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.resetTracking();
        overlay.remove();
      }
    });
    setTimeout(() => {
      modal.querySelector('#confirm-time').focus();
      overlay.tabIndex = -1;
      overlay.focus();
    }, 100);
    // Prevent click outside from closing
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        // Optionally: do nothing or cancel
      }
    });
  }
}

// Initialize tracker
const tracker = new LeetCodeTracker();