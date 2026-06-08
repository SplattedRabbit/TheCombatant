import { CombatState } from '../../state.js';
import { showRollBreakdown, showCustomConfirm, showCustomAlert } from './dialogs.js';

export class FamiliarSheet {
  static getFamiliarBaseStats(type) {
    const stats = {
      bat: { name: 'Fledermaus', ac: 16, str: 1, dex: 15, con: 10, wis: 14, cha: 4, bonus: '+3 auf Lauschen', specials: 'Blindsinn 40 ft., Fliegen 40 ft. (gut)' },
      cat: { name: 'Katze', ac: 15, str: 3, dex: 15, con: 10, wis: 12, cha: 7, bonus: '+3 auf Leise bewegen', specials: 'Nachtsicht, Dämmersicht, Klettern +10' },
      hawk: { name: 'Falke', ac: 17, str: 6, dex: 17, con: 10, wis: 14, cha: 6, bonus: '+3 auf Entdecken in hellem Licht', specials: 'Fliegen 60 ft. (durchschnittlich), Dämmersicht' },
      lizard: { name: 'Eidechse', ac: 14, str: 3, dex: 15, con: 10, wis: 12, cha: 2, bonus: '+3 auf Klettern', specials: 'Klettern +10, Dämmersicht' },
      owl: { name: 'Eule', ac: 17, str: 6, dex: 17, con: 10, wis: 14, cha: 6, bonus: '+3 auf Entdecken in Schatten', specials: 'Fliegen 40 ft. (gut), Dämmersicht, leiser Flug (+8 auf Leise bewegen)' },
      rat: { name: 'Ratte', ac: 14, str: 2, dex: 15, con: 10, wis: 12, cha: 2, bonus: '+2 auf Zähigkeitsrettungswürfe', specials: 'Schwimmen +8, Klettern +10, Dämmersicht, Geruchssinn' },
      raven: { name: 'Rabe', ac: 14, str: 1, dex: 15, con: 10, wis: 14, cha: 6, bonus: '+3 auf Schätzen', specials: 'Fliegen 40 ft. (durchschnittlich), spricht eine Sprache' },
      snake: { name: 'Schlange (Tiny Viper)', ac: 17, str: 4, dex: 17, con: 11, wis: 12, cha: 2, bonus: '+3 auf Bluffen', specials: 'Gift (Fort SG 10, 1d6 Kon / 1d6 Kon), Dämmersicht' },
      toad: { name: 'Kröte', ac: 16, str: 1, dex: 12, con: 11, wis: 14, cha: 4, bonus: '+3 Trefferpunkte', specials: 'Dämmersicht, Weitsprung' },
      weasel: { name: 'Wiesel', ac: 14, str: 3, dex: 15, con: 10, wis: 12, cha: 5, bonus: '+2 auf Reflexrettungswürfe', specials: 'Festhalten (Attach), Geruchssinn, Dämmersicht' }
    };
    return stats[type] || null;
  }

