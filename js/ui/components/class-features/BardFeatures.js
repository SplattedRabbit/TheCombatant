import { ClassFeatureComponent } from './ClassFeatureComponent.js';
import { CombatState } from '../../../state.js';
import { showCustomConfirm, showRollBreakdown, showCustomAlert } from '../dialogs.js';

const BARD_SONGS = [
  {
    key: 'countersong',
    nameDe: 'Gegengesang',
    nameEn: 'Countersong',
    minLvl: 1,
    desc: '• <strong>Reichweite:</strong> 9m Radius<br>• <strong>Effekt:</strong> Kontert magische Schalleffekte. Verbündete dürfen bei Rettungswürfen deinen Auftreten-Wurf nutzen.',
    effect: '🎵 <strong>Gegengesang aktiviert!</strong><br>Verbündete im Umkreis von 9m dürfen für die nächsten 10 Runden bei schallbasierten Rettungswürfen deinen Auftreten-Wurf nutzen.'
  },
  {
    key: 'fascinate',
    nameDe: 'Faszinieren',
    nameEn: 'Fascinate',
    minLvl: 1,
    desc: '• <strong>Reichweite:</strong> 27m Radius | <strong>Dauer:</strong> 1 Rd./Stufe<br>• <strong>Effekt:</strong> Zieht Ziele in den Bann. Willens-SG = dein Auftreten-Wurf. Ziele verharren still.',
    effect: '🎵 <strong>Faszinieren gestartet!</strong><br>Ziel(e) müssen einen Willensrettungswurf gegen dein Auftreten-Wurf-Ergebnis bestehen. Jede offensichtliche Bedrohung bricht den Effekt sofort.'
  },
  {
    key: 'inspire_courage',
    nameDe: 'Mut einflößen',
    nameEn: 'Inspire Courage',
    minLvl: 1,
    desc: '• <strong>Boni:</strong> +1 Moralbonus auf Rettungswürfe gegen Furcht/Bezauberung sowie Angriffs-/Schadenswürfe.<br>• <strong>Skalierung:</strong> +2 ab Stufe 8, +3 ab 14, +4 ab 20.',
    effect: '🎵 <strong>Mut einflößen gestartet!</strong><br>Alle Gefährten erhalten einen <strong>+[BONUS] Moralbonus</strong> auf Angriffs- und Waffenschadenswürfe sowie Rettungswürfe gegen Furcht/Bezauberung. Hält für die Dauer des Lieds und 5 Runden danach an.'
  },
  {
    key: 'inspire_competence',
    nameDe: 'Kompetenz einflößen',
    nameEn: 'Inspire Competence',
    minLvl: 3,
    desc: '• <strong>Reichweite:</strong> 9m (1 Gefährte) | <strong>Dauer:</strong> bis zu 2 Min. (Konzentration)<br>• <strong>Effekt:</strong> Gewährt +2 Kompetenzbonus auf alle Fertigkeitswürfe.',
    effect: '🎵 <strong>Kompetenz einflößen gestartet!</strong><br>Ein Gefährte in 9m Reichweite erhält einen <strong>+2 Kompetenzbonus</strong> auf alle Fertigkeitswürfe einer bestimmten Fertigkeit (Dauer: bis zu 2 Min. Konzentration).'
  },
  {
    key: 'suggestion',
    nameDe: 'Einflüsterung',
    nameEn: 'Suggestion',
    minLvl: 6,
    desc: '• <strong>Ziel:</strong> 1 fasziniertes Wesen | <strong>Willens-SG:</strong> 10 + 1/2 Bardenstufe + CHA-Mod<br>• <strong>Effekt:</strong> Wirkt <em>Einflüsterung</em>. Kostet 0 zusätzliche Musik-Nutzungen (RAW!).',
    effect: '🎵 <strong>Einflüsterung gewirkt!</strong><br>Wirkt <em>Einflüsterung</em> auf ein bereits fasziniertes Ziel. <br>• <strong>Rettungswurf-SG:</strong> Willen-SG = <strong>[SG]</strong> (Willen negiert).'
  },
  {
    key: 'inspire_greatness',
    nameDe: 'Größe einflößen',
    nameEn: 'Inspire Greatness',
    minLvl: 9,
    desc: '• <strong>Ziele:</strong> 1 Gefährte (+1 pro 3 Stufen ab 9)<br>• <strong>Effekt:</strong> +2d10 Trefferwürfel, temporäre TP, +2 Kompetenz auf Angriffe, +1 Kompetenz auf Zähigkeit.',
    effect: '🎵 <strong>Größe einflößen gestartet!</strong><br>Ziel(e) erhalten <strong>+2 temporäre Trefferwürfel (2W10)</strong>, temporäre TP, einen <strong>+2 Kompetenzbonus</strong> auf Angriffe und einen <strong>+1 Kompetenzbonus</strong> auf Zähigkeitswürfe.'
  },
  {
    key: 'song_of_freedom',
    nameDe: 'Lied der Freiheit',
    nameEn: 'Song of Freedom',
    minLvl: 12,
    desc: '• <strong>Reichweite:</strong> 9m | <strong>Aktivierung:</strong> 1 Minute spielen<br>• <strong>Effekt:</strong> Wirkt wie <em>Verzauberung brechen</em> (Zauberstufe = Bardenstufe).',
    effect: '🎵 <strong>Lied der Freiheit angestimmt!</strong><br>Nach 1 Minute Singen wirkt ein Effekt wie <em>Verzauberung brechen</em> (Zauberstufe = Bardenstufe) auf ein Ziel in 9m.'
  },
  {
    key: 'inspire_heroics',
    nameDe: 'Heldenmut einflößen',
    nameEn: 'Inspire Heroics',
    minLvl: 15,
    desc: '• <strong>Ziele:</strong> 1 Gefährte (+1 pro 3 Stufen ab 15) | <strong>Aktivierung:</strong> 1 Runde singen<br>• <strong>Effekt:</strong> +4 Moralbonus auf Rettungswürfe, +4 Ausweichbonus auf RK.',
    effect: '🎵 <strong>Heldenmut einflößen gestartet!</strong><br>Gewährt Ziel(en) einen <strong>+4 Moralbonus</strong> auf alle Rettungswürfe und einen <strong>+4 Ausweichbonus</strong> auf die Rüstungsklasse (AC). Hält so lange sie hören + 5 Runden danach.'
  },
  {
    key: 'mass_suggestion',
    nameDe: 'Massen-Einflüsterung',
    nameEn: 'Mass Suggestion',
    minLvl: 18,
    desc: '• <strong>Willens-SG:</strong> 10 + 1/2 Bardenstufe + CHA-Mod<br>• <strong>Effekt:</strong> Wie <em>Einflüsterung</em>, betrifft aber zeitgleich alle faszinierten Wesen in Reichweite.',
    effect: '🎵 <strong>Massen-Einflüsterung gewirkt!</strong><br>Wirkt <em>Einflüsterung</em> gleichzeitig auf alle faszinierten Kreaturen in Reichweite.<br>• <strong>Rettungswurf-SG:</strong> Willen-SG = <strong>[SG]</strong> (Willen negiert).'
  }
];

