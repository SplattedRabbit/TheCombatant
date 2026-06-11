/**
 * @module    PCCompendiumTab
 * @summary   Rendert den Zauber-Kompendium-Tab mit Suche, Stufenfilter und Klassenfilterung. Erlaubt das Hinzufügen von Zaubern ins Zauberbuch.
 * @exports   renderCompendiumTab(pc), getAllCompendiumSpells(pc), isSpellEligibleForPC(spell, pc), getEligibleSpellLevelsForPC(pc), get/setSpellSearchQuery, get/setSpellFilterLevel, get/setShowAllSpells
 * @reads     pc.classes, pc.learnedSpells, pc.customSpells, pc.wizardProhibited1, pc.wizardProhibited2
 * @stateOps  Keine direkt — Zauber werden via Callback in PCSpellbookTab.js hinzugefügt
 * @depends   CombatSpells, getSpellSchoolCode, getSchoolCodeFromInput (spells.js), CombatRules (rules.js)
 * @notHere   Zauberbuch-Tabs / Slot-Verwaltung → PCSpellbookTab.js | Zauber-Definitionen → spells.js
 */
import { CombatSpells, getSpellSchoolCode, getSchoolCodeFromInput } from '../../../spells.js';
import { CombatRules } from '../../../rules.js';

let spellSearchQuery = '';
let spellFilterLevel = 'all';
let showAllSpells = false;

export function getSpellSearchQuery() { return spellSearchQuery; }
export function setSpellSearchQuery(val) { spellSearchQuery = val; }
export function getSpellFilterLevel() { return spellFilterLevel; }
export function setSpellFilterLevel(val) { spellFilterLevel = val; }
export function getShowAllSpells() { return showAllSpells; }
export function setShowAllSpells(val) { showAllSpells = val; }

export function getAllCompendiumSpells(pc) {
  const list = [];
  for (const [key, value] of Object.entries(CombatSpells.REGISTRY)) {
    list.push({ ...value, id: key });
  }
  if (Array.isArray(pc.customSpells)) {
    pc.customSpells.forEach(s => {
      list.push(s);
    });
  }
  return list;
}

export function isSpellEligibleForPC(spell, pc) {
  if (!Array.isArray(pc.classes) || pc.classes.length === 0) {
    return true;
  }

  // Block spells belonging to wizard prohibited schools
  const isWizard = pc.classes.some(c => c.classType === 'wizard');
  if (isWizard) {
    const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
    if (schoolCode && schoolCode !== 'univ') {
      const prob1 = getSchoolCodeFromInput(pc.wizardProhibited1);
      const prob2 = getSchoolCodeFromInput(pc.wizardProhibited2);
      if (schoolCode === prob1 || schoolCode === prob2) {
        return false;
      }
    }
  }

  if (!Array.isArray(spell.classLevels)) {
    return true;
  }
  return pc.classes.some(c => {
    const classMatch = spell.classLevels.find(cl => cl.class === c.classType);
    if (!classMatch) return false;
    const maxLvl = CombatRules.getMaxSpellLevel(c.classType, c.level);
    return classMatch.level <= maxLvl;
  });
}

export function getEligibleSpellLevelsForPC(pc) {
  if (!Array.isArray(pc.classes) || pc.classes.length === 0) {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  }
  
  const levels = new Set();
  pc.classes.forEach(c => {
    let table;
    if (['wizard', 'cleric', 'druid'].includes(c.classType)) {
      table = CombatRules.WIZ_CLER_DRU_TABLE;
    } else if (c.classType === 'sorcerer') {
      table = CombatRules.SORCERER_TABLE;
    } else if (c.classType === 'bard') {
      table = CombatRules.BARD_TABLE;
    } else if (['paladin', 'ranger'].includes(c.classType)) {
      table = CombatRules.PALADIN_RANGER_TABLE;
    } else {
      return;
    }
    
    const row = table[c.level];
    if (Array.isArray(row)) {
      row.forEach((val, lvl) => {
        if (['paladin', 'ranger'].includes(c.classType) && lvl === 0) {
          return;
        }
        levels.add(lvl);
      });
    }
  });
  
  return Array.from(levels).sort((a, b) => a - b);
}

