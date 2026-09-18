/**
 * @module    BaseSavingThrowModifierApplier
 * @summary   Wendet Basis-Attributs-Modifikatoren, Ausrüstungs-Rüstung/Schild, Natural/Deflection AC und Misc-AC/Saves-Boni an.
 * @exports   applyBaseSavingThrowModifiers(pc, getMod)
 * @reads     pc.type, pc.con, pc.dex, pc.wis, pc.autoAC, pc.acNatural, pc.acDeflection, pc.acMisc, pc.zaMisc, pc.refMisc, pc.wilMisc
 * @stateOps  keine (mutiert Stat-Instanzen auf pc)
 * @depends   keine
 * @notHere   Item-Boni -> ItemModifierApplier.js | Buff-Boni -> SpellModifierApplier.js
 */

import { matchesShieldFeatOption } from '../../Armor.js';
import { ARMOR_REGISTRY } from '../../../data/armor-data.js';

export function applyBaseSavingThrowModifiers(pc, getMod) {
  // Apply basic attributes & misc modifiers on saves for player characters
  if (pc.type === 'p') {
    const hasFeat = (id) => (typeof pc.hasFeat === 'function' ? pc.hasFeat(id) : (Array.isArray(pc.feats) && pc.feats.some(f => (typeof f === 'string' ? f === id : f?.id === id))));

    pc.za.addModifier(getMod(pc.con), "untyped", "Konstitutions-Modifikator");
    pc.za.modifiers[pc.za.modifiers.length - 1].isClass = true;

    // Reflex: Insightful Reflexes uses INT modifier instead of DEX
    if (hasFeat('insightful_reflexes')) {
      pc.ref.addModifier(getMod(pc.int), "untyped", "Intelligenz-Modifikator (Insightful Reflexes)");
      pc.ref.modifiers[pc.ref.modifiers.length - 1].isFeat = true;
    } else {
      pc.ref.addModifier(getMod(pc.dex), "untyped", "Geschicklichkeits-Modifikator");
      pc.ref.modifiers[pc.ref.modifiers.length - 1].isClass = true;
    }

    // Will: Force of Personality uses CHA modifier instead of WIS; Steadfast Determination uses CON modifier instead of WIS
    if (hasFeat('force_of_personality')) {
      pc.wil.addModifier(getMod(pc.cha), "untyped", "Charisma-Modifikator (Force of Personality)");
      pc.wil.modifiers[pc.wil.modifiers.length - 1].isFeat = true;
    } else if (hasFeat('steadfast_determination')) {
      pc.wil.addModifier(getMod(pc.con), "untyped", "Konstitutions-Modifikator (Steadfast Determination)");
      pc.wil.modifiers[pc.wil.modifiers.length - 1].isFeat = true;
    } else {
      pc.wil.addModifier(getMod(pc.wis), "untyped", "Weisheits-Modifikator");
      pc.wil.modifiers[pc.wil.modifiers.length - 1].isClass = true;
    }

    if (pc.autoAC) {
      if (pc.activeShape !== 'none') {
        // In Wild Shape, base AC is already set to the shape's base AC (includes base Dex and Natural Armor)
        const currentDexMod = getMod(pc.dex.getValue());
        const baseDexMod = getMod(pc.dex.base);
        const extraDexMod = currentDexMod - baseDexMod;
        if (extraDexMod !== 0) {
          pc.ac.addModifier(extraDexMod, "untyped", "Geschicklichkeits-Modifikator");
          pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
          pc.acTouch.addModifier(extraDexMod, "untyped", "Geschicklichkeits-Modifikator");
          pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;
          if (extraDexMod < 0) {
            pc.acFlat.addModifier(extraDexMod, "untyped", "Geschicklichkeits-Modifikator");
            pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
          }
        }

        // @feature:wildshape — Angeborene natürliche Rüstung (acNatural) der Grundform in Tiergestalt ignorieren (RAW)


        if (pc.acDeflection !== 0) {
          pc.ac.addModifier(pc.acDeflection, "deflection", "Ablenkungs-Bonus");
          pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
          pc.acTouch.addModifier(pc.acDeflection, "deflection", "Ablenkungs-Bonus");
          pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;
          pc.acFlat.addModifier(pc.acDeflection, "deflection", "Ablenkungs-Bonus");
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
        }

        if (pc.acMisc !== 0) {
          pc.ac.addModifier(pc.acMisc, "untyped", "Sonstiger RK-Bonus");
          pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
          pc.acTouch.addModifier(pc.acMisc, "untyped", "Sonstiger RK-Bonus");
          pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;
          pc.acFlat.addModifier(pc.acMisc, "untyped", "Sonstiger RK-Bonus");
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
        }
      } else {
        pc.ac.base = 10;
        pc.acTouch.base = 10;
        pc.acFlat.base = 10;

        const equippedArmor = pc.getEquippedArmor();
        const equippedShield = pc.getEquippedShield();

        const baseDexMod = getMod(pc.dex.getValue());

        let maxDexCap = null;
        if (equippedArmor && typeof equippedArmor.maxDex === 'number' && equippedArmor.maxDex !== null) {
          maxDexCap = equippedArmor.maxDex;
        }
        if (equippedShield && typeof equippedShield.maxDex === 'number' && equippedShield.maxDex !== null) {
          if (maxDexCap === null || equippedShield.maxDex < maxDexCap) {
            maxDexCap = equippedShield.maxDex;
          }
        }

        const dexMod = maxDexCap !== null ? Math.min(baseDexMod, maxDexCap) : baseDexMod;

        pc.ac.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
        pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;

        pc.acTouch.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
        pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;

        if (dexMod < 0) {
          pc.acFlat.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
        }

        if (equippedArmor) {
          const name = equippedArmor.name || "Rüstung";
          const armorBonus = (typeof equippedArmor.armorBonus === 'number') ? equippedArmor.armorBonus : (ARMOR_REGISTRY[equippedArmor.type]?.armorBonus || 0);
          pc.ac.addModifier(armorBonus, "armor", name);
          pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
          pc.acFlat.addModifier(armorBonus, "armor", name);
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;

          if (equippedArmor.enhancement > 0) {
            pc.ac.addModifier(equippedArmor.enhancement, "enhancement", `${name} (Magisch)`);
            pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
            pc.acFlat.addModifier(equippedArmor.enhancement, "enhancement", `${name} (Magisch)`);
            pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
          }
        }

        if (equippedShield) {
          const name = equippedShield.name || "Schild";
          let shieldBonus = (typeof equippedShield.armorBonus === 'number') ? equippedShield.armorBonus : (ARMOR_REGISTRY[equippedShield.type]?.armorBonus || 0);
          const hasShieldSpec = Array.isArray(pc.feats) && pc.feats.some(f => {
            const featId = typeof f === 'string' ? f : f?.id;
            if (featId !== 'shield_specialization') return false;
            const featOption = typeof f === 'object' ? f?.option : undefined;
            return matchesShieldFeatOption(equippedShield, featOption);
          });
          if (hasShieldSpec) {
            shieldBonus += 1;
          }

          const shieldLabel = hasShieldSpec ? `${name} (Schildspezialisierung)` : name;
          pc.ac.addModifier(shieldBonus, "shield", shieldLabel);
          pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
          pc.acFlat.addModifier(shieldBonus, "shield", shieldLabel);
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;

          if (equippedShield.enhancement > 0) {
            pc.ac.addModifier(equippedShield.enhancement, "enhancement", `${name} (Magisch)`);
            pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
            pc.acFlat.addModifier(equippedShield.enhancement, "enhancement", `${name} (Magisch)`);
            pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
          }
        }

        if (pc.acNatural !== 0) {
          pc.ac.addModifier(pc.acNatural, "natural", "Natürliche Rüstung");
          pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
          pc.acFlat.addModifier(pc.acNatural, "natural", "Natürliche Rüstung");
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
        }

        if (pc.acDeflection !== 0) {
          pc.ac.addModifier(pc.acDeflection, "deflection", "Ablenkungs-Bonus");
          pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
          pc.acTouch.addModifier(pc.acDeflection, "deflection", "Ablenkungs-Bonus");
          pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;
          pc.acFlat.addModifier(pc.acDeflection, "deflection", "Ablenkungs-Bonus");
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
        }

        if (pc.acMisc !== 0) {
          pc.ac.addModifier(pc.acMisc, "untyped", "Sonstiger RK-Bonus");
          pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
          pc.acTouch.addModifier(pc.acMisc, "untyped", "Sonstiger RK-Bonus");
          pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;
          pc.acFlat.addModifier(pc.acMisc, "untyped", "Sonstiger RK-Bonus");
          pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
        }
      }
    } else {
      const dexMod = getMod(pc.dex.getValue());
      
      pc.ac.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
      pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;

      pc.acTouch.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
      pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;

      if (dexMod < 0) {
        pc.acFlat.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
        pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
      }
    }

    const sizeMod = (typeof pc.getSizeModifier === 'function') ? pc.getSizeModifier() : 0;
    if (sizeMod !== 0) {
      pc.ac.addModifier(sizeMod, "untyped", "Größenmodifikator");
      pc.ac.modifiers[pc.ac.modifiers.length - 1].isClass = true;
      pc.acTouch.addModifier(sizeMod, "untyped", "Größenmodifikator");
      pc.acTouch.modifiers[pc.acTouch.modifiers.length - 1].isClass = true;
      pc.acFlat.addModifier(sizeMod, "untyped", "Größenmodifikator");
      pc.acFlat.modifiers[pc.acFlat.modifiers.length - 1].isClass = true;
    }

    if (pc.zaMisc !== 0) {
      pc.za.addModifier(pc.zaMisc, "untyped", "Sonstiges (Ausrüstung/Spezial)");
      pc.za.modifiers[pc.za.modifiers.length - 1].isClass = true;
    }
    if (pc.refMisc !== 0) {
      pc.ref.addModifier(pc.refMisc, "untyped", "Sonstiges (Ausrüstung/Spezial)");
      pc.ref.modifiers[pc.ref.modifiers.length - 1].isClass = true;
    }
    if (pc.wilMisc !== 0) {
      pc.wil.addModifier(pc.wilMisc, "untyped", "Sonstiges (Ausrüstung/Spezial)");
      pc.wil.modifiers[pc.wil.modifiers.length - 1].isClass = true;
    }
  }
}
