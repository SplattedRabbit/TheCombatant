import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { CombatState } from '@core/state.js';
import { Combatant } from '@core/models/Combatant.js';
import { createLevelUpDraft } from '../services/levelup/levelUpAdapter';
import { applyLevelUpToActivePC } from '../components/player/levelup/levelUpSaveHelper';
import { LevelUpDialog } from '../components/player/levelup/LevelUpDialog';
import { renderWithProviders } from '../test/test-utils';

describe('Level-Up Assistant Suite', () => {
  beforeEach(() => {
    CombatState.clearState();
  });

  describe('1. createLevelUpDraft Adapter', () => {
    it('correctly derives target level, levelConfigs array, and default class', () => {
      const pc = new Combatant({
        name: 'Valerius',
        race: 'human',
        classes: [{ classType: 'fighter', level: 3 }],
        str: 16,
        dex: 14,
        con: 14,
        int: 10,
        wis: 12,
        cha: 8,
        hp: 30,
        maxHp: 30,
        skills: { jump: { ranks: 4, misc: 0 } },
        feats: [{ id: 'power_attack' }],
      });

      const draft = createLevelUpDraft(pc);

      expect(draft.totalCurrentLevel).toBe(3);
      expect(draft.newLevel).toBe(4);
      expect(draft.newLevelIndex).toBe(3);
      expect(draft.levelConfigs.length).toBe(4);
      expect(draft.levelConfigs[3].classType).toBe('fighter');
    });
  });

  describe('2. applyLevelUpToActivePC Save Helper', () => {
    it('transactionally increments class level, HP, ability score, and skills', () => {
      const pc = new Combatant({
        name: 'Ragnar',
        race: 'human',
        classes: [{ classType: 'barbarian', level: 3 }],
        str: 16,
        dex: 14,
        con: 14,
        int: 10,
        wis: 10,
        cha: 10,
        hp: 36,
        maxHp: 36,
        skills: { climb: { ranks: 4, misc: 0 } },
        feats: [{ id: 'power_attack' }],
      });

      CombatState.applyLoadedState({ activePC: pc, combatants: [pc] });

      const draft = createLevelUpDraft(pc);
      const newLevelIdx = draft.newLevelIndex;

      // Configure new level 4: Barbarian, roll 8 on d12, +1 STR, 4 skill points in climb
      draft.levelConfigs[newLevelIdx].classType = 'barbarian';
      draft.levelConfigs[newLevelIdx].hpRoll = 8;
      draft.levelConfigs[newLevelIdx].abilityIncrease = 'str';
      draft.levelConfigs[newLevelIdx].skills = { climb: 4 };

      applyLevelUpToActivePC(draft.levelConfigs, newLevelIdx, null);

      const updatedPC = CombatState.getActivePC();
      expect(updatedPC.classes[0].level).toBe(4);
      // 36 HP + (8 roll + 2 CON mod) = 46 HP
      expect(updatedPC.maxHp).toBe(46);
      expect(updatedPC.hp).toBe(46);
      expect(updatedPC.levelIncreases.str).toBe(1);
      expect(updatedPC.skills.climb.ranks).toBe(8);
    });

    it('supports multiclassing into a new secondary class', () => {
      const pc = new Combatant({
        name: 'Lyra',
        race: 'elf',
        classes: [{ classType: 'wizard', level: 2 }],
        str: 10,
        dex: 16,
        con: 12,
        int: 16,
        wis: 12,
        cha: 10,
        hp: 12,
        maxHp: 12,
        skills: { concentration: { ranks: 5, misc: 0 } },
        feats: [{ id: 'scribe_scroll' }],
      });

      CombatState.applyLoadedState({ activePC: pc, combatants: [pc] });

      const draft = createLevelUpDraft(pc);
      const newLevelIdx = draft.newLevelIndex;

      // Multiclass into Rogue at Level 3
      draft.levelConfigs[newLevelIdx].classType = 'rogue';
      draft.levelConfigs[newLevelIdx].hpRoll = 5;
      draft.levelConfigs[newLevelIdx].feats = ['dodge'];

      applyLevelUpToActivePC(draft.levelConfigs, newLevelIdx, null);

      const updatedPC = CombatState.getActivePC();
      expect(updatedPC.classes.length).toBe(2);
      expect(updatedPC.classes[0].classType).toBe('wizard');
      expect(updatedPC.classes[0].level).toBe(2);
      expect(updatedPC.classes[1].classType).toBe('rogue');
      expect(updatedPC.classes[1].level).toBe(1);
      expect(updatedPC.feats.some((f: any) => f.id === 'dodge')).toBe(true);
    });
  });

  describe('3. LevelUpDialog Component (4-Step Linear Wizard)', () => {
    it('renders the 4-step wizard and navigates through steps to completion', () => {
      const pc = new Combatant({
        name: 'Gareth',
        race: 'human',
        classes: [{ classType: 'fighter', level: 2 }],
        str: 16,
        dex: 14,
        con: 14,
        int: 10,
        wis: 10,
        cha: 8,
      });

      const handleClose = vi.fn();

      renderWithProviders(
        <LevelUpDialog
          activePC={pc}
          isOpen={true}
          onClose={handleClose}
        />
      );

      // Verify Header & Breadcrumbs
      expect(screen.getByText(/Level-Up Assistant:/i)).toBeInTheDocument();
      expect(screen.getByText(/Gareth/i)).toBeInTheDocument();
      expect(screen.getByText(/Level 2 ➔ Level 3/i)).toBeInTheDocument();
      expect(screen.getByText(/1\. Class & Stats/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Skills & Tricks/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. Feats & ACFs/i)).toBeInTheDocument();
      expect(screen.getByText(/4\. Review & Apply/i)).toBeInTheDocument();

      // Step 1 Content
      expect(screen.getByText(/Step 1\.1: Choose Class for Level 3/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 1\.3: Hit Die HP Roll/i)).toBeInTheDocument();

      // Navigate to Step 2: Skills & Tricks
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      expect(screen.getByText(/Skills \(/i)).toBeInTheDocument();
      expect(screen.getByText(/Skill Tricks \(/i)).toBeInTheDocument();

      // Navigate to Step 3: Feats & ACFs
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      expect(screen.getByText(/Feats \(/i)).toBeInTheDocument();
      expect(screen.getByText(/Alternative Class Features/i)).toBeInTheDocument();

      // Navigate to Step 4: Review & Apply
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      expect(screen.getByText(/Review Level 3 Advancement/i)).toBeInTheDocument();
      expect(screen.getByText(/✦ Complete Level Up/i)).toBeInTheDocument();

      // Complete Level Up
      fireEvent.click(screen.getByText(/✦ Complete Level Up/i));
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
