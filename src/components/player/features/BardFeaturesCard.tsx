import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { showCustomConfirm, showRollBreakdown, showCustomAlert } from '@core/ui/components/dialogs.js';
// @ts-ignore
import { applyFeatSkillBonuses } from '@core/models/helpers/skills/SkillFeatApplier.js';
// @ts-ignore
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';

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
    desc: '• Reichweite: 9m Radius\n• Effekt: Kontert magische Schalleffekte. Verbündete dürfen bei Rettungswürfen deinen Auftreten-Wurf nutzen.',
    effect: '🎵 Gegengesang aktiviert!\nVerbündete im Umkreis von 9m dürfen für die nächsten 10 Runden bei schallbasierten Rettungswürfen deinen Auftreten-Wurf nutzen.'
  },
  {
    key: 'fascinate',
    nameDe: 'Faszinieren',
    nameEn: 'Fascinate',
    minLvl: 1,
    desc: '• Reichweite: 27m Radius | Dauer: 1 Rd./Stufe\n• Effekt: Zieht Ziele in den Bann. Willens-SG = dein Auftreten-Wurf. Ziele verharren still.',
    effect: '🎵 Faszinieren gestartet!\nZiel(e) müssen einen Willensrettungswurf gegen dein Auftreten-Wurf-Ergebnis bestehen. Jede offensichtliche Bedrohung bricht den Effekt sofort.'
  },
  {
    key: 'inspire_courage',
    nameDe: 'Mut einflößen',
    nameEn: 'Inspire Courage',
    minLvl: 1,
    desc: '• Boni: +1 Moralbonus auf Rettungswürfe gegen Furcht/Bezauberung sowie Angriffs-/Schadenswürfe.\n• Skalierung: +2 ab Stufe 8, +3 ab 14, +4 ab 20.',
    effect: '🎵 Mut einflößen gestartet!\nAlle Gefährten erhalten einen +[BONUS] Moralbonus auf Angriffs- und Waffenschadenswürfe sowie Rettungswürfe gegen Furcht/Bezauberung. Hält für die Dauer des Lieds und 5 Runden danach an.'
  },
  {
    key: 'inspire_competence',
    nameDe: 'Kompetenz einflößen',
    nameEn: 'Inspire Competence',
    minLvl: 3,
    desc: '• Reichweite: 9m (1 Gefährte) | Dauer: bis zu 2 Min. (Konzentration)\n• Effekt: Gewährt +2 Kompetenzbonus auf alle Fertigkeitswürfe.',
    effect: '🎵 Kompetenz einflößen gestartet!\nEin Gefährte in 9m Reichweite erhält einen +2 Kompetenzbonus auf alle Fertigkeitswürfe einer bestimmten Fertigkeit (Dauer: bis zu 2 Min. Konzentration).'
  },
  {
    key: 'suggestion',
    nameDe: 'Einflüsterung',
    nameEn: 'Suggestion',
    minLvl: 6,
    desc: '• Ziel: 1 fasziniertes Wesen | Willens-SG: 10 + 1/2 Bardenstufe + CHA-Mod\n• Effekt: Wirkt Einflüsterung. Kostet 0 zusätzliche Musik-Nutzungen (RAW!).',
    effect: '🎵 Einflüsterung gewirkt!\nWirkt Einflüsterung auf ein bereits fasziniertes Ziel. \n• Rettungswurf-SG: Willen-SG = [SG] (Willen negiert).'
  },
  {
    key: 'inspire_greatness',
    nameDe: 'Größe einflößen',
    nameEn: 'Inspire Greatness',
    minLvl: 9,
    desc: '• Ziele: 1 Gefährte (+1 pro 3 Stufen ab 9)\n• Effekt: +2d10 Trefferwürfel, temporäre TP, +2 Kompetenz auf Angriffe, +1 Kompetenz auf Zähigkeit.',
    effect: '🎵 Größe einflößen gestartet!\nZiel(e) erhalten +2 temporäre Trefferwürfel (2W10), temporäre TP, einen +2 Kompetenzbonus auf Angriffe und einen +1 Kompetenzbonus auf Zähigkeitswürfe.'
  },
  {
    key: 'song_of_freedom',
    nameDe: 'Lied der Freiheit',
    nameEn: 'Song of Freedom',
    minLvl: 12,
    desc: '• Reichweite: 9m | Aktivierung: 1 Minute spielen\n• Effekt: Wirkt wie Verzauberung brechen (Zauberstufe = Bardenstufe).',
    effect: '🎵 Lied der Freiheit angestimmt!\nNach 1 Minute Singen wirkt ein Effekt wie Verzauberung brechen (Zauberstufe = Bardenstufe) auf ein Ziel in 9m.'
  },
  {
    key: 'inspire_heroics',
    nameDe: 'Heldenmut einflößen',
    nameEn: 'Inspire Heroics',
    minLvl: 15,
    desc: '• Ziele: 1 Gefährte (+1 pro 3 Stufen ab 15) | Aktivierung: 1 Runde singen\n• Effekt: +4 Moralbonus auf Rettungswürfe, +4 Ausweichbonus auf RK.',
    effect: '🎵 Heldenmut einflößen gestartet!\nGewährt Ziel(en) einen +4 Moralbonus auf alle Rettungswürfe und einen +4 Ausweichbonus auf die Rüstungsklasse (AC). Hält so lange sie hören + 5 Runden danach.'
  },
  {
    key: 'mass_suggestion',
    nameDe: 'Massen-Einflüsterung',
    nameEn: 'Mass Suggestion',
    minLvl: 18,
    desc: '• Willens-SG: 10 + 1/2 Bardenstufe + CHA-Mod\n• Effekt: Wie Einflüsterung, betrifft aber zeitgleich alle faszinierten Wesen in Reichweite.',
    effect: '🎵 Massen-Einflüsterung gewirkt!\nWirkt Einflüsterung gleichzeitig auf alle faszinierten Kreaturen in Reichweite.\n• Rettungswurf-SG: Willen-SG = [SG] (Willen negiert).'
  }
];

