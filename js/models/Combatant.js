import { Stat } from './Stat.js';
import { Weapon } from './Weapon.js';
import { Armor } from './Armor.js';
import { CombatSpells, getSpellSchoolCode } from '../spells.js';
import { BarbarianRules } from '../rules/classes/BarbarianRules.js';
import { MonkRules } from '../rules/classes/MonkRules.js';
import { RangerRules } from '../rules/classes/RangerRules.js';
import { RogueRules } from '../rules/classes/RogueRules.js';
import { SKILLS_REGISTRY } from '../data/skills-data.js';
import { SpellSlotCalculator } from '../rules/SpellSlotCalculator.js';

const uid = () => {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 7);
};

/**
 * Encapsulates any participant creature (Player, Enemy, or NPC) in the encounter.
 */
export class Combatant {
  constructor(p = {}) {
    this.id = p.id || uid();
    this.name = p.name || 'Charakter';
    this.type = p.type || 'p'; // 'p' (Player), 'e' (Enemy), 'n' (NPC)
    this.init = parseInt(p.init) || 0;
    
    // HP encapsulation
    const maxHP = parseInt(p.maxHP) || parseInt(p.hp) || 10;
    this.maxHP = maxHP;
    this.hp = p.hp !== undefined ? parseInt(p.hp) : maxHP;
    
    // Elevate AC to Stat objects
    this.ac = new Stat(p.ac !== undefined ? p.ac : 10);
    this.acTouch = new Stat(p.acTouch !== undefined ? p.acTouch : 10);
    this.acFlat = new Stat(p.acFlat !== undefined ? p.acFlat : 10);
    
    this.baseBw = p.baseBw !== undefined ? parseInt(p.baseBw) : (parseInt(p.bw) || 30);
    this.bw = parseInt(p.bw) || 30;
    this.conditions = Array.isArray(p.conditions) ? [...p.conditions] : [];

    // -- ABILITY SCORES (D&D 3.5e) --
    this.str = new Stat(p.str !== undefined ? p.str : 10);
    this.dex = new Stat(p.dex !== undefined ? p.dex : 10);
    this.con = new Stat(p.con !== undefined ? p.con : 10);
    this.int = new Stat(p.int !== undefined ? p.int : 10);
    this.wis = new Stat(p.wis !== undefined ? p.wis : 10);
    this.cha = new Stat(p.cha !== undefined ? p.cha : 10);

    this.iniMisc = parseInt(p.iniMisc) || 0;

    // -- CLASSES & LEVEL --
    this.classType = p.classType || 'custom';
    this.level = p.level !== undefined ? parseInt(p.level) : 1;
    this.classes = Array.isArray(p.classes)
      ? p.classes.map(c => ({ classType: c.classType, level: parseInt(c.level) || 1 }))
      : (p.classType && p.classType !== 'custom' ? [{ classType: p.classType, level: parseInt(p.level) || 1 }] : []);

    // -- BASE SAVES & ATTACK (D&D 3.5e) --
    this.baseZa = new Stat(p.baseZa !== undefined ? p.baseZa : (p.za !== undefined ? p.za : 0));
    this.baseRef = new Stat(p.baseRef !== undefined ? p.baseRef : (p.ref !== undefined ? p.ref : 0));
    this.baseWil = new Stat(p.baseWil !== undefined ? p.baseWil : (p.wil !== undefined ? p.wil : 0));
    this.bab = new Stat(p.bab !== undefined ? p.bab : 0);

    this.zaMisc = parseInt(p.zaMisc) || 0;
    this.refMisc = parseInt(p.refMisc) || 0;
    this.wilMisc = parseInt(p.wilMisc) || 0;

    this.za = new Stat(p.za !== undefined ? p.za : (p.baseZa !== undefined ? p.baseZa : 0));
    this.ref = new Stat(p.ref !== undefined ? p.ref : (p.baseRef !== undefined ? p.baseRef : 0));
    this.wil = new Stat(p.wil !== undefined ? p.wil : (p.baseWil !== undefined ? p.baseWil : 0));

    this.sr = p.sr !== undefined ? parseInt(p.sr) : 0;

    // -- OFFENSE (D&D 3.5e) --
    this.weapons = Array.isArray(p.weapons) 
      ? p.weapons.map(w => new Weapon(w)) 
      : [
          new Weapon({ name: 'Langschwert +1', grip: '1h', damageDice: '1w8', crit: '19-20 / x2', enhancement: 1 }),
          new Weapon({ name: 'Kompositbogen', grip: 'rng', damageDice: '1w6', crit: 'x3', enhancement: 0 })
        ];

    // -- ARMORY (D&D 3.5e) --
    this.armors = Array.isArray(p.armors) ? p.armors.map(a => new Armor(a)) : [];
    this.autoAC = p.autoAC !== undefined ? !!p.autoAC : false;
    this.acNatural = p.acNatural !== undefined ? parseInt(p.acNatural) : 0;
    this.acDeflection = p.acDeflection !== undefined ? parseInt(p.acDeflection) : 0;
    this.acMisc = p.acMisc !== undefined ? parseInt(p.acMisc) : 0;

    // -- SPECIAL (D&D 3.5e) --
    this.dr = p.dr || '';
    this.immunities = p.immunities || '';
    this.resistances = p.resistances || '';
    this.reach = p.reach || '5 ft';

    // -- RESOURCES (D&D 3.5e) --
    const defaultSpellSlots = {};
    for (let lvl = 0; lvl <= 9; lvl++) {
      defaultSpellSlots[lvl] = {
        max: p.spellSlots?.[lvl]?.max !== undefined ? parseInt(p.spellSlots[lvl].max) : 0,
        used: p.spellSlots?.[lvl]?.used !== undefined ? parseInt(p.spellSlots[lvl].used) : 0
      };
    }
    this.spellSlots = defaultSpellSlots;

    this.dailyAbilities = Array.isArray(p.dailyAbilities) ? p.dailyAbilities.map(a => ({
      name: a.name || '',
      max: parseInt(a.max) || 0,
      used: parseInt(a.used) || 0
    })) : [];

    // -- SPELLS / ACTIVE BUFFS registry --
    this.activeBuffs = Array.isArray(p.activeBuffs) ? [...p.activeBuffs] : [];
    this.learnedSpells = Array.isArray(p.learnedSpells) ? [...p.learnedSpells] : [];
    this.preparedSpells = Array.isArray(p.preparedSpells) ? p.preparedSpells.map(s => ({ ...s })) : [];
    this.customSpells = Array.isArray(p.customSpells) ? [...p.customSpells] : [];
    this.spellTemplates = p.spellTemplates || {};
    this.feats = Array.isArray(p.feats) ? [...p.feats] : [];
    this.skills = p.skills || {};

    this.isRaging = !!p.isRaging;
    this.isSneakAttacking = !!p.isSneakAttacking;
    this.isDefensiveFighting = !!p.isDefensiveFighting;
    this.isTotalDefense = !!p.isTotalDefense;
    this.isFlurrying = !!p.isFlurrying;
    this.powerAttackPenalty = p.powerAttackPenalty !== undefined ? parseInt(p.powerAttackPenalty) : 0;
    this.combatExpertisePenalty = p.combatExpertisePenalty !== undefined ? parseInt(p.combatExpertisePenalty) : 0;
    this.divineGraceActive = p.divineGraceActive !== undefined ? !!p.divineGraceActive : true;

    this.favoredEnemy = p.favoredEnemy || '';
    this.rangerCombatStyle = p.rangerCombatStyle || 'none';
    this.wizardSpecialization = p.wizardSpecialization || 'none';
    this.wizardProhibited1 = p.wizardProhibited1 || '';
    this.wizardProhibited2 = p.wizardProhibited2 || '';
    this.deathScreenShown = !!p.deathScreenShown;
    this.bardicMusicExtra = p.bardicMusicExtra !== undefined ? parseInt(p.bardicMusicExtra) : 0;
    this.companionName = p.companionName || '';
    this.companionType = p.companionType || 'none';
    this.companionHP = p.companionHP !== undefined ? parseInt(p.companionHP) : 0;
    this.companionMaxHP = p.companionMaxHP !== undefined ? parseInt(p.companionMaxHP) : 0;
    this.familiarName = p.familiarName || '';
    this.familiarType = p.familiarType || 'none';
    this.familiarHP = p.familiarHP !== undefined ? parseInt(p.familiarHP) : 0;

    this.activeShape = p.activeShape || "none";
    this.originalStats = p.originalStats || null;

    // Rebuild modifier list reactively on initialization
    this.rebuildStatModifiers();
  }

