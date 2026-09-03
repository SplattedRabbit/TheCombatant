/**
 * @module    domains-data
 * @summary   D&D 3.5e Core Cleric Domains (22 PHB Domains) with granted powers and level 1-9 domain spells.
 * @exports   DOMAINS_REGISTRY, getDomain, getSpellDomains, isSpellInDomain, isDomainSpellForPC, getDomainSpellsForPC
 */

export const DOMAINS_REGISTRY = {
  air: {
    id: 'air',
    name: 'Air',
    desc: 'Mastery over the winds, weather, and creatures of the sky.',
    grantedPower: {
      type: 'turn_rebuke_elemental',
      desc: 'Turn or destroy earth creatures as a good cleric turns undead. Rebuke, command, or bolster air creatures as an evil cleric rebukes undead. Use these abilities a total number of times per day equal to 3 + your Charisma modifier.'
    },
    spells: {
      1: 'obscuring_mist',
      2: 'wind_wall',
      3: 'gaseous_form',
      4: 'air_walk',
      5: 'control_winds',
      6: 'chain_lightning',
      7: 'control_weather',
      8: 'whirlwind',
      9: 'elemental_swarm'
    }
  },
  animal: {
    id: 'animal',
    name: 'Animal',
    desc: 'Kinship with beasts and the instincts of wild creatures.',
    grantedPower: {
      type: 'bonus_class_skill',
      classSkills: ['knowledge_nature'],
      desc: 'You can use speak with animals once per day as a spell-like ability. Knowledge (nature) is a class skill for you.'
    },
    spells: {
      1: 'calm_animals',
      2: 'hold_animal',
      3: 'dominate_animal',
      4: 'summon_natures_ally_iv',
      5: 'commune_with_nature',
      6: 'antilife_shell',
      7: 'animal_shapes',
      8: 'summon_natures_ally_viii',
      9: 'shapechange'
    }
  },
  chaos: {
    id: 'chaos',
    name: 'Chaos',
    desc: 'The untamed power of unpredictability, freedom, and anarchy.',
    grantedPower: {
      type: 'caster_level_boost',
      descriptor: 'Chaotic',
      desc: 'You cast chaos spells at +1 caster level.'
    },
    spells: {
      1: 'protection_from_law',
      2: 'shatter',
      3: 'magic_circle_against_law',
      4: 'chaos_hammer',
      5: 'dispel_law',
      6: 'animate_objects',
      7: 'word_of_chaos',
      8: 'cloak_of_chaos',
      9: 'summon_monster_ix'
    }
  },
  death: {
    id: 'death',
    name: 'Death',
    desc: 'Command over mortality, soul severance, and final passage.',
    grantedPower: {
      type: 'daily_action',
      name: 'Death Touch',
      desc: 'You may use a death touch once per day. Make a melee touch attack against a living creature; roll 1d6 per cleric level. If the total at least equals the creature\'s current hit points, it dies instantly (no save).'
    },
    spells: {
      1: 'cause_fear',
      2: 'death_knell',
      3: 'animate_dead',
      4: 'death_ward',
      5: 'slay_living',
      6: 'create_undead',
      7: 'destruction',
      8: 'create_greater_undead',
      9: 'wail_of_the_banshee'
    }
  },
  destruction: {
    id: 'destruction',
    name: 'Destruction',
    desc: 'The righteous or apocalyptic ruin of structures and beings.',
    grantedPower: {
      type: 'daily_action',
      name: 'Smite',
      desc: 'You gain the smite power (1/day): make a single melee attack with a +4 bonus on attack rolls and a bonus on damage equal to your cleric level.'
    },
    spells: {
      1: 'inflict_light_wounds',
      2: 'shatter',
      3: 'contagion',
      4: 'inflict_critical_wounds',
      5: 'flame_strike',
      6: 'harm',
      7: 'disintegrate',
      8: 'earthquake',
      9: 'implosion'
    }
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    desc: 'Unshakable fortitude and dominion over stone and mineral.',
    grantedPower: {
      type: 'turn_rebuke_elemental',
      desc: 'Turn or destroy air creatures as a good cleric turns undead. Rebuke, command, or bolster earth creatures as an evil cleric rebukes undead (3 + Cha mod times/day).'
    },
    spells: {
      1: 'magic_stone',
      2: 'soften_earth_and_stone',
      3: 'stone_shape',
      4: 'spike_stones',
      5: 'wall_of_stone',
      6: 'stoneskin',
      7: 'earthquake',
      8: 'iron_body',
      9: 'elemental_swarm'
    }
  },
  evil: {
    id: 'evil',
    name: 'Evil',
    desc: 'The corrupting forces of darkness, malice, and damnation.',
    grantedPower: {
      type: 'caster_level_boost',
      descriptor: 'Evil',
      desc: 'You cast evil spells at +1 caster level.'
    },
    spells: {
      1: 'protection_from_good',
      2: 'desecrate',
      3: 'magic_circle_against_good',
      4: 'unholy_blight',
      5: 'dispel_good',
      6: 'create_undead',
      7: 'blasphemy',
      8: 'unholy_aura',
      9: 'summon_monster_ix'
    }
  },
  fire: {
    id: 'fire',
    name: 'Fire',
    desc: 'Consuming heat, incandescent flame, and purification.',
    grantedPower: {
      type: 'turn_rebuke_elemental',
      desc: 'Turn or destroy water creatures as a good cleric turns undead. Rebuke, command, or bolster fire creatures as an evil cleric rebukes undead (3 + Cha mod times/day).'
    },
    spells: {
      1: 'burning_hands',
      2: 'produce_flame',
      3: 'resist_energy',
      4: 'wall_of_fire',
      5: 'fire_shield',
      6: 'fire_seeds',
      7: 'fire_storm',
      8: 'incendiary_cloud',
      9: 'elemental_swarm'
    }
  },
  good: {
    id: 'good',
    name: 'Good',
    desc: 'Benevolence, righteous defense, and holy illumination.',
    grantedPower: {
      type: 'caster_level_boost',
      descriptor: 'Good',
      desc: 'You cast good spells at +1 caster level.'
    },
    spells: {
      1: 'protection_from_evil',
      2: 'aid',
      3: 'magic_circle_against_evil',
      4: 'holy_smite',
      5: 'dispel_evil',
      6: 'blade_barrier',
      7: 'holy_word',
      8: 'holy_aura',
      9: 'summon_monster_ix'
    }
  },
  healing: {
    id: 'healing',
    name: 'Healing',
    desc: 'Mending of flesh, restoration of vigor, and revitalization.',
    grantedPower: {
      type: 'caster_level_boost',
      subschool: 'Healing',
      desc: 'You cast healing spells at +1 caster level.'
    },
    spells: {
      1: 'cure_light_wounds',
      2: 'cure_moderate_wounds',
      3: 'cure_serious_wounds',
      4: 'cure_critical_wounds',
      5: 'cure_light_wounds_mass',
      6: 'heal',
      7: 'regenerate',
      8: 'cure_critical_wounds_mass',
      9: 'mass_heal'
    }
  },
  knowledge: {
    id: 'knowledge',
    name: 'Knowledge',
    desc: 'Secrets of the multiverse, divination, and lore.',
    grantedPower: {
      type: 'bonus_class_skills_all_knowledge',
      desc: 'All Knowledge skills are class skills. You cast divination spells at +1 caster level.'
    },
    spells: {
      1: 'detect_secret_doors',
      2: 'detect_thoughts',
      3: 'clairaudience_clairvoyance',
      4: 'divination',
      5: 'true_seeing',
      6: 'find_the_path',
      7: 'legend_lore',
      8: 'discern_location',
      9: 'foresight'
    }
  },
  law: {
    id: 'law',
    name: 'Law',
    desc: 'Order, divine oaths, stability, and unyielding discipline.',
    grantedPower: {
      type: 'caster_level_boost',
      descriptor: 'Lawful',
      desc: 'You cast law spells at +1 caster level.'
    },
    spells: {
      1: 'protection_from_chaos',
      2: 'calm_emotions',
      3: 'magic_circle_against_chaos',
      4: 'order_s_wrath',
      5: 'dispel_chaos',
      6: 'hold_monster',
      7: 'dictum',
      8: 'shield_of_law',
      9: 'summon_monster_ix'
    }
  },
  luck: {
    id: 'luck',
    name: 'Luck',
    desc: 'Fortune, narrow escapes, and destiny-bending favor.',
    grantedPower: {
      type: 'daily_action',
      name: 'Good Fortune',
      desc: 'You gain the power of good fortune (1/day). You can reroll one roll you have just made before the DM declares success or failure, taking the second result.'
    },
    spells: {
      1: 'entropic_shield',
      2: 'aid',
      3: 'protection_from_energy',
      4: 'freedom_of_movement',
      5: 'break_enchantment',
      6: 'mislead',
      7: 'spell_turning',
      8: 'moment_of_prescience',
      9: 'miracle'
    }
  },
  magic: {
    id: 'magic',
    name: 'Magic',
    desc: 'The weave of arcane and divine power.',
    grantedPower: {
      type: 'spell_trigger_activation',
      desc: 'Use scrolls, wands, and other devices with spell completion or spell trigger activation as a wizard of one-half your cleric level (at least 1st level).'
    },
    spells: {
      1: 'mage_armor',
      2: 'identify',
      3: 'dispel_magic',
      4: 'imbue_with_spell_ability',
      5: 'spell_resistance',
      6: 'antimagic_field',
      7: 'spell_turning',
      8: 'protection_from_spells',
      9: 'mordenkainen_s_disjunction'
    }
  },
  plant: {
    id: 'plant',
    name: 'Plant',
    desc: 'Flora, ancient groves, roots, and verdant growth.',
    grantedPower: {
      type: 'rebuke_plants',
      classSkills: ['knowledge_nature'],
      desc: 'Rebuke or command plant creatures as an evil cleric rebukes undead (3 + Cha mod times/day). Knowledge (nature) is a class skill.'
    },
    spells: {
      1: 'entangle',
      2: 'barkskin',
      3: 'plant_growth',
      4: 'command_plants',
      5: 'wall_of_thorns',
      6: 'repel_wood',
      7: 'animate_plants',
      8: 'control_plants',
      9: 'shambler'
    }
  },
  protection: {
    id: 'protection',
    name: 'Protection',
    desc: 'Divine wards, abjurations, and sanctuary from harm.',
    grantedPower: {
      type: 'daily_action',
      name: 'Protective Ward',
      desc: 'You can generate a protective ward (1/day) as a standard action. Touch a creature to grant a resistance bonus on its next saving throw equal to your cleric level (duration 1 hour).'
    },
    spells: {
      1: 'sanctuary',
      2: 'shield_other',
      3: 'protection_from_energy',
      4: 'spell_immunity',
      5: 'spell_resistance',
      6: 'antimagic_field',
      7: 'repulsion',
      8: 'mind_blank',
      9: 'prismatic_sphere'
    }
  },
  strength: {
    id: 'strength',
    name: 'Strength',
    desc: 'Raw muscle, athletic might, and titanic feats.',
    grantedPower: {
      type: 'daily_action',
      name: 'Feat of Strength',
      desc: 'You can perform a feat of strength (1/day) as a free action, gaining an enhancement bonus to Strength equal to your cleric level for 1 round.'
    },
    spells: {
      1: 'enlarge_person',
      2: 'bulls_strength',
      3: 'magic_vestment',
      4: 'spell_immunity',
      5: 'righteous_might',
      6: 'stoneskin',
      7: 'bigby_s_grasping_hand',
      8: 'bigby_s_clenched_fist',
      9: 'bigby_s_crushing_hand'
    }
  },
  sun: {
    id: 'sun',
    name: 'Sun',
    desc: 'Solar radiance, daytime glory, and pure destructive light against the undead.',
    grantedPower: {
      type: 'daily_action',
      name: 'Greater Turning',
      desc: 'Once per day, you can perform a greater turning in place of a regular turning check. Undead that would normally be turned are destroyed instead.'
    },
    spells: {
      1: 'endure_elements',
      2: 'heat_metal',
      3: 'searing_light',
      4: 'fire_shield',
      5: 'flame_strike',
      6: 'fire_seeds',
      7: 'sunbeam',
      8: 'sunburst',
      9: 'prismatic_sphere'
    }
  },
  travel: {
    id: 'travel',
    name: 'Travel',
    desc: 'Speed, teleportation, crossing boundaries, and wandering.',
    grantedPower: {
      type: 'freedom_of_movement_rounds',
      classSkills: ['survival'],
      desc: 'For a total of 1 round per cleric level per day, you can act as if under the effect of freedom of movement (rounds need not be consecutive). Survival is a class skill.'
    },
    spells: {
      1: 'longstrider',
      2: 'locate_object',
      3: 'fly',
      4: 'dimension_door',
      5: 'teleport',
      6: 'find_the_path',
      7: 'greater_teleport',
      8: 'phase_door',
      9: 'astral_projection'
    }
  },
  trickery: {
    id: 'trickery',
    name: 'Trickery',
    desc: 'Deception, illusions, subterfuge, and misdirection.',
    grantedPower: {
      type: 'bonus_class_skills',
      classSkills: ['bluff', 'disguise', 'hide'],
      desc: 'Bluff, Disguise, and Hide are class skills for you.'
    },
    spells: {
      1: 'disguise_self',
      2: 'invisibility',
      3: 'nondetection',
      4: 'confusion',
      5: 'false_vision',
      6: 'mislead',
      7: 'screen',
      8: 'polymorph_any_object',
      9: 'time_stop'
    }
  },
  war: {
    id: 'war',
    name: 'War',
    desc: 'Combat mastery, battle zeal, and military dominance.',
    grantedPower: {
      type: 'war_prof_focus',
      desc: 'Free Martial Weapon Proficiency and Weapon Focus with your deity\'s favored weapon.'
    },
    spells: {
      1: 'magic_weapon',
      2: 'spiritual_weapon',
      3: 'magic_vestment',
      4: 'divine_power',
      5: 'flame_strike',
      6: 'blade_barrier',
      7: 'power_word_blind',
      8: 'power_word_stun',
      9: 'power_word_kill'
    }
  },
  water: {
    id: 'water',
    name: 'Water',
    desc: 'Tides, oceans, currents, cold, and storms.',
    grantedPower: {
      type: 'turn_rebuke_elemental',
      desc: 'Turn or destroy fire creatures as a good cleric turns undead. Rebuke, command, or bolster water creatures as an evil cleric rebukes undead (3 + Cha mod times/day).'
    },
    spells: {
      1: 'obscuring_mist',
      2: 'fog_cloud',
      3: 'water_breathing',
      4: 'control_water',
      5: 'ice_storm',
      6: 'cone_of_cold',
      7: 'acid_fog',
      8: 'horrid_wilting',
      9: 'elemental_swarm'
    }
  }
};

