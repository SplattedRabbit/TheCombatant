/**
 * @module    BaseDialogs
 * @summary   Re-export barrel file for all base parchment modal dialogs.
 *            The individual modal implementations have been modularized into src/components/dialogs/modals/.
 */

export { DialogOverlay } from './modals/DialogOverlay';
export { CustomAlertModal } from './modals/CustomAlertModal';
export { CustomConfirmModal } from './modals/CustomConfirmModal';
export { CustomPromptModal } from './modals/CustomPromptModal';
export { HealingRollModal } from './modals/HealingRollModal';
export { ItemDamageModal } from './modals/ItemDamageModal';
export { NewDayTemplateDialog } from './modals/NewDayTemplateDialog';
export { RollBreakdownDialog } from './modals/RollBreakdownDialog';
export { SampleChoiceDialog } from './modals/SampleChoiceDialog';
export { ParchmentMessageModal } from './modals/ParchmentMessageModal';

export type { DialogOverlayProps } from './modals/DialogOverlay';
export type { CustomAlertModalProps } from './modals/CustomAlertModal';
export type { CustomConfirmModalProps } from './modals/CustomConfirmModal';
export type { CustomPromptModalProps } from './modals/CustomPromptModal';
export type { HealingRollModalProps } from './modals/HealingRollModal';
export type { ItemDamageModalProps } from './modals/ItemDamageModal';
export type { NewDayTemplateDialogProps } from './modals/NewDayTemplateDialog';
export type { RollBreakdownDialogProps } from './modals/RollBreakdownDialog';
export type { SampleChoiceDialogProps } from './modals/SampleChoiceDialog';
export type { ParchmentMessageModalProps } from './modals/ParchmentMessageModal';
