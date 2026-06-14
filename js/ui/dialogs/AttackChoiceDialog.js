/**
 * @module    AttackChoiceDialog
 * @summary   Facade/test fallback for AttackChoiceDialog. Delegates to React bridge.
 */

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export function showAttackChoiceDialog(pc, weapon, event, options) {
  const bridge = getBridge();
  if (bridge && bridge.showAttackChoiceDialog) {
    return bridge.showAttackChoiceDialog(pc, weapon, event, options);
  }
  console.log('showAttackChoiceDialog stub called');
}
