// popup.js - Extension popup logic
class PopupController {
  constructor() {
    this.attempts = [];
    this.init();
  }

  async init() {
    await this.loadAttempts();
    await this.loadSettings();
    this.updateStats();
    this.renderAttempts();
    this.attachEventListeners();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['autoStartTracking']);
      const autoTrack = result.autoStartTracking || false;
      
      const checkbox = document.getElementById('auto-track-checkbox');
      if (checkbox) {
        checkbox.checked = autoTrack;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async loadAttempts() {
    try {
      const result = await chrome.storage.local.get(['leetcodeAttempts']);
      this.attempts = result.leetcodeAttempts || [];
      
      // Sort by most recent first
      this.attempts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Error loading attempts:', error);
      this.attempts = [];
    }
  }

  updateStats() {
    const totalAttempts = this.attempts.length;
    const acceptedCount = this.attempts.filter(a => a.result === 'Accepted').length;

    // Compute how many attempts are solved today
    const today = new Date();
    const todaySolved = this.attempts.filter(a => {
      if (a.result === 'Accepted' || a.result === 'Solved') {
        const attemptDate = new Date(a.timestamp);
        return attemptDate.getFullYear() === today.getFullYear() &&
               attemptDate.getMonth() === today.getMonth() &&
               attemptDate.getDate() === today.getDate();
      }
      return false;
    }).length;
    
    document.getElementById('total-attempts').textContent = totalAttempts;
    document.getElementById('accepted-count').textContent = acceptedCount;
    document.getElementById('today-solved-count').textContent = todaySolved;
  }

  renderAttempts() {
    const container = document.getElementById('attempts-list');
    
    if (this.attempts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <p>No attempts tracked yet!</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Visit a LeetCode problem page to start tracking.
          </p>
        </div>
      `;
      return;
    }

    // Show recent attempts (limit to 10 for performance)
    const recentAttempts = this.attempts.slice(0, 10);
    
    container.innerHTML = recentAttempts.map(attempt => `
      <div class="attempt-item">
        <div class="attempt-title">${this.escapeHtml(attempt.title)}</div>
        <div class="attempt-meta">
          <div>
            <span class="difficulty ${attempt.difficulty.toLowerCase()}">${attempt.difficulty}</span>
            <span class="result ${attempt.result.toLowerCase().replace(/\s+/g, '-')}">${attempt.result}</span>
          </div>
          <div class="time-spent">${this.formatTime(attempt.timeSpent)}</div>
        </div>
        ${attempt.tags && attempt.tags.length > 0 ? `
          <div class="tags">
            ${attempt.tags.slice(0, 3).map(tag => 
              `<span class="tag">${this.escapeHtml(tag)}</span>`
            ).join('')}
            ${attempt.tags.length > 3 ? `<span class="tag">+${attempt.tags.length - 3}</span>` : ''}
          </div>
        ` : ''}
        <div style="font-size: 11px; color: #999; margin-top: 5px;">
          ${this.formatDate(attempt.timestamp)}
        </div>
      </div>
    `).join('');

    if (this.attempts.length > 10) {
      container.innerHTML += `
        <div style="text-align: center; padding: 15px; color: #666; font-size: 12px;">
          Showing 10 most recent attempts (${this.attempts.length} total)
        </div>
      `;
    }
  }

  attachEventListeners() {
    // Download button
    document.getElementById('download-btn').addEventListener('click', () => {
      this.downloadData();
    });

    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.toggleSettings();
    });

    // Save settings button
    document.getElementById('save-settings-btn').addEventListener('click', () => {
      this.saveSettings();
    });

    // Clear data button
    document.getElementById('clear-btn').addEventListener('click', () => {
      this.clearData();
    });
  }

  toggleSettings() {
    const panel = document.getElementById('settings-panel');
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    
    // Change button text
    const btn = document.getElementById('settings-btn');
    btn.textContent = isVisible ? '⚙️ Settings' : '✕ Close';
  }

  async saveSettings() {
    try {
      const autoTrack = document.getElementById('auto-track-checkbox').checked;
      
      await chrome.storage.local.set({ 
        autoStartTracking: autoTrack,
        trackingPermissionAsked: true  // Mark as configured
      });
      
      this.showToast('Settings saved! ' + (autoTrack ? 'Auto-tracking enabled.' : 'Auto-tracking disabled.'));
      
      // Hide settings panel
      document.getElementById('settings-panel').style.display = 'none';
      document.getElementById('settings-btn').textContent = '⚙️ Settings';
      
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showToast('Error saving settings. Please try again.');
    }
  }

  downloadData() {
    if (this.attempts.length === 0) {
      alert('No data to download!');
      return;
    }

    // Prepare data for export
    const exportData = {
      exportDate: new Date().toISOString(),
      totalAttempts: this.attempts.length,
      attempts: this.attempts
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leetcode-attempts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show feedback
    this.showToast('Data downloaded successfully!');
  }

  async clearData() {
    if (this.attempts.length === 0) {
      alert('No data to clear!');
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete all ${this.attempts.length} tracked attempts? This cannot be undone.`);
    
    if (confirmed) {
      try {
        await chrome.storage.local.remove(['leetcodeAttempts']);
        this.attempts = [];
        this.updateStats();
        this.renderAttempts();
        this.showToast('All data cleared successfully!');
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data. Please try again.');
      }
    }
  }

  showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 10000;
      font-size: 13px;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 2000);
  }

  formatTime(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});