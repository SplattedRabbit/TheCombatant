import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { PlayerSheet } from '../components/player/PlayerSheet';
import { Combatant } from '@core/models/Combatant.js';
import { aranisSample } from '@core/data/encounter-samples.js';
import { CombatState } from '@core/state.js';
import { renderWithProviders } from '../test/test-utils';

describe('PlayerSheet Component (Task 6.1.3)', () => {
  let samplePC: any;

  beforeEach(() => {
    // Fresh combatant instance for each test
    samplePC = new Combatant({
      ...aranisSample,
      skills: [
        { id: 'diplomacy', name: 'Diplomacy', stat: 'cha', ranks: 4, misc: 0 },
        { id: 'concentration', name: 'Concentration', stat: 'con', ranks: 2, misc: 0 },
      ],
      feats: [
        { id: 'power_attack', name: 'Power Attack', type: 'general' },
        { id: 'weapon_focus', name: 'Weapon Focus', type: 'fighter' },
      ],
    });
  });

  it('renders character header, attributes and default overview tab', () => {
    renderWithProviders(<PlayerSheet pc={samplePC} />);

    // Header checks (character name input and class badge)
    expect(screen.getByDisplayValue('Aranis Silberklinge')).toBeInTheDocument();
    expect(screen.getByText(/Paladin 3/i)).toBeInTheDocument();

    // Overview panel should be active
    const overviewPanel = document.getElementById('tabPanelOverview');
    expect(overviewPanel).toHaveClass('active');

    // Attributes check (e.g. STR 16, DEX 14)
    expect(screen.getAllByText(/STR/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DEX/i).length).toBeGreaterThan(0);
  });

  it('switches tabs correctly when tab buttons are clicked', () => {
    renderWithProviders(<PlayerSheet pc={samplePC} />);

    // Switch to Skills
    const skillsTabBtn = screen.getByRole('button', { name: /Skills/i });
    fireEvent.click(skillsTabBtn);

    const skillsPanel = document.getElementById('tabPanelSkills');
    expect(skillsPanel).toHaveClass('active');

    // Switch to Feats
    const featsTabBtn = screen.getByRole('button', { name: /Feats/i });
    fireEvent.click(featsTabBtn);

    const featsPanel = document.getElementById('tabPanelFeats');
    expect(featsPanel).toHaveClass('active');

    // Switch to Combat & Weapons (Offense)
    const offenseTabBtn = screen.getByRole('button', { name: /Combat & Weapons/i });
    fireEvent.click(offenseTabBtn);

    const offensePanel = document.getElementById('tabPanelOffense');
    expect(offensePanel).toHaveClass('active');

    // Switch to Armory (Magic Items)
    const armoryTabBtn = screen.getByRole('button', { name: /Armory/i });
    fireEvent.click(armoryTabBtn);

    const armoryPanel = document.getElementById('tabPanelMagicItems');
    expect(armoryPanel).toHaveClass('active');

    // Switch to Class & Companion (Features)
    const featuresTabBtn = screen.getByRole('button', { name: /Class & Companion/i });
    fireEvent.click(featuresTabBtn);

    const featuresPanel = document.getElementById('tabPanelFeatures');
    expect(featuresPanel).toHaveClass('active');
  });

  it('displays Spellbook tab for caster classes and hides it for non-casters', () => {
    // Paladin is a caster class
    const { rerender } = renderWithProviders(<PlayerSheet pc={samplePC} />);
    expect(screen.getByRole('button', { name: /Spellbook/i })).toBeInTheDocument();

    // Pure Fighter (non-caster)
    const nonCasterPC = new Combatant({
      name: 'Grom Ironhide',
      type: 'p',
      level: 4,
      classes: [{ classType: 'fighter', level: 4 }],
      hp: 40,
      maxHP: 40,
    });

    rerender(<PlayerSheet pc={nonCasterPC} />);
    expect(screen.queryByRole('button', { name: /Spellbook/i })).not.toBeInTheDocument();
  });

  it('opens system options dropdown and triggers actions', () => {
    const setRoleSpy = vi.spyOn(CombatState, 'setRole').mockImplementation(() => {});

    renderWithProviders(<PlayerSheet pc={samplePC} />);

    // Initially dropdown should be closed
    expect(screen.queryByText(/System Options/i)).not.toBeInTheDocument();

    // Open dropdown
    const systemBtn = screen.getByRole('button', { name: /System/i });
    fireEvent.click(systemBtn);

    expect(screen.getByText(/System Options/i)).toBeInTheDocument();
    expect(screen.getByText(/Character Wizard/i)).toBeInTheDocument();
    expect(screen.getByText(/Change Role/i)).toBeInTheDocument();
    expect(screen.getByText(/Export/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear App Data/i)).toBeInTheDocument();

    // Click Wizard item
    const wizardBtn = screen.getByRole('button', { name: /Character Wizard/i });
    fireEvent.click(wizardBtn);

    expect(setRoleSpy).toHaveBeenCalledWith('wizard');
    expect(screen.queryByText(/System Options/i)).not.toBeInTheDocument();

    setRoleSpy.mockRestore();
  });
});
