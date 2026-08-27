import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { showCustomConfirm } from '@core/ui/components/dialogs.js';

interface GeneralFeaturesCardProps {
  pc: any;
}

export const GeneralFeaturesCard: React.FC<GeneralFeaturesCardProps> = ({ pc }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAbName, setNewAbName] = useState('');
  const [newAbMax, setNewAbMax] = useState('1');

  const handleAddAbility = () => {
    if (newAbName.trim()) {
      const maxVal = parseInt(newAbMax) || 1;
      CombatState.addPCDailyAbility(newAbName.trim(), maxVal);
      setNewAbName('');
      setNewAbMax('1');
      setShowAddForm(false);
    }
  };

  const handleSpend = (idx: number, delta: number) => {
    CombatState.updatePCDailyAbilityUsed(idx, delta);
  };

  const handleDelete = (idx: number, name: string) => {
    showCustomConfirm("Delete?", `Do you want to delete "${name}"?`, () => {
      CombatState.removePCDailyAbility(idx);
    });
  };

  // Exclude class-specific abilities from this general list
  const EXCLUDED_ABILITIES = [
    "Kampfrausch (Rage)",
    "Rage",
    "Böses niederstrecken",
    "Smite Evil",
    "Hände auflegen",
    "Lay on Hands",
    "Untote vertreiben",
    "Turn Undead",
    "Bardisches Lied",
    "Bardic Music",
    "Tiergestalt",
    "Wild Shape"
  ];

  const hasGeneralAbilities = pc.dailyAbilities && pc.dailyAbilities.some(
    (ab: any) => !EXCLUDED_ABILITIES.includes(ab.name)
  );

  return (
    <div className={`class-card ${isExpanded ? 'expanded' : ''}`} style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div 
        className="class-card-hdr" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-title)', fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>📋 General Daily Abilities</span>
        <span style={{ fontSize: '8px', color: 'var(--inkl)', transition: 'transform 0.2s ease' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      
      {isExpanded && (
        <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%', borderTop: '0.5px solid rgba(200, 169, 110, 0.2)' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '9px', color: 'var(--red)', margin: 0, lineHeight: 1 }}>Daily Abilities</h3>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                width: '18px',
                height: '18px',
                minWidth: 'unset',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                borderRadius: '2px',
                background: showAddForm ? 'rgba(139, 26, 26, 0.12)' : 'rgba(200, 169, 110, 0.15)',
                border: `0.5px solid ${showAddForm ? 'var(--red)' : 'var(--pb)'}`,
                color: showAddForm ? 'var(--red)' : 'var(--ink)',
                cursor: 'pointer',
                lineHeight: 1,
                userSelect: 'none'
              }}
              title={showAddForm ? 'Cancel' : 'Add daily ability'}
            >
              {showAddForm ? '✕' : '+'}
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!hasGeneralAbilities ? (
              <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '6px 0' }}>
                No custom daily abilities registered
              </div>
            ) : (
              pc.dailyAbilities.map((ab: any, idx: number) => {
                if (EXCLUDED_ABILITIES.includes(ab.name)) return null;
                const remaining = ab.max - ab.used;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)', padding: '2px 0' }}>
                    <span style={{ fontWeight: 600, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: '4px' }} title={ab.name}>
                      {ab.name}
                    </span>
                    <span style={{ fontSize: '7.5px', color: 'var(--inkm)', marginRight: '6px', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}>
                      {remaining} / {ab.max}
                    </span>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleSpend(idx, -1)}
                        style={{
                          width: '18px',
                          height: '18px',
                          minWidth: 'unset',
                          padding: 0,
                          fontSize: '11px',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(42, 106, 42, 0.12)',
                          border: '0.5px solid #2a6a2a',
                          color: '#1a4a1a',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          lineHeight: 1,
                          userSelect: 'none'
                        }} 
                        title="Restore use (+1)"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => handleSpend(idx, 1)}
                        style={{
                          width: '18px',
                          height: '18px',
                          minWidth: 'unset',
                          padding: 0,
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(139, 26, 26, 0.12)',
                          border: '0.5px solid var(--red)',
                          color: 'var(--red)',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          lineHeight: 1,
                          userSelect: 'none'
                        }} 
                        title="Spend use (-1)"
                      >
                        −
                      </button>
                      <button 
                        onClick={() => handleDelete(idx, ab.name)}
                        style={{
                          width: '18px',
                          height: '18px',
                          minWidth: 'unset',
                          padding: 0,
                          fontSize: '9px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0, 0, 0, 0.04)',
                          border: '0.5px solid rgba(200, 169, 110, 0.4)',
                          color: 'var(--inkl)',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          lineHeight: 1,
                          userSelect: 'none'
                        }} 
                        title="Delete ability"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {showAddForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', background: 'rgba(200, 169, 110, 0.15)', border: '0.5px solid var(--pb)', padding: '4px', borderRadius: '2px', marginTop: '4px' }}>
              <input 
                type="text" 
                value={newAbName}
                onChange={(e) => setNewAbName(e.target.value)}
                placeholder="Ability name (e.g. Hero's Wrath)" 
                className="cinput" 
                style={{ fontSize: '8px', height: '18px', padding: '0 4px' }}
              />
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  value={newAbMax}
                  onChange={(e) => setNewAbMax(e.target.value)}
                  placeholder="Max" 
                  className="cinput" 
                  style={{ width: '35px', fontSize: '8px', height: '18px', padding: 0, textAlign: 'center' }}
                />
                <button 
                  onClick={handleAddAbility}
                  className="btn btn-p" 
                  style={{ fontSize: '8px', padding: '2px 8px', height: '18px', lineHeight: 1 }}
                >
                  Add
                </button>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="btn" 
                  style={{ fontSize: '8px', padding: '2px 6px', height: '18px', lineHeight: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
