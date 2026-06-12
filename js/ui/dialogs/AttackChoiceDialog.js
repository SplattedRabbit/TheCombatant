/**
 * @module    AttackChoiceDialog
 * @summary   Dialog zur Angriffsauswahl (Standard/Voller Angriff) mit synchronisierten Checkboxen für Smite, Erzfeind und Hinterhältiger Angriff.
 * @exports   showAttackChoiceDialog
 * @reads     pc.classes, pc.isSmiteActive, pc.isFavoredEnemyActive, pc.isSneakAttacking, pc.feats
 * @stateOps  CombatState.updatePCField (für Toggle-Sync)
 * @depends   AttackEngine, Weapon, CombatState
 * @notHere   Schadensberechnung → AttackEngine.js | Schaden-Button-Handler → EquipmentSlotsRenderer.js
 */
import { AttackEngine } from '../../rules/AttackEngine.js';
import { WeaponRegistry, matchesFeatOption, getCritThreatDisplay } from '../../models/Weapon.js';
import { CombatState } from '../../state.js';


export function showAttackChoiceDialog(pc, weapon, event, options = {}) {
  const existing = document.getElementById('attackChoiceOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'attackChoiceOverlay';
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(18, 11, 5, 0.55);
    backdrop-filter: blur(2px);
    z-index: 2400;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  const hasPaladin = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'paladin');
  const paladinClass = hasPaladin ? pc.classes.find(c => c.classType === 'paladin') : null;
  const favoredEnemyBonus = pc.getFavoredEnemyBonus();
  const sneakAttackDice = pc.getSneakAttackDiceCount();

  const isRanged = weapon.grip === 'rng';
  const isMelee = !isRanged;

  let smiteActive = !!pc.isSmiteActive;
  let favoredEnemyActive = !!pc.isFavoredEnemyActive;
  let sneakActive = !!pc.isSneakAttacking;

  const formatMod = (n) => (n >= 0 ? '+' : '') + n;

  overlay.innerHTML = `
    <div class="custom-alert-box" style="
      background: var(--p);
      border: 2px solid var(--pb);
      border-radius: 4px;
      padding: 16px 24px;
      width: 310px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08);
      font-family: 'IM Fell English SC', serif;
      text-align: center;
      position: relative;
      transform: scale(0.9);
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="position: absolute; inset: 3px; border: 0.5px dashed rgba(200, 169, 110, 0.3); pointer-events: none; border-radius: 2px;"></div>
      
      <div style="font-size: 13px; color: var(--red); font-weight: bold; margin-bottom: 2px;">
        ⚔️ ${weapon.name || 'Waffe'}
      </div>
      <div class="dialog-subtitle" style="font-size: 8px; color: var(--inkl); font-style: italic; margin-bottom: 6px;">
        Angriffsart wählen
      </div>
      <hr style="border: none; border-top: 0.5px solid rgba(200, 169, 110, 0.4); margin: 4px 0 10px;">

      ${hasPaladin && isMelee ? `
        <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:10px; padding: 4px 8px; background: rgba(200,169,110,0.05); border: 0.5px solid rgba(200,169,110,0.2); border-radius:3px; text-align:left; font-size:8px; font-family:'Crimson Text', serif;">
          <label style="display:flex; align-items:center; gap:4px; cursor:pointer; margin:0; font-weight:bold; color:var(--red);">
            <input type="checkbox" class="dialog-smite-toggle" ${smiteActive ? 'checked' : ''} style="margin:0; width:11px; height:11px;">
             Böses niederstrecken (+${Math.max(0, pc.getAttributeMod('cha'))} Angr. / +${paladinClass.level} Schd.)
          </label>
        </div>
      ` : ''}
      
      <div class="dialog-content-area" style="display:flex; flex-direction:column; gap:8px; min-height: 120px; transition: opacity 0.15s ease-out;">
        <!-- Filled dynamically -->
      </div>
      
      <button class="btn btn-close-choice" style="
        font-family: 'IM Fell English SC', serif;
        font-size: 8px;
        padding: 2px 10px;
        margin-top: 10px;
        cursor: pointer;
        background: transparent;
        border: 0.5px solid var(--pb);
        border-radius: 1px;
        color: var(--inkl);
        outline: none;
        transition: color 0.15s, border-color 0.15s;
      ">Abbrechen</button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.getBoundingClientRect(); // trigger layout reflow
  overlay.style.opacity = '1';
  overlay.querySelector('.custom-alert-box').style.transform = 'scale(1)';

  const dismiss = () => {
    overlay.style.opacity = '0';
    overlay.querySelector('.custom-alert-box').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 200);
  };

  const closeBtn = overlay.querySelector('.btn-close-choice');
  closeBtn.onclick = dismiss;

  let currentView = 'grid'; // 'grid', 'std', 'full'

  function calculateSequences() {
    const stdSeq = AttackEngine.calculateAttackSequence(pc, weapon, false, { smite: smiteActive, favoredEnemy: favoredEnemyActive, sneakAttack: sneakActive, ...options });
    const fullSeq = AttackEngine.calculateAttackSequence(pc, weapon, true, { smite: smiteActive, favoredEnemy: favoredEnemyActive, sneakAttack: sneakActive, ...options });
    return { stdSeq, fullSeq };
  }

  function updateView() {
    const { stdSeq, fullSeq } = calculateSequences();
    const area = overlay.querySelector('.dialog-content-area');
    
    if (currentView === 'grid') {
      overlay.querySelector('.dialog-subtitle').textContent = 'Angriffsart wählen';
      
      const stdAtk = stdSeq[0] || { atkTotal: 0 };
      const doubleThreat = weapon.isKeen || (pc.feats && pc.feats.some(f => (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') && matchesFeatOption(weapon, f.option)));
      const doubledCritDisplay = getCritThreatDisplay(weapon.crit, doubleThreat);
      const stdFormula = `1W20 ${formatMod(stdAtk.atkTotal)}${doubledCritDisplay ? `<span style="font-size:7.5px; color:var(--inkl); font-weight:normal; margin-left:3px;">(Krit: ${doubledCritDisplay})</span>` : ''}`;

      const fullFormulas = fullSeq.map((atk, idx) => {
        return `<div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
          <span>${atk.name}:</span>
          <span style="font-weight:bold; color:var(--red);">1W20 ${formatMod(atk.atkTotal)}${doubledCritDisplay ? `<span style="font-size:7.5px; color:var(--inkl); font-weight:normal; margin-left:3px;"> (Krit: ${doubledCritDisplay})</span>` : ''}</span>
        </div>`;
      }).join('');

      area.innerHTML = `
        <!-- Standard Attack Card Option -->
        <div class="choice-card btn-std-atk" style="
          background: rgba(200, 169, 110, 0.1);
          border: 1px solid var(--pb);
          border-radius: 3px;
          padding: 8px 10px;
          cursor: pointer;
          text-align: left;
          transition: background-color 0.15s, border-color 0.15s;
        ">
          <div style="font-size:10px; font-weight:bold; color:var(--ink);">Standard-Angriff</div>
          <div style="font-family:'Crimson Text', serif; font-size:9px; color:var(--inkm); line-height:1.2; margin-top:2px;">
            Ein einzelner Angriff mit deinem vollen Angriffsbonus.
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; border-top: 0.5px dotted rgba(200,169,110,0.4); padding-top:4px;">
            <span style="font-size:7px; color:var(--inkl);">Formel:</span>
            <span style="font-size:9.5px; font-weight:bold; color:var(--red);">${stdFormula}</span>
          </div>
        </div>

        <!-- Full Attack Card Option -->
        <div class="choice-card btn-full-atk" style="
          background: rgba(200, 169, 110, 0.1);
          border: 1px solid var(--pb);
          border-radius: 3px;
          padding: 8px 10px;
          cursor: pointer;
          text-align: left;
          transition: background-color 0.15s, border-color 0.15s;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; font-weight:bold; color:var(--ink);">Voller Angriff (Full Attack)</span>
            <span style="font-size:7px; background:rgba(139,26,26,0.1); color:var(--red); padding:0 3px; border-radius:1px; font-weight:bold;">${fullSeq.length}x</span>
          </div>
          <div style="font-family:'Crimson Text', serif; font-size:9px; color:var(--inkm); line-height:1.2; margin-top:2px;">
            Führe alle dir zustehenden Angriffe aus.
          </div>
          <div style="margin-top:4px; border-top: 0.5px dotted rgba(200,169,110,0.4); padding-top:4px; font-size:8.5px; color:var(--inkm); font-family:'IM Fell English SC', serif;">
            ${fullFormulas}
          </div>
        </div>
      `;

      // Hover styles for cards
      const cards = area.querySelectorAll('.choice-card');
      cards.forEach(c => {
        c.onmouseenter = () => {
          c.style.backgroundColor = 'rgba(139, 26, 26, 0.05)';
          c.style.borderColor = 'var(--red)';
        };
        c.onmouseleave = () => {
          c.style.backgroundColor = 'rgba(200, 169, 110, 0.1)';
          c.style.borderColor = 'var(--pb)';
        };
      });

      area.querySelector('.btn-std-atk').onclick = () => {
        currentView = 'std';
        updateView();
      };
      area.querySelector('.btn-full-atk').onclick = () => {
        currentView = 'full';
        updateView();
      };

      closeBtn.textContent = 'Abbrechen';
      closeBtn.style.borderColor = 'var(--pb)';
      closeBtn.style.color = 'var(--inkl)';
      closeBtn.style.fontWeight = 'normal';
    } 
    else if (currentView === 'std') {
      overlay.querySelector('.dialog-subtitle').innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <span>Standard-Angriff gewählt</span>
          <span class="btn-go-back-choice" style="font-size: 7.5px; cursor: pointer; border: 0.5px solid var(--pb); border-radius: 2.5px; padding: 1px 5px; color: var(--red); background: rgba(139,26,26,0.05); font-family: 'IM Fell English SC', serif; font-weight:bold; transition: background-color 0.15s;">← Zurück</span>
        </div>
      `;
      overlay.querySelector('.btn-go-back-choice').onclick = () => {
        currentView = 'grid';
        updateView();
      };

      const stdAtk = stdSeq[0];
      let breakdownHtml = '';
      if (stdAtk && Array.isArray(stdAtk.atkBreakdown)) {
        breakdownHtml = stdAtk.atkBreakdown.map(item => `
          <div style="display:flex; justify-content:space-between;">
            <span>${item.label}:</span> <span style="font-weight:bold; color:var(--ink);">${formatMod(item.value)}</span>
          </div>
        `).join('');
      }

      area.innerHTML = `
        <div style="text-align: left; background: rgba(200, 169, 110, 0.04); border: 1px solid var(--pb); border-radius: 3px; padding: 10px; font-family: 'Crimson Text', serif;">
          <div style="font-family: 'IM Fell English SC', serif; font-size: 11px; font-weight: bold; color: var(--red); margin-bottom: 5px; border-bottom: 0.5px solid rgba(200,169,110,0.3); padding-bottom: 3px;">
            Angriffsmodifikatoren
          </div>
          <div style="display:flex; flex-direction:column; gap:3px; font-size:9.5px; color:var(--inkm);">
            ${breakdownHtml}
            <hr style="border:none; border-top:0.5px dashed rgba(200,169,110,0.3); margin:4px 0;">
            <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:bold; color:var(--red); font-family: 'IM Fell English SC', serif;">
              <span>Gesamt-Modifikator:</span> <span>${formatMod(stdAtk ? stdAtk.atkTotal : 0)}</span>
            </div>
          </div>
          <hr style="border:none; border-top:0.5px solid rgba(200,169,110,0.3); margin:6px 0 4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-family: 'IM Fell English SC', serif; font-size:10.5px; font-weight:bold; color:var(--red);">
            <span>WURF-FORMEL:</span> <span>1W20 ${formatMod(stdAtk ? stdAtk.atkTotal : 0)}</span>
          </div>
        </div>
      `;

      closeBtn.textContent = 'Fertig!';
      closeBtn.style.borderColor = 'var(--red)';
      closeBtn.style.color = 'var(--red)';
      closeBtn.style.fontWeight = 'bold';
    } 
    else if (currentView === 'full') {
      overlay.querySelector('.dialog-subtitle').innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <span>Voller Angriff gewählt</span>
          <span class="btn-go-back-choice" style="font-size: 7.5px; cursor: pointer; border: 0.5px solid var(--pb); border-radius: 2.5px; padding: 1px 5px; color: var(--red); background: rgba(139,26,26,0.05); font-family: 'IM Fell English SC', serif; font-weight:bold; transition: background-color 0.15s;">← Zurück</span>
        </div>
      `;
      overlay.querySelector('.btn-go-back-choice').onclick = () => {
        currentView = 'grid';
        updateView();
      };

      const attacksHtml = fullSeq.map((atk, idx) => {
        let breakdownList = '';
        if (Array.isArray(atk.atkBreakdown)) {
          breakdownList = atk.atkBreakdown.map(item => `
            <div style="display:flex; justify-content:space-between;">
              <span>${item.label}:</span> <span>${formatMod(item.value)}</span>
            </div>
          `).join('');
        }
        return `
          <div style="margin-top: 4px; border-bottom: 0.5px dotted rgba(200, 169, 110, 0.2); padding-bottom: 3px; font-family: 'Crimson Text', serif;">
            <div style="display:flex; justify-content:space-between; font-weight:bold; color:var(--red); font-size:9.5px; font-family:'IM Fell English SC', serif;">
              <span>${atk.name}:</span> <span>1W20 ${formatMod(atk.atkTotal)}</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5px; font-size:7.5px; color:var(--inkm); padding-left: 6px; margin-top: 1px;">
              ${breakdownList}
            </div>
          </div>
        `;
      }).join('');

      area.innerHTML = `
        <div style="text-align: left; background: rgba(200, 169, 110, 0.04); border: 1px solid var(--pb); border-radius: 3px; padding: 8px 10px; max-height: 200px; overflow-y: auto;">
          <div style="font-family: 'IM Fell English SC', serif; font-size: 11px; font-weight: bold; color: var(--red); margin-bottom: 3px; border-bottom: 0.5px solid rgba(200,169,110,0.3); padding-bottom: 3px;">
            Angriffsmodifikatoren (Voller Angriff)
          </div>
          <div style="display:flex; flex-direction:column; gap:3px;">
            ${attacksHtml}
          </div>
        </div>
      `;

      closeBtn.textContent = 'Fertig!';
      closeBtn.style.borderColor = 'var(--red)';
      closeBtn.style.color = 'var(--red)';
      closeBtn.style.fontWeight = 'bold';
    }
  }

  // Setup Event Listeners for checkboxes
  const smiteToggle = overlay.querySelector('.dialog-smite-toggle');
  if (smiteToggle) {
    smiteToggle.onchange = (e) => {
      smiteActive = e.target.checked;
      CombatState.updatePCField('isSmiteActive', smiteActive);
      updateView();
    };
  }



  // Initial render
  updateView();
}
