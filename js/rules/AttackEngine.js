import { WeaponRegistry } from '../models/Weapon.js';

// --- Pure Helper Functions (Module Scope) ---

function isLightWeapon(w) {
  if (!w) return false;
  if (typeof w === 'object') {
    const typeDef = WeaponRegistry[w.type];
    if (typeDef && typeDef.isLight !== undefined) {
      return typeDef.isLight;
    }
    return isLightWeapon(w.name);
  }
  const n = w.toLowerCase().trim();
  return n.includes('dolch') || n.includes('dagger') ||
         n.includes('kurzschwert') || n.includes('short sword') ||
         n.includes('handbeil') || n.includes('handaxe') ||
         n.includes('keule') || n.includes('mace') ||
         n.includes('sichel') || n.includes('sickle') ||
         n.includes('rapier') ||
         n.includes('peitsche') || n.includes('whip') ||
         n.includes('dornenkette') || n.includes('spiked chain') ||
         n.includes('waffenlos') || n.includes('faust') || n.includes('unarmed') ||
         n.includes('klaue') || n.includes('claw') ||
         n.includes('biss') || n.includes('bite');
}

function matchesFeatOption(w, option) {
  if (!option) return false;
  const opt = option.toLowerCase().trim();
  if (w.name && w.name.toLowerCase().includes(opt)) return true;
  if (w.type) {
    const typeDef = WeaponRegistry[w.type];
    if (typeDef) {
      if (typeDef.key.toLowerCase() === opt ||
          typeDef.nameDe.toLowerCase() === opt ||
          typeDef.nameEn.toLowerCase() === opt) {
        return true;
      }
      if (opt === 'langbogen' || opt === 'longbow') {
        if (typeDef.key === 'comp_longbow') return true;
      }
      if (opt === 'kurzbogen' || opt === 'shortbow') {
        if (typeDef.key === 'comp_shortbow') return true;
      }
    }
  }
  return false;
}

function isMonkWeapon(w, grip) {
  if (!w) return false;
  if (typeof w === 'object') {
    const typeDef = WeaponRegistry[w.type];
    if (typeDef && typeDef.isMonk !== undefined) {
      return typeDef.isMonk;
    }
    return isMonkWeapon(w.name, w.grip);
  }
  const name = w;
  if (grip === 'unarmed') return true;
  const n = name.toLowerCase().trim();
  return n.includes('waffenlos') || 
         n.includes('faust') || 
         n.includes('unarmed') || 
         n.includes('kama') || 
         n.includes('nunchaku') || 
         n.includes('kampfstab') || 
         n.includes('quarterstaff') || 
         n.includes('sai') || 
         n.includes('shuriken') || 
         n.includes('siangham');
}

/**
 * Builds the initial context object gathering and normalizing stats, modifiers, and flags
 */
function buildContext(pc, weapon, options) {
  const babVal = pc.bab.getValue();
  const strMod = pc.getAttributeMod('str');
  const dexMod = pc.getAttributeMod('dex');
  const chaMod = pc.getAttributeMod('cha');
  
  const isRanged = weapon.grip === 'rng';
  const isMelee = !isRanged;
  const isUnarmed = weapon.grip === 'unarmed';
  const isLight = isLightWeapon(weapon);

  const hasFeat = (featId) => Array.isArray(pc.feats) && pc.feats.some(f => f.id === featId);
  const hasBuff = (spellKey) => Array.isArray(pc.activeBuffs) && pc.activeBuffs.some(b => b.spellKey === spellKey);

  const hasPowerAttack = hasFeat('power_attack');
  const paPenalty = hasPowerAttack ? Math.min(babVal, parseInt(pc.powerAttackPenalty) || 0) : 0;
  const cePenalty = hasFeat('combat_expertise') ? Math.min(Math.min(5, babVal), parseInt(pc.combatExpertisePenalty) || 0) : 0;

  const hasHaste = hasBuff('haste');

  const isNatural = !!weapon.isNatural;
  const isSecondary = !!weapon.isSecondary || (isNatural && (
    weapon.name.toLowerCase().includes('kralle') || 
    weapon.name.toLowerCase().includes('claw') || 
    (weapon.name.toLowerCase().includes('biss') && pc.activeShape === 'bear') || 
    (weapon.name.toLowerCase().includes('bite') && pc.activeShape === 'bear')
  ));

  const isOffhand = weapon.grip === 'sec' || isSecondary;

  return {
    pc,
    weapon,
    options,
    babVal,
    strMod,
    dexMod,
    chaMod,
    isRanged,
    isMelee,
    isUnarmed,
    isLight,
    hasFeat,
    hasBuff,
    paPenalty,
    cePenalty,
    hasHaste,
    isNatural,
    isSecondary,
    isOffhand
  };
}

