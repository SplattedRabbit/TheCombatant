/**
 * @module    FeatModifierApplier
 * @summary   Wendet passive Talent-RK/Saves-Boni (Dodge, Combat Expertise, Defensive Fighting, Two-Weapon Defense) an.
 * @exports   applyFeatModifiers(pc, getMod)
 * @reads     pc.type, pc.feats, pc.combatExpertisePenalty, pc.isDefensiveFighting, pc.isTotalDefense, pc.weapons
 * @stateOps  keine (mutiert Stat-Instanzen auf pc)
 * @depends   keine
 * @notHere   Item-Boni -> ItemModifierApplier.js | Klassen-Boni -> ClassModifierApplier.js
 */

export function applyFeatModifiers(pc, getMod) {
  if (pc.type === 'p') {
    // E. Rettungswurf-Talente (Great Fortitude, Lightning Reflexes, Iron Will)
    if (Array.isArray(pc.feats)) {
      const hasFeat = (featId) => pc.feats.some(f => f.id === featId);
      if (hasFeat('great_fortitude')) {
        pc.za.addModifier(2, "untyped", "Große Zähigkeit");
        pc.za.modifiers[pc.za.modifiers.length - 1].isFeat = true;
      }
      if (hasFeat('lightning_reflexes')) {
        pc.ref.addModifier(2, "untyped", "Blitzschnelle Reflexe");
        pc.ref.modifiers[pc.ref.modifiers.length - 1].isFeat = true;
      }
      if (hasFeat('iron_will')) {
        pc.wil.addModifier(2, "untyped", "Eiserner Wille");
        pc.wil.modifiers[pc.wil.modifiers.length - 1].isFeat = true;
      }

      // Dodge Feat: +1 dodge bonus to AC & Touch AC
      if (hasFeat('dodge')) {
        pc.ac.addModifier(1, "dodge", "Ausweichen");
        pc.ac.modifiers[pc.ac.modifiers.length - 1].isFeat = true;
        pc.acTouch.addModifier(1, "dodge", "Ausweichen");
        pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isFeat = true;
      }

      // Combat Expertise: adds dodge bonus to AC and Touch AC
      if (pc.combatExpertisePenalty > 0) {
        pc.ac.addModifier(pc.combatExpertisePenalty, "dodge", "Kampfgetümmel");
        pc.ac.modifiers[pc.ac.modifiers.length - 1].isFeat = true;
        pc.acTouch.addModifier(pc.combatExpertisePenalty, "dodge", "Kampfgetümmel");
        pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isFeat = true;
      }

      // Defensive Fighting: adds dodge bonus to AC and Touch AC (+3 if tumble ranks >= 5, else +2)
      if (pc.isDefensiveFighting) {
        const tumbleRanks = pc.getSkillRanks('tumble');
        const dodgeBonus = tumbleRanks >= 5 ? 3 : 2;
        pc.ac.addModifier(dodgeBonus, "dodge", "Verteidigend kämpfen");
        pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
        pc.acTouch.addModifier(dodgeBonus, "dodge", "Verteidigend kämpfen");
        pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;
      }

      // Total Defense: adds dodge bonus to AC and Touch AC (+6 if tumble ranks >= 5, else +4)
      if (pc.isTotalDefense) {
        const tumbleRanks = pc.getSkillRanks('tumble');
        const dodgeBonus = tumbleRanks >= 5 ? 6 : 4;
        pc.ac.addModifier(dodgeBonus, "dodge", "Volle Abwehr");
        pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
        pc.acTouch.addModifier(dodgeBonus, "dodge", "Volle Abwehr");
        pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;
      }

      // Two-Weapon Defense Feat: +1 shield bonus to AC & Flat-Footed AC when wielding secondary weapon
      if (hasFeat('two_weapon_defense')) {
        const hasSecWeapon = Array.isArray(pc.weapons) && pc.weapons.some(w => w.grip === 'sec' || (w.isEquipped && (w.hand === 'off' || w.isDoubleWielded)));
        if (hasSecWeapon) {
          pc.ac.addModifier(1, "shield", "Zwei-Waffen-Verteidigung");
          pc.ac.modifiers[pc.ac.modifiers.length - 1].isFeat = true;
          pc.acFlat.addModifier(1, "shield", "Zwei-Waffen-Verteidigung");
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isFeat = true;
        }
      }
    }
  }
}