export const BardFeaturesCard: React.FC<BardFeaturesCardProps> = ({ pc, level }) => {
  const [musicRulesOpen, setMusicRulesOpen] = useState(false);

  const extraMusic = pc.bardicMusicExtra || 0;
  const musicAbility = pc.dailyAbilities?.find((a: any) => a.name === "Bardisches Lied");
  const musicMax = musicAbility ? musicAbility.max : 0;
  const musicUsed = musicAbility ? musicAbility.used : 0;
  const remaining = Math.max(0, musicMax - musicUsed);

  const cols = musicMax > 0 ? Math.ceil(musicMax / 2) : 0;

  let inspireBonus = 1;
  if (level >= 20) inspireBonus = 4;
  else if (level >= 8) inspireBonus = 2; // In 3.5e, level 8+ is +2, level 14+ is +3, level 20+ is +4
  if (level >= 14) inspireBonus = 3;

  const handleBubbleClick = (idx: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      const ability = activePC.dailyAbilities.find((a: any) => a.name === "Bardisches Lied");
      if (ability) {
        if (idx <= ability.used) {
          ability.used = Math.max(0, idx - 1);
        } else {
          ability.used = Math.min(ability.max, idx);
        }
      }
    });
  };

  const handleAdjustExtraMusic = (dir: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      activePC.bardicMusicExtra = Math.max(-level, (activePC.bardicMusicExtra || 0) + dir);
    });
  };

  const handleRollPerform = (e: React.MouseEvent) => {
    const ranks = pc.getSkillRanks('perform');
    const attrMod = pc.getAttributeMod('cha');
    const misc = pc.getSkillMisc('perform');
    
    const breakdown = [
      { label: "Ränge in Auftreten", value: ranks },
      { label: "CHA-Mod", value: attrMod }
    ];
    
    if (misc !== 0) {
      breakdown.push({ label: "Sonstige Boni", value: misc });
    }
    
    const featBonus = applyFeatSkillBonuses(pc, 'perform', SKILLS_REGISTRY['perform']);
    if (featBonus > 0) {
      breakdown.push({ label: "Talentboni", value: featBonus });
    }
    
    const hasShaken = pc.conditions.some((c: any) => c === 'Erschüttet' || (c && c.n === 'Erschüttet') || c === 'Schüttelnd' || (c && c.n === 'Schüttelnd'));
    if (hasShaken) {
      breakdown.push({ label: 'Zustand (Erschüttet/Schüttelnd)', value: -2 });
    }
    
    showRollBreakdown("Auftreten-Wurf (Perform)", "1W20", breakdown, e.nativeEvent);
  };

  const handleRollBardicKnowledge = () => {
    const getAblMod = (score: number) => {
      return score >= 10 ? Math.floor((score - 10) / 2) : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
    };
    const intValue = pc.int ? pc.int.getValue() : 10;
    const intMod = getAblMod(intValue);
    const totalBonus = level + intMod;

    const html = `
      <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.4;">
        <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
          ${pc.name} nutzt Bardenwissen!
        </div>
        • <strong>Klasse:</strong> Barde<br>
        • <strong>Fähigkeit:</strong> Bardenwissen (Bardic Knowledge)<br>
        • <strong>Modifikator:</strong> <span style="color: var(--red); font-weight: bold;">+${totalBonus}</span> (Bardenstufe ${level} + INT-Mod ${intMod >= 0 ? '+' : ''}${intMod})<br>
        • <strong>Wurf-Art:</strong> Spezialisierter Wissenswurf (D&D 3.5 RAW)<br>
        • <strong>SG-Bereich:</strong> SG 10 bis SG 30+ (je nach Seltenheit)<br><br>
        
        <div style="
          background: rgba(139, 26, 26, 0.04);
          border: 0.5px solid var(--pb);
          border-radius: 2px;
          padding: 6px;
          text-align: center;
          margin-bottom: 8px;
          font-family: 'Crimson Text', serif;
        ">
          <div style="font-family: 'IM Fell English SC', serif; font-size: 7.5px; color: var(--inkl); text-transform: uppercase; letter-spacing: 0.5px;">Würfelformel</div>
          <div style="font-family: 'IM Fell English SC', serif; font-size: 15px; font-weight: bold; color: var(--red); margin: 2px 0; line-height: 1;">
            d20 ${totalBonus >= 0 ? '+' : ''}${totalBonus}
          </div>
          <div style="font-size: 7.5px; color: var(--inkm); line-height: 1.2;">
            d20 + ${level} (Bardenstufe) ${intMod >= 0 ? '+' : '-'} ${Math.abs(intMod)} (Intelligenz-Modifikator)
          </div>
        </div>

        <div style="font-size: 8px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 5px; border-radius: 2px; line-height: 1.25; margin-bottom: 6px;">
          Ein Barde besitzt ein breites, verstreutes Wissen über Sagen, Legenden, berühmte Personen und historische Geheimnisse. Dies entspricht einem Wissenswurf mit seiner Bardenstufe + Intelligenzmodifikator.
        </div>

        <div style="font-size: 8px; font-weight: bold; color: var(--red); font-family: 'IM Fell English SC', serif; margin-bottom: 2px;">Schwierigkeitsgrade (SG / DCs):</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 7.5px; line-height: 1.25; margin-bottom: 4px;">
          <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
            <td style="padding: 2.5px 0;"><strong>SG 10:</strong></td>
            <td style="padding: 2.5px 0; text-align: right; color: var(--inkm);">Bekannte Mythen, lokale Sagen, herrschende Familien.</td>
          </tr>
          <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
            <td style="padding: 2.5px 0;"><strong>SG 20:</strong></td>
            <td style="padding: 2.5px 0; text-align: right; color: var(--inkm);">Ungewöhnliche Legenden, historische Details.</td>
          </tr>
          <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
            <td style="padding: 2.5px 0;"><strong>SG 25:</strong></td>
            <td style="padding: 2.5px 0; text-align: right; color: var(--inkm);">Spezifisches Wissen über seltene Relikte, obskure Fakten.</td>
          </tr>
          <tr style="border-bottom: 0.25px solid rgba(0,0,0,0.05);">
            <td style="padding: 2.5px 0;"><strong>SG 30:</strong></td>
            <td style="padding: 2.5px 0; text-align: right; color: var(--inkm);">Verlorene Reiche, legendäre Helden, kryptische Mythen.</td>
          </tr>
        </table>
      </div>
    `;

    showCustomAlert("Bardenwissen 📜", html, "Schließen", "", null);
  };

  const handleCastSong = (song: typeof BARD_SONGS[number]) => {
    const performCast = () => {
      const isZeroCost = song.key === 'suggestion' || song.key === 'mass_suggestion';
      if (!isZeroCost) {
        CombatState.updatePCBatch((pcToUpdate: any) => {
          const innerAbility = pcToUpdate.dailyAbilities.find((a: any) => a.name === "Bardisches Lied");
          if (innerAbility) {
            innerAbility.used = Math.min(innerAbility.max, innerAbility.used + 1);
          }
        });
      }

      let effectHtml = song.effect;
      const getAblMod = (score: number) => {
        return score >= 10 ? Math.floor((score - 10) / 2) : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
      };
      const chaValue = pc.cha ? pc.cha.getValue() : 10;
      const chaMod = getAblMod(chaValue);

      if (song.key === 'inspire_courage') {
        effectHtml = effectHtml.replace('[BONUS]', String(inspireBonus));
      } else if (song.key === 'suggestion' || song.key === 'mass_suggestion') {
        const sg = 10 + Math.floor(level / 2) + chaMod;
        effectHtml = effectHtml.replace('[SG]', String(sg));
      }

      showCustomAlert(
        "Bardenmusik angestimmt! 🎵",
        `
        <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.4;">
          <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
            ${pc.name} spielt ${song.nameDe}!
          </div>
          <div style="font-size: 8.5px; background: rgba(200, 169, 110, 0.05); border: 0.5px solid rgba(200, 169, 110, 0.3); padding: 5px; border-radius: 2px; line-height: 1.3;">
            ${effectHtml.replace(/\n/g, '<br>')}
          </div>
          ${isZeroCost ? `
            <div style="font-size: 6.8px; color: var(--red); font-style: italic; margin-top: 4px; text-align: center;">
              ✦ RAW Bonus: Kostet 0 zusätzliche Musik-Nutzungen (baut auf Faszinieren auf).
            </div>
          ` : ''}
        </div>
        `,
        "Fertig!",
        "",
        null
      );
    };

    const isZeroCost = song.key === 'suggestion' || song.key === 'mass_suggestion';
    if (!isZeroCost && remaining <= 0) {
      showCustomConfirm("Keine Musik-Slots!", "Du hast keine freien Nutzungen für Bardenmusik mehr. Möchtest du dieses Lied trotzdem anstimmen?", () => {
        performCast();
      });
    } else {
      performCast();
    }
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Barde (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
            Klassenfähigkeiten
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', paddingTop: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span><strong>Bardenmusik:</strong></span>
              <button 
                onClick={() => setMusicRulesOpen(!musicRulesOpen)}
                className="btn btn-toggle-rules-music" 
                style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                title="Regeln einblenden"
              >
                📖 {musicRulesOpen ? '▲' : '▼'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, auto)`, gap: '1px', justifyContent: 'end', alignItems: 'center' }}>
                {musicMax > 0 && Array.from({ length: musicMax }).map((_, i) => {
                  const bubbleIdx = i + 1;
                  const spent = bubbleIdx <= musicUsed;
                  return (
                    <span 
                      key={bubbleIdx}
                      onClick={() => handleBubbleClick(bubbleIdx)}
                      className={`bardic-music-bubble use-icon use-icon-music ${spent ? 'used' : ''}`} 
                      style={{ marginRight: '0 !important', cursor: 'pointer' } as any}
                      title={spent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}
                    >
                      🎵
                    </span>
                  );
                })}
              </div>
              <span style={{ fontSize: '7.5px', fontWeight: 'bold' }}>({remaining}/{musicMax})</span>
            </div>
          </div>
          
          {musicRulesOpen && (
            <div className="music-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif", marginBottom: '2px' }}>
              <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Bardenmusik & Bardenwissen:</strong><br />
              • <strong>Tägliche Nutzungen:</strong> Gleich der Bardenstufe + Boni (z.B. Extra-Musik).<br />
              • <strong>Bardenwissen (Bardic Knowledge):</strong> Spezielle Wissensprobe (d20 + Bardenstufe + INT-Mod) für legendäre Fakten über Personen, Orte oder Gegenstände.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.5px', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '3px', marginBottom: '1px' }}>
            <span style={{ color: 'var(--inkl)', fontStyle: 'italic' }}>Extra Musik (Feats/Items):</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                onClick={() => handleAdjustExtraMusic(-1)}
                className="btn adjust-extra-music-btn" 
                style={{ fontSize: '7px', padding: '0 3px', cursor: 'pointer', lineIndex: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', fontWeight: 'bold' } as any}
              >
                -
              </button>
              <span style={{ fontWeight: 'bold', width: '14px', textAlign: 'center' }}>{extraMusic >= 0 ? '+' : ''}{extraMusic}</span>
              <button 
                onClick={() => handleAdjustExtraMusic(1)}
                className="btn adjust-extra-music-btn" 
                style={{ fontSize: '7px', padding: '0 3px', cursor: 'pointer', lineIndex: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', fontWeight: 'bold' } as any}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingTop: '2px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
            Bardenlieder-Kompendium
          </div>
          <div className="bard-songs-list" style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: '2px', marginTop: '2px', border: '0.5px solid rgba(200,169,110,0.15)', borderRadius: '2px', padding: '2px' }}>
            {BARD_SONGS.map((song) => {
              const isLocked = level < song.minLvl;
              const lockIcon = isLocked ? '🔒' : '🎵';
              const songClass = isLocked ? 'locked-song' : 'unlocked-song';
              const courageBonusText = song.key === 'inspire_courage' ? ` (Moralbonus: +${inspireBonus})` : '';

              return (
                <div key={song.key} className={`bard-song-item ${songClass}`} style={{ background: isLocked ? 'rgba(0,0,0,0.03)' : 'rgba(200,169,110,0.05)', border: `0.5px solid ${isLocked ? 'rgba(0,0,0,0.08)' : 'rgba(200,169,110,0.2)'}`, borderRadius: '2px', padding: '3px', display: 'flex', flexDirection: 'column', gap: '1.5px', fontSize: '7.5px', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: isLocked ? 'var(--inkl)' : 'var(--red)' }}>
                    <span>{lockIcon} {song.nameDe} <span style={{ fontSize: '6.5px', fontWeight: 'normal', color: 'var(--ink)' }}>({song.nameEn})</span>{courageBonusText}</span>
                    {isLocked ? (
                      <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Stufe {song.minLvl}</span>
                    ) : (
                      <button 
                        onClick={() => handleCastSong(song)}
                        className="btn cast-bard-song-btn" 
                        style={{ fontSize: '6px', padding: '1px 3px', borderRadius: '1px', cursor: 'pointer', background: 'rgba(139,26,26,0.08)', borderColor: 'var(--red)', color: 'var(--red)', fontWeight: 'bold', height: '12px', lineHeight: '8px' }}
                      >
                        Singen 🎵
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
            <button onClick={handleRollBardicKnowledge} className="btn roll-bard-know-btn" style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '4px', cursor: 'pointer', width: '100%' }}>Bardenwissen 📜</button>
            <button onClick={handleRollPerform} className="btn roll-bard-perform-btn" style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', padding: '4px', cursor: 'pointer', width: '100%' }}>Auftreten 🎲</button>
          </div>
        </div>
      </div>
    </div>
  );
};
