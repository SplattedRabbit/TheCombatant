import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { ITEM_SLOTS } from '@core/data/magicItems-data.js';
import { getDefaultBonusType } from '@core/models/Item.js';

interface ItemEditorModalProps {
  item?: any;
  itemIdx?: number;
  defaultSlot?: string;
  onClose: () => void;
}

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  item,
  itemIdx,
  defaultSlot = 'slotless',
  onClose
}) => {
  const isEditing = itemIdx !== undefined && itemIdx >= 0 && item;

  const [name, setName] = useState(item?.name || '');
  const [slot, setSlot] = useState(item?.slot || defaultSlot);
  const [description, setDescription] = useState(item?.description || '');
  const weightLbs = item?.weightLbs || 0;

  // Effects
  const [effects, setEffects] = useState<any[]>(
    Array.isArray(item?.effects) && item.effects.length > 0
      ? JSON.parse(JSON.stringify(item.effects))
      : [{ type: 'attribute', target: 'str', value: 2, bonusType: 'enhancement', condition: '' }]
  );

  // Charges
  const [hasCharges, setHasCharges] = useState(!!item?.charges);
  const [chargesMax, setChargesMax] = useState(item?.charges?.max || 50);
  const [chargesCur, setChargesCur] = useState(item?.charges?.current || 50);

  // Daily Uses
  const [hasDailyUses, setHasDailyUses] = useState(!!item?.dailyUses);
  const [dailyUsesMax, setDailyUsesMax] = useState(item?.dailyUses?.max || 3);
  const [dailyUsesCur, setDailyUsesCur] = useState(item?.dailyUses?.current || 3);

  // Activation & Buff Effect
  const STANDARD_BUFF_OPTIONS = [
    { key: '', label: 'None / Plain Action (Kein Buff)' },
    { key: 'invisibility', label: '✨ Invisibility (Unsichtbarkeit)' },
    { key: 'shield', label: '✨ Shield (+4 Shield AC)' },
    { key: 'mage_armor', label: '✨ Mage Armor (+4 Armor AC)' },
    { key: 'haste', label: '✨ Haste (+1 Atk/AC/Ref, +30ft Speed, Extra Atk)' },
    { key: 'bulls_strength', label: "✨ Bull's Strength (+4 STR)" },
    { key: 'cats_grace', label: "✨ Cat's Grace (+4 DEX)" },
    { key: 'bears_endurance', label: "✨ Bear's Endurance (+4 CON)" },
    { key: 'foxs_cunning', label: "✨ Fox's Cunning (+4 INT)" },
    { key: 'owls_wisdom', label: "✨ Owl's Wisdom (+4 WIS)" },
    { key: 'eagles_splendor', label: "✨ Eagle's Splendor (+4 CHA)" },
    { key: 'bless', label: '✨ Bless (+1 Atk & Fear Saves)' },
    { key: 'prayer', label: '✨ Prayer (+1 Atk/Dmg/Saves/Skills)' },
    { key: 'divine_favor', label: '✨ Divine Favor (+1 to +3 Atk/Dmg)' },
    { key: 'shield_of_faith', label: '✨ Shield of Faith (+2 to +5 Deflection AC)' },
    { key: 'barkskin', label: '✨ Barkskin (+2 to +5 Natural AC)' },
    { key: 'fly', label: '✨ Fly (Speed 60 ft)' },
    { key: 'blur', label: '✨ Blur (20% Concealment)' },
    { key: 'mirror_image', label: '✨ Mirror Image (1d4+1 duplicates)' },
    { key: 'see_invisibility', label: '✨ See Invisibility' },
    { key: 'true_seeing', label: '✨ True Seeing' },
    { key: 'heroism', label: '✨ Heroism (+2 Morale on Atk/Saves/Skills)' },
    { key: 'protection_from_evil', label: '✨ Protection from Evil (+2 Deflection AC, +2 Saves)' },
    { key: 'righteous_might', label: '✨ Righteous Might (Large, +STR/CON/DR)' },
    { key: 'stoneskin', label: '✨ Stoneskin (DR 10/adamantine)' },
    { key: 'rage', label: '✨ Rage (Barbarian: +4 STR/CON, +2 Will, -2 AC)' },
    { key: 'inspire_courage_1', label: '✨ Inspire Courage +1 (Bard)' },
    { key: 'custom', label: '✏️ Custom Spell/Buff Key...' }
  ];

  const initialBuffKey = item?.activation?.appliedBuffKey || '';
  const isInitialCustom = !!initialBuffKey && !STANDARD_BUFF_OPTIONS.some(o => o.key === initialBuffKey && o.key !== '' && o.key !== 'custom');

  const [hasActivation, setHasActivation] = useState(!!item?.activation);
  const [actionType, setActionType] = useState(item?.activation?.actionType || 'standard');
  const [costType, setCostType] = useState(item?.activation?.costType || 'charges');
  const [cost, setCost] = useState(item?.activation?.cost !== undefined ? item.activation.cost : 1);
  const [appliedBuffKey, setAppliedBuffKey] = useState(initialBuffKey);
  const [activationDesc, setActivationDesc] = useState(item?.activation?.effectDescription || '');
  const [isCustomBuffKey, setIsCustomBuffKey] = useState(isInitialCustom);

  const handleAddEffect = () => {
    setEffects(prev => [...prev, { type: 'attribute', target: 'str', value: 1, bonusType: 'enhancement', condition: '' }]);
  };

  const handleRemoveEffect = (idx: number) => {
    setEffects(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEffectChange = (idx: number, field: string, val: any) => {
    setEffects(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === 'type' || field === 'target') {
        next[idx].bonusType = getDefaultBonusType(next[idx].type, next[idx].target);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const itemData: any = {
      name: name.trim(),
      slot,
      description: description.trim(),
      weightLbs: parseFloat(weightLbs as any) || 0,
      effects: effects.map(e => ({
        type: e.type,
        target: e.target,
        value: parseInt(e.value) || 0,
        bonusType: e.bonusType || getDefaultBonusType(e.type, e.target),
        condition: e.condition || ''
      })),
      charges: hasCharges ? { current: parseInt(chargesCur as any) || 0, max: parseInt(chargesMax as any) || 0 } : null,
      dailyUses: hasDailyUses ? { current: parseInt(dailyUsesCur as any) || 0, max: parseInt(dailyUsesMax as any) || 0 } : null,
      activation: hasActivation ? {
        actionType,
        costType,
        cost: parseInt(cost as any) || 1,
        appliedBuffKey: appliedBuffKey.trim(),
        effectDescription: activationDesc.trim()
      } : null
    };

    if (isEditing && itemIdx !== undefined) {
      CombatState.updatePCBatch((freshPc: any) => {
        if (freshPc.items && freshPc.items[itemIdx]) {
          Object.assign(freshPc.items[itemIdx], itemData);
        }
      });
    } else {
      CombatState.updatePCBatch((freshPc: any) => {
        freshPc.items = Array.isArray(freshPc.items) ? freshPc.items : [];
        freshPc.items.push(itemData);
      });
    }

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '10px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--pd, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '4px',
          padding: '12px 14px',
          width: '560px',
          maxWidth: '94vw',
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 10px 32px rgba(0,0,0,0.4)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '5px' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '14.5px', fontWeight: 'bold', color: 'var(--red)' }}>
            {isEditing ? `✏️ Edit Item: ${name || 'Item'}` : '➕ Create Custom Magic Item'}
          </span>
          <button type="button" onClick={onClose} className="xbtn" style={{ fontSize: '12px', padding: '2px 6px' }}>
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '2px' }}>
          
          {/* Row 1: Name & Slot */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '2px' }}>
                Item Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ring of Spell Turning"
                className="cinput"
                style={{ width: '100%', padding: '3px 6px', fontSize: '11px', height: '24px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '2px' }}>
                Body Slot:
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="cinput"
                style={{ width: '100%', padding: '2px 6px', fontSize: '10.5px', height: '24px', boxSizing: 'border-box' }}
              >
                {Object.entries(ITEM_SLOTS).map(([k, def]: [string, any]) => (
                  <option key={k} value={k}>
                    {def.icon} {def.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Effects */}
          <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '1px solid var(--pb)', borderRadius: '3px', padding: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
                Passive Modifiers & Effects ({effects.length})
              </span>
              <button
                type="button"
                onClick={handleAddEffect}
                className="btn btn-p"
                style={{ fontSize: '8px', padding: '1px 5px' }}
              >
                + Add Effect
              </button>
            </div>

            {effects.map((eff, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '3px', alignItems: 'center', marginBottom: '3px' }}>
                <select
                  value={eff.type}
                  onChange={(e) => handleEffectChange(idx, 'type', e.target.value)}
                  className="cinput"
                  style={{ width: '80px', fontSize: '9px', height: '22px' }}
                >
                  <option value="attribute">Attribute</option>
                  <option value="save">Save</option>
                  <option value="ac">Armor Class</option>
                  <option value="skill">Skill</option>
                  <option value="speed">Speed</option>
                </select>

                <input
                  type="text"
                  value={eff.target}
                  onChange={(e) => handleEffectChange(idx, 'target', e.target.value)}
                  placeholder="Target (str, fort...)"
                  className="cinput"
                  style={{ width: '70px', fontSize: '9px', height: '22px', padding: '1px 3px' }}
                />

                <input
                  type="number"
                  value={eff.value}
                  onChange={(e) => handleEffectChange(idx, 'value', parseInt(e.target.value) || 0)}
                  className="cinput"
                  style={{ width: '40px', fontSize: '9px', height: '22px', textAlign: 'center' }}
                />

                <select
                  value={eff.bonusType}
                  onChange={(e) => handleEffectChange(idx, 'bonusType', e.target.value)}
                  className="cinput"
                  style={{ width: '90px', fontSize: '9px', height: '22px' }}
                >
                  <option value="enhancement">Enhancement</option>
                  <option value="deflection">Deflection</option>
                  <option value="natural_enhancement">Natural Enh.</option>
                  <option value="resistance">Resistance</option>
                  <option value="competence">Competence</option>
                  <option value="morale">Morale</option>
                  <option value="luck">Luck</option>
                  <option value="insight">Insight</option>
                  <option value="dodge">Dodge</option>
                  <option value="untyped">Untyped</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleRemoveEffect(idx)}
                  className="xbtn"
                  style={{ fontSize: '8.5px', padding: '1px 4px' }}
                  title="Remove effect"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Section: Charges / Usable */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {/* Charges */}
            <div style={{ border: '1px solid var(--pb)', borderRadius: '3px', padding: '5px', background: '#ffffff' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                <input
                  type="checkbox"
                  checked={hasCharges}
                  onChange={(e) => setHasCharges(e.target.checked)}
                />
                Charges (Wand / Scroll / Potion)
              </label>
              {hasCharges && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '3px' }}>
                  <input
                    type="number"
                    value={chargesCur}
                    onChange={(e) => setChargesCur(parseInt(e.target.value) || 0)}
                    placeholder="Current"
                    className="cinput"
                    style={{ width: '50%', fontSize: '9px', height: '20px', textAlign: 'center' }}
                  />
                  <input
                    type="number"
                    value={chargesMax}
                    onChange={(e) => setChargesMax(parseInt(e.target.value) || 0)}
                    placeholder="Max"
                    className="cinput"
                    style={{ width: '50%', fontSize: '9px', height: '20px', textAlign: 'center' }}
                  />
                </div>
              )}
            </div>

            {/* Daily Uses */}
            <div style={{ border: '1px solid var(--pb)', borderRadius: '3px', padding: '5px', background: '#ffffff' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                <input
                  type="checkbox"
                  checked={hasDailyUses}
                  onChange={(e) => setHasDailyUses(e.target.checked)}
                />
                Daily Uses (X / Day)
              </label>
              {hasDailyUses && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '3px' }}>
                  <input
                    type="number"
                    value={dailyUsesCur}
                    onChange={(e) => setDailyUsesCur(parseInt(e.target.value) || 0)}
                    placeholder="Current"
                    className="cinput"
                    style={{ width: '50%', fontSize: '9px', height: '20px', textAlign: 'center' }}
                  />
                  <input
                    type="number"
                    value={dailyUsesMax}
                    onChange={(e) => setDailyUsesMax(parseInt(e.target.value) || 0)}
                    placeholder="Max"
                    className="cinput"
                    style={{ width: '50%', fontSize: '9px', height: '20px', textAlign: 'center' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section: Activation & Spell/Buff Effect */}
          <div style={{ border: '1px solid var(--pb)', borderRadius: '3px', padding: '6px', background: 'rgba(200, 169, 110, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasActivation ? '4px' : '0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasActivation}
                  onChange={(e) => setHasActivation(e.target.checked)}
                />
                ⚡ Usable / Activatable Item (Casts Buff, Spell or Special Action)
              </label>
            </div>

            {hasActivation && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                {/* Row: Action Type, Cost Type, Cost Amount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.6fr', gap: '5px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '8.5px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '1px' }}>
                      Action Type:
                    </label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                      className="cinput"
                      style={{ width: '100%', fontSize: '9px', height: '22px' }}
                    >
                      <option value="standard">Standard Action</option>
                      <option value="swift">Swift Action</option>
                      <option value="free">Free Action</option>
                      <option value="full">Full-Round Action</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '8.5px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '1px' }}>
                      Cost Type:
                    </label>
                    <select
                      value={costType}
                      onChange={(e) => setCostType(e.target.value)}
                      className="cinput"
                      style={{ width: '100%', fontSize: '9px', height: '22px' }}
                    >
                      <option value="charges">Charges (Verbrauch)</option>
                      <option value="daily">Daily Uses (Tagesnutzung)</option>
                      <option value="unlimited">Unlimited / At Will</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '8.5px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '1px' }}>
                      Cost:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={cost}
                      onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                      className="cinput"
                      style={{ width: '100%', fontSize: '9px', height: '22px', textAlign: 'center' }}
                    />
                  </div>
                </div>

                {/* Row: Buff / Spell Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '8.5px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '1px' }}>
                    Linked Buff / Aura (Overview & Buff Interface):
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {!isCustomBuffKey ? (
                      <select
                        value={appliedBuffKey}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setIsCustomBuffKey(true);
                            setAppliedBuffKey('');
                          } else {
                            setAppliedBuffKey(e.target.value);
                          }
                        }}
                        className="cinput"
                        style={{ flex: 1, fontSize: '9px', height: '22px' }}
                      >
                        {STANDARD_BUFF_OPTIONS.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                        <input
                          type="text"
                          value={appliedBuffKey}
                          onChange={(e) => setAppliedBuffKey(e.target.value)}
                          placeholder="e.g. invisibility, haste, custom_buff_key"
                          className="cinput"
                          style={{ flex: 1, fontSize: '9px', height: '22px', padding: '2px 4px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomBuffKey(false);
                            setAppliedBuffKey('');
                          }}
                          className="btn"
                          style={{ fontSize: '8px', padding: '1px 5px', height: '22px' }}
                          title="Back to list"
                        >
                          List
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row: Effect Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '8.5px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '1px' }}>
                    Activation Description:
                  </label>
                  <input
                    type="text"
                    value={activationDesc}
                    onChange={(e) => setActivationDesc(e.target.value)}
                    placeholder="e.g. Grants Invisibility for 3 minutes when consumed."
                    className="cinput"
                    style={{ width: '100%', padding: '2px 4px', fontSize: '9px', height: '22px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '2px' }}>
              Description & Details:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="cinput"
              style={{ width: '100%', padding: '3px 6px', fontSize: '10px', boxSizing: 'border-box' }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid var(--pb)', paddingTop: '5px' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn btn-p"
            style={{ fontSize: '9.5px', padding: '3px 14px', fontFamily: 'var(--font-title)' }}
          >
            {isEditing ? '💾 Save Changes' : '➕ Create Item'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ fontSize: '9.5px', padding: '3px 14px', fontFamily: 'var(--font-title)' }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
