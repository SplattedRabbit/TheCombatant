import test from 'node:test';
import assert from 'node:assert/strict';
import { ACF_REGISTRY, getACFsByClass, getACF } from '../js/data/acf-data.js';
import { Combatant } from '../js/models/Combatant.js';
import { CombatState } from '../js/state.js';

test('ACF Registry - Data integrity and query helpers (Strictly data/ sources)', () => {
  assert.ok(ACF_REGISTRY.paladin_charging_smite, 'Charging Smite exists');
  assert.equal(ACF_REGISTRY.paladin_charging_smite.classKey, 'paladin');
  assert.equal(ACF_REGISTRY.paladin_charging_smite.minLevel, 5);
  assert.equal(ACF_REGISTRY.paladin_charging_smite.source, 'PHB2 p.53');

  const paladinLvl4 = getACFsByClass('paladin', 4);
  const paladinLvl5 = getACFsByClass('paladin', 5);
  
  assert.ok(!paladinLvl4.some(a => a.id === 'paladin_charging_smite'), 'Charging Smite not available at level 4');
  assert.ok(paladinLvl5.some(a => a.id === 'paladin_charging_smite'), 'Charging Smite is available at level 5');

  const barbarianACFs = getACFsByClass('barbarian', 1);
  assert.ok(barbarianACFs.some(a => a.id === 'barbarian_berserker_strength'), 'Berserker Strength available at level 1');

  const rogueLvl4 = getACFsByClass('rogue', 4);
  assert.ok(rogueLvl4.some(a => a.id === 'rogue_disruptive_attack'), 'Disruptive Attack available at level 4');

  const acf = getACF('ranger_distracting_attack');
  assert.ok(acf);
  assert.equal(acf.classKey, 'ranger');
  assert.equal(acf.minLevel, 4);
  assert.equal(acf.source, 'PHB2 p.55');

  const fighterACFs = getACFsByClass('fighter', 6);
  assert.ok(fighterACFs.some(a => a.id === 'fighter_elusive_attack'), 'Elusive Attack available at level 6');

  // Verify all entries in ACF_REGISTRY belong to approved books
  for (const [id, item] of Object.entries(ACF_REGISTRY)) {
    assert.ok(
      item.source.startsWith('PHB2') || item.source.startsWith('CA') || item.source.startsWith('CS') || item.source.startsWith('PHB') || item.source.startsWith('DMG'),
      `ACF ${id} source '${item.source}' must be in data folder rulebooks`
    );
  }
});

test('ACF Model - Serialization & toJSON in Combatant', () => {
  const pc = new Combatant({
    id: 'acf_hero',
    name: 'Sir Galahad',
    type: 'p',
    classes: [{ classType: 'paladin', level: 5 }],
    acfs: ['paladin_charging_smite']
  });

  assert.deepEqual(pc.acfs, ['paladin_charging_smite']);

  const json = pc.toJSON();
  assert.deepEqual(json.acfs, ['paladin_charging_smite']);

  const reconstructed = new Combatant(json);
  assert.deepEqual(reconstructed.acfs, ['paladin_charging_smite']);
});

test('ACF State - Toggle PC ACF in state', () => {
  const pc = new Combatant({
    id: 'acf_barbarian',
    name: 'Conan',
    type: 'p',
    classes: [{ classType: 'barbarian', level: 2 }],
    acfs: []
  });

  CombatState.clearActivePC();
  CombatState.getState().combatants = [pc];
  CombatState.updateSession(false, 'player', pc.id);

  // Toggle on
  CombatState.togglePCACF('barbarian_berserker_strength');
  assert.ok(pc.acfs.includes('barbarian_berserker_strength'), 'ACF was enabled');

  // Toggle off
  CombatState.togglePCACF('barbarian_berserker_strength');
  assert.ok(!pc.acfs.includes('barbarian_berserker_strength'), 'ACF was disabled');
});
