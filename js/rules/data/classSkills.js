/**
 * @module    classSkills
 * @summary   Static D&D 3.5e class skill lists and base skill points per level.
 * @feature   rules
 * @exports   CLASS_SKILLS, CLASS_BASE_SKILLS
 */

export const CLASS_SKILLS = {
  shadowbane_inquisitor: [
    'climb', 'concentration', 'craft', 'decipher_script', 'gather_information',
    'heal', 'hide', 'jump', 'knowledge_religion', 'move_silently',
    'profession', 'search', 'sense_motive', 'swim'
  ],
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
  ],
  mystic_theurge: [
    'concentration', 'craft', 'decipher_script', 'knowledge_arcana', 'knowledge_religion', 'profession', 'sense_motive', 'spellcraft'
  ],
  arcane_trickster: [
    'appraise', 'balance', 'bluff', 'climb', 'concentration', 'craft', 'decipher_script', 'diplomacy', 'disable_device',
    'disguise', 'escape_artist', 'gather_information', 'hide', 'jump', 'knowledge_arcana', 'listen', 'move_silently',
    'open_lock', 'profession', 'sense_motive', 'search', 'sleight_of_hand', 'spellcraft', 'spot', 'swim', 'tumble', 'use_rope'
  ],
  dragon_disciple: [
    'concentration', 'craft', 'diplomacy', 'escape_artist', 'gather_information',
    'knowledge_arcana', 'knowledge_dungeons', 'knowledge_history', 'knowledge_local', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion', 'knowledge_other',
    'listen', 'profession', 'search', 'spellcraft', 'spot'
  ],
  assassin: [
    'balance', 'bluff', 'climb', 'craft', 'decipher_script', 'diplomacy', 'disable_device', 'disguise',
    'escape_artist', 'forgery', 'gather_information', 'hide', 'intimidate', 'jump', 'listen',
    'move_silently', 'open_lock', 'search', 'sense_motive', 'sleight_of_hand', 'spot', 'swim', 'tumble', 'use_magic_device', 'use_rope'
  ],
  spellwarp_sniper: [
    'concentration', 'craft', 'hide', 'intimidate', 'knowledge_arcana', 'move_silently',
    'profession', 'spellcraft', 'spot'
  ],
  battle_trickster: [
    'balance', 'bluff', 'climb', 'craft', 'diplomacy', 'disable_device', 'disguise', 'escape_artist',
    'gather_information', 'handle_animal', 'hide', 'intimidate', 'jump', 'listen', 'move_silently',
    'open_lock', 'perform', 'profession', 'ride', 'search', 'sense_motive', 'sleight_of_hand', 'spot',
    'survival', 'swim', 'tumble', 'use_rope'
  ],
  // PHB2 Base Classes
  duskblade: [
    'climb', 'concentration', 'craft', 'decipher_script', 'intimidate', 'jump', 'knowledge_arcana',
    'knowledge_dungeons', 'profession', 'ride', 'spellcraft', 'swim'
  ],
  beguiler: [
    'appraise', 'bluff', 'concentration', 'craft', 'decipher_script', 'diplomacy', 'disguise',
    'escape_artist', 'gather_information', 'hide', 'knowledge_arcana', 'knowledge_dungeons',
    'knowledge_local', 'knowledge_planes', 'knowledge_religion', 'knowledge_other',
    'listen', 'move_silently', 'open_lock', 'profession', 'search', 'sense_motive',
    'sleight_of_hand', 'spellcraft', 'spot', 'tumble', 'use_magic_device'
  ],
  knight: [
    'climb', 'craft', 'diplomacy', 'handle_animal', 'intimidate', 'jump', 'knowledge_history',
    'knowledge_other', 'profession', 'ride', 'sense_motive', 'swim'
  ],
  dragon_shaman: [
    'climb', 'craft', 'diplomacy', 'jump', 'knowledge_arcana', 'knowledge_dungeons',
    'knowledge_history', 'knowledge_nature', 'knowledge_planes', 'knowledge_religion',
    'profession', 'swim'
  ],
  // Complete Adventurer Base Classes
  ninja: [
    'balance', 'bluff', 'climb', 'craft', 'diplomacy', 'disable_device', 'disguise',
    'escape_artist', 'hide', 'jump', 'listen', 'move_silently', 'open_lock', 'profession',
    'search', 'sense_motive', 'sleight_of_hand', 'spot', 'swim', 'tumble', 'use_rope'
  ],
  scout: [
    'balance', 'climb', 'craft', 'disable_device', 'escape_artist', 'handle_animal',
    'hide', 'jump', 'knowledge_dungeons', 'knowledge_geography', 'knowledge_nature',
    'listen', 'move_silently', 'profession', 'ride', 'search', 'sense_motive', 'spot',
    'survival', 'swim', 'tumble', 'use_rope'
  ],
  spellthief: [
    'appraise', 'balance', 'bluff', 'climb', 'concentration', 'craft', 'decipher_script',
    'diplomacy', 'disable_device', 'disguise', 'escape_artist', 'gather_information',
    'hide', 'jump', 'knowledge_arcana', 'listen', 'move_silently', 'open_lock', 'profession',
    'search', 'sense_motive', 'sleight_of_hand', 'spot', 'spellcraft', 'tumble',
    'use_magic_device', 'use_rope'
  ]
};

export const CLASS_BASE_SKILLS = {
  // PHB Core
  barbarian: 4,
  bard: 6,
  cleric: 2,
  druid: 4,
  fighter: 2,
  monk: 4,
  paladin: 2,
  ranger: 6,
  rogue: 8,
  sorcerer: 2,
  wizard: 2,
  // PHB2
  duskblade:    2,
  beguiler:     6,
  knight:       2,
  dragon_shaman: 2,
  // Complete Adventurer
  ninja:       6,
  scout:       8,
  spellthief:  6,
  // Prestige Classes
  mystic_theurge: 2,
  arcane_trickster: 4,
  dragon_disciple: 2,
  assassin: 4,
  battle_trickster: 4,
  spellwarp_sniper: 4,
  shadowbane_inquisitor: 4,
  custom: 2
};
