import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { getAblMod, formatMod } from './PCUtils.js';
import { showAttackChoiceDialog, showRollBreakdown, showCustomAlert } from '../dialogs.js';
import { MonkRules } from '../../../rules/classes/MonkRules.js';
import { WeaponRegistry } from '../../../models/Weapon.js';
import { AttackEngine } from '../../../rules/AttackEngine.js';

const openDrawerIds = new Set();
const weaponRuntimeIds = new WeakMap();
let weaponIdCounter = 0;

function getWeaponRuntimeId(w) {
  if (!weaponRuntimeIds.has(w)) {
    weaponRuntimeIds.set(w, ++weaponIdCounter);
  }
  return weaponRuntimeIds.get(w);
}

function isMonkWeapon(w, grip) {
  if (!w) return false;
  if (typeof w === 'object') {
    const typeDef = WeaponRegistry[w.type];
    if (typeDef && typeDef.isMonk !== undefined) {
      return typeDef.isMonk;
    }
    return isMonkWeapon(w.name, w.grip);
  }
  const name = w;
  if (grip === 'unarmed') return true;
  const n = name.toLowerCase().trim();
  return n.includes('waffenlos') || 
         n.includes('faust') || 
         n.includes('unarmed') || 
         n.includes('kama') || 
         n.includes('nunchaku') || 
         n.includes('kampfstab') || 
         n.includes('quarterstaff') || 
         n.includes('sai') || 
         n.includes('shuriken') || 
         n.includes('siangham');
}

function matchesFeatOption(w, option) {
  if (!option) return false;
  const opt = option.toLowerCase().trim();

  // 1. Backwards compatibility / custom name matching
  if (w.name && w.name.toLowerCase().includes(opt)) {
    return true;
  }

  // 2. Type-based matching
  if (w.type) {
    const typeDef = WeaponRegistry[w.type];
    if (typeDef) {
      if (typeDef.key.toLowerCase() === opt ||
          typeDef.nameDe.toLowerCase() === opt ||
          typeDef.nameEn.toLowerCase() === opt) {
        return true;
      }
      
      // Special: composite bows and normal bows count as the same weapon for feats in 3.5e
      if (opt === 'langbogen' || opt === 'longbow') {
        if (typeDef.key === 'comp_longbow') return true;
      }
      if (opt === 'kurzbogen' || opt === 'shortbow') {
        if (typeDef.key === 'comp_shortbow') return true;
      }
    }
  }
  return false;
}

function getWeaponFeatModifiers(w, pc) {
  let atkBonus = 0;
  let dmgBonus = 0;
  
  if (!pc || !pc.feats || !w) return { atkBonus, dmgBonus, details: [] };
  
  const details = [];
  
  pc.feats.forEach(feat => {
    if (feat.id === 'weapon_focus' && feat.option) {
      if (matchesFeatOption(w, feat.option)) {
        atkBonus += 1;
        details.push({ label: `Talent: Waffenfokus (${feat.option})`, type: 'atk', value: 1 });
      }
    }
    if (feat.id === 'greater_weapon_focus' && feat.option) {
      if (matchesFeatOption(w, feat.option)) {
        atkBonus += 1;
        details.push({ label: `Talent: Mächtiger Waffenfokus (${feat.option})`, type: 'atk', value: 1 });
      }
    }
    if (feat.id === 'weapon_specialization' && feat.option) {
      if (matchesFeatOption(w, feat.option)) {
        dmgBonus += 2;
        details.push({ label: `Talent: Waffenspezialisierung (${feat.option})`, type: 'dmg', value: 2 });
      }
    }
    if (feat.id === 'greater_weapon_specialization' && feat.option) {
      if (matchesFeatOption(w, feat.option)) {
        dmgBonus += 2;
        details.push({ label: `Talent: Mächtige Waffenspezialisierung (${feat.option})`, type: 'dmg', value: 2 });
      }
    }
    if (feat.id === 'point_blank_shot' && w.grip === 'rng') {
      atkBonus += 1;
      dmgBonus += 1;
      details.push({ label: 'Talent: Nahschuss', type: 'atk', value: 1 });
      details.push({ label: 'Talent: Nahschuss', type: 'dmg', value: 1 });
    }
  });
  
  return { atkBonus, dmgBonus, details };
}

