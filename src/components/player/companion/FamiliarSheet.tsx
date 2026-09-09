/**
 * @module    FamiliarSheet
 * @summary   Modern 2-column Familiar dashboard showing master bonus, vital stats, saving throws, attributes, attacks, and D&D 3.5e RAW traits.
 * @exports   FamiliarSheet
 * @reads     pc.familiarType, pc.familiarName, pc.familiarHP, pc.maxHP, pc.baseZa, pc.baseRef, pc.baseWil, pc.bab
 * @stateOps  CombatState.updatePCBatch
 * @depends   React, FamiliarRules, CombatState, dialogs
 */

import React, { useState } from 'react';
import { FamiliarRules } from '@core/rules/FamiliarRules.js';
import { CombatState } from '@core/state.js';
import { showRollBreakdown, showCustomConfirm } from '@core/ui/components/dialogs.js';
import { getAblMod, formatMod } from '../attributeHelper';
import { CompanionAbilityDetailsDialog, CompanionAbilityData } from '../../dialogs/companion/CompanionAbilityDetailsDialog';
import { getCompanionAbilityDetails } from './companionAbilitiesRules';

interface FamiliarSheetProps {
  pc: any;
  onUpdate: () => void;
}

export const FamiliarSheet: React.FC<FamiliarSheetProps> = ({ pc, onUpdate }) => {
  const [selectedAbility, setSelectedAbility] = useState<CompanionAbilityData | null>(null);
  const type = pc.familiarType || 'none';
  const name = pc.familiarName || '';

  const effectiveFamiliarLvl = FamiliarRules.calculateEffectiveFamiliarLevel(pc);
  const maxHP = Math.floor((pc.maxHP || 1) / 2);
  const curHP = pc.familiarHP !== undefined ? Math.min(maxHP, pc.familiarHP) : maxHP;

  const baseStats = FamiliarRules.getFamiliarBaseStats(type);

  const handleSpeciesChange = (newType: string) => {
    const oldType = pc.familiarType || 'none';
    if (oldType === newType) return;

    const applySpeciesChange = () => {
      CombatState.updatePCBatch((freshPC: any) => {
        // Old Toad HP bonus removal
        if (oldType === 'toad') {
          freshPC.maxHP = Math.max(1, (freshPC.maxHP || 0) - 3);
          freshPC.hp = Math.max(0, (freshPC.hp || 0) - 3);
        }
        // New Toad HP bonus application
        if (newType === 'toad') {
          freshPC.maxHP = (freshPC.maxHP || 0) + 3;
          freshPC.hp = (freshPC.hp || 0) + 3;
        }

        freshPC.familiarType = newType;

        if (newType !== 'none') {
          const base = FamiliarRules.getFamiliarBaseStats(newType);
          if (base) {
            freshPC.familiarName = base.name;
            const calculatedMaxHP = Math.floor((freshPC.maxHP || 1) / 2);
            freshPC.familiarHP = calculatedMaxHP;
          }
        } else {
          freshPC.familiarName = '';
          freshPC.familiarHP = 0;
        }
      });
      onUpdate();
    };

    if (oldType !== 'none' && newType === 'none') {
      showCustomConfirm(
        'Dismiss Familiar?',
        'Do you want to dismiss your familiar? According to RAW, this requires a saving throw to avoid experience point loss!',
        () => {
          applySpeciesChange();
        }
      );
    } else {
      applySpeciesChange();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    CombatState.updatePCBatch((activePC: any) => {
      activePC.familiarName = val;
    });
    onUpdate();
  };

  const handleHpCurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 0;
    CombatState.updatePCBatch((activePC: any) => {
      const computedMax = Math.floor((activePC.maxHP || 1) / 2);
      activePC.familiarHP = Math.max(0, Math.min(computedMax, val));
    });
    onUpdate();
  };

  const handleHpAdjust = (dir: number) => {
    CombatState.updatePCBatch((activePC: any) => {
      const computedMax = Math.floor((activePC.maxHP || 1) / 2);
      activePC.familiarHP = Math.max(0, Math.min(computedMax, (activePC.familiarHP || 0) + dir));
    });
    onUpdate();
  };

  const handleAttackRoll = (e: React.MouseEvent<HTMLButtonElement>, attName: string, bonus: number, _damage: string, _note: string) => {
    e.stopPropagation();
    const famName = pc.familiarName || 'Familiar';

    showRollBreakdown(`${famName} - ${attName}`, `1d20`, [
      { label: 'Attack Bonus (Dexterity/Size/Master BAB)', value: bonus }
    ], e.nativeEvent);
  };

  // ==========================================
  // EMPTY STATE: SUMMON FAMILIAR HERO CARD
  // ==========================================
  if (type === 'none') {
    const FAMILIAR_OPTIONS = [
      { key: 'bat', icon: '🦇', label: 'Bat (+3 Listen)' },
      { key: 'cat', icon: '🐈', label: 'Cat (+3 Move Silently)' },
      { key: 'hawk', icon: '🦅', label: 'Hawk (+3 Spot in light)' },
      { key: 'lizard', icon: '🦎', label: 'Lizard (+3 Climb)' },
      { key: 'owl', icon: '🦉', label: 'Owl (+3 Spot in shadows)' },
      { key: 'rat', icon: '🐀', label: 'Rat (+2 Fort Save)' },
      { key: 'raven', icon: '🐦', label: 'Raven (+3 Appraise / Speaks)' },
      { key: 'snake', icon: '🐍', label: 'Snake (+3 Bluff)' },
      { key: 'toad', icon: '🐸', label: 'Toad (+3 Max HP)' },
      { key: 'weasel', icon: '🦦', label: 'Weasel (+2 Ref Save)' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pb)', paddingBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: '11px', color: 'var(--red)', fontWeight: 'bold' }}>
            🦇 Arcane Familiar Sheet (Effective Level: {effectiveFamiliarLvl})
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
          <div style={{ fontSize: '28px' }}>🦇</div>
          <div>
            <strong style={{ fontFamily: 'var(--font-title)', fontSize: '12px', color: 'var(--ink)' }}>
              No Active Familiar Summoned
            </strong>
            <p style={{ fontSize: '9.5px', color: 'var(--inkl)', margin: '4px 0 0 0', maxWidth: '420px' }}>
              Choose an arcane familiar to summon. The familiar grants a permanent special bonus to its master, shares your saving throws and spell effects, and scales in intelligence and natural armor.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '520px', marginTop: '4px' }}>
            {FAMILIAR_OPTIONS.map((fam) => (
              <button
                key={fam.key}
                type="button"
                onClick={() => handleSpeciesChange(fam.key)}
                className="btn btn-p"
                style={{ fontSize: '9.5px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>{fam.icon}</span>
                <span>{fam.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE STATE: 2-COLUMN DASHBOARD
  // ==========================================
  const str = baseStats ? baseStats.str : 10;
  const dex = baseStats ? baseStats.dex : 10;
  const con = baseStats ? baseStats.con : 10;
  const wis = baseStats ? baseStats.wis : 10;
  const cha = baseStats ? baseStats.cha : 10;

  const natArmor = 1 + Math.floor((effectiveFamiliarLvl - 1) / 2);
  const displayAC = (baseStats ? baseStats.ac : 10) + natArmor;
  const displayInt = Math.min(15, 5 + Math.ceil(effectiveFamiliarLvl / 2));

  const pct = maxHP > 0 ? Math.max(0, Math.min(100, Math.floor((curHP / maxHP) * 100))) : 0;
  const fc = curHP <= 0 ? 'fill-dead' : (pct > 50 ? 'fill-ok' : (pct > 25 ? 'fill-warn' : 'fill-crit'));

  const masterFort = pc.baseZa ? pc.baseZa.base : 0;
  const masterRef = pc.baseRef ? pc.baseRef.base : 0;
  const masterWil = pc.baseWil ? pc.baseWil.base : 0;

  const famFort = Math.max(masterFort, 2) + getAblMod(con);
  const famRef = Math.max(masterRef, 2) + getAblMod(dex);
  const famWil = Math.max(masterWil, 0) + getAblMod(wis);

  const masterBab = pc.bab ? pc.bab.base : 0;
  const attacks = FamiliarRules.getFamiliarAttacks(type, masterBab, str, dex);

  const specialsList = ['Alertness (Feat to Master)', 'Improved Evasion (Ex)', 'Share Spells', 'Empathic Link (1 mile)'];
  if (effectiveFamiliarLvl >= 3) specialsList.push('Deliver Touch Spells');
  if (effectiveFamiliarLvl >= 5) specialsList.push('Speak with Master');
  if (effectiveFamiliarLvl >= 7) specialsList.push('Speak with Animals of its Kind');
  if (effectiveFamiliarLvl >= 11) specialsList.push(`Spell Resistance (SR ${effectiveFamiliarLvl + 5})`);
  if (effectiveFamiliarLvl >= 13) specialsList.push('Scry on Familiar (1/day)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Header & Identity Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--pb)', paddingBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🦇</span>
          <input
            type="text"
            className="familiar-name-field"
            value={name}
            onChange={handleNameChange}
            placeholder="Familiar Name"
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
            title="Edit Familiar Name"
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
            Effective Caster Level: {effectiveFamiliarLvl}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Species:</span>
          <select
            value={type}
            onChange={(e) => handleSpeciesChange(e.target.value)}
            className="cinput familiar-species-select"
            style={{ fontSize: '9.5px', height: '24px', padding: '0 6px', borderRadius: '3px' }}
          >
            <option value="bat">🦇 Bat</option>
            <option value="cat">🐈 Cat</option>
            <option value="hawk">🦅 Hawk</option>
            <option value="lizard">🦎 Lizard</option>
            <option value="owl">🦉 Owl</option>
            <option value="rat">🐀 Rat</option>
            <option value="raven">🐦 Raven</option>
            <option value="snake">🐍 Snake</option>
            <option value="toad">🐸 Toad</option>
            <option value="weasel">🦦 Weasel</option>
            <option value="none">❌ Dismiss Familiar</option>
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
                ❤️ Familiar Vitality (1/2 Master HP)
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
                  <button onClick={() => handleHpAdjust(-1)} className="btn familiar-hp-adjust-btn" style={{ fontSize: '9px', padding: '1px 6px', fontWeight: 'bold' }} title="Subtract 1 HP">-1</button>
                  <input
                    type="number"
                    className="familiar-hp-cur-field"
                    value={curHP}
                    onChange={handleHpCurChange}
                    style={{ width: '38px', fontSize: '10px', textAlign: 'center', height: '20px', padding: '0', borderRadius: '2px', border: '0.5px solid var(--pb)', fontWeight: 'bold' }}
                    title="Change current HP directly"
                  />
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>/ {maxHP}</span>
                  <button onClick={() => handleHpAdjust(1)} className="btn familiar-hp-adjust-btn" style={{ fontSize: '9px', padding: '1px 6px', fontWeight: 'bold' }} title="Add 1 HP">+1</button>
                  <button onClick={() => handleHpAdjust(5)} className="btn" style={{ fontSize: '8px', padding: '1px 5px', fontWeight: 'bold' }} title="Add 5 HP">+5</button>
                </div>
              </div>
            </div>
          </div>

          {/* Armor Class & Saving Throws Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '1px solid var(--pb)', borderRadius: '4px', padding: '6px', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)' }}>🛡️ ARMOR CLASS</span>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1.1 }}>{displayAC}</span>
              <span style={{ fontSize: '7px', color: 'var(--inkl)', fontStyle: 'italic' }}>(+{natArmor} Natural Armor)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(200, 169, 110, 0.1)', border: '1px solid var(--pb)', borderRadius: '4px', padding: '6px', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
              <span style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)' }}>🎲 SAVING THROWS</span>
              <div style={{ fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', lineHeight: 1.2, textAlign: 'center' }}>
                FORT: {formatMod(famFort)} • REF: {formatMod(famRef)}<br />
                WILL: {formatMod(famWil)}
              </div>
              <span style={{ fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>Uses master base saves</span>
            </div>
          </div>

          {/* Attributes Matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--pb)', borderRadius: '4px', padding: '8px' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', borderBottom: '0.5px solid var(--pb)', paddingBottom: '2px' }}>
              📊 Ability Scores (Intelligence scales with master)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {[
                { label: 'STR', val: str },
                { label: 'DEX', val: dex },
                { label: 'CON', val: con },
                { label: 'INT', val: displayInt },
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
          {/* Granted Master Bonus Card */}
          <div
            style={{
              background: 'rgba(200, 169, 110, 0.12)',
              border: '1px solid var(--pb)',
              borderRadius: '4px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)' }}>🔮 GRANTED MASTER BONUS</div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '12px', fontWeight: 'bold', color: 'var(--red)' }}>
                {baseStats?.bonus || 'None'}
              </div>
            </div>
            <span style={{ fontSize: '20px' }}>✨</span>
          </div>

          {/* Familiar Attacks Card */}
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
                ⚔️ Familiar Attacks (Uses Master BAB: +{masterBab})
              </span>
              <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>Click to roll attack</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {attacks.length > 0 ? (
                attacks.map((att: any, idx: number) => (
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
                      className="btn roll-familiar-attack-btn"
                      style={{ fontSize: '9px', padding: '3px 8px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '3px' }}
                    >
                      Roll 🎲
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                  No natural attacks listed for this familiar.
                </div>
              )}
            </div>
          </div>

          {/* Special Qualities Card */}
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
                🌟 Familiar Abilities (D&amp;D 3.5e RAW)
              </span>
              <span style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic' }}>Click for rule details</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
              {specialsList.map((trait) => (
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
                  className="familiar-ability-chip"
                  title={`Click to view rules for ${trait}`}
                >
                  ✦ {trait}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '8px', color: 'var(--inkl)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
              Familiars are magical beasts that treat their Hit Dice as equal to their master's character level for all effects related to HD.
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
