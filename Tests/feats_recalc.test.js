// Tests/feats_recalc.test.js - Verify rule automations (feats, class passives, and combat calculations)

import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { Weapon } from '../js/models/Weapon.js';
import { AttackEngine } from '../js/rules/AttackEngine.js';
import { checkFeatPrerequisites } from '../js/data/feats-data.js';
import { recalculateDailyAbilities } from '../js/state/PCManager.js';

test('Feat Automation - Skill Feats (+2 passive bonuses)', () => {
  const pc = new Combatant({
    name: 'Test Hero',
    type: 'p',
    feats: [{ id: 'stealthy' }, { id: 'acrobatic' }]
  });

  // Stealthy gives +2 to hide and move_silently
  const hideMod = pc.getSkillModifier('hide');
  const moveSilentlyMod = pc.getSkillModifier('move_silently');
  
  // Acrobatic gives +2 to jump and tumble
  const jumpMod = pc.getSkillModifier('jump');
  const tumbleMod = pc.getSkillModifier('tumble');
  
  // Standard attributes are 10 (+0 mod), ranks are 0, misc is 0
  // Stealthy: Base 0 + 0 (dex) + 2 (feat) = 2
  assert.strictEqual(hideMod, 2);
  assert.strictEqual(moveSilentlyMod, 2);
  
  // Acrobatic: Base 0 + 0 (str/dex) + 2 (feat) = 2
  assert.strictEqual(jumpMod, 2);
  assert.strictEqual(tumbleMod, 2);

  // Other skills remain 0
  assert.strictEqual(pc.getSkillModifier('climb'), 0);
});

test('Feat Automation - Skill Focus (+3 bonus on chosen skill)', () => {
  const pc = new Combatant({
    name: 'Test Hero',
    type: 'p',
    feats: [
      { id: 'skill_focus', option: 'Akrobatik (Tumble)' },
      { id: 'skill_focus', option: 'climb' }
    ]
  });

  // Tumble has skill focus, gets +3
  const tumbleMod = pc.getSkillModifier('tumble');
  assert.strictEqual(tumbleMod, 3);

  // Climb has skill focus, gets +3
  const climbMod = pc.getSkillModifier('climb');
  assert.strictEqual(climbMod, 3);

  // Swim has no focus, gets 0
  assert.strictEqual(pc.getSkillModifier('swim'), 0);
});

test('Class Passive - Fast Movement (Barbarian and Monk Speed)', () => {
  // 1. Barbarian Level 1: +10 ft speed
  const barbarian = new Combatant({
    name: 'Raging Barb',
    type: 'p',
    bw: 30,
    classes: [{ classType: 'barbarian', level: 1 }]
  });
  assert.strictEqual(barbarian.bw, 40, 'Barbarian should get +10 ft fast movement');

  // 2. Monk Level 3: +10 ft speed
  const monkLvl3 = new Combatant({
    name: 'Young Monk',
    type: 'p',
    bw: 30,
    classes: [{ classType: 'monk', level: 3 }]
  });
  assert.strictEqual(monkLvl3.bw, 40, 'Monk Level 3 should get +10 ft speed');

  // 3. Monk Level 12: +40 ft speed
  const monkLvl12 = new Combatant({
    name: 'Master Monk',
    type: 'p',
    bw: 30,
    classes: [{ classType: 'monk', level: 12 }]
  });
  assert.strictEqual(monkLvl12.bw, 70, 'Monk Level 12 should get +40 ft speed');

  // 4. Multiclass Barbarian 1 / Monk 12: +10 +40 = +50 speed (total 80 ft)
  const multiSpeed = new Combatant({
    name: 'Fast Beast',
    type: 'p',
    bw: 30,
    classes: [
      { classType: 'barbarian', level: 1 },
      { classType: 'monk', level: 12 }
    ]
  });
  assert.strictEqual(multiSpeed.bw, 80, 'Multiclass Barbarian/Monk speed bonuses should stack');
});

