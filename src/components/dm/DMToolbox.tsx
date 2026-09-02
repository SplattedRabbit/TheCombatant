/**
 * @module    DMToolbox
 * @summary   DM Side Panel Toolbox component managing concentrations, message broadcasts, and quick rules reference.
 * @exports   DMToolbox
 * @reads     state.concentrations, CombatRules.CONDITIONS, state.combatants
 * @stateOps  CombatState.addConcentration, CombatState.updateConcentrationField, CombatState.removeConcentration
 * @depends   React, @core/state.js, @core/rules.js, @core/network/NetworkManager.js, @core/ui/dialogs/BaseDialogs.js
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { realtimeManager } from '../../services/network/RealtimeManager.ts';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import type { Combatant } from '../../types/combat';

interface ConcentrationSpell {
  id: string;
  who: string;
  spell: string;
  dur: number;
}

interface DMToolboxProps {
  concentrations: ConcentrationSpell[];
  combatants: Combatant[];
}

export const DMToolbox: React.FC<DMToolboxProps> = ({ concentrations, combatants }) => {
  // Concentration inputs
  const [cWho, setCWho] = useState('');
  const [cSpell, setCSpell] = useState('');
  const [cDur, setCDur] = useState('');

  // Message inputs
  const [messageTarget, setMessageTarget] = useState('all');
  const [messageText, setMessageText] = useState('');

  // Add concentration spell
  const handleAddConc = () => {
    if (!cWho.trim() || !cSpell.trim()) return;
    const durVal = parseInt(cDur) || 0;
    CombatState.addConcentration(cWho.trim(), cSpell.trim(), durVal);
    setCWho('');
    setCSpell('');
    setCDur('');
  };

  // Update concentration spell
  const handleUpdateConcField = (id: string, key: 'spell' | 'dur', value: string) => {
    const val = key === 'dur' ? (parseInt(value) || 0) : value;
    CombatState.updateConcentrationField(id, key, val);
  };

  // Remove concentration spell
  const handleRemoveConc = (id: string) => {
    CombatState.removeConcentration(id);
  };

  // Send Spielleiter message
  const handleSendMessage = () => {
    const text = messageText.trim();
    if (!text) return;

    const packet = {
      type: 'dm_message',
      text: text,
      targetPCId: messageTarget
    };

    realtimeManager.broadcastDiff(packet);
    setMessageText('');
    showCustomAlert('Message sent', 'The message has been transmitted.', 'OK', '✉️');
  };

  const players = combatants.filter(c => c.type === 'p');

  return (
    <div className="dm-side-col" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* 1. Concentration Spells Panel */}
      <div className="panel">
        <div className="phdr"><h2>🔮 Concentration Spells</h2></div>
        <div className="pbody" style={{ padding: '4px 5px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '58px 1fr 26px 18px',
            gap: '2px',
            fontFamily: 'var(--font-title)',
            fontSize: '7.5px',
            color: 'var(--inkl)',
            padding: '1px 0 3px',
            letterSpacing: '0.3px'
          }}>
            <span>Caster</span>
            <span>Spell</span>
            <span>Rounds</span>
            <span>✕</span>
          </div>

          <div id="concRows" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {concentrations.length === 0 ? (
              <div className="empty-msg" style={{ padding: '3px 0', fontSize: '8.5px', fontStyle: 'italic', color: 'var(--inkl)', textAlign: 'center' }}>
                No active concentration spells
              </div>
            ) : (
              concentrations.map(c => (
                <div key={c.id} className="conc-row" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <span style={{ width: '58px', color: 'var(--inkm)', fontStyle: 'italic', fontSize: '9px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.who}>
                    {c.who}
                  </span>
                  <input
                    type="text"
                    className="conc-in spell-input"
                    value={c.spell}
                    onChange={(e) => handleUpdateConcField(c.id, 'spell', e.target.value)}
                    style={{ flex: 1, fontSize: '8.5px', height: '14px', padding: '0 2px' }}
                  />
                  <input
                    type="number"
                    className="conc-in spell-dur"
                    value={c.dur || ''}
                    placeholder="∞"
                    onChange={(e) => handleUpdateConcField(c.id, 'dur', e.target.value)}
                    style={{ width: '26px', textAlign: 'center', fontSize: '8.5px', height: '14px', padding: '0' }}
                    title="Rounds"
                  />
                  <button
                    className="xbtn xbtn-del delete-spell-btn"
                    onClick={() => handleRemoveConc(c.id)}
                    style={{ padding: '1px 4px', height: '14px', fontSize: '8.5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add form */}
          <div className="no-print" style={{ marginTop: '5px', display: 'flex', gap: '3px', alignItems: 'center' }}>
            <input
              className="conc-in"
              type="text"
              value={cWho}
              onChange={(e) => setCWho(e.target.value)}
              style={{ width: '55px', height: '15px', fontSize: '8.5px', padding: '0 2px' }}
              placeholder="Name"
            />
            <input
              className="conc-in"
              type="text"
              value={cSpell}
              onChange={(e) => setCSpell(e.target.value)}
              style={{ flex: 1, minWidth: '55px', height: '15px', fontSize: '8.5px', padding: '0 2px' }}
              placeholder="Spell..."
            />
            <input
              className="conc-in"
              type="number"
              value={cDur}
              onChange={(e) => setCDur(e.target.value)}
              style={{ width: '26px', height: '15px', fontSize: '8.5px', padding: '0', textAlign: 'center' }}
              placeholder="Rds"
            />
            <button
              className="btn btn-p"
              onClick={handleAddConc}
              style={{ fontSize: '8px', padding: '2px 7px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 2. DM Message Panel */}
      <div className="panel no-print">
        <div className="phdr"><h2>📜 Message to Players</h2></div>
        <div className="pbody" style={{ padding: '5px 6px' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '8.5px', fontWeight: 'bold', color: 'var(--inkm)' }}>Recipient:</label>
            <select
              className="cinput"
              value={messageTarget}
              onChange={(e) => setMessageTarget(e.target.value)}
              style={{ flex: 1, height: '16px', fontSize: '8px', padding: '0 2px' }}
            >
              <option value="all">All Players</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <textarea
            className="cinput"
            rows={2}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: '9px', resize: 'vertical', marginBottom: '4px', boxSizing: 'border-box' }}
            placeholder="Write a message to players (e.g. secret discoveries)..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-p"
              onClick={handleSendMessage}
              style={{ fontSize: '8px', padding: '2px 8px', height: '16px', lineHeight: '10px' }}
            >
              Send ✉️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