  // -- DYNAMIC GETTERS & SETTERS FOR D&D 3.5e SAVES --
  // (Removed. za, ref, wil are now proper Stat instances)

  /**
   * Scans active buffs and dynamically injects modifiers into the target Stat objects.
   */
  rebuildStatModifiers() {
    const statsList = [
      this.str, this.dex, this.con, this.int, this.wis, this.cha,
      this.baseZa, this.baseRef, this.baseWil, this.bab,
      this.ac, this.acTouch, this.acFlat,
      this.za, this.ref, this.wil
    ];
    
    // Clear all previously active spell/buff, class and feat modifiers
    statsList.forEach(s => {
      s.modifiers = s.modifiers.filter(m => !m.isSpell && !m.isClass && !m.isFeat);
    });

    // Sync current saves bases to class-level base saving throws
    this.za.base = this.baseZa.getValue();
    this.ref.base = this.baseRef.getValue();
    this.wil.base = this.baseWil.getValue();

    // Helper for attribute mod calculations
    const getMod = (score) => {
      const s = parseInt(score) || 10;
      return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
    };

    this._applyBaseSavingThrowModifiers(getMod);
    this._applySpellModifiers();
    this._applyClassModifiers(getMod);
    this._applyFeatModifiers(getMod);
    this._recalculateSpeed();
  }