test('Feat Automation - Dodge Feat (+1 AC and Touch AC)', () => {
  const pc = new Combatant({
    name: 'Dodger',
    type: 'p',
    ac: 10,
    acTouch: 10,
    acFlat: 10,
    feats: [{ id: 'dodge' }]
  });

  // Dodge gives +1 dodge bonus to AC & Touch AC, but Flat-footed remains unchanged
  assert.strictEqual(pc.ac.getValue(), 11, 'AC should increase by 1');
  assert.strictEqual(pc.acTouch.getValue(), 11, 'Touch AC should increase by 1');
  assert.strictEqual(pc.acFlat.getValue(), 10, 'Flat-footed AC should NOT increase by 1');
});

test('Feat Automation - Two-Weapon Defense (+1 shield bonus to AC & Flat-footed)', () => {
  // 1. Without secondary weapon, Two-Weapon Defense does not apply
  const pcNoSec = new Combatant({
    name: 'Dual Wielder (Single)',
    type: 'p',
    ac: 10,
    acTouch: 10,
    acFlat: 10,
    feats: [{ id: 'two_weapon_defense' }],
    weapons: [new Weapon({ name: 'Sword', grip: '1h' })]
  });
  assert.strictEqual(pcNoSec.ac.getValue(), 10, 'AC should remain 10 without off-hand weapon');

  // 2. With secondary weapon (grip === 'sec'), Two-Weapon Defense applies (+1 shield bonus to AC & Flat-footed, not Touch)
  const pcWithSec = new Combatant({
    name: 'Dual Wielder (Active)',
    type: 'p',
    ac: 10,
    acTouch: 10,
    acFlat: 10,
    feats: [{ id: 'two_weapon_defense' }],
    weapons: [
      new Weapon({ name: 'Main Sword', gripOverride: '1h' }),
      new Weapon({ name: 'Off-hand Dagger', gripOverride: 'sec' })
    ]
  });
  assert.strictEqual(pcWithSec.ac.getValue(), 11, 'AC should increase by 1');
  assert.strictEqual(pcWithSec.acFlat.getValue(), 11, 'Flat-footed AC should increase by 1');
  assert.strictEqual(pcWithSec.acTouch.getValue(), 10, 'Touch AC should NOT increase from shield bonus');
});

test('Combat Action - Two-Weapon Fighting Penalties', () => {
  const pc = new Combatant({
    name: 'Dual Wielder',
    type: 'p',
    feats: []
  });
  pc.bab.base = 6; // +6 BAB
  pc.str = 14; // +2 STR
  
  // Weapon 1: Mainhand Longsword
  const mw = new Weapon({ name: 'Longsword', gripOverride: '1h' });
  // Weapon 2: Offhand Dagger (Light)
  const owLight = new Weapon({ name: 'Dagger', gripOverride: 'sec' });
  // Weapon 3: Offhand Shortsword (Non-light)
  const owHeavy = new Weapon({ name: 'Longsword (Offhand)', gripOverride: 'sec' });

  // Scenario 1: TWF Active, Offhand Light, NO TWF Feat -> -4 / -8 penalties
  pc.weapons = [mw, owLight];
  const seq1 = AttackEngine.calculateAttackSequence(pc, mw, true);
  // Mainhand attacks: should have -4 penalty. Base attack +6 + 2(str) - 4 = +4.
  assert.strictEqual(seq1[0].atkTotal, 4); 
  // Offhand attacks: should have -8 penalty. Base attack +6 + 2(str) - 8 = +0.
  const oh1 = seq1.find(atk => atk.isOffhand);
  assert.strictEqual(oh1.atkTotal, 0);

  // Scenario 2: TWF Active, Offhand Heavy, NO TWF Feat -> -6 / -10 penalties
  pc.weapons = [mw, owHeavy];
  const seq2 = AttackEngine.calculateAttackSequence(pc, mw, true);
  // Mainhand: +6 + 2 - 6 = +2
  assert.strictEqual(seq2[0].atkTotal, 2);
  // Offhand: +6 + 2 - 10 = -2
  const oh2 = seq2.find(atk => atk.isOffhand);
  assert.strictEqual(oh2.atkTotal, -2);

  // Scenario 3: TWF Active, Offhand Light, WITH TWF Feat -> -2 / -2 penalties
  pc.feats = [{ id: 'two_weapon_fighting' }];
  pc.weapons = [mw, owLight];
  const seq3 = AttackEngine.calculateAttackSequence(pc, mw, true);
  // Mainhand: +6 + 2 - 2 = +6
  assert.strictEqual(seq3[0].atkTotal, 6);
  // Offhand: +6 + 2 - 2 = +6
  const oh3 = seq3.find(atk => atk.isOffhand);
  assert.strictEqual(oh3.atkTotal, 6);

  // Scenario 4: TWF Active, Offhand Heavy, WITH TWF Feat -> -4 / -4 penalties
  pc.weapons = [mw, owHeavy];
  const seq4 = AttackEngine.calculateAttackSequence(pc, mw, true);
  // Mainhand: +6 + 2 - 4 = +4
  assert.strictEqual(seq4[0].atkTotal, 4);
  // Offhand: +6 + 2 - 4 = +4
  const oh4 = seq4.find(atk => atk.isOffhand);
  assert.strictEqual(oh4.atkTotal, 4);
});

