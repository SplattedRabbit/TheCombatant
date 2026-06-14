/**
 * @module    CompanionRules
 * @summary   D&D 3.5e Regeln zur Berechnung und Skalierung von Tierbegleitern (Wolf, Leopard, Braunbär).
 * @exports   CompanionRules
 * @reads     pc.classes, pc.level, pc.classType
 * @stateOps  keine
 * @depends   keine
 * @notHere   UI-Rendering -> src/components/player/companion/CompanionSheet.tsx
 */

export const CompanionRules = {
  /**
   * Berechnet die effektive Druidenstufe für die Skalierung des Tierbegleiters.
   */
  calculateEffectiveDruidLevel(pc) {
    const classes = Array.isArray(pc.classes) ? pc.classes : [];
    const druidClass = classes.find(c => c.classType === 'druid');
    const rangerClass = classes.find(c => c.classType === 'ranger');
    let effectiveDruidLvl = 0;
    if (druidClass) effectiveDruidLvl += druidClass.level;
    if (rangerClass) effectiveDruidLvl += Math.floor(rangerClass.level / 2);
    
    if (effectiveDruidLvl === 0 && (pc.classType === 'druid' || pc.classType === 'ranger')) {
      effectiveDruidLvl = pc.classType === 'druid' ? pc.level : Math.floor(pc.level / 2);
    }
    if (effectiveDruidLvl === 0) {
      effectiveDruidLvl = 1;
    }
    return effectiveDruidLvl;
  },

  /**
   * Berechnet die skalierten Attribute, Trefferpunkte, RK und Angriffe eines Tierbegleiters.
   */
  getCompanionBaseStats(type, level = 1) {
    let stats = null;
    let baseHD = 2;
    let attackScaleType = 'str'; // 'str' or 'dex'

    switch (type) {
      case 'wolf':
        stats = {
          name: 'Wolf',
          ac: 14,
          str: 13,
          dex: 15,
          con: 15,
          wis: 12,
          cha: 6,
          maxHP: 13,
          attacks: [
            { name: 'Biss-Angriff (Wolf)', bonus: 3, damage: '1w6+1', note: 'plus Zu-Boden-werfen' }
          ],
          specials: 'Geruchssinn, Link, Zauber teilen'
        };
        baseHD = 2;
        attackScaleType = 'str';
        break;
      case 'leopard':
        stats = {
          name: 'Leopard',
          ac: 15,
          str: 16,
          dex: 19,
          con: 15,
          wis: 12,
          cha: 6,
          maxHP: 19,
          attacks: [
            { name: 'Biss-Angriff (Leopard)', bonus: 6, damage: '1w6+3' },
            { name: '2x Krallen (Leopard)', bonus: 1, damage: '1w3+1' },
            { name: 'Anspringen & Ankrallen (Rake)', bonus: 1, damage: '1w3+1', note: 'falls angesprungen' }
          ],
          specials: 'Geruchssinn, Link, Zauber teilen, Anspringen'
        };
        baseHD = 3;
        attackScaleType = 'dex';
        break;
      case 'bear':
        stats = {
          name: 'Braunbär',
          ac: 15,
          str: 27,
          dex: 13,
          con: 19,
          wis: 12,
          cha: 6,
          maxHP: 51,
          attacks: [
            { name: '2x Krallen-Angriff (Bär)', bonus: 11, damage: '1w8+8' },
            { name: 'Biss-Angriff (Bär)', bonus: 6, damage: '2w6+4', note: 'plus Umklammern' }
          ],
          specials: 'Geruchssinn, Link, Zauber teilen, Umklammern (Grab)'
        };
        baseHD = 6;
        attackScaleType = 'str';
        break;
      case 'custom':
        return {
          name: 'Benutzerdefiniert',
          ac: 10,
          str: 10,
          dex: 10,
          con: 10,
          wis: 10,
          cha: 10,
          maxHP: 10,
          attacks: [
            { name: 'Nahkampfangriff (Custom)', bonus: 0, damage: '1w6' }
          ],
          specials: 'Eigene Werte eingetragen'
        };
      default:
        return null;
    }

    // Apply scaling based on effective Druid Level
    let bonusHD = 0;
    let natArmorBonus = 0;
    let strDexBonus = 0;

    if (level >= 18) {
      bonusHD = 12; natArmorBonus = 12; strDexBonus = 6;
    } else if (level >= 15) {
      bonusHD = 10; natArmorBonus = 10; strDexBonus = 5;
    } else if (level >= 12) {
      bonusHD = 8; natArmorBonus = 8; strDexBonus = 4;
    } else if (level >= 9) {
      bonusHD = 6; natArmorBonus = 6; strDexBonus = 3;
    } else if (level >= 6) {
      bonusHD = 4; natArmorBonus = 4; strDexBonus = 2;
    } else if (level >= 3) {
      bonusHD = 2; natArmorBonus = 2; strDexBonus = 1;
    }

    const oldStrMod = Math.floor((stats.str - 10) / 2);
    const oldDexMod = Math.floor((stats.dex - 10) / 2);
    const oldBAB = Math.floor(baseHD * 0.75);

    stats.ac += natArmorBonus;
    stats.str += strDexBonus;
    stats.dex += strDexBonus;

    const newStrMod = Math.floor((stats.str - 10) / 2);
    const newDexMod = Math.floor((stats.dex - 10) / 2);
    const newBAB = Math.floor((baseHD + bonusHD) * 0.75);
    const newConMod = Math.floor((stats.con - 10) / 2);

    stats.maxHP += Math.floor(bonusHD * 4.5) + bonusHD * newConMod;
    
    // Scale attacks and damage
    const babDiff = newBAB - oldBAB;
    const strDiff = newStrMod - oldStrMod;
    const dexDiff = newDexMod - oldDexMod;
    const bonusDiff = babDiff + (attackScaleType === 'dex' ? dexDiff : strDiff);

    stats.attacks = stats.attacks.map(att => {
      const scaledBonus = att.bonus + bonusDiff;
      let scaledDamage = att.damage;
      
      // Scale damage formula dynamically
      if (type === 'wolf') {
        scaledDamage = `1w6+${Math.floor(newStrMod * 1.5)}`;
      } else if (type === 'leopard') {
        if (att.name.includes('Biss')) {
          scaledDamage = `1w6+${newStrMod}`;
        } else {
          scaledDamage = `1w3+${Math.floor(newStrMod / 2)}`;
        }
      } else if (type === 'bear') {
        if (att.name.includes('Kralle')) {
          scaledDamage = `1w8+${newStrMod}`;
        } else {
          scaledDamage = `2d6+${Math.floor(newStrMod / 2)}`;
        }
      }

      return {
        ...att,
        bonus: scaledBonus,
        damage: scaledDamage
      };
    });

    if (bonusHD > 0) {
      stats.specials += `, +${bonusHD} HD (Boni eingerechnet)`;
    }

    return stats;
  }
};
