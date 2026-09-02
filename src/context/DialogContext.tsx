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
  const [activeModal, setActiveModal] = useState<{ id: string; type: string; props: any } | null>(null);
  const [parchmentMessages, setParchmentMessages] = useState<Array<{ id: string; text: string; sender: string }>>([]);

  const closeDialog = useCallback(() => {
    setActiveModal(null);
  }, []);

  const closeAllDialogs = useCallback(() => {
    setActiveModal(null);
    setParchmentMessages([]);
  }, []);

  const showAlert = useCallback((title: string, message: string, buttonText?: string, icon?: string, onClose?: () => void) => {
    setActiveModal({
      id: 'alert_' + Date.now(),
      type: 'alert',
      props: {
        title,
        message,
        buttonText,
        icon,
        onClose: () => {
          closeDialog();
          if (onClose) onClose();
        },
      },
    });
  }, [closeDialog]);

  const showConfirm = useCallback((title: string, messageHtml: string, onConfirm: () => void, onCancel?: () => void) => {
    setActiveModal({
      id: 'confirm_' + Date.now(),
      type: 'confirm',
      props: {
        title,
        messageHtml,
        onConfirm: () => {
          closeDialog();
          onConfirm();
        },
        onCancel: () => {
          closeDialog();
          if (onCancel) onCancel();
        },
      },
    });
  }, [closeDialog]);

  const showPrompt = useCallback((title: string, message: string, defaultValue: string, buttonText: string, onConfirm: (val: string) => void) => {
    setActiveModal({
      id: 'prompt_' + Date.now(),
      type: 'prompt',
      props: {
        title,
        message,
        defaultValue,
        buttonText,
        onConfirm: (val: string) => {
          closeDialog();
          onConfirm(val);
        },
        onCancel: closeDialog,
      },
    });
  }, [closeDialog]);

  const showHealingRoll = useCallback((opts: { itemName: string; dice: string; bonus: number; formula: string; onConfirm: (val: string) => void; onCancel?: () => void }) => {
    setActiveModal({
      id: 'healing_' + Date.now(),
      type: 'healing',
      props: {
        ...opts,
        onConfirm: (val: string) => {
          closeDialog();
          opts.onConfirm(val);
        },
        onCancel: () => {
          closeDialog();
          if (opts.onCancel) opts.onCancel();
        },
      },
    });
  }, [closeDialog]);

  const showItemDamage = useCallback((opts: { itemName: string; dice: string; bonus: number; formula: string; damageType?: string; effectDesc?: string; saveText?: string | null; onConfirm: () => void; onCancel?: () => void }) => {
    setActiveModal({
      id: 'item_damage_' + Date.now(),
      type: 'itemDamage',
      props: {
        ...opts,
        onConfirm: () => {
          closeDialog();
          opts.onConfirm();
        },
        onCancel: () => {
          closeDialog();
          if (opts.onCancel) opts.onCancel();
        },
      },
    });
  }, [closeDialog]);

  const showNewDayTemplate = useCallback((templates: Record<string, any>, onConfirm: (choice: string) => void) => {
    setActiveModal({
      id: 'new_day_' + Date.now(),
      type: 'newDay',
      props: {
        templates,
        onConfirm: (choice: string) => {
          closeDialog();
          onConfirm(choice);
        },
        onCancel: closeDialog,
      },
    });
  }, [closeDialog]);

  const showRollBreakdown = useCallback((title: string, diceFormula: string, breakdownItems: any[], _event?: any) => {
    setActiveModal({
      id: 'roll_breakdown_' + Date.now(),
      type: 'rollBreakdown',
      props: {
        title,
        diceFormula,
        breakdownItems,
        onClose: closeDialog,
      },
    });
  }, [closeDialog]);

  const showSampleChoice = useCallback((isPlayer: boolean, onConfirm: (choice: string) => void) => {
    setActiveModal({
      id: 'sample_choice_' + Date.now(),
      type: 'sampleChoice',
      props: {
        isPlayer,
        onConfirm: (choice: string) => {
          closeDialog();
          onConfirm(choice);
        },
        onCancel: closeDialog,
      },
    });
  }, [closeDialog]);

  const showAttackChoice = useCallback((pc: any, weapon: any, _event?: any, options?: any) => {
    setActiveModal({
      id: 'attack_choice_' + Date.now(),
      type: 'attackChoice',
      props: {
        pc,
        weapon,
        options,
        onClose: closeDialog,
      },
    });
  }, [closeDialog]);

  const showDamageChoice = useCallback((pc: any, weapon: any, _event?: any, options?: any) => {
    setActiveModal({
      id: 'damage_choice_' + Date.now(),
      type: 'damageChoice',
      props: {
        pc,
        weapon,
        options,
        onClose: closeDialog,
      },
    });
  }, [closeDialog]);

  const showPrepareSpell = useCallback((pc: any, spellKey: string, onComplete?: () => void) => {
    setActiveModal({
      id: 'prepare_spell_' + Date.now(),
      type: 'prepareSpell',
      props: {
        pc,
        spellKey,
        onConfirm: () => {
          closeDialog();
          if (onComplete) onComplete();
        },
        onCancel: closeDialog,
      },
    });
  }, [closeDialog]);

  const showCastSpontaneousSpell = useCallback((pc: any, spellKey: string, onComplete?: () => void) => {
    setActiveModal({
      id: 'cast_spontaneous_' + Date.now(),
      type: 'castSpontaneous',
      props: {
        pc,
        spellKey,
        onConfirm: () => {
          closeDialog();
          if (onComplete) onComplete();
        },
        onCancel: closeDialog,
      },
    });
  }, [closeDialog]);

  const showSpellScroll = useCallback((spell: any, isLearned: boolean, onToggleLearn?: () => void) => {
    setActiveModal({
      id: 'spell_scroll_' + Date.now(),
      type: 'spellScroll',
      props: {
        spell,
        isLearned,
        onToggleLearn: onToggleLearn || (() => {}),
        onClose: closeDialog,
      },
    });
  }, [closeDialog]);

  const showFeatScroll = useCallback((feat: any, pc: any, isLearned: boolean, option?: string, _event?: any) => {
    const livePC = (CombatState && typeof CombatState.getActivePC === 'function' ? CombatState.getActivePC() : null) || pc;
    setActiveModal({
      id: 'feat_scroll_' + Date.now(),
      type: 'featScroll',
      props: {
        feat,
        pc: livePC,
        isLearned: (livePC?.feats || []).some((f: any) => f.id === feat.id) || (typeof livePC?.hasFeat === 'function' && livePC.hasFeat(feat.id)),
        option,
        onClose: closeDialog,
        onRefresh: () => {
          const freshPC = (CombatState && typeof CombatState.getActivePC === 'function' ? CombatState.getActivePC() : null) || livePC;
          showFeatScroll(feat, freshPC, isLearned, option);
        },
      },
    });
  }, [closeDialog]);

  const showBuffDetails = useCallback((pc: any, key: string, isClass: boolean, isAlreadyActiveIndex?: number | null) => {
    setActiveModal({
      id: 'buff_details_' + Date.now(),
      type: 'buffDetails',
      props: {
        pc,
        spellKey: key,
        isClass,
        isAlreadyActiveIndex,
        onClose: closeDialog,
      },
    });
  }, [closeDialog]);

  const showCastSuccess = useCallback((pc: any, _spell: any, spellKey: string, metamagic?: string[], onAppliedCallback?: () => void) => {
    setActiveModal({
      id: 'cast_success_' + Date.now(),
      type: 'castSuccess',
      props: {
        pc,
        spellKey,
        metamagic,
        onClose: () => {
          closeDialog();
          if (onAppliedCallback) onAppliedCallback();
        },
      },
    });
  }, [closeDialog]);

  const showSpellDetails = useCallback((spell: any, spellKey: string, pc: any) => {
    setActiveModal({
      id: 'spell_details_' + Date.now(),
      type: 'spellDetails',
      props: {
        spell,
        spellKey,
        pc,
        onClose: closeDialog,
      },
    });
  }, [closeDialog]);

  const showSpellCreator = useCallback((pc: any) => {
    setActiveModal({
      id: 'spell_creator_' + Date.now(),
      type: 'spellCreator',
      props: {
        pc,
        onClose: closeDialog,
      },
    });
  }, [closeDialog]);

  const showParchmentMessage = useCallback((text: string, sender: string = 'Dungeon Master') => {
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    setParchmentMessages(prev => [...prev, { id: msgId, text, sender }]);
    return {
      dismiss: () => {
        setParchmentMessages(prev => prev.filter(m => m.id !== msgId));
      },
    };
  }, []);

  // Bridge synchronization: guarantees backwards-compatibility for non-React JS calls
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

      {/* Render Active Declarative Modal inside React Component Tree */}
      {activeModal && activeModal.type === 'alert' && <CustomAlertModal {...activeModal.props} />}
      {activeModal && activeModal.type === 'confirm' && <CustomConfirmModal {...activeModal.props} />}
      {activeModal && activeModal.type === 'prompt' && <CustomPromptModal {...activeModal.props} />}
      {activeModal && activeModal.type === 'healing' && <HealingRollModal {...activeModal.props} />}
      {activeModal && activeModal.type === 'itemDamage' && <ItemDamageModal {...activeModal.props} />}
      {activeModal && activeModal.type === 'newDay' && <NewDayTemplateDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'rollBreakdown' && <RollBreakdownDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'sampleChoice' && <SampleChoiceDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'attackChoice' && <AttackChoiceDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'damageChoice' && <DamageChoiceDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'prepareSpell' && <PrepareSpellDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'castSpontaneous' && <CastSpontaneousSpellDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'spellScroll' && <SpellScrollDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'featScroll' && <FeatScrollDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'buffDetails' && <BuffDetailsDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'castSuccess' && <CastSuccessDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'spellDetails' && <SpellDetailsDialog {...activeModal.props} />}
      {activeModal && activeModal.type === 'spellCreator' && <SpellCreatorDialog {...activeModal.props} />}

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
