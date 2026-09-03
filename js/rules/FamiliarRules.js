/**
 * @module    FamiliarRules
 * @summary   D&D 3.5e Regeln zur Berechnung und Skalierung von Vertrauten (Fledermaus, Katze, Eule, Rabe etc.).
 * @exports   FamiliarRules
 * @reads     pc.classes, pc.level, pc.classType
 * @stateOps  keine
 * @depends   keine
 * @notHere   UI-Rendering -> src/components/player/companion/FamiliarSheet.tsx
 */

export const FamiliarRules = {
  /**
   * Berechnet die effektive Vertrautenstufe (Wizard + Sorcerer Level des Meisters).
   */
  calculateEffectiveFamiliarLevel(pc) {
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
    return effectiveFamiliarLvl;
  },

  /**
   * Liefert die Basiswerte eines Vertrauten-Typs.
   */
  getFamiliarBaseStats(type) {
    const stats = {
      bat: { name: 'Bat', ac: 16, str: 1, dex: 15, con: 10, wis: 14, cha: 4, bonus: '+3 bonus on Listen checks', specials: 'Blindsight 40 ft., Fly 40 ft. (good)' },
      cat: { name: 'Cat', ac: 15, str: 3, dex: 15, con: 10, wis: 12, cha: 7, bonus: '+3 bonus on Move Silently checks', specials: 'Low-light vision, Scent, Climb +10' },
      hawk: { name: 'Hawk', ac: 17, str: 6, dex: 17, con: 10, wis: 14, cha: 6, bonus: '+3 bonus on Spot checks in bright light', specials: 'Fly 60 ft. (average), Low-light vision' },
      lizard: { name: 'Lizard', ac: 14, str: 3, dex: 15, con: 10, wis: 12, cha: 2, bonus: '+3 bonus on Climb checks', specials: 'Climb +10, Low-light vision' },
      owl: { name: 'Owl', ac: 17, str: 6, dex: 17, con: 10, wis: 14, cha: 6, bonus: '+3 bonus on Spot checks in shadows', specials: 'Fly 40 ft. (good), Low-light vision, silent flight (+8 on Move Silently)' },
      rat: { name: 'Rat', ac: 14, str: 2, dex: 15, con: 10, wis: 12, cha: 2, bonus: '+2 bonus on Fortitude saves', specials: 'Swim +8, Climb +10, Low-light vision, Scent' },
      raven: { name: 'Raven', ac: 14, str: 1, dex: 15, con: 10, wis: 14, cha: 6, bonus: '+3 bonus on Appraise checks', specials: 'Fly 40 ft. (average), speaks one language' },
      snake: { name: 'Snake (Tiny Viper)', ac: 17, str: 4, dex: 17, con: 11, wis: 12, cha: 2, bonus: '+3 bonus on Bluff checks', specials: 'Poison (Fort DC 10, 1d6 Con / 1d6 Con), Low-light vision' },
      toad: { name: 'Toad', ac: 16, str: 1, dex: 12, con: 11, wis: 14, cha: 4, bonus: '+3 hit points', specials: 'Low-light vision, Long jump' },
      weasel: { name: 'Weasel', ac: 14, str: 3, dex: 15, con: 10, wis: 12, cha: 5, bonus: '+2 bonus on Reflex saves', specials: 'Attach, Scent, Low-light vision' }
    };
    return stats[type] || null;
  },

  /**
   * Berechnet die Angriffe des Vertrauten basierend auf dem Meister-BAB und eigenen Attributen.
   */
  getFamiliarAttacks(type, masterBab, str, dex) {
    const strMod = Math.floor((str - 10) / 2);
    const dexMod = Math.floor((dex - 10) / 2);
    const useMod = Math.max(strMod, dexMod);
    
    // Size modifiers: Diminutive = +4, Tiny = +2
    const sizeMod = (type === 'bat' || type === 'toad') ? 4 : 2;
    const bonus = masterBab + useMod + sizeMod;

    switch (type) {
      case 'bat':
        return [{ name: 'Bite (Bat)', bonus, damage: '1' }];
      case 'cat':
        return [
          { name: 'Claw (Cat)', bonus, damage: '1d2' + (strMod >= 0 ? '+' + strMod : strMod) },
          { name: 'Bite (Cat)', bonus: bonus - 5, damage: '1d3' + (strMod >= 0 ? '+' + strMod : strMod) }
        ];
      case 'hawk':
        return [{ name: 'Talons (Hawk)', bonus, damage: '1d4' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'lizard':
        return [{ name: 'Bite (Lizard)', bonus, damage: '1d4' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'owl':
        return [{ name: 'Talons (Owl)', bonus, damage: '1d4' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'rat':
        return [{ name: 'Bite (Rat)', bonus, damage: '1d3' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'raven':
        return [{ name: 'Claws (Raven)', bonus, damage: '1d2' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'snake':
        return [{ name: 'Bite (Snake)', bonus, damage: '1d2' + (strMod >= 0 ? '+' + strMod : strMod), note: 'Poison (injury, Fort DC 10, 1d6 Con / 1d6 Con)' }];
      case 'weasel':
        return [{ name: 'Bite (Weasel)', bonus, damage: '1d3' + (strMod >= 0 ? '+' + strMod : strMod), note: 'Attach' }];
      default:
        return [];
    }
  }
};