  _applyBaseSavingThrowModifiers(getMod) {
    // Apply basic attributes & misc modifiers on saves for player characters
    if (this.type === 'p') {
      this.za.addModifier(getMod(this.con), "untyped", "Konstitutions-Modifikator");
      this.za.modifiers[this.za.modifiers.length - 1].isClass = true;

      this.ref.addModifier(getMod(this.dex), "untyped", "Geschicklichkeits-Modifikator");
      this.ref.modifiers[this.ref.modifiers.length - 1].isClass = true;

      this.wil.addModifier(getMod(this.wis), "untyped", "Weisheits-Modifikator");
      this.wil.modifiers[this.wil.modifiers.length - 1].isClass = true;

      if (this.autoAC) {
        this.ac.base = 10;
        this.acTouch.base = 10;
        this.acFlat.base = 10;

        const equippedArmor = this.getEquippedArmor();
        const equippedShield = this.getEquippedShield();

        const baseDexMod = getMod(this.dex.getValue());

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

        this.ac.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
        this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;

        this.acTouch.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
        this.acTouch.modifiers[this.acTouch.modifiers.length - 1].isClass = true;

        if (dexMod < 0) {
          this.acFlat.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
          this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isClass = true;
        }

        if (equippedArmor) {
          const name = equippedArmor.name || "Rüstung";
          this.ac.addModifier(equippedArmor.armorBonus, "armor", name);
          this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;
          this.acFlat.addModifier(equippedArmor.armorBonus, "armor", name);
          this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isClass = true;

          if (equippedArmor.enhancement > 0) {
            this.ac.addModifier(equippedArmor.enhancement, "enhancement", `${name} (Magisch)`);
            this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;
            this.acFlat.addModifier(equippedArmor.enhancement, "enhancement", `${name} (Magisch)`);
            this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isClass = true;
          }
        }

        if (equippedShield) {
          const name = equippedShield.name || "Schild";
          this.ac.addModifier(equippedShield.armorBonus, "shield", name);
          this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;
          this.acFlat.addModifier(equippedShield.armorBonus, "shield", name);
          this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isClass = true;

          if (equippedShield.enhancement > 0) {
            this.ac.addModifier(equippedShield.enhancement, "enhancement", `${name} (Magisch)`);
            this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;
            this.acFlat.addModifier(equippedShield.enhancement, "enhancement", `${name} (Magisch)`);
            this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isClass = true;
          }
        }

        if (this.acNatural !== 0) {
          this.ac.addModifier(this.acNatural, "natural", "Natürliche Rüstung");
          this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;
          this.acFlat.addModifier(this.acNatural, "natural", "Natürliche Rüstung");
          this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isClass = true;
        }

        if (this.acDeflection !== 0) {
          this.ac.addModifier(this.acDeflection, "deflection", "Ablenkungs-Bonus");
          this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;
          this.acTouch.addModifier(this.acDeflection, "deflection", "Ablenkungs-Bonus");
          this.acTouch.modifiers[this.acTouch.modifiers.length - 1].isClass = true;
          this.acFlat.addModifier(this.acDeflection, "deflection", "Ablenkungs-Bonus");
          this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isClass = true;
        }

        if (this.acMisc !== 0) {
          this.ac.addModifier(this.acMisc, "untyped", "Sonstiger RK-Bonus");
          this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;
          this.acTouch.addModifier(this.acMisc, "untyped", "Sonstiger RK-Bonus");
          this.acTouch.modifiers[this.acTouch.modifiers.length - 1].isClass = true;
          this.acFlat.addModifier(this.acMisc, "untyped", "Sonstiger RK-Bonus");
          this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isClass = true;
        }
      } else {
        const dexMod = getMod(this.dex.getValue());
        
        this.ac.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
        this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;

        this.acTouch.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
        this.acTouch.modifiers[this.acTouch.modifiers.length - 1].isClass = true;

        if (dexMod < 0) {
          this.acFlat.addModifier(dexMod, "untyped", "Geschicklichkeits-Modifikator");
          this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isClass = true;
        }
      }

      if (this.zaMisc !== 0) {
        this.za.addModifier(this.zaMisc, "untyped", "Sonstiges (Ausrüstung/Spezial)");
        this.za.modifiers[this.za.modifiers.length - 1].isClass = true;
      }
      if (this.refMisc !== 0) {
        this.ref.addModifier(this.refMisc, "untyped", "Sonstiges (Ausrüstung/Spezial)");
        this.ref.modifiers[this.ref.modifiers.length - 1].isClass = true;
      }
      if (this.wilMisc !== 0) {
        this.wil.addModifier(this.wilMisc, "untyped", "Sonstiges (Ausrüstung/Spezial)");
        this.wil.modifiers[this.wil.modifiers.length - 1].isClass = true;
      }
    }
  }

  _applySpellModifiers() {
    // 1. Populate active spell/buff modifiers based on spell registry configuration
    this.activeBuffs.forEach(buff => {
      const spell = CombatSpells.REGISTRY?.[buff.spellKey];
      if (spell && Array.isArray(spell.effects)) {
        spell.effects.forEach(eff => {
          // Redirect base saving throw targets to total saving throw Stat objects
          const targetName = eff.target === 'baseZa' ? 'za' : (eff.target === 'baseRef' ? 'ref' : (eff.target === 'baseWil' ? 'wil' : eff.target));
          const statObj = this[targetName];
          if (statObj instanceof Stat) {
            statObj.addModifier(eff.value, eff.type, eff.source);
            // Flag this modifier as dynamically injected from a spell
            statObj.modifiers[statObj.modifiers.length - 1].isSpell = true;
          }
        });
      }
    });
  }

