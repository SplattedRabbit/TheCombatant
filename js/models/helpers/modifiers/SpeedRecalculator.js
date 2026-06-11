/**
 * @module    SpeedRecalculator
 * @summary   Berechnet die Bewegungsrate (Speed) unter Einbezug von Rüstungsmalus, Barbaren/Mönchs-Klassenfeatures und magischen Gegenständen.
 * @exports   recalculateSpeed(pc)
 * @reads     pc.baseBw, pc.type, pc.classes, pc.items
 * @stateOps  keine (mutiert pc.bw)
 * @depends   keine
 * @notHere   Attribute-RK-Boni -> BaseSavingThrowModifierApplier.js
 */

export function recalculateSpeed(pc) {
  let speedBonus = 0;
  const armor = pc.getEquippedArmor();
  const shield = pc.getEquippedShield();
  const hasArmor = !!armor;
  const hasShield = !!shield;

  if (pc.type === 'p' && Array.isArray(pc.classes)) {
    const barbClass = pc.classes.find(c => c.classType === 'barbarian');
    if (barbClass && barbClass.level >= 1) {
      // Barbarian fast movement does not apply in heavy armor.
      const isHeavy = armor && armor.speedCategory === 'heavy';
      if (!isHeavy) {
        speedBonus += 10;
      }
    }
    
    const monkClass = pc.classes.find(c => c.classType === 'monk');
    if (monkClass && monkClass.level >= 3) {
      // Monk fast movement only applies when wearing NO armor and NO shield.
      if (!hasArmor && !hasShield) {
        const monkLvl = monkClass.level;
        let monkSpeed = 10;
        if (monkLvl >= 18) monkSpeed = 60;
        else if (monkLvl >= 15) monkSpeed = 50;
        else if (monkLvl >= 12) monkSpeed = 40;
        else if (monkLvl >= 9) monkSpeed = 30;
        else if (monkLvl >= 6) monkSpeed = 20;
        speedBonus += monkSpeed;
      }
    }
  }

  if (Array.isArray(pc.items)) {
    pc.items.forEach(item => {
      if (item.isEquipped) {
        const effects = Array.isArray(item.effects) ? item.effects : [];
        effects.forEach(eff => {
          if (eff.type === 'speed') {
            speedBonus += parseInt(eff.value) || 0;
          }
        });
      }
    });
  }

  let baseAndBonus = (pc.baseBw !== undefined ? pc.baseBw : 30) + speedBonus;

  // Apply speed reduction for medium or heavy armor
  if (armor && (armor.speedCategory === 'medium' || armor.speedCategory === 'heavy')) {
    if (baseAndBonus >= 30) {
      if (baseAndBonus === 30) baseAndBonus = 20;
      else if (baseAndBonus === 40) baseAndBonus = 30;
      else if (baseAndBonus === 50) baseAndBonus = 35;
      else if (baseAndBonus === 60) baseAndBonus = 40;
      else baseAndBonus = Math.max(20, baseAndBonus - 10);
    } else {
      if (baseAndBonus === 20) baseAndBonus = 15;
      else if (baseAndBonus === 15) baseAndBonus = 10;
      else baseAndBonus = Math.max(5, baseAndBonus - 5);
    }
  }

  pc.bw = baseAndBonus;
}
