// Tests/components.test.js - Test suite for player sheet UI components (Spellbook, Compendium, & Skills tabs)

import { test } from 'node:test';
import assert from 'node:assert';
import { CombatSpells } from '../js/spells.js';
import { findSpell, renderSpellbookTab, renderPreparedSlotsArea } from '../js/ui/components/player/PCSpellbookTab.js';
import {
  getAllCompendiumSpells,
  isSpellEligibleForPC,
  getEligibleSpellLevelsForPC,
  renderCompendiumTab,
  setSpellSearchQuery,
  getSpellSearchQuery,
  setSpellFilterLevel,
  getSpellFilterLevel,
  setShowAllSpells,
  getShowAllSpells
} from '../js/ui/components/player/PCCompendiumTab.js';
import { renderPCSkills } from '../js/ui/components/player/PCSkillsTab.js';
import { renderPCHealthGlobe, updatePCHealthGlobeDisplay } from '../js/ui/components/player/PCHealthGlobe.js';
import { renderPCHeader } from '../js/ui/components/player/PCHeader.js';
import { Combatant } from '../js/models/Combatant.js';
import { Stat } from '../js/models/Stat.js';

// Setup mock spells in registry
CombatSpells.REGISTRY['magic_missile'] = {
  nameDe: 'Magisches Geschoss',
  nameEn: 'Magic Missile',
  school: 'Hervorrufung',
  level: 1,
  classLevels: [{ class: 'wizard', level: 1 }]
};

CombatSpells.REGISTRY['fireball'] = {
  nameDe: 'Feuerball',
  nameEn: 'Fireball',
  school: 'Hervorrufung',
  level: 3,
  classLevels: [{ class: 'wizard', level: 3 }, { class: 'sorcerer', level: 3 }]
};

CombatSpells.REGISTRY['cure_light_wounds'] = {
  nameDe: 'Leichte Wunden heilen',
  nameEn: 'Cure Light Wounds',
  school: 'Beschwörung',
  level: 1,
  classLevels: [{ class: 'cleric', level: 1 }, { class: 'druid', level: 1 }]
};

test('PCSpellbookTab - findSpell finds standard and custom spells', () => {
  const pc = {
    customSpells: [
      { id: 'custom_test', nameDe: 'Eigener Testzauber', school: 'Illusion', level: 2 }
    ]
  };

  // Find standard spell
  const spell1 = findSpell(pc, 'magic_missile');
  assert.ok(spell1);
  assert.strictEqual(spell1.nameDe, 'Magisches Geschoss');

  // Find custom spell by ID
  const spell2 = findSpell(pc, 'custom_test');
  assert.ok(spell2);
  assert.strictEqual(spell2.nameDe, 'Eigener Testzauber');

  // Find custom spell by name
  const spell3 = findSpell(pc, 'Eigener Testzauber');
  assert.ok(spell3);
  assert.strictEqual(spell3.id, 'custom_test');

  // Non-existent spell
  const spellNone = findSpell(pc, 'invalid_key');
  assert.strictEqual(spellNone, null);
});

test('PCSpellbookTab - renderSpellbookTab HTML layout structure & slots', () => {
  const pc = {
    classes: [{ classType: 'wizard', level: 3 }],
    spellSlots: {
      0: { max: 4, used: 2 },
      1: { max: 2, used: 1 },
      2: { max: 1, used: 0 }
    },
    learnedSpells: ['magic_missile'],
    customSpells: []
  };

  const html = renderSpellbookTab(pc);

  // Checks header title
  assert.ok(html.includes('🔮 Zauberslots &amp; Tageskontingente'));

  // Checks newly compacted bubbles container (no wrapping, no scrollbar auto overflow)
  assert.ok(html.includes('display: flex; gap: 0.5px; flex-wrap: nowrap;'));

  // Checks that slots bubbles exist
  assert.ok(html.includes('class="spell-bubble use-icon use-icon-spell'));

  // Checks used slots representation
  assert.ok(html.includes('used'));

  // Checks learned spells header
  assert.ok(html.includes('Grad 1'));
  
  // Checks spell name rendering
  assert.ok(html.includes('Magisches Geschoss'));
});

test('PCSpellbookTab - renderPreparedSlotsArea prepared slots list', () => {
  const pc = new Combatant({
    classes: [{ classType: 'wizard', level: 3 }],
    spellSlots: {
      0: { max: 4, used: 2 },
      1: { max: 2, used: 1 },
      2: { max: 1, used: 0 }
    },
    learnedSpells: ['magic_missile'],
    preparedSpells: [
      { id: 'prep_1', spellKey: 'magic_missile', metamagic: [], isUsed: false, isSpecialist: false }
    ]
  });

  const html = renderPreparedSlotsArea(pc);

  // Checks prepared section header
  assert.ok(html.includes('🌅 Tägliche Slot-Belegung (Vorbereitete Zauber)'));

  // Checks prepared spell name rendering
  assert.ok(html.includes('Magisches Geschoss'));
  
  // Checks action buttons
  assert.ok(html.includes('class="btn cast-prepared-btn"'));
  assert.ok(html.includes('class="btn unprepare-prepared-btn"'));
});

