// Tests/character_fixtures_regression.test.js
// Regression test suite running against real campaign export JSONs in Tests/fixtures/characters/

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Combatant } from '../js/models/Combatant.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';
import { calculateMaxSpellSlots, getEffectiveCasterLevel } from '../js/rules/RulesSpells.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, 'fixtures/characters');

function loadFixture(filename) {
  const filePath = path.join(fixturesDir, filename);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return raw.combatants ? raw.combatants[0] : raw;
}

test('Regression Fixture 1: H.O.P.E (Anima Construct Cleric 6)', () => {
  const data = loadFixture('hope_cleric.json');
  const pc = new Combatant(data);

  // 1. Basic Identity & Attributes
  assert.strictEqual(pc.name, 'H.O.P.E');
  assert.strictEqual(pc.race, 'anima_construct');
  assert.strictEqual(pc.classes.length, 1);
  assert.strictEqual(pc.classes[0].classType, 'cleric');
  assert.strictEqual(pc.classes[0].level, 6);

  // Ability Scores: Con gets +2 racial (14 -> 16), Cha gets -2 racial (10 -> 8)
  assert.strictEqual(pc.str.getValue(), 12, 'Str should be 12 (mod +1)');
  assert.strictEqual(pc.dex.getValue(), 10, 'Dex should be 10 (mod 0)');
  assert.strictEqual(pc.con.getValue(), 16, 'Con should be 16 with Anima Construct +2 racial');
  assert.strictEqual(pc.int.getValue(), 10, 'Int should be 10 (mod 0)');
  assert.strictEqual(pc.wis.getValue(), 18, 'Wis should be 18 (mod +4)');
  assert.strictEqual(pc.cha.getValue(), 8, 'Cha should be 8 with Anima Construct -2 racial');

  // 2. Armor Class (Living Construct +1 natural armor)
  assert.strictEqual(pc.ac.getValue(), 11, 'Total AC should be 11 (10 base + 1 natural)');
  assert.strictEqual(pc.acFlat.getValue(), 11, 'Flat-footed AC should be 11');
  assert.strictEqual(pc.acTouch.getValue(), 10, 'Touch AC should be 10');

  // 3. Saving Throws (Base 5/2/5, Con +3, Dex 0, Wis +4)
  assert.strictEqual(pc.za.getValue(), 8, 'Fortitude save should be 8 (5 base + 3 Con)');
  assert.strictEqual(pc.ref.getValue(), 2, 'Reflex save should be 2 (2 base + 0 Dex)');
  assert.strictEqual(pc.wil.getValue(), 9, 'Will save should be 9 (5 base + 4 Wis)');

  // 4. Base Attack Bonus
  assert.strictEqual(pc.bab.getValue(), 4, 'Cleric 6 BAB should be 4');

  // 5. Turn Undead Daily Uses: 3 + ChaMod(-1) = 2
  const turn = pc.dailyAbilities.find(a => a.name === 'Turn Undead' || a.name === 'Untote vertreiben');
  assert.ok(turn, 'Should have Turn Undead daily ability');
  assert.strictEqual(turn.max, 2, 'Turn Undead max uses should be 2 with Cha 8 (-1 mod)');

  // 6. Spell Slots
  const slots = calculateMaxSpellSlots(pc);
  assert.strictEqual(slots[0], 4, 'Cantrips slot count should be 4');
  assert.strictEqual(slots[1], 4, '1st level slots should be 4 (3 base + 1 Wis)');
  assert.strictEqual(slots[2], 4, '2nd level slots should be 4 (3 base + 1 Wis)');
  assert.strictEqual(slots[3], 3, '3rd level slots should be 3 (2 base + 1 Wis)');
  assert.strictEqual(slots[4], 0, '4th level slots should be 0');

  // 7. Skills
  assert.strictEqual(pc.getSkillRanks('heal'), 6);
  // Heal: 6 ranks + 4 Wis mod = 10
  assert.strictEqual(pc.getSkillModifier('heal'), 10);
});

