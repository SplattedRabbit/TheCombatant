import { CombatState } from '../../state.js';
import { uiRegistry } from '../ui-shared.js';
import { CombatSpells } from '../../spells.js';

function translateTarget(target) {
  const mapping = {
    str: 'Stärke (STR)',
    dex: 'Geschick (DEX)',
    con: 'Konstitution (CON)',
    int: 'Intelligenz (INT)',
    wis: 'Weisheit (WIS)',
    cha: 'Charisma (CHA)',
    za: 'Zähigkeit (Fort)',
    ref: 'Reflex (Ref)',
    wil: 'Willen (Will)',
    baseZa: 'Zähigkeit (Fort)',
    baseRef: 'Reflex (Ref)',
    baseWil: 'Willen (Will)',
    ac: 'Rüstungsklasse (AC)',
    acArmor: 'Rüstungs-RK (Armor)',
    acShield: 'Schild-RK (Shield)',
    acNatural: 'Natürliche Rüstung',
    acDeflection: 'Ablenkung (Deflection)',
    acDodge: 'Ausweich-RK (Dodge)',
    atk: 'Angriffswurf (ATK)',
    dmg: 'Schadenswurf (DMG)'
  };
  return mapping[target] || target;
}

function translateType(type) {
  const mapping = {
    morale: 'Moral',
    luck: 'Glück',
    dodge: 'Ausweichen',
    enhancement: 'Verbesserung',
    insight: 'Einsicht',
    sacred: 'Heilig',
    profane: 'Unheilig',
    armor: 'Rüstung',
    shield: 'Schild',
    natural: 'Natürlich',
    untyped: 'Ohne Typ'
  };
  return mapping[type] || type;
}