  static getFamiliarAttacks(type, masterBab, str, dex) {
    const strMod = Math.floor((str - 10) / 2);
    const dexMod = Math.floor((dex - 10) / 2);
    const useMod = Math.max(strMod, dexMod);
    
    // Size modifiers: Diminutive = +4, Tiny = +2
    const sizeMod = (type === 'bat' || type === 'toad') ? 4 : 2;
    const bonus = masterBab + useMod + sizeMod;

    switch (type) {
      case 'bat':
        return [{ name: 'Biss (Fledermaus)', bonus, damage: '1' }];
      case 'cat':
        return [
          { name: 'Kralle (Katze)', bonus, damage: '1d2' + (strMod >= 0 ? '+' + strMod : strMod) },
          { name: 'Biss (Katze)', bonus: bonus - 5, damage: '1d3' + (strMod >= 0 ? '+' + strMod : strMod) }
        ];
      case 'hawk':
        return [{ name: 'Krallen (Falke)', bonus, damage: '1d4' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'lizard':
        return [{ name: 'Biss (Eidechse)', bonus, damage: '1d4' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'owl':
        return [{ name: 'Krallen (Eule)', bonus, damage: '1d4' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'rat':
        return [{ name: 'Biss (Ratte)', bonus, damage: '1d3' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'raven':
        return [{ name: 'Krallen (Rabe)', bonus, damage: '1d2' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'snake':
        return [{ name: 'Biss (Schlange)', bonus, damage: '1d2' + (strMod >= 0 ? '+' + strMod : strMod), note: 'Gift (injury, Fort SG 10, 1d6 Kon / 1d6 Kon)' }];
      case 'weasel':
        return [{ name: 'Biss (Wiesel)', bonus, damage: '1d3' + (strMod >= 0 ? '+' + strMod : strMod), note: 'Festhalten (Attach)' }];
      default:
        return [];
    }
  }

  static render(pc) {
    const type = pc.familiarType || 'none';
    const name = pc.familiarName || '';
    const classes = Array.isArray(pc.classes) ? pc.classes : [];
    const wizClass = classes.find(c => c.classType === 'wizard');
    const sorcClass = classes.find(c => c.classType === 'sorcerer');
    
    let effectiveFamiliarLvl = 0;
    if (wizClass) effectiveFamiliarLvl += wizClass.level;
    if (sorcClass) effectiveFamiliarLvl += sorcClass.level;
    
    if (effectiveFamiliarLvl === 0 && (pc.classType === 'wizard' || pc.classType === 'sorcerer')) {
      effectiveFamiliarLvl = pc.level;
    }
    if (effectiveFamiliarLvl === 0) {
      effectiveFamiliarLvl = 1;
    }

    const maxHP = Math.floor(pc.maxHP / 2);
    const curHP = pc.familiarHP !== undefined ? Math.min(maxHP, pc.familiarHP) : maxHP;

    const baseStats = this.getFamiliarBaseStats(type);

    let contentHtml = '';

    if (type === 'none') {
      contentHtml = `
        <div style="font-size: 8.5px; color: var(--inkl); font-style: italic; text-align: center; padding: 45px 15px; background: rgba(0,0,0,0.02); border: 0.5px dashed var(--pb); border-radius: 2px;">
          🦇 Du hast aktuell keinen aktiven Vertrauten ausgewählt.<br>
          <span style="font-size: 7.5px; margin-top: 3px; display: block;">Wähle unten eine Kreaturenart aus, um deinen Vertrauten zu rufen!</span>
          
          <div style="margin-top: 10px; display: flex; justify-content: center;">
            <select class="cinput familiar-species-select" style="font-size: 8px; height: 16px; padding: 0 4px; width: 120px;">
              <option value="none">-- Auswählen --</option>
              <option value="bat">🦇 Fledermaus (+3 Lauschen)</option>
              <option value="cat">🐈 Katze (+3 Leise bewegen)</option>
              <option value="hawk">🦅 Falke (+3 Entdecken in hellem Licht)</option>
              <option value="lizard">🦎 Eidechse (+3 Klettern)</option>
              <option value="owl">🦉 Eule (+3 Entdecken in Schatten)</option>
              <option value="rat">🐀 Ratte (+2 Zähigkeits-Rettungswurf)</option>
              <option value="raven">🐦 Rabe (+3 Schätzen / spricht Sprache)</option>
              <option value="snake">🐍 Schlange (+3 Bluffen)</option>
              <option value="toad">🐸 Kröte (+3 Trefferpunkte)</option>
              <option value="weasel">🦦 Wiesel (+2 Reflex-Rettungswurf)</option>
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

      const str = baseStats ? baseStats.str : 10;
      const dex = baseStats ? baseStats.dex : 10;
      const con = baseStats ? baseStats.con : 10;
      const wis = baseStats ? baseStats.wis : 10;
      const cha = baseStats ? baseStats.cha : 10;

      // Natural Armor & Int calculations
      const natArmor = 1 + Math.floor((effectiveFamiliarLvl - 1) / 2);
      const displayAC = (baseStats ? baseStats.ac : 10) + natArmor;
      const displayInt = Math.min(15, 5 + Math.ceil(effectiveFamiliarLvl / 2));

      const pct = maxHP > 0 ? Math.max(0, Math.min(100, Math.floor((curHP / maxHP) * 100))) : 0;
      const fc = curHP <= 0 ? 'fill-dead' : (pct > 50 ? 'fill-ok' : (pct > 25 ? 'fill-warn' : 'fill-crit'));

      // Calculate saving throws (max of master base or 2/0, plus familiar ability modifiers)
      const masterFort = pc.baseZa ? pc.baseZa.base : 0;
      const masterRef = pc.baseRef ? pc.baseRef.base : 0;
      const masterWil = pc.baseWil ? pc.baseWil.base : 0;

      const famFort = Math.max(masterFort, 2) + getAblMod(con);
      const famRef = Math.max(masterRef, 2) + getAblMod(dex);
      const famWil = Math.max(masterWil, 0) + getAblMod(wis);

      // Generate attack html
      const masterBab = pc.bab ? pc.bab.base : 0;
      const attacks = this.getFamiliarAttacks(type, masterBab, str, dex);
      let attackListHtml = '';
      if (attacks.length > 0) {
        attackListHtml = attacks.map((att, idx) => {
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.3); border: 0.5px solid rgba(200, 169, 110, 0.25); border-radius: 2px; padding: 4px 6px; font-size: 8px;">
              <div>
                <strong>${att.name}:</strong> 
                <span style="color: var(--red); font-weight: bold;">${formatMod(att.bonus)}</span> (${att.damage})
                ${att.note ? `<br><span style="font-size: 6.8px; color: var(--inkl); font-style: italic;">• ${att.note}</span>` : ''}
              </div>
              <button class="btn roll-familiar-attack-btn" data-name="${att.name}" data-bonus="${att.bonus}" data-damage="${att.damage}" data-note="${att.note || ''}" style="font-size: 7.5px; padding: 2px 6px; font-weight: bold; cursor: pointer; border-radius: 2px;">Würfeln 🎲</button>
            </div>
          `;
        }).join('');
      }

      // Special abilities list
      let specialsList = ['Wachsamkeit (Alertness)', 'Verbessertes Entrinnen (Improved Evasion)', 'Zauber teilen (Share Spells)', 'Empathische Verbindung (Empathic Link)'];
      if (effectiveFamiliarLvl >= 3) specialsList.push('Kontaktzauber übertragen (Deliver touch spells)');
      if (effectiveFamiliarLvl >= 5) specialsList.push('Mit Meister sprechen (Speak with master)');
      if (effectiveFamiliarLvl >= 7) specialsList.push('Mit Tieren seiner Art sprechen (Speak with animals)');
      if (effectiveFamiliarLvl >= 11) specialsList.push(`Zauberresistenz (SR ${effectiveFamiliarLvl + 5})`);
      if (effectiveFamiliarLvl >= 13) specialsList.push('Hellsehen (Scry on familiar)');

      contentHtml = `
        <div style="display: flex; flex-direction: column; gap: 6px; background: rgba(200, 169, 110, 0.04); border: 0.5px solid var(--pb); border-radius: 3px; padding: 6px;">
          <!-- Familiar Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--pb); padding-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 11px;">🦇</span>
              <input type="text" class="familiar-name-field" value="${name}" placeholder="Name deines Vertrauten" style="font-family: 'IM Fell English SC', serif; font-size: 11px; font-weight: bold; color: var(--red); background: transparent; border: none; border-bottom: 0.5px dashed var(--pb); outline: none; width: 120px;" title="Vertrauens-Name">
            </div>
            
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 7.5px; color: var(--inkl); font-style: italic;">Art:</span>
              <select class="cinput familiar-species-select" style="font-size: 7.5px; height: 14px; padding: 0; width: 75px; margin: 0;">
                <option value="bat" ${type === 'bat' ? 'selected' : ''}>Fledermaus</option>
                <option value="cat" ${type === 'cat' ? 'selected' : ''}>Katze</option>
                <option value="hawk" ${type === 'hawk' ? 'selected' : ''}>Falke</option>
                <option value="lizard" ${type === 'lizard' ? 'selected' : ''}>Eidechse</option>
                <option value="owl" ${type === 'owl' ? 'selected' : ''}>Eule</option>
                <option value="rat" ${type === 'rat' ? 'selected' : ''}>Ratte</option>
                <option value="raven" ${type === 'raven' ? 'selected' : ''}>Rabe</option>
                <option value="snake" ${type === 'snake' ? 'selected' : ''}>Schlange</option>
                <option value="toad" ${type === 'toad' ? 'selected' : ''}>Kröte</option>
                <option value="weasel" ${type === 'weasel' ? 'selected' : ''}>Wiesel</option>
                <option value="none">-- Entlassen --</option>
              </select>
            </div>
          </div>

          <!-- HP & AC Row -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: center;">
            <!-- Health Bar Widget (Always Half of Master Max HP) -->
            <div style="display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200,169,110,0.15); padding: 4px; border-radius: 2px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%); border: 1.2px solid var(--red); display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'IM Fell English SC', serif; color: var(--red); font-size: 9px; font-weight: bold;">
                <span style="font-size: 5px; color: var(--inkl); line-height: 1; margin-top: 1px;">TP</span>
                <span style="line-height: 1.1; font-size: 10px;">${curHP}</span>
              </div>
              <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                <div style="display: flex; justify-content: space-between; font-size: 7px; font-weight: bold; color: var(--inkm);">
                  <span>Vertrauten-TP</span>
                  <span>${pct}%</span>
                </div>
                <div style="height: 6px; background: rgba(0,0,0,0.15); border-radius: 1.5px; overflow: hidden; border: 0.5px solid var(--pb);">
                  <div class="hp-bar-fill ${fc}" style="width: ${pct}%; height: 100%; transition: width 0.2s;"></div>
                </div>
                <div style="display: flex; gap: 2px; align-items: center; margin-top: 1px;">
                  <button class="btn familiar-hp-adjust-btn" data-dir="-1" style="font-size: 7px; padding: 0 4px; line-height: 1; height: 12px; font-weight: bold;">-</button>
                  <input type="number" class="familiar-hp-cur-field" value="${curHP}" style="width: 18px; font-size: 7.5px; text-align: center; height: 12px; padding: 0; border-radius: 1px; border: 0.5px solid var(--pb);" title="Aktuelle TP direkt ändern">
                  <span style="font-size: 7.5px;">/ ${maxHP}</span>
                  <button class="btn familiar-hp-adjust-btn" data-dir="1" style="font-size: 7px; padding: 0 4px; line-height: 1; height: 12px; font-weight: bold;">+</button>
                </div>
              </div>
            </div>

            <!-- AC & Saving Throws -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div style="display: flex; flex-direction: column; background: rgba(200, 169, 110, 0.1); border: 0.5px solid var(--pb); border-radius: 2px; padding: 3px; align-items: center; justify-content: center;">
                <span style="font-size: 6.8px; font-weight: bold; color: var(--inkl);">🛡️ RÜSTUNGSKL.</span>
                <span style="font-family: 'IM Fell English SC', serif; font-size: 14px; font-weight: bold; color: var(--red); line-height: 1;">${displayAC}</span>
                <span style="font-size: 5px; color: var(--inkl); font-style: italic;">(+${natArmor} Nat.)</span>
              </div>
              <div style="display: flex; flex-direction: column; background: rgba(200, 169, 110, 0.1); border: 0.5px solid var(--pb); border-radius: 2px; padding: 3px; align-items: center; justify-content: center; gap: 1px;">
                <span style="font-size: 5.5px; font-weight: bold; color: var(--inkl); line-height: 1;">RETTUNGSWÜRFE</span>
                <div style="font-size: 7px; font-weight: bold; color: var(--red); line-height: 1;">
                  ZÄ: ${formatMod(famFort)}<br>
                  RE: ${formatMod(famRef)}<br>
                  WI: ${formatMod(famWil)}
                </div>
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
              <span style="font-size: 8px; font-weight: bold; color: var(--red);">${displayInt}</span>
              <span style="font-size: 6.5px; color: var(--inkl); font-style: italic;">${formatMod(getAblMod(displayInt))}</span>
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
          ${attackListHtml ? `
            <div style="display: flex; flex-direction: column; gap: 3.5px; margin-top: 2px;">
              <div style="font-family: 'IM Fell English SC', serif; font-size: 7.5px; color: var(--red); border-bottom: 0.5px solid var(--pb); padding-bottom: 1px; font-weight: bold;">
                ⚔️ Angriffe des Vertrauten
              </div>
              <div style="display: flex; flex-direction: column; gap: 3.5px;">
                ${attackListHtml}
              </div>
            </div>
          ` : ''}

          <!-- Rules Summary Footer -->
          <div style="background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); border-radius: 2px; padding: 4.5px; font-size: 6.8px; color: var(--ink); line-height: 1.25;">
            🔮 <strong>Gewährter Meister-Bonus:</strong> <span style="color: var(--red); font-weight: bold;">${baseStats.bonus}</span><br>
            🐾 <strong>Spezielle Eigenschaften:</strong> ${specialsList.join(', ')}<br>
            <span style="font-size: 6px; color: var(--inkl); font-style: italic;">(Basiert auf den RAW-Regeln von D&amp;D 3.5e für Vertraute).</span>
          </div>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
        <div style="font-family: 'IM Fell English SC', serif; font-size: 9px; color: var(--red); font-weight: bold; border-bottom: 1px solid var(--pb); padding-bottom: 3px; display: flex; justify-content: space-between; align-items: center; letter-spacing: 0.5px;">
          <span>🦇 Vertrauten-Bogen (Effektive Magier/Hexenmeister-Stufe: ${effectiveFamiliarLvl})</span>
          <span style="font-size: 6.5px; color: var(--inkl); font-weight: normal; font-style: italic;">D&amp;D 3.5e Rules</span>
        </div>
        ${contentHtml}
      </div>
    `;
  }

  static bindEvents(pc, container, triggerRender) {
    // Familiar species select handler
    const select = container.querySelector('.familiar-species-select');
    if (select) {
      select.onchange = (e) => {
        const val = e.target.value;
        const activePC = CombatState.getActivePC();
        const oldType = activePC.familiarType || 'none';
        if (oldType === val) return;

        // Confirm dismiss or replace rules
        const applySpeciesChange = () => {
          CombatState.updatePCBatch(freshPC => {
            // Remove old toad HP bonus
            if (oldType === 'toad') {
              freshPC.maxHP = Math.max(1, freshPC.maxHP - 3);
              freshPC.hp = Math.max(0, freshPC.hp - 3);
            }
            // Apply new toad HP bonus
            if (val === 'toad') {
              freshPC.maxHP += 3;
              freshPC.hp += 3;
            }

            freshPC.familiarType = val;

            if (val !== 'none') {
              const base = this.getFamiliarBaseStats(val);
              if (base) {
                freshPC.familiarName = base.name;
                freshPC.familiarHP = Math.floor(freshPC.maxHP / 2);
              }
            } else {
              freshPC.familiarName = '';
              freshPC.familiarHP = 0;
            }
          });
          triggerRender();
        };

        if (oldType !== 'none' && val === 'none') {
          showCustomConfirm("Vertrauten entlassen?", `Möchtest du deinen Vertrauten entlassen? Dies verlangt laut RAW einen Rettungswurf wegen Erfahrungspunktverlust!`, () => {
            applySpeciesChange();
          });
        } else {
          applySpeciesChange();
        }
      };
    }

    // Name field update
    const nameField = container.querySelector('.familiar-name-field');
    if (nameField) {
      nameField.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        activePC.familiarName = e.target.value;
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
      };
    }

    // Familiar current HP direct update
    const curHpInp = container.querySelector('.familiar-hp-cur-field');
    if (curHpInp) {
      curHpInp.onchange = (e) => {
        const activePC = CombatState.getActivePC();
        const val = parseInt(e.target.value) || 0;
        const maxHP = Math.floor(activePC.maxHP / 2);
        activePC.familiarHP = Math.max(0, Math.min(maxHP, val));
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    }

    // HP buttons adjustments
    container.querySelectorAll('.familiar-hp-adjust-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const dir = parseInt(btn.dataset.dir);
        const activePC = CombatState.getActivePC();
        const maxHP = Math.floor(activePC.maxHP / 2);
        activePC.familiarHP = Math.max(0, Math.min(maxHP, (activePC.familiarHP || 0) + dir));
        CombatState.saveToStorage();
        CombatState.syncPCToHost();
        triggerRender();
      };
    });

    // Roll familiar attack triggers
    container.querySelectorAll('.roll-familiar-attack-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const attName = btn.dataset.name;
        const bonus = parseInt(btn.dataset.bonus) || 0;
        const damage = btn.dataset.damage;
        const note = btn.dataset.note;

        const activePC = CombatState.getActivePC();

        showRollBreakdown(`${activePC.familiarName || 'Vertrauter'} - ${attName}`, `1W20`, [
          { label: "Angriffsbonus", value: bonus }
        ], e, (rollVal) => {
          showCustomConfirm("Angriff ausgeführt! ⚔️", `
            <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
              <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
                ${activePC.familiarName || 'Vertrauter'} greift an!
              </div>
              • <strong>Angriffs-Typ:</strong> ${attName}<br>
              • <strong>Angriffswurf:</strong> <span style="color:var(--red); font-weight:bold; font-size:10.5px;">${rollVal + bonus}</span> <span style="font-size:7px; color:var(--inkl); font-style:italic;">(Gewürfelt: ${rollVal} + ${bonus})</span><br>
              • <strong>Waffenschaden:</strong> <span style="color:var(--red); font-weight:bold; font-size:10.5px;">${damage}</span><br>
              ${note ? `• <strong>Zusatz-Effekt:</strong> ${note}<br>` : ''}
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
