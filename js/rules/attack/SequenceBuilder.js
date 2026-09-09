/**
 * @module    SequenceBuilder
 * @summary   Constructs the list of attack objects with their respective roll formulas and breakdown entries.
 * @exports   buildPrimarySequence(...), appendHasteAttack(...), appendRapidShotAttack(...), appendFlurryAttacks(...), appendOffhandAttacks(...)
 * @reads     ctx.isRanged, ctx.isMelee, ctx.isLight, ctx.isUnarmed, ctx.isNatural, ctx.isOffhand, ctx.weapon, ctx.pc
 * @stateOps  none
 * @depends   WeaponRegistry, isLightWeapon, matchesFeatOption (../../models/Weapon.js), buildFinalDamageDiceAndBreakdown (./DamageFormulaBuilder.js)
 * @notHere   Modifier calculation -> ModifierCalculator.js
 */

import { WeaponRegistry, isLightWeapon, matchesFeatOption } from '../../models/Weapon.js';
import { buildFinalDamageDiceAndBreakdown } from './DamageFormulaBuilder.js';

export function buildPrimarySequence(ctx, baseAttacks, generalAtkMod, generalAtkBreakdown, activeAtkPenalties, activeAtkPenaltyBreakdowns, generalDmgMod, generalDmgBreakdown, paDmgBonus, sequence) {
  baseAttacks.forEach((baseAtk, index) => {
    let atkAbilityMod = ctx.isRanged ? ctx.dexMod : ctx.strMod;
    let atkAbilityLabel = ctx.isRanged ? 'DEX' : 'STR';

    if (ctx.isMelee && ctx.hasFeat('weapon_finesse') && ctx.isLight && ctx.dexMod > ctx.strMod) {
      atkAbilityMod = ctx.dexMod;
      atkAbilityLabel = 'DEX (Finesse)';
    }

    let dmgAbilityMod = 0;
    let dmgAbilityLabel = 'STR';

    if (ctx.isRanged) {
      const typeDef = WeaponRegistry[ctx.weapon.type] || WeaponRegistry.longsword;
      if (typeDef.isCrossbow) {
        dmgAbilityMod = 0;
        dmgAbilityLabel = 'Ranged (Crossbow: no STR)';
      } else if (typeDef.isBow) {
        dmgAbilityMod = Math.min(0, ctx.strMod);
        dmgAbilityLabel = ctx.strMod < 0 ? 'STR Penalty' : 'Ranged (Bow: no STR bonus)';
      } else if (typeDef.isComposite) {
        let rating = parseInt(ctx.weapon.strengthRating) || 0;
        if (!rating && ctx.weapon.name) {
          const match = ctx.weapon.name.match(/\+(\d+)/);
          if (match) rating = parseInt(match[1]) || 0;
        }
        if (ctx.strMod < rating) {
          dmgAbilityMod = ctx.strMod;
          dmgAbilityLabel = `STR (Composite Penalty: ${ctx.strMod} < +${rating})`;
        } else {
          dmgAbilityMod = rating;
          dmgAbilityLabel = `STR (Composite Max +${rating})`;
        }
      } else {
        dmgAbilityMod = ctx.strMod;
        dmgAbilityLabel = 'STR';
      }
    } else if (ctx.isFlurryingThis) {
      dmgAbilityMod = ctx.strMod;
      dmgAbilityLabel = 'STR (Flurry 1.0x)';
    } else {
      if (ctx.weapon.grip === '2h' && !ctx.weapon.isDoubleWielded) {
        dmgAbilityMod = Math.floor(ctx.strMod * 1.5);
        dmgAbilityLabel = 'STR (Two-Handed ×1.5)';
      } else if (ctx.isOffhand) {
        dmgAbilityMod = Math.floor(ctx.strMod * 0.5);
        dmgAbilityLabel = 'STR (Off-Hand ×0.5)';
      } else {
        dmgAbilityMod = ctx.strMod;
        dmgAbilityLabel = 'STR';
      }
    }

    const atkTotal = baseAtk + atkAbilityMod + generalAtkMod + activeAtkPenalties;
    const dmgTotal = dmgAbilityMod + generalDmgMod + paDmgBonus;

    const atkBreakdown = [
      { label: `Base Attack Bonus (BAB #${index + 1})`, value: baseAtk },
      { label: `${atkAbilityLabel} Modifier`, value: atkAbilityMod },
      ...generalAtkBreakdown,
      ...activeAtkPenaltyBreakdowns
    ];

    const dmgBreakdown = [
      { label: dmgAbilityLabel, value: dmgAbilityMod },
      ...generalDmgBreakdown
    ];
    if (paDmgBonus > 0) {
      dmgBreakdown.push({ label: 'Power Attack', value: paDmgBonus });
    }

    sequence.push({
      name: ctx.isNatural ? `${ctx.weapon.name} (Attack #${index + 1})` : `Main Hand Attack #${index + 1}`,
      atkTotal,
      atkBreakdown,
      dmgTotal,
      dmgBreakdown,
      damageDice: buildFinalDamageDiceAndBreakdown(ctx, ctx.pc.getWeaponDamageDice(ctx.weapon) || '1w6', dmgBreakdown, ctx.weapon),
      extraDamage: ctx.weapon.extraDamage
    });
  });
}

