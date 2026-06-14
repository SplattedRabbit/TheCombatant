/**
 * @module    DamageFormulaBuilder
 * @summary   Konstruiert die Schadensformel und das Schadens-Breakdown unter Einbeziehung von Hinterhältigem Angriff und Zusatzschaden.
 * @exports   applySneakAttack(ctx, baseDmgDice, dmgBreakdown), buildFinalDamageDiceAndBreakdown(ctx, baseDmgDice, dmgBreakdown, weapon)
 * @reads     ctx.options, ctx.pc
 * @stateOps  keine
 * @depends   keine
 * @notHere   Angriffs-Modifikatoren -> ModifierCalculator.js
 */

export function applySneakAttack(ctx, baseDmgDice, dmgBreakdown) {
  let finalDmgDice = baseDmgDice;
  if (ctx.options.sneakAttack) {
    const saDiceCount = ctx.pc.getSneakAttackDiceCount();
    if (saDiceCount > 0) {
      finalDmgDice = `${finalDmgDice} + ${saDiceCount}w6`;
      if (!dmgBreakdown.some(b => b.label.includes('Sneak Attack'))) {
        dmgBreakdown.push({ label: `Sneak Attack (${saDiceCount}d6)`, value: 0 });
      }
    }
  }
  return finalDmgDice;
}

export function buildFinalDamageDiceAndBreakdown(ctx, baseDmgDice, dmgBreakdown, weapon) {
  let finalDmgDice = applySneakAttack(ctx, baseDmgDice, dmgBreakdown);
  const extra = weapon ? weapon.extraDamage : null;
  if (extra) {
    const cleanExtra = extra.trim();
    if (cleanExtra) {
      if (cleanExtra.startsWith('+')) {
        finalDmgDice = `${finalDmgDice} ${cleanExtra}`;
      } else {
        finalDmgDice = `${finalDmgDice} + ${cleanExtra}`;
      }
      if (!dmgBreakdown.some(b => b.label === 'Extra Damage')) {
        dmgBreakdown.push({ label: 'Extra Damage', value: extra });
      }
    }
  }
  return finalDmgDice;
}
