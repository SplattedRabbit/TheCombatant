/**
 * @module    FeatScrollParchment
 * @summary   Parchment body presentation of a feat (Prerequisites, Benefits, App Mechanics, Specific Options, Instances).
 */

import React from 'react';

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
}) => {
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
        {feat.nameEn || feat.nameDe}
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
        <div style={{ fontStyle: 'italic', color: '#2a1b0a', paddingLeft: '4px' }}>{feat.benefitRaw || feat.benefitEn || feat.benefitDe}</div>
      </div>

      {feat.normalRaw && (
        <div style={{ fontSize: '9px', marginBottom: '6px', lineHeight: 1.35, borderTop: '0.5px dotted rgba(139,26,26,0.2)', paddingTop: '4px' }}>
          <strong style={{ color: '#8b1a1a', fontFamily: 'var(--font-title)' }}>Normal:</strong>
          <div style={{ color: '#4a3b2a', paddingLeft: '4px' }}>{feat.normalRaw}</div>
        </div>
      )}

      {feat.specialRaw && (
        <div style={{ fontSize: '9px', marginBottom: '4px', lineHeight: 1.35, borderTop: '0.5px dotted rgba(139,26,26,0.2)', paddingTop: '4px' }}>
          <strong style={{ color: '#8b1a1a', fontFamily: 'var(--font-title)' }}>Special:</strong>
          <div style={{ color: '#4a3b2a', paddingLeft: '4px' }}>{feat.specialRaw}</div>
        </div>
      )}

      {feat.hasOption && (!isLearned || isStackable) && (
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px', fontFamily: 'var(--font-body)', fontSize: '9.5px', fontWeight: 'bold' }}>
          <label htmlFor="featOptionSelect" style={{ color: '#5a3a1a' }}>Specific selection for this feat:</label>
          <select
            id="featOptionSelect"
            className="cinput"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            style={{ width: '100%', fontSize: '9px', height: '18px', padding: '0 2px', boxSizing: 'border-box' }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o, idx) => (
                <option key={idx} value={o}>
                  {o}
                </option>
              ))
            ) : (
              <option value="" disabled>
                -- All options already learned --
              </option>
            )}
          </select>
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
