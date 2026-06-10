import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { getAblMod, formatMod } from './PCUtils.js';
import { showAttackChoiceDialog, showRollBreakdown, showCustomAlert, showCustomConfirm } from '../dialogs.js';
import { MonkRules } from '../../../rules/classes/MonkRules.js';
import { WeaponRegistry, isLightWeapon, matchesFeatOption, isMonkWeapon, getCritThreatDisplay } from '../../../models/Weapon.js';
import { AttackEngine } from '../../../rules/AttackEngine.js';
import { ARMOR_REGISTRY } from '../../../data/armor-data.js';

export { isLightWeapon, getCritThreatDisplay };

const openDrawerIds = new Set();
const weaponRuntimeIds = new WeakMap();
let weaponIdCounter = 0;

function getWeaponRuntimeId(w) {
  if (!weaponRuntimeIds.has(w)) {
    weaponRuntimeIds.set(w, ++weaponIdCounter);
  }
  return weaponRuntimeIds.get(w);
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
}export function renderPCOffense(pc) {
  const offense = document.getElementById('pcOffense');
  if (!offense) return;

  const babVal = pc.bab.getValue();

  const hasPowerAttack = pc.feats && pc.feats.some(f => f.id === 'power_attack');
  const paPenalty = hasPowerAttack ? Math.min(babVal, parseInt(pc.powerAttackPenalty) || 0) : 0;

  const hasCombatExpertise = pc.feats && pc.feats.some(f => f.id === 'combat_expertise');
  const cePenalty = hasCombatExpertise ? Math.min(Math.min(5, babVal), parseInt(pc.combatExpertisePenalty) || 0) : 0;

  // Render Left Column (pcOffense): Visual Slots + Global Settings
  offense.innerHTML = _renderLeftColumnHtml(pc, babVal, paPenalty, cePenalty, hasPowerAttack, hasCombatExpertise);
  _bindLeftColumnEvents(offense, pc, babVal, hasPowerAttack, hasCombatExpertise);

  // If in Wild Shape, render natural attacks inside pcOffense as well
  if (pc.activeShape !== "none") {
    const natList = offense.querySelector('#pcNaturalAttacksList');
    if (natList) {
      _renderNaturalAttacksList(natList, pc);
    }
  }

  // Render Right Column (pcArmorPanel): Stash / Inventory (Rucksack)
  const armorPanel = document.getElementById('pcArmorPanel');
  if (armorPanel) {
    if (pc.activeShape !== "none") {
      armorPanel.innerHTML = `
        <div class="phdr"><h2>🎒 Rucksack &amp; Inventar</h2></div>
        <div class="pbody" style="padding: 20px; text-align: center; font-style: italic; color: var(--inkl);">
          In wilder Gestalt (Wild Shape) ist deine Ausrüstung inaktiv.
        </div>
      `;
    } else {
      _renderRightColumnHtml(armorPanel, pc);
    }
  }
}

function _getRarityStyle(enhancement) {
  return {
    border: '1.5px solid var(--pb)',
    background: 'rgba(200, 169, 110, 0.04)',
    boxShadow: 'inset 0 0 8px rgba(200, 169, 110, 0.05)',
    glowClass: ''
  };
}