  _applyClassModifiers(getMod) {
    // 2. Apply passive class feature modifiers (Divine Grace, Monk AC, etc.)
    if (this.type === 'p' && Array.isArray(this.classes)) {
      // A. Paladin: Divine Grace (Stufe >= 2)
      const paladinClass = this.classes.find(c => c.classType === 'paladin');
      if (paladinClass && paladinClass.level >= 2 && this.divineGraceActive) {
        const chaMod = getMod(this.cha);
        const saves = [this.za, this.ref, this.wil];
        saves.forEach(s => {
          s.addModifier(Math.max(0, chaMod), "untyped", "Göttliche Gnade");
          s.modifiers[s.modifiers.length - 1].isClass = true;
        });
      }

      // B. Monk: Wisdom AC Bonus & Level AC Bonus (No armor/shield check)
      const monkClass = this.classes.find(c => c.classType === 'monk');
      if (monkClass && monkClass.level >= 1) {
        const wisMod = getMod(this.wis);
        const levelBonus = Math.floor(monkClass.level / 5);
        const totalMonkAC = Math.max(0, wisMod) + levelBonus;
        
        if (totalMonkAC > 0) {
          const acs = [this.ac, this.acTouch, this.acFlat];
          acs.forEach(s => {
            s.addModifier(totalMonkAC, "untyped", "Mönch-RK-Bonus");
            s.modifiers[s.modifiers.length - 1].isClass = true;
          });
        }
      }

      // C. Barbarian: Kampfrausch (Rage) active toggle
      if (this.isRaging) {
        const barbClass = Array.isArray(this.classes) ? this.classes.find(c => c.classType === 'barbarian') : null;
        const lvl = barbClass ? barbClass.level : 1;
        const bonuses = BarbarianRules.getRageBonuses(lvl);

        this.str.addModifier(bonuses.strBonus, "morale", "Kampfrausch");
        this.str.modifiers[this.str.modifiers.length - 1].isClass = true;

        this.con.addModifier(bonuses.conBonus, "morale", "Kampfrausch");
        this.con.modifiers[this.con.modifiers.length - 1].isClass = true;

        this.wil.addModifier(bonuses.wilBonus, "morale", "Kampfrausch");
        this.wil.modifiers[this.wil.modifiers.length - 1].isClass = true;

        const acs = [this.ac, this.acTouch, this.acFlat];
        acs.forEach(s => {
          s.addModifier(bonuses.acPenalty, "untyped", "Kampfrausch");
          s.modifiers[s.modifiers.length - 1].isClass = true;
        });
      }

      // D. Vertrauten-Passive-Boni (Ratte: +2 Zähigkeit, Wiesel: +2 Reflex)
      if (this.familiarType && this.familiarType !== 'none') {
        if (this.familiarType === 'rat') {
          this.za.addModifier(2, "untyped", "Vertrauter (Ratte)");
          this.za.modifiers[this.za.modifiers.length - 1].isClass = true;
        } else if (this.familiarType === 'weasel') {
          this.ref.addModifier(2, "untyped", "Vertrauter (Wiesel)");
          this.ref.modifiers[this.ref.modifiers.length - 1].isClass = true;
        }
      }
    }
  }

  _applyFeatModifiers(getMod) {
    if (this.type === 'p') {
      // E. Rettungswurf-Talente (Great Fortitude, Lightning Reflexes, Iron Will)
      if (Array.isArray(this.feats)) {
        const hasFeat = (featId) => this.feats.some(f => f.id === featId);
        if (hasFeat('great_fortitude')) {
          this.za.addModifier(2, "untyped", "Große Zähigkeit");
          this.za.modifiers[this.za.modifiers.length - 1].isFeat = true;
        }
        if (hasFeat('lightning_reflexes')) {
          this.ref.addModifier(2, "untyped", "Blitzschnelle Reflexe");
          this.ref.modifiers[this.ref.modifiers.length - 1].isFeat = true;
        }
        if (hasFeat('iron_will')) {
          this.wil.addModifier(2, "untyped", "Eiserner Wille");
          this.wil.modifiers[this.wil.modifiers.length - 1].isFeat = true;
        }

        // Dodge Feat: +1 dodge bonus to AC & Touch AC
        if (hasFeat('dodge')) {
          this.ac.addModifier(1, "dodge", "Ausweichen");
          this.ac.modifiers[this.ac.modifiers.length - 1].isFeat = true;
          this.acTouch.addModifier(1, "dodge", "Ausweichen");
          this.acTouch.modifiers[this.acTouch.modifiers.length - 1].isFeat = true;
        }

        // Combat Expertise: adds dodge bonus to AC and Touch AC
        if (this.combatExpertisePenalty > 0) {
          this.ac.addModifier(this.combatExpertisePenalty, "dodge", "Kampfgetümmel");
          this.ac.modifiers[this.ac.modifiers.length - 1].isFeat = true;
          this.acTouch.addModifier(this.combatExpertisePenalty, "dodge", "Kampfgetümmel");
          this.acTouch.modifiers[this.acTouch.modifiers.length - 1].isFeat = true;
        }

        // Defensive Fighting: adds dodge bonus to AC and Touch AC (+3 if tumble ranks >= 5, else +2)
        if (this.isDefensiveFighting) {
          const tumbleRanks = this.getSkillRanks('tumble');
          const dodgeBonus = tumbleRanks >= 5 ? 3 : 2;
          this.ac.addModifier(dodgeBonus, "dodge", "Verteidigend kämpfen");
          this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;
          this.acTouch.addModifier(dodgeBonus, "dodge", "Verteidigend kämpfen");
          this.acTouch.modifiers[this.acTouch.modifiers.length - 1].isClass = true;
        }

        // Total Defense: adds dodge bonus to AC and Touch AC (+6 if tumble ranks >= 5, else +4)
        if (this.isTotalDefense) {
          const tumbleRanks = this.getSkillRanks('tumble');
          const dodgeBonus = tumbleRanks >= 5 ? 6 : 4;
          this.ac.addModifier(dodgeBonus, "dodge", "Volle Abwehr");
          this.ac.modifiers[this.ac.modifiers.length - 1].isClass = true;
          this.acTouch.addModifier(dodgeBonus, "dodge", "Volle Abwehr");
          this.acTouch.modifiers[this.acTouch.modifiers.length - 1].isClass = true;
        }

        // Two-Weapon Defense Feat: +1 shield bonus to AC & Flat-Footed AC when wielding secondary weapon
        if (hasFeat('two_weapon_defense')) {
          const hasSecWeapon = Array.isArray(this.weapons) && this.weapons.some(w => w.grip === 'sec' || (w.isEquipped && (w.hand === 'off' || w.isDoubleWielded)));
          if (hasSecWeapon) {
            this.ac.addModifier(1, "shield", "Zwei-Waffen-Verteidigung");
            this.ac.modifiers[this.ac.modifiers.length - 1].isFeat = true;
            this.acFlat.addModifier(1, "shield", "Zwei-Waffen-Verteidigung");
            this.acFlat.modifiers[this.acFlat.modifiers.length - 1].isFeat = true;
          }
        }
      }
    }
  }

