// Simulate browser environment
global.window = global;
global.localStorage = {
  getItem: () => null,
  setItem: () => null
};
global.document = {
  addEventListener: () => null,
  getElementById: () => ({ onchange: null, onclick: null, oninput: null, querySelectorAll: () => [], querySelector: () => null, appendChild: () => null }),
  querySelector: () => ({ onchange: null, onclick: null, oninput: null, style: {} }),
  createElement: () => ({ onchange: null, onclick: null, oninput: null, style: {} })
};
Object.defineProperty(global, 'navigator', {
  value: {
    serviceWorker: { register: () => Promise.resolve() }
  },
  configurable: true,
  writable: true
});

// PeerJS mockup
global.Peer = class MockPeer {
  on() {}
};

console.log("Starting ES module syntax check...");

const modules = [
  '../js/rules.js',
  '../js/spells.js',
  '../js/rules/feats-data.js',
  '../js/models/Stat.js',
  '../js/models/Weapon.js',
  '../js/models/Combatant.js',
  '../js/models/model-core.js',
  '../js/state/state-core.js',
  '../js/state/StorageManager.js',
  '../js/state/PCManager.js',
  '../js/state/EncounterManager.js',
  '../js/state.js',
  '../js/network/NetworkManager.js',
  '../js/ui/components/player/PCFeatsTab.js',
  '../js/ui/ui-shared.js',
  '../js/ui/ui-core.js',
  '../js/app.js'
];

async function run() {
  for (const mod of modules) {
    console.log(`Loading ${mod}...`);
    await import(mod);
  }
  console.log("All ES modules loaded successfully without errors!");
}

run().catch(err => {
  console.error("Failed to load modules:", err);
  process.exit(1);
});
