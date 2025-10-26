// Force reload script to bypass all caches
(function() {
  'use strict';
  
  const version = 'v3-' + Date.now();
  console.log('🔄 Force reloading SpeakLife version:', version);
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(names) {
      names.forEach(function(name) {
        caches.delete(name);
      });
    });
  }
  
  // Force reload with timestamp
  const url = new URL(window.location);
  url.searchParams.set('v', version);
  url.searchParams.set('t', Date.now());
  
  if (url.href !== window.location.href) {
    console.log('🔄 Redirecting to:', url.href);
    window.location.href = url.href;
  }
})();
