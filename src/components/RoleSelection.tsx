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
import { UserMenu } from './auth/UserMenu';

export const RoleSelection: React.FC = () => {
  const handleSelectRole = (role: 'dm' | 'player' | 'wizard') => {
    CombatState.setRole(role);
  };

  return (
    <div className="role-overlay" id="roleOverlay" style={{ display: 'flex' }}>
      <div className="role-container" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          <UserMenu />
        </div>
        <div className="role-title">The Combatant</div>
        <div className="role-subtitle">D&amp;D 3.5e Campaign &amp; Character Suite</div>
        
        <div className="role-grid">
          <div className="role-card" id="btnChooseDM" onClick={() => handleSelectRole('dm')}>
            <div className="role-icon">🏰</div>
            <div className="role-card-title">Dungeon Master (DM)</div>
            <div className="role-card-desc">
              Manage initiative order, track hit points, roll checks, and lead the combat encounter.
            </div>
          </div>
          
          <div className="role-card" id="btnChoosePlayer" onClick={() => handleSelectRole('player')}>
            <div className="role-icon">🛡️</div>
            <div className="role-card-title">Player Character (PC)</div>
            <div className="role-card-desc">
              Access your interactive D&amp;D 3.5e character sheet, roll checks, and manage your resources directly.
            </div>
          </div>

          <div className="role-card" id="btnChooseWizard" onClick={() => handleSelectRole('wizard')}>
            <div className="role-icon">🧙‍♂️</div>
            <div className="role-card-title">Character Wizard</div>
            <div className="role-card-desc">
              Create a new character step-by-step with the guided, rules-compliant wizard.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