export function showBuffManagerDialog(pc) {
  const existing = document.getElementById('buffManagerOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'buffManagerOverlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.65);
    backdrop-filter: blur(3px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  // Define the 10 quick toggle spells
  const quickSpells = [
    { key: 'bless', name: 'Segen' },
    { key: 'haste', name: 'Hast' },
    { key: 'mage_armor', name: 'Magierrüstung' },
    { key: 'shield', name: 'Schild' },
    { key: 'shield_of_faith', name: 'Schild des Glaubens' },
    { key: 'bulls_strength', name: 'Stärke des Stiers' },
    { key: 'cats_grace', name: 'Katzenhafte Anmut' },
    { key: 'bears_endurance', name: 'Ausdauer des Bären' },
    { key: 'owl_s_wisdom', name: 'Weisheit der Eule' },
    { key: 'prayer', name: 'Gebet' }
  ];

  // Render active buffs list
  let activeBuffsHtml = '';
  if (!Array.isArray(pc.activeBuffs) || pc.activeBuffs.length === 0) {
    activeBuffsHtml = `
      <div style="font-style: italic; color: var(--inkl); font-size: 10px; text-align: center; padding: 12px 0;">
        Keine aktiven Buffs oder Auren vorhanden.
      </div>
    `;
  } else {
    activeBuffsHtml = pc.activeBuffs.map((buff, idx) => {
      let displayName = buff.name;
      let effectsList = [];

      if (buff.spellKey) {
        const spell = CombatSpells.REGISTRY?.[buff.spellKey];
        if (spell) {
          displayName = spell.nameDe || spell.nameEn || displayName || buff.spellKey;
          if (Array.isArray(spell.effects)) {
            effectsList = spell.effects;
          }
        }
      } else if (Array.isArray(buff.effects)) {
        effectsList = buff.effects;
      }

      const effectsText = effectsList.map(eff => {
        const sign = eff.value >= 0 ? '+' : '';
        return `<span style="display:inline-block; background:rgba(139,26,26,0.05); border:0.5px solid rgba(139,26,26,0.15); border-radius:2px; padding:1px 3px; font-size:8px; margin-right:4px;">
          ${translateTarget(eff.target)}: <strong>${sign}${eff.value}</strong> (${translateType(eff.type)})
        </span>`;
      }).join('');

      return `
        <div style="position:relative; display:flex; flex-direction:column; gap:2px; background:rgba(200, 169, 110, 0.04); border:0.5px solid var(--pb); border-radius:3px; padding:4px 6px; padding-right:24px; box-sizing:border-box;">
          <div style="font-size:10px; font-weight:bold; color:var(--red); font-family:'IM Fell English SC', serif;">${displayName}</div>
          <div style="display:flex; flex-wrap:wrap; gap:2px;">${effectsText}</div>
          <button class="delete-buff-btn" data-index="${idx}" style="
            position:absolute;
            top:3px;
            right:4px;
            background:transparent;
            border:none;
            color:var(--red);
            font-size:10px;
            cursor:pointer;
            padding:2px;
            line-height:1;
          " title="Buff entfernen">✕</button>
        </div>
      `;
    }).join('');
  }

  // Render quick toggle buttons
  const quickToggleHtml = quickSpells.map(qs => {
    const isActive = Array.isArray(pc.activeBuffs) && pc.activeBuffs.some(b => b.spellKey === qs.key);
    const btnStyle = isActive
      ? `background: #8b1a1a; color: #f4e8c1; border-color: #8b1a1a; font-weight: bold;`
      : `background: rgba(200, 169, 110, 0.1); color: var(--ink); border-color: var(--pb);`;
    const checkmark = isActive ? '✓ ' : '';
    return `
      <button class="quick-buff-btn" data-key="${qs.key}" data-name="${qs.name}" style="
        font-family: 'IM Fell English SC', serif;
        font-size: 8.5px;
        padding: 3px 6px;
        cursor: pointer;
        border: 1px solid;
        border-radius: 2px;
        transition: all 0.15s ease;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        ${btnStyle}
      " title="${qs.name}">${checkmark}${qs.name}</button>
    `;
  }).join('');

  overlay.innerHTML = `
    <div class="custom-scroll-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 14px 18px;
      width: 480px;
      max-width: 94vw;
      max-height: 90vh;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1);
      font-family: 'IM Fell English SC', serif;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-sizing: border-box;
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <!-- Title -->
      <h3 style="font-size: 13px; color: #8b1a1a; text-align: center; border-bottom: 2px solid #8b1a1a; padding-bottom: 4px; margin: 0; letter-spacing: 0.8px; font-weight: bold;">
        ✨ Buff- &amp; Auren-Manager
      </h3>

      <!-- Section 1: Active Buffs -->
      <div style="display:flex; flex-direction:column; gap:4px;">
        <div style="font-size:9.5px; color:var(--red); font-weight:bold; border-bottom:0.5px solid rgba(200,169,110,0.25); padding-bottom:1px; margin-bottom:2px;">
          Aktive Buffs &amp; Auren
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; max-height:160px; overflow-y:auto; padding-right:2px; box-sizing:border-box;">
          ${activeBuffsHtml}
        </div>
      </div>

      <!-- Section 2: Quick Toggle Grid -->
      <div style="display:flex; flex-direction:column; gap:4px;">
        <div style="font-size:9.5px; color:var(--red); font-weight:bold; border-bottom:0.5px solid rgba(200,169,110,0.25); padding-bottom:1px; margin-bottom:2px;">
          Schnellauswahl (Kern-Zauber)
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
          ${quickToggleHtml}
        </div>
      </div>

      <!-- Section 3: Custom Buff Form -->
      <div style="display:flex; flex-direction:column; gap:4px; border-top:0.5px dashed rgba(200,169,110,0.3); padding-top:8px;">
        <div style="font-size:9.5px; color:var(--red); font-weight:bold; padding-bottom:1px; margin-bottom:2px;">
          Eigenen Buff / Aura erstellen
        </div>
        <div style="display:grid; grid-template-columns: 1.5fr 1.5fr 0.8fr; gap:4px; align-items:end;">
          <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
            <label style="font-size:8px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif;">Name</label>
            <input type="text" id="custom-buff-name" placeholder="z. B. Bardenlied" class="cinput" style="height:18px; font-size:9px; box-sizing:border-box; padding:0 3px;">
          </div>
          <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
            <label style="font-size:8px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif;">Zielwert</label>
            <select id="custom-buff-target" class="cinput" style="height:18px; font-size:9px; box-sizing:border-box; padding:0;">
              <option value="atk">Angriffswurf (ATK)</option>
              <option value="dmg">Schadenswurf (DMG)</option>
              <option value="ac">Rüstungsklasse (AC)</option>
              <option value="acDodge">Ausweich-RK (Dodge)</option>
              <option value="acDeflection">Ablenkung (Deflection)</option>
              <option value="acShield">Schild-RK (Shield)</option>
              <option value="acArmor">Rüstungs-RK (Armor)</option>
              <option value="acNatural">Natürliche Rüstung</option>
              <option value="str">Stärke (STR)</option>
              <option value="dex">Geschick (DEX)</option>
              <option value="con">Konstitution (CON)</option>
              <option value="int">Intelligenz (INT)</option>
              <option value="wis">Weisheit (WIS)</option>
              <option value="cha">Charisma (CHA)</option>
              <option value="za">Zähigkeit (Fort)</option>
              <option value="ref">Reflex (Ref)</option>
              <option value="wil">Willen (Will)</option>
            </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
            <label style="font-size:8px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif;">Bonus</label>
            <input type="number" id="custom-buff-value" value="1" class="cinput" style="height:18px; font-size:9px; box-sizing:border-box; text-align:center; padding:0;">
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 3fr 1fr; gap:4px; align-items:end; margin-top:2px;">
          <div style="display:flex; flex-direction:column; gap:2px; text-align:left;">
            <label style="font-size:8px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif;">Modifikator-Typ</label>
            <select id="custom-buff-type" class="cinput" style="height:18px; font-size:9px; box-sizing:border-box; padding:0;">
              <option value="untyped">Ohne Typ (Untyped)</option>
              <option value="morale">Moral (Morale)</option>
              <option value="luck">Glück (Luck)</option>
              <option value="dodge">Ausweichen (Dodge)</option>
              <option value="enhancement">Verbesserung (Enhancement)</option>
              <option value="deflection">Ablenkung (Deflection)</option>
              <option value="armor">Rüstung (Armor)</option>
              <option value="shield">Schild (Shield)</option>
              <option value="natural">Natürlich (Natural)</option>
              <option value="insight">Einsicht (Insight)</option>
              <option value="sacred">Heilig (Sacred)</option>
              <option value="profane">Unheilig (Profane)</option>
            </select>
          </div>
          <button id="add-custom-buff-btn" class="btn btn-p" style="
            font-family: 'IM Fell English SC', serif;
            font-size: 8.5px;
            padding: 3px 6px;
            height: 18px;
            cursor: pointer;
            box-sizing: border-box;
            border-radius: 2px;
            font-weight: bold;
            line-height: 10px;
          ">Hinzufügen</button>
        </div>
      </div>

      <!-- Close Button -->
      <div style="display:flex; justify-content:center; margin-top: 4px;">
        <button id="close-buff-manager-btn" class="btn" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 9px;
          padding: 4px 24px;
          cursor: pointer;
          background: transparent;
          border: 1px solid var(--pb);
          border-radius: 2px;
          color: var(--inkl);
          transition: background-color 0.15s, color 0.15s;
          outline: none;
        ">Schließen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect(); // reflow
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-scroll-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-scroll-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  // Close actions
  overlay.querySelector('#close-buff-manager-btn').onclick = dismiss;

  // Bind Quick Toggle Buttons
  overlay.querySelectorAll('.quick-buff-btn').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.key;
      const name = btn.dataset.name;
      
      CombatState.updatePCBatch(pc => {
        if (!Array.isArray(pc.activeBuffs)) pc.activeBuffs = [];
        const isCurrentlyActive = pc.activeBuffs.some(b => b.spellKey === key);
        if (isCurrentlyActive) {
          pc.activeBuffs = pc.activeBuffs.filter(b => b.spellKey !== key);
        } else {
          pc.activeBuffs.push({
            id: 'spell_' + key + '_' + Date.now(),
            spellKey: key,
            name: name
          });
        }
      });

      // Instantly refresh UI
      uiRegistry.renderPlayerScreen();
      // Re-spawn updated dialog content without closed overlay animation
      showBuffManagerDialog(pc);
    };
  });

  // Bind Delete Active Buff Buttons
  overlay.querySelectorAll('.delete-buff-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      
      CombatState.updatePCBatch(pc => {
        if (Array.isArray(pc.activeBuffs) && pc.activeBuffs[idx]) {
          pc.activeBuffs.splice(idx, 1);
        }
      });

      uiRegistry.renderPlayerScreen();
      showBuffManagerDialog(pc);
    };
  });

  // Bind Add Custom Buff
  const addBtn = overlay.querySelector('#add-custom-buff-btn');
  addBtn.onclick = () => {
    const nameInput = overlay.querySelector('#custom-buff-name');
    const targetSelect = overlay.querySelector('#custom-buff-target');
    const typeSelect = overlay.querySelector('#custom-buff-type');
    const valueInput = overlay.querySelector('#custom-buff-value');

    const name = nameInput.value.trim();
    if (!name) {
      alert('Bitte gib einen Namen für den Buff ein.');
      return;
    }

    const target = targetSelect.value;
    const type = typeSelect.value;
    const value = parseInt(valueInput.value) || 0;

    CombatState.updatePCBatch(pc => {
      if (!Array.isArray(pc.activeBuffs)) pc.activeBuffs = [];
      pc.activeBuffs.push({
        id: 'custom_' + Date.now(),
        name: name,
        effects: [
          { target, value, type, source: name }
        ]
      });
    });

    uiRegistry.renderPlayerScreen();
    showBuffManagerDialog(pc);
  };
}
