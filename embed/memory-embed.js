/**
 * Memory Form Embed - Entry Point
 * 
 * This is a lightweight loader that:
 * 1. Sets up global configuration (if available from server)
 * 2. Loads the actual embed bundle
 * 
 * Users add: <script src="/memory-form/memory-embed.js"></script>
 */

(function() {
  'use strict';
  
  // Get the current script to extract base URL
  var currentScript = document.currentScript || 
                     document.querySelector('script[src*="memory-embed.js"]');
  
  function getBaseUrl() {
    if (currentScript && currentScript.src) {
      var url = new URL(currentScript.src);
      return url.origin + url.pathname.replace(/\/memory-embed\.js$/, '');
    }
    return window.location.origin + '/memory-form';
  }
  
  var baseUrl = getBaseUrl();
  
  // Check if collection ID is provided on the script tag
  if (currentScript) {
    var collectionId = currentScript.getAttribute('data-collection-id');
    if (collectionId) {
      window.MEMORY_FORM_COLLECTION_ID = collectionId;
      console.log('✅ Memory Form: Collection ID from script tag:', collectionId);
    }
  }
  
  // Load the actual embed bundle
  var script = document.createElement('script');
  script.src = baseUrl + '/memory-embed-bundle.js';
  script.async = true;
  script.onerror = function() {
    console.error('❌ Failed to load Memory Form embed bundle from:', script.src);
  };
  
  document.head.appendChild(script);
  
  console.log('📦 Memory Form embed loader initialized');
  console.log('   Base URL:', baseUrl);
})();
