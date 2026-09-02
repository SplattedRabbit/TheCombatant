import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { ITEM_SLOTS } from '@core/data/magicItems-data.js';
import { getDefaultBonusType } from '@core/models/Item.js';
import { ItemEffectsEditor } from './ItemEffectsEditor.tsx';
import { ItemActivationSection } from './ItemActivationSection.tsx';

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
  const initialBuffKey = item?.activation?.appliedBuffKey || '';
  const [hasActivation, setHasActivation] = useState(!!item?.activation);
  const [actionType, setActionType] = useState(item?.activation?.actionType || 'standard');
  const [costType, setCostType] = useState(item?.activation?.costType || 'charges');
  const [cost, setCost] = useState(item?.activation?.cost !== undefined ? item.activation.cost : 1);
  const [appliedBuffKey, setAppliedBuffKey] = useState(initialBuffKey);
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

          {/* Section: Passive Effects */}
          <ItemEffectsEditor
            effects={effects}
            onAddEffect={handleAddEffect}
            onRemoveEffect={handleRemoveEffect}
            onEffectChange={handleEffectChange}
          />

          {/* Section: Charges, Daily Uses, Usable Activation */}
          <ItemActivationSection
            hasCharges={hasCharges}
            setHasCharges={setHasCharges}
            chargesCur={chargesCur}
            setChargesCur={setChargesCur}
            chargesMax={chargesMax}
            setChargesMax={setChargesMax}
            hasDailyUses={hasDailyUses}
            setHasDailyUses={setHasDailyUses}
            dailyUsesCur={dailyUsesCur}
            setDailyUsesCur={setDailyUsesCur}
            dailyUsesMax={dailyUsesMax}
            setDailyUsesMax={setDailyUsesMax}
            hasActivation={hasActivation}
            setHasActivation={setHasActivation}
            actionType={actionType}
            setActionType={setActionType}
            costType={costType}
            setCostType={setCostType}
            cost={cost}
            setCost={setCost}
            appliedBuffKey={appliedBuffKey}
            setAppliedBuffKey={setAppliedBuffKey}
            activationDesc={activationDesc}
            setActivationDesc={setActivationDesc}
          />

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
