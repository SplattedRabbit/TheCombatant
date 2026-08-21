/**
 * @module    prestigeClasses-data
 * @summary   Fassade für die Prestige-Klassen-Feature-Registry. Mergt die Quellbuch-Registries
 *            (aktuell nur PHB; PHB2/CA/CS werden in künftigen Phasen als eigene Dateien ergänzt,
 *            analog zum feats-data.js-Muster).
 * @exports   PRESTIGE_CLASSES_REGISTRY
 * @reads     Keine
 * @stateOps  Keine
 * @depends   prestigeClasses-phb.js
 * @notHere   Einzelne Feature-Definitionen -> prestigeClasses-phb.js | generische Interpretation -> prestigeClassEngine.js
 */

import { PHB_PRESTIGE_CLASSES_REGISTRY } from './prestigeClasses-phb.js';

export const PRESTIGE_CLASSES_REGISTRY = {
  ...PHB_PRESTIGE_CLASSES_REGISTRY
};
