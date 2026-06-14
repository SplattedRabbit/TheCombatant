import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { uiRegistry } from '@core/ui/ui-shared.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { checkPrerequisites } from '../player/PCFeatsTab';
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';

interface FeatScrollDialogProps {
  feat: any;
  pc: any;
  isLearned: boolean;
  option?: string;
  onClose: () => void;
  onRefresh: () => void; // Used to re-render the dialog if instances change
}

export const FeatScrollDialog: React.FC<FeatScrollDialogProps> = ({
  feat,
  pc,
  isLearned,
  option = '',
  onClose,
  onRefresh
}) => {
  const nameEn = feat.nameEn ? ` (${feat.nameEn})` : '';
  const categoryDe =
    (
      { combat: 'Kampftalent', metamagic: 'Metamagie', item_creation: 'Gegenstandserschaffung', general: 'Allgemein' } as Record<string, string>
    )[feat.category] || 'Allgemein';

  // Evaluate prerequisites
  const { met, details: prereqsDetails } = checkPrerequisites(feat, pc);

  // Stackability & Options info
  const isStackable = feat.specialRaw && feat.specialRaw.toLowerCase().includes('multiple times');
  const learnedInstances = (pc.feats || []).filter((f: any) => f.id === feat.id);

  // Generate options list if option dropdown is needed
  let optionsList: string[] = [];
  if (feat.hasOption && (!isLearned || isStackable)) {
    if (feat.optionType === 'weapon') {
      optionsList = [
        'Langschwert',
        'Kurzschwert',
        'Dolch',
        'Zweihänder',
        'Kompositbogen',
        'Langbogen',
        'Waffenlos',
        'Kampfstab',
        'Kama',
        'Nunchaku',
        'Sai',
        'Shuriken',
        'Siangham',
        'Armbrust',
        'Hellebarde',
        'Morgenstern',
        'Streitaxt'
      ];
    } else if (feat.optionType === 'school') {
      optionsList = [
        'Abschwörung (Abjuration)',
        'Beschwörung (Conjuration)',
        'Erkenntnis (Divination)',
        'Hervorrufung (Evocation)',
        'Illusion (Illusion)',
        'Nekromantie (Necromancy)',
        'Transmutation (Transmutation)',
        'Verzauberung (Enchantment)'
      ];
    } else if (feat.optionType === 'skill') {
      optionsList = Object.keys(SKILLS_REGISTRY).map((key) => {
        const skill = SKILLS_REGISTRY[key];
        const englishName = key
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        if (skill.nameDe.includes(`(${englishName})`) || skill.nameDe.includes(englishName)) {
          return skill.nameDe;
        }
        return `${skill.nameDe} (${englishName})`;
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
      showCustomAlert('Voraussetzungen fehlen', result.error.replace(/\n/g, '<br>'), 'Verstanden', '🔒');
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
            {feat.nameDe}{nameEn}
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
            <div><strong>Kategorie:</strong> {categoryDe}</div>
            <div><strong>Erfüllt:</strong> {met ? '🟢 Ja' : '❌ Nein'}</div>
            <div style={{ gridColumn: 'span 2' }}>
              <strong>App-Mechanik:</strong>{' '}
              <span style={{ color: '#8b1a1a', fontWeight: 'bold' }}>
                {feat.appEffect || 'Keine automatische Werteänderung'}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '9.5px', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif", fontSize: '10px' }}>
              Voraussetzungen:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
              {prereqsDetails.length === 0 ? (
                <div style={{ color: '#2a6a2a', fontWeight: 'bold', fontSize: '9px' }}>Keine</div>
              ) : (
                prereqsDetails.map((pr: any, idx: number) => {
                  const color = pr.met ? '#2a6a2a' : '#8b1a1a';
                  const mark = pr.met ? '🟢' : '❌';
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
            <strong style={{ color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif" }}>Vorteil (RAW):</strong>
            <div style={{ fontStyle: 'italic', color: '#2a1b0a', paddingLeft: '4px' }}>{feat.benefitDe}</div>
          </div>

          {feat.normalRaw && (
            <div style={{ fontSize: '9px', marginBottom: '6px', lineHeight: 1.35, borderTop: '0.5px dotted rgba(139,26,26,0.2)', paddingTop: '4px' }}>
              <strong style={{ color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif" }}>Normal:</strong>
              <div style={{ color: '#4a3b2a', paddingLeft: '4px' }}>{feat.normalRaw}</div>
            </div>
          )}

          {feat.specialRaw && (
            <div style={{ fontSize: '9px', marginBottom: '4px', lineHeight: 1.35, borderTop: '0.5px dotted rgba(139,26,26,0.2)', paddingTop: '4px' }}>
              <strong style={{ color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif" }}>Spezial:</strong>
              <div style={{ color: '#4a3b2a', paddingLeft: '4px' }}>{feat.specialRaw}</div>
            </div>
          )}

          {feat.hasOption && (!isLearned || isStackable) && (
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px', fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold' }}>
              <label htmlFor="featOptionSelect" style={{ color: '#5a3a1a' }}>Spezifische Auswahl für dieses Talent:</label>
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
                    -- Alle Optionen bereits erlernt --
                  </option>
                )}
              </select>
            </div>
          )}

          {learnedInstances.length > 0 && (
            <div style={{ marginTop: '6px', fontFamily: "'Crimson Text', serif", fontSize: '9.5px', borderTop: '0.5px dashed rgba(139,26,26,0.3)', paddingTop: '6px' }}>
              <div style={{ fontWeight: 'bold', color: '#5a3a1a', marginBottom: '2px' }}>Bereits erlernte Instanzen:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {learnedInstances.map((inst: any, idx: number) => {
                  const optText = inst.option ? `(${inst.option})` : '';
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '2px', padding: '2px 4px', fontSize: '8.5px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>
                        {feat.nameDe} {optText}
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
                        ✕ Entfernen
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div style={{ marginTop: '2px' }}>
          {!isLearned || isStackable ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
              <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif", letterSpacing: '0.3px' }}>
                {isLearnBlocked ? '🔒 Voraussetzungen nicht erfüllt!' : 'Möchtest du dieses Talent erlernen?'}
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
                  Lernen
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
                  Schließen
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
              <div style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif", letterSpacing: '0.3px' }}>
                Möchtest du dieses Talent wieder VERNICHTEN/VERLERNEN?
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
                  Verlernen
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
                  Schließen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
