export const WeaponRegistry = {
  // Melee - Light
  dagger: { key: 'dagger', nameDe: 'Dolch', nameEn: 'Dagger', grip: '1h', damageDice: '1w4', crit: '19-20 / x2', isLight: true },
  shortsword: { key: 'shortsword', nameDe: 'Kurzschwert', nameEn: 'Shortsword', grip: '1h', damageDice: '1w6', crit: '19-20 / x2', isLight: true },
  handaxe: { key: 'handaxe', nameDe: 'Handbeil', nameEn: 'Handaxe', grip: '1h', damageDice: '1w6', crit: 'x3', isLight: true },
  sickle: { key: 'sickle', nameDe: 'Sichel', nameEn: 'Sickle', grip: '1h', damageDice: '1w6', crit: 'x2', isLight: true },
  light_mace: { key: 'light_mace', nameDe: 'Leichte Keule', nameEn: 'Light Mace', grip: '1h', damageDice: '1w6', crit: 'x2', isLight: true },
  unarmed_strike: { key: 'unarmed_strike', nameDe: 'Waffenlos', nameEn: 'Unarmed Strike', grip: 'unarmed', damageDice: '1w3', crit: 'x2', isLight: true, isMonk: true },

  // Melee - One-Handed
  longsword: { key: 'longsword', nameDe: 'Langschwert', nameEn: 'Longsword', grip: '1h', damageDice: '1w8', crit: '19-20 / x2' },
  rapier: { key: 'rapier', nameDe: 'Rapier', nameEn: 'Rapier', grip: '1h', damageDice: '1w6', crit: '18-20 / x2', isLight: true }, // rapier is finessable
  battleaxe: { key: 'battleaxe', nameDe: 'Streitaxt', nameEn: 'Battleaxe', grip: '1h', damageDice: '1w8', crit: 'x3' },
  heavy_mace: { key: 'heavy_mace', nameDe: 'Streitkolben', nameEn: 'Heavy Mace', grip: '1h', damageDice: '1w8', crit: 'x2' },
  club: { key: 'club', nameDe: 'Keule', nameEn: 'Club', grip: '1h', damageDice: '1w6', crit: 'x2' },
  shortspear: { key: 'shortspear', nameDe: 'Kurzspeer', nameEn: 'Shortspear', grip: '1h', damageDice: '1w6', crit: 'x2' },
  morningstar: { key: 'morningstar', nameDe: 'Morgenstern', nameEn: 'Morningstar', grip: '1h', damageDice: '1w8', crit: 'x2' },
  scimitar: { key: 'scimitar', nameDe: 'Krummsäbel', nameEn: 'Scimitar', grip: '1h', damageDice: '1w6', crit: '18-20 / x2' },
  whip: { key: 'whip', nameDe: 'Peitsche', nameEn: 'Whip', grip: '1h', damageDice: '1w3', crit: 'x2', isLight: true }, // whip is finessable

  // Melee - Two-Handed
  greatsword: { key: 'greatsword', nameDe: 'Zweihänder', nameEn: 'Greatsword', grip: '2h', damageDice: '2w6', crit: '19-20 / x2' },
  greataxe: { key: 'greataxe', nameDe: 'Zweihändige Axt', nameEn: 'Greataxe', grip: '2h', damageDice: '1w12', crit: 'x3' },
  spear: { key: 'spear', nameDe: 'Speer', nameEn: 'Speer', grip: '2h', damageDice: '1w8', crit: 'x3' },
  halberd: { key: 'halberd', nameDe: 'Hellebarde', nameEn: 'Halberd', grip: '2h', damageDice: '1w10', crit: 'x3' },
  scythe: { key: 'scythe', nameDe: 'Sense', nameEn: 'Scythe', grip: '2h', damageDice: '2w4', crit: 'x4' },
  quarterstaff: { key: 'quarterstaff', nameDe: 'Kampfstab', nameEn: 'Quarterstaff', grip: '2h', damageDice: '1w6', crit: 'x2', isMonk: true },
  spiked_chain: { key: 'spiked_chain', nameDe: 'Dornenkette', nameEn: 'Spiked Chain', grip: '2h', damageDice: '2w4', crit: 'x2', isLight: true }, // spiked chain is finessable

  // Ranged
  shortbow: { key: 'shortbow', nameDe: 'Kurzbogen', nameEn: 'Shortbow', grip: 'rng', damageDice: '1w6', crit: 'x3', isBow: true },
  longbow: { key: 'longbow', nameDe: 'Langbogen', nameEn: 'Longbow', grip: 'rng', damageDice: '1w8', crit: 'x3', isBow: true },
  comp_shortbow: { key: 'comp_shortbow', nameDe: 'Komposit-Kurzbogen', nameEn: 'Composite Shortbow', grip: 'rng', damageDice: '1w6', crit: 'x3', isComposite: true },
  comp_longbow: { key: 'comp_longbow', nameDe: 'Komposit-Langbogen', nameEn: 'Composite Longbow', grip: 'rng', damageDice: '1w8', crit: 'x3', isComposite: true },
  light_crossbow: { key: 'light_crossbow', nameDe: 'Leichte Armbrust', nameEn: 'Light Crossbow', grip: 'rng', damageDice: '1w8', crit: '19-20 / x2', isCrossbow: true },
  heavy_crossbow: { key: 'heavy_crossbow', nameDe: 'Schwere Armbrust', nameEn: 'Heavy Crossbow', grip: 'rng', damageDice: '1w10', crit: '19-20 / x2', isCrossbow: true },
  hand_crossbow: { key: 'hand_crossbow', nameDe: 'Handarmbrust', nameEn: 'Hand Crossbow', grip: 'rng', damageDice: '1w4', crit: '19-20 / x2', isCrossbow: true },
  sling: { key: 'sling', nameDe: 'Schleuder', nameEn: 'Sling', grip: 'rng', damageDice: '1w4', crit: 'x2', isSling: true },
  throwing_dagger: { key: 'throwing_dagger', nameDe: 'Wurfdolch', nameEn: 'Throwing Dagger', grip: 'rng', damageDice: '1w4', crit: '19-20 / x2', isThrown: true },
  javelin: { key: 'javelin', nameDe: 'Wurfspeer', nameEn: 'Javelin', grip: 'rng', damageDice: '1w6', crit: 'x2', isThrown: true },

  // Generic/Custom
  other_melee_light: { key: 'other_melee_light', nameDe: 'Andere Nahkampfwaffe (leicht)', nameEn: 'Other Melee (light)', grip: '1h', damageDice: '1w6', crit: '20 / x2', isLight: true },
  other_melee_1h: { key: 'other_melee_1h', nameDe: 'Andere Nahkampfwaffe (1-händig)', nameEn: 'Other Melee (1-handed)', grip: '1h', damageDice: '1w8', crit: '20 / x2' },
  other_melee_2h: { key: 'other_melee_2h', nameDe: 'Andere Nahkampfwaffe (2-händig)', nameEn: 'Other Melee (2-handed)', grip: '2h', damageDice: '2w6', crit: '20 / x2' },
  other_ranged: { key: 'other_ranged', nameDe: 'Andere Fernkampfwaffe', nameEn: 'Other Ranged Weapon', grip: 'rng', damageDice: '1w6', crit: '20 / x2' }
};