export function getCritThreatDisplay(critStr, isKeen) {
  if (!critStr) return '20 / x2';
  if (!isKeen) return critStr;
  
  const parts = critStr.split('/');
  const threatPart = parts[0].trim();
  const multiplierPart = parts[1] ? parts[1].trim() : 'x2';
  
  if (threatPart === '20') {
    return `19-20 / ${multiplierPart}`;
  } else if (threatPart.includes('-')) {
    const range = threatPart.split('-');
    const min = parseInt(range[0]);
    const max = parseInt(range[1]) || 20;
    if (!isNaN(min) && !isNaN(max)) {
      const count = max - min + 1;
      const newMin = max - (count * 2) + 1;
      return `${newMin}-20 / ${multiplierPart}`;
    }
  }
  return critStr;
}

export function isLightWeapon(w) {
  if (!w) return false;
  if (typeof w === 'object') {
    const typeDef = WeaponRegistry[w.type];
    if (typeDef && typeDef.isLight !== undefined) {
      return typeDef.isLight;
    }
    return isLightWeapon(w.name);
  }
  const n = w.toLowerCase().trim();
  return n.includes('dolch') || n.includes('dagger') ||
         n.includes('kurzschwert') || n.includes('short sword') ||
         n.includes('handbeil') || n.includes('handaxe') ||
         n.includes('keule') || n.includes('mace') ||
         n.includes('sichel') || n.includes('sickle') ||
         n.includes('rapier') ||
         n.includes('peitsche') || n.includes('whip') ||
         n.includes('dornenkette') || n.includes('spiked chain') ||
         n.includes('waffenlos') || n.includes('faust') || n.includes('unarmed') ||
         n.includes('klaue') || n.includes('claw') ||
         n.includes('biss') || n.includes('bite');
}export function renderPCOffense(pc) {
  const offense = document.getElementById('pcOffense');
  if (!offense) return;

  const babVal = pc.bab.getValue();

  const hasPowerAttack = pc.feats && pc.feats.some(f => f.id === 'power_attack');
  const paPenalty = hasPowerAttack ? Math.min(babVal, parseInt(pc.powerAttackPenalty) || 0) : 0;

  const hasCombatExpertise = pc.feats && pc.feats.some(f => f.id === 'combat_expertise');
  const cePenalty = hasCombatExpertise ? Math.min(Math.min(5, babVal), parseInt(pc.combatExpertisePenalty) || 0) : 0;

  // Render headers and sliders
  offense.innerHTML = _renderGlobalCombatSettingsHtml(pc, babVal, paPenalty, cePenalty, hasPowerAttack, hasCombatExpertise);

  // Bind settings listeners
  _bindGlobalCombatSettingsEvents(offense, pc, babVal, hasPowerAttack, hasCombatExpertise);

  const listContainer = offense.querySelector('#pcWeaponsList');
  if (listContainer) {
    if (pc.activeShape !== "none") {
      _renderNaturalAttacksList(listContainer, pc);
    } else {
      _renderInventoryWeaponsList(listContainer, pc);
    }
  }
}

