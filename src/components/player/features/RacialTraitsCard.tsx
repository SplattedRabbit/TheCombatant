import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface RacialTraitsCardProps {
  pc: any;
}

export const RacialTraitsCard: React.FC<RacialTraitsCardProps> = ({ pc }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const race = (pc.race || 'human').toLowerCase();
  const raceNames: Record<string, string> = {
    human: 'Human',
    elf: 'Elf',
    dwarf: 'Dwarf',
    gnome: 'Gnome',
    halfling: 'Halfling',
    deep_halfling: 'Deep Halfling',
    half_elf: 'Half-Elf',
    half_orc: 'Half-Orc',
    tiefling: 'Tiefling',
    anima_construct: 'Anima Construct'
  };
  const raceName = raceNames[race] || 'Human';

  const craftRanks = typeof pc.getSkillRanks === 'function' ? pc.getSkillRanks('craft') : 0;
  const intMod = typeof pc.getAttributeMod === 'function' ? pc.getAttributeMod('int') : 0;
  const totalMod = craftRanks + intMod;

  const repairAbilityIdx = Array.isArray(pc.dailyAbilities) 
    ? pc.dailyAbilities.findIndex((ab: any) => ab.name === 'Manuelle Reparatur' || ab.name === 'Manual Repair') 
    : -1;
  const repairAbility = repairAbilityIdx >= 0 ? pc.dailyAbilities[repairAbilityIdx] : null;
  const usedSlots = repairAbility ? repairAbility.used : 0;
  const maxSlots = repairAbility ? repairAbility.max : 4;

  const handleRepair = (dc: number, healDice: '1d4' | '1d8') => {
    if (repairAbility && usedSlots >= maxSlots) {
      showCustomAlert('Error', 'You have already used all of your repairs for today.', 'OK', '❌');
      return;
    }

    const d20 = Math.floor(Math.random() * 20) + 1;
    const totalRoll = d20 + totalMod;
    const success = totalRoll >= dc;

    let resultMsg = `Craft Check: 1d20 (${d20}) + Mod (${totalMod}) = <strong>${totalRoll}</strong> vs DC ${dc}.<br/><br/>`;

    if (success) {
      const sides = healDice === '1d4' ? 4 : 8;
      const healRoll = Math.floor(Math.random() * sides) + 1;
      resultMsg += `<strong>Success!</strong> You heal <strong>${healRoll}</strong> Hit Points.`;
      
      CombatState.applyDamage(pc.id, healRoll, true, false);
      
      if (repairAbilityIdx >= 0) {
        CombatState.updatePCDailyAbilityUsed(repairAbilityIdx, 1);
      }
      showCustomAlert('Repair Successful 🛠️', resultMsg, 'Done', '✅');
    } else {
      resultMsg += `<strong>Failure!</strong> The repair was unsuccessful.`;
      if (repairAbilityIdx >= 0) {
        CombatState.updatePCDailyAbilityUsed(repairAbilityIdx, 1);
      }
      showCustomAlert('Repair Failed 🛠️', resultMsg, 'OK', '❌');
    }
  };

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
    } else if (race === 'deep_halfling') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Ability Score Adjustments:</strong> +2 Dexterity, -2 Strength (already included).</li>
          <li><strong>Small Size:</strong> +1 size bonus to AC, +1 size bonus on attack rolls, +4 bonus on Hide checks (already included).</li>
          <li><strong>Darkvision:</strong> Can see in the dark up to 60 feet.</li>
          <li><strong>Stonecunning:</strong> +2 racial bonus on Search checks to notice unusual stonework and find stone traps like a rogue.</li>
          <li><strong>Craft &amp; Appraise Mastery:</strong> +2 racial bonus on Appraise and Craft checks related to stone or metal.</li>
          <li><strong>Halfling Luck:</strong> +1 racial bonus on all saving throws (already included).</li>
          <li><strong>Fearless:</strong> +2 morale bonus on saving throws against fear.</li>
          <li><strong>Keen Senses:</strong> +2 racial bonus on Listen checks (already included; no bonuses on Climb, Jump, Move Silently).</li>
          <li><strong>Languages:</strong> Speaks Dwarven fluently.</li>
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
    } else if (race === 'tiefling') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Ability Score Adjustments:</strong> +2 Dexterity, +2 Intelligence, -2 Charisma (already included).</li>
          <li><strong>Type:</strong> Outsider (Native) (immune to person-targeting spells like Charm Person).</li>
          <li><strong>Darkvision:</strong> Can see in the dark up to 60 feet.</li>
          <li><strong>Resistances:</strong> Resistance to cold 5, electricity 5, and fire 5.</li>
          <li><strong>Keen Senses:</strong> +2 racial bonus on Bluff and Hide checks (already included).</li>
          <li><strong>Darkness:</strong> Can use Darkness as a spell-like ability 1/day.</li>
          <li><strong>Level Adjustment:</strong> +1 (increases ECL by 1).</li>
        </ul>
      );
    } else if (race === 'anima_construct') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
            <li><strong>Ability Score Adjustments:</strong> +2 Constitution, -2 Charisma (already included).</li>
            <li><strong>Type:</strong> Construct (Living Construct subtype). Has Con score, susceptible to mind-affecting and critical hits.</li>
            <li><strong>Immunities:</strong> Immune to poisons, diseases, and magic sleep effects.</li>
            <li><strong>No Metabolism:</strong> Does not eat, drink, or breathe (immune to drowning).</li>
            <li><strong>Halved Magical Healing:</strong> Any incoming magical healing is halved (rounded down).</li>
            <li><strong>Natural Armor:</strong> +1 racial natural armor bonus (already included).</li>
          </ul>

          <div style={{ borderTop: '0.5px dashed rgba(200, 169, 110, 0.4)', paddingTop: '8px', marginTop: '4px' }}>
            <strong style={{ fontSize: '10px', display: 'block', marginBottom: '6px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>
              🛠️ Manual Repair (Living Construct)
            </strong>
            <p style={{ margin: '0 0 8px 0', fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', lineHeight: 1.25 }}>
              Requires artisan tools and 1 hour of labor. Perform a Craft check.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '10px' }}>
              <span>Daily Repairs:</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: maxSlots }).map((_, idx) => (
                  <span key={idx} style={{ fontSize: '12px', opacity: idx < usedSlots ? 1 : 0.25 }}>
                    {idx < usedSlots ? '⬛' : '⬜'}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--inkl)' }}>
                ({usedSlots} / {maxSlots} used)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-p"
                disabled={usedSlots >= maxSlots}
                onClick={() => handleRepair(15, '1d4')}
                style={{ fontSize: '9.5px', padding: '4px 10px', cursor: 'pointer' }}
              >
                Minor Repair (DC 15)
              </button>
              <button
                type="button"
                className="btn btn-p"
                disabled={usedSlots >= maxSlots}
                onClick={() => handleRepair(20, '1d8')}
                style={{ fontSize: '9.5px', padding: '4px 10px', cursor: 'pointer' }}
              >
                Major Repair (DC 20)
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🧬 Racial Traits: {raceName}</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', flexDirection: 'column', padding: '6px 8px', gap: '3.5px', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
          {getRacialTraitsContent()}
        </div>
      )}
    </div>
  );
};
