/**
 * @module    DMHeader
 * @summary   Header-Komponente für den Spielleiter-Bildschirm.
 *            Verwaltet und synchronisiert Begegnungs-Metadaten in Echtzeit.
 * @exports   DMHeader
 * @reads     meta.begegnung, meta.ort, meta.xpBudget, meta.xpVerteilt, meta.sitzung
 * @stateOps  CombatState.updateMeta
 * @depends   React, @core/state.js
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import type { EncounterMeta } from '../../types/combat';
import { UserMenu } from '../auth/UserMenu';
import { CampaignManagerDialog } from './CampaignManagerDialog.tsx';
import { TablePresenceBar } from '../shared/TablePresenceBar.tsx';

interface DMHeaderProps {
  meta: EncounterMeta;
}

export const DMHeader: React.FC<DMHeaderProps> = ({ meta }) => {
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState<boolean>(false);

  const handleChangeMeta = (key: string, value: string) => {
    CombatState.updateMeta(key, value);
  };

  return (
    <div className="hdr" style={{ textAlign: 'center', marginBottom: '10px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <TablePresenceBar />
        <button
          type="button"
          onClick={() => setIsCampaignDialogOpen(true)}
          className="btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            fontSize: '11px',
            fontFamily: "'IM Fell English SC', serif",
            fontWeight: 'bold',
            background: 'rgba(253, 246, 226, 0.9)',
            border: '1px solid var(--pb)',
            borderRadius: '12px',
            cursor: 'pointer',
            color: 'var(--ink)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          title="Kampagnen-Dashboard öffnen (Kampagnen wechseln, erstellen, duplizieren)"
        >
          <span>🎲</span>
          <span>Kampagnen</span>
        </button>
        <UserMenu />
      </div>
      <CampaignManagerDialog
        isOpen={isCampaignDialogOpen}
        onClose={() => setIsCampaignDialogOpen(false)}
      />
      <h1>Dungeon Master Combat Sheet</h1>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '2px 0' }}>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--pb)', maxWidth: '60px' }} />
        <span style={{ color: 'var(--gold)', fontSize: '11px' }}>✦ ❧ ✦</span>
        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--pb)', maxWidth: '60px' }} />
      </div>
      <div className="hdr-sub" style={{ fontSize: '10px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '8px' }}>
        Dungeons &amp; Dragons · 3rd Edition Revised · Core Rules
      </div>
      
      <div className="hdr-meta" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 12px', fontSize: '9px', color: 'var(--inkm)' }}>
        <span>
          Encounter:{' '}
          <input
            type="text"
            className="cinput"
            value={meta.begegnung}
            onChange={(e) => handleChangeMeta('begegnung', e.target.value)}
            placeholder="e.g. Goblin Ambush"
            style={{ width: '120px', fontSize: '9px', height: '15px', padding: '0 2px' }}
          />
        </span>
        <span>
          Location:{' '}
          <input
            type="text"
            className="cinput"
            value={meta.ort}
            onChange={(e) => handleChangeMeta('ort', e.target.value)}
            placeholder="Dungeon, Level..."
            style={{ width: '90px', fontSize: '9px', height: '15px', padding: '0 2px' }}
          />
        </span>
        <span>
          XP Budget:{' '}
          <input
            type="text"
            className="cinput"
            value={meta.xpBudget}
            onChange={(e) => handleChangeMeta('xpBudget', e.target.value)}
            placeholder="0"
            style={{ width: '45px', fontSize: '9px', height: '15px', padding: '0 2px', textAlign: 'center' }}
          />
        </span>
        <span>
          XP Awarded:{' '}
          <input
            type="text"
            className="cinput"
            value={meta.xpVerteilt}
            onChange={(e) => handleChangeMeta('xpVerteilt', e.target.value)}
            placeholder="0"
            style={{ width: '45px', fontSize: '9px', height: '15px', padding: '0 2px', textAlign: 'center' }}
          />
        </span>
        <span>
          Session:{' '}
          <input
            type="text"
            className="cinput"
            value={meta.sitzung}
            onChange={(e) => handleChangeMeta('sitzung', e.target.value)}
            placeholder="#1"
            style={{ width: '30px', fontSize: '9px', height: '15px', padding: '0 2px', textAlign: 'center' }}
          />
        </span>
      </div>
    </div>
  );
};