function _renderGlobalCombatSettingsHtml(pc, babVal, paPenalty, cePenalty, hasPowerAttack, hasCombatExpertise) {
  return `
    <div class="phdr"><h2>⚔️ Waffenkammer &amp; Angriff</h2></div>
    <div class="pbody" style="display:flex; flex-direction:column; gap:4px;">
      ${hasPowerAttack ? `
        <div style="background: rgba(139, 26, 26, 0.05); border: 0.5px solid var(--pb); border-radius: 3px; padding: 4px 8px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 8.5px;">
          <span style="color: var(--red); font-weight: bold;">⚔️ Heftiger Angriff (Power Attack)</span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: var(--inkm); font-size: 7.5px;">Malus (Max ${babVal}):</span>
            <input type="number" class="cinput power-attack-input" min="0" max="${babVal}" value="${paPenalty}" style="width: 35px; font-size: 8px; text-align: center; height: 16px; padding: 0;">
          </div>
        </div>
      ` : ''}
      ${hasCombatExpertise ? `
        <div style="background: rgba(42, 106, 138, 0.05); border: 0.5px solid var(--pb); border-radius: 3px; padding: 4px 8px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 8.5px;">
          <span style="color: #2a6a8a; font-weight: bold; display: flex; align-items: center;">
            🛡️ Kampfgetümmel (Combat Expertise)
            <button class="btn-rule-ce" style="background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); padding: 1px 4px; cursor: pointer; font-size: 8px; color: var(--pb); height: 14px; border-radius: 1.5px; display: inline-flex; align-items: center; justify-content: center; line-height: 10px; margin-left: 4px;" title="Regeln anzeigen">📖 ↗</button>
          </span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: var(--inkm); font-size: 7.5px;">Malus (Max ${Math.min(5, babVal)}):</span>
            <input type="number" class="cinput combat-expertise-input" min="0" max="${Math.min(5, babVal)}" value="${cePenalty}" style="width: 35px; font-size: 8px; text-align: center; height: 16px; padding: 0;">
          </div>
        </div>
      ` : ''}

      <!-- Defensive Fighting & Total Defense Toggles -->
      <div style="background: rgba(200, 169, 110, 0.05); border: 0.5px solid var(--pb); border-radius: 3px; padding: 4px 8px; margin-bottom: 4px; display: flex; gap: 10px; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 8px; justify-content: space-between; flex-wrap: wrap;">
        <div style="display: flex; align-items: center;">
          <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: var(--inkm); margin: 0; font-weight: bold;">
            <input type="checkbox" class="defensive-fighting-input" ${pc.isDefensiveFighting ? 'checked' : ''} style="margin: 0; width: 10px; height: 10px;">
            ⚔️ Verteidigend kämpfen (-4 Atk / +RK)
          </label>
          <button class="btn-rule-df" style="background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); padding: 1px 4px; cursor: pointer; font-size: 8px; color: var(--pb); height: 14px; border-radius: 1.5px; display: inline-flex; align-items: center; justify-content: center; line-height: 10px; margin-left: 4px;" title="Regeln anzeigen">📖 ↗</button>
        </div>
        <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: var(--inkm); margin: 0; font-weight: bold;">
          <input type="checkbox" class="total-defense-input" ${pc.isTotalDefense ? 'checked' : ''} style="margin: 0; width: 10px; height: 10px;">
          🛡️ Volle Abwehr (+RK / keine Angr.)
        </label>
      </div>

      ${pc.isTotalDefense ? `
        <div style="background: rgba(139, 26, 26, 0.08); border: 0.5px solid var(--red); border-radius: 3px; padding: 4px 8px; margin-bottom: 4px; text-align: center; color: var(--red); font-family: 'IM Fell English SC', serif; font-size: 8px; font-weight: bold;">
          🛡️ Volle Abwehr aktiv — keine Angriffe möglich!
        </div>
      ` : ''}
      
      <div style="display:grid; grid-template-columns: 80px 95px 90px 30px 1fr 18px 18px; gap:2px; font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--inkl); padding-bottom:2px;">
        <span>Waffe (Name)</span><span>Gattung</span><span style="text-align:center;">Eigenschaften</span><span style="text-align:center;">Effkt</span><span>Angriff &amp; Schaden</span><span></span><span></span>
      </div>
      
      <div id="pcWeaponsList" style="display:flex; flex-direction:column; gap:4px;"></div>
      
      ${pc.activeShape === "none" ? `
        <div style="display:flex; justify-content:flex-end; margin-top:4px;">
          <button class="btn btn-add-weapon" style="font-family:'IM Fell English SC', serif; font-size:8px; padding:2px 8px;">➕ Neue Waffe hinzufügen</button>
        </div>
      ` : ''}
    </div>

    <!-- Datalists for autocompletes in drawer -->
    <datalist id="dice-options">
      <option value="1w3">
      <option value="1w4">
      <option value="1w6">
      <option value="1w8">
      <option value="1w10">
      <option value="1w12">
      <option value="2w4">
      <option value="2w6">
      <option value="2w8">
      <option value="2w10">
    </datalist>
    <datalist id="crit-options">
      <option value="20 / x2">
      <option value="20 / x3">
      <option value="20 / x4">
      <option value="19-20 / x2">
      <option value="19-20 / x3">
      <option value="18-20 / x2">
      <option value="18-20 / x3">
      <option value="17-20 / x2">
      <option value="15-20 / x2">
    </datalist>
  `;
}

