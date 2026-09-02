/**
 * @module    ItemActivationSection
 * @summary   Charges, daily uses, and activation/buff triggers configuration in ItemEditorModal.
 */

import React, { useState } from 'react';

interface ItemActivationSectionProps {
  hasCharges: boolean;
  setHasCharges: (val: boolean) => void;
  chargesCur: number;
  setChargesCur: (val: number) => void;
  chargesMax: number;
  setChargesMax: (val: number) => void;
  hasDailyUses: boolean;
  setHasDailyUses: (val: boolean) => void;
  dailyUsesCur: number;
  setDailyUsesCur: (val: number) => void;
  dailyUsesMax: number;
  setDailyUsesMax: (val: number) => void;
  hasActivation: boolean;
  setHasActivation: (val: boolean) => void;
  actionType: string;
  setActionType: (val: string) => void;
  costType: string;
  setCostType: (val: string) => void;
  cost: number;
  setCost: (val: number) => void;
  appliedBuffKey: string;
  setAppliedBuffKey: (val: string) => void;
  activationDesc: string;
  setActivationDesc: (val: string) => void;
}

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

export const ItemActivationSection: React.FC<ItemActivationSectionProps> = ({
  hasCharges,
  setHasCharges,
  chargesCur,
  setChargesCur,
  chargesMax,
  setChargesMax,
  hasDailyUses,
  setHasDailyUses,
  dailyUsesCur,
  setDailyUsesCur,
  dailyUsesMax,
  setDailyUsesMax,
  hasActivation,
  setHasActivation,
  actionType,
  setActionType,
  costType,
  setCostType,
  cost,
  setCost,
  appliedBuffKey,
  setAppliedBuffKey,
  activationDesc,
  setActivationDesc,
}) => {
  const isInitialCustom = !!appliedBuffKey && !STANDARD_BUFF_OPTIONS.some(o => o.key === appliedBuffKey && o.key !== '' && o.key !== 'custom');
  const [isCustomBuffKey, setIsCustomBuffKey] = useState(isInitialCustom);

  return (
    <>
      {/* Charges & Daily Uses */}
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

      {/* Activation Section */}
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
    </>
  );
};