/**
 * Computes base iterative GAB attacks or natural attacks list
 */
function calculateBaseAttacks(ctx, isFullAttack) {
  const attacks = [];
  if (ctx.isNatural) {
    const baseAtkVal = ctx.isSecondary ? (ctx.babVal - 5) : ctx.babVal;
    attacks.push(baseAtkVal);
    if (isFullAttack && (ctx.weapon.numAttacksFull === 2 || ctx.weapon.name.toLowerCase().includes('kralle') || ctx.weapon.name.toLowerCase().includes('claw'))) {
      attacks.push(baseAtkVal);
    }
  } else {
    attacks.push(ctx.babVal);
    if (isFullAttack) {
      if (ctx.babVal >= 6) attacks.push(ctx.babVal - 5);
      if (ctx.babVal >= 11) attacks.push(ctx.babVal - 10);
      if (ctx.babVal >= 16) attacks.push(ctx.babVal - 15);
    }
  }
  return attacks;
}

/**
 * Calculates general attack modifiers and logs their breakdown
 */
function calculateGeneralAtkModifiers(ctx) {
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

  return { generalAtkMod, generalAtkBreakdown };
}

/**
 * Calculates general damage modifiers and logs their breakdown
 */
function calculateGeneralDmgModifiers(ctx) {
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
    } else if (ctx.weapon.grip === '2h') {
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

/**
 * Calculates Two-Weapon Fighting penalties and activation flags
 */
function calculateTWFPenalties(ctx, isFullAttack) {
  const hasSecWeapon = Array.isArray(ctx.pc.weapons) && ctx.pc.weapons.some(w => w.grip === 'sec');
  const isTWFActive = isFullAttack && ctx.isMelee && hasSecWeapon && !ctx.isNatural;

  let twfPenalties = { primary: 0, offhand: 0 };
  if (isTWFActive) {
    const hasTWFeat = ctx.hasFeat('two_weapon_fighting');
    const offhandWeapon = ctx.pc.weapons.find(w => w.grip === 'sec');
    const isOffhandLight = isLightWeapon(offhandWeapon);
    
    if (hasTWFeat) {
      twfPenalties = isOffhandLight ? { primary: -2, offhand: -2 } : { primary: -4, offhand: -4 };
    } else {
      twfPenalties = isOffhandLight ? { primary: -4, offhand: -8 } : { primary: -6, offhand: -10 };
    }
  }

  return { isTWFActive, twfPenalties };
}

/**
 * Calculates Monk Flurry and Rapid Shot penalties
 */
function calculateManeuverPenalties(ctx, isFullAttack) {
  const monkClass = Array.isArray(ctx.pc.classes) && ctx.pc.classes.find(c => c.classType === 'monk');
  const isFlurryingThis = isFullAttack && ctx.pc.isFlurrying && isMonkWeapon(ctx.weapon, ctx.weapon.grip) && !ctx.isNatural;
  let flurryPenalty = 0;
  if (isFlurryingThis && monkClass) {
    const mLvl = monkClass.level;
    flurryPenalty = mLvl >= 9 ? 0 : (mLvl >= 5 ? -1 : -2);
  }

  const isRapidShotThis = isFullAttack && ctx.isRanged && ctx.hasFeat('rapid_shot') && !ctx.isNatural;

  return { isFlurryingThis, flurryPenalty, isRapidShotThis };
}

function applySneakAttack(ctx, baseDmgDice, dmgBreakdown) {
  let finalDmgDice = baseDmgDice;
  if (ctx.options.sneakAttack) {
    const saDiceCount = ctx.pc.getSneakAttackDiceCount();
    if (saDiceCount > 0) {
      finalDmgDice = `${finalDmgDice} + ${saDiceCount}w6`;
      if (!dmgBreakdown.some(b => b.label.includes('Hinterhältiger Angriff'))) {
        dmgBreakdown.push({ label: `Hinterhältiger Angriff (${saDiceCount}W6)`, value: 0 });
      }
    }
  }
  return finalDmgDice;
}

/**
 * Appends standard primary-hand attacks to the sequence list
 */
function buildPrimarySequence(ctx, baseAttacks, generalAtkMod, generalAtkBreakdown, activeAtkPenalties, activeAtkPenaltyBreakdowns, generalDmgMod, generalDmgBreakdown, paDmgBonus, sequence) {
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
        dmgAbilityLabel = 'Fernkampf (Armbrust: kein STR)';
      } else if (typeDef.isBow) {
        dmgAbilityMod = Math.min(0, ctx.strMod);
        dmgAbilityLabel = ctx.strMod < 0 ? 'STR-Malus' : 'Fernkampf (Bogen: kein STR-Bonus)';
      } else if (typeDef.isComposite) {
        let rating = parseInt(ctx.weapon.strengthRating) || 0;
        if (!rating && ctx.weapon.name) {
          const match = ctx.weapon.name.match(/\+(\d+)/);
          if (match) rating = parseInt(match[1]) || 0;
        }
        if (ctx.strMod < rating) {
          dmgAbilityMod = ctx.strMod;
          dmgAbilityLabel = `STR (Komposit-Malus: ${ctx.strMod} < +${rating})`;
        } else {
          dmgAbilityMod = rating;
          dmgAbilityLabel = `STR (Komposit Max +${rating})`;
        }
      } else {
        dmgAbilityMod = ctx.strMod;
        dmgAbilityLabel = 'STR';
      }
    } else if (ctx.isFlurryingThis) {
      dmgAbilityMod = ctx.strMod;
      dmgAbilityLabel = 'STR (Flurry 1.0x)';
    } else {
      if (ctx.weapon.grip === '2h') {
        dmgAbilityMod = Math.floor(ctx.strMod * 1.5);
        dmgAbilityLabel = 'STR (2-Hand * 1.5)';
      } else if (ctx.isOffhand) {
        dmgAbilityMod = Math.floor(ctx.strMod * 0.5);
        dmgAbilityLabel = 'STR (Off-hand * 0.5)';
      } else {
        dmgAbilityMod = ctx.strMod;
        dmgAbilityLabel = 'STR';
      }
    }

    const atkTotal = baseAtk + atkAbilityMod + generalAtkMod + activeAtkPenalties;
    const dmgTotal = dmgAbilityMod + generalDmgMod + paDmgBonus;

    const atkBreakdown = [
      { label: `Basis-Angriff (BAB #${index + 1})`, value: baseAtk },
      { label: `${atkAbilityLabel}-Modifikator`, value: atkAbilityMod },
      ...generalAtkBreakdown,
      ...activeAtkPenaltyBreakdowns
    ];

    const dmgBreakdown = [
      { label: dmgAbilityLabel, value: dmgAbilityMod },
      ...generalDmgBreakdown
    ];
    if (paDmgBonus > 0) {
      dmgBreakdown.push({ label: 'Heftiger Angriff (Power Attack)', value: paDmgBonus });
    }

    sequence.push({
      name: ctx.isNatural ? `${ctx.weapon.name} (Angriff #${index + 1})` : `Haupthand-Angriff #${index + 1}`,
      atkTotal,
      atkBreakdown,
      dmgTotal,
      dmgBreakdown,
      damageDice: applySneakAttack(ctx, ctx.pc.getWeaponDamageDice(ctx.weapon) || '1w6', dmgBreakdown),
      extraDamage: ctx.weapon.extraDamage
    });
  });
}

