import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';

const openDrawerIds = new Set();

const slots = {
  head: { name: 'Kopf', icon: '👑' },
  face: { name: 'Gesicht', icon: '👓' },
  neck: { name: 'Hals', icon: '📿' },
  shoulders: { name: 'Schultern', icon: '🧥' },
  torso: { name: 'Rumpf', icon: '🥋' },
  wrists: { name: 'Handgelenke', icon: '🦾' },
  hands: { name: 'Hände', icon: '🧤' },
  waist: { name: 'Taille', icon: '🎗️' },
  feet: { name: 'Füße', icon: '🥾' },
  ring1: { name: 'Ring 1', icon: '💍' },
  ring2: { name: 'Ring 2', icon: '💍' }
};

export function renderPCMagicItemsTab(pc) {
  const leftCol = document.getElementById('pcEquippedItems');
  const rightCol = document.getElementById('pcMagicItemsStash');

  if (leftCol) {
    _renderLeftColumn(leftCol, pc);
  }
  if (rightCol) {
    _renderRightColumn(rightCol, pc);
  }
}

function _renderLeftColumn(container, pc) {
  // Find equipped items per slot
  const equipped = {};
  if (Array.isArray(pc.items)) {
    pc.items.forEach((item, idx) => {
      if (item.isEquipped && item.slot !== 'slotless') {
        equipped[item.slot] = { item, idx };
      }
    });
  }

  // Build grid HTML
  let gridHtml = '';
  Object.keys(slots).forEach(slotKey => {
    const slotInfo = slots[slotKey];
    const data = equipped[slotKey];

    let contentHtml = '';
    let borderStyle = '1.5px solid var(--pb)';
    let bgStyle = 'rgba(200, 169, 110, 0.04)';
    let boxGlow = 'inset 0 0 8px rgba(200, 169, 110, 0.05)';

    if (data) {
      const { item, idx } = data;
      borderStyle = '1px solid #b38600';
      bgStyle = 'rgba(200, 169, 110, 0.08)';
      boxGlow = 'inset 0 0 10px rgba(179, 134, 0, 0.1)';

      let effectsListHtml = '';
      if (Array.isArray(item.effects)) {
        item.effects.forEach(eff => {
          effectsListHtml += `<div style="font-size:7.5px; color:var(--inkm); margin-top:2px;">+${eff.value} ${_getEffectTargetDesc(eff)}</div>`;
        });
      }

      contentHtml = `
        <button class="unequip-slot-btn" data-idx="${idx}" style="position:absolute; top:3px; right:5px; border:none; background:transparent; font-size:8px; cursor:pointer; color:var(--red); padding:0;" title="Ablegen">✕</button>
        <div style="font-size:6.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif; margin-bottom:2px; opacity:0.8;">${slotInfo.name}</div>
        <div style="font-family:'Crimson Text',serif; font-size:10px; font-weight:bold; color:var(--red); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${item.name}">${item.name}</div>
        ${effectsListHtml}
      `;
    } else {
      contentHtml = `
        <div style="font-size:14px; color:var(--inkl); margin-bottom:2px; opacity:0.5;">${slotInfo.icon}</div>
        <div style="font-size:7.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif;">${slotInfo.name}</div>
        <div style="font-size:7px; color:var(--inkm); font-style:italic;">(Leer)</div>
      `;
    }

    gridHtml += `
      <div class="arpg-slot" style="position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:68px; border:${borderStyle}; border-radius:4px; padding:6px; text-align:center; background:${bgStyle}; box-shadow:${boxGlow}; transition:all 0.15s ease-out;">
        ${contentHtml}
      </div>
    `;
  });

  // Slotless items active list
  const slotless = Array.isArray(pc.items) ? pc.items.filter(item => item.isEquipped && item.slot === 'slotless') : [];
  let slotlessHtml = '';
  if (slotless.length > 0) {
    slotless.forEach(item => {
      const idx = pc.items.indexOf(item);
      let effectsListHtml = '';
      if (Array.isArray(item.effects)) {
        item.effects.forEach(eff => {
          effectsListHtml += `<span style="font-size:8px; color:var(--inkm);">+${eff.value} ${_getEffectTargetDesc(eff)}</span>`;
        });
      }
      slotlessHtml += `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:8px; border-bottom:0.5px dashed rgba(200,169,110,0.2); padding:3px 2px;">
          <span style="font-family:'Crimson Text', serif; font-weight:bold; color:var(--red); font-size:9.5px;">${item.name}</span>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="display:flex; flex-direction:column; align-items:flex-end;">
              ${effectsListHtml}
            </div>
            <button class="unequip-slot-btn" data-idx="${idx}" style="border:none; background:transparent; font-size:9px; cursor:pointer; color:var(--red); padding:0 2px;" title="Ablegen">✕</button>
          </div>
        </div>
      `;
    });
  } else {
    slotlessHtml = `
      <div style="text-align:center; font-style:italic; color:var(--inkm); font-size:7.5px; padding:6px 0;">
        (Keine slotfreien Gegenstände aktiv)
      </div>
    `;
  }

  container.innerHTML = `
    <div class="phdr"><h2>✨ Ausgerüstete magische Gegenstände</h2></div>
    <div class="pbody" style="display:flex; flex-direction:column; gap:8px; padding:8px 10px;">
      
      <!-- Slots Grid (3 columns) -->
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
        ${gridHtml}
      </div>

      <!-- Slotless Section -->
      <div style="margin-top:8px; border-top:1px solid var(--pb); padding-top:8px;">
        <div style="font-family:'IM Fell English SC', serif; font-size:9.5px; font-weight:bold; color:var(--red); margin-bottom:4px; letter-spacing:0.5px;">
          🎒 Aktiv &amp; Slotfrei (Slotless)
        </div>
        <div style="background:rgba(200, 169, 110, 0.03); border:0.5px solid var(--pb); border-radius:3px; padding:4px 6px;">
          ${slotlessHtml}
        </div>
      </div>

    </div>
  `;

  // Attach unequip events
  container.querySelectorAll('.unequip-slot-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx);
      CombatState.togglePCItemEquip(idx);
      uiRegistry.renderPlayerScreen();
    };
  });
}

