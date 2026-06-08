import { CombatState } from '../../state.js';
import { CombatRules } from '../../rules.js';
import { uiRegistry } from '../ui-shared.js';

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

  const list = state.combatants.filter(c => side === 'p' ? c.type === 'p' : c.type !== 'p');
  
  if (!list.length) {
    cont.innerHTML = `<div class="empty-msg">Noch keine ${side === 'p' ? 'Spielercharaktere' : 'Gegner'} hinzugefügt</div>`;
    return;
  }

  cont.innerHTML = '';
  
  list.forEach(c => {
    const pct = hpPct(c);
    const fc = fillCls(pct, c.hp);
    const hpColor = c.hp < 0 ? 'color:var(--red)' : '';    const tempHPObj = c.conditions.find(x => x.n === 'Temp-HP');
    const tempHP = tempHPObj ? (parseInt(tempHPObj.tmpVal) || 0) : 0;
    
    let classBadge = '';
    if (c.type === 'p' && Array.isArray(c.classes) && c.classes.length > 0) {
      const classStr = c.classes.map(cl => {
        const matched = CombatRules.CLASSES.find(x => x.key === cl.classType);
        const name = matched ? matched.nameDe : cl.classType;
        return `${name} ${cl.level}`;
      }).join(' / ');
      classBadge = `<div style="font-size:7px; color:var(--red); font-style:italic; margin-top:1px; max-width:61px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; line-height:1;" title="${classStr}">${classStr}</div>`;
    }

    const row = document.createElement('div');
    row.className = 'crow';
    row.id = `crow-${c.id}`;
    row.innerHTML = `
      <div class="crow-inner">
        <div style="display:flex;align-items:center;gap:2px;">
          <div class="init-dot ${dotCls(c.type)}" style="flex-shrink:0;"></div>
          <div style="display:flex; flex-direction:column;">
            <input class="cinput char-name-input" type="text" value="${c.name}" style="width:61px; height:12px; font-size:8.5px; padding:0 2px;">
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
        <input class="cinput cinput-c char-stat-input" data-stat="ac" type="number" value="${c.ac}" title="Rüstungsklasse">
        <input class="cinput cinput-c char-stat-input" data-stat="bw" type="number" value="${c.bw}" title="Bewegungsweite (ft)">
        <input class="cinput cinput-c char-stat-input" data-stat="za" type="number" value="${c.za}" title="Zähigkeit">
        <input class="cinput cinput-c char-stat-input" data-stat="ref" type="number" value="${c.ref}" title="Reflex">
        <input class="cinput cinput-c char-stat-input" data-stat="wil" type="number" value="${c.wil}" title="Willen">
        
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

    // 4. Combat stats input change
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

    cont.appendChild(row);
    rowCache.set(c.id, row);
  });
}

/**
 * Renders concentration spells list
 */
export function renderConc() {
  const state = CombatState.getState();
  const cont = document.getElementById('concRows');
  if (!cont) return;

  if (!state.concentrations.length) {
    cont.innerHTML = '<div class="empty-msg" style="padding:3px 0;">Keine aktiven Konzentrationszauber</div>';
    return;
  }

  cont.innerHTML = '';
  
  state.concentrations.forEach(c => {
    const row = document.createElement('div');
    row.className = 'conc-row';
    row.innerHTML = `
      <span style="width:58px;color:var(--inkm);font-style:italic;font-size:9px;flex-shrink:0;">${c.who}</span>
      <input class="conc-in spell-input" type="text" value="${c.spell}" style="flex:1;">
      <input class="conc-in spell-dur" type="number" value="${c.dur || ''}" placeholder="∞" style="width:26px;text-align:center;" title="Runden">
      <button class="xbtn xbtn-del delete-spell-btn" style="padding:1px 4px;">✕</button>
    `;

    row.querySelector('.spell-input').onchange = (e) => {
      CombatState.updateConcentrationField(c.id, 'spell', e.target.value);
    };

    row.querySelector('.spell-dur').onchange = (e) => {
      CombatState.updateConcentrationField(c.id, 'dur', e.target.value);
    };

    row.querySelector('.delete-spell-btn').onclick = () => {
      CombatState.removeConcentration(c.id);
      renderConc();
    };

    cont.appendChild(row);
  });
}

/**
 * Builds the static condition chips in the rules reference panel
 */
export function buildCondRefGrid() {
  const grid = document.getElementById('condRefGrid');
  if (!grid) return;

  grid.innerHTML = '';

  CombatRules.CONDITIONS.forEach(c => {
    const chip = document.createElement('div');
    chip.className = 'cond-ref-chip';
    chip.textContent = c.n;
    chip.onclick = () => openRef(c.n);
    grid.appendChild(chip);
  });
}

/**
 * Rule Reference Modals Triggers
 */
export function openRef(condName) {
  const c = CombatRules.CONDITIONS.find(x => x.n === condName);
  if (!c) return;

  const overlay = document.getElementById('refOverlay');
  const title = document.getElementById('refTitle');
  const body = document.getElementById('refBody');

  if (overlay && title && body) {
    title.textContent = condName;
    body.innerHTML = c.r;
    overlay.classList.add('open');
  }
}

export function closeRefDirect() {
  const overlay = document.getElementById('refOverlay');
  if (overlay) overlay.classList.remove('open');
}

/**
 * Renders the dedicated Dungeon Master Screen
 */
export function renderDMScreen(state) {
  const roundDisp = document.getElementById('roundDisp');
  if (roundDisp) roundDisp.textContent = state.round;
  
  // Sync DM meta fields with state
  const metaBegegnung = document.getElementById('metaBegegnung');
  if (metaBegegnung) metaBegegnung.value = state.meta.begegnung || '';
  const metaOrt = document.getElementById('metaOrt');
  if (metaOrt) metaOrt.value = state.meta.ort || '';
  const metaXpBudget = document.getElementById('metaXpBudget');
  if (metaXpBudget) metaXpBudget.value = state.meta.xpBudget || '';
  const metaXpVerteilt = document.getElementById('metaXpVerteilt');
  if (metaXpVerteilt) metaXpVerteilt.value = state.meta.xpVerteilt || '';
  const metaSitzung = document.getElementById('metaSitzung');
  if (metaSitzung) metaSitzung.value = state.meta.sitzung || '';
  
  uiRegistry.renderInitBar();
  renderRows('p');
  renderRows('e');
}
