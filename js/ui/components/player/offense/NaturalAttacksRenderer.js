/**
 * @module    NaturalAttacksRenderer
 * @summary   Rendert die Liste natürlicher Angriffe für Charaktere in Tiergestalt (Wild Shape).
 * @exports   SHAPE_ATTACKS, renderNaturalAttacksList
 * @reads     pc.activeShape, pc.attributes, pc.bab
 * @stateOps  keine
 * @depends   dialogs.js (showAttackChoiceDialog, showRollBreakdown)
 * @notHere   Waffenslots -> EquipmentSlotsRenderer.js | Rucksack -> InventoryStashRenderer.js
 */

// @feature:wildshape

import { showAttackChoiceDialog, showRollBreakdown } from '../../dialogs.js';

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

  const strMod = pc.getAttributeMod('str');
  const babVal  = pc.bab.getValue();

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

    // Calculate atkTotal and dmgTotal manually for display
    const atkMod  = babVal + (atk.isSecondary ? -5 : 0) + strMod;
    const dmgMod  = Math.floor(strMod * atk.strMult);
    const atkStr  = atkMod >= 0 ? `+${atkMod}` : `${atkMod}`;
    const dmgStr  = dmgMod >= 0 ? `+${dmgMod}` : `${dmgMod}`;

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
        <div style="font-size:7px; color:var(--inkm);">${atk.damageDice}${dmgStr !== '+0' ? ' ' + dmgStr : ''} ${labelPart}</div>
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

    // DMG button: show a simple roll breakdown
    card.querySelector('.nat-dmg-btn').onclick = (e) => {
      const breakdown = [
        { label: 'Stärke (' + (atk.strMult === 1.0 ? '1x' : '0.5x') + ')', value: dmgMod }
      ];
      showRollBreakdown(`${atk.name} (Schaden)`, `${atk.damageDice}${dmgStr}`, breakdown, e);
    };

    container.appendChild(card);
  });
}
