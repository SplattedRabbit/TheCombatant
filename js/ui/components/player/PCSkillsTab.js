import { SKILLS_REGISTRY } from '../../../data/skills-data.js';
import { CombatRules } from '../../../rules.js';
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { formatMod } from './PCUtils.js';
import { showRollBreakdown } from '../dialogs.js';

let skillSearchQuery = '';
let skillFilterType = 'all'; // 'all', 'class', 'trained'

export function renderPCSkills(pc) {
  const container = document.getElementById('pcSkillsBody');
  if (!container) return;

  const totalLevel = Array.isArray(pc.classes) ? pc.classes.reduce((sum, c) => sum + (c.level || 0), 0) : 1;

  // Render search controls
  const searchHtml = `
    <div style="display: flex; gap: 3px; align-items: center; margin-bottom: 5px; background: rgba(0,0,0,0.02); padding: 3px; border-radius: 2px; border: 0.5px solid var(--pb);">
      <input type="text" class="cinput skill-search-input" value="${skillSearchQuery}" placeholder="Fertigkeit suchen..." style="flex: 1; font-size: 8px; height: 16px; padding: 0 4px;">
      <select class="cinput skill-filter-select" style="width: 75px; font-size: 7.5px; height: 16px; padding: 0; outline: none; cursor: pointer;">
        <option value="all" ${skillFilterType === 'all' ? 'selected' : ''}>Alle Skills</option>
        <option value="class" ${skillFilterType === 'class' ? 'selected' : ''}>Nur Klassen-Skills</option>
        <option value="trained" ${skillFilterType === 'trained' ? 'selected' : ''}>Mit Rängen</option>
      </select>
    </div>
  `;

  // Render legend above the list
  const legendHtml = `
    <div class="skills-legend" style="margin-bottom: 5px; padding: 4px 6px; background: rgba(200, 169, 110, 0.05); border: 0.5px solid var(--pb); border-radius: 2px; font-size: 7.5px; display: flex; gap: 8px; align-items: center; justify-content: center; flex-wrap: wrap;">
      <span style="font-weight: bold; color: var(--red); font-family: 'IM Fell English SC', serif; font-size: 8px;">Legende:</span>
      <span style="display: inline-flex; align-items: center; gap: 2.5px;">
        <span style="font-size: 6px; font-weight: bold; color: #1a5c1a; background: rgba(26,92,26,0.08); padding: 0.5px 2px; border-radius: 1px;">K</span>
        <span>Klassenfertigkeit (Max. Ränge: Stufe + 3)</span>
      </span>
      <span style="display: inline-flex; align-items: center; gap: 2.5px;">
        <span style="font-size: 6px; color: #7c5c1d; background: rgba(200,169,110,0.08); padding: 0.5px 2px; border-radius: 1px;">KÜ</span>
        <span>Klassenübergreifend (Max. Ränge: Stufe + 3 / 2)</span>
      </span>
      <span style="display: inline-flex; align-items: center; gap: 2.5px;">
        <span style="font-size: 6px; color: var(--red); background: rgba(139,26,26,0.08); padding: 0.5px 2px; border-radius: 1px; font-weight: bold;" title="Trained Only">Geübt</span>
        <span>Ungeübt nicht nutzbar</span>
      </span>
    </div>
  `;

  // Filter skills
  const filteredSkillKeys = Object.keys(SKILLS_REGISTRY).filter(key => {
    const skill = SKILLS_REGISTRY[key];
    const q = skillSearchQuery.toLowerCase().trim();
    const matchesQuery = skill.nameDe.toLowerCase().includes(q) || key.includes(q);

    let matchesFilter = true;
    if (skillFilterType === 'class') {
      matchesFilter = CombatRules.isClassSkill(key, pc);
    } else if (skillFilterType === 'trained') {
      matchesFilter = pc.getSkillRanks(key) > 0;
    }

    return matchesQuery && matchesFilter;
  });

  filteredSkillKeys.sort((a, b) => {
    return SKILLS_REGISTRY[a].nameDe.localeCompare(SKILLS_REGISTRY[b].nameDe);
  });

  const listHtml = filteredSkillKeys.map(key => {
    const skill = SKILLS_REGISTRY[key];
    const isClass = CombatRules.isClassSkill(key, pc);
    const ranks = pc.getSkillRanks(key);
    const misc = pc.getSkillMisc(key);
    const maxRanks = CombatRules.getPCMaxRanks(key, pc);
    const ranksExceeded = ranks > maxRanks;
    const totalMod = pc.getSkillModifier(key);
    const attrMod = pc.getAttributeMod(skill.abl);
    
    return `
      <div class="skill-row" style="display: flex; align-items: center; justify-content: space-between; padding: 3px 4px; border-bottom: 0.5px solid rgba(200, 169, 110, 0.15); font-size: 8px;">
        <!-- Left: Dice Roll & Info -->
        <div style="display: flex; align-items: center; gap: 3.5px; flex: 1.2; min-width: 0;">
          <button class="xbtn roll-skill-btn" data-key="${key}" style="border: none; background: transparent; padding: 0 2px; cursor: pointer; text-align: left; font-family: 'Crimson Text', serif; font-size: 9.5px; font-weight: bold; color: var(--red); display: flex; align-items: center; gap: 2.5px;" title="Fertigkeitswurf für ${skill.nameDe} ausführen">
            🎲 <span style="border-bottom: 0.5px dashed rgba(139, 26, 26, 0.4); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 110px;">${skill.nameDe}</span>
          </button>
          <span style="font-size: 6.5px; color: var(--inkl); font-style: italic; flex-shrink: 0;">(${skill.abl.toUpperCase()})</span>
          ${isClass 
            ? `<span style="font-size: 5.5px; font-weight: bold; color: #1a5c1a; background: rgba(26,92,26,0.08); padding: 0.5px 2px; border-radius: 1px; flex-shrink: 0;" title="Klassenfertigkeit (Max. Ränge: ${maxRanks})">K</span>` 
            : `<span style="font-size: 5.5px; color: #7c5c1d; background: rgba(200,169,110,0.08); padding: 0.5px 2px; border-radius: 1px; flex-shrink: 0;" title="Klassenübergreifend (Max. Ränge: ${maxRanks})">KÜ</span>`
          }
          ${skill.trainedOnly && ranks === 0 
            ? `<span style="font-size: 5.5px; color: var(--red); background: rgba(139,26,26,0.08); padding: 0.5px 2px; border-radius: 1px; flex-shrink: 0; font-weight: bold;" title="Kann unübgeübt nicht genutzt werden (Trained Only)">Geübt</span>` 
            : ''
          }
        </div>

        <!-- Middle: Gesamt -->
        <div style="display: flex; align-items: center; gap: 2px; flex: 0.5; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 6px; color: var(--inkl);">Gesamt:</span>
          <span style="font-weight: bold; color: var(--red); font-size: 9px; min-width: 16px; text-align: left;" title="Gesamtmodifikator (Ränge + Attr + Sonst + Synergien - Mali)">
            ${formatMod(totalMod)}
          </span>
        </div>

        <!-- Right: Mod & Input fields -->
        <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0; flex: 1.3; justify-content: flex-end;">
          <!-- Ranks Inp -->
          <div style="display: flex; align-items: center; gap: 1px;">
            <span style="font-size: 6px; color: var(--inkl);">Ränge:</span>
            <input type="number" step="0.5" min="0" max="${maxRanks}" value="${ranks}" class="cinput pc-skill-ranks-inp" data-key="${key}" style="width: 22px; font-size: 8px; height: 11px; padding: 0; text-align: center; border-radius: 1px; border: 0.5px solid var(--pb); outline: none; ${ranksExceeded ? 'border-color: var(--red) !important; background: rgba(139, 26, 26, 0.08) !important; color: var(--red) !important; font-weight: bold;' : ''}" title="Erworbene Ränge (Max. erlaubt: ${maxRanks})">
          </div>

          <!-- Attr Mod (Unveränderbar) -->
          <div style="display: flex; align-items: center; gap: 1px;">
            <span style="font-size: 6px; color: var(--inkl);">Attr:</span>
            <input type="text" value="${formatMod(attrMod)}" readonly class="cinput" style="width: 18px; font-size: 8px; height: 11px; padding: 0; text-align: center; border-radius: 1px; border: 0.5px solid var(--pb); background: rgba(0,0,0,0.04); color: var(--inkm); cursor: not-allowed; outline: none;" title="Bezugsattribut-Modifikator (${skill.abl.toUpperCase()}: ${formatMod(attrMod)})" tabindex="-1">
          </div>

          <!-- Misc Inp -->
          <div style="display: flex; align-items: center; gap: 1px;">
            <span style="font-size: 6px; color: var(--inkl);">Sonst:</span>
            <input type="number" value="${misc}" class="cinput pc-skill-misc-inp" data-key="${key}" style="width: 16px; font-size: 8px; height: 11px; padding: 0; text-align: center; border-radius: 1px; border: 0.5px solid var(--pb); outline: none;" title="Sonstige Boni/Mali (z.B. Volksboni, Ausrüstung, Magie)">
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${searchHtml}
    ${legendHtml}
    <div style="display: flex; flex-direction: column; max-height: 380px; overflow-y: auto; padding-right: 2px;" class="pc-scroll-skills">
      ${listHtml || '<div style="font-size: 8.5px; color: var(--inkl); font-style: italic; text-align: center; padding: 25px 0;">Keine Fertigkeiten gefunden.</div>'}
    </div>
  `;

  bindSkillsEvents(pc, container);
}

function bindSkillsEvents(pc, container) {
  // 1. Roll button click
  container.onclick = (e) => {
    const rollBtn = e.target.closest('.roll-skill-btn');
    if (rollBtn) {
      e.stopPropagation();
      const key = rollBtn.dataset.key;
      const skill = SKILLS_REGISTRY[key];
      if (!skill) return;

      const ranks = pc.getSkillRanks(key);
      const attrMod = pc.getAttributeMod(skill.abl);
      const misc = pc.getSkillMisc(key);

      const breakdown = [
        { label: `Ränge`, value: ranks },
        { label: `${skill.abl.toUpperCase()}-Mod`, value: attrMod }
      ];

      if (misc !== 0) {
        breakdown.push({ label: 'Sonstige Boni', value: misc });
      }

      // Add dynamic synergy breakdown for rolls representation
      if (key === 'balance' && pc.getSkillRanks('tumble') >= 5) {
        breakdown.push({ label: 'Synergie (Akrobatik)', value: 2 });
      }
      if (key === 'escape_artist' && pc.getSkillRanks('tumble') >= 5) {
        breakdown.push({ label: 'Synergie (Akrobatik)', value: 2 });
      }
      if (key === 'diplomacy' && pc.getSkillRanks('bluff') >= 5) {
        breakdown.push({ label: 'Synergie (Bluffen)', value: 2 });
      }
      if (key === 'disguise' && pc.getSkillRanks('bluff') >= 5) {
        breakdown.push({ label: 'Synergie (Bluffen)', value: 2 });
      }
      if (key === 'intimidate' && pc.getSkillRanks('bluff') >= 5) {
        breakdown.push({ label: 'Synergie (Bluffen)', value: 2 });
      }
      if (key === 'use_magic_device') {
        if (pc.getSkillRanks('spellcraft') >= 5) {
          breakdown.push({ label: 'Synergie (Zauberkunde)', value: 2 });
        }
        if (pc.getSkillRanks('decipher_script') >= 5) {
          breakdown.push({ label: 'Synergie (Schriftzeichen)', value: 2 });
        }
      }

      // Conditions
      const hasShaken = pc.conditions.some(c => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
      if (hasShaken) {
        breakdown.push({ label: 'Zustand (Erschüttet/Schüttelnd)', value: -2 });
      }

      showRollBreakdown(`Fertigkeitswurf: ${skill.nameDe}`, '1W20', breakdown, e);
      return;
    }
  };

  // 2. Value edits (Ranks and Misc inputs)
  container.onchange = (e) => {
    const ranksInp = e.target.closest('.pc-skill-ranks-inp');
    if (ranksInp) {
      const key = ranksInp.dataset.key;
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val < 0) val = 0;

      CombatState.updatePCBatch(freshPC => {
        if (!freshPC.skills) freshPC.skills = {};
        if (!freshPC.skills[key]) freshPC.skills[key] = { ranks: 0, misc: 0 };
        freshPC.skills[key].ranks = val;
      });
      uiRegistry.renderPlayerScreen();
      return;
    }

    const miscInp = e.target.closest('.pc-skill-misc-inp');
    if (miscInp) {
      const key = miscInp.dataset.key;
      let val = parseInt(e.target.value);
      if (isNaN(val)) val = 0;

      CombatState.updatePCBatch(freshPC => {
        if (!freshPC.skills) freshPC.skills = {};
        if (!freshPC.skills[key]) freshPC.skills[key] = { ranks: 0, misc: 0 };
        freshPC.skills[key].misc = val;
      });
      uiRegistry.renderPlayerScreen();
      return;
    }

    const filterSel = e.target.closest('.skill-filter-select');
    if (filterSel) {
      skillFilterType = filterSel.value;
      renderPCSkills(pc);
      return;
    }
  };

  // 3. Search keyup input filtering
  container.oninput = (e) => {
    const searchInp = e.target.closest('.skill-search-input');
    if (searchInp) {
      skillSearchQuery = e.target.value;
      const q = skillSearchQuery.toLowerCase().trim();
      const rows = container.querySelectorAll('.skill-row');
      rows.forEach(row => {
        const btn = row.querySelector('.roll-skill-btn');
        const key = btn ? btn.dataset.key : '';
        const nameDe = btn ? btn.innerText.toLowerCase() : '';
        const matches = nameDe.includes(q) || key.includes(q);
        row.style.display = matches ? 'flex' : 'none';
      });
      return;
    }
  };
}
