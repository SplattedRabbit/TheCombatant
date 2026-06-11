/**
 * @module    rules
 * @summary   Statische D&D-3.5e-Regelkonstanten und Berechnungsfunktionen: Klassendaten, BAB-Progressionen, Rettungswurf-Tabellen, Skill-Listen, Zauberslot-Tabellen.
 * @exports   CombatRules (Objekt mit CLASSES, CLASS_SKILLS, CLASS_PROFILES, BAB/Save-Tabellen, calculateBab, calculateSave, calculateMaxSpellSlots, isClassSkill, getPCMaxRanks)
 * @reads     pc.classes, pc.str/wis/cha/int (für Zauberslot-Bonus-Berechnung), pc.wizardSpecialization
 * @stateOps  Keine — reine Berechnungsfunktionen ohne State-Mutation
 * @depends   Keine externen Imports
 * @notHere   Angriffs-/Schadensberechnung → AttackEngine.js | Rettungswürfe → SaveCalculator.js | UI → PCAttributes.js, PCSkillsTab.js
 */
export const CombatRules = {
  CONDITIONS: [
    {
      n: 'Temp-HP',
      r: '<strong>Temporäre Trefferpunkte</strong> werden zu den maximalen TP addiert. Schaden wird normal von den aktuellen TP abgezogen. Beim Entfernen des Zustands werden die Temp-HP von den maximalen TP abgezogen (aktuelle TP werden entsprechend gekappt).'
    },
    {
      n: 'Blind',
      r: '<strong>−2 auf Angriffswürfe</strong> und Rüstungsklasse. Gegner gelten als unsichtbar (50% Trefferchance verfehlen). Bewegung halbe Geschwindigkeit. Immunität gegen Sichtzauber.'
    },
    {
      n: 'Betäubt',
      r: 'Kann <strong>keine Aktionen</strong> ausführen, lässt gehaltene Gegenstände fallen. Verliert Ges-Bonus auf RK. Angreifer erhalten +2 auf Angriffswürfe.'
    },
    {
      n: 'Erschöpft',
      r: '<strong>−6 auf Stärke und Geschicklichkeit</strong>, Bewegungsweite halbiert. Kann nicht rennen oder einen Sturmangriff ausführen. Ruhe 1 Stunde heilt zu Erschüttert.'
    },
    {
      n: 'Erschüttert',
      r: '<strong>−2 auf Angriffswürfe, Rettungswürfe, Fähigkeitswürfe</strong> und Zauberangriffswürfe. Schwächere Form von Erschöpft.'
    },
    {
      n: 'Festgehalten',
      r: '<strong>Geschwindigkeit 0</strong>, kein Ges-Bonus auf RK. −4 auf Rüstungsklasse. Fernkampfangriffe gegen ihn erhalten +4. Kann nur begrenzte Aktionen ausführen.'
    },
    {
      n: 'Flach auf dem Boden',
      r: '<strong>−4 auf Nahkampfangriffe</strong>. Nahkampfangriffe gegen ihn +4, Fernkampfangriffe −4. Aufstehen kostet eine Bewegungsaktion (kann AoO provozieren).'
    },
    {
      n: 'Gelähmt',
      r: '<strong>Stärke und Geschicklichkeit effektiv 0</strong>. Kann sich nicht bewegen oder handeln. Fällt um, falls stehend. Ziel ist hilflos.'
    },
    {
      n: 'Hilflos',
      r: 'RK = <strong>5 + Größenmodifikator</strong>. Angreifer können einen <strong>Gnadenstoß</strong> ausführen (volle Runde, ZÄ-SG 10 + angerichteter Schaden oder sofortiger Tod). Gebunden, bewusstlos oder schlafen gilt als hilflos.'
    },
    {
      n: 'Krank',
      r: '<strong>−4 auf Stärke und Konstitution</strong>. Reduzierte TP durch Kon-Verlust sind sofort wirksam. Ruhe und Heilzauber können helfen.'
    },
    {
      n: 'Niedergestreckt',
      r: 'Muss eine <strong>Bewegungsaktion zum Aufstehen</strong> aufwenden (provoziert AoO). Kann kämpfen während er liegt (−4 auf Angriffe). Kombination mit Flach auf dem Boden möglich.'
    },
    {
      n: 'Panisch',
      r: '<strong>Muss fliehen</strong>, solange die Bedrohung anhält. −2 auf Angriffs- und Rettungswürfe. Kann nur rennen oder kämpfen wenn er in die Enge getrieben ist. Stärker als Verängstigt.'
    },
    {
      n: 'Paralysiert',
      r: '<strong>Stärke und Geschicklichkeit effektiv 0</strong>, kann nicht handeln. Ähnlich wie Gelähmt, aber typisch durch Magie oder Gift. Ziel ist hilflos.'
    },
    {
      n: 'Schlafend',
      r: '<strong>Hilflos</strong>. Normales Geräusch (Lärm) oder Schaden weckt ihn. Angreifer erhalten automatisch kritische Treffer (Gnadenstoß). Ges-Bonus auf RK entfällt.'
    },
    {
      n: 'Schüttelnd',
      r: '<strong>−2 auf Angriffswürfe, Rettungswürfe und Fertigkeitswürfe</strong>. Ähnlich wie Erschüttert, aber durch Schreck oder Einschüchterung ausgelöst.'
    },
    {
      n: 'Sterbend',
      r: '<strong>Bewusstlos</strong>, verliert jede Runde automatisch 1 Trefferpunkt. W10-Wurf am Ende jedes eigenen Zuges: ≥ 10 = stabilisiert. Stabilisiert = keine weiteren TP-Verluste, aber noch bewusstlos.'
    },
    {
      n: 'Taub',
      r: 'Kann <strong>keine akustischen Signale</strong> wahrnehmen. <strong>20% Zauberversagen</strong> bei verbalen Komponenten. Misslingenswurf beim Zaubern (ZÄ SG 20 + Zauberstufe).'
    },
    {
      n: 'Tot',
      r: 'Bei <strong>−10 TP oder weniger</strong>, oder durch Todeseffekte. Kann nur durch <em>Wiederbelebung</em>, <em>Auferweckung</em> oder <em>Wahre Auferstehung</em> zurückgebracht werden.'
    },
    {
      n: 'Überrascht',
      r: 'Verliert die <strong>erste Runde</strong> komplett (keine Aktionen, keine AoO). Verliert Ges-Bonus auf RK in der Überraschungsrunde. Gilt nur in der ersten Kampfrunde.'
    },
    {
      n: 'Unfähig',
      r: 'Ähnlich wie bewusstlos, aber durch <strong>nichtletalen Schaden</strong>. Erholt sich mit 1 TP/Stunde oder durch Heilung. Gilt als hilflos.'
    },
    {
      n: 'Verängstigt',
      r: '<strong>−2 auf Angriffs- und Rettungswürfe</strong>. Muss die Quelle der Angst meiden, flieht wenn möglich. Kann kämpfen wenn er nicht fliehen kann. Schwächer als Panisch.'
    },
    {
      n: 'Verwirrt',
      r: 'Würfle <strong>1W100</strong> zu Beginn des Zuges: 01–10 normal handeln, 11–20 kein Angriff, 21–50 handlungsunfähig, 51–70 nächste Kreatur angreifen, 71–100 sich selbst angreifen.'
    },
    {
      n: 'Verzaubert',
      r: 'Betrachtet den <strong>Zauberer als Freund</strong> und vertrauenswürdige Person. Greift ihn nicht an. Spezifische Effekte je nach Zauber (<em>Freund</em>, <em>Beherrschung</em> usw.).'
    }
  ],
  
  CLASSES: [
    { key: 'fighter', nameDe: 'Kämpfer', nameEn: 'Fighter', bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' } },
    { key: 'cleric', nameDe: 'Kleriker', nameEn: 'Cleric', bab: 'avg',  saves: { fort: 'good', ref: 'poor', wil: 'good' } },
    { key: 'rogue', nameDe: 'Schurke', nameEn: 'Rogue', bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'poor' } },
    { key: 'wizard', nameDe: 'Magier', nameEn: 'Wizard', bab: 'poor',  saves: { fort: 'poor', ref: 'poor', wil: 'good' } },
    { key: 'barbarian', nameDe: 'Barbar', nameEn: 'Barbarian', bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' } },
    { key: 'bard', nameDe: 'Barde', nameEn: 'Bard', bab: 'avg',  saves: { fort: 'poor', ref: 'good', wil: 'good' } },
    { key: 'druid', nameDe: 'Druide', nameEn: 'Druid', bab: 'avg',  saves: { fort: 'good', ref: 'poor', wil: 'good' } },
    { key: 'monk', nameDe: 'Mönch', nameEn: 'Monk', bab: 'avg',  saves: { fort: 'good', ref: 'good', wil: 'good' } },
    { key: 'paladin', nameDe: 'Paladin', nameEn: 'Paladin', bab: 'good', saves: { fort: 'good', ref: 'poor', wil: 'poor' } },
    { key: 'ranger', nameDe: 'Waldläufer', nameEn: 'Ranger', bab: 'good', saves: { fort: 'good', ref: 'good', wil: 'poor' } },
    { key: 'sorcerer', nameDe: 'Hexenmeister', nameEn: 'Sorcerer', bab: 'poor', saves: { fort: 'poor', ref: 'poor', wil: 'good' } },
    { key: 'custom', nameDe: 'Benutzerdefiniert', nameEn: 'Custom', bab: 'custom', saves: { fort: 'custom', ref: 'custom', wil: 'custom' } }
  ],
  
  CLASS_SKILLS: {
    barbarian: ['climb', 'craft', 'handle_animal', 'intimidate', 'jump', 'listen', 'ride', 'survival', 'swim'],
    bard: [
      'appraise', 'balance', 'bluff', 'climb', 'concentration', 'craft', 'decipher_script', 'diplomacy',
      'disguise', 'escape_artist', 'gather_information', 'hide', 'jump', 'knowledge_arcana', 'knowledge_dungeons',
      'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion',
      'knowledge_other', 'listen', 'move_silently', 'perform', 'profession', 'sense_motive', 'sleight_of_hand',
      'spellcraft', 'tumble', 'use_magic_device', 'use_rope'
    ],
    cleric: ['concentration', 'craft', 'diplomacy', 'heal', 'knowledge_arcana', 'knowledge_history', 'knowledge_religion', 'knowledge_planes', 'profession', 'spellcraft'],
    druid: ['concentration', 'craft', 'diplomacy', 'handle_animal', 'heal', 'knowledge_nature', 'knowledge_other', 'listen', 'profession', 'ride', 'spellcraft', 'spot', 'survival', 'swim'],
    fighter: ['climb', 'craft', 'handle_animal', 'intimidate', 'jump', 'ride', 'swim'],
    monk: ['balance', 'climb', 'concentration', 'craft', 'diplomacy', 'escape_artist', 'hide', 'jump', 'knowledge_arcana', 'knowledge_religion', 'listen', 'move_silently', 'perform', 'profession', 'sense_motive', 'spot', 'tumble', 'swim'],
    paladin: ['concentration', 'craft', 'diplomacy', 'handle_animal', 'heal', 'knowledge_religion', 'knowledge_other', 'profession', 'ride'],
    ranger: ['climb', 'concentration', 'craft', 'handle_animal', 'heal', 'hide', 'jump', 'knowledge_dungeons', 'knowledge_nature', 'listen', 'move_silently', 'ride', 'search', 'spot', 'survival', 'swim', 'use_rope'],
    rogue: [
      'appraise', 'balance', 'bluff', 'climb', 'craft', 'decipher_script', 'diplomacy', 'disable_device',
      'disguise', 'escape_artist', 'forgery', 'gather_information', 'hide', 'intimidate', 'jump',
      'knowledge_local', 'listen', 'move_silently', 'open_lock', 'perform', 'profession', 'search',
      'sense_motive', 'sleight_of_hand', 'spot', 'tumble', 'use_magic_device', 'use_rope'
    ],
    sorcerer: ['concentration', 'craft', 'knowledge_arcana', 'profession', 'spellcraft'],
    wizard: [
      'concentration', 'craft', 'decipher_script', 'knowledge_arcana', 'knowledge_dungeons',
      'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_planes',
      'knowledge_religion', 'knowledge_other', 'profession', 'spellcraft'
    ]
  },

  isClassSkill: function(skillKey, pc) {
    if (!pc || !Array.isArray(pc.classes) || pc.classes.length === 0) {
      return false;
    }
    return pc.classes.some(c => {
      const skills = this.CLASS_SKILLS[c.classType];
      if (Array.isArray(skills)) {
        if (skillKey.startsWith('knowledge_') && (c.classType === 'wizard' || c.classType === 'bard')) {
          return true;
        }
        return skills.includes(skillKey);
      }
      return false;
    });
  },

  getPCMaxRanks: function(skillKey, pc) {
    if (!pc) return 0;
    const totalLevel = Array.isArray(pc.classes) ? pc.classes.reduce((sum, c) => sum + (c.level || 0), 0) : 1;
    const isClass = this.isClassSkill(skillKey, pc);
    return isClass ? (totalLevel + 3) : (totalLevel + 3) / 2;
  },

  calculateBab: function(progression, level) {
    const lvl = parseInt(level) || 1;
    if (progression === 'good') return lvl;
    if (progression === 'avg') return Math.floor(0.75 * lvl);
    if (progression === 'poor') return Math.floor(0.5 * lvl);
    return 0; // custom/manual
  },
  
  calculateSave: function(progression, level) {
    const lvl = parseInt(level) || 1;
    if (progression === 'good') return 2 + Math.floor(0.5 * lvl);
    if (progression === 'poor') return Math.floor(lvl / 3);
    return 0; // custom/manual
  },

  CLASS_PROFILES: {
    barbarian: {
      nameDe: "Barbar",
      getResources(level, stats) {
        return [
          {
            key: "rage",
            name: "Kampfrausch (Rage)",
            max: 1 + Math.floor(level / 4),
            type: "daily"
          }
        ];
      }
    },
    paladin: {
      nameDe: "Paladin",
      getResources(level, stats) {
        const score = stats.cha ? stats.cha.getValue() : 10;
        const chaMod = Math.floor((score - 10) / 2);
        return [
          {
            key: "smite_evil",
            name: "Böses niederstrecken",
            max: 1 + Math.floor((level - 1) / 5),
            type: "daily"
          },
          {
            key: "lay_on_hands",
            name: "Hände auflegen (Pool)",
            max: Math.max(0, level * chaMod),
            type: "pool"
          }
        ];
      }
    },
    cleric: {
      nameDe: "Kleriker",
      getResources(level, stats) {
        const score = stats.cha ? stats.cha.getValue() : 10;
        const chaMod = Math.floor((score - 10) / 2);
        return [
          {
            key: "turn_undead",
            name: "Untote vertreiben",
            max: Math.max(1, 3 + chaMod),
            type: "daily"
          }
        ];
      }
    },
    bard: {
      nameDe: "Barde",
      getResources(level, stats) {
        return [
          {
            key: "bardic_music",
            name: "Bardisches Lied",
            max: level,
            type: "daily"
          }
        ];
      }
    },
    druid: {
      nameDe: "Druide",
      getResources(level, stats) {
        let maxWildShape = 0;
        if (level >= 18) maxWildShape = 6;
        else if (level >= 14) maxWildShape = 5;
        else if (level >= 10) maxWildShape = 4;
        else if (level >= 7) maxWildShape = 3;
        else if (level >= 6) maxWildShape = 2;
        else if (level >= 5) maxWildShape = 1;
        
        const res = [];
        if (maxWildShape > 0) {
          res.push({
            key: "wild_shape",
            name: "Tiergestalt (Wild Shape)",
            max: maxWildShape,
            type: "daily"
          });
        }
        return res;
      }
    }
  },

  WIZ_CLER_DRU_TABLE: {
    1:  [3, 1],
    2:  [4, 2],
    3:  [4, 2, 1],
    4:  [4, 3, 2],
    5:  [4, 3, 2, 1],
    6:  [4, 3, 3, 2],
    7:  [4, 4, 3, 2, 1],
    8:  [4, 4, 3, 3, 2],
    9:  [4, 4, 4, 3, 2, 1],
    10: [4, 4, 4, 3, 3, 2],
    11: [4, 4, 4, 4, 3, 2, 1],
    12: [4, 4, 4, 4, 3, 3, 2],
    13: [4, 4, 4, 4, 4, 3, 2, 1],
    14: [4, 4, 4, 4, 4, 3, 3, 2],
    15: [4, 4, 4, 4, 4, 4, 3, 2, 1],
    16: [4, 4, 4, 4, 4, 4, 3, 3, 2],
    17: [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
    18: [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],
    19: [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
    20: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
  },
  SORCERER_TABLE: {
    1:  [5, 3],
    2:  [6, 4],
    3:  [6, 5],
    4:  [6, 6, 3],
    5:  [6, 6, 4],
    6:  [6, 6, 5, 3],
    7:  [6, 6, 6, 4],
    8:  [6, 6, 6, 5, 3],
    9:  [6, 6, 6, 6, 4],
    10: [6, 6, 6, 6, 5, 3],
    11: [6, 6, 6, 6, 6, 4],
    12: [6, 6, 6, 6, 6, 5, 3],
    13: [6, 6, 6, 6, 6, 6, 4],
    14: [6, 6, 6, 6, 6, 6, 5, 3],
    15: [6, 6, 6, 6, 6, 6, 6, 4],
    16: [6, 6, 6, 6, 6, 6, 6, 5, 3],
    17: [6, 6, 6, 6, 6, 6, 6, 6, 4],
    18: [6, 6, 6, 6, 6, 6, 6, 6, 5, 3],
    19: [6, 6, 6, 6, 6, 6, 6, 6, 6, 4],
    20: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
  },
  BARD_TABLE: {
    1:  [2],
    2:  [3, 0],
    3:  [3, 1],
    4:  [3, 2, 0],
    5:  [3, 3, 1],
    6:  [3, 3, 2],
    7:  [3, 3, 2, 0],
    8:  [3, 3, 3, 1],
    9:  [3, 3, 3, 2],
    10: [3, 3, 3, 2, 0],
    11: [3, 3, 3, 3, 1],
    12: [3, 3, 3, 3, 2],
    13: [3, 3, 3, 3, 2, 0],
    14: [3, 3, 3, 3, 3, 1],
    15: [3, 3, 3, 3, 3, 2],
    16: [3, 3, 3, 3, 3, 2, 0],
    17: [3, 3, 3, 3, 3, 3, 1],
    18: [3, 3, 3, 3, 3, 3, 2],
    19: [3, 3, 3, 3, 3, 3, 3],
    20: [3, 3, 3, 3, 3, 3, 3]
  },
  PALADIN_RANGER_TABLE: {
    1:  [],
    2:  [],
    3:  [],
    4:  [0, 0],
    5:  [0, 0],
    6:  [0, 1],
    7:  [0, 1],
    8:  [0, 1, 0],
    9:  [0, 1, 0],
    10: [0, 1, 1],
    11: [0, 1, 1, 0],
    12: [0, 1, 1, 1],
    13: [0, 1, 1, 1],
    14: [0, 2, 1, 1, 0],
    15: [0, 2, 1, 1, 1],
    16: [0, 2, 2, 1, 1],
    17: [0, 2, 2, 2, 1],
    18: [0, 3, 2, 2, 1],
    19: [0, 3, 3, 3, 2],
    20: [0, 3, 3, 3, 3]
  },

  getMaxSpellLevel: function(classType, classLevel) {
    let table;
    if (['wizard', 'cleric', 'druid'].includes(classType)) {
      table = this.WIZ_CLER_DRU_TABLE;
    } else if (classType === 'sorcerer') {
      table = this.SORCERER_TABLE;
    } else if (classType === 'bard') {
      table = this.BARD_TABLE;
    } else if (['paladin', 'ranger'].includes(classType)) {
      table = this.PALADIN_RANGER_TABLE;
    } else {
      return -1;
    }
    const slots = table[classLevel];
    return slots ? slots.length - 1 : -1;
  },

  calculateMaxSpellSlots: function(pc) {
    if (!Array.isArray(pc.classes) || pc.classes.length === 0) {
      return null;
    }

    const slots = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    let hasCaster = false;

    pc.classes.forEach(c => {
      let table;
      let keyAbility;
      if (['wizard', 'cleric', 'druid'].includes(c.classType)) {
        table = this.WIZ_CLER_DRU_TABLE;
        keyAbility = c.classType === 'wizard' ? 'int' : 'wis';
      } else if (c.classType === 'sorcerer') {
        table = this.SORCERER_TABLE;
        keyAbility = 'cha';
      } else if (c.classType === 'bard') {
        table = this.BARD_TABLE;
        keyAbility = 'cha';
      } else if (['paladin', 'ranger'].includes(c.classType)) {
        table = this.PALADIN_RANGER_TABLE;
        keyAbility = 'wis';
      } else {
        return; // Non-caster
      }

      hasCaster = true;
      const level = c.level;

      for (let lvl = 0; lvl <= 9; lvl++) {
        const base = table[level]?.[lvl];
        if (base !== undefined) {
          let classSlots = base;

          // D&D 3.5e RAW: Bonus spell slots ONLY apply to spell levels 1-9 (not level 0 spells!)
          if (lvl > 0) {
            const scoreStat = pc[keyAbility];
            const score = scoreStat instanceof Object && typeof scoreStat.getValue === 'function' ? scoreStat.getValue() : (parseInt(scoreStat) || 10);
            if (score >= 10 + lvl) {
              const modifier = Math.floor((score - 10) / 2);
              const bonus = (modifier - lvl >= 0) ? Math.ceil((modifier - lvl + 1) / 4) : 0;
              classSlots += bonus;
            }
          }

          // Specialist Wizard bonus (+1 slot per level) - also ONLY applies to spell levels 1-9
          if (c.classType === 'wizard' && pc.wizardSpecialization !== 'none' && lvl > 0 && base > 0) {
            classSlots += 1;
          }

          slots[lvl] += classSlots;
        }
      }
    });

    return hasCaster ? slots : { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  }
};
