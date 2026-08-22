/**
 * @module    Combatant
 * @summary   Charaktermodell für Spieler (type:'p'), Gegner (type:'e') und Begleiter. Kapselt D&D-Attribute, Saves, Waffen, Rüstungen und delegiert komplexe Klassentalente, Fertigkeiten, Zauber und Modifikatoren-Neuberechnung an Helper-Module.
 * @exports   Combatant (class)
 * @reads     Alle pc.*-Felder — ist das zentrale Datenobjekt
 * @stateOps  Keine — wird von PCManager mutiert, mutiert sich nicht selbst
 * @depends   Stat, Weapon, Armor, Item, CombatantSkills, CombatantSpells, CombatantClassFeatures, CombatantModifiers
 * @notHere   UI/DOM → js/ui/ | D&D-Würfelmechanik → AttackEngine.js | State-Mutations → PCManager.js | Komplexe Berechnungen & Modifikatoren-Updates → js/models/helpers/
 */
import { Stat } from './Stat.js';
import { Weapon } from './Weapon.js';
import { Armor } from './Armor.js';
import { Item } from './Item.js';
import { calculateSkillModifier } from './helpers/skills/CombatantSkills.js';
import {
  findSpell,
  prepareSpell,
  unprepareSpell,
  applySpellTemplate,
  castPreparedSpell,
  castSpontaneousSpell
} from './helpers/spells/CombatantSpells.js';
import {
  enterShape,
  exitShape,
  enterRage,
  exitRage,
  getWeaponDamageDice,
  getFavoredEnemyBonus,
  getSneakAttackDiceCount
} from './helpers/classes/CombatantClassFeatures.js';
import { rebuildCombatantModifiers } from './helpers/modifiers/CombatantModifiers.js';

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
    this.prestigeSpellLinks = p.prestigeSpellLinks || {};
    this.prestigeSpecialTextConfirmed = p.prestigeSpecialTextConfirmed || {};
    this.alignment = p.alignment || '';



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
          new Weapon({ name: 'Langschwert', type: 'longsword', grip: '1h', damageDice: '1w8', crit: '19-20 / x2', enhancement: 0 }),
          new Weapon({ name: 'Kompositbogen', type: 'comp_shortbow', grip: 'rng', damageDice: '1w6', crit: 'x3', enhancement: 0 })
        ];

    // -- ARMORY (D&D 3.5e) --
    this.armors = Array.isArray(p.armors) ? p.armors.map(a => new Armor(a)) : [];
    this.items = Array.isArray(p.items) ? p.items.map(i => new Item(i)) : [];
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
    this.quickBuffs = Array.isArray(p.quickBuffs) ? [...p.quickBuffs] : [];
    this.learnedSpells = Array.isArray(p.learnedSpells) ? [...p.learnedSpells] : [];
    this.preparedSpells = Array.isArray(p.preparedSpells) ? p.preparedSpells.map(s => ({ ...s })) : [];
    this.customSpells = Array.isArray(p.customSpells) ? [...p.customSpells] : [];
    this.spellTemplates = p.spellTemplates || {};
    this.feats = Array.isArray(p.feats) ? [...p.feats] : [];
    this.skillTricks = Array.isArray(p.skillTricks) ? [...p.skillTricks] : [];
    this.acfs = Array.isArray(p.acfs) ? [...p.acfs] : [];
    this.skills = p.skills || {};
    this.race = p.race || 'human';
    this.isHuman = p.isHuman !== undefined ? !!p.isHuman : (this.race === 'human');
    this.levelAdjustment = parseInt(p.levelAdjustment) || 0;

    this.isRaging = !!p.isRaging;
    this.isSneakAttacking = !!p.isSneakAttacking;
    this.isSmiteActive = !!p.isSmiteActive;
    this.isFavoredEnemyActive = !!p.isFavoredEnemyActive;
    this.isDefensiveFighting = !!p.isDefensiveFighting;
    this.isTotalDefense = !!p.isTotalDefense;
    this.isFlurrying = !!p.isFlurrying;
    this.isTrickyFightingActive = !!p.isTrickyFightingActive;
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
    rebuildCombatantModifiers(this);
  }

  getAutomaticFeats() {
    const list = [];
    const disabled = Array.isArray(this.disabledAutomaticFeats) ? this.disabledAutomaticFeats : [];
    const activeClasses = Array.isArray(this.classes) ? this.classes : [];
    
    // Ranger automatic feats
    const ranger = activeClasses.find(c => c.classType === 'ranger');
    if (ranger) {
      if (ranger.level >= 1) {
        list.push({ id: 'track', source: 'Ranger (Class)' });
      }
      if (ranger.level >= 2) {
        if (this.rangerCombatStyle === 'twoweapon') {
          list.push({ id: 'two_weapon_fighting', source: 'Ranger (Combat Style)' });
        } else if (this.rangerCombatStyle === 'archery') {
          list.push({ id: 'rapid_shot', source: 'Ranger (Combat Style)' });
        }
      }
      if (ranger.level >= 3) {
        list.push({ id: 'endurance', source: 'Ranger (Class)' });
      }
      if (ranger.level >= 6) {
        if (this.rangerCombatStyle === 'twoweapon') {
          list.push({ id: 'improved_two_weapon_fighting', source: 'Ranger (Combat Style)' });
        } else if (this.rangerCombatStyle === 'archery') {
          list.push({ id: 'manyshot', source: 'Ranger (Combat Style)' });
        }
      }
      if (ranger.level >= 11) {
        if (this.rangerCombatStyle === 'twoweapon') {
          list.push({ id: 'greater_two_weapon_fighting', source: 'Ranger (Combat Style)' });
        } else if (this.rangerCombatStyle === 'archery') {
          list.push({ id: 'improved_precise_shot', source: 'Ranger (Combat Style)' });
        }
      }
    }
    
    // Wizard automatic feats
    const wizard = activeClasses.find(c => c.classType === 'wizard');
    if (wizard) {
      if (wizard.level >= 1) {
        list.push({ id: 'scribe_scroll', source: 'Wizard (Class)' });
      }
    }
    
    // Monk automatic feats
    const monk = activeClasses.find(c => c.classType === 'monk');
    if (monk) {
      if (monk.level >= 1) {
        list.push({ id: 'improved_unarmed_strike', source: 'Monk (Class)' });
      }
    }
    
    return list.filter(item => !disabled.includes(item.id));
  }

  hasFeat(featId) {
    const hasSelected = Array.isArray(this.feats) && this.feats.some(f => f.id === featId);
    if (hasSelected) return true;
    
    const autoFeats = this.getAutomaticFeats();
    return autoFeats.some(f => f.id === featId);
  }

  enterRage() {
    enterRage(this);
  }

  exitRage() {
    exitRage(this);
  }

  // @feature:wildshape — Druiden-Tiergestalt-Verwandlung
  enterShape(shapeName) {
    enterShape(this, shapeName);
  }

  exitShape() {
    exitShape(this);
  }

  prepareSpell(spellKey, metamagicList = [], isSpecialist = false) {
    return prepareSpell(this, spellKey, metamagicList, isSpecialist);
  }

  unprepareSpell(id) {
    unprepareSpell(this, id);
  }

  findSpell(key) {
    return findSpell(this, key);
  }

  applySpellTemplate(name) {
    return applySpellTemplate(this, name);
  }

  castPreparedSpell(id) {
    return castPreparedSpell(this, id);
  }

  castSpontaneousSpell(spellKey, slotLevel) {
    castSpontaneousSpell(this, spellKey, slotLevel);
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
    return calculateSkillModifier(this, skillKey);
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
      items: this.items,
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
      quickBuffs: this.quickBuffs,
      isRaging: this.isRaging,
      isSneakAttacking: this.isSneakAttacking,
      isSmiteActive: this.isSmiteActive,
      isFavoredEnemyActive: this.isFavoredEnemyActive,
      isDefensiveFighting: this.isDefensiveFighting,
      isTotalDefense: this.isTotalDefense,
      isFlurrying: this.isFlurrying,
      powerAttackPenalty: this.powerAttackPenalty,
      combatExpertisePenalty: this.combatExpertisePenalty,
      divineGraceActive: this.divineGraceActive,
      isTrickyFightingActive: this.isTrickyFightingActive,
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
      skillTricks: this.skillTricks,
      acfs: this.acfs,
      skills: this.skills,
      race: this.race,
      alignment: this.alignment,
      isHuman: this.isHuman,
      prestigeSpellLinks: this.prestigeSpellLinks,
      prestigeSpecialTextConfirmed: this.prestigeSpecialTextConfirmed
    };

  }

  getSizeModifier() {
    // @feature:wildshape — Large Brown Bear has size modifier -1
    if (this.activeShape === 'bear') {
      return -1;
    }
    const race = (this.race || 'human').toLowerCase();
    if (race === 'gnome' || race === 'halfling' || race === 'deep_halfling') {
      return 1;
    }
    return 0;
  }

  getFavoredEnemyBonus() {
    return getFavoredEnemyBonus(this);
  }

  getSneakAttackDiceCount() {
    return getSneakAttackDiceCount(this);
  }

  getWeaponDamageDice(w) {
    return getWeaponDamageDice(this, w);
  }

  getEquippedArmor() {
    // @feature:wildshape — Armor is suppressed in wild shape
    if (this.activeShape !== 'none') return null;
    if (!Array.isArray(this.armors)) return null;
    return this.armors.find(a => a.isEquipped && !a.isShield) || null;
  }

  getEquippedShield() {
    // @feature:wildshape — Shield is suppressed in wild shape
    if (this.activeShape !== 'none') return null;
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
