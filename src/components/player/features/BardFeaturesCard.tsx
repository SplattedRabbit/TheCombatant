import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { showCustomConfirm, showRollBreakdown, showCustomAlert } from '@core/ui/components/dialogs.js';
// @ts-ignore
import { applyFeatSkillBonuses } from '@core/models/helpers/skills/SkillFeatApplier.js';
// @ts-ignore
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
import { ClassACFSelector } from './ClassACFSelector';
import { getAblMod } from '../attributeHelper';

interface BardFeaturesCardProps {
  pc: any;
  level: number;
}

const BARD_SONGS = [
  {
    key: 'countersong',
    nameDe: 'Gegengesang',
    nameEn: 'Countersong',
    minLvl: 1,
    desc: '• Range: 30 ft. radius\n• Effect: Counters sound-based magical effects. Allies can use your Perform check result for saving throws.',
    effect: '🎵 Countersong active!\nAllies within 30 ft. can use your Perform check result for sound-based saving throws for the next 10 rounds.'
  },
  {
    key: 'fascinate',
    nameDe: 'Faszinieren',
    nameEn: 'Fascinate',
    minLvl: 1,
    desc: '• Range: 90 ft. radius | Duration: 1 rd./level\n• Effect: Captivates targets. Will DC = your Perform check. Targets sit quietly.',
    effect: '🎵 Fascinate started!\nTarget(s) must succeed on a Will save against your Perform check result. Any obvious threat breaks the effect immediately.'
  },
  {
    key: 'inspire_courage',
    nameDe: 'Mut einflößen',
    nameEn: 'Inspire Courage',
    minLvl: 1,
    desc: '• Bonuses: +1 morale bonus on saving throws against fear/charm and attack/damage rolls.\n• Scaling: +2 at level 8, +3 at 14, +4 at 20.',
    effect: '🎵 Inspire Courage started!\nAll allies receive a +[BONUS] morale bonus on attack and weapon damage rolls, and saving throws against fear/charm. Lasts for the duration of the song plus 5 rounds after.'
  },
  {
    key: 'inspire_competence',
    nameDe: 'Kompetenz einflößen',
    nameEn: 'Inspire Competence',
    minLvl: 3,
    desc: '• Range: 30 ft. (1 ally) | Duration: up to 2 min. (concentration)\n• Effect: Grants +2 competence bonus on all skill checks.',
    effect: '🎵 Inspire Competence started!\nAn ally within 30 ft. receives a +2 competence bonus on checks with a designated skill (Duration: up to 2 min. concentration).'
  },
  {
    key: 'suggestion',
    nameDe: 'Einflüsterung',
    nameEn: 'Suggestion',
    minLvl: 6,
    desc: '• Target: 1 fascinated creature | Will DC: 10 + 1/2 bard level + CHA mod\n• Effect: Casts suggestion. Costs 0 additional music uses (RAW!).',
    effect: '🎵 Suggestion cast!\nCasts suggestion on an already fascinated target. \n• Save DC: Will DC = [SG] (Will negates).'
  },
  {
    key: 'inspire_greatness',
    nameDe: 'Größe einflößen',
    nameEn: 'Inspire Greatness',
    minLvl: 9,
    desc: '• Targets: 1 ally (+1 per 3 levels above 9)\n• Effect: +2d10 Hit Dice, temporary HP, +2 competence on attacks, +1 competence on Fortitude.',
    effect: '🎵 Inspire Greatness started!\nTarget(s) receive +2 temporary Hit Dice (2d10), temporary HP, a +2 competence bonus on attacks, and a +1 competence bonus on Fortitude saves.'
  },
  {
    key: 'song_of_freedom',
    nameDe: 'Lied der Freiheit',
    nameEn: 'Song of Freedom',
    minLvl: 12,
    desc: '• Range: 30 ft. | Activation: Perform for 1 minute\n• Effect: Acts like break enchantment (caster level = bard level).',
    effect: '🎵 Song of Freedom started!\nAfter 1 minute of singing, acts like break enchantment (caster level = bard level) on a target within 30 ft.'
  },
  {
    key: 'inspire_heroics',
    nameDe: 'Heldenmut einflößen',
    nameEn: 'Inspire Heroics',
    minLvl: 15,
    desc: '• Targets: 1 ally (+1 per 3 levels above 15) | Activation: Perform for 1 round\n• Effect: +4 morale bonus on saving throws, +4 dodge bonus to AC.',
    effect: '🎵 Inspire Heroics started!\nGrants target(s) a +4 morale bonus on all saving throws and a +4 dodge bonus to Armor Class (AC). Lasts as long as they hear it plus 5 rounds after.'
  },
  {
    key: 'mass_suggestion',
    nameDe: 'Massen-Einflüsterung',
    nameEn: 'Mass Suggestion',
    minLvl: 18,
    desc: '• Will DC: 10 + 1/2 bard level + CHA mod\n• Effect: Like suggestion, but affects all fascinated creatures within range simultaneously.',
    effect: '🎵 Mass Suggestion cast!\nCasts suggestion on all fascinated creatures within range simultaneously.\n• Save DC: Will DC = [SG] (Will negates).'
  }
];

