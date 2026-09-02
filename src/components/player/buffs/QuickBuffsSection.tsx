/**
 * @module    QuickBuffsSection
 * @summary   Equipped magic items (Quick Buffs) and PC quick select access buttons in PCBuffsTab.
 */

import React from 'react';
import { getAvailableEquipmentBuffs } from '@core/rules.js';
import { isBuffSuppressed, checkBuffConflict } from '@core/rules/BuffRules.js';

interface QuickBuffsSectionProps {
  pc: any;
  activeBuffs: any[];
  quickBuffs: any[];
  onEquipmentBuffClick: (eb: any) => void;
  onQuickBuffClick: (qb: any) => void;
  onRemoveQuickBuff: (key: string) => void;
}

export const QuickBuffsSection: React.FC<QuickBuffsSectionProps> = ({
  pc,
  activeBuffs,
  quickBuffs,
  onEquipmentBuffClick,
  onQuickBuffClick,
  onRemoveQuickBuff,
}) => {
  const equipmentBuffs = getAvailableEquipmentBuffs(pc) || [];

  return (
    <>
      {/* Equipped Magic Items Quick Buffs */}
      {equipmentBuffs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
            ⚡ Equipped Magic Items (Quick Buffs)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
            {equipmentBuffs.map((eb: any) => {
              const isActive = activeBuffs.some((b: any) => b.spellKey === eb.buffKey);
              const usesLabel = eb.charges ? `${eb.charges.current}/${eb.charges.max}` : (eb.dailyUses ? `${eb.dailyUses.current}/${eb.dailyUses.max}` : '∞');
              const isOutOfUses = eb.availableUses <= 0;

              return (
                <button
                  key={`${eb.itemId || eb.itemIdx}_${eb.buffKey}`}
                  type="button"
                  onClick={() => onEquipmentBuffClick(eb)}
                  disabled={!isActive && isOutOfUses}
                  className="quick-buff-btn"
                  style={{
                    width: '100%',
                    fontFamily: 'var(--font-title)',
                    fontSize: '9px',
                    padding: '3px 5px',
                    cursor: (!isActive && isOutOfUses) ? 'not-allowed' : 'pointer',
                    border: '1px solid',
                    borderRadius: '2px',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    ...(isActive
                      ? { background: 'var(--red, #8b1a1a)', color: '#f4e8c1', borderColor: 'var(--red, #8b1a1a)', fontWeight: 'bold' }
                      : (isOutOfUses
                        ? { background: 'rgba(0,0,0,0.03)', color: 'var(--inkl)', borderColor: 'rgba(200,169,110,0.3)', opacity: 0.6 }
                        : { background: 'rgba(200, 169, 110, 0.12)', color: 'var(--ink)', borderColor: 'var(--pb)' }))
                  }}
                  title={`${eb.itemName}: ${eb.description || eb.buffKey}`}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isActive ? '✓ ' : '⚡ '}{eb.itemName}
                  </span>
                  <span style={{ fontSize: '7.5px', background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.06)', padding: '0 3px', borderRadius: '2px', marginLeft: '4px' }}>
                    {usesLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px', paddingBottom: '1px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
          Quick Select
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
          {quickBuffs.length === 0 ? (
            <div style={{ gridColumn: 'span 2', fontStyle: 'italic', color: 'var(--inkl)', fontSize: '9px', textAlign: 'center', padding: '12px 0', background: 'rgba(0,0,0,0.01)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
              No quick access slots defined. Use the search to add buffs.
            </div>
          ) : (
            quickBuffs.map((qb: any) => {
              const isActive = activeBuffs.some((b: any) => b.spellKey === qb.key);
              const activeInstance = isActive ? activeBuffs.find((b: any) => b.spellKey === qb.key) : null;
              const isSuppressed = isActive
                ? isBuffSuppressed(pc, activeInstance)
                : (checkBuffConflict(pc, qb.key).status === 'suppressed');

              const checkmark = isActive ? '✓ ' : '';
              const warningBadge = isSuppressed ? ' ⚠️' : '';

              return (
                <div key={qb.key} style={{ position: 'relative', display: 'block', width: '100%' }}>
                  <button
                    onClick={() => onQuickBuffClick(qb)}
                    className="quick-buff-btn"
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-title)',
                      fontSize: '9px',
                      padding: '3px 14px 3px 3px',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderRadius: '2px',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      boxSizing: 'border-box',
                      ...(isActive
                        ? (isSuppressed
                          ? { background: 'rgba(139, 26, 26, 0.15)', color: 'rgba(139, 26, 26, 0.6)', borderColor: 'rgba(139, 26, 26, 0.45)', opacity: 0.7, filter: 'grayscale(40%)', fontWeight: 'bold' }
                          : { background: '#8b1a1a', color: '#f4e8c1', borderColor: '#8b1a1a', fontWeight: 'bold' })
                        : (isSuppressed
                          ? { background: 'rgba(200, 169, 110, 0.03)', color: 'rgba(20, 15, 5, 0.4)', borderColor: 'rgba(200, 169, 110, 0.3)', opacity: 0.5, filter: 'grayscale(60%)' }
                          : { background: 'rgba(200, 169, 110, 0.08)', color: 'var(--ink)', borderColor: 'var(--pb)' }))
                    }}
                    title={`${qb.name}${isSuppressed ? ' (Suppressed by a stronger active buff)' : ''}`}
                  >
                    {checkmark}{qb.name}{warningBadge}
                  </button>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveQuickBuff(qb.key);
                    }}
                    style={{
                      position: 'absolute',
                      right: '4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      color: 'inherit',
                      opacity: 0.55,
                      fontSize: '9px',
                      fontWeight: 'bold',
                      zIndex: 10,
                      padding: '2px',
                      lineHeight: 1,
                      transition: 'opacity 0.15s'
                    }}
                    title="Remove from quick select"
                  >
                    ✕
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
