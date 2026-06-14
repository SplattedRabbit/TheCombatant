import React from 'react';

interface RacialTraitsCardProps {
  pc: any;
}

export const RacialTraitsCard: React.FC<RacialTraitsCardProps> = ({ pc }) => {
  const race = (pc.race || 'human').toLowerCase();
  const raceNames: Record<string, string> = {
    human: 'Human',
    elf: 'Elf',
    dwarf: 'Dwarf',
    gnome: 'Gnome',
    halfling: 'Halfling',
    half_elf: 'Half-Elf',
    half_orc: 'Half-Orc'
  };
  const raceName = raceNames[race] || 'Human';

  const getRacialTraitsContent = () => {
    if (race === 'human') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Extra Feat:</strong> 1 extra feat at level 1.</li>
          <li><strong>Extra Skill Points:</strong> +4 skill points at level 1, +1 at each additional level.</li>
        </ul>
      );
    } else if (race === 'dwarf') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Ability Score Adjustments:</strong> +2 Constitution, -2 Charisma (already included).</li>
          <li><strong>Darkvision:</strong> Can see in the dark up to 60 feet.</li>
          <li><strong>Stability:</strong> +4 bonus on ability checks made to resist being bull rushed or tripped.</li>
          <li><strong>Racial Bonuses against Poison/Spells:</strong> +2 saving throw bonus against poison, spells, and spell-like effects.</li>
          <li><strong>Stonecunning:</strong> +2 bonus on Search checks to notice unusual stonework.</li>
          <li><strong>Speed:</strong> Movement speed is not reduced by wearing heavy armor or carrying a heavy load.</li>
        </ul>
      );
    } else if (race === 'elf') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Ability Score Adjustments:</strong> +2 Dexterity, -2 Constitution (already included).</li>
          <li><strong>Immunities:</strong> Immune to magic sleep effects.</li>
          <li><strong>Saving Throw Bonuses against Enchantment:</strong> +2 saving throw bonus against enchantment spells or effects.</li>
          <li><strong>Keen Senses:</strong> +2 racial bonus on Search, Spot, and Listen checks (already included).</li>
          <li><strong>Weapon Familiarity:</strong> Automatically proficient with longsword, rapier, longbow, and shortbow.</li>
        </ul>
      );
    } else if (race === 'gnome') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Ability Score Adjustments:</strong> +2 Constitution, -2 Strength (already included).</li>
          <li><strong>Small Size:</strong> +1 size bonus to AC, +1 size bonus on attack rolls, +4 bonus on Hide checks (already included).</li>
          <li><strong>Saving Throw Bonuses against Illusion:</strong> +2 saving throw bonus against illusion spells or effects.</li>
          <li><strong>Defensive Training against Giants:</strong> +4 dodge bonus to AC against monsters of the giant type.</li>
          <li><strong>Keen Senses:</strong> +2 racial bonus on Listen and Craft (alchemy) checks.</li>
        </ul>
      );
    } else if (race === 'halfling') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Ability Score Adjustments:</strong> +2 Dexterity, -2 Strength (already included).</li>
          <li><strong>Small Size:</strong> +1 size bonus to AC, +1 size bonus on attack rolls, +4 bonus on Hide checks (already included).</li>
          <li><strong>Halfling Luck:</strong> +1 racial bonus on all saving throws (already included).</li>
          <li><strong>Fearless:</strong> +2 morale bonus on saving throws against fear.</li>
          <li><strong>Keen Senses:</strong> +2 racial bonus on Climb, Jump, Listen, and Move Silently checks (already included).</li>
        </ul>
      );
    } else if (race === 'half_elf') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Immunities:</strong> Immune to magic sleep effects, +2 saving throw bonus against enchantment spells or effects.</li>
          <li><strong>Keen Senses:</strong> +1 racial bonus on Listen, Spot, and Search checks (already included).</li>
          <li><strong>Diplomatic Senses:</strong> +2 racial bonus on Diplomacy and Gather Information checks (already included).</li>
          <li><strong>Elven Blood:</strong> For all effects, a half-elf is considered an elf.</li>
        </ul>
      );
    } else if (race === 'half_orc') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Ability Score Adjustments:</strong> +2 Strength, -2 Intelligence, -2 Charisma (already included).</li>
          <li><strong>Darkvision:</strong> Can see in the dark up to 60 feet.</li>
          <li><strong>Orc Blood:</strong> For all effects, a half-orc is considered an orc.</li>
        </ul>
      );
    }
    return null;
  };

  return (
    <div style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '6px 8px', background: 'rgba(200, 169, 110, 0.03)', marginBottom: '6px', display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)', paddingBottom: '2px' }}>
        <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>
          🧬 Racial Traits: {raceName}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {getRacialTraitsContent()}
      </div>
    </div>
  );
};
