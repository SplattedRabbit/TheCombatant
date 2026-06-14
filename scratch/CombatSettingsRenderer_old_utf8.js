/**
 * @module    CombatSettingsRenderer
 * @summary   Rendert und bindet Events f├╝r globale Kampfeinstellungen (Heftiger Angriff, Kampfget├╝mmel etc.).
 * @exports   renderCombatSettingsHtml, bindCombatSettingsEvents
 * @reads     pc.feats, pc.powerAttackPenalty, pc.combatExpertisePenalty, pc.isDefensiveFighting, pc.isTotalDefense
 * @stateOps  updatePCField, togglePCDefensiveFighting, togglePCTotalDefense
 * @depends   state.js (CombatState), ui-shared.js (uiRegistry), dialogs.js (showCustomAlert)
 * @notHere   Waffenslots -> EquipmentSlotsRenderer.js | Rucksack -> InventoryStashRenderer.js
 */

import { CombatState } from '../../../../state.js';
import { uiRegistry } from '../../../ui-shared.js';
import { showCustomAlert } from '../../dialogs.js';

export function renderCombatSettingsHtml(pc, babVal, paPenalty, cePenalty, hasPowerAttack, hasCombatExpertise) {
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const paladinLvl = (activeClasses.find(c => c.classType === 'paladin') || {}).level || 0;
  const rangerLvl = (activeClasses.find(c => c.classType === 'ranger') || {}).level || 0;
  const rogueLvl = (activeClasses.find(c => c.classType === 'rogue') || {}).level || 0;

  return `
      <!-- Combat Settings -->
      ${hasPowerAttack ? `
        <div style="background: rgba(139, 26, 26, 0.05); border: 0.5px solid var(--pb); border-radius: 3px; padding: 4px 8px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 8.5px;">
          <span style="color: var(--red); font-weight: bold;">ÔÜö´©Å Heftiger Angriff (Power Attack)</span>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="color: var(--inkm); font-size: 7.5px;">Malus (Max ${babVal}):</span>
            <input type="number" class="cinput power-attack-input" min="0" max="${babVal}" value="${paPenalty}" style="width: 35px; font-size: 8px; text-align: center; height: 16px; padding: 0;">
          </div>
        </div>
      ` : ''}
      ${hasCombatExpertise ? `
        <div style="background: rgba(42, 106, 138, 0.05); border: 0.5px solid var(--pb); border-radius: 3px; padding: 4px 8px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 8.5px;">
          <span style="color: #2a6a8a; font-weight: bold; display: flex; align-items: center;">
            ­ƒøí´©Å Kampfget├╝mmel (Combat Expertise)
            <button class="btn-rule-ce" style="background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); padding: 1px 4px; cursor: pointer; font-size: 8px; color: var(--pb); height: 14px; border-radius: 1.5px; display: inline-flex; align-items: center; justify-content: center; line-height: 10px; margin-left: 4px;" title="Regeln anzeigen">­ƒôû Ôåù</button>
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
            ÔÜö´©Å Verteidigend k├ñmpfen (-4 Atk / +RK)
          </label>
          <button class="btn-rule-df" style="background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); padding: 1px 4px; cursor: pointer; font-size: 8px; color: var(--pb); height: 14px; border-radius: 1.5px; display: inline-flex; align-items: center; justify-content: center; line-height: 10px; margin-left: 4px;" title="Regeln anzeigen">­ƒôû Ôåù</button>
        </div>
        <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: var(--inkm); margin: 0; font-weight: bold;">
          <input type="checkbox" class="total-defense-input" ${pc.isTotalDefense ? 'checked' : ''} style="margin: 0; width: 10px; height: 10px;">
          ­ƒøí´©Å Volle Abwehr (+RK / keine Angr.)
        </label>
      </div>

      <!-- Class Specific Combat Toggles -->
      ${(paladinLvl >= 1 || rangerLvl >= 1 || rogueLvl >= 1) ? `
        <div style="background: rgba(200, 169, 110, 0.05); border: 0.5px solid var(--pb); border-radius: 3px; padding: 4px 8px; margin-bottom: 4px; display: flex; gap: 10px; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 8px; justify-content: flex-start; flex-wrap: wrap;">
          ${paladinLvl >= 1 ? `
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: var(--red); margin: 0; font-weight: bold;">
              <input type="checkbox" class="smite-toggle-input" ${pc.isSmiteActive ? 'checked' : ''} style="margin: 0; width: 10px; height: 10px;">
              ­ƒîƒ B├Âses niederstrecken (Smite)
            </label>
          ` : ''}
          ${rangerLvl >= 1 ? `
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: var(--inkm); margin: 0; font-weight: bold;">
              <input type="checkbox" class="favored-enemy-toggle-input" ${pc.isFavoredEnemyActive ? 'checked' : ''} style="margin: 0; width: 10px; height: 10px;">
              ­ƒÅ╣ Gegen Erzfeind (+X Schaden)
            </label>
          ` : ''}
          ${rogueLvl >= 1 ? `
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: var(--inkm); margin: 0; font-weight: bold;">
              <input type="checkbox" class="sneak-attack-toggle-input" ${pc.isSneakAttacking ? 'checked' : ''} style="margin: 0; width: 10px; height: 10px;">
              ­ƒùí´©Å Hinterh├ñltiger Angriff
            </label>
          ` : ''}
        </div>
      ` : ''}

      ${pc.isTotalDefense ? `
        <div style="background: rgba(139, 26, 26, 0.08); border: 0.5px solid var(--red); border-radius: 3px; padding: 4px 8px; margin-bottom: 4px; text-align: center; color: var(--red); font-family: 'IM Fell English SC', serif; font-size: 8px; font-weight: bold;">
          ­ƒøí´©Å Volle Abwehr aktiv ÔÇö keine Angriffe m├Âglich!
        </div>
      ` : ''}

      <!-- Regelwerk-Referenz Guide -->
      <div style="margin-top: 10px; border-top: 1px double var(--pb); padding-top: 8px;">
        <div style="font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
          ­ƒô£ Regelwerk-Referenz (D&D 3.5 RAW)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 7.5px; font-family: 'Crimson Text', serif; line-height: 1.25; color: var(--ink);">
          
          <!-- Waffen-Eigenschaften Column -->
          <div style="background: rgba(200, 169, 110, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.15); border-radius: 3px; padding: 5px;">
            <div style="font-weight: bold; color: var(--red); border-bottom: 0.5px solid rgba(200, 169, 110, 0.2); margin-bottom: 4px; padding-bottom: 1px; font-family: 'IM Fell English SC', serif; font-size: 8px;">ÔÜö´©Å Waffen-Werte</div>
            <ul style="margin: 0; padding-left: 10px; display: flex; flex-direction: column; gap: 3px; list-style-type: square;">
              <li><strong>Zusatz-Atk:</strong> Manueller Bonus auf Angriffe (z.B. durch <em>Waffenfokus</em> <code>+1</code>, Magie oder Meisterarbeit).</li>
              <li><strong>Scharf (Keen):</strong> Verdoppelt den kritischen Bedrohungsbereich (z.B. 19-20 wird zu 17-20). Stackt <u>nicht</u> mit dem Talent <em>Verbesserter Kritischer Treffer</em>.</li>
              <li><strong>Grip-Abw. (H├ñndigkeit):</strong> ├£berschreibt die Trageweise: Einh├ñndig (1H), Zweih├ñndig (2H: gew├ñhrt 1.5x St├ñrkebonus auf Schaden), Schildhand (Sec: Zweitwaffe), Fernkampf (Rng) oder Waffenlos (Unarmed).</li>
              <li><strong>Schadens-Abw.:</strong> ├£berschreibt den Basis-Schadensw├╝rfel der Waffe (z.B. <code>1w8</code>, <code>2w6</code>).</li>
              <li><strong>Krit-Abw.:</strong> ├£berschreibt den kritischen Multiplikator und Bedrohungsbereich (z.B. <code>20 / x3</code>).</li>
            </ul>
          </div>
          
          <!-- R├╝stungs-Eigenschaften Column -->
          <div style="background: rgba(200, 169, 110, 0.02); border: 0.5px solid rgba(200, 169, 110, 0.15); border-radius: 3px; padding: 5px;">
            <div style="font-weight: bold; color: var(--red); border-bottom: 0.5px solid rgba(200, 169, 110, 0.2); margin-bottom: 4px; padding-bottom: 1px; font-family: 'IM Fell English SC', serif; font-size: 8px;">­ƒøí´©Å R├╝stungs-Werte</div>
            <ul style="margin: 0; padding-left: 10px; display: flex; flex-direction: column; gap: 3px; list-style-type: square;">
              <li><strong>RK-Abw.:</strong> ├£berschreibt den R├╝stungsbonus. Keine R├╝stungsboni stacken (z.B. Magische R├╝stung und Zauber <em>Mage Armor</em>).</li>
              <li><strong>MaxDex (Max. Geschick):</strong> Begrenzt den Geschicklichkeitsbonus auf die R├╝stungsklasse (RK), da schwere R├╝stung die Ausweichf├ñhigkeit einschr├ñnkt.</li>
              <li><strong>Malus-Abw.:</strong> R├╝stungsmalus auf Fertigkeiten f├╝r St├ñrke und Geschicklichkeit (Akrobatik, Klettern etc.). Doppelt beim Schwimmen.</li>
              <li><strong>Zauberpatzer-Abw.:</strong> Prozentuale Chance, dass ein arkaner Gestenzauber (Somatic) fehlschl├ñgt. Gilt nicht f├╝r g├Âttliche Magie.</li>
            </ul>
          </div>
          
        </div>
      </div>
  `;
}

export function bindCombatSettingsEvents(offense, pc, babVal, hasPowerAttack, hasCombatExpertise) {
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
          "Kampfget├╝mmel (Combat Expertise)",
          `
          <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
            <p><strong>Konzept:</strong> Du kannst deine offensive Genauigkeit opfern, um eine st├ñrkere R├╝stungsklasse aufzubauen.</p>
            <p><strong>Regel (D&D 3.5 RAW):</strong> Wenn du einen Angriff oder einen vollen Angriff deklarierst, kannst du einen Malus auf deine Angriffsw├╝rfe (bis zu deinem aktuellen GAB, maximal jedoch -5) w├ñhlen. Dieser Malus wird als Ausweichbonus (Dodge) auf deine R├╝stungsklasse (RK) und Ber├╝hrungs-RK bis zu deiner n├ñchsten Runde addiert.</p>
            <p><strong>Obergrenzen:</strong> Der gew├ñhlte Malus darf deinen Grundangriffsbonus (GAB) nicht ├╝berschreiten und ist generell durch das Talent auf maximal -5 begrenzt.</p>
          </div>
          `,
          "Verstanden",
          "­ƒøí´©Å"
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
        "Verteidigend k├ñmpfen (Defensive Fighting)",
        `
        <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
          <p><strong>Konzept:</strong> Ein grundlegendes Kampfman├Âver, das jeder Charakter im Nahkampf (auch ohne spezielle Talente) ausf├╝hren kann.</p>
          <p><strong>Regel (D&D 3.5 RAW):</strong> Wenn du angreifst (als Standardaktion oder voller Angriff), kannst du dich entscheiden, verteidigend zu k├ñmpfen. Du erleidest einen Malus von <strong>-4</strong> auf alle Angriffsw├╝rfe in dieser Runde, erh├ñltst daf├╝r aber einen Ausweichbonus (Dodge) von <strong>+2</strong> auf deine RK und Ber├╝hrungs-RK bis zu deiner n├ñchsten Runde.</p>
          <p><strong>Akrobatik-Synergie (Tumble):</strong> Wenn du <strong>5 oder mehr R├ñnge</strong> in der Fertigkeit Akrobatik hast, erh├Âht sich der gew├ñhrte RK-Ausweichbonus von +2 auf <strong>+3</strong>.</p>
        </div>
        `,
        "Verstanden",
        "ÔÜö´©Å"
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

  const smiteInput = offense.querySelector('.smite-toggle-input');
  if (smiteInput) {
    smiteInput.onchange = (e) => {
      CombatState.updatePCField('isSmiteActive', e.target.checked);
      uiRegistry.renderPlayerScreen();
    };
  }

  const feInput = offense.querySelector('.favored-enemy-toggle-input');
  if (feInput) {
    feInput.onchange = (e) => {
      CombatState.updatePCField('isFavoredEnemyActive', e.target.checked);
      uiRegistry.renderPlayerScreen();
    };
  }

  const saInput = offense.querySelector('.sneak-attack-toggle-input');
  if (saInput) {
    saInput.onchange = (e) => {
      CombatState.updatePCField('isSneakAttacking', e.target.checked);
      uiRegistry.renderPlayerScreen();
    };
  }
}
