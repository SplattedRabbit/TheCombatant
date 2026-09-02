/**
 * @module    DMCombatantsTable
 * @summary   Renders player/enemy tables on DM Screen with damage controls, recall buttons, stats and inline companion nesting.
 * @exports   DMCombatantsTable
 * @reads     state.combatants
 * @stateOps  CombatState.updateCombatantField, CombatState.updateCombatantNumber, CombatState.applyDamage, CombatState.applyTempHP, CombatState.removeCombatant, CombatState.addCombatant
 * @depends   React, @core/state.js, @core/rules.js, @core/rules/CompanionRules.js, @core/rules/FamiliarRules.js
 */

import React, { useState } from 'react';
import type { Combatant } from '../../types/combat';
import { CombatantRow } from './table/CombatantRow.tsx';
import { AddCombatantForm } from './table/AddCombatantForm.tsx';

interface DMCombatantsTableProps {
  side: 'p' | 'e';
  combatants: Combatant[];
}

export const DMCombatantsTable: React.FC<DMCombatantsTableProps> = ({ side, combatants }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter list of combatants to display
  let list: Combatant[] = [];
  if (side === 'p') {
    const players = combatants.filter(c => c.type === 'p');
    players.forEach(p => {
      list.push(p);
      const companion = combatants.find(x => x.id === `${p.id}-companion`);
      if (companion) list.push(companion);
      const familiar = combatants.find(x => x.id === `${p.id}-familiar`);
      if (familiar) list.push(familiar);
    });
  } else {
    list = combatants.filter(c => c.type !== 'p' && !c.id.endsWith('-companion') && !c.id.endsWith('-familiar'));
  }

  return (
    <div className="panel">
      <div className="phdr">
        <h2>{side === 'p' ? '⚔ Player Characters' : '💀 Enemies & NPCs'}</h2>
        <button className="btn no-print" onClick={() => setShowAddForm(!showAddForm)}>
          + Add
        </button>
      </div>
      <div className="pbody">
        <div className="col-hdr">
          <span>Name</span>
          <span style={{ textAlign: 'center' }}>Init</span>
          <span style={{ textAlign: 'center' }}>HP</span>
          <span style={{ textAlign: 'center' }}>AC</span>
          <span style={{ textAlign: 'center' }}>SPD</span>
          <span style={{ textAlign: 'center' }}>FORT</span>
          <span style={{ textAlign: 'center' }}>REF</span>
          <span style={{ textAlign: 'center' }}>WILL</span>
          <span>Damage · Heal</span>
        </div>

        {list.length === 0 ? (
          <div className="empty-msg">
            No {side === 'p' ? 'player characters' : 'enemies'} added yet
          </div>
        ) : (
          <div id={side === 'p' ? 'pRows' : 'eRows'}>
            {list.map(c => (
              <CombatantRow key={c.id} c={c} combatantsList={combatants} />
            ))}
          </div>
        )}

        {/* Add Form */}
        <AddCombatantForm
          side={side}
          show={showAddForm}
          onClose={() => setShowAddForm(false)}
        />
      </div>
    </div>
  );
};