  _recalculateSpeed() {
    let speedBonus = 0;
    const armor = this.getEquippedArmor();
    const shield = this.getEquippedShield();
    const hasArmor = !!armor;
    const hasShield = !!shield;

    if (this.type === 'p' && Array.isArray(this.classes)) {
      const barbClass = this.classes.find(c => c.classType === 'barbarian');
      if (barbClass && barbClass.level >= 1) {
        // Barbarian fast movement does not apply in heavy armor.
        const isHeavy = armor && armor.speedCategory === 'heavy';
        if (!isHeavy) {
          speedBonus += 10;
        }
      }
      
      const monkClass = this.classes.find(c => c.classType === 'monk');
      if (monkClass && monkClass.level >= 3) {
        // Monk fast movement only applies when wearing NO armor and NO shield.
        if (!hasArmor && !hasShield) {
          const monkLvl = monkClass.level;
          let monkSpeed = 10;
          if (monkLvl >= 18) monkSpeed = 60;
          else if (monkLvl >= 15) monkSpeed = 50;
          else if (monkLvl >= 12) monkSpeed = 40;
          else if (monkLvl >= 9) monkSpeed = 30;
          else if (monkLvl >= 6) monkSpeed = 20;
          speedBonus += monkSpeed;
        }
      }
    }

    let baseAndBonus = (this.baseBw !== undefined ? this.baseBw : 30) + speedBonus;

    // Apply speed reduction for medium or heavy armor
    if (armor && (armor.speedCategory === 'medium' || armor.speedCategory === 'heavy')) {
      if (baseAndBonus >= 30) {
        if (baseAndBonus === 30) baseAndBonus = 20;
        else if (baseAndBonus === 40) baseAndBonus = 30;
        else if (baseAndBonus === 50) baseAndBonus = 35;
        else if (baseAndBonus === 60) baseAndBonus = 40;
        else baseAndBonus = Math.max(20, baseAndBonus - 10);
      } else {
        if (baseAndBonus === 20) baseAndBonus = 15;
        else if (baseAndBonus === 15) baseAndBonus = 10;
        else baseAndBonus = Math.max(5, baseAndBonus - 5);
      }
    }

    this.bw = baseAndBonus;
  }

  enterRage() {
    if (this.isRaging) return;
    this.isRaging = true;
    
    const barbClass = Array.isArray(this.classes) ? this.classes.find(c => c.classType === 'barbarian') : null;
    const lvl = barbClass ? barbClass.level : 1;
    const bonuses = BarbarianRules.getRageBonuses(lvl);
    
    const hpGain = bonuses.hpPerLevel * this.level;
    this.maxHP += hpGain;
    this.hp += hpGain;
    
    this.rebuildStatModifiers();
  }

  exitRage() {
    if (!this.isRaging) return;
    
    const barbClass = Array.isArray(this.classes) ? this.classes.find(c => c.classType === 'barbarian') : null;
    const lvl = barbClass ? barbClass.level : 1;
    const bonuses = BarbarianRules.getRageBonuses(lvl);
    
    this.isRaging = false;
    
    const hpLoss = bonuses.hpPerLevel * this.level;
    this.maxHP = Math.max(1, this.maxHP - hpLoss);
    this.hp = Math.max(-99, this.hp - hpLoss);
    
    this.applyCondition("Erschöpft");
    this.rebuildStatModifiers();
  }

