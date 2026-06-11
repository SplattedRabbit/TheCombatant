/**
 * @module    ModifierCalculator
 * @summary   Berechnet die konkreten Angriffs- und Schadensmodifikatoren.
 * @exports   calculateGeneralAtkModifiers(ctx), calculateGeneralDmgModifiers(ctx)
 * @reads     ctx.weapon, ctx.pc, ctx.isRanged, ctx.isMelee, ctx.strMod, ctx.dexMod, ctx.chaMod, ctx.paPenalty, ctx.cePenalty, ctx.hasHaste, ctx.options
 * @stateOps  keine
 * @depends   matchesFeatOption, WeaponRegistry (../../models/Weapon.js)
 * @notHere   Sequenz-Generierung -> SequenceBuilder.js
 */

import { matchesFeatOption, WeaponRegistry } from '../../models/Weapon.js';

export function calculateGeneralAtkModifiers(ctx) {
  let generalAtkMod = 0;
  const generalAtkBreakdown = [];

  const enh = parseInt(ctx.weapon.enhancement) || 0;
  if (enh > 0) {
    generalAtkMod += enh;
    generalAtkBreakdown.push({ label: 'Waffen-Effekt', value: enh });
  }

  if (ctx.pc.feats) {
    ctx.pc.feats.forEach(feat => {
      if (feat.id === 'weapon_focus' && feat.option && matchesFeatOption(ctx.weapon, feat.option)) {
        generalAtkMod += 1;
        generalAtkBreakdown.push({ label: `Talent: Waffenfokus (${feat.option})`, value: 1 });
      }
      if (feat.id === 'greater_weapon_focus' && feat.option && matchesFeatOption(ctx.weapon, feat.option)) {
        generalAtkMod += 1;
        generalAtkBreakdown.push({ label: `Talent: Mächtiger Waffenfokus (${feat.option})`, value: 1 });
      }
    });
  }

  if (ctx.isRanged && ctx.hasFeat('point_blank_shot')) {
    generalAtkMod += 1;
    generalAtkBreakdown.push({ label: 'Talent: Nahschuss', value: 1 });
  }

  if (ctx.isRanged) {
    const typeDef = WeaponRegistry[ctx.weapon.type];
    if (typeDef && typeDef.isComposite) {
      let rating = parseInt(ctx.weapon.strengthRating) || 0;
      if (!rating && ctx.weapon.name) {
        const match = ctx.weapon.name.match(/\+(\d+)/);
        if (match) rating = parseInt(match[1]) || 0;
      }
      if (ctx.strMod < rating) {
        generalAtkMod -= 2;
        generalAtkBreakdown.push({ label: 'Ungenügende Stärke (Bogen)', value: -2 });
      }
    }
  }

  if (ctx.hasHaste) {
    generalAtkMod += 1;
    generalAtkBreakdown.push({ label: 'Zauber: Hast', value: 1 });
  }

  if (ctx.pc.isDefensiveFighting) {
    generalAtkMod -= 4;
    generalAtkBreakdown.push({ label: 'Verteidigend kämpfen', value: -4 });
  }

  if (ctx.isMelee) {
    if (ctx.paPenalty > 0) {
      generalAtkMod -= ctx.paPenalty;
      generalAtkBreakdown.push({ label: 'Heftiger Angriff (Power Attack)', value: -ctx.paPenalty });
    }
    if (ctx.cePenalty > 0) {
      generalAtkMod -= ctx.cePenalty;
      generalAtkBreakdown.push({ label: 'Kampfgetümmel (Expertise)', value: -ctx.cePenalty });
    }
  }

  const customAtkOffset = parseInt(ctx.weapon.attackBonus) || 0;
  if (customAtkOffset !== 0) {
    generalAtkMod += customAtkOffset;
    generalAtkBreakdown.push({ label: 'Waffen-Zusatz-Atk', value: customAtkOffset });
  }

  if (ctx.options.smite && ctx.isMelee) {
    const paladinClass = Array.isArray(ctx.pc.classes) && ctx.pc.classes.find(c => c.classType === 'paladin');
    if (paladinClass) {
      if (ctx.chaMod > 0) {
        generalAtkMod += ctx.chaMod;
        generalAtkBreakdown.push({ label: 'Böses niederstrecken (CHA)', value: ctx.chaMod });
      }
    }
  }

  const sizeMod = (typeof ctx.pc.getSizeModifier === 'function') ? ctx.pc.getSizeModifier() : 0;
  if (sizeMod !== 0) {
    generalAtkMod += sizeMod;
    generalAtkBreakdown.push({ label: 'Größenmodifikator', value: sizeMod });
  }

  return { generalAtkMod, generalAtkBreakdown };
}

export function calculateGeneralDmgModifiers(ctx) {
  let generalDmgMod = 0;
  const generalDmgBreakdown = [];

  const enh = parseInt(ctx.weapon.enhancement) || 0;
  if (enh > 0) {
    generalDmgMod += enh;
    generalDmgBreakdown.push({ label: 'Waffen-Effekt', value: enh });
  }

  if (ctx.pc.feats) {
    ctx.pc.feats.forEach(feat => {
      if (feat.id === 'weapon_specialization' && feat.option && matchesFeatOption(ctx.weapon, feat.option)) {
        generalDmgMod += 2;
        generalDmgBreakdown.push({ label: `Talent: Waffenspezialisierung (${feat.option})`, value: 2 });
      }
      if (feat.id === 'greater_weapon_specialization' && feat.option && matchesFeatOption(ctx.weapon, feat.option)) {
        generalDmgMod += 2;
        generalDmgBreakdown.push({ label: `Talent: Mächtige Waffenspezialisierung (${feat.option})`, value: 2 });
      }
    });
  }

  if (ctx.isRanged && ctx.hasFeat('point_blank_shot')) {
    generalDmgMod += 1;
    generalDmgBreakdown.push({ label: 'Talent: Nahschuss', value: 1 });
  }

  let paDmgBonus = 0;
  if (ctx.isMelee && ctx.paPenalty > 0) {
    if (ctx.isOffhand || (ctx.isLight && !ctx.isUnarmed && !ctx.isNatural)) {
      paDmgBonus = 0;
    } else if (ctx.weapon.grip === '2h' && !ctx.weapon.isDoubleWielded) {
      paDmgBonus = ctx.paPenalty * 2;
      generalDmgBreakdown.push({ label: 'Heftiger Angriff (PA 2-Hand x2)', value: paDmgBonus });
    } else {
      paDmgBonus = ctx.paPenalty;
      generalDmgBreakdown.push({ label: 'Heftiger Angriff (PA 1-Hand)', value: paDmgBonus });
    }
  }

  if (ctx.options.smite && ctx.isMelee) {
    const paladinClass = Array.isArray(ctx.pc.classes) && ctx.pc.classes.find(c => c.classType === 'paladin');
    if (paladinClass) {
      generalDmgMod += paladinClass.level;
      generalDmgBreakdown.push({ label: 'Böses niederstrecken (Stufe)', value: paladinClass.level });
    }
  }

  if (ctx.options.favoredEnemy) {
    const feBonus = ctx.pc.getFavoredEnemyBonus();
    if (feBonus > 0) {
      generalDmgMod += feBonus;
      generalDmgBreakdown.push({ label: 'Erzfeind-Bonus', value: feBonus });
    }
  }

  return { generalDmgMod, generalDmgBreakdown, paDmgBonus };
}
