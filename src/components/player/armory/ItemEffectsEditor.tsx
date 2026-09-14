/**
 * @module    ItemEffectsEditor
 * @summary   Passive Modifiers & Effects editor with structured dropdowns for D&D 3.5e Attributes, Saves, AC, Skills, and RAW Bonus Types.
 */

import React from 'react';

interface ItemEffectsEditorProps {
  effects: any[];
  onAddEffect: () => void;
  onRemoveEffect: (idx: number) => void;
  onEffectChange: (idx: number, field: string, val: any) => void;
}

export const EFFECT_CATEGORIES = [
  { key: 'attribute', label: 'Attribute (STR, DEX...)' },
  { key: 'save', label: 'Saving Throw (Fort, Ref, Will)' },
  { key: 'ac', label: 'Armor Class (Deflection, Natural...)' },
  { key: 'skill', label: 'Skill (Spot, Listen, Tumble...)' },
  { key: 'speed', label: 'Speed & Movement' },
  { key: 'combat', label: 'Combat & Spell Resistance' },
  { key: 'resistance', label: 'Energy Resistance & DR' },
  { key: 'special', label: 'Special (Init, Darkvision...)' },
];

export const TARGET_OPTIONS: Record<string, Array<{ key: string; label: string }>> = {
  attribute: [
    { key: 'str', label: 'Strength (STR)' },
    { key: 'dex', label: 'Dexterity (DEX)' },
    { key: 'con', label: 'Constitution (CON)' },
    { key: 'int', label: 'Intelligence (INT)' },
    { key: 'wis', label: 'Wisdom (WIS)' },
    { key: 'cha', label: 'Charisma (CHA)' },
  ],
  save: [
    { key: 'all', label: 'All Saving Throws (Fort, Ref, Will)' },
    { key: 'fort', label: 'Fortitude Save' },
    { key: 'ref', label: 'Reflex Save' },
    { key: 'wil', label: 'Will Save' },
  ],
  ac: [
    { key: 'deflection', label: 'Deflection Bonus (Ring of Protection)' },
    { key: 'natural', label: 'Natural Armor (Amulet of Nat. Armor)' },
    { key: 'armor', label: 'Armor Bonus (Bracers of Armor)' },
    { key: 'shield', label: 'Shield Bonus' },
    { key: 'dodge', label: 'Dodge Bonus (Stacks)' },
  ],
  skill: [
    { key: 'concentration', label: 'Concentration (Konzentration)' },
    { key: 'spot', label: 'Spot (Entdecken)' },
    { key: 'listen', label: 'Listen (Lauschen)' },
    { key: 'search', label: 'Search (Suchen)' },
    { key: 'hide', label: 'Hide (Verstecken)' },
    { key: 'move_silently', label: 'Move Silently (Leise bewegen)' },
    { key: 'tumble', label: 'Tumble (Akrobatik)' },
    { key: 'spellcraft', label: 'Spellcraft (Zauberkunde)' },
    { key: 'jump', label: 'Jump (Springen)' },
    { key: 'climb', label: 'Climb (Klettern)' },
    { key: 'swim', label: 'Swim (Schwimmen)' },
    { key: 'bluff', label: 'Bluff (Bluffen)' },
    { key: 'diplomacy', label: 'Diplomacy (Diplomatie)' },
    { key: 'intimidate', label: 'Intimidate (Einschüchtern)' },
    { key: 'sense_motive', label: 'Sense Motive (Motiv erkennen)' },
    { key: 'use_magic_device', label: 'Use Magic Device (Magischen Gegenstand nutzen)' },
    { key: 'disable_device', label: 'Disable Device (Mechanismus ausschalten)' },
    { key: 'open_lock', label: 'Open Lock (Schlösser öffnen)' },
    { key: 'sleight_of_hand', label: 'Sleight of Hand (Fingerfertigkeit)' },
    { key: 'heal', label: 'Heal (Heilkunde)' },
    { key: 'survival', label: 'Survival (Überlebenskunst)' },
    { key: 'appraise', label: 'Appraise (Schätzen)' },
    { key: 'balance', label: 'Balance (Gleichgewicht)' },
    { key: 'disguise', label: 'Disguise (Verkleiden)' },
    { key: 'escape_artist', label: 'Escape Artist (Entfesselungskunst)' },
    { key: 'forgery', label: 'Forgery (Fälschen)' },
    { key: 'gather_information', label: 'Gather Information (Informationen sammeln)' },
    { key: 'handle_animal', label: 'Handle Animal (Mit Tieren umgehen)' },
    { key: 'ride', label: 'Ride (Reiten)' },
    { key: 'use_rope', label: 'Use Rope (Seil benutzen)' },
    { key: 'knowledge_arcana', label: 'Knowledge: Arcana' },
    { key: 'knowledge_dungeoneering', label: 'Knowledge: Dungeoneering' },
    { key: 'knowledge_nature', label: 'Knowledge: Nature' },
    { key: 'knowledge_religion', label: 'Knowledge: Religion' },
    { key: 'knowledge_planes', label: 'Knowledge: The Planes' },
  ],
  speed: [
    { key: 'speed', label: 'Base Land Speed (+ft.)' },
    { key: 'fly', label: 'Fly Speed (ft.)' },
    { key: 'swim', label: 'Swim Speed (ft.)' },
    { key: 'burrow', label: 'Burrow Speed (ft.)' },
  ],
  combat: [
    { key: 'attack', label: 'All Attack Rolls (+Atk)' },
    { key: 'melee_atk', label: 'Melee Attack Rolls (+Melee)' },
    { key: 'ranged_atk', label: 'Ranged Attack Rolls (+Ranged)' },
    { key: 'damage', label: 'Weapon Damage (+Dmg)' },
    { key: 'spell_resistance', label: 'Spell Resistance (SR)' },
    { key: 'spell_penetration', label: 'Spell Penetration' },
  ],
  resistance: [
    { key: 'fire_res', label: 'Fire Resistance' },
    { key: 'cold_res', label: 'Cold Resistance' },
    { key: 'elec_res', label: 'Electricity Resistance' },
    { key: 'acid_res', label: 'Acid Resistance' },
    { key: 'sonic_res', label: 'Sonic Resistance' },
    { key: 'dr', label: 'Damage Reduction (DR)' },
  ],
  special: [
    { key: 'ini', label: 'Initiative (+Init)' },
    { key: 'darkvision', label: 'Darkvision (Dunkelsicht ft.)' },
    { key: 'concealment', label: 'Concealment / Miss Chance (%)' },
    { key: 'fast_healing', label: 'Fast Healing' },
  ],
};