/**
 * Appends haste bonus attack to the sequence list
 */
function appendHasteAttack(ctx, generalAtkMod, generalAtkBreakdown, activeAtkPenalties, activeAtkPenaltyBreakdowns, generalDmgMod, generalDmgBreakdown, paDmgBonus, sequence) {
  const baseAtk = ctx.babVal;
  let atkAbilityMod = ctx.strMod;
  let atkAbilityLabel = 'STR';
  if (ctx.hasFeat('weapon_finesse') && ctx.isLight && ctx.dexMod > ctx.strMod) {
    atkAbilityMod = ctx.dexMod;
    atkAbilityLabel = 'DEX (Finesse)';
  }
  
  const atkTotal = baseAtk + atkAbilityMod + generalAtkMod + activeAtkPenalties;
  
  const atkBreakdown = [
    { label: 'Basis-Angriff (BAB)', value: baseAtk },
    { label: `${atkAbilityLabel}-Modifikator`, value: atkAbilityMod },
    ...generalAtkBreakdown,
    ...activeAtkPenaltyBreakdowns
  ];

  let dmgAbilityMod = ctx.strMod;
  let dmgAbilityLabel = 'STR';
  if (ctx.isFlurryingThis) {
    dmgAbilityMod = ctx.strMod;
    dmgAbilityLabel = 'STR (Flurry 1.0x)';
  } else if (ctx.weapon.grip === '2h') {
    dmgAbilityMod = Math.floor(ctx.strMod * 1.5);
    dmgAbilityLabel = 'STR (2-Hand * 1.5)';
  } else if (ctx.isOffhand) {
    dmgAbilityMod = Math.floor(ctx.strMod * 0.5);
    dmgAbilityLabel = 'STR (Off-hand * 0.5)';
  }

  const dmgTotal = dmgAbilityMod + generalDmgMod + paDmgBonus;
  const dmgBreakdown = [
    { label: dmgAbilityLabel, value: dmgAbilityMod },
    ...generalDmgBreakdown
  ];
  if (paDmgBonus > 0) {
    dmgBreakdown.push({ label: 'Heftiger Angriff (Power Attack)', value: paDmgBonus });
  }

  sequence.push({
    name: 'Hast-Bonusangriff',
    atkTotal,
    atkBreakdown,
    dmgTotal,
    dmgBreakdown,
    damageDice: applySneakAttack(ctx, ctx.pc.getWeaponDamageDice(ctx.weapon) || '1w6', dmgBreakdown),
    extraDamage: ctx.weapon.extraDamage
  });
}

