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

function applyEffect(pc, eff, source) {
  const target = eff.target;
  const val = parseInt(eff.value) || 0;
  if (val === 0) return;
  const type = eff.type;

  // Handle AC targets
  if (target === 'acArmor' || target === 'acShield' || target === 'acNatural' || target === 'acDeflection' || target === 'acDodge' || target === 'ac') {
    if (pc.autoAC) {
      const isArmor = target === 'acArmor';
      const isShield = target === 'acShield';
      const isNatural = target === 'acNatural';
      const isDeflection = target === 'acDeflection';
      const isDodge = target === 'acDodge';
      const isMisc = target === 'ac';

      pc.ac.addModifier(val, type, source);
      if (pc.ac.modifiers.length > 0) {
        pc.ac.modifiers[pc.ac.modifiers.length - 1].isSpell = true;
      }

      if (isDeflection || isDodge || isMisc) {
        pc.acTouch.addModifier(val, type, source);
        if (pc.acTouch.modifiers.length > 0) {
          pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isSpell = true;
        }
      }

      if (isArmor || isShield || isNatural || isDeflection || isMisc) {
        pc.acFlat.addModifier(val, type, source);
        if (pc.acFlat.modifiers.length > 0) {
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isSpell = true;
        }
      }
    }
  } else {
    // Handle standard stat targets (saves, attributes)
    const targetName = target === 'baseZa' ? 'za' : (target === 'baseRef' ? 'ref' : (target === 'baseWil' ? 'wil' : target));
    const statObj = pc[targetName];
    if (statObj instanceof Stat) {
      statObj.addModifier(val, type, source || eff.source);
      if (statObj.modifiers.length > 0) {
        statObj.modifiers[statObj.modifiers.length - 1].isSpell = true;
      }
    }
  }
}

export function applySpellModifiers(pc) {
  if (!Array.isArray(pc.activeBuffs)) return;

  pc.activeBuffs.forEach(buff => {
    // If the buff already has resolved effects, we ONLY use those.
    // Otherwise, for backwards-compatibility, we look up the spell in the registry.
    if (Array.isArray(buff.effects)) {
      buff.effects.forEach(eff => {
        applyEffect(pc, eff, buff.name || eff.source);
      });
    } else if (buff.spellKey) {
      const spell = CombatSpells.REGISTRY?.[buff.spellKey];
      if (spell && Array.isArray(spell.effects)) {
        spell.effects.forEach(eff => {
          applyEffect(pc, eff, spell.nameDe || spell.nameEn || buff.name);
        });
      }
    }
  });
}
