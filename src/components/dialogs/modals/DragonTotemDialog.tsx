/**
 * @module    DragonTotemDialog
 * @summary   Compact single-screen modal dialog for configuring Dragon Shaman Totem Dragon choice outside the wizard (D&D 3.5e PHB2 RAW).
 */

import React, { useState } from 'react';
import { DialogOverlay } from './DialogOverlay';
import { CombatState } from '@core/state.js';
import { DRAGON_TOTEMS, isTotemAllowedForAlignment } from '@core/rules/data/dragonTotems.js';

export interface DragonTotemDialogProps {
  pc: any;
  isOpen: boolean;
  onClose: () => void;
}

const CHROMATIC_DRAGONS = ['black', 'blue', 'green', 'red', 'white'];
const METALLIC_DRAGONS = ['brass', 'bronze', 'copper', 'gold', 'silver'];

const getEnergyStyle = (energy: string) => {
  switch (energy?.toLowerCase()) {
    case 'fire':
      return { bg: 'rgba(192, 57, 43, 0.12)', border: '#c0392b', color: '#962d22' };
    case 'cold':
      return { bg: 'rgba(41, 128, 185, 0.12)', border: '#2980b9', color: '#1f618d' };
    case 'electricity':
      return { bg: 'rgba(212, 172, 13, 0.15)', border: '#b7950b', color: '#7d6608' };
    case 'acid':
      return { bg: 'rgba(39, 174, 96, 0.12)', border: '#27ae60', color: '#1e8449' };
    default:
      return { bg: 'rgba(200, 169, 110, 0.12)', border: 'var(--pb)', color: 'var(--ink)' };
  }
};