/**
 * Appends Rapid Shot extra attack to the sequence list
 */
function appendRapidShotAttack(ctx, generalAtkMod, generalAtkBreakdown, activeAtkPenalties, activeAtkPenaltyBreakdowns, generalDmgMod, generalDmgBreakdown, sequence) {
  const baseAtk = ctx.babVal;
  const atkAbilityMod = ctx.dexMod;
  const atkAbilityLabel = 'DEX';
  
  const atkTotal = baseAtk + atkAbilityMod + generalAtkMod + activeAtkPenalties;
  
  const atkBreakdown = [
    { label: 'Basis-Angriff (BAB)', value: baseAtk },
    { label: `${atkAbilityLabel}-Modifikator`, value: atkAbilityMod },
    ...generalAtkBreakdown,
    ...activeAtkPenaltyBreakdowns
  ];

  let dmgAbilityMod = 0;
  let dmgAbilityLabel = 'STR';
  const typeDef = WeaponRegistry[ctx.weapon.type] || WeaponRegistry.longsword;
  if (typeDef.isCrossbow) {
    dmgAbilityMod = 0;
    dmgAbilityLabel = 'Fernkampf (Armbrust: kein STR)';
  } else if (typeDef.isBow) {
    dmgAbilityMod = Math.min(0, ctx.strMod);
    dmgAbilityLabel = ctx.strMod < 0 ? 'STR-Malus' : 'Fernkampf (Bogen: kein STR-Bonus)';
  } else if (typeDef.isComposite) {
    let rating = parseInt(ctx.weapon.strengthRating) || 0;
    if (!rating && ctx.weapon.name) {
      const match = ctx.weapon.name.match(/\+(\d+)/);
      if (match) rating = parseInt(match[1]) || 0;
    }
    if (ctx.strMod < rating) {
      dmgAbilityMod = ctx.strMod;
      dmgAbilityLabel = `STR (Komposit-Malus: ${ctx.strMod} < +${rating})`;
    } else {
      dmgAbilityMod = rating;
      dmgAbilityLabel = `STR (Komposit Max +${rating})`;
    }
  }

  const dmgTotal = dmgAbilityMod + generalDmgMod;
  const dmgBreakdown = [
    { label: dmgAbilityLabel, value: dmgAbilityMod },
    ...generalDmgBreakdown
  ];

  sequence.push({
    name: 'Schnelles Schießen Extra-Angriff',
    atkTotal,
    atkBreakdown,
    dmgTotal,
    dmgBreakdown,
    damageDice: applySneakAttack(ctx, ctx.pc.getWeaponDamageDice(ctx.weapon) || '1w6', dmgBreakdown),
    extraDamage: ctx.weapon.extraDamage
  });
}

