/**
 * @module    search_spells
 * @summary   Searches the spells_de.json database and prints matching spell details.
 * @exports   none (CLI script)
 * @reads     data/spells_de.json
 * @stateOps  none
 * @depends   fs, path, url
 * @notHere   Spell logic or rendering - this is a CLI search utility.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spellsPath = path.join(__dirname, '..', 'data', 'spells_de.json');

const query = process.argv.slice(2).join(' ');

if (!query) {
  console.log("Benutzung: node scratch/search_spells.js <Zaubername oder Begriff>");
  process.exit(0);
}

console.log(`Suche in der Zauber-Datenbank nach: "${query}"...`);

if (!fs.existsSync(spellsPath)) {
  console.error(`Fehler: Zauber-Datenbank nicht gefunden unter: ${spellsPath}`);
  process.exit(1);
}

try {
  const spells = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
  const spellKeys = Object.keys(spells);
  
  const matches = [];
  
  spellKeys.forEach(key => {
    const spell = spells[key];
    const nameDe = (spell.nameDe || '').toLowerCase();
    const nameEn = (spell.nameEn || '').toLowerCase();
    const desc = (spell.description || '').toLowerCase();
    const searchVal = query.toLowerCase();
    
    if (key.toLowerCase().includes(searchVal) || nameDe.includes(searchVal) || nameEn.includes(searchVal)) {
      matches.push({ key, spell, type: 'name' });
    } else if (desc.includes(searchVal)) {
      matches.push({ key, spell, type: 'description' });
    }
  });

  console.log(`Gefundene Treffer: ${matches.length}`);

  if (matches.length === 0) {
    console.log("Keine Zauber gefunden.");
    process.exit(0);
  }

  // Sort matches so name matches are first
  matches.sort((a, b) => {
    if (a.type === b.type) return a.key.localeCompare(b.key);
    return a.type === 'name' ? -1 : 1;
  });

  const nameMatches = matches.filter(m => m.type === 'name');
  
  if (matches.length > 5) {
    console.log("\nZu viele Treffer. Hier ist eine Liste der passenden Zauber-Namen:\n");
    matches.slice(0, 15).forEach((m, idx) => {
      console.log(`- ${m.spell.nameDe} (${m.spell.nameEn || m.key}) [Level ${m.spell.level}]`);
    });
    if (matches.length > 15) {
      console.log(`\n... und ${matches.length - 15} weitere Treffer. Bitte grenze deine Suche ein.`);
    }
  } else {
    // Print full details for up to 5 matches
    matches.forEach((m, idx) => {
      const s = m.spell;
      console.log(`\n=================== ZAUBER ${idx + 1}: ${s.nameDe} (${s.nameEn || m.key}) ===================`);
      console.log(`Schule:     ${s.school}`);
      console.log(`Grad:       ${s.level}`);
      if (s.classLevels && s.classLevels.length > 0) {
        const clsStr = s.classLevels.map(cl => `${cl.class} ${cl.level}`).join(', ');
        console.log(`Klassen:    ${clsStr}`);
      }
      console.log(`Zeitaufwand: ${s.castingTime}`);
      console.log(`Reichweite: ${s.range}`);
      console.log(`Ziel/Bereich:${s.targetOrEffectOrArea}`);
      console.log(`Dauer:      ${s.duration}`);
      console.log(`Rettungswurf:${s.savingThrow}`);
      console.log(`Zauberresistenz: ${s.spellResistance}`);
      console.log(`Komponenten: ${s.components}`);
      console.log(`\nBeschreibung:\n${s.description}`);
    });
  }
} catch (err) {
  console.error("Fehler beim Lesen oder Parsen der Zauber-Datenbank:", err);
}
