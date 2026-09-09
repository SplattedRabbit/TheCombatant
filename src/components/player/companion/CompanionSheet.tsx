/**
 * @module    CompanionSheet
 * @summary   Modern 2-column Animal Companion dashboard showing vital stats, attributes, natural attacks, and D&D 3.5e RAW tricks.
 * @exports   CompanionSheet
 * @reads     pc.companionType, pc.companionName, pc.companionHP, pc.companionMaxHP
 * @stateOps  CombatState.updatePCBatch
 * @depends   React, CompanionRules, CombatState, dialogs
 */

import React, { useState } from 'react';
import { CompanionRules } from '@core/rules/CompanionRules.js';
import { CombatState } from '@core/state.js';
import { showRollBreakdown } from '@core/ui/components/dialogs.js';
import { getAblMod, formatMod } from '../attributeHelper';
import { CompanionAbilityDetailsDialog, CompanionAbilityData } from '../../dialogs/companion/CompanionAbilityDetailsDialog';
import { getCompanionAbilityDetails } from './companionAbilitiesRules';

interface CompanionSheetProps {
  pc: any;
  onUpdate: () => void;
}

export const CompanionSheet: React.FC<CompanionSheetProps> = ({ pc, onUpdate }) => {
  const [selectedAbility, setSelectedAbility] = useState<CompanionAbilityData | null>(null);
  const type = pc.companionType || 'none';
  const name = pc.companionName || '';
  const curHP = pc.companionHP || 0;
  const maxHP = pc.companionMaxHP || 0;

  const effectiveDruidLvl = CompanionRules.calculateEffectiveDruidLevel(pc);
  const baseStats = CompanionRules.getCompanionBaseStats(type, effectiveDruidLvl);

  const handleSpeciesChange = (newType: string) => {
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionType = newType;

      if (newType !== 'none') {
        const base = CompanionRules.getCompanionBaseStats(newType, activePC.level);
        if (base) {
          activePC.companionName = base.name;
          activePC.companionMaxHP = base.maxHP;
          activePC.companionHP = base.maxHP;
        }
      } else {
        activePC.companionName = '';
        activePC.companionMaxHP = 0;
        activePC.companionHP = 0;
      }
    });
    onUpdate();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionName = val;
    });
    onUpdate();
  };

  const handleHpCurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 0;
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionHP = Math.max(0, Math.min(activePC.companionMaxHP || 0, val));
    });
    onUpdate();
  };

  const handleHpMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 1;
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionMaxHP = val;
      activePC.companionHP = Math.min(activePC.companionHP || 0, val);
    });
    onUpdate();
  };

  const handleHpAdjust = (dir: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      activePC.companionHP = Math.max(0, Math.min(activePC.companionMaxHP || 0, (activePC.companionHP || 0) + dir));
    });
    onUpdate();
  };

  const handleAttackRoll = (e: React.MouseEvent<HTMLButtonElement>, attName: string, bonus: number, _damage: string, _note: string) => {
    e.stopPropagation();
    const compName = pc.companionName || 'Animal Companion';

    showRollBreakdown(`${compName} - ${attName}`, `1d20`, [
      { label: 'Attack Bonus (Strength/Size)', value: bonus }
    ], e.nativeEvent);
  };

  // ==========================================
  // EMPTY STATE: SUMMON COMPANION HERO CARD
  // ==========================================
  if (type === 'none') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pb)', paddingBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', color: 'var(--red)', fontWeight: 'bold' }}>
            🐾 Animal Companion &amp; Mount (Effective Level: {effectiveDruidLvl})
          </span>
          <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>D&amp;D 3.5e RAW Rules</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            background: 'rgba(200, 169, 110, 0.05)',
            border: '1px dashed var(--pb)',
            borderRadius: '4px',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px' }}>🐾</div>
          <div>
            <strong style={{ fontFamily: 'var(--font-title)', fontSize: '12px', color: 'var(--ink)' }}>
              No Active Animal Companion
            </strong>
            <p style={{ fontSize: '9.5px', color: 'var(--inkl)', margin: '4px 0 0 0', maxWidth: '420px' }}>
              Choose a loyal beast companion to summon. The companion automatically scales its Hit Dice, Natural Armor, Strength/Dexterity, and Bonus Tricks with your effective druid/ranger level.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => handleSpeciesChange('wolf')}
              className="btn btn-p"
              style={{ fontSize: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🐺</span>
              <span>Wolf (Trip &amp; Track)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSpeciesChange('leopard')}
              className="btn btn-p"
              style={{ fontSize: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🐆</span>
              <span>Leopard (Pounce &amp; Rake)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSpeciesChange('bear')}
              className="btn btn-p"
              style={{ fontSize: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🐻</span>
              <span>Brown Bear (Huge Power)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSpeciesChange('custom')}
              className="btn"
              style={{ fontSize: '10px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🛡️</span>
              <span>Custom Companion</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE STATE: 2-COLUMN DASHBOARD
  // ==========================================
  const displayAC = type === 'custom' ? maxHP : (baseStats ? baseStats.ac : 10);
  const str = baseStats ? baseStats.str : 10;
  const dex = baseStats ? baseStats.dex : 10;
  const con = baseStats ? baseStats.con : 10;
  const wis = baseStats ? baseStats.wis : 10;
  const cha = baseStats ? baseStats.cha : 10;

  const pct = maxHP > 0 ? Math.max(0, Math.min(100, Math.floor((curHP / maxHP) * 100))) : 0;
  const fc = curHP <= 0 ? 'fill-dead' : (pct > 50 ? 'fill-ok' : (pct > 25 ? 'fill-warn' : 'fill-crit'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Header & Identity Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pb)', paddingBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🐾</span>
          <input
            type="text"
            className="companion-name-field"
            value={name}
            onChange={handleNameChange}
            placeholder="Companion Name"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'var(--red)',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px dashed var(--pb)',
              outline: 'none',
              minWidth: '160px',
            }}
            title="Edit Companion Name"
          />
          <span
            style={{
              fontSize: '9px',
              fontFamily: 'var(--font-title)',
              color: 'var(--inkl)',
              background: 'rgba(200, 169, 110, 0.15)',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '0.5px solid var(--pb)',
            }}
          >
            Effective Druid Level: {effectiveDruidLvl}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Species:</span>
          <select
            value={type}
            onChange={(e) => handleSpeciesChange(e.target.value)}
            className="cinput companion-species-select"
            style={{ fontSize: '9.5px', height: '24px', padding: '0 6px', borderRadius: '3px' }}
          >
            <option value="wolf">🐺 Wolf</option>
            <option value="leopard">🐆 Leopard</option>
            <option value="bear">🐻 Brown Bear</option>
            <option value="custom">🛡️ Custom</option>
            <option value="none">❌ Dismiss Companion</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px', alignItems: 'start' }}>
        {/* ========================================== */}
        {/* COLUMN 1: VITALS, DEFENSES & ATTRIBUTES    */}
        {/* ========================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Health & Hit Points Card */}
          <div
            style={{
              background: 'rgba(200, 169, 110, 0.06)',
              border: '1px solid var(--pb)',
              borderRadius: '4px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '10.5px', fontWeight: 'bold', color: 'var(--red)' }}>
                ❤️ Companion Vitality
              </span>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--inkm)' }}>{pct}% HP</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Circular HP Badge */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%)',
                  border: '1.5px solid var(--red)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontFamily: 'var(--font-title)',
                  color: 'var(--red)',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              >
                <span style={{ fontSize: '7px', color: 'var(--inkl)', lineHeight: 1 }}>HP</span>
                <span style={{ lineHeight: 1.1, fontSize: '13px', fontWeight: 'bold' }}>{curHP}</span>
              </div>

              {/* Progress Bar & Inputs */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ height: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '2px', overflow: 'hidden', border: '0.5px solid var(--pb)' }}>
                  <div className={`hp-bar-fill ${fc}`} style={{ width: `${pct}%`, height: '100%', transition: 'width 0.2s' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button onClick={() => handleHpAdjust(-5)} className="btn" style={{ fontSize: '8px', padding: '1px 5px', fontWeight: 'bold' }} title="Subtract 5 HP">-5</button>
                  <button onClick={() => handleHpAdjust(-1)} className="btn companion-hp-adjust-btn" style={{ fontSize: '9px', padding: '1px 6px', fontWeight: 'bold' }} title="Subtract 1 HP">-1</button>
                  <input
                    type="number"
                    className="companion-hp-cur-field"
                    value={curHP}
                    onChange={handleHpCurChange}
                    style={{ width: '38px', fontSize: '10px', textAlign: 'center', height: '20px', padding: '0', borderRadius: '2px', border: '0.5px solid var(--pb)', fontWeight: 'bold' }}
                    title="Change current HP directly"
                  />
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>/</span>
                  <input
                    type="number"
                    className="companion-hp-max-field"
                    value={maxHP}
                    onChange={handleHpMaxChange}
                    style={{ width: '38px', fontSize: '10px', textAlign: 'center', height: '20px', padding: '0', borderRadius: '2px', border: '0.5px solid var(--pb)', fontWeight: 'bold' }}
                    title="Change max HP directly"
                  />
                  <button onClick={() => handleHpAdjust(1)} className="btn companion-hp-adjust-btn" style={{ fontSize: '9px', padding: '1px 6px', fontWeight: 'bold' }} title="Add 1 HP">+1</button>
                  <button onClick={() => handleHpAdjust(5)} className="btn" style={{ fontSize: '8px', padding: '1px 5px', fontWeight: 'bold' }} title="Add 5 HP">+5</button>
                </div>
              </div>
            </div>
          </div>

          {/* Armor Class & Movement Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '1px solid var(--pb)', borderRadius: '4px', padding: '6px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)' }}>🛡️ ARMOR CLASS</span>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1.1 }}>{displayAC}</span>
              <span style={{ fontSize: '7px', color: 'var(--inkl)', fontStyle: 'italic' }}>Includes Nat. Armor &amp; Dex</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '1px solid var(--pb)', borderRadius: '4px', padding: '6px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)' }}>🏃 BASE SPEED</span>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1.1 }}>{baseStats?.speed || '30 ft.'}</span>
              <span style={{ fontSize: '7px', color: 'var(--inkl)', fontStyle: 'italic' }}>Land Movement</span>
            </div>
          </div>

          {/* Attributes Matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--pb)', borderRadius: '4px', padding: '8px' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', borderBottom: '0.5px solid var(--pb)', paddingBottom: '2px' }}>
              📊 Ability Scores
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {[
                { label: 'STR', val: str },
                { label: 'DEX', val: dex },
                { label: 'CON', val: con },
                { label: 'INT', val: 2 },
                { label: 'WIS', val: wis },
                { label: 'CHA', val: cha },
              ].map((stat) => (
                <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '4px 2px' }}>
                  <span style={{ fontSize: '7.5px', fontWeight: 'bold', color: 'var(--inkl)' }}>{stat.label}</span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)' }}>{stat.val}</span>
                  <span style={{ fontSize: '8px', color: 'var(--inkm)', fontWeight: 'bold' }}>{formatMod(getAblMod(stat.val))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUMN 2: ATTACKS, TRICKS & SPECIAL RULES  */}
        {/* ========================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Natural Attacks Card */}
          <div
            style={{
              background: 'rgba(200, 169, 110, 0.06)',
              border: '1px solid var(--pb)',
              borderRadius: '4px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '10.5px', color: 'var(--red)', fontWeight: 'bold' }}>
                ⚔️ Companion Attacks &amp; Actions
              </span>
              <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>Click to roll attack</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {baseStats && Array.isArray(baseStats.attacks) && baseStats.attacks.length > 0 ? (
                baseStats.attacks.map((att: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(200, 169, 110, 0.08)',
                      border: '0.5px solid var(--pb)',
                      borderRadius: '3px',
                      padding: '6px 8px',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '10px', color: 'var(--ink)' }}>{att.name}:</strong>{' '}
                      <span style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: '10px' }}>{formatMod(att.bonus)}</span>{' '}
                      <span style={{ fontSize: '9.5px', color: 'var(--inkm)' }}>({att.damage})</span>
                      {att.note && (
                        <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginTop: '1px' }}>
                          • {att.note}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAttackRoll(e, att.name, att.bonus, att.damage, att.note || '')}
                      className="btn roll-companion-attack-btn"
                      style={{ fontSize: '9px', padding: '3px 8px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '3px' }}
                    >
                      Roll 🎲
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                  No natural attacks listed for this species.
                </div>
              )}
            </div>
          </div>

          {/* Special Qualities & Tricks Card */}
          <div
            style={{
              background: 'rgba(200, 169, 110, 0.06)',
              border: '1px solid var(--pb)',
              borderRadius: '4px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3px' }}>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '10.5px', color: 'var(--red)', fontWeight: 'bold' }}>
                🌟 Special Qualities &amp; Animal Tricks (D&amp;D 3.5e RAW)
              </span>
              <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>Click for rule details</span>
            </div>

            {baseStats?.specials && (
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', fontSize: '9px', color: 'var(--ink)' }}>
                <strong>🐾 Innate:</strong>
                {baseStats.specials.split(',').map((item: string) => {
                  const cleaned = item.trim().replace(/\.$/, '');
                  if (!cleaned) return null;
                  return (
                    <button
                      key={cleaned}
                      type="button"
                      onClick={() => setSelectedAbility(getCompanionAbilityDetails(cleaned))}
                      style={{
                        fontSize: '8px',
                        background: 'rgba(200, 169, 110, 0.12)',
                        border: '0.5px solid var(--pb)',
                        padding: '2px 5px',
                        borderRadius: '3px',
                        color: 'var(--inkm)',
                        cursor: 'pointer',
                      }}
                      className="companion-innate-chip"
                      title={`Click to view rules for ${cleaned}`}
                    >
                      {cleaned}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
              {['Link (Ex)', 'Share Spells (Ex)', ...(effectiveDruidLvl >= 3 ? ['Evasion (Ex)'] : []), ...(effectiveDruidLvl >= 6 ? ['Devotion (Ex)'] : []), ...(effectiveDruidLvl >= 9 ? ['Multiattack'] : [])].map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => setSelectedAbility(getCompanionAbilityDetails(trait))}
                  style={{
                    fontSize: '8px',
                    background: 'rgba(200, 169, 110, 0.18)',
                    border: '0.5px solid var(--pb)',
                    padding: '3px 7px',
                    borderRadius: '3px',
                    color: 'var(--red)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                  className="companion-ability-chip"
                  title={`Click to view rules for ${trait}`}
                >
                  ✦ {trait}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '8px', color: 'var(--inkl)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
              Animal companions gain bonus HD, +Natural Armor, Str/Dex increases, and bonus trick slots as your druid or ranger level increases.
            </p>
          </div>
        </div>
      </div>

      {/* RAW Rules Details Modal */}
      {selectedAbility && (
        <CompanionAbilityDetailsDialog
          ability={selectedAbility}
          onClose={() => setSelectedAbility(null)}
        />
      )}
    </div>
  );
};