test('Combat Action - Iterative Attacks, Haste, and Rapid Shot', () => {
  const pc = new Combatant({
    name: 'Swift Ranger',
    type: 'p'
  });
  pc.bab.base = 11; // 3 attacks: +11/+6/+1
  pc.dex = 16; // +3 DEX
  pc.str = 10; // +0 STR

  const bow = new Weapon({ name: 'Longbow', gripOverride: 'rng' });
  pc.weapons = [bow];

  // Scenario 1: Standard attack is always a single attack
  const seqStd = AttackEngine.calculateAttackSequence(pc, bow, false);
  assert.strictEqual(seqStd.length, 1);
  assert.strictEqual(seqStd[0].atkTotal, 14); // 11 + 3

  // Scenario 2: Full attack generates iterative attacks: +11, +6, +1 (+3 dex = +14, +9, +4)
  const seqFull = AttackEngine.calculateAttackSequence(pc, bow, true);
  assert.strictEqual(seqFull.length, 3);
  assert.strictEqual(seqFull[0].atkTotal, 14);
  assert.strictEqual(seqFull[1].atkTotal, 9);
  assert.strictEqual(seqFull[2].atkTotal, 4);

  // Scenario 3: Full attack with Rapid Shot: adds +1 attack at highest BAB, all attacks take -2
  pc.feats = [{ id: 'rapid_shot' }];
  const seqRapid = AttackEngine.calculateAttackSequence(pc, bow, true);
  // Should have 4 attacks: 3 iterative + 1 Rapid Shot.
  // Penalties: -2 to all.
  // Attack 1: +11 + 3 - 2 = +12
  // Attack 2: +6 + 3 - 2 = +7
  // Attack 3: +1 + 3 - 2 = +2
  // Rapid Shot attack: +11 + 3 - 2 = +12
  assert.strictEqual(seqRapid.length, 4);
  assert.strictEqual(seqRapid.filter(a => a.atkTotal === 12).length, 2);
  assert.strictEqual(seqRapid.filter(a => a.atkTotal === 7).length, 1);
  assert.strictEqual(seqRapid.filter(a => a.atkTotal === 2).length, 1);

  // Scenario 4: Full attack with Haste (Melee weapon)
  pc.feats = [];
  pc.activeBuffs = [{ spellKey: 'haste' }];
  const sword = new Weapon({ name: 'Longsword', gripOverride: '1h' });
  pc.weapons = [sword];
  pc.str = 14; // +2 STR
  
  const seqHaste = AttackEngine.calculateAttackSequence(pc, sword, true);
  // Haste gives +1 attack at highest BAB and +1 bonus to all attacks
  // Iteratives: +11 + 2 + 1 (haste) = +14, +6 + 2 + 1 = +9, +1 + 2 + 1 = +4
  // Haste extra: +11 + 2 + 1 = +14
  assert.strictEqual(seqHaste.length, 4);
  assert.strictEqual(seqHaste.filter(a => a.atkTotal === 14).length, 2);
  assert.strictEqual(seqHaste.filter(a => a.atkTotal === 9).length, 1);
  assert.strictEqual(seqHaste.filter(a => a.atkTotal === 4).length, 1);
});

