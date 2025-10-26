// Force reload script to bypass all caches - v4
(function() {
  'use strict';
  
  const version = 'v4-' + Date.now();
  console.log('🔄 FORCE RELOADING SpeakLife version:', version);
  
  // Clear all caches immediately
  if ('caches' in window) {
    caches.keys().then(function(names) {
      console.log('🗑️ Clearing caches:', names);
      names.forEach(function(name) {
        caches.delete(name);
      });
    });
  }
  
  // Force reload with multiple parameters
  const url = new URL(window.location);
  url.searchParams.set('v', version);
  url.searchParams.set('t', Date.now());
  url.searchParams.set('cb', Math.random().toString(36).substr(2, 9));
  
  console.log('🔄 Current URL:', window.location.href);
  console.log('🔄 New URL:', url.href);
  
  // Always redirect to force fresh load
  if (url.href !== window.location.href) {
    console.log('🔄 REDIRECTING to:', url.href);
    window.location.replace(url.href);
  } else {
    // Force reload even if URL is the same
    console.log('🔄 FORCING RELOAD');
    window.location.reload(true);
  }
})();
