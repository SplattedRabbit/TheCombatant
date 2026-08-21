/**
 * @module    prestigeClasses-data
 * @summary   Fassade für die Prestige-Klassen-Feature-Registry. Mergt die Quellbuch-Registries
 *            (aktuell nur DMG; weitere Quellbücher werden in künftigen Phasen als eigene Dateien ergänzt,
 *            analog zum feats-data.js-Muster).
 * @exports   PRESTIGE_CLASSES_REGISTRY
 * @reads     Keine
 * @stateOps  Keine
 * @depends   prestigeClasses-dmg.js
 * @notHere   Einzelne Feature-Definitionen -> prestigeClasses-dmg.js | generische Interpretation -> prestigeClassEngine.js
 */

import { DMG_PRESTIGE_CLASSES_REGISTRY } from './prestigeClasses-dmg.js';
import { CS_PRESTIGE_CLASSES_REGISTRY } from './prestigeClasses-cs.js';

export const PRESTIGE_CLASSES_REGISTRY = {
  ...DMG_PRESTIGE_CLASSES_REGISTRY,
  ...CS_PRESTIGE_CLASSES_REGISTRY
};