export function appendHasteAttack(ctx, generalAtkMod, generalAtkBreakdown, activeAtkPenalties, activeAtkPenaltyBreakdowns, generalDmgMod, generalDmgBreakdown, paDmgBonus, sequence) {
  const baseAtk = ctx.babVal;
  let atkAbilityMod = ctx.strMod;
  let atkAbilityLabel = 'STR';
  if (ctx.hasFeat('weapon_finesse') && ctx.isLight && ctx.dexMod > ctx.strMod) {
    atkAbilityMod = ctx.dexMod;
    atkAbilityLabel = 'DEX (Finesse)';
  }
  
  const atkTotal = baseAtk + atkAbilityMod + generalAtkMod + activeAtkPenalties;
  
  const atkBreakdown = [
    { label: 'Base Attack Bonus (BAB)', value: baseAtk },
    { label: `${atkAbilityLabel} Modifier`, value: atkAbilityMod },
    ...generalAtkBreakdown,
    ...activeAtkPenaltyBreakdowns
  ];

  let dmgAbilityMod = ctx.strMod;
  let dmgAbilityLabel = 'STR';
  if (ctx.isFlurryingThis) {
    dmgAbilityMod = ctx.strMod;
    dmgAbilityLabel = 'STR (Flurry 1.0x)';
  } else if (ctx.weapon.grip === '2h' && !ctx.weapon.isDoubleWielded) {
    dmgAbilityMod = Math.floor(ctx.strMod * 1.5);
    dmgAbilityLabel = 'STR (Two-Handed ×1.5)';
  } else if (ctx.isOffhand) {
    dmgAbilityMod = Math.floor(ctx.strMod * 0.5);
    dmgAbilityLabel = 'STR (Off-Hand ×0.5)';
  }

  const dmgTotal = dmgAbilityMod + generalDmgMod + paDmgBonus;
  const dmgBreakdown = [
    { label: dmgAbilityLabel, value: dmgAbilityMod },
    ...generalDmgBreakdown
  ];
  if (paDmgBonus > 0) {
    dmgBreakdown.push({ label: 'Power Attack', value: paDmgBonus });
  }

  sequence.push({
    name: 'Haste Bonus Attack',
    atkTotal,
    atkBreakdown,
    dmgTotal,
    dmgBreakdown,
    damageDice: buildFinalDamageDiceAndBreakdown(ctx, ctx.pc.getWeaponDamageDice(ctx.weapon) || '1w6', dmgBreakdown, ctx.weapon),
    extraDamage: ctx.weapon.extraDamage
  });
}

