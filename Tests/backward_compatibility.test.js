import test from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { Weapon, WeaponRegistry } from '../js/models/Weapon.js';
import { ARMOR_REGISTRY } from '../js/data/armor-data.js';
import { checkFeatPrerequisites } from '../js/data/feats-data.js';
import { rebuildCombatantModifiers } from '../js/models/helpers/modifiers/CombatantModifiers.js';

test('Backward Compatibility - Legacy Character Save Hydration & Dual-Aliasing', () => {
  // Simulate an older saved character JSON payload from localStorage or export file
  const legacyPayload = {
    id: 'legacy-char-1',
    // No name provided: should fallback to Adventurer
    type: 'p',
    maxHP: 45,
    hp: 45,
    ac: 18,
    // Legacy saving throws (Zähigkeit)
    baseZa: 4,
    za: 6,
    zaMisc: 2,
    baseRef: 2,
    ref: 4,
    baseWil: 1,
    wil: 2,
    // Legacy speed (Bewegungsrate)
    baseBw: 20,
    bw: 20,
    // Legacy initiative misc
    iniMisc: 4,
    // Ability scores
    str: 14,
    dex: 14,
    con: 14,
    int: 10,
    wis: 12,
    cha: 8,
    race: 'dwarf',
    classes: [{ classType: 'fighter', level: 4 }]
  };

  const pc = new Combatant(legacyPayload);

  // 1. Fallback name
  assert.strictEqual(pc.name, 'Adventurer', 'Fallback name should be Adventurer');

  // 2. Fortitude Dual-Aliasing
  assert.strictEqual(pc.baseZa.getValue(), 4, 'Legacy baseZa must equal 4');
  assert.strictEqual(pc.baseFort.getValue(), 4, 'Canonical baseFort must equal 4');
  assert.strictEqual(pc.baseZa, pc.baseFort, 'baseZa and baseFort must share the same Stat reference');

  assert.strictEqual(pc.za.getValue(), 9, 'Legacy za must equal 9 (base 4 + con 3 + misc 2)');
  assert.strictEqual(pc.fort.getValue(), 9, 'Canonical fort must equal 9 (base 4 + con 3 + misc 2)');
  assert.strictEqual(pc.za, pc.fort, 'za and fort must share the same Stat reference');

  assert.strictEqual(pc.zaMisc, 2, 'Legacy zaMisc must equal 2');
  assert.strictEqual(pc.fortMisc, 2, 'Canonical fortMisc must equal 2');

  // 3. Speed Dual-Aliasing
  assert.strictEqual(pc.baseBw, 20, 'Legacy baseBw must equal 20');
  assert.strictEqual(pc.baseSpeed, 20, 'Canonical baseSpeed must equal 20');
  assert.strictEqual(pc.bw, 20, 'Legacy bw must equal 20');
  assert.strictEqual(pc.speed, 20, 'Canonical speed must equal 20');

  // 4. Initiative Misc Dual-Aliasing
  assert.strictEqual(pc.iniMisc, 4, 'Legacy iniMisc must equal 4');
  assert.strictEqual(pc.initMisc, 4, 'Canonical initMisc must equal 4');

  // 5. Will Save Dual-Aliasing
  assert.strictEqual(pc.baseWil.getValue(), 1, 'Legacy baseWil must equal 1');
  assert.strictEqual(pc.baseWill.getValue(), 1, 'Canonical baseWill must equal 1');
  assert.strictEqual(pc.wil.getValue(), 2, 'Legacy wil must equal 2');
  assert.strictEqual(pc.will.getValue(), 2, 'Canonical will must equal 2');

  // 6. Reactive Stat Mutation Synchronicity
  pc.fort.addModifier(2, 'morale', 'Bless');
  assert.strictEqual(pc.fort.getValue(), 11, 'Canonical fort should reflect modifier');
  assert.strictEqual(pc.za.getValue(), 11, 'Legacy za must immediately reflect modifier');

  // 7. Serialization includes both legacy and canonical properties
  const json = pc.toJSON();
  assert.strictEqual(json.za.getValue(), 11, 'JSON must contain za');
  assert.strictEqual(json.fort.getValue(), 11, 'JSON must contain fort');
  assert.strictEqual(json.bw, 20, 'JSON must contain bw');
  assert.strictEqual(json.speed, 20, 'JSON must contain speed');
  assert.strictEqual(json.iniMisc, 4, 'JSON must contain iniMisc');
  assert.strictEqual(json.initMisc, 4, 'JSON must contain initMisc');
});

