/**
 * @module    ImportInventoryPackageModal
 * @summary   Modal dialog for importing D&D 3.5e Inventory & Loadout Packages (.json) into a Player Character or DM Stash.
 * @exports   ImportInventoryPackageModal
 */

import React, { useState, useRef } from 'react';
import { DialogOverlay } from './DialogOverlay.tsx';
import { CombatState } from '@core/state.js';

export interface ImportInventoryPackageModalProps {
  target?: 'pc' | 'stash';
  onClose: () => void;
  onImported?: (result: any) => void;
}

export const ImportInventoryPackageModal: React.FC<ImportInventoryPackageModalProps> = ({
  target = 'pc',
  onClose,
  onImported
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawJson, setRawJson] = useState<string>('');
  const [parsed, setParsed] = useState<any | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [autoEquip, setAutoEquip] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleParseInput = (text: string) => {
    setRawJson(text);
    if (!text.trim()) {
      setParsed(null);
      setErrorMsg(null);
      return;
    }
    const res = CombatState.parseInventoryPackage(text);
    if (!res.isValid) {
      setParsed(null);
      setErrorMsg(res.error || 'Invalid inventory package JSON.');
    } else {
      setParsed(res);
      setAutoEquip(res.autoEquip !== false);
      setErrorMsg(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = String(ev.target?.result || '');
      handleParseInput(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parsed || !parsed.isValid) return;

    const result =
      target === 'stash'
        ? CombatState.importStashPackage(rawJson, mode)
        : CombatState.importPCInventoryPackage(rawJson, { mode, autoEquip });

    if (!result?.success) {
      setErrorMsg(result?.error || 'Failed to import package.');
      return;
    }

    if (onImported) onImported(result);
    onClose();
  };

  return (
    <DialogOverlay onClose={onClose} width={500} textAlign="left" padding="16px 20px" id="import-inventory-package-modal">
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '7px', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📦</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.02em' }}>
              {target === 'stash' ? 'Import Stash Loot Package' : 'Import Equipment Package'}
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

        <p style={{ fontSize: '11px', color: 'var(--inkm)', margin: '0 0 2px', lineHeight: 1.45, fontFamily: 'var(--font-body)' }}>
          {target === 'stash'
            ? 'Import weapons, armors, and wondrous items into the DM Stash from a .json package file or raw JSON text.'
            : 'Import equipment into character inventory. Wearable items can be equipped automatically per D&D 3.5e RAW rules.'}
        </p>

        {/* File Picker & Action Bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '10.5px',
              fontWeight: 'bold',
              padding: '4px 12px',
              cursor: 'pointer',
              borderRadius: '3px',
              color: 'var(--ink)',
              border: '1px solid var(--pb)',
              background: 'linear-gradient(180deg, #fdf6e2 0%, #e8d5a0 100%)',
              boxShadow: '0 1px 2px rgba(61, 43, 0, 0.08)'
            }}
          >
            Select .json File...
          </button>
          <span style={{ fontSize: '10.5px', color: 'var(--inkl)', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
            or paste package JSON below
          </span>
        </div>

        {/* JSON Input Area */}
        <textarea
          value={rawJson}
          onChange={e => handleParseInput(e.target.value)}
          placeholder='{"format": "dnd35e-inventory-package", "packageName": "Adventurer Gear", "weapons": ["longsword"], "armors": ["chain_shirt"], "items": ["cloak_of_resistance_1"]}'
          rows={3}
          className="modal-textarea"
          style={{
            minHeight: '68px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '10.5px',
            lineHeight: 1.4,
            padding: '6px 8px'
          }}
        />

        {errorMsg && (
          <div style={{ padding: '6px 10px', borderRadius: '3px', background: 'rgba(139, 26, 26, 0.1)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: '10.5px', fontFamily: 'var(--font-body)' }}>
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {/* Package Summary Preview */}
        {parsed && parsed.isValid && (
          <div style={{ background: 'rgba(200, 169, 110, 0.12)', border: '1px solid var(--pb)', borderRadius: '4px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-title)', fontWeight: 'bold', fontSize: '12px', color: 'var(--ink)' }}>
                {parsed.packageName}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--inkm)', fontFamily: 'var(--font-title)' }}>
                {parsed.totalCount} {parsed.totalCount === 1 ? 'item' : 'items'} total
              </span>
            </div>

            {parsed.description && (
              <div style={{ fontSize: '10px', color: 'var(--inkl)', fontStyle: 'italic', fontFamily: 'var(--font-body)', lineHeight: 1.35 }}>
                {parsed.description}
              </div>
            )}

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '9.5px', fontFamily: 'var(--font-title)' }}>
              <span style={{ padding: '1px 6px', borderRadius: '2px', background: 'rgba(139, 26, 26, 0.08)', color: 'var(--red)', border: '0.5px solid rgba(139, 26, 26, 0.25)' }}>
                Weapons: {parsed.weapons.length}
              </span>
              <span style={{ padding: '1px 6px', borderRadius: '2px', background: 'rgba(30, 70, 110, 0.08)', color: '#1e466e', border: '0.5px solid rgba(30, 70, 110, 0.25)' }}>
                Armors & Shields: {parsed.armors.length}
              </span>
              <span style={{ padding: '1px 6px', borderRadius: '2px', background: 'rgba(154, 122, 46, 0.12)', color: 'var(--gold)', border: '0.5px solid rgba(154, 122, 46, 0.3)' }}>
                Items & Gear: {parsed.items.length}
              </span>
            </div>

            <div style={{ maxHeight: '90px', overflowY: 'auto', fontSize: '10px', fontFamily: 'var(--font-body)', color: 'var(--inkm)', display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '0.5px dashed var(--pb)', paddingTop: '5px' }}>
              {parsed.weapons.map((w: any, idx: number) => (
                <div key={`w-${idx}`}>• <strong>{w.name}</strong> ({w.damage || w.damageDice || '1d8'}, {w.grip?.toUpperCase() || '1H'})</div>
              ))}
              {parsed.armors.map((a: any, idx: number) => (
                <div key={`a-${idx}`}>• <strong>{a.name}</strong> (+{a.armorBonus + (a.enhancement || a.magicBonus || 0)} AC{a.isShield ? ', Shield' : ''})</div>
              ))}
              {parsed.items.map((i: any, idx: number) => (
                <div key={`i-${idx}`}>• <strong>{i.name}</strong> ({i.slot || 'slotless'})</div>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', padding: '8px 10px', background: 'rgba(200, 169, 110, 0.08)', borderRadius: '4px', border: '1px solid var(--pb)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-body)' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--ink)' }}>
              Mode:
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'var(--inkm)' }}>
              <input type="radio" checked={mode === 'merge'} onChange={() => setMode('merge')} />
              <span>Merge (keep existing items)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: 'var(--red)' }}>
              <input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} />
              <span>Replace All</span>
            </label>
          </div>

          {target === 'pc' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', cursor: 'pointer', color: 'var(--inkm)', fontFamily: 'var(--font-body)', borderTop: '0.5px dashed rgba(200, 169, 110, 0.5)', paddingTop: '6px' }}>
              <input
                type="checkbox"
                checked={autoEquip}
                onChange={e => setAutoEquip(e.target.checked)}
              />
              <span>Auto-equip wearable items & recalculate AC, saves, and stats (D&D 3.5e RAW)</span>
            </label>
          )}
        </div>

        {/* Actions Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--pb)', paddingTop: '10px', marginTop: '4px' }}>
          <button
            type="button"
            disabled={!parsed || !parsed.isValid || parsed.totalCount === 0}
            onClick={handleConfirmImport}
            className="btn btn-p"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '5px 18px',
              cursor: parsed?.isValid && parsed.totalCount > 0 ? 'pointer' : 'not-allowed',
              borderRadius: '3px',
              color: 'var(--red)',
              border: '1.5px solid var(--pb)',
              background: 'linear-gradient(180deg, #fefdf8 0%, #edd9b4 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: parsed?.isValid && parsed.totalCount > 0 ? 1 : 0.5
            }}
          >
            Import {parsed?.totalCount ? `(${parsed.totalCount} items)` : 'Package'}
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
