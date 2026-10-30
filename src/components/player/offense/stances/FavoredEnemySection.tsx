/**
 * @module    FavoredEnemySection
 * @summary   Ranger Favored Enemy active toggle, active creature type selection, and dialog trigger.
 * @exports   FavoredEnemySection
 */

import React from 'react';
import { CombatState } from '@core/state.js';

interface FavoredEnemySectionProps {
  pc: any;
  rangerLvl: number;
  onOpenDialog: () => void;
}

export const FavoredEnemySection: React.FC<FavoredEnemySectionProps> = ({
  pc,
  rangerLvl,
  onOpenDialog
}) => {
  const favoredEnemyBonus = typeof pc.getFavoredEnemyBonus === 'function' ? pc.getFavoredEnemyBonus() : 0;

  if (rangerLvl <= 0 && favoredEnemyBonus <= 0) {
    return null;
  }

  const activeTargetName =
    pc.activeFavoredEnemyTarget ||
    (Array.isArray(pc.favoredEnemies) && pc.favoredEnemies[0]?.type) ||
    pc.favoredEnemy ||
    'Favored Enemy';

  const activeTargetBonus =
    typeof pc.getFavoredEnemyBonus === 'function' ? pc.getFavoredEnemyBonus(activeTargetName) : favoredEnemyBonus;

  return (
    <div
      style={{
        background: pc.isFavoredEnemyActive ? 'rgba(42, 106, 42, 0.12)' : 'rgba(200, 169, 110, 0.05)',
        border: `1px solid ${pc.isFavoredEnemyActive ? '#2a6a2a' : 'var(--pb)'}`,
        borderRadius: '3px',
        padding: '5px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            color: pc.isFavoredEnemyActive ? '#1a4a1a' : 'var(--ink)',
            margin: 0,
            fontWeight: 'bold',
            fontSize: '8.5px',
            fontFamily: 'var(--font-title)'
          }}
        >
          <input
            type="checkbox"
            checked={!!pc.isFavoredEnemyActive}
            onChange={(e) => CombatState.updatePCField('isFavoredEnemyActive', e.target.checked)}
            style={{ margin: 0, width: '12px', height: '12px', cursor: 'pointer' }}
          />
          🏹 Favored Enemy
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {Array.isArray(pc.favoredEnemies) && pc.favoredEnemies.length > 0 ? (
            <select
              value={pc.activeFavoredEnemyTarget || pc.favoredEnemies[0]?.type || ''}
              onChange={(e) => {
                CombatState.updatePCBatch((freshPC: any) => {
                  freshPC.activeFavoredEnemyTarget = e.target.value;
                  freshPC.isFavoredEnemyActive = true;
                });
              }}
              className="cinput"
              style={{
                fontSize: '7.5px',
                height: '16px',
                padding: '0 4px',
                cursor: 'pointer',
                borderRadius: '2px',
                border: '0.5px solid var(--pb)',
                background: 'white',
                color: 'var(--ink)'
              }}
              title="Select active target creature type"
            >
              {pc.favoredEnemies.map((fe: any, idx: number) => (
                <option key={idx} value={fe.type}>
                  {fe.type} (+{fe.bonus || 2})
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: '7.5px', color: 'var(--inkm)', fontStyle: 'italic' }}>
              {pc.favoredEnemy ? `${pc.favoredEnemy} (+${favoredEnemyBonus})` : 'None selected'}
            </span>
          )}

          <button
            type="button"
            onClick={onOpenDialog}
            style={{
              background: 'none',
              border: 'none',
              padding: '0 2px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
            title="Configure Favored Enemies"
          >
            ⚙️
          </button>

          <span
            style={{
              background: pc.isFavoredEnemyActive ? '#2a6a2a' : 'rgba(0,0,0,0.06)',
              color: pc.isFavoredEnemyActive ? '#fff' : 'var(--inkm)',
              fontSize: '7.5px',
              fontWeight: 'bold',
              padding: '1px 5px',
              borderRadius: '2px',
              fontFamily: 'monospace'
            }}
          >
            +{activeTargetBonus} DMG
          </span>
        </div>
      </div>

      <div style={{ fontSize: '7px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
        🏹 D&amp;D 3.5e RAW: +{activeTargetBonus} weapon damage rolls against {activeTargetName} (and on Bluff, Listen, Sense Motive, Spot, Survival).
      </div>
    </div>
  );
};
