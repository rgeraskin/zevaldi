// ========================================
// Copy URL to Clipboard Function
// ========================================
(function setupCopyUrlShortcut() {
  const copyUrlHotkey = 'Shift+Meta+C';

  // Check if required APIs are available
  if (typeof vivaldi === 'undefined' || typeof chrome === 'undefined' || !chrome.tabs) {
    return;
  }

  /**
   * Shows a notification in the top right corner
   * @param {string} message - The message to display
   * @param {number} duration - Duration in milliseconds to show the notification
   */
  function showNotification(message, duration = 2000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4CAF50;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      pointer-events: none;
    `;

    // Add to document
    document.body.appendChild(notification);

    // Fade in
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
    });

    // Fade out and remove
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, duration);
  }

  /**
   * Copies the current tab's URL to clipboard
   */
  function copyCurrentUrl() {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const currentUrl = tabs[0].url;

        // Use execCommand method (more reliable in Vivaldi UI context)
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            showNotification('URL copied to clipboard!');
          } else {
            showNotification('Failed to copy URL', 2000);
          }
        } catch (err) {
          showNotification('Failed to copy URL', 2000);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    });
  }

  // Register keyboard shortcut
  if (vivaldi.tabsPrivate && vivaldi.tabsPrivate.onKeyboardShortcut) {
    vivaldi.tabsPrivate.onKeyboardShortcut.addListener((id, combination) => {
      if (combination === copyUrlHotkey) {
        copyCurrentUrl();
      }
    });
  }
})();

