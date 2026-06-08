import { CombatState } from '../../state.js';
import { showRollBreakdown, showCustomConfirm } from './dialogs.js';

export class CompanionSheet {
  static getCompanionBaseStats(type, level = 1) {
    switch (type) {
      case 'wolf':
        return {
          name: 'Wolf',
          ac: 14,
          str: 13,
          dex: 15,
          con: 15,
          wis: 12,
          cha: 6,
          maxHP: 13,
          attacks: [
            { name: 'Biss-Angriff (Wolf)', bonus: 3, damage: '1w6+1', note: 'plus Zu-Boden-werfen' }
          ],
          specials: 'Geruchssinn, Link, Zauber teilen'
        };
      case 'leopard':
        return {
          name: 'Leopard',
          ac: 15,
          str: 16,
          dex: 19,
          con: 15,
          wis: 12,
          cha: 6,
          maxHP: 19,
          attacks: [
            { name: 'Biss-Angriff (Leopard)', bonus: 6, damage: '1w6+3' },
            { name: '2x Krallen (Leopard)', bonus: 1, damage: '1w3+1' },
            { name: 'Anspringen & Ankrallen (Rake)', bonus: 1, damage: '1w3+1', note: 'falls angesprungen' }
          ],
          specials: 'Geruchssinn, Link, Zauber teilen, Anspringen'
        };
      case 'bear':
        return {
          name: 'Braunbär',
          ac: 15,
          str: 27,
          dex: 13,
          con: 19,
          wis: 12,
          cha: 6,
          maxHP: 51,
          attacks: [
            { name: '2x Krallen-Angriff (Bär)', bonus: 11, damage: '1w8+8' },
            { name: 'Biss-Angriff (Bär)', bonus: 6, damage: '2w6+4', note: 'plus Umklammern' }
          ],
          specials: 'Geruchssinn, Link, Zauber teilen, Umklammern (Grab)'
        };
      case 'custom':
        return {
          name: 'Benutzerdefiniert',
          ac: 10,
          str: 10,
          dex: 10,
          con: 10,
          wis: 10,
          cha: 10,
          maxHP: 10,
          attacks: [
            { name: 'Nahkampfangriff (Custom)', bonus: 0, damage: '1w6' }
          ],
          specials: 'Eigene Werte eingetragen'
        };
      default:
        return null;
    }
  }