/**
 * Retrieve domain definition by ID.
 */
export function getDomain(domainId) {
  if (!domainId) return null;
  return DOMAINS_REGISTRY[String(domainId).toLowerCase().trim()] || null;
}

/**
 * Returns all domains where a specific spell is listed, along with the spell level in that domain.
 * @param {string} spellKey
 * @returns {Array<{ domainId: string, domainName: string, level: number }>}
 */
export function getSpellDomains(spellKey) {
  if (!spellKey) return [];
  const matches = [];
  for (const [domId, dom] of Object.entries(DOMAINS_REGISTRY)) {
    for (const [lvl, key] of Object.entries(dom.spells)) {
      if (key === spellKey) {
        matches.push({
          domainId: domId,
          domainName: dom.name,
          level: Number(lvl)
        });
      }
    }
  }
  return matches;
}

/**
 * Checks if a spell belongs to a specific domain.
 */
export function isSpellInDomain(spellKey, domainId, targetLevel = null) {
  const dom = getDomain(domainId);
  if (!dom) return false;
  for (const [lvl, key] of Object.entries(dom.spells)) {
    if (key === spellKey) {
      if (targetLevel !== null && Number(lvl) !== Number(targetLevel)) continue;
      return true;
    }
  }
  return false;
}

/**
 * Checks if a spell is a domain spell available to a PC based on their chosen domains (pc.clericDomains).
 * @param {string} spellKey
 * @param {object} pc
 * @returns {boolean}
 */
export function isDomainSpellForPC(spellKey, pc) {
  if (!pc || !Array.isArray(pc.clericDomains) || pc.clericDomains.length === 0) return false;
  return pc.clericDomains.some(domId => isSpellInDomain(spellKey, domId));
}

/**
 * Returns all domain spells granted to a PC by their chosen domains up to maxSpellLevel.
 * @param {object} pc
 * @param {number} maxSpellLevel
 * @returns {Array<{ spellId: string, domainId: string, level: number }>}
 */
export function getDomainSpellsForPC(pc, maxSpellLevel = 9) {
  if (!pc || !Array.isArray(pc.clericDomains) || pc.clericDomains.length === 0) return [];
  const results = [];
  for (const domId of pc.clericDomains) {
    const dom = getDomain(domId);
    if (!dom) continue;
    for (let lvl = 1; lvl <= maxSpellLevel; lvl++) {
      const spellId = dom.spells[lvl];
      if (spellId) {
        results.push({ spellId, domainId: domId, level: lvl });
      }
    }
  }
  return results;
}
