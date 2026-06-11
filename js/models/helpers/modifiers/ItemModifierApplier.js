/**
 * @module    ItemModifierApplier
 * @summary   Wendet Modifikatoren von ausgerüsteten magischen Gegenständen auf Stats, Saves und AC an.
 * @exports   applyItemModifiers(pc)
 * @reads     pc.items, pc.autoAC
 * @stateOps  keine (mutiert Stat-Instanzen auf pc)
 * @depends   Stat
 * @notHere   Spell-Boni -> SpellModifierApplier.js | Talent-Boni -> FeatModifierApplier.js
 */

import { Stat } from '../../Stat.js';

export function applyItemModifiers(pc) {
  if (!Array.isArray(pc.items)) return;

  pc.items.forEach(item => {
    if (!item.isEquipped) return;

    const effects = Array.isArray(item.effects) ? item.effects : [];
    effects.forEach(eff => {
      const val = parseInt(eff.value) || 0;
      if (val === 0) return;

      const sourceName = item.name || "Magischer Gegenstand";
      const type = eff.type;
      const target = eff.target;

      if (type === 'attribute') {
        const stat = pc[target];
        if (stat instanceof Stat) {
          stat.addModifier(val, "enhancement", sourceName);
          stat.modifiers[stat.modifiers.length - 1].isItem = true;
        }
      } 
      else if (type === 'save') {
        if (target === 'fort' || target === 'all') {
          pc.za.addModifier(val, "resistance", sourceName);
          pc.za.modifiers[pc.za.modifiers.length - 1].isItem = true;
        }
        if (target === 'ref' || target === 'all') {
          pc.ref.addModifier(val, "resistance", sourceName);
          pc.ref.modifiers[pc.ref.modifiers.length - 1].isItem = true;
        }
        if (target === 'wil' || target === 'all') {
          pc.wil.addModifier(val, "resistance", sourceName);
          pc.wil.modifiers[pc.wil.modifiers.length - 1].isItem = true;
        }
      } 
      else if (type === 'ac') {
        if (pc.autoAC) {
          if (target === 'deflection') {
            pc.ac.addModifier(val, "deflection", sourceName);
            pc.ac.modifiers[pc.ac.modifiers.length - 1].isItem = true;
            pc.acTouch.addModifier(val, "deflection", sourceName);
            pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isItem = true;
            pc.acFlat.addModifier(val, "deflection", sourceName);
            pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isItem = true;
          } else if (target === 'natural') {
            pc.ac.addModifier(val, "natural", sourceName);
            pc.ac.modifiers[pc.ac.modifiers.length - 1].isItem = true;
            pc.acFlat.addModifier(val, "natural", sourceName);
            pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isItem = true;
          } else if (target === 'armor') {
            pc.ac.addModifier(val, "armor", sourceName);
            pc.ac.modifiers[pc.ac.modifiers.length - 1].isItem = true;
            pc.acFlat.addModifier(val, "armor", sourceName);
            pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isItem = true;
          }
        }
      }
    });
  });
}