test('Regression Fixture 2: Corvin Nachtschatten (Rogue 3 / Wizard 5 / Arcane Trickster 3 / Barbarian 1)', () => {
  const data = loadFixture('corvin_arcane_trickster.json');
  const pc = new Combatant(data);

  // 1. Identity & Multiclassing
  assert.strictEqual(pc.name, 'Corvin Nachtschatten');
  assert.strictEqual(pc.race, 'human');
  assert.strictEqual(pc.level, 12);
  assert.strictEqual(pc.classes.length, 4);

  // 2. Attributes
  assert.strictEqual(pc.str.getValue(), 8);
  assert.strictEqual(pc.dex.getValue(), 16); // +3 mod
  assert.strictEqual(pc.con.getValue(), 12); // +1 mod
  assert.strictEqual(pc.int.getValue(), 18); // +4 mod
  assert.strictEqual(pc.wis.getValue(), 10); // +0 mod
  assert.strictEqual(pc.cha.getValue(), 8);  // -1 mod

  // 3. Armor Class Stacking
  // 10 base + 1 deflection (ring) + 1 natural enhancement (amulet) + 3 dex + 4 armor + 1 enhancement = 20
  assert.strictEqual(pc.ac.getValue(), 20, 'Total AC should be 20');
  assert.strictEqual(pc.acTouch.getValue(), 14, 'Touch AC should be 14 (10 base + 1 deflection + 3 dex)');
  assert.strictEqual(pc.acFlat.getValue(), 17, 'Flat-Footed AC should be 17 (20 - 3 dex)');

  // 4. Movement: Base 30 + Barbarian Fast Movement (+10) = 40 ft
  assert.strictEqual(pc.bw, 40, 'Speed should be 40 ft with Barbarian Fast Movement');

  // 5. Saving Throws
  // Fort: 5 base + 1 Con = 6
  // Ref: 7 base + 3 Dex = 10
  // Will: 8 base + 0 Wis = 8
  assert.strictEqual(pc.za.getValue(), 6, 'Fort save should be 6');
  assert.strictEqual(pc.ref.getValue(), 10, 'Reflex save should be 10');
  assert.strictEqual(pc.wil.getValue(), 8, 'Will save should be 8');

  // 6. Base Attack Bonus: Rogue 3 (2) + Wizard 5 (2) + Arcane Trickster 3 (1) + Barbarian 1 (1) = 6
  assert.strictEqual(pc.bab.getValue(), 6, 'BAB should be 6');

  // 7. Sneak Attack Dice: Rogue 3 (2d6) + Arcane Trickster 3 (1d6) = 3d6 (RAW: AT gets SA at even levels 2, 4, 6, 8, 10)
  assert.strictEqual(pc.getSneakAttackDiceCount(), 3, 'Sneak attack should total 3d6');

  // 8. Effective Caster Level: Wizard 5 + Arcane Trickster 3 (prestige link to wizard) = CL 8
  const effWizCL = getEffectiveCasterLevel(pc, 'wizard');
  assert.strictEqual(effWizCL, 8, 'Wizard caster level should be 8 (5 Wizard + 3 Arcane Trickster)');

  // 9. Spell Slots for Caster Level 8 Wizard (Int 18):
  // 0: 4, 1: 4+1=5, 2: 3+1=4, 3: 3+1=4, 4: 2+1=3
  const slots = calculateMaxSpellSlots(pc);
  assert.strictEqual(slots[0], 4);
  assert.strictEqual(slots[1], 5);
  assert.strictEqual(slots[2], 4);
  assert.strictEqual(slots[3], 4);
  assert.strictEqual(slots[4], 3);
  assert.strictEqual(slots[5], 0);

  // 10. Attack Sequences (Meisterwerk-Rapier + Weapon Finesse + Sneak Attack enabled)
  const rapier = pc.weapons.find(w => w.name.includes('Rapier'));
  assert.ok(rapier);
  const stdAttacks = AttackEngine.calculateAttackSequence(pc, rapier, false);
  assert.strictEqual(stdAttacks.length, 1, 'Standard attack has 1 attack');
  assert.strictEqual(stdAttacks[0].atkTotal, 9, 'Standard attack should be +9 (+6 BAB +3 Dex Finesse)');
  assert.strictEqual(stdAttacks[0].damageDice, '1w6 + 3w6', 'Damage should include 1d6 rapier + 3d6 sneak attack');

  const fullAttacks = AttackEngine.calculateAttackSequence(pc, rapier, true);
  // BAB 6 (+6/+1) + Dex mod (+3) = +9 / +4
  assert.strictEqual(fullAttacks.length, 2, 'Full attack sequence for BAB 6 should have 2 attacks');
  assert.strictEqual(fullAttacks[0].atkTotal, 9, '1st attack should be +9 (+6 BAB +3 Dex)');
  assert.strictEqual(fullAttacks[1].atkTotal, 4, '2nd attack should be +4 (+1 BAB +3 Dex)');
});

