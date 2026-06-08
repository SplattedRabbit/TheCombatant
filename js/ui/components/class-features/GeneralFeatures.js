import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';
import { showCustomConfirm } from '../dialogs.js';

export class GeneralFeatures extends ClassFeatureComponent {
  constructor() {
    super('general', 'Allgemeine Tagesfähigkeiten', 'General Daily Abilities');
  }

  isEligible(pc) {
    // General abilities are available for everyone
    return true;
  }

  render(pc, level) {
    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="general" style="background: rgba(200, 169, 110, 0.1); padding: 5px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 10px; font-weight: bold; color: var(--red);">
          <span>📋 Allgemeine Tagesfähigkeiten</span>
          <span>▼</span>
        </div>
        
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="width: 100%; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 2px; border-bottom: 0.5px solid rgba(200,169,110,0.2);">
              <h3 style="font-family:'IM Fell English SC', serif; font-size: 8px; color: var(--red); margin: 0; line-height: 1;">Tagesfähigkeiten</h3>
              <button class="btn" id="btnAddAbilityBtn" style="font-size: 7px; padding: 0 4px; line-height: 1;">+</button>
            </div>
            
            <div id="pcAbilitiesList" style="display: flex; flex-direction: column; gap: 4px; max-height: 165px; overflow-y: auto;"></div>
            
            <div id="addAbilityForm" style="display: none; flex-direction: column; gap: 2px; background: rgba(200, 169, 110, 0.15); border: 0.5px solid var(--pb); padding: 3px; border-radius: 2px; margin-top: 4px;">
              <input type="text" id="newAbName" placeholder="Zorn des Helden" class="cinput" style="font-size: 8px; height: 14px;">
              <div style="display: flex; gap: 2px; align-items: center;">
                <input type="number" id="newAbMax" placeholder="Max" class="cinput" style="width: 28px; font-size: 8px; height: 14px; padding: 0; text-align: center;">
                <button class="btn btn-p" id="saveNewAbilityBtn" style="font-size: 7px; padding: 1px 4px;">Ok</button>
                <button class="btn" id="cancelNewAbilityBtn" style="font-size: 7px; padding: 1px 4px;">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    const addForm = container.querySelector('#addAbilityForm');
    const addBtn = container.querySelector('#btnAddAbilityBtn');
    if (addBtn) {
      addBtn.onclick = (e) => {
        e.stopPropagation();
        addForm.style.display = addForm.style.display === 'none' ? 'flex' : 'none';
      };
    }
    
    const cancelBtn = container.querySelector('#cancelNewAbilityBtn');
    if (cancelBtn) {
      cancelBtn.onclick = (e) => {
        e.stopPropagation();
        addForm.style.display = 'none';
      };
    }
    
    const saveBtn = container.querySelector('#saveNewAbilityBtn');
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.stopPropagation();
        const nameInput = container.querySelector('#newAbName');
        const maxInput = container.querySelector('#newAbMax');
        const name = nameInput.value;
        const max = parseInt(maxInput.value) || 1;
        if (name) {
          CombatState.addPCDailyAbility(name, max);
          triggerRender();
        }
      };
    }

    const abList = container.querySelector('#pcAbilitiesList');
    if (abList) {
      // Filter out class-specific daily abilities
      const filteredAbilities = pc.dailyAbilities.filter(ab => {
        return ab.name !== "Kampfrausch (Rage)" && 
               ab.name !== "Böses niederstrecken" && 
               ab.name !== "Hände auflegen" && 
               ab.name !== "Untote vertreiben" && 
               ab.name !== "Bardisches Lied" && 
               ab.name !== "Tiergestalt";
      });

      if (!filteredAbilities.length) {
        abList.innerHTML = '<div style="font-size:7.5px; color:var(--inkl); font-style:italic; text-align:center;">Keine Fähigkeiten eingetragen</div>';
      } else {
        // Map actual indices in pc.dailyAbilities
        pc.dailyAbilities.forEach((ab, idx) => {
          if (ab.name === "Kampfrausch (Rage)" || 
              ab.name === "Böses niederstrecken" || 
              ab.name === "Hände auflegen" || 
              ab.name === "Untote vertreiben" || 
              ab.name === "Bardisches Lied" || 
              ab.name === "Tiergestalt") return;

          const item = document.createElement('div');
          item.style = 'display:flex; align-items:center; justify-content:space-between; font-size:8px; border-bottom:0.5px solid rgba(200, 169, 110, 0.2); padding-bottom:2px;';
          item.innerHTML = `
            <span style="font-weight:600; width:65px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;" title="${ab.name}">${ab.name}</span>
            <span>${ab.max - ab.used}/${ab.max}</span>
            <div style="display:flex; gap:2.5px; align-items:center;">
              <button class="xbtn xbtn-heal restore-ab-btn" style="padding:0; font-size:8.5px; width:15px; height:15px; display:inline-flex; align-items:center; justify-content:center;" title="Nutzung wiederherstellen">+</button>
              <button class="xbtn xbtn-dmg spend-ab-btn" style="padding:0; font-size:8.5px; width:15px; height:15px; display:inline-flex; align-items:center; justify-content:center; min-width:auto;" title="Nutzung verbrauchen">-</button>
              <button class="xbtn xbtn-del delete-ab-btn" style="padding:0 2px; font-size:8px; margin-left:1px; height:15px; line-height:13px;" title="Fähigkeit löschen">✕</button>
            </div>
          `;

          item.querySelector('.restore-ab-btn').onclick = (e) => {
            e.stopPropagation();
            CombatState.updatePCDailyAbilityUsed(idx, -1);
            triggerRender();
          };

          item.querySelector('.spend-ab-btn').onclick = (e) => {
            e.stopPropagation();
            CombatState.updatePCDailyAbilityUsed(idx, 1);
            triggerRender();
          };

          item.querySelector('.delete-ab-btn').onclick = (e) => {
            e.stopPropagation();
            showCustomConfirm("Löschen?", `Möchtest du "${ab.name}" löschen?`, () => {
              CombatState.removePCDailyAbility(idx);
              triggerRender();
            });
          };

          abList.appendChild(item);
        });
      }
    }
  }
}
