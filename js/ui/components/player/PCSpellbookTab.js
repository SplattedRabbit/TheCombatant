import { CombatSpells } from '../../../spells.js';
import { getSpellSchoolCode, getSchoolLabel } from '../../../spells.js';
import { SpellSlotCalculator } from '../../../rules/SpellSlotCalculator.js';

export function findSpell(pc, key) {
  if (CombatSpells.REGISTRY[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find(s => s.id === key || s.nameDe === key);
    if (found) return found;
  }
  return null;
}

export function renderSpellbookTab(pc) {
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const activeCasters = hasClasses ? pc.classes.filter(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType)) : [];
  
  const hasPrepared = activeCasters.some(c => ['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType));
  const hasSpontaneous = activeCasters.some(c => ['sorcerer', 'bard'].includes(c.classType));

  const hasCantrips = !hasClasses || pc.classes.some(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid'].includes(c.classType));
  
  let minLvl = hasCantrips ? 0 : 1;
  let maxLvl = 9;
  if (activeCasters.length === 1 && ['paladin', 'ranger'].includes(activeCasters[0].classType)) {
    maxLvl = 4;
  }
  if (activeCasters.length === 1 && activeCasters[0].classType === 'bard') {
    maxLvl = 6;
  }

  const levelsToRender = [];
  for (let i = minLvl; i <= maxLvl; i++) levelsToRender.push(i);

  const isSlotsCalculated = hasClasses;

  // 1. Unified Spell Slots Grid (Top of Spellbook)
  let slotsGridHtml = `
    <div style="background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); border-radius: 2px; padding: 4px 6px; margin-bottom: 6px;">
      <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2); margin-bottom: 3px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
        <span>🔮 Zauberslots &amp; Tageskontingente</span>
        <span style="font-size: 6.5px; font-weight: normal; color: var(--inkl); font-style: italic;">Klicke Kreise zum Verbrauchen</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 8px;">
        ${levelsToRender.map(spellLvl => {
          const max = pc.spellSlots[spellLvl]?.max || 0;
          const used = pc.spellSlots[spellLvl]?.used || 0;
          let bubbles = '';
          for (let i = 1; i <= max; i++) {
            const spent = i <= used;
            bubbles += `
              <span class="spell-bubble use-icon use-icon-spell ${spent ? 'used' : ''}" data-lvl="${spellLvl}" data-idx="${i}" title="${spent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}">🔮</span>
            `;
          }
          return `
            <div style="display: flex; align-items: center; gap: 3px; font-size: 7.5px; line-height: 1;">
              <span style="font-weight: 600; min-width: 25px;">Grad ${spellLvl}:</span>
              <input type="number" value="${max}" class="cinput max-slots-inp" data-lvl="${spellLvl}" style="width: 14px; font-size: 7px; padding: 0; text-align: center; height: 10px; border-radius: 1px; border: 0.5px solid var(--pb); outline: none; margin-right: 1px; ${isSlotsCalculated ? 'background:rgba(0,0,0,0.04); color:var(--inkl); cursor:not-allowed;' : ''}" ${isSlotsCalculated ? 'readonly tabindex="-1"' : ''}>
              <div style="display: flex; gap: 0.5px; flex-wrap: nowrap;">
                ${bubbles || '<span style="font-size: 6.5px; color: var(--inkl);">✕</span>'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // 2. Area B: Known Spells Library
  let learnedSpellsHtml = '';
  const learnedSpells = Array.isArray(pc.learnedSpells) ? pc.learnedSpells : [];
  if (learnedSpells.length === 0) {
    learnedSpellsHtml = `
      <div style="font-size: 8.5px; color: var(--inkl); font-style: italic; text-align: center; padding: 35px 10px; background: rgba(0,0,0,0.02); border: 0.5px dashed var(--pb); border-radius: 2px;">
        Dein Zauberbuch ist noch leer.<br>
        <span style="font-size: 7.5px; margin-top: 3px; display: block;">Wechsle zum <strong>Zauberkompendium</strong>, um Zauber hinzuzufügen!</span>
      </div>
    `;
  } else {
    const spells = learnedSpells.map(key => {
      const spell = findSpell(pc, key);
      return spell ? { ...spell, id: key } : null;
    }).filter(Boolean);

    spells.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.nameDe.localeCompare(b.nameDe);
    });

    const grouped = {};
    spells.forEach(s => {
      if (!grouped[s.level]) grouped[s.level] = [];
      grouped[s.level].push(s);
    });

    learnedSpellsHtml = `
      <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2); margin-bottom: 5px; font-weight: bold;">
        📖 Zauberbibliothek (Gelernte Zauber)
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; max-height: 400px; overflow-y: auto; padding-right: 2px;" class="pc-scroll-spellbook">
        ${Object.keys(grouped).map(lvl => {
          const levelSpells = grouped[lvl];
          return `
            <div style="margin-bottom: 2px;">
              <div style="font-family: 'IM Fell English SC', serif; font-size: 8px; color: var(--inkl); border-bottom: 0.5px dashed rgba(200, 169, 110, 0.4); padding-bottom: 1px; font-weight: bold; margin-bottom: 4px; letter-spacing: 0.5px;">
                Grad ${lvl}
              </div>
              <div style="display: flex; flex-direction: column; gap: 3.5px;">
                ${levelSpells.map(s => {
                  return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.3); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 3px 5px; font-size: 8px; transition: background-color 0.15s;">
                      <span style="font-weight: 600; cursor: pointer; color: var(--red); font-family: 'Crimson Text', serif; font-size: 9px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 4px;" class="view-spell-details-btn" data-key="${s.id}">
                        📜 ${s.nameDe} <span style="font-size: 7.5px; font-weight: normal; color: var(--inkl); font-style: italic;">(${s.school})</span>
                      </span>
                      <div style="display: flex; gap: 3px; align-items: center; flex-shrink: 0; position: relative; z-index: 1;">
                        ${hasPrepared 
                          ? `<button class="btn prepare-spell-btn" data-key="${s.id}" style="font-size: 7.5px; padding: 1px 5px; cursor: pointer; border-radius: 2.5px; border-color:var(--pb); color:var(--ink); font-weight:bold;">Vorbereiten</button>`
                          : ''
                        }
                        ${hasSpontaneous 
                          ? `<button class="btn cast-spontaneous-btn" data-key="${s.id}" style="font-size: 7.5px; padding: 1px 5px; cursor: pointer; border-radius: 2.5px; background:rgba(139,26,26,0.1); border-color:var(--red); color:var(--red); font-weight:bold;">Wirken</button>`
                          : ''
                        }
                        <button class="btn remove-spell-btn" data-key="${s.id}" style="font-size: 7.5px; padding: 1px 4px; border-color: transparent; color: var(--inkl); cursor: pointer;" title="Aus Zauberbuch entfernen">✕</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  return `
    ${slotsGridHtml}
    ${learnedSpellsHtml}
  `;
}

export function renderPreparedSlotsArea(pc) {
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const activeCasters = hasClasses ? pc.classes.filter(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType)) : [];
  const hasPrepared = activeCasters.some(c => ['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType));

  if (!hasPrepared) {
    return `
      <div style="font-size: 8.5px; color: var(--inkl); font-style: italic; text-align: center; padding: 35px 10px; background: rgba(0,0,0,0.02); border: 0.5px dashed var(--pb); border-radius: 2px;">
        🌅 Spontane Zauberwirker bereiten keine Zauber vor.
      </div>
    `;
  }

  const hasCantrips = !hasClasses || pc.classes.some(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid'].includes(c.classType));
  
  let minLvl = hasCantrips ? 0 : 1;
  let maxLvl = 9;
  if (activeCasters.length === 1 && ['paladin', 'ranger'].includes(activeCasters[0].classType)) {
    maxLvl = 4;
  }
  if (activeCasters.length === 1 && activeCasters[0].classType === 'bard') {
    maxLvl = 6;
  }

  const levelsToRender = [];
  for (let i = minLvl; i <= maxLvl; i++) levelsToRender.push(i);

  const isWizard = pc.classes && pc.classes.some(c => c.classType === 'wizard');
  const wizardSpecialization = pc.wizardSpecialization || 'none';
  const hasSpecSlot = isWizard && wizardSpecialization !== 'none';

  return `
    <div style="background: rgba(200, 169, 110, 0.04); border: 0.5px solid rgba(200, 169, 110, 0.3); border-radius: 2px; padding: 4px 6px;">
      <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2); margin-bottom: 5px; font-weight: bold;">
        🌅 Tägliche Slot-Belegung (Vorbereitete Zauber)
      </div>
      <!-- Spell Templates Management UI -->
      <div style="display: flex; gap: 4px; align-items: center; justify-content: space-between; background: rgba(200, 169, 110, 0.06); border: 0.5px solid rgba(200, 169, 110, 0.2); border-radius: 2px; padding: 3px 5px; margin-bottom: 6px;">
        <span style="font-size: 7.5px; color: var(--inkl); font-weight: bold;">📁 Vorlagen:</span>
        <div style="display: flex; gap: 3px; align-items: center; flex: 1; justify-content: flex-end;">
          <select class="cinput select-spell-template" style="font-size: 7px; padding: 1px 3px; height: 14px; max-width: 90px; border-radius: 1px; border: 0.5px solid var(--pb); outline: none; background: white; color: var(--ink);">
            <option value="">-- Laden --</option>
            ${Object.keys(pc.spellTemplates || {}).map(name => `<option value="${name}">${name}</option>`).join('')}
          </select>
          <button class="btn save-spell-template-btn" style="font-size: 7px; padding: 1px 4px; height: 14px; line-height: 1; font-weight: bold; border-color: var(--pb); cursor: pointer;" title="Aktuelles Set als Vorlage speichern">💾 Speichern</button>
          <button class="btn delete-spell-template-btn" style="font-size: 7px; padding: 1px 3px; height: 14px; line-height: 1; border-color: transparent; color: var(--inkl); cursor: pointer;" title="Ausgewählte Vorlage löschen">✕</button>
          <button class="btn clear-prepared-spells-btn" style="font-size: 7px; padding: 1px 4px; height: 14px; line-height: 1; border-color: var(--red); background: rgba(139,26,26,0.05); color: var(--red); font-weight: bold; cursor: pointer;" title="Alle vorbereiteten Zauber entfernen">🧹 Leeren</button>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px; max-height: 400px; overflow-y: auto; padding-right: 2px;" class="pc-scroll-spellbook">
        ${levelsToRender.map(lvl => {
          const max = pc.spellSlots[lvl]?.max || 0;
          if (max === 0) return '';

          const hasSpecSlotAtLvl = hasSpecSlot && lvl >= 1;
          const specSchoolName = hasSpecSlotAtLvl ? getSchoolLabel(wizardSpecialization) : '';

          // Get prepared spells at this level
          const preps = (pc.preparedSpells || []).map(p => {
            const spell = findSpell(pc, p.spellKey);
            if (!spell) return null;
            const adjustedLevel = SpellSlotCalculator.getAdjustedSpellLevel(spell, p.metamagic);
            return { ...p, spell, adjustedLevel };
          }).filter(p => p && p.adjustedLevel === lvl);

          const specPreps = preps.filter(p => p.isSpecialist);
          const regPreps = preps.filter(p => !p.isSpecialist);

          const numSpecSlots = hasSpecSlotAtLvl ? 1 : 0;
          const numRegSlots = Math.max(0, max - numSpecSlots);

          let slotsListHtml = [];

          // Render regular slots
          for (let i = 0; i < numRegSlots; i++) {
            const p = regPreps[i];
            if (p) {
              slotsListHtml.push(`
                <div style="display: flex; justify-content: space-between; align-items: center; background: ${p.isUsed ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.45)'}; border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 2px 4px; font-size: 8px; opacity: ${p.isUsed ? '0.65' : '1'};">
                  <span style="font-weight: 600; cursor: pointer; color: var(--red); font-family: 'Crimson Text', serif; font-size: 8.5px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 4px;" class="view-spell-details-btn" data-key="${p.spellKey}">
                    📜 ${p.spell.nameDe} ${p.metamagic.length > 0 ? `<span style="font-size: 7px; color: var(--red); font-weight: bold;">[M]</span>` : ''}
                  </span>
                  <div style="display: flex; gap: 3px; align-items: center; flex-shrink: 0;">
                    ${p.isUsed 
                      ? `<span style="font-size: 7px; color: var(--inkl); font-style: italic; padding: 1px 3px;">Verbraucht</span>`
                      : `<button class="btn cast-prepared-btn" data-id="${p.id}" style="font-size: 7px; padding: 1px 3px; cursor: pointer; border-radius: 2px; background:rgba(139,26,26,0.1); border-color:var(--red); color:var(--red); font-weight:bold;">Wirken</button>`
                    }
                    <button class="btn unprepare-prepared-btn" data-id="${p.id}" style="font-size: 7px; padding: 1px 3px; border-color: transparent; color: var(--inkl); cursor: pointer;" title="Slot leeren">✕</button>
                  </div>
                </div>
              `);
            } else {
              slotsListHtml.push(`
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.02); border: 0.5px dashed var(--pb); border-radius: 2px; padding: 2px 4px; font-size: 8px; color: var(--inkl); font-style: italic;">
                  <span>Freier Slot</span>
                  <button class="btn prepare-slot-placeholder-btn" data-lvl="${lvl}" style="font-size: 6.5px; padding: 0.5px 4px; border-color: var(--pb); background: transparent; color: var(--ink); cursor: pointer;">➕ Vorbereiten</button>
                </div>
              `);
            }
          }

          // Render specialist slot if wizard has specialization
          if (hasSpecSlotAtLvl) {
            const p = specPreps[0];
            if (p) {
              slotsListHtml.push(`
                <div style="display: flex; justify-content: space-between; align-items: center; background: ${p.isUsed ? 'rgba(0,0,0,0.04)' : 'rgba(200, 169, 110, 0.05)'}; border: 0.5px solid #c8a96e; border-radius: 2px; padding: 2px 4px; font-size: 8px; opacity: ${p.isUsed ? '0.65' : '1'};">
                  <span style="font-weight: 600; cursor: pointer; color: var(--red); font-family: 'Crimson Text', serif; font-size: 8.5px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 4px;" class="view-spell-details-btn" data-key="${p.spellKey}">
                    ⭐ 📜 ${p.spell.nameDe} ${p.metamagic.length > 0 ? `<span style="font-size: 7px; color: var(--red); font-weight: bold;">[M]</span>` : ''}
                  </span>
                  <div style="display: flex; gap: 3px; align-items: center; flex-shrink: 0;">
                    ${p.isUsed 
                      ? `<span style="font-size: 7px; color: var(--inkl); font-style: italic; padding: 1px 3px;">Verbraucht</span>`
                      : `<button class="btn cast-prepared-btn" data-id="${p.id}" style="font-size: 7px; padding: 1px 3px; cursor: pointer; border-radius: 2px; background:linear-gradient(135deg, #c8a96e, #9a7a2e); border-color:var(--red); color:white; font-weight:bold;">Wirken</button>`
                    }
                    <button class="btn unprepare-prepared-btn" data-id="${p.id}" style="font-size: 7px; padding: 1px 3px; border-color: transparent; color: var(--inkl); cursor: pointer;" title="Slot leeren">✕</button>
                  </div>
                </div>
              `);
            } else {
              slotsListHtml.push(`
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(200, 169, 110, 0.03); border: 0.5px dashed #c8a96e; border-radius: 2px; padding: 2px 4px; font-size: 8px; color: #9a7a2e; font-style: italic;">
                  <span>⭐ Spezial-Slot (${specSchoolName})</span>
                  <button class="btn prepare-specialist-placeholder-btn" data-lvl="${lvl}" style="font-size: 6.5px; padding: 0.5px 4px; border: 0.5px solid #c8a96e; background: linear-gradient(135deg, #c8a96e, #9a7a2e); color: white; cursor: pointer;">➕ Vorbereiten</button>
                </div>
              `);
            }
          }

          // If there are extra prepared spells, render them too
          const extraRegPreps = regPreps.slice(numRegSlots);
          extraRegPreps.forEach(p => {
            slotsListHtml.push(`
              <div style="display: flex; justify-content: space-between; align-items: center; background: ${p.isUsed ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.45)'}; border: 0.5px solid var(--red); border-radius: 2px; padding: 2px 4px; font-size: 8px; opacity: ${p.isUsed ? '0.65' : '1'};">
                <span style="font-weight: 600; cursor: pointer; color: var(--red); font-family: 'Crimson Text', serif; font-size: 8.5px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 4px;" class="view-spell-details-btn" data-key="${p.spellKey}">
                  ⚠️ 📜 ${p.spell.nameDe} ${p.metamagic.length > 0 ? `<span style="font-size: 7px; color: var(--red); font-weight: bold;">[M]</span>` : ''}
                </span>
                <div style="display: flex; gap: 3px; align-items: center; flex-shrink: 0;">
                  ${p.isUsed 
                    ? `<span style="font-size: 7px; color: var(--inkl); font-style: italic; padding: 1px 3px;">Verbraucht</span>`
                    : `<button class="btn cast-prepared-btn" data-id="${p.id}" style="font-size: 7px; padding: 1px 3px; cursor: pointer; border-radius: 2px; background:rgba(139,26,26,0.1); border-color:var(--red); color:var(--red); font-weight:bold;">Wirken</button>`
                  }
                  <button class="btn unprepare-prepared-btn" data-id="${p.id}" style="font-size: 7px; padding: 1px 3px; border-color: transparent; color: var(--inkl); cursor: pointer;" title="Slot leeren">✕</button>
                </div>
              </div>
            `);
          });

          return `
            <div style="margin-bottom: 2px;">
              <div style="font-family: 'IM Fell English SC', serif; font-size: 8px; color: var(--inkl); border-bottom: 0.5px dashed rgba(200, 169, 110, 0.3); padding-bottom: 1px; font-weight: bold; margin-bottom: 4px; display: flex; justify-content: space-between;">
                <span>Grad ${lvl} Slots</span>
                <span style="font-size: 7px; font-weight: normal;">Vorbereitet: ${preps.length} / ${max}</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                ${slotsListHtml.join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