  enterShape(shapeName) {
    if (this.activeShape !== "none") {
      this.exitShape();
    }

    // Capture original human base attributes and AC base values
    this.originalStats = {
      str: this.str.base,
      dex: this.dex.base,
      con: this.con.base,
      ac: this.ac.base,
      acTouch: this.acTouch.base,
      acFlat: this.acFlat.base
    };

    // Load target shape attributes and AC base values
    if (shapeName === "wolf") {
      this.str.base = 13;
      this.dex.base = 15;
      this.con.base = 15;
      this.ac.base = 14;
      this.acTouch.base = 12;
      this.acFlat.base = 12;
    } else if (shapeName === "leopard") {
      this.str.base = 16;
      this.dex.base = 19;
      this.con.base = 15;
      this.ac.base = 15;
      this.acTouch.base = 14;
      this.acFlat.base = 12;
    } else if (shapeName === "bear") {
      this.str.base = 27;
      this.dex.base = 13;
      this.con.base = 19;
      this.ac.base = 15;
      this.acTouch.base = 11;
      this.acFlat.base = 14;
    } else {
      this.originalStats = null;
      return;
    }

    this.activeShape = shapeName;
    this.rebuildStatModifiers();
  }

  exitShape() {
    if (this.activeShape === "none" || !this.originalStats) {
      this.activeShape = "none";
      this.originalStats = null;
      return;
    }

    // Restore original base scores
    this.str.base = this.originalStats.str;
    this.dex.base = this.originalStats.dex;
    this.con.base = this.originalStats.con;
    this.ac.base = this.originalStats.ac;
    this.acTouch.base = this.originalStats.acTouch;
    this.acFlat.base = this.originalStats.acFlat;

    this.activeShape = "none";
    this.originalStats = null;
    this.rebuildStatModifiers();
  }

  prepareSpell(spellKey, metamagicList = [], isSpecialist = false) {
    if (!Array.isArray(this.preparedSpells)) {
      this.preparedSpells = [];
    }
    const id = uid();
    this.preparedSpells.push({
      id,
      spellKey,
      metamagic: [...metamagicList],
      isUsed: false,
      isSpecialist: !!isSpecialist
    });
    return id;
  }

  unprepareSpell(id) {
    if (Array.isArray(this.preparedSpells)) {
      this.preparedSpells = this.preparedSpells.filter(s => s.id !== id);
    }
  }

  findSpell(key) {
    if (CombatSpells.REGISTRY[key]) {
      return CombatSpells.REGISTRY[key];
    }
    if (Array.isArray(this.customSpells)) {
      const found = this.customSpells.find(s => s.id === key || s.nameDe === key);
      if (found) return found;
    }
    return null;
  }

  applySpellTemplate(name) {
    const template = this.spellTemplates && this.spellTemplates[name];
    if (!template) return { success: false, error: 'Vorlage nicht gefunden.' };

    this.preparedSpells = [];
    const unplaced = [];
    const isWizard = this.classes && this.classes.some(c => c.classType === 'wizard');
    const specSchool = this.wizardSpecialization || 'none';
    const hasSpec = isWizard && specSchool !== 'none';

    const templateSpellsByLevel = {};
    for (let lvl = 0; lvl <= 9; lvl++) {
      templateSpellsByLevel[lvl] = [];
    }

    template.forEach(item => {
      const spell = this.findSpell(item.spellKey);
      if (!spell) {
        unplaced.push(item.spellKey);
        return;
      }
      const adjustedLevel = SpellSlotCalculator.getAdjustedSpellLevel(spell, item.metamagic);
      if (adjustedLevel >= 0 && adjustedLevel <= 9) {
        templateSpellsByLevel[adjustedLevel].push({
          spellKey: item.spellKey,
          metamagic: item.metamagic || [],
          school: spell.school,
          nameDe: spell.nameDe || spell.nameEn || item.spellKey
        });
      } else {
        unplaced.push(spell.nameDe || spell.nameEn || item.spellKey);
      }
    });

    for (let lvl = 0; lvl <= 9; lvl++) {
      const spellsToAlloc = templateSpellsByLevel[lvl];
      if (spellsToAlloc.length === 0) continue;

      const maxSlots = this.spellSlots[lvl]?.max || 0;
      const hasSpecSlotAtLvl = hasSpec && lvl >= 1;
      const specialistSlotCount = hasSpecSlotAtLvl ? 1 : 0;
      const regularSlotCount = Math.max(0, maxSlots - specialistSlotCount);

      const matchesSpecialization = (spell) => {
        const code = getSpellSchoolCode(spell.school, spell.spellKey || '', spell.nameDe || '');
        return code === specSchool;
      };

      let specIndex = -1;
      if (specialistSlotCount > 0) {
        specIndex = spellsToAlloc.findIndex(s => matchesSpecialization(s));
      }

      if (specIndex !== -1) {
        const s = spellsToAlloc[specIndex];
        spellsToAlloc.splice(specIndex, 1);
        this.preparedSpells.push({
          id: uid(),
          spellKey: s.spellKey,
          metamagic: [...s.metamagic],
          isUsed: false,
          isSpecialist: true
        });
      }

      const numToPrep = Math.min(regularSlotCount, spellsToAlloc.length);
      for (let i = 0; i < numToPrep; i++) {
        const s = spellsToAlloc[i];
        this.preparedSpells.push({
          id: uid(),
          spellKey: s.spellKey,
          metamagic: [...s.metamagic],
          isUsed: false,
          isSpecialist: false
        });
      }

      const remaining = spellsToAlloc.slice(numToPrep);
      remaining.forEach(s => {
        unplaced.push(s.nameDe);
      });
    }

    return { success: true, unplaced };
  }

