/**
 * @module    skillTricks-data
 * @summary   Complete static database of all 42 Skill Tricks from Complete Scoundrel (CS).
 * @exports   SKILL_TRICKS_REGISTRY
 */

export const SKILL_TRICKS_REGISTRY = {
  // --- INTERACTION TRICKS ---
  assume_quirk: {
    key: 'assume_quirk',
    nameDe: 'Assume Quirk',
    nameEn: 'Assume Quirk',
    category: 'interaction',
    prerequisites: {
      skills: { disguise: 5 }
    },
    benefitDe: 'When impersonating a particular individual, you can eliminate the normal Spot bonus granted to a viewer familiar with that individual.',
    benefitEn: 'When impersonating a particular individual, you can eliminate the normal Spot bonus granted to a viewer familiar with that individual.'
  },
  group_fake_out: {
    key: 'group_fake_out',
    nameDe: 'Group Fake-Out',
    nameEn: 'Group Fake-Out',
    category: 'interaction',
    prerequisites: {
      skills: { bluff: 8 }
    },
    benefitDe: 'You can perform a feint in combat against multiple opponents simultaneously.',
    benefitEn: 'You can perform a feint in combat against multiple opponents simultaneously.'
  },
  never_outnumbered: {
    key: 'never_outnumbered',
    nameDe: 'Never Outnumbered',
    nameEn: 'Never Outnumbered',
    category: 'interaction',
    prerequisites: {
      skills: { intimidate: 8 }
    },
    benefitDe: 'You can demoralize multiple foes in combat simultaneously.',
    benefitEn: 'You can demoralize multiple foes in combat simultaneously.'
  },
  second_impression: {
    key: 'second_impression',
    nameDe: 'Second Impression',
    nameEn: 'Second Impression',
    category: 'interaction',
    prerequisites: {
      skills: { bluff: 5, disguise: 5 }
    },
    benefitDe: 'If an observer sees through your disguise with a successful Spot check, you can attempt a Bluff check to convince him that he\'s mistaken.',
    benefitEn: 'If an observer sees through your disguise with a successful Spot check, you can attempt a Bluff check to convince him that he\'s mistaken.'
  },
  social_recovery: {
    key: 'social_recovery',
    nameDe: 'Social Recovery',
    nameEn: 'Social Recovery',
    category: 'interaction',
    prerequisites: {
      skills: { bluff: 8, diplomacy: 5 }
    },
    benefitDe: 'If your Diplomacy check to influence an NPC\'s attitude fails, you can make a Bluff check at a -10 penalty to replace it.',
    benefitEn: 'If your Diplomacy check to influence an NPC\'s attitude fails, you can make a Bluff check at a -10 penalty to replace it.'
  },
  timely_misdirection: {
    key: 'timely_misdirection',
    nameDe: 'Timely Misdirection',
    nameEn: 'Timely Misdirection',
    category: 'interaction',
    prerequisites: {
      skills: { bluff: 8 }
    },
    benefitDe: 'If you succeed on a Bluff check to feint in combat, your opponent can\'t make any attacks of opportunity against you until the start of its next turn.',
    benefitEn: 'If you succeed on a Bluff check to feint in combat, your opponent can\'t make any attacks of opportunity against you until the start of its next turn.'
  },

  // --- MANIPULATION TRICKS ---
  clever_improviser: {
    key: 'clever_improviser',
    nameDe: 'Clever Improviser',
    nameEn: 'Clever Improviser',
    category: 'manipulation',
    prerequisites: {
      skills: { disable_device: 5, open_lock: 5 }
    },
    benefitDe: 'When making a Disable Device or Open Lock check without using thieves\' tools, you ignore the normal -2 penalty.',
    benefitEn: 'When making a Disable Device or Open Lock check without using thieves\' tools, you ignore the normal -2 penalty.'
  },
  conceal_spellcasting: {
    key: 'conceal_spellcasting',
    nameDe: 'Conceal Spellcasting',
    nameEn: 'Conceal Spellcasting',
    category: 'manipulation',
    prerequisites: {
      skills: { concentration: 1, sleight_of_hand: 5, spellcraft: 1 }
    },
    benefitDe: 'You can cast a spell without revealing that you are doing so by making a Sleight of Hand check opposed by onlookers\' Spot checks.',
    benefitEn: 'You can cast a spell without revealing that you are doing so by making a Sleight of Hand check opposed by onlookers\' Spot checks.'
  },
  easy_escape: {
    key: 'easy_escape',
    nameDe: 'Easy Escape',
    nameEn: 'Easy Escape',
    category: 'manipulation',
    prerequisites: {
      skills: { escape_artist: 8 }
    },
    benefitDe: 'If you are Medium or smaller, you gain a +4 circumstance bonus on checks to escape a grapple or pin.',
    benefitEn: 'If you are Medium or smaller, you gain a +4 circumstance bonus on checks to escape a grapple or pin.'
  },
  false_theurgy: {
    key: 'false_theurgy',
    nameDe: 'False Theurgy',
    nameEn: 'False Theurgy',
    category: 'manipulation',
    prerequisites: {
      skills: { spellcraft: 8 },
      special: { or_skills: ['bluff', 'sleight_of_hand'], ranks: 8 }
    },
    benefitDe: 'Your spell appears to be another spell of the same level.',
    benefitEn: 'Your spell appears to be another spell of the same level.'
  },
  healing_hands: {
    key: 'healing_hands',
    nameDe: 'Healing Hands',
    nameEn: 'Healing Hands',
    category: 'manipulation',
    prerequisites: {
      skills: { heal: 5 }
    },
    benefitDe: 'Heal 1d6 damage when you successfully stabilize a dying character.',
    benefitEn: 'Heal 1d6 damage when you successfully stabilize a dying character.'
  },
  hidden_blade: {
    key: 'hidden_blade',
    nameDe: 'Hidden Blade',
    nameEn: 'Hidden Blade',
    category: 'manipulation',
    prerequisites: {
      skills: { sleight_of_hand: 5 },
      feats: ['quick_draw']
    },
    benefitDe: 'Draw hidden weapon as move action; treat foe as flat-footed.',
    benefitEn: 'Draw hidden weapon as move action; treat foe as flat-footed.'
  },
  mosquito_bite: {
    key: 'mosquito_bite',
    nameDe: 'Mosquito\'s Bite',
    nameEn: 'Mosquito\'s Bite',
    category: 'manipulation',
    prerequisites: {
      skills: { sleight_of_hand: 12 }
    },
    benefitDe: 'Flat-footed target does not notice damage you deal with a light weapon until the start of your next turn.',
    benefitEn: 'Flat-footed target does not notice damage you deal with a light weapon until the start of your next turn.'
  },
  opening_tap: {
    key: 'opening_tap',
    nameDe: 'Opening Tap',
    nameEn: 'Opening Tap',
    category: 'manipulation',
    prerequisites: {
      skills: { open_lock: 12 }
    },
    benefitDe: 'Open a lock as a swift action.',
    benefitEn: 'Open a lock as a swift action.'
  },
  quick_escape: {
    key: 'quick_escape',
    nameDe: 'Quick Escape',
    nameEn: 'Quick Escape',
    category: 'manipulation',
    prerequisites: {
      skills: { escape_artist: 12 }
    },
    benefitDe: 'Escape from grapple or restraints as a move action.',
    benefitEn: 'Escape from grapple or restraints as a move action.'
  },
  shrouded_dance: {
    key: 'shrouded_dance',
    nameDe: 'Shrouded Dance',
    nameEn: 'Shrouded Dance',
    category: 'manipulation',
    prerequisites: {
      skills: { hide: 8, perform: 5 }
    },
    benefitDe: 'Use move action to gain concealment for 1 round.',
    benefitEn: 'Use move action to gain concealment for 1 round.'
  },
  sudden_draw: {
    key: 'sudden_draw',
    nameDe: 'Sudden Draw',
    nameEn: 'Sudden Draw',
    category: 'manipulation',
    prerequisites: {
      skills: { sleight_of_hand: 8 },
      feats: ['quick_draw']
    },
    benefitDe: 'Draw hidden weapon as part of an attack of opportunity.',
    benefitEn: 'Draw hidden weapon as part of an attack of opportunity.'
  },
  whip_climber: {
    key: 'whip_climber',
    nameDe: 'Whip Climber',
    nameEn: 'Whip Climber',
    category: 'manipulation',
    prerequisites: {
      skills: { use_rope: 5 },
      feats: ['whip_proficiency']
    },
    benefitDe: 'Use a whip as a grappling hook.',
    benefitEn: 'Use a whip as a grappling hook.'
  },

  // --- MENTAL TRICKS ---
  clarity_of_vision: {
    key: 'clarity_of_vision',
    nameDe: 'Clarity of Vision',
    nameEn: 'Clarity of Vision',
    category: 'mental',
    prerequisites: {
      skills: { spot: 12 }
    },
    benefitDe: 'Notice invisible enemies for 1 round as a swift action.',
    benefitEn: 'Notice invisible enemies for 1 round as a swift action.'
  },
  collector_of_stories: {
    key: 'collector_of_stories',
    nameDe: 'Collector of Stories',
    nameEn: 'Collector of Stories',
    category: 'mental',
    prerequisites: {
      special: { any_knowledge: 5 }
    },
    benefitDe: 'When you attempt a trained Knowledge check to identify a creature or to learn its special powers or vulnerabilities, you gain a +5 competence bonus on the check.',
    benefitEn: 'When you attempt a trained Knowledge check to identify a creature or to learn its special powers or vulnerabilities, you gain a +5 competence bonus on the check.'
  },
  listen_to_this: {
    key: 'listen_to_this',
    nameDe: 'Listen to This',
    nameEn: 'Listen to This',
    category: 'mental',
    prerequisites: {
      skills: { listen: 5 }
    },
    benefitDe: 'You can perfectly repeat what you\'ve recently heard by making a Perform check.',
    benefitEn: 'You can perfectly repeat what you\'ve recently heard by making a Perform check.'
  },
  magical_appraisal: {
    key: 'magical_appraisal',
    nameDe: 'Magical Appraisal',
    nameEn: 'Magical Appraisal',
    category: 'mental',
    prerequisites: {
      skills: { appraise: 5, knowledge_arcana: 5, spellcraft: 12 }
    },
    benefitDe: 'Determine the properties of a magic item with an Appraise check.',
    benefitEn: 'Determine the properties of a magic item with an Appraise check.'
  },
  point_it_out: {
    key: 'point_it_out',
    nameDe: 'Point It Out',
    nameEn: 'Point It Out',
    category: 'mental',
    prerequisites: {
      skills: { spot: 8 }
    },
    benefitDe: 'You can point out a spotted target to an ally, granting them a free Spot check to see it.',
    benefitEn: 'You can point out a spotted target to an ally, granting them a free Spot check to see it.'
  },
  spot_the_weak_point: {
    key: 'spot_the_weak_point',
    nameDe: 'Spot the Weak Point',
    nameEn: 'Spot the Weak Point',
    category: 'mental',
    prerequisites: {
      skills: { spot: 12 }
    },
    benefitDe: 'As a standard action, make a Spot check against opponent\'s AC; if successful, your next attack is a touch attack.',
    benefitEn: 'As a standard action, make a Spot check against opponent\'s AC; if successful, your next attack is a touch attack.'
  },
  swift_concentration: {
    key: 'swift_concentration',
    nameDe: 'Swift Concentration',
    nameEn: 'Swift Concentration',
    category: 'mental',
    prerequisites: {
      skills: { concentration: 12 }
    },
    benefitDe: 'Maintain concentration on a spell or similar effect as a swift action.',
    benefitEn: 'Maintain concentration on a spell or similar effect as a swift action.'
  },

  // --- MOVEMENT TRICKS ---
  acrobatic_backstab: {
    key: 'acrobatic_backstab',
    nameDe: 'Acrobatic Backstab',
    nameEn: 'Acrobatic Backstab',
    category: 'movement',
    prerequisites: {
      skills: { tumble: 12 }
    },
    benefitDe: 'Move through foe\'s space to render it flat-footed against your next melee attack.',
    benefitEn: 'Move through foe\'s space to render it flat-footed against your next melee attack.'
  },
  back_on_your_feet: {
    key: 'back_on_your_feet',
    nameDe: 'Back on Your Feet',
    nameEn: 'Back on Your Feet',
    category: 'movement',
    prerequisites: {
      skills: { tumble: 12 }
    },
    benefitDe: 'React immediately to stand up from prone as an immediate action without provoking attacks of opportunity.',
    benefitEn: 'React immediately to stand up from prone as an immediate action without provoking attacks of opportunity.'
  },
  corner_perch: {
    key: 'corner_perch',
    nameDe: 'Corner Perch',
    nameEn: 'Corner Perch',
    category: 'movement',
    prerequisites: {
      skills: { climb: 8 }
    },
    benefitDe: 'Perch in a chimney or corner to leave hands free.',
    benefitEn: 'Perch in a chimney or corner to leave hands free.'
  },
  dismount_attack: {
    key: 'dismount_attack',
    nameDe: 'Dismount Attack',
    nameEn: 'Dismount Attack',
    category: 'movement',
    prerequisites: {
      skills: { ride: 5 }
    },
    benefitDe: 'Make a fast dismount from a moving mount to charge a foe.',
    benefitEn: 'Make a fast dismount from a moving mount to charge a foe.'
  },
  escape_attack: {
    key: 'escape_attack',
    nameDe: 'Escape Attack',
    nameEn: 'Escape Attack',
    category: 'movement',
    prerequisites: {
      skills: { escape_artist: 8 }
    },
    benefitDe: 'Make an attack the same round you escape a grapple.',
    benefitEn: 'Make an attack the same round you escape a grapple.'
  },
  extreme_leap: {
    key: 'extreme_leap',
    nameDe: 'Extreme Leap',
    nameEn: 'Extreme Leap',
    category: 'movement',
    prerequisites: {
      skills: { jump: 5 }
    },
    benefitDe: 'Horizontal jump of at least 10 feet allows 10 extra feet of movement that round.',
    benefitEn: 'Horizontal jump of at least 10 feet allows 10 extra feet of movement that round.'
  },
  leaping_climber: {
    key: 'leaping_climber',
    nameDe: 'Leaping Climber',
    nameEn: 'Leaping Climber',
    category: 'movement',
    prerequisites: {
      skills: { climb: 5, jump: 5 }
    },
    benefitDe: 'Add jump distance to start of climb.',
    benefitEn: 'Add jump distance to start of climb.'
  },
  nimble_charge: {
    key: 'nimble_charge',
    nameDe: 'Nimble Charge',
    nameEn: 'Nimble Charge',
    category: 'movement',
    prerequisites: {
      skills: { balance: 5 }
    },
    benefitDe: 'Run or charge across difficult or slippery surface without a Balance check.',
    benefitEn: 'Run or charge across difficult or slippery surface without a Balance check.'
  },
  nimble_stand: {
    key: 'nimble_stand',
    nameDe: 'Nimble Stand',
    nameEn: 'Nimble Stand',
    category: 'movement',
    prerequisites: {
      skills: { tumble: 8 }
    },
    benefitDe: 'Stand from prone safely without provoking attacks of opportunity.',
    benefitEn: 'Stand from prone safely without provoking attacks of opportunity.'
  },
  quick_swimmer: {
    key: 'quick_swimmer',
    nameDe: 'Quick Swimmer',
    nameEn: 'Quick Swimmer',
    category: 'movement',
    prerequisites: {
      skills: { swim: 5 }
    },
    benefitDe: 'Swim 10 additional feet with successful Swim check.',
    benefitEn: 'Swim 10 additional feet with successful Swim check.'
  },
  slipping_past: {
    key: 'slipping_past',
    nameDe: 'Slipping Past',
    nameEn: 'Slipping Past',
    category: 'movement',
    prerequisites: {
      skills: { escape_artist: 5, tumble: 5 }
    },
    benefitDe: 'Move into a tight space without penalties.',
    benefitEn: 'Move into a tight space without penalties.'
  },
  speedy_ascent: {
    key: 'speedy_ascent',
    nameDe: 'Speedy Ascent',
    nameEn: 'Speedy Ascent',
    category: 'movement',
    prerequisites: {
      skills: { climb: 5 }
    },
    benefitDe: 'Climb 10 additional feet with successful Climb check.',
    benefitEn: 'Climb 10 additional feet with successful Climb check.'
  },
  tumbling_crawl: {
    key: 'tumbling_crawl',
    nameDe: 'Tumbling Crawl',
    nameEn: 'Tumbling Crawl',
    category: 'movement',
    prerequisites: {
      skills: { tumble: 5 }
    },
    benefitDe: 'Crawl 5 feet without provoking attacks of opportunity.',
    benefitEn: 'Crawl 5 feet without provoking attacks of opportunity.'
  },
  twisted_charge: {
    key: 'twisted_charge',
    nameDe: 'Twisted Charge',
    nameEn: 'Twisted Charge',
    category: 'movement',
    prerequisites: {
      skills: { balance: 5, tumble: 5 }
    },
    benefitDe: 'Make one direction change during a charge.',
    benefitEn: 'Make one direction change during a charge.'
  },
  up_the_hill: {
    key: 'up_the_hill',
    nameDe: 'Up the Hill',
    nameEn: 'Up the Hill',
    category: 'movement',
    prerequisites: {
      skills: { balance: 5, jump: 5 }
    },
    benefitDe: 'Move up a steep slope or stairs at normal speed.',
    benefitEn: 'Move up a steep slope or stairs at normal speed.'
  },
  walk_the_walls: {
    key: 'walk_the_walls',
    nameDe: 'Walk the Walls',
    nameEn: 'Walk the Walls',
    category: 'movement',
    prerequisites: {
      skills: { climb: 12, tumble: 5 }
    },
    benefitDe: 'Run straight up wall for 1 round.',
    benefitEn: 'Run straight up wall for 1 round.'
  },
  wall_jumper: {
    key: 'wall_jumper',
    nameDe: 'Wall Jumper',
    nameEn: 'Wall Jumper',
    category: 'movement',
    prerequisites: {
      skills: { climb: 5, jump: 5 }
    },
    benefitDe: 'Leap horizontally from a wall as if you had a running start.',
    benefitEn: 'Leap horizontally from a wall as if you had a running start.'
  }
};
