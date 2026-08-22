import { test } from 'node:test';
import assert from 'node:assert';
import { Combatant } from '../js/models/Combatant.js';
import { applyFeatSkillBonuses } from '../js/models/helpers/skills/SkillFeatApplier.js';
import { findSpell } from '../js/spells.js';

test('Bug 7 - Feat skill bonuses calculation and retrieval', () => {
  const pc = new Combatant({
    name: 'Acrobat Hero',
    type: 'p',
    feats: [
      { id: 'acrobatic' },
      { id: 'skill_focus', option: 'Akrobatik (Tumble)' }
    ]
  });

  // Acrobatic gives +2 to jump and tumble
  const jumpBonus = applyFeatSkillBonuses(pc, 'jump', { nameDe: 'Springen' });
  assert.strictEqual(jumpBonus, 2, 'Jump should get +2 from Acrobatic');

  // Tumble gets +2 from Acrobatic and +3 from Skill Focus (total +5)
  const tumbleBonus = applyFeatSkillBonuses(pc, 'tumble', { nameDe: 'Akrobatik (Tumble)' });
  assert.strictEqual(tumbleBonus, 5, 'Tumble should get +5 from Acrobatic and Skill Focus');
});

test('Bug 8 - Spell details retrieval from registry and custom spells', () => {
  const pc = new Combatant({
    name: 'Mage Hero',
    type: 'p',
    customSpells: [
      {
        id: 'custom_spell_1',
        nameDe: 'Eigener Feuersturm',
        description: 'Macht viel Feuerschaden.',
        components: 'V, S',
        targetOrEffectOrArea: '10ft Radius'
      }
    ]
  });

  // Find standard spell and check description
  const bless = findSpell(pc, 'bless');
  assert.ok(bless, 'Should find bless spell');
  assert.ok(bless.description, 'Bless should have a description');
  assert.ok(bless.description.toLowerCase().includes('morale bonus'), 'Bless description should describe morale bonus');

  // Find custom spell and check details
  const custom = findSpell(pc, 'custom_spell_1');
  assert.ok(custom, 'Should find custom spell');
  assert.strictEqual(custom.description, 'Macht viel Feuerschaden.');
  assert.strictEqual(custom.components, 'V, S');
  assert.strictEqual(custom.targetOrEffectOrArea, '10ft Radius');
});

test('DamageChoiceDialog export and presence', async () => {
  const mod = await import('../js/ui/dialogs/DamageChoiceDialog.js');
  assert.strictEqual(typeof mod.showDamageChoiceDialog, 'function');
});
