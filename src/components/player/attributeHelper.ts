import { showCustomAlert } from '@core/ui/components/dialogs.js';

/**
 * Shows a dialog with a detailed explanation of the selected D&D 3.5 attribute.
 * @param key Attribute abbreviation ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha')
 */
export const showAttributeExplanation = (key: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') => {
  const explanations = {
    str: {
      title: 'Strength (STR)',
      icon: '💪',
      desc: 'Controls:\nDetermines your character\'s physical power. It is particularly important for Fighters, Barbarians, Paladins, Rangers, and Monks, as it directly influences their combat effectiveness.\n\nInfluences:\n• Melee attack and damage rolls\n• Damage rolls with thrown weapons\n• Damage with two-handed weapons (1.5x Strength bonus)\n• Skills: Climb, Jump, Swim\n• Carrying capacity of your character'
    },
    dex: {
      title: 'Dexterity (DEX)',
      icon: '🏹',
      desc: 'Controls:\nDetermines hand-eye coordination, agility, reflexes, balance, and aim. It is the most important attribute for Rogues and ranged attackers.\n\nInfluences:\n• Ranged attack rolls and Initiative checks\n• Armor Class (AC) - makes it harder for enemies to hit you\n• Reflex saving throws (dodging spells/traps)\n• Skills: Move Silently, Hide, Open Lock, Tumble, Sleight of Hand'
    },
    con: {
      title: 'Constitution (CON)',
      icon: '🛡️',
      desc: 'Controls:\nRepresents health, stamina, and durability. It is equally important for all classes, as it ensures survival in combat.\n\nInfluences:\n• Extra Hit Points (HP) per Hit Die/level\n• Fortitude saving throws (resistance against poison, disease, paralysis)\n• Skill: Concentration (important for spellcasters under attack)'
    },
    int: {
      title: 'Intelligence (INT)',
      icon: '🧠',
      desc: 'Controls:\nReflects mental acuity, learning ability, and memory. Important for Wizards and characters who want to use many skills.\n\nInfluences:\n• Number of skill points at character creation (x4 at level 1) and at each level up\n• Maximum spell level and Difficulty Class (DC) for Wizard spells\n• Skills: Knowledge (all), Search, Speak Language, Craft, Appraise'
    },
    wis: {
      title: 'Wisdom (WIS)',
      icon: '👁️',
      desc: 'Controls:\nDescribes intuition, willpower, perception, and judgment. Important for Clerics, Druids, Rangers, and Monks.\n\nInfluences:\n• Will saving throws (resistance against mind control and illusions)\n• Maximum spell level and Difficulty Class (DC) for Cleric, Druid, and Ranger spells\n• Skills: Listen, Spot, Sense Motive, Heal, Survival'
    },
    cha: {
      title: 'Charisma (CHA)',
      icon: '👑',
      desc: 'Controls:\nMeasures force of personality, persuasiveness, personal magnetism, and leadership ability. Important for Sorcerers, Bards, and Paladins.\n\nInfluences:\n• Maximum spell level and Difficulty Class (DC) for Sorcerer and Bard spells\n• Turn Undead checks (Clerics & Paladins)\n• Skills: Bluff, Diplomacy, Intimidate, Gather Information, Handle Animal'
    }
  };
  const info = explanations[key];
  // @ts-ignore
  showCustomAlert(info.title, info.desc, 'Understood', info.icon);
};
