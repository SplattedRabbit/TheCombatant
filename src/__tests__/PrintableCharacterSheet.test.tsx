import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { PrintableCharacterSheetModal } from '../components/player/print/PrintableCharacterSheetModal';
import { PrintPage1CoreCombat } from '../components/player/print/pages/PrintPage1CoreCombat';
import { PrintPage2SkillsFeatures } from '../components/player/print/pages/PrintPage2SkillsFeatures';
import { PrintPage3EquipmentArmory } from '../components/player/print/pages/PrintPage3EquipmentArmory';
import { PrintPage4SpellsCompanion } from '../components/player/print/pages/PrintPage4SpellsCompanion';
import { Combatant } from '@core/models/Combatant.js';

describe('Printable D&D 3.5e Character Sheet Folio Suite', () => {
  let samplePaladin: any;
  let sampleWizard: any;

  beforeEach(() => {
    vi.restoreAllMocks();

    samplePaladin = new Combatant({
      name: 'Sir Valerius',
      race: 'human',
      alignment: 'Lawful Good',
      classes: [{ classType: 'paladin', level: 10 }],
      str: 20,
      dex: 10,
      con: 16,
      int: 10,
      wis: 12,
      cha: 16,
      hp: 85,
      maxHp: 85,
      speed: '20 ft.',
    });

    Object.assign(samplePaladin, {
      companionType: 'heavy_warhorse',
      companionName: 'Shadowmere',
      weapons: [
        { name: 'Holy Greatsword +2', attackBonus: '+17/+12', damage: '2d6+9', critThreat: '19-20/x2', damageType: 'Slashing' },
        { name: 'Heavy Crossbow', attackBonus: '+10', damage: '1d10', critThreat: '19-20/x2', damageType: 'Piercing', range: '120 ft.' }
      ],
      armor: { name: 'Full Plate +1', type: 'Heavy', acBonus: 9, maxDex: 1, checkPenalty: -5, spellFailure: 35, weight: 50 },
      shield: { name: 'None / 2H', type: 'None', acBonus: 0 },
      skills: {
        diplomacy: { ranks: 13, misc: 2 },
        ride: { ranks: 10, misc: 0 },
        knowledge_religion: { ranks: 5, misc: 0 }
      },
      feats: [{ id: 'power_attack' }, { id: 'cleave' }, { id: 'extra_turning' }],
      acfs: ['paladin_charging_smite'],
      currency: { gp: 4500, sp: 20, cp: 50, pp: 12 }
    });

    sampleWizard = new Combatant({
      name: 'Corvin Nachtschatten',
      race: 'human',
      classes: [
        { classType: 'rogue', level: 3 },
        { classType: 'wizard', level: 5 },
        { classType: 'arcane_trickster', level: 2 }
      ],
      str: 10,
      dex: 16,
      con: 14,
      int: 18,
      wis: 12,
      cha: 10,
      hp: 45,
      maxHp: 45,
    });

    Object.assign(sampleWizard, {
      familiarType: 'raven',
      familiarName: 'Kallisto',
      spellbook: [
        { level: 1, nameEn: 'Magic Missile', school: 'Evocation', range: 'Medium', desc: '1d4+1 force dmg per missile' },
        { level: 2, nameEn: 'Invisibility', school: 'Illusion', range: 'Touch', desc: 'Target invisible 1 min/lvl' },
        { level: 3, nameEn: 'Fireball', school: 'Evocation', range: 'Long', desc: '1d6 fire dmg per lvl in 20-ft radius' }
      ]
    });
  });

  describe('1. Page 1: Core & Combat Layout', () => {
    it('renders classic header, attributes with oval modifiers, AC, saves and weapon blocks', () => {
      render(<PrintPage1CoreCombat pc={samplePaladin} />);

      expect(screen.getByText('DUNGEONS & DRAGONS')).toBeInTheDocument();
      expect(screen.getByText('Sir Valerius')).toBeInTheDocument();
      expect(screen.getByText(/Paladin 10/i)).toBeInTheDocument();

      // Ability Scores & Modifiers
      expect(screen.getByText('STR')).toBeInTheDocument();
      expect(screen.getAllByText('+5')[0]).toBeInTheDocument(); // STR 20 = +5
      expect(screen.getByText('20')).toBeInTheDocument();

      // HP & AC
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('Total AC')).toBeInTheDocument();

      // Saves
      expect(screen.getByText('Fortitude')).toBeInTheDocument();
      expect(screen.getByText('Reflex')).toBeInTheDocument();
      expect(screen.getByText('Will')).toBeInTheDocument();

      // Weapons
      expect(screen.getByText('Holy Greatsword +2')).toBeInTheDocument();
      expect(screen.getByText('+17/+12')).toBeInTheDocument();
      expect(screen.getByText('2d6+9')).toBeInTheDocument();
    });
  });

  describe('2. Page 2: Skills, Feats & ACFs', () => {
    it('renders 3.5e skills table with class skill indicators, feats, and active ACFs', () => {
      render(<PrintPage2SkillsFeatures pc={samplePaladin} />);

      expect(screen.getByText('SKILLS & FEATS')).toBeInTheDocument();
      expect(screen.getByText('Diplomacy')).toBeInTheDocument();
      expect(screen.getByText('Ride')).toBeInTheDocument();

      // Feats
      expect(screen.getByText(/Power Attack/i)).toBeInTheDocument();

      // ACFs
      expect(screen.getByText(/Charging Smite/i)).toBeInTheDocument();
      expect(screen.getByText(/Replaces: Special Mount/i)).toBeInTheDocument();
    });
  });

  describe('3. Page 3: Equipment, Wealth & Encumbrance', () => {
    it('renders armor table, encumbrance carrying capacity limits, and currency', () => {
      render(<PrintPage3EquipmentArmory pc={samplePaladin} />);

      expect(screen.getByText('EQUIPMENT & WEALTH')).toBeInTheDocument();
      expect(screen.getAllByText('Full Plate +1')[0]).toBeInTheDocument();
      expect(screen.getByText('+9')).toBeInTheDocument();

      // Carrying capacity for STR 20
      expect(screen.getByText(/Carrying Capacity \(STR 20\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Light Load/i)).toBeInTheDocument();

      // Wealth
      expect(screen.getByText('4500')).toBeInTheDocument(); // GP
      expect(screen.getByText('12')).toBeInTheDocument(); // PP
    });
  });

  describe('4. Page 4: Spellbook & Companion', () => {
    it('renders spells per day matrix, prepared spells, and companion/familiar statistics', () => {
      render(<PrintPage4SpellsCompanion pc={sampleWizard} />);

      expect(screen.getByText('SPELLBOOK & COMPANION')).toBeInTheDocument();
      expect(screen.getByText('Spells per Day & Spell Save DCs')).toBeInTheDocument();

      // Spells
      expect(screen.getAllByText('Magic Missile')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Invisibility')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Fireball')[0]).toBeInTheDocument();

      // Familiar
      expect(screen.getByText(/Kallisto/i)).toBeInTheDocument();
      expect(screen.getByText(/raven/i)).toBeInTheDocument();
    });
  });

  describe('5. Master PrintableCharacterSheetModal', () => {
    it('toggles pages, changes theme between parchment and ink-friendly, and triggers window.print', () => {
      const handleClose = vi.fn();
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

      render(
        <PrintableCharacterSheetModal
          pc={samplePaladin}
          isOpen={true}
          onClose={handleClose}
        />
      );

      expect(screen.getByText(/D&D 3.5e Character Sheet Print Preview/i)).toBeInTheDocument();

      // Theme toggle
      const themeBtn = screen.getByRole('button', { name: /Parchment|Ink-Friendly/i });
      fireEvent.click(themeBtn);
      expect(screen.getByRole('button', { name: /Ink-Friendly/i })).toBeInTheDocument();

      // Page toggles
      const page2Btn = screen.getByRole('button', { name: /Page 2/i });
      fireEvent.click(page2Btn);

      // Print Button
      const printBtn = screen.getByRole('button', { name: /Print \/ Save as PDF/i });
      fireEvent.click(printBtn);
      expect(printSpy).toHaveBeenCalled();

      // Close Button
      const closeBtn = screen.getByRole('button', { name: /✕/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
