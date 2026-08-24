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
      <div className="slabel">
        ⚔ Initiative — Round <span style={{ marginLeft: '4px', color: 'var(--red)', fontWeight: 'bold' }}>{round}</span>
      </div>

      {/* Main timeline bar */}
      <div className="init-bar" id="initBar">
        {combatants.length === 0 ? (
          <div className="empty-msg">
            Add combatants — they will appear here sorted by initiative value
          </div>
        ) : (
          combatants.map((c, idx) => {
            const pct = hpPct(c);
            const isCurrent = idx === turn;
            const isDead = c.hp <= 0;
            const isDragging = c.id === draggedId;
            const bc = getBarColor(pct, c.hp);

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
                  <div className="drop-gap" />
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
                    opacity: isDragging ? 0.25 : 1
                  }}
                >
                  <div className="init-num">{c.init}</div>
                  <div className="init-name">{c.name}</div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(200,169,110,.3)', borderRadius: '1px', marginTop: '2px', overflow: 'hidden' }}>
                    <div className="init-slot-hp-bar" style={{ width: `${pct}%`, height: '100%', background: bc, transition: 'width .2s' }} />
                  </div>
                  <div className={`init-dot ${dotCls(c.type)}`} />
                  
                  {activeConds.length > 0 && (
                    <div className="init-conds">
                      {activeConds.map((cd, cIdx) => {
                        const name = typeof cd === 'string' ? cd : (cd.n || '');
                        const dur = typeof cd === 'object' && cd.dur ? ` (${cd.dur}R)` : '';
                        return (
                          <div
                            key={cIdx}
                            className="init-cond-dot"
                            title={`${name}${dur}`}
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
          <div className="drop-gap" />
        )}
      </div>
    </div>
  );
};
