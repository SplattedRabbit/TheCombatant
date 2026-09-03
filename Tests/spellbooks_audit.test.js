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

  const requiredPhb2Spells = [
    'alter_fortune',
    'celerity',
    'lesser_celerity',
    'greater_celerity',
    'deflect',
    'lesser_deflect',
    'chain_missile',
    'heart_of_air',
    'heart_of_water',
    'heart_of_earth',
    'heart_of_fire',
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

  const requiredCaSpells = [
    'iron_silence',
    'wraithstrike',
    'sniper_s_shot',
    'guided_shot',
    'critical_strike',
    'bladeweave',
    'sonic_weapon',
    'arrow_mind',
    'wild_instincts',
    'tactical_teleportation'
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

  const requiredCsSpells = [
    'blockade',
    'armor_lock',
    'spell_theft',
    'lucky_streak',
    'assassins_darkness',
    'smugglers_covet'
  ];

  for (const id of requiredCsSpells) {
    assert.ok(cs[id], `CS spell ${id} must be registered`);
    assert.ok(cs[id].nameEn, `${id} must have nameEn`);
    assert.ok(typeof cs[id].level === 'number', `${id} must have level`);
    assert.ok(cs[id].description, `${id} must have description`);
    assert.ok(Array.isArray(cs[id].classLevels) && cs[id].classLevels.length > 0, `${id} must have classLevels`);
  }
});
