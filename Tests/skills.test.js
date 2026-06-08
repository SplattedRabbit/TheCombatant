// Tests/skills.test.js - Test suite for D&D 3.5e skills system (registry, modifiers, synergies, ranks limits)

import { test } from 'node:test';
import assert from 'node:assert';
import { SKILLS_REGISTRY } from '../js/data/skills-data.js';
import { Combatant } from '../js/models/Combatant.js';
import { CombatRules } from '../js/rules.js';
import { Stat } from '../js/models/Stat.js';

test('Skills Registry - Standard skills metadata validation', () => {
  assert.ok(SKILLS_REGISTRY.tumble, 'Tumble (Akrobatik) exists');
  assert.strictEqual(SKILLS_REGISTRY.tumble.abl, 'dex');
  assert.strictEqual(SKILLS_REGISTRY.tumble.hasACP, true);

  assert.ok(SKILLS_REGISTRY.spot, 'Spot (Entdecken) exists');
  assert.strictEqual(SKILLS_REGISTRY.spot.abl, 'wis');
  assert.strictEqual(SKILLS_REGISTRY.spot.trainedOnly, false);

  assert.ok(SKILLS_REGISTRY.use_magic_device, 'Use Magic Device exists');
  assert.strictEqual(SKILLS_REGISTRY.use_magic_device.abl, 'cha');
  assert.strictEqual(SKILLS_REGISTRY.use_magic_device.trainedOnly, true);
});

test('Combatant - Skill rank retrieval and initialization', () => {
  const pc = new Combatant({
    skills: {
      climb: { ranks: 4, misc: 1 },
      hide: { ranks: 2.5, misc: 0 }
    }
  });

  assert.strictEqual(pc.getSkillRanks('climb'), 4);
  assert.strictEqual(pc.getSkillMisc('climb'), 1);
  assert.strictEqual(pc.getSkillRanks('hide'), 2.5);
  assert.strictEqual(pc.getSkillRanks('listen'), 0);
  assert.strictEqual(pc.getSkillMisc('listen'), 0);
});

test('Combatant - Basic skill modifier calculation', () => {
  const pc = new Combatant({
    str: new Stat(14), // +2 mod
    skills: {
      climb: { ranks: 3, misc: 1 }
    }
  });

  // Climb modifier = 3 (ranks) + 2 (Str mod) + 1 (misc) = 6
  assert.strictEqual(pc.getSkillModifier('climb'), 6);
});

test('Combatant - Synergy bonuses resolution', () => {
  const pc = new Combatant({
    dex: new Stat(10), // +0 mod
    cha: new Stat(10), // +0 mod
    skills: {
      tumble: { ranks: 5, misc: 0 },
      bluff: { ranks: 5, misc: 0 },
      spellcraft: { ranks: 5, misc: 0 },
      decipher_script: { ranks: 5, misc: 0 }
    }
  });

  // Tumble >= 5 ranks gives +2 synergy to Balance and Escape Artist
  assert.strictEqual(pc.getSkillModifier('balance'), 2, 'Balance gets +2 synergy from Tumble');
  assert.strictEqual(pc.getSkillModifier('escape_artist'), 2, 'Escape Artist gets +2 synergy from Tumble');

  // Bluff >= 5 ranks gives +2 synergy to Diplomacy, Disguise, Intimidate
  assert.strictEqual(pc.getSkillModifier('diplomacy'), 2, 'Diplomacy gets +2 synergy from Bluff');
  assert.strictEqual(pc.getSkillModifier('disguise'), 2, 'Disguise gets +2 synergy from Bluff');
  assert.strictEqual(pc.getSkillModifier('intimidate'), 2, 'Intimidate gets +2 synergy from Bluff');

  // Spellcraft >= 5 and Decipher Script >= 5 give +2 each to Use Magic Device (total +4)
  assert.strictEqual(pc.getSkillModifier('use_magic_device'), 4, 'UMD gets +4 synergy from Spellcraft + Decipher Script');
});

test('Combatant - Condition penalties application on skills', () => {
  const pc = new Combatant({
    wis: new Stat(14), // +2 mod
    skills: {
      spot: { ranks: 2, misc: 0 }
    }
  });

  // Base spot: 2 (ranks) + 2 (Wis mod) = 4
  assert.strictEqual(pc.getSkillModifier('spot'), 4);

  // Apply "Erschüttet" (Shaken) condition
  pc.applyCondition('Erschüttet');
  // Spot modifier = 2 (ranks) + 2 (Wis mod) - 2 (shaken penalty) = 2
  assert.strictEqual(pc.getSkillModifier('spot'), 2);

  // Remove condition
  pc.removeCondition('Erschüttet');
  assert.strictEqual(pc.getSkillModifier('spot'), 4);
});

test('CombatRules - Class skills mapping and checks', () => {
  const pcRogueFighter = {
    classes: [
      { classType: 'rogue', level: 3 },
      { classType: 'fighter', level: 1 }
    ]
  };

  // Climb is fighter and rogue class skill -> true
  assert.strictEqual(CombatRules.isClassSkill('climb', pcRogueFighter), true);
  // Tumble is rogue class skill -> true
  assert.strictEqual(CombatRules.isClassSkill('tumble', pcRogueFighter), true);
  // Spellcraft is not a rogue/fighter class skill -> false
  assert.strictEqual(CombatRules.isClassSkill('spellcraft', pcRogueFighter), false);
  
  // Spellcraft is wizard class skill -> true for wizard
  const pcWizard = { classes: [{ classType: 'wizard', level: 1 }] };
  assert.strictEqual(CombatRules.isClassSkill('spellcraft', pcWizard), true);
});

test('CombatRules - Max ranks calculations (Class vs Cross-class)', () => {
  // Total level 4 PC (3 Rogue / 1 Fighter)
  const pc = {
    classes: [
      { classType: 'rogue', level: 3 },
      { classType: 'fighter', level: 1 }
    ]
  };

  // Max ranks class skill (tumble) = total level + 3 = 4 + 3 = 7
  assert.strictEqual(CombatRules.getPCMaxRanks('tumble', pc), 7);

  // Max ranks cross-class skill (spellcraft) = (total level + 3) / 2 = 7 / 2 = 3.5
  assert.strictEqual(CombatRules.getPCMaxRanks('spellcraft', pc), 3.5);
});