test('PCCompendiumTab - state getters & setters validation', () => {
  setSpellSearchQuery('Feuerball');
  assert.strictEqual(getSpellSearchQuery(), 'Feuerball');

  setSpellFilterLevel('3');
  assert.strictEqual(getSpellFilterLevel(), '3');

  setShowAllSpells(true);
  assert.strictEqual(getShowAllSpells(), true);

  // Reset state
  setSpellSearchQuery('');
  setSpellFilterLevel('all');
  setShowAllSpells(false);
});

test('PCCompendiumTab - getAllCompendiumSpells gets all spells including custom', () => {
  const pc = {
    customSpells: [
      { id: 'custom_spell_1', nameDe: 'Schattenlauf', school: 'Illusion', level: 1 }
    ]
  };

  const all = getAllCompendiumSpells(pc);
  assert.ok(all.some(s => s.id === 'magic_missile'));
  assert.ok(all.some(s => s.id === 'custom_spell_1'));
  assert.strictEqual(all.find(s => s.id === 'custom_spell_1').nameDe, 'Schattenlauf');
});

test('PCCompendiumTab - isSpellEligibleForPC handles wizard prohibited schools', () => {
  // Wizard specializing in Evocation with Prohibited School: Illusion (ill) and Necromancy (nec)
  const pc = {
    classes: [{ classType: 'wizard', level: 3 }],
    wizardSpecialization: 'evocation',
    wizardProhibited1: 'Illusion',
    wizardProhibited2: 'Nekromantie'
  };

  const evocSpell = { id: 'magic_missile', school: 'Hervorrufung', classLevels: [{ class: 'wizard', level: 1 }] };
  const illusSpell = { id: 'custom_illus', school: 'Illusion', classLevels: [{ class: 'wizard', level: 1 }] };

  assert.strictEqual(isSpellEligibleForPC(evocSpell, pc), true, 'Evocation should be allowed');
  assert.strictEqual(isSpellEligibleForPC(illusSpell, pc), false, 'Prohibited school Illusion should be blocked');
});

test('PCCompendiumTab - getEligibleSpellLevelsForPC returns eligible spell levels per class table', () => {
  // Paladin Level 4 gets level 1 spells
  const pcPaladin = {
    classes: [{ classType: 'paladin', level: 4 }]
  };
  const paladinLevels = getEligibleSpellLevelsForPC(pcPaladin);
  // D&D 3.5e Paladin lvl 4 table row is [0, 0] -> wait, level 0 is skipped for paladins, so level 1 is eligible.
  assert.deepEqual(paladinLevels, [1]);

  // Wizard Level 3 gets levels 0, 1, 2
  const pcWizard = {
    classes: [{ classType: 'wizard', level: 3 }]
  };
  const wizardLevels = getEligibleSpellLevelsForPC(pcWizard);
  assert.deepEqual(wizardLevels, [0, 1, 2]);
});

test('PCCompendiumTab - renderCompendiumTab renders filtered and correct list', () => {
  const pc = {
    classes: [{ classType: 'wizard', level: 5 }],
    learnedSpells: ['magic_missile'],
    customSpells: []
  };

  setSpellSearchQuery('Feuer');
  const html = renderCompendiumTab(pc);

  // Check search bar elements exist
  assert.ok(html.includes('Zauber suchen...'));
  
  // Feuerball matches "Feuer" query
  assert.ok(html.includes('Feuerball'));

  // Leichte Wunden heilen does not match "Feuer" query
  assert.ok(!html.includes('Leichte Wunden heilen'));

  // Reset query
  setSpellSearchQuery('');
});