export function appendRapidShotAttack(ctx, generalAtkMod, generalAtkBreakdown, activeAtkPenalties, activeAtkPenaltyBreakdowns, generalDmgMod, generalDmgBreakdown, sequence) {
  const baseAtk = ctx.babVal;
  const atkAbilityMod = ctx.dexMod;
  const atkAbilityLabel = 'DEX';
  
  const atkTotal = baseAtk + atkAbilityMod + generalAtkMod + activeAtkPenalties;
  
  const atkBreakdown = [
    { label: 'Base Attack Bonus (BAB)', value: baseAtk },
    { label: `${atkAbilityLabel} Modifier`, value: atkAbilityMod },
    ...generalAtkBreakdown,
    ...activeAtkPenaltyBreakdowns
  ];

  let dmgAbilityMod = 0;
  let dmgAbilityLabel = 'STR';
  const typeDef = WeaponRegistry[ctx.weapon.type] || WeaponRegistry.longsword;
  if (typeDef.isCrossbow) {
    dmgAbilityMod = 0;
    dmgAbilityLabel = 'Ranged (Crossbow: no STR)';
  } else if (typeDef.isBow) {
    dmgAbilityMod = Math.min(0, ctx.strMod);
    dmgAbilityLabel = ctx.strMod < 0 ? 'STR Penalty' : 'Ranged (Bow: no STR bonus)';
  } else if (typeDef.isComposite) {
    let rating = parseInt(ctx.weapon.strengthRating) || 0;
    if (!rating && ctx.weapon.name) {
      const match = ctx.weapon.name.match(/\+(\d+)/);
      if (match) rating = parseInt(match[1]) || 0;
    }
    if (ctx.strMod < rating) {
      dmgAbilityMod = ctx.strMod;
      dmgAbilityLabel = `STR (Composite Penalty: ${ctx.strMod} < +${rating})`;
    } else {
      dmgAbilityMod = rating;
      dmgAbilityLabel = `STR (Composite Max +${rating})`;
    }
  }

  const dmgTotal = dmgAbilityMod + generalDmgMod;
  const dmgBreakdown = [
    { label: dmgAbilityLabel, value: dmgAbilityMod },
    ...generalDmgBreakdown
  ];

  sequence.push({
    name: 'Rapid Shot Extra Attack',
    atkTotal,
    atkBreakdown,
    dmgTotal,
    dmgBreakdown,
    damageDice: buildFinalDamageDiceAndBreakdown(ctx, ctx.pc.getWeaponDamageDice(ctx.weapon) || '1w6', dmgBreakdown, ctx.weapon),
    extraDamage: ctx.weapon.extraDamage
  });
}

export function appendFlurryAttacks(ctx, generalAtkMod, generalAtkBreakdown, activeAtkPenalties, activeAtkPenaltyBreakdowns, generalDmgMod, generalDmgBreakdown, paDmgBonus, sequence) {
  const monkClass = Array.isArray(ctx.pc.classes) && ctx.pc.classes.find(c => c.classType === 'monk');
  if (!monkClass) return;
  const extraCount = monkClass.level >= 11 ? 2 : 1;
  
  for (let i = 0; i < extraCount; i++) {
    const baseAtk = ctx.babVal;
    let atkAbilityMod = ctx.strMod;
    let atkAbilityLabel = 'STR';
    if (ctx.hasFeat('weapon_finesse') && ctx.isLight && ctx.dexMod > ctx.strMod) {
      atkAbilityMod = ctx.dexMod;
      atkAbilityLabel = 'DEX (Finesse)';
    }

    const atkTotal = baseAtk + atkAbilityMod + generalAtkMod + activeAtkPenalties;
    
    const atkBreakdown = [
      { label: `Flurry Extra #${i + 1}`, value: baseAtk },
      { label: `${atkAbilityLabel} Modifier`, value: atkAbilityMod },
      ...generalAtkBreakdown,
      ...activeAtkPenaltyBreakdowns
    ];

    const dmgTotal = ctx.strMod + generalDmgMod + paDmgBonus;
    const dmgBreakdown = [
      { label: 'STR (Flurry 1.0x)', value: ctx.strMod },
      ...generalDmgBreakdown
    ];
    if (paDmgBonus > 0) {
      dmgBreakdown.push({ label: 'Power Attack', value: paDmgBonus });
    }

    sequence.push({
      name: `Flurry of Blows Extra Attack #${i + 1}`,
      atkTotal,
      atkBreakdown,
      dmgTotal,
      dmgBreakdown,
      damageDice: buildFinalDamageDiceAndBreakdown(ctx, ctx.pc.getWeaponDamageDice(ctx.weapon) || '1w6', dmgBreakdown, ctx.weapon),
      extraDamage: ctx.weapon.extraDamage
    });
  }
}

