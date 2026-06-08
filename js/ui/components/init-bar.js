import { CombatState } from '../../state.js';
import { uiRegistry } from '../ui-shared.js';


function hpPct(c) {
  return c.maxHP > 0 ? Math.max(0, Math.min(100, c.hp / c.maxHP * 100)) : 0;
}

function dotCls(t) {
  return t === 'p' ? 'dot-p' : t === 'n' ? 'dot-n' : 'dot-e';
}

/**
 * Performs target updating of the active turn slot indicators without full redraws
 */
export function updateActiveTurnUI() {
  const state = CombatState.getState();
  const bar = document.getElementById('initBar');
  if (!bar) return;

  const slots = bar.querySelectorAll('.init-slot');
  slots.forEach((slot, idx) => {
    if (idx === state.turn) {
      slot.classList.add('active');
    } else {
      slot.classList.remove('active');
    }
  });
}

/**
 * Renders the top Initiative Order Slot bar with drag-and-drop handlers
 */
export function renderInitBar() {
  const state = CombatState.getState();
  const bar = document.getElementById('initBar');
  if (!bar) return;

  if (!state.combatants.length) {
    bar.innerHTML = '<div class="empty-msg">Füge Kämpfer hinzu — sie erscheinen hier nach Initiativwert sortiert</div>';
    return;
  }

  bar.innerHTML = '';
  
  let dragSrcId = null;
  let dropInsertIdx = null;

  function removeGap() {
    const g = document.getElementById('drop-gap');
    if (g) g.remove();
  }

  function insertGap(container, beforeSlot) {
    removeGap();
    const gap = document.createElement('div');
    gap.id = 'drop-gap';
    gap.className = 'drop-gap';
    if (beforeSlot) container.insertBefore(gap, beforeSlot);
    else container.appendChild(gap);
  }

  state.combatants.forEach((c, idx) => {
    const pct = hpPct(c);
    const bc = c.hp <= 0 ? '#888' : pct > 50 ? '#4aaa4a' : pct > 25 ? '#d4a000' : '#cc3333';
    
    const slot = document.createElement('div');
    slot.className = 'init-slot' + (idx === state.turn ? ' active' : '') + (c.hp <= 0 ? ' dead' : '');
    slot.draggable = true;
    slot.dataset.cid = c.id;

    slot.addEventListener('dragstart', e => {
      dragSrcId = c.id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', c.id);
      setTimeout(() => slot.classList.add('dragging'), 0);
    });

    slot.addEventListener('dragend', () => {
      slot.classList.remove('dragging');
      removeGap();
      dragSrcId = null;
      dropInsertIdx = null;
    });

    slot.addEventListener('dragover', e => {
      e.preventDefault();
      if (!dragSrcId || dragSrcId === c.id) return;
      e.dataTransfer.dropEffect = 'move';
      
      const rect = slot.getBoundingClientRect();
      const insertBefore = e.clientX < rect.left + rect.width / 2;
      const newInsertIdx = insertBefore ? idx : idx + 1;
      
      if (newInsertIdx === dropInsertIdx) return;
      dropInsertIdx = newInsertIdx;
      
      const allSlots = [...bar.querySelectorAll('.init-slot')];
      if (insertBefore) {
        insertGap(bar, allSlots[idx]);
      } else {
        const next = allSlots[idx + 1];
        insertGap(bar, next || null);
      }
    });

    slot.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragSrcId || dragSrcId === c.id) return;
      
      const srcIdx = state.combatants.findIndex(x => x.id === dragSrcId);
      if (srcIdx === -1) return;

      const moved = state.combatants.splice(srcIdx, 1)[0];

      let ins = dropInsertIdx !== null ? dropInsertIdx : idx;
      if (srcIdx < ins) ins--;
      ins = Math.max(0, Math.min(ins, state.combatants.length));

      const left = ins > 0 ? state.combatants[ins - 1] : null;
      const right = ins < state.combatants.length ? state.combatants[ins] : null;
      
      if (!left && !right) { }
      else if (!left) moved.init = right.init + 1;
      else if (!right) moved.init = left.init - 1;
      else moved.init = Math.floor((left.init + right.init) / 2);

      state.combatants.splice(ins, 0, moved);

      const activeId = state.combatants[state.turn] ? state.combatants[state.turn].id : null;
      if (activeId) {
        const newTurn = state.combatants.findIndex(x => x.id === activeId);
        if (newTurn !== -1) state.turn = newTurn;
      }

      dragSrcId = null;
      dropInsertIdx = null;
      
      CombatState.saveToStorage();
      uiRegistry.renderAll();
    });

    slot.onclick = () => {
      if (dragSrcId) return;
      state.turn = idx;
      CombatState.saveToStorage();
      updateActiveTurnUI();
    };

    const activeConds = c.conditions.filter(cd => {
      const name = typeof cd === 'string' ? cd : (cd && cd.n);
      return name && name !== 'Temp-HP';
    });
    const dots = activeConds.length 
      ? `<div class="init-conds">${activeConds.map(cd => {
          const name = typeof cd === 'string' ? cd : (cd.n || '');
          const dur = typeof cd === 'object' && cd.dur ? ` (${cd.dur}R)` : '';
          return `<div class="init-cond-dot" title="${name}${dur}"></div>`;
        }).join('')}</div>` 
      : '';
      
    slot.innerHTML = `
      <div class="init-num">${c.init}</div>
      <div class="init-name">${c.name}</div>
      <div style="width:100%;height:4px;background:rgba(200,169,110,.3);border-radius:1px;margin-top:2px;overflow:hidden;">
        <div class="init-slot-hp-bar" style="width:${pct}%;height:100%;background:${bc};transition:width .2s;"></div>
      </div>
      <div class="init-dot ${dotCls(c.type)}"></div>
      ${dots}
    `;
    bar.appendChild(slot);
  });
}
