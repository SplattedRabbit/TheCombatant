import fs from 'fs';
import { CombatFeats } from '../js/data/feats-data.js';

const combatFeats = {};
const magicFeats = {};
const generalFeats = {};

Object.keys(CombatFeats.REGISTRY).forEach(key => {
  const feat = CombatFeats.REGISTRY[key];
  if (feat.category === 'combat') {
    combatFeats[key] = feat;
  } else if (feat.category === 'metamagic' || feat.category === 'item_creation') {
    magicFeats[key] = feat;
  } else {
    generalFeats[key] = feat;
  }
});

function formatFeatsFile(moduleName, summary, exportName, data) {
  const header = `/**
 * @module    ${moduleName}
 * @summary   ${summary}
 * @exports   ${exportName}
 * @reads     Keine
 * @stateOps  Keine
 * @depends   Keine
 * @notHere   Regelprüfung -> rules.js | UI -> PCFeatsTab.js | Facade -> feats-data.js
 */

export const ${exportName} = ${JSON.stringify(data, null, 2)};
`;
  return header;
}

const combatContent = formatFeatsFile(
  'feats-combat',
  'Statische Datenbank für D&D 3.5e Kampftalente (category: combat).',
  'COMBAT_FEATS_REGISTRY',
  combatFeats
);

const magicContent = formatFeatsFile(
  'feats-magic',
  'Statische Datenbank für D&D 3.5e Magietalente (Metamagie und Gegenstandserschaffung).',
  'MAGIC_FEATS_REGISTRY',
  magicFeats
);

const generalContent = formatFeatsFile(
  'feats-general',
  'Statische Datenbank für D&D 3.5e allgemeine Talente (category: general).',
  'GENERAL_FEATS_REGISTRY',
  generalFeats
);

fs.writeFileSync('./js/data/feats-combat.js', combatContent, 'utf8');
fs.writeFileSync('./js/data/feats-magic.js', magicContent, 'utf8');
fs.writeFileSync('./js/data/feats-general.js', generalContent, 'utf8');

console.log('Successfully wrote feats-combat.js, feats-magic.js, and feats-general.js');
console.log('Combat feats count:', Object.keys(combatFeats).length);
console.log('Magic feats count:', Object.keys(magicFeats).length);
console.log('General feats count:', Object.keys(generalFeats).length);
