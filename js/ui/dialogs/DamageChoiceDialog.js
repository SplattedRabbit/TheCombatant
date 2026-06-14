/**
 * @module    DamageChoiceDialog
 * @summary   Facade/test fallback for DamageChoiceDialog. Delegates to React bridge.
 */

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export function showDamageChoiceDialog(pc, weapon, event, options) {
  const bridge = getBridge();
  if (bridge && bridge.showDamageChoiceDialog) {
    return bridge.showDamageChoiceDialog(pc, weapon, event, options);
  }
  console.log('showDamageChoiceDialog stub called');
}
