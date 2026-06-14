import React, { useState, useEffect } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface RangerFeaturesCardProps {
  pc: any;
  level: number;
}

export const RangerFeaturesCard: React.FC<RangerFeaturesCardProps> = ({ pc, level }) => {
  const [generalRulesOpen, setGeneralRulesOpen] = useState(false);
  const [favoredRulesOpen, setFavoredRulesOpen] = useState(false);
  const [combatstyleRulesOpen, setCombatstyleRulesOpen] = useState(false);
  const [wildempathyRulesOpen, setWildempathyRulesOpen] = useState(false);
  const [favoredEnemyLocal, setFavoredEnemyLocal] = useState(pc.favoredEnemy || '');

  // Keep local input in sync when pc model updates from elsewhere
  useEffect(() => {
    setFavoredEnemyLocal(pc.favoredEnemy || '');
  }, [pc.favoredEnemy]);

  const getAblMod = (score: number) => {
    return score >= 10 ? Math.floor((score - 10) / 2) : (score === 9 || score === 8 ? -1 : (score === 7 || score === 6 ? -2 : (score === 5 || score === 4 ? -4 : -5)));
  };

  const enemyBonus = Math.floor(level / 5) * 2 + 2;
  const combatStyle = pc.rangerCombatStyle || 'none';
  const casterLvl = Math.floor(level / 2);
  const companionLvl = Math.floor(level / 2);

  const chaScore = pc.cha ? pc.cha.getValue() : 10;
  const chaMod = getAblMod(chaScore);
  const wildEmpathyTotal = level + chaMod;

  const handleFavoredEnemyCommit = (val: string) => {
    const activePC = CombatState.getActivePC();
    if (activePC.favoredEnemy !== val) {
      activePC.favoredEnemy = val;
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
    }
  };

  const handleCombatStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const activePC = CombatState.getActivePC();
    activePC.rangerCombatStyle = e.target.value;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  const handleShowWildEmpathyFormula = () => {
    const title = 'Wildes Mitgefühl (Wurf)';
    const message = `
      <div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11.5px; line-height: 1.35;">
        <p>Würfle einen physischen d20-Wurf und addiere deine Modifikatoren:</p>
        <div style="background: rgba(200, 169, 110, 0.1); border: 0.5px solid var(--pb); border-radius: 3px; padding: 6px; font-family: 'IM Fell English SC', serif; text-align: center; margin: 6px 0; font-size: 11px; font-weight: bold; color: var(--red);">
          d20 + ${wildEmpathyTotal}
        </div>
        <div style="font-size: 8px; color: var(--inkm); line-height: 1.25; margin-bottom: 6px;">
          <strong>Aufschlüsselung der Formel:</strong><br>
          • d20 (Physischer Wurf)<br>
          • + ${level} (Waldläuferstufe)<br>
          • + ${chaMod >= 0 ? '+' : ''}${chaMod} (Charisma-Modifikator [Wert: ${chaScore}])
        </div>
        <div style="font-size: 8px; background: rgba(0,0,0,0.02); padding: 4px; border: 0.3px dashed var(--pb); border-radius: 2px; line-height: 1.2;">
          <strong>Schwierigkeitsgrade (SG / DC):</strong><br>
          • Gleichgültig machen: SG 10 (wenn unfreundlich) / SG 15 (wenn feindselig)<br>
          • Freundlich machen: SG 15 (von gleichgültig) / SG 25 (von feindselig)<br>
          • Hilfsbereit machen: SG 20 (von freundlich) / SG 30 (von gleichgültig)
        </div>
        <small style="color: var(--inkm); font-size: 7px; display: block; margin-top: 4px;">*Gegen magische Bestien (Int 1-2) gilt ein zusätzlicher Abzug von -4.</small>
      </div>
    `;
    showCustomAlert(title, message, 'Schließen', '🎲');
  };

  const renderCombatStyleFeatsList = () => {
    if (combatStyle === 'none' || level < 2) return null;
    const feats = [];
    if (combatStyle === 'archery') {
      feats.push({ name: 'Schnelles Schießen (Rapid Shot)', lvl: 2 });
      if (level >= 6) feats.push({ name: 'Mehrfachschuss (Manyshot)', lvl: 6 });
      if (level >= 11) feats.push({ name: 'Verbesserter Präziser Schuss (Improved Precise Shot)', lvl: 11 });
    } else if (combatStyle === 'twoweapon') {
      feats.push({ name: 'Zwei-Waffen-Kampf (Two-Weapon Fighting)', lvl: 2 });
      if (level >= 6) feats.push({ name: 'Verbesserter Zwei-Waffen-Kampf (Improved Two-Weapon Fighting)', lvl: 6 });
      if (level >= 11) feats.push({ name: 'Überragender Zwei-Waffen-Kampf (Greater Two-Weapon Fighting)', lvl: 11 });
    }

    return (
      <div style={{ background: 'rgba(200, 169, 110, 0.06)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '2px', padding: '4px', marginTop: '3px', fontSize: '7.5px' }}>
        <div style={{ fontWeight: 'bold', color: 'var(--red)', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Aktivierte Kampfstil-Talente:</span>
          <span style={{ color: 'var(--inkm)', fontWeight: 'normal', fontSize: '6.8px', fontStyle: 'italic' }}>(Nur in leichter/keiner Rüstung)</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '10px', listStyleType: 'square', lineHeight: 1.25 }}>
          {feats.map((f, idx) => <li key={idx}><strong>{f.name}</strong></li>)}
        </ul>
      </div>
    );
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Waldläufer (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
            <span>Klassenfähigkeiten</span>
            <button 
              onClick={() => setGeneralRulesOpen(!generalRulesOpen)}
              className="btn btn-toggle-rules-general" 
              style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
              title="Regeln einblenden"
            >
              📖 {generalRulesOpen ? '▲' : '▼'}
            </button>
          </div>
          
          {generalRulesOpen && (
            <div className="general-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
              <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Waldläufer-Klassenfähigkeiten:</strong><br />
              • <strong>Track (Stufe 1):</strong> Erhält <em>Spurenlesen</em> als Bonus-Talent.<br />
              • <strong>Endurance (Stufe 3):</strong> Erhält <em>Ausdauer</em> als Bonus-Talent.<br />
              • <strong>Tierbegleiter (Stufe 4):</strong> Erhält einen Tierbegleiter (Stufe = 1/2 Waldläuferstufe).<br />
              • <strong>Zaubersprüche (Stufe 4):</strong> Divine Zauber basierend auf Weisheit (Zauberstufe = 1/2 Waldläuferstufe).<br />
              • <strong>Woodland Stride (Stufe 7):</strong> Kann sich ohne Schaden oder Verlangsamung durch natürliches Unterholz bewegen.<br />
              • <strong>Swift Tracker (Stufe 8):</strong> Kann Spuren ohne Abzug von -5 mit normaler Geschwindigkeit verfolgen.<br />
              • <strong>Evasion (Stufe 9):</strong> Erleidet bei erfolgreichem Reflexwurf keinen Schaden (nur in leichter oder keiner Rüstung).<br />
              • <strong>Camouflage (Stufe 13):</strong> Kann sich in natürlichem Gelände auch ohne Deckung verstecken.<br />
              • <strong>Hide in Plain Sight (Stufe 17):</strong> Kann sich in natürlichem Gelände auch unter Beobachtung verstecken.
            </div>
          )}
          
          {/* Erzfeind Sektion */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', marginTop: '1px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Erzfeind:</strong></span>
                <button 
                  onClick={() => setFavoredRulesOpen(!favoredRulesOpen)}
                  className="btn btn-toggle-rules-favored" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
                >
                  📖 {favoredRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <input 
                type="text" 
                value={favoredEnemyLocal}
                onChange={(e) => setFavoredEnemyLocal(e.target.value)}
                onBlur={() => handleFavoredEnemyCommit(favoredEnemyLocal)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleFavoredEnemyCommit(favoredEnemyLocal); }}
                placeholder="z. B. Untote" 
                style={{ width: '70px', fontSize: '8px', height: '13px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', padding: '0 2px' }}
              />
            </div>
            {favoredRulesOpen && (
              <div className="favored-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Erzfeind (Favored Enemy):</strong><br />
                Waldläufer erhält Boni gegen bestimmte Kreaturenarten.<br />
                • <strong>Aktiver Bonus: +{enemyBonus}</strong><br />
                • <strong>Anwendung:</strong> Gilt für alle <strong>Waffenschadenswürfe</strong> gegen den Erzfeind. Gilt für Proben auf Bluffen, Entdecken, Lauschen, Motiv erkennen und Überleben gegen diese Kreaturen.<br />
                • <strong style={{ color: 'var(--red)' }}>Wichtig (3.5e RAW):</strong> Gewährt <strong>keinen Angriffsbonus</strong> auf Trefferwürfe!
              </div>
            )}
          </div>
          <div style={{ background: 'rgba(200, 169, 110, 0.12)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--red)', textAlign: 'center', fontWeight: 'bold', lineHeight: 1.25 }}>
            ✦ Erzfeind-Bonus: +{enemyBonus} auf Schaden & Fertigkeiten ✦
          </div>

          {/* Kampfstil Sektion */}
          {level >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', paddingTop: '3px', marginTop: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span><strong>Kampfstil:</strong></span>
                  <button 
                    onClick={() => setCombatstyleRulesOpen(!combatstyleRulesOpen)}
                    className="btn btn-toggle-rules-combatstyle" 
                    style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                    title="Regeln einblenden"
                  >
                    📖 {combatstyleRulesOpen ? '▲' : '▼'}
                  </button>
                </div>
                <select 
                  value={combatStyle}
                  onChange={handleCombatStyleChange}
                  className="cinput ranger-combat-style" 
                  style={{ width: '70px', fontSize: '7.5px', height: '14px', padding: '0 1px' }}
                >
                  <option value="none">-- Wählen --</option>
                  <option value="archery">Bogenschießen</option>
                  <option value="twoweapon">Zwei-Waffen</option>
                </select>
              </div>
              {combatstyleRulesOpen && (
                <div className="combatstyle-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                  <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Kampfstil (Combat Style):</strong><br />
                  Ab Stufe 2 spezialisiert sich der Waldläufer auf einen Kampfstil. Die Vorteile gelten <strong>nur in leichter/keiner Rüstung</strong>!<br />
                  • <strong>Bogenschießen:</strong> Stufe 2: <em>Rapid Shot</em>, Stufe 6: <em>Manyshot</em>, Stufe 11: <em>Improved Precise Shot</em>.<br />
                  • <strong>Zwei-Waffen-Kampf:</strong> Stufe 2: <em>Two-Weapon Fighting</em>, Stufe 6: <em>Improved Two-Weapon Fighting</em>, Stufe 11: <em>Greater Two-Weapon Fighting</em>.
                </div>
              )}
              {renderCombatStyleFeatsList()}
            </div>
          )}

          {/* Wildes Mitgefühl Sektion */}
          <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '0.5px dashed rgba(200,169,110,0.2)', paddingBottom: '4px', marginBottom: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', paddingTop: '3px', marginTop: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span><strong>Wildes Mitgefühl:</strong></span>
                <button 
                  onClick={() => setWildempathyRulesOpen(!wildempathyRulesOpen)}
                  className="btn btn-toggle-rules-wildempathy" 
                  style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                  title="Regeln einblenden"
                >
                  📖 {wildempathyRulesOpen ? '▲' : '▼'}
                </button>
              </div>
              <button 
                onClick={handleShowWildEmpathyFormula}
                className="xbtn ranger-wild-empathy-btn" 
                style={{ fontSize: '7.5px', padding: '1px 4px', height: '14px', lineHeight: 1, fontFamily: "'IM Fell English SC', serif", cursor: 'pointer' }}
              >
                Formel anzeigen 🎲
              </button>
            </div>
            {wildempathyRulesOpen && (
              <div className="wildempathy-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Wildes Mitgefühl (Wild Empathy):</strong><br />
                Verbesserung der Einstellung von Tieren (Diplomatie-Pendant).<br />
                • <strong>Wurfformel:</strong> 1d20 + Waldläufer-Stufe [{level}] + CHA-Mod.<br />
                • <strong>Anwendung:</strong> Sichtkontakt und Nähe (max. 9m), Dauer 1 min.<br />
                • <strong>Bestien:</strong> Mit -4 Abzug auch auf magische Bestien (Int 1-2) anwendbar.
              </div>
            )}
          </div>

          {/* Tierbegleiter & Zauberstufe Fußzeile */}
          {level >= 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '7.2px', borderTop: '0.5px solid rgba(200,169,110,0.2)', paddingTop: '3px', marginTop: '2px', color: 'var(--inkm)' }}>
              <div>🐾 Begleiter-Stufe: <strong>{companionLvl}</strong></div>
              <div style={{ textAlign: 'right' }}>🔮 Waldläufer-Zauberstufe: <strong>{casterLvl}</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