test('Feat Automation - Combat Expertise Slider and AC Dodge Bonus', () => {
  const pc = new Combatant({
    name: 'Defensive Duelist',
    type: 'p',
    feats: [{ id: 'combat_expertise' }],
    combatExpertisePenalty: 3
  });
  pc.bab.base = 5; // +5 BAB
  pc.str = 14; // +2 STR
  
  // 1. Reactive AC modifications: should receive +3 dodge bonus to AC & Touch AC
  assert.strictEqual(pc.ac.getValue(), 13, 'AC should increase by 3 from Combat Expertise');
  assert.strictEqual(pc.acTouch.getValue(), 13, 'Touch AC should increase by 3');
  assert.strictEqual(pc.acFlat.getValue(), 10, 'Flat-footed AC should NOT increase from dodge');

  // 2. Attack penalty check in AttackEngine
  const sword = new Weapon({ name: 'Longsword', gripOverride: '1h' });
  pc.weapons = [sword];
  const seq = AttackEngine.calculateAttackSequence(pc, sword, false);
  // Attack: +5 bab + 2 str - 3 expertise = +4
  assert.strictEqual(seq[0].atkTotal, 4);
});

test('Combat Action - Smite Evil and Favored Enemy Options', () => {
  const pc = new Combatant({
    name: 'Holy Avenger',
    type: 'p',
    classes: [
      { classType: 'paladin', level: 5 },
      { classType: 'ranger', level: 6 }
    ]
  });
  pc.bab.base = 11;
  pc.cha = 16; // +3 CHA
  pc.str = 14; // +2 STR

  const sword = new Weapon({ name: 'Longsword', gripOverride: '1h' });
  pc.weapons = [sword];

  // Scenario 1: Without Smite or Favored Enemy toggles
  const seqNormal = AttackEngine.calculateAttackSequence(pc, sword, false, { smite: false, favoredEnemy: false });
  assert.strictEqual(seqNormal[0].atkTotal, 13); // 11 + 2
  assert.strictEqual(seqNormal[0].dmgTotal, 2); // +2 STR

  // Scenario 2: Smite Evil ON -> +3 attack (Cha mod), +5 damage (Paladin Level)
  const seqSmite = AttackEngine.calculateAttackSequence(pc, sword, false, { smite: true, favoredEnemy: false });
  assert.strictEqual(seqSmite[0].atkTotal, 16); // 11 + 2 + 3
  assert.strictEqual(seqSmite[0].dmgTotal, 7); // 2 + 5

  // Scenario 3: Favored Enemy ON -> +4 damage (Ranger level 6 = 2 + 2 * Math.floor((6-1)/5) = 4)
  const seqFE = AttackEngine.calculateAttackSequence(pc, sword, false, { smite: false, favoredEnemy: true });
  assert.strictEqual(seqFE[0].atkTotal, 13);
  assert.strictEqual(seqFE[0].dmgTotal, 6); // 2 + 4

  // Scenario 4: Both ON
  const seqBoth = AttackEngine.calculateAttackSequence(pc, sword, false, { smite: true, favoredEnemy: true });
  assert.strictEqual(seqBoth[0].atkTotal, 16);
  assert.strictEqual(seqBoth[0].dmgTotal, 11); // 2 + 5 (smite) + 4 (FE)
});

test('Combat Action - Defensive Fighting and Tumble Ranks', () => {
  // 1. Without Tumble Ranks: -4 attack, +2 dodge AC
  const pc = new Combatant({
    name: 'Defender',
    type: 'p',
    ac: 10,
    acTouch: 10,
    acFlat: 10,
    isDefensiveFighting: true
  });
  pc.bab.base = 5;
  pc.str = 14; // +2
  
  assert.strictEqual(pc.ac.getValue(), 12, 'Defensive fighting should give +2 AC');
  assert.strictEqual(pc.acTouch.getValue(), 12, 'Touch AC should increase by 2');
  assert.strictEqual(pc.acFlat.getValue(), 10, 'Flat-footed AC should NOT increase');
  
  const sword = new Weapon({ name: 'Longsword', gripOverride: '1h' });
  pc.weapons = [sword];
  const seq = AttackEngine.calculateAttackSequence(pc, sword, false);
  // Attack: 5 + 2 - 4 = +3
  assert.strictEqual(seq[0].atkTotal, 3, 'Attack should receive a -4 penalty');

  // 2. With 5 Tumble Ranks: +3 dodge AC
  const pcTumble = new Combatant({
    name: 'Acrobatic Defender',
    type: 'p',
    ac: 10,
    acTouch: 10,
    acFlat: 10,
    isDefensiveFighting: true,
    skills: {
      tumble: { ranks: 5 }
    }
  });
  
  assert.strictEqual(pcTumble.ac.getValue(), 13, 'Defensive fighting with 5+ Tumble ranks should give +3 AC');
});

