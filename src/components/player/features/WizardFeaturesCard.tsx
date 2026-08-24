import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { getSchoolCodeFromInput } from '@core/spells.js';
// @ts-ignore
import { cleanProhibitedSpells } from '@core/rules/SpellRules.js';
// @ts-ignore
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { ClassACFSelector } from './ClassACFSelector';

interface WizardFeaturesCardProps {
  pc: any;
  level: number;
}

const PROHIBITED_SCHOOLS = [
  { value: 'abj', label: 'Abjuration' },
  { value: 'con', label: 'Conjuration' },
  { value: 'enc', label: 'Enchantment' },
  { value: 'evo', label: 'Evocation' },
  { value: 'ill', label: 'Illusion' },
  { value: 'nec', label: 'Necromancy' },
  { value: 'tra', label: 'Transmutation' }
];

export const WizardFeaturesCard: React.FC<WizardFeaturesCardProps> = ({ pc, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [wizardRulesOpen, setWizardRulesOpen] = useState(false);

  const spec = pc.wizardSpecialization || 'none';
  const prob1Code = getSchoolCodeFromInput(pc.wizardProhibited1) || '';
  const prob2Code = getSchoolCodeFromInput(pc.wizardProhibited2) || '';
  const availableSchools = PROHIBITED_SCHOOLS.filter(s => s.value !== spec);

  const handleSpecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    CombatState.updatePCWizardSpecialization(val);
    const activePC = CombatState.getActivePC();
    const removed = cleanProhibitedSpells(activePC);
    if (removed.length > 0) {
      setTimeout(() => showCustomAlert(
        'Prohibited School Cleanup ⚠️',
        `The following spells were removed from your spellbook:\n\n• ${removed.join('\n• ')}`
      ), 100);
    }
  };

  const handleProhibited1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    CombatState.updatePCWizardProhibited1(val);
    const activePC = CombatState.getActivePC();
    const removed = cleanProhibitedSpells(activePC);
    if (removed.length > 0) {
      setTimeout(() => showCustomAlert(
        'Prohibited School Cleanup ⚠️',
        `The following spells were removed from your spellbook:\n\n• ${removed.join('\n• ')}`
      ), 100);
    }
  };

  const handleProhibited2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    CombatState.updatePCWizardProhibited2(val);
    const activePC = CombatState.getActivePC();
    const removed = cleanProhibitedSpells(activePC);
    if (removed.length > 0) {
      setTimeout(() => showCustomAlert(
        'Prohibited School Cleanup ⚠️',
        `The following spells were removed from your spellbook:\n\n• ${removed.join('\n• ')}`
      ), 100);
    }
  };

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>🎭 Wizard (Level {level})</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
              <span>Class Features</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setWizardRulesOpen(!wizardRulesOpen); }}
                className="btn btn-toggle-rules-wizard" 
                style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} 
                title="Show rules"
              >
                📖 {wizardRulesOpen ? '▲' : '▼'}
              </button>
            </div>
            {wizardRulesOpen && (
              <div className="wizard-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif" }}>
                <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Wizard Class Features:</strong><br />
                • <strong>Arcane Spells:</strong> Casts arcane spells from a spellbook based on Intelligence.<br />
                • <strong>Familiar:</strong> Can summon a magical familiar to gain attribute bonuses and abilities.<br />
                • <strong>School Specialization:</strong> May specialize in one magic school to gain +1 spell slot per spell level for specialized spells (requires prohibiting 2 opposing schools, or 1 for Divination).
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8.5px', marginTop: '2px' }}>
              <span><strong>School Specialization:</strong></span>
              <select 
                value={spec}
                onChange={handleSpecChange}
                className="cinput wizard-spec" 
                style={{ width: '100px', fontSize: '8px', height: '16px', padding: '0 2px', borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none' }}
              >
                <option value="none">Universal (No School)</option>
                <option value="abj">Abjuration</option>
                <option value="con">Conjuration</option>
                <option value="div">Divination (1 Prohibited School)</option>
                <option value="enc">Enchantment</option>
                <option value="evo">Evocation</option>
                <option value="ill">Illusion</option>
                <option value="nec">Necromancy</option>
                <option value="tra">Transmutation</option>
              </select>
            </div>

            {spec !== 'none' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px', background: 'rgba(200,169,110,0.06)', border: '0.5px solid rgba(200,169,110,0.2)', borderRadius: '2px', padding: '3px 5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px' }}>
                  <span>Prohibited 1:</span>
                  <select 
                    value={prob1Code}
                    onChange={handleProhibited1Change}
                    className="cinput wizard-prob1" 
                    style={{ width: '95px', fontSize: '7.5px', height: '14px', padding: '0 1px', borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none' }}
                  >
                    <option value="">-- Select --</option>
                    {availableSchools.map(s => {
                      const disabled = prob2Code && s.value === prob2Code;
                      return <option key={s.value} value={s.value} disabled={disabled}>{s.label}</option>;
                    })}
                  </select>
                </div>
                {spec !== 'div' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px' }}>
                    <span>Prohibited 2:</span>
                    <select 
                      value={prob2Code}
                      onChange={handleProhibited2Change}
                      className="cinput wizard-prob2" 
                      style={{ width: '95px', fontSize: '7.5px', height: '14px', padding: '0 1px', borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none' }}
                    >
                      <option value="">-- Select --</option>
                      {availableSchools.map(s => {
                        const disabled = prob1Code && s.value === prob1Code;
                        return <option key={s.value} value={s.value} disabled={disabled}>{s.label}</option>;
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}

            <ClassACFSelector pc={pc} classKey="wizard" level={level} />
          </div>
        </div>
      )}
    </div>
  );
};