export function renderCompendiumTab(pc) {
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const isCaster = hasClasses && pc.classes.some(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType));

  const eligibleLevels = (!showAllSpells && isCaster) ? getEligibleSpellLevelsForPC(pc) : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Reset selected level filter if it is no longer eligible
  if (spellFilterLevel !== 'all' && !eligibleLevels.includes(parseInt(spellFilterLevel))) {
    spellFilterLevel = 'all';
  }

  const searchBarHtml = `
    <div style="display: flex; gap: 3px; align-items: center; margin-bottom: 4px;">
      <input type="text" class="cinput comp-search-input" value="${spellSearchQuery}" placeholder="Zauber suchen..." style="flex: 1; font-size: 8.5px; height: 18px; padding: 0 4px;">
      <select class="cinput comp-level-select" style="width: 55px; font-size: 8px; height: 18px; padding: 0; outline: none; cursor: pointer;">
        <option value="all" ${spellFilterLevel === 'all' ? 'selected' : ''}>Alle</option>
        ${eligibleLevels.map(i => `<option value="${i}" ${spellFilterLevel === String(i) ? 'selected' : ''}>Grad ${i}</option>`).join('')}
      </select>
      <button class="btn btn-p wizard-open-btn" style="font-size: 8px; padding: 2px 6px; height: 18px; line-height: 12px; font-family:'IM Fell English SC', serif; cursor: pointer;">✦ Erstellen</button>
    </div>
    ${isCaster ? `
      <div style="display: flex; align-items: center; margin-bottom: 6px; padding: 0 2px;">
        <label style="display: flex; align-items: center; gap: 4px; font-size: 7.5px; color: var(--inkl); cursor: pointer; user-select: none;">
          <input type="checkbox" class="comp-filter-class-chk" ${showAllSpells ? '' : 'checked'} style="width: 9px; height: 9px; cursor: pointer; margin: 0;">
          <span>Nur passende Zauber für meine Klasse &amp; Stufe anzeigen</span>
        </label>
      </div>
    ` : ''}
  `;

  const filterByClass = !showAllSpells && isCaster;
  const allSpells = getAllCompendiumSpells(pc);
  const filtered = allSpells.filter(s => {
    const q = spellSearchQuery.toLowerCase().trim();
    const matchName = s.nameDe.toLowerCase().includes(q) || (s.nameEn && s.nameEn.toLowerCase().includes(q));
    const matchLevel = spellFilterLevel === 'all' || String(s.level) === spellFilterLevel;
    const matchClass = !filterByClass || isSpellEligibleForPC(s, pc);
    return matchName && matchLevel && matchClass;
  });

  filtered.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.nameDe.localeCompare(b.nameDe);
  });

  let compendiumListHtml = '';
  if (filtered.length === 0) {
    compendiumListHtml = `
      <div style="font-size: 8.5px; color: var(--inkl); font-style: italic; text-align: center; padding: 35px 0; background: rgba(0,0,0,0.01); border: 0.5px dashed rgba(200, 169, 110, 0.2); border-radius: 2px;">
        Keine passenden Zauber im Kompendium gefunden.
      </div>
    `;
  } else {
    compendiumListHtml = `
      <div style="display: flex; flex-direction: column; gap: 4px; max-height: 310px; overflow-y: auto; padding-right: 2px;" class="pc-scroll-compendium">
        ${filtered.map(s => {
          const isLearned = pc.learnedSpells && pc.learnedSpells.includes(s.id);
          const isCustom = s.id.startsWith('custom_');

          return `
            <div class="compendium-spell-item" data-name-de="${s.nameDe.toLowerCase()}" data-name-en="${(s.nameEn || '').toLowerCase()}" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.25); border: 0.5px solid rgba(200, 169, 110, 0.2); border-radius: 2px; padding: 3px 5px; font-size: 8px;">
              <div style="display: flex; flex-direction: column; cursor: pointer; flex: 1;" class="view-spell-details-btn" data-key="${s.id}">
                <span style="font-weight: 600; color: var(--red); font-family: 'Crimson Text', serif; font-size: 9px;">📜 ${s.nameDe} <span style="font-size: 7.5px; font-weight: normal; color: var(--inkl); font-style: italic;">Grad ${s.level} · ${s.school}</span></span>
                ${s.nameEn ? `<span style="font-size: 6.5px; color: var(--inkl); font-style: italic; padding-left: 12px; margin-top: -1px;">${s.nameEn}</span>` : ''}
              </div>
              <div style="display: flex; gap: 2.5px; align-items: center;">
                ${isLearned ? `
                  <span style="font-size: 7.5px; color: #1a5c1a; font-weight: bold; padding: 1px 4px;">Im Buch ✓</span>
                ` : `
                  <button class="btn learn-spell-btn" data-key="${s.id}" style="font-size: 7px; padding: 1px 4px; border-color: #c8a96e; color: #c8a96e; font-weight: bold;">+ Buch</button>
                `}
                ${isCustom ? `
                  <button class="btn delete-custom-spell-btn" data-key="${s.id}" style="font-size: 7.5px; padding: 1px 3px; border-color: transparent; color: var(--inkl); cursor: pointer;" title="Diesen eigenen Zauber unwiderruflich löschen">✕</button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return `
    ${searchBarHtml}
    ${compendiumListHtml}
  `;
}