test('Combat Action - Total Defense and Tumble Ranks', () => {
  // 1. Without Tumble Ranks: +4 dodge AC
  const pc = new Combatant({
    name: 'Stalwart',
    type: 'p',
    ac: 10,
    acTouch: 10,
    acFlat: 10,
    isTotalDefense: true
  });
  assert.strictEqual(pc.ac.getValue(), 14, 'Total defense should give +4 AC');
  assert.strictEqual(pc.acTouch.getValue(), 14, 'Touch AC should increase by 4');
  assert.strictEqual(pc.acFlat.getValue(), 10, 'Flat-footed AC should NOT increase');

  // 2. With 5 Tumble Ranks: +6 dodge AC
  const pcTumble = new Combatant({
    name: 'Acrobatic Stalwart',
    type: 'p',
    ac: 10,
    acTouch: 10,
    acFlat: 10,
    isTotalDefense: true,
    skills: {
      tumble: { ranks: 5 }
    }
  });
  assert.strictEqual(pcTumble.ac.getValue(), 16, 'Total defense with 5+ Tumble ranks should give +6 AC');
});

test('Combat Action - Rogue Sneak Attack Damage Addition', () => {
  const pc = new Combatant({
    name: 'Sneaky Rogue',
    type: 'p',
    classes: [
      { classType: 'rogue', level: 5 } // 5 Rogue = +3d6 Sneak Attack
    ]
  });
  pc.bab.base = 3;
  pc.str = 12; // +1

  const dagger = new Weapon({ name: 'Dagger', gripOverride: '1h', damageDice: '1w4' });
  pc.weapons = [dagger];

  // Sneak Attack OFF
  const seqOff = AttackEngine.calculateAttackSequence(pc, dagger, false, { sneakAttack: false });
  assert.strictEqual(seqOff[0].damageDice, '1w4');
  
  // Sneak Attack ON -> +3d6 damage dice string
  const seqOn = AttackEngine.calculateAttackSequence(pc, dagger, false, { sneakAttack: true });
  assert.strictEqual(seqOn[0].damageDice, '1w4 + 3w6');
  assert.ok(seqOn[0].dmgBreakdown.some(b => b.label.includes('Hinterhältiger Angriff')));
});

test('Class Passive - Monk Unarmed Damage Scaling', () => {
  // 1. Monk Level 1: 1w6
  const pcMonk1 = new Combatant({
    name: 'Monk 1',
    type: 'p',
    classes: [{ classType: 'monk', level: 1 }]
  });
  const unarmed = new Weapon({ name: 'Unarmed Strike', type: 'unarmed_strike' });
  assert.strictEqual(pcMonk1.getWeaponDamageDice(unarmed), '1w6');

  // 2. Monk Level 5: 1w8
  const pcMonk5 = new Combatant({
    name: 'Monk 5',
    type: 'p',
    classes: [{ classType: 'monk', level: 5 }]
  });
  assert.strictEqual(pcMonk5.getWeaponDamageDice(unarmed), '1w8');

  // 3. Monk Level 12: 2w6
  const pcMonk12 = new Combatant({
    name: 'Monk 12',
    type: 'p',
    classes: [{ classType: 'monk', level: 12 }]
  });
  assert.strictEqual(pcMonk12.getWeaponDamageDice(unarmed), '2w6');
  
  // 4. Non-Monk Unarmed: 1w3
  const pcFighter = new Combatant({
    name: 'Fighter',
    type: 'p',
    classes: [{ classType: 'fighter', level: 5 }]
  });
  assert.strictEqual(pcFighter.getWeaponDamageDice(unarmed), '1w3');
});