function _renderRightColumn(container, pc) {
  if (!Array.isArray(pc.items)) pc.items = [];

  container.innerHTML = `
    <div class="phdr"><h2>🎒 Rucksack &amp; Inventar</h2></div>
    <div class="pbody" style="display:flex; flex-direction:column; gap:6px; padding:6px 8px;">
      
      <!-- Subheader with Add Button -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:0.5px solid var(--pb); margin-bottom:4px; padding-bottom:2px;">
        <span style="font-family:'IM Fell English SC', serif; font-size:9.5px; font-weight:bold; color:var(--red);">✨ Magische Gegenstände</span>
        <button class="btn btn-add-magic-item" style="font-family:'IM Fell English SC', serif; font-size:7.5px; padding:1px 5px; height:14px; line-height:1;">➕ Gegenstand</button>
      </div>

      <!-- Scrollable List -->
      <div id="pcMagicItemsList" style="display:flex; flex-direction:column; gap:4px; max-height:480px; overflow-y:auto;"></div>

    </div>
  `;

  // Add Item Action
  container.querySelector('.btn-add-magic-item').onclick = () => {
    CombatState.addPCItem();
    uiRegistry.renderPlayerScreen();
  };

  // Populate list
  const listContainer = container.querySelector('#pcMagicItemsList');
  if (listContainer) {
    pc.items.forEach((item, idx) => {
      const card = _createStashItemCard(item, idx, pc);
      listContainer.appendChild(card);
    });
  }
}

