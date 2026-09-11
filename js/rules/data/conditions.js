/**
 * @module    conditions
 * @summary   Static D&D 3.5e conditions registry with descriptive mechanical text.
 * @feature   rules
 * @exports   CONDITIONS
 */

export const CONDITIONS = [
  {
    n: 'Temp HP',
    r: '<strong>Temporary Hit Points</strong> are added to maximum HP. Damage is subtracted from current HP as normal. Removing the condition subtracts the temporary hit points from maximum HP (current HP is capped accordingly).'
  },
  {
    n: 'Blinded',
    r: '<strong>−2 to attack rolls</strong> and Armor Class (AC). Enemies are treated as having total concealment (50% miss chance). Move at half speed. Immune to gaze attacks.'
  },
  {
    n: 'Stunned',
    r: 'Cannot <strong>take actions</strong>, drops held items. Loses Dex bonus to AC. Attackers gain a +2 bonus on attack rolls.'
  },
  {
    n: 'Exhausted',
    r: '<strong>−6 to Strength and Dexterity</strong>, movement speed halved. Cannot run or charge. Resting 1 hour cures to Shaken/Fatigued.'
  },
  {
    n: 'Shaken',
    r: '<strong>−2 to attack rolls, saving throws, ability checks</strong>, and spell attack rolls. Mild form of fear.'
  },
  {
    n: 'Pinned',
    r: '<strong>Speed 0</strong>, loses Dex bonus to AC. −4 to AC. Ranged attacks against them gain +4. Can take only limited actions.'
  },
  {
    n: 'Prone',
    r: '<strong>−4 to melee attack rolls</strong>. Melee attacks against them gain +4, ranged attacks suffer −4. Standing up costs a move action (can provoke attacks of opportunity).'
  },
  {
    n: 'Paralyzed',
    r: '<strong>Strength and Dexterity effectively 0</strong>. Cannot move or act. Falls down if standing. Target is helpless.'
  },
  {
    n: 'Helpless',
    r: 'AC is <strong>5 + size modifier</strong>. Attackers can perform a <strong>coup de grace</strong> (full-round action, Fortitude save DC 10 + damage dealt or instant death). Bound, unconscious, or sleeping targets are helpless.'
  },
  {
    n: 'Sickened',
    r: '<strong>−4 to Strength and Constitution</strong>. Reduced HP from Con loss takes effect immediately. Rest and healing spells can help.'
  },
  {
    n: 'Knocked Down',
    r: 'Must spend a <strong>move action to stand up</strong> (provokes attacks of opportunity). Can fight while prone (−4 to attacks). Can combine with Prone.'
  },
  {
    n: 'Panicked',
    r: '<strong>Must flee</strong> from danger if possible. −2 to attack rolls, saving throws, and ability checks. Can only run or fight if cornered. Stronger than Frightened.'
  },
  {
    n: 'Paralyzed (Magic/Poison)',
    r: '<strong>Strength and Dexterity effectively 0</strong>, cannot act. Similar to Paralyzed, but typical for spells or poisons. Target is helpless.'
  },
  {
    n: 'Sleeping',
    r: '<strong>Helpless</strong>. Normal noise or damage wakes them. Attackers automatically land critical hits (coup de grace). Loses Dex bonus to AC.'
  },
  {
    n: 'Shaking',
    r: '<strong>−2 to attack rolls, saving throws, and skill checks</strong>. Similar to Shaken, but triggered by fright or intimidation.'
  },
  {
    n: 'Dying',
    r: '<strong>Unconscious</strong>, automatically loses 1 hit point per round. D10 roll at the end of turn: 10 = stabilize. Stabilized = no further HP loss, but still unconscious.'
  },
  {
    n: 'Deafened',
    r: 'Cannot <strong>hear acoustic signals</strong>. <strong>20% spell failure chance</strong> for verbal components. Miscast check (Fortitude DC 20 + spell level).'
  },
  {
    n: 'Dead',
    r: 'At <strong>−10 HP or lower</strong>, or from death effects. Can only be brought back by <em>Raise Dead</em>, <em>Resurrection</em>, or <em>True Resurrection</em>.'
  },
  {
    n: 'Surprised',
    r: 'Loses the <strong>first round</strong> completely (no actions, no attacks of opportunity). Loses Dex bonus to AC in the surprise round.'
  },
  {
    n: 'Disabled',
    r: 'Similar to unconscious, but due to <strong>nonlethal damage</strong>. Recovers 1 HP/hour or through healing. Treated as helpless.'
  },
  {
    n: 'Frightened',
    r: '<strong>−2 to attack rolls and saving throws</strong>. Must avoid the source of fear, flees if possible. Can fight if unable to flee. Weaker than Panicked.'
  },
  {
    n: 'Confused',
    r: 'Roll <strong>d100</strong> at start of turn: 01–10 act normally, 11–20 do nothing, 21–50 helpless, 51–70 attack nearest creature, 71–100 attack self.'
  },
  {
    n: 'Charmed',
    r: 'Treats the <strong>caster as a friend</strong> and trusted ally. Will not attack them. Specific effects depend on the spell (e.g. <em>Charm Person</em>, <em>Dominate Person</em>).'
  }
];