function _bindGlobalCombatSettingsEvents(offense, pc, babVal, hasPowerAttack, hasCombatExpertise) {
  // Bind Power Attack input if active
  if (hasPowerAttack) {
    offense.querySelector('.power-attack-input').onchange = (e) => {
      const val = Math.max(0, Math.min(babVal, parseInt(e.target.value) || 0));
      CombatState.updatePCField('powerAttackPenalty', val);
      uiRegistry.renderPlayerScreen();
    };
  }

  // Bind Combat Expertise input if active
  if (hasCombatExpertise) {
    offense.querySelector('.combat-expertise-input').onchange = (e) => {
      const limit = Math.min(5, babVal);
      const val = Math.max(0, Math.min(limit, parseInt(e.target.value) || 0));
      CombatState.updatePCField('combatExpertisePenalty', val);
      uiRegistry.renderPlayerScreen();
    };

    const ceRuleBtn = offense.querySelector('.btn-rule-ce');
    if (ceRuleBtn) {
      ceRuleBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showCustomAlert(
          "Kampfgetümmel (Combat Expertise)",
          `
          <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
            <p><strong>Konzept:</strong> Du kannst deine offensive Genauigkeit opfern, um eine stärkere Rüstungsklasse aufzubauen.</p>
            <p><strong>Regel (D&D 3.5 RAW):</strong> Wenn du einen Angriff oder einen vollen Angriff deklarierst, kannst du einen Malus auf deine Angriffswürfe (bis zu deinem aktuellen GAB, maximal jedoch -5) wählen. Dieser Malus wird als Ausweichbonus (Dodge) auf deine Rüstungsklasse (RK) und Berührungs-RK bis zu deiner nächsten Runde addiert.</p>
            <p><strong>Obergrenzen:</strong> Der gewählte Malus darf deinen Grundangriffsbonus (GAB) nicht überschreiten und ist generell durch das Talent auf maximal -5 begrenzt.</p>
          </div>
          `,
          "Verstanden",
          "🛡️"
        );
      };
    }
  }

  // Bind Defensive Fighting input
  offense.querySelector('.defensive-fighting-input').onchange = (e) => {
    CombatState.togglePCDefensiveFighting(e.target.checked);
    uiRegistry.renderPlayerScreen();
  };

  const dfRuleBtn = offense.querySelector('.btn-rule-df');
  if (dfRuleBtn) {
    dfRuleBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showCustomAlert(
        "Verteidigend kämpfen (Defensive Fighting)",
        `
        <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
          <p><strong>Konzept:</strong> Ein grundlegendes Kampfmanöver, das jeder Charakter im Nahkampf (auch ohne spezielle Talente) ausführen kann.</p>
          <p><strong>Regel (D&D 3.5 RAW):</strong> Wenn du angreifst (als Standardaktion oder voller Angriff), kannst du dich entscheiden, verteidigend zu kämpfen. Du erleidest einen Malus von <strong>-4</strong> auf alle Angriffswürfe in dieser Runde, erhältst dafür aber einen Ausweichbonus (Dodge) von <strong>+2</strong> auf deine RK und Berührungs-RK bis zu deiner nächsten Runde.</p>
          <p><strong>Akrobatik-Synergie (Tumble):</strong> Wenn du <strong>5 oder mehr Ränge</strong> in der Fertigkeit Akrobatik hast, erhöht sich der gewährte RK-Ausweichbonus von +2 auf <strong>+3</strong>.</p>
        </div>
        `,
        "Verstanden",
        "⚔️"
      );
    };
  }

  // Bind Total Defense input
  offense.querySelector('.total-defense-input').onchange = (e) => {
    CombatState.togglePCTotalDefense(e.target.checked);
    uiRegistry.renderPlayerScreen();
  };

  // Bind Add Weapon button if active
  if (pc.activeShape === "none") {
    offense.querySelector('.btn-add-weapon').onclick = () => {
      CombatState.addPCWeapon();
      uiRegistry.renderPlayerScreen();
    };
  }
}

