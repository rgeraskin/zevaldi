/**
 * Vivaldi Custom UI - Auto-hide Header, Panels and Vertical Tabs
 *
 * This script automatically hides the header, (optionally) side panels, and (optionally) vertical tab bar
 * when you are not interacting with them, providing a cleaner, more immersive browsing experience.
 * The UI elements smoothly slide back into view when you move your mouse to the edges of the window.
 *
 * Features:
 * - Hide/show header on hover
 * - Configurable delays for show/hide transitions
 * - Keyboard-toggleable auto-hide mode for panels and vertical tab bar
 *
 * Limitations:
 * - Support only right panels
 * - Support only left tab bar position
 */
(function checkWebViewForFullscreen() {
  // ========================================
  // Configuration Variables
  // ========================================

  const webView = document.querySelector('#webpage-stack'),
    // Keyboard shortcut combination to toggle panels/vertical-tabs auto-hide mode (e.g., 'Ctrl+C', 'F11', 'Ctrl+Shift+F')
    autoHideToggleHotkey = 'Ctrl+E',

    // Transition time for UI element animations (in seconds)
    transitionTime = 0,

    // Delay in milliseconds before showing UI elements on hover (0 = instant)
    showDelay = 125,

    // Delay in milliseconds before hiding UI elements after leaving hover area (0 = instant)
    hideDelay = 250,

    // If true, side panels will hide/show with the rest of the UI
    shouldHidePanels = true,

    // If true, tab bar will hide/show (currently only works with vertical tabs)
    hideTabs = true;

  // Wait for the webView element to be available in the DOM
  // This ensures Vivaldi's UI is fully loaded before we start modifying it
  if (!webView) {
    setTimeout(checkWebViewForFullscreen, 1337);
    return;
  }

  // ========================================
  // DOM Element References
  // ========================================

  const positions = ['top', 'left', 'right'],
    // Main application container
    app = document.querySelector('#app'),
    // Browser content area
    browser = document.querySelector('#browser'),
    // Header containing tab bar (when tabs are on top)
    header = document.querySelector('#header'),
    // Side panels container (for web panels, bookmarks, etc.)
    panelsContainer = document.querySelector('#panels-container'),
    // Tab bar element's class list for position detection
    tabBarClassList = document.querySelector('#tabs-tabbar-container').classList,
    // Check if panels are positioned on the left side
    panelsLeft = document.querySelector('#panels-container').classList.contains('left'),
    // Detect tab bar position (top, left, or right)
    tabBarPosition = positions.find(cls => tabBarClassList.contains(cls));

  // ========================================
  // State Variables
  // ========================================

  let fullscreenEnabled;

  // ========================================
  // Timeout Management
  // ========================================

  /**
   * Generic timeout management
   */
  const timeouts = {
    showTop: null,
    showPanels: null,
    hideTop: null,
    hidePanels: null
  };

  /**
   * Clears a specific timeout
   * @param {string} name - Name of the timeout to clear
   */
  function clearTimeoutByName(name) {
    if (timeouts[name]) {
      clearTimeout(timeouts[name]);
      timeouts[name] = null;
    }
  }

  // ========================================
  // Hover Div Creation
  // ========================================

  // Create invisible divs at screen edges that trigger show/hide on hover
  // These act as "sensors" to detect when the mouse approaches the edges
  const hoverDivTop = createHorizontalHoverDiv('top'),
    // Create left hover div if panels are on left OR tabs are on left
    hoverDivLeft = (shouldHidePanels && panelsLeft) || tabBarPosition === 'left' ? createVerticalHoverDiv('left') : undefined,
    // Create right hover div if panels are on right OR tabs are on right
    hoverDivRight = (shouldHidePanels && !panelsLeft) || tabBarPosition === 'right' ? createVerticalHoverDiv('right') : undefined;

  // ========================================
  // Initialization
  // ========================================

  // Always enable header auto-hide functionality
  updateHoverDivs();
  addHeaderListener();

  // Load saved auto-hide mode preference from Chrome storage for panels/tabs
  chrome.storage.local.get('fullScreenModEnabled').then((value) => {
    // Enable by default if no preference is stored
    fullscreenEnabled = value.fullScreenModEnabled || value.fullScreenModEnabled == undefined;
    if (fullscreenEnabled) {
      addPanelsListener();
    }
  });

  // Register keyboard shortcut to toggle auto-hide mode for panels/tabs
  vivaldi.tabsPrivate.onKeyboardShortcut.addListener((id, combination) => combination === autoHideToggleHotkey && id === vivaldiWindowId && toggleFullScreen());

  // ========================================
  // Dynamic CSS Generation
  // ========================================

  // Build the CSS rules dynamically based on current UI configuration
  let style = `
        .header-listener-enabled {
            ${generalCSS()}
            ${topCSS()}
        }

        .panels-listener-enabled {
            ${leftCSS()}
            ${rightCSS()}
        }

        #app:not(.panels-listener-enabled) .hover-div.left,
        #app:not(.panels-listener-enabled) .hover-div.right {
            visibility: hidden;
        }
    `;

  // Inject the generated styles into the document head
  const styleEl = document.createElement('style');
  styleEl.appendChild(document.createTextNode(style));

  document.head.appendChild(styleEl);

  // ========================================
  // Panels/Tabs Auto-hide Control Functions
  // ========================================

  /**
   * Toggles the panels/vertical-tabs auto-hide mode on/off
   * Saves the preference to Chrome storage for persistence
   */
  function toggleFullScreen() {
    fullscreenEnabled = !fullscreenEnabled;
    fullscreenEnabled ? addPanelsListener() : removePanelsListener();
    chrome.storage.local.set({ fullScreenModEnabled: fullscreenEnabled });
  }

  /**
   * Activates header auto-hide (always enabled)
   */
  function addHeaderListener() {
    app.classList.add('header-listener-enabled');

    // Hide header when mouse enters the main webview area
    webView.addEventListener('pointerenter', () => {
      hideTop();
    });

    // Show top UI when hovering over top edge
    // Note: showTop() will automatically clear any pending hide timeout
    hoverDivTop.addEventListener('pointerenter', () => {
      showTop();
    });

    // Update hover div sizes dynamically when window is resized
    addEventListener('resize', updateHoverDivs);

    // Initially hide header
    hideTop();
  }

  /**
   * Activates panels/tabs auto-hide (controlled by fullscreen toggle)
   */
  function addPanelsListener() {
    app.classList.add('panels-listener-enabled');

    // Hide panels when mouse enters the main webview area
    webView.addEventListener('pointerenter', () => {
      hidePanels();
    });

    // Setup hover div listeners for each side (show only)
    // Note: show functions will automatically clear any pending hide timeouts
    if (hoverDivLeft) {
      hoverDivLeft.addEventListener('pointerenter', () => {
        showLeft();
      });
    }

    if (hoverDivRight) {
      hoverDivRight.addEventListener('pointerenter', () => {
        showRight();
      });
    }

    // Initially hide panels/tabs
    hidePanels();
  }

  /**
   * Deactivates panels/tabs auto-hide
   */
  function removePanelsListener() {
    app.classList.remove('panels-listener-enabled');

    webView.removeEventListener('pointerenter', hidePanels);

    // Remove hover div listeners
    if (hoverDivLeft) {
      hoverDivLeft.removeEventListener('pointerenter', showLeft);
    }

    if (hoverDivRight) {
      hoverDivRight.removeEventListener('pointerenter', showRight);
    }

    // Show panels/tabs when disabling
    showPanels();
  }

  // ========================================
  // Show/Hide Functions
  // ========================================

  /**
   * Generic function to hide UI elements by adding a CSS class
   * @param {string} timeoutName - Name of the timeout to store
   * @param {Function} addClassFn - Function to add the hidden class
   */
  function hideElement(showTimeoutName, hideTimeoutName, addClassFn) {
    clearTimeoutByName(showTimeoutName);
    clearTimeoutByName(hideTimeoutName);
    timeouts[hideTimeoutName] = setTimeout(() => {
      addClassFn();
    }, hideDelay);
  }

  /**
   * Generic function to show UI elements by removing a CSS class
   * @param {string} showTimeoutName - Name of the show timeout to store
   * @param {string} hideTimeoutName - Name of the hide timeout to clear
   * @param {Function} removeClassFn - Function to remove the hidden class
   */
  function showElement(showTimeoutName, hideTimeoutName, removeClassFn) {
    clearTimeoutByName(showTimeoutName);
    clearTimeoutByName(hideTimeoutName);
    timeouts[showTimeoutName] = setTimeout(() => {
      removeClassFn();
    }, showDelay);
  }

  /**
   * Hides the top header after the configured delay
   */
  function hideTop() {
    hideElement('showTop', 'hideTop', () => {
      app.classList.add('hidden-top');
    });
  }

  /**
   * Hides panels and side tabs after the configured delay
   */
  function hidePanels() {
    hideElement('showPanels', 'hidePanels', () => {
      if (hoverDivLeft) {
        app.classList.add('hidden-left');
      }
      if (hoverDivRight) {
        app.classList.add('hidden-right');
      }
    });
  }

  /**
   * Shows panels and side tabs
   */
  function showPanels() {
    showLeft();
    showRight();
  }

  /**
   * Shows the top UI elements (header)
   * Removes the 'hidden-top' class after the configured delay
   */
  function showTop() {
    showElement('showTop', 'hideTop', () => {
      app.classList.remove('hidden-top');
    });
  }

  /**
   * Shows the left UI elements (panels or tabs if positioned left)
   * Removes the 'hidden-left' class after the configured delay
   */
  function showLeft() {
    if (hoverDivLeft) {
      showElement('showPanels', 'hidePanels', () => {
        app.classList.remove('hidden-left');
      });
    }
  }

  /**
   * Shows the right UI elements (panels or tabs if positioned right)
   * Removes the 'hidden-right' class after the configured delay
   */
  function showRight() {
    if (hoverDivRight) {
      showElement('showPanels', 'hidePanels', () => {
        app.classList.remove('hidden-right');
      });
    }
  }

  // ========================================
  // Hover Div Sizing Functions
  // ========================================

  /**
   * Sets the height of a horizontal hover div
   * @param {HTMLElement} hoverDiv - The hover div element to resize
   */
  function setHorizontalHoverDivHeight(hoverDiv) {
    hoverDiv.style.height = '0.8rem';
  }

  /**
   * Sets the width of a vertical hover div
   * @param {HTMLElement} hoverDiv - The hover div element to resize
   */
  function setVerticalHoverDivWidth(hoverDiv) {
    hoverDiv.style.width = '10px';
  }

  /**
   * Updates all hover div sizes
   * Called on window resize to adjust hover div dimensions
   * Uses a delay to ensure browser has finished resizing
   */
  function updateHoverDivs() {
    setTimeout(() => {
      setHorizontalHoverDivHeight(hoverDivTop);
      if (hoverDivLeft) setVerticalHoverDivWidth(hoverDivLeft);
      if (hoverDivRight) setVerticalHoverDivWidth(hoverDivRight);
    }, 150);
  }

  /**
   * Creates an invisible hover div at a specified position
   * This div acts as a trigger zone for showing/hiding UI elements
   * @param {string} position - 'top', 'left', or 'right'
   * @param {boolean} isHorizontal - True for horizontal (top), false for vertical (left/right)
   * @returns {HTMLElement} The created hover div element
   */
  function createHoverDiv(position, isHorizontal) {
    const hoverDiv = document.createElement('div');
    hoverDiv.className = 'hover-div';
    hoverDiv.classList.add(position);
    hoverDiv.style.position = 'fixed';
    hoverDiv.style.zIndex = '10';
    hoverDiv.style[position] = '0';

    if (isHorizontal) {
      hoverDiv.style.height = '1.5rem';
      hoverDiv.style.width = '100vw';
      hoverDiv.style.left = '0';
    } else {
      hoverDiv.style.height = '100%';
      hoverDiv.style.width = '1px';
      hoverDiv.style.top = '0';
    }

    document.querySelector('#app').appendChild(hoverDiv);
    return hoverDiv;
  }

  /**
   * Creates an invisible horizontal hover div at the top edge
   * @param {string} position - 'top'
   * @returns {HTMLElement} The created hover div element
   */
  function createHorizontalHoverDiv(position) {
    return createHoverDiv(position, true);
  }

  /**
   * Creates an invisible vertical hover div at the left or right edge
   * @param {string} position - Either 'left' or 'right'
   * @returns {HTMLElement} The created hover div element
   */
  function createVerticalHoverDiv(position) {
    return createHoverDiv(position, false);
  }

  // ========================================
  // CSS Generation Functions
  // ========================================

  /**
   * Generates general CSS rules for the auto-hide UI mode
   * Sets up transitions, positioning, and z-index for UI elements
   * @returns {string} CSS rules as a string
   */
  function generalCSS() {
    let css = `
            #header, .mainbar, .bookmark-bar, #panels-container {
                transition: transform ${transitionTime}s, opacity ${transitionTime}s ease-in-out !important;
            }

            #header, .mainbar {
                z-index: 8;
            }

            .mainbar {
                position: absolute;
                width: 100%;
            }

            #header .vivaldi {
                margin-top: 3px;
            }

            #header {
                min-height: 27px !important;
            }

            #main {
                padding-top: 0 !important;
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;

                .inner {
                    position: unset;
                }
            }

            .extensionIconPopupMenu, .button-popup {
                z-index: 8;
            }

            footer {
                margin-top: auto !important;
            }

            .hover-div {
                transition: visibility ${transitionTime}s ease-in-out;
            }
        `;

    // Make panels absolutely positioned if hiding is enabled
    if (shouldHidePanels) {
      css += `
            #panels-container {
                position: absolute !important;
            }
            `;
    }

    return css;
  }

  /**
   * Generates CSS rules for hiding/showing top UI elements
   * Handles header positioning and transforms
   * @returns {string} CSS rules as a string
   */
  function topCSS() {
    let height = getHeight(header);

    // Create CSS to translate the header up by its height when hidden
    let css = `
            &.hidden-top {
                #header {
                    transform: translateY(-${height}px);
                    opacity: 0;
                }
            }

            &:not(.hidden-top) .hover-div.top {
                visibility: hidden;
            }
        `;

    return css;
  }

  /**
   * Generates CSS rules for hiding/showing side UI elements (left or right)
   * Handles side-positioned tabs and panels
   * @param {string} side - Either 'left' or 'right'
   * @returns {string} CSS rules as a string
   */
  function sideCSS(side) {
    const isLeft = side === 'left';
    const sideElements = [];
    let width = 0;
    let tabbarWrapper;

    // Calculate total width of side elements
    if (hideTabs && tabBarPosition === side) {
      sideElements.push('.tabbar-wrapper');
      tabbarWrapper = document.querySelector('.tabbar-wrapper');
      width += tabbarWrapper.offsetWidth;
    }

    if (shouldHidePanels && (isLeft === panelsLeft)) {
      sideElements.push('#panels-container');
      width += panelsContainer.offsetWidth;
    }

    if (sideElements.length === 0) {
      return '';
    }

    // Create CSS to translate elements when hidden
    const translateDirection = isLeft ? '-' : '';
    let css = `
            &.hidden-${side} {
                ${sideElements.join(', ')} {
                    transform: translate${isLeft ? 'X' : 'X'}(${translateDirection}${width}px);
                    opacity: 0;
                }
            }

            &:not(.hidden-${side}) .hover-div.${side} {
                visibility: hidden;
            }
        `;

    // Position tab bar absolutely when on the side
    if (tabBarPosition === side) {
      const offset = (isLeft && panelsLeft) || (!isLeft && !panelsLeft) ? panelsContainer.offsetWidth : 0;
      css += `
                .tabbar-wrapper {
                    position: absolute;
                    top: 0;
                    ${side}: ${offset}px;
                    z-index: 1;
                    transition: transform ${transitionTime}s, opacity ${transitionTime}s ease-in-out !important;

                    &  > .tabbar-wrapper {
                        position: static;
                    }
                }
            `;
    }

    return css;
  }

  /**
   * Generates CSS rules for hiding/showing left UI elements
   * Handles left-positioned tabs and panels
   * @returns {string} CSS rules as a string
   */
  function leftCSS() {
    return sideCSS('left');
  }

  /**
   * Generates CSS rules for hiding/showing right UI elements
   * Handles right-positioned tabs and panels
   * @returns {string} CSS rules as a string
   */
  function rightCSS() {
    return sideCSS('right');
  }

  /**
   * Gets the height of an element, safely handling null/undefined
   * @param {HTMLElement|null|undefined} el - The element to measure
   * @returns {number} The element's height in pixels, or 0 if element doesn't exist
   */
  function getHeight(el) {
    return el?.offsetHeight || 0;
  }
})();