test('Feat Automation - Custom Prerequisite Checks (Bypass Prevention)', () => {
  // 1. Fighter cannot learn extra_turning, extra_music, natural_spell
  const fighter = new Combatant({
    name: 'Fighter',
    type: 'p',
    classes: [{ classType: 'fighter', level: 5 }]
  });
  const resTurning = checkFeatPrerequisites('extra_turning', fighter);
  assert.strictEqual(resTurning.met, false, 'Fighter should not be able to learn Extra Turning');
  assert.ok(resTurning.unmetDescs.some(d => d.includes('Untote zu vertreiben')));

  const resMusic = checkFeatPrerequisites('extra_music', fighter);
  assert.strictEqual(resMusic.met, false, 'Fighter should not be able to learn Extra Music');
  assert.ok(resMusic.unmetDescs.some(d => d.includes('Bardenmusik')));

  const resNatural = checkFeatPrerequisites('natural_spell', fighter);
  assert.strictEqual(resNatural.met, false, 'Fighter should not be able to learn Natural Spell');
  assert.ok(resNatural.unmetDescs.some(d => d.includes('Tiergestalt')));

  // 2. Cleric Level 1 CAN learn Extra Turning
  const cleric = new Combatant({
    name: 'Cleric',
    type: 'p',
    classes: [{ classType: 'cleric', level: 1 }]
  });
  const resClericTurning = checkFeatPrerequisites('extra_turning', cleric);
  assert.strictEqual(resClericTurning.met, true, 'Cleric Level 1 should be able to learn Extra Turning');

  // 3. Paladin Level 3 CANNOT learn Extra Turning, Paladin Level 4 CAN
  const paladin3 = new Combatant({
    name: 'Paladin 3',
    type: 'p',
    classes: [{ classType: 'paladin', level: 3 }]
  });
  const resPal3Turning = checkFeatPrerequisites('extra_turning', paladin3);
  assert.strictEqual(resPal3Turning.met, false, 'Paladin Level 3 should not be able to learn Extra Turning');

  const paladin4 = new Combatant({
    name: 'Paladin 4',
    type: 'p',
    classes: [{ classType: 'paladin', level: 4 }]
  });
  const resPal4Turning = checkFeatPrerequisites('extra_turning', paladin4);
  assert.strictEqual(resPal4Turning.met, true, 'Paladin Level 4 should be able to learn Extra Turning');

  // 4. Bard Level 1 CAN learn Extra Music
  const bard = new Combatant({
    name: 'Bard',
    type: 'p',
    classes: [{ classType: 'bard', level: 1 }]
  });
  const resBardMusic = checkFeatPrerequisites('extra_music', bard);
  assert.strictEqual(resBardMusic.met, true, 'Bard Level 1 should be able to learn Extra Music');

  // 5. Druid Level 5 with WIS >= 13 CAN learn Natural Spell
  const druid4 = new Combatant({
    name: 'Druid 4',
    type: 'p',
    wis: 14,
    classes: [{ classType: 'druid', level: 4 }]
  });
  const resDru4Natural = checkFeatPrerequisites('natural_spell', druid4);
  assert.strictEqual(resDru4Natural.met, false, 'Druid Level 4 should not be able to learn Natural Spell');

  const druid5WisLow = new Combatant({
    name: 'Druid 5 Low Wis',
    type: 'p',
    wis: 10,
    classes: [{ classType: 'druid', level: 5 }]
  });
  const resDru5LowWis = checkFeatPrerequisites('natural_spell', druid5WisLow);
  assert.strictEqual(resDru5LowWis.met, false, 'Druid Level 5 with Wis < 13 should not be able to learn Natural Spell');

  const druid5 = new Combatant({
    name: 'Druid 5',
    type: 'p',
    wis: 14,
    classes: [{ classType: 'druid', level: 5 }]
  });
  const resDru5Natural = checkFeatPrerequisites('natural_spell', druid5);
  assert.strictEqual(resDru5Natural.met, true, 'Druid Level 5 with Wis >= 13 should be able to learn Natural Spell');

  // 6. Ride ranks test for Mounted Combat
  const rideLow = new Combatant({
    name: 'Ride Low',
    type: 'p',
    skills: { ride: { ranks: 0 } }
  });
  const resRideLow = checkFeatPrerequisites('mounted_combat', rideLow);
  assert.strictEqual(resRideLow.met, false, 'Character without Ride ranks should not be able to learn Mounted Combat');

  const rideOk = new Combatant({
    name: 'Ride Ok',
    type: 'p',
    skills: { ride: { ranks: 1 } }
  });
  const resRideOk = checkFeatPrerequisites('mounted_combat', rideOk);
  assert.strictEqual(resRideOk.met, true, 'Character with 1 Ride rank should be able to learn Mounted Combat');
});

