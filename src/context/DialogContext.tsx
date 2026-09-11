/**
 * @module    DialogContext
 * @summary   Declarative React Context and Provider for all modals and dialogs in CombatApp.
 *            Replaces isolated createRoot bridge hacks and unifies modal lifecycle management.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  CustomAlertModal,
  CustomConfirmModal,
  CustomPromptModal,
  HealingRollModal,
  ItemDamageModal,
  NewDayTemplateDialog,
  RollBreakdownDialog,
  SampleChoiceDialog,
  ParchmentMessageModal,
} from '../components/dialogs/BaseDialogs';
import { AttackChoiceDialog } from '../components/dialogs/AttackChoiceDialog';
import { DamageChoiceDialog } from '../components/dialogs/DamageChoiceDialog';
import { PrepareSpellDialog, CastSpontaneousSpellDialog } from '../components/dialogs/PrepareSpellDialog';
import { SpellScrollDialog } from '../components/dialogs/SpellScrollDialog';
import { FeatScrollDialog } from '../components/dialogs/FeatScrollDialog';
import { BuffDetailsDialog, CastSuccessDialog } from '../components/dialogs/PCBuffsDialog';
import { SpellDetailsDialog } from '../components/dialogs/SpellDetailsDialog';
import { SpellCreatorDialog } from '../components/dialogs/SpellCreatorDialog';
import { uiRegistry } from '@core/ui/ui-shared.js';
import { CombatState } from '@core/state.js';

export interface DialogContextType {
  showAlert: (title: string, message: string, buttonText?: string, icon?: string, onClose?: () => void) => void;
  showConfirm: (title: string, messageHtml: string, onConfirm: () => void, onCancel?: () => void) => void;
  showPrompt: (title: string, message: string, defaultValue: string, buttonText: string, onConfirm: (val: string) => void) => void;
  showHealingRoll: (opts: { itemName: string; dice: string; bonus: number; formula: string; onConfirm: (val: string) => void; onCancel?: () => void }) => void;
  showItemDamage: (opts: { itemName: string; dice: string; bonus: number; formula: string; damageType?: string; effectDesc?: string; saveText?: string | null; onConfirm: () => void; onCancel?: () => void }) => void;
  showNewDayTemplate: (templates: Record<string, any>, onConfirm: (choice: string) => void) => void;
  showRollBreakdown: (title: string, diceFormula: string, breakdownItems: any[], event?: any) => void;
  showSampleChoice: (isPlayer: boolean, onConfirm: (choice: string) => void) => void;
  showAttackChoice: (pc: any, weapon: any, event?: any, options?: any) => void;
  showDamageChoice: (pc: any, weapon: any, event?: any, options?: any) => void;
  showPrepareSpell: (pc: any, spellKey: string, onComplete?: () => void) => void;
  showCastSpontaneousSpell: (pc: any, spellKey: string, onComplete?: () => void) => void;
  showSpellScroll: (spell: any, isLearned: boolean, onToggleLearn?: () => void) => void;
  showFeatScroll: (feat: any, pc: any, isLearned: boolean, option?: string, event?: any) => void;
  showBuffDetails: (pc: any, key: string, isClass: boolean, isAlreadyActiveIndex?: number | null) => void;
  showCastSuccess: (pc: any, spell: any, spellKey: string, metamagic?: string[], onAppliedCallback?: () => void) => void;
  showSpellDetails: (spell: any, spellKey: string, pc: any) => void;
  showSpellCreator: (pc: any) => void;
  showParchmentMessage: (text: string, sender?: string) => { dismiss: () => void };
  closeAllDialogs: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModals, setActiveModals] = useState<Array<{ id: string; type: string; props: any }>>([]);
  const [parchmentMessages, setParchmentMessages] = useState<Array<{ id: string; text: string; sender: string }>>([]);

  const closeDialog = useCallback((idToClose?: string) => {
    setActiveModals(prev => {
      if (prev.length === 0) return prev;
      if (idToClose) return prev.filter(m => m.id !== idToClose);
      return prev.slice(0, -1); // pop top
    });
  }, []);

  const closeAllDialogs = useCallback(() => {
    setActiveModals([]);
    setParchmentMessages([]);
  }, []);

  const pushModal = useCallback((type: string, propsFactory: (id: string) => any) => {
    const id = type + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    setActiveModals(prev => [...prev, { id, type, props: propsFactory(id) }]);
  }, []);

  const showAlert = useCallback((title: string, message: string, buttonText?: string, icon?: string, onClose?: () => void) => {
    pushModal('alert', (id) => ({
      title,
      message,
      buttonText,
      icon,
      onClose: () => {
        closeDialog(id);
        if (onClose) onClose();
      },
    }));
  }, [closeDialog, pushModal]);

  const showConfirm = useCallback((title: string, messageHtml: string, onConfirm: () => void, onCancel?: () => void) => {
    pushModal('confirm', (id) => ({
      title,
      messageHtml,
      onConfirm: () => {
        closeDialog(id);
        onConfirm();
      },
      onCancel: () => {
        closeDialog(id);
        if (onCancel) onCancel();
      },
    }));
  }, [closeDialog, pushModal]);

  const showPrompt = useCallback((title: string, message: string, defaultValue: string, buttonText: string, onConfirm: (val: string) => void) => {
    pushModal('prompt', (id) => ({
      title,
      message,
      defaultValue,
      buttonText,
      onConfirm: (val: string) => {
        closeDialog(id);
        onConfirm(val);
      },
      onCancel: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showHealingRoll = useCallback((opts: { itemName: string; dice: string; bonus: number; formula: string; onConfirm: (val: string) => void; onCancel?: () => void }) => {
    pushModal('healing', (id) => ({
      ...opts,
      onConfirm: (val: string) => {
        closeDialog(id);
        opts.onConfirm(val);
      },
      onCancel: () => {
        closeDialog(id);
        if (opts.onCancel) opts.onCancel();
      },
    }));
  }, [closeDialog, pushModal]);

  const showItemDamage = useCallback((opts: { itemName: string; dice: string; bonus: number; formula: string; damageType?: string; effectDesc?: string; saveText?: string | null; onConfirm: () => void; onCancel?: () => void }) => {
    pushModal('itemDamage', (id) => ({
      ...opts,
      onConfirm: () => {
        closeDialog(id);
        opts.onConfirm();
      },
      onCancel: () => {
        closeDialog(id);
        if (opts.onCancel) opts.onCancel();
      },
    }));
  }, [closeDialog, pushModal]);

  const showNewDayTemplate = useCallback((templates: Record<string, any>, onConfirm: (choice: string) => void) => {
    pushModal('newDay', (id) => ({
      templates,
      onConfirm: (choice: string) => {
        closeDialog(id);
        onConfirm(choice);
      },
      onCancel: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showRollBreakdown = useCallback((title: string, diceFormula: string, breakdownItems: any[], _event?: any) => {
    pushModal('rollBreakdown', (id) => ({
      title,
      diceFormula,
      breakdownItems,
      onClose: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showSampleChoice = useCallback((isPlayer: boolean, onConfirm: (choice: string) => void) => {
    pushModal('sampleChoice', (id) => ({
      isPlayer,
      onConfirm: (choice: string) => {
        closeDialog(id);
        onConfirm(choice);
      },
      onCancel: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showAttackChoice = useCallback((pc: any, weapon: any, _event?: any, options?: any) => {
    pushModal('attackChoice', (id) => ({
      pc,
      weapon,
      options,
      onClose: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showDamageChoice = useCallback((pc: any, weapon: any, _event?: any, options?: any) => {
    pushModal('damageChoice', (id) => ({
      pc,
      weapon,
      options,
      onClose: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showPrepareSpell = useCallback((pc: any, spellKey: string, onComplete?: () => void) => {
    pushModal('prepareSpell', (id) => ({
      pc,
      spellKey,
      onConfirm: () => {
        closeDialog(id);
        if (onComplete) onComplete();
      },
      onCancel: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showCastSpontaneousSpell = useCallback((pc: any, spellKey: string, onComplete?: () => void) => {
    pushModal('castSpontaneous', (id) => ({
      pc,
      spellKey,
      onConfirm: () => {
        closeDialog(id);
        if (onComplete) onComplete();
      },
      onCancel: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showSpellScroll = useCallback((spell: any, isLearned: boolean, onToggleLearn?: () => void) => {
    pushModal('spellScroll', (id) => ({
      spell,
      isLearned,
      onToggleLearn: onToggleLearn || (() => {}),
      onClose: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showFeatScroll = useCallback((feat: any, pc: any, isLearned: boolean, option?: string, _event?: any) => {
    const livePC = (CombatState && typeof CombatState.getActivePC === 'function' ? CombatState.getActivePC() : null) || pc;
    pushModal('featScroll', (id) => ({
      feat,
      pc: livePC,
      isLearned: (livePC?.feats || []).some((f: any) => f.id === feat.id) || (typeof livePC?.hasFeat === 'function' && livePC.hasFeat(feat.id)),
      option,
      onClose: () => closeDialog(id),
      onRefresh: () => {
        const freshPC = (CombatState && typeof CombatState.getActivePC === 'function' ? CombatState.getActivePC() : null) || livePC;
        showFeatScroll(feat, freshPC, isLearned, option);
      },
    }));
  }, [closeDialog, pushModal]);

  const showBuffDetails = useCallback((pc: any, key: string, isClass: boolean, isAlreadyActiveIndex?: number | null) => {
    pushModal('buffDetails', (id) => ({
      pc,
      spellKey: key,
      isClass,
      isAlreadyActiveIndex,
      onClose: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showCastSuccess = useCallback((pc: any, _spell: any, spellKey: string, metamagic?: string[], onAppliedCallback?: () => void) => {
    pushModal('castSuccess', (id) => ({
      pc,
      spellKey,
      metamagic,
      onClose: () => {
        closeDialog(id);
        if (onAppliedCallback) onAppliedCallback();
      },
    }));
  }, [closeDialog, pushModal]);

  const showSpellDetails = useCallback((spell: any, spellKey: string, pc: any) => {
    pushModal('spellDetails', (id) => ({
      spell,
      spellKey,
      pc,
      onClose: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showSpellCreator = useCallback((pc: any) => {
    pushModal('spellCreator', (id) => ({
      pc,
      onClose: () => closeDialog(id),
    }));
  }, [closeDialog, pushModal]);

  const showParchmentMessage = useCallback((text: string, sender: string = 'Dungeon Master') => {
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setParchmentMessages(prev => [...prev, { id: msgId, text, sender }]);
    return {
      dismiss: () => {
        setParchmentMessages(prev => prev.filter(m => m.id !== msgId));
      },
    };
  }, []);

  // Bridge synchronization: required for dialogs.js (Vanilla JS) to trigger React dialogs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    uiRegistry.renderAll = uiRegistry.renderAll || (() => {});
    uiRegistry.renderPlayerScreen = uiRegistry.renderPlayerScreen || (() => {});
    uiRegistry.renderInitBar = uiRegistry.renderInitBar || (() => {});
    uiRegistry.renderConc = uiRegistry.renderConc || (() => {});
    
    const bridge = {
      showCustomAlert: showAlert,
      showCustomConfirm: showConfirm,
      showCustomPrompt: showPrompt,
      showHealingRollDialog: showHealingRoll,
      showItemDamageDialog: showItemDamage,
      showNewDayTemplateDialog: (_pc: any, templates: any, cb: any) => showNewDayTemplate(templates, cb),
      showRollBreakdown: showRollBreakdown,
      showSampleChoiceDialog: showSampleChoice,
      showAttackChoiceDialog: showAttackChoice,
      showDamageChoiceDialog: showDamageChoice,
      showPrepareSpellDialog: showPrepareSpell,
      showCastSpontaneousSpellDialog: showCastSpontaneousSpell,
      showSpellScrollDialog: showSpellScroll,
      showFeatScrollDialog: showFeatScroll,
      showBuffDetailsDialog: showBuffDetails,
      showCastSuccessDialog: showCastSuccess,
      showSpellDetailsDialog: showSpellDetails,
      showSpellCreatorWizard: showSpellCreator,
      showParchmentMessage: showParchmentMessage,
    };

    (window as any).__REACT_DIALOG_BRIDGE__ = bridge;

    return () => {
      if ((window as any).__REACT_DIALOG_BRIDGE__ === bridge) {
        delete (window as any).__REACT_DIALOG_BRIDGE__;
      }
    };
  }, [
    showAlert, showConfirm, showPrompt, showHealingRoll, showItemDamage, showNewDayTemplate,
    showRollBreakdown, showSampleChoice, showAttackChoice, showDamageChoice, showPrepareSpell,
    showCastSpontaneousSpell, showSpellScroll, showFeatScroll, showBuffDetails, showCastSuccess,
    showSpellDetails, showSpellCreator, showParchmentMessage
  ]);

  return (
    <DialogContext.Provider
      value={{
        showAlert,
        showConfirm,
        showPrompt,
        showHealingRoll,
        showItemDamage,
        showNewDayTemplate,
        showRollBreakdown,
        showSampleChoice,
        showAttackChoice,
        showDamageChoice,
        showPrepareSpell,
        showCastSpontaneousSpell,
        showSpellScroll,
        showFeatScroll,
        showBuffDetails,
        showCastSuccess,
        showSpellDetails,
        showSpellCreator,
        showParchmentMessage,
        closeAllDialogs,
      }}
    >
      {children}

      {/* Render Active Declarative Modals inside React Component Tree as Stack */}
      {activeModals.map(activeModal => (
        <React.Fragment key={activeModal.id}>
          {activeModal.type === 'alert' && <CustomAlertModal {...activeModal.props} />}
          {activeModal.type === 'confirm' && <CustomConfirmModal {...activeModal.props} />}
          {activeModal.type === 'prompt' && <CustomPromptModal {...activeModal.props} />}
          {activeModal.type === 'healing' && <HealingRollModal {...activeModal.props} />}
          {activeModal.type === 'itemDamage' && <ItemDamageModal {...activeModal.props} />}
          {activeModal.type === 'newDay' && <NewDayTemplateDialog {...activeModal.props} />}
          {activeModal.type === 'rollBreakdown' && <RollBreakdownDialog {...activeModal.props} />}
          {activeModal.type === 'sampleChoice' && <SampleChoiceDialog {...activeModal.props} />}
          {activeModal.type === 'attackChoice' && <AttackChoiceDialog {...activeModal.props} />}
          {activeModal.type === 'damageChoice' && <DamageChoiceDialog {...activeModal.props} />}
          {activeModal.type === 'prepareSpell' && <PrepareSpellDialog {...activeModal.props} />}
          {activeModal.type === 'castSpontaneous' && <CastSpontaneousSpellDialog {...activeModal.props} />}
          {activeModal.type === 'spellScroll' && <SpellScrollDialog {...activeModal.props} />}
          {activeModal.type === 'featScroll' && <FeatScrollDialog {...activeModal.props} />}
          {activeModal.type === 'buffDetails' && <BuffDetailsDialog {...activeModal.props} />}
          {activeModal.type === 'castSuccess' && <CastSuccessDialog {...activeModal.props} />}
          {activeModal.type === 'spellDetails' && <SpellDetailsDialog {...activeModal.props} />}
          {activeModal.type === 'spellCreator' && <SpellCreatorDialog {...activeModal.props} />}
        </React.Fragment>
      ))}

      {/* Render Parchment Messages */}
      {parchmentMessages.map(msg => (
        <ParchmentMessageModal
          key={msg.id}
          text={msg.text}
          sender={msg.sender}
          onClose={() => setParchmentMessages(prev => prev.filter(m => m.id !== msg.id))}
        />
      ))}
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
