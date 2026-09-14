/**
 * @module    FavoredEnemyDialog
 * @summary   Modal dialog for configuring Ranger Favored Enemies and bonuses (D&D 3.5e RAW).
 */

import React, { useState, useEffect } from 'react';
import { DialogOverlay } from './DialogOverlay';
import { CombatState } from '@core/state.js';

export interface FavoredEnemyDialogProps {
  pc: any;
  isOpen: boolean;
  onClose: () => void;
}

export interface FavoredEnemyEntry {
  type: string;
  bonus: number;
}

export const FAVORED_ENEMY_TYPES: string[] = [
  'Aberration',
  'Animal',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Giant',
  'Humanoid (aquatic)',
  'Humanoid (dwarf)',
  'Humanoid (elf)',
  'Humanoid (goblinoid)',
  'Humanoid (gnoll)',
  'Humanoid (gnome)',
  'Humanoid (halfling)',
  'Humanoid (human)',
  'Humanoid (orc)',
  'Humanoid (reptilian)',
  'Magical Beast',
  'Monstrous Humanoid',
  'Ooze',
  'Outsider (air)',
  'Outsider (chaotic)',
  'Outsider (earth)',
  'Outsider (evil)',
  'Outsider (fire)',
  'Outsider (good)',
  'Outsider (lawful)',
  'Outsider (water)',
  'Plant',
  'Undead',
  'Vermin',
  'Arcanists (Invocations & Spellcasters)',
];