export class BardFeatures extends ClassFeatureComponent {
  constructor() {
    super('bard', 'Barde', 'Bard');
  }

  render(pc, level) {
    const extraMusic = pc.bardicMusicExtra || 0;
    let musicAbility = pc.dailyAbilities.find(a => a.name === "Bardisches Lied");
    const musicMax = musicAbility ? musicAbility.max : 0;
    const musicUsed = musicAbility ? musicAbility.used : 0;
    const remaining = Math.max(0, musicMax - musicUsed);
    
    let musicBubbles = '';
    if (musicMax > 0) {
      for (let i = 1; i <= musicMax; i++) {
        const spent = i <= musicUsed;
        musicBubbles += `
          <span class="bardic-music-bubble use-icon use-icon-music ${spent ? 'used' : ''}" data-idx="${i}" title="${spent ? 'Benutzt (Freigeben)' : 'Verfügbar (Verbrauchen)'}" style="margin-right: 0 !important;">🎵</span>
        `;
      }
    }

    const cols = musicMax > 0 ? Math.ceil(musicMax / 2) : 0;

    let inspireBonus = 1;
    if (level >= 20) inspireBonus = 4;
    else if (level >= 14) inspireBonus = 3;
    else if (level >= 8) inspireBonus = 2;

    let songItemsHtml = '';
    BARD_SONGS.forEach(song => {
      const isLocked = level < song.minLvl;
      const lockIcon = isLocked ? '🔒' : '🎵';
      const songClass = isLocked ? 'locked-song' : 'unlocked-song';
      
      let courageBonusText = '';
      if (song.key === 'inspire_courage') {
        courageBonusText = ` (Moralbonus: +${inspireBonus})`;
      }

      songItemsHtml += `
        <div class="bard-song-item ${songClass}" style="background: ${isLocked ? 'rgba(0,0,0,0.03)' : 'rgba(200,169,110,0.05)'}; border: 0.5px solid ${isLocked ? 'rgba(0,0,0,0.08)' : 'rgba(200,169,110,0.2)'}; border-radius: 2px; padding: 3px; display: flex; flex-direction: column; gap: 1.5px; font-size: 7.5px; margin-bottom: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold; color: ${isLocked ? 'var(--inkl)' : 'var(--red)'};">
            <span>${lockIcon} ${song.nameDe} <span style="font-size: 6.5px; font-weight: normal; color: var(--ink);">(${song.nameEn})</span>${courageBonusText}</span>
            ${isLocked ? `
              <span style="font-size: 6.5px; color: var(--inkl); font-style: italic;">Stufe ${song.minLvl}</span>
            ` : `
              <button class="btn cast-bard-song-btn" data-key="${song.key}" style="font-size: 6px; padding: 1px 3px; border-radius: 1px; cursor: pointer; background: rgba(139,26,26,0.08); border-color: var(--red); color: var(--red); font-weight: bold; height: 12px; line-height: 8px;">Singen 🎵</button>
            `}
          </div>
          <div style="color: var(--ink); line-height: 1.25; font-style: ${isLocked ? 'italic' : 'normal'};">
            ${song.desc}
          </div>
        </div>
      `;
    });

    return `
      <div class="class-card expanded" style="border: 0.5px solid var(--pb); border-radius: 3px; margin-bottom: 5px; background: rgba(200, 169, 110, 0.03); width: 100%;">
        <div class="class-card-hdr" data-key="bard" style="background: rgba(200, 169, 110, 0.1); padding: 4px 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">
          <span>🎭 Barde (Stufe ${level})</span>
          <span>▼</span>
        </div>
        <div class="class-card-body" style="display: flex; padding: 6px; align-items: start; width: 100%;">
          <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
            <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-bottom:2px; border-bottom:0.5px solid rgba(200,169,110,0.2);">
              Klassenfähigkeiten
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8px; padding-top: 1px;">
              <span><strong>Bardenmusik:</strong></span>
              <div style="display: flex; align-items: center; gap: 2px;">
                <div style="display: grid; grid-template-columns: repeat(${cols}, auto); gap: 1px; justify-content: end; align-items: center;">${musicBubbles}</div>
                <span style="font-size: 7.5px; font-weight: bold;">(${remaining}/${musicMax})</span>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; border-bottom: 0.5px dashed rgba(200,169,110,0.15); padding-bottom: 3px; margin-bottom: 1px;">
              <span style="color: var(--inkl); font-style: italic;">Extra Musik (Feats/Items):</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <button class="btn adjust-extra-music-btn" data-dir="-1" style="font-size: 7px; padding: 0 3px; cursor: pointer; line-height: 1; border-radius: 1px; border: 0.5px solid var(--pb); font-weight: bold;">-</button>
                <span style="font-weight: bold; width: 14px; text-align: center;">${extraMusic >= 0 ? '+' : ''}${extraMusic}</span>
                <button class="btn adjust-extra-music-btn" data-dir="1" style="font-size: 7px; padding: 0 3px; cursor: pointer; line-height: 1; border-radius: 1px; border: 0.5px solid var(--pb); font-weight: bold;">+</button>
              </div>
            </div>

            <div style="font-family:'IM Fell English SC', serif; font-size:8px; color:var(--red); padding-top:2px; padding-bottom:1px; border-bottom:0.5px solid rgba(200,169,110,0.2);">
              Bardenlieder-Kompendium
            </div>
            <div class="bard-songs-list" style="display: flex; flex-direction: column; gap: 3px; padding-right: 2px; margin-top: 2px; border: 0.5px solid rgba(200,169,110,0.15); border-radius: 2px; padding: 2px;">
              ${songItemsHtml}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 4px;">
              <button class="btn roll-bard-know-btn" style="font-family: 'IM Fell English SC', serif; font-size: 8px; padding: 4px; cursor: pointer; width: 100%;">Bardenwissen 🎲</button>
              <button class="btn roll-bard-perform-btn" style="font-family: 'IM Fell English SC', serif; font-size: 8px; padding: 4px; cursor: pointer; width: 100%;">Auftreten 🎲</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(pc, level, container, triggerRender) {
    // Unified Event Delegation on Bard Feature Container to eliminate DOM timing issues
    container.onclick = (e) => {
      // 1. Bardic music bubbles
      const bubble = e.target.closest('.bardic-music-bubble');
      if (bubble) {
        e.stopPropagation();
        try {
          const idx = parseInt(bubble.dataset.idx);
          CombatState.updatePCBatch(activePC => {
            const musicAbility = activePC.dailyAbilities.find(a => a.name === "Bardisches Lied");
            if (musicAbility) {
              if (idx <= musicAbility.used) {
                musicAbility.used = Math.max(0, idx - 1);
              } else {
                musicAbility.used = Math.min(musicAbility.max, idx);
              }
            }
          });
          triggerRender();
        } catch (err) {
          console.error("Error in bardic music bubble click:", err);
        }
        return;
      }

      // 2. Extra music uses adjustment
      const adjustBtn = e.target.closest('.adjust-extra-music-btn');
      if (adjustBtn) {
        e.stopPropagation();
        try {
          const dir = parseInt(adjustBtn.dataset.dir);
          CombatState.updatePCBatch(activePC => {
            activePC.bardicMusicExtra = Math.max(-level, (activePC.bardicMusicExtra || 0) + dir);
          });
          triggerRender();
        } catch (err) {
          console.error("Error in adjust extra music click:", err);
        }
        return;
      }

      // 3. Roll Bardic Knowledge
      const knowBtn = e.target.closest('.roll-bard-know-btn');
      if (knowBtn) {
        e.stopPropagation();
        
        const getAblMod = (score) => {
          const s = parseInt(score) || 10;
          return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
        };
        const intMod = getAblMod(pc.int ? pc.int.getValue() : 10);
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

        showCustomAlert(
          "Bardenwissen 📜",
          html,
          "Schließen",
          "",
          null
        );

        return;
      }

      // 4. Roll Perform
      const perfBtn = e.target.closest('.roll-bard-perform-btn');
      if (perfBtn) {
        e.stopPropagation();
        const getAblMod = (score) => {
          const s = parseInt(score) || 10;
          return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
        };
        const chaMod = getAblMod(pc.cha ? pc.cha.getValue() : 10);
        const ranks = level + 3; // Standard raw ranks for bard perform at level
        showRollBreakdown("Auftreten-Wurf (Perform)", "1W20", [
          { label: "Ränge in Auftreten (assumed)", value: ranks },
          { label: "CHA-Mod", value: chaMod }
        ], e);
        return;
      }

      // 5. Cast Bard Song Compendium trigger
      const castBtn = e.target.closest('.cast-bard-song-btn');
      if (castBtn) {
        e.stopPropagation();
        const key = castBtn.dataset.key;
        const song = BARD_SONGS.find(s => s.key === key);
        if (!song) return;

        const activePC = CombatState.getActivePC();
        const musicAbility = activePC.dailyAbilities.find(a => a.name === "Bardisches Lied");
        if (!musicAbility) return;

        const performCast = () => {
          const isZeroCost = key === 'suggestion' || key === 'mass_suggestion';
          if (!isZeroCost) {
            CombatState.updatePCBatch(pcToUpdate => {
              const innerAbility = pcToUpdate.dailyAbilities.find(a => a.name === "Bardisches Lied");
              if (innerAbility) {
                innerAbility.used = Math.min(innerAbility.max, innerAbility.used + 1);
              }
            });
          }

          let bonusText = '';
          let effectHtml = song.effect;

          const getAblMod = (score) => {
            const s = parseInt(score) || 10;
            return s >= 10 ? Math.floor((s - 10) / 2) : (s === 9 || s === 8 ? -1 : (s === 7 || s === 6 ? -2 : (s === 5 || s === 4 ? -4 : -5)));
          };
          const chaMod = getAblMod(activePC.cha ? activePC.cha.getValue() : 10);

          if (key === 'inspire_courage') {
            let inspireBonus = 1;
            if (level >= 20) inspireBonus = 4;
            else if (level >= 14) inspireBonus = 3;
            else if (level >= 8) inspireBonus = 2;
            effectHtml = effectHtml.replace('[BONUS]', String(inspireBonus));
          } else if (key === 'suggestion' || key === 'mass_suggestion') {
            const sg = 10 + Math.floor(level / 2) + chaMod;
            effectHtml = effectHtml.replace('[SG]', String(sg));
          }

          showCustomAlert(
            "Bardenmusik angestimmt! 🎵",
            `
            <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.4;">
              <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
                ${activePC.name} spielt ${song.nameDe}!
              </div>
              <div style="font-size: 8.5px; background: rgba(200, 169, 110, 0.05); border: 0.5px solid rgba(200, 169, 110, 0.3); padding: 5px; border-radius: 2px; line-height: 1.3;">
                ${effectHtml}
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
            () => {
              triggerRender();
            }
          );
        };

        const max = musicAbility.max;
        const used = musicAbility.used;
        const isZeroCost = key === 'suggestion' || key === 'mass_suggestion';

        if (!isZeroCost && used >= max) {
          showCustomConfirm("Keine Musik-Slots!", "Du hast keine freien Nutzungen für Bardenmusik mehr. Möchtest du dieses Lied trotzdem anstimmen?", () => {
            performCast();
          });
        } else {
          performCast();
        }
        return;
      }
    };
  }

  onNewDay(pc, level) {
    let musicAbility = pc.dailyAbilities.find(a => a.name === "Bardisches Lied");
    if (musicAbility) {
      musicAbility.used = 0;
    }
  }
}
