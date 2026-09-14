/**
 * @module    DistributeItemModal
 * @summary   Parchment modal allowing the DM to distribute an item from the DM Stash to an active Player Character (PC).
 * @exports   DistributeItemModal
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { DialogOverlay } from './DialogOverlay.tsx';
import { realtimeManager } from '../../../services/network/RealtimeManager.ts';
import { useDialog } from '../../../context/DialogContext.tsx';

interface DistributeItemModalProps {
  itemName: string;
  category: 'weapons' | 'armors' | 'items';
  index: number;
  pcs: any[];
  onClose: () => void;
}

export const DistributeItemModal: React.FC<DistributeItemModalProps> = ({
  itemName,
  category,
  index,
  pcs,
  onClose,
}) => {
  const dialog = useDialog();

  const handleGive = (pcId: string) => {
    // 1. Clone item data before removing from stash
    const state = CombatState.getState();
    const item = state.meta?.dmStash?.[category]?.[index];
    const itemData = item ? JSON.parse(JSON.stringify(item)) : { name: itemName };

    // 2. Transfer item in state and sync
    CombatState.giveStashItemToPC(category, index, pcId);

    // 3. Broadcast loot gift packet to connected player client(s)
    try {
      realtimeManager.broadcastDiff({
        type: 'item_gift',
        targetPCId: pcId,
        category,
        item: itemData,
      });
    } catch (err) {
      console.warn('[DistributeItemModal] Failed to broadcast item_gift:', err);
    }

    // 4. If current active local PC is the recipient (e.g. testing locally or host player), trigger reveal immediately
    const activePC = CombatState.getActivePC();
    if (activePC && activePC.id === pcId) {
      dialog.showLootReveal(itemData, category);
    }

    onClose();
  };

  return (
    <DialogOverlay onClose={onClose} width={460} textAlign="left" padding="16px 20px">
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '7px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '17px' }}>🎁</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.02em' }}>
              Distribute Item: {itemName}
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

        <p style={{ fontSize: '11px', color: 'var(--inkm)', margin: '0 0 12px', lineHeight: 1.45, fontFamily: 'var(--font-body)' }}>
          Select which character in the active session should receive this item. It will be moved into their inventory and removed from the DM Stash.
        </p>

        {/* Player Characters List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', maxHeight: '290px', overflowY: 'auto', paddingRight: '2px' }}>
          {pcs.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--inkm)', fontStyle: 'italic', fontSize: '11px', background: 'rgba(200, 169, 110, 0.08)', borderRadius: '4px', border: '1px dashed var(--pb)' }}>
              No player characters currently found in the session.
            </div>
          ) : (
            pcs.map((pc) => {
              const classStr = Array.isArray(pc.classes) && pc.classes.length > 0
                ? pc.classes.map((c: any) => `${c.className || c.classType} ${c.level || 1}`).join(' / ')
                : 'Adventurer';

              return (
                <div
                  key={pc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid var(--pb)',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12.5px', fontFamily: 'var(--font-title)', color: 'var(--red)', letterSpacing: '0.02em' }}>
                      🛡️ {pc.name || 'Unnamed PC'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '1px' }}>
                      {classStr}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGive(pc.id)}
                    className="btn btn-p"
                    style={{
                      fontFamily: 'var(--font-title)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '4px 14px',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      color: 'var(--red)',
                      border: '1.5px solid var(--pb)',
                      background: 'linear-gradient(180deg, #fefdf8 0%, #edd9b4 100%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>🎁</span>
                    <span>Give</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--pb)', paddingTop: '10px', marginTop: '14px' }}>
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
