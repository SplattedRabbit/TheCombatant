import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { getSpellSchoolCode, getSchoolLabel, CombatSpells } from '@core/spells.js';
import { SpellSlotCalculator } from '@core/rules/SpellSlotCalculator.js';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';

const showCastSuccessDialog = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showCastSuccessDialog?.(...args);

function findSpell(pc: any, key: string) {
  if (CombatSpells.REGISTRY[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find((s: any) => s.id === key || s.nameDe === key);
    if (found) return found;
  }
  return null;
}

interface PrepareSpellDialogProps {
  pc: any;
  spellKey: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PrepareSpellDialog: React.FC<PrepareSpellDialogProps> = ({
  pc,
  spellKey,
  onConfirm,
  onCancel
}) => {
  const spell = findSpell(pc, spellKey);
  if (!spell) return null;

  const isWizard = pc.classes && pc.classes.some((c: any) => c.classType === 'wizard');
  const wizardSpecialization = pc.wizardSpecialization || 'none';
  const hasSpecSlot = isWizard && wizardSpecialization !== 'none';
  const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);

  const metamagicFeats = [
    { id: 'extend_spell', label: 'Extend Spell (+1 Level)', cost: 1, name: 'Extended' },
    { id: 'empower_spell', label: 'Empower Spell (+2 Levels)', cost: 2, name: 'Empowered' },
    { id: 'maximize_spell', label: 'Maximize Spell (+3 Levels)', cost: 3, name: 'Maximized' },
    { id: 'quicken_spell', label: 'Quicken Spell (+4 Levels)', cost: 4, name: 'Quickened' }
  ];

  const learnedFeats = metamagicFeats.filter((f) => pc.feats && pc.feats.some((feat: any) => feat.id === f.id));

  const [selectedMeta, setSelectedMeta] = useState<string[]>([]);
  const [specChecked, setSpecChecked] = useState<boolean>(false);

  const metaCost = selectedMeta.reduce((acc, featId) => {
    const feat = learnedFeats.find(f => f.id === featId);
    return acc + (feat ? feat.cost : 0);
  }, 0);

  const finalLevel = spell.level + metaCost;
  const isTooHigh = finalLevel > 9;

  const handleMetaToggle = (featId: string) => {
    setSelectedMeta(prev =>
      prev.includes(featId) ? prev.filter(id => id !== featId) : [...prev, featId]
    );
  };

  const handleConfirm = () => {
    if (isTooHigh) return;
    const isSpec = hasSpecSlot && specChecked;

    const performPrep = () => {
      pc.prepareSpell(spellKey, selectedMeta, isSpec);
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
      onConfirm();
    };

    const maxSlots = pc.spellSlots[finalLevel]?.max || 0;
    const currentPrepsCount = SpellSlotCalculator.countPreparedSpellsAtLevel(pc, finalLevel);

    if (maxSlots === 0) {
      showCustomConfirm("No Slots!", `You have no spell slots of level ${finalLevel}. Do you want to prepare "${spell.nameEn || spell.nameDe}" anyway?`, () => {
        performPrep();
      });
    } else if (currentPrepsCount >= maxSlots) {
      showCustomConfirm("All Slots Filled!", `You have already filled ${currentPrepsCount} out of ${maxSlots} slots of level ${finalLevel}. Do you want to prepare "${spell.nameEn || spell.nameDe}" anyway?`, () => {
        performPrep();
      });
    } else {
      performPrep();
    }
  };

  const isMatchingSchool = schoolCode === wizardSpecialization;

  return (
    <div
      id="prepareSpellOverlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 20px',
          width: '320px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: "'Crimson Text', serif",
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center' }}>
          Prepare Spell 📜
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 8px' }} />

        <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '2px', textAlign: 'center' }}>
          {spell.nameEn || spell.nameDe} <span style={{ fontSize: '8px', fontWeight: 'normal', color: 'var(--inkl)', fontStyle: 'italic' }}>({spell.school})</span>
        </div>
        <div style={{ fontSize: '8px', color: 'var(--inkl)', textAlign: 'center', marginBottom: '10px' }}>
          Base Level: Level {spell.level}
        </div>

        {learnedFeats.length === 0 ? (
          <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '8px', textAlign: 'left' }}>
            No Metamagic feats learned.
          </div>
        ) : (
          <div style={{ textAlign: 'left', marginBottom: '8px' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '3px' }}>Apply Metamagic:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {learnedFeats.map((feat) => (
                <label key={feat.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', cursor: 'pointer', color: 'var(--ink)' }}>
                  <input
                    type="checkbox"
                    checked={selectedMeta.includes(feat.id)}
                    onChange={() => handleMetaToggle(feat.id)}
                    style={{ cursor: 'pointer', margin: 0 }}
                  />
                  <span>{feat.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {hasSpecSlot && (
          <div style={{ textAlign: 'left', marginBottom: '10px', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)', paddingTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', cursor: isMatchingSchool ? 'pointer' : 'not-allowed', color: isMatchingSchool ? 'var(--ink)' : 'var(--inkl)' }}>
              <input
                type="checkbox"
                checked={specChecked}
                disabled={!isMatchingSchool}
                onChange={(e) => setSpecChecked(e.target.checked)}
                style={{ cursor: isMatchingSchool ? 'pointer' : 'not-allowed', margin: 0 }}
              />
              <span>Prepare in specialty slot ({getSchoolLabel(wizardSpecialization)})</span>
            </label>
            {!isMatchingSchool && (
              <div style={{ fontSize: '6.5px', color: 'var(--red)', fontStyle: 'italic', marginTop: '2px' }}>
                Spell does not belong to the specialization school.
              </div>
            )}
          </div>
        )}

        <div style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '2px', padding: '4px', textAlign: 'center', marginBottom: '12px', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
          Final Level: <span id="finalPrepLevelText">Level {finalLevel}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={handleConfirm}
            disabled={isTooHigh}
            className="btn btn-p prep-confirm-btn"
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '9px',
              padding: '3px 14px',
              cursor: isTooHigh ? 'not-allowed' : 'pointer',
              opacity: isTooHigh ? 0.5 : 1
            }}
          >
            Prepare
          </button>
          <button
            onClick={onCancel}
            className="btn prep-cancel-btn"
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '9px',
              padding: '3px 14px',
              cursor: 'pointer',
              borderColor: 'var(--pb)',
              background: 'transparent',
              color: 'var(--ink)'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


interface CastSpontaneousSpellDialogProps {
  pc: any;
  spellKey: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CastSpontaneousSpellDialog: React.FC<CastSpontaneousSpellDialogProps> = ({
  pc,
  spellKey,
  onConfirm,
  onCancel
}) => {
  const spell = findSpell(pc, spellKey);
  if (!spell) return null;

  const metamagicFeats = [
    { id: 'extend_spell', label: 'Extend Spell (+1 Level)', cost: 1, name: 'Extended' },
    { id: 'empower_spell', label: 'Empower Spell (+2 Levels)', cost: 2, name: 'Empowered' },
    { id: 'maximize_spell', label: 'Maximize Spell (+3 Levels)', cost: 3, name: 'Maximized' },
    { id: 'quicken_spell', label: 'Quicken Spell (+4 Levels) [Not usable]', cost: 4, name: 'Quickened', disabled: true }
  ];

  const learnedFeats = metamagicFeats.filter((f) => pc.feats && pc.feats.some((feat: any) => feat.id === f.id));

  const [selectedMeta, setSelectedMeta] = useState<string[]>([]);

  const metaCost = selectedMeta.reduce((acc, featId) => {
    const feat = learnedFeats.find(f => f.id === featId);
    return acc + (feat ? feat.cost : 0);
  }, 0);

  const finalLevel = spell.level + metaCost;
  const isTooHigh = finalLevel > 9;

  const handleMetaToggle = (featId: string) => {
    setSelectedMeta(prev =>
      prev.includes(featId) ? prev.filter(id => id !== featId) : [...prev, featId]
    );
  };

  const handleConfirmCast = () => {
    if (isTooHigh) return;

    const performCast = () => {
      pc.castSpontaneousSpell(spellKey, finalLevel);
      CombatState.saveToStorage();
      CombatState.syncPCToHost();

      const selectedMetaNames = selectedMeta
        .map(id => metamagicFeats.find(f => f.id === id)?.name)
        .filter(Boolean);

      const timeText = selectedMetaNames.length > 0 ? "1 full action (Spontaneous Metamagic)" : (spell.castingTime || '1 standard action');
      const metaSuffix = selectedMetaNames.length > 0 ? ` (${selectedMetaNames.join(', ')})` : '';

      if (spell.effects && spell.effects.length > 0) {
        showCastSuccessDialog(pc, spell, spellKey, selectedMeta, () => {
          onConfirm();
        });
      } else {
        showCustomAlert("Spell cast! ✨", `
          <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
            <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
              ${pc.name} casts ${spell.nameEn || spell.nameDe}${metaSuffix}!
            </div>
            • <strong>School:</strong> ${spell.school}<br>
            • <strong>Level:</strong> Level ${finalLevel} (Base ${spell.level})<br>
            • <strong>Casting Time:</strong> ${timeText}<br>
            • <strong>Range:</strong> ${spell.range || 'Touch'}<br>
            • <strong>Saving Throw:</strong> ${spell.savingThrow || 'None'}<br><br>
            <div style="font-size: 8px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px; border-radius: 2px; line-height: 1.25;">
              ${spell.description}
            </div>
          </div>
        `, "Done!", "");
        onConfirm();
      }
    };

    const maxSlots = pc.spellSlots[finalLevel]?.max || 0;
    const usedSlots = pc.spellSlots[finalLevel]?.used || 0;

    if (maxSlots === 0) {
      showCustomConfirm("No Slots!", `You have no spell slots of level ${finalLevel}. Do you want to cast "${spell.nameEn || spell.nameDe}" anyway?`, () => {
        performCast();
      });
    } else if (usedSlots >= maxSlots) {
      showCustomConfirm("No Free Slots!", `You have expended all spell slots of level ${finalLevel}. Do you want to cast "${spell.nameEn || spell.nameDe}" anyway?`, () => {
        performCast();
      });
    } else {
      performCast();
    }
  };

  const showWarning = selectedMeta.length > 0;

  return (
    <div
      id="castSpontaneousSpellOverlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 20px',
          width: '320px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: "'Crimson Text', serif",
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center' }}>
          Cast Spell ✨
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 8px' }} />

        <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '2px', textAlign: 'center' }}>
          {spell.nameEn || spell.nameDe} <span style={{ fontSize: '8px', fontWeight: 'normal', color: 'var(--inkl)', fontStyle: 'italic' }}>({spell.school})</span>
        </div>
        <div style={{ fontSize: '8px', color: 'var(--inkl)', textAlign: 'center', marginBottom: '10px' }}>
          Base Level: Level {spell.level}
        </div>

        {learnedFeats.length === 0 ? (
          <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '8px', textAlign: 'left' }}>
            No Metamagic feats learned.
          </div>
        ) : (
          <div style={{ textAlign: 'left', marginBottom: '8px' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '3px' }}>Apply Metamagic (increases casting time):</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {learnedFeats.map((feat) => {
                const isDisabled = feat.disabled;
                return (
                  <label key={feat.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', cursor: isDisabled ? 'not-allowed' : 'pointer', color: isDisabled ? 'var(--inkl)' : 'var(--ink)' }}>
                    <input
                      type="checkbox"
                      className="cast-meta-chk"
                      data-id={feat.id}
                      data-cost={feat.cost}
                      checked={selectedMeta.includes(feat.id)}
                      disabled={isDisabled}
                      onChange={() => handleMetaToggle(feat.id)}
                      style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', margin: 0 }}
                    />
                    <span>{feat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div
          id="spontaneousTimeWarning"
          style={{
            display: showWarning ? 'block' : 'none',
            fontSize: '7px',
            color: 'var(--red)',
            fontStyle: 'italic',
            marginBottom: '8px',
            textAlign: 'center',
            lineHeight: 1.2
          }}
        >
          ⚠️ Spontaneous Metamagic increases casting time to 1 full round action (or +1 round)!
        </div>

        <div style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '2px', padding: '4px', textAlign: 'center', marginBottom: '12px', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
          Required Level: <span id="finalCastLevelText">Level {finalLevel}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={handleConfirmCast}
            disabled={isTooHigh}
            className="btn btn-p cast-confirm-btn"
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '9px',
              padding: '3px 14px',
              cursor: isTooHigh ? 'not-allowed' : 'pointer',
              opacity: isTooHigh ? 0.5 : 1
            }}
          >
            Cast
          </button>
          <button
            onClick={onCancel}
            className="btn cast-cancel-btn"
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '9px',
              padding: '3px 14px',
              cursor: 'pointer',
              borderColor: 'var(--pb)',
              background: 'transparent',
              color: 'var(--ink)'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