/**
 * Encapsulates a weapon configuration inside PC inventory list.
 */
export class Weapon {
  constructor(w = {}) {
    this.id = w.id || (Date.now() + '-' + Math.random().toString(36).slice(2, 7));
    this.name = w.name || '';
    this.type = w.type;
    
    // Migration for old weapons
    if (!this.type) {
      const grip = w.grip || '1h';
      if (grip === 'rng') {
        const n = (w.name || '').toLowerCase();
        if (n.includes('composite') || n.includes('komposit')) {
          this.type = 'comp_longbow';
        } else if (n.includes('crossbow') || n.includes('armbrust')) {
          this.type = 'light_crossbow';
        } else {
          this.type = 'longbow';
        }
      } else if (grip === '2h') {
        this.type = 'greatsword';
      } else if (grip === 'unarmed') {
        this.type = 'unarmed_strike';
      } else {
        const n = (w.name || '').toLowerCase();
        if (n.includes('dolch') || n.includes('dagger')) {
          this.type = 'dagger';
        } else if (n.includes('rapier')) {
          this.type = 'rapier';
        } else {
          this.type = 'longsword';
        }
      }
    }

    this.enhancement = w.enhancement !== undefined ? parseInt(w.enhancement) : 0;
    this.attackBonus = w.attackBonus !== undefined ? w.attackBonus : ''; // Custom attack offset (e.g. +1 or -2)
    this.isKeen = w.isKeen || false; // Crit threat range doubler
    this.extraDamage = w.extraDamage || ''; // Extra damage dice (e.g. "1w6 Feuer")
    this.strengthRating = w.strengthRating !== undefined ? parseInt(w.strengthRating) : 0;

    // Overrides
    this.gripOverride = w.gripOverride || '';
    this.damageDiceOverride = w.damageDiceOverride || '';
    this.critOverride = w.critOverride || '';
  }

  get grip() {
    if (this.gripOverride) return this.gripOverride;
    const def = WeaponRegistry[this.type] || WeaponRegistry.longsword;
    return def.grip;
  }

  get damageDice() {
    if (this.damageDiceOverride) return this.damageDiceOverride;
    const def = WeaponRegistry[this.type] || WeaponRegistry.longsword;
    return def.damageDice;
  }

  get crit() {
    if (this.critOverride) return this.critOverride;
    const def = WeaponRegistry[this.type] || WeaponRegistry.longsword;
    return def.crit;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      enhancement: this.enhancement,
      attackBonus: this.attackBonus,
      isKeen: this.isKeen,
      extraDamage: this.extraDamage,
      strengthRating: this.strengthRating,
      gripOverride: this.gripOverride,
      damageDiceOverride: this.damageDiceOverride,
      critOverride: this.critOverride
    };
  }
}
