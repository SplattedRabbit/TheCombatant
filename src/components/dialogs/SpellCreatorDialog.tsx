import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CombatRules } from '@core/rules.js';
// @ts-ignore
import { findSpell } from '../player/PCSpellbookTab';

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
    if (!nameDe.trim() || !school.trim() || !description.trim()) {
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
      nameDe: nameDe.trim(),
      nameEn: nameEn.trim() || undefined,
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

    if (!Array.isArray(activePC.customSpells)) activePC.customSpells = [];
    activePC.customSpells.push(newSpell);

    if (!Array.isArray(activePC.learnedSpells)) activePC.learnedSpells = [];
    if (!activePC.learnedSpells.includes(newSpell.id)) {
      activePC.learnedSpells.push(newSpell.id);
    }

    CombatState.saveToStorage();
    CombatState.syncPCToHost();
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
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="custom-alert-box"
        style={{ maxWidth: '520px', width: '90%', maxHeight: '85vh', overflowY: 'auto', padding: '18px 20px' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 12px', fontFamily: "'Cinzel', serif", fontSize: '13px', textAlign: 'center' }}>
          ✦ Custom Spell Creator ✦
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>German Name *</label>
              <input className="cinput" style={inputStyle} placeholder="e.g. Feuerball"
                value={nameDe} onChange={e => setNameDe(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>English Name</label>
              <input className="cinput" style={inputStyle} placeholder="e.g. Fireball"
                value={nameEn} onChange={e => setNameEn(e.target.value)} />
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

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button className="xbtn" onClick={handleSave} style={{ minWidth: '100px' }}>✓ Save</button>
          <button className="xbtn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
