'use strict';
(function () {
  function syncDemoBanner() {
    var banner = document.getElementById('demoBanner');
    if (!banner) return;
    try {
      var isDemo = (typeof VaultProfiles !== 'undefined' && VaultProfiles.isDemo()) ||
                   new URLSearchParams(location.search).get('demo') === '1' ||
                   localStorage.getItem('vo_active_profile') === 'demo';
      if (isDemo) {
        banner.hidden = false;
        document.body.classList.add('demo-banner-active');
        document.documentElement.style.setProperty('--demo-banner-h', banner.offsetHeight + 'px');
      } else {
        banner.hidden = true;
        document.body.classList.remove('demo-banner-active');
        document.documentElement.style.removeProperty('--demo-banner-h');
      }
    } catch (e) {}
  }
  function scheduleSync() { setTimeout(syncDemoBanner, 0); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(syncDemoBanner, 600); });
  } else {
    setTimeout(syncDemoBanner, 600);
  }
  window.addEventListener('resize', scheduleSync);
  document.addEventListener('vault-unlocked', scheduleSync);
  if (typeof VC !== 'undefined') VC.refreshShellIcons();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw-v51.js?v=5.2.1').catch(function () {});
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.CapricornMotion) CapricornMotion.init();
    if (typeof window.enhanceFoundationSwitches === 'function') window.enhanceFoundationSwitches(document);
  });
})();
