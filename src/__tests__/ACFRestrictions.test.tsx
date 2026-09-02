import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PCFeaturesTab } from '../components/player/PCFeaturesTab';
import { RangerFeaturesCard } from '../components/player/features/RangerFeaturesCard';
import { DruidFeaturesCard } from '../components/player/features/DruidFeaturesCard';
import { BarbarianFeaturesCard } from '../components/player/features/BarbarianFeaturesCard';

describe('ACF UI Restrictions & Overrides', () => {
  it('hides animal companion sheet in PCFeaturesTab when Ranger has Distracting Attack ACF active', () => {
    const pc = {
      id: 'ranger_pc',
      name: 'Ranger Hero',
      classes: [{ classType: 'ranger', level: 6 }],
      companionType: 'none',
      acfs: ['ranger_distracting_attack'],
      dailyAbilities: []
    };

    render(<PCFeaturesTab pc={pc} />);
    expect(screen.getByText(/No active animal companion or familiar/i)).toBeInTheDocument();
  });

  it('shows animal companion sheet in PCFeaturesTab when Ranger has no replacement ACF', () => {
    const pc = {
      id: 'ranger_pc_standard',
      name: 'Ranger Standard',
      classes: [{ classType: 'ranger', level: 6 }],
      companionType: 'none',
      acfs: [],
      dailyAbilities: []
    };

    render(<PCFeaturesTab pc={pc} />);
    expect(screen.queryByText(/No active animal companion or familiar/i)).not.toBeInTheDocument();
  });

  it('renders Distracting Attack status and Replaced by ACF in RangerFeaturesCard', () => {
    const pc = {
      id: 'ranger_pc',
      name: 'Ranger Hero',
      classes: [{ classType: 'ranger', level: 6 }],
      favoredEnemy: 'Undead',
      acfs: ['ranger_distracting_attack'],
      dailyAbilities: []
    };

    render(<RangerFeaturesCard pc={pc} level={6} />);
    const header = screen.getByText(/🎭 Ranger/i);
    fireEvent.click(header);

    expect(screen.getByText(/Distracting Attack \(Active\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Replaced by ACF/i)).toBeInTheDocument();
  });

  it('renders Shapeshift panel in DruidFeaturesCard when Shapeshift ACF is active', () => {
    const pc = {
      id: 'druid_pc',
      name: 'Druid Shapeshifter',
      classes: [{ classType: 'druid', level: 8 }],
      acfs: ['druid_shapeshift'],
      activeShape: 'none',
      dailyAbilities: []
    };

    render(<DruidFeaturesCard pc={pc} level={8} />);
    const header = screen.getByText(/🎭 Druid/i);
    fireEvent.click(header);

    expect(screen.getByText(/Shapeshift \(Replaces Wild Shape & Animal Companion\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Predator Form/i).length).toBeGreaterThan(0);
  });

  it('renders Berserker Strength status in BarbarianFeaturesCard when Berserker Strength ACF is active', () => {
    const pc = {
      id: 'barb_pc',
      name: 'Berserker Hero',
      classes: [{ classType: 'barbarian', level: 5 }],
      acfs: ['barbarian_berserker_strength'],
      isRaging: false,
      dailyAbilities: []
    };

    render(<BarbarianFeaturesCard pc={pc} level={5} />);
    const header = screen.getByText(/🎭 Barbarian/i);
    fireEvent.click(header);

    expect(screen.getByText(/Berserker Strength \(Replaces Rage\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Activate Rage/i })).not.toBeInTheDocument();
  });
});
