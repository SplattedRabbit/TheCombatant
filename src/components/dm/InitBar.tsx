/**
 * @module    InitBar
 * @summary   Initiative-Leiste für den Spielleiter-Bildschirm.
 *            Zeigt die Zugreihenfolge an und unterstützt Drag-and-Drop zur manuellen Sortierung.
 * @exports   InitBar
 * @reads     state.combatants, state.turn, state.round
 * @stateOps  CombatState.updateCombatantNumber, CombatState.sortCombatants
 * @depends   React, @core/state.js
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import type { Combatant } from '../../types/combat';

interface InitBarProps {
  combatants: Combatant[];
  turn: number;
  round: number;
}

export const InitBar: React.FC<InitBarProps> = ({ combatants, turn, round }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const hpPct = (c: Combatant) => {
    return c.maxHp > 0 ? Math.max(0, Math.min(100, c.hp / c.maxHp * 100)) : 0;
  };

  const dotCls = (t: string) => {
    return t === 'p' ? 'dot-p' : t === 'n' ? 'dot-n' : 'dot-e';
  };

  const getBarColor = (pct: number, hp: number) => {
    if (hp <= 0) return '#888';
    if (pct > 50) return '#4aaa4a';
    if (pct > 25) return '#d4a000';
    return '#cc3333';
  };

  // Drag-and-Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropIdx(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number, id: string, rect: DOMRect) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;
    
    // Check if dragging over left half or right half
    const insertBefore = e.clientX < rect.left + rect.width / 2;
    const newInsertIdx = insertBefore ? index : index + 1;
    
    if (newInsertIdx !== dropIdx) {
      setDropIdx(newInsertIdx);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number, id: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;

    const srcIdx = combatants.findIndex(x => x.id === draggedId);
    if (srcIdx === -1) return;

    // We calculate the insertion index
    let ins = dropIdx !== null ? dropIdx : index;
    
    // Copy combatants list to calculate slots
    const list = [...combatants];
    const [moved] = list.splice(srcIdx, 1);
    
    if (srcIdx < ins) ins--;
    ins = Math.max(0, Math.min(ins, list.length));

    // Calculate new initiative value based on neighbors
    const left = ins > 0 ? list[ins - 1] : null;
    const right = ins < list.length ? list[ins] : null;
    
    let newInit = moved.init;
    if (!left && !right) {
      // Do nothing
    } else if (!left && right) {
      newInit = right.init + 1;
    } else if (left && !right) {
      newInit = left.init - 1;
    } else if (left && right) {
      newInit = Math.floor((left.init + right.init) / 2);
    }

    // Update the engine state
    CombatState.updateCombatantNumber(moved.id, 'init', newInit);
    
    // Trigger engine sort
    CombatState.sortCombatants();
    
    // Update the active turn indicator if needed to keep the active character focused
    const activeCombatant = combatants[turn];
    if (activeCombatant) {
      // Fetch sorted combatants from engine after sorting
      const sorted = CombatState.getState().combatants;
      const newTurn = sorted.findIndex((x: any) => x.id === activeCombatant.id);
      if (newTurn !== -1) {
        CombatState.getState().turn = newTurn;
        CombatState.saveToStorage();
      }
    }

    setDraggedId(null);
    setDropIdx(null);
  };

  const handleSlotClick = (index: number) => {
    if (draggedId) return;
    const state = CombatState.getState();
    state.turn = index;
    CombatState.saveToStorage();
    // Emit state change to trigger React re-render
    CombatState.updateMeta('sitzung', state.meta.sitzung); 
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Round Header / Title */}
      <div className="slabel" style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '13px', display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        ⚔ Initiative — Runde <span style={{ marginLeft: '4px', color: 'var(--red)', fontWeight: 'bold' }}>{round}</span>
      </div>

      {/* Main timeline bar */}
      <div 
        className="init-bar" 
        id="initBar"
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          padding: '6px 4px',
          background: 'rgba(200, 169, 110, 0.03)',
          border: '0.5px solid var(--pb)',
          borderRadius: '4px',
          minHeight: '52px',
          boxSizing: 'border-box',
          alignItems: 'center'
        }}
      >
        {combatants.length === 0 ? (
          <div className="empty-msg" style={{ width: '100%', textAlign: 'center', fontStyle: 'italic', color: 'var(--inkl)' }}>
            Füge Kämpfer hinzu — sie erscheinen hier nach Initiativwert sortiert
          </div>
        ) : (
          combatants.map((c, idx) => {
            const pct = hpPct(c);
            const isCurrent = idx === turn;
            const isDead = c.hp <= 0;
            const isDragging = c.id === draggedId;

            // Filter conditions
            const activeConds = Array.isArray(c.conditions) 
              ? (c.conditions as any[]).filter(cd => {
                  const name = typeof cd === 'string' ? cd : (cd && cd.n);
                  return name && name !== 'Temp-HP';
                })
              : [];

            return (
              <React.Fragment key={c.id}>
                {/* Visual drop gap spacer */}
                {dropIdx === idx && draggedId !== c.id && (
                  <div
                    className="drop-gap"
                    style={{
                      width: '4px',
                      height: '40px',
                      background: 'var(--red)',
                      boxShadow: '0 0 6px var(--red)',
                      borderRadius: '1px',
                      transition: 'all 0.15s ease'
                    }}
                  />
                )}

                {/* Combatant slot */}
                <div
                  className={`init-slot ${isCurrent ? 'active' : ''} ${isDead ? 'dead' : ''} ${isDragging ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, c.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleDragOver(e, idx, c.id, rect);
                  }}
                  onDrop={(e) => handleDrop(e, idx, c.id)}
                  onClick={() => handleSlotClick(idx)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '76px',
                    maxWidth: '110px',
                    height: '40px',
                    border: isCurrent ? '1px solid var(--red)' : '0.5px solid var(--pb)',
                    borderRadius: '3px',
                    padding: '3px 6px',
                    cursor: 'pointer',
                    background: isCurrent ? 'rgba(139, 26, 26, 0.06)' : 'rgba(200, 169, 110, 0.04)',
                    boxShadow: isCurrent ? '0 0 8px rgba(139, 26, 26, 0.2)' : 'none',
                    opacity: isDragging ? 0.4 : isDead ? 0.6 : 1,
                    transition: 'border-color 0.15s, background-color 0.15s',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', lineHeight: 1 }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>{c.init}</span>
                    <span className={`init-dot ${dotCls(c.type)}`} style={{ width: '4px', height: '4px', borderRadius: '50%', display: 'inline-block' }} />
                  </div>
                  
                  <div style={{
                    fontSize: '8.5px',
                    fontFamily: "'IM Fell English SC', serif",
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    color: isCurrent ? 'var(--red)' : 'var(--inkm)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    textAlign: 'center',
                    marginTop: '2px',
                    lineHeight: 1.1
                  }}>
                    {c.name}
                  </div>

                  {/* HP bar */}
                  <div style={{ width: '100%', height: '3px', background: 'rgba(200,169,110,.2)', borderRadius: '1px', marginTop: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: getBarColor(pct, c.hp), transition: 'width .2s' }} />
                  </div>

                  {/* Condition Motes */}
                  {activeConds.length > 0 && (
                    <div style={{ position: 'absolute', bottom: '-2px', right: '4px', display: 'flex', gap: '1px' }}>
                      {activeConds.slice(0, 4).map((cd, cIdx) => {
                        const name = typeof cd === 'string' ? cd : (cd.n || '');
                        const dur = typeof cd === 'object' && cd.dur ? ` (${cd.dur}R)` : '';
                        return (
                          <div
                            key={cIdx}
                            title={`${name}${dur}`}
                            style={{
                              width: '3.5px',
                              height: '3.5px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--red)',
                              border: '0.5px solid var(--p)'
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}

        {/* Visual drop gap spacer at the very end */}
        {dropIdx === combatants.length && draggedId && (
          <div
            className="drop-gap"
            style={{
              width: '4px',
              height: '40px',
              background: 'var(--red)',
              boxShadow: '0 0 6px var(--red)',
              borderRadius: '1px',
              transition: 'all 0.15s ease'
            }}
          />
        )}
      </div>
    </div>
  );
};