function _renderNaturalAttacksList(listContainer, pc) {
  let naturalAttacks = [];
  if (pc.activeShape === "wolf") {
    naturalAttacks = [
      {
        name: "Biss (Wolf)",
        damageDice: "1w6",
        crit: "20 / x2",
        enhancement: 0,
        isNatural: true,
        isSecondary: false,
        extra: "plus Trip (Zu-Boden-werfen)"
      }
    ];
  } else if (pc.activeShape === "leopard") {
    naturalAttacks = [
      {
        name: "Biss (Leopard)",
        damageDice: "1w6",
        crit: "20 / x2",
        enhancement: 0,
        isNatural: true,
        isSecondary: false
      },
      {
        name: "Kralle (Leopard)",
        damageDice: "1w3",
        crit: "20 / x2",
        enhancement: 0,
        isNatural: true,
        isSecondary: true,
        numAttacksFull: 2,
        extra: "2 Angriffe bei voller Aktion"
      },
      {
        name: "Harken (Rake)",
        damageDice: "1w3",
        crit: "20 / x2",
        enhancement: 0,
        isNatural: true,
        isSecondary: true,
        extra: "Nur bei Pounce (Anspringen)"
      }
    ];
  } else if (pc.activeShape === "bear") {
    naturalAttacks = [
      {
        name: "Kralle (Braunbär)",
        damageDice: "1w8",
        crit: "20 / x2",
        enhancement: 0,
        isNatural: true,
        isSecondary: false,
        numAttacksFull: 2,
        extra: "2 Angriffe bei voller Aktion"
      },
      {
        name: "Biss (Braunbär)",
        damageDice: "2w6",
        crit: "20 / x2",
        enhancement: 0,
        isNatural: true,
        isSecondary: true
      }
    ];
  }

  naturalAttacks.forEach((w) => {
    const seq = AttackEngine.calculateAttackSequence(pc, w, false);
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };

    const container = document.createElement('div');
    container.className = 'weapon-row-container';
    container.style = 'display:flex; flex-direction:column; gap:2px;';
    
    const row = document.createElement('div');
    row.style = 'display:grid; grid-template-columns: 80px 95px 90px 30px 1fr 18px 18px; gap:2px; align-items:center;';
    
    row.innerHTML = `
      <span style="font-size:8px; font-weight:bold; color:var(--red); overflow:hidden; white-space:nowrap; text-overflow:ellipsis;" title="${w.name}">${w.name}</span>
      <span style="font-size:7.5px; color:var(--inkm); text-align:center;">Natürl</span>
      <span style="font-size:8.5px; color:var(--inkm); text-align:center;">Natürl • ${w.damageDice} • ${w.crit}</span>
      <span style="font-size:7.5px; color:var(--inkm); text-align:center;">+0</span>
      <div style="display:flex; gap:2px; width:100%; align-items:center;">
        <button class="xbtn xbtn-dmg roll-atk-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:7px; font-weight:bold; flex:1; white-space:nowrap; height:16px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}" title="Angriff ausführen">
          ANGRIFF (${formatMod(stdAtkObj.atkTotal)}) 🎲
        </button>
        <button class="xbtn xbtn-heal roll-dmg-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:7px; font-weight:bold; flex:1; border-color:#2a6a2a; color:#1a4a1a; white-space:nowrap; height:16px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}">DMG (${formatMod(stdAtkObj.dmgTotal)})</button>
      </div>
      <span></span>
      <span></span>
    `;

    row.querySelector('.roll-atk-btn').onclick = (e) => {
      if (pc.isTotalDefense) return;
      showAttackChoiceDialog(pc, w, e);
    };

    row.querySelector('.roll-dmg-btn').onclick = (e) => {
      if (pc.isTotalDefense) return;
      let finalDice = w.damageDice;
      if (w.extra) {
        stdAtkObj.dmgBreakdown.push({ label: `Info: ${w.extra}`, value: 0 });
      }
      showRollBreakdown(`${w.name} (Schaden)`, finalDice, stdAtkObj.dmgBreakdown, e);
    };

    container.appendChild(row);
    listContainer.appendChild(container);
  });
}

