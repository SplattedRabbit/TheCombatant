import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Spellbook Audit - Player Handbook (PHB) Completeness & Health', () => {
  const phbPath = path.resolve(__dirname, '../data/spells-phb.json');
  const phb = JSON.parse(fs.readFileSync(phbPath, 'utf8'));

  const requiredPhbSpells = [
    'cure_minor_wounds',
    'inflict_minor_wounds',
    'read_magic',
    'daze',
    'know_direction',
    'comprehend_languages',
    'aid',
    'animal_messenger',
    'bane',
    'command',
    'nightmare',
    'power_word_kill',
    'magic_missile',
    'fireball',
    'heal',
    'harm',
    'wish'
  ];

  for (const id of requiredPhbSpells) {
    assert.ok(phb[id], `PHB spell ${id} must be registered`);
    assert.ok(phb[id].nameEn, `${id} must have nameEn`);
    assert.ok(typeof phb[id].level === 'number', `${id} must have level`);
    assert.ok(phb[id].school, `${id} must have school`);
    assert.ok(phb[id].description, `${id} must have description`);
  }

  // Ensure no malformed keys remain
  const malformedKeys = Object.keys(phb).filter(k => k.includes('__') || k.endsWith('_'));
  assert.deepStrictEqual(malformedKeys, [], 'No malformed keys should remain in spells-phb.json');
});

test('Spellbook Audit - Player Handbook II (PHB II) Completeness & Health', () => {
  const phb2Path = path.resolve(__dirname, '../data/spells-phb2.json');
  const phb2 = JSON.parse(fs.readFileSync(phb2Path, 'utf8'));

  assert.ok(Object.keys(phb2).length === 19, `PHB2 must contain exactly 19 RAW spells, found ${Object.keys(phb2).length}`);

  const requiredPhb2Spells = [
    'alter_fortune',
    'celerity',
    'lesser_celerity',
    'greater_celerity',
    'deflect',
    'lesser_deflect',
    'dimension_hop',
    'evards_menacing_tentacles',
    'seeking_ray',
    'kelgores_fire_bolt',
    'kelgores_grave_mist',
    'energy_aegis',
    'stay_the_hand',
    'hesitate',
    'chasing_perfection',
    'vertigo_field',
    'legion_of_sentinels',
    'sure_strike',
    'blade_brothers'
  ];

  for (const id of requiredPhb2Spells) {
    assert.ok(phb2[id], `PHB2 spell ${id} must be registered`);
    assert.ok(phb2[id].nameEn, `${id} must have nameEn`);
    assert.ok(typeof phb2[id].level === 'number', `${id} must have level`);
    assert.ok(phb2[id].description, `${id} must have description`);
  }
});

test('Spellbook Audit - Complete Adventurer (CA) Completeness & Health', () => {
  const caPath = path.resolve(__dirname, '../data/spells-ca.json');
  const ca = JSON.parse(fs.readFileSync(caPath, 'utf8'));

  assert.ok(Object.keys(ca).length === 10, `Complete Adventurer must contain exactly 10 RAW spells, found ${Object.keys(ca).length}`);

  const requiredCaSpells = [
    'iron_silence',
    'wraithstrike',
    'sniper_s_shot',
    'snipers_eye',
    'guided_shot',
    'critical_strike',
    'bladeweave',
    'blindsight',
    'sonic_weapon',
    'arrow_mind'
  ];

  for (const id of requiredCaSpells) {
    assert.ok(ca[id], `CA spell ${id} must be registered`);
    assert.ok(ca[id].nameEn, `${id} must have nameEn`);
    assert.ok(typeof ca[id].level === 'number', `${id} must have level`);
    assert.ok(ca[id].description, `${id} must have description`);
  }
});

test('Spellbook Audit - Complete Scoundrel (CS) Completeness & Health', () => {
  const csPath = path.resolve(__dirname, '../data/spells-cs.json');
  const cs = JSON.parse(fs.readFileSync(csPath, 'utf8'));

  assert.ok(Object.keys(cs).length === 28, `Complete Scoundrel must contain exactly 28 RAW spells, found ${Object.keys(cs).length}`);

  const requiredCsSpells = [
    'blockade',
    'armor_lock',
    'spell_theft',
    'lucky_streak',
    'assassins_darkness',
    'animate_instrument',
    'aquatic_escape',
    'catapult',
    'create_fetch',
    'disobedience',
    'enlarge_weapon',
    'evacuation_rune',
    'fatal_flame',
    'grasping_wall',
    'harmonic_void',
    'healers_vision',
    'mage_burr',
    'manifestation_of_the_deity',
    'mimicry',
    'opportune_dodge',
    'scry_location',
    'siphon',
    'smoke_stairs',
    'spore_field',
    'spymasters_coin',
    'wall_of_vermin',
    'wand_modulation',
    'winged_watcher'
  ];

  for (const id of requiredCsSpells) {
    assert.ok(cs[id], `CS spell ${id} must be registered`);
    assert.ok(cs[id].nameEn, `${id} must have nameEn`);
    assert.ok(cs[id].nameDe, `${id} must have nameDe`);
    assert.ok(typeof cs[id].level === 'number', `${id} must have level`);
    assert.ok(cs[id].school, `${id} must have school`);
    assert.ok(cs[id].description, `${id} must have description`);
    assert.ok(Array.isArray(cs[id].classes) && cs[id].classes.length > 0, `${id} must have classes`);
    assert.ok(Array.isArray(cs[id].classLevels) && cs[id].classLevels.length > 0, `${id} must have classLevels`);
    for (const cl of cs[id].classLevels) {
      assert.ok(typeof cl.class === 'string' && cl.class.length > 0, `${id} classLevel must have a class`);
      assert.ok(typeof cl.level === 'number' && cl.level >= 0 && cl.level <= 9, `${id} classLevel must have valid level`);
    }
  }
});
