/**
 * @module    ClericDeityDomainDialog
 * @summary   Modal dialog for configuring Cleric Deity and Divine Domains (D&D 3.5e RAW).
 */

import React, { useState, useEffect } from 'react';
import { DialogOverlay } from './DialogOverlay';
import { CombatState } from '@core/state.js';
import { DEITIES_REGISTRY, DOMAINS_REGISTRY, getDeity, getDomain, isAlignmentWithinOneStep } from '@core/rules.js';

export interface ClericDeityDomainDialogProps {
  pc: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ClericDeityDomainDialog: React.FC<ClericDeityDomainDialogProps> = ({
  pc,
  isOpen,
  onClose,
}) => {
  const currentDeityKey = (pc?.deity || 'none').toLowerCase();
  const clericDomains = Array.isArray(pc?.clericDomains) ? pc.clericDomains : [];
  
  const [deityId, setDeityId] = useState<string>(currentDeityKey);
  const [domain1, setDomain1] = useState<string>(clericDomains[0] || 'good');
  const [domain2, setDomain2] = useState<string>(clericDomains[1] || 'healing');
  const [error, setError] = useState<string | null>(null);

  // Sync state if PC changes while open
  useEffect(() => {
    if (isOpen) {
      setDeityId((pc?.deity || 'none').toLowerCase());
      const pcDoms = Array.isArray(pc?.clericDomains) ? pc.clericDomains : [];
      setDomain1(pcDoms[0] || 'good');
      setDomain2(pcDoms[1] || 'healing');
      setError(null);
    }
  }, [isOpen, pc]);

  if (!isOpen) return null;

  const currentDeity = getDeity(deityId) || DEITIES_REGISTRY.none;
  const isAlignmentCompliant = !pc?.alignment || currentDeity.alignment === 'ANY' || isAlignmentWithinOneStep(pc.alignment, currentDeity.alignment);
  const availableDomainOptions = currentDeity.domains || Object.keys(DOMAINS_REGISTRY);

  const handleDeityChange = (newDeityId: string) => {
    setDeityId(newDeityId);
    setError(null);
    const newDeity = getDeity(newDeityId) || DEITIES_REGISTRY.none;
    const validDomains = newDeity.domains;

    let newD1 = domain1;
    let newD2 = domain2;

    if (!validDomains.includes(newD1)) {
      newD1 = validDomains[0] || 'good';
    }
    if (!validDomains.includes(newD2) || newD2 === newD1) {
      newD2 = validDomains.find((d: string) => d !== newD1) || validDomains[0] || 'healing';
    }

    setDomain1(newD1);
    setDomain2(newD2);
  };

  const handleDomain1Change = (newD1: string) => {
    let newD2 = domain2;
    if (newD2 === newD1) {
      const alt = currentDeity.domains.find((d: string) => d !== newD1);
      if (alt) newD2 = alt;
    }
    setDomain1(newD1);
    setDomain2(newD2);
    setError(null);
  };

  const handleDomain2Change = (newD2: string) => {
    let newD1 = domain1;
    if (newD1 === newD2) {
      const alt = currentDeity.domains.find((d: string) => d !== newD2);
      if (alt) newD1 = alt;
    }
    setDomain1(newD1);
    setDomain2(newD2);
    setError(null);
  };

  const handleSave = () => {
    if (domain1 === domain2 && currentDeity.domains.length > 1) {
      setError('You must select two different domains.');
      return;
    }

    CombatState.updatePCBatch((freshPc: any) => {
      freshPc.deity = deityId;
      freshPc.clericDomains = [domain1, domain2];
    });

    onClose();
  };

  return (
    <DialogOverlay onClose={onClose} width={480} id="clericDeityDomainDialogOverlay">
      <div style={{ textAlign: 'left', fontFamily: 'var(--font-body)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--pb)', paddingBottom: '6px', marginBottom: '10px' }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⛪</span> Cleric Deity & Domains
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', color: 'var(--inkm)', fontSize: '16px', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* RAW Explanation */}
        <div
          style={{
            fontSize: '11px',
            color: 'var(--ink)',
            lineHeight: 1.35,
            padding: '8px 10px',
            background: 'rgba(200, 169, 110, 0.1)',
            border: '1px solid var(--pb)',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        >
          <strong>D&D 3.5e RAW Rules:</strong>
          <br />
          • <strong>Alignment:</strong> A cleric's alignment must be within one step of their deity's (e.g. LN, NG, or CN for N).
          <br />
          • <strong>Domains:</strong> A cleric chooses two domains from their deity's portfolio, granting access to domain spells and a granted power for each.
        </div>

        {/* Deity Configuration */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>
              Chosen Deity:
            </label>
            {!isAlignmentCompliant && (
              <span style={{ color: '#b71c1c', fontSize: '9px', fontWeight: 'bold' }} title="D&D 3.5e RAW: Cleric alignment must be within 1 step of deity alignment">
                ⚠️ Alignment Mismatch
              </span>
            )}
          </div>
          
          <select
            value={deityId}
            onChange={(e) => handleDeityChange(e.target.value)}
            className="cinput"
            style={{ width: '100%', height: '28px', fontSize: '11.5px', padding: '2px 6px', borderRadius: '4px' }}
          >
            {Object.values(DEITIES_REGISTRY).map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.alignment})
              </option>
            ))}
          </select>
          {currentDeity.id !== 'none' && (
            <div style={{ fontSize: '10px', color: 'var(--inkm)', fontStyle: 'italic', paddingLeft: '2px', marginTop: '4px' }}>
              {currentDeity.title} · Favored Weapon: {currentDeity.favoredWeapon.replace('_', ' ')}
            </div>
          )}
        </div>

        {/* Domains Configuration */}
        <div
          style={{
            padding: '10px',
            background: 'rgba(139, 26, 26, 0.04)',
            border: '1px solid rgba(139, 26, 26, 0.25)',
            borderRadius: '4px',
            marginBottom: '12px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}
        >
          {/* Domain 1 */}
          <div>
            <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
              Domain 1:
            </label>
            <select
              value={domain1}
              onChange={(e) => handleDomain1Change(e.target.value)}
              className="cinput"
              style={{ width: '100%', height: '26px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}
            >
              {availableDomainOptions.map((dKey: string) => {
                const dom = getDomain(dKey);
                return dom ? <option key={dKey} value={dKey}>{dom.name}</option> : null;
              })}
            </select>
          </div>

          {/* Domain 2 */}
          <div>
            <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
              Domain 2:
            </label>
            <select
              value={domain2}
              onChange={(e) => handleDomain2Change(e.target.value)}
              className="cinput"
              style={{ width: '100%', height: '26px', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}
            >
              {availableDomainOptions.map((dKey: string) => {
                const dom = getDomain(dKey);
                return dom ? <option key={dKey} value={dKey}>{dom.name}</option> : null;
              })}
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ padding: '6px 10px', background: 'rgba(139, 26, 26, 0.15)', border: '1px solid var(--red)', color: 'var(--red)', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginBottom: '10px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--pb)', paddingTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ fontSize: '11px', padding: '4px 14px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-p"
            style={{ fontSize: '11px', padding: '4px 16px', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}
          >
            Save Deity & Domains ✦
          </button>
        </div>
      </div>
    </DialogOverlay>
  );
};
