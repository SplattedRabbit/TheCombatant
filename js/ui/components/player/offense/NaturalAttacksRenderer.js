/**
 * @module    NaturalAttacksRenderer
 * @summary   Rendert die Liste natürlicher Angriffe für Charaktere in Tiergestalt (Wild Shape).
 * @exports   SHAPE_ATTACKS, renderNaturalAttacksList
 * @reads     pc.activeShape, pc.attributes, pc.bab
 * @stateOps  keine
 * @depends   dialogs.js (showAttackChoiceDialog, showRollBreakdown), AttackEngine.js (AttackEngine)
 * @notHere   Waffenslots -> EquipmentSlotsRenderer.js | Rucksack -> InventoryStashRenderer.js
 */

// @feature:wildshape

import { showAttackChoiceDialog, showRollBreakdown } from '../../dialogs.js';
import { AttackEngine } from '../../../../rules/AttackEngine.js';

export const SHAPE_ATTACKS = {
  wolf: [
    { name: 'Biss (Wolf)', damageDice: '1w6', strMult: 1.0, isNatural: true, isSecondary: false, specialLabel: 'Trip' }
  ],
  leopard: [
    { name: 'Biss (Leopard)',    damageDice: '1w6', strMult: 1.0, isNatural: true, isSecondary: false },
    { name: 'Kralle (Leopard)',  damageDice: '1w3', strMult: 0.5, isNatural: true, isSecondary: true  },
    { name: 'Kralle (Leopard)',  damageDice: '1w3', strMult: 0.5, isNatural: true, isSecondary: true  }
  ],
  bear: [
    { name: 'Kralle (Braunbär)', damageDice: '1w8', strMult: 1.0, isNatural: true, isSecondary: false },
    { name: 'Kralle (Braunbär)', damageDice: '1w8', strMult: 1.0, isNatural: true, isSecondary: false },
    { name: 'Biss (Braunbär)',   damageDice: '2w6', strMult: 0.5, isNatural: true, isSecondary: true  }
  ]
};

export function renderNaturalAttacksList(container, pc) {
  container.innerHTML = '';
  const attacks = SHAPE_ATTACKS[pc.activeShape];
  if (!attacks || attacks.length === 0) {
    container.innerHTML = '<div style="font-size:8px; color:var(--inkl); font-style:italic;">Keine natürlichen Angriffe definiert.</div>';
    return;
  }

  attacks.forEach((atk) => {
    // Build a pseudo-weapon object that AttackEngine can handle
    const pseudoWeapon = {
      name:        atk.name,
      damageDice:  atk.damageDice,
      damage:      atk.damageDice,
      enhancement: 0,
      attackBonus: 0,
      isNatural:   true,
      isSecondary: atk.isSecondary,
      grip:        'unarmed',
      crit:        '20 / x2',
      type:        'unarmed'
    };

    // Calculate attack sequence options from active combat flags
    const seq = AttackEngine.calculateAttackSequence(pc, pseudoWeapon, false, {
      smite: pc.isSmiteActive,
      favoredEnemy: pc.isFavoredEnemyActive,
      sneakAttack: pc.isSneakAttacking
    });
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [], damageDice: atk.damageDice };

    const formatMod = (n) => (n >= 0 ? '+' : '') + n;
    const atkStr  = formatMod(stdAtkObj.atkTotal);
    const dmgStr  = formatMod(stdAtkObj.dmgTotal);

    const card = document.createElement('div');
    card.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 0.5px solid var(--pb);
      border-radius: 3px;
      padding: 4px 7px;
      background: rgba(200, 169, 110, 0.03);
      gap: 6px;
    `;

    const labelPart = atk.isSecondary
      ? `<span style="font-size:6px; color:var(--inkl); opacity:0.7;">(sekund.)</span>`
      : '';
    const specialPart = atk.specialLabel
      ? `<span style="font-size:6.5px; color:#2e7d32; margin-left:3px;">[${atk.specialLabel}]</span>`
      : '';

    card.innerHTML = `
      <div style="flex:1; min-width:0;">
        <div style="font-family:'Crimson Text',serif; font-size:9px; font-weight:bold; color:var(--red); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${atk.name}${specialPart}
        </div>
        <div style="font-size:7px; color:var(--inkm);">${stdAtkObj.damageDice}${dmgStr !== '+0' ? ' ' + dmgStr : ''} ${labelPart}</div>
      </div>
      <div style="display:flex; gap:3px; flex-shrink:0;">
        <button class="xbtn xbtn-dmg nat-atk-btn" style="padding:1px 5px; font-size:6.5px; font-weight:bold; white-space:nowrap; height:15px; line-height:1;">
          ATK (${atkStr}) 🎲
        </button>
        <button class="xbtn xbtn-heal nat-dmg-btn" style="padding:1px 5px; font-size:6.5px; font-weight:bold; white-space:nowrap; height:15px; line-height:1; border-color:#2a6a2a; color:#1a4a1a;">
          DMG (${dmgStr})
        </button>
      </div>
    `;

    // ATK button: re-use showAttackChoiceDialog with the pseudo-weapon
    card.querySelector('.nat-atk-btn').onclick = (e) => {
      showAttackChoiceDialog(pc, pseudoWeapon, e);
    };

    // DMG button: show the roll breakdown from the calculated sequence
    card.querySelector('.nat-dmg-btn').onclick = (e) => {
      showRollBreakdown(`${atk.name} (Schaden)`, stdAtkObj.damageDice, stdAtkObj.dmgBreakdown, e);
    };

    container.appendChild(card);
  });
}

