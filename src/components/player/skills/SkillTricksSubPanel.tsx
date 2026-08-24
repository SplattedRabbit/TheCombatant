/**
 * @module    SkillTricksSubPanel
 * @summary   Right-hand subpanel of the Skills tab displaying learned skill tricks and the trick compendium.
 */

import React, { useState, useMemo } from 'react';
import { CombatState } from '@core/state.js';
import { CombatRules } from '@core/rules.js';
import { SKILL_TRICKS_REGISTRY } from '@core/data/skillTricks-data.js';
import { SkillTrickDetailsDialog } from '../../dialogs/SkillTrickDetailsDialog';

export interface SkillTricksSubPanelProps {
  pc: any;
}

export const SkillTricksSubPanel: React.FC<SkillTricksSubPanelProps> = ({ pc }) => {
  const [tricksSearchQuery, setTricksSearchQuery] = useState('');
  const [tricksFilterCategory, setTricksFilterCategory] = useState<string>('all');
  const [selectedTrick, setSelectedTrick] = useState<any>(null);

  const learnedTricks = pc.skillTricks || [];
  const maxTricksLimit = CombatRules.getMaxSkillTricksLimit(pc);

  const filteredTricks = useMemo(() => {
    return Object.values(SKILL_TRICKS_REGISTRY).filter((trick: any) => {
      const q = tricksSearchQuery.toLowerCase().trim();
      const matchesQuery =
        trick.nameDe.toLowerCase().includes(q) ||
        trick.nameEn.toLowerCase().includes(q) ||
        trick.key.includes(q);
      const matchesCategory =
        tricksFilterCategory === 'all' || trick.category === tricksFilterCategory;
      return matchesQuery && matchesCategory;
    }).sort((a: any, b: any) => (a.nameEn || a.nameDe).localeCompare(b.nameEn || b.nameDe));
  }, [tricksSearchQuery, tricksFilterCategory]);

  return (
    <div style={{ flex: '4 1 0%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px', boxSizing: 'border-box' }}>
      <h3
        style={{
          fontFamily: "'IM Fell English SC', serif",
          fontSize: '11px',
          color: 'var(--red)',
          borderBottom: '1px solid var(--pb)',
          paddingBottom: '2px',
          margin: '0 0 4px 0',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>🎭 Skill Tricks</span>
        <span
          style={{
            fontSize: '8px',
            fontWeight: 'bold',
            background: 'rgba(200, 169, 110, 0.15)',
            color: '#7c5a2b',
            border: '0.5px solid var(--pb)',
            padding: '1px 4px',
            borderRadius: '1.5px',
          }}
        >
          {learnedTricks.length} / {maxTricksLimit}
        </span>
      </h3>

      {/* Learned Tricks Box */}
      <div
        style={{
          background: 'rgba(0,0,0,0.01)',
          border: '0.5px solid var(--pb)',
          borderRadius: '2px',
          padding: '5px',
          minHeight: '48px',
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <h4
          style={{
            margin: '0 0 4px 0',
            fontSize: '7.5px',
            color: 'var(--inkm)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Learned Tricks
        </h4>
        {learnedTricks.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {learnedTricks.map((t: any) => {
              const trickId = typeof t === 'object' ? t.id : t;
              const isBonus = typeof t === 'object' ? !!t.isBonus : false;
              const trickDef = SKILL_TRICKS_REGISTRY[trickId];
              if (!trickDef) return null;

              return (
                <div
                  key={trickId}
                  style={{
                    background: 'rgba(50, 115, 55, 0.06)',
                    border: '0.5px solid rgba(50, 115, 55, 0.35)',
                    borderLeft: '2.5px solid #2e7d32',
                    borderRadius: '2px',
                    padding: '2px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedTrick({ ...trickDef, isLearned: true, isBonus })}
                >
                  <span style={{ fontWeight: 'bold', color: '#245e28' }}>
                    {trickDef.nameEn || trickDef.nameDe}
                  </span>
                  {isBonus && (
                    <span style={{ fontSize: '6.5px', color: '#2e7d32', fontWeight: 'bold' }}>
                      (Bonus)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      CombatState.removePCSkillTrick(trickId);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#245e28',
                      fontSize: '8px',
                      padding: '0 2px',
                      lineHeight: 1,
                    }}
                    title="Remove Skill Trick"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>
            No skill tricks learned yet.
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', margin: '4px 0 2px 0' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {(['all', 'interaction', 'movement', 'manipulation', 'mental'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setTricksFilterCategory(cat)}
              style={{
                flex: 1,
                fontSize: '7.5px',
                fontFamily: "'IM Fell English SC', serif",
                padding: '2px 0',
                border: tricksFilterCategory === cat ? '1px solid var(--red)' : '0.5px solid var(--pb)',
                background: tricksFilterCategory === cat ? 'var(--red)' : 'transparent',
                color: tricksFilterCategory === cat ? '#fff' : 'var(--inkm)',
                borderRadius: '2px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={tricksSearchQuery}
          onChange={(e) => setTricksSearchQuery(e.target.value)}
          placeholder="Search trick..."
          className="cinput"
          style={{ fontSize: '8px', height: '18px', padding: '0 4px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Trick Compendium List */}
      <div
        style={{
          flex: 1,
          minHeight: '140px',
          maxHeight: '220px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          border: '0.5px dashed rgba(200, 169, 110, 0.3)',
          borderRadius: '2px',
          padding: '4px',
          boxSizing: 'border-box',
        }}
        className="pc-scroll-skills"
      >
        {filteredTricks.map((trick: any) => {
          const isLearned = learnedTricks.some((lt: any) =>
            typeof lt === 'object' ? lt.id === trick.key : lt === trick.key,
          );
          const isBonus = learnedTricks.some(
            (lt: any) => typeof lt === 'object' && lt.id === trick.key && lt.isBonus,
          );
          const { met } = CombatRules.checkSkillTrickPrerequisites(trick.key, pc);
          const spentSP = CombatRules.calculateSpentSkillPoints(pc);
          const totalSP = CombatRules.calculateTotalSkillPoints(pc);
          const freeSkillPoints = Math.max(0, totalSP - spentSP);
          const hasEnoughSP = freeSkillPoints >= 2;

          let borderStyle = '0.5px dashed rgba(140, 130, 120, 0.35)';
          let borderLeftStyle = '2.5px solid rgba(140, 130, 120, 0.4)';
          let bgStyle = 'rgba(0, 0, 0, 0.015)';
          let titleColor = 'var(--inkl)';
          let opacityVal = 0.48;

          if (isLearned) {
            borderStyle = '0.5px solid rgba(50, 115, 55, 0.35)';
            borderLeftStyle = '3.5px solid #2e7d32';
            bgStyle = 'rgba(50, 115, 55, 0.06)';
            titleColor = '#245e28';
            opacityVal = 1;
          } else if (met) {
            if (hasEnoughSP) {
              borderStyle = '0.5px solid rgba(184, 134, 11, 0.4)';
              borderLeftStyle = '3px solid #b8860b';
              bgStyle = 'rgba(212, 175, 55, 0.07)';
              titleColor = '#7d5f1a';
              opacityVal = 1;
            } else {
              borderStyle = '0.5px solid rgba(139, 26, 26, 0.35)';
              borderLeftStyle = '3px solid var(--red)';
              bgStyle = 'rgba(139, 26, 26, 0.04)';
              titleColor = 'var(--red)';
              opacityVal = 0.9;
            }
          }

          return (
            <div
              key={trick.key}
              onClick={() => {
                setSelectedTrick({ ...trick, isLearned, isBonus });
              }}
              style={{
                padding: '3.5px 6px',
                border: borderStyle,
                borderLeft: borderLeftStyle,
                background: bgStyle,
                boxShadow: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: opacityVal,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '8.5px',
                    fontWeight: met || isLearned ? 'bold' : '600',
                    color: titleColor,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {trick.nameEn || trick.nameDe}
                </span>
                <span style={{ fontSize: '6.5px', color: met || isLearned ? 'var(--inkm)' : 'var(--inkl)' }}>
                  {trick.category.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
                {isLearned ? (
                  <span
                    style={{
                      fontSize: '7px',
                      color: '#245e28',
                      fontWeight: 'bold',
                      background: 'rgba(50, 115, 55, 0.12)',
                      border: '0.5px solid rgba(50, 115, 55, 0.35)',
                      padding: '1px 3px',
                      borderRadius: '1.5px',
                    }}
                  >
                    ✓ Learned
                  </span>
                ) : met ? (
                  hasEnoughSP ? (
                    <span
                      style={{
                        fontSize: '7px',
                        color: '#7d5f1a',
                        fontWeight: 'bold',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '0.5px solid rgba(184, 134, 11, 0.4)',
                        padding: '1px 3px',
                        borderRadius: '1.5px',
                      }}
                    >
                      Available
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '7px',
                        color: 'var(--red)',
                        fontWeight: 'bold',
                        background: 'rgba(139, 26, 26, 0.08)',
                        border: '0.5px solid rgba(139, 26, 26, 0.25)',
                        padding: '1px 3px',
                        borderRadius: '1.5px',
                      }}
                    >
                      Need 2 SP
                    </span>
                  )
                ) : (
                  <span
                    style={{
                      fontSize: '7px',
                      color: '#7a7065',
                      fontWeight: 'bold',
                      background: 'rgba(0,0,0,0.04)',
                      border: '0.5px solid rgba(0,0,0,0.12)',
                      padding: '1px 3px',
                      borderRadius: '1.5px',
                    }}
                  >
                    🔒 Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Popup */}
      {selectedTrick && (
        <SkillTrickDetailsDialog
          trick={selectedTrick}
          pc={pc}
          isLearned={selectedTrick.isLearned}
          isBonus={selectedTrick.isBonus}
          onClose={() => setSelectedTrick(null)}
        />
      )}
    </div>
  );
};
