/**
 * @module    spellFailureHelper
 * @summary   Accurate, itemized Arcane Spell Failure (ASF) calculation complying with D&D 3.5e RAW rules.
 */

import { ARMOR_REGISTRY } from '@core/data/armor-data.js';

export interface ASFItem {
  id: string;
  name: string;
  type: string;
  asf: number;
  isShield: boolean;
  note?: string;
}

export interface ASFBreakdown {
  totalASF: number;
  isArcaneCaster: boolean;
  items: ASFItem[];
}

const ARCANE_CLASSES = [
  'wizard',
  'sorcerer',
  'bard',
  'beguiler',
  'duskblade',
  'assassin',
  'warmage',
  'wu_jen',
  'spellwarp_sniper',
];

export function getArcaneSpellFailureBreakdown(pc: any): ASFBreakdown {
  if (!pc || !Array.isArray(pc.classes) || pc.classes.length === 0) {
    return { totalASF: 0, isArcaneCaster: false, items: [] };
  }

  const arcaneClasses = pc.classes.filter((c: any) => ARCANE_CLASSES.includes(c.classType));
  const isArcaneCaster = arcaneClasses.length > 0;

  if (!isArcaneCaster) {
    return { totalASF: 0, isArcaneCaster: false, items: [] };
  }

  const isOnlyBard = arcaneClasses.every((c: any) => c.classType === 'bard');
  const isOnlyDuskblade = arcaneClasses.every((c: any) => c.classType === 'duskblade');
  const duskbladeLevel = pc.classes.find((c: any) => c.classType === 'duskblade')?.level || 0;

  const armors = Array.isArray(pc.armors) ? pc.armors : [];
  const equipped = armors.filter((a: any) => a && a.isEquipped);

  const items: ASFItem[] = [];
  let totalASF = 0;

  equipped.forEach((a: any) => {
    const def = (ARMOR_REGISTRY as any)[a.type];
    const isShield = a.isShield !== undefined ? !!a.isShield : (def ? !!def.isShield : false);
    const speedCat = a.speedCategory || def?.speedCategory || 'light';

    let rawAsf = 0;
    if (a.spellFailureOverride !== '' && a.spellFailureOverride !== undefined && a.spellFailureOverride !== null) {
      rawAsf = parseInt(a.spellFailureOverride) || 0;
    } else {
      let base = 0;
      if (typeof a.spellFailure === 'number') {
        base = a.spellFailure;
      } else if (def && typeof def.spellFailure === 'number') {
        base = def.spellFailure;
      }
      const aName = (a.name || '').toLowerCase();
      let reduction = 0;
      if (aName.includes('mithral') || aName.includes('mithril')) {
        reduction += 10;
      }
      if (aName.includes('twilight')) {
        reduction += 10;
      }
      rawAsf = Math.max(0, base - reduction);
    }

    let appliedAsf = rawAsf;
    let note: string | undefined;

    // Bard RAW: Bards ignore arcane spell failure from light armor
    if (isOnlyBard && !isShield && speedCat === 'light') {
      appliedAsf = 0;
      note = 'Ignored by Bard in light armor';
    }

    // Duskblade RAW: Duskblades ignore light armor at 1st level, shields at 4th, medium at 7th
    if (isOnlyDuskblade) {
      if (!isShield && speedCat === 'light') {
        appliedAsf = 0;
        note = 'Ignored by Duskblade in light armor';
      } else if (isShield && duskbladeLevel >= 4 && a.type !== 'tower_shield') {
        appliedAsf = 0;
        note = 'Ignored by Duskblade (Shield Proficiency Lv.4)';
      } else if (!isShield && speedCat === 'medium' && duskbladeLevel >= 7) {
        appliedAsf = 0;
        note = 'Ignored by Duskblade in medium armor (Lv.7)';
      }
    }

    if (rawAsf > 0 || appliedAsf > 0) {
      items.push({
        id: a.id || a.name,
        name: a.name || def?.name || (isShield ? 'Shield' : 'Armor'),
        type: a.type,
        asf: appliedAsf,
        isShield,
        note,
      });

      totalASF += appliedAsf;
    }
  });

  return {
    totalASF,
    isArcaneCaster,
    items,
  };
}