test('Class Feature - Turn Undead Daily Resources (Cleric & Paladin)', () => {
  // 1. Cleric level 1 gets turn undead (3 + Cha Mod = 3 + 2 = 5)
  const cleric = new Combatant({
    name: 'Cleric 1',
    type: 'p',
    cha: 14, // +2 Mod
    classes: [{ classType: 'cleric', level: 1 }]
  });
  recalculateDailyAbilities(cleric);
  const turnCleric = cleric.dailyAbilities.find(a => a.name === 'Untote vertreiben');
  assert.ok(turnCleric, 'Cleric should have Turn Undead ability');
  assert.strictEqual(turnCleric.max, 5, 'Cleric Turn Undead max should be 5');

  // 2. Paladin level 3 does NOT get turn undead
  const paladin3 = new Combatant({
    name: 'Paladin 3',
    type: 'p',
    cha: 14, // +2 Mod
    classes: [{ classType: 'paladin', level: 3 }]
  });
  recalculateDailyAbilities(paladin3);
  const turnPal3 = paladin3.dailyAbilities.find(a => a.name === 'Untote vertreiben');
  assert.strictEqual(turnPal3, undefined, 'Paladin 3 should not have Turn Undead ability');

  // 3. Paladin level 4 gets turn undead (3 + Cha Mod = 3 + 2 = 5)
  const paladin4 = new Combatant({
    name: 'Paladin 4',
    type: 'p',
    cha: 14, // +2 Mod
    classes: [{ classType: 'paladin', level: 4 }]
  });
  recalculateDailyAbilities(paladin4);
  const turnPal4 = paladin4.dailyAbilities.find(a => a.name === 'Untote vertreiben');
  assert.ok(turnPal4, 'Paladin 4 should have Turn Undead ability');
  assert.strictEqual(turnPal4.max, 5, 'Paladin 4 Turn Undead max should be 5');

  // 4. Multiclass Cleric 1 / Paladin 4 (should share the turn ability and not duplicate it)
  const multiclass = new Combatant({
    name: 'Cleric 1 / Paladin 4',
    type: 'p',
    cha: 14,
    classes: [
      { classType: 'cleric', level: 1 },
      { classType: 'paladin', level: 4 }
    ]
  });
  recalculateDailyAbilities(multiclass);
  const turns = multiclass.dailyAbilities.filter(a => a.name === 'Untote vertreiben');
  assert.strictEqual(turns.length, 1, 'Should only have a single instance of Turn Undead');
  assert.strictEqual(turns[0].max, 5, 'Multiclass Turn Undead max should be 5');

  // 5. With extra_turning feat, Turn Undead max is boosted by +4 (total 9)
  const extraTurningPC = new Combatant({
    name: 'Extra Turning Cleric',
    type: 'p',
    cha: 14,
    classes: [{ classType: 'cleric', level: 1 }],
    feats: [{ id: 'extra_turning' }]
  });
  recalculateDailyAbilities(extraTurningPC);
  const turnExtra = extraTurningPC.dailyAbilities.find(a => a.name === 'Untote vertreiben');
  assert.ok(turnExtra);
  assert.strictEqual(turnExtra.max, 9, 'Turn Undead with Extra Turning should be 9');
});