export const DragonTotemDialog: React.FC<DragonTotemDialogProps> = ({
  pc,
  isOpen,
  onClose,
}) => {
  const currentTotemKey = pc?.dragonTotem || 'red';
  const [selectedTotemKey, setSelectedTotemKey] = useState<string>(currentTotemKey);
  const [syncAlignment, setSyncAlignment] = useState<boolean>(false);
  const [newAlignment, setNewAlignment] = useState<string>('NE');

  const currentTotem = DRAGON_TOTEMS[currentTotemKey] || DRAGON_TOTEMS.red;
  const selectedTotem = DRAGON_TOTEMS[selectedTotemKey] || DRAGON_TOTEMS.red;
  const charAlignment = pc?.alignment || '';
  const isAlignmentCompliant = isTotemAllowedForAlignment(selectedTotemKey, charAlignment);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedTotemKey(pc?.dragonTotem || 'red');
      setSyncAlignment(false);
    }
  }, [isOpen, pc?.dragonTotem]);

  React.useEffect(() => {
    if (selectedTotem && !isAlignmentCompliant && selectedTotem.alignments?.length > 0) {
      setNewAlignment(selectedTotem.alignments[0]);
    }
  }, [selectedTotemKey, isAlignmentCompliant, selectedTotem]);

  if (!isOpen) return null;

  const handleSave = () => {
    CombatState.updatePCBatch((freshPc: any) => {
      freshPc.dragonTotem = selectedTotemKey;
      if (syncAlignment && newAlignment) {
        freshPc.alignment = newAlignment;
      }
    });
    onClose();
  };

  const selEnergyStyle = getEnergyStyle(selectedTotem.energy);

  const renderDragonButton = (key: string) => {
    const totem = DRAGON_TOTEMS[key];
    if (!totem) return null;
    const isSelected = selectedTotemKey === key;
    const isCurrent = currentTotemKey === key;
    const isCompliant = isTotemAllowedForAlignment(key, charAlignment);
    const energyStyle = getEnergyStyle(totem.energy);

    return (
      <button
        key={key}
        type="button"
        onClick={() => setSelectedTotemKey(key)}
        style={{
          flex: 1,
          minWidth: 0,
          padding: '4px 6px',
          borderRadius: '3px',
          border: isSelected ? '1.5px solid var(--red)' : '0.5px solid var(--pb)',
          background: isSelected
            ? 'linear-gradient(135deg, rgba(200, 169, 110, 0.3) 0%, rgba(139, 26, 26, 0.15) 100%)'
            : 'rgba(200, 169, 110, 0.06)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          transition: 'all 0.15s ease',
          boxShadow: isSelected ? '0 1px 3px rgba(139, 26, 26, 0.25)' : 'none',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%', justifyContent: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '10px',
              fontWeight: isSelected ? 'bold' : '600',
              color: isSelected ? 'var(--red)' : 'var(--ink)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {totem.name.replace(' Dragon', '')}
          </span>
          {!isCompliant && charAlignment && (
            <span title="Alignment divergence" style={{ fontSize: '8.5px', lineHeight: 1 }}>⚠️</span>
          )}
        </div>
        <span
          style={{
            fontSize: '7.5px',
            padding: '0 3px',
            borderRadius: '2px',
            fontWeight: '600',
            background: energyStyle.bg,
            color: energyStyle.color,
            border: `0.5px solid ${energyStyle.border}`,
            lineHeight: '1.2',
          }}
        >
          {totem.energy.toUpperCase()}
        </span>
        {isCurrent && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              fontSize: '6.5px',
              background: 'var(--red)',
              color: '#fff',
              borderRadius: '2px',
              padding: '1px 2px',
              lineHeight: 1,
              fontWeight: 'bold',
            }}
          >
            CUR
          </span>
        )}
      </button>
    );
  };

  return (
    <DialogOverlay onClose={onClose} width={560} id="dragonTotemDialogOverlay">
      <div style={{ textAlign: 'left', fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--pb)', paddingBottom: '4px' }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '13px', fontWeight: 'bold', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Totem Dragon Selection
          </div>
          <span style={{ fontSize: '9.5px', color: 'var(--inkm)' }}>
            Current: <strong>{currentTotem.name}</strong>
          </span>
        </div>

        {/* Dragon Selectors (Chromatic & Metallic) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '8.5px', color: 'var(--inkl)', fontWeight: 'bold', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Chromatic Dragons
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {CHROMATIC_DRAGONS.map(renderDragonButton)}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '8.5px', color: 'var(--inkl)', fontWeight: 'bold', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Metallic Dragons
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {METALLIC_DRAGONS.map(renderDragonButton)}
            </div>
          </div>
        </div>

        {/* Selected Totem Detail Panel */}
        <div
          style={{
            background: 'rgba(200, 169, 110, 0.08)',
            border: '1px solid var(--pb)',
            borderRadius: '4px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          {/* Header inside detail panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(200, 169, 110, 0.3)', paddingBottom: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontFamily: 'var(--font-title)', fontSize: '12px', color: 'var(--red)' }}>
                {selectedTotem.name}
              </strong>
              <span
                style={{
                  fontSize: '7.5px',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  fontWeight: 'bold',
                  background: selEnergyStyle.bg,
                  color: selEnergyStyle.color,
                  border: `0.5px solid ${selEnergyStyle.border}`,
                }}
              >
                {selectedTotem.energy.toUpperCase()} ({selectedTotem.shape})
              </span>
            </div>
            <span style={{ fontSize: '8.5px', color: 'var(--inkm)' }}>
              Allowed Alignments: <strong style={{ color: 'var(--ink)' }}>{selectedTotem.alignments.join(', ')}</strong>
            </span>
          </div>

          {/* 2-column info row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '9px' }}>
            <div>
              <span style={{ color: 'var(--inkm)', fontWeight: 'bold' }}>Breath Weapon: </span>
              <span>{selectedTotem.breathName} ({selectedTotem.shape}, Reflex half)</span>
            </div>
            <div>
              <span style={{ color: 'var(--inkm)', fontWeight: 'bold' }}>Bonus Class Skills: </span>
              <span>{selectedTotem.skills.map((s: string) => s.replace(/_/g, ' ')).join(', ')}</span>
            </div>
          </div>

          {/* Adaptation row */}
          <div style={{ fontSize: '9px', lineHeight: 1.25 }}>
            <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>
              Draconic Adaptation: {selectedTotem.adaptation}
            </span>
            <div style={{ fontSize: '8px', color: 'var(--inkm)', fontStyle: 'italic', marginTop: '1px' }}>
              {selectedTotem.adaptationDesc}
            </div>
          </div>
        </div>

        {/* Alignment Notification / Sync Box */}
        {!isAlignmentCompliant && charAlignment ? (
          <div
            style={{
              padding: '5px 8px',
              background: 'rgba(184, 134, 11, 0.12)',
              border: '0.5px dashed #b8860b',
              borderRadius: '3px',
              fontSize: '8.5px',
              color: '#7d5f1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
            }}
          >
            <div style={{ flex: 1, lineHeight: 1.2 }}>
              ⚠️ <strong>Alignment Note:</strong> Dragon Shaman requires an alignment within 1 step ({selectedTotem.alignments.join(', ')}). Current: <em>{charAlignment}</em>.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', fontWeight: 'bold', fontSize: '8.5px' }}>
                <input
                  type="checkbox"
                  checked={syncAlignment}
                  onChange={(e) => setSyncAlignment(e.target.checked)}
                />
                Sync to:
              </label>
              <select
                value={newAlignment}
                onChange={(e) => {
                  setNewAlignment(e.target.value);
                  setSyncAlignment(true);
                }}
                disabled={!syncAlignment}
                className="cinput"
                style={{ fontSize: '8.5px', height: '18px', padding: '0 3px', boxSizing: 'border-box' }}
              >
                {selectedTotem.alignments.map((a: string) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '8.5px', color: '#27ae60', padding: '1px 2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>✓ Alignment compatible ({charAlignment || 'Compatible'})</span>
          </div>
        )}

        {/* Footer / Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid var(--pb)', paddingTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ padding: '3px 10px', fontSize: '9.5px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-p"
            style={{ padding: '3px 12px', fontSize: '9.5px', fontWeight: 'bold' }}
          >
            ✓ Confirm Totem: {selectedTotem.name.replace(' Dragon', '')}
          </button>
        </div>
      </div>
    </DialogOverlay>
  );
};
