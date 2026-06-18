import React from 'react';
import { RACES } from './constants';

interface Step1RaceNameProps {
  name: string;
  setName: (val: string) => void;
  selectedRace: string;
  setSelectedRace: (val: string) => void;
  alignmentEthical: string;
  setAlignmentEthical: (val: string) => void;
  alignmentMoral: string;
  setAlignmentMoral: (val: string) => void;
}

export const Step1RaceName: React.FC<Step1RaceNameProps> = ({
  name,
  setName,
  selectedRace,
  setSelectedRace,
  alignmentEthical,
  setAlignmentEthical,
  alignmentMoral,
  setAlignmentMoral
}) => {
  const activeRaceInfo = RACES.find(r => r.key === selectedRace);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', marginTop: '10px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Name Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.5px' }}>
            Character Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="cinput"
            placeholder="Enter adventurer name..."
            style={{
              width: '100%',
              fontFamily: "'Crimson Text', serif",
              fontSize: '14px',
              padding: '6px 12px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Alignment Dropdowns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.5px' }}>
            Alignment (Gesinnung)
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={alignmentEthical}
              onChange={(e) => setAlignmentEthical(e.target.value)}
              className="cinput"
              style={{
                flex: 1,
                fontSize: '13px',
                height: '34px',
                padding: '0 8px',
                cursor: 'pointer'
              }}
            >
              <option value="Lawful">Rechtschaffen (Lawful)</option>
              <option value="Neutral">Neutral (Neutral)</option>
              <option value="Chaotic">Chaotisch (Chaotic)</option>
            </select>
            <select
              value={alignmentMoral}
              onChange={(e) => setAlignmentMoral(e.target.value)}
              className="cinput"
              style={{
                flex: 1,
                fontSize: '13px',
                height: '34px',
                padding: '0 8px',
                cursor: 'pointer'
              }}
            >
              <option value="Good">Gut (Good)</option>
              <option value="Neutral">Neutral (Neutral)</option>
              <option value="Evil">Böse (Evil)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginTop: '10px' }}>
        {/* Race Grid */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>
            Select Race
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {RACES.map(race => (
              <div
                key={race.key}
                onClick={() => setSelectedRace(race.key)}
                style={{
                  padding: '12px 10px',
                  background: selectedRace === race.key ? 'rgba(139, 26, 26, 0.08)' : 'rgba(244, 232, 193, 0.4)',
                  border: selectedRace === race.key ? '2px solid var(--red)' : '1px solid var(--pb)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: selectedRace === race.key ? 'var(--red)' : 'var(--ink)',
                  transition: 'all 0.2s',
                  boxShadow: selectedRace === race.key ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {race.name}
              </div>
            ))}
          </div>
        </div>

        {/* Race Details panel */}
        <div 
          style={{
            background: 'rgba(244, 232, 193, 0.25)',
            border: '1.5px dashed var(--pb)',
            borderRadius: '4px',
            padding: '16px 20px',
            height: '310px',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}
        >
          {activeRaceInfo ? (
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--red)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                {activeRaceInfo.name}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--inkl)', marginBottom: '12px', fontStyle: 'italic' }}>
                Size: {activeRaceInfo.size === 'Small' ? 'Small' : 'Medium'}
              </div>
              <div style={{ fontSize: '13px', marginBottom: '14px' }}>
                <strong>Abilities:</strong>{' '}
                <span style={{ color: activeRaceInfo.modifiers.includes('+') ? 'green' : 'inherit', fontWeight: 'bold' }}>
                  {activeRaceInfo.modifiers}
                </span>
              </div>
              <div style={{ borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', paddingTop: '10px' }}>
                <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: 'var(--ink)' }}>Racial Traits:</strong>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', fontFamily: "'Crimson Text', serif", lineHeight: 1.45, color: 'var(--ink)' }}>
                  {activeRaceInfo.traits.map((t, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '13px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.5 }}>
              Hover over or select a race to view its details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