function _createStashItemCard(item, idx, pc) {
  const container = document.createElement('div');
  container.className = 'stash-item-card-container';
  container.style = 'display:flex; flex-direction:column; gap:2px;';

  const card = document.createElement('div');
  card.className = `stash-item-card`;
  card.style.cssText = `
    display: flex;
    flex-direction: column;
    border: 0.5px solid var(--pb);
    border-radius: 4px;
    padding: 5px 6px;
    background: rgba(200, 169, 110, 0.02);
    transition: all 0.15s ease-out;
    position: relative;
    margin-top: ${item.isEquipped ? '6px' : '0'};
  `;

  if (item.isEquipped) {
    card.style.border = '1px solid #b38600';
    card.style.background = 'rgba(200, 169, 110, 0.05)';
  }

  const activeBadge = item.isEquipped ? `
    <span style="position: absolute; top: -6px; left: 8px; font-size: 6px; color: #ffffff; background: #2a6a2a; border-radius: 2px; padding: 1px 4px; font-family: 'IM Fell English SC', serif; font-weight: bold; letter-spacing: 0.3px; pointer-events: none; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.15);">Ausgerüstet</span>
  ` : '';

  const slotOptions = {
    head: 'Kopf',
    face: 'Gesicht',
    neck: 'Hals',
    shoulders: 'Schultern',
    torso: 'Rumpf',
    wrists: 'Handgelenke',
    hands: 'Hände',
    waist: 'Taille',
    feet: 'Füße',
    ring1: 'Ring 1',
    ring2: 'Ring 2',
    slotless: 'Slotfrei'
  };

  let slotOptionsHtml = '';
  Object.keys(slotOptions).forEach(sKey => {
    slotOptionsHtml += `<option value="${sKey}" ${item.slot === sKey ? 'selected' : ''}>${slotOptions[sKey]}</option>`;
  });

  card.innerHTML = `
    ${activeBadge}
    <!-- Row 1: Name and Delete -->
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px;">
      <input type="text" value="${item.name}" class="cinput item-name" placeholder="z.B. Schutzring" style="font-size: 9px; height: 18px; padding: 0 4px; flex: 1; font-weight: bold; border-color: rgba(200, 169, 110, 0.25);">
      <button class="xbtn delete-btn" style="padding: 0; border: none; background: transparent; font-size: 10px; cursor: pointer; height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--red); transition: color 0.15s;" title="Löschen">✕</button>
    </div>
    <!-- Row 2: Slot, Equip, Options -->
    <div style="display: flex; align-items: center; gap: 4px;">
      <select class="cinput item-slot" style="font-size: 7.5px; padding: 0 2px; height: 16px; flex: 1.5; min-width: 0;">
        ${slotOptionsHtml}
      </select>
      <button class="xbtn equip-btn" style="padding: 0 6px; font-size: 7.5px; font-weight: bold; height: 16px; line-height: 14px; border-color: ${item.isEquipped ? '#b38600' : 'var(--pb)'}; color: ${item.isEquipped ? '#b38600' : 'var(--ink)'}; background: ${item.isEquipped ? 'rgba(200, 169, 110, 0.08)' : 'transparent'}; border-radius: 2px;" title="${item.isEquipped ? 'Gegenstand ablegen' : 'Gegenstand anlegen'}">
        ${item.isEquipped ? 'Ablegen' : 'Anlegen'}
      </button>
      <button class="xbtn gear-btn" style="padding: 0; border: none; background: transparent; font-size: 11px; cursor: pointer; height: 16px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--inkm);" title="Optionen">⚙️</button>
    </div>
  `;

  // Options Drawer
  const isDrawerOpen = openDrawerIds.has(item.id);
  const drawer = document.createElement('div');
  drawer.className = 'item-details-drawer';
  drawer.style.cssText = `display: ${isDrawerOpen ? 'flex' : 'none'}; background: rgba(200,169,110,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); border-top: none; padding: 4px 6px; font-size: 8px; margin-top: -2px; margin-bottom: 2px; border-radius: 0 0 3px 3px; flex-direction: column; gap: 4px;`;

  const effects = Array.isArray(item.effects) ? item.effects : [];
  let effectsRowsHtml = '';
  effects.forEach((eff, effIdx) => {
    let targetOptionsHtml = '';
    if (eff.type === 'attribute') {
      targetOptionsHtml = `
        <option value="str" ${eff.target === 'str' ? 'selected' : ''}>Stärke (STR)</option>
        <option value="dex" ${eff.target === 'dex' ? 'selected' : ''}>Geschick (DEX)</option>
        <option value="con" ${eff.target === 'con' ? 'selected' : ''}>Konstitution (CON)</option>
        <option value="int" ${eff.target === 'int' ? 'selected' : ''}>Intelligenz (INT)</option>
        <option value="wis" ${eff.target === 'wis' ? 'selected' : ''}>Weisheit (WIS)</option>
        <option value="cha" ${eff.target === 'cha' ? 'selected' : ''}>Charisma (CHA)</option>
      `;
    } else if (eff.type === 'save') {
      targetOptionsHtml = `
        <option value="fort" ${eff.target === 'fort' ? 'selected' : ''}>Zähigkeit</option>
        <option value="ref" ${eff.target === 'ref' ? 'selected' : ''}>Reflex</option>
        <option value="wil" ${eff.target === 'wil' ? 'selected' : ''}>Wille</option>
        <option value="all" ${eff.target === 'all' ? 'selected' : ''}>Alle Rettungswürfe</option>
      `;
    } else if (eff.type === 'ac') {
      targetOptionsHtml = `
        <option value="deflection" ${eff.target === 'deflection' ? 'selected' : ''}>Ablenkung (Deflection)</option>
        <option value="natural" ${eff.target === 'natural' ? 'selected' : ''}>Natürliche Rüstung</option>
        <option value="armor" ${eff.target === 'armor' ? 'selected' : ''}>Rüstung</option>
      `;
    } else {
      targetOptionsHtml = `<option value="speed" selected>Bewegung</option>`;
    }

    effectsRowsHtml += `
      <div style="display:flex; align-items:center; gap:4px; width:100%;">
        <select class="cinput item-effect-type" data-eff-idx="${effIdx}" style="font-size: 8px; height: 16px; flex: 1.2;">
          <option value="attribute" ${eff.type === 'attribute' ? 'selected' : ''}>Attribut</option>
          <option value="save" ${eff.type === 'save' ? 'selected' : ''}>Rettungswurf</option>
          <option value="ac" ${eff.type === 'ac' ? 'selected' : ''}>AC/RK-Bonus</option>
          <option value="speed" ${eff.type === 'speed' ? 'selected' : ''}>Geschwindigkeit</option>
        </select>
        
        <select class="cinput item-effect-target" data-eff-idx="${effIdx}" style="font-size: 8px; height: 16px; flex: 1.5;" ${eff.type === 'speed' ? 'disabled' : ''}>
          ${targetOptionsHtml}
        </select>
        
        <div style="display:flex; align-items:center; gap:1px; flex-shrink:0;">
          <span style="font-size: 7.5px; color: var(--inkm);">+</span>
          <input type="number" class="cinput item-effect-value" data-eff-idx="${effIdx}" value="${eff.value}" style="font-size: 8px; height: 16px; width: 22px; padding: 0; text-align: center;">
        </div>
        
        <button class="xbtn delete-effect-btn" data-eff-idx="${effIdx}" style="padding: 0; border: none; background: transparent; font-size: 10px; cursor: pointer; height: 16px; width: 14px; display: flex; align-items: center; justify-content: center; color: var(--red);" title="Effekt löschen">✕</button>
      </div>
    `;
  });

  drawer.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:4px; width:100%;">
      ${effectsRowsHtml}
      <div style="display:flex; justify-content:flex-start; margin-top:2px;">
        <button class="btn add-effect-btn" style="font-family:'IM Fell English SC', serif; font-size:7.5px; padding:1px 5px; height:14px; line-height:1; display:flex; align-items:center; gap:2px;">➕ Effekt</button>
      </div>
    </div>
  `;

  container.appendChild(card);
  container.appendChild(drawer);

  // Bind events
  card.querySelector('.item-name').onchange = (e) => {
    CombatState.updatePCItem(idx, 'name', e.target.value);
    uiRegistry.renderPlayerScreen();
  };

  card.querySelector('.item-slot').onchange = (e) => {
    if (item.isEquipped) {
      CombatState.togglePCItemEquip(idx);
      CombatState.updatePCItem(idx, 'slot', e.target.value);
      CombatState.togglePCItemEquip(idx);
    } else {
      CombatState.updatePCItem(idx, 'slot', e.target.value);
    }
    uiRegistry.renderPlayerScreen();
  };

  card.querySelector('.equip-btn').onclick = () => {
    CombatState.togglePCItemEquip(idx);
    uiRegistry.renderPlayerScreen();
  };

  card.querySelector('.delete-btn').onclick = () => {
    CombatState.deletePCItem(idx);
    uiRegistry.renderPlayerScreen();
  };

  card.querySelector('.gear-btn').onclick = () => {
    const isVisible = drawer.style.display === 'flex';
    if (isVisible) {
      drawer.style.display = 'none';
      openDrawerIds.delete(item.id);
    } else {
      drawer.style.display = 'flex';
      openDrawerIds.add(item.id);
    }
  };

  // Add Effect Action
  const addBtn = drawer.querySelector('.add-effect-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      CombatState.addPCItemEffect(idx);
      uiRegistry.renderPlayerScreen();
    };
  }

  // Bind change events to all types, targets, values and deletes inside the drawer
  drawer.querySelectorAll('.item-effect-type').forEach(select => {
    select.onchange = (e) => {
      const effIdx = parseInt(select.dataset.effIdx);
      const val = e.target.value;
      let defTarget = 'str';
      if (val === 'save') defTarget = 'fort';
      else if (val === 'ac') defTarget = 'deflection';
      else if (val === 'speed') defTarget = 'speed';

      CombatState.updatePCItemEffect(idx, effIdx, 'type', val);
      CombatState.updatePCItemEffect(idx, effIdx, 'target', defTarget);
      uiRegistry.renderPlayerScreen();
    };
  });

  drawer.querySelectorAll('.item-effect-target').forEach(select => {
    select.onchange = (e) => {
      const effIdx = parseInt(select.dataset.effIdx);
      CombatState.updatePCItemEffect(idx, effIdx, 'target', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
  });

  drawer.querySelectorAll('.item-effect-value').forEach(input => {
    input.onchange = (e) => {
      const effIdx = parseInt(input.dataset.effIdx);
      CombatState.updatePCItemEffect(idx, effIdx, 'value', parseInt(e.target.value) || 0);
      uiRegistry.renderPlayerScreen();
    };
  });

  drawer.querySelectorAll('.delete-effect-btn').forEach(btn => {
    btn.onclick = () => {
      const effIdx = parseInt(btn.dataset.effIdx);
      CombatState.deletePCItemEffect(idx, effIdx);
      uiRegistry.renderPlayerScreen();
    };
  });

  return container;
}

function _getEffectTargetDesc(eff) {
  const target = eff.target || eff.effectTarget || 'str';
  const targets = {
    str: 'Stärke (STR)',
    dex: 'Geschick (DEX)',
    con: 'Konst (CON)',
    int: 'Intelligenz (INT)',
    wis: 'Weisheit (WIS)',
    cha: 'Charisma (CHA)',
    fort: 'Zähigkeit',
    ref: 'Reflex',
    wil: 'Wille',
    all: 'Rettungswürfe',
    deflection: 'Ablenkung (RK)',
    natural: 'Natürliche Rüstung',
    armor: 'Rüstungsbonus',
    speed: 'Bewegung'
  };
  return targets[target] || target;
}
