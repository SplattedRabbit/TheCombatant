import fs from 'fs';

const phb = JSON.parse(fs.readFileSync('./data/spells-phb.json', 'utf8'));

// Standard PHB Cantrips (Level 0) and Level 1 spells by class
const standardCantrips = {
  wizard: [
    'resistance', 'acid_splash', 'detect_poison', 'detect_magic', 'read_magic', 'daze',
    'dancing_lights', 'flare', 'light', 'ray_of_frost', 'ghost_sound', 'disrupt_undead',
    'touch_of_fatigue', 'mage_hand', 'mending', 'message', 'open_close', 'arcane_mark', 'prestidigitation'
  ],
  cleric: [
    'create_water', 'cure_minor_wounds', 'detect_magic', 'detect_poison', 'guidance',
    'inflict_minor_wounds', 'light', 'mending', 'purify_food_and_drink', 'read_magic', 'resistance', 'virtue'
  ],
  druid: [
    'create_water', 'cure_minor_wounds', 'detect_magic', 'detect_poison', 'flare',
    'guidance', 'know_direction', 'light', 'mending', 'purify_food_and_drink', 'read_magic', 'resistance', 'virtue'
  ],
  bard: [
    'dancing_lights', 'daze', 'detect_magic', 'flare', 'ghost_sound', 'light',
    'mage_hand', 'mending', 'message', 'open_close', 'prestidigitation', 'read_magic', 'resistance', 'summon_instrument'
  ]
};

console.log('=== Cantrips / Level 0 Audit ===');
for (const [cls, list] of Object.entries(standardCantrips)) {
  const missing = list.filter(id => !phb[id]);
  console.log(`Class: ${cls} (Total standard cantrips: ${list.length})`);
  console.log(`- Missing: ${missing.length ? missing.join(', ') : 'None'}`);
}
