/**
 * @module    SkillSynergyResolver
 * @summary   Berechnet D&D 3.5e Synergie-Boni für Fertigkeiten.
 * @exports   resolveSynergyBonuses(pc, skillKey)
 * @reads     pc.getSkillRanks()
 * @stateOps  keine
 * @depends   keine
 * @notHere   Basis-Boni -> SkillBaseCalculator.js | Talent-Boni -> SkillFeatApplier.js
 */

export function resolveSynergyBonuses(pc, skillKey) {
  let synergy = 0;

  if (skillKey === 'balance' && pc.getSkillRanks('tumble') >= 5) {
    synergy += 2;
  }
  if (skillKey === 'escape_artist' && pc.getSkillRanks('tumble') >= 5) {
    synergy += 2;
  }
  if (skillKey === 'diplomacy' && pc.getSkillRanks('bluff') >= 5) {
    synergy += 2;
  }
  if (skillKey === 'disguise' && pc.getSkillRanks('bluff') >= 5) {
    synergy += 2;
  }
  if (skillKey === 'intimidate' && pc.getSkillRanks('bluff') >= 5) {
    synergy += 2;
  }
  if (skillKey === 'use_magic_device') {
    if (pc.getSkillRanks('spellcraft') >= 5) synergy += 2;
    if (pc.getSkillRanks('decipher_script') >= 5) synergy += 2;
  }

  return synergy;
}