/**
 * Appends Monk Flurry of Blows attacks to the sequence list
 */
function appendFlurryAttacks(ctx, generalAtkMod, generalAtkBreakdown, activeAtkPenalties, activeAtkPenaltyBreakdowns, generalDmgMod, generalDmgBreakdown, paDmgBonus, sequence) {
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
      { label: `Schlaghagel Extra #${i + 1}`, value: baseAtk },
      { label: `${atkAbilityLabel}-Modifikator`, value: atkAbilityMod },
      ...generalAtkBreakdown,
      ...activeAtkPenaltyBreakdowns
    ];

    const dmgTotal = ctx.strMod + generalDmgMod + paDmgBonus;
    const dmgBreakdown = [
      { label: 'STR (Flurry 1.0x)', value: ctx.strMod },
      ...generalDmgBreakdown
    ];
    if (paDmgBonus > 0) {
      dmgBreakdown.push({ label: 'Heftiger Angriff (Power Attack)', value: paDmgBonus });
    }

    sequence.push({
      name: `Schlaghagel-Bonusangriff #${i + 1}`,
      atkTotal,
      atkBreakdown,
      dmgTotal,
      dmgBreakdown,
      damageDice: applySneakAttack(ctx, ctx.pc.getWeaponDamageDice(ctx.weapon) || '1w6', dmgBreakdown),
      extraDamage: ctx.weapon.extraDamage
    });
  }
}

/**
 * Appends Two-Weapon Fighting off-hand attacks to the sequence list
 */