test('Regression Fixture 3: Pallash II. (Dwarf Ninja 2 / Wizard 6 / Spellwarp Sniper 5)', () => {
  const data = loadFixture('pallash_spellwarp_sniper.json');
  const pc = new Combatant(data);

  // 1. Identity & Multiclassing
  assert.strictEqual(pc.name, 'Pallash II.');
  assert.strictEqual(pc.race, 'dwarf');
  assert.strictEqual(pc.level, 13);
  assert.strictEqual(pc.classes.length, 3);

  // 2. Attributes (Dwarf: Con +2 (9 -> 11), Cha -2 (7 -> 5))
  assert.strictEqual(pc.str.getValue(), 7);  // -2 mod
  assert.strictEqual(pc.dex.getValue(), 15); // +2 mod
  assert.strictEqual(pc.con.getValue(), 11); // +0 mod
  assert.strictEqual(pc.int.getValue(), 18); // +4 mod
  assert.strictEqual(pc.wis.getValue(), 18); // +4 mod
  assert.strictEqual(pc.cha.getValue(), 5);  // -3 mod

  // 3. Ninja Unarmored AC Bonus (Wisdom modifier +4) + Dex (+2) + Defensive Fighting (+2 dodge)
  // When unarmored, Ninja adds full Wis mod to AC: 10 + 4 (Wis) + 2 (Dex) + 2 (dodge) = 18 AC
  assert.strictEqual(pc.ac.getValue(), 18, 'AC should be 18 (10 base + 4 Ninja Wis + 2 Dex + 2 Defensive)');
  assert.strictEqual(pc.acTouch.getValue(), 18, 'Touch AC should be 18');
  assert.strictEqual(pc.acFlat.getValue(), 14, 'Flat-Footed AC should be 14 (10 base + 4 Ninja Wis)');

  // 4. Saving Throws
  // Fort: 3 base + 0 Con = 3
  assert.strictEqual(pc.za.getValue(), 3);
  // Ref: 6 base + 2 Dex + 2 Lightning Reflexes feat = 10
  assert.strictEqual(pc.ref.getValue(), 10);
  // Will: 9 base + 4 Wis + 2 Ki Power (since Ki pool > 0) = 15
  assert.strictEqual(pc.wil.getValue(), 15);

  // 5. Ki Power Daily Uses: Level 2 Ninja gives Math.max(1, floor(2/2)) + Wis mod(4) = 5
  const ki = pc.dailyAbilities.find(a => a.name === 'Ki Power');
  assert.ok(ki);
  assert.strictEqual(ki.max, 5, 'Ki Power daily pool should be 5');

  // 6. Effective Caster Level: Wizard 6 + Spellwarp Sniper 5 = CL 11
  const effCL = getEffectiveCasterLevel(pc, 'wizard');
  assert.strictEqual(effCL, 11, 'Caster level should be 11 (6 Wizard + 5 Spellwarp Sniper)');

  // 7. Wizard Spell Slots for CL 11 Specialist (Evocation):
  // Table for CL 11: [4, 4, 4, 4, 3, 2, 1] + Int bonus [-, 1, 1, 1, 1, 1, 0] + Specialist (+1 to slots 1-6)
  const slots = calculateMaxSpellSlots(pc);
  assert.strictEqual(slots[0], 4);
  assert.strictEqual(slots[1], 6, '1st level: 4 base + 1 Int + 1 Specialist = 6');
  assert.strictEqual(slots[2], 6, '2nd level: 4 base + 1 Int + 1 Specialist = 6');
  assert.strictEqual(slots[3], 6, '3rd level: 4 base + 1 Int + 1 Specialist = 6');
  assert.strictEqual(slots[4], 5, '4th level: 3 base + 1 Int + 1 Specialist = 5');
  assert.strictEqual(slots[5], 3, '5th level: 2 base + 0 Int (needs Int 20) + 1 Specialist = 3');
  assert.strictEqual(slots[6], 2, '6th level: 1 base + 0 Int + 1 Specialist = 2');
});
