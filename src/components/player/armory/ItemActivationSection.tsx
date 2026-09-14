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
  { key: 'invisibility', label: 'Invisibility (Unsichtbarkeit)' },
  { key: 'shield', label: 'Shield (+4 Shield AC)' },
  { key: 'mage_armor', label: 'Mage Armor (+4 Armor AC)' },
  { key: 'haste', label: 'Haste (+1 Atk/AC/Ref, +30ft Speed, Extra Atk)' },
  { key: 'bulls_strength', label: "Bull's Strength (+4 STR)" },
  { key: 'cats_grace', label: "Cat's Grace (+4 DEX)" },
  { key: 'bears_endurance', label: "Bear's Endurance (+4 CON)" },
  { key: 'foxs_cunning', label: "Fox's Cunning (+4 INT)" },
  { key: 'owls_wisdom', label: "Owl's Wisdom (+4 WIS)" },
  { key: 'eagles_splendor', label: "Eagle's Splendor (+4 CHA)" },
  { key: 'bless', label: 'Bless (+1 Atk & Fear Saves)' },
  { key: 'prayer', label: 'Prayer (+1 Atk/Dmg/Saves/Skills)' },
  { key: 'divine_favor', label: 'Divine Favor (+1 to +3 Atk/Dmg)' },
  { key: 'shield_of_faith', label: 'Shield of Faith (+2 to +5 Deflection AC)' },
  { key: 'barkskin', label: 'Barkskin (+2 to +5 Natural AC)' },
  { key: 'fly', label: 'Fly (Speed 60 ft)' },
  { key: 'blur', label: 'Blur (20% Concealment)' },
  { key: 'mirror_image', label: 'Mirror Image (1d4+1 duplicates)' },
  { key: 'see_invisibility', label: 'See Invisibility' },
  { key: 'true_seeing', label: 'True Seeing' },
  { key: 'heroism', label: 'Heroism (+2 Morale on Atk/Saves/Skills)' },
  { key: 'protection_from_evil', label: 'Protection from Evil (+2 Deflection AC, +2 Saves)' },
  { key: 'righteous_might', label: 'Righteous Might (Large, +STR/CON/DR)' },
  { key: 'stoneskin', label: 'Stoneskin (DR 10/adamantine)' },
  { key: 'rage', label: 'Rage (Barbarian: +4 STR/CON, +2 Will, -2 AC)' },
  { key: 'inspire_courage_1', label: 'Inspire Courage +1 (Bard)' },
  { key: 'custom', label: 'Custom Spell/Buff Key...' }
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {/* Charges */}
        <div style={{ background: 'rgba(200, 169, 110, 0.1)', border: '1px solid rgba(200, 169, 110, 0.35)', borderRadius: '4px', padding: '8px 10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--ink)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasCharges}
              onChange={(e) => setHasCharges(e.target.checked)}
              style={{ width: '13px', height: '13px', margin: 0, cursor: 'pointer' }}
            />
            <span>Charges (Wands / Scrolls)</span>
          </label>
          {hasCharges && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '8.5px', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '1px' }}>Current:</span>
                <input
                  type="number"
                  value={chargesCur}
                  onChange={(e) => setChargesCur(parseInt(e.target.value) || 0)}
                  placeholder="Cur"
                  className="cinput"
                  style={{ width: '100%', fontSize: '11px', height: '24px', textAlign: 'center', fontWeight: 'bold', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '8.5px', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '1px' }}>Maximum:</span>
                <input
                  type="number"
                  value={chargesMax}
                  onChange={(e) => setChargesMax(parseInt(e.target.value) || 0)}
                  placeholder="Max"
                  className="cinput"
                  style={{ width: '100%', fontSize: '11px', height: '24px', textAlign: 'center', fontWeight: 'bold', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Daily Uses */}
        <div style={{ background: 'rgba(200, 169, 110, 0.1)', border: '1px solid rgba(200, 169, 110, 0.35)', borderRadius: '4px', padding: '8px 10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--ink)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasDailyUses}
              onChange={(e) => setHasDailyUses(e.target.checked)}
              style={{ width: '13px', height: '13px', margin: 0, cursor: 'pointer' }}
            />
            <span>Daily Uses (X / Day)</span>
          </label>
          {hasDailyUses && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '8.5px', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '1px' }}>Current:</span>
                <input
                  type="number"
                  value={dailyUsesCur}
                  onChange={(e) => setDailyUsesCur(parseInt(e.target.value) || 0)}
                  placeholder="Cur"
                  className="cinput"
                  style={{ width: '100%', fontSize: '11px', height: '24px', textAlign: 'center', fontWeight: 'bold', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '8.5px', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '1px' }}>Maximum:</span>
                <input
                  type="number"
                  value={dailyUsesMax}
                  onChange={(e) => setDailyUsesMax(parseInt(e.target.value) || 0)}
                  placeholder="Max"
                  className="cinput"
                  style={{ width: '100%', fontSize: '11px', height: '24px', textAlign: 'center', fontWeight: 'bold', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activation Section */}
      <div style={{ background: 'rgba(200, 169, 110, 0.1)', border: '1px solid rgba(200, 169, 110, 0.35)', borderRadius: '4px', padding: '8px 10px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasActivation ? '6px' : '0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)', cursor: 'pointer', letterSpacing: '0.02em' }}>
            <input
              type="checkbox"
              checked={hasActivation}
              onChange={(e) => setHasActivation(e.target.checked)}
              style={{ width: '13px', height: '13px', margin: 0, cursor: 'pointer' }}
            />
            <span>Usable / Activatable Item (Trigger Buff, Spell or Special Action)</span>
          </label>
        </div>

        {hasActivation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', borderTop: '1px solid rgba(200, 169, 110, 0.35)', paddingTop: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.6fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '2px', textTransform: 'uppercase' }}>
                  Action Type:
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="cinput"
                  style={{ width: '100%', fontSize: '11px', height: '26px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                >
                  <option value="standard">Standard Action</option>
                  <option value="swift">Swift Action</option>
                  <option value="free">Free Action</option>
                  <option value="full">Full-Round Action</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '2px', textTransform: 'uppercase' }}>
                  Cost Type:
                </label>
                <select
                  value={costType}
                  onChange={(e) => setCostType(e.target.value)}
                  className="cinput"
                  style={{ width: '100%', fontSize: '11px', height: '26px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                >
                  <option value="charges">Charges (Verbrauch)</option>
                  <option value="daily">Daily Uses (Tagesnutzung)</option>
                  <option value="unlimited">Unlimited / At Will</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '2px', textTransform: 'uppercase' }}>
                  Cost:
                </label>
                <input
                  type="number"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                  className="cinput"
                  style={{ width: '100%', fontSize: '11px', height: '26px', textAlign: 'center', fontWeight: 'bold', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '2px', textTransform: 'uppercase' }}>
                Linked Buff / Aura (Overview &amp; Buff Interface):
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
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
                    style={{ flex: 1, fontSize: '11px', height: '26px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                  >
                    {STANDARD_BUFF_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    <input
                      type="text"
                      value={appliedBuffKey}
                      onChange={(e) => setAppliedBuffKey(e.target.value)}
                      placeholder="e.g. invisibility, haste, custom_buff_key"
                      className="cinput"
                      style={{ flex: 1, fontSize: '11px', height: '26px', padding: '2px 6px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomBuffKey(false);
                        setAppliedBuffKey('');
                      }}
                      className="btn"
                      style={{
                        fontSize: '9.5px',
                        fontFamily: 'var(--font-title)',
                        padding: '2px 8px',
                        height: '26px',
                        background: 'rgba(200, 169, 110, 0.15)',
                        border: '1px solid var(--pb)',
                        borderRadius: '3px',
                        color: 'var(--inkm)',
                        cursor: 'pointer'
                      }}
                      title="Back to standard buff list"
                    >
                      Preset List
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: 'var(--inkm)', marginBottom: '2px', textTransform: 'uppercase' }}>
                Activation Description / Effect:
              </label>
              <input
                type="text"
                value={activationDesc}
                onChange={(e) => setActivationDesc(e.target.value)}
                placeholder="e.g. Grants Invisibility for 3 minutes when consumed."
                className="cinput"
                style={{ width: '100%', padding: '3px 6px', fontSize: '11px', height: '26px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--pb)', borderRadius: '3px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
