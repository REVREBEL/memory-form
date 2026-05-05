/**
 * Memory Form Button - Webflow Embed Bundle
 * 
 * This file creates a standalone bundle that can be loaded in Webflow
 * to automatically initialize Memory Form buttons.
 */

import { mountMemoryFormButtonTrigger } from '../components/extensions/memory-button-trigger';

// Export for manual initialization
export { mountMemoryFormButtonTrigger };

// Auto-initialize any [data-memory-button] elements on page load
if (typeof window !== 'undefined') {
  function initMemoryButtons() {
    const elements = document.querySelectorAll('[data-memory-button]');
    
    elements.forEach((element) => {
      // Skip if already initialized
      if (element.hasAttribute('data-memory-button-initialized')) {
        return;
      }
      
      // Mark as initialized
      element.setAttribute('data-memory-button-initialized', 'true');
      
      // Parse props from data attributes
      const props = {
        buttonText: element.getAttribute('data-button-text') || 'Share a Memory',
        buttonStyle: (element.getAttribute('data-button-style') || 'primary') as any,
        showIcon: element.getAttribute('data-show-icon') !== 'false',
        itemId: element.getAttribute('data-item-id') || undefined
      };
      
      // Mount the component
      try {
        mountMemoryFormButtonTrigger(element as HTMLElement, props);
      } catch (error) {
        console.error('Failed to mount Memory Form Button:', error);
      }
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMemoryButtons);
  } else {
    initMemoryButtons();
  }
  
  // Re-initialize on dynamic content changes (e.g., Webflow interactions)
  const observer = new MutationObserver((mutations) => {
    let shouldInit = false;
    
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute('data-memory-button') || 
                node.querySelector('[data-memory-button]')) {
              shouldInit = true;
            }
          }
        });
      }
    });
    
    if (shouldInit) {
      initMemoryButtons();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Make mount function available globally for manual use
  (window as any).mountMemoryFormButtonTrigger = mountMemoryFormButtonTrigger;
}

export default mountMemoryFormButtonTrigger;
