/**
 * @module    DMCombatantsTable
 * @summary   Rendert die Spieler- und Gegnertabellen auf dem DM-Screen, inklusive 3-fach AC, Buff-Badges, Begleiter-Recall und Event-Listenern.
 * @exports   renderRows, updateCombatantHPDisplay
 * @reads     state.combatants
 * @stateOps  CombatState.updateCombatantField, CombatState.updateCombatantNumber, CombatState.applyDamage, CombatState.applyTempHP, CombatState.removeCombatant, CombatState.addCombatant
 * @depends   CombatState, CombatRules, CompanionSheet, FamiliarSheet
 * @notHere   Metadaten- & Rundensteuerung → DMHeader.js | Regelreferenz & Konzentration → DMToolbox.js
 */

import { CombatState } from '../../../state.js';
import { CombatRules } from '../../../rules.js';
import { uiRegistry } from '../../ui-shared.js';
import { CompanionSheet } from '../CompanionSheet.js';
import { FamiliarSheet } from '../FamiliarSheet.js';

const rowCache = new Map();

function fillCls(pct, hp) {
  if (hp <= 0) return 'fill-dead';
  if (pct > 50) return 'fill-ok';
  if (pct > 25) return 'fill-warn';
  return 'fill-crit';
}

function dotCls(t) {
  return t === 'p' ? 'dot-p' : t === 'n' ? 'dot-n' : 'dot-e';
}

function hpPct(c) {
  return c.maxHP > 0 ? Math.max(0, Math.min(100, c.hp / c.maxHP * 100)) : 0;
}

/**
 * Performs a highly optimized target update of a single combatant's HP display
 */
export function updateCombatantHPDisplay(id) {
  const state = CombatState.getState();
  const c = state.combatants.find(x => x.id === id);
  if (!c) return;

  // 1. Update the row details
  const row = document.getElementById(`crow-${id}`);
  if (row) {
    const hpInput = row.querySelector('.hp-cur-in');
    if (hpInput) {
      hpInput.value = c.hp;
      hpInput.style.color = c.hp < 0 ? 'var(--red)' : '';
    }

    const pct = hpPct(c);
    const fill = row.querySelector('.hp-bar-fill');
    if (fill) {
      fill.style.width = `${pct}%`;
      fill.className = `hp-bar-fill ${fillCls(pct, c.hp)}`;
    }

    // Update temporary HP display next to max HP
    const tempHPObj = c.conditions.find(x => x.n === 'Temp-HP');
    const tempHP = tempHPObj ? (parseInt(tempHPObj.tmpVal) || 0) : 0;
    let tempSpan = row.querySelector('.hp-temp-txt');
    if (tempHP > 0) {
      if (tempSpan) {
        tempSpan.textContent = `(+${tempHP})`;
      } else {
        const maxSpan = row.querySelector('.hp-max-txt');
        if (maxSpan) {
          maxSpan.insertAdjacentHTML('afterend', `<span class="hp-temp-txt" style="color:#00b8f0;font-size:7.5px;font-weight:bold;margin-left:2px;">(+${tempHP})</span>`);
        }
      }
    } else if (tempSpan) {
      tempSpan.remove();
    }
  }

  // 2. Update the corresponding initiative slot in the top bar
  const slot = document.querySelector(`.init-slot[data-cid="${id}"]`);
  if (slot) {
    const pct = hpPct(c);
    const bc = c.hp <= 0 ? '#888' : pct > 50 ? '#4aaa4a' : pct > 25 ? '#d4a000' : '#cc3333';
    
    const slotBar = slot.querySelector('.init-slot-hp-bar');
    if (slotBar) {
      slotBar.style.width = `${pct}%`;
      slotBar.style.backgroundColor = bc;
    }
    
    if (c.hp <= 0) {
      slot.classList.add('dead');
    } else {
      slot.classList.remove('dead');
    }
  }
}

/**
 * Renders combatant table rows for a side (Players or Enemies/NPCs)
 */
