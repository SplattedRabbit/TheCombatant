import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { CombatState } from '@core/state.js';
import { Combatant } from '@core/models/Combatant.js';
import { createLevelUpDraft } from '../services/levelup/levelUpAdapter';
import { applyLevelUpToActivePC } from '../components/player/levelup/levelUpSaveHelper';
import { LevelUpDialog } from '../components/player/levelup/LevelUpDialog';
import { Step1ClassAndStats } from '../components/player/levelup/steps/Step1ClassAndStats';
import { FeatsTabContent } from '../components/player/wizard/FeatsTabContent';
import { renderWithProviders } from '../test/test-utils';

describe('Level-Up Assistant Suite', () => {
  beforeEach(() => {
    CombatState.clearState();
    vi.restoreAllMocks();
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

  describe('3. Step1ClassAndStats Component Features', () => {
    it('automatically switches to the first class of a rulebook filter tab when clicked', () => {
      const updateLevelConfig = vi.fn();
      const getClassHitDie = vi.fn((cls: string) => (cls === 'wizard' ? 4 : cls === 'duskblade' ? 8 : 10));

      const mockPC = {
        classes: [{ classType: 'wizard', level: 4 }],
        con: { base: 14, mod: 2 },
        hp: 20,
        maxHp: 20,
      };

      const mockDraft = {
        totalCurrentLevel: 4,
        draftPC: mockPC,
        statMods: { con: 2 },
        classesList: [{ classType: 'wizard', level: 5 }],
      };

      render(
        <Step1ClassAndStats
          activePC={mockPC}
          initialDraft={mockDraft}
          currentConfig={{ classType: 'wizard', hpRoll: 3 }}
          currentLevelIndex={4}
          targetLevel={5}
          updateLevelConfig={updateLevelConfig}
          getClassHitDie={getClassHitDie}
          currentDraft={mockDraft}
          prevDraft={mockDraft}
          completedDraft={mockDraft}
        />
      );

      // Verify current classes overview strip
      expect(screen.getByText(/Current Classes:/i)).toBeInTheDocument();
      expect(screen.getByText(/New Build:/i)).toBeInTheDocument();

      // Click PHB2 tab -> should auto switch to Duskblade (first PHB2 class)
      const phb2Btn = screen.getByRole('button', { name: /PHB2/i });
      fireEvent.click(phb2Btn);

      expect(updateLevelConfig).toHaveBeenCalledWith(4, 'classType', 'duskblade');
      // Hit Die average for d8 is Math.ceil(8 / 2) + 1 = 5
      expect(updateLevelConfig).toHaveBeenCalledWith(4, 'hpRoll', 5);
    });

    it('renders current class breakdown vs new target build', () => {
      const mockPC = {
        classes: [{ classType: 'fighter', level: 3 }, { classType: 'rogue', level: 2 }],
        hp: 35,
        maxHp: 35,
      };

      const mockDraft = {
        totalCurrentLevel: 5,
        draftPC: mockPC,
        classesList: [{ classType: 'fighter', level: 4 }, { classType: 'rogue', level: 2 }],
      };

      render(
        <Step1ClassAndStats
          activePC={mockPC}
          initialDraft={mockDraft}
          currentConfig={{ classType: 'fighter', hpRoll: 6 }}
          currentLevelIndex={5}
          targetLevel={6}
          updateLevelConfig={vi.fn()}
          getClassHitDie={() => 10}
          currentDraft={mockDraft}
          prevDraft={mockDraft}
          completedDraft={mockDraft}
        />
      );

      expect(screen.getByText(/Current Classes:/i)).toBeInTheDocument();
      expect(screen.getByText(/Fighter 3 \/ Rogue 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Fighter 4 \/ Rogue 2/i)).toBeInTheDocument();
    });
  });

  describe('4. FeatsTabContent Defensive Rendering', () => {
    it('handles flat feat object arrays without throwing TypeError: feat is undefined', () => {
      const flatFeats = [
        {
          id: 'power_attack',
          name: 'Power Attack',
          type: 'General',
          prereq: 'Str 13',
          benefit: 'Trade BAB for damage bonus',
        },
        {
          id: 'cleave',
          name: 'Cleave',
          type: 'General',
          prereq: 'Power Attack',
          benefit: 'Extra melee attack on kill',
        },
      ];

      const updateLevelConfig = vi.fn();

      render(
        <FeatsTabContent
          currentConfig={{ feats: [] }}
          currentDraft={{ draftPC: { bab: 4, str: { base: 14 } } }}
          featSelectSlotIndex={0}
          featSearch=""
          setFeatSearch={vi.fn()}
          featFilter="all"
          setFeatFilter={vi.fn()}
          activeFeatSlot={{ label: 'General Feat', type: 'general' }}
          filteredFeats={flatFeats}
          updateLevelConfig={updateLevelConfig}
          currentLevelIndex={3}
        />
      );

      expect(screen.getByText(/Power Attack/i)).toBeInTheDocument();
      expect(screen.getByText(/Cleave/i)).toBeInTheDocument();
    });
  });

  describe('5. LevelUpDialog Component (4-Step Linear Wizard & Prereq Guard)', () => {
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
      expect(screen.getByText(/Current Classes:/i)).toBeInTheDocument();

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

    it('requires an ability score increase on milestone levels (e.g. Level 4)', () => {
      const pc = new Combatant({
        name: 'Gareth',
        race: 'human',
        classes: [{ classType: 'fighter', level: 3 }],
        str: 16,
        dex: 14,
        con: 14,
        int: 10,
        wis: 10,
        cha: 8,
      });

      renderWithProviders(
        <LevelUpDialog
          activePC={pc}
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Verify Level 3 -> Level 4 milestone banner
      expect(screen.getByText(/Level 3 ➔ Level 4/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 1\.2: Ability Score Increase/i)).toBeInTheDocument();

      // Attempting to advance without picking an attribute stays on Step 1
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      expect(screen.getByText(/Step 1\.1: Choose Class for Level 4/i)).toBeInTheDocument();

      // Select STR
      const strBtn = screen.getByRole('button', { name: /STR/i });
      fireEvent.click(strBtn);

      // Now Next Step advances to Step 2
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      expect(screen.getByText(/Skills \(/i)).toBeInTheDocument();
    });
  });
});

