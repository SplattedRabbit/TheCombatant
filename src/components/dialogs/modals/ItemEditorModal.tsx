/**
 * @module    ItemEditorModal
 * @summary   Modal editor for creating or editing wondrous items, rings, wondrous gear and custom equipment.
 * @exports   ItemEditorModal
 */

import React, { useState } from 'react';
import { DialogOverlay } from './DialogOverlay.tsx';
import { CombatState } from '@core/state.js';
import { ITEM_SLOTS } from '@core/data/magicItems-data.js';
import { getDefaultBonusType } from '@core/models/Item.js';
import { ItemEffectsEditor } from '../../player/armory/ItemEffectsEditor.tsx';
import { ItemActivationSection } from '../../player/armory/ItemActivationSection.tsx';

export interface ItemEditorModalProps {
  item?: any;
  itemIdx?: number;
  defaultSlot?: string;
  onSave?: (itemData: any) => void;
  onClose: () => void;
}

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  item,
  itemIdx,
  defaultSlot = 'slotless',
  onSave,
  onClose
}) => {
  const isEditing = (itemIdx !== undefined && itemIdx >= 0 && item) || (item && item.name);

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
      ...(item || {}),
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
        cost: parseInt(cost as any) || 0,
        appliedBuffKey: appliedBuffKey.trim(),
        effectDescription: activationDesc.trim()
      } : null
    };

    if (typeof onSave === 'function') {
      onSave(itemData);
    } else {
      // Default: save into active PC's items array
      const activePC = CombatState.getActivePC();
      if (activePC) {
        CombatState.updatePCBatch((freshPc: any) => {
          freshPc.items = Array.isArray(freshPc.items) ? freshPc.items : [];
          freshPc.items.push(itemData);
        });
      }
    }

    onClose();
  };

  return (
    <DialogOverlay onClose={onClose} width={580} textAlign="left" padding="16px 20px">
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--pb)', paddingBottom: '7px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '17px' }}>🔮</span>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '15px', fontWeight: 'bold', color: 'var(--red)', letterSpacing: '0.02em' }}>
              {isEditing ? `Edit Magic Item: ${name || 'Item'}` : 'Create Custom Magic Item'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="xbtn"
            style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '3px',
              border: '1px solid var(--pb)',
              background: 'rgba(200, 169, 110, 0.15)',
              color: 'var(--inkm)',
              cursor: 'pointer'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Row 1: Name & Slot */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '3px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Item Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ring of Spell Turning"
                className="cinput"
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--ink)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  height: '28px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '3px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Body Slot:
              </label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="cinput"
                style={{
                  width: '100%',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--ink)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid var(--pb)',
                  borderRadius: '3px',
                  height: '28px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(ITEM_SLOTS).map(([k, def]: [string, any]) => (
                  <option key={k} value={k}>
                    {def.nameEn}
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
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '3px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Description &amp; Rules Text:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Lore, trigger conditions, specific limitations or flavor text..."
              className="cinput"
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '11px',
                fontFamily: 'var(--font-body)',
                color: 'var(--ink)',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid var(--pb)',
                borderRadius: '3px',
                boxSizing: 'border-box',
                lineHeight: 1.4
              }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--pb)', paddingTop: '12px', marginTop: '14px' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="btn btn-p"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '5px 18px',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              borderRadius: '3px',
              color: 'var(--red)',
              border: '1.5px solid var(--pb)',
              background: 'linear-gradient(180deg, #fefdf8 0%, #edd9b4 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: name.trim() ? 1 : 0.6
            }}
          >
            {isEditing ? '💾 Save Changes' : '➕ Create Item'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11px',
              padding: '5px 16px',
              cursor: 'pointer',
              borderRadius: '3px',
              color: 'var(--inkm)',
              border: '1px solid var(--pb)',
              background: 'rgba(200, 169, 110, 0.15)'
            }}
          >
            Cancel
          </button>
        </div>

      </div>
    </DialogOverlay>
  );
};