  static render(pc) {
    const type = pc.companionType || 'none';
    const name = pc.companionName || '';
    const curHP = pc.companionHP || 0;
    const maxHP = pc.companionMaxHP || 0;

    const classes = Array.isArray(pc.classes) ? pc.classes : [];
    const druidClass = classes.find(c => c.classType === 'druid');
    const rangerClass = classes.find(c => c.classType === 'ranger');
    let effectiveDruidLvl = 0;
    if (druidClass) effectiveDruidLvl += druidClass.level;
    if (rangerClass) effectiveDruidLvl += Math.floor(rangerClass.level / 2);
    
    if (effectiveDruidLvl === 0 && (pc.classType === 'druid' || pc.classType === 'ranger')) {
      effectiveDruidLvl = pc.classType === 'druid' ? pc.level : Math.floor(pc.level / 2);
    }
    if (effectiveDruidLvl === 0) {
      effectiveDruidLvl = 1;
    }

    const baseStats = this.getCompanionBaseStats(type, effectiveDruidLvl);

    let contentHtml = '';

    if (type === 'none') {
      contentHtml = `
        <div style="font-size: 8.5px; color: var(--inkl); font-style: italic; text-align: center; padding: 45px 15px; background: rgba(0,0,0,0.02); border: 0.5px dashed var(--pb); border-radius: 2px;">
          🐾 Du hast aktuell keinen aktiven Tierbegleiter ausgewählt.<br>
          <span style="font-size: 7.5px; margin-top: 3px; display: block;">Wähle unten eine Kreaturenart aus, um deinen Begleiter zu rufen!</span>
          
          <div style="margin-top: 10px; display: flex; justify-content: center;">
            <select class="cinput companion-species-select" style="font-size: 8px; height: 16px; padding: 0 4px; width: 120px;">
              <option value="none">-- Auswählen --</option>
              <option value="wolf">🐺 Wolf (D&D 3.5e RAW)</option>
              <option value="leopard">🐆 Leopard (D&D 3.5e RAW)</option>
              <option value="bear">🐻 Braunbär (D&D 3.5e RAW)</option>
              <option value="custom">🛡️ Benutzerdefiniert</option>
            </select>
          </div>
        </div>
      `;
    } else {
      const getAblMod = (score) => {
        const s = parseInt(score) || 10;
        return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
      };

      const formatMod = (mod) => {
        return (mod >= 0 ? '+' : '') + mod;
      };

      const displayAC = type === 'custom' ? maxHP : (baseStats ? baseStats.ac : 10);
      const str = baseStats ? baseStats.str : 10;
      const dex = baseStats ? baseStats.dex : 10;
      const con = baseStats ? baseStats.con : 10;
      const wis = baseStats ? baseStats.wis : 10;
      const cha = baseStats ? baseStats.cha : 10;

      const pct = maxHP > 0 ? Math.max(0, Math.min(100, Math.floor((curHP / maxHP) * 100))) : 0;
      const fc = curHP <= 0 ? 'fill-dead' : (pct > 50 ? 'fill-ok' : (pct > 25 ? 'fill-warn' : 'fill-crit'));

      let attackListHtml = '';
      if (baseStats && Array.isArray(baseStats.attacks)) {
        attackListHtml = baseStats.attacks.map((att, idx) => {
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.3); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px 6px; font-size: 8px;">
              <div>
                <strong>${att.name}:</strong> 
                <span style="color: var(--red); font-weight: bold;">${formatMod(att.bonus)}</span> (${att.damage})
                ${att.note ? `<br><span style="font-size: 6.8px; color: var(--inkl); font-style: italic;">• ${att.note}</span>` : ''}
              </div>
              <button class="btn roll-companion-attack-btn" data-name="${att.name}" data-bonus="${att.bonus}" data-damage="${att.damage}" data-note="${att.note || ''}" style="font-size: 7.5px; padding: 2px 6px; font-weight: bold; cursor: pointer; border-radius: 2px;">Würfeln 🎲</button>
            </div>
          `;
        }).join('');
      }

      contentHtml = `
        <div style="display: flex; flex-direction: column; gap: 6px; background: rgba(200, 169, 110, 0.04); border: 0.5px solid var(--pb); border-radius: 3px; padding: 6px;">
          <!-- Companion Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--pb); padding-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 11px;">🐾</span>
              <input type="text" class="companion-name-field" value="${name}" placeholder="Name deines Begleiters" style="font-family: 'IM Fell English SC', serif; font-size: 11px; font-weight: bold; color: var(--red); background: transparent; border: none; border-bottom: 0.5px dashed var(--pb); outline: none; width: 120px;" title="Begleiter-Name">
            </div>
            
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 7.5px; color: var(--inkl); font-style: italic;">Art:</span>
              <select class="cinput companion-species-select" style="font-size: 7.5px; height: 14px; padding: 0; width: 75px; margin: 0;">
                <option value="wolf" ${type === 'wolf' ? 'selected' : ''}>Wolf</option>
                <option value="leopard" ${type === 'leopard' ? 'selected' : ''}>Leopard</option>
                <option value="bear" ${type === 'bear' ? 'selected' : ''}>Braunbär</option>
                <option value="custom" ${type === 'custom' ? 'selected' : ''}>Benutzerdef.</option>
                <option value="none">-- Entlassen --</option>
              </select>
            </div>
          </div>

          <!-- HP & AC Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: center;">
            <!-- Health Bar Widget -->
            <div style="display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200,169,110,0.15); padding: 4px; border-radius: 2px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%); border: 1.2px solid var(--red); display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'IM Fell English SC', serif; color: var(--red); font-size: 9px; font-weight: bold;">
                <span style="font-size: 5px; color: var(--inkl); line-height: 1; margin-top: 1px;">TP</span>
                <span style="line-height: 1.1; font-size: 10px;">${curHP}</span>
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                <div style="display: flex; justify-content: space-between; font-size: 7px; font-weight: bold; color: var(--inkm);">
                  <span>Begleiter-TP</span>
                  <span>${pct}%</span>
                </div>
                <div style="height: 6px; background: rgba(0,0,0,0.15); border-radius: 1.5px; overflow: hidden; border: 0.5px solid var(--pb);">
                  <div class="hp-bar-fill ${fc}" style="width: ${pct}%; height: 100%; transition: width 0.2s;"></div>
                </div>
                <div style="display: flex; gap: 2px; align-items: center; margin-top: 1px;">
                  <button class="btn companion-hp-adjust-btn" data-dir="-1" style="font-size: 7px; padding: 0 4px; line-height: 1; height: 12px; font-weight: bold;">-</button>
                  <input type="number" class="companion-hp-cur-field" value="${curHP}" style="width: 18px; font-size: 7.5px; text-align: center; height: 12px; padding: 0; border-radius: 1px; border: 0.5px solid var(--pb);" title="Aktuelle TP direkt ändern">
                  <span style="font-size: 7.5px;">/</span>
                  <input type="number" class="companion-hp-max-field" value="${maxHP}" style="width: 18px; font-size: 7.5px; text-align: center; height: 12px; padding: 0; border-radius: 1px; border: 0.5px solid var(--pb);" title="Maximal-TP direkt ändern">
                  <button class="btn companion-hp-adjust-btn" data-dir="1" style="font-size: 7px; padding: 0 4px; line-height: 1; height: 12px; font-weight: bold;">+</button>
                </div>
              </div>
            </div>

            <!-- AC & Stat Blocks -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div style="display: flex; flex-direction: column; background: rgba(200, 169, 110, 0.1); border: 0.5px solid var(--pb); border-radius: 2px; padding: 3px; align-items: center; justify-content: center;">
                <span style="font-size: 6.8px; font-weight: bold; color: var(--inkl);">🛡️ RÜSTUNGSKL.</span>
                <span style="font-family: 'IM Fell English SC', serif; font-size: 14px; font-weight: bold; color: var(--red); line-height: 1;">${type === 'custom' ? displayAC : displayAC}</span>
              </div>
              <div style="display: flex; flex-direction: column; background: rgba(200, 169, 110, 0.1); border: 0.5px solid var(--pb); border-radius: 2px; padding: 3px; align-items: center; justify-content: center;">
                <span style="font-size: 6.8px; font-weight: bold; color: var(--inkl);">🏃 BEWEGUNG</span>
                <span style="font-family: 'IM Fell English SC', serif; font-size: 13px; font-weight: bold; color: var(--red); line-height: 1;">30 ft.</span>
              </div>
            </div>
          </div>

          <!-- Attributes Grid -->
          <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 2.5px; background: rgba(0,0,0,0.02); padding: 4px 3px; border-radius: 2px; border: 0.5px dashed rgba(200, 169, 110, 0.25);">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 6px; font-weight: bold; color: var(--inkl);">STR</span>
              <span style="font-size: 8px; font-weight: bold; color: var(--red);">${str}</span>
              <span style="font-size: 6.5px; color: var(--inkl); font-style: italic;">${formatMod(getAblMod(str))}</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 6px; font-weight: bold; color: var(--inkl);">DEX</span>
              <span style="font-size: 8px; font-weight: bold; color: var(--red);">${dex}</span>
              <span style="font-size: 6.5px; color: var(--inkl); font-style: italic;">${formatMod(getAblMod(dex))}</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 6px; font-weight: bold; color: var(--inkl);">CON</span>
              <span style="font-size: 8px; font-weight: bold; color: var(--red);">${con}</span>
              <span style="font-size: 6.5px; color: var(--inkl); font-style: italic;">${formatMod(getAblMod(con))}</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 6px; font-weight: bold; color: var(--inkl);">INT</span>
              <span style="font-size: 8px; font-weight: bold; color: var(--red);">2</span>
              <span style="font-size: 6.5px; color: var(--inkl); font-style: italic;">-4</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 6px; font-weight: bold; color: var(--inkl);">WIS</span>
              <span style="font-size: 8px; font-weight: bold; color: var(--red);">${wis}</span>
              <span style="font-size: 6.5px; color: var(--inkl); font-style: italic;">${formatMod(getAblMod(wis))}</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span style="font-size: 6px; font-weight: bold; color: var(--inkl);">CHA</span>
              <span style="font-size: 8px; font-weight: bold; color: var(--red);">${cha}</span>
              <span style="font-size: 6.5px; color: var(--inkl); font-style: italic;">${formatMod(getAblMod(cha))}</span>
            </div>
          </div>

          <!-- Attacks & Actions Section -->
          <div style="display: flex; flex-direction: column; gap: 3.5px; margin-top: 2px;">
            <div style="font-family: 'IM Fell English SC', serif; font-size: 7.5px; color: var(--red); border-bottom: 0.5px solid var(--pb); padding-bottom: 1px; font-weight: bold;">
              ⚔️ Angriffe des Begleiters
            </div>
            <div style="display: flex; flex-direction: column; gap: 3.5px;">
              ${attackListHtml || '<div style="font-size:7px; color:var(--inkl); font-style:italic; text-align:center;">Keine Angriffe verfügbar</div>'}
            </div>
          </div>

          <!-- Rules Summary Footer -->
          ${baseStats && baseStats.specials ? `
            <div style="background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); border-radius: 2px; padding: 4.5px; font-size: 6.8px; color: var(--ink); line-height: 1.25;">
              🐾 <strong>Besondere Eigenschaften:</strong> ${baseStats.specials}<br>
              <span style="font-size: 6px; color: var(--inkl); font-style: italic;">(Basiert auf den RAW-Regeln von D&amp;D 3.5e für Tierbegleiter).</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
        <div style="font-family: 'IM Fell English SC', serif; font-size: 9px; color: var(--red); font-weight: bold; border-bottom: 1px solid var(--pb); padding-bottom: 3px; display: flex; justify-content: space-between; align-items: center; letter-spacing: 0.5px;">
          <span>🐾 Gefährten- &amp; Tierbegleiter-Bogen (Begleiter-Stufe: ${effectiveDruidLvl})</span>
          <span style="font-size: 6.5px; color: var(--inkl); font-weight: normal; font-style: italic;">D&amp;D 3.5e Rules</span>
        </div>
        ${contentHtml}
      </div>
    `;
  }

  static bindEvents(pc, container, triggerRender) {
    // Companion species selector changes
    const select = container.querySelector('.companion-species-select');
    if (select) {
      select.onchange = (e) => {
        const val = e.target.value;
        const activePC = CombatState.getActivePC();
        activePC.companionType = val;
        
        if (val !== 'none') {
          const base = this.getCompanionBaseStats(val, activePC.level);
          if (base) {
            activePC.companionName = base.name;
            activePC.companionMaxHP = base.maxHP;
            activePC.companionHP = base.maxHP;
          }
        } else {
          activePC.companionName = '';
          activePC.companionMaxHP = 0;
          activePC.companionHP = 0;
        }

        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    // Companion name field updates
    const nameField = container.querySelector('.companion-name-field');
    if (nameField) {
      nameField.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        activePC.companionName = e.target.value;
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
      };
    }

    // HP Tracker inputs and buttons
    const curHpInp = container.querySelector('.companion-hp-cur-field');
    if (curHpInp) {
      curHpInp.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        const val = parseInt(e.target.value) || 0;
        activePC.companionHP = Math.max(0, Math.min(activePC.companionMaxHP, val));
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    const maxHpInp = container.querySelector('.companion-hp-max-field');
    if (maxHpInp) {
      maxHpInp.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        const val = parseInt(e.target.value) || 1;
        activePC.companionMaxHP = val;
        activePC.companionHP = Math.min(activePC.companionHP, val);
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    // HP plus/minus adjustment buttons
    container.querySelectorAll('.companion-hp-adjust-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const dir = parseInt(btn.dataset.dir);
        const activePC = CombatState.getActivePC();
        activePC.companionHP = Math.max(0, Math.min(activePC.companionMaxHP, (activePC.companionHP || 0) + dir));
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    });

    // Roll animal companion attack trigger
    container.querySelectorAll('.roll-companion-attack-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const attName = btn.dataset.name;
        const bonus = parseInt(btn.dataset.bonus) || 0;
        const damage = btn.dataset.damage;
        const note = btn.dataset.note;

        const activePC = CombatState.getActivePC();

        showRollBreakdown(`${activePC.companionName || 'Tierbegleiter'} - ${attName}`, `1W20`, [
          { label: "Angriffsbonus", value: bonus }
        ], e, (rollVal) => {
          // Trigger a beautiful, premium combat action banner!
          showCustomConfirm("Angriff ausgeführt! ⚔️", `
            <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
              <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
                ${activePC.companionName || 'Tierbegleiter'} greift an!
              </div>
              • <strong>Angriffs-Typ:</strong> ${attName}<br>
              • <strong>Angriffswurf:</strong> <span style="color:var(--red); font-weight:bold; font-size:10.5px;">${rollVal + bonus}</span> <span style="font-size:7px; color:var(--inkl); font-style:italic;">(Gewürfelt: ${rollVal} + ${bonus})</span><br>
              • <strong>Waffenschaden:</strong> <span style="color:var(--red); font-weight:bold; font-size:10.5px;">${damage}</span><br>
              ${note ? `• <strong>Bonus-Effekt:</strong> ${note}<br>` : ''}
              <br>
              <div style="font-size: 7.2px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px; border-radius: 2px; line-height: 1.2;">
                Tabelle prüft: Trifft Angriffswurf <span style="color:var(--red);">${rollVal + bonus}</span> gegen Rüstungsklasse (AC) des Gegners? Falls ja, würfle physischen Schaden von <span style="color:var(--red);">${damage}</span> aus!
              </div>
            </div>
          `, () => {});
        });
      };
    });
  }
}
