import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { uiRegistry } from '@core/ui/ui-shared.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
// @ts-ignore
import { checkPrerequisites } from '@core/rules/RulesFeats.js';

import { SKILLS_REGISTRY } from '@core/data/skills-data.js';

interface FeatScrollDialogProps {
  feat: any;
  pc: any;
  isLearned: boolean;
  option?: string;
  onClose: () => void;
  onRefresh: () => void; // Used to re-render the dialog if instances change
}

function translateAppEffect(text: string): string {
  if (!text) return text;
  let t = text;
  t = t.replace(/maximale Trefferpunkte/g, 'maximum Hit Points');
  t = t.replace(/\(stapelbar\)/g, '(stacks)');
  t = t.replace(/auf Zähigkeits-Rettungswurf/g, 'to Fortitude saves');
  t = t.replace(/auf Reflex-Rettungswurf/g, 'to Reflex saves');
  t = t.replace(/auf Willens-Rettungswurf/g, 'to Will saves');
  t = t.replace(/auf Willens-Rettungs-Wurf/g, 'to Will saves');
  t = t.replace(/auf Rettungswurf/g, 'to saves');
  t = t.replace(/Ladungen pro Tag für "Untote vertreiben"/g, 'turn undead attempts per day');
  t = t.replace(/Ladungen pro Tag für "Bardisches Lied"/g, 'bardic music uses per day');
  t = t.replace(/auf Rettungswurf-SG der gewählten Magieschule/g, 'to save DCs of selected school');
  t = t.replace(/Zusätzlich \+1 auf Rettungswurf-SG der gewählten Schule/g, '+1 to save DCs of selected school (stacks)');
  t = t.replace(/auf Zauberresistenz-Überwindungswürfe/g, 'to caster level checks to overcome spell resistance');
  t = t.replace(/Zusätzlich \+2 auf Zauberresistenz-Überwindungswürfe/g, '+2 to caster level checks to overcome spell resistance (stacks)');
  t = t.replace(/Konzentration beim defensiven Zaubern/g, 'Concentration checks when casting defensively');
  t = t.replace(/Erlaubt Zaubern in Tiergestalt/g, 'Allows casting spells in wild shape');
  t = t.replace(/Keine Standard-Materialkomponenten nötig \(<1 GM\)/g, 'No standard material components needed (<1 gp)');
  t = t.replace(/Einige Zauber ohne Zauberbuch vorbereiten/g, 'Prepare some spells without spellbook');
  t = t.replace(/Renn-Geschwindigkeit/g, 'run speed');
  t = t.replace(/Weitsprung/g, 'running jumps');
  t = t.replace(/Erlaubt Fährtensuche via Überleben/g, 'Allows tracking using Survival');
  t = t.replace(/auf Zähigkeitsprüfungen gegen Erschöpfung\/Umwelt/g, 'to Fortitude saves/checks against exhaustion/environments');
  t = t.replace(/Handlungsfähig bei -1 bis -9 TP/g, 'Act normally at -1 to -9 HP');
  t = t.replace(/Schaltet Gefährten\/Gefolgsleute frei/g, 'Unlocks cohort and followers');
  t = t.replace(/Kein Angriffs-Malus durch leichte Rüstung/g, 'No attack penalty for wearing light armor');
  t = t.replace(/Kein Angriffs-Malus durch mittelschwere Rüstung/g, 'No attack penalty for wearing medium armor');
  t = t.replace(/Kein Angriffs-Malus durch schwere Rüstung/g, 'No attack penalty for wearing heavy armor');
  t = t.replace(/Kein Angriffs-Malus durch Schilde/g, 'No attack penalty for shields');
  t = t.replace(/Kein Angriffs-Malus durch Turmschilde/g, 'No attack penalty for tower shields');
  t = t.replace(/Kein Malus bei einfachen Waffen/g, 'No penalty for simple weapons');
  t = t.replace(/Kein Malus bei der gewählten Kriegswaffe/g, 'No penalty for selected martial weapon');
  t = t.replace(/auf Springen und Akrobatik/g, 'to Jump and Tumble');
  t = t.replace(/auf Balance und Entfesselungskunst/g, 'to Balance and Escape Artist');
  t = t.replace(/auf Lauschen und Entdecken/g, 'to Listen and Spot');
  t = t.replace(/auf Mit Tieren umgehen und Reiten/g, 'to Handle Animal and Ride');
  t = t.replace(/auf Klettern und Schwimmen/g, 'to Climb and Swim');
  t = t.replace(/auf Verkleiden und Fälschen/g, 'to Disguise and Forgery');
  t = t.replace(/auf Taschendiebstahl und Seilbenutzung/g, 'to Sleight of Hand and Use Rope');
  t = t.replace(/Tränke brauen freigeschaltet \(ab Caster-Lvl 3\)/g, 'Brew Potions unlocked (Caster level 3)');
  t = t.replace(/Schriftrollen schreiben freigeschaltet/g, 'Scribe Scrolls unlocked');
  t = t.replace(/Zauberstäbe herstellen freigeschaltet \(ab Caster-Lvl 5\)/g, 'Craft Wands unlocked (Caster level 5)');
  t = t.replace(/Waffen\/Rüstungen herstellen freigeschaltet \(ab Caster-Lvl 5\)/g, 'Craft Arms & Armor unlocked (Caster level 5)');
  t = t.replace(/Wundersame Gegenstände herstellen freigeschaltet \(ab Caster-Lvl 3\)/g, 'Craft Wondrous Items unlocked (Caster level 3)');
  t = t.replace(/Zepter herstellen freigeschaltet \(ab Caster-Lvl 9\)/g, 'Craft Rods unlocked (Caster level 9)');
  t = t.replace(/Stecken herstellen freigeschaltet \(ab Caster-Lvl 12\)/g, 'Craft Staffs unlocked (Caster level 12)');
  t = t.replace(/Ringe schmieden freigeschaltet \(ab Caster-Lvl 12\)/g, 'Craft Rings unlocked (Caster level 12)');
  t = t.replace(/Zaubergrade Slot-Erhöhung/g, 'spell slot level increase');
  t = t.replace(/Zaubergrad Slot-Erhöhung/g, 'spell slot level increase');
  t = t.replace(/Freie Slot-Erhöhung für SG-Steigerung/g, 'Free slot increase for DC increase');
  
  // Generic translation fallbacks for common words
  t = t.replace(/freigeschaltet/gi, 'unlocked');
  t = t.replace(/ab Caster-Lvl/gi, 'from Caster level');
  t = t.replace(/pro Tag für/gi, 'per day for');
  t = t.replace(/auf/gi, 'to');
  t = t.replace(/oder/gi, 'or');
  t = t.replace(/benötigt/gi, 'required');
  return t;
}