export function appendOffhandAttacks(ctx, twfPenalties, sequence) {
  const offhandWeapon = ctx.weapon.isDoubleWielded ? ctx.weapon : (ctx.pc.weapons ? ctx.pc.weapons.find(w => w.id !== ctx.weapon.id && (w.grip === 'sec' || (w.isEquipped && w.hand === 'off'))) : null);
  if (!offhandWeapon) return;

  const ohEnh = parseInt(offhandWeapon.enhancement) || 0;
  const isOhLight = isLightWeapon(offhandWeapon) || offhandWeapon.isDoubleWielded;
  
  let ohAtkMod = ohEnh;
  const ohAtkBreakdown = [];
  if (ohEnh > 0) ohAtkBreakdown.push({ label: 'Weapon Enhancement', value: ohEnh });

  let ohDmgMod = ohEnh;
  const ohDmgBreakdown = [];
  if (ohEnh > 0) ohDmgBreakdown.push({ label: 'Weapon Enhancement', value: ohEnh });

  if (ctx.pc.feats) {
    ctx.pc.feats.forEach(feat => {
      if (feat.id === 'weapon_focus' && feat.option && matchesFeatOption(offhandWeapon, feat.option)) {
        ohAtkMod += 1;
        ohAtkBreakdown.push({ label: `Weapon Focus (${feat.option})`, value: 1 });
      }
      if (feat.id === 'greater_weapon_focus' && feat.option && matchesFeatOption(offhandWeapon, feat.option)) {
        ohAtkMod += 1;
        ohAtkBreakdown.push({ label: `Greater Weapon Focus (${feat.option})`, value: 1 });
      }
      if (feat.id === 'weapon_specialization' && feat.option && matchesFeatOption(offhandWeapon, feat.option)) {
        ohDmgMod += 2;
        ohDmgBreakdown.push({ label: `Weapon Specialization (${feat.option})`, value: 2 });
      }
      if (feat.id === 'greater_weapon_specialization' && feat.option && matchesFeatOption(offhandWeapon, feat.option)) {
        ohDmgMod += 2;
        ohDmgBreakdown.push({ label: `Greater Weapon Specialization (${feat.option})`, value: 2 });
      }
    });
  }

  if (ctx.hasHaste) {
    ohAtkMod += 1;
    ohAtkBreakdown.push({ label: 'Haste', value: 1 });
  }

  if (ctx.paPenalty > 0) {
    ohAtkMod -= ctx.paPenalty;
    ohAtkBreakdown.push({ label: 'Power Attack', value: -ctx.paPenalty });
  }
  if (ctx.cePenalty > 0) {
    ohAtkMod -= ctx.cePenalty;
    ohAtkBreakdown.push({ label: 'Combat Expertise', value: -ctx.cePenalty });
  }

  const ohCustomAtk = parseInt(offhandWeapon.attackBonus) || 0;
  if (ohCustomAtk !== 0) {
    ohAtkMod += ohCustomAtk;
    ohAtkBreakdown.push({ label: 'Weapon Attack Bonus', value: ohCustomAtk });
  }

  if (ctx.options.smite) {
    const paladinClass = Array.isArray(ctx.pc.classes) && ctx.pc.classes.find(c => c.classType === 'paladin');
    if (paladinClass) {
      if (ctx.chaMod > 0) {
        ohAtkMod += ctx.chaMod;
        ohAtkBreakdown.push({ label: 'Smite Evil (CHA)', value: ctx.chaMod });
      }
    }
  }

  if (ctx.options.favoredEnemy) {
    const feBonus = ctx.pc.getFavoredEnemyBonus();
    if (feBonus > 0) {
      ohDmgMod += feBonus;
      ohDmgBreakdown.push({ label: 'Favored Enemy Bonus', value: feBonus });
    }
  }

  let offhandBases = [ctx.babVal];
  if (ctx.hasFeat('improved_two_weapon_fighting') && ctx.babVal >= 6) {
    offhandBases.push(ctx.babVal - 5);
  }
  if (ctx.hasFeat('greater_two_weapon_fighting') && ctx.babVal >= 11) {
    offhandBases.push(ctx.babVal - 10);
  }

  offhandBases.forEach((ohBaseAtk, index) => {
    const typeDef = WeaponRegistry[offhandWeapon.type] || WeaponRegistry.longsword;
    const isOhRanged = offhandWeapon.grip === 'rng';

    let atkAbilityMod = ctx.strMod;
    let atkAbilityLabel = 'STR';
    if (isOhRanged) {
      atkAbilityMod = ctx.dexMod;
      atkAbilityLabel = 'DEX';
    } else if (ctx.hasFeat('weapon_finesse') && isOhLight && ctx.dexMod > ctx.strMod) {
      atkAbilityMod = ctx.dexMod;
      atkAbilityLabel = 'DEX (Finesse)';
    }

    const atkTotal = ohBaseAtk + atkAbilityMod + ohAtkMod + twfPenalties.offhand;

    let dmgAbilityMod = 0;
    let dmgAbilityLabel = 'STR';

    if (isOhRanged) {
      if (typeDef.isCrossbow) {
        dmgAbilityMod = 0;
        dmgAbilityLabel = 'Ranged Off-Hand (Crossbow: no STR)';
      } else if (typeDef.isBow) {
        dmgAbilityMod = Math.min(0, ctx.strMod);
        dmgAbilityLabel = ctx.strMod < 0 ? 'STR Penalty' : 'Ranged Off-Hand (Bow: no STR bonus)';
      } else if (typeDef.isComposite) {
        let rating = parseInt(offhandWeapon.strengthRating) || 0;
        if (!rating && offhandWeapon.name) {
          const match = offhandWeapon.name.match(/\+(\d+)/);
          if (match) rating = parseInt(match[1]) || 0;
        }
        if (ctx.strMod < 0) {
          dmgAbilityMod = ctx.strMod;
          dmgAbilityLabel = `STR (Composite Penalty: ${ctx.strMod})`;
        } else {
          const allowedBonus = Math.min(ctx.strMod, rating);
          dmgAbilityMod = Math.floor(allowedBonus * 0.5);
          dmgAbilityLabel = `STR (Composite Off-Hand Max +${rating} ×0.5)`;
        }
      } else {
        // Sling, Thrown, or other ranged (slings & thrown add STR, negative is full, positive is half)
        if (ctx.strMod < 0) {
          dmgAbilityMod = ctx.strMod;
          dmgAbilityLabel = 'STR Penalty';
        } else {
          dmgAbilityMod = Math.floor(ctx.strMod * 0.5);
          dmgAbilityLabel = 'STR (Off-Hand ×0.5)';
        }
      }
    } else {
      dmgAbilityMod = Math.floor(ctx.strMod * 0.5);
      dmgAbilityLabel = 'STR (Off-Hand ×0.5)';
    }

    const dmgTotal = dmgAbilityMod + ohDmgMod;

    const atkBreakdown = [
      { label: `Off-Hand Attack (BAB #${index + 1})`, value: ohBaseAtk },
      { label: `${atkAbilityLabel} Modifier`, value: atkAbilityMod },
      ...ohAtkBreakdown,
      { label: 'Two-Weapon Fighting Penalty', value: twfPenalties.offhand }
    ];

    const dmgBreakdown = [
      { label: dmgAbilityLabel, value: dmgAbilityMod },
      ...ohDmgBreakdown
    ];

    sequence.push({
      name: ctx.weapon.isDoubleWielded ? `Off-Hand Attack #${index + 1} (Secondary)` : `Off-Hand Attack #${index + 1} (${offhandWeapon.name})`,
      atkTotal,
      atkBreakdown,
      dmgTotal,
      dmgBreakdown,
      damageDice: buildFinalDamageDiceAndBreakdown(ctx, ctx.pc.getWeaponDamageDice(offhandWeapon) || '1w6', dmgBreakdown, offhandWeapon),
      extraDamage: offhandWeapon.extraDamage,
      isOffhand: true
    });
  });
}