function _renderInventoryWeaponsList(listContainer, pc) {
  pc.weapons.forEach((w, idx) => {
    const { container, row, drawer } = _createWeaponDOM(w, idx, pc);
    _bindWeaponRowEvents(row, drawer, w, idx, pc);
    listContainer.appendChild(container);
  });
}

function _createWeaponDOM(w, idx, pc) {
  const seq = AttackEngine.calculateAttackSequence(pc, w, false);
  const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };

  const container = document.createElement('div');
  container.className = 'weapon-row-container';
  container.style = 'display:flex; flex-direction:column; gap:2px;';
  
  const row = document.createElement('div');
  row.style = 'display:grid; grid-template-columns: 80px 95px 90px 30px 1fr 18px 18px; gap:2px; align-items:center;';
  
  // Check for Improved Critical (Verbesserter Kritischer Treffer) feat
  const hasImprovedCritical = pc.feats && pc.feats.some(f => 
    (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
    matchesFeatOption(w, f.option)
  );
  const isDoubleThreat = w.isKeen || hasImprovedCritical;
  const doubledCritDisplay = getCritThreatDisplay(w.crit, isDoubleThreat);

  const gripLabels = { '1h': '1H', '2h': '2H', 'sec': 'Schild', 'rng': 'Fern', 'unarmed': 'Waffenlos' };
  const gripText = gripLabels[w.grip] || w.grip;
  const propertiesText = `${gripText} • ${pc.getWeaponDamageDice(w) || '1w6'} • ${doubledCritDisplay}`;

  let typeOptionsHtml = '';
  const sortedWeapons = Object.values(WeaponRegistry).sort((a, b) => a.nameDe.localeCompare(b.nameDe, 'de'));
  sortedWeapons.forEach(def => {
    typeOptionsHtml += `<option value="${def.key}" ${w.type === def.key ? 'selected' : ''}>${def.nameDe}</option>`;
  });

  row.innerHTML = `
    <input type="text" value="${w.name}" class="cinput w-name" placeholder="z.B. Dolch" style="font-size:8px;">
    <select class="cinput w-type" style="font-size:7.5px; padding:0 1px; height:14px;">
      ${typeOptionsHtml}
    </select>
    <span style="font-size:8.5px; color:var(--inkm); text-align:center; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;" title="${propertiesText}">${propertiesText}</span>
    <input type="number" value="${w.enhancement}" class="cinput w-enhancement cinput-c" placeholder="+0" style="font-size:8px;">
    <div style="display:flex; gap:2px; width:100%; align-items:center;">
      <button class="xbtn xbtn-dmg roll-atk-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:7px; font-weight:bold; flex:1; white-space:nowrap; height:16px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}" title="Angriff ausführen (Standard/Voller)">
        ANGRIFF (${formatMod(stdAtkObj.atkTotal)}) 🎲
      </button>
      <button class="xbtn xbtn-heal roll-dmg-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:7px; font-weight:bold; flex:1; border-color:#2a6a2a; color:#1a4a1a; white-space:nowrap; height:16px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}">DMG (${formatMod(stdAtkObj.dmgTotal)})</button>
    </div>
    <button class="xbtn gear-btn" style="padding:0; border:none; background:transparent; font-size:10px; cursor:pointer; height:14px; width:14px; display:flex; align-items:center; justify-content:center; color:var(--inkm);" title="Optionen">⚙️</button>
    <button class="xbtn delete-btn" style="padding:0; border:none; background:transparent; font-size:9px; cursor:pointer; height:14px; width:14px; display:flex; align-items:center; justify-content:center; color:var(--red);" title="Löschen">✕</button>
  `;

  const wId = w.id || getWeaponRuntimeId(w);
  const isDrawerOpen = openDrawerIds.has(wId);

  // Render slide-out details drawer
  const drawer = document.createElement('div');
  drawer.className = 'weapon-details-drawer';
  drawer.style.display = isDrawerOpen ? 'flex' : 'none';
  drawer.style.cssText = `display: ${isDrawerOpen ? 'flex' : 'none'}; background: rgba(200,169,110,0.03); border: 0.5px solid rgba(200, 169, 110, 0.3); border-top: none; padding: 4px 6px; font-size: 8px; margin-top: -2px; margin-bottom: 4px; border-radius: 0 0 3px 3px; flex-direction: column; gap: 4px;`;
  
  const typeDef = WeaponRegistry[w.type] || WeaponRegistry.longsword;

  drawer.innerHTML = `
    <!-- Row 1: Zusatz-Atk, Scharf (Keen), Zusatz-Schaden -->
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; width:100%;">
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Zusatz-Atk:</span>
        <input type="text" class="cinput w-detail-atk" value="${w.attackBonus || ''}" placeholder="+0" style="width: 32px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
      <label style="display:flex; align-items:center; gap:3px; cursor:pointer; color:var(--inkm); margin: 0;">
        <input type="checkbox" class="w-detail-keen" ${w.isKeen ? 'checked' : ''} style="margin:0; width:10px; height:10px;"> Scharf (Keen)
      </label>
      <div style="display:flex; align-items:center; gap:2px; flex: 1; min-width: 100px;">
        <span style="color:var(--inkl);">Zusatz-Schaden:</span>
        <input type="text" class="cinput w-detail-extradmg" value="${w.extraDamage || ''}" placeholder="z.B. 1w6 Feuer" style="font-size: 8px; height: 14px; padding: 0 4px; flex: 1;">
      </div>
    </div>
    <!-- Row 2: Stärkelimit (if Composite), Grip-Abweichung, Schadenswürfel-Abweichung, Krit-Abweichung -->
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; width:100%;">
      ${typeDef.isComposite ? `
        <div style="display:flex; align-items:center; gap:2px;">
          <span style="color:var(--red); font-weight:bold;">Stärkelimit:</span>
          <input type="number" class="cinput w-detail-strengthrating" value="${w.strengthRating || 0}" min="0" style="width: 32px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
        </div>
      ` : ''}
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Grip-Abw.:</span>
        <select class="cinput w-detail-gripoverride" style="font-size:7.5px; height:14px; padding:0 1px;">
          <option value="" ${w.gripOverride === '' ? 'selected' : ''}>Standard</option>
          <option value="1h" ${w.gripOverride === '1h' ? 'selected' : ''}>1-Hand</option>
          <option value="2h" ${w.gripOverride === '2h' ? 'selected' : ''}>2-Hand</option>
          <option value="sec" ${w.gripOverride === 'sec' ? 'selected' : ''}>Schildh</option>
          <option value="rng" ${w.gripOverride === 'rng' ? 'selected' : ''}>Fernk</option>
          <option value="unarmed" ${w.gripOverride === 'unarmed' ? 'selected' : ''}>Waffenlos</option>
        </select>
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Schadens-Abw.:</span>
        <input type="text" list="dice-options" class="cinput w-detail-diceoverride" value="${w.damageDiceOverride || ''}" placeholder="Standard" style="width: 55px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Krit-Abw.:</span>
        <input type="text" list="crit-options" class="cinput w-detail-critoverride" value="${w.critOverride || ''}" placeholder="Standard" style="width: 70px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
    </div>
  `;

  container.appendChild(row);
  container.appendChild(drawer);

  return { container, row, drawer };
}

