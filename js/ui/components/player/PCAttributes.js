/**
 * @module    PCAttributes
 * @summary   Rendert die Attribut-Sektion (STR/DEX/CON/INT/WIS/CHA, BAB) und den Multiclass-Manager des Spielercharakters.
 * @exports   renderPCAttributes(pc), handleAbilityScoreChange(key, val)
 * @reads     pc.str, pc.dex, pc.con, pc.int, pc.wis, pc.cha, pc.bab, pc.classes
 * @stateOps  updatePCNumber, addPCClass, removePCClass, updatePCClassLevel, updatePCClassType, clearPCClasses
 * @depends   CombatState (state.js), CombatRules (rules.js), uiRegistry, getAblMod, formatMod (PCUtils.js), dialogs.js
 * @notHere   Offensive Angriffswerte → PCOffense.js | Fertigkeiten → PCSkillsTab.js | Talente → PCFeatsTab.js
 */
import { CombatState } from '../../../state.js';
import { CombatRules } from '../../../rules.js';
import { uiRegistry } from '../../ui-shared.js';
import { getAblMod, formatMod } from './PCUtils.js';
import { showCustomAlert, showCustomConfirm, showRollBreakdown } from '../dialogs.js';

export function handleAbilityScoreChange(key, val) {
  let num = parseInt(val);
  if (isNaN(num)) num = 10;
  if (num < 3) {
    showCustomAlert("Achtung!", "Sprich mit deinem SL, du hast ein Problem.");
    num = 3;
  }
  CombatState.updatePCNumber(key, num);
  uiRegistry.renderPlayerScreen();
}

