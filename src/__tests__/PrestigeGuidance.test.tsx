import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { Step1RaceName } from '../components/player/wizard/Step1RaceName';
import { Step2Attributes } from '../components/player/wizard/Step2Attributes';
import { PrestigePrereqTrackerCard } from '../components/player/wizard/levelConfig/PrestigePrereqTrackerCard';
import { Combatant } from '../../js/models/Combatant.js';

describe('Prestige Class Guidance UI Integration', () => {
  it('Step1RaceName displays guidance warning when alignment conflicts with target PrC', () => {
    const TestComponent = () => {
      const [name, setName] = useState('Gideon');
      const [race, setRace] = useState('human');
      const [ethical, setEthical] = useState('Chaotic');
      const [moral, setMoral] = useState('Good');
      const [targetPrC, setTargetPrC] = useState('shadowbane_inquisitor');

      return (
        <Step1RaceName
          name={name}
          setName={setName}
          selectedRace={race}
          setSelectedRace={setRace}
          alignmentEthical={ethical}
          setAlignmentEthical={setEthical}
          alignmentMoral={moral}
          setAlignmentMoral={setMoral}
          targetPrestigeClass={targetPrC}
          setTargetPrestigeClass={setTargetPrC}
        />
      );
    };

    render(<TestComponent />);

    // Check that alignment guidance banner indicates conflict with Chaotic Good
    const banner = screen.getByTestId('alignment-guidance-banner');
    expect(banner).toBeInTheDocument();
    expect(banner.textContent).toContain('Achtung');
    expect(banner.textContent).toContain('Rechtschaffen Gut');

    // Change ethical to Lawful
    const selects = screen.getAllByRole('combobox');
    const ethicalSelect = selects[1]; // first is PrC, second is ethical, third is moral
    fireEvent.change(ethicalSelect, { target: { value: 'Lawful' } });

    // Now it should be compatible
    expect(screen.getByTestId('alignment-guidance-banner').textContent).toContain('Gesinnung kompatibel');
  });

  it('Step2Attributes renders prestige classes in optgroups and shows prerequisite hints', () => {
    const TestComponent = () => {
      const [stats, setStats] = useState({ str: 14, dex: 12, con: 12, int: 10, wis: 14, cha: 12 });
      const [highlight, setHighlight] = useState('shadowbane_inquisitor');

      return (
        <Step2Attributes
          baseStats={stats}
          setBaseStats={setStats}
          selectedRace="human"
          highlightClass={highlight}
          setHighlightClass={setHighlight}
          totalStatsSpent={74}
          targetPrestigeClass="shadowbane_inquisitor"
        />
      );
    };

    render(<TestComponent />);

    const hintsBox = screen.getByTestId('attribute-prereq-hints');
    expect(hintsBox).toBeInTheDocument();
    expect(hintsBox.textContent).toContain('Power Attack');
  });

  it('PrestigePrereqTrackerCard shows criteria status and live progress', () => {
    const pc = new Combatant({
      name: 'Gideon',
      alignment: 'Lawful Good',
      classes: [{ classType: 'paladin', level: 4 }],
      skills: {
        gather_information: { ranks: 4, misc: 0 },
        knowledge_religion: { ranks: 2, misc: 0 },
        sense_motive: { ranks: 4, misc: 0 }
      },
      feats: [{ id: 'power_attack' }]
    });

    const draft = { draftPC: pc };

    render(
      <PrestigePrereqTrackerCard
        targetPrestigeClass="shadowbane_inquisitor"
        currentDraft={draft}
        currentLevelIndex={3}
      />
    );

    const tracker = screen.getByTestId('prestige-prereq-tracker');
    expect(tracker).toBeInTheDocument();
    expect(tracker.textContent).toContain('Ziel: Shadowbane Inquisitor');
    expect(tracker.textContent).toContain('In Arbeit');
  });
});