function _bindWeaponRowEvents(row, drawer, w, idx, pc) {
  row.querySelector('.w-name').onchange = (e) => { CombatState.updatePCWeapon(idx, 'name', e.target.value); };
  row.querySelector('.w-type').onchange = (e) => { CombatState.updatePCWeapon(idx, 'type', e.target.value); uiRegistry.renderPlayerScreen(); };
  row.querySelector('.w-enhancement').onchange = (e) => { CombatState.updatePCWeapon(idx, 'enhancement', parseInt(e.target.value) || 0); uiRegistry.renderPlayerScreen(); };

  // Detail drawer input handlers
  drawer.querySelector('.w-detail-atk').onchange = (e) => { CombatState.updatePCWeapon(idx, 'attackBonus', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.w-detail-keen').onchange = (e) => { CombatState.updatePCWeapon(idx, 'isKeen', e.target.checked); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.w-detail-extradmg').onchange = (e) => { CombatState.updatePCWeapon(idx, 'extraDamage', e.target.value); };

  const strRatingInput = drawer.querySelector('.w-detail-strengthrating');
  if (strRatingInput) {
    strRatingInput.onchange = (e) => { CombatState.updatePCWeapon(idx, 'strengthRating', parseInt(e.target.value) || 0); uiRegistry.renderPlayerScreen(); };
  }

  drawer.querySelector('.w-detail-gripoverride').onchange = (e) => { CombatState.updatePCWeapon(idx, 'gripOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.w-detail-diceoverride').onchange = (e) => { CombatState.updatePCWeapon(idx, 'damageDiceOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.w-detail-critoverride').onchange = (e) => { CombatState.updatePCWeapon(idx, 'critOverride', e.target.value); uiRegistry.renderPlayerScreen(); };

  const wId = w.id || getWeaponRuntimeId(w);

  // Action button handlers
  row.querySelector('.gear-btn').onclick = () => {
    const isVisible = drawer.style.display === 'flex';
    if (isVisible) {
      drawer.style.display = 'none';
      openDrawerIds.delete(wId);
    } else {
      drawer.style.display = 'flex';
      openDrawerIds.add(wId);
    }
  };

  row.querySelector('.delete-btn').onclick = () => {
    CombatState.deletePCWeapon(idx);
    uiRegistry.renderPlayerScreen();
  };

  row.querySelector('.roll-atk-btn').onclick = (e) => {
    if (pc.isTotalDefense) return;
    showAttackChoiceDialog(pc, w, e);
  };

  row.querySelector('.roll-dmg-btn').onclick = (e) => {
    if (pc.isTotalDefense) return;
    const seq = AttackEngine.calculateAttackSequence(pc, w, false);
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };

    let finalDice = pc.getWeaponDamageDice(w) || '1w6';
    if (w.extraDamage) {
      finalDice = `${finalDice} + ${w.extraDamage}`;
      if (!stdAtkObj.dmgBreakdown.some(d => d.label === 'Zusatz-Schaden')) {
        stdAtkObj.dmgBreakdown.push({ label: 'Zusatz-Schaden', value: w.extraDamage });
      }
    }
    
    const rogueClass = Array.isArray(pc.classes) ? pc.classes.find(x => x.classType === 'rogue') : null;
    if (rogueClass && pc.isSneakAttacking) {
      const saDiceCount = Math.floor((rogueClass.level + 1) / 2);
      finalDice = `${finalDice} + ${saDiceCount}W6`;
      stdAtkObj.dmgBreakdown.push({ label: `Hinterhältiger Angriff (${saDiceCount}W6)`, value: 0 });
    }

    showRollBreakdown(`${w.name || 'Waffe'} (Schaden)`, finalDice, stdAtkObj.dmgBreakdown, e);
  };
}