export function renderPCAttributes(pc) {
  const attributes = document.getElementById('pcAttributes');
  if (!attributes) return;

  const strMod = getAblMod(pc.str);
  const dexMod = getAblMod(pc.dex);
  const conMod = getAblMod(pc.con);
  const intMod = getAblMod(pc.int);
  const wisMod = getAblMod(pc.wis);
  const chaMod = getAblMod(pc.cha);

  const classesCount = Array.isArray(pc.classes) ? pc.classes.length : 0;

  const getBabSequence = (bab) => {
    const seq = [formatMod(bab)];
    if (bab >= 6) seq.push(formatMod(bab - 5));
    if (bab >= 11) seq.push(formatMod(bab - 10));
    if (bab >= 16) seq.push(formatMod(bab - 15));
    return seq.join(' / ');
  };

  const renderAttrBox = (key, label, icon) => {
    const stat = pc[key];
    const score = stat.getValue();
    const mod = getAblMod(score);
    const isBuffed = stat.modifiers.some(m => !m.isRace && m.value !== 0);
    const hasModifiers = stat.modifiers.some(m => m.value !== 0);
    
    let tooltip = `${label}wert`;
    let borderStyle = 'border: 0.5px solid var(--pb);';
    let bgStyle = 'background: rgba(200, 169, 110, 0.1);';
    if (isBuffed) {
      borderStyle = 'border: 0.5px solid var(--red) !important;';
      bgStyle = 'background: rgba(139, 26, 26, 0.05) !important;';
    }
    if (hasModifiers) {
      const modifiers = stat.modifiers.filter(m => m.value !== 0);
      tooltip += `\nBasiswert: ${stat.base}\nAktiver Wert: ${score}\nAktive Boni:\n` + 
        modifiers.map(m => `• ${m.source}: ${formatMod(m.value)}`).join('\n');
    }
    
    return `
      <div class="attr-box" style="display:flex; flex-direction:column; ${bgStyle} ${borderStyle} border-radius:2px; padding:3px; position:relative;" title="${tooltip}">
        <label style="font-size:8px; font-weight:600; color:var(--inkl);">${icon} ${label}</label>
        <div style="display:flex; align-items:center; gap:2px; margin-top:2px; justify-content:space-between;">
          <input type="number" value="${score}" class="cinput pc-${key}-inp" style="width:24px; font-size:9px; height:14px; text-align:center; padding:0; ${isBuffed ? 'color: var(--red); font-weight: bold; border-color: var(--red) !important;' : ''}" title="${tooltip}">
          <input type="text" value="${formatMod(mod)}" readonly class="cinput" style="width:20px; font-size:8.5px; height:14px; text-align:center; padding:0; font-weight:bold; ${isBuffed ? 'border-color: var(--red) !important; background: rgba(139, 26, 26, 0.08) !important; color: var(--red) !important;' : 'background:rgba(0,0,0,0.05); color:var(--red); border-color:var(--pb);'}" title="Modifikator">
          <button class="xbtn roll-attr-btn" data-attr="${key}" style="padding:0; width:16px; height:14px; font-size:8px; line-height:14px; display:flex; align-items:center; justify-content:center;" title="${label}wurf (Formel)">🎲</button>
        </div>
      </div>
    `;
  };

  attributes.innerHTML = `
    <div class="phdr"><h2>✨ Attribute &amp; Kompetenz</h2></div>
    <div class="pbody" style="display:flex; flex-direction:column; gap:5px;">
      
      <!-- Native D&D 3.5e Multiclassing Manager Row -->
      <div style="background:rgba(139,26,26,0.04); border:0.5px solid rgba(139,26,26,0.15); border-radius:2px; padding:5px 6px; margin-bottom:4px; display:flex; flex-direction:column; gap:4px;">
        <!-- Rasse / Volk Selector -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 0.5px solid rgba(139,26,26,0.1); padding-bottom: 4px; margin-bottom: 2px;">
          <span style="font-family:'IM Fell English SC', serif; font-size:9px; color:var(--red); font-weight:600; letter-spacing:0.3px;">🧬 Volk / Rasse</span>
          <select id="pcRaceSelect" class="cinput" style="font-size:8px; height:14px; padding:0 2px; width:80px; text-align:center; outline:none; cursor:pointer;">
            <option value="human" ${pc.race === 'human' ? 'selected' : ''}>Mensch</option>
            <option value="elf" ${pc.race === 'elf' ? 'selected' : ''}>Elf</option>
            <option value="dwarf" ${pc.race === 'dwarf' ? 'selected' : ''}>Zwerg</option>
            <option value="gnome" ${pc.race === 'gnome' ? 'selected' : ''}>Gnom</option>
            <option value="halfling" ${pc.race === 'halfling' ? 'selected' : ''}>Halbling</option>
            <option value="half_elf" ${pc.race === 'half_elf' ? 'selected' : ''}>Halbelf</option>
            <option value="half_orc" ${pc.race === 'half_orc' ? 'selected' : ''}>Halbork</option>
          </select>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:'IM Fell English SC', serif; font-size:9px; color:var(--red); font-weight:600; letter-spacing:0.3px;">🎭 Klassen &amp; Stufen</span>
          ${classesCount < 4 ? `
            <button class="btn btn-p" id="btnShowAddClassForm" style="font-size:7px; padding:1px 4px; line-height:1; border-color:var(--pb); background:rgba(139,26,26,0.05); color:var(--red);">+ Klasse</button>
          ` : ''}
        </div>
        
        <!-- Active Classes list -->
        <div style="display:flex; flex-direction:column; gap:3px;">
          ${classesCount > 0 ? pc.classes.map((c, idx) => {
            return `
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(200, 169, 110, 0.1); border:0.5px solid var(--pb); border-radius:1px; padding:2px 4px; font-size:8px;">
                <select class="cinput pc-class-type-select" data-idx="${idx}" style="font-size:8px; height:13px; padding:0; flex:1; border:none; background:transparent; font-weight:600; color:var(--inkm); outline:none;">
                  ${CombatRules.CLASSES.filter(x => x.key !== 'custom').map(cls => `
                    <option value="${cls.key}" ${c.classType === cls.key ? 'selected' : ''}>${cls.nameDe} (${cls.nameEn})</option>
                  `).join('')}
                </select>
                <div style="display:flex; align-items:center; gap:4px;">
                  <select class="cinput pc-class-lvl-select" data-idx="${idx}" style="font-size:8px; height:14px; padding:0; width:44px; text-align:center; line-height:1.2;">
                    ${Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => `
                      <option value="${lvl}" ${c.level === lvl ? 'selected' : ''}>${lvl}</option>
                    `).join('')}
                  </select>
                  <button class="xbtn xbtn-del btn-remove-class" data-idx="${idx}" style="padding:0 3px; font-size:7.5px; height:13px; line-height:11px;" title="Klasse entfernen">✕</button>
                </div>
              </div>
            `;
          }).join('') : `
            <div style="font-size:8px; color:var(--inkl); font-style:italic; text-align:center; padding:2px 0;">
              Benutzerdefinierte Stufen / Custom
            </div>
          `}
        </div>
        
        <!-- Inline Add Class Form -->
        <div id="addClassForm" style="display:none; flex-direction:column; gap:3px; background:rgba(200,169,110,0.15); border:0.5px solid var(--pb); border-radius:1.5px; padding:3px; margin-top:2px;">
          <div style="display:flex; gap:3px;">
            <select id="newClassSelect" class="cinput" style="font-size:7.5px; height:14px; padding:0 2px; flex:1;">
              ${CombatRules.CLASSES.filter(cls => cls.key !== 'custom').map(cls => `
                <option value="${cls.key}">${cls.nameDe} (${cls.nameEn})</option>
              `).join('')}
            </select>
            <select id="newClassLvlSelect" class="cinput" style="font-size:7.5px; height:14px; padding:0; width:28px; text-align:center;">
              ${Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => `
                <option value="${lvl}">${lvl}</option>
              `).join('')}
            </select>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:2px;">
            <button class="btn btn-p" id="btnAddClassConfirm" style="font-size:7px; padding:1px 5px;">Hinzufügen</button>
            <button class="btn" id="btnAddClassCancel" style="font-size:7px; padding:1px 5px;">✕</button>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px;">
        ${renderAttrBox('str', 'Stärke', '⚔️')}
        ${renderAttrBox('dex', 'Geschick', '🎯')}
        ${renderAttrBox('con', 'Konstitution', '🛡️')}
        ${renderAttrBox('int', 'Intelligenz', '🧠')}
        ${renderAttrBox('wis', 'Weisheit', '🔮')}
        ${renderAttrBox('cha', 'Charisma', '✨')}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:3px; background:rgba(139,26,26,0.05); border:0.5px solid rgba(139,26,26,0.2); border-radius:2px; padding:4px;">
        <label style="font-size:9px; font-weight:bold; color:var(--red);">⚔️ Basisangriff (BAB):</label>
        <input type="text" value="${getBabSequence(pc.bab)}" class="cinput pc-bab-inp" style="width:100px; font-size:9px; font-weight:bold; text-align:center; height:14px; padding:0; ${classesCount > 0 ? 'background:rgba(0,0,0,0.05); color:var(--red); border-color:var(--pb); cursor:not-allowed;' : ''}" ${classesCount > 0 ? 'readonly tabindex="-1"' : ''}>
      </div>
    </div>
  `;

  // Bind Attributes Inputs
  attributes.querySelector('.pc-str-inp').onchange = (e) => handleAbilityScoreChange('str', e.target.value);
  attributes.querySelector('.pc-dex-inp').onchange = (e) => handleAbilityScoreChange('dex', e.target.value);
  attributes.querySelector('.pc-con-inp').onchange = (e) => handleAbilityScoreChange('con', e.target.value);
  attributes.querySelector('.pc-int-inp').onchange = (e) => handleAbilityScoreChange('int', e.target.value);
  attributes.querySelector('.pc-wis-inp').onchange = (e) => handleAbilityScoreChange('wis', e.target.value);
  attributes.querySelector('.pc-cha-inp').onchange = (e) => handleAbilityScoreChange('cha', e.target.value);
  
  const babInp = attributes.querySelector('.pc-bab-inp');
  babInp.onchange = (e) => { 
    CombatState.clearPCClasses(); 
    CombatState.updatePCNumber('bab', e.target.value); 
    uiRegistry.renderPlayerScreen(); 
  };

  if (classesCount === 0) {
    babInp.onfocus = () => {
      babInp.value = pc.bab;
    };
    babInp.onblur = () => {
      babInp.value = getBabSequence(pc.bab);
    };
  }
  
  // Bind Race Selector
  const raceSelect = attributes.querySelector('#pcRaceSelect');
  if (raceSelect) {
    raceSelect.onchange = (e) => {
      const val = e.target.value;
      CombatState.updatePCBatch(freshPC => {
        freshPC.race = val;
        freshPC.isHuman = (val === 'human');
        const lowSpeedRaces = ['dwarf', 'gnome', 'halfling'];
        freshPC.baseBw = lowSpeedRaces.includes(val) ? 20 : 30;
      });
      uiRegistry.renderPlayerScreen();
    };
  }

  // Multiclass Manager Handlers
  const addForm = attributes.querySelector('#addClassForm');
  const btnShowAdd = attributes.querySelector('#btnShowAddClassForm');
  if (btnShowAdd) {
    btnShowAdd.onclick = () => {
      addForm.style.display = 'flex';
      btnShowAdd.style.display = 'none';
    };
  }

  const btnCancelAdd = attributes.querySelector('#btnAddClassCancel');
  if (btnCancelAdd) {
    btnCancelAdd.onclick = () => {
      addForm.style.display = 'none';
      if (btnShowAdd) btnShowAdd.style.display = 'block';
    };
  }

  const btnConfirmAdd = attributes.querySelector('#btnAddClassConfirm');
  if (btnConfirmAdd) {
    btnConfirmAdd.onclick = () => {
      const clsKey = attributes.querySelector('#newClassSelect').value;
      const lvlVal = parseInt(attributes.querySelector('#newClassLvlSelect').value) || 1;
      CombatState.addPCClass(clsKey, lvlVal);
      uiRegistry.renderPlayerScreen();
    };
  }

  attributes.querySelectorAll('.pc-class-type-select').forEach(select => {
    select.onchange = (e) => {
      const idx = parseInt(select.dataset.idx);
      CombatState.updatePCClassType(idx, e.target.value);
      uiRegistry.renderPlayerScreen();
    };
  });

  attributes.querySelectorAll('.pc-class-lvl-select').forEach(select => {
    select.onchange = (e) => {
      const idx = parseInt(select.dataset.idx);
      const val = parseInt(e.target.value) || 1;
      CombatState.updatePCClassLevel(idx, val);
      uiRegistry.renderPlayerScreen();
    };
  });

  attributes.querySelectorAll('.btn-remove-class').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx);
      const classInfo = pc.classes[idx];
      const className = CombatRules.CLASSES.find(x => x.key === classInfo?.classType)?.nameDe || 'Klasse';
      
      showCustomConfirm(
        "Klasse entfernen? ⚠️", 
        `Möchtest du die Klasse "${className}" wirklich entfernen? Dadurch werden alle zugehörigen Klassendaten und Sonderfähigkeiten zurückgesetzt, um Anzeigefehler zu vermeiden.`, 
        () => {
          CombatState.removePCClass(idx);
          uiRegistry.renderPlayerScreen();
        }
      );
    };
  });

  // Bind Attributes Roll buttons
  attributes.querySelectorAll('.roll-attr-btn').forEach(btn => {
    btn.onclick = (e) => {
      const attr = btn.dataset.attr;
      const score = pc[attr] || 10;
      const mod = getAblMod(score);
      const labels = { str: 'Stärke', dex: 'Geschick', con: 'Konstitution', int: 'Intelligenz', wis: 'Weisheit', cha: 'Charisma' };
      const label = labels[attr] || 'Attribut';
      
      showRollBreakdown(`${label}-Wurf`, '1W20', [
        { label: `${label}-Mod`, value: mod }
      ], e);
    };
  });
}
