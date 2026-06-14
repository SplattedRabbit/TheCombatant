/**
 * @module    RoleSelection
 * @summary   Landing screen for selecting user role (Dungeon Master or Player Character).
 * @exports   RoleSelection
 * @reads     none
 * @stateOps  CombatState.setRole
 * @depends   React, @core/state.js
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
export const RoleSelection: React.FC = () => {
  const handleSelectRole = (role: 'dm' | 'player') => {
    CombatState.setRole(role);
  };

  return (
    <div className="role-overlay" id="roleOverlay" style={{ display: 'flex' }}>
      <div className="role-container">
        <div className="role-title">D&amp;D 3.5e Kampfblatt</div>
        <div className="role-subtitle">Bitte wähle deine Rolle für diese Sitzung</div>
        
        <div className="role-grid">
          <div className="role-card" id="btnChooseDM" onClick={() => handleSelectRole('dm')}>
            <div className="role-icon">🏰</div>
            <div className="role-card-title">Spielleiter (DM)</div>
            <div className="role-card-desc">
              Verwalte die Initiative-Reihenfolge, verwalte Lebenspunkte, würfle verdeckt und leite die Kampfbegegnung.
            </div>
          </div>
          
          <div className="role-card" id="btnChoosePlayer" onClick={() => handleSelectRole('player')}>
            <div className="role-icon">🛡️</div>
            <div className="role-card-title">Spieler (PC)</div>
            <div className="role-card-desc">
              Greife auf deinen interaktiven D&amp;D 3.5e Charakterbogen zu, führe Würfe durch und verwalte deine Ressourcen direkt.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
