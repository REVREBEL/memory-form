/**
 * Memory Form Button Wrapper - Embed Bundle
 * 
 * Uses your actual Webflow Memory Form Button component
 * Auto-initializes on:
 * - Elements with id="memory-button-container"
 * - Elements with [data-memory-button] attribute
 * 
 * Collection ID is read from multiple sources in priority order.
 * Base URL is auto-detected from the script location.
 */

import { mountMemoryFormButtonWrapper } from './MemoryFormButtonWrapper';

// Export for manual initialization
export { mountMemoryFormButtonWrapper };

// Variant type for validation
type ButtonVariant = 
  | "Warm Sandston"
  | "Warm Sandston Outline" 
  | "Slate Navy"
  | "Slate Navy Outline"
  | "Ocean Teal"
  | "Ocean Teal Outline"
  | "Rustwood Red"
  | "Rustwood Outline";

/**
 * Auto-detect base URL from script location
 */
function getBaseUrl(): string {
  const script = document.querySelector('script[src*="memory-embed.js"]') as HTMLScriptElement;
  if (script?.src) {
    const url = new URL(script.src);
    const baseUrl = url.origin + url.pathname.replace(/\/memory-embed\.js$/, '');
    console.log('✅ Base URL auto-detected:', baseUrl);
    return baseUrl;
  }

  const fallbackUrl = window.location.origin + '/memory-form';
  console.warn('⚠️ Could not auto-detect base URL, using fallback:', fallbackUrl);
  return fallbackUrl;
}

/**
 * Get collection ID from multiple sources (in priority order):
 * 1. data-collection-id on script tag
 * 2. Window global variable
 * 3. Meta tag (set by server from MEMORY_JOURNAL_COLLECTION_ID)
 * 4. Hardcoded fallback for Memory Journal collection
 */
function getCollectionId(): string | null {
  // 1. Check script tag data attribute
  const script = document.querySelector('script[src*="memory-embed.js"]') as HTMLScriptElement;
  if (script) {
    const dataCollectionId = script.getAttribute('data-collection-id');
    if (dataCollectionId) {
      console.log('✅ Collection ID from script tag:', dataCollectionId);
      return dataCollectionId;
    }
  }

  // 2. Check window global variable
  if ((window as any).MEMORY_FORM_COLLECTION_ID) {
    console.log('✅ Collection ID from window global:', (window as any).MEMORY_FORM_COLLECTION_ID);
    return (window as any).MEMORY_FORM_COLLECTION_ID;
  }

  // 3. Check meta tag (preferred when on app page)
  const metaTag = document.querySelector('meta[name="memory-form:collection-id"]');
  if (metaTag) {
    const collectionId = metaTag.getAttribute('content');
    if (collectionId) {
      console.log('✅ Collection ID from meta tag:', collectionId);
      return collectionId;
    }
  }

  // 4. Hardcoded fallback for Memory Journal collection
  const fallbackId = '693a599cb78b2b97a36ef963';
  console.log('✅ Using default Memory Journal collection ID:', fallbackId);
  return fallbackId;
}

/**
 * Find all memory form button containers using multiple selectors
 */
function findMemoryButtons(): NodeListOf<Element> {
  // Primary selector: #memory-button-container
  // Fallback: [data-memory-button]
  const selectors = [
    '#memory-button-container',
    '[data-memory-button]'
  ];
  
  const selector = selectors.join(', ');
  return document.querySelectorAll(selector);
}

// Auto-initialize any memory form button elements on page load
if (typeof window !== 'undefined') {
  function initMemoryButtons() {
    const elements = findMemoryButtons();
    
    // Get base URL and collection ID
    const baseUrl = getBaseUrl();
    const collectionId = getCollectionId();
    
    if (!collectionId) {
      console.error('❌ Cannot initialize Memory Form: Collection ID not found');
      return;
    }
    
    console.log('🎯 Memory Form Configuration:');
    console.log('   Base URL:', baseUrl);
    console.log('   Collection ID:', collectionId);
    console.log('   Buttons found:', elements.length);
    
    if (elements.length === 0) {
      console.warn('⚠️ No memory form buttons found on page.');
      console.warn('   Looking for: #memory-button-container or [data-memory-button]');
      console.warn('   Add a <div id="memory-button-container"></div> to your page');
    }
    
    elements.forEach((element, index) => {
      // Skip if already initialized
      if (element.hasAttribute('data-memory-button-initialized')) {
        return;
      }
      
      // Mark as initialized
      element.setAttribute('data-memory-button-initialized', 'true');
      
      // Parse variant
      const variantAttr = element.getAttribute('data-button-variant') || 'Slate Navy';
      
      const props = {
        buttonText: element.getAttribute('data-button-text') || 'Post a Memory',
        variant: variantAttr as ButtonVariant,
        collectionId: collectionId,
        itemId: element.getAttribute('data-item-id') || undefined
      };
      
      console.log(`🔧 Initializing Memory Form Button #${index + 1}:`, props.buttonText);
      
      // Mount the component
      try {
        element.setAttribute('data-base-url', baseUrl);
        element.setAttribute('data-collection-id', collectionId);
        
        mountMemoryFormButtonWrapper(element as HTMLElement, props);
        console.log(`✅ Memory Form Button #${index + 1} mounted successfully`);
      } catch (error) {
        console.error(`❌ Failed to mount Memory Form Button #${index + 1}:`, error);
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
            if (node.id === 'memory-button-container' ||
                node.hasAttribute('data-memory-button') || 
                node.querySelector('#memory-button-container, [data-memory-button]')) {
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
  (window as any).mountMemoryFormButtonWrapper = mountMemoryFormButtonWrapper;
  (window as any).MEMORY_FORM_VERSION = '1.0.0';
  
  console.log('✅ Memory Form embed initialized and watching for buttons');
}

export default mountMemoryFormButtonWrapper;