export const FeatScrollDialog: React.FC<FeatScrollDialogProps> = ({
  feat,
  pc,
  isLearned,
  option = '',
  onClose,
  onRefresh
}) => {
  const categoryEn =
    (
      { combat: 'Combat Feat', metamagic: 'Metamagic Feat', item_creation: 'Item Creation Feat', general: 'General Feat' } as Record<string, string>
    )[feat.category] || 'General Feat';

  const currentPC = (CombatState && typeof CombatState.getActivePC === 'function' ? CombatState.getActivePC() : null) || pc;
  const activeFeatsList = currentPC.feats || [];

  // Evaluate prerequisites
  const { met, details: prereqsDetails } = checkPrerequisites(feat, currentPC);

  const autoFeats = typeof currentPC.getAutomaticFeats === 'function' ? currentPC.getAutomaticFeats() : [];
  const autoFeatObj = autoFeats.find((af: any) => af.id === feat.id);
  const isAutomatic = !!autoFeatObj;
  const isActuallyLearned = isLearned || activeFeatsList.some((f: any) => f.id === feat.id) || isAutomatic;

  // Stackability & Options info
  const isStackable = feat.specialRaw && feat.specialRaw.toLowerCase().includes('multiple times');
  const learnedInstances = activeFeatsList.filter((f: any) => f.id === feat.id);

  // Generate options list if option dropdown is needed
  let optionsList: string[] = [];
  if (feat.hasOption && (!isLearned || isStackable)) {
    if (feat.optionType === 'weapon') {
      optionsList = [
        'Longsword',
        'Shortsword',
        'Dagger',
        'Greatsword',
        'Composite Bow',
        'Longbow',
        'Unarmed Strike',
        'Quarterstaff',
        'Kama',
        'Nunchaku',
        'Sai',
        'Shuriken',
        'Siangham',
        'Crossbow',
        'Halberd',
        'Morningstar',
        'Battleaxe'
      ];
    } else if (feat.optionType === 'school') {
      optionsList = [
        'Abjuration',
        'Conjuration',
        'Divination',
        'Evocation',
        'Illusion',
        'Necromancy',
        'Transmutation',
        'Enchantment'
      ];
    } else if (feat.optionType === 'skill') {
      optionsList = Object.keys(SKILLS_REGISTRY).map((key) => {
        const englishName = key
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return englishName;
      });
      optionsList.sort((a, b) => a.localeCompare(b));
    }
  }

  // Filter out options already learned
  const learnedOptions = learnedInstances.map((inst: any) => inst.option).filter(Boolean);
  const filteredOptions = optionsList.filter((o) => !learnedOptions.includes(o));

  const [selectedOption, setSelectedOption] = useState<string>(
    filteredOptions.length > 0 ? filteredOptions[0] : ''
  );

  const handleLearn = () => {
    const optToLearn = feat.hasOption ? selectedOption : '';
    const result = CombatState.addPCFeat(feat.id, optToLearn);
    if (result && !result.success) {
      showCustomAlert('Prerequisites Missing', result.error.replace(/\n/g, '<br>'), 'Understood', '🔒');
      return;
    }
    onClose();
    if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
      uiRegistry.renderPlayerScreen();
    }
  };

  const handleUnlearn = () => {
    CombatState.removePCFeat(feat.id, option);
    onClose();
    if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
      uiRegistry.renderPlayerScreen();
    }
  };

  const handleRemoveInstance = (instOption: string) => {
    CombatState.removePCFeat(feat.id, instOption);
    onRefresh(); // Re-render this modal (bridge re-initiates)
    if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
      uiRegistry.renderPlayerScreen();
    }
  };

  const isLearnBlocked = !met;

  return (
    <div
      id="featScrollOverlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="custom-scroll-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '14px 18px',
          width: '540px',
          maxWidth: '92vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1)',
          fontFamily: "'IM Fell English SC', serif",
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        {/* Scroll parchment content */}
        <div
          className="ancient-parchment"
          style={{
            background: '#f4e8c1',
            border: '2px solid #8b1a1a',
            padding: '12px 16px',
            borderRadius: '4px',
            boxShadow: 'inset 0 0 35px rgba(139, 26, 26, 0.15)',
            fontFamily: "'Crimson Text', serif",
            color: '#1a0f00',
            lineHeight: 1.4,
            textAlign: 'left',
            maxHeight: '54vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}
        >
          <h3
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '13.5px',
              color: '#8b1a1a',
              textAlign: 'center',
              borderBottom: '2px solid #8b1a1a',
              paddingBottom: '4px',
              margin: '0 0 8px 0',
              letterSpacing: '0.8px',
              fontWeight: 'bold'
            }}
          >
            {feat.nameEn || feat.nameDe}
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px 10px',
              fontSize: '9px',
              borderBottom: '0.5px dashed rgba(139, 26, 26, 0.3)',
              paddingBottom: '6px',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}
          >
            <div><strong>Category:</strong> {categoryEn}</div>
            <div><strong>Met:</strong> {met ? 'Yes' : 'No'}</div>
            <div style={{ gridColumn: 'span 2' }}>
              <strong>App Mechanics:</strong>{' '}
              <span style={{ color: '#8b1a1a', fontWeight: 'bold' }}>
                {translateAppEffect(feat.appEffect) || 'No automatic stat changes'}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '9.5px', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif", fontSize: '10px' }}>
              Prerequisites:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
              {prereqsDetails.length === 0 ? (
                <div style={{ color: '#2a6a2a', fontWeight: 'bold', fontSize: '9px' }}>None</div>
              ) : (
                prereqsDetails.map((pr: any, idx: number) => {
                  const color = pr.met ? '#2a6a2a' : '#8b1a1a';
                  const mark = pr.met ? '✓' : '✗';
                  return (
                    <div key={idx} style={{ color, fontWeight: 500, fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{mark}</span>
                      <span>{pr.desc}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ fontSize: '9.5px', marginBottom: '6px', lineHeight: 1.35 }}>
            <strong style={{ color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif" }}>Benefit (RAW):</strong>
            <div style={{ fontStyle: 'italic', color: '#2a1b0a', paddingLeft: '4px' }}>{feat.benefitRaw || feat.benefitEn || feat.benefitDe}</div>
          </div>

          {feat.normalRaw && (
            <div style={{ fontSize: '9px', marginBottom: '6px', lineHeight: 1.35, borderTop: '0.5px dotted rgba(139,26,26,0.2)', paddingTop: '4px' }}>
              <strong style={{ color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif" }}>Normal:</strong>
              <div style={{ color: '#4a3b2a', paddingLeft: '4px' }}>{feat.normalRaw}</div>
            </div>
          )}

          {feat.specialRaw && (
            <div style={{ fontSize: '9px', marginBottom: '4px', lineHeight: 1.35, borderTop: '0.5px dotted rgba(139,26,26,0.2)', paddingTop: '4px' }}>
              <strong style={{ color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif" }}>Special:</strong>
              <div style={{ color: '#4a3b2a', paddingLeft: '4px' }}>{feat.specialRaw}</div>
            </div>
          )}

          {feat.hasOption && (!isLearned || isStackable) && (
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px', fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold' }}>
              <label htmlFor="featOptionSelect" style={{ color: '#5a3a1a' }}>Specific selection for this feat:</label>
              <select
                id="featOptionSelect"
                className="cinput"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                style={{ width: '100%', fontSize: '9px', height: '18px', padding: '0 2px', boxSizing: 'border-box' }}
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((o, idx) => (
                    <option key={idx} value={o}>
                      {o}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    -- All options already learned --
                  </option>
                )}
              </select>
            </div>
          )}

          {learnedInstances.length > 0 && (
            <div style={{ marginTop: '6px', fontFamily: "'Crimson Text', serif", fontSize: '9.5px', borderTop: '0.5px dashed rgba(139,26,26,0.3)', paddingTop: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#5a3a1a', marginBottom: '2px' }}>Already learned instances:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {learnedInstances.map((inst: any, idx: number) => {
                  const optText = inst.option ? `(${inst.option})` : '';
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '2px', padding: '2px 4px', fontSize: '8.5px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>
                        {(feat.nameEn || feat.nameDe)} {optText}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleRemoveInstance(inst.option || '');
                        }}
                        className="xbtn btn-remove-instance"
                        style={{ color: 'var(--red)', borderColor: 'var(--red)', padding: '0 3px', fontSize: '7px', height: '13px', lineHeight: '13px' }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div style={{ marginTop: '4px' }}>
          {!isActuallyLearned || isStackable ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
              <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif", letterSpacing: '0.3px' }}>
                {isLearnBlocked ? '🔒 Prerequisites not met!' : 'Do you want to learn this feat?'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', width: '100%' }}>
                <button
                  onClick={handleLearn}
                  disabled={isLearnBlocked}
                  className="btn btn-p btn-learn-feat"
                  style={{
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '9px',
                    padding: '4px 22px',
                    cursor: isLearnBlocked ? 'not-allowed' : 'pointer',
                    background: isLearnBlocked ? 'rgba(0,0,0,0.05)' : 'rgba(42, 106, 42, 0.1)',
                    border: `1px solid ${isLearnBlocked ? 'rgba(0,0,0,0.2)' : '#2a6a2a'}`,
                    borderRadius: '2px',
                    color: isLearnBlocked ? '#888' : '#2a6a2a',
                    fontWeight: 'bold',
                    transition: 'background-color 0.15s, color 0.15s',
                    outline: 'none'
                  }}
                >
                  Learn
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-close-feat"
                  style={{
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '9px',
                    padding: '4px 22px',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '1px solid var(--pb)',
                    borderRadius: '2px',
                    color: 'var(--inkl)',
                    transition: 'background-color 0.15s, color 0.15s',
                    outline: 'none'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : isAutomatic ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div
                style={{
                  background: 'rgba(200, 169, 110, 0.12)',
                  border: '1px solid var(--pb)',
                  borderLeft: '4px solid #7c5a2b',
                  borderRadius: '3px',
                  padding: '8px 12px',
                  width: '100%',
                  boxSizing: 'border-box',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(124, 90, 43, 0.25)', paddingBottom: '3px' }}>
                  <span style={{ fontSize: '10.5px', color: '#7c5a2b', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif", display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>🛡️</span> Automatic Class Feature
                  </span>
                  {autoFeatObj && (
                    <span style={{ fontSize: '7.5px', color: '#7c5a2b', background: 'rgba(124, 90, 43, 0.12)', padding: '1px 5px', borderRadius: '2px', fontWeight: 'bold' }}>
                      {autoFeatObj.source || 'Class Feature'}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '9.5px', color: 'var(--ink)', margin: 0, fontFamily: "'Crimson Text', serif", lineHeight: 1.35 }}>
                  This feat is granted automatically as an integral part of your character's class or racial progression. Because it is a permanent inherent trait, it cannot be unlearned.
                </p>
              </div>

              <button
                onClick={onClose}
                className="btn btn-close-feat"
                style={{
                  fontFamily: "'IM Fell English SC', serif",
                  fontSize: '9.5px',
                  padding: '4px 28px',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: '1px solid var(--pb)',
                  borderRadius: '2px',
                  color: 'var(--inkl)',
                  transition: 'background-color 0.15s, color 0.15s',
                  outline: 'none'
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
              <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif", letterSpacing: '0.3px' }}>
                Do you want to unlearn this feat?
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', width: '100%' }}>
                <button
                  onClick={handleUnlearn}
                  className="btn btn-p btn-unlearn-feat"
                  style={{
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '9px',
                    padding: '4px 22px',
                    cursor: 'pointer',
                    background: 'rgba(139, 26, 26, 0.1)',
                    border: '1px solid var(--pb)',
                    borderRadius: '2px',
                    color: 'var(--red)',
                    fontWeight: 'bold',
                    transition: 'background-color 0.15s, color 0.15s',
                    outline: 'none'
                  }}
                >
                  Unlearn
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-close-feat"
                  style={{
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '9px',
                    padding: '4px 22px',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '1px solid var(--pb)',
                    borderRadius: '2px',
                    color: 'var(--inkl)',
                    transition: 'background-color 0.15s, color 0.15s',
                    outline: 'none'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
