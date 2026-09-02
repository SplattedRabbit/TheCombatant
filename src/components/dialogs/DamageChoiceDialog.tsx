import React, { useState } from 'react';
import { AttackEngine } from '@core/rules/AttackEngine.js';
import { CombatState } from '@core/state.js';

interface DamageChoiceDialogProps {
  pc: any;
  weapon: any;
  options?: any;
  onClose: () => void;
}

export const DamageChoiceDialog: React.FC<DamageChoiceDialogProps> = ({
  pc,
  weapon,
  options = {},
  onClose
}) => {
  const [smiteActive, setSmiteActive] = useState<boolean>(options.smite !== undefined ? !!options.smite : !!pc.isSmiteActive);
  const [favoredEnemyActive, setFavoredEnemyActive] = useState<boolean>(options.favoredEnemy !== undefined ? !!options.favoredEnemy : !!pc.isFavoredEnemyActive);
  const [sneakActive, setSneakActive] = useState<boolean>(options.sneakAttack !== undefined ? !!options.sneakAttack : !!pc.isSneakAttacking);

  const hasPaladin = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'paladin');
  const paladinClass = hasPaladin ? pc.classes.find((c: any) => c.classType === 'paladin') : null;
  const favoredEnemyBonus = typeof pc.getFavoredEnemyBonus === 'function' ? pc.getFavoredEnemyBonus() : 0;
  const sneakAttackDice = typeof pc.getSneakAttackDiceCount === 'function' ? pc.getSneakAttackDiceCount() : 0;

  const isRanged = weapon.grip === 'rng';
  const isMelee = !isRanged;

  const smiteAbility = pc.dailyAbilities?.find((a: any) => a.name === "Böses niederstrecken" || a.name === "Smite Evil");
  const smiteMax = smiteAbility ? smiteAbility.max : 0;
  const smiteUsed = smiteAbility ? smiteAbility.used : 0;
  const smiteRemaining = Math.max(0, smiteMax - smiteUsed);

  const handleSmiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    if (val && smiteMax > 0 && smiteRemaining <= 0) {
      return;
    }
    setSmiteActive(val);
    CombatState.updatePCField('isSmiteActive', val);
  };

  const handleFavoredEnemyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setFavoredEnemyActive(val);
    CombatState.updatePCField('isFavoredEnemyActive', val);
  };

  const handleSneakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setSneakActive(val);
    CombatState.updatePCField('isSneakAttacking', val);
  };

  const seq = AttackEngine.calculateAttackSequence(pc, weapon, false, {
    isOffhandAttack: !!options.isOffhandAttack,
    smite: smiteActive,
    favoredEnemy: favoredEnemyActive,
    sneakAttack: sneakActive,
    ...options
  });

  const stdAtkObj = seq[0] || {
    atkTotal: 0,
    dmgTotal: 0,
    dmgBreakdown: [],
    atkBreakdown: [],
    damageDice: '1d6'
  };

  let modsSum = 0;
  const rows = (stdAtkObj.dmgBreakdown || []).map((item: any) => {
    const val = parseInt(item.value) || 0;
    modsSum += val;
    return {
      label: item.label,
      value: val,
      sign: val >= 0 ? '+' : ''
    };
  });

  const modsFormatted = modsSum >= 0 ? `+${modsSum}` : `${modsSum}`;
  const rawDice = stdAtkObj.damageDice ? stdAtkObj.damageDice.toLowerCase().replace('w', 'd') : '1d6';
  const formulaFormatted = modsSum === 0 ? rawDice : `${rawDice} ${modsFormatted}`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 2400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 24px',
          width: '310px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: 'var(--font-title)',
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '2px' }}>
          ⚔️ {weapon.name || 'Weapon'} (Damage)
        </div>
        <div className="dialog-subtitle" style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '6px' }}>
          Choose damage options
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 10px' }} />

        {(hasPaladin && isMelee || favoredEnemyBonus > 0 || sneakAttackDice > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px', padding: '4px 8px', background: 'rgba(200,169,110,0.05)', border: '0.5px solid rgba(200,169,110,0.2)', borderRadius: '3px', textAlign: 'left', fontSize: '8px', fontFamily: 'var(--font-body)' }}>
            {hasPaladin && isMelee && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0, fontWeight: 'bold', color: 'var(--red)' }}>
                <input
                  type="checkbox"
                  checked={smiteActive}
                  onChange={handleSmiteChange}
                  style={{ margin: 0, width: '11px', height: '11px', cursor: 'pointer' }}
                />
                Smite Evil (+{paladinClass.level} Damage)
              </label>
            )}
            {favoredEnemyBonus > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0, fontWeight: 'bold', color: '#1a4a1a' }}>
                <input
                  type="checkbox"
                  checked={favoredEnemyActive}
                  onChange={handleFavoredEnemyChange}
                  style={{ margin: 0, width: '11px', height: '11px', cursor: 'pointer' }}
                />
                Vs Favored Enemy (+{favoredEnemyBonus} Damage)
              </label>
            )}
            {sneakAttackDice > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0, fontWeight: 'bold', color: '#a0522d' }}>
                <input
                  type="checkbox"
                  checked={sneakActive}
                  onChange={handleSneakChange}
                  style={{ margin: 0, width: '11px', height: '11px', cursor: 'pointer' }}
                />
                Sneak Attack (+{sneakAttackDice}d6 Damage)
              </label>
            )}
          </div>
        )}

        <div className="dialog-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ textAlign: 'left', background: 'rgba(200, 169, 110, 0.04)', border: '1px solid var(--pb)', borderRadius: '3px', padding: '10px', fontFamily: 'var(--font-body)' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '5px', borderBottom: '0.5px solid rgba(200,169,110,0.3)', paddingBottom: '3px' }}>
              Damage Modifiers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9.5px', color: 'var(--inkm)' }}>
              {rows.map((row: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '9.5px', color: 'var(--inkm)' }}>{row.label}:</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--ink)' }}>{row.sign}{row.value}</span>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '0.5px dashed rgba(200,169,110,0.3)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>
                <span>Total Modifier:</span>
                <span>{modsFormatted}</span>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200,169,110,0.3)', margin: '6px 0 4px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-title)', fontSize: '10.5px', fontWeight: 'bold', color: 'var(--red)' }}>
              <span>ROLL FORMULA:</span>
              <span>{formulaFormatted}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-close-choice"
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '8px',
            padding: '2px 10px',
            marginTop: '10px',
            cursor: 'pointer',
            background: 'transparent',
            border: '0.5px solid var(--red)',
            borderRadius: '1px',
            color: 'var(--red)',
            fontWeight: 'bold',
            outline: 'none',
            transition: 'color 0.15s, border-color 0.15s'
          }}
        >
          Done!
        </button>
      </div>
    </div>
  );
};
