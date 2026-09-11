import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { getSpellSchoolCode, getSchoolLabel, CombatSpells } from '@core/spells.js';
import { SpellSlotCalculator } from '@core/rules/SpellSlotCalculator.js';
import { getDomain } from '@core/rules.js';
import { showCustomConfirm } from '@core/ui/components/dialogs.js';

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
  const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.name || spell.nameEn);

  const isCleric = pc.classes && pc.classes.some((c: any) => c.classType === 'cleric');
  const hasClericDomains = isCleric && Array.isArray(pc.clericDomains) && pc.clericDomains.length > 0;

  const metamagicFeats = [
    { id: 'extend_spell', label: 'Extend Spell (+1 Level)', cost: 1, name: 'Extended' },
    { id: 'empower_spell', label: 'Empower Spell (+2 Levels)', cost: 2, name: 'Empowered' },
    { id: 'maximize_spell', label: 'Maximize Spell (+3 Levels)', cost: 3, name: 'Maximized' },
    { id: 'quicken_spell', label: 'Quicken Spell (+4 Levels)', cost: 4, name: 'Quickened' }
  ];

  const learnedFeats = metamagicFeats.filter((f) => pc.feats && pc.feats.some((feat: any) => feat.id === f.id));

  const [selectedMeta, setSelectedMeta] = useState<string[]>([]);
  const [specChecked, setSpecChecked] = useState<boolean>(false);
  const [domainChecked, setDomainChecked] = useState<boolean>(false);

  const metaCost = selectedMeta.reduce((acc, featId) => {
    const feat = learnedFeats.find(f => f.id === featId);
    return acc + (feat ? feat.cost : 0);
  }, 0);

  let baseLevel = spell.level;
  if (baseLevel === undefined && Array.isArray(spell.classLevels)) {
    const pcClassTypes = Array.isArray(pc.classes) ? pc.classes.map((c: any) => c.classType) : [];
    const match = spell.classLevels.find((cl: any) => pcClassTypes.includes(cl.class));
    if (match) {
      baseLevel = match.level;
    } else if (spell.classLevels.length > 0) {
      baseLevel = spell.classLevels[0].level;
    }
  }
  if (baseLevel === undefined) baseLevel = 0;

  const finalLevel = baseLevel + metaCost;
  const isTooHigh = finalLevel > 9;

  // Domain slot checks
  const matchingDomain = hasClericDomains && finalLevel >= 1 ? (pc.clericDomains as string[]).find((domId: string) => {
    const dom = getDomain(domId);
    return dom?.spells && dom.spells[finalLevel] === spellKey;
  }) : null;
  const domainObj = matchingDomain ? getDomain(matchingDomain) : null;
  const isDomainCandidate = !!matchingDomain;
  const domainPrepsCount = SpellSlotCalculator.countPreparedDomainSpellsAtLevel(pc, finalLevel);
  const isDomainSlotFull = domainPrepsCount >= 1;

  const handleMetaToggle = (featId: string) => {
    setSelectedMeta(prev =>
      prev.includes(featId) ? prev.filter(id => id !== featId) : [...prev, featId]
    );
  };

  const handleConfirm = () => {
    if (isTooHigh) return;
    const isSpec = hasSpecSlot && specChecked;
    const isDomain = isDomainCandidate && domainChecked;

    const performPrep = () => {
      CombatState.updatePCBatch((freshPc: any) => {
        if (!Array.isArray(freshPc.preparedSpells)) {
          freshPc.preparedSpells = [];
        }
        freshPc.preparedSpells.push({
          id: `prep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          spellKey: spellKey,
          preparedLevel: finalLevel,
          metamagic: selectedMeta,
          isSpecialist: isSpec,
          isDomain: isDomain,
          isSpecialistSlot: isSpec,
          isDomainSlot: isDomain,
          isUsed: false
        });
      });
      onConfirm();
    };

    const maxSlots = pc.spellSlots?.[finalLevel]?.max || 0;
    const currentPrepsCount = SpellSlotCalculator.countPreparedSpellsAtLevel(pc, finalLevel);

    if (maxSlots === 0) {
      showCustomConfirm("No Slots!", `You have no spell slots of level ${finalLevel}. Do you want to prepare "${spell.name || spell.nameEn}" anyway?`, () => {
        performPrep();
      });
    } else if (currentPrepsCount >= maxSlots) {
      showCustomConfirm("All Slots Filled!", `You have already filled ${currentPrepsCount} out of ${maxSlots} slots of level ${finalLevel}. Do you want to prepare "${spell.name || spell.nameEn}" anyway?`, () => {
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
          fontFamily: 'var(--font-body)',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontFamily: 'var(--font-title)', fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center' }}>
          Prepare Spell 📜
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 8px' }} />

        <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '2px', textAlign: 'center' }}>
          {spell.name || spell.nameEn} <span style={{ fontSize: '8px', fontWeight: 'normal', color: 'var(--inkl)', fontStyle: 'italic' }}>({spell.school})</span>
        </div>
        <div style={{ fontSize: '8px', color: 'var(--inkl)', textAlign: 'center', marginBottom: '10px' }}>
          Base Level: Level {baseLevel}
        </div>

        {learnedFeats.length === 0 ? (
          <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '8px', textAlign: 'left' }}>
            No Metamagic feats learned.
          </div>
        ) : (
          <div style={{ textAlign: 'left', marginBottom: '8px' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '8px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '3px' }}>Apply Metamagic:</div>
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

        {hasClericDomains && finalLevel >= 1 && (
          <div style={{ textAlign: 'left', marginBottom: '10px', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)', paddingTop: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8px', cursor: (isDomainCandidate && !isDomainSlotFull) ? 'pointer' : 'not-allowed', color: (isDomainCandidate && !isDomainSlotFull) ? 'var(--ink)' : 'var(--inkl)' }}>
              <input
                type="checkbox"
                checked={domainChecked}
                disabled={!isDomainCandidate || isDomainSlotFull}
                onChange={(e) => setDomainChecked(e.target.checked)}
                style={{ cursor: (isDomainCandidate && !isDomainSlotFull) ? 'pointer' : 'not-allowed', margin: 0 }}
              />
              <span>Prepare in Domain Slot {isDomainCandidate ? `(${domainObj?.name || 'Domain'} ${finalLevel})` : ''}</span>
            </label>
            {!isDomainCandidate && (
              <div style={{ fontSize: '6.5px', color: 'var(--inkm)', fontStyle: 'italic', marginTop: '2px' }}>
                Not a domain spell of your chosen domains at level {finalLevel}.
              </div>
            )}
            {isDomainCandidate && isDomainSlotFull && (
              <div style={{ fontSize: '6.5px', color: 'var(--red)', fontStyle: 'italic', marginTop: '2px' }}>
                Domain slot for level {finalLevel} is already filled (1/1).
              </div>
            )}
            {isDomainCandidate && !isDomainSlotFull && (
              <div style={{ fontSize: '6.5px', color: 'var(--green, #2e7d32)', fontStyle: 'italic', marginTop: '2px' }}>
                ✓ 1 Domain slot available for {domainObj?.name} domain.
              </div>
            )}
          </div>
        )}

        <div style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '2px', padding: '4px', textAlign: 'center', marginBottom: '12px', fontFamily: 'var(--font-title)', fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
          Final Level: <span id="finalPrepLevelText">Level {finalLevel}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={handleConfirm}
            disabled={isTooHigh}
            className="btn btn-p prep-confirm-btn"
            style={{
              fontFamily: 'var(--font-title)',
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
              fontFamily: 'var(--font-title)',
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


export { CastSpontaneousSpellDialog } from './CastSpontaneousSpellDialog';
export type { CastSpontaneousSpellDialogProps } from './CastSpontaneousSpellDialog';

