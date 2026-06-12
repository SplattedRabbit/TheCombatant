/**
 * @module    PCDefenses
 * @summary   Rendert RK-Panel (AC/Touch/Flat), Rettungswürfe, Initiative und Bewegungsrate sowie den integrierten Buffs- & Auren-Manager.
 * @exports   renderPCDefenses(pc)
 * @reads     pc.ac, pc.acTouch, pc.acFlat, pc.za, pc.ref, pc.wil, pc.init, pc.speed, pc.str/dex/con/wis, pc.activeBuffs
 * @stateOps  togglePCDefensiveFighting, togglePCTotalDefense, updatePCField, updatePCBatch
 * @depends   CombatState, uiRegistry, PCUtils, dialogs, CombatSpells
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { getAblMod, formatMod } from './PCUtils.js';
import { showRollBreakdown, showInfoDialog } from '../dialogs.js';
import { CombatSpells } from '../../../spells.js';

// Local UI state for toggling between the defenses panel and buffs manager
let activeSubTab = 'defenses'; // 'defenses' or 'buffs'

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

export function renderPCDefenses(pc) {
  const defenses = document.getElementById('pcDefenses');
  if (!defenses) return;

  const dexMod = getAblMod(pc.dex);
  const conMod = getAblMod(pc.con);
  const wisMod = getAblMod(pc.wis);
  
  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some(f => f.id === 'improved_initiative');
  const totFort = pc.za.getValue();
  const totRef = pc.ref.getValue();
  const totWil = pc.wil.getValue();
  const totIni = dexMod + (parseInt(pc.iniMisc) || 0) + (hasImprovedInit ? 4 : 0);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;

  // Sub-Tab Navigation Bar
  const tabBarHtml = `
    <div class="panel-tab-bar">
      <button class="sub-tab-btn ${activeSubTab === 'defenses' ? 'active' : ''}" data-subtab="defenses">🛡️ Rettung &amp; Verteidigung</button>
      <button class="sub-tab-btn ${activeSubTab === 'buffs' ? 'active' : ''}" data-subtab="buffs">✨ Buffs &amp; Auren (${Array.isArray(pc.activeBuffs) ? pc.activeBuffs.length : 0})</button>
    </div>
  `;

  // Render Panel content depending on active sub-tab
  let bodyHtml = '';
  if (activeSubTab === 'defenses') {
    bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(200, 169, 110, 0.05); border:0.5px solid var(--pb); border-radius:2px; padding:3px 6px; margin-bottom:2px;">
          <label style="display:flex; align-items:center; gap:4px; cursor:pointer; color:var(--inkm); margin:0; font-weight:bold; font-size:8px; font-family:'IM Fell English SC', serif;">
            <input type="checkbox" class="pc-autoac-checkbox" ${pc.autoAC ? 'checked' : ''} style="margin: 0; width: 11px; height: 11px;">
            🛡️ Rüstungsklasse automatisch berechnen (Auto-RK)
          </label>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px;">
          <div>
            <label style="font-size:9px; font-weight:600; color:var(--inkl);">AC (RK)</label>
            <input type="number" value="${pc.ac}" class="cinput pc-ac-input" ${pc.autoAC ? 'readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold; cursor:pointer;"' : ''}>
          </div>
          <div>
            <label style="font-size:9px; font-weight:600; color:var(--inkl);">Touch</label>
            <input type="number" value="${pc.acTouch}" class="cinput pc-acTouch-input" ${pc.autoAC ? 'readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold; cursor:pointer;"' : ''}>
          </div>
          <div>
            <label style="font-size:9px; font-weight:600; color:var(--inkl);">Flat-Footed</label>
            <input type="number" value="${pc.acFlat}" class="cinput pc-acFlat-input" ${pc.autoAC ? 'readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold; cursor:pointer;"' : ''}>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px; margin-top:-2px; margin-bottom:2px;">
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);" title="Natürlicher Rüstungsbonus (z.B. Amulett)">Natürliche Rüst.</label>
            <input type="number" value="${pc.acNatural || 0}" class="cinput pc-acNatural-input" style="height:15px; font-size:8px; text-align:center;">
          </div>
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);" title="Ablenkungsbonus auf RK (z.B. Schutzring)">Ablenkung</label>
            <input type="number" value="${pc.acDeflection || 0}" class="cinput pc-acDeflection-input" style="height:15px; font-size:8px; text-align:center;">
          </div>
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);" title="Sonstige Modifikatoren auf RK">Sonstiges (RK)</label>
            <input type="number" value="${pc.acMisc || 0}" class="cinput pc-acMisc-input" style="height:15px; font-size:8px; text-align:center;">
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
          <div><label style="font-size:9px; font-weight:600; color:var(--inkl);">Zauberresistenz (SR)</label><input type="number" value="${pc.sr}" class="cinput pc-sr-input"></div>
          <div><label style="font-size:9px; font-weight:600; color:var(--inkl);">Geschwindigkeit (Speed)</label><input type="number" value="${pc.bw}" class="cinput pc-bw-input" title="Bewegungsrate (ft)" ${pc.getEquippedArmor() ? 'readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold;"' : ''}></div>
        </div>
        
        <hr style="border:none; border-top:.5px solid var(--pb); margin:2px 0;">
        
        <!-- Initiative Block -->
        <div style="display:grid; grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr 0.7fr; gap:3px; align-items:center; background:rgba(200, 169, 110, 0.1); border:0.5px solid var(--pb); border-radius:2px; padding:3px 4px;">
          <div style="display:flex; flex-direction:column; align-items:center;">
            <span style="font-size:7.5px; font-weight:600; color:var(--inkl); line-height:1;">Initiative-Mod</span>
            <span style="font-size:11px; font-weight:bold; color:var(--red); text-align:center; padding-top:1px;">${formatMod(totIni)}</span>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">DEX-Mod</label>
            <input type="text" value="${formatMod(dexMod)}" readonly class="cinput" style="width:28px; font-size:8px; height:13px; text-align:center; padding:0; background:rgba(0,0,0,0.05); font-weight:bold;">
          </div>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">Misc-Mod</label>
            <input type="number" value="${pc.iniMisc || 0}" class="cinput pc-iniMisc-input" style="width:28px; font-size:8.5px; height:13px; text-align:center; padding:0;">
          </div>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">Gewürfelt</label>
            <input type="number" value="${pc.init || 0}" class="cinput pc-init-input" style="width:28px; font-size:8.5px; height:13px; text-align:center; padding:0; font-weight:bold; color:var(--red);">
          </div>
          <div style="display:flex; flex-direction:column; align-items:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">Summe</label>
            <span class="pc-init-total" style="font-size:11px; font-weight:bold; color:var(--red); line-height:13px; min-width:28px; text-align:center; background:rgba(139,26,26,0.08); border:0.5px solid rgba(139,26,26,0.3); border-radius:2px; padding:0 2px;">${(pc.init || 0) > 0 ? (pc.init || 0) + totIni : '--'}</span>
          </div>
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <label style="font-size:7px; font-weight:600; color:var(--inkl); margin-bottom:1px; line-height:1;">Formel</label>
            <button class="xbtn roll-ini-btn" style="padding:0; width:16px; height:13px; font-size:8px; line-height:13px; display:flex; align-items:center; justify-content:center;" title="Initiativewurf (Formel)">🎲</button>
          </div>
        </div>
        
        <hr style="border:none; border-top:.5px solid var(--pb); margin:2px 0;">
        
        <div style="display:grid; grid-template-columns: 80px 30px 8px 30px 8px 30px 8px 1fr; gap:2px; font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--inkl); text-align:center; padding-bottom:2px;">
          <span style="text-align:left;">Rettungswurf</span>
          <span>Basis</span>
          <span></span>
          <span>Attribut</span>
          <span></span>
          <span>Sonst.</span>
          <span></span>
          <span>Gesamt</span>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:4px; padding-bottom: 2px;">
          <!-- Zähigkeit (Fort) Equation Row -->
          <div style="display:grid; grid-template-columns: 80px 30px 8px 30px 8px 30px 8px 1fr; gap:2px; align-items:center;">
            <span style="font-size:8.5px; font-weight:600; text-align:left;" title="Zähigkeit (Fortitude)">⚔️ Zäh (Fort)</span>
            <input type="number" value="${pc.baseZa.base}" class="cinput pc-baseZa-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; ${hasClasses ? 'background:rgba(0,0,0,0.05); color:var(--inkl); border-color:var(--pb); cursor:not-allowed;' : ''}" ${hasClasses ? 'readonly tabindex="-1"' : ''}>
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="text" value="${formatMod(conMod)}" readonly tabindex="-1" class="cinput cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; font-weight:bold; background:rgba(0,0,0,0.05); color:var(--red); border-color:var(--pb);" title="KON-Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="number" value="${pc.zaMisc || 0}" class="cinput pc-zaMisc-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px;" title="Sonstiger Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">=</span>
            <button class="btn roll-save-btn" data-save="za" style="text-align:center; display:flex; justify-content:center; align-items:center; gap:2px; font-weight:bold; height:16px; padding:0 3px; font-size:8.5px; border-radius:2px; line-height:1;">
              <strong>${formatMod(totFort)} 🎲</strong>
            </button>
          </div>
          
          <!-- Reflex (Ref) Equation Row -->
          <div style="display:grid; grid-template-columns: 80px 30px 8px 30px 8px 30px 8px 1fr; gap:2px; align-items:center;">
            <span style="font-size:8.5px; font-weight:600; text-align:left;" title="Reflex (Reflex)">🎯 Ref (Ges)</span>
            <input type="number" value="${pc.baseRef.base}" class="cinput pc-baseRef-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; ${hasClasses ? 'background:rgba(0,0,0,0.05); color:var(--inkl); border-color:var(--pb); cursor:not-allowed;' : ''}" ${hasClasses ? 'readonly tabindex="-1"' : ''}>
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="text" value="${formatMod(dexMod)}" readonly tabindex="-1" class="cinput cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; font-weight:bold; background:rgba(0,0,0,0.05); color:var(--red); border-color:var(--pb);" title="GES-Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="number" value="${pc.refMisc || 0}" class="cinput pc-refMisc-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px;" title="Sonstiger Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">=</span>
            <button class="btn roll-save-btn" data-save="ref" style="text-align:center; display:flex; justify-content:center; align-items:center; gap:2px; font-weight:bold; height:16px; padding:0 3px; font-size:8.5px; border-radius:2px; line-height:1;">
              <strong>${formatMod(totRef)} 🎲</strong>
            </button>
          </div>
          
          <!-- Willen (Will) Equation Row -->
          <div style="display:grid; grid-template-columns: 80px 30px 8px 30px 8px 30px 8px 1fr; gap:2px; align-items:center;">
            <span style="font-size:8.5px; font-weight:600; text-align:left;" title="Willenskraft (Will)">🔮 Will (Wei)</span>
            <input type="number" value="${pc.baseWil.base}" class="cinput pc-baseWil-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; ${hasClasses ? 'background:rgba(0,0,0,0.05); color:var(--inkl); border-color:var(--pb); cursor:not-allowed;' : ''}" ${hasClasses ? 'readonly tabindex="-1"' : ''}>
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="text" value="${formatMod(wisMod)}" readonly tabindex="-1" class="cinput cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; font-weight:bold; background:rgba(0,0,0,0.05); color:var(--red); border-color:var(--pb);" title="WEI-Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">+</span>
            <input type="number" value="${pc.wilMisc || 0}" class="cinput pc-wilMisc-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px;" title="Sonstiger Modifikator">
            <span style="font-size:8px; font-weight:bold; color:var(--pb); text-align:center;">=</span>
            <button class="btn roll-save-btn" data-save="wil" style="text-align:center; display:flex; justify-content:center; align-items:center; gap:2px; font-weight:bold; height:16px; padding:0 3px; font-size:8.5px; border-radius:2px; line-height:1;">
              <strong>${formatMod(totWil)} 🎲</strong>
            </button>
          </div>
        </div>
        
        <hr style="border:none; border-top:.5px solid var(--pb); margin:2px 0;">
        
        <!-- Integrated Physical Resistances & Reach -->
        <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--red); padding-bottom:1px; border-bottom:0.5px solid rgba(200,169,110,0.2); letter-spacing:0.5px; font-weight:bold;">
          🛡️ Physische Resistenzen &amp; Reichweite
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-top:1px;">
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);">Schadensreduktion (DR)</label>
            <input type="text" value="${pc.dr || ''}" class="cinput pc-dr-input" placeholder="z. B. 5/Silber" style="height:14px; font-size:8px;">
          </div>
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);">Reichweite (Reach)</label>
            <input type="text" value="${pc.reach || ''}" class="cinput pc-reach-input" placeholder="z. B. 5 ft" style="height:14px; font-size:8px;">
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-top:2px;">
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);">Immunitäten</label>
            <input type="text" value="${pc.immunities || ''}" class="cinput pc-immunities-input" placeholder="Gift, Schlaf..." style="height:14px; font-size:8px;">
          </div>
          <div>
            <label style="font-size:8px; font-weight:600; color:var(--inkl);">Energie-Resistenzen</label>
            <input type="text" value="${pc.resistances || ''}" class="cinput pc-resistances-input" placeholder="Feuer 5..." style="height:14px; font-size:8px;">
          </div>
        </div>
      </div>
    `;
  } else {
    // Rendere Buff-Management Sektion
    let activeBuffsHtml = '';
    if (!Array.isArray(pc.activeBuffs) || pc.activeBuffs.length === 0) {
      activeBuffsHtml = `
        <div style="font-style: italic; color: var(--inkl); font-size: 8.5px; text-align: center; padding: 10px 0; background:rgba(0,0,0,0.02); border:0.5px dashed var(--pb); border-radius:2px;">
          Keine aktiven Buffs oder Auren.
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

        const shortEffectsSummary = effectsList.map(eff => {
          const sign = eff.value >= 0 ? '+' : '';
          const targetShort = {
            atk: 'ATK',
            dmg: 'DMG',
            ac: 'RK',
            acArmor: 'RK',
            acShield: 'RK',
            acNatural: 'RK',
            acDeflection: 'RK',
            acDodge: 'RK',
            str: 'STR',
            dex: 'DEX',
            con: 'CON',
            int: 'INT',
            wis: 'WIS',
            cha: 'CHA',
            za: 'Fort',
            ref: 'Ref',
            wil: 'Will'
          }[eff.target] || eff.target;
          return `${sign}${eff.value} ${targetShort}`;
        }).join(', ');

        return `
          <div class="active-buff-pill" style="
            display:inline-flex;
            align-items:center;
            background:rgba(200, 169, 110, 0.05);
            border:0.5px solid var(--pb);
            border-radius:12px;
            padding:2px 6px;
            gap:4px;
            box-sizing:border-box;
            margin-bottom:2px;
          ">
            <span class="info-buff-trigger" data-index="${idx}" style="
              font-size:8px;
              font-family:'Crimson Text', serif;
              font-weight:bold;
              color:var(--red);
              cursor:pointer;
              display:inline-flex;
              align-items:center;
              gap:2px;
            " title="D&D 3.5e RAW Regelerklärung anzeigen">
              ✨ ${displayName}
              <span style="font-size:7px; color:var(--inkl); opacity:0.85; font-weight:normal;">(${shortEffectsSummary})</span>
              <span style="font-size:7.5px; opacity:0.75; margin-left:1px; color:var(--red);">📖</span>
            </span>
            <button class="delete-buff-btn" data-index="${idx}" style="
              background:transparent;
              border:none;
              color:var(--inkl);
              font-size:8px;
              cursor:pointer;
              padding:0 2px;
              line-height:1;
              display:inline-flex;
              align-items:center;
              transition:color 0.15s ease;
            " title="Buff entfernen" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--inkl)'">✕</button>
          </div>
        `;
      }).join('');
    }

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

    const quickToggleHtml = quickSpells.map(qs => {
      const isActive = Array.isArray(pc.activeBuffs) && pc.activeBuffs.some(b => b.spellKey === qs.key);
      const btnStyle = isActive
        ? `background: #8b1a1a; color: #f4e8c1; border-color: #8b1a1a; font-weight: bold;`
        : `background: rgba(200, 169, 110, 0.08); color: var(--ink); border-color: var(--pb);`;
      const checkmark = isActive ? '✓ ' : '';
      return `
        <button class="quick-buff-btn" data-key="${qs.key}" data-name="${qs.name}" style="
          font-family: 'IM Fell English SC', serif;
          font-size: 8px;
          padding: 3px;
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

    bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <!-- List of active buffs -->
        <div style="display:flex; flex-direction:column; gap:3px;">
          <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--red); font-weight:bold; letter-spacing:0.5px; padding-bottom:1px; border-bottom:0.5px solid rgba(200,169,110,0.2);">
            Aktive Buffs &amp; Auren
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px; max-height:120px; overflow-y:auto; padding-right:2px; box-sizing:border-box;">
            ${activeBuffsHtml}
          </div>
        </div>

        <!-- Quick Toggles -->
        <div style="display:flex; flex-direction:column; gap:3px;">
          <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--red); font-weight:bold; letter-spacing:0.5px; padding-bottom:1px; border-bottom:0.5px solid rgba(200,169,110,0.2);">
            Schnellauswahl (Kern-Zauber)
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:3px;">
            ${quickToggleHtml}
          </div>
        </div>

        <!-- Custom Buff Builder -->
        <div style="display:flex; flex-direction:column; gap:4px; border-top:0.5px dashed rgba(200,169,110,0.3); padding-top:6px;">
          <div style="font-family:'IM Fell English SC', serif; font-size:7.5px; color:var(--red); font-weight:bold; letter-spacing:0.5px;">
            Eigenen Buff / Aura erstellen
          </div>
          
          <div style="display:grid; grid-template-columns: 1.2fr 1.2fr 0.6fr; gap:3px; align-items:end;">
            <div style="display:flex; flex-direction:column; gap:1px; text-align:left;">
              <label style="font-size:7.5px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif; line-height:1;">Name</label>
              <input type="text" id="custom-buff-name" placeholder="z. B. Lied" class="cinput" style="height:15px; font-size:8px; padding:0 3px; box-sizing:border-box;">
            </div>
            <div style="display:flex; flex-direction:column; gap:1px; text-align:left;">
              <label style="font-size:7.5px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif; line-height:1;">Zielwert</label>
              <select id="custom-buff-target" class="cinput" style="height:15px; font-size:8px; padding:0; box-sizing:border-box;">
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
            <div style="display:flex; flex-direction:column; gap:1px; text-align:left;">
              <label style="font-size:7.5px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif; line-height:1;">Wert</label>
              <input type="number" id="custom-buff-value" value="1" class="cinput" style="height:15px; font-size:8px; text-align:center; padding:0; box-sizing:border-box;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 2fr 1fr; gap:3px; align-items:end; margin-top:2px;">
            <div style="display:flex; flex-direction:column; gap:1px; text-align:left;">
              <label style="font-size:7.5px; font-weight:bold; color:var(--inkl); font-family:'Crimson Text',serif; line-height:1;">Bonustyp</label>
              <select id="custom-buff-type" class="cinput" style="height:15px; font-size:8px; padding:0; box-sizing:border-box;">
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
              font-size: 8px;
              padding: 2px 4px;
              height: 15px;
              cursor: pointer;
              box-sizing: border-box;
              border-radius: 2px;
              font-weight: bold;
              line-height: 11px;
            ">Hinzufügen</button>
          </div>
        </div>
      </div>
    `;
  }

  // Inject content to defenses container
  defenses.innerHTML = `
    ${tabBarHtml}
    <div class="pbody" style="display:flex; flex-direction:column; gap:6px;">
      ${bodyHtml}
    </div>
  `;

  // --- BIND EVENTS ---

  // Sub-Tab Toggle Buttons
  defenses.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeSubTab = btn.dataset.subtab;
      renderPCDefenses(pc);
    };
  });

  if (activeSubTab === 'defenses') {
    // Bind Auto-AC
    defenses.querySelector('.pc-autoac-checkbox').onchange = (e) => {
      CombatState.setPCAutoAC(e.target.checked);
      uiRegistry.renderPlayerScreen();
    };

    if (pc.autoAC) {
      const showACSourcesPopup = (title, statObj) => {
        const grouped = {};
        const appliedModifiers = [];
        
        statObj.modifiers.forEach(m => {
          const val = parseInt(m.value) || 0;
          if (val === 0) return;
          if (m.type === 'dodge' || m.type === 'untyped') {
            appliedModifiers.push({ label: m.source || 'Modifikator', value: val });
          } else {
            if (!grouped[m.type] || val > grouped[m.type].value) {
              grouped[m.type] = { label: m.source || 'Modifikator', value: val };
            }
          }
        });
        
        Object.keys(grouped).forEach(type => {
          appliedModifiers.push(grouped[type]);
        });

        const rowsHtml = [
          `<div style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:0.5px solid rgba(200,169,110,0.15);">
            <span style="font-family:'Crimson Text',serif; font-size:11px; color:var(--inkm);">Basiswert:</span>
            <span style="font-family:'Crimson Text',serif; font-size:11px; font-weight:bold; color:var(--ink);">10</span>
          </div>`
        ];

        appliedModifiers.forEach(item => {
          const sign = item.value >= 0 ? '+' : '';
          rowsHtml.push(`
            <div style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:0.5px solid rgba(200,169,110,0.15);">
              <span style="font-family:'Crimson Text',serif; font-size:11px; color:var(--inkm);">${item.label}:</span>
              <span style="font-family:'Crimson Text',serif; font-size:11px; font-weight:bold; color:var(--ink);">${sign}${item.value}</span>
            </div>
          `);
        });

        const totalVal = statObj.getValue();
        const bodyHtml = `
          <div style="display:flex; flex-direction:column; gap:2px;">
            ${rowsHtml.join('')}
            <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:6px; font-family:'IM Fell English SC',serif; font-size:12px; font-weight:bold; color:var(--red);">
              <span>Gesamtwert:</span>
              <span style="font-size:14px;">${totalVal}</span>
            </div>
          </div>
        `;

        showInfoDialog({
          id: 'rollBreakdown',
          title: title,
          bodyHtml,
          buttonText: 'Schließen',
          width: 255
        });
      };

      defenses.querySelector('.pc-ac-input').onclick = () => showACSourcesPopup('🛡️ Rüstungsklasse (AC)', pc.ac);
      defenses.querySelector('.pc-acTouch-input').onclick = () => showACSourcesPopup('🛡️ Berührungs-RK (Touch AC)', pc.acTouch);
      defenses.querySelector('.pc-acFlat-input').onclick = () => showACSourcesPopup('🛡️ Auf dem falschen Fuß (Flat-Footed AC)', pc.acFlat);
    } else {
      defenses.querySelector('.pc-ac-input').onchange = (e) => CombatState.updatePCNumber('ac', e.target.value);
      defenses.querySelector('.pc-acTouch-input').onchange = (e) => CombatState.updatePCNumber('acTouch', e.target.value);
      defenses.querySelector('.pc-acFlat-input').onchange = (e) => CombatState.updatePCNumber('acFlat', e.target.value);
    }

    defenses.querySelector('.pc-acNatural-input').onchange = (e) => {
      CombatState.updatePCField('acNatural', parseInt(e.target.value) || 0);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-acDeflection-input').onchange = (e) => {
      CombatState.updatePCField('acDeflection', parseInt(e.target.value) || 0);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-acMisc-input').onchange = (e) => {
      CombatState.updatePCField('acMisc', parseInt(e.target.value) || 0);
      uiRegistry.renderPlayerScreen();
    };

    defenses.querySelector('.pc-sr-input').onchange = (e) => CombatState.updatePCNumber('sr', e.target.value);
    defenses.querySelector('.pc-bw-input').onchange = (e) => {
      CombatState.updatePCNumber('bw', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    
    defenses.querySelector('.pc-dr-input').onchange = (e) => CombatState.updatePCField('dr', e.target.value);
    defenses.querySelector('.pc-reach-input').onchange = (e) => CombatState.updatePCField('reach', e.target.value);
    defenses.querySelector('.pc-immunities-input').onchange = (e) => CombatState.updatePCField('immunities', e.target.value);
    defenses.querySelector('.pc-resistances-input').onchange = (e) => CombatState.updatePCField('resistances', e.target.value);

    defenses.querySelector('.pc-baseZa-inp').onchange = (e) => { 
      CombatState.clearPCClasses(); 
      CombatState.updatePCNumber('baseZa', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };
    defenses.querySelector('.pc-baseRef-inp').onchange = (e) => { 
      CombatState.clearPCClasses(); 
      CombatState.updatePCNumber('baseRef', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };
    defenses.querySelector('.pc-baseWil-inp').onchange = (e) => { 
      CombatState.clearPCClasses(); 
      CombatState.updatePCNumber('baseWil', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };

    defenses.querySelector('.pc-zaMisc-inp').onchange = (e) => {
      CombatState.updatePCNumber('zaMisc', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-refMisc-inp').onchange = (e) => {
      CombatState.updatePCNumber('refMisc', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-wilMisc-inp').onchange = (e) => {
      CombatState.updatePCNumber('wilMisc', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    
    defenses.querySelector('.pc-iniMisc-input').onchange = (e) => { 
      CombatState.updatePCNumber('iniMisc', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };
    defenses.querySelector('.pc-init-input').oninput = (e) => {
      const roll = parseInt(e.target.value) || 0;
      const totalEl = defenses.querySelector('.pc-init-total');
      if (totalEl) totalEl.textContent = roll > 0 ? roll + totIni : '--';
    };
    defenses.querySelector('.pc-init-input').onchange = (e) => { 
      CombatState.updatePCNumber('init', e.target.value); 
      uiRegistry.renderPlayerScreen(); 
    };

    // Roll Saves Breakdown Buttons
    defenses.querySelectorAll('.roll-save-btn').forEach(btn => {
      btn.onclick = (e) => {
        const type = btn.dataset.save;
        const baseStat = type === 'za' ? pc.baseZa : type === 'ref' ? pc.baseRef : pc.baseWil;
        const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;
        const label = type === 'za' ? 'Zähigkeit' : type === 'ref' ? 'Reflex' : 'Willen';
        
        const items = [
          { label: 'Klassen-Basis', value: baseStat.getValue() }
        ];
        
        if (Array.isArray(saveStat.modifiers)) {
          saveStat.modifiers.forEach(m => {
            items.push({ label: m.source || 'Modifikator', value: m.value });
          });
        }
        
        showRollBreakdown(`Rettungswurf: ${label}`, '1W20', items, e);
      };
    });

    // Roll Initiative Breakdown
    const iniBtn = defenses.querySelector('.roll-ini-btn');
    if (iniBtn) {
      iniBtn.onclick = (e) => {
        const items = [
          { label: 'GES-Mod (DEX)', value: dexMod },
          { label: 'Misc-Mod (Sonst)', value: parseInt(pc.iniMisc) || 0 }
        ];
        if (hasImprovedInit) {
          items.push({ label: 'Talent: Verbesserte Initiative', value: 4 });
        }
        showRollBreakdown('Initiative-Wurf', '1W20', items, e);
      };
    }
  } else {
    // --- BUFFS EVENT BINDINGS ---
    
    // Bind Quick Toggle Buttons
    defenses.querySelectorAll('.quick-buff-btn').forEach(btn => {
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

        uiRegistry.renderPlayerScreen();
      };
    });

    // Bind Active Buff Info Modals
    defenses.querySelectorAll('.info-buff-trigger').forEach(trigger => {
      trigger.onclick = () => {
        const idx = parseInt(trigger.dataset.index);
        const buff = pc.activeBuffs?.[idx];
        if (!buff) return;

        let displayName = buff.name;
        let effectsList = [];
        let isCustom = true;
        let spell = null;

        if (buff.spellKey) {
          spell = CombatSpells.REGISTRY?.[buff.spellKey];
          if (spell) {
            displayName = spell.nameDe || spell.nameEn || displayName || buff.spellKey;
            effectsList = spell.effects || [];
            isCustom = false;
          }
        } else {
          effectsList = buff.effects || [];
        }

        let title = '';
        let bodyHtml = '';

        if (!isCustom && spell) {
          title = `✨ Buff: ${spell.nameDe || spell.nameEn}`;
          bodyHtml = `
            <div style="font-family:'Crimson Text', serif; font-size:11.5px; color:var(--ink); display:flex; flex-direction:column; gap:6.5px;">
              <div style="font-style:italic; font-size:10px; color:var(--inkl); border-bottom:0.5px solid var(--pb); padding-bottom:3.5px; margin-bottom:3.5px;">
                ${spell.school || 'Schule unbekannt'} • Grad ${spell.level || 0}
              </div>
              <div style="display:grid; grid-template-columns: 85px 1fr; gap:2.5px; font-size:10.5px; line-height:1.2;">
                <span style="font-weight:bold; color:var(--inkl);">Zeitdauer:</span> <span>${spell.duration || '—'}</span>
                <span style="font-weight:bold; color:var(--inkl);">Reichweite:</span> <span>${spell.range || '—'}</span>
                <span style="font-weight:bold; color:var(--inkl);">Rettungswurf:</span> <span>${spell.savingThrow || '—'}</span>
                <span style="font-weight:bold; color:var(--inkl);">Zauberresistenz:</span> <span>${spell.spellResistance || '—'}</span>
              </div>
              <hr style="border:none; border-top:0.5px dashed var(--pb); margin:4px 0;">
              <div style="font-size:11px; line-height:1.35; background:rgba(200, 169, 110, 0.05); border-left:2px solid var(--pb); padding-left:6px; margin:2px 0;">
                <strong>Regelbeschreibung:</strong><br>
                ${spell.description || 'Keine Beschreibung vorhanden.'}
              </div>
              <hr style="border:none; border-top:0.5px dashed var(--pb); margin:4px 0;">
              <div>
                <strong style="color:var(--red); font-size:10.5px;">Aktive Modifikatoren (RAW):</strong>
                <div style="display:flex; flex-direction:column; gap:2px; margin-top:2px;">
                  ${effectsList.map(eff => {
                    const sign = eff.value >= 0 ? '+' : '';
                    return `<div style="font-size:10.5px;">• <strong>${translateTarget(eff.target)}:</strong> ${sign}${eff.value} (${translateType(eff.type)})</div>`;
                  }).join('')}
                </div>
              </div>
            </div>
          `;
        } else {
          title = `✨ Eigener Buff: ${displayName}`;
          bodyHtml = `
            <div style="font-family:'Crimson Text', serif; font-size:11.5px; color:var(--ink); display:flex; flex-direction:column; gap:6.5px;">
              <div style="font-style:italic; font-size:10px; color:var(--inkl); border-bottom:0.5px solid var(--pb); padding-bottom:3.5px; margin-bottom:3.5px;">
                Benutzerdefinierter Effekt
              </div>
              <div style="font-size:11px; line-height:1.35; background:rgba(200, 169, 110, 0.05); border-left:2px solid var(--pb); padding-left:6px; margin:2px 0;">
                <strong>Beschreibung:</strong><br>
                Ein benutzerdefinierter Buff, der direkt über das Formular im Bogen hinzugefügt wurde.
              </div>
              <hr style="border:none; border-top:0.5px dashed var(--pb); margin:4px 0;">
              <div>
                <strong style="color:var(--red); font-size:10.5px;">Aktive Modifikatoren:</strong>
                <div style="display:flex; flex-direction:column; gap:2px; margin-top:2px;">
                  ${effectsList.map(eff => {
                    const sign = eff.value >= 0 ? '+' : '';
                    return `<div style="font-size:10.5px;">• <strong>${translateTarget(eff.target)}:</strong> ${sign}${eff.value} (${translateType(eff.type)})</div>`;
                  }).join('')}
                </div>
              </div>
            </div>
          `;
        }

        showInfoDialog({
          id: 'buffDetails',
          title: title,
          bodyHtml: bodyHtml,
          buttonText: 'Schließen',
          width: 275
        });
      };
    });

    // Bind Delete Active Buff Buttons
    defenses.querySelectorAll('.delete-buff-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index);
        
        CombatState.updatePCBatch(pc => {
          if (Array.isArray(pc.activeBuffs) && pc.activeBuffs[idx]) {
            pc.activeBuffs.splice(idx, 1);
          }
        });

        uiRegistry.renderPlayerScreen();
      };
    });

    // Bind Add Custom Buff
    const addBtn = defenses.querySelector('#add-custom-buff-btn');
    if (addBtn) {
      addBtn.onclick = () => {
        const nameInput = defenses.querySelector('#custom-buff-name');
        const targetSelect = defenses.querySelector('#custom-buff-target');
        const typeSelect = defenses.querySelector('#custom-buff-type');
        const valueInput = defenses.querySelector('#custom-buff-value');

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
      };
    }
  }
}