export const BardFeaturesCard: React.FC<BardFeaturesCardProps> = ({ pc, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [musicRulesOpen, setMusicRulesOpen] = useState(false);
  const [bkRulesOpen, setBkRulesOpen] = useState(false);

  const extraMusic = pc.bardicMusicExtra || 0;
  const musicAbility = pc.dailyAbilities?.find((a: any) => a.name === "Bardisches Lied" || a.name === "Bardic Music");
  const musicMax = musicAbility ? musicAbility.max : 0;
  const musicUsed = musicAbility ? musicAbility.used : 0;
  const musicRemaining = Math.max(0, musicMax - musicUsed);

  let inspireBonus = 1;
  if (level >= 20) inspireBonus = 4;
  else if (level >= 14) inspireBonus = 3;
  else if (level >= 8) inspireBonus = 2;

  const handleBubbleClick = (idx: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      if (!Array.isArray(activePC.dailyAbilities)) {
        activePC.dailyAbilities = [];
      }
      let ability = activePC.dailyAbilities.find((a: any) => a.name === "Bardisches Lied" || a.name === "Bardic Music" || a.name?.includes("Bardic Music") || a.name?.includes("Bardisches Lied"));
      if (!ability) {
        ability = { name: "Bardic Music", max: level + extraMusic, used: 0 };
        activePC.dailyAbilities.push(ability);
      }
      if (idx <= ability.used) {
        ability.used = Math.max(0, idx - 1);
      } else {
        ability.used = Math.min(ability.max, idx);
      }
    });
  };

  const handleExtraMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    CombatState.updatePCBatch((activePC: any) => {
      activePC.bardicMusicExtra = val;
    });
  };

  const handleRollPerform = (e: React.MouseEvent) => {
    const ranks = pc.getSkillRanks('perform');
    const attrMod = pc.getAttributeMod('cha');
    const misc = pc.getSkillMisc('perform');
    
    const breakdown = [
      { label: "Perform Ranks", value: ranks },
      { label: "CHA-Mod", value: attrMod }
    ];
    
    if (misc !== 0) {
      breakdown.push({ label: "Misc Bonuses", value: misc });
    }
    
    const featBonus = applyFeatSkillBonuses(pc, 'perform', SKILLS_REGISTRY['perform']);
    if (featBonus > 0) {
      breakdown.push({ label: "Feat Bonuses", value: featBonus });
    }
    
    const hasShaken = pc.conditions.some((c: any) => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
    if (hasShaken) {
      breakdown.push({ label: 'Condition (Shaken)', value: -2 });
    }
    
    showRollBreakdown("Perform Check", "1W20", breakdown, e.nativeEvent);
  };

  const handleRollBardicKnowledge = () => {
    const intValue = pc.int ? pc.int.getValue() : 10;
    const intMod = getAblMod(intValue);
    const totalBonus = level + intMod;

    const html = `
      <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.4;">
        <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
          ${pc.name} uses Bardic Knowledge!
        </div>
        • <strong>Class:</strong> Bard<br>
        • <strong>Ability:</strong> Bardic Knowledge<br>
        • <strong>Modifier:</strong> <span style="color: var(--red); font-weight: bold;">+${totalBonus}</span> (Bard Level ${level} + INT Mod ${intMod >= 0 ? '+' : ''}${intMod})<br>
        • <strong>Check Type:</strong> Specialized Knowledge check (D&D 3.5 RAW)<br>
        • <strong>DC Range:</strong> DC 10 to DC 30+ (depending on rarity)<br><br>
        
        <div style="
          background: rgba(139, 26, 26, 0.04);
          border: 0.5px solid var(--pb);
          border-radius: 2px;
          padding: 6px;
          text-align: center;
          margin-bottom: 8px;
          font-family: 'Crimson Text', serif;
        ">
          <div style="font-family: 'IM Fell English SC', serif; font-size: 7.5px; color: var(--inkl); text-transform: uppercase; letter-spacing: 0.5px;">Roll Formula</div>
          <div style="font-family: 'IM Fell English SC', serif; font-size: 15px; font-weight: bold; color: var(--red); margin: 2px 0; line-height: 1;">
            d20 ${totalBonus >= 0 ? '+' : ''}${totalBonus}
          </div>
          <div style="font-size: 7.5px; color: var(--inkm); line-height: 1.2;">
            d20 + ${level} (Bard Level) ${intMod >= 0 ? '+' : '-'} ${Math.abs(intMod)} (Intelligence Modifier)
          </div>
        </div>

        <div style="font-size: 8px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 5px; border-radius: 2px; line-height: 1.25; margin-bottom: 6px;">
          A bard has a wide, scattered knowledge of lore, legends, famous people, and historical secrets.
        </div>

        <div style="font-size: 8px; font-weight: bold; color: var(--red); font-family: 'IM Fell English SC', serif; margin-bottom: 2px;">Difficulty Classes (DCs):</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 7.5px; line-height: 1.25; margin-bottom: 4px;">
          <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
            <td style="padding: 2.5px 0;"><strong>DC 10:</strong></td>
            <td style="padding: 2.5px 0; text-align: right; color: var(--inkm);">Common myths, local legends, ruling families.</td>
          </tr>
          <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
            <td style="padding: 2.5px 0;"><strong>DC 20:</strong></td>
            <td style="padding: 2.5px 0; text-align: right; color: var(--inkm);">Uncommon legends, historical details.</td>
          </tr>
          <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
            <td style="padding: 2.5px 0;"><strong>DC 25:</strong></td>
            <td style="padding: 2.5px 0; text-align: right; color: var(--inkm);">Specific knowledge about rare relics, obscure facts.</td>
          </tr>
          <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
            <td style="padding: 2.5px 0;"><strong>DC 30:</strong></td>
            <td style="padding: 2.5px 0; text-align: right; color: var(--inkm);">Lost kingdoms, legendary heroes, cryptic myths.</td>
          </tr>
        </table>
      </div>
    `;

    showCustomAlert("Bardic Knowledge 📜", html, "Close", "", null);
  };

  const handleCastSong = (song: typeof BARD_SONGS[number]) => {
    const performCast = () => {
      const isZeroCost = song.key === 'suggestion' || song.key === 'mass_suggestion';
      if (!isZeroCost) {
        CombatState.updatePCBatch((pcToUpdate: any) => {
          const innerAbility = pcToUpdate.dailyAbilities.find((a: any) => a.name === "Bardisches Lied" || a.name === "Bardic Music");
          if (innerAbility) {
            innerAbility.used = Math.min(innerAbility.max, innerAbility.used + 1);
          }
        });
      }

      let effectHtml = song.effect;
      const chaValue = pc.cha ? pc.cha.getValue() : 10;
      const chaMod = getAblMod(chaValue);

      if (song.key === 'inspire_courage') {
        effectHtml = effectHtml.replace('[BONUS]', String(inspireBonus));
      } else if (song.key === 'suggestion' || song.key === 'mass_suggestion') {
        const sg = 10 + Math.floor(level / 2) + chaMod;
        effectHtml = effectHtml.replace('[SG]', String(sg));
      }

      showCustomAlert(
        "Bardic Music Started! 🎵",
        `
        <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.4;">
          <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
            ${pc.name} plays ${song.nameEn || song.nameDe}!
          </div>
          <div style="font-size: 8.5px; background: rgba(200, 169, 110, 0.05); border: 0.5px solid rgba(200, 169, 110, 0.3); padding: 5px; border-radius: 2px; line-height: 1.3;">
            ${effectHtml.replace(/\n/g, '<br>')}
          </div>
          ${isZeroCost ? `
            <div style="font-size: 6.8px; color: var(--red); font-style: italic; margin-top: 4px; text-align: center;">
              ✦ RAW Bonus: Costs 0 additional music uses (builds on Fascinate).
            </div>
          ` : ''}
        </div>
        `,
        "Done!",
        "",
        null
      );
    };

    const isZeroCost = song.key === 'suggestion' || song.key === 'mass_suggestion';
    if (!isZeroCost && musicRemaining <= 0) {
      showCustomConfirm("No Music Slots!", "You have no uses of bardic music left. Do you want to perform this song anyway?", () => performCast());
    } else performCast();
  };

  const bardicKnowledgeBonus = level + (pc.int ? Math.floor((pc.int.getValue() - 10) / 2) : 0);

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🎭 Bard (Level {level})</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
              Class Features
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', paddingTop: '1px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Bardic Music:</strong></span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setMusicRulesOpen(!musicRulesOpen); }}
                  className="btn btn-toggle-rules-music" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center' } as any} 
                  title="Show rules"
                >
                  📖 {musicRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', maxWidth: '80px' }}>
                  {musicMax > 0 && Array.from({ length: musicMax }).map((_, i) => {
                    const bubbleIdx = i + 1;
                    const spent = bubbleIdx <= musicUsed;
                    return (
                      <span 
                        key={bubbleIdx}
                        onClick={(e) => { e.stopPropagation(); handleBubbleClick(bubbleIdx); }}
                        className={`music-bubble use-icon ${spent ? 'used' : ''}`} 
                        style={{ cursor: 'pointer' }}
                        title={spent ? 'Used (Click to restore)' : 'Available (Click to use)'}
                      >
                        🎵
                      </span>
                    );
                  })}
                </div>
                <span>({musicRemaining})</span>
              </div>
            </div>
            
            {musicRulesOpen && (
              <div className="music-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3.5px', fontFamily: "'Crimson Text', serif", marginBottom: '2px' }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Bardic Music:</strong><br />
                A bard can use music/poetics to produce magical effects on those around him.<br />
                • <strong>Uses:</strong> <strong>{level + extraMusic} times per day</strong>.<br />
                • <strong>Requirement:</strong> Requires minimum ranks in the Perform skill to activate specific songs.<br />
                • <strong>Range:</strong> Most songs affect allies within 30 ft. who can hear the bard.
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px' }}>
              <span>Extra Music (Feat/Item):</span>
              <input 
                type="number" 
                value={extraMusic}
                onChange={handleExtraMusicChange}
                className="cinput bard-extra-music" 
                style={{ width: '35px', fontSize: '7.5px', height: '14px', padding: '0 2px', borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', textAlign: 'center' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Bardic Knowledge:</strong></span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setBkRulesOpen(!bkRulesOpen); }}
                  className="btn btn-toggle-rules-bk" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center' } as any} 
                  title="Show rules"
                >
                  📖 {bkRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>+{bardicKnowledgeBonus}</span>
            </div>
            
            {bkRulesOpen && (
              <div className="bk-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3.5px', fontFamily: "'Crimson Text', serif", marginBottom: '2px' }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Bardic Knowledge:</strong><br />
                A bard may make a special bardic knowledge check to see whether he knows some relevant information about local notable people, legendary items, or noteworthy places.<br />
                • <strong>Bonus:</strong> 1d20 + <strong>{level}</strong> (Bard Level) + <strong>{Math.floor(((pc.int ? pc.int.getValue() : 10) - 10) / 2)}</strong> (INT) = <strong>+{bardicKnowledgeBonus}</strong>.<br />
                • <strong>DCs:</strong> 10 (Common), 20 (Uncommon), 25 (Obscure), 30 (Extremely heroic/ancient).
              </div>
            )}

            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingTop: '2px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
              Bardic Song Compendium
            </div>
            <div className="bard-songs-list" style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: '2px', marginTop: '2px', border: '0.5px solid rgba(200,169,110,0.15)', borderRadius: '2px', padding: '2px' }}>
              {BARD_SONGS.map((song) => {
                const isLocked = level < song.minLvl;
                const lockIcon = isLocked ? '🔒' : '🎵';
                const songClass = isLocked ? 'locked-song' : 'unlocked-song';
                const courageBonusText = song.key === 'inspire_courage' ? ` (Morale bonus: +${inspireBonus})` : '';

                return (
                  <div key={song.key} className={`bard-song-item ${songClass}`} style={{ background: isLocked ? 'rgba(0,0,0,0.03)' : 'rgba(200,169,110,0.05)', border: `0.5px solid ${isLocked ? 'rgba(0,0,0,0.08)' : 'rgba(200,169,110,0.2)'}`, borderRadius: '2px', padding: '3px', display: 'flex', flexDirection: 'column', gap: '1.5px', fontSize: '7.5px', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: isLocked ? 'var(--inkl)' : 'var(--red)' }}>
                      <span>{lockIcon} {song.nameEn || song.nameDe}{courageBonusText}</span>
                      {isLocked ? (
                        <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Level {song.minLvl}</span>
                      ) : (
                        <button 
                          onClick={() => handleCastSong(song)}
                          className="btn cast-bard-song-btn" 
                          style={{ fontSize: '6px', padding: '1px 3px', borderRadius: '1px', cursor: 'pointer', background: 'rgba(139,26,26,0.08)', borderColor: 'var(--red)', color: 'var(--red)', fontWeight: 'bold', height: '12px', lineHeight: '8px' }}
                        >
                          Perform 🎵
                        </button>
                      )}
                    </div>
                    <div style={{ color: 'var(--ink)', lineHeight: 1.25, fontStyle: isLocked ? 'italic' : 'normal', whiteSpace: 'pre-line' }}>
                      {song.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
              <button onClick={handleRollBardicKnowledge} className="btn roll-bard-know-btn" style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '4px', cursor: 'pointer', width: '100%' }}>Bardic Knowledge 📜</button>
              <button onClick={handleRollPerform} className="btn roll-bard-perform-btn" style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '4px', cursor: 'pointer', width: '100%' }}>Perform 🎲</button>
            </div>

            <ClassACFSelector pc={pc} classKey="bard" level={level} />
          </div>
        </div>
      )}
    </div>
  );
};
