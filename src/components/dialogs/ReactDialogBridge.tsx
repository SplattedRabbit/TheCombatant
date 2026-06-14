/**
 * @module    ReactDialogBridge
 * @summary   Bridge-Komponente zur dynamischen Einbettung von React-Modals in den DOM für imperative Aufrufe.
 * @exports   initReactDialogBridge
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { 
  CustomAlertModal, 
  CustomConfirmModal, 
  CustomPromptModal, 
  NewDayTemplateDialog, 
  RollBreakdownDialog, 
  SampleChoiceDialog 
} from './BaseDialogs';
import { AttackChoiceDialog } from './AttackChoiceDialog';
import { DamageChoiceDialog } from './DamageChoiceDialog';
import { PrepareSpellDialog, CastSpontaneousSpellDialog } from './PrepareSpellDialog';
import { SessionDialog } from './SessionDialog';
import { SpellScrollDialog } from './SpellScrollDialog';
import { FeatScrollDialog } from './FeatScrollDialog';
import { BuffDetailsDialog, CastSuccessDialog } from './PCBuffsDialog';
import { SpellDetailsDialog } from './SpellDetailsDialog';
import { SpellCreatorDialog } from './SpellCreatorDialog';
import { uiRegistry } from '@core/ui/ui-shared.js';


export function initReactDialogBridge() {
  if (typeof window === 'undefined') return;

  // Safe fallbacks to prevent legacy JS from crashing the React app when forcing UI refreshes
  uiRegistry.renderAll = uiRegistry.renderAll || (() => {});
  uiRegistry.renderPlayerScreen = uiRegistry.renderPlayerScreen || (() => {});
  uiRegistry.renderInitBar = uiRegistry.renderInitBar || (() => {});
  uiRegistry.renderConc = uiRegistry.renderConc || (() => {});

  const bridge: Record<string, any> = {};

  const mountModal = (renderFn: (onClose: () => void) => React.ReactElement) => {
    const container = document.createElement('div');
    container.className = 'react-modal-container no-print';
    document.body.appendChild(container);

    const root = createRoot(container);
    const handleClose = () => {
      root.unmount();
      container.remove();
    };

    root.render(renderFn(handleClose));
  };

  bridge.showCustomAlert = (title: string, message: string, buttonText?: string, icon?: string, onClose?: () => void) => {
    mountModal((onCloseModal) => (
      <CustomAlertModal
        title={title}
        message={message}
        buttonText={buttonText}
        icon={icon}
        onClose={() => {
          onCloseModal();
          if (onClose) onClose();
        }}
      />
    ));
  };

  bridge.showCustomConfirm = (title: string, messageHtml: string, onConfirm: () => void, onCancel?: () => void) => {
    mountModal((onCloseModal) => (
      <CustomConfirmModal
        title={title}
        messageHtml={messageHtml}
        onConfirm={() => {
          onConfirm();
          onCloseModal();
        }}
        onCancel={() => {
          if (onCancel) onCancel();
          onCloseModal();
        }}
      />
    ));
  };

  bridge.showCustomPrompt = (title: string, message: string, defaultValue: string, buttonText: string, onConfirm: (val: string) => void) => {
    mountModal((onCloseModal) => (
      <CustomPromptModal
        title={title}
        message={message}
        defaultValue={defaultValue}
        buttonText={buttonText}
        onConfirm={(val) => {
          onConfirm(val);
          onCloseModal();
        }}
        onCancel={onCloseModal}
      />
    ));
  };

  bridge.showNewDayTemplateDialog = (_pc: any, templates: Record<string, any>, onConfirm: (choice: string) => void) => {
    mountModal((onCloseModal) => (
      <NewDayTemplateDialog
        templates={templates}
        onConfirm={(choice) => {
          onConfirm(choice);
          onCloseModal();
        }}
        onCancel={onCloseModal}
      />
    ));
  };

  bridge.showRollBreakdown = (title: string, diceFormula: string, breakdownItems: any[], _event?: any, onRollClick?: (rollVal: number) => void) => {
    mountModal((onCloseModal) => (
      <RollBreakdownDialog
        title={title}
        diceFormula={diceFormula}
        breakdownItems={breakdownItems}
        onRollClick={onRollClick}
        onClose={onCloseModal}
      />
    ));
  };

  bridge.showSampleChoiceDialog = (isPlayer: boolean, onConfirm: (choice: string) => void) => {
    mountModal((onCloseModal) => (
      <SampleChoiceDialog
        isPlayer={isPlayer}
        onConfirm={(choice) => {
          onConfirm(choice);
          onCloseModal();
        }}
        onCancel={onCloseModal}
      />
    ));
  };

  bridge.showAttackChoiceDialog = (pc: any, weapon: any, _event?: any, options?: any) => {
    mountModal((onCloseModal) => (
      <AttackChoiceDialog
        pc={pc}
        weapon={weapon}
        options={options}
        onClose={onCloseModal}
      />
    ));
  };

  bridge.showDamageChoiceDialog = (pc: any, weapon: any, _event?: any, options?: any) => {
    mountModal((onCloseModal) => (
      <DamageChoiceDialog
        pc={pc}
        weapon={weapon}
        options={options}
        onClose={onCloseModal}
      />
    ));
  };

  bridge.showPrepareSpellDialog = (pc: any, spellKey: string, onComplete?: () => void) => {
    mountModal((onCloseModal) => (
      <PrepareSpellDialog
        pc={pc}
        spellKey={spellKey}
        onConfirm={() => {
          if (onComplete) onComplete();
          onCloseModal();
        }}
        onCancel={onCloseModal}
      />
    ));
  };

  bridge.showCastSpontaneousSpellDialog = (pc: any, spellKey: string, onComplete?: () => void) => {
    mountModal((onCloseModal) => (
      <CastSpontaneousSpellDialog
        pc={pc}
        spellKey={spellKey}
        onConfirm={() => {
          if (onComplete) onComplete();
          onCloseModal();
        }}
        onCancel={onCloseModal}
      />
    ));
  };

  bridge.showSessionModal = () => {
    mountModal((onCloseModal) => (
      <SessionDialog onClose={onCloseModal} />
    ));
  };

  bridge.showSpellScrollDialog = (spell: any, isLearned: boolean, onToggleLearn?: () => void) => {
    mountModal((onCloseModal) => (
      <SpellScrollDialog
        spell={spell}
        isLearned={isLearned}
        onToggleLearn={onToggleLearn || (() => {})}
        onClose={onCloseModal}
      />
    ));
  };

  bridge.showFeatScrollDialog = (feat: any, pc: any, isLearned: boolean, option?: string, _event?: any) => {
    const renderFeatModal = () => {
      mountModal((onCloseModal) => (
        <FeatScrollDialog
          feat={feat}
          pc={pc}
          isLearned={(pc.feats || []).some((f: any) => f.id === feat.id)}
          option={option}
          onClose={onCloseModal}
          onRefresh={() => {
            onCloseModal();
            // Spawn it again immediately to refresh the view
            bridge.showFeatScrollDialog(feat, pc, isLearned, option);
          }}
        />
      ));
    };
    renderFeatModal();
  };

  bridge.showBuffDetailsDialog = (pc: any, key: string, isClass: boolean, isAlreadyActiveIndex?: number | null) => {
    mountModal((onCloseModal) => (
      <BuffDetailsDialog
        pc={pc}
        spellKey={key}
        isClass={isClass}
        isAlreadyActiveIndex={isAlreadyActiveIndex}
        onClose={onCloseModal}
      />
    ));
  };

  bridge.showCastSuccessDialog = (pc: any, _spell: any, spellKey: string, metamagic?: string[], onAppliedCallback?: () => void) => {
    mountModal((onCloseModal) => (
      <CastSuccessDialog
        pc={pc}
        spellKey={spellKey}
        metamagic={metamagic}
        onClose={() => {
          onCloseModal();
          if (onAppliedCallback) onAppliedCallback();
        }}
      />
    ));
  };

  bridge.showSpellDetailsDialog = (spell: any, spellKey: string, pc: any) => {
    mountModal((onCloseModal) => (
      <SpellDetailsDialog
        spell={spell}
        spellKey={spellKey}
        pc={pc}
        onClose={onCloseModal}
      />
    ));
  };

  bridge.showSpellCreatorWizard = (pc: any) => {
    mountModal((onCloseModal) => (
      <SpellCreatorDialog
        pc={pc}
        onClose={onCloseModal}
      />
    ));
  };


  (window as any).__REACT_DIALOG_BRIDGE__ = bridge;
}

