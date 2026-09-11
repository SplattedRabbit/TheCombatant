import fs from 'fs';

// -------------------------------------------------------------
// 1. UPDATE SPELLS-PHB.JSON
// -------------------------------------------------------------
const phbPath = './data/spells-phb.json';
const phb = JSON.parse(fs.readFileSync(phbPath, 'utf8'));

// Fix malformed keys
const renames = {
  'enchantment_compulsion_': {
    newKey: 'aid',
    nameDe: 'Aid',
    nameEn: 'Aid',
    school: 'Enchantment (Compulsion) [Mind-Affecting]'
  },
  'enchantment_compulsion_mind_': {
    newKey: 'animal_messenger',
    nameDe: 'Animal Messenger',
    nameEn: 'Animal Messenger',
    school: 'Enchantment (Compulsion) [Mind-Affecting]'
  },
  'enchantment_compulsion_fear_mind_': {
    newKey: 'bane',
    nameDe: 'Bane',
    nameEn: 'Bane',
    school: 'Enchantment (Compulsion) [Fear, Mind-Affecting]'
  },
  'enchantment_compulsion_language_': {
    newKey: 'command',
    nameDe: 'Command',
    nameEn: 'Command',
    school: 'Enchantment (Compulsion) [Language-Dependent, Mind-Affecting]'
  },
  'illusion_phantasm_mind_affecting_': {
    newKey: 'nightmare',
    nameDe: 'Nightmare',
    nameEn: 'Nightmare',
    school: 'Illusion (Phantasm) [Mind-Affecting, Evil]'
  },
  'enchantment_compulsion_death_': {
    newKey: 'power_word_kill',
    nameDe: 'Power Word Kill',
    nameEn: 'Power Word Kill',
    school: 'Enchantment (Compulsion) [Death, Mind-Affecting]'
  }
};

for (const [oldKey, info] of Object.entries(renames)) {
  if (phb[oldKey]) {
    const s = phb[oldKey];
    s.nameDe = info.nameDe;
    s.nameEn = info.nameEn;
    s.school = info.school;
    delete phb[oldKey];
    phb[info.newKey] = s;
  }
}

