/**
 * @module    ClassModifierApplier
 * @summary   Wendet klassenspezifische passive D&D-Modifikatoren (Divine Grace, Monk AC, Barbarian Rage, Familiars) an.
 * @exports   applyClassModifiers(pc, getMod)
 * @reads     pc.type, pc.classes, pc.divineGraceActive, pc.cha, pc.wis, pc.isRaging, pc.familiarType
 * @stateOps  keine (mutiert Stat-Instanzen auf pc)
 * @depends   BarbarianRules
 * @notHere   Item-Boni -> ItemModifierApplier.js | Talent-Boni -> FeatModifierApplier.js
 */

import { BarbarianRules } from '../../../rules/classes/BarbarianRules.js';

export function applyClassModifiers(pc, getMod) {
  if (pc.type === 'p' && Array.isArray(pc.classes)) {
    // A. Paladin: Divine Grace (Stufe >= 2)
    const paladinClass = pc.classes.find(c => c.classType === 'paladin');
    if (paladinClass && paladinClass.level >= 2 && pc.divineGraceActive) {
      const chaMod = getMod(pc.cha);
      const saves = [pc.za, pc.ref, pc.wil];
      saves.forEach(s => {
        s.addModifier(Math.max(0, chaMod), "untyped", "Göttliche Gnade");
        s.modifiers[s.modifiers.length - 1].isClass = true;
      });
    }

    // B. Monk: Wisdom AC Bonus & Level AC Bonus (No armor/shield check)
    const monkClass = pc.classes.find(c => c.classType === 'monk');
    if (monkClass && monkClass.level >= 1) {
      const wisMod = getMod(pc.wis);
      const levelBonus = Math.floor(monkClass.level / 5);
      const totalMonkAC = Math.max(0, wisMod) + levelBonus;
      
      if (totalMonkAC > 0) {
        const acs = [pc.ac, pc.acTouch, pc.acFlat];
        acs.forEach(s => {
          s.addModifier(totalMonkAC, "untyped", "Mönch-RK-Bonus");
          s.modifiers[s.modifiers.length - 1].isClass = true;
        });
      }
    }

    // C. Barbarian: Kampfrausch (Rage) active toggle
    if (pc.isRaging) {
      const barbClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'barbarian') : null;
      const lvl = barbClass ? barbClass.level : 1;
      const bonuses = BarbarianRules.getRageBonuses(lvl);

      pc.str.addModifier(bonuses.strBonus, "morale", "Kampfrausch");
      pc.str.modifiers[pc.str.modifiers.length - 1].isClass = true;

      pc.con.addModifier(bonuses.conBonus, "morale", "Kampfrausch");
      pc.con.modifiers[pc.con.modifiers.length - 1].isClass = true;

      pc.wil.addModifier(bonuses.wilBonus, "morale", "Kampfrausch");
      pc.wil.modifiers[pc.wil.modifiers.length - 1].isClass = true;

      const acs = [pc.ac, pc.acTouch, pc.acFlat];
      acs.forEach(s => {
        s.addModifier(bonuses.acPenalty, "untyped", "Kampfrausch");
        s.modifiers[s.modifiers.length - 1].isClass = true;
      });
    }

    // D. Vertrauten-Passive-Boni (Ratte: +2 Zähigkeit, Wiesel: +2 Reflex)
    if (pc.familiarType && pc.familiarType !== 'none') {
      if (pc.familiarType === 'rat') {
        pc.za.addModifier(2, "untyped", "Vertrauter (Ratte)");
        pc.za.modifiers[pc.za.modifiers.length - 1].isClass = true;
      } else if (pc.familiarType === 'weasel') {
        pc.ref.addModifier(2, "untyped", "Vertrauter (Wiesel)");
        pc.ref.modifiers[pc.ref.modifiers.length - 1].isClass = true;
      }
    }
  }
}
