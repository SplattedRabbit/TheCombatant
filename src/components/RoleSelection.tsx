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
// @ts-ignore
import { createInitialState } from '@core/models/model-core.js';
// @ts-ignore
import { applyLoadedState } from '@core/state/StorageManager.js';
import { campaignService } from '../services/campaign/CampaignService.ts';
import { characterService } from '../services/character/CharacterService.ts';
import { UserMenu } from './auth/UserMenu';

export const RoleSelection: React.FC = () => {
  const handleSelectRole = async (role: 'dm' | 'player' | 'wizard') => {
    if (role === 'dm') {
      let switched = false;
      const activeCampId = campaignService.getActiveCampaignId();
      if (activeCampId) {
        switched = await campaignService.switchActiveCampaign(activeCampId);
      }
      if (!switched) {
        const campaigns = await campaignService.listCampaigns();
        if (campaigns.length > 0) {
          switched = await campaignService.switchActiveCampaign(campaigns[0].id);
        }
      }
      if (!switched) {
        const fresh = createInitialState();
        fresh.session = { role: 'host' };
        fresh.combatants = [];
        applyLoadedState(fresh);
      }
      CombatState.setRole('dm');
    } else if (role === 'player') {
      let switched = false;
      const activeCharId = characterService.getActiveCharacterId();
      if (activeCharId) {
        switched = await characterService.switchActiveCharacter(activeCharId);
      }
      if (!switched) {
        const characters = await characterService.listCharacters();
        if (characters.length > 0) {
          switched = await characterService.switchActiveCharacter(characters[0].id);
        }
      }
      CombatState.setRole('player');
    } else {
      CombatState.setRole(role);
    }
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
