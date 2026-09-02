/**
 * @module    SampleChoiceDialog
 * @summary   Parchment styled dialog for loading preconfigured sample heroes and encounters.
 */

import React from 'react';
import { DialogOverlay } from './DialogOverlay';

export interface SampleChoiceDialogProps {
  isPlayer: boolean;
  onConfirm: (choice: string) => void;
  onCancel: () => void;
}

export const SampleChoiceDialog: React.FC<SampleChoiceDialogProps> = ({
  isPlayer,
  onConfirm,
  onCancel,
}) => {
  return (
    <DialogOverlay onClose={onCancel} width={450} id="sampleChoiceDialogOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px' }}>
        🏰 Load Sample Data
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      
      {isPlayer ? (
        <>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.45, marginBottom: '16px', fontWeight: 500, textAlign: 'left' }}>
            Select a sample character with appropriate stats, weapons, and spells to load:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => onConfirm('wizard_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>🔮 Wizard (Elf, Level 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                A specialized wizard (Evocation) with an owl familiar and a filled spellbook.
              </span>
            </button>

            <button 
              onClick={() => onConfirm('ranger_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>🏹 Ranger (Human, Level 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                An agile ranged combatant with an animal companion (wolf) and matching combat feats for Two-Weapon Fighting / Archery.
              </span>
            </button>

            <button 
              onClick={() => onConfirm('paladin_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>🛡️ Paladin (Human, Level 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                An honorable knight with divine magic, auras, and powerful melee attacks (Smite Evil).
              </span>
            </button>

            <button
              onClick={() => onConfirm('trickster_lvl11')}
              className="btn"
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>🗡️ Arcane Trickster (Human, Level 11)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                A Rogue 3 / Wizard 5 / Arcane Trickster 3 with sneak attack, spellcasting, and Ranged Legerdemain ready to go.
              </span>
            </button>

            <button
              onClick={() => onConfirm('spellwarp_lvl10')}
              className="btn"
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>🎯 Spellwarp Sniper (Human, Level 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                A Rogue 1 / Wizard 5 / Spellwarp Sniper 4 with Sudden Raystrike (+2d6), Spellwarp, Ray spells, and 2 Skill Tricks (Spot the Weak Point & Collector of Stories).
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.45, marginBottom: '16px', fontWeight: 500, textAlign: 'left' }}>
            Select which encounter and characters should be loaded. For the Dungeon Master, all three heroes will be created simultaneously:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => onConfirm('party_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>🐉 Level 10 Hero Encounter</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                Creates 3 level 10 heroes (Wizard, Ranger, Paladin) and positions them against a dragon and giants.
              </span>
            </button>

            <button 
              onClick={() => onConfirm('aranis_only')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>🛡️ Aranis Only (Paladin Level 3)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                Loads a single level 3 paladin for smaller test scenarios.
              </span>
            </button>
          </div>
        </>
      )}

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{ fontFamily: 'var(--font-title)', fontSize: '9px', padding: '5px 25px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          Close
        </button>
      </div>
    </DialogOverlay>
  );
};
