/**
 * @module    FeatScrollDialog
 * @summary   Facade/test fallback for FeatScrollDialog. Delegates to React bridge.
 */

const getBridge = () => {
  if (typeof window !== 'undefined' && window.__REACT_DIALOG_BRIDGE__) {
    return window.__REACT_DIALOG_BRIDGE__;
  }
  return null;
};

export function showFeatScrollDialog(feat, pc, isLearned, option, event) {
  const bridge = getBridge();
  if (bridge && bridge.showFeatScrollDialog) {
    return bridge.showFeatScrollDialog(feat, pc, isLearned, option, event);
  }
  console.log('showFeatScrollDialog stub called');
}
