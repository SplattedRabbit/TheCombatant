import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { CombatRules } from '@core/rules.js';
import { CombatSpells } from '@core/spells.js';

function findSpell(pc: any, key: string) {
  if (CombatSpells.REGISTRY?.[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find((s: any) => s.id === key || s.nameDe === key || s.nameEn === key);
    if (found) return found;
  }
  return null;
}

const showCustomAlert = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showCustomAlert?.(...args);

interface SpellCreatorDialogProps {
  pc: any;
  onClose: () => void;
}

export const SpellCreatorDialog: React.FC<SpellCreatorDialogProps> = ({ pc: _pc, onClose }) => {
  const [nameDe, setNameDe] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [level, setLevel] = useState(1);
  const [school, setSchool] = useState('');
  const [castingTime, setCastingTime] = useState('1 standard action');
  const [range, setRange] = useState('Touch');
  const [duration, setDuration] = useState('Instantaneous');
  const [savingThrow, setSavingThrow] = useState('None');
  const [spellResistance, setSpellResistance] = useState('No');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!nameEn.trim() || !school.trim() || !description.trim()) {
      showCustomAlert('Error', 'Please fill in all required fields (*)!');
      return;
    }

    const activePC = CombatState.getActivePC();
    if (!activePC) return;

    const classLevels: { class: string; level: number }[] = [];
    if (Array.isArray(activePC.classes)) {
      activePC.classes.forEach((c: any) => {
        if (['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType)) {
          classLevels.push({ class: c.classType, level });
        }
      });
    }

    const newSpell = {
      id: 'custom_' + Date.now(),
      nameDe: nameDe.trim() || nameEn.trim(),
      nameEn: nameEn.trim(),
      level,
      school: school.trim(),
      castingTime,
      range,
      duration,
      savingThrow,
      spellResistance,
      description: description.trim(),
      classLevels,
    };

    const check = CombatRules.checkSpellKnownLimit(activePC, newSpell, (k: string) => findSpell(activePC, k));
    if (!check.success) {
      showCustomAlert('Spell Limit Exceeded', check.error || 'You cannot learn any more known spells of this level.');
      return;
    }

    CombatState.updatePCBatch((freshPc: any) => {
      if (!Array.isArray(freshPc.customSpells)) freshPc.customSpells = [];
      freshPc.customSpells.push(newSpell);

      if (!Array.isArray(freshPc.learnedSpells)) freshPc.learnedSpells = [];
      if (!freshPc.learnedSpells.includes(newSpell.id)) {
        freshPc.learnedSpells.push(newSpell.id);
      }
    });

    showCustomAlert('Success!', `"${nameEn || nameDe}" was successfully created and added to your spellbook!`);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    height: '22px', fontSize: '10px', width: '100%', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '9px', fontWeight: 'bold', color: 'var(--inkl)', display: 'block', marginBottom: '2px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '18px 20px',
          maxWidth: '520px',
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: "'Crimson Text', serif",
          position: 'relative',
          boxSizing: 'border-box'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '14px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center' }}>
          ✦ Custom Spell Creator ✦
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 12px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>Spell Name *</label>
              <input className="cinput" style={inputStyle} placeholder="e.g. Fireball"
                value={nameEn} onChange={e => setNameEn(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Alternate Name (Optional)</label>
              <input className="cinput" style={inputStyle} placeholder="e.g. Feuerball"
                value={nameDe} onChange={e => setNameDe(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>Spell Level (0–9) *</label>
              <input className="cinput" type="number" style={{ ...inputStyle, textAlign: 'center' }}
                min={0} max={9} value={level} onChange={e => setLevel(parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>School *</label>
              <input className="cinput" style={inputStyle} placeholder="e.g. Evocation"
                value={school} onChange={e => setSchool(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>Casting Time</label>
              <input className="cinput" style={inputStyle} placeholder="1 standard action"
                value={castingTime} onChange={e => setCastingTime(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Range</label>
              <input className="cinput" style={inputStyle} placeholder="Touch"
                value={range} onChange={e => setRange(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>Duration</label>
              <input className="cinput" style={inputStyle} placeholder="Instantaneous"
                value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Saving Throw</label>
              <input className="cinput" style={inputStyle} placeholder="None"
                value={savingThrow} onChange={e => setSavingThrow(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Spell Resistance</label>
            <input className="cinput" style={inputStyle} placeholder="No"
              value={spellResistance} onChange={e => setSpellResistance(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Spell Description / Rule Text *</label>
            <textarea className="cinput" rows={5}
              style={{ fontSize: '9px', lineHeight: 1.4, resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
              placeholder="Enter the official rules here..."
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <p style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', margin: 0 }}>
            * Required fields. After saving, this spell will be immediately registered in your spell compendium.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px', position: 'relative', zIndex: 10 }}>
          <button
            className="btn btn-p"
            onClick={handleSave}
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '9px',
              padding: '3px 14px',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            ✓ Save
          </button>
          <button
            className="btn"
            onClick={onClose}
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