function appendOffhandAttacks(ctx, twfPenalties, sequence) {
  const offhandWeapon = ctx.pc.weapons.find(w => w.grip === 'sec');
  if (!offhandWeapon) return;

  const ohEnh = parseInt(offhandWeapon.enhancement) || 0;
  const isOhLight = isLightWeapon(offhandWeapon);
  
  let ohAtkMod = ohEnh;
  const ohAtkBreakdown = [];
  if (ohEnh > 0) ohAtkBreakdown.push({ label: 'Waffen-Effekt', value: ohEnh });

  let ohDmgMod = ohEnh;
  const ohDmgBreakdown = [];
  if (ohEnh > 0) ohDmgBreakdown.push({ label: 'Waffen-Effekt', value: ohEnh });

  if (ctx.pc.feats) {
    ctx.pc.feats.forEach(feat => {
      if (feat.id === 'weapon_focus' && feat.option && matchesFeatOption(offhandWeapon, feat.option)) {
        ohAtkMod += 1;
        ohAtkBreakdown.push({ label: `Talent: Waffenfokus (${feat.option})`, value: 1 });
      }
      if (feat.id === 'greater_weapon_focus' && feat.option && matchesFeatOption(offhandWeapon, feat.option)) {
        ohAtkMod += 1;
        ohAtkBreakdown.push({ label: `Talent: Mächtiger Waffenfokus (${feat.option})`, value: 1 });
      }
      if (feat.id === 'weapon_specialization' && feat.option && matchesFeatOption(offhandWeapon, feat.option)) {
        ohDmgMod += 2;
        ohDmgBreakdown.push({ label: `Talent: Waffenspezialisierung (${feat.option})`, value: 2 });
      }
      if (feat.id === 'greater_weapon_specialization' && feat.option && matchesFeatOption(offhandWeapon, feat.option)) {
        ohDmgMod += 2;
        ohDmgBreakdown.push({ label: `Talent: Mächtige Waffenspezialisierung (${feat.option})`, value: 2 });
      }
    });
  }

  if (ctx.hasHaste) {
    ohAtkMod += 1;
    ohAtkBreakdown.push({ label: 'Zauber: Hast', value: 1 });
  }

  if (ctx.paPenalty > 0) {
    ohAtkMod -= ctx.paPenalty;
    ohAtkBreakdown.push({ label: 'Heftiger Angriff (Power Attack)', value: -ctx.paPenalty });
  }
  if (ctx.cePenalty > 0) {
    ohAtkMod -= ctx.cePenalty;
    ohAtkBreakdown.push({ label: 'Kampfgetümmel (Expertise)', value: -ctx.cePenalty });
  }

  const ohCustomAtk = parseInt(offhandWeapon.attackBonus) || 0;
  if (ohCustomAtk !== 0) {
    ohAtkMod += ohCustomAtk;
    ohAtkBreakdown.push({ label: 'Waffen-Zusatz-Atk', value: ohCustomAtk });
  }

  if (ctx.options.smite) {
    const paladinClass = Array.isArray(ctx.pc.classes) && ctx.pc.classes.find(c => c.classType === 'paladin');
    if (paladinClass) {
      if (ctx.chaMod > 0) {
        ohAtkMod += ctx.chaMod;
        ohAtkBreakdown.push({ label: 'Böses niederstrecken (CHA)', value: ctx.chaMod });
      }
    }
  }

  if (ctx.options.favoredEnemy) {
    const feBonus = ctx.pc.getFavoredEnemyBonus();
    if (feBonus > 0) {
      ohDmgMod += feBonus;
      ohDmgBreakdown.push({ label: 'Erzfeind-Bonus', value: feBonus });
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
    let atkAbilityMod = ctx.strMod;
    let atkAbilityLabel = 'STR';
    if (ctx.hasFeat('weapon_finesse') && isOhLight && ctx.dexMod > ctx.strMod) {
      atkAbilityMod = ctx.dexMod;
      atkAbilityLabel = 'DEX (Finesse)';
    }

    const atkTotal = ohBaseAtk + atkAbilityMod + ohAtkMod + twfPenalties.offhand;
    const dmgAbilityMod = Math.floor(ctx.strMod * 0.5);
    const dmgTotal = dmgAbilityMod + ohDmgMod;

    const atkBreakdown = [
      { label: `Nebenhand-Angriff (BAB #${index + 1})`, value: ohBaseAtk },
      { label: `${atkAbilityLabel}-Modifikator`, value: atkAbilityMod },
      ...ohAtkBreakdown,
      { label: 'Zwei-Waffen-Kampf-Abzug', value: twfPenalties.offhand }
    ];

    const dmgBreakdown = [
      { label: 'STR (Off-hand 0.5x)', value: dmgAbilityMod },
      ...ohDmgBreakdown
    ];

    sequence.push({
      name: `Nebenhand-Angriff #${index + 1} (${offhandWeapon.name})`,
      atkTotal,
      atkBreakdown,
      dmgTotal,
      dmgBreakdown,
      damageDice: applySneakAttack(ctx, ctx.pc.getWeaponDamageDice(offhandWeapon) || '1w6', dmgBreakdown),
      extraDamage: offhandWeapon.extraDamage,
      isOffhand: true
    });
  });
}

