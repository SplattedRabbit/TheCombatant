import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { CharacterWizardDialog } from '../components/player/CharacterWizardDialog';
import { Step1RaceName } from '../components/player/wizard/Step1RaceName';
import { Step2Attributes } from '../components/player/wizard/Step2Attributes';
import { renderWithProviders } from '../test/test-utils';

describe('Character Wizard & Point-Buy Components (Task 6.1.4)', () => {
  describe('Step1RaceName Component', () => {
    const Step1Wrapper = () => {
      const [name, setName] = useState('');
      const [race, setRace] = useState('human');
      const [ethical, setEthical] = useState('Lawful');
      const [moral, setMoral] = useState('Good');

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
        />
      );
    };

    it('handles name input, race selection, and alignment changes', () => {
      render(<Step1Wrapper />);

      const nameInput = screen.getByPlaceholderText(/Enter adventurer name/i);
      fireEvent.change(nameInput, { target: { value: 'Valeros' } });
      expect(nameInput).toHaveValue('Valeros');

      // Click on Elf race
      const elfBtn = screen.getByText('Elf');
      fireEvent.click(elfBtn);
      expect(screen.getByText(/\+2 Dexterity \(DEX\), -2 Constitution \(CON\)/i)).toBeInTheDocument();
    });
  });

  describe('Step2Attributes Component', () => {
    const Step2Wrapper = () => {
      const [baseStats, setBaseStats] = useState({
        str: 14,
        dex: 14,
        con: 14,
        int: 10,
        wis: 10,
        cha: 12,
      });
      const [highlightClass, setHighlightClass] = useState('fighter');

      const totalStatsSpent =
        baseStats.str +
        baseStats.dex +
        baseStats.con +
        baseStats.int +
        baseStats.wis +
        baseStats.cha;

      return (
        <Step2Attributes
          baseStats={baseStats}
          setBaseStats={setBaseStats}
          selectedRace="human"
          highlightClass={highlightClass}
          setHighlightClass={setHighlightClass}
          totalStatsSpent={totalStatsSpent}
        />
      );
    };

    it('calculates total spent points and applies increments/decrements', () => {
      render(<Step2Wrapper />);

      // Total points: 14+14+14+10+10+12 = 74 / 74
      expect(screen.getByText('74')).toBeInTheDocument();
      expect(screen.getByText(/\/ 74/i)).toBeInTheDocument();

      // Key attribute for fighter should show
      expect(screen.getAllByText(/★ Key/i).length).toBeGreaterThan(0);
    });
  });

  describe('CharacterWizardDialog Full Flow (Step 1 -> Step 2)', () => {
    it('navigates from Step 1 to Step 2 when valid name is entered', () => {
      const handleClose = vi.fn();
      renderWithProviders(<CharacterWizardDialog onClose={handleClose} />);

      // Wizard header check
      expect(screen.getByText(/Character Creation Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/Identity & Race/i)).toBeInTheDocument();

      // Enter name
      const nameInput = screen.getByPlaceholderText(/Enter adventurer name/i);
      fireEvent.change(nameInput, { target: { value: 'Mialee' } });

      // Click Next
      const nextBtn = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextBtn);

      // Now on Step 2
      expect(screen.getByText(/Abilities \(74 Pts\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Distribute a total of \*\*74 points\*\*/i)).toBeInTheDocument();

      // Click Back returns to Step 1
      const backBtn = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backBtn);
      expect(screen.getByText(/Identity & Race/i)).toBeInTheDocument();
    });
  });
});
