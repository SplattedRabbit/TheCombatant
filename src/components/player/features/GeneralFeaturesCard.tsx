import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { showCustomConfirm } from '@core/ui/components/dialogs.js';

interface GeneralFeaturesCardProps {
  pc: any;
}

export const GeneralFeaturesCard: React.FC<GeneralFeaturesCardProps> = ({ pc }) => {
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
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '5px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>📋 General Daily Abilities</span>
      </div>
      
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '2px', borderBottom: '0.5px solid rgba(200,169,110,0.2)' }}>
            <h3 style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--red)', margin: 0, lineHeight: 1 }}>Daily Abilities</h3>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn" 
              style={{ fontSize: '7px', padding: '0 4px', lineHeight: 1 }}
            >
              {showAddForm ? '✕' : '+'}
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '165px', overflowY: 'auto' }}>
            {!hasGeneralAbilities ? (
              <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '4px 0' }}>
                No abilities registered
              </div>
            ) : (
              pc.dailyAbilities.map((ab: any, idx: number) => {
                if (EXCLUDED_ABILITIES.includes(ab.name)) return null;
                const remaining = ab.max - ab.used;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)', paddingBottom: '2px' }}>
                    <span style={{ fontWeight: 600, width: '90px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={ab.name}>
                      {ab.name}
                    </span>
                    <span style={{ fontSize: '7.5px', color: 'var(--inkm)' }}>
                      {remaining} / {ab.max}
                    </span>
                    <div style={{ display: 'flex', gap: '2.5px', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleSpend(idx, -1)}
                        className="xbtn xbtn-heal" 
                        style={{ padding: 0, fontSize: '8.5px', width: '15px', height: '15px', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                        title="Restore use"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => handleSpend(idx, 1)}
                        className="xbtn xbtn-dmg" 
                        style={{ padding: 0, fontSize: '8.5px', width: '15px', height: '15px', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center' } as any} 
                        title="Spend use"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => handleDelete(idx, ab.name)}
                        className="xbtn xbtn-del" 
                        style={{ padding: '0 2px', fontSize: '8px', marginLeft: '1px', height: '15px', lineHeight: '13px' }} 
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(200, 169, 110, 0.15)', border: '0.5px solid var(--pb)', padding: '3px', borderRadius: '2px', marginTop: '4px' }}>
              <input 
                type="text" 
                value={newAbName}
                onChange={(e) => setNewAbName(e.target.value)}
                placeholder="Hero's Wrath" 
                className="cinput" 
                style={{ fontSize: '8px', height: '14px' }}
              />
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  value={newAbMax}
                  onChange={(e) => setNewAbMax(e.target.value)}
                  placeholder="Max" 
                  className="cinput" 
                  style={{ width: '28px', fontSize: '8px', height: '14px', padding: 0, textAlign: 'center' }}
                />
                <button 
                  onClick={handleAddAbility}
                  className="btn btn-p" 
                  style={{ fontSize: '7px', padding: '1px 4px' }}
                >
                  Ok
                </button>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="btn" 
                  style={{ fontSize: '7px', padding: '1px 4px' }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