export const FavoredEnemyDialog: React.FC<FavoredEnemyDialogProps> = ({
  pc,
  isOpen,
  onClose,
}) => {
  const rangerClass = Array.isArray(pc?.classes)
    ? pc.classes.find((c: any) => c.classType === 'ranger')
    : null;
  const rLvl = rangerClass?.level || 1;

  const maxEnemies = Math.max(1, 1 + Math.floor(rLvl / 5));
  const totalPoints = 2 + 4 * Math.floor(rLvl / 5);

  const [enemies, setEnemies] = useState<FavoredEnemyEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (Array.isArray(pc?.favoredEnemies) && pc.favoredEnemies.length > 0) {
      setEnemies(pc.favoredEnemies.map((e: any) => ({ type: e.type || '', bonus: Number(e.bonus) || 2 })));
    } else if (pc?.favoredEnemy) {
      // Parse legacy string e.g. "Orcs (+4), Undead (+2)" or simply "Orcs"
      const parts = String(pc.favoredEnemy).split(',').map(s => s.trim()).filter(Boolean);
      const initial: FavoredEnemyEntry[] = parts.map(p => {
        const match = p.match(/^(.*?)(?:\s*\(\+(\d+)\))?$/);
        return {
          type: match ? match[1].trim() : p,
          bonus: match && match[2] ? parseInt(match[2], 10) : 2,
        };
      });
      setEnemies(initial.length > 0 ? initial : [{ type: '', bonus: 2 }]);
    } else {
      setEnemies([{ type: '', bonus: 2 }]);
    }
    setError(null);
  }, [isOpen, pc]);

  if (!isOpen) return null;

  const pointsUsed = enemies.reduce((sum, e) => sum + (e.bonus || 0), 0);
  const pointsRemaining = totalPoints - pointsUsed;

  const handleAddEnemy = () => {
    if (enemies.length >= maxEnemies) {
      setError(`At Ranger level ${rLvl}, you may choose at most ${maxEnemies} favored enemies.`);
      return;
    }
    setError(null);
    setEnemies(prev => [...prev, { type: '', bonus: 2 }]);
  };

  const handleRemoveEnemy = (index: number) => {
    setError(null);
    setEnemies(prev => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, newType: string) => {
    setError(null);
    setEnemies(prev => {
      const next = [...prev];
      next[index] = { ...next[index], type: newType };
      return next;
    });
  };

  const handleBonusChange = (index: number, delta: number) => {
    setError(null);
    setEnemies(prev => {
      const next = [...prev];
      const curBonus = next[index].bonus || 2;
      const newBonus = curBonus + delta;
      if (newBonus < 2) return prev; // Minimum +2 per RAW
      next[index] = { ...next[index], bonus: newBonus };
      return next;
    });
  };

  const handleSave = () => {
    const validEnemies = enemies.filter(e => e.type.trim() !== '');

    if (validEnemies.length === 0) {
      setError('Please select at least one Favored Enemy type.');
      return;
    }

    // Check duplicates
    const seen = new Set<string>();
    for (const e of validEnemies) {
      const lower = e.type.toLowerCase().trim();
      if (seen.has(lower)) {
        setError(`Duplicate enemy type: "${e.type}". Each favored enemy must be unique.`);
        return;
      }
      seen.add(lower);
    }

    if (pointsRemaining !== 0) {
      setError(
        pointsRemaining > 0
          ? `You still have +${pointsRemaining} bonus point(s) left to allocate across your favored enemies.`
          : `You have over-allocated points by ${Math.abs(pointsRemaining)}. Total allowed is +${totalPoints}.`
      );
      return;
    }

    // Save to CombatState
    if (CombatState && typeof CombatState.updatePCField === 'function') {
      CombatState.updatePCField('favoredEnemies', validEnemies);
      // Legacy string for external/companion views
      const summaryStr = validEnemies.map(e => `${e.type} (+${e.bonus})`).join(', ');
      CombatState.updatePCField('favoredEnemy', summaryStr);
    }

    onClose();
  };

  return (
    <DialogOverlay onClose={onClose} width={480} id="favoredEnemyDialogOverlay">
      {/* Title */}
      <div style={{ borderBottom: '1px solid var(--pb)', paddingBottom: '8px', marginBottom: '12px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '15px',
            color: 'var(--red)',
            fontFamily: 'var(--font-title)',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>🏹</span> Favored Enemies (Erzfeinde)
        </h3>
        <span
          style={{
            fontSize: '9.5px',
            color: 'var(--inkm)',
            fontStyle: 'italic',
            fontFamily: 'var(--font-body)',
            display: 'block',
            marginTop: '3px',
          }}
        >
          Ranger Level {rLvl} &bull; Up to {maxEnemies} enemies &bull; Total bonus points: +{totalPoints}
        </span>
      </div>

      {/* Rules Notice */}
      <div
        style={{
          background: 'rgba(200, 169, 110, 0.12)',
          border: '0.5px solid var(--pb)',
          borderRadius: '3px',
          padding: '8px 10px',
          marginBottom: '12px',
          fontSize: '9px',
          fontFamily: 'var(--font-body)',
          color: 'var(--inkm)',
          textAlign: 'left',
          lineHeight: 1.35,
        }}
      >
        <strong>D&amp;D 3.5e RAW:</strong> At 1st level, a ranger selects a creature type from the official table (+2 bonus on weapon damage and Bluff, Listen, Sense Motive, Spot, Survival). At 5th, 10th, 15th, and 20th level, select another enemy and increase the bonus against any one enemy by +2.
      </div>

      {/* Pool Status Tracker */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: pointsRemaining === 0 ? 'rgba(46, 125, 50, 0.1)' : 'rgba(184, 134, 11, 0.12)',
          border: pointsRemaining === 0 ? '1px solid #2e7d32' : '1px solid #b8860b',
          borderRadius: '3px',
          padding: '6px 12px',
          marginBottom: '12px',
          fontFamily: 'var(--font-title)',
          fontSize: '11px',
        }}
      >
        <span style={{ color: 'var(--ink)' }}>
          Enemies: <strong>{enemies.length} / {maxEnemies}</strong>
        </span>
        <span
          style={{
            color: pointsRemaining === 0 ? '#1b5e20' : pointsRemaining > 0 ? '#b8860b' : 'var(--red)',
            fontWeight: 'bold',
          }}
        >
          Points: {pointsUsed} / {totalPoints}{' '}
          {pointsRemaining === 0 ? (
            '✓'
          ) : pointsRemaining > 0 ? (
            `(${pointsRemaining} remaining)`
          ) : (
            `(${Math.abs(pointsRemaining)} over)`
          )}
        </span>
      </div>

      {/* Enemies List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {enemies.map((entry, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.03)',
              border: '0.5px solid var(--pb)',
              borderRadius: '3px',
              padding: '6px 8px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'var(--red)',
                width: '18px',
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              #{idx + 1}
            </span>

            {/* Creature Type Select */}
            <select
              value={entry.type}
              onChange={e => handleTypeChange(idx, e.target.value)}
              className="cinput"
              style={{
                flex: 1,
                fontSize: '10px',
                padding: '3px 4px',
                height: '24px',
                fontFamily: 'var(--font-body)',
              }}
            >
              <option value="">-- Select Creature Type --</option>
              {FAVORED_ENEMY_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Bonus Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                background: 'rgba(200, 169, 110, 0.15)',
                border: '0.5px solid var(--pb)',
                borderRadius: '2px',
                padding: '1px 4px',
              }}
            >
              <button
                type="button"
                className="btn btn-s"
                onClick={() => handleBonusChange(idx, -2)}
                disabled={entry.bonus <= 2}
                style={{
                  padding: '0 4px',
                  height: '18px',
                  lineHeight: '16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: entry.bonus <= 2 ? 'default' : 'pointer',
                }}
                title="Decrease bonus by 2"
              >
                -
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-title)',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  color: 'var(--red)',
                  minWidth: '28px',
                  textAlign: 'center',
                }}
              >
                +{entry.bonus}
              </span>
              <button
                type="button"
                className="btn btn-s"
                onClick={() => handleBonusChange(idx, 2)}
                disabled={pointsRemaining <= 0}
                style={{
                  padding: '0 4px',
                  height: '18px',
                  lineHeight: '16px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: pointsRemaining <= 0 ? 'default' : 'pointer',
                }}
                title="Increase bonus by 2"
              >
                +
              </button>
            </div>

            {/* Delete button */}
            {enemies.length > 1 && (
              <button
                type="button"
                className="btn btn-s"
                onClick={() => handleRemoveEnemy(idx)}
                style={{
                  padding: '0 5px',
                  height: '22px',
                  color: 'var(--red)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
                title="Remove enemy"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Add Enemy Button */}
        {enemies.length < maxEnemies && (
          <button
            type="button"
            className="btn btn-s"
            onClick={handleAddEnemy}
            style={{
              alignSelf: 'flex-start',
              padding: '4px 8px',
              fontSize: '9.5px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <span>+</span> Add Favored Enemy ({enemies.length + 1}/{maxEnemies})
          </button>
        )}
      </div>

      {/* Error / Validation Display */}
      {error && (
        <div
          style={{
            background: 'rgba(139, 26, 26, 0.08)',
            border: '0.5px solid var(--red)',
            borderRadius: '2px',
            padding: '5px 8px',
            fontSize: '9.5px',
            color: 'var(--red)',
            marginBottom: '10px',
            textAlign: 'left',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          borderTop: '1px solid var(--pb)',
          paddingTop: '10px',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="btn btn-s"
          style={{
            padding: '5px 12px',
            fontSize: '10px',
            fontFamily: 'var(--font-title)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-p"
          style={{
            padding: '5px 14px',
            fontSize: '10px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-title)',
            cursor: 'pointer',
          }}
        >
          Save Favored Enemies
        </button>
      </div>
    </DialogOverlay>
  );
};