test('Backward Compatibility - Equipment & Weapon Registry', () => {
  // Existing weapon preserved as-is
  const legacyWeapon = new Weapon({
    name: 'Langschwert +1',
    type: 'longsword',
    grip: '1h',
    damageDice: '1w8',
    enhancement: 1
  });
  assert.strictEqual(legacyWeapon.name, 'Langschwert +1', 'Custom weapon name must be preserved');
  assert.strictEqual(legacyWeapon.damageDice, '1w8', 'Legacy damageDice must be preserved');

  // Canonical name in WeaponRegistry
  assert.strictEqual(WeaponRegistry.longsword.name, 'Longsword');
  assert.strictEqual(WeaponRegistry.dagger.name, 'Dagger');
  assert.strictEqual(WeaponRegistry.greatsword.name, 'Greatsword');
  assert.strictEqual(WeaponRegistry.shortbow.name, 'Shortbow');

  // Canonical name in ARMOR_REGISTRY
  assert.strictEqual(ARMOR_REGISTRY.padded.name, 'Padded armor');
  assert.strictEqual(ARMOR_REGISTRY.chain_shirt.name, 'Chain shirt');
  assert.strictEqual(ARMOR_REGISTRY.full_plate.name, 'Full plate');
  assert.strictEqual(ARMOR_REGISTRY.buckler.name, 'Buckler');
});

test('Backward Compatibility - Prerequisite Engine English Descriptions', () => {
  const pc = new Combatant({
    name: 'Test PC',
    type: 'p',
    str: 10,
    bab: 0,
    skills: { ride: { ranks: 0 } }
  });

  // Power Attack requires Str 13
  const resPowerAttack = checkFeatPrerequisites('power_attack', pc);
  assert.strictEqual(resPowerAttack.met, false);
  assert(
    resPowerAttack.unmetDescs.some(d => d.includes('Strength 13+')),
    `Expected unmet desc to contain "Strength 13+", got: ${JSON.stringify(resPowerAttack.unmetDescs)}`
  );

  // Mounted Combat requires Ride 1 rank
  const resMounted = checkFeatPrerequisites('mounted_combat', pc);
  assert.strictEqual(resMounted.met, false);
  assert(
    resMounted.unmetDescs.some(d => d.toLowerCase().includes('ride')),
    `Expected unmet desc to mention Ride, got: ${JSON.stringify(resMounted.unmetDescs)}`
  );
});

test('Backward Compatibility - Recalculate Modifiers on Dual-Aliased PC', () => {
  const pc = new Combatant({
    name: 'Dwarf Fighter',
    type: 'p',
    race: 'dwarf',
    con: 14,
    baseZa: 2,
    baseRef: 0,
    baseWil: 0,
    baseBw: 20
  });

  rebuildCombatantModifiers(pc);

  // Dwarf CON +2 racial bonus -> CON 16 (+3 modifier)
  // Fortitude base 2 + CON mod 3 = 5
  assert.strictEqual(pc.fort.getValue(), 5, 'Canonical fort should be 5');
  assert.strictEqual(pc.za.getValue(), 5, 'Legacy za should be 5');
  assert.strictEqual(pc.speed, 20, 'Canonical speed should be 20');
  assert.strictEqual(pc.bw, 20, 'Legacy bw should be 20');
});
