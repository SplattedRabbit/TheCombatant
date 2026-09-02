/**
 * @module    PCBuffsTab
 * @summary   Renders the buff manager tab with the list of active buffs, quick select, rulebook search, and the custom buff builder.
 * @exports   PCBuffsTab
 * @reads     pc.activeBuffs, pc.quickBuffs, pc.classes, pc.learnedSpells, pc.spellSlots, pc.preparedSpells
 * @stateOps  updatePCBatch, activateBuffByKey, checkBuffConflict, showCustomConfirm, showCustomAlert
 * @depends   React, @core/state.js, @core/spells.js, @core/data/class-buffs-data.js, @core/rules/BuffRules.js, @core/ui/components/dialogs.js
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { activateBuffByKey } from '@core/rules/BuffRules.js';
import { showCustomConfirm, showCustomAlert, showCustomPrompt } from '@core/ui/components/dialogs.js';
import { uiRegistry } from '@core/ui/ui-shared.js';
import { ActiveBuffsPills } from './buffs/ActiveBuffsPills.tsx';
import { QuickBuffsSection } from './buffs/QuickBuffsSection.tsx';
import { BuffSearchSection } from './buffs/BuffSearchSection.tsx';

const showBuffDetailsDialog = (...args: any[]) =>
  (window as any).__REACT_DIALOG_BRIDGE__?.showBuffDetailsDialog?.(...args);

interface PCBuffsTabProps {
  pc: any;
}

export const PCBuffsTab: React.FC<PCBuffsTabProps> = ({ pc }) => {
  const activeBuffs = Array.isArray(pc.activeBuffs) ? pc.activeBuffs : [];
  const quickBuffs = Array.isArray(pc.quickBuffs) ? pc.quickBuffs : [];

  const handleRemoveActiveBuff = (idx: number) => {
    CombatState.updatePCBatch((freshPc: any) => {
      if (Array.isArray(freshPc.activeBuffs)) {
        freshPc.activeBuffs.splice(idx, 1);
      }
    });
  };

  const handleActiveBuffRoundsChange = (idx: number, rounds: number) => {
    CombatState.updatePCBatch((freshPc: any) => {
      if (Array.isArray(freshPc.activeBuffs) && freshPc.activeBuffs[idx]) {
        if (rounds <= 0) {
          freshPc.activeBuffs.splice(idx, 1);
        } else {
          freshPc.activeBuffs[idx].durationRemainingRounds = rounds;
        }
      }
    });
  };

  const handleBuffDetailClick = (idx: number) => {
    const buff = activeBuffs[idx];
    if (!buff) return;
    showBuffDetailsDialog(pc, buff.spellKey, false, idx);
  };

  const handleQuickBuffClick = (qb: any) => {
    const isCurrentlyActive = activeBuffs.some((b: any) => b.spellKey === qb.key);
    if (isCurrentlyActive) {
      CombatState.updatePCBatch((freshPc: any) => {
        if (Array.isArray(freshPc.activeBuffs)) {
          freshPc.activeBuffs = freshPc.activeBuffs.filter((b: any) => b.spellKey !== qb.key);
        }
      });
    } else {
      activateBuffByKey(pc, qb.key, qb.isClass, {
        showCustomConfirm,
        showCustomAlert,
        showCustomPrompt: (title: string, msg: string, defaultValue: string, onConfirm: (val: string) => void) => {
          showCustomPrompt(title, msg, defaultValue, "OK", onConfirm);
        },
        renderPlayerScreen: () => {
          if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
            uiRegistry.renderPlayerScreen();
          }
        }
      });
    }
  };

  const handleRemoveQuickBuff = (key: string) => {
    CombatState.updatePCBatch((freshPc: any) => {
      if (Array.isArray(freshPc.quickBuffs)) {
        freshPc.quickBuffs = freshPc.quickBuffs.filter((b: any) => b.key !== key);
      }
    });
  };

  const handleEquipmentBuffClick = (eb: any) => {
    const isCurrentlyActive = activeBuffs.some((b: any) => b.spellKey === eb.buffKey);
    if (isCurrentlyActive) {
      CombatState.updatePCBatch((freshPc: any) => {
        if (Array.isArray(freshPc.activeBuffs)) {
          freshPc.activeBuffs = freshPc.activeBuffs.filter((b: any) => b.spellKey !== eb.buffKey);
        }
      });
    } else {
      if (eb.availableUses <= 0) {
        showCustomAlert("No Uses Remaining", `You have no charges or daily uses remaining on ${eb.itemName}.`, "Got it", "⚠️");
        return;
      }
      activateBuffByKey(pc, eb.buffKey, false, {
        showCustomConfirm,
        showCustomAlert,
        showCustomPrompt: (title: string, msg: string, defaultValue: string, onConfirm: (val: string) => void) => {
          showCustomPrompt(title, msg, defaultValue, "OK", onConfirm);
        },
        renderPlayerScreen: () => {
          if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
            uiRegistry.renderPlayerScreen();
          }
        }
      });
      if (eb.costType === 'charges' || eb.costType === 'daily') {
        CombatState.usePCItemCharge(eb.itemIdx, eb.cost || 1);
      }
    }
  };

  const handleSelectSearchResult = (m: any) => {
    showBuffDetailsDialog(pc, m.key, m.isClass);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 1. List of active buffs */}
      <ActiveBuffsPills
        pc={pc}
        activeBuffs={activeBuffs}
        onRemoveBuff={handleRemoveActiveBuff}
        onRoundsChange={handleActiveBuffRoundsChange}
        onBuffDetailClick={handleBuffDetailClick}
      />

      {/* 2. Equipped Magic Items & Quick Toggles */}
      <QuickBuffsSection
        pc={pc}
        activeBuffs={activeBuffs}
        quickBuffs={quickBuffs}
        onEquipmentBuffClick={handleEquipmentBuffClick}
        onQuickBuffClick={handleQuickBuffClick}
        onRemoveQuickBuff={handleRemoveQuickBuff}
      />

      {/* 3. Search & Custom Buff Builder */}
      <BuffSearchSection
        pc={pc}
        onSelectSearchResult={handleSelectSearchResult}
      />
    </div>
  );
};
