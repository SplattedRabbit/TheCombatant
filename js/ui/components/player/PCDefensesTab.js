/**
 * @module    PCDefensesTab
 * @summary   Renders Rettungswürfe, AC, Initiative and physical resistances UI elements and manages their event bindings.
 * @exports   renderPCDefensesTab(pc), bindPCDefensesTabEvents(pc, defenses)
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { getAblMod, formatMod } from './PCUtils.js';
import { showRollBreakdown } from '../dialogs.js';

export function renderPCDefensesTab(pc) {
  const dexMod = getAblMod(pc.dex);
  const conMod = getAblMod(pc.con);
  const wisMod = getAblMod(pc.wis);
  
  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some(f => f.id === 'improved_initiative');
  const totFort = pc.za.getValue();
  const totRef = pc.ref.getValue();
  const totWil = pc.wil.getValue();
  const totIni = dexMod + (parseInt(pc.iniMisc) || 0) + (hasImprovedInit ? 4 : 0);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;

  // Helpers for breakdown/tooltips
  const getSaveMiscBreakdown = (type, attrMod) => {
    const baseVal = type === 'za' ? pc.baseZa.base : type === 'ref' ? pc.baseRef.base : pc.baseWil.base;
    const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;
    const miscVal = type === 'za' ? pc.zaMisc : type === 'ref' ? pc.refMisc : type === 'wilMisc';
    
    const total = saveStat.getValue();
    const otherMods = total - baseVal - attrMod;
    
    const attrName = type === 'za' ? 'Konstitutions-Modifikator' : type === 'ref' ? 'Geschicklichkeits-Modifikator' : 'Weisheits-Modifikator';
    const miscName = 'Sonstiges (Ausrüstung/Spezial)';
    
    const extras = saveStat.modifiers.filter(m => m.source !== attrName && m.source !== miscName && m.value !== 0);
    
    let tooltip = `Sonstiger Modifikator (Eigenwert: ${miscVal})`;
    if (extras.length > 0) {
      tooltip += `\nAktive Effekte:\n` + extras.map(m => `• ${m.source}: ${formatMod(m.value)}`).join('\n');
    }
    
    return {
      displayValue: otherMods,
      tooltip,
      hasExtras: extras.length > 0
    };
  };

  const getAcTooltip = (stat, name) => {
    const items = ['Basiswert: 10'];
    if (Array.isArray(stat.modifiers)) {
      stat.modifiers.forEach(m => {
        if (m.value !== 0) items.push(`• ${m.source || 'Modifikator'}: ${formatMod(m.value)}`);
      });
    }
    return `${name} Aufschlüsselung:\n` + items.join('\n');
  };

  const zaMiscData = getSaveMiscBreakdown('za', conMod);
  const refMiscData = getSaveMiscBreakdown('ref', dexMod);
  const wilMiscData = getSaveMiscBreakdown('wil', wisMod);

  const acTooltip = getAcTooltip(pc.ac, 'Rüstungsklasse (AC)');
  const acTouchTooltip = getAcTooltip(pc.acTouch, 'Touch AC');
  const acFlatTooltip = getAcTooltip(pc.acFlat, 'Flat-Footed AC');

  return `
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
          <input type="number" value="${pc.ac}" class="cinput pc-ac-input" ${pc.autoAC ? `readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold; cursor:pointer;" title="${acTooltip}"` : ''}>
        </div>
        <div>
          <label style="font-size:9px; font-weight:600; color:var(--inkl);">Touch</label>
          <input type="number" value="${pc.acTouch}" class="cinput pc-acTouch-input" ${pc.autoAC ? `readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold; cursor:pointer;" title="${acTouchTooltip}"` : ''}>
        </div>
        <div>
          <label style="font-size:9px; font-weight:600; color:var(--inkl);">Flat-Footed</label>
          <input type="number" value="${pc.acFlat}" class="cinput pc-acFlat-input" ${pc.autoAC ? `readonly style="background:rgba(0,0,0,0.05); color:var(--red); font-weight:bold; cursor:pointer;" title="${acFlatTooltip}"` : ''}>
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
          <input type="number" value="${zaMiscData.displayValue}" class="cinput pc-zaMisc-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; ${zaMiscData.hasExtras ? 'border-color: var(--red) !important; background: rgba(139, 26, 26, 0.05) !important; color: var(--red); font-weight: bold;' : ''}" title="${zaMiscData.tooltip}">
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
          <input type="number" value="${refMiscData.displayValue}" class="cinput pc-refMisc-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; ${refMiscData.hasExtras ? 'border-color: var(--red) !important; background: rgba(139, 26, 26, 0.05) !important; color: var(--red); font-weight: bold;' : ''}" title="${refMiscData.tooltip}">
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
          <input type="number" value="${wilMiscData.displayValue}" class="cinput pc-wilMisc-inp cinput-c" style="font-size:8px; width:30px; text-align:center; padding:0; height:14px; ${wilMiscData.hasExtras ? 'border-color: var(--red) !important; background: rgba(139, 26, 26, 0.05) !important; color: var(--red); font-weight: bold;' : ''}" title="${wilMiscData.tooltip}">
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
}

export function bindPCDefensesTabEvents(pc, defenses) {
  const dexMod = getAblMod(pc.dex);
  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some(f => f.id === 'improved_initiative');

  // Bind Auto-AC
  defenses.querySelector('.pc-autoac-checkbox').onchange = (e) => {
    CombatState.setPCAutoAC(e.target.checked);
    uiRegistry.renderPlayerScreen();
  };

  if (pc.autoAC) {
    defenses.querySelector('.pc-ac-input').onclick = (e) => {
      const items = [{ label: 'Basiswert', value: 10 }];
      pc.ac.modifiers.forEach(m => {
        if (m.value !== 0) items.push({ label: m.source || 'Modifikator', value: m.value });
      });
      showRollBreakdown('Rüstungsklasse (AC) - Aufschlüsselung', 'Basis 10', items, e);
    };

    defenses.querySelector('.pc-acTouch-input').onclick = (e) => {
      const items = [{ label: 'Basiswert', value: 10 }];
      pc.acTouch.modifiers.forEach(m => {
        if (m.value !== 0) items.push({ label: m.source || 'Modifikator', value: m.value });
      });
      showRollBreakdown('Touch AC - Aufschlüsselung', 'Basis 10', items, e);
    };

    defenses.querySelector('.pc-acFlat-input').onclick = (e) => {
      const items = [{ label: 'Basiswert', value: 10 }];
      pc.acFlat.modifiers.forEach(m => {
        if (m.value !== 0) items.push({ label: m.source || 'Modifikator', value: m.value });
      });
      showRollBreakdown('Flat-Footed AC - Aufschlüsselung', 'Basis 10', items, e);
    };
  } else {
    defenses.querySelector('.pc-ac-input').onchange = (e) => {
      CombatState.updatePCNumber('ac', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-acTouch-input').onchange = (e) => {
      CombatState.updatePCNumber('acTouch', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
    defenses.querySelector('.pc-acFlat-input').onchange = (e) => {
      CombatState.updatePCNumber('acFlat', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
  }

  // Inputs change bindings
  defenses.querySelector('.pc-acNatural-input').onchange = (e) => {
    CombatState.updatePCNumber('acNatural', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  defenses.querySelector('.pc-acDeflection-input').onchange = (e) => {
    CombatState.updatePCNumber('acDeflection', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  defenses.querySelector('.pc-acMisc-input').onchange = (e) => {
    CombatState.updatePCNumber('acMisc', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  defenses.querySelector('.pc-sr-input').onchange = (e) => {
    CombatState.updatePCNumber('sr', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  
  const speedInp = defenses.querySelector('.pc-bw-input');
  if (speedInp && !speedInp.readOnly) {
    speedInp.onchange = (e) => {
      CombatState.updatePCNumber('bw', e.target.value);
      uiRegistry.renderPlayerScreen();
    };
  }

  // Saves input change bindings
  const calculateNewMisc = (type, attrMod, typedVal) => {
    const baseVal = type === 'za' ? pc.baseZa.base : type === 'ref' ? pc.baseRef.base : pc.baseWil.base;
    const saveStat = type === 'za' ? pc.za : type === 'ref' ? pc.ref : pc.wil;
    const miscVal = type === 'za' ? pc.zaMisc : type === 'ref' ? pc.refMisc : type === 'wilMisc';
    
    const total = saveStat.getValue();
    const otherMods = total - baseVal - attrMod;
    const extraMods = otherMods - miscVal;
    
    return typedVal - extraMods;
  };

  defenses.querySelector('.pc-baseZa-inp').onchange = (e) => {
    CombatState.updatePCNumber('baseZa', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  defenses.querySelector('.pc-zaMisc-inp').onchange = (e) => {
    const typed = parseInt(e.target.value) || 0;
    const conMod = getAblMod(pc.con);
    const newMisc = calculateNewMisc('za', conMod, typed);
    CombatState.updatePCNumber('zaMisc', newMisc);
    uiRegistry.renderPlayerScreen();
  };
  defenses.querySelector('.pc-baseRef-inp').onchange = (e) => {
    CombatState.updatePCNumber('baseRef', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  defenses.querySelector('.pc-refMisc-inp').onchange = (e) => {
    const typed = parseInt(e.target.value) || 0;
    const dexMod = getAblMod(pc.dex);
    const newMisc = calculateNewMisc('ref', dexMod, typed);
    CombatState.updatePCNumber('refMisc', newMisc);
    uiRegistry.renderPlayerScreen();
  };
  defenses.querySelector('.pc-baseWil-inp').onchange = (e) => {
    CombatState.updatePCNumber('baseWil', e.target.value);
    uiRegistry.renderPlayerScreen();
  };
  defenses.querySelector('.pc-wilMisc-inp').onchange = (e) => {
    const typed = parseInt(e.target.value) || 0;
    const wisMod = getAblMod(pc.wis);
    const newMisc = calculateNewMisc('wil', wisMod, typed);
    CombatState.updatePCNumber('wilMisc', newMisc);
    uiRegistry.renderPlayerScreen();
  };

  // physical resistances inputs
  defenses.querySelector('.pc-dr-input').onchange = (e) => {
    CombatState.updatePCField('dr', e.target.value);
  };
  defenses.querySelector('.pc-reach-input').onchange = (e) => {
    CombatState.updatePCField('reach', e.target.value);
  };
  defenses.querySelector('.pc-immunities-input').onchange = (e) => {
    CombatState.updatePCField('immunities', e.target.value);
  };
  defenses.querySelector('.pc-resistances-input').onchange = (e) => {
    CombatState.updatePCField('resistances', e.target.value);
  };

  // Bind Initiative
  defenses.querySelector('.pc-iniMisc-input').onchange = (e) => {
    CombatState.updatePCNumber('iniMisc', e.target.value);
    uiRegistry.renderPlayerScreen();
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
}
