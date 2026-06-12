/**
 * @module    AttackContext
 * @summary   Baut das initiale Kontext-Objekt auf und normalisiert Fähigkeiten, Toggles, Waffengriffe und Feat-Prüfungen.
 * @exports   buildContext(pc, weapon, options)
 * @reads     pc.bab, pc.feats, pc.str/dex/cha, pc.activeShape, pc.isSmiteActive, pc.isFavoredEnemyActive, pc.isSneakAttacking, weapon.*
 * @stateOps  keine
 * @depends   isLightWeapon (../../models/Weapon.js)
 * @notHere   Sequenz-Generierung -> SequenceBuilder.js
 */

import { isLightWeapon } from '../../models/Weapon.js';
import { CombatSpells } from '../../spells.js';

function getTypeLabel(type) {
  const labels = {
    morale: 'Moral',
    luck: 'Glück',
    dodge: 'Ausweichen',
    enhancement: 'Verbesserung',
    insight: 'Einsicht',
    sacred: 'Heilig',
    profane: 'Unheilig',
    untyped: 'Ohne Typ'
  };
  return labels[type] || type;
}

function resolveAtkDmgBuffs(pc, target) {
  const effects = [];
  
  if (Array.isArray(pc.activeBuffs)) {
    pc.activeBuffs.forEach(buff => {
      // If the buff already has resolved effects, we ONLY use those.
      // Otherwise, for backwards-compatibility, we look up the spell in the registry.
      if (Array.isArray(buff.effects)) {
        buff.effects.forEach(eff => {
          if (eff.target === target) {
            effects.push({
              value: parseInt(eff.value) || 0,
              type: eff.type || 'untyped',
              source: buff.name || eff.source || 'Eigener Buff'
            });
          }
        });
      } else if (buff.spellKey) {
        const spell = CombatSpells.REGISTRY?.[buff.spellKey];
        if (spell && Array.isArray(spell.effects)) {
          spell.effects.forEach(eff => {
            if (eff.target === target) {
              effects.push({
                value: parseInt(eff.value) || 0,
                type: eff.type || 'untyped',
                source: spell.nameDe || spell.nameEn || buff.name || 'Zauber'
              });
            }
          });
        }
      }
    });
  }

  const groupedBoni = {};
  let penaltiesSum = 0;
  const penalties = [];

  effects.forEach(eff => {
    if (eff.value < 0) {
      penaltiesSum += eff.value;
      penalties.push({
        label: `${eff.source} (${getTypeLabel(eff.type)})`,
        value: eff.value
      });
    } else if (eff.type === 'dodge' || eff.type === 'untyped') {
      const key = `${eff.type}_${eff.source}`;
      groupedBoni[key] = {
        value: (groupedBoni[key]?.value || 0) + eff.value,
        type: eff.type,
        source: eff.source,
        label: `${eff.source} (${getTypeLabel(eff.type)})`
      };
    } else {
      const existing = groupedBoni[eff.type];
      if (!existing || eff.value > existing.value) {
        groupedBoni[eff.type] = {
          value: eff.value,
          type: eff.type,
          source: eff.source,
          label: `${eff.source} (${getTypeLabel(eff.type)})`
        };
      }
    }
  });

  let bonusSum = 0;
  const breakdown = [];

  Object.values(groupedBoni).forEach(b => {
    bonusSum += b.value;
    breakdown.push({
      label: b.label,
      value: b.value
    });
  });

  penalties.forEach(p => {
    breakdown.push(p);
  });

  return {
    total: bonusSum + penaltiesSum,
    breakdown
  };
}

export function buildContext(pc, weapon, options = {}) {
  const normalizedOptions = {
    smite: options.smite !== undefined ? !!options.smite : !!pc.isSmiteActive,
    favoredEnemy: options.favoredEnemy !== undefined ? !!options.favoredEnemy : !!pc.isFavoredEnemyActive,
    sneakAttack: options.sneakAttack !== undefined ? !!options.sneakAttack : !!pc.isSneakAttacking,
    ...options
  };

  const babVal = pc.bab.getValue();
  const strMod = pc.getAttributeMod('str');
  const dexMod = pc.getAttributeMod('dex');
  const chaMod = pc.getAttributeMod('cha');
  
  const isRanged = weapon.grip === 'rng';
  const isMelee = !isRanged;
  const isUnarmed = weapon.grip === 'unarmed';
  const isLight = isLightWeapon(weapon);

  const hasFeat = (featId) => {
    if (Array.isArray(pc.feats) && pc.feats.some(f => f.id === featId)) {
      return true;
    }
    const armor = pc.getEquippedArmor ? pc.getEquippedArmor() : null;
    const speedCategory = armor ? armor.speedCategory : '';
    const isWearingMediumOrHeavy = speedCategory === 'medium' || speedCategory === 'heavy';
    if (!isWearingMediumOrHeavy) {
      const rangerClass = Array.isArray(pc.classes) && pc.classes.find(c => c.classType === 'ranger');
      const rangerLvl = rangerClass ? rangerClass.level : 0;
      if (rangerLvl >= 2 && pc.rangerCombatStyle === 'twoweapon') {
        if (featId === 'two_weapon_fighting' && rangerLvl >= 2) return true;
        if (featId === 'improved_two_weapon_fighting' && rangerLvl >= 6) return true;
        if (featId === 'greater_two_weapon_fighting' && rangerLvl >= 11) return true;
      }
    }
    return false;
  };
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

  const isOffhand = weapon.grip === 'sec' || isSecondary || weapon.hand === 'off' || !!normalizedOptions.isOffhandAttack;

  const atkResolution = resolveAtkDmgBuffs(pc, 'atk');
  const dmgResolution = resolveAtkDmgBuffs(pc, 'dmg');

  return {
    pc,
    weapon,
    options: normalizedOptions,
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
    isOffhand,
    buffAtkBonus: atkResolution.total,
    buffAtkBreakdown: atkResolution.breakdown,
    buffDmgBonus: dmgResolution.total,
    buffDmgBreakdown: dmgResolution.breakdown
  };
}