// --- Public API ---

export const AttackEngine = {
  /**
   * Generates a full sequence of attacks for standard or full round actions.
   *
   * @param {Combatant} pc The combatant character model
   * @param {Weapon|Object} weapon The weapon details or natural attack template
   * @param {Boolean} isFullAttack If true, computes multiple iterative/extra attacks
   * @param {Object} options Active options, e.g. { smite: true, favoredEnemy: true }
   * @returns {Array<Object>} List of attacks, each with rolls, modifiers, and breakdowns
   */
  calculateAttackSequence(pc, weapon, isFullAttack, options = {}) {
    const sequence = [];
    if (!pc || !weapon) return sequence;

    // 1. Gather all baseline attributes & statuses
    const ctx = buildContext(pc, weapon, options);

    // 2. Resolve basic BAB/natural attack counts
    const baseAttacks = calculateBaseAttacks(ctx, isFullAttack);

    // 3. Resolve active modifiers & bonuses
    const { generalAtkMod, generalAtkBreakdown } = calculateGeneralAtkModifiers(ctx);
    const { generalDmgMod, generalDmgBreakdown, paDmgBonus } = calculateGeneralDmgModifiers(ctx);

    // 4. Resolve penalties & specific states
    const { isTWFActive, twfPenalties } = calculateTWFPenalties(ctx, isFullAttack);
    ctx.isTWFActive = isTWFActive;
    ctx.twfPenalties = twfPenalties;

    const { isFlurryingThis, flurryPenalty, isRapidShotThis } = calculateManeuverPenalties(ctx, isFullAttack);
    ctx.isFlurryingThis = isFlurryingThis;
    ctx.flurryPenalty = flurryPenalty;
    ctx.isRapidShotThis = isRapidShotThis;

    // 5. Combine active modifiers for primary sequence
    const activeAtkPenalties = (isTWFActive ? twfPenalties.primary : 0) + 
                              (isFlurryingThis ? flurryPenalty : 0) + 
                              (isRapidShotThis ? -2 : 0);

    const activeAtkPenaltyBreakdowns = [];
    if (isTWFActive) activeAtkPenaltyBreakdowns.push({ label: 'Zwei-Waffen-Kampf-Abzug', value: twfPenalties.primary });
    if (isFlurryingThis) activeAtkPenaltyBreakdowns.push({ label: 'Schlaghagel-Abzug', value: flurryPenalty });
    if (isRapidShotThis) activeAtkPenaltyBreakdowns.push({ label: 'Talent: Schnelles Schießen', value: -2 });

    // 6. Generate standard primary sequence
    buildPrimarySequence(
      ctx, baseAttacks, generalAtkMod, generalAtkBreakdown,
      activeAtkPenalties, activeAtkPenaltyBreakdowns,
      generalDmgMod, generalDmgBreakdown, paDmgBonus,
      sequence
    );

    // 7. Append extra actions
    if (isFullAttack && ctx.hasHaste && ctx.isMelee) {
      appendHasteAttack(
        ctx, generalAtkMod, generalAtkBreakdown,
        activeAtkPenalties, activeAtkPenaltyBreakdowns,
        generalDmgMod, generalDmgBreakdown, paDmgBonus,
        sequence
      );
    }

    if (isFullAttack && ctx.isRapidShotThis) {
      appendRapidShotAttack(
        ctx, generalAtkMod, generalAtkBreakdown,
        activeAtkPenalties, activeAtkPenaltyBreakdowns,
        generalDmgMod, generalDmgBreakdown,
        sequence
      );
    }

    if (ctx.isFlurryingThis) {
      appendFlurryAttacks(
        ctx, generalAtkMod, generalAtkBreakdown,
        activeAtkPenalties, activeAtkPenaltyBreakdowns,
        generalDmgMod, generalDmgBreakdown, paDmgBonus,
        sequence
      );
    }

    if (isTWFActive) {
      appendOffhandAttacks(ctx, twfPenalties, sequence);
    }

    return sequence;
  }
};
