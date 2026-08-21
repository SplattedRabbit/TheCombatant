/**
 * @module    prestigeClassEngine
 * @summary   Generische Engine, die die deklarative Feature-Registry (prestigeClasses-data.js) interpretiert
 *            und stufenabhängige Werte berechnet. Ersetzt die zuvor inline in *FeaturesCard.tsx hartkodierten
 *            Formeln (siehe docs/implementationplan.md, Abschnitt 3.2) — die UI-Schicht stellt die zurückgegebenen
 *            Werte nur noch dar, berechnet sie nicht mehr selbst.
 * @exports   getPrestigeClassFeatures, getAblMod
 * @reads     pc.classes, pc.prestigeSpellLinks, Ability-Stats (z.B. pc.int)
 * @stateOps  Keine
 * @depends   prestigeClasses-data.js
 * @notHere   Voraussetzungsprüfung -> classValidation.js | Zauberslot-Berechnung -> RulesSpells.js |
 *            Sneak-Attack-Pool-Summierung über mehrere Klassen -> RogueHelper.js (Phase 2)
 */

import { PRESTIGE_CLASSES_REGISTRY } from '../data/prestigeClasses-data.js';

export function getAblMod(stat) {
  const score = typeof stat?.getValue === 'function' ? stat.getValue() : (stat ?? 10);
  return Math.floor((score - 10) / 2);
}

function computeFeature(feature, ctx) {
  switch (feature.type) {
    case 'formula':
      return feature.compute(ctx);
    case 'steppedBonus': {
      let value = feature.base ?? 0;
      (feature.steps || []).forEach(([atLevel, stepValue]) => {
        if (ctx.level >= atLevel) value = stepValue;
      });
      return value;
    }
    case 'diceStack':
      return feature.diceByLevel(ctx.level);
    case 'flag':
      return true;
    case 'spellSlotLink':
      return ctx.pc.prestigeSpellLinks?.[ctx.classKey] ?? null;
    default:
      return undefined;
  }
}

/**
 * Berechnet alle registrierten Features einer Prestige-Klasse für den aktuellen Charakter.
 * Liefert ein flaches Objekt { featureKey: berechneterWert }.
 */
export function getPrestigeClassFeatures(pc, classKey) {
  const classDef = PRESTIGE_CLASSES_REGISTRY[classKey];
  if (!classDef) return {};

  const cls = Array.isArray(pc.classes) && pc.classes.find(c => c.classType === classKey);
  const level = cls ? cls.level : 0;
  const ctx = { pc, level, classKey, getAblMod };

  const result = {};
  Object.entries(classDef.features || {}).forEach(([featureKey, feature]) => {
    result[featureKey] = computeFeature(feature, ctx);
  });
  return result;
}
