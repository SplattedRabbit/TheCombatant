/**
 * @module    SpellModifierApplier
 * @summary   Wendet Modifikatoren von aktiven Zauber-Buffs auf Stats, Saves und AC an.
 * @exports   applySpellModifiers(pc)
 * @reads     pc.activeBuffs
 * @stateOps  keine (mutiert Stat-Instanzen auf pc)
 * @depends   Stat, CombatSpells
 * @notHere   Item-Boni -> ItemModifierApplier.js | Talent-Boni -> FeatModifierApplier.js
 */

import { Stat } from '../../Stat.js';
import { CombatSpells } from '../../../spells.js';

export function applySpellModifiers(pc) {
  pc.activeBuffs.forEach(buff => {
    const spell = CombatSpells.REGISTRY?.[buff.spellKey];
    if (spell && Array.isArray(spell.effects)) {
      spell.effects.forEach(eff => {
        const targetName = eff.target === 'baseZa' ? 'za' : (eff.target === 'baseRef' ? 'ref' : (eff.target === 'baseWil' ? 'wil' : eff.target));
        const statObj = pc[targetName];
        if (statObj instanceof Stat) {
          statObj.addModifier(eff.value, eff.type, eff.source);
          statObj.modifiers[statObj.modifiers.length - 1].isSpell = true;
        }
      });
    }
  });
}
