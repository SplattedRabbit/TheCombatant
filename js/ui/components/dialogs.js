// Facade for all dialog components to preserve backward compatibility.

export {
  showInfoDialog,
  showCustomAlert,
  showCustomConfirm,
  showCustomPrompt,
  showNewDayTemplateDialog,
  showRollBreakdown
} from '../dialogs/BaseDialogs.js';

export { showAttackChoiceDialog } from '../dialogs/AttackChoiceDialog.js';
export { showPrepareSpellDialog, showCastSpontaneousSpellDialog } from '../dialogs/PrepareSpellDialog.js';
export { showSessionModal } from '../dialogs/SessionDialog.js';
export { showSpellScrollDialog } from '../dialogs/SpellScrollDialog.js';
export { showFeatScrollDialog } from '../dialogs/FeatScrollDialog.js';
export { showBuffManagerDialog } from '../dialogs/BuffManagerDialog.js';


