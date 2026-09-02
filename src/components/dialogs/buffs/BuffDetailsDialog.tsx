/**
 * @module    BuffDetailsDialog
 * @summary   Modal presenting D&D 3.5e RAW rules, duration, active modifiers and quick selection toggle for a buff/aura.
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { uiRegistry } from '@core/ui/ui-shared.js';
import { CombatSpells } from '@core/spells.js';
import { CLASS_BUFFS } from '@core/data/class-buffs-data.js';
import {
  translateTarget,
  translateType,
  activateBuffByKey
} from '@core/rules/BuffRules.js';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';

export interface BuffDetailsDialogProps {
  pc: any;
  spellKey: string;
  isClass: boolean;
  isAlreadyActiveIndex?: number | null;
  onClose: () => void;
}

export const BuffDetailsDialog: React.FC<BuffDetailsDialogProps> = ({
  pc,
  spellKey,
  isClass,
  isAlreadyActiveIndex = null,
  onClose
}) => {
  let displayName = '';
  let effectsList: any[] = [];
  let durationStr = '—';
  let description = '';
  let school = '';
  let classBuff = null;
  let spell = null;

  if (isClass) {
    classBuff = CLASS_BUFFS.find((b: any) => b.key === spellKey);
    if (classBuff) {
      displayName = classBuff.name;
      effectsList = classBuff.effects || [];
      durationStr = classBuff.duration || '—';
      description = classBuff.description || 'Class-specific buff or aura effect.';
      school = classBuff.school || 'Class Feature';
    }
  } else if (spellKey) {
    classBuff = CLASS_BUFFS.find((b: any) => b.key === spellKey);
    if (classBuff) {
      displayName = classBuff.name;
      effectsList = classBuff.effects || [];
      durationStr = classBuff.duration || '—';
      description = classBuff.description || 'Class-specific buff or aura effect.';
      school = classBuff.school || 'Class Feature';
      isClass = true;
    } else {
      spell = CombatSpells.REGISTRY?.[spellKey];
      if (spell) {
        displayName = spell.nameEn || spell.nameDe || spellKey;
        effectsList = spell.effects || [];
        durationStr = spell.duration || '—';
        description = spell.description || '';
        school = spell.school || 'Spell';
      }
    }
  }

  if (isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]) {
    const activeInstance = pc.activeBuffs[isAlreadyActiveIndex];
    displayName = activeInstance.name;
    if (Array.isArray(activeInstance.effects)) {
      effectsList = activeInstance.effects;
    }
    if (activeInstance.durationFormula) {
      durationStr = activeInstance.durationFormula;
    }
  }

  if (!displayName) {
    if (isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]) {
      const activeInstance = pc.activeBuffs[isAlreadyActiveIndex];
      displayName = activeInstance.name || 'Custom Buff';
      effectsList = activeInstance.effects || [];
    } else {
      return null;
    }
  }

  const inQuickSelection = Array.isArray(pc.quickBuffs) && pc.quickBuffs.some((b: any) => b.key === spellKey);

  const handleActivate = () => {
    onClose();
    activateBuffByKey(pc, spellKey, isClass, {
      showCustomConfirm,
      showCustomAlert,
      showCustomPrompt: (title: string, msg: string, def: string, onConfirm: (val: string) => void) => {
        const bridge = (window as any).__REACT_DIALOG_BRIDGE__;
        if (bridge && bridge.showCustomPrompt) {
          bridge.showCustomPrompt(title, msg, def, "OK", onConfirm);
        }
      },
      renderPlayerScreen: () => {
        if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
          uiRegistry.renderPlayerScreen();
        }
      }
    });
  };

  const handleToggleFavorite = () => {
    onClose();
    CombatState.updatePCBatch((freshPc: any) => {
      if (!Array.isArray(freshPc.quickBuffs)) freshPc.quickBuffs = [];
      const index = freshPc.quickBuffs.findIndex((b: any) => b.key === spellKey);
      if (index >= 0) {
        freshPc.quickBuffs.splice(index, 1);
      } else {
        freshPc.quickBuffs.push({ key: spellKey, name: displayName, isClass });
      }
    });
    if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
      uiRegistry.renderPlayerScreen();
    }
  };

  return (
    <div
      id="buffDetails"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 20px',
          width: '580px',
          maxWidth: '92vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1)',
          fontFamily: 'var(--font-title)',
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontSize: '15px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.8px' }}>
          ✨ Buff Rules: {displayName}
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />

        <div className="info-dialog-body" style={{ textAlign: 'left', marginBottom: '12px' }}>
          <div
            className="ancient-parchment"
            style={{
              background: '#f4e8c1',
              border: '2px solid #8b1a1a',
              padding: '16px 20px',
              borderRadius: '4px',
              boxShadow: 'inset 0 0 35px rgba(139, 26, 26, 0.15)',
              fontFamily: 'var(--font-body)',
              color: '#1a0f00',
              lineHeight: 1.45,
              textAlign: 'left',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ fontStyle: 'italic', fontSize: '10px', color: '#8b1a1a', fontWeight: 'bold', borderBottom: '1px solid rgba(139,26,26,0.3)', paddingBottom: '4px', marginBottom: '8px' }}>
              {school || 'Effect'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', fontSize: '10px', borderBottom: '0.5px dashed rgba(139, 26, 26, 0.4)', paddingBottom: '8px', marginBottom: '10px', fontWeight: 600 }}>
              <div><strong>Duration:</strong> {durationStr}</div>
              {(isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]?.casterLevel) && (
                <div><strong>Caster Level:</strong> {pc.activeBuffs[isAlreadyActiveIndex].casterLevel}</div>
              )}
            </div>
            {description && (
              <div style={{ fontSize: '11px', lineHeight: 1.5, color: '#2a1b0a', marginBottom: '10px', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                {description}
              </div>
            )}
            {effectsList.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <strong style={{ color: '#8b1a1a', fontSize: '11.5px', fontFamily: 'var(--font-title)', letterSpacing: '0.4px' }}>
                  Active Modifiers:
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  {effectsList.map((eff: any, idx: number) => {
                    const sign = eff.value >= 0 ? '+' : '';
                    return (
                      <div key={idx} style={{ fontSize: '10.5px', background: 'rgba(139, 26, 26, 0.03)', border: '0.5px solid rgba(139, 26, 26, 0.25)', borderRadius: '2px', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>• <strong>{translateTarget(eff.target)}:</strong></span>
                        <strong>{sign}{eff.value} ({translateType(eff.type)})</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
          {spellKey && (
            <>
              <button
                onClick={handleActivate}
                className="btn btn-p"
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '9.5px',
                  padding: '4px 22px',
                  cursor: 'pointer',
                  background: 'rgba(139, 26, 26, 0.1)',
                  border: '1px solid var(--pb)',
                  borderRadius: '2px',
                  color: 'var(--red)',
                  fontWeight: 'bold'
                }}
              >
                Activate
              </button>
              <button
                onClick={handleToggleFavorite}
                className="btn btn-p"
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '9.5px',
                  padding: '4px 22px',
                  cursor: 'pointer',
                  background: 'rgba(139, 26, 26, 0.1)',
                  border: '1px solid var(--pb)',
                  borderRadius: '2px',
                  color: 'var(--red)',
                  fontWeight: 'bold'
                }}
              >
                {inQuickSelection ? 'Remove from Quick Selection' : 'Add to Quick Selection'}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="btn"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '9.5px',
              padding: '4px 22px',
              cursor: 'pointer',
              border: '1px solid var(--pb)',
              background: 'rgba(0,0,0,0.03)',
              color: 'var(--ink)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
