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
  // Explicit Homebrew Decision (AGENT.md §6.1): Sneak Attack & Sudden Strike are merged.
  // Both option flags roll the total precision dice pool pc.getSneakAttackDiceCount().
  if (ctx.options.sneakAttack || ctx.options.suddenStrike) {
    const saDiceCount = typeof ctx.pc?.getSneakAttackDiceCount === 'function' ? ctx.pc.getSneakAttackDiceCount() : 0;
    if (saDiceCount > 0) {
      finalDmgDice = `${finalDmgDice} + ${saDiceCount}w6`;
      const classes = Array.isArray(ctx.pc?.classes) ? ctx.pc.classes : [];
      const hasNinja = classes.some(c => c.classType === 'ninja');
      const hasOther = classes.some(c => ['rogue', 'spellthief', 'assassin', 'arcane_trickster', 'shadowbane_inquisitor', 'spellwarp_sniper'].includes(c.classType));
      const labelName = hasNinja && hasOther
        ? `Sneak Attack & Sudden Strike (${saDiceCount}d6)`
        : hasNinja
          ? `Sudden Strike (${saDiceCount}d6)`
          : `Sneak Attack (${saDiceCount}d6)`;
      if (!dmgBreakdown.some(b => b.label.includes('Sneak Attack') || b.label.includes('Sudden Strike'))) {
        dmgBreakdown.push({ label: labelName, value: 0 });
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