test('PCSkillsTab - renderPCSkills UI components structure', () => {
  const pc = new Combatant({
    classes: [{ classType: 'rogue', level: 3 }],
    skills: {
      climb: { ranks: 4, misc: 1 },
      hide: { ranks: 2, misc: 0 }
    }
  });

  const originalGetElementById = globalThis.document.getElementById;
  let renderedHtml = '';
  
  globalThis.document.getElementById = (id) => {
    if (id === 'pcSkillsBody') {
      return {
        set innerHTML(val) {
          renderedHtml = val;
        },
        get innerHTML() {
          return renderedHtml;
        }
      };
    }
    return originalGetElementById(id);
  };

  renderPCSkills(pc);

  // Restore
  globalThis.document.getElementById = originalGetElementById;

  // Validate the generated HTML
  assert.ok(renderedHtml.includes('Fertigkeit suchen...'));
  // Spot (Entdecken) is in registry and should be rendered
  assert.ok(renderedHtml.includes('Entdecken'));
  // Climb is in registry and should be rendered
  assert.ok(renderedHtml.includes('Klettern'));
  // Rogue has Climb and Hide as class skills ('K') - max ranks: 3 lvl + 3 = 6
  assert.ok(renderedHtml.includes('title="Klassenfertigkeit (Max. Ränge: 6)">K</span>'));
  // Rogue does not have Spellcraft as class skill ('KÜ' for cross-class) - max ranks: (3 + 3) / 2 = 3
  assert.ok(renderedHtml.includes('title="Klassenübergreifend (Max. Ränge: 3)">KÜ</span>'));
  // Spellcraft is trained only, and ranks are 0 -> should show "Geübt" label
  assert.ok(renderedHtml.includes('title="Kann unübgeübt nicht genutzt werden (Trained Only)">Geübt</span>'));

  // Checks the centered Gesamt total label and readonly attribute modifier input
  assert.ok(renderedHtml.includes('Gesamt:'));
  assert.ok(renderedHtml.includes('Attr:'));
  assert.ok(renderedHtml.includes('readonly'));

  // Checks the new skills legend
  assert.ok(renderedHtml.includes('Klassenfertigkeit (Max. Ränge: Stufe + 3)'));
});

test('PCHealthGlobe - render and update calculations', () => {
  const pc = new Combatant({
    hp: 80,
    maxHP: 100,
    conditions: [
      { n: 'Temp-HP', tmpVal: 20 }
    ]
  });

  const originalGetElementById = globalThis.document.getElementById;
  
  // Create mock container using setup's mock factory via document.createElement
  const container = globalThis.document.createElement('div');
  container.id = 'pcHealthGlobe';

  globalThis.document.getElementById = (id) => {
    if (id === 'pcHealthGlobe') {
      return container;
    }
    return originalGetElementById(id);
  };

  renderPCHealthGlobe(pc);

  // Restore document.getElementById
  globalThis.document.getElementById = originalGetElementById;

  // Assert basic rendering structure
  const html = container.innerHTML;
  assert.ok(html.includes('globe-wrapper'), 'Should render globe-wrapper');
  assert.ok(html.includes('liquid-chamber'), 'Should render liquid-chamber');
  assert.ok(html.includes('liquid-base'), 'Should render liquid-base');
  assert.ok(html.includes('liquid-temp'), 'Should render liquid-temp');
  assert.ok(html.includes('globe-hp-cur'), 'Should render current HP input');

  // Verify fill calculations:
  // pc.hp = 80, maxHP = 100, tempHP = 20
  // baseMaxHP = maxHP - tempHP = 80
  // baseHP = hp - tempHP = 60
  // basePct = baseHP / baseMaxHP * 100 = 60 / 80 * 100 = 75%
  // tempPct = tempHP / baseMaxHP * 100 = 20 / 80 * 100 = 25%
  assert.ok(html.includes('height: 75%'), 'Red liquid should be 75% high');
  assert.ok(html.includes('height: 25%'), 'Blue liquid should be 25% high');
  assert.ok(html.includes('bottom: 75%'), 'Blue liquid should start at bottom: 75%');
  assert.ok(html.includes('display: block'), 'Temp HP bar should be visible');
  assert.ok(html.includes('+20 Temp'), 'Temp HP badge should display +20 Temp');
});

test('PCHeader - renders final initiative correctly under health bar', () => {
  const originalGetElementById = globalThis.document.getElementById;
  const headerContainer = globalThis.document.createElement('div');
  headerContainer.id = 'playerHeader';

  globalThis.document.getElementById = (id) => {
    if (id === 'playerHeader') {
      return headerContainer;
    }
    return originalGetElementById(id);
  };

  // 1. PC has not rolled initiative (init = 0)
  const pcNoRoll = new Combatant({
    name: 'Unrolled Hero',
    type: 'p',
    dex: 14, // +2 mod
    init: 0
  });

  renderPCHeader(pcNoRoll, 'feats');
  let html = headerContainer.innerHTML;
  assert.ok(html.includes('Initiative: --'), 'Should show Initiative: -- when not rolled');

  // 2. PC has rolled initiative (init = 12), has Improved Initiative feat (+4) and iniMisc = 1
  const pcWithRoll = new Combatant({
    name: 'Rolled Hero',
    type: 'p',
    dex: 14, // +2 mod
    iniMisc: 1,
    init: 12,
    feats: [{ id: 'improved_initiative' }]
  });

  renderPCHeader(pcWithRoll, 'feats');
  html = headerContainer.innerHTML;
  // 12 (rolled) + 2 (dex) + 1 (misc) + 4 (feat) = 19
  assert.ok(html.includes('Initiative: 19'), 'Should show Initiative: 19 when rolled with modifiers');

  // Restore document.getElementById
  globalThis.document.getElementById = originalGetElementById;
});
