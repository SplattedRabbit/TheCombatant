/**
 * @module    ArmorEditorModal
 * @summary   Modal editor for creating or editing armors & shields with D&D 3.5e parameters (Enhancement, AC/MaxDex/ACP/SpellFailure Overrides).
 * @exports   ArmorEditorModal
 */

import React, { useState } from 'react';
import { ARMOR_REGISTRY } from '@core/data/armor-data.js';
import { DialogOverlay } from './DialogOverlay.tsx';

interface ArmorEditorModalProps {
  armor?: any;
  onSave: (armorData: any) => void;
  onClose: () => void;
}

export const ArmorEditorModal: React.FC<ArmorEditorModalProps> = ({
  armor,
  onSave,
  onClose,
}) => {
  const isEditing = !!armor && !!(armor.name || armor.type);

  const [name, setName] = useState(armor?.name || '');
  const [type, setType] = useState(armor?.type || 'chain_shirt');
  const [enhancement, setEnhancement] = useState<number>(armor?.enhancement !== undefined ? parseInt(armor.enhancement) || 0 : 0);

  // Overrides
  const [showOverrides, setShowOverrides] = useState(
    Boolean(armor?.armorBonusOverride || armor?.maxDexOverride || armor?.checkPenaltyOverride || armor?.spellFailureOverride)
  );
  const [armorBonusOverride, setArmorBonusOverride] = useState(armor?.armorBonusOverride !== undefined ? String(armor.armorBonusOverride) : '');
  const [maxDexOverride, setMaxDexOverride] = useState(armor?.maxDexOverride !== undefined ? String(armor.maxDexOverride) : '');
  const [checkPenaltyOverride, setCheckPenaltyOverride] = useState(armor?.checkPenaltyOverride !== undefined ? String(armor.checkPenaltyOverride) : '');
  const [spellFailureOverride, setSpellFailureOverride] = useState(armor?.spellFailureOverride !== undefined ? String(armor.spellFailureOverride) : '');

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (!name || name === (ARMOR_REGISTRY[type]?.nameEn || ARMOR_REGISTRY[type]?.name || '')) {
      const def = ARMOR_REGISTRY[newType];
      if (def) {
        setName(def.nameEn || def.name || '');
      }
    }
  };

  const handleSave = () => {
    const finalName = name.trim() || (ARMOR_REGISTRY[type]?.nameEn || 'Armor');
    const armorData = {
      ...(armor || {}),
      name: finalName,
      type,
      enhancement: parseInt(enhancement as any) || 0,
      armorBonusOverride: armorBonusOverride.trim(),
      maxDexOverride: maxDexOverride.trim(),
      checkPenaltyOverride: checkPenaltyOverride.trim(),
      spellFailureOverride: spellFailureOverride.trim(),
    };

    onSave(armorData);
    onClose();
  };

  const typeDef = ARMOR_REGISTRY[type] || {};

  return (
    <DialogOverlay onClose={onClose} width={500} textAlign="left" padding="16px 20px">
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '7px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '17px' }}>🛡️</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.02em' }}>
              {isEditing ? `Edit Armor / Shield: ${name || 'Armor'}` : 'Create Armor / Shield'}
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
                Armor / Shield Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mithral Full Plate"
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
                {Object.values(ARMOR_REGISTRY).map((def: any) => (
                  <option key={def.key} value={def.key}>
                    {def.nameEn || def.name || def.nameDe} (+{def.armorBonus} AC)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Enhancement & Quick Stats Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '10px', alignItems: 'center' }}>
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

            {/* Quick stats box */}
            <div style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(200, 169, 110, 0.35)', fontSize: '9.5px', lineHeight: 1.45, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)', letterSpacing: '0.02em', marginBottom: '2px' }}>
                {typeDef.isShield ? 'SHIELD PROFILE' : 'ARMOR PROFILE'}:
              </div>
              <div style={{ color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                AC: <strong>+{typeDef.armorBonus + (enhancement || 0)}</strong> | MaxDex: <strong>{typeDef.maxDex ?? '—'}</strong> | ACP: <strong>{typeDef.checkPenalty || 0}</strong> | Spell Failure: <strong>{typeDef.spellFailure || 0}%</strong>
              </div>
            </div>
          </div>

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
              <span>{showOverrides ? 'Hide RAW Overrides' : 'Show RAW Overrides (AC, MaxDex, ACP, Spell Failure)'}</span>
            </button>

            {showOverrides && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginTop: '6px', padding: '8px', background: 'rgba(200, 169, 110, 0.08)', borderRadius: '4px', border: '1px dashed var(--pb)' }}>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>AC Bonus:</span>
                  <input
                    type="text"
                    value={armorBonusOverride}
                    onChange={(e) => setArmorBonusOverride(e.target.value)}
                    placeholder={`Def (+${typeDef.armorBonus})`}
                    className="cinput"
                    style={{ width: '100%', fontSize: '10.5px', height: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>MaxDex:</span>
                  <input
                    type="text"
                    value={maxDexOverride}
                    onChange={(e) => setMaxDexOverride(e.target.value)}
                    placeholder={`Def (${typeDef.maxDex ?? 'None'})`}
                    className="cinput"
                    style={{ width: '100%', fontSize: '10.5px', height: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>ACP:</span>
                  <input
                    type="text"
                    value={checkPenaltyOverride}
                    onChange={(e) => setCheckPenaltyOverride(e.target.value)}
                    placeholder={`Def (${typeDef.checkPenalty || 0})`}
                    className="cinput"
                    style={{ width: '100%', fontSize: '10.5px', height: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: 'var(--font-title)', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Spell Fail %:</span>
                  <input
                    type="text"
                    value={spellFailureOverride}
                    onChange={(e) => setSpellFailureOverride(e.target.value)}
                    placeholder={`Def (${typeDef.spellFailure || 0}%)`}
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
            {isEditing ? '💾 Save Armor' : '➕ Create Armor'}
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
