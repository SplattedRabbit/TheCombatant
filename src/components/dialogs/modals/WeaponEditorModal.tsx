/**
 * @module    WeaponEditorModal
 * @summary   Modal editor for creating or editing weapons with D&D 3.5e parameters (Enhancement, Keen, Extra Damage, Overrides).
 * @exports   WeaponEditorModal
 */

import React, { useState } from 'react';
import { WeaponRegistry } from '@core/models/Weapon.js';
import { DialogOverlay } from './DialogOverlay.tsx';

interface WeaponEditorModalProps {
  weapon?: any;
  onSave: (weaponData: any) => void;
  onClose: () => void;
}

export const WeaponEditorModal: React.FC<WeaponEditorModalProps> = ({
  weapon,
  onSave,
  onClose,
}) => {
  const isEditing = !!weapon && !!(weapon.name || weapon.type);

  const [name, setName] = useState(weapon?.name || '');
  const [type, setType] = useState(weapon?.type || 'longsword');
  const [enhancement, setEnhancement] = useState<number>(weapon?.enhancement !== undefined ? parseInt(weapon.enhancement) || 0 : 0);
  const [attackBonus, setAttackBonus] = useState(weapon?.attackBonus || '');
  const [isKeen, setIsKeen] = useState<boolean>(!!weapon?.isKeen);
  const [extraDamageDice, setExtraDamageDice] = useState(weapon?.extraDamageDice || '');
  const [extraDamageType, setExtraDamageType] = useState(weapon?.extraDamageType || '');
  const [strengthRating, setStrengthRating] = useState<number>(weapon?.strengthRating !== undefined ? parseInt(weapon.strengthRating) || 0 : 0);

  // Advanced Overrides
  const [showOverrides, setShowOverrides] = useState(
    Boolean(weapon?.gripOverride || weapon?.damageDiceOverride || weapon?.critOverride)
  );
  const [gripOverride, setGripOverride] = useState(weapon?.gripOverride || '');
  const [damageDiceOverride, setDamageDiceOverride] = useState(weapon?.damageDiceOverride || '');
  const [critOverride, setCritOverride] = useState(weapon?.critOverride || '');

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (!name || name === (WeaponRegistry[type]?.nameEn || WeaponRegistry[type]?.name || '')) {
      const def = WeaponRegistry[newType];
      if (def) {
        setName(def.nameEn || def.name || '');
      }
    }
  };

  const handleSave = () => {
    const finalName = name.trim() || (WeaponRegistry[type]?.nameEn || 'Weapon');
    const weaponData = {
      ...(weapon || {}),
      name: finalName,
      type,
      enhancement: parseInt(enhancement as any) || 0,
      attackBonus: attackBonus.trim(),
      isKeen,
      extraDamageDice: extraDamageDice.trim(),
      extraDamageType: extraDamageType.trim(),
      strengthRating: parseInt(strengthRating as any) || 0,
      gripOverride: gripOverride.trim(),
      damageDiceOverride: damageDiceOverride.trim(),
      critOverride: critOverride.trim(),
    };

    onSave(weaponData);
    onClose();
  };

  const typeDef = WeaponRegistry[type] || {};

  return (
    <DialogOverlay onClose={onClose} width={500} textAlign="left" padding="16px 20px">
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '7px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '17px' }}>⚔️</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.02em' }}>
              {isEditing ? `Edit Weapon: ${name || 'Weapon'}` : 'Create New Weapon'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="xbtn"
            style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '3px',
              border: '1px solid var(--pb)',
              background: 'rgba(200, 169, 110, 0.15)',
              color: 'var(--inkm)',
              cursor: 'pointer'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          {/* Row 1: Name & Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '3px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Weapon Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sun Blade"
                className="cinput"
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--ink)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  height: '28px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '3px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Base Type:
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="cinput"
                style={{
                  width: '100%',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--ink)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  height: '28px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                {Object.values(WeaponRegistry).map((def: any) => (
                  <option key={def.key} value={def.key}>
                    {def.nameEn || def.name || def.nameDe} ({def.damageDice}, {def.crit})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Enhancement, Extra Attack, Keen */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.1fr', gap: '10px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '3px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Enhancement:
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={enhancement}
                onChange={(e) => setEnhancement(parseInt(e.target.value) || 0)}
                className="cinput"
                style={{
                  width: '100%',
                  padding: '3px 6px',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--ink)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  height: '28px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '3px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Attack Bonus:
              </label>
              <input
                type="text"
                value={attackBonus}
                onChange={(e) => setAttackBonus(e.target.value)}
                placeholder="+0"
                className="cinput"
                style={{
                  width: '100%',
                  padding: '3px 6px',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--ink)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  height: '28px',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ paddingTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--ink)' }}>
                <input
                  type="checkbox"
                  checked={isKeen}
                  onChange={(e) => setIsKeen(e.target.checked)}
                  style={{ width: '14px', height: '14px', margin: 0, cursor: 'pointer' }}
                />
                <span>Keen (Double Threat)</span>
              </label>
            </div>
          </div>

          {/* Row 3: Extra Damage (e.g. 1w6 Fire) */}
          <div style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(200, 169, 110, 0.35)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--red)', marginBottom: '5px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Elemental / Extra Damage
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>DICE:</span>
                <select
                  value={extraDamageDice}
                  onChange={(e) => setExtraDamageDice(e.target.value)}
                  className="cinput"
                  style={{
                    width: '100%',
                    padding: '3px 6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--ink)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid var(--pb)',
                    borderRadius: '3px',
                    height: '26px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">None</option>
                  {['1w2', '1w3', '1w4', '1w6', '1w8', '1w10', '1w12', '2w4', '2w6', '2w8', '2w10', '3w6'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <span style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>DAMAGE TYPE:</span>
                <select
                  value={extraDamageType}
                  onChange={(e) => setExtraDamageType(e.target.value)}
                  className="cinput"
                  style={{
                    width: '100%',
                    padding: '3px 6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--ink)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid var(--pb)',
                    borderRadius: '3px',
                    height: '26px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">None</option>
                  {['Fire', 'Cold', 'Electricity', 'Acid', 'Sonic', 'Force', 'Holy', 'Unholy', 'Vile', 'Slashing', 'Piercing', 'Bludgeoning'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Composite Bow Strength Rating */}
          {(typeDef.isComposite || typeDef.isBow) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(200, 169, 110, 0.08)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(200, 169, 110, 0.3)' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)' }}>Composite Strength Rating (+STR cap):</span>
              <input
                type="number"
                min="0"
                max="10"
                value={strengthRating}
                onChange={(e) => setStrengthRating(parseInt(e.target.value) || 0)}
                className="cinput"
                style={{ width: '50px', height: '25px', fontSize: '11px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', fontWeight: 'bold' }}
              />
            </div>
          )}

          {/* Advanced Overrides Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowOverrides(!showOverrides)}
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-title)',
                color: 'var(--inkm)',
                background: 'rgba(200, 169, 110, 0.12)',
                border: '1px solid var(--pb)',
                borderRadius: '3px',
                padding: '3px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{showOverrides ? '▾' : '▸'}</span>
              <span>{showOverrides ? 'Hide RAW Overrides' : 'Show RAW Overrides (Grip, Damage, Crit)'}</span>
            </button>

            {showOverrides && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px', padding: '8px', background: 'rgba(200, 169, 110, 0.08)', borderRadius: '4px', border: '1px dashed var(--pb)' }}>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Grip:</span>
                  <select
                    value={gripOverride}
                    onChange={(e) => setGripOverride(e.target.value)}
                    className="cinput"
                    style={{ width: '100%', fontSize: '10.5px', height: '24px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px' }}
                  >
                    <option value="">Default ({typeDef.grip || '1h'})</option>
                    <option value="1h">1-Hand</option>
                    <option value="2h">2-Hand</option>
                    <option value="sec">Shield hand</option>
                    <option value="rng">Ranged</option>
                    <option value="unarmed">Unarmed</option>
                  </select>
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Damage Dice:</span>
                  <input
                    type="text"
                    value={damageDiceOverride}
                    onChange={(e) => setDamageDiceOverride(e.target.value)}
                    placeholder={`Def (${typeDef.damageDice || '1w8'})`}
                    className="cinput"
                    style={{ width: '100%', fontSize: '10.5px', height: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Critical:</span>
                  <input
                    type="text"
                    value={critOverride}
                    onChange={(e) => setCritOverride(e.target.value)}
                    placeholder={`Def (${typeDef.crit || '20/x2'})`}
                    className="cinput"
                    style={{ width: '100%', fontSize: '10.5px', height: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--pb)', paddingTop: '12px', marginTop: '14px' }}>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-p"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '5px 18px',
              cursor: 'pointer',
              borderRadius: '3px',
              color: 'var(--red)',
              border: '1.5px solid var(--pb)',
              background: 'linear-gradient(180deg, #fefdf8 0%, #edd9b4 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isEditing ? '💾 Save Weapon' : '➕ Create Weapon'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              padding: '5px 16px',
              cursor: 'pointer',
              borderRadius: '3px',
              color: 'var(--inkm)',
              border: '1px solid var(--pb)',
              background: 'rgba(200, 169, 110, 0.15)'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </DialogOverlay>
  );
};