  castPreparedSpell(id) {
    if (!Array.isArray(this.preparedSpells)) return null;
    const prep = this.preparedSpells.find(s => s.id === id);
    if (prep && !prep.isUsed) {
      prep.isUsed = true;
      const spell = CombatSpells.REGISTRY[prep.spellKey] || (this.customSpells && this.customSpells.find(s => s.id === prep.spellKey || s.nameDe === prep.spellKey));
      if (spell) {
        const adjustedLevel = SpellSlotCalculator.getAdjustedSpellLevel(spell, prep.metamagic);
        if (this.spellSlots && this.spellSlots[adjustedLevel]) {
          this.spellSlots[adjustedLevel].used = Math.min(this.spellSlots[adjustedLevel].max, (this.spellSlots[adjustedLevel].used || 0) + 1);
        }
      }
    }
    return prep;
  }

  castSpontaneousSpell(spellKey, slotLevel) {
    const lvl = parseInt(slotLevel);
    if (this.spellSlots && this.spellSlots[lvl]) {
      this.spellSlots[lvl].used = Math.min(this.spellSlots[lvl].max, (this.spellSlots[lvl].used || 0) + 1);
    }
  }

  // --- Transactions / Encapsulated modifications ---
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - (parseInt(amount) || 0));
    if (this.hp === 0 && !this.conditions.includes('Bewusstlos')) {
      this.applyCondition('Bewusstlos');
    }
  }

  heal(amount) {
    this.hp = Math.min(this.maxHP, this.hp + (parseInt(amount) || 0));
    if (this.hp > 0) {
      this.removeCondition('Bewusstlos');
    }
  }

  applyCondition(cond) {
    if (!this.conditions.includes(cond)) {
      this.conditions.push(cond);
    }
  }

  removeCondition(cond) {
    this.conditions = this.conditions.filter(c => c !== cond);
  }

  getAttributeMod(attrName) {
    const attr = this[attrName];
    const score = attr ? (typeof attr.getValue === 'function' ? attr.getValue() : parseInt(attr) || 10) : 10;
    return score >= 10
      ? Math.floor((score - 10) / 2)
      : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
  }

  getSkillRanks(skillKey) {
    return (this.skills && this.skills[skillKey]) ? parseFloat(this.skills[skillKey].ranks) || 0 : 0;
  }

  getSkillMisc(skillKey) {
    return (this.skills && this.skills[skillKey]) ? parseInt(this.skills[skillKey].misc) || 0 : 0;
  }

  getSkillModifier(skillKey) {
    const skillDef = SKILLS_REGISTRY[skillKey];
    if (!skillDef) return 0;

    let total = 0;
    
    // 1. Ranks
    total += this.getSkillRanks(skillKey);

    // 2. Attribute Modifier
    total += this.getAttributeMod(skillDef.abl);

    // 3. Misc Modifier
    total += this.getSkillMisc(skillKey);

    // 3.5 Armor Check Penalty (ACP)
    if (skillDef.hasACP) {
      const acp = this.getArmorCheckPenalty();
      if (skillKey === 'swim') {
        total -= 2 * acp;
      } else {
        total -= acp;
      }
    }

    // 4. Synergy Bonuses
    if (skillKey === 'balance' && this.getSkillRanks('tumble') >= 5) {
      total += 2;
    }
    if (skillKey === 'escape_artist' && this.getSkillRanks('tumble') >= 5) {
      total += 2;
    }
    if (skillKey === 'diplomacy' && this.getSkillRanks('bluff') >= 5) {
      total += 2;
    }
    if (skillKey === 'disguise' && this.getSkillRanks('bluff') >= 5) {
      total += 2;
    }
    if (skillKey === 'intimidate' && this.getSkillRanks('bluff') >= 5) {
      total += 2;
    }
    if (skillKey === 'use_magic_device') {
      if (this.getSkillRanks('spellcraft') >= 5) total += 2;
      if (this.getSkillRanks('decipher_script') >= 5) total += 2;
    }

    // 5. Conditions penalties (Shaken / Sickened)
    const hasShaken = this.conditions.some(c => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
    if (hasShaken) {
      total -= 2;
    }

    // 6. Feats bonuses
    if (Array.isArray(this.feats)) {
      const hasFeat = (featId) => this.feats.some(f => f.id === featId);
      if (hasFeat('acrobatic') && (skillKey === 'jump' || skillKey === 'tumble')) {
        total += 2;
      }
      if (hasFeat('agile') && (skillKey === 'balance' || skillKey === 'escape_artist')) {
        total += 2;
      }
      if (hasFeat('alertness') && (skillKey === 'listen' || skillKey === 'spot')) {
        total += 2;
      }
      if (hasFeat('animal_affinity') && (skillKey === 'handle_animal' || skillKey === 'ride')) {
        total += 2;
      }
      if (hasFeat('athletic') && (skillKey === 'climb' || skillKey === 'swim')) {
        total += 2;
      }
      if (hasFeat('deceitful') && (skillKey === 'disguise' || skillKey === 'forgery')) {
        total += 2;
      }
      if (hasFeat('deft_hands') && (skillKey === 'sleight_of_hand' || skillKey === 'use_rope')) {
        total += 2;
      }
      if (hasFeat('diligent') && (skillKey === 'appraise' || skillKey === 'decipher_script')) {
        total += 2;
      }
      if (hasFeat('investigator') && (skillKey === 'gather_information' || skillKey === 'search')) {
        total += 2;
      }
      if (hasFeat('negotiator') && (skillKey === 'diplomacy' || skillKey === 'sense_motive')) {
        total += 2;
      }
      if (hasFeat('nimble_fingers') && (skillKey === 'open_lock' || skillKey === 'disable_device')) {
        total += 2;
      }
      if (hasFeat('persuasive') && (skillKey === 'bluff' || skillKey === 'intimidate')) {
        total += 2;
      }
      if (hasFeat('self_sufficient') && (skillKey === 'heal' || skillKey === 'survival')) {
        total += 2;
      }
      if (hasFeat('stealthy') && (skillKey === 'hide' || skillKey === 'move_silently')) {
        total += 2;
      }
      if (hasFeat('magical_aptitude') && (skillKey === 'spellcraft' || skillKey === 'use_magic_device')) {
        total += 2;
      }
      
      this.feats.forEach(feat => {
        if (feat.id === 'skill_focus' && feat.option) {
          const opt = feat.option.toLowerCase().trim();
          const nameDe = skillDef.nameDe.toLowerCase();
          if (opt === skillKey || opt.includes(skillKey) || opt.includes(nameDe) || nameDe.includes(opt)) {
            total += 3;
          }
        }
      });
    }

    return total;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      init: this.init,
      hp: this.hp,
      maxHP: this.maxHP,
      ac: this.ac,
      bw: this.bw,
      baseBw: this.baseBw,
      conditions: this.conditions,
      str: this.str,
      dex: this.dex,
      con: this.con,
      int: this.int,
      wis: this.wis,
      cha: this.cha,
      iniMisc: this.iniMisc,
      classType: this.classType,
      level: this.level,
      classes: this.classes,
      baseZa: this.baseZa,
      baseRef: this.baseRef,
      baseWil: this.baseWil,
      za: this.za,
      ref: this.ref,
      wil: this.wil,
      bab: this.bab,
      zaMisc: this.zaMisc,
      refMisc: this.refMisc,
      wilMisc: this.wilMisc,
      acTouch: this.acTouch,
      acFlat: this.acFlat,
      sr: this.sr,
      weapons: this.weapons,
      armors: this.armors,
      autoAC: this.autoAC,
      acNatural: this.acNatural,
      acDeflection: this.acDeflection,
      acMisc: this.acMisc,
      dr: this.dr,
      immunities: this.immunities,
      resistances: this.resistances,
      reach: this.reach,
      spellSlots: this.spellSlots,
      dailyAbilities: this.dailyAbilities,
      learnedSpells: this.learnedSpells,
      preparedSpells: this.preparedSpells,
      customSpells: this.customSpells,
      spellTemplates: this.spellTemplates,
      activeBuffs: this.activeBuffs,
      isRaging: this.isRaging,
      isSneakAttacking: this.isSneakAttacking,
      isDefensiveFighting: this.isDefensiveFighting,
      isTotalDefense: this.isTotalDefense,
      isFlurrying: this.isFlurrying,
      powerAttackPenalty: this.powerAttackPenalty,
      combatExpertisePenalty: this.combatExpertisePenalty,
      divineGraceActive: this.divineGraceActive,
      favoredEnemy: this.favoredEnemy,
      rangerCombatStyle: this.rangerCombatStyle,
      wizardSpecialization: this.wizardSpecialization,
      wizardProhibited1: this.wizardProhibited1,
      wizardProhibited2: this.wizardProhibited2,
      deathScreenShown: this.deathScreenShown,
      bardicMusicExtra: this.bardicMusicExtra,
      companionName: this.companionName,
      companionType: this.companionType,
      companionHP: this.companionHP,
      companionMaxHP: this.companionMaxHP,
      familiarName: this.familiarName,
      familiarType: this.familiarType,
      familiarHP: this.familiarHP,
      activeShape: this.activeShape,
      originalStats: this.originalStats,
      feats: this.feats,
      skills: this.skills
    };
  }

  getFavoredEnemyBonus() {
    const rangerClass = Array.isArray(this.classes) && this.classes.find(c => c.classType === 'ranger');
    if (!rangerClass) return 0;
    return RangerRules.getFavoredEnemyBonus(rangerClass.level);
  }

  getSneakAttackDiceCount() {
    const rogueClass = Array.isArray(this.classes) && this.classes.find(c => c.classType === 'rogue');
    if (!rogueClass) return 0;
    return RogueRules.getSneakAttackDiceCount(rogueClass.level);
  }

  getWeaponDamageDice(w) {
    if (!w) return '1w6';
    if (w.damageDiceOverride) return w.damageDiceOverride;
    if (w.type === 'unarmed_strike') {
      const monkClass = Array.isArray(this.classes) && this.classes.find(c => c.classType === 'monk');
      if (monkClass) {
        return MonkRules.getUnarmedDamageDice(monkClass.level);
      }
    }
    return w.damageDice;
  }

  getEquippedArmor() {
    if (!Array.isArray(this.armors)) return null;
    return this.armors.find(a => a.isEquipped && !a.isShield) || null;
  }

  getEquippedShield() {
    if (!Array.isArray(this.armors)) return null;
    return this.armors.find(a => a.isEquipped && a.isShield) || null;
  }

  getArmorCheckPenalty() {
    let total = 0;
    const armor = this.getEquippedArmor();
    if (armor) total += armor.checkPenalty;
    const shield = this.getEquippedShield();
    if (shield) total += shield.checkPenalty;
    return total;
  }
}
