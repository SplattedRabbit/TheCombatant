/**
 * @module    Step3TargetLevelPrompt
 * @summary   Prompt screen in Step 3 of the Character Wizard to select the character starting level.
 */

import React from 'react';

interface Step3TargetLevelPromptProps {
  targetLevel: number;
  setTargetLevel: (fn: (prev: number) => number) => void;
  onStart: () => void;
}

export const Step3TargetLevelPrompt: React.FC<Step3TargetLevelPromptProps> = ({
  targetLevel,
  setTargetLevel,
  onStart,
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '18px', color: 'var(--red)', marginBottom: '10px' }}>
        Set Character Target Level
      </h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--inkm)', maxWidth: '500px', margin: '0 auto 20px auto' }}>
        Choose which level your character should start at. You will configure class levels, hit points, skill points, and feats level by level in a step-by-step assistant.
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', margin: '30px 0' }}>
        <button 
          className="btn" 
          disabled={targetLevel <= 1}
          onClick={() => setTargetLevel(prev => Math.max(1, prev - 1))}
          style={{ padding: '6px 16px', fontSize: '16px', fontWeight: 'bold' }}
        >
          -
        </button>
        <span style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'var(--font-title)', width: '50px' }}>
          {targetLevel}
        </span>
        <button 
          className="btn" 
          disabled={targetLevel >= 20}
          onClick={() => setTargetLevel(prev => Math.min(20, prev + 1))}
          style={{ padding: '6px 16px', fontSize: '16px', fontWeight: 'bold' }}
        >
          +
        </button>
      </div>

      <button 
        onClick={onStart}
        className="btn btn-p"
        style={{ marginTop: '20px', padding: '8px 24px', fontSize: '13px' }}
      >
        ✦ Start Level Configuration
      </button>
    </div>
  );
};
