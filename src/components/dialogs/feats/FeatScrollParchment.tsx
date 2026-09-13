/**
 * @module    FeatScrollParchment
 * @summary   Parchment body presentation of a feat (Prerequisites, Benefits, App Mechanics, Specific Options, Instances).
 */

import React, { useState, useMemo } from 'react';
import { getTotemSkills, getDragonShamanClassSkills, formatSkillName } from '../../player/feats/skillFeatsHelper';
import { DRAGON_TOTEMS } from '@core/rules/data/dragonTotems.js';
import type { DragonTotemDef } from '@core/rules/data/dragonTotems.js';

interface FeatScrollParchmentProps {
  feat: any;
  categoryEn: string;
  met: boolean;
  prereqsDetails: any[];
  isLearned: boolean;
  isStackable: boolean;
  selectedOption: string;
  setSelectedOption: (opt: string) => void;
  filteredOptions: string[];
  learnedInstances: any[];
  onRemoveInstance: (instOption: string) => void;
  translateAppEffect: (text: string) => string;
  pc?: any;
}

export const FeatScrollParchment: React.FC<FeatScrollParchmentProps> = ({
  feat,
  categoryEn,
  met,
  prereqsDetails,
  isLearned,
  isStackable,
  selectedOption,
  setSelectedOption,
  filteredOptions,
  learnedInstances,
  onRemoveInstance,
  translateAppEffect,
  pc,
}) => {
  const hasDragonShaman = Boolean(
    pc && Array.isArray(pc.classes) && pc.classes.some((c: { classType?: string }) => c.classType === 'dragon_shaman')
  );
  const totemKey: string | undefined = pc?.dragonTotem || (hasDragonShaman ? 'red' : undefined);
  const totemDef: DragonTotemDef | undefined = totemKey ? DRAGON_TOTEMS[totemKey] : undefined;
  const totemName = totemDef ? (totemDef.name || totemDef.nameDe) : 'Totem';

  const isSkillOption = feat.hasOption && feat.optionType === 'skill';

  const [skillScope, setSkillScope] = useState<'totem' | 'class' | 'all'>(
    hasDragonShaman && totemKey ? 'totem' : 'all'
  );

  const totemSkills = useMemo(() => {
    if (!totemKey) return [];
    return getTotemSkills(totemKey).map(formatSkillName);
  }, [totemKey]);

  const dsClassSkills = useMemo(() => {
    if (!totemKey) return [];
    return getDragonShamanClassSkills(totemKey).map(formatSkillName);
  }, [totemKey]);

  const unlearnedTotemSkills = useMemo(() => {
    return filteredOptions.filter(o => totemSkills.includes(o));
  }, [filteredOptions, totemSkills]);

  const unlearnedDsBaseSkills = useMemo(() => {
    return filteredOptions.filter(o => dsClassSkills.includes(o) && !totemSkills.includes(o));
  }, [filteredOptions, dsClassSkills, totemSkills]);

  const unlearnedOtherSkills = useMemo(() => {
    return filteredOptions.filter(o => !dsClassSkills.includes(o));
  }, [filteredOptions, dsClassSkills]);

  const displayedOptions = useMemo(() => {
    if (!isSkillOption || !hasDragonShaman) return filteredOptions;
    if (skillScope === 'totem') {
      return unlearnedTotemSkills.length > 0 ? unlearnedTotemSkills : filteredOptions;
    }
    if (skillScope === 'class') {
      const classOpts = [...unlearnedTotemSkills, ...unlearnedDsBaseSkills];
      return classOpts.length > 0 ? classOpts : filteredOptions;
    }
    return filteredOptions;
  }, [isSkillOption, hasDragonShaman, skillScope, unlearnedTotemSkills, unlearnedDsBaseSkills, filteredOptions]);

  return (
    <div
      className="ancient-parchment"
      style={{
        background: '#f4e8c1',
        border: '2px solid #8b1a1a',
        padding: '12px 16px',
        borderRadius: '4px',
        boxShadow: 'inset 0 0 35px rgba(139, 26, 26, 0.15)',
        fontFamily: 'var(--font-body)',
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
          fontFamily: 'var(--font-title)',
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
        {feat.name || feat.nameEn}
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
        <div><strong>Category:</strong> {categoryEn}</div>
        <div><strong>Met:</strong> {met ? 'Yes' : 'No'}</div>
        <div style={{ gridColumn: 'span 2' }}>
          <strong>App Mechanics:</strong>{' '}
          <span style={{ color: '#8b1a1a', fontWeight: 'bold' }}>
            {translateAppEffect(feat.appEffect) || 'No automatic stat changes'}
          </span>
        </div>
      </div>

      <div style={{ fontSize: '9.5px', marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', color: '#8b1a1a', fontFamily: 'var(--font-title)', fontSize: '10px' }}>
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
        <strong style={{ color: '#8b1a1a', fontFamily: 'var(--font-title)' }}>Benefit (RAW):</strong>
        <div style={{ fontStyle: 'italic', color: '#2a1b0a', paddingLeft: '4px' }}>{feat.benefit || feat.benefitRaw || feat.benefitEn}</div>
      </div>

      {(feat.normal || feat.normalRaw) && (
        <div style={{ fontSize: '9px', marginBottom: '6px', lineHeight: 1.35, borderTop: '0.5px dotted rgba(139,26,26,0.2)', paddingTop: '4px' }}>
          <strong style={{ color: '#8b1a1a', fontFamily: 'var(--font-title)' }}>Normal:</strong>
          <div style={{ color: '#4a3b2a', paddingLeft: '4px' }}>{feat.normal || feat.normalRaw}</div>
        </div>
      )}

      {(feat.special || feat.specialRaw) && (
        <div style={{ fontSize: '9px', marginBottom: '4px', lineHeight: 1.35, borderTop: '0.5px dotted rgba(139,26,26,0.2)', paddingTop: '4px' }}>
          <strong style={{ color: '#8b1a1a', fontFamily: 'var(--font-title)' }}>Special:</strong>
          <div style={{ color: '#4a3b2a', paddingLeft: '4px' }}>{feat.special || feat.specialRaw}</div>
        </div>
      )}

      {feat.hasOption && (!isLearned || isStackable) && (
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px', fontFamily: 'var(--font-body)', fontSize: '9.5px', fontWeight: 'bold' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="featOptionSelect" style={{ color: '#5a3a1a' }}>Specific selection for this feat:</label>
            {isSkillOption && hasDragonShaman && (
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSkillScope('totem');
                    if (unlearnedTotemSkills.length > 0 && !unlearnedTotemSkills.includes(selectedOption)) {
                      setSelectedOption(unlearnedTotemSkills[0]);
                    }
                  }}
                  style={{
                    fontSize: '7.5px',
                    padding: '1px 4px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    border: '0.5px solid #8b1a1a',
                    background: skillScope === 'totem' ? '#8b1a1a' : 'transparent',
                    color: skillScope === 'totem' ? '#fff' : '#8b1a1a',
                    fontWeight: 'bold'
                  }}
                >
                  Totem ({unlearnedTotemSkills.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSkillScope('class');
                    const classOpts = [...unlearnedTotemSkills, ...unlearnedDsBaseSkills];
                    if (classOpts.length > 0 && !classOpts.includes(selectedOption)) {
                      setSelectedOption(classOpts[0]);
                    }
                  }}
                  style={{
                    fontSize: '7.5px',
                    padding: '1px 4px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    border: '0.5px solid #8b6934',
                    background: skillScope === 'class' ? '#8b6934' : 'transparent',
                    color: skillScope === 'class' ? '#fff' : '#8b6934',
                    fontWeight: 'bold'
                  }}
                >
                  Class ({unlearnedTotemSkills.length + unlearnedDsBaseSkills.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSkillScope('all')}
                  style={{
                    fontSize: '7.5px',
                    padding: '1px 4px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    border: '0.5px solid #666',
                    background: skillScope === 'all' ? '#666' : 'transparent',
                    color: skillScope === 'all' ? '#fff' : '#444',
                    fontWeight: 'bold'
                  }}
                >
                  All ({filteredOptions.length})
                </button>
              </div>
            )}
          </div>

          <select
            id="featOptionSelect"
            className="cinput"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            style={{ width: '100%', fontSize: '9px', height: '18px', padding: '0 2px', boxSizing: 'border-box' }}
          >
            {filteredOptions.length === 0 ? (
              <option value="" disabled>
                -- All options already learned --
              </option>
            ) : isSkillOption && hasDragonShaman && skillScope === 'all' ? (
              <>
                {unlearnedTotemSkills.length > 0 && (
                  <optgroup label={`Totem Skills (${totemName})`}>
                    {unlearnedTotemSkills.map((o, idx) => (
                      <option key={`t-${idx}`} value={o}>{o}</option>
                    ))}
                  </optgroup>
                )}
                {unlearnedDsBaseSkills.length > 0 && (
                  <optgroup label="Dragon Shaman Class Skills">
                    {unlearnedDsBaseSkills.map((o, idx) => (
                      <option key={`ds-${idx}`} value={o}>{o}</option>
                    ))}
                  </optgroup>
                )}
                {unlearnedOtherSkills.length > 0 && (
                  <optgroup label="Other Skills">
                    {unlearnedOtherSkills.map((o, idx) => (
                      <option key={`oth-${idx}`} value={o}>{o}</option>
                    ))}
                  </optgroup>
                )}
              </>
            ) : isSkillOption && hasDragonShaman && skillScope === 'class' ? (
              <>
                {unlearnedTotemSkills.length > 0 && (
                  <optgroup label={`Totem Skills (${totemName})`}>
                    {unlearnedTotemSkills.map((o, idx) => (
                      <option key={`t-${idx}`} value={o}>{o}</option>
                    ))}
                  </optgroup>
                )}
                {unlearnedDsBaseSkills.length > 0 && (
                  <optgroup label="Dragon Shaman Class Skills">
                    {unlearnedDsBaseSkills.map((o, idx) => (
                      <option key={`ds-${idx}`} value={o}>{o}</option>
                    ))}
                  </optgroup>
                )}
              </>
            ) : (
              displayedOptions.map((o, idx) => (
                <option key={idx} value={o}>
                  {o}
                </option>
              ))
            )}
          </select>

          {isSkillOption && hasDragonShaman && (
            <div style={{
              marginTop: '4px',
              padding: '4px 6px',
              background: 'rgba(139, 26, 26, 0.08)',
              border: '0.5px solid rgba(139, 26, 26, 0.3)',
              borderRadius: '2px',
              fontSize: '8px',
              color: '#6b1212',
              lineHeight: 1.3
            }}>
              <strong style={{ fontFamily: 'var(--font-title)' }}>Dragon Shaman Bonus Feat (RAW):</strong> Level 2 requires a Totem skill ({totemSkills.join(', ')}). Levels 8 & 16 require a Totem or Class skill.
            </div>
          )}
        </div>
      )}

      {learnedInstances.length > 0 && (
        <div style={{ marginTop: '6px', fontFamily: 'var(--font-body)', fontSize: '9.5px', borderTop: '0.5px dashed rgba(139,26,26,0.3)', paddingTop: '6px' }}>
          <div style={{ fontWeight: 'bold', color: '#5a3a1a', marginBottom: '2px' }}>Already learned instances:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {learnedInstances.map((inst: any, idx: number) => {
              const optText = inst.option ? `(${inst.option})` : '';
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '2px', padding: '2px 4px', fontSize: '8.5px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>
                    {(feat.nameEn || feat.nameDe)} {optText}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onRemoveInstance(inst.option || '');
                    }}
                    className="xbtn btn-remove-instance"
                    style={{ color: 'var(--red)', borderColor: 'var(--red)', padding: '0 3px', fontSize: '7px', height: '13px', lineHeight: '13px' }}
                  >
                    ✕ Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
