/**
 * @module    DMToolbox
 * @summary   DM Side Panel Toolbox component managing concentrations, message broadcasts, and quick rules reference.
 * @exports   DMToolbox
 * @reads     state.concentrations, CombatRules.CONDITIONS, state.combatants
 * @stateOps  CombatState.addConcentration, CombatState.updateConcentrationField, CombatState.removeConcentration
 * @depends   React, @core/state.js, @core/rules.js, @core/network/NetworkManager.js, @core/ui/dialogs/BaseDialogs.js
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CombatRules } from '@core/rules.js';
// @ts-ignore
import { broadcastToClients } from '@core/network/NetworkManager.js';
// @ts-ignore
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
  onSelectCondition: (condName: string) => void;
}

export const DMToolbox: React.FC<DMToolboxProps> = ({ concentrations, combatants, onSelectCondition }) => {
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

    broadcastToClients(packet);
    setMessageText('');
    showCustomAlert('Nachricht gesendet', 'Die Botschaft wurde übertragen.', 'OK', '✉️');
  };

  const players = combatants.filter(c => c.type === 'p');

  return (
    <div className="dm-side-col" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* 1. Concentration Spells Panel */}
      <div className="panel">
        <div className="phdr"><h2>🔮 Konzentrationszauber</h2></div>
        <div className="pbody" style={{ padding: '4px 5px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '58px 1fr 26px 18px',
            gap: '2px',
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '7.5px',
            color: 'var(--inkl)',
            padding: '1px 0 3px',
            letterSpacing: '0.3px'
          }}>
            <span>Zauberer</span>
            <span>Zauber</span>
            <span>Runden</span>
            <span>✕</span>
          </div>

          <div id="concRows" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {concentrations.length === 0 ? (
              <div className="empty-msg" style={{ padding: '3px 0', fontSize: '8.5px', fontStyle: 'italic', color: 'var(--inkl)', textAlign: 'center' }}>
                Keine aktiven Konzentrationszauber
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
                    title="Runden"
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
              placeholder="Zauber..."
            />
            <input
              className="conc-in"
              type="number"
              value={cDur}
              onChange={(e) => setCDur(e.target.value)}
              style={{ width: '26px', height: '15px', fontSize: '8.5px', padding: '0', textAlign: 'center' }}
              placeholder="Rd"
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
        <div className="phdr"><h2>📜 Botschaft an Spieler</h2></div>
        <div className="pbody" style={{ padding: '5px 6px' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '8.5px', fontWeight: 'bold', color: 'var(--inkm)' }}>Empfänger:</label>
            <select
              className="cinput"
              value={messageTarget}
              onChange={(e) => setMessageTarget(e.target.value)}
              style={{ flex: 1, height: '16px', fontSize: '8px', padding: '0 2px' }}
            >
              <option value="all">Alle Spieler</option>
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
            style={{ width: '100%', fontFamily: "'Crimson Text', serif", fontSize: '9px', resize: 'vertical', marginBottom: '4px', boxSizing: 'border-box' }}
            placeholder="Schreibe eine Nachricht an Spieler (z.B. geheime Entdeckungen)..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-p"
              onClick={handleSendMessage}
              style={{ fontSize: '8px', padding: '2px 8px', height: '16px', lineHeight: '10px' }}
            >
              Senden ✉️
            </button>
          </div>
        </div>
      </div>

      {/* 3. Quick Reference Conditions Panel */}
      <div className="panel">
        <div className="phdr"><h2>🎲 Schnellreferenz</h2></div>
        <div className="pbody qref" style={{ padding: '4px 6px' }}>
          {/* Static D&D Formulas */}
          <div className="qref-h" style={{ fontWeight: 'bold', fontSize: '8.5px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Angriff</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>Nah: 1W20 + BAB + Stä ± Größe</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>Fern: 1W20 + BAB + Ges ± Größe</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>Krit. best.: 1W20 + alle Angriffsboni</div>
          
          <hr className="qhr" style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.15)', margin: '3px 0' }} />
          
          <div className="qref-h" style={{ fontWeight: 'bold', fontSize: '8.5px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Rettungswürfe</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>ZÄ (Zähigkeit): Basis + Kon-Mod</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>REF (Reflex): Basis + Ges-Mod</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>WIL (Willen): Basis + Wei-Mod</div>
          
          <hr className="qhr" style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.15)', margin: '3px 0' }} />
          
          <div className="qref-h" style={{ fontWeight: 'bold', fontSize: '8.5px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Konzentration bei Schaden</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>SG 10 + Schaden + Zauberstufe · ZÄ</div>
          
          <hr className="qhr" style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.15)', margin: '3px 0' }} />
          
          <div className="qref-h" style={{ fontWeight: 'bold', fontSize: '8.5px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>Sterbend / Tod</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>0 TP = bewusstlos · −1 bis −9 = sterbend</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>Sterbend: −1 TP/Runde · W10 ≥ 10 = stabil</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25 }}>−10 TP = sofortiger Tod</div>
          
          <hr className="qhr" style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.15)', margin: '4px 0' }} />
          
          <div className="qref-h" style={{ fontWeight: 'bold', fontSize: '8.5px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", marginBottom: '3px' }}>Bedingungen &amp; Effekte</div>
          <div id="condRefGrid" style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
            {CombatRules.CONDITIONS.map((c: any) => (
              <div
                key={c.n}
                className="cond-ref-chip"
                onClick={() => onSelectCondition(c.n)}
                style={{
                  fontSize: '7.5px',
                  padding: '2px 4px',
                  border: '0.5px solid var(--pb)',
                  borderRadius: '2px',
                  background: 'rgba(200, 169, 110, 0.05)',
                  cursor: 'pointer',
                  color: 'var(--inkm)',
                  transition: 'all 0.15s ease'
                }}
              >
                {c.n}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