// Add missing PHB spells
const missingPhbSpells = {
  cure_minor_wounds: {
    nameDe: 'Cure Minor Wounds',
    nameEn: 'Cure Minor Wounds',
    school: 'Conjuration (Healing)',
    level: 0,
    classLevels: [
      { class: 'cleric', level: 0 },
      { class: 'druid', level: 0 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Touch',
    targetOrEffectOrArea: 'Target: Creature touched',
    duration: 'Instantaneous',
    savingThrow: 'Will half (harmless) or Will half; see text',
    spellResistance: 'Yes (harmless) or Yes; see text',
    description: 'When laying your hand upon a living creature, you channel positive energy that cures 1 point of damage. Since undead are powered by negative energy, this spell deals 1 point of damage to an undead creature. An undead creature can apply spell resistance, and can attempt a Will save to take half damage.'
  },
  inflict_minor_wounds: {
    nameDe: 'Inflict Minor Wounds',
    nameEn: 'Inflict Minor Wounds',
    school: 'Necromancy',
    level: 0,
    classLevels: [
      { class: 'cleric', level: 0 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Touch',
    targetOrEffectOrArea: 'Target: Creature touched',
    duration: 'Instantaneous',
    savingThrow: 'Will half',
    spellResistance: 'Yes',
    description: 'When laying your hand upon a creature, you channel negative energy that deals 1 point of damage, since living creatures are harmed by negative energy. An undead creature touched instead is cured of 1 point of damage.'
  },
  read_magic: {
    nameDe: 'Read Magic',
    nameEn: 'Read Magic',
    school: 'Divination',
    level: 0,
    classLevels: [
      { class: 'wizard', level: 0 },
      { class: 'sorcerer', level: 0 },
      { class: 'cleric', level: 0 },
      { class: 'druid', level: 0 },
      { class: 'bard', level: 0 },
      { class: 'paladin', level: 1 },
      { class: 'ranger', level: 1 }
    ],
    components: 'V, S, F',
    castingTime: '1 standard action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '10 min./level',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'By means of read magic, you can decipher magical inscriptions on objects—books, scrolls, weapons, and the like—that would otherwise be unintelligible. This deciphering does not normally invoke the magic contained in the writing, although it may do so in the case of a cursed scroll. Furthermore, once the spell is cast and you have read the magical inscription, you are thereafter able to read that particular writing without again invoking the read magic spell. You can read at the rate of one page (250 words) per minute. The spell allows you to identify a glyph of warding with a DC 13 Spellcraft check, a greater glyph of warding with a DC 16 Spellcraft check, or any symbol spell with a Spellcraft check (DC 10 + spell level). Focus: A clear crystal or mineral prism.'
  },
  daze: {
    nameDe: 'Daze',
    nameEn: 'Daze',
    school: 'Enchantment (Compulsion) [Mind-Affecting]',
    level: 0,
    classLevels: [
      { class: 'wizard', level: 0 },
      { class: 'sorcerer', level: 0 },
      { class: 'bard', level: 0 }
    ],
    components: 'V, S, M',
    castingTime: '1 standard action',
    range: 'Close (25 ft. + 5 ft./2 levels)',
    targetOrEffectOrArea: 'Target: One humanoid creature of 4 HD or less',
    duration: '1 round',
    savingThrow: 'Will negates',
    spellResistance: 'Yes',
    description: 'This enchantment clouds the mind of a humanoid creature with 4 or fewer Hit Dice so that it takes no actions. Humanoids of 5 or more HD are unaffected. A dazed subject is not stunned, so attackers get no special advantage against it. Material Component: A pinch of wool or similar substance.'
  },
  know_direction: {
    nameDe: 'Know Direction',
    nameEn: 'Know Direction',
    school: 'Divination',
    level: 0,
    classLevels: [
      { class: 'druid', level: 0 },
      { class: 'bard', level: 1 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: 'Instantaneous',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'When you cast this spell, you instantly know the direction of north from your current position. The spell is effective in any environment in which “north” exists, but it may not work in extraplanar settings. Your knowledge of north is correct at the moment of casting, but you can get lost again within moments if you don’t find some external reference point to help you keep your bearings.'
  },
  comprehend_languages: {
    nameDe: 'Comprehend Languages',
    nameEn: 'Comprehend Languages',
    school: 'Divination',
    level: 1,
    classLevels: [
      { class: 'wizard', level: 1 },
      { class: 'sorcerer', level: 1 },
      { class: 'cleric', level: 1 },
      { class: 'bard', level: 1 }
    ],
    components: 'V, S, M/DF',
    castingTime: '1 standard action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '10 min./level',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You can understand the spoken words of creatures or read otherwise incomprehensible written messages. In either case, you must touch the creature or the writing. The ability to read does not necessarily impart insight into the material, merely its literal meaning. The spell enables you to understand or read an otherwise unintelligible language, but it does not enable you to speak or write it. Written material can be read at the rate of one page (250 words) per minute. Magical writing cannot be read, though the spell reveals that it is magical. This spell can be foiled by certain magical effects (such as the secret page and illusory script spells). It does not decipher codes or reveal messages concealed in nowhere-apparent ways (such as a secret code embedded within a poem). Arcane Material Component: A pinch of soot and a few grains of salt.'
  }
};

Object.assign(phb, missingPhbSpells);

// Clean description tails
for (const [key, s] of Object.entries(phb)) {
  if (typeof s.description === 'string') {
    const regex = /\s+[A-Z][a-zA-Z’'/, -]+\s+(?:Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation|Universal)(?:\s*\([^)]+\))?(?:\s*\[[^\]]+\])?$/;
    if (regex.test(s.description)) {
      s.description = s.description.replace(regex, '').trim();
    }
  }
}

const sortedPhb = {};
Object.keys(phb).sort().forEach(k => { sortedPhb[k] = phb[k]; });
fs.writeFileSync(phbPath, JSON.stringify(sortedPhb, null, 2), 'utf8');
console.log('Saved spells-phb.json with', Object.keys(sortedPhb).length, 'spells.');

// -------------------------------------------------------------
// 2. UPDATE SPELLS-PHB2.JSON
// -------------------------------------------------------------
const phb2Path = './data/spells-phb2.json';
let phb2 = {};
try { phb2 = JSON.parse(fs.readFileSync(phb2Path, 'utf8')); } catch (e) { phb2 = {}; }

const newPhb2Spells = {
  alter_fortune: {
    id: 'alter_fortune',
    nameDe: 'Schicksal wandeln',
    nameEn: 'Alter Fortune',
    level: 3,
    school: 'Divination',
    classes: ['bard', 'cleric', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'bard', level: 3 },
      { class: 'cleric', level: 3 },
      { class: 'sorcerer', level: 3 },
      { class: 'wizard', level: 3 }
    ],
    components: 'V, XP',
    castingTime: '1 immediate action',
    range: 'Close (25 ft. + 5 ft./2 levels)',
    targetOrEffectOrArea: 'Target: One creature',
    duration: 'Instantaneous',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'With a single word, you alter the outcome of an event by changing fortune itself. You cause any creature within range to immediately reroll any die roll it just made (attack roll, saving throw, skill check, or level check). The subject must abide by the result of the second roll. XP Cost: 200 XP.'
  },
  lesser_celerity: {
    id: 'lesser_celerity',
    nameDe: 'Geringe Schnelligkeit',
    nameEn: 'Lesser Celerity',
    level: 2,
    school: 'Transmutation',
    classes: ['sorcerer', 'wizard', 'bard'],
    classLevels: [
      { class: 'sorcerer', level: 2 },
      { class: 'wizard', level: 2 },
      { class: 'bard', level: 2 }
    ],
    components: 'V',
    castingTime: '1 immediate action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: 'Instantaneous',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You can immediately take a single move action on your turn or anyone else’s turn. After you take this action, you are dazed until the end of your next turn.'
  },
  celerity: {
    id: 'celerity',
    nameDe: 'Schnelligkeit',
    nameEn: 'Celerity',
    level: 4,
    school: 'Transmutation',
    classes: ['sorcerer', 'wizard', 'bard'],
    classLevels: [
      { class: 'sorcerer', level: 4 },
      { class: 'wizard', level: 4 },
      { class: 'bard', level: 4 }
    ],
    components: 'V',
    castingTime: '1 immediate action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: 'Instantaneous',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You immediately take a standard action as if your turn had just begun. After you take this action, you are dazed until the end of your next turn.'
  },
  greater_celerity: {
    id: 'greater_celerity',
    nameDe: 'Mächtige Schnelligkeit',
    nameEn: 'Greater Celerity',
    level: 8,
    school: 'Transmutation',
    classes: ['sorcerer', 'wizard'],
    classLevels: [
      { class: 'sorcerer', level: 8 },
      { class: 'wizard', level: 8 }
    ],
    components: 'V',
    castingTime: '1 immediate action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: 'Instantaneous',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You immediately take a full-round action (or a standard action and a move action). After you take this action, you are dazed until the end of your next turn.'
  },
  lesser_deflect: {
    id: 'lesser_deflect',
    nameDe: 'Geringe Abwehr',
    nameEn: 'Lesser Deflect',
    level: 1,
    school: 'Abjuration [Force]',
    classes: ['sorcerer', 'wizard', 'duskblade'],
    classLevels: [
      { class: 'sorcerer', level: 1 },
      { class: 'wizard', level: 1 }
    ],
    components: 'V',
    castingTime: '1 immediate action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 attack',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You project a barrier of invisible force that deflects a single incoming attack, granting you a +1 deflection bonus to AC per 3 caster levels (maximum +5 at 15th level) against that single attack.'
  },
  deflect: {
    id: 'deflect',
    nameDe: 'Abwehr',
    nameEn: 'Deflect',
    level: 2,
    school: 'Abjuration [Force]',
    classes: ['sorcerer', 'wizard', 'duskblade'],
    classLevels: [
      { class: 'sorcerer', level: 2 },
      { class: 'wizard', level: 2 }
    ],
    components: 'V',
    castingTime: '1 immediate action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 attack',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You gain a +1/2 caster level deflection bonus to AC (maximum +5 at 10th level) against a single incoming melee or ranged attack.'
  },
  chain_missile: {
    id: 'chain_missile',
    nameDe: 'Ketten-Geschoss',
    nameEn: 'Chain Missile',
    level: 3,
    school: 'Evocation [Force]',
    classes: ['sorcerer', 'wizard'],
    classLevels: [
      { class: 'sorcerer', level: 3 },
      { class: 'wizard', level: 3 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Medium (100 ft. + 10 ft./level)',
    targetOrEffectOrArea: 'Target: One primary target, plus secondary targets',
    duration: 'Instantaneous',
    savingThrow: 'None',
    spellResistance: 'Yes',
    description: 'You launch magic missiles that first strike a primary target for 1d4+1 force damage per two caster levels (maximum 10d4+10 at 20th level), then secondary missiles strike secondary targets within 30 feet for 1d4+1 damage each.'
  },
  kelgores_fire_bolt: {
    id: 'kelgores_fire_bolt',
    nameDe: 'Kelgores Feuerblitz',
    nameEn: "Kelgore's Fire Bolt",
    level: 1,
    school: 'Conjuration/Evocation [Fire]',
    classes: ['sorcerer', 'wizard', 'duskblade'],
    classLevels: [
      { class: 'sorcerer', level: 1 },
      { class: 'wizard', level: 1 }
    ],
    components: 'V, S, M',
    castingTime: '1 standard action',
    range: 'Medium (100 ft. + 10 ft./level)',
    targetOrEffectOrArea: 'Target: One creature',
    duration: 'Instantaneous',
    savingThrow: 'Reflex half; see text',
    spellResistance: 'Special; see text',
    description: 'A fiery bolt deals 1d6 fire damage per level (maximum 5d6). Even if the target has spell resistance that resists the evocation effect, 1d6 points of fire damage pierces through as conjured flame without allowing spell resistance.'
  },
  kelgores_grave_mist: {
    id: 'kelgores_grave_mist',
    nameDe: 'Kelgores Grabesnebel',
    nameEn: "Kelgore's Grave Mist",
    level: 2,
    school: 'Necromancy/Conjuration [Cold]',
    classes: ['sorcerer', 'wizard', 'dread_necromancer'],
    classLevels: [
      { class: 'sorcerer', level: 2 },
      { class: 'wizard', level: 2 }
    ],
    components: 'V, S, M',
    castingTime: '1 standard action',
    range: 'Medium (100 ft. + 10 ft./level)',
    targetOrEffectOrArea: 'Area: 20-ft.-radius spread',
    duration: '1 round/level',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'A chilling fog of negative energy and frost settles over the area. Living creatures within the mist take 1d6 cold damage each round and become fatigued while they remain within the mist. No saving throw or spell resistance applies.'
  },
  heart_of_air: {
    id: 'heart_of_air',
    nameDe: 'Herz der Luft',
    nameEn: 'Heart of Air',
    level: 2,
    school: 'Transmutation [Air]',
    classes: ['druid', 'sorcerer', 'wizard', 'wu_jen'],
    classLevels: [
      { class: 'druid', level: 2 },
      { class: 'sorcerer', level: 2 },
      { class: 'wizard', level: 2 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 hour/level (D) or until discharged',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You gain a +10 enhancement bonus on Jump checks and a fly speed bonus if you can fly. As an immediate action, you can discharge the spell to gain a feather fall effect. If you have two or more heart spells active, you gain light fortification.'
  },
  heart_of_water: {
    id: 'heart_of_water',
    nameDe: 'Herz des Wassers',
    nameEn: 'Heart of Water',
    level: 3,
    school: 'Transmutation [Water]',
    classes: ['druid', 'sorcerer', 'wizard', 'wu_jen'],
    classLevels: [
      { class: 'druid', level: 3 },
      { class: 'sorcerer', level: 3 },
      { class: 'wizard', level: 3 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 hour/level (D) or until discharged',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You gain a swim speed equal to your base land speed, the ability to breathe underwater, and a +5 enhancement bonus on Escape Artist checks. As an immediate action, you can discharge this spell to gain the benefit of freedom of movement for 1 round.'
  },
  heart_of_earth: {
    id: 'heart_of_earth',
    nameDe: 'Herz der Erde',
    nameEn: 'Heart of Earth',
    level: 4,
    school: 'Transmutation [Earth]',
    classes: ['druid', 'sorcerer', 'wizard', 'wu_jen'],
    classLevels: [
      { class: 'druid', level: 4 },
      { class: 'sorcerer', level: 4 },
      { class: 'wizard', level: 4 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 hour/level (D) or until discharged',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You gain a +8 bonus on checks to resist bull rush, overrun, or trip attacks, and temporary hit points equal to 2x your caster level (maximum 40). As an immediate action, you can discharge this spell to gain the benefit of stoneskin (damage reduction 10/adamantine) for 1 round per caster level.'
  },
  heart_of_fire: {
    id: 'heart_of_fire',
    nameDe: 'Herz des Feuers',
    nameEn: 'Heart of Fire',
    level: 5,
    school: 'Transmutation [Fire]',
    classes: ['druid', 'sorcerer', 'wizard', 'wu_jen'],
    classLevels: [
      { class: 'druid', level: 5 },
      { class: 'sorcerer', level: 5 },
      { class: 'wizard', level: 5 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 hour/level (D) or until discharged',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You gain a +10-foot enhancement bonus to your land speed and fire resistance 20. As a swift action, you can discharge the spell to gain a fire shield effect for 1 round per level. If you have all four Heart spells active, you gain immunity to extra damage from critical hits and sneak attacks.'
  },
  energy_aegis: {
    id: 'energy_aegis',
    nameDe: 'Energie-Aegis',
    nameEn: 'Energy Aegis',
    level: 3,
    school: 'Abjuration',
    classes: ['cleric', 'sorcerer', 'wizard', 'duskblade'],
    classLevels: [
      { class: 'cleric', level: 3 },
      { class: 'sorcerer', level: 3 },
      { class: 'wizard', level: 3 }
    ],
    components: 'V, DF',
    castingTime: '1 immediate action',
    range: 'Close (25 ft. + 5 ft./2 levels)',
    targetOrEffectOrArea: 'Target: One creature',
    duration: '1 round',
    savingThrow: 'Will negates (harmless)',
    spellResistance: 'Yes (harmless)',
    description: 'You grant the target energy resistance 20 against an energy type of your choice (acid, cold, electricity, fire, or sonic) until the start of your next turn.'
  },
  stay_the_hand: {
    id: 'stay_the_hand',
    nameDe: 'Schlag aufhalten',
    nameEn: 'Stay the Hand',
    level: 2,
    school: 'Enchantment (Compulsion) [Mind-Affecting]',
    classes: ['bard', 'cleric', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'bard', level: 2 },
      { class: 'cleric', level: 2 },
      { class: 'sorcerer', level: 2 },
      { class: 'wizard', level: 2 }
    ],
    components: 'V',
    castingTime: '1 immediate action',
    range: 'Medium (100 ft. + 10 ft./level)',
    targetOrEffectOrArea: 'Target: One humanoid creature',
    duration: 'Instantaneous',
    savingThrow: 'Will negates',
    spellResistance: 'Yes',
    description: 'You cause an opponent who is about to make an attack or cast a harmful spell to hesitate. If the target fails its Will save, its action is lost for that round and cannot be redirected.'
  },
  hesitate: {
    id: 'hesitate',
    nameDe: 'Zögern',
    nameEn: 'Hesitate',
    level: 3,
    school: 'Enchantment (Compulsion) [Mind-Affecting]',
    classes: ['bard', 'cleric', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'bard', level: 3 },
      { class: 'cleric', level: 3 },
      { class: 'sorcerer', level: 3 },
      { class: 'wizard', level: 3 }
    ],
    components: 'V, S',
    castingTime: '1 swift action',
    range: 'Close (25 ft. + 5 ft./2 levels)',
    targetOrEffectOrArea: 'Target: One living creature',
    duration: '1 round/level (D)',
    savingThrow: 'Will negates; see text',
    spellResistance: 'Yes',
    description: 'You force a subject to second-guess its actions. Each round on its turn, the subject can only take a move action unless it makes a successful Will save as a move action.'
  },
  chasing_perfection: {
    id: 'chasing_perfection',
    nameDe: 'Vollendung erstreben',
    nameEn: 'Chasing Perfection',
    level: 6,
    school: 'Transmutation',
    classes: ['cleric', 'druid', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'cleric', level: 6 },
      { class: 'druid', level: 6 },
      { class: 'sorcerer', level: 6 },
      { class: 'wizard', level: 6 }
    ],
    components: 'V, S, M',
    castingTime: '1 standard action',
    range: 'Touch',
    targetOrEffectOrArea: 'Target: Creature touched',
    duration: '1 min./level',
    savingThrow: 'Will negates (harmless)',
    spellResistance: 'Yes (harmless)',
    description: 'The subject gains a +4 enhancement bonus to all six ability scores: Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma.'
  },
  vertigo_field: {
    id: 'vertigo_field',
    nameDe: 'Schwindelfeld',
    nameEn: 'Vertigo Field',
    level: 3,
    school: 'Illusion (Shadow)',
    classes: ['bard', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'bard', level: 3 },
      { class: 'sorcerer', level: 3 },
      { class: 'wizard', level: 3 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Medium (100 ft. + 10 ft./level)',
    targetOrEffectOrArea: 'Area: 20-ft.-radius spread',
    duration: '1 round/level',
    savingThrow: 'Fortitude partial; see text',
    spellResistance: 'Yes',
    description: 'You create a field of swirling, illusory colors and shifting geometry. Any creature inside the area must succeed on a Fortitude save or become nauseated for as long as it remains in the field plus 1 round after. The area provides 20% concealment to creatures inside.'
  },
  legion_of_sentinels: {
    id: 'legion_of_sentinels',
    nameDe: 'Legion der Wächter',
    nameEn: 'Legion of Sentinels',
    level: 3,
    school: 'Illusion (Shadow)',
    classes: ['bard', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'bard', level: 3 },
      { class: 'sorcerer', level: 3 },
      { class: 'wizard', level: 3 }
    ],
    components: 'V, S, M',
    castingTime: '1 standard action',
    range: 'Close (25 ft. + 5 ft./2 levels)',
    targetOrEffectOrArea: 'Area: 10-ft.-radius emanation',
    duration: '1 round/level',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'A ghostly squad of armored sentinels appears in the area. They do not attack on your turn, but they threaten all squares in the area and make attacks of opportunity with ghostly swords (attack bonus equal to your caster level + your casting stat mod, dealing 1d8+1 damage per 3 caster levels).'
  },
  sure_strike: {
    id: 'sure_strike',
    nameDe: 'Sicherer Schlag',
    nameEn: 'Sure Strike',
    level: 2,
    school: 'Divination',
    classes: ['sorcerer', 'wizard', 'duskblade'],
    classLevels: [
      { class: 'sorcerer', level: 2 },
      { class: 'wizard', level: 2 }
    ],
    components: 'V',
    castingTime: '1 swift action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 round or until discharged',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You gain a +1 insight bonus on your next single attack roll for every 3 caster levels (maximum +5 at 15th level).'
  },
  blade_brothers: {
    id: 'blade_brothers',
    nameDe: 'Klingenbrüder',
    nameEn: 'Blade Brothers',
    level: 1,
    school: 'Abjuration',
    classes: ['cleric', 'paladin'],
    classLevels: [
      { class: 'cleric', level: 1 },
      { class: 'paladin', level: 1 }
    ],
    components: 'V, S, DF',
    castingTime: '1 immediate action',
    range: 'Close (25 ft. + 5 ft./2 levels)',
    targetOrEffectOrArea: 'Targets: You and one willing ally within range',
    duration: 'Instantaneous',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'When you or your targeted ally makes a saving throw against an ongoing or instantaneous effect, you can each roll the save and choose the higher result for both of you.'
  }
};

Object.assign(phb2, newPhb2Spells);
const sortedPhb2 = {};
Object.keys(phb2).sort().forEach(k => { sortedPhb2[k] = phb2[k]; });
fs.writeFileSync(phb2Path, JSON.stringify(sortedPhb2, null, 2), 'utf8');
console.log('Saved spells-phb2.json with', Object.keys(sortedPhb2).length, 'spells.');

// -------------------------------------------------------------
// 3. UPDATE SPELLS-CA.JSON
// -------------------------------------------------------------
const caPath = './data/spells-ca.json';
let ca = {};
try { ca = JSON.parse(fs.readFileSync(caPath, 'utf8')); } catch (e) { ca = {}; }

const newCaSpells = {
  iron_silence: {
    id: 'iron_silence',
    nameDe: 'Eiserne Stille',
    nameEn: 'Iron Silence',
    level: 2,
    school: 'Transmutation',
    classes: ['assassin', 'bard', 'cleric'],
    classLevels: [
      { class: 'assassin', level: 2 },
      { class: 'bard', level: 2 },
      { class: 'cleric', level: 2 }
    ],
    components: 'V, S, DF',
    castingTime: '1 standard action',
    range: 'Touch',
    targetOrEffectOrArea: 'Target: One suit of armor touched',
    duration: '1 hour/level (D)',
    savingThrow: 'Will negates (harmless, object)',
    spellResistance: 'Yes (harmless, object)',
    description: 'This spell completely negates the armor check penalty of the touched suit of armor on Hide and Move Silently checks. The armor functions normally in all other respects.'
  },
  wraithstrike: {
    id: 'wraithstrike',
    nameDe: 'Geisterschlag',
    nameEn: 'Wraithstrike',
    level: 2,
    school: 'Transmutation',
    classes: ['assassin', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'assassin', level: 2 },
      { class: 'sorcerer', level: 2 },
      { class: 'wizard', level: 2 }
    ],
    components: 'V, S',
    castingTime: '1 swift action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 round',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'For 1 round, your melee attacks and natural attacks are resolved as melee touch attacks, ignoring your opponents’ armor bonuses and natural armor bonuses to Armor Class.'
  },
  sniper_s_shot: {
    id: 'sniper_s_shot',
    nameDe: 'Präzisionsschuss',
    nameEn: "Sniper's Shot",
    level: 1,
    school: 'Divination',
    classes: ['assassin', 'ranger', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'assassin', level: 1 },
      { class: 'ranger', level: 1 },
      { class: 'sorcerer', level: 1 },
      { class: 'wizard', level: 1 }
    ],
    components: 'V, S',
    castingTime: '1 swift action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 round',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'For 1 round, you can make sneak attacks, sudden strikes, or skirmish attacks with ranged weapons without the normal 30-foot range limitation (up to your weapon’s maximum range).'
  },
  guided_shot: {
    id: 'guided_shot',
    nameDe: 'Geführter Schuss',
    nameEn: 'Guided Shot',
    level: 1,
    school: 'Divination',
    classes: ['ranger', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'ranger', level: 1 },
      { class: 'sorcerer', level: 1 },
      { class: 'wizard', level: 1 }
    ],
    components: 'V, S',
    castingTime: '1 swift action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 round',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'For 1 round, your ranged attacks ignore range increment penalties, and distance penalties. Your ranged attacks also ignore cover and concealment bonuses to AC (except for total cover and total concealment).'
  },
  critical_strike: {
    id: 'critical_strike',
    nameDe: 'Kritischer Stoß',
    nameEn: 'Critical Strike',
    level: 1,
    school: 'Divination',
    classes: ['assassin', 'bard', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'assassin', level: 1 },
      { class: 'bard', level: 1 },
      { class: 'sorcerer', level: 1 },
      { class: 'wizard', level: 1 }
    ],
    components: 'V',
    castingTime: '1 swift action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 round',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'For 1 round, your melee attacks against flanked foes or foes denied their Dexterity bonus to AC double their critical threat range, gain +4 bonus on rolls to confirm critical hits, and deal an additional 1d6 points of damage.'
  },
  bladeweave: {
    id: 'bladeweave',
    nameDe: 'Klingenweben',
    nameEn: 'Bladeweave',
    level: 2,
    school: 'Illusion',
    classes: ['bard', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'bard', level: 2 },
      { class: 'sorcerer', level: 2 },
      { class: 'wizard', level: 2 }
    ],
    components: 'V',
    castingTime: '1 swift action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 round/level',
    savingThrow: 'Will negates; see text',
    spellResistance: 'Yes',
    description: 'For the duration of the spell, once per round when you hit a creature with a melee attack, that creature must make a Will save or be dazed for 1 round.'
  },
  sonic_weapon: {
    id: 'sonic_weapon',
    nameDe: 'Schallwaffe',
    nameEn: 'Sonic Weapon',
    level: 2,
    school: 'Transmutation [Sonic]',
    classes: ['bard', 'sorcerer', 'wizard'],
    classLevels: [
      { class: 'bard', level: 2 },
      { class: 'sorcerer', level: 2 },
      { class: 'wizard', level: 2 }
    ],
    components: 'V',
    castingTime: '1 standard action',
    range: 'Touch',
    targetOrEffectOrArea: 'Target: Weapon touched',
    duration: '1 min./level',
    savingThrow: 'Will negates (harmless, object)',
    spellResistance: 'Yes (harmless, object)',
    description: 'This spell imbues a weapon with sonic energy. The weapon deals an extra 1d6 points of sonic damage on each successful hit.'
  },
  wild_instincts: {
    id: 'wild_instincts',
    nameDe: 'Wilde Instinkte',
    nameEn: 'Wild Instincts',
    level: 3,
    school: 'Divination',
    classes: ['druid', 'ranger'],
    classLevels: [
      { class: 'druid', level: 3 },
      { class: 'ranger', level: 2 }
    ],
    components: 'V, S, DF',
    castingTime: '1 standard action',
    range: 'Personal',
    targetOrEffectOrArea: 'Target: You',
    duration: '1 min./level',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You gain a +10 insight bonus on Listen and Spot checks. You retain your Dexterity bonus to AC even if flat-footed or struck by an invisible attacker.'
  },
  tactical_teleportation: {
    id: 'tactical_teleportation',
    nameDe: 'Taktische Teleportation',
    nameEn: 'Tactical Teleportation',
    level: 3,
    school: 'Conjuration (Teleportation)',
    classes: ['sorcerer', 'wizard'],
    classLevels: [
      { class: 'sorcerer', level: 3 },
      { class: 'wizard', level: 3 }
    ],
    components: 'V, S',
    castingTime: '1 standard action',
    range: 'Close (25 ft. + 5 ft./2 levels)',
    targetOrEffectOrArea: 'Targets: You and willing allies within range',
    duration: 'Instantaneous',
    savingThrow: 'None',
    spellResistance: 'No',
    description: 'You teleport yourself and up to one willing creature per 3 caster levels to unoccupied spaces that you can see within range.'
  }
};

Object.assign(ca, newCaSpells);
const sortedCa = {};
Object.keys(ca).sort().forEach(k => { sortedCa[k] = ca[k]; });
fs.writeFileSync(caPath, JSON.stringify(sortedCa, null, 2), 'utf8');
console.log('Saved spells-ca.json with', Object.keys(sortedCa).length, 'spells.');