function _renderLeftColumnHtml(pc, babVal, paPenalty, cePenalty, hasPowerAttack, hasCombatExpertise) {
  const equippedWeapons = Array.isArray(pc.weapons) ? pc.weapons.filter(w => w.isEquipped) : [];
  const mainHandWeapon = equippedWeapons.find(w => w.hand === 'main') || equippedWeapons.find(w => w.hand !== 'off') || null;
  let offHandWeapon = equippedWeapons.find(w => w.hand === 'off' || w.grip === 'sec') || null;
  let isDoubleWielded = false;
  if (mainHandWeapon && mainHandWeapon.isDoubleWielded) {
    offHandWeapon = mainHandWeapon;
    isDoubleWielded = true;
  }
  
  const equippedArmor = Array.isArray(pc.armors) ? pc.armors.find(a => a.isEquipped && !a.isShield) : null;
  const equippedShield = Array.isArray(pc.armors) ? pc.armors.find(a => a.isEquipped && a.isShield) : null;

  const mainStyle = _getRarityStyle(mainHandWeapon ? mainHandWeapon.enhancement : 0);
  const armorStyle = _getRarityStyle(equippedArmor ? equippedArmor.enhancement : 0);
  const offStyle = _getRarityStyle(equippedShield ? equippedShield.enhancement : (offHandWeapon ? offHandWeapon.enhancement : 0));

  // Haupthand Slot
  let mainHandHtml = `
    <div style="font-size:14px; color:var(--inkl); margin-bottom:1px; opacity:0.6;">⚔️</div>
    <div style="font-size:7.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif;">Haupthand</div>
    <div style="font-size:7px; color:var(--inkm); font-style:italic;">(Unbewaffnet)</div>
  `;
  if (mainHandWeapon) {
    const seq = AttackEngine.calculateAttackSequence(pc, mainHandWeapon, false);
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
    const hasImprovedCritical = pc.feats && pc.feats.some(f => 
      (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
      matchesFeatOption(mainHandWeapon, f.option)
    );
    const isDoubleThreat = mainHandWeapon.isKeen || hasImprovedCritical;
    const doubledCritDisplay = getCritThreatDisplay(mainHandWeapon.crit, isDoubleThreat);
    const dmgDice = pc.getWeaponDamageDice(mainHandWeapon) || '1w6';
    const extraDamage = mainHandWeapon.extraDamage ? ` + ${mainHandWeapon.extraDamage}` : '';

    mainHandHtml = `
      <button class="unequip-slot-btn mainhand-unequip" data-idx="${pc.weapons.indexOf(mainHandWeapon)}" style="position:absolute; top:2px; right:4px; border:none; background:transparent; font-size:7.5px; cursor:pointer; color:var(--red); padding:0;" title="Ablegen">✕</button>
      <div style="font-size:6.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif; margin-bottom:1px; opacity:0.8;">Haupthand</div>
      <div class="equipped-title-w-${pc.weapons.indexOf(mainHandWeapon)}" style="font-family:'Crimson Text',serif; font-size:9.5px; font-weight:bold; color:var(--red); text-shadow:0 0 1px rgba(139,26,26,0.1); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${mainHandWeapon.name}">${mainHandWeapon.name}</div>
      <div style="font-size:7px; color:var(--inkm); margin:1px 0 3px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${dmgDice}${extraDamage} • ${doubledCritDisplay}">${dmgDice}${extraDamage} • ${doubledCritDisplay}</div>
      <div style="display:flex; gap:2px; width:100%; justify-content:center; align-items:center;">
        <button class="xbtn xbtn-dmg roll-atk-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:6.5px; font-weight:bold; flex:1; white-space:nowrap; height:15px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}" title="Angriff ausführen">
          ATK (${formatMod(stdAtkObj.atkTotal)}) 🎲
        </button>
        <button class="xbtn xbtn-heal roll-dmg-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:6.5px; font-weight:bold; flex:1; border-color:#2a6a2a; color:#1a4a1a; white-space:nowrap; height:15px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}">DMG (${formatMod(stdAtkObj.dmgTotal)})</button>
      </div>
    `;
  }

  // Rüstung Slot
  let armorHtml = `
    <div style="font-size:14px; color:var(--inkl); margin-bottom:1px; opacity:0.6;">👕</div>
    <div style="font-size:7.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif;">Rüstung</div>
    <div style="font-size:7px; color:var(--inkm); font-style:italic;">(Keine)</div>
  `;
  if (equippedArmor) {
    const maxDexDisplay = equippedArmor.maxDex !== null ? equippedArmor.maxDex : '—';
    armorHtml = `
      <button class="unequip-slot-btn armor-unequip" data-idx="${pc.armors.indexOf(equippedArmor)}" style="position:absolute; top:2px; right:4px; border:none; background:transparent; font-size:7.5px; cursor:pointer; color:var(--red); padding:0;" title="Ablegen">✕</button>
      <div style="font-size:6.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif; margin-bottom:1px; opacity:0.8;">Rüstung</div>
      <div class="equipped-title-a-${pc.armors.indexOf(equippedArmor)}" style="font-family:'Crimson Text',serif; font-size:9.5px; font-weight:bold; color:var(--red); text-shadow:0 0 1px rgba(139,26,26,0.1); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${equippedArmor.name || equippedArmor.typeDef?.nameDe || 'Rüstung'}">${equippedArmor.name || equippedArmor.typeDef?.nameDe || 'Rüstung'}</div>
      <div style="font-size:7.5px; color:var(--inkm); margin-top:2px; line-height:1.2;">+${equippedArmor.armorBonus} RK</div>
      <div style="font-size:6.5px; color:var(--inkm); line-height:1;">Dex-Lim: ${maxDexDisplay} | Malus: -${equippedArmor.checkPenalty}</div>
    `;
  }

  // Nebenhand Slot
  let offHandHtml = `
    <div style="font-size:14px; color:var(--inkl); margin-bottom:1px; opacity:0.6;">🛡️</div>
    <div style="font-size:7.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif;">Nebenhand</div>
    <div style="font-size:7px; color:var(--inkm); font-style:italic;">(Leer)</div>
  `;
  if (equippedShield) {
    offHandHtml = `
      <button class="unequip-slot-btn shield-unequip" data-idx="${pc.armors.indexOf(equippedShield)}" style="position:absolute; top:2px; right:4px; border:none; background:transparent; font-size:7.5px; cursor:pointer; color:var(--red); padding:0;" title="Ablegen">✕</button>
      <div style="font-size:6.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif; margin-bottom:1px; opacity:0.8;">Nebenhand</div>
      <div class="equipped-title-a-${pc.armors.indexOf(equippedShield)}" style="font-family:'Crimson Text',serif; font-size:9.5px; font-weight:bold; color:var(--red); text-shadow:0 0 1px rgba(139,26,26,0.1); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${equippedShield.name || equippedShield.typeDef?.nameDe || 'Schild'}">${equippedShield.name || equippedShield.typeDef?.nameDe || 'Schild'}</div>
      <div style="font-size:7.5px; color:var(--inkm); margin-top:2px; line-height:1.2;">+${equippedShield.armorBonus} RK (Schild)</div>
      <div style="font-size:6.5px; color:var(--inkm); line-height:1;">Malus: -${equippedShield.checkPenalty}</div>
    `;
  } else if (offHandWeapon) {
    const seq = AttackEngine.calculateAttackSequence(pc, offHandWeapon, false, { isOffhandAttack: true });
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
    const hasImprovedCritical = pc.feats && pc.feats.some(f => 
      (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
      matchesFeatOption(offHandWeapon, f.option)
    );
    const isDoubleThreat = offHandWeapon.isKeen || hasImprovedCritical;
    const doubledCritDisplay = getCritThreatDisplay(offHandWeapon.crit, isDoubleThreat);
    const dmgDice = pc.getWeaponDamageDice(offHandWeapon) || '1w6';
    const extraDamage = offHandWeapon.extraDamage ? ` + ${offHandWeapon.extraDamage}` : '';
    
    const offhandLabel = isDoubleWielded ? 'Nebenhand (Nebenseite)' : 'Nebenhand';

    offHandHtml = `
      <button class="unequip-slot-btn offhand-unequip" data-idx="${pc.weapons.indexOf(offHandWeapon)}" style="position:absolute; top:2px; right:4px; border:none; background:transparent; font-size:7.5px; cursor:pointer; color:var(--red); padding:0;" title="Ablegen">✕</button>
      <div style="font-size:6.5px; color:var(--inkl); font-weight:bold; text-transform:uppercase; font-family:'IM Fell English SC', serif; margin-bottom:1px; opacity:0.8;">${offhandLabel}</div>
      <div class="equipped-title-w-${pc.weapons.indexOf(offHandWeapon)}" style="font-family:'Crimson Text',serif; font-size:9.5px; font-weight:bold; color:var(--red); text-shadow:0 0 1px rgba(139,26,26,0.1); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${offHandWeapon.name}">${isDoubleWielded ? offHandWeapon.name + ' (Nebenseite)' : offHandWeapon.name}</div>
      <div style="font-size:7px; color:var(--inkm); margin:1px 0 3px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; width:100%;" title="${dmgDice}${extraDamage} • ${doubledCritDisplay}">${dmgDice}${extraDamage} • ${doubledCritDisplay}</div>
      <div style="display:flex; gap:2px; width:100%; justify-content:center; align-items:center;">
        <button class="xbtn xbtn-dmg roll-atk-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:6.5px; font-weight:bold; flex:1; white-space:nowrap; height:15px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}" title="Angriff ausführen">
          ATK (${formatMod(stdAtkObj.atkTotal)}) 🎲
        </button>
        <button class="xbtn xbtn-heal roll-dmg-btn" ${pc.isTotalDefense ? 'disabled' : ''} style="padding:1px 2px; font-size:6.5px; font-weight:bold; flex:1; border-color:#2a6a2a; color:#1a4a1a; white-space:nowrap; height:15px; line-height:1; ${pc.isTotalDefense ? 'opacity:0.4; cursor:not-allowed;' : ''}">DMG (${formatMod(stdAtkObj.dmgTotal)})</button>
      </div>
    `;
  }

  let activeSlotsAreaHtml = `
    <div style="display:flex; justify-content:center; gap:8px; margin-bottom:10px; padding:6px; background:rgba(200, 169, 110, 0.04); border:0.5px solid var(--pb); border-radius:4px;">
      <!-- Main Hand Slot -->
      <div class="arpg-slot main-hand-slot ${mainStyle.glowClass}" style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:82px; border:${mainStyle.border}; border-radius:4px; padding:5px 6px; text-align:center; background:${mainStyle.background}; box-shadow:${mainStyle.boxShadow}; transition:all 0.15s ease-out;">
        ${mainHandHtml}
      </div>
      <!-- Armor Slot -->
      <div class="arpg-slot armor-slot ${armorStyle.glowClass}" style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:82px; border:${armorStyle.border}; border-radius:4px; padding:5px 6px; text-align:center; background:${armorStyle.background}; box-shadow:${armorStyle.boxShadow}; transition:all 0.15s ease-out;">
        ${armorHtml}
      </div>
      <!-- Off Hand Slot -->
      <div class="arpg-slot off-hand-slot ${offStyle.glowClass}" style="position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:82px; border:${offStyle.border}; border-radius:4px; padding:5px 6px; text-align:center; background:${offStyle.background}; box-shadow:${offStyle.boxShadow}; transition:all 0.15s ease-out;">
        ${offHandHtml}
      </div>
    </div>
  `;

  if (pc.activeShape !== "none") {
    activeSlotsAreaHtml = `
      <div style="background:rgba(200, 169, 110, 0.04); border:0.5px solid var(--pb); border-radius:4px; padding:8px 10px; text-align:center; font-style:italic; color:var(--inkl); font-family:'IM Fell English SC', serif; font-size:9px; margin-bottom:8px;">
        In wilder Gestalt (Wild Shape) ist deine normale Ausrüstung inaktiv. Verwende deine natürlichen Waffen.
      </div>
      <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--inkl); padding-bottom:2px; border-bottom:0.5px solid var(--pb); margin-bottom:4px; font-weight:bold;">
        🐾 Natürliche Angriffe
      </div>
      <div id="pcNaturalAttacksList" style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px;"></div>
    `;
  }

  return `
    <div class="phdr"><h2>⚔️ Aktive Ausrüstung &amp; Kampf</h2></div>
    <div class="pbody" style="display:flex; flex-direction:column; gap:4px;">
      
      <!-- Visual Equipment Slots -->
      ${activeSlotsAreaHtml}

      <!-- Combat Settings -->
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

      <!-- Regelwerk-Referenz Guide -->
      <div style="margin-top: 10px; border-top: 1px double var(--pb); padding-top: 8px;">
        <div style="font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
          📜 Regelwerk-Referenz (D&D 3.5 RAW)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 7.5px; font-family: 'Crimson Text', serif; line-height: 1.25; color: var(--ink);">
          
          <!-- Waffen-Eigenschaften Column -->
          <div style="background: rgba(200, 169, 110, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.15); border-radius: 3px; padding: 5px;">
            <div style="font-weight: bold; color: var(--red); border-bottom: 0.5px solid rgba(200, 169, 110, 0.2); margin-bottom: 4px; padding-bottom: 1px; font-family: 'IM Fell English SC', serif; font-size: 8px;">⚔️ Waffen-Werte</div>
            <ul style="margin: 0; padding-left: 10px; display: flex; flex-direction: column; gap: 3px; list-style-type: square;">
              <li><strong>Zusatz-Atk:</strong> Manueller Bonus auf Angriffe (z.B. durch <em>Waffenfokus</em> <code>+1</code>, Magie oder Meisterarbeit).</li>
              <li><strong>Scharf (Keen):</strong> Verdoppelt den kritischen Bedrohungsbereich (z.B. 19-20 wird zu 17-20). Stackt <u>nicht</u> mit dem Talent <em>Verbesserter Kritischer Treffer</em>.</li>
              <li><strong>Grip-Abw. (Händigkeit):</strong> Überschreibt die Trageweise: Einhändig (1H), Zweihändig (2H: gewährt 1.5x Stärkebonus auf Schaden), Schildhand (Sec: Zweitwaffe), Fernkampf (Rng) oder Waffenlos (Unarmed).</li>
              <li><strong>Schadens-Abw.:</strong> Überschreibt den Basis-Schadenswürfel der Waffe (z.B. <code>1w8</code>, <code>2w6</code>).</li>
              <li><strong>Krit-Abw.:</strong> Überschreibt den kritischen Multiplikator und Bedrohungsbereich (z.B. <code>20 / x3</code>).</li>
            </ul>
          </div>
          
          <!-- Rüstungs-Eigenschaften Column -->
          <div style="background: rgba(200, 169, 110, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.15); border-radius: 3px; padding: 5px;">
            <div style="font-weight: bold; color: var(--red); border-bottom: 0.5px solid rgba(200, 169, 110, 0.2); margin-bottom: 4px; padding-bottom: 1px; font-family: 'IM Fell English SC', serif; font-size: 8px;">🛡️ Rüstungs-Werte</div>
            <ul style="margin: 0; padding-left: 10px; display: flex; flex-direction: column; gap: 3px; list-style-type: square;">
              <li><strong>RK-Abw.:</strong> Überschreibt den Rüstungsbonus. Gleiche Rüstungsboni stacken nicht (z.B. Magische Rüstung und Zauber <em>Mage Armor</em>).</li>
              <li><strong>MaxDex (Max. Geschick):</strong> Begrenzt den Geschicklichkeitsbonus auf die Rüstungsklasse (RK), da schwere Rüstung die Ausweichfähigkeit einschränkt.</li>
              <li><strong>Malus-Abw.:</strong> Rüstungsmalus auf Fertigkeiten für Stärke und Geschicklichkeit (Akrobatik, Klettern etc.). Doppelt beim Schwimmen.</li>
              <li><strong>Zauberpatzer-Abw.:</strong> Prozentuale Chance, dass ein arkaner Gestenzauber (Somatic) fehlschlägt. Gilt nicht für göttliche Magie.</li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>

    <!-- Datalists for autocompletes in drawer -->
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

function _bindLeftColumnEvents(offense, pc, babVal, hasPowerAttack, hasCombatExpertise) {
  _bindGlobalCombatSettingsEvents(offense, pc, babVal, hasPowerAttack, hasCombatExpertise);

  const equippedWeapons = Array.isArray(pc.weapons) ? pc.weapons.filter(w => w.isEquipped) : [];
  const mainHandWeapon = equippedWeapons.find(w => w.hand === 'main') || equippedWeapons.find(w => w.hand !== 'off') || null;
  let offHandWeapon = equippedWeapons.find(w => w.hand === 'off' || w.grip === 'sec') || null;
  let isDoubleWielded = false;
  if (mainHandWeapon && mainHandWeapon.isDoubleWielded) {
    offHandWeapon = mainHandWeapon;
    isDoubleWielded = true;
  }
  
  const equippedArmor = Array.isArray(pc.armors) ? pc.armors.find(a => a.isEquipped && !a.isShield) : null;
  const equippedShield = Array.isArray(pc.armors) ? pc.armors.find(a => a.isEquipped && a.isShield) : null;

  const mainUnequip = offense.querySelector('.mainhand-unequip');
  if (mainUnequip) {
    mainUnequip.onclick = () => {
      const idx = pc.weapons.indexOf(mainHandWeapon);
      CombatState.togglePCWeaponEquip(idx);
      uiRegistry.renderPlayerScreen();
    };
  }

  const offUnequip = offense.querySelector('.offhand-unequip');
  if (offUnequip) {
    offUnequip.onclick = () => {
      const idx = pc.weapons.indexOf(offHandWeapon);
      CombatState.togglePCWeaponEquip(idx);
      uiRegistry.renderPlayerScreen();
    };
  }

  const armorUnequip = offense.querySelector('.armor-unequip');
  if (armorUnequip) {
    armorUnequip.onclick = () => {
      const idx = pc.armors.indexOf(equippedArmor);
      CombatState.togglePCArmorEquip(idx);
      uiRegistry.renderPlayerScreen();
    };
  }

  const shieldUnequip = offense.querySelector('.shield-unequip');
  if (shieldUnequip) {
    shieldUnequip.onclick = () => {
      const idx = pc.armors.indexOf(equippedShield);
      CombatState.togglePCArmorEquip(idx);
      uiRegistry.renderPlayerScreen();
    };
  }

  // Bind Roll Buttons in Haupthand Slot
  const mainSlot = offense.querySelector('.main-hand-slot');
  if (mainSlot && mainHandWeapon) {
    const atkBtn = mainSlot.querySelector('.roll-atk-btn');
    if (atkBtn) {
      atkBtn.onclick = (e) => {
        if (pc.isTotalDefense) return;
        showAttackChoiceDialog(pc, mainHandWeapon, e);
      };
    }
    const dmgBtn = mainSlot.querySelector('.roll-dmg-btn');
    if (dmgBtn) {
      dmgBtn.onclick = (e) => {
        if (pc.isTotalDefense) return;
        const seq = AttackEngine.calculateAttackSequence(pc, mainHandWeapon, false);
        const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
        
        let finalDice = pc.getWeaponDamageDice(mainHandWeapon) || '1w6';
        if (mainHandWeapon.extraDamage) {
          finalDice = `${finalDice} + ${mainHandWeapon.extraDamage}`;
          if (!stdAtkObj.dmgBreakdown.some(d => d.label === 'Zusatz-Schaden')) {
            stdAtkObj.dmgBreakdown.push({ label: 'Zusatz-Schaden', value: mainHandWeapon.extraDamage });
          }
        }
        
        const rogueClass = Array.isArray(pc.classes) ? pc.classes.find(x => x.classType === 'rogue') : null;
        if (rogueClass && pc.isSneakAttacking) {
          const saDiceCount = Math.floor((rogueClass.level + 1) / 2);
          finalDice = `${finalDice} + ${saDiceCount}W6`;
          stdAtkObj.dmgBreakdown.push({ label: `Hinterhältiger Angriff (${saDiceCount}W6)`, value: 0 });
        }

        showRollBreakdown(`${mainHandWeapon.name || 'Waffe'} (Schaden)`, finalDice, stdAtkObj.dmgBreakdown, e);
      };
    }
  }

  // Bind Roll Buttons in Nebenhand Slot
  const offSlot = offense.querySelector('.off-hand-slot');
  if (offSlot && offHandWeapon) {
    const atkBtn = offSlot.querySelector('.roll-atk-btn');
    if (atkBtn) {
      atkBtn.onclick = (e) => {
        if (pc.isTotalDefense) return;
        showAttackChoiceDialog(pc, offHandWeapon, e, { isOffhandAttack: true });
      };
    }
    const dmgBtn = offSlot.querySelector('.roll-dmg-btn');
    if (dmgBtn) {
      dmgBtn.onclick = (e) => {
        if (pc.isTotalDefense) return;
        const seq = AttackEngine.calculateAttackSequence(pc, offHandWeapon, false, { isOffhandAttack: true });
        const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
        
        let finalDice = pc.getWeaponDamageDice(offHandWeapon) || '1w6';
        if (offHandWeapon.extraDamage) {
          finalDice = `${finalDice} + ${offHandWeapon.extraDamage}`;
          if (!stdAtkObj.dmgBreakdown.some(d => d.label === 'Zusatz-Schaden')) {
            stdAtkObj.dmgBreakdown.push({ label: 'Zusatz-Schaden', value: offHandWeapon.extraDamage });
          }
        }

        const rogueClass = Array.isArray(pc.classes) ? pc.classes.find(x => x.classType === 'rogue') : null;
        if (rogueClass && pc.isSneakAttacking) {
          const saDiceCount = Math.floor((rogueClass.level + 1) / 2);
          finalDice = `${finalDice} + ${saDiceCount}W6`;
          stdAtkObj.dmgBreakdown.push({ label: `Hinterhältiger Angriff (${saDiceCount}W6)`, value: 0 });
        }

        const offhandName = isDoubleWielded ? `${offHandWeapon.name || 'Waffe'} (Nebenseite)` : (offHandWeapon.name || 'Zweitwaffe');
        showRollBreakdown(`${offhandName} (Schaden)`, finalDice, stdAtkObj.dmgBreakdown, e);
      };
    }
  }
}

function _renderRightColumnHtml(panel, pc) {
  panel.innerHTML = `
    <div class="phdr"><h2>🎒 Rucksack &amp; Inventar</h2></div>
    <div class="pbody" style="display:flex; flex-direction:column; gap:6px;">
      <!-- Weapons Stash -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:0.5px solid var(--pb); margin-bottom:4px; padding-bottom:2px;">
          <span style="font-family:'IM Fell English SC', serif; font-size:9px; font-weight:bold; color:var(--red);">⚔️ Waffenkammer</span>
          <button class="btn btn-add-weapon" style="font-family:'IM Fell English SC', serif; font-size:7.5px; padding:1px 5px; height:14px; line-height:1;">➕ Waffe</button>
        </div>
        <div id="pcWeaponsList" style="display:flex; flex-direction:column; gap:4px;"></div>
      </div>
      
      <!-- Armor Stash -->
      <div style="margin-top:2px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:0.5px solid var(--pb); margin-bottom:4px; padding-bottom:2px;">
          <span style="font-family:'IM Fell English SC', serif; font-size:9px; font-weight:bold; color:var(--red);">🛡️ Rüstungskammer</span>
          <button class="btn btn-add-armor" style="font-family:'IM Fell English SC', serif; font-size:7.5px; padding:1px 5px; height:14px; line-height:1;">➕ Ausrüstung</button>
        </div>
        <div id="pcArmorList" style="display:flex; flex-direction:column; gap:4px;"></div>
      </div>
    </div>
  `;

  // Bind Add buttons
  panel.querySelector('.btn-add-weapon').onclick = () => {
    CombatState.addPCWeapon();
    uiRegistry.renderPlayerScreen();
  };
  panel.querySelector('.btn-add-armor').onclick = () => {
    CombatState.addPCArmor('padded');
    uiRegistry.renderPlayerScreen();
  };

  // Populate lists
  const offense = document.getElementById('pcOffense');
  let weaponsList = offense ? offense.querySelector('#pcWeaponsList') : null;
  if (!weaponsList) {
    weaponsList = panel.querySelector('#pcWeaponsList');
  }
  if (weaponsList) {
    if (!Array.isArray(pc.weapons)) pc.weapons = [];
    pc.weapons.forEach((w, idx) => {
      const card = _createStashWeaponCard(w, idx, pc);
      weaponsList.appendChild(card);
    });
  }

  let armorList = offense ? offense.querySelector('#pcArmorList') : null;
  if (!armorList) {
    armorList = panel.querySelector('#pcArmorList');
  }
  if (armorList) {
    if (!Array.isArray(pc.armors)) pc.armors = [];
    pc.armors.forEach((a, idx) => {
      const card = _createStashArmorCard(a, idx, pc);
      armorList.appendChild(card);
    });
  }
}

function _bindGlobalCombatSettingsEvents(offense, pc, babVal, hasPowerAttack, hasCombatExpertise) {
  if (hasPowerAttack) {
    const paInput = offense.querySelector('.power-attack-input');
    if (paInput) {
      paInput.onchange = (e) => {
        const val = Math.max(0, Math.min(babVal, parseInt(e.target.value) || 0));
        CombatState.updatePCField('powerAttackPenalty', val);
        uiRegistry.renderPlayerScreen();
      };
    }
  }

  if (hasCombatExpertise) {
    const ceInput = offense.querySelector('.combat-expertise-input');
    if (ceInput) {
      ceInput.onchange = (e) => {
        const limit = Math.min(5, babVal);
        const val = Math.max(0, Math.min(limit, parseInt(e.target.value) || 0));
        CombatState.updatePCField('combatExpertisePenalty', val);
        uiRegistry.renderPlayerScreen();
      };
    }

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

  const dfInput = offense.querySelector('.defensive-fighting-input');
  if (dfInput) {
    dfInput.onchange = (e) => {
      CombatState.togglePCDefensiveFighting(e.target.checked);
      uiRegistry.renderPlayerScreen();
    };
  }

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

  const tdInput = offense.querySelector('.total-defense-input');
  if (tdInput) {
    tdInput.onchange = (e) => {
      CombatState.togglePCTotalDefense(e.target.checked);
      uiRegistry.renderPlayerScreen();
    };
  }
}

function _createStashWeaponCard(w, idx, pc) {
  const rStyle = _getRarityStyle(w.enhancement);
  const container = document.createElement('div');
  container.className = 'stash-item-card-container';
  container.style = 'display:flex; flex-direction:column; gap:2px;';

  const card = document.createElement('div');
  card.className = `stash-item-card ${rStyle.glowClass}`;
  card.style.cssText = `
    display: flex;
    flex-direction: column;
    border: ${rStyle.border};
    border-radius: 4px;
    padding: 5px 6px;
    background: ${rStyle.background};
    box-shadow: ${rStyle.boxShadow};
    transition: all 0.15s ease-out;
    position: relative;
    margin-top: ${w.isEquipped ? '6px' : '0'};
  `;

  let typeOptionsHtml = '';
  const sortedWeapons = Object.values(WeaponRegistry).sort((a, b) => a.nameDe.localeCompare(b.nameDe, 'de'));
  sortedWeapons.forEach(def => {
    typeOptionsHtml += `<option value="${def.key}" ${w.type === def.key ? 'selected' : ''}>${def.nameDe}</option>`;
  });

  const activeBadge = w.isEquipped ? `
    <span style="position: absolute; top: -6px; left: 8px; font-size: 6px; color: #ffffff; background: #2a6a2a; border-radius: 2px; padding: 1px 4px; font-family: 'IM Fell English SC', serif; font-weight: bold; letter-spacing: 0.3px; pointer-events: none; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.15);">Ausgerüstet</span>
  ` : '';

  const seq = AttackEngine.calculateAttackSequence(pc, w, false);
  const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
  const hasImprovedCritical = pc.feats && pc.feats.some(f => 
    (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
    matchesFeatOption(w, f.option)
  );
  const isDoubleThreat = w.isKeen || hasImprovedCritical;
  const doubledCritDisplay = getCritThreatDisplay(w.crit, isDoubleThreat);

  card.innerHTML = `
    ${activeBadge}
    <!-- Row 1: Name and Delete -->
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px;">
      <input type="text" value="${w.name}" class="cinput w-name" placeholder="z.B. Dolch" style="font-size: 9px; height: 18px; padding: 0 4px; flex: 1; font-weight: bold; border-color: rgba(200, 169, 110, 0.25);">
      <button class="xbtn delete-btn" style="padding: 0; border: none; background: transparent; font-size: 10px; cursor: pointer; height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--red); transition: color 0.15s;" title="Löschen">✕</button>
    </div>
    <!-- Row 2: Type, Enhancement, Hand, Equip, Options -->
    <div style="display: flex; align-items: center; gap: 4px;">
      <select class="cinput w-type" style="font-size: 7.5px; padding: 0 2px; height: 16px; flex: 1.2; min-width: 0;">
        ${typeOptionsHtml}
      </select>
      <div style="display: flex; align-items: center; gap: 1px; flex: 0.6; min-width: 0;">
        <span style="font-size: 7.5px; color: var(--inkm);">+</span>
        <input type="number" value="${w.enhancement}" class="cinput w-enhancement cinput-c" placeholder="0" style="font-size: 8px; height: 16px; width: 20px; padding: 0; text-align: center;">
      </div>
      ${w.grip === '2h' ? `
        <select class="cinput w-hand-select" disabled style="font-size: 7.5px; padding: 0 1px; height: 16px; flex: 1.1; min-width: 0; opacity: 0.65; cursor: not-allowed; background: rgba(200, 169, 110, 0.05); text-align: center;">
          <option>Zweihändig</option>
        </select>
      ` : w.grip === 'rng' ? `
        <select class="cinput w-hand-select" disabled style="font-size: 7.5px; padding: 0 1px; height: 16px; flex: 1.1; min-width: 0; opacity: 0.65; cursor: not-allowed; background: rgba(200, 169, 110, 0.05); text-align: center;">
          <option>Fernkampf</option>
        </select>
      ` : `
        <select class="cinput w-hand-select" style="font-size: 7.5px; padding: 0 1px; height: 16px; flex: 1.1; min-width: 0;">
          <option value="main" ${w.hand !== 'off' ? 'selected' : ''}>Haupthand</option>
          <option value="off" ${w.hand === 'off' ? 'selected' : ''}>Nebenhand</option>
        </select>
      `}
      <button class="xbtn equip-btn" style="padding: 0 6px; font-size: 7.5px; font-weight: bold; height: 16px; line-height: 14px; border-color: ${w.isEquipped ? '#b38600' : 'var(--pb)'}; color: ${w.isEquipped ? '#b38600' : 'var(--ink)'}; background: ${w.isEquipped ? 'rgba(200, 169, 110, 0.08)' : 'transparent'}; border-radius: 2px;" title="${w.isEquipped ? 'Ablegen' : 'Anlegen'}">
        ${w.isEquipped ? 'Ablegen' : 'Anlegen'}
      </button>
      <button class="xbtn gear-btn" style="padding: 0; border: none; background: transparent; font-size: 11px; cursor: pointer; height: 16px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--inkm);" title="Optionen">⚙️</button>
    </div>
    <div style="display: none;">
      <span class="roll-atk-btn">ANGRIFF (${formatMod(stdAtkObj.atkTotal)}) 🎲</span>
      <span class="roll-dmg-btn">DMG (${formatMod(stdAtkObj.dmgTotal)})</span>
      <span>${doubledCritDisplay}</span>
    </div>
  `;

  // Options Drawer
  const wId = w.id || getWeaponRuntimeId(w);
  const isDrawerOpen = openDrawerIds.has(wId);
  const drawer = document.createElement('div');
  drawer.className = 'weapon-details-drawer';
  drawer.style.cssText = `display: ${isDrawerOpen ? 'flex' : 'none'}; background: rgba(200,169,110,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); border-top: none; padding: 4px 6px; font-size: 8px; margin-top: -2px; margin-bottom: 2px; border-radius: 0 0 3px 3px; flex-direction: column; gap: 4px;`;
  drawer.style.display = isDrawerOpen ? 'flex' : 'none';
  
  const typeDef = WeaponRegistry[w.type] || WeaponRegistry.longsword;

  drawer.innerHTML = `
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
        <select class="cinput w-detail-diceoverride" style="font-size:7.5px; height:14px; padding:0 1px;">
          <option value="" ${w.damageDiceOverride === '' ? 'selected' : ''}>Standard</option>
          <option value="1w2" ${w.damageDiceOverride === '1w2' ? 'selected' : ''}>1w2</option>
          <option value="1w3" ${w.damageDiceOverride === '1w3' ? 'selected' : ''}>1w3</option>
          <option value="1w4" ${w.damageDiceOverride === '1w4' ? 'selected' : ''}>1w4</option>
          <option value="1w6" ${w.damageDiceOverride === '1w6' ? 'selected' : ''}>1w6</option>
          <option value="1w8" ${w.damageDiceOverride === '1w8' ? 'selected' : ''}>1w8</option>
          <option value="1w10" ${w.damageDiceOverride === '1w10' ? 'selected' : ''}>1w10</option>
          <option value="1w12" ${w.damageDiceOverride === '1w12' ? 'selected' : ''}>1w12</option>
          <option value="2w4" ${w.damageDiceOverride === '2w4' ? 'selected' : ''}>2w4</option>
          <option value="2w6" ${w.damageDiceOverride === '2w6' ? 'selected' : ''}>2w6</option>
          <option value="2w8" ${w.damageDiceOverride === '2w8' ? 'selected' : ''}>2w8</option>
          <option value="2w10" ${w.damageDiceOverride === '2w10' ? 'selected' : ''}>2w10</option>
          <option value="3w6" ${w.damageDiceOverride === '3w6' ? 'selected' : ''}>3w6</option>
          <option value="3w8" ${w.damageDiceOverride === '3w8' ? 'selected' : ''}>3w8</option>
          <option value="4w6" ${w.damageDiceOverride === '4w6' ? 'selected' : ''}>4w6</option>
        </select>
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Krit-Abw.:</span>
        <input type="text" list="crit-options" class="cinput w-detail-critoverride" value="${w.critOverride || ''}" placeholder="Standard" style="width: 70px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
    </div>
  `;

  // Bind Events
  const wNameInput = card.querySelector('.w-name');
  wNameInput.oninput = (e) => {
    const val = e.target.value;
    CombatState.updatePCWeapon(idx, 'name', val);
    const activeSlotTitle = document.querySelector(`.equipped-title-w-${idx}`);
    if (activeSlotTitle) {
      activeSlotTitle.textContent = val;
      activeSlotTitle.title = val;
    }
  };
  wNameInput.onchange = (e) => {
    CombatState.updatePCWeapon(idx, 'name', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  card.querySelector('.w-type').onchange = (e) => { CombatState.updatePCWeapon(idx, 'type', e.target.value); uiRegistry.renderPlayerScreen(); };
  card.querySelector('.w-enhancement').onchange = (e) => { CombatState.updatePCWeapon(idx, 'enhancement', parseInt(e.target.value) || 0); uiRegistry.renderPlayerScreen(); };
  
  const handSelect = card.querySelector('.w-hand-select');
  if (handSelect) {
    handSelect.onchange = (e) => {
      const val = e.target.value;
      if (w.isEquipped) {
        CombatState.togglePCWeaponEquip(idx);
      }
      CombatState.updatePCWeapon(idx, 'hand', val);
      uiRegistry.renderPlayerScreen();
    };
  }

  card.querySelector('.equip-btn').onclick = () => {
    if (w.isEquipped) {
      CombatState.togglePCWeaponEquip(idx);
      uiRegistry.renderPlayerScreen();
      return;
    }
    
    // Warn if trying to equip off-hand weapon without TWF feats
    if (w.hand === 'off') {
      const hasTWF = pc.feats && (
        pc.feats.some(f => f.id === 'two_weapon_fighting') ||
        (() => {
          const armor = pc.getEquippedArmor ? pc.getEquippedArmor() : null;
          const speedCategory = armor ? armor.speedCategory : '';
          const isWearingMediumOrHeavy = speedCategory === 'medium' || speedCategory === 'heavy';
          if (!isWearingMediumOrHeavy) {
            const rangerClass = Array.isArray(pc.classes) && pc.classes.find(c => c.classType === 'ranger');
            const rangerLvl = rangerClass ? rangerClass.level : 0;
            return rangerLvl >= 2 && pc.rangerCombatStyle === 'twoweapon';
          }
          return false;
        })()
      );
      if (!hasTWF) {
        showCustomConfirm(
          "Kein Zwei-Waffen-Kampf",
          "Dein Charakter besitzt nicht das Talent 'Zwei-Waffen-Kampf'. Das Führen einer Waffe in der Nebenhand führt zu schweren Abzügen auf Angriffe (-6/-10 oder -4/-8). Trotzdem fortfahren?",
          () => {
            if (typeDef.isDouble) {
              showDoubleWeaponDialog(idx);
            } else {
              CombatState.togglePCWeaponEquip(idx);
              uiRegistry.renderPlayerScreen();
            }
          }
        );
        return;
      }
    }

    if (typeDef.isDouble) {
      showDoubleWeaponDialog(idx);
      return;
    }
    CombatState.togglePCWeaponEquip(idx);
    uiRegistry.renderPlayerScreen();
  };
  
  card.querySelector('.gear-btn').onclick = () => {
    const isVisible = drawer.style.display === 'flex';
    if (isVisible) {
      drawer.style.display = 'none';
      openDrawerIds.delete(wId);
    } else {
      drawer.style.display = 'flex';
      openDrawerIds.add(wId);
    }
  };
  card.querySelector('.delete-btn').onclick = () => { CombatState.deletePCWeapon(idx); uiRegistry.renderPlayerScreen(); };

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

  container.appendChild(card);
  container.appendChild(drawer);
  return container;
}

function _createStashArmorCard(a, idx, pc) {
  const rStyle = _getRarityStyle(a.enhancement);
  const container = document.createElement('div');
  container.className = 'stash-item-card-container';
  container.style = 'display:flex; flex-direction:column; gap:2px;';

  const card = document.createElement('div');
  card.className = `stash-item-card ${rStyle.glowClass}`;
  card.style.cssText = `
    display: flex;
    flex-direction: column;
    border: ${rStyle.border};
    border-radius: 4px;
    padding: 5px 6px;
    background: ${rStyle.background};
    box-shadow: ${rStyle.boxShadow};
    transition: all 0.15s ease-out;
    position: relative;
    margin-top: ${a.isEquipped ? '6px' : '0'};
  `;

  let typeOptionsHtml = '';
  const sortedArmors = Object.values(ARMOR_REGISTRY).sort((x, y) => x.nameDe.localeCompare(y.nameDe, 'de'));
  sortedArmors.forEach(def => {
    typeOptionsHtml += `<option value="${def.key}" ${a.type === def.key ? 'selected' : ''}>${def.nameDe}</option>`;
  });

  const activeBadge = a.isEquipped ? `
    <span style="position: absolute; top: -6px; left: 8px; font-size: 6px; color: #ffffff; background: #2a6a2a; border-radius: 2px; padding: 1px 4px; font-family: 'IM Fell English SC', serif; font-weight: bold; letter-spacing: 0.3px; pointer-events: none; z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.15);">Ausgerüstet</span>
  ` : '';

  card.innerHTML = `
    ${activeBadge}
    <!-- Row 1: Name and Delete -->
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px;">
      <input type="text" value="${a.name}" class="cinput a-name" placeholder="z.B. Kettenhemd" style="font-size: 9px; height: 18px; padding: 0 4px; flex: 1; font-weight: bold; border-color: rgba(200, 169, 110, 0.25);">
      <button class="xbtn delete-btn" style="padding: 0; border: none; background: transparent; font-size: 10px; cursor: pointer; height: 18px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--red); transition: color 0.15s;" title="Löschen">✕</button>
    </div>
    <!-- Row 2: Type, Enhancement, Equip, Options -->
    <div style="display: flex; align-items: center; gap: 4px;">
      <select class="cinput a-type" style="font-size: 7.5px; padding: 0 2px; height: 16px; flex: 1.2; min-width: 0;">
        ${typeOptionsHtml}
      </select>
      <div style="display: flex; align-items: center; gap: 1px; flex: 0.8; min-width: 0;">
        <span style="font-size: 7.5px; color: var(--inkm);">+</span>
        <input type="number" value="${a.enhancement}" class="cinput a-enhancement cinput-c" placeholder="0" style="font-size: 8px; height: 16px; width: 22px; padding: 0; text-align: center;">
      </div>
      <button class="xbtn equip-btn" style="padding: 0 6px; font-size: 7.5px; font-weight: bold; height: 16px; line-height: 14px; border-color: ${a.isEquipped ? '#b38600' : 'var(--pb)'}; color: ${a.isEquipped ? '#b38600' : 'var(--ink)'}; background: ${a.isEquipped ? 'rgba(200, 169, 110, 0.08)' : 'transparent'}; border-radius: 2px;" title="${a.isEquipped ? 'Ausrüstung ablegen' : 'Ausrüstung anlegen'}">
        ${a.isEquipped ? 'Ablegen' : 'Anlegen'}
      </button>
      <button class="xbtn gear-btn" style="padding: 0; border: none; background: transparent; font-size: 11px; cursor: pointer; height: 16px; width: 18px; display: flex; align-items: center; justify-content: center; color: var(--inkm);" title="Optionen">⚙️</button>
    </div>
  `;

  // Options Drawer
  const isDrawerOpen = openDrawerIds.has(a.id);
  const drawer = document.createElement('div');
  drawer.className = 'armor-details-drawer';
  drawer.style.cssText = `display: ${isDrawerOpen ? 'flex' : 'none'}; background: rgba(200,169,110,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); border-top: none; padding: 4px 6px; font-size: 8px; margin-top: -2px; margin-bottom: 2px; border-radius: 0 0 3px 3px; flex-direction: column; gap: 4px;`;
  drawer.style.display = isDrawerOpen ? 'flex' : 'none';

  drawer.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; width:100%;">
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">RK-Abw.:</span>
        <input type="text" class="cinput a-detail-bonusoverride" value="${a.armorBonusOverride || ''}" placeholder="Standard" style="width: 45px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">MaxDex-Abw.:</span>
        <input type="text" class="cinput a-detail-maxdexoverride" value="${a.maxDexOverride || ''}" placeholder="Standard" style="width: 45px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Malus-Abw.:</span>
        <input type="text" class="cinput a-detail-penaltyoverride" value="${a.checkPenaltyOverride || ''}" placeholder="Standard" style="width: 45px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
      </div>
      <div style="display:flex; align-items:center; gap:2px;">
        <span style="color:var(--inkl);">Zauberpatzer-Abw.:</span>
        <input type="text" class="cinput a-detail-asfoverride" value="${a.spellFailureOverride || ''}" placeholder="Standard" style="width: 45px; font-size: 8px; height: 14px; text-align: center; padding: 0;">
        <span style="color:var(--inkm);">%</span>
      </div>
    </div>
  `;

  // Bind Events
  const aNameInput = card.querySelector('.a-name');
  aNameInput.oninput = (e) => {
    const val = e.target.value;
    CombatState.updatePCArmorField(idx, 'name', val);
    const activeSlotTitle = document.querySelector(`.equipped-title-a-${idx}`);
    if (activeSlotTitle) {
      activeSlotTitle.textContent = val;
      activeSlotTitle.title = val;
    }
  };
  aNameInput.onchange = (e) => {
    CombatState.updatePCArmorField(idx, 'name', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  card.querySelector('.a-type').onchange = (e) => { CombatState.updatePCArmorField(idx, 'type', e.target.value); uiRegistry.renderPlayerScreen(); };
  card.querySelector('.a-enhancement').onchange = (e) => { CombatState.updatePCArmorField(idx, 'enhancement', parseInt(e.target.value) || 0); uiRegistry.renderPlayerScreen(); };
  
  card.querySelector('.equip-btn').onclick = (e) => {
    const wasEquipped = a.isEquipped;
    const equipping = !wasEquipped;
    CombatState.togglePCArmorEquip(idx);
    
    if (equipping && !wasEquipped && !pc.autoAC) {
      showCustomConfirm(
        "Auto-RK aktivieren?",
        "Möchtest du die automatische Rüstungsklasse-Berechnung (Auto-RK) für diesen Charakter aktivieren?",
        () => {
          CombatState.setPCAutoAC(true);
          uiRegistry.renderPlayerScreen();
        }
      );
    }
    uiRegistry.renderPlayerScreen();
  };

  card.querySelector('.gear-btn').onclick = () => {
    const isVisible = drawer.style.display === 'flex';
    if (isVisible) {
      drawer.style.display = 'none';
      openDrawerIds.delete(a.id);
    } else {
      drawer.style.display = 'flex';
      openDrawerIds.add(a.id);
    }
  };
  card.querySelector('.delete-btn').onclick = () => { CombatState.removePCArmor(idx); uiRegistry.renderPlayerScreen(); };

  drawer.querySelector('.a-detail-bonusoverride').onchange = (e) => { CombatState.updatePCArmorField(idx, 'armorBonusOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.a-detail-maxdexoverride').onchange = (e) => { CombatState.updatePCArmorField(idx, 'maxDexOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.a-detail-penaltyoverride').onchange = (e) => { CombatState.updatePCArmorField(idx, 'checkPenaltyOverride', e.target.value); uiRegistry.renderPlayerScreen(); };
  drawer.querySelector('.a-detail-asfoverride').onchange = (e) => { CombatState.updatePCArmorField(idx, 'spellFailureOverride', e.target.value); uiRegistry.renderPlayerScreen(); };

  container.appendChild(card);
  container.appendChild(drawer);
  return container;
}

function showDoubleWeaponDialog(idx) {
  const overlay = document.createElement('div');
  overlay.id = 'doubleWeaponOverlay';
  overlay.className = 'no-print';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2500;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 20px;
      width: 280px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-size: 13px; color: var(--red); font-weight: bold; margin-bottom: 4px;">
        Kampfstab ausrüsten
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 5px 0 10px;">
      
      <div style="font-family: 'Crimson Text', serif; font-size: 11px; color: var(--ink); line-height: 1.4; margin-bottom: 12px; font-weight: 500; text-align: left;">
        Wie soll dieser Kampfstab geführt werden?
        <ul style="margin: 6px 0; padding-left: 14px;">
          <li><strong>Zweihändig:</strong> Als Einzelwaffe geführt (1.5x Stärkebonus auf Schaden).</li>
          <li><strong>Doppelwaffe:</strong> Mit beiden Enden geführt (Hauptseite 1.0x Stärke, Nebenseite 0.5x Stärke als leichte Waffe).</li>
        </ul>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <button class="btn btn-p opt-twohanded" style="font-family: 'IM Fell English SC', serif; font-size: 8.5px; padding: 4px; cursor: pointer;">Zweihändig (Einzelwaffe)</button>
        <button class="btn btn-p opt-double" style="font-family: 'IM Fell English SC', serif; font-size: 8.5px; padding: 4px; cursor: pointer;">Doppelwaffe (Beide Enden)</button>
        <button class="btn opt-cancel" style="font-family: 'IM Fell English SC', serif; font-size: 8.5px; padding: 4px; cursor: pointer; border: 1px solid var(--pb); background: transparent; color: var(--inkl);">Abbrechen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect();
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector('.opt-twohanded').onclick = () => {
    dismiss();
    CombatState.updatePCWeapon(idx, 'isDoubleWielded', false);
    CombatState.togglePCWeaponEquip(idx);
    uiRegistry.renderPlayerScreen();
  };

  overlay.querySelector('.opt-double').onclick = () => {
    dismiss();
    CombatState.updatePCWeapon(idx, 'isDoubleWielded', true);
    CombatState.togglePCWeaponEquip(idx);
    uiRegistry.renderPlayerScreen();
  };

  overlay.querySelector('.opt-cancel').onclick = dismiss;
  overlay.onclick = (e) => { if (e.target === overlay) dismiss(); };
}
