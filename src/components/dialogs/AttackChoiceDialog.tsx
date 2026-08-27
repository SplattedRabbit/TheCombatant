import React, { useState } from 'react';
import { AttackEngine } from '@core/rules/AttackEngine.js';
import { matchesFeatOption, getCritThreatDisplay } from '@core/models/Weapon.js';
import { CombatState } from '@core/state.js';

interface AttackChoiceDialogProps {
  pc: any;
  weapon: any;
  options?: any;
  onClose: () => void;
}

export const AttackChoiceDialog: React.FC<AttackChoiceDialogProps> = ({
  pc,
  weapon,
  options = {},
  onClose
}) => {
  const [currentView, setCurrentView] = useState<'grid' | 'std' | 'full'>('grid');
  const [smiteActive, setSmiteActive] = useState<boolean>(options.smite !== undefined ? !!options.smite : !!pc.isSmiteActive);
  const favoredEnemyActive = options.favoredEnemy !== undefined ? !!options.favoredEnemy : !!pc.isFavoredEnemyActive;
  const sneakActive = options.sneakAttack !== undefined ? !!options.sneakAttack : !!pc.isSneakAttacking;

  const hasPaladin = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'paladin');
  const paladinClass = hasPaladin ? pc.classes.find((c: any) => c.classType === 'paladin') : null;

  const isRanged = weapon.grip === 'rng';
  const isMelee = !isRanged;

  const formatMod = (n: number) => (n >= 0 ? '+' : '') + n;

  // Calculate sequences based on current state
  const stdSeq = AttackEngine.calculateAttackSequence(pc, weapon, false, {
    smite: smiteActive,
    favoredEnemy: favoredEnemyActive,
    sneakAttack: sneakActive,
    ...options
  });

  const fullSeq = AttackEngine.calculateAttackSequence(pc, weapon, true, {
    smite: smiteActive,
    favoredEnemy: favoredEnemyActive,
    sneakAttack: sneakActive,
    ...options
  });

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

  const stdAtk = stdSeq[0] || { atkTotal: 0, atkBreakdown: [] };
  const doubleThreat = weapon.isKeen || (pc.feats && pc.feats.some((f: any) => 
    (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') && 
    matchesFeatOption(weapon, f.option)
  ));
  const doubledCritDisplay = getCritThreatDisplay(weapon.crit, doubleThreat);

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
          ⚔️ {weapon.name || 'Weapon'}
        </div>
        <div className="dialog-subtitle" style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '6px' }}>
          {currentView === 'grid' && 'Choose attack type'}
          {currentView === 'std' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Standard Attack selected</span>
              <span
                onClick={() => setCurrentView('grid')}
                style={{
                  fontSize: '7.5px',
                  cursor: 'pointer',
                  border: '0.5px solid var(--pb)',
                  borderRadius: '2.5px',
                  padding: '1px 5px',
                  color: 'var(--red)',
                  background: 'rgba(139,26,26,0.05)',
                  fontFamily: 'var(--font-title)',
                  fontWeight: 'bold'
                }}
              >
                ← Back
              </span>
            </div>
          )}
          {currentView === 'full' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>Full Attack selected</span>
              <span
                onClick={() => setCurrentView('grid')}
                style={{
                  fontSize: '7.5px',
                  cursor: 'pointer',
                  border: '0.5px solid var(--pb)',
                  borderRadius: '2.5px',
                  padding: '1px 5px',
                  color: 'var(--red)',
                  background: 'rgba(139,26,26,0.05)',
                  fontFamily: 'var(--font-title)',
                  fontWeight: 'bold'
                }}
              >
                ← Back
              </span>
            </div>
          )}
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 10px' }} />

        {hasPaladin && isMelee && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px', padding: '4px 8px', background: 'rgba(200,169,110,0.05)', border: '0.5px solid rgba(200,169,110,0.2)', borderRadius: '3px', textAlign: 'left', fontSize: '8px', fontFamily: 'var(--font-body)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', margin: 0, fontWeight: 'bold', color: 'var(--red)' }}>
              <input
                type="checkbox"
                checked={smiteActive}
                onChange={handleSmiteChange}
                style={{ margin: 0, width: '11px', height: '11px', cursor: 'pointer' }}
              />
              Smite Evil (+{Math.max(0, pc.getAttributeMod('cha'))} Atk / +{paladinClass.level} Dmg)
            </label>
          </div>
        )}

        <div className="dialog-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '120px' }}>
          {currentView === 'grid' && (
            <>
              {/* Standard Attack Choice Card */}
              <div
                onClick={() => setCurrentView('std')}
                style={{
                  background: 'rgba(200, 169, 110, 0.1)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s, border-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 26, 26, 0.05)';
                  e.currentTarget.style.borderColor = 'var(--red)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(200, 169, 110, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--pb)';
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)' }}>Standard Attack</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--inkm)', lineHeight: 1.2, marginTop: '2px' }}>
                  A single attack with your full attack bonus.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '0.5px dotted rgba(200,169,110,0.4)', paddingTop: '4px' }}>
                  <span style={{ fontSize: '7px', color: 'var(--inkl)' }}>Formula:</span>
                  <span style={{ fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                    1d20 {formatMod(stdAtk.atkTotal)}
                    {doubledCritDisplay && (
                      <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'normal', marginLeft: '3px' }}>
                        (Crit: {doubledCritDisplay})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Full Attack Choice Card */}
              <div
                onClick={() => setCurrentView('full')}
                style={{
                  background: 'rgba(200, 169, 110, 0.1)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s, border-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(139, 26, 26, 0.05)';
                  e.currentTarget.style.borderColor = 'var(--red)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(200, 169, 110, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--pb)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)' }}>Full Attack</span>
                  <span style={{ fontSize: '7px', background: 'rgba(139,26,26,0.1)', color: 'var(--red)', padding: '0 3px', borderRadius: '1px', fontWeight: 'bold' }}>
                    {fullSeq.length}x
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--inkm)', lineHeight: 1.2, marginTop: '2px' }}>
                  Perform all available attacks.
                </div>
                <div style={{ marginTop: '4px', borderTop: '0.5px dotted rgba(200,169,110,0.4)', paddingTop: '4px', fontSize: '8.5px', color: 'var(--inkm)', fontFamily: 'var(--font-title)' }}>
                  {fullSeq.map((atk: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span>{atk.name}:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>
                        1d20 {formatMod(atk.atkTotal)}
                        {doubledCritDisplay && (
                          <span style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'normal', marginLeft: '3px' }}>
                            (Crit: {doubledCritDisplay})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentView === 'std' && (
            <div style={{ textAlign: 'left', background: 'rgba(200, 169, 110, 0.04)', border: '1px solid var(--pb)', borderRadius: '3px', padding: '10px', fontFamily: 'var(--font-body)' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '5px', borderBottom: '0.5px solid rgba(200,169,110,0.3)', paddingBottom: '3px' }}>
                Attack Modifiers
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9.5px', color: 'var(--inkm)' }}>
                {Array.isArray(stdAtk.atkBreakdown) && stdAtk.atkBreakdown.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.label}:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{formatMod(item.value)}</span>
                  </div>
                ))}
                <hr style={{ border: 'none', borderTop: '0.5px dashed rgba(200,169,110,0.3)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>
                  <span>Total Modifier:</span>
                  <span>{formatMod(stdAtk.atkTotal)}</span>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200,169,110,0.3)', margin: '6px 0 4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-title)', fontSize: '10.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                <span>ROLL FORMULA:</span>
                <span>1d20 {formatMod(stdAtk.atkTotal)}</span>
              </div>
            </div>
          )}

          {currentView === 'full' && (
            <div style={{ textAlign: 'left', background: 'rgba(200, 169, 110, 0.04)', border: '1px solid var(--pb)', borderRadius: '3px', padding: '8px 10px', maxHeight: '200px', overflowY: 'auto' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '3px', borderBottom: '0.5px solid rgba(200,169,110,0.3)', paddingBottom: '3px' }}>
                Attack Modifiers (Full Attack)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {fullSeq.map((atk: any, idx: number) => (
                  <div key={idx} style={{ marginTop: '4px', borderBottom: '0.5px dotted rgba(200, 169, 110, 0.2)', paddingBottom: '3px', fontFamily: 'var(--font-body)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--red)', fontSize: '9.5px', fontFamily: 'var(--font-title)' }}>
                      <span>{atk.name}:</span>
                      <span>1d20 {formatMod(atk.atkTotal)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5px', fontSize: '7.5px', color: 'var(--inkm)', paddingLeft: '6px', marginTop: '1px' }}>
                      {Array.isArray(atk.atkBreakdown) && atk.atkBreakdown.map((item: any, bIdx: number) => (
                        <div key={bIdx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.label}:</span>
                          <span>{formatMod(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn btn-close-choice"
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '8px',
            padding: '2px 10px',
            marginTop: '10px',
            cursor: 'pointer',
            background: 'transparent',
            border: currentView === 'grid' ? '0.5px solid var(--pb)' : '0.5px solid var(--red)',
            borderRadius: '1px',
            color: currentView === 'grid' ? 'var(--inkl)' : 'var(--red)',
            fontWeight: currentView === 'grid' ? 'normal' : 'bold',
            outline: 'none',
            transition: 'color 0.15s, border-color 0.15s'
          }}
        >
          {currentView === 'grid' ? 'Cancel' : 'Done!'}
        </button>
      </div>
    </div>
  );
};
