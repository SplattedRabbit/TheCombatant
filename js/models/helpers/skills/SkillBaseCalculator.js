/**
 * @module    SkillBaseCalculator
 * @summary   Berechnet den reinen Basiswert einer Fertigkeit (Ränge + Attribut + ACP-Abzug).
 * @exports   calculateBaseSkillValue(pc, skillKey, skillDef)
 * @reads     pc.skills, pc.getAttributeMod(), pc.getArmorCheckPenalty()
 * @stateOps  keine
 * @depends   keine
 * @notHere   Synergie-Boni -> SkillSynergyResolver.js | Talent-Boni -> SkillFeatApplier.js
 */

export function calculateBaseSkillValue(pc, skillKey, skillDef) {
  let total = 0;

  // 1. Ranks
  total += pc.getSkillRanks(skillKey);

  // 2. Attribute Modifier
  total += pc.getAttributeMod(skillDef.abl);

  // 3. Misc Modifier
  total += pc.getSkillMisc(skillKey);

  // 3.5 Armor Check Penalty (ACP)
  if (skillDef.hasACP) {
    const acp = pc.getArmorCheckPenalty();
    if (skillKey === 'swim') {
      total -= 2 * acp;
    } else {
      total -= acp;
    }
  }

  return total;
}
