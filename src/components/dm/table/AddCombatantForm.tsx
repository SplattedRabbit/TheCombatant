/**
 * @module    AddCombatantForm
 * @summary   Quick inline add form for new Player or Enemy/NPC combatants in DMCombatantsTable.
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';

interface AddCombatantFormProps {
  side: 'p' | 'e';
  show: boolean;
  onClose: () => void;
}

export const AddCombatantForm: React.FC<AddCombatantFormProps> = ({ side, show, onClose }) => {
  const [addName, setAddName] = useState('');
  const [addInit, setAddInit] = useState('');
  const [addHp, setAddHp] = useState('');
  const [addAc, setAddAc] = useState('');
  
  // Player specific
  const [addClass, setAddClass] = useState('custom');
  const [addLevel, setAddLevel] = useState('1');

  // Enemy specific
  const [addEnemyType, setAddEnemyType] = useState('e');

  if (!show) return null;

  const handleConfirmAdd = () => {
    if (side === 'p') {
      const name = addName || 'Charakter';
      const init = parseInt(addInit) || 0;
      const hp = parseInt(addHp) || 10;
      const ac = parseInt(addAc) || 10;
      const level = parseInt(addLevel) || 1;
      const classes = addClass !== 'custom' ? [{ classType: addClass, level }] : [];

      CombatState.addCombatant({
        name,
        init,
        hp,
        maxHP: hp,
        ac,
        classType: addClass,
        level,
        classes,
        type: 'p'
      });

      setAddName('');
      setAddInit('');
      setAddHp('');
      setAddAc('');
      setAddClass('custom');
      setAddLevel('1');
      onClose();
    } else {
      const name = addName || 'Gegner';
      const init = parseInt(addInit) || 0;
      const hp = parseInt(addHp) || 8;
      const ac = parseInt(addAc) || 10;

      CombatState.addCombatant({
        name,
        init,
        hp,
        maxHP: hp,
        ac,
        type: addEnemyType
      });

      setAddName('');
      setAddInit('');
      setAddHp('');
      setAddAc('');
      setAddEnemyType('e');
      onClose();
    }
  };

  return side === 'p' ? (
    <div 
      className="add-form no-print" 
      style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '3px', 
        alignItems: 'center',
        marginTop: '8px'
      }}
    >
      <label>Name:</label>
      <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} style={{ width: '65px' }} placeholder="Aranis" />
      <label>Init:</label>
      <input type="number" value={addInit} onChange={(e) => setAddInit(e.target.value)} style={{ width: '25px' }} placeholder="12" />
      <label>HP:</label>
      <input type="number" value={addHp} onChange={(e) => setAddHp(e.target.value)} style={{ width: '25px' }} placeholder="28" />
      <label>AC:</label>
      <input type="number" value={addAc} onChange={(e) => setAddAc(e.target.value)} style={{ width: '25px' }} placeholder="15" />
      <label style={{ marginLeft: '2px' }}>Class:</label>
      <select value={addClass} onChange={(e) => setAddClass(e.target.value)} style={{ width: '80px', fontSize: '8px', height: '14px', padding: '0 1px' }}>
        <option value="custom">Custom</option>
        <option value="fighter">Fighter</option>
        <option value="cleric">Cleric</option>
        <option value="rogue">Rogue</option>
        <option value="wizard">Wizard</option>
        <option value="barbarian">Barbarian</option>
        <option value="bard">Bard</option>
        <option value="druid">Druid</option>
        <option value="monk">Monk</option>
        <option value="paladin">Paladin</option>
        <option value="ranger">Ranger</option>
        <option value="sorcerer">Sorcerer</option>
      </select>
      <label>Level:</label>
      <select value={addLevel} onChange={(e) => setAddLevel(e.target.value)} style={{ width: '30px', fontSize: '8px', height: '14px', padding: '0' }}>
        {Array.from({ length: 20 }, (_, i) => i + 1).map(lv => (
          <option key={lv} value={String(lv)}>{lv}</option>
        ))}
      </select>
      <button className="btn btn-p" onClick={handleConfirmAdd} style={{ padding: '1px 5px', height: '14px', lineHeight: '10px' }}>Add</button>
      <button className="btn" onClick={onClose} style={{ padding: '1px 4px', height: '14px', lineHeight: '10px' }}>✕</button>
    </div>
  ) : (
    <div 
      className="add-form no-print" 
      style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '3px', 
        alignItems: 'center',
        marginTop: '8px'
      }}
    >
      <label>Name:</label>
      <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} style={{ width: '70px' }} placeholder="Goblin #1" />
      <label>Init:</label>
      <input type="number" value={addInit} onChange={(e) => setAddInit(e.target.value)} style={{ width: '28px' }} placeholder="8" />
      <label>HP:</label>
      <input type="number" value={addHp} onChange={(e) => setAddHp(e.target.value)} style={{ width: '28px' }} placeholder="12" />
      <label>AC:</label>
      <input type="number" value={addAc} onChange={(e) => setAddAc(e.target.value)} style={{ width: '28px' }} placeholder="13" />
      <select value={addEnemyType} onChange={(e) => setAddEnemyType(e.target.value)} style={{ height: '14px', fontSize: '8.5px', padding: '0 1px' }}>
        <option value="e">Enemy</option>
        <option value="n">NPC</option>
      </select>
      <button className="btn btn-p" onClick={handleConfirmAdd} style={{ padding: '1px 5px', height: '14px', lineHeight: '10px' }}>Add</button>
      <button className="btn" onClick={onClose} style={{ padding: '1px 4px', height: '14px', lineHeight: '10px' }}>✕</button>
    </div>
  );
};
