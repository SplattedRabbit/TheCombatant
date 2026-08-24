/**
 * @module    beltHelpers
 * @summary   Formula parsing and detection helpers for tactical belt items.
 */

export function getHealingFormulaDetails(item: any) {
  if (!item) return null;
  const name = (item.name || '').toLowerCase();
  const formula =
    item.healingFormula ||
    (name.includes('cure') || name.includes('heil') || item.type === 'potion' || item.slot === 'potion'
      ? name.includes('moderate')
        ? '2d8+3'
        : name.includes('serious')
        ? '3d8+5'
        : name.includes('critical')
        ? '4d8+7'
        : '1d8+1'
      : null);

  if (!formula) return null;
  const match = formula.match(/(\d+)[dw](\d+)(?:\+(\d+))?/i);
  if (match) {
    const dice = `${match[1]}d${match[2]}`;
    const bonus = match[3] ? parseInt(match[3], 10) : 0;
    return { formula, dice, bonus };
  }
  return { formula, dice: formula, bonus: 0 };
}

export function getDamageFormulaDetails(item: any) {
  if (!item) return null;
  const name = (item.name || '').toLowerCase();
  if (item.healingFormula || name.includes('cure') || name.includes('heil')) return null;

  const effectDesc = item.activation?.effectDescription || item.description || '';
  const fullName = `${item.name || ''} ${effectDesc}`;

  const match = item.damageFormula
    ? item.damageFormula.match(/(\d+)[dw](\d+)(?:\+(\d+))?/i)
    : fullName.match(/(\d+)[dw](\d+)(?:\+(\d+))?\s*([a-zA-ZäöüÄÖÜß]+)?\s*(?:damage|schaden)?/i) ||
      fullName.match(/(\d+)[dw](\d+)(?:\+(\d+))?/i);

  if (!match) return null;

  const dice = `${match[1]}d${match[2]}`;
  const bonus = match[3] ? parseInt(match[3], 10) : 0;
  const damageType = match[4] || '';
  const formula = bonus > 0 ? `${dice}+${bonus}` : dice;

  const dcMatch = effectDesc.match(/DC\s*(\d+)\s*([a-zA-ZäöüÄÖÜß]+)?(?:\s*(?:half|negates|halbiert))?/i);
  const saveText = dcMatch ? `DC ${dcMatch[1]} ${dcMatch[2] || 'Save'}` : null;

  return {
    formula,
    dice,
    bonus,
    damageType,
    effectDesc,
    saveText,
  };
}

export function getItemIcon(item: any): string {
  if (!item) return '📦';
  const isPotion = item.type === 'potion' || item.slot === 'potion' || item.name?.toLowerCase().includes('potion') || item.name?.toLowerCase().includes('trank');
  if (isPotion) return '🍷';
  const isScroll = item.type === 'scroll' || item.slot === 'scroll' || item.name?.toLowerCase().includes('scroll') || item.name?.toLowerCase().includes('schriftrolle');
  if (isScroll) return '📜';
  const isWand = item.type === 'wand' || item.slot === 'wand' || item.name?.toLowerCase().includes('wand') || item.name?.toLowerCase().includes('stab');
  if (isWand) return '🪄';
  if (item.healingFormula) return '🍷';
  if (item.damageFormula) return '💥';
  return '🧪';
}
