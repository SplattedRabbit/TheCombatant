/**
 * @module    SkillRow
 * @summary   Individual skill row renderer with roll trigger, breakdown tooltip, ranks and misc inputs.
 */

import React from 'react';
import { formatMod } from '../attributeHelper';

export interface SkillRowProps {
  skillKey: string;
  skill: any;
  pc: any;
  isClass: boolean;
  ranks: number;
  misc: number;
  maxRanks: number;
  totalMod: number;
  attrMod: number;
  isTrainedOnlyDisabled: boolean;
  hasSkillExtras: boolean;
  tooltipText: string;
  focusedRanksKey: string | null;
  focusedRanksVal: string;
  onFocusRanks: (key: string, currentVal: number) => void;
  onChangeRanksVal: (val: string) => void;
  onBlurRanks: (key: string) => void;
  focusedMiscKey: string | null;
  focusedMiscVal: string;
  onFocusMisc: (key: string, currentVal: number) => void;
  onChangeMiscVal: (val: string) => void;
  onBlurMisc: (key: string) => void;
  onRollSkill: (key: string, skill: any, ranks: number, attrMod: number, misc: number, e: React.MouseEvent) => void;
  onRanksChange: (key: string, val: string) => void;
}

export const SkillRow: React.FC<SkillRowProps> = ({
  skillKey,
  skill,
  isClass,
  ranks,
  misc,
  maxRanks,
  totalMod,
  attrMod,
  isTrainedOnlyDisabled,
  hasSkillExtras,
  tooltipText,
  focusedRanksKey,
  focusedRanksVal,
  onFocusRanks,
  onChangeRanksVal,
  onBlurRanks,
  focusedMiscKey,
  focusedMiscVal,
  onFocusMisc,
  onChangeMiscVal,
  onBlurMisc,
  onRollSkill,
  onRanksChange,
}) => {
  const ranksExceeded = ranks > maxRanks;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '3px 4px',
        borderBottom: '0.5px solid rgba(200, 169, 110, 0.15)',
        fontSize: '8px',
        opacity: isTrainedOnlyDisabled ? 0.5 : 1,
      }}
    >
      {/* Left: Dice Roll & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3.5px', flex: 1.2, minWidth: 0 }}>
        <button
          disabled={isTrainedOnlyDisabled}
          onClick={(e) => onRollSkill(skillKey, skill, ranks, attrMod, misc, e)}
          style={{
            border: 'none',
            background: 'transparent',
            padding: '0 2px',
            cursor: isTrainedOnlyDisabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            fontFamily: "'Crimson Text', serif",
            fontSize: '9.5px',
            fontWeight: 'bold',
            color: 'var(--red)',
            display: 'flex',
            alignItems: 'center',
            gap: '2.5px',
            opacity: isTrainedOnlyDisabled ? 0.4 : 1,
          }}
          title={isTrainedOnlyDisabled ? 'Trained Only (cannot be used untrained)' : `Roll skill check for ${skill.nameEn || skill.nameDe}`}
        >
          🎲{' '}
          <span
            style={{
              borderBottom: '0.5px dashed rgba(139, 26, 26, 0.4)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '110px',
            }}
          >
            {skill.nameEn || skill.nameDe}
          </span>
        </button>
        <span style={{ fontSize: '6.5px', color: 'var(--inkl)', flexShrink: 0 }}>({skill.abl.toUpperCase()})</span>
        {isClass ? (
          <span
            style={{ fontSize: '5.5px', fontWeight: 'bold', color: '#1a5c1a', background: 'rgba(26,92,26,0.08)', padding: '0.5px 2px', borderRadius: '1px', flexShrink: 0 }}
            title={`Class Skill (Max Ranks: ${maxRanks})`}
          >
            C
          </span>
        ) : (
          <span
            style={{ fontSize: '5.5px', color: '#7c5c1d', background: 'rgba(200,169,110,0.08)', padding: '0.5px 2px', borderRadius: '1px', flexShrink: 0 }}
            title={`Cross-Class (Max Ranks: ${maxRanks})`}
          >
            CC
          </span>
        )}
        {skill.trainedOnly && ranks === 0 && (
          <span
            style={{ fontSize: '5.5px', color: 'var(--red)', background: 'rgba(139,26,26,0.08)', padding: '0.5px 2px', borderRadius: '1px', flexShrink: 0, fontWeight: 'bold' }}
            title="Trained Only"
          >
            Trained
          </span>
        )}
      </div>

      {/* Center: Total Modifier with Tooltip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 0.5, justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '6px', color: 'var(--inkl)' }}>Total:</span>
        <span
          style={{
            fontWeight: 'bold',
            color: 'var(--red)',
            fontSize: '9px',
            cursor: 'help',
            borderBottom: hasSkillExtras ? '1px dotted var(--red)' : 'none',
          }}
          title={tooltipText}
        >
          {formatMod(totalMod)}
        </span>
      </div>

      {/* Right: Ranks and Misc Inputs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1.1, justifyContent: 'flex-end', flexShrink: 0 }}>
        {/* Ranks Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
          <button
            onClick={() => onRanksChange(skillKey, String(Math.max(0, ranks - 1)))}
            disabled={ranks <= 0}
            style={{
              width: '12px',
              height: '14px',
              padding: 0,
              fontSize: '8px',
              lineHeight: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: ranks <= 0 ? 'default' : 'pointer',
              background: 'rgba(0,0,0,0.03)',
              border: '0.5px solid var(--pb)',
              borderRadius: '1px',
              opacity: ranks <= 0 ? 0.3 : 1,
            }}
          >
            -
          </button>
          <input
            type="number"
            value={focusedRanksKey === skillKey ? focusedRanksVal : ranks}
            onFocus={() => onFocusRanks(skillKey, ranks)}
            onChange={(e) => onChangeRanksVal(e.target.value)}
            onBlur={() => onBlurRanks(skillKey)}
            style={{
              width: '20px',
              height: '14px',
              textAlign: 'center',
              fontSize: '8px',
              padding: 0,
              border: ranksExceeded ? '1px solid var(--red)' : '0.5px solid var(--pb)',
              borderRadius: '1px',
              background: ranksExceeded ? 'rgba(139,26,26,0.1)' : 'transparent',
              fontWeight: 'bold',
            }}
            title={`Ranks (Max allowed: ${maxRanks})`}
          />
          <button
            onClick={() => onRanksChange(skillKey, String(ranks + 1))}
            disabled={ranks >= maxRanks}
            style={{
              width: '12px',
              height: '14px',
              padding: 0,
              fontSize: '8px',
              lineHeight: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: ranks >= maxRanks ? 'default' : 'pointer',
              background: 'rgba(0,0,0,0.03)',
              border: '0.5px solid var(--pb)',
              borderRadius: '1px',
              opacity: ranks >= maxRanks ? 0.3 : 1,
            }}
          >
            +
          </button>
        </div>

        {/* Misc Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
          <span style={{ fontSize: '5.5px', color: 'var(--inkl)' }}>Misc:</span>
          <input
            type="number"
            value={focusedMiscKey === skillKey ? focusedMiscVal : misc}
            onFocus={() => onFocusMisc(skillKey, misc)}
            onChange={(e) => onChangeMiscVal(e.target.value)}
            onBlur={() => onBlurMisc(skillKey)}
            style={{
              width: '18px',
              height: '14px',
              textAlign: 'center',
              fontSize: '7.5px',
              padding: 0,
              border: '0.5px solid var(--pb)',
              borderRadius: '1px',
              background: 'transparent',
            }}
            title="Miscellaneous Modifier (Items, situational, etc.)"
          />
        </div>
      </div>
    </div>
  );
};
