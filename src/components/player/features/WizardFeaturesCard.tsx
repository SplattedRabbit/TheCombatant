import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { getSchoolCodeFromInput } from '@core/spells.js';
// @ts-ignore
import { cleanProhibitedSpells } from '@core/rules/SpellRules.js';

const showCustomAlert = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showCustomAlert?.(...args);

interface WizardFeaturesCardProps {
  pc: any;
  level: number;
}

const PROHIBITED_SCHOOLS = [
  { value: 'abj', label: 'Schutz' },
  { value: 'con', label: 'Beschwörung' },
  { value: 'enc', label: 'Verzauberung' },
  { value: 'evo', label: 'Hervorrufung' },
  { value: 'ill', label: 'Illusion' },
  { value: 'nec', label: 'Nekro' },
  { value: 'tra', label: 'Verwandlung' }
];

export const WizardFeaturesCard: React.FC<WizardFeaturesCardProps> = ({ pc, level }) => {
  const [wizardRulesOpen, setWizardRulesOpen] = useState(false);

  const spec = pc.wizardSpecialization || 'none';
  const prob1Code = getSchoolCodeFromInput(pc.wizardProhibited1) || '';
  const prob2Code = getSchoolCodeFromInput(pc.wizardProhibited2) || '';
  const availableSchools = PROHIBITED_SCHOOLS.filter(s => s.value !== spec);

  const handleSpecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const activePC = CombatState.getActivePC();
    activePC.wizardSpecialization = val;
    if (val === 'none') {
      activePC.wizardProhibited1 = '';
      activePC.wizardProhibited2 = '';
    } else if (val === 'div') {
      activePC.wizardProhibited2 = '';
    }
    const removed = cleanProhibitedSpells(activePC);
    if (removed.length > 0) {
      setTimeout(() => showCustomAlert(
        'Bannschulen-Bereinigung ⚠️',
        `Die folgenden Zauber wurden aus deinem Zauberbuch entfernt:\n\n• ${removed.join('\n• ')}`
      ), 100);
    }
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  const handleProhibited1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const activePC = CombatState.getActivePC();
    activePC.wizardProhibited1 = val;
    const removed = cleanProhibitedSpells(activePC);
    if (removed.length > 0) {
      setTimeout(() => showCustomAlert(
        'Bannschulen-Bereinigung ⚠️',
        `Die folgenden Zauber wurden aus deinem Zauberbuch entfernt:\n\n• ${removed.join('\n• ')}`
      ), 100);
    }
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  const handleProhibited2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const activePC = CombatState.getActivePC();
    activePC.wizardProhibited2 = val;
    const removed = cleanProhibitedSpells(activePC);
    if (removed.length > 0) {
      setTimeout(() => showCustomAlert(
        'Bannschulen-Bereinigung ⚠️',
        `Die folgenden Zauber wurden aus deinem Zauberbuch entfernt:\n\n• ${removed.join('\n• ')}`
      ), 100);
    }
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 Magier (Stufe {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
          <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)', fontWeight: 'bold' }}>
            Klassenfähigkeiten
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', marginTop: '1px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span><strong>Schule:</strong></span>
              <button 
                onClick={() => setWizardRulesOpen(!wizardRulesOpen)}
                className="btn btn-toggle-rules-wizard" 
                style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', lineIndex: 1, display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                title="Regeln einblenden"
              >
                📖 {wizardRulesOpen ? '▲' : '▼'}
              </button>
            </div>
            <select 
              value={spec}
              onChange={handleSpecChange}
              className="cinput wizard-spec" 
              style={{ width: '95px', fontSize: '7.5px', height: '14px', padding: '0 1px', borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none' }}
            >
              <option value="none">Allgemein</option>
              <option value="abj">Schutz</option>
              <option value="con">Beschwörung</option>
              <option value="div">Erkenntnis</option>
              <option value="enc">Verzauberung</option>
              <option value="evo">Hervorrufung</option>
              <option value="ill">Illusion</option>
              <option value="nec">Nekro</option>
              <option value="tra">Verwandlung</option>
            </select>
          </div>
          
          {wizardRulesOpen && (
            <div className="wizard-rules-box" style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '3px', fontFamily: "'Crimson Text', serif", marginBottom: '2px' }}>
              <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>Magier-Schul-Spezialisierung (D&D 3.5 RAW):</strong><br />
              • <strong>Zusatz-Zauberslots:</strong> +1 Zauberslot pro Zaubergrad am Tag (nur Spezialschule).<br />
              • <strong>Zauberkunde:</strong> +2 Bonus auf Proben zum Erlernen von Zaubern der Spezialschule.<br />
              • <strong>Bannschulen:</strong> Spezialisten (außer Erkenntnis) müssen 2 Schulen bannen. Erkenntnismagier bannen 1 Schule. Gebannte Zauber sind gänzlich unbenutzbar.
            </div>
          )}
          
          {spec !== 'none' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px' }}>
                <span>Bann 1:</span>
                <select 
                  value={prob1Code}
                  onChange={handleProhibited1Change}
                  className="cinput wizard-prob1" 
                  style={{ width: '95px', fontSize: '7.5px', height: '14px', padding: '0 1px', borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none' }}
                >
                  <option value="">-- Wählen --</option>
                  {availableSchools.map(s => {
                    const disabled = prob2Code && s.value === prob2Code;
                    return <option key={s.value} value={s.value} disabled={disabled}>{s.label}</option>;
                  })}
                </select>
              </div>
              {spec !== 'div' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px' }}>
                  <span>Bann 2:</span>
                  <select 
                    value={prob2Code}
                    onChange={handleProhibited2Change}
                    className="cinput wizard-prob2" 
                    style={{ width: '95px', fontSize: '7.5px', height: '14px', padding: '0 1px', borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none' }}
                  >
                    <option value="">-- Wählen --</option>
                    {availableSchools.map(s => {
                      const disabled = prob1Code && s.value === prob1Code;
                      return <option key={s.value} value={s.value} disabled={disabled}>{s.label}</option>;
                    })}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
