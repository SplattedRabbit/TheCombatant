/**
 * @module    AttackEngine
 * @summary   Fassade — Orchestriert die Angriffs- und Schadensberechnungssequenzen für Spieler, Gegner und Tiergestalten.
 * @exports   AttackEngine (object)
 * @reads     keine (delegiert an Sub-Helper)
 * @stateOps  keine (pure Berechnungslogik)
 * @depends   AttackContext, BaseAttackCalculator, ModifierCalculator, SequenceBuilder
 * @notHere   Konkrete Teilberechnungen -> js/rules/attack/*
 */

import { buildContext } from './attack/AttackContext.js';
import {
  calculateBaseAttacks,
  calculateTWFPenalties,
  calculateManeuverPenalties
} from './attack/BaseAttackCalculator.js';
import {
  calculateGeneralAtkModifiers,
  calculateGeneralDmgModifiers
} from './attack/ModifierCalculator.js';
import {
  buildPrimarySequence,
  appendHasteAttack,
  appendRapidShotAttack,
  appendFlurryAttacks,
  appendOffhandAttacks
} from './attack/SequenceBuilder.js';

export const AttackEngine = {
  /**
   * Generates a full sequence of attacks for standard or full round actions.
   *
   * @param {Combatant} pc The combatant character model
   * @param {Weapon|Object} weapon The weapon details or natural attack template
   * @param {Boolean} isFullAttack If true, computes multiple iterative/extra attacks
   * @param {Object} options Active options, e.g. { smite: true, favoredEnemy: true }
   * @returns {Array<Object>} List of attacks, each with rolls, modifiers, and breakdowns
   */
  calculateAttackSequence(pc, weapon, isFullAttack, options = {}) {
    const sequence = [];
    if (!pc || !weapon) return sequence;

    // 1. Gather all baseline attributes & statuses
    const ctx = buildContext(pc, weapon, options);

    // 2. Resolve basic BAB/natural attack counts
    const baseAttacks = calculateBaseAttacks(ctx, isFullAttack);

    // 3. Resolve active modifiers & bonuses
    const { generalAtkMod, generalAtkBreakdown } = calculateGeneralAtkModifiers(ctx);
    const { generalDmgMod, generalDmgBreakdown, paDmgBonus } = calculateGeneralDmgModifiers(ctx);

    // 4. Resolve penalties & specific states
    const { isTWFActive, twfPenalties } = calculateTWFPenalties(ctx, isFullAttack);
    ctx.isTWFActive = isTWFActive;
    ctx.twfPenalties = twfPenalties;

    const { isFlurryingThis, flurryPenalty, isRapidShotThis } = calculateManeuverPenalties(ctx, isFullAttack);
    ctx.isFlurryingThis = isFlurryingThis;
    ctx.flurryPenalty = flurryPenalty;
    ctx.isRapidShotThis = isRapidShotThis;

    // 5. Combine active modifiers for primary sequence
    const activeAtkPenalties = (isTWFActive ? twfPenalties.primary : 0) + 
                              (isFlurryingThis ? flurryPenalty : 0) + 
                              (isRapidShotThis ? -2 : 0);

    const activeAtkPenaltyBreakdowns = [];
    if (isTWFActive) activeAtkPenaltyBreakdowns.push({ label: 'Zwei-Waffen-Kampf-Abzug', value: twfPenalties.primary });
    if (isFlurryingThis) activeAtkPenaltyBreakdowns.push({ label: 'Schlaghagel-Abzug', value: flurryPenalty });
    if (isRapidShotThis) activeAtkPenaltyBreakdowns.push({ label: 'Talent: Schnelles Schießen', value: -2 });

    // 6. Generate standard primary sequence
    buildPrimarySequence(
      ctx, baseAttacks, generalAtkMod, generalAtkBreakdown,
      activeAtkPenalties, activeAtkPenaltyBreakdowns,
      generalDmgMod, generalDmgBreakdown, paDmgBonus,
      sequence
    );

    // 7. Append extra actions
    if (isFullAttack && ctx.hasHaste && ctx.isMelee) {
      appendHasteAttack(
        ctx, generalAtkMod, generalAtkBreakdown,
        activeAtkPenalties, activeAtkPenaltyBreakdowns,
        generalDmgMod, generalDmgBreakdown, paDmgBonus,
        sequence
      );
    }

    if (isFullAttack && ctx.isRapidShotThis) {
      appendRapidShotAttack(
        ctx, generalAtkMod, generalAtkBreakdown,
        activeAtkPenalties, activeAtkPenaltyBreakdowns,
        generalDmgMod, generalDmgBreakdown,
        sequence
      );
    }

    if (ctx.isFlurryingThis) {
      appendFlurryAttacks(
        ctx, generalAtkMod, generalAtkBreakdown,
        activeAtkPenalties, activeAtkPenaltyBreakdowns,
        generalDmgMod, generalDmgBreakdown, paDmgBonus,
        sequence
      );
    }

    if (isTWFActive) {
      appendOffhandAttacks(ctx, twfPenalties, sequence);
    }

    return sequence;
  }
};
