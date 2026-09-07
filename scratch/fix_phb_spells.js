import fs from 'fs';

const phbPath = './data/spells-phb.json';
const phb = JSON.parse(fs.readFileSync(phbPath, 'utf8'));

// 1. Fix malformed keys and names
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

// 2. Add missing essential spells
if (!phb['cure_minor_wounds']) {
  phb['cure_minor_wounds'] = {
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
  };
}

if (!phb['inflict_minor_wounds']) {
  phb['inflict_minor_wounds'] = {
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
  };
}

if (!phb['read_magic']) {
  phb['read_magic'] = {
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
  };
}

if (!phb['daze']) {
  phb['daze'] = {
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
  };
}

if (!phb['know_direction']) {
  phb['know_direction'] = {
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
  };
}

// 3. Clean swallowed tails from descriptions
const schoolPatterns = [
  'Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation', 'Universal'
];

let cleanedCount = 0;
for (const [key, s] of Object.entries(phb)) {
  if (typeof s.description === 'string') {
    const orig = s.description;
    // Look for trailing words that match a spell name + school at the end of the description
    // E.g. "... deals 1d3 points of cold damage. Read Magic Divination"
    // E.g. "... Each affected undead may attempt a Will save for half damage. Cure Minor Wounds Conjuration (Healing)"
    const regex = /\s+[A-Z][a-zA-Z’'/, -]+\s+(?:Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation|Universal)(?:\s*\([^)]+\))?(?:\s*\[[^\]]+\])?$/;
    if (regex.test(s.description)) {
      s.description = s.description.replace(regex, '').trim();
      cleanedCount++;
    }
  }
}

console.log(`Cleaned trailing tails from ${cleanedCount} spell descriptions.`);

// Sort keys alphabetically
const sortedPhb = {};
Object.keys(phb).sort().forEach(k => {
  sortedPhb[k] = phb[k];
});

fs.writeFileSync(phbPath, JSON.stringify(sortedPhb, null, 2), 'utf8');
console.log('Successfully wrote updated data/spells-phb.json with', Object.keys(sortedPhb).length, 'spells.');
