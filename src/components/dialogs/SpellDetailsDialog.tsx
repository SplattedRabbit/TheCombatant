/**
 * @module    SpellDetailsDialog
 * @summary   React-Dialog für Zauber-Details: Toggle Lernen/Vergessen mit Bannschulen- und Zauberlimit-Check.
 * @exports   SpellDetailsDialog
 * @reads     spell, pc.learnedSpells, pc.classes, pc.wizardProhibited1/2
 * @stateOps  CombatState.saveToStorage, CombatState.syncPCToHost
 * @depends   React, @core/state.js, @core/spells.js, @core/rules.js
 * @notHere   Spell-Creator → SpellCreatorDialog.tsx | Bannschulen-Logik → SpellRules.js
 */
import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { getSpellSchoolCode, getSchoolCodeFromInput, getSchoolLabel } from '@core/spells.js';
// @ts-ignore
import { CombatRules } from '@core/rules.js';
// @ts-ignore
import { findSpell } from '../player/PCSpellbookTab';

const showCustomAlert = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showCustomAlert?.(...args);

interface SpellDetailsDialogProps {
  spell: any;
  spellKey: string;
  pc: any;
  onClose: () => void;
}

export const SpellDetailsDialog: React.FC<SpellDetailsDialogProps> = ({ spell, spellKey, pc, onClose }) => {
  const isLearned = Array.isArray(pc.learnedSpells) && pc.learnedSpells.includes(spellKey);

  const handleToggleLearn = () => {
    const activePC = CombatState.getActivePC();
    if (!activePC) return;
    if (!Array.isArray(activePC.learnedSpells)) activePC.learnedSpells = [];

    const idx = activePC.learnedSpells.indexOf(spellKey);
    if (idx > -1) {
      activePC.learnedSpells.splice(idx, 1);
    } else {
      if (spell) {
        const isWizard = activePC.classes?.some((c: any) => c.classType === 'wizard');
        if (isWizard) {
          const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
          if (schoolCode && schoolCode !== 'univ') {
            const prob1 = getSchoolCodeFromInput(activePC.wizardProhibited1);
            const prob2 = getSchoolCodeFromInput(activePC.wizardProhibited2);
            if (schoolCode === prob1 || schoolCode === prob2) {
              showCustomAlert(
                'Bannschule',
                `Du kannst den Zauber "${spell.nameDe}" nicht lernen, da er zur Bannschule "${getSchoolLabel(schoolCode)}" gehört!`
              );
              return;
            }
          }
        }
        const check = CombatRules.checkSpellKnownLimit(activePC, spell, (k: string) => findSpell(activePC, k));
        if (!check.success) {
          showCustomAlert('Zauberlimit überschritten', check.error || 'Du kannst keine weiteren bekannten Zauber dieses Grades lernen.');
          return;
        }
      }
      activePC.learnedSpells.push(spellKey);
    }
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
    onClose();
  };

  if (!spell) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div className="custom-alert-box" style={{ padding: '16px', minWidth: '300px' }}>
          <p>Zauber nicht gefunden.</p>
          <button className="xbtn" onClick={onClose}>Schließen</button>
        </div>
      </div>
    );
  }

  const classLevelsText = Array.isArray(spell.classLevels)
    ? spell.classLevels.map((cl: any) => `${cl.class} ${cl.level}`).join(', ')
    : '';

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="custom-alert-box"
        style={{ maxWidth: '520px', width: '90%', maxHeight: '80vh', overflowY: 'auto', padding: '18px 20px' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 4px', fontFamily: "'Cinzel', serif", fontSize: '14px' }}>
          {spell.nameDe || spell.nameEn}
        </h3>
        {spell.nameEn && spell.nameDe && (
          <p style={{ margin: '0 0 8px', fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic' }}>{spell.nameEn}</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '9px', marginBottom: '10px' }}>
          {spell.school && <span><strong>Schule:</strong> {spell.school}</span>}
          {classLevelsText && <span><strong>Grad:</strong> {classLevelsText}</span>}
          {spell.castingTime && <span><strong>Zeitaufwand:</strong> {spell.castingTime}</span>}
          {spell.range && <span><strong>Reichweite:</strong> {spell.range}</span>}
          {spell.duration && <span><strong>Dauer:</strong> {spell.duration}</span>}
          {spell.savingThrow && <span><strong>Rettungswurf:</strong> {spell.savingThrow}</span>}
          {spell.spellResistance && <span><strong>Zauberresistenz:</strong> {spell.spellResistance}</span>}
        </div>

        {spell.description && (
          <p style={{ fontSize: '9px', lineHeight: 1.5, color: 'var(--ink)', margin: '0 0 14px' }}>
            {spell.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="xbtn" onClick={handleToggleLearn} style={{ minWidth: '90px' }}>
            {isLearned ? '✗ Vergessen' : '✓ Lernen'}
          </button>
          <button className="xbtn" onClick={onClose}>Schließen</button>
        </div>
      </div>
    </div>
  );
};