export function renderRows(side) {
  const state = CombatState.getState();
  const cont = document.getElementById(side === 'p' ? 'pRows' : 'eRows');
  if (!cont) return;

  let list = [];
  if (side === 'p') {
    const players = state.combatants.filter(c => c.type === 'p');
    players.forEach(p => {
      list.push(p);
      const companion = state.combatants.find(x => x.id === `${p.id}-companion`);
      if (companion) list.push(companion);
      const familiar = state.combatants.find(x => x.id === `${p.id}-familiar`);
      if (familiar) list.push(familiar);
    });
  } else {
    list = state.combatants.filter(c => c.type !== 'p' && !c.id.endsWith('-companion') && !c.id.endsWith('-familiar'));
  }
  
  if (!list.length) {
    cont.innerHTML = `<div class="empty-msg">Noch keine ${side === 'p' ? 'Spielercharaktere' : 'Gegner'} hinzugefügt</div>`;
    return;
  }

  cont.innerHTML = '';
  
  list.forEach(c => {
    const pct = hpPct(c);
    const fc = fillCls(pct, c.hp);
    const hpColor = c.hp < 0 ? 'color:var(--red)' : '';
    const tempHPObj = c.conditions.find(x => x.n === 'Temp-HP');
    const tempHP = tempHPObj ? (parseInt(tempHPObj.tmpVal) || 0) : 0;
    
    let classBadge = '';
    if (c.type === 'p' && Array.isArray(c.classes) && c.classes.length > 0) {
      const classStr = c.classes.map(cl => {
        const matched = CombatRules.CLASSES.find(x => x.key === cl.classType);
        const name = matched ? matched.nameDe : cl.classType;
        return `${name} ${cl.level}`;
      }).join(' / ');
      classBadge = `<div style="font-size:7px; color:var(--red); font-style:italic; margin-top:1px; max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; line-height:1;" title="${classStr}">${classStr}</div>`;
    }

    // 1. Generate Shape Badge
    let shapeBadge = '';
    if (c.activeShape && c.activeShape !== 'none') {
      let shapeLabel = c.activeShape;
      if (c.activeShape === 'wolf') shapeLabel = 'Wolf';
      if (c.activeShape === 'bear') shapeLabel = 'Bär';
      if (c.activeShape === 'leopard') shapeLabel = 'Leopard';
      shapeBadge = `<span class="dm-effect-badge badge-shape">🐾 Gestalt: ${shapeLabel}</span>`;
    }

    // 2. Generate Buff Badges
    let buffBadges = '';
    if (Array.isArray(c.activeBuffs)) {
      buffBadges = c.activeBuffs.map(b => {
        const auraPrefix = b.sharedWith ? '✦ ' : '';
        return `<span class="dm-effect-badge badge-buff" data-buff-id="${b.id}">${auraPrefix}${b.name} <span class="remove-effect-btn" data-type="buff" data-id="${b.id}">✕</span></span>`;
      }).join('');
    }

    // 3. Generate Companion/Familiar Recall Button
    let recallButton = '';
    if (c.type === 'p') {
      const stateCombatants = state.combatants;
      if (c.companionType && c.companionType !== 'none') {
        const companionId = `${c.id}-companion`;
        const exists = stateCombatants.some(x => x.id === companionId);
        if (!exists) {
          recallButton = `<button class="recall-btn companion-recall-btn" style="font-size:7px; padding:1px 3px; margin-left:3px; cursor:pointer;" title="Tierbegleiter rufen">🐾 ${c.companionName || 'Begleiter'}</button>`;
        }
      } else if (c.familiarType && c.familiarType !== 'none') {
        const familiarId = `${c.id}-familiar`;
        const exists = stateCombatants.some(x => x.id === familiarId);
        if (!exists) {
          recallButton = `<button class="recall-btn familiar-recall-btn" style="font-size:7px; padding:1px 3px; margin-left:3px; cursor:pointer;" title="Vertrauten rufen">🐾 ${c.familiarName || 'Vertrauens'}</button>`;
        }
      }
    }

    const hasEffects = shapeBadge || buffBadges;

    const isCompanionOrFamiliar = c.id.endsWith('-companion') || c.id.endsWith('-familiar');

    const row = document.createElement('div');
    row.className = 'crow';
    row.id = `crow-${c.id}`;
    row.innerHTML = `
      <div class="crow-inner">
        <div style="display:flex;align-items:center;gap:4px;width:100%;min-width:0;box-sizing:border-box;${isCompanionOrFamiliar ? 'padding-left:14px;' : ''}">
          <div class="init-dot ${dotCls(c.type)}" style="flex-shrink:0;"></div>
          <div style="display:flex; flex-direction:column; flex:1; min-width:0; overflow:hidden;">
            <div style="display:flex; align-items:center; gap:2px; width:100%;">
              <input class="cinput char-name-input" type="text" value="${c.name}" style="flex:1; min-width:0; height:12px; font-size:8.5px; padding:0 2px;">
              ${recallButton}
            </div>
            ${classBadge}
          </div>
        </div>
        <input class="cinput cinput-c char-init-input" type="number" value="${c.init}" title="Initiative">
        <div class="hp-wrap">
          <div class="hp-nums">
            <input class="cinput cinput-c hp-cur-in" type="number" value="${c.hp}" style="${hpColor}" title="Aktuelle TP">
            <span class="hp-sep">/</span>
            <span class="hp-max-txt" title="Max TP">${c.maxHP}</span>
            ${tempHP > 0 ? `<span class="hp-temp-txt" style="color:#00b8f0;font-size:7.5px;font-weight:bold;margin-left:2px;">(+${tempHP})</span>` : ''}
          </div>
          <div class="hp-bar-wrap">
            <div class="hp-bar-fill ${fc}" style="width:${pct}%;"></div>
          </div>
        </div>

        <div class="ac-triple-box" title="RK: Standard / Berührung / Flacher Fuß">
          <div class="ac-sub-box standard">
            <span class="ac-sub-lbl">RK</span>
            <span class="ac-sub-val">${c.ac.getValue()}</span>
          </div>
          <div class="ac-sub-box touch">
            <span class="ac-sub-lbl">Tch</span>
            <span class="ac-sub-val">${c.acTouch.getValue()}</span>
          </div>
          <div class="ac-sub-box flat">
            <span class="ac-sub-lbl">Flat</span>
            <span class="ac-sub-val">${c.acFlat.getValue()}</span>
          </div>
        </div>

        <input class="cinput cinput-c char-stat-input" data-stat="bw" type="number" value="${c.bw}" title="Bewegungsweite (ft)">
        <input class="cinput cinput-c char-stat-input" data-stat="za" type="number" value="${c.za.getValue()}" title="Zähigkeit">
        <input class="cinput cinput-c char-stat-input" data-stat="ref" type="number" value="${c.ref.getValue()}" title="Reflex">
        <input class="cinput cinput-c char-stat-input" data-stat="wil" type="number" value="${c.wil.getValue()}" title="Willen">
        
        <div class="action-col">
          <div class="dmg-row">
            <input class="small-in dmg-val-input" type="number" placeholder="0" title="Schadenswert">
            <button class="xbtn xbtn-dmg deal-dmg-btn">Schaden</button>
            <button class="xbtn xbtn-heal deal-heal-btn">Heilen</button>
            <button class="xbtn xbtn-temp-hp deal-temp-btn" style="background: rgba(42,74,138,0.06); border-color: #2a4a8a; color: #1a2a6a;">+Temp</button>
            <button class="xbtn xbtn-del delete-char-btn no-print" title="Entfernen">✕</button>
          </div>
        </div>
      </div>
      
      ${hasEffects ? `
        <div class="crow-effects-row">
          ${shapeBadge}
          ${buffBadges}
        </div>
      ` : ''}
    `;

    // 1. Text input updates
    row.querySelector('.char-name-input').onchange = (e) => {
      CombatState.updateCombatantField(c.id, 'name', e.target.value);
      const initSlot = document.querySelector(`.init-slot[data-cid="${c.id}"] .init-name`);
      if (initSlot) initSlot.textContent = e.target.value;
    };
    
    // 2. Initiative change triggers re-sort
    row.querySelector('.char-init-input').onchange = (e) => {
      CombatState.updateCombatantNumber(c.id, 'init', e.target.value);
      CombatState.sortCombatants();
      uiRegistry.renderAll();
    };

    // 3. Current HP change triggers targeted HP render
    row.querySelector('.hp-cur-in').onchange = (e) => {
      CombatState.updateCombatantNumber(c.id, 'hp', e.target.value);
      updateCombatantHPDisplay(c.id);
    };

    // 4. Combat stats input change (bw, za, ref, wil)
    row.querySelectorAll('.char-stat-input').forEach(input => {
      input.onchange = (e) => {
        const stat = e.target.dataset.stat;
        CombatState.updateCombatantNumber(c.id, stat, e.target.value);
      };
    });

    // 5. Apply Damage & Healing
    const dmgInp = row.querySelector('.dmg-val-input');
    row.querySelector('.deal-dmg-btn').onclick = () => {
      const val = parseInt(dmgInp.value) || 0;
      if (val > 0) {
        CombatState.applyDamage(c.id, val, false);
        updateCombatantHPDisplay(c.id);
        dmgInp.value = '';
      }
    };
    row.querySelector('.deal-heal-btn').onclick = () => {
      const val = parseInt(dmgInp.value) || 0;
      if (val > 0) {
        CombatState.applyDamage(c.id, val, true);
        updateCombatantHPDisplay(c.id);
        dmgInp.value = '';
      }
    };

    // 6. Apply Temp HP
    row.querySelector('.deal-temp-btn').onclick = () => {
      const val = parseInt(dmgInp.value) || 0;
      if (val > 0) {
        CombatState.applyTempHP(c.id, val);
        updateCombatantHPDisplay(c.id);
        dmgInp.value = '';
      }
    };

    // 7. Delete combatant
    row.querySelector('.delete-char-btn').onclick = () => {
      CombatState.removeCombatant(c.id);
      uiRegistry.renderAll();
    };

    // 8. Event listener for removing effects/buffs
    row.querySelectorAll('.remove-effect-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        if (type === 'buff') {
          const buffId = btn.dataset.id;
          CombatState.updateCombatantBatch(c.id, (pc) => {
            pc.activeBuffs = pc.activeBuffs.filter(b => b.id !== buffId);
          });
          uiRegistry.renderAll();
        }
      };
    });

    // 9. Recall Companion Handler
    const compRecallBtn = row.querySelector('.companion-recall-btn');
    if (compRecallBtn) {
      compRecallBtn.onclick = () => {
        const companionType = c.companionType;
        let level = c.level || 1;
        const rangerClass = c.classes?.find(cl => cl.classType === 'ranger');
        const druidClass = c.classes?.find(cl => cl.classType === 'druid');
        let companionLevel = level;
        if (rangerClass) {
          companionLevel = Math.max(1, Math.floor(rangerClass.level / 2));
        } else if (druidClass) {
          companionLevel = druidClass.level;
        }

        const companionStats = CompanionSheet.getCompanionBaseStats(companionType, companionLevel) || {};
        const finalAC = companionStats.ac || 15;

        CombatState.addCombatant({
          id: `${c.id}-companion`,
          name: c.companionName || companionStats.name || 'Tierbegleiter',
          type: 'n', // NSC
          hp: c.companionHP || companionStats.maxHP || 10,
          maxHP: c.companionMaxHP || companionStats.maxHP || 10,
          init: c.init || 0,
          ac: finalAC,
          bw: companionStats.bw || 30,
          za: c.za.getValue(), // Copy Master saves as fallback
          ref: c.ref.getValue(),
          wil: c.wil.getValue()
        });
        uiRegistry.renderAll();
      };
    }

    // 10. Recall Familiar Handler
    const famRecallBtn = row.querySelector('.familiar-recall-btn');
    if (famRecallBtn) {
      famRecallBtn.onclick = () => {
        const familiarType = c.familiarType;
        const familiarStats = FamiliarSheet.getFamiliarBaseStats(familiarType) || {};
        const finalAC = familiarStats.ac || 15;
        const maxHP = Math.floor(c.maxHP / 2);
        const curHP = c.familiarHP !== undefined ? Math.min(maxHP, c.familiarHP) : maxHP;

        CombatState.addCombatant({
          id: `${c.id}-familiar`,
          name: c.familiarName || familiarStats.name || 'Vertrauter',
          type: 'n', // NSC
          hp: curHP,
          maxHP: maxHP,
          init: c.init || 0,
          ac: finalAC,
          bw: familiarStats.bw || 30,
          za: c.za.getValue(),
          ref: c.ref.getValue(),
          wil: c.wil.getValue()
        });
        uiRegistry.renderAll();
      };
    }

    cont.appendChild(row);
    rowCache.set(c.id, row);
  });
}
