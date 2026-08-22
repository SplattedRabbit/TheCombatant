import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { ITEM_SLOTS, MAGIC_ITEMS_REGISTRY } from '@core/data/magicItems-data.js';
// @ts-ignore
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
  const [priceGp, setPriceGp] = useState<number>(item?.priceGp || 0);
  const [weightLbs, setWeightLbs] = useState<number>(item?.weightLbs || 0);

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

  // Activation
  const [hasActivation, setHasActivation] = useState(!!item?.activation);
  const [actionType, setActionType] = useState(item?.activation?.actionType || 'standard');
  const [costType, setCostType] = useState(item?.activation?.costType || 'charges');
  const [cost, setCost] = useState(item?.activation?.cost || 1);
  const [appliedBuffKey, setAppliedBuffKey] = useState(item?.activation?.appliedBuffKey || '');
  const [activationDesc, setActivationDesc] = useState(item?.activation?.effectDescription || '');

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
      priceGp: parseInt(priceGp as any) || 0,
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
        padding: '12px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--pd, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '4px',
          padding: '16px',
          width: '600px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '6px' }}>
          <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '15px', fontWeight: 'bold', color: 'var(--red)' }}>
            {isEditing ? `✏️ Edit Item: ${name || 'Item'}` : '➕ Create Custom Magic Item'}
          </span>
          <button type="button" onClick={onClose} className="xbtn" style={{ fontSize: '13px', padding: '2px 8px' }}>
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
          
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
                style={{ width: '100%', padding: '4px 6px', fontSize: '11px', height: '24px', boxSizing: 'border-box' }}
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
                style={{ width: '100%', padding: '2px 6px', fontSize: '11px', height: '24px', boxSizing: 'border-box' }}
              >
                {Object.entries(ITEM_SLOTS).map(([k, def]: [string, any]) => (
                  <option key={k} value={k}>
                    {def.icon} {def.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price & Weight */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '2px' }}>
                Market Price (GP):
              </label>
              <input
                type="number"
                value={priceGp || ''}
                onChange={(e) => setPriceGp(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="cinput"
                style={{ width: '100%', padding: '4px 6px', fontSize: '11px', height: '24px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '2px' }}>
                Weight (lbs):
              </label>
              <input
                type="number"
                step="0.5"
                value={weightLbs || ''}
                onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="cinput"
                style={{ width: '100%', padding: '4px 6px', fontSize: '11px', height: '24px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Section: Effects */}
          <div style={{ background: 'rgba(200, 169, 110, 0.08)', border: '1px solid var(--pb)', borderRadius: '3px', padding: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
                Passive Modifiers & Effects ({effects.length})
              </span>
              <button
                type="button"
                onClick={handleAddEffect}
                className="btn btn-p"
                style={{ fontSize: '8px', padding: '1px 6px' }}
              >
                + Add Effect
              </button>
            </div>

            {effects.map((eff, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
                <select
                  value={eff.type}
                  onChange={(e) => handleEffectChange(idx, 'type', e.target.value)}
                  className="cinput"
                  style={{ width: '85px', fontSize: '9.5px', height: '22px' }}
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
                  placeholder="Target (str, defl...)"
                  className="cinput"
                  style={{ width: '75px', fontSize: '9.5px', height: '22px', padding: '2px 4px' }}
                  title="str, dex, con, int, wis, cha, fort, ref, wil, all, deflection, natural, armor, spot, etc."
                />

                <input
                  type="number"
                  value={eff.value}
                  onChange={(e) => handleEffectChange(idx, 'value', parseInt(e.target.value) || 0)}
                  className="cinput"
                  style={{ width: '45px', fontSize: '9.5px', height: '22px', textAlign: 'center' }}
                />

                <select
                  value={eff.bonusType}
                  onChange={(e) => handleEffectChange(idx, 'bonusType', e.target.value)}
                  className="cinput"
                  style={{ width: '95px', fontSize: '9.5px', height: '22px' }}
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
                  style={{ fontSize: '9px', padding: '1px 4px' }}
                  title="Remove effect"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Section: Charges / Usable */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            
            {/* Charges */}
            <div style={{ border: '1px solid var(--pb)', borderRadius: '3px', padding: '6px', background: 'white' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                <input
                  type="checkbox"
                  checked={hasCharges}
                  onChange={(e) => setHasCharges(e.target.checked)}
                />
                Item Charges (Wand/Staff)
              </label>
              {hasCharges && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="number"
                    value={chargesCur}
                    onChange={(e) => setChargesCur(parseInt(e.target.value) || 0)}
                    placeholder="Cur"
                    className="cinput"
                    style={{ width: '50%', fontSize: '9.5px', height: '22px', textAlign: 'center' }}
                  />
                  <input
                    type="number"
                    value={chargesMax}
                    onChange={(e) => setChargesMax(parseInt(e.target.value) || 0)}
                    placeholder="Max"
                    className="cinput"
                    style={{ width: '50%', fontSize: '9.5px', height: '22px', textAlign: 'center' }}
                  />
                </div>
              )}
            </div>

            {/* Daily Uses */}
            <div style={{ border: '1px solid var(--pb)', borderRadius: '3px', padding: '6px', background: 'white' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
                <input
                  type="checkbox"
                  checked={hasDailyUses}
                  onChange={(e) => setHasDailyUses(e.target.checked)}
                />
                Daily Uses (X / Day)
              </label>
              {hasDailyUses && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="number"
                    value={dailyUsesCur}
                    onChange={(e) => setDailyUsesCur(parseInt(e.target.value) || 0)}
                    placeholder="Cur"
                    className="cinput"
                    style={{ width: '50%', fontSize: '9.5px', height: '22px', textAlign: 'center' }}
                  />
                  <input
                    type="number"
                    value={dailyUsesMax}
                    onChange={(e) => setDailyUsesMax(parseInt(e.target.value) || 0)}
                    placeholder="Max"
                    className="cinput"
                    style={{ width: '50%', fontSize: '9.5px', height: '22px', textAlign: 'center' }}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Section: Description */}
          <div>
            <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', color: 'var(--inkm)', marginBottom: '2px' }}>
              Description & Fluff:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="cinput"
              style={{ width: '100%', padding: '4px 6px', fontSize: '10px', boxSizing: 'border-box' }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px solid var(--pb)', paddingTop: '6px' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn btn-p"
            style={{ fontSize: '10px', padding: '4px 16px', fontFamily: "'IM Fell English SC', serif" }}
          >
            {isEditing ? '💾 Save Changes' : '➕ Create Item'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ fontSize: '10px', padding: '4px 16px', fontFamily: "'IM Fell English SC', serif" }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
