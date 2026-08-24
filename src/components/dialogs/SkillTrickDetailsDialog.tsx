import React from 'react';
import { CombatState } from '@core/state.js';
import { CombatRules } from '@core/rules.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface SkillTrickDetailsDialogProps {
  trick: any;
  pc: any;
  isLearned: boolean;
  isBonus: boolean;
  onClose: () => void;
}

export const SkillTrickDetailsDialog: React.FC<SkillTrickDetailsDialogProps> = ({
  trick,
  pc,
  isLearned,
  isBonus,
  onClose
}) => {
  const categoryLabel =
    ({
      interaction: 'Interaction Trick',
      manipulation: 'Manipulation Trick',
      mental: 'Mental Trick',
      movement: 'Movement Trick'
    } as Record<string, string>)[trick.category] || 'Skill Trick';

  // Evaluate prerequisites
  const { met, details: prereqsDetails } = CombatRules.checkSkillTrickPrerequisites(trick.key, pc);

  // Check if character can afford learning
  const spentSP = CombatRules.calculateSpentSkillPoints(pc);
  const totalSP = CombatRules.calculateTotalSkillPoints(pc);
  const skillPointsAvailable = totalSP - spentSP;
  const canAfford = skillPointsAvailable >= 2;

  // Check max limit
  const limit = CombatRules.getMaxSkillTricksLimit(pc);
  const nonBonusCount = pc.skillTricks ? pc.skillTricks.filter((t: any) => typeof t === 'object' ? !t.isBonus : true).length : 0;
  const limitReached = nonBonusCount >= limit;

  // Battle Trickster check for unspent bonus tricks
  let allowedBonusTricks = 0;
  if (Array.isArray(pc.classes)) {
    const bt = pc.classes.find((c: any) => c.classType === 'battle_trickster');
    if (bt) {
      if (bt.level >= 1) allowedBonusTricks += 1;
      if (bt.level >= 3) allowedBonusTricks += 1;
    }
  }
  const spentBonusTricks = pc.skillTricks ? pc.skillTricks.filter((t: any) => typeof t === 'object' && t.isBonus).length : 0;
  const hasAvailableBonusTrickSlot = spentBonusTricks < allowedBonusTricks;

  const handleLearn = (learnAsBonus: boolean) => {
    const result = CombatState.addPCSkillTrick(trick.key, learnAsBonus);
    if (result && !result.success) {
      showCustomAlert('Prerequisites Not Met', result.error.replace(/\n/g, '<br>'), 'Understood', '🔒');
      return;
    }
    showCustomAlert('Learned', `You have successfully learned the skill trick "${trick.nameEn || trick.nameDe}".`, 'Great', '✓');
    onClose();
  };

  const handleUnlearn = () => {
    CombatState.removePCSkillTrick(trick.key);
    showCustomAlert('Unlearned', `You have unlearned the skill trick "${trick.nameEn || trick.nameDe}".`, 'OK', '✓');
    onClose();
  };

  return (
    <div
      className="dialog-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="parchment-border"
        style={{
          background: '#fcf6e3',
          border: '3px double #8b1a1a',
          borderRadius: '4px',
          padding: '4px',
          width: '320px',
          maxWidth: '92vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1)',
          fontFamily: "'IM Fell English SC', serif",
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        {/* Scroll parchment content */}
        <div
          className="ancient-parchment"
          style={{
            background: '#f4e8c1',
            border: '2px solid #8b1a1a',
            padding: '12px 16px',
            borderRadius: '4px',
            boxShadow: 'inset 0 0 35px rgba(139, 26, 26, 0.15)',
            fontFamily: "'Crimson Text', serif",
            color: '#1a0f00',
            lineHeight: 1.4,
            textAlign: 'left',
            maxHeight: '54vh',
            overflowY: 'auto',
            boxSizing: 'border-box'
          }}
        >
          <h3
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '13.5px',
              color: '#8b1a1a',
              textAlign: 'center',
              borderBottom: '2px solid #8b1a1a',
              paddingBottom: '4px',
              margin: '0 0 8px 0',
              letterSpacing: '0.8px',
              fontWeight: 'bold'
            }}
          >
            {trick.nameEn || trick.nameDe}
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px 10px',
              fontSize: '9px',
              borderBottom: '0.5px dashed rgba(139, 26, 26, 0.3)',
              paddingBottom: '6px',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}
          >
            <div><strong>Category:</strong> {categoryLabel}</div>
            <div><strong>Met:</strong> {met ? 'Yes' : 'No'}</div>
            <div style={{ gridColumn: 'span 2' }}>
              <strong>Cost:</strong> <span style={{ color: '#8b1a1a' }}>2 SP (or free as a bonus trick)</span>
            </div>
          </div>

          <div style={{ fontSize: '9.5px', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif", fontSize: '10px' }}>
              Prerequisites:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
              {prereqsDetails.length === 0 ? (
                <div style={{ color: '#2a6a2a', fontWeight: 'bold', fontSize: '9px' }}>None</div>
              ) : (
                prereqsDetails.map((pr: any, idx: number) => {
                  const color = pr.met ? '#2a6a2a' : '#8b1a1a';
                  const mark = pr.met ? '✓' : '✗';
                  return (
                    <div key={idx} style={{ color, fontWeight: 500, fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{mark}</span>
                      <span>{pr.desc}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ fontSize: '9.5px', marginBottom: '6px', lineHeight: 1.35 }}>
            <strong style={{ color: '#8b1a1a', fontFamily: "'IM Fell English SC', serif" }}>Benefit:</strong>
            <div style={{ fontStyle: 'italic', color: '#2a1b0a', paddingLeft: '4px' }}>
              {trick.benefitEn || trick.benefitDe}
            </div>
          </div>
        </div>

        {/* Buttons footer */}
        <div style={{ padding: '8px 10px 4px 10px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {isLearned ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
              {isBonus && (
                <div style={{ fontSize: '8px', color: '#2a6a2a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Bonus Trick (Battle Trickster)
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleUnlearn}
                  className="btn btn-close-feat"
                  style={{
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '9px',
                    padding: '4px 16px',
                    cursor: 'pointer',
                    background: '#8b1a1a',
                    border: '1px solid #8b1a1a',
                    borderRadius: '2px',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  Unlearn
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-close-feat"
                  style={{
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '9px',
                    padding: '4px 16px',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '1px solid var(--pb)',
                    borderRadius: '2px',
                    color: 'var(--inkl)',
                    outline: 'none'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {hasAvailableBonusTrickSlot && met && (
                  <button
                    onClick={() => handleLearn(true)}
                    className="btn btn-learn-feat"
                    style={{
                      fontFamily: "'IM Fell English SC', serif",
                      fontSize: '9px',
                      padding: '4px 12px',
                      cursor: 'pointer',
                      background: '#2a6a2a',
                      border: '1px solid #2a6a2a',
                      borderRadius: '2px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  >
                    Learn as Bonus Trick (Free)
                  </button>
                )}
                
                <button
                  onClick={() => handleLearn(false)}
                  disabled={!met || !canAfford || limitReached}
                  className="btn btn-learn-feat"
                  style={{
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '9px',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    background: met && canAfford && !limitReached ? 'var(--pb)' : 'rgba(0,0,0,0.1)',
                    border: '1px solid var(--pb)',
                    borderRadius: '2px',
                    color: met && canAfford && !limitReached ? 'var(--inkd)' : 'var(--inkl)',
                    opacity: met && canAfford && !limitReached ? 1 : 0.5,
                    outline: 'none'
                  }}
                >
                  {limitReached ? 'Limit Reached' : !canAfford ? 'Not enough SP (2 SP)' : 'Learn (2 SP)'}
                </button>

                <button
                  onClick={onClose}
                  className="btn btn-close-feat"
                  style={{
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '9px',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '1px solid var(--pb)',
                    borderRadius: '2px',
                    color: 'var(--inkl)',
                    outline: 'none'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
