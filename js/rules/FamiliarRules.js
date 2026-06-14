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
      bat: { name: 'Fledermaus', ac: 16, str: 1, dex: 15, con: 10, wis: 14, cha: 4, bonus: '+3 auf Lauschen', specials: 'Blindsinn 40 ft., Fliegen 40 ft. (gut)' },
      cat: { name: 'Katze', ac: 15, str: 3, dex: 15, con: 10, wis: 12, cha: 7, bonus: '+3 auf Leise bewegen', specials: 'Nachtsicht, Dämmersicht, Klettern +10' },
      hawk: { name: 'Falke', ac: 17, str: 6, dex: 17, con: 10, wis: 14, cha: 6, bonus: '+3 auf Entdecken in hellem Licht', specials: 'Fliegen 60 ft. (durchschnittlich), Dämmersicht' },
      lizard: { name: 'Eidechse', ac: 14, str: 3, dex: 15, con: 10, wis: 12, cha: 2, bonus: '+3 auf Klettern', specials: 'Klettern +10, Dämmersicht' },
      owl: { name: 'Eule', ac: 17, str: 6, dex: 17, con: 10, wis: 14, cha: 6, bonus: '+3 auf Entdecken in Schatten', specials: 'Fliegen 40 ft. (gut), Dämmersicht, leiser Flug (+8 auf Leise bewegen)' },
      rat: { name: 'Ratte', ac: 14, str: 2, dex: 15, con: 10, wis: 12, cha: 2, bonus: '+2 auf Zähigkeitsrettungswürfe', specials: 'Schwimmen +8, Klettern +10, Dämmersicht, Geruchssinn' },
      raven: { name: 'Rabe', ac: 14, str: 1, dex: 15, con: 10, wis: 14, cha: 6, bonus: '+3 auf Schätzen', specials: 'Fliegen 40 ft. (durchschnittlich), spricht eine Sprache' },
      snake: { name: 'Schlange (Tiny Viper)', ac: 17, str: 4, dex: 17, con: 11, wis: 12, cha: 2, bonus: '+3 auf Bluffen', specials: 'Gift (Fort SG 10, 1d6 Kon / 1d6 Kon), Dämmersicht' },
      toad: { name: 'Kröte', ac: 16, str: 1, dex: 12, con: 11, wis: 14, cha: 4, bonus: '+3 Trefferpunkte', specials: 'Dämmersicht, Weitsprung' },
      weasel: { name: 'Wiesel', ac: 14, str: 3, dex: 15, con: 10, wis: 12, cha: 5, bonus: '+2 auf Reflexrettungswürfe', specials: 'Festhalten (Attach), Geruchssinn, Dämmersicht' }
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
        return [{ name: 'Biss (Fledermaus)', bonus, damage: '1' }];
      case 'cat':
        return [
          { name: 'Kralle (Katze)', bonus, damage: '1d2' + (strMod >= 0 ? '+' + strMod : strMod) },
          { name: 'Biss (Katze)', bonus: bonus - 5, damage: '1d3' + (strMod >= 0 ? '+' + strMod : strMod) }
        ];
      case 'hawk':
        return [{ name: 'Krallen (Falke)', bonus, damage: '1d4' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'lizard':
        return [{ name: 'Biss (Eidechse)', bonus, damage: '1d4' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'owl':
        return [{ name: 'Krallen (Eule)', bonus, damage: '1d4' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'rat':
        return [{ name: 'Biss (Ratte)', bonus, damage: '1d3' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'raven':
        return [{ name: 'Krallen (Rabe)', bonus, damage: '1d2' + (strMod >= 0 ? '+' + strMod : strMod) }];
      case 'snake':
        return [{ name: 'Biss (Schlange)', bonus, damage: '1d2' + (strMod >= 0 ? '+' + strMod : strMod), note: 'Gift (injury, Fort SG 10, 1d6 Kon / 1d6 Kon)' }];
      case 'weasel':
        return [{ name: 'Biss (Wiesel)', bonus, damage: '1d3' + (strMod >= 0 ? '+' + strMod : strMod), note: 'Festhalten (Attach)' }];
      default:
        return [];
    }
  }
};
