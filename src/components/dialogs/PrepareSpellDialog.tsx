import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { getSpellSchoolCode, getSchoolLabel, CombatSpells } from '@core/spells.js';
import { SpellSlotCalculator } from '@core/rules/SpellSlotCalculator.js';
import { getDomain, getPCDomains } from '@core/rules.js';

import { showCustomConfirm } from '@core/ui/components/dialogs.js';

function findSpell(pc: any, key: string) {
  if (CombatSpells.REGISTRY[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find((s: any) => s.id === key || s.nameDe === key || s.nameEn === key);
    if (found) return found;
  }
  return null;
}

interface PrepareSpellDialogProps {
  pc: any;
  spellKey?: string;
  defaultLevel?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PrepareSpellDialog: React.FC<PrepareSpellDialogProps> = ({
  pc,
  spellKey: initialSpellKey,
  defaultLevel,
  onConfirm,
  onCancel
}) => {
  const [selectedMeta, setSelectedMeta] = useState<string[]>([]);
  const [specChecked, setSpecChecked] = useState<boolean>(false);

  // Compute available spells if defaultLevel is provided
  const availableSpells = React.useMemo(() => {
    const learnedSet = new Set<string>(Array.isArray(pc.learnedSpells) ? pc.learnedSpells : []);
    const isCleric = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'cleric');
    if (isCleric) {
      const domains = getPCDomains(pc);
      domains.forEach((domId: string) => {
        const domain = getDomain(domId);
        if (domain && domain.spells) {
          Object.values(domain.spells).forEach((sKey: any) => learnedSet.add(sKey as string));
        }
      });
    }

    const spellsList = Array.from(learnedSet)
      .map((k: string) => {
        const s = findSpell(pc, k);
        return s ? { ...s, spellKey: k } : null;
      })
      .filter((s: any): s is NonNullable<typeof s> => s !== null);

    spellsList.sort((a: any, b: any) => {
      const lvlA = SpellSlotCalculator.getAdjustedSpellLevel(a, [], pc);
      const lvlB = SpellSlotCalculator.getAdjustedSpellLevel(b, [], pc);
      if (lvlA !== lvlB) return lvlA - lvlB;
      const nameA = a.name || a.nameEn || '';
      const nameB = b.name || b.nameEn || '';
      return nameA.localeCompare(nameB);
    });

    if (defaultLevel !== undefined) {
      const matching = spellsList.filter((s: any) => {
        const lvl = SpellSlotCalculator.getAdjustedSpellLevel(s, [], pc);
        return lvl <= defaultLevel;
      });
      if (matching.length > 0) return matching;
    }
    return spellsList;
  }, [pc, defaultLevel]);

  const [selectedSpellKey, setSelectedSpellKey] = useState<string>(() => {
    if (initialSpellKey) return initialSpellKey;
    if (availableSpells.length > 0) {
      return availableSpells[0].spellKey || availableSpells[0].id || '';
    }
    return '';
  });

  const spell = findSpell(pc, selectedSpellKey);
  if (!spell) return null;

  const isWizard = pc.classes && pc.classes.some((c: any) => c.classType === 'wizard');
  const wizardSpecialization = pc.wizardSpecialization || 'none';
  const hasSpecSlot = isWizard && wizardSpecialization !== 'none';
  const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.name || spell.nameEn);

  const metamagicFeats = [
    { id: 'extend_spell', label: 'Extend Spell (+1 Level)', cost: 1, name: 'Extended' },
    { id: 'empower_spell', label: 'Empower Spell (+2 Levels)', cost: 2, name: 'Empowered' },
    { id: 'maximize_spell', label: 'Maximize Spell (+3 Levels)', cost: 3, name: 'Maximized' },
    { id: 'quicken_spell', label: 'Quicken Spell (+4 Levels)', cost: 4, name: 'Quickened' }
  ];

  const learnedFeats = metamagicFeats.filter((f) => pc.feats && pc.feats.some((feat: any) => feat.id === f.id));
  const metaCost = selectedMeta.reduce((acc, featId) => {
    const feat = learnedFeats.find(f => f.id === featId);
    return acc + (feat ? feat.cost : 0);
  }, 0);

  const baseLevel = SpellSlotCalculator.getAdjustedSpellLevel(spell, [], pc);
  const finalLevel = baseLevel + metaCost;
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
      CombatState.updatePCBatch((freshPc: any) => {
        if (!Array.isArray(freshPc.preparedSpells)) {
          freshPc.preparedSpells = [];
        }
        freshPc.preparedSpells.push({
          id: `prep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          spellKey: selectedSpellKey,
          preparedLevel: finalLevel,
          metamagic: selectedMeta,
          isSpecialist: isSpec,
          isSpecialistSlot: isSpec,
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
          {defaultLevel !== undefined && availableSpells.length > 0 ? (
            <select
              value={selectedSpellKey}
              onChange={(e) => setSelectedSpellKey(e.target.value)}
              style={{
                fontSize: '9.5px',
                padding: '2px 4px',
                borderRadius: '3px',
                border: '1px solid var(--pb)',
                background: 'rgba(255, 255, 255, 0.9)',
                color: 'var(--ink)',
                maxWidth: '260px',
                cursor: 'pointer'
              }}
            >
              {availableSpells.map((s: any) => {
                const sLvl = SpellSlotCalculator.getAdjustedSpellLevel(s, [], pc);
                return (
                  <option key={s.id || s.spellKey} value={s.id || s.spellKey}>
                    {s.name || s.nameEn} (Lvl {sLvl} - {s.school})
                  </option>
                );
              })}
            </select>
          ) : (
            <>{spell.name || spell.nameEn} <span style={{ fontSize: '8px', fontWeight: 'normal', color: 'var(--inkl)', fontStyle: 'italic' }}>({spell.school})</span></>
          )}
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

