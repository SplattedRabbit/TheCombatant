import React, { useState } from 'react';
// @ts-ignore
import { SKILL_TRICKS_REGISTRY } from '@core/data/skillTricks-data.js';
// @ts-ignore
import { CombatRules } from '@core/rules.js';
// @ts-ignore
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface SkillTricksTabContentProps {
  currentConfig: any;
  levelConfigs: any[];
  currentLevelIndex: number;
  currentDraft: any;
  currentLevelRemainingSkillPoints: number;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
}

export const SkillTricksTabContent: React.FC<SkillTricksTabContentProps> = ({
  currentConfig,
  levelConfigs,
  currentLevelIndex,
  currentDraft,
  currentLevelRemainingSkillPoints,
  updateLevelConfig
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const draftPC = currentDraft?.draftPC;
  const maxTricksLimit = draftPC ? CombatRules.getMaxSkillTricksLimit(draftPC) : Math.floor((currentLevelIndex + 1) / 2);

  // Tricks learned at previous levels: map of trickKey -> level (1-indexed)
  const priorLearnedMap: Record<string, number> = {};
  for (let i = 0; i < currentLevelIndex; i++) {
    const cfg = levelConfigs[i];
    if (cfg && Array.isArray(cfg.skillTricks)) {
      cfg.skillTricks.forEach((tKey: string) => {
        priorLearnedMap[tKey] = i + 1;
      });
    }
  }

  const currentLevelTricks: string[] = Array.isArray(currentConfig.skillTricks) ? currentConfig.skillTricks : [];

  // Total learned up to current level
  const totalLearnedCount = Object.keys(priorLearnedMap).length + currentLevelTricks.length;
  const isLimitReached = totalLearnedCount >= maxTricksLimit;

  const handleLearn = (trickKey: string) => {
    if (currentLevelTricks.includes(trickKey)) return;
    if (currentLevelRemainingSkillPoints < 2) {
      showCustomAlert("Skill Points Missing", "You need at least 2 remaining Skill Points to learn a Skill Trick.", "OK", "🔒");
      return;
    }
    if (isLimitReached) {
      showCustomAlert("Skill Trick Limit Reached", `You can have at most ${maxTricksLimit} Skill Tricks at Level ${currentLevelIndex + 1} (Max = Level / 2).`, "OK", "🔒");
      return;
    }

    const { met, details } = CombatRules.checkSkillTrickPrerequisites(trickKey, draftPC);
    if (!met) {
      const unmetList = details.filter((d: any) => !d.met).map((d: any) => `• ${d.desc}`).join('<br/>');
      showCustomAlert("Prerequisites Missing", `<div style="text-align:left;">You do not meet the prerequisites for this Skill Trick yet:<br/><br/>${unmetList}</div>`, "OK", "🔒");
      return;
    }

    const nextTricks = [...currentLevelTricks, trickKey];
    updateLevelConfig(currentLevelIndex, 'skillTricks', nextTricks);
  };

  const handleRemove = (trickKey: string) => {
    const nextTricks = currentLevelTricks.filter(k => k !== trickKey);
    updateLevelConfig(currentLevelIndex, 'skillTricks', nextTricks);
  };

  const allTricks = Object.values(SKILL_TRICKS_REGISTRY) as any[];

  const filteredTricks = allTricks.filter(trick => {
    if (categoryFilter !== 'all' && trick.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (trick.nameEn && trick.nameEn.toLowerCase().includes(q)) ||
                        (trick.nameDe && trick.nameDe.toLowerCase().includes(q));
      const matchDesc = (trick.benefitEn && trick.benefitEn.toLowerCase().includes(q)) ||
                        (trick.benefitDe && trick.benefitDe.toLowerCase().includes(q));
      return matchName || matchDesc;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '420px' }}>
      {!currentConfig.classType ? (
        <div style={{ padding: '40px', fontSize: '12px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center' }}>
          Select a class on the left to configure Skill Tricks.
        </div>
      ) : (
        <>
          {/* Symmetrical Search & Filter Row */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={`Search skill trick (${totalLearnedCount} / ${maxTricksLimit} tricks)...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cinput"
              style={{
                flex: 1,
                padding: '4px 8px',
                fontSize: '11px',
                height: '24px',
                boxSizing: 'border-box'
              }}
            />
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="cinput"
              style={{
                width: '120px',
                padding: '0 4px',
                fontSize: '11px',
                height: '24px',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Categories</option>
              <option value="movement">Movement</option>
              <option value="interaction">Interaction</option>
              <option value="mental">Mental</option>
              <option value="manipulation">Manipulation</option>
            </select>
          </div>

          {/* Limit / SP Notice */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.02)',
              border: '0.5px solid var(--pb)',
              borderRadius: '2px',
              padding: '4px 8px',
              fontSize: '9px',
              fontFamily: "'Crimson Text', serif"
            }}
          >
            <div>
              <strong>Skill Tricks:</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{totalLearnedCount} / {maxTricksLimit}</span> (Cost: 2 SP each)
            </div>
            <div>
              <strong>Available SP:</strong> <span style={{ color: currentLevelRemainingSkillPoints < 2 ? 'var(--red)' : '#2e7d32', fontWeight: 'bold' }}>{currentLevelRemainingSkillPoints} SP</span>
            </div>
          </div>

          {/* Tricks List */}
          <div
            style={{
              flex: 1,
              maxHeight: '380px',
              overflowY: 'auto',
              border: '1px solid var(--pb)',
              borderRadius: '3px',
              background: 'white',
              padding: '4px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {filteredTricks.length === 0 ? (
              <div style={{ padding: '20px', fontSize: '11px', fontStyle: 'italic', color: 'var(--inkl)', textAlign: 'center' }}>
                No skill tricks found matching your filter.
              </div>
            ) : (
              filteredTricks.map((trick) => {
                const isPrior = !!priorLearnedMap[trick.key];
                const isCurrent = currentLevelTricks.includes(trick.key);
                const { met, details } = CombatRules.checkSkillTrickPrerequisites(trick.key, draftPC);

                const categoryLabel = (({
                  movement: 'Movement',
                  interaction: 'Interaction',
                  mental: 'Mental',
                  manipulation: 'Manipulation'
                } as Record<string, string>)[trick.category]) || 'General';

                const canLearn = !isPrior && !isCurrent && met && !isLimitReached && currentLevelRemainingSkillPoints >= 2;

                const borderColor = isCurrent ? 'var(--red)' : (isPrior ? 'var(--pb)' : (met ? 'var(--pb)' : 'rgba(0,0,0,0.15)'));
                const bgColor = isCurrent ? 'rgba(139, 26, 26, 0.04)' : (isPrior ? 'rgba(200, 169, 110, 0.06)' : (met ? 'rgba(200, 169, 110, 0.03)' : 'rgba(0,0,0,0.02)'));
                const opacity = isPrior ? 0.75 : (met || isCurrent ? 1 : 0.6);

                return (
                  <div
                    key={trick.key}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '3px',
                      border: `1px solid ${borderColor}`,
                      borderLeft: `3.5px solid ${borderColor}`,
                      background: bgColor,
                      opacity,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: isCurrent ? 'var(--red)' : 'var(--ink)' }}>
                          🎭 {trick.nameEn || trick.nameDe}
                        </span>
                        <span style={{ fontSize: '7.5px', background: 'rgba(0,0,0,0.05)', color: 'var(--inkm)', padding: '0 4px', borderRadius: '1px' }}>
                          {categoryLabel}
                        </span>
                      </div>

                      {/* Action / Status */}
                      <div>
                        {isPrior ? (
                          <span style={{ fontSize: '7.5px', color: '#7c5a2b', fontWeight: 'bold', background: 'rgba(200, 169, 110, 0.15)', border: '0.5px solid rgba(200, 169, 110, 0.3)', padding: '1px 4px', borderRadius: '1.5px' }}>
                            ✓ Lvl {priorLearnedMap[trick.key]}
                          </span>
                        ) : isCurrent ? (
                          <button
                            type="button"
                            onClick={() => handleRemove(trick.key)}
                            className="xbtn"
                            style={{
                              fontSize: '8px',
                              padding: '2px 6px',
                              color: 'var(--red)',
                              borderColor: 'var(--red)',
                              cursor: 'pointer'
                            }}
                          >
                            ✕ Remove (-2 SP)
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!met) {
                                const unmetList = details.filter((d: any) => !d.met).map((d: any) => `• ${d.desc}`).join('<br/>');
                                showCustomAlert(
                                  `Prerequisites for ${trick.nameEn || trick.nameDe}`,
                                  `<div style="text-align:left;">Prerequisites not met yet:<br/><br/>${unmetList}</div>`,
                                  "OK",
                                  "🔒"
                                );
                              } else {
                                handleLearn(trick.key);
                              }
                            }}
                            className="btn"
                            disabled={!canLearn && met}
                            style={{
                              fontSize: '8.5px',
                              padding: '2px 8px',
                              fontFamily: "'IM Fell English SC', serif",
                              background: met && canLearn ? 'rgba(42, 106, 42, 0.1)' : 'transparent',
                              border: `1px solid ${met && canLearn ? '#2a6a2a' : 'var(--pb)'}`,
                              color: met && canLearn ? '#2a6a2a' : (!met ? 'var(--red)' : 'var(--inkm)'),
                              fontWeight: 'bold',
                              cursor: !met ? 'help' : (canLearn ? 'pointer' : 'not-allowed')
                            }}
                            title={!met ? "Prerequisites missing (click to inspect)" : (canLearn ? "Learn for 2 SP" : "Cannot learn (SP or Limit reached)")}
                          >
                            {!met ? '🔒 Locked' : '+ Learn (2 SP)'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Prerequisites inline list */}
                    {details.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '8px' }}>
                        {details.map((d: any, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              color: d.met ? '#2e7d32' : 'var(--red)',
                              fontWeight: d.met ? 'normal' : 'bold'
                            }}
                          >
                            {d.met ? '✓' : '✗'} {d.desc}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Benefit description */}
                    <div style={{ fontSize: '9px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", lineHeight: 1.25 }}>
                      {trick.benefitEn || trick.benefitDe}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
