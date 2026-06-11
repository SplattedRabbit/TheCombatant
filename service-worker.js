const CACHE_NAME = 'dnd-combatsheet-v3.3.1-cache-v1';
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
  './js/models/Armor.js',
  './js/models/Combatant.js',
  './js/models/helpers/skills/SkillBaseCalculator.js',
  './js/models/helpers/skills/SkillSynergyResolver.js',
  './js/models/helpers/skills/SkillFeatApplier.js',
  './js/models/helpers/skills/CombatantSkills.js',
  './js/models/helpers/spells/SpellFinder.js',
  './js/models/helpers/spells/SpellPreparation.js',
  './js/models/helpers/spells/SpellTemplateApplier.js',
  './js/models/helpers/spells/CombatantSpells.js',
  './js/models/helpers/classes/DruidHelper.js',
  './js/models/helpers/classes/BarbarianHelper.js',
  './js/models/helpers/classes/MonkHelper.js',
  './js/models/helpers/classes/RangerHelper.js',
  './js/models/helpers/classes/RogueHelper.js',
  './js/models/helpers/classes/CombatantClassFeatures.js',
  './js/models/helpers/modifiers/ItemModifierApplier.js',
  './js/models/helpers/modifiers/BaseSavingThrowModifierApplier.js',
  './js/models/helpers/modifiers/SpellModifierApplier.js',
  './js/models/helpers/modifiers/ClassModifierApplier.js',
  './js/models/helpers/modifiers/FeatModifierApplier.js',
  './js/models/helpers/modifiers/SpeedRecalculator.js',
  './js/models/helpers/modifiers/CombatantModifiers.js',
  './js/models/Item.js',
  './js/models/model-core.js',
  './js/data/armor-data.js',
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
  './js/ui/components/player/offense/PCOffenseHelper.js',
  './js/ui/components/player/offense/NaturalAttacksRenderer.js',
  './js/ui/components/player/offense/CombatSettingsRenderer.js',
  './js/ui/components/player/offense/EquipmentSlotsRenderer.js',
  './js/ui/components/player/offense/WeaponStashCard.js',
  './js/ui/components/player/offense/ArmorStashCard.js',
  './js/ui/components/player/offense/InventoryStashRenderer.js',
  './js/ui/components/player/PCMagicItemsTab.js',
  './js/ui/components/player/ClassFeaturesRegistry.js',
  './js/ui/components/player/PCSpellsTab.js',
  './js/ui/components/player/PCFeaturesTab.js',
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
  './js/ui/components/class-features/FighterFeatures.js',
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
  './js/rules/attack/AttackContext.js',
  './js/rules/attack/BaseAttackCalculator.js',
  './js/rules/attack/ModifierCalculator.js',
  './js/rules/attack/DamageFormulaBuilder.js',
  './js/rules/attack/SequenceBuilder.js',
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
