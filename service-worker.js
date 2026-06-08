const CACHE_NAME = 'dnd-combatsheet-v3.1.5-cache-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './css/main.css',
  './css/layout.css',
  './css/combatants.css',
  './css/popups.css',
  './css/player.css',
  './css/intro.css',
  './js/peerjs.min.js',
  './js/rules.js',
  './js/spells.js',
  './js/state.js',
  './js/app.js',
  './js/models/Stat.js',
  './js/models/Weapon.js',
  './js/models/Combatant.js',
  './js/models/model-core.js',
  './js/network/NetworkManager.js',
  './js/network/SyncProtocol.js',
  './js/network/DeltaRenderer.js',
  './js/network/MessageQueue.js',
  './js/network/ConnectionMonitor.js',
  './js/ui/ui-shared.js',
  './js/ui/ui-core.js',
  './js/ui/components/dialogs.js',
  './js/ui/components/init-bar.js',
  './js/ui/components/dm-screen.js',
  './js/ui/components/player-sheet.js',
  './js/ui/components/CompanionSheet.js',
  './js/ui/components/FamiliarSheet.js',
  './js/ui/components/player/PCUtils.js',
  './js/ui/components/player/PCHeader.js',
  './js/ui/components/player/PCAttributes.js',
  './js/ui/components/player/PCDefenses.js',
  './js/ui/components/player/PCOffense.js',
  './js/ui/components/player/PCResources.js',
  './js/ui/components/player/PCSpellbookTab.js',
  './js/ui/components/player/PCCompendiumTab.js',
  './js/ui/components/player/PCSpellDialogs.js',
  './js/ui/components/player/PCFeatsTab.js',
  './js/ui/components/player/PCHealthGlobe.js',
  './js/ui/dialogs/BaseDialogs.js',
  './js/ui/dialogs/AttackChoiceDialog.js',
  './js/ui/dialogs/PrepareSpellDialog.js',
  './js/ui/dialogs/SessionDialog.js',
  './js/ui/dialogs/SpellScrollDialog.js',
  './js/ui/dialogs/FeatScrollDialog.js',
  './js/ui/components/class-features/ClassFeatureComponent.js',
  './js/ui/components/class-features/GeneralFeatures.js',
  './js/ui/components/class-features/BarbarianFeatures.js',
  './js/ui/components/class-features/BardFeatures.js',
  './js/ui/components/class-features/PaladinFeatures.js',
  './js/ui/components/class-features/ClericFeatures.js',
  './js/ui/components/class-features/MonkFeatures.js',
  './js/ui/components/class-features/RogueFeatures.js',
  './js/ui/components/class-features/DruidFeatures.js',
  './js/ui/components/class-features/RangerFeatures.js',
  './js/ui/components/class-features/WizardFeatures.js',
  './js/ui/components/class-features/SorcererFeatures.js',
  './js/rules/classes/BarbarianRules.js',
  './js/rules/classes/PaladinRules.js',
  './js/rules/classes/ClericRules.js',
  './js/rules/classes/BardRules.js',
  './js/rules/classes/DruidRules.js',
  './js/rules/classes/MonkRules.js',
  './js/rules/classes/WizardRules.js',
  './js/rules/classes/SorcererRules.js',
  './js/rules/classes/RangerRules.js',
  './js/rules/classes/RogueRules.js',
  './js/rules/classes/FighterRules.js',
  './js/rules/BABCalculator.js',
  './js/rules/SaveCalculator.js',
  './js/rules/SpellSlotCalculator.js',
  './js/data/feats-data.js',
  './js/data/skills-data.js',
  './js/rules/AttackEngine.js',
  './js/state/state-core.js',
  './js/state/StorageManager.js',
  './js/state/PCManager.js',
  './js/state/EncounterManager.js'
];


// Install event - caching assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching all modular assets for offline capability');
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Asset caching warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - cleaning old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network-First (Network falling back to cache)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(networkResponse => {
      // If network response is valid and successful, cache it and return
      if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.url.includes('googleapis.com') || networkResponse.url.includes('gstatic.com'))) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      // If network fails (e.g. offline), fall back to cache
      return caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        console.log('Fetch failed and no cache found, offline mode active.');
      });
    })
  );
});
