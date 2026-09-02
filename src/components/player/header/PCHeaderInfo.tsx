/**
 * @module    PCHeaderInfo
 * @summary   Name, race, class list, size, alignment input, and action buttons in PCHeader.
 */

import React, { useState } from 'react';
import type { Combatant } from '../../../types/combat';
import { CombatState } from '@core/state.js';
import { UserMenu } from '../../auth/UserMenu';
import { CharacterRosterDialog } from '../CharacterRosterDialog.tsx';
import { JoinCampaignDialog } from '../../dialogs/JoinCampaignDialog.tsx';
import { TablePresenceBar } from '../../shared/TablePresenceBar.tsx';

interface PCHeaderInfoProps {
  pc: Combatant;
  onOpenWizard?: () => void;
  onOpenLevelUp?: () => void;
  onOpenPrint?: () => void;
}

export const PCHeaderInfo: React.FC<PCHeaderInfoProps> = ({ pc, onOpenWizard, onOpenLevelUp, onOpenPrint }) => {
  const [isRosterOpen, setIsRosterOpen] = useState<boolean>(false);
  const [isJoinOpen, setIsJoinOpen] = useState<boolean>(false);

  // Translate Race
  const getRaceName = (race: string) => {
    const names: Record<string, string> = {
      human: 'Human',
      elf: 'Elf',
      dwarf: 'Dwarf',
      gnome: 'Gnome',
      halfling: 'Halfling',
      deep_halfling: 'Deep Halfling',
      half_elf: 'Half-Elf',
      half_orc: 'Half-Orc',
      tiefling: 'Tiefling',
    };
    return names[race.toLowerCase()] || race;
  };

  // Generate Class String
  const getClassesString = () => {
    if (!Array.isArray(pc.classes) || pc.classes.length === 0) return 'Level 1';
    return pc.classes
      .map((c: any) => {
        const clsNames: Record<string, string> = {
          barbarian: 'Barbarian',
          bard: 'Bard',
          cleric: 'Cleric',
          druid: 'Druid',
          fighter: 'Fighter',
          monk: 'Monk',
          paladin: 'Paladin',
          ranger: 'Ranger',
          rogue: 'Rogue',
          sorcerer: 'Sorcerer',
          wizard: 'Wizard',
          duskblade: 'Duskblade',
          beguiler: 'Beguiler',
          knight: 'Knight',
          dragon_shaman: 'Dragon Shaman',
          ninja: 'Ninja',
          scout: 'Scout',
          spellthief: 'Spellthief',
          mystic_theurge: 'Mystic Theurge',
          arcane_trickster: 'Arcane Trickster',
          dragon_disciple: 'Dragon Disciple',
          assassin: 'Assassin',
          battle_trickster: 'Battle Trickster',
          spellwarp_sniper: 'Spellwarp Sniper',
          shadowbane_inquisitor: 'Shadowbane Inquisitor',
          custom: 'Custom',
        };
        const name = clsNames[c.classType.toLowerCase()] || c.classType
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return `${name} ${c.level}`;
      })
      .join(' / ');
  };

  // Translate Size
  const getSizeName = (size: string) => {
    const sizes: Record<string, string> = {
      medium: 'Medium',
      small: 'Small',
      large: 'Large',
      tiny: 'Tiny',
    };
    return sizes[size.toLowerCase()] || size || 'Medium';
  };

  return (
    <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '18px',
            color: 'var(--red)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          Character Sheet:
          <input
            type="text"
            value={pc.name}
            onChange={(e) => CombatState.updatePCField('name', e.target.value)}
            className="pc-name-field"
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--pb)',
              fontFamily: 'var(--font-title)',
              fontSize: '18px',
              color: 'var(--red)',
              outline: 'none',
              width: '180px',
            }}
          />
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TablePresenceBar />
          {onOpenLevelUp && (
            <button
              type="button"
              onClick={onOpenLevelUp}
              className="hdr-action-btn animate-glow"
              title="Open guided Level-Up Assistant"
              style={{ fontWeight: 'bold', color: 'var(--red)', borderColor: 'var(--red)' }}
            >
              <span>🧙‍♂️</span>
              <span>+ Level Up</span>
            </button>
          )}
          {onOpenPrint && (
            <button
              type="button"
              onClick={onOpenPrint}
              className="hdr-action-btn"
              title="Open printable D&D 3.5e Character Sheet Folio (A4 / PDF)"
            >
              <span>🖨️</span>
              <span>Print Sheet</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsJoinOpen(true)}
            className="hdr-action-btn"
            title="Join a DM Campaign via invite code"
          >
            <span>🔗</span>
            <span>Join Table</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRosterOpen(true)}
            className="hdr-action-btn"
            title="Open Character Roster (switch, create, duplicate)"
          >
            <span>📜</span>
            <span>Roster</span>
          </button>
          <UserMenu />
        </div>
        <CharacterRosterDialog
          isOpen={isRosterOpen}
          onClose={() => setIsRosterOpen(false)}
          onOpenWizard={onOpenWizard}
        />
        <JoinCampaignDialog
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
        />
      </div>

      {/* Race, Classes, Size, Alignment */}
      <div
        style={{
          fontSize: '8.5px',
          color: 'var(--inkm)',
          fontFamily: 'var(--font-body)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          marginTop: '2px',
        }}
      >
        <span style={{ background: 'rgba(200, 169, 110, 0.08)', padding: '1px 4px', borderRadius: '2px', border: '0.5px solid var(--pb)' }}>
          🧬 {getRaceName(pc.race || 'human')}{pc.levelAdjustment ? ` (ECL ${(pc.classes || []).reduce((sum: number, c: any) => sum + (c.level || 0), 0) + pc.levelAdjustment})` : ''}
        </span>
        <span style={{ background: 'rgba(139, 26, 26, 0.05)', color: 'var(--red)', padding: '1px 4px', borderRadius: '2px', border: '0.5px solid rgba(139, 26, 26, 0.2)', fontWeight: 'bold' }}>
          🎭 {getClassesString()}
        </span>
        <span style={{ background: 'rgba(200, 169, 110, 0.08)', padding: '1px 4px', borderRadius: '2px', border: '0.5px solid var(--pb)' }}>
          📏 {getSizeName(pc.size || 'medium')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span>Alignment:</span>
          <input
            type="text"
            placeholder="e.g. LG"
            value={pc.alignment || ''}
            onChange={(e) => CombatState.updatePCField('alignment', e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '0.5px solid var(--pb)',
              fontFamily: 'var(--font-body)',
              fontSize: '8.5px',
              color: 'var(--inkl)',
              outline: 'none',
              width: '80px',
              textAlign: 'center',
            }}
          />
        </span>
      </div>
    </div>
  );
};
