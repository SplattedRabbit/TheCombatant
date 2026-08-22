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
import { getDefaultBonusType } from '../../Item.js';

export function applyItemModifiers(pc) {
  if (!pc || !Array.isArray(pc.items)) return;

  pc.items.forEach(item => {
    if (!item || !item.isEquipped) return;

    const effects = Array.isArray(item.effects) ? item.effects : [];
    effects.forEach(eff => {
      const val = parseInt(eff.value) || 0;
      if (val === 0) return;

      const sourceName = item.name || "Magischer Gegenstand";
      const type = eff.type || 'attribute';
      const target = eff.target || 'str';
      const bType = eff.bonusType || getDefaultBonusType(type, target);

      if (type === 'attribute') {
        const stat = pc[target];
        if (stat instanceof Stat) {
          stat.addModifier(val, bType, sourceName);
          stat.modifiers[stat.modifiers.length - 1].isItem = true;
        }
      } 
      else if (type === 'save') {
        if (target === 'fort' || target === 'all') {
          if (pc.za instanceof Stat) {
            pc.za.addModifier(val, bType, sourceName);
            pc.za.modifiers[pc.za.modifiers.length - 1].isItem = true;
          }
        }
        if (target === 'ref' || target === 'all') {
          if (pc.ref instanceof Stat) {
            pc.ref.addModifier(val, bType, sourceName);
            pc.ref.modifiers[pc.ref.modifiers.length - 1].isItem = true;
          }
        }
        if (target === 'wil' || target === 'all') {
          if (pc.wil instanceof Stat) {
            pc.wil.addModifier(val, bType, sourceName);
            pc.wil.modifiers[pc.wil.modifiers.length - 1].isItem = true;
          }
        }
      } 
      else if (type === 'ac') {
        if (pc.autoAC) {
          if (target === 'deflection') {
            if (pc.ac instanceof Stat) { pc.ac.addModifier(val, bType, sourceName); pc.ac.modifiers[pc.ac.modifiers.length - 1].isItem = true; }
            if (pc.acTouch instanceof Stat) { pc.acTouch.addModifier(val, bType, sourceName); pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isItem = true; }
            if (pc.acFlat instanceof Stat) { pc.acFlat.addModifier(val, bType, sourceName); pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isItem = true; }
          } else if (target === 'natural') {
            if (pc.ac instanceof Stat) { pc.ac.addModifier(val, bType, sourceName); pc.ac.modifiers[pc.ac.modifiers.length - 1].isItem = true; }
            if (pc.acFlat instanceof Stat) { pc.acFlat.addModifier(val, bType, sourceName); pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isItem = true; }
          } else if (target === 'armor' || target === 'shield') {
            if (pc.ac instanceof Stat) { pc.ac.addModifier(val, bType, sourceName); pc.ac.modifiers[pc.ac.modifiers.length - 1].isItem = true; }
            if (pc.acFlat instanceof Stat) { pc.acFlat.addModifier(val, bType, sourceName); pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isItem = true; }
          } else if (target === 'dodge') {
            if (pc.ac instanceof Stat) { pc.ac.addModifier(val, 'dodge', sourceName); pc.ac.modifiers[pc.ac.modifiers.length - 1].isItem = true; }
            if (pc.acTouch instanceof Stat) { pc.acTouch.addModifier(val, 'dodge', sourceName); pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isItem = true; }
          }
        }
      }
    });
  });
}

