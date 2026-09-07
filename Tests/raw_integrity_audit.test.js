import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDirText(relativeDir) {
  const fullDir = path.resolve(__dirname, '..', relativeDir);
  if (!fs.existsSync(fullDir)) return '';
  let txt = '';
  for (const f of fs.readdirSync(fullDir)) {
    const filePath = path.join(fullDir, f);
    if (fs.statSync(filePath).isFile() && f.endsWith('.txt')) {
      txt += '\n' + fs.readFileSync(filePath, 'utf8').toLowerCase();
    }
  }
  return txt.replace(/[^a-z0-9]/g, '');
}

const bookTexts = {
  phb: getDirText('data/phb'),
  phb2: getDirText('data/phb2'),
  ca: getDirText('data/ca'),
  cs: getDirText('data/cs')
};

const clean = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

test('RAW Integrity Audit - All Spells strictly belong to the 4 allowed sourcebooks', () => {
  const spellBooks = [
    { file: '../data/spells-phb.json', src: 'phb' },
    { file: '../data/spells-phb2.json', src: 'phb2' },
    { file: '../data/spells-ca.json', src: 'ca' },
    { file: '../data/spells-cs.json', src: 'cs' }
  ];

  for (const sb of spellBooks) {
    const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, sb.file), 'utf8'));
    const allowedText = bookTexts[sb.src];

    for (const [id, sp] of Object.entries(data)) {
      // rage_spell uses (Spell) disambiguation suffix, mass_heal uses inverted naming in PHB
      let target = clean(sp.nameEn || id);
      if (id === 'rage_spell') target = 'rage';
      if (id === 'mass_heal') target = 'healmass';
      if (id === 'greater_celerity') target = 'celeritygreater';

      assert.ok(
        allowedText.includes(target) || allowedText.includes(clean(id)),
        `Spell "${id}" (${sp.nameEn}) in ${sb.file} must be verified in ${sb.src} sourcebook text`
      );
    }
  }
});

test('RAW Integrity Audit - All Feats strictly belong to the 4 allowed sourcebooks', async () => {
  const { CombatFeats } = await import('../js/data/feats-data.js');
  const allowedSources = ['phb', 'phb2', 'ca', 'cs'];

  for (const [id, feat] of Object.entries(CombatFeats.REGISTRY)) {
    const src = feat.source || 'phb';
    assert.ok(
      allowedSources.includes(src),
      `Feat "${id}" has source "${src}", but must strictly be one of: ${allowedSources.join(', ')}`
    );

    const allowedText = bookTexts[src];
    assert.ok(allowedText, `Book text for source "${src}" must exist`);

    const target = clean(feat.nameEn || id);
    assert.ok(
      allowedText.includes(target) || allowedText.includes(clean(id)),
      `Feat "${id}" (${feat.nameEn}) must be verified in ${src} sourcebook text`
    );
  }
});

test('RAW Integrity Audit - All Skill Tricks strictly belong to Complete Scoundrel', async () => {
  const { SKILL_TRICKS_REGISTRY } = await import('../js/data/skillTricks-data.js');
  const csText = bookTexts.cs;

  for (const [id, trick] of Object.entries(SKILL_TRICKS_REGISTRY)) {
    const target = clean(trick.nameEn || id);
    assert.ok(
      csText.includes(target) || csText.includes(clean(id)),
      `Skill trick "${id}" (${trick.nameEn}) must be verified in Complete Scoundrel text`
    );
  }
});