export const RAW_BONUS_TYPES = [
  { key: 'enhancement', label: 'Enhancement (Verbesserung - Standard für Attribute/Waffen)' },
  { key: 'resistance', label: 'Resistance (Widerstand - Standard für Rettungswürfe)' },
  { key: 'deflection', label: 'Deflection (Ablenkung - Standard für Schutzringe)' },
  { key: 'natural_enhancement', label: 'Natural Enhancement (Amulett der natürlichen Rüstung)' },
  { key: 'competence', label: 'Competence (Kompetenz - Standard für Fertigkeiten)' },
  { key: 'morale', label: 'Morale (Moral)' },
  { key: 'luck', label: 'Luck (Glück)' },
  { key: 'insight', label: 'Insight (Einsicht)' },
  { key: 'dodge', label: 'Dodge (Ausweichen - stackt)' },
  { key: 'sacred', label: 'Sacred (Heilig)' },
  { key: 'profane', label: 'Profane (Unheilig)' },
  { key: 'armor', label: 'Armor (Rüstungsbonus)' },
  { key: 'shield', label: 'Shield (Schildbonus)' },
  { key: 'untyped', label: 'Untyped (Stackt immer)' },
];

export const ItemEffectsEditor: React.FC<ItemEffectsEditorProps> = ({
  effects,
  onAddEffect,
  onRemoveEffect,
  onEffectChange,
}) => {
  const handleTypeChange = (idx: number, newType: string) => {
    onEffectChange(idx, 'type', newType);
    const availableTargets = TARGET_OPTIONS[newType];
    if (availableTargets && availableTargets.length > 0) {
      onEffectChange(idx, 'target', availableTargets[0].key);
    }
  };

  return (
    <div style={{ background: 'rgba(200, 169, 110, 0.1)', border: '1px solid rgba(200, 169, 110, 0.35)', borderRadius: '4px', padding: '8px 10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 169, 110, 0.35)', paddingBottom: '5px', marginBottom: '8px' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '11.5px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.02em' }}>
            Passive Modifiers &amp; RAW Effects ({effects.length})
          </span>
          <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--inkm)', fontFamily: 'var(--font-body)' }}>
            Configure bonuses to stats, saves, AC, or skills using D&amp;D 3.5e stacking rules.
          </span>
        </div>
        <button
          type="button"
          onClick={onAddEffect}
          className="btn btn-p"
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '9.5px',
            fontWeight: 'bold',
            padding: '3px 10px',
            color: 'var(--red)',
            border: '1px solid var(--pb)',
            background: 'linear-gradient(180deg, #fefdf8 0%, #edd9b4 100%)',
            borderRadius: '3px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>➕</span>
          <span>Add Effect</span>
        </button>
      </div>

      {effects.length === 0 ? (
        <div style={{ padding: '12px', textAlign: 'center', fontSize: '10px', fontStyle: 'italic', color: 'var(--inkm)', background: 'rgba(200, 169, 110, 0.05)', borderRadius: '3px', border: '1px dashed var(--pb)' }}>
          No passive effects configured. Click "+ Add Effect" to grant attribute, AC, or save bonuses.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Column Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.6fr 55px 1.4fr 24px',
              gap: '6px',
              padding: '0 4px',
              fontSize: '9px',
              fontFamily: 'var(--font-title)',
              color: 'var(--inkm)',
              fontWeight: 'bold',
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}
          >
            <span>Category</span>
            <span>Target Stat / Skill</span>
            <span style={{ textAlign: 'center' }}>Bonus</span>
            <span>Stacking Type</span>
            <span></span>
          </div>

          {effects.map((eff, idx) => {
            const currentCategory = eff.type || 'attribute';
            const targetList = TARGET_OPTIONS[currentCategory] || TARGET_OPTIONS.attribute;
            const isKnownTarget = targetList.some(t => t.key === eff.target);

            return (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.6fr 55px 1.4fr 24px',
                  gap: '6px',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.75)',
                  padding: '4px 6px',
                  borderRadius: '3px',
                  border: '1px solid var(--pb)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                {/* Column 1: Category */}
                <div>
                  <select
                    value={currentCategory}
                    onChange={(e) => handleTypeChange(idx, e.target.value)}
                    className="cinput"
                    style={{
                      width: '100%',
                      fontSize: '10.5px',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--ink)',
                      background: '#fff',
                      height: '26px',
                      padding: '2px 4px',
                      border: '1px solid var(--pb)',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="Effect Category"
                  >
                    {EFFECT_CATEGORIES.map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Column 2: Target Dropdown */}
                <div>
                  <select
                    value={eff.target || (targetList[0]?.key ?? '')}
                    onChange={(e) => onEffectChange(idx, 'target', e.target.value)}
                    className="cinput"
                    style={{
                      width: '100%',
                      fontSize: '10.5px',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--ink)',
                      background: '#fff',
                      height: '26px',
                      padding: '2px 4px',
                      border: '1px solid var(--pb)',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="Target Stat or Skill"
                  >
                    {!isKnownTarget && eff.target && (
                      <option value={eff.target}>Custom: {eff.target}</option>
                    )}
                    {targetList.map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Column 3: Numeric Value */}
                <div>
                  <input
                    type="number"
                    value={eff.value}
                    onChange={(e) => onEffectChange(idx, 'value', parseInt(e.target.value) || 0)}
                    placeholder="+0"
                    className="cinput"
                    style={{
                      width: '100%',
                      fontSize: '11px',
                      fontFamily: 'var(--font-body)',
                      height: '26px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'var(--ink)',
                      background: '#fff',
                      border: '1px solid var(--pb)',
                      borderRadius: '3px',
                      boxSizing: 'border-box'
                    }}
                    title="Bonus / Modifier Value (e.g. +2, +4)"
                  />
                </div>

                {/* Column 4: Bonus Type */}
                <div>
                  <select
                    value={eff.bonusType || 'enhancement'}
                    onChange={(e) => onEffectChange(idx, 'bonusType', e.target.value)}
                    className="cinput"
                    style={{
                      width: '100%',
                      fontSize: '10px',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--ink)',
                      background: '#fff',
                      height: '26px',
                      padding: '2px 4px',
                      border: '1px solid var(--pb)',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="RAW Bonus Stacking Type"
                  >
                    {RAW_BONUS_TYPES.map(bt => (
                      <option key={bt.key} value={bt.key}>{bt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Column 5: Remove */}
                <div>
                  <button
                    type="button"
                    onClick={() => onRemoveEffect(idx)}
                    className="xbtn"
                    style={{
                      fontSize: '10px',
                      height: '22px',
                      width: '22px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--red)',
                      background: 'rgba(139, 26, 26, 0.08)',
                      border: '1px solid rgba(139, 26, 26, 0.25)',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    title="Remove Effect"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
