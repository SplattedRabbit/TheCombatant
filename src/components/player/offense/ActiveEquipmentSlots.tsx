/**
 * @module    ActiveEquipmentSlots
 * @summary   Renders the 3 active tactical combat slots: Main Hand, Off-Hand/Shield, and Class Combat Strike / ACF Slot (Smite, Sneak, Skirmish, Arcane Channeling, etc.).
 * @exports   ActiveEquipmentSlots
 * @reads     pc.activeShape, pc.weapons, pc.armor, pc.isTotalDefense, pc.isSmiteActive, pc.isFavoredEnemyActive, pc.isSneakAttacking, pc.classes, pc.dailyAbilities
 * @stateOps  CombatState.togglePCWeaponEquip, CombatState.togglePCArmorEquip, CombatState.updatePCField, CombatState.togglePCRage
 * @depends   React, @core/rules/AttackEngine.js, @core/models/Weapon.js, @core/state.js
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { AttackEngine } from '@core/rules/AttackEngine.js';
// @ts-ignore
import { WeaponRegistry, matchesFeatOption, getCritThreatDisplay } from '@core/models/Weapon.js';
// @ts-ignore
import { SHAPE_ATTACKS } from '@core/models/helpers/classes/DruidHelper.js';
// @ts-ignore
import { showCustomAlert } from '@core/ui/components/dialogs.js';

function isWeaponTwoHanded(w: any): boolean {
  if (!w) return false;
  const def = WeaponRegistry[w.type] || {};
  const isTwoHandedRanged = w.grip === 'rng' && (def.isBow || def.isComposite || w.type === 'light_crossbow' || w.type === 'heavy_crossbow' || w.type === 'other_ranged');
  return w.grip === '2h' || w.grip === '2H' || isTwoHandedRanged;
}

interface ActiveEquipmentSlotsProps {
  pc: any;
  mainHandWeapon: any;
  offHandWeapon: any;
  equippedShield: any;
  equippedArmor: any;
  isDoubleWielded: boolean;
  getRarityStyle: (enhancement: number) => { border: string; background: string; boxShadow: string; glowClass: string };
  formatMod: (val: number) => string;
  handleHandSelectChange: (idx: number, val: string) => void;
  handleRollAttack: (w: any, isOffhand: boolean, e: React.MouseEvent) => void;
  handleRollDamage: (w: any, isOffhand: boolean, e: React.MouseEvent) => void;
}

export const ActiveEquipmentSlots: React.FC<ActiveEquipmentSlotsProps> = ({
  pc,
  mainHandWeapon,
  offHandWeapon,
  equippedShield,
  isDoubleWielded,
  getRarityStyle,
  formatMod,
  handleHandSelectChange,
  handleRollAttack,
  handleRollDamage
}) => {

  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const paladinClass = activeClasses.find((c: any) => c.classType === 'paladin');
  const paladinLvl = paladinClass ? paladinClass.level : 0;
  
  const barbarianClass = activeClasses.find((c: any) => c.classType === 'barbarian');
  const barbarianLvl = barbarianClass ? barbarianClass.level : 0;

  const rangerClass = activeClasses.find((c: any) => c.classType === 'ranger');
  const rangerLvl = rangerClass ? rangerClass.level : 0;

  const duskbladeClass = activeClasses.find((c: any) => c.classType === 'duskblade');
  const scoutClass = activeClasses.find((c: any) => c.classType === 'scout');
  const ninjaClass = activeClasses.find((c: any) => c.classType === 'ninja');
  const knightClass = activeClasses.find((c: any) => c.classType === 'knight');
  const monkClass = activeClasses.find((c: any) => c.classType === 'monk');
  const bardClass = activeClasses.find((c: any) => c.classType === 'bard');

  const sneakAttackDice = typeof pc.getSneakAttackDiceCount === 'function' ? pc.getSneakAttackDiceCount() : 0;
  const favoredEnemyBonus = typeof pc.getFavoredEnemyBonus === 'function' ? pc.getFavoredEnemyBonus() : 0;

  const smiteAbility = Array.isArray(pc.dailyAbilities) 
    ? pc.dailyAbilities.find((a: any) => a.name === "Böses niederstrecken" || a.name === "Smite Evil")
    : null;
  const smiteMax = smiteAbility ? smiteAbility.max : 0;
  const smiteUsed = smiteAbility ? smiteAbility.used : 0;

  const getAblMod = (score: number) => Math.floor((score - 10) / 2);
  const chaValue = pc.cha ? (typeof pc.cha.getValue === 'function' ? pc.cha.getValue() : pc.cha) : 10;
  const chaMod = getAblMod(chaValue);

  // Render Left Slot: Main Hand
  const renderMainHandSlot = () => {
    const w = mainHandWeapon;
    const rStyle = getRarityStyle(w ? w.enhancement : 0);
    if (!w) {
      return (
        <div className="arpg-slot main-hand-slot" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '88px', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>⚔️</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>Main Hand</div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Unarmed)</div>
        </div>
      );
    }
    
    const seq = AttackEngine.calculateAttackSequence(pc, w, false, {
      smite: pc.isSmiteActive,
      favoredEnemy: pc.isFavoredEnemyActive,
      sneakAttack: pc.isSneakAttacking
    });
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
    const hasImprovedCritical = pc.feats && pc.feats.some((f: any) => 
      (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
      matchesFeatOption(w, f.option)
    );
    const isDoubleThreat = w.isNatural ? false : (w.isKeen || hasImprovedCritical);
    const doubledCritDisplay = w.isNatural ? 'x2' : getCritThreatDisplay(w.crit, isDoubleThreat);
    const dmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : (w.damage || '1w6');
    const extraDamage = w.extraDamage ? ` + ${w.extraDamage}` : '';

    return (
      <div className={`arpg-slot main-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '88px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
        <button className="unequip-slot-btn" onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Unequip">✕</button>
        <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>Main Hand</div>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={w.name}>{w.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0 3px' }}>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>{dmgDice}{extraDamage} • {doubledCritDisplay}</div>
          {w.type !== 'unarmed' && !isWeaponTwoHanded(w) && (
            <select
              className="cinput weapon-hand-select"
              value="main"
              onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
              style={{ fontSize: '7px', padding: '0 1px', height: '12px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', background: 'white', color: 'var(--ink)', marginTop: '1px', cursor: 'pointer' }}
            >
              <option value="main">Main Hand</option>
              <option value="off">Off-Hand</option>
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: '2px', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <button className="xbtn xbtn-dmg roll-atk-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollAttack(w, false, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }} title="Roll attack">
            ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲
          </button>
          <button className="xbtn xbtn-heal roll-dmg-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollDamage(w, false, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, borderColor: '#2a6a2a', color: '#1a4a1a', whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}>
            DMG ({formatMod(stdAtkObj.dmgTotal)})
          </button>
        </div>
      </div>
    );
  };

  // Render Middle Slot: Off-Hand (Shield or Off-hand Weapon)
  const renderOffHandSlot = () => {
    const w = offHandWeapon;
    const sh = equippedShield;
    const rStyle = getRarityStyle(sh ? sh.enhancement : (w ? w.enhancement : 0));

    if (!sh && !w) {
      return (
        <div className="arpg-slot off-hand-slot" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '88px', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>🛡️</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>Off-Hand</div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Empty)</div>
        </div>
      );
    }

    if (sh) {
      return (
        <div className={`arpg-slot off-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '88px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
          <button className="unequip-slot-btn" onClick={() => CombatState.togglePCArmorEquip(pc.armors.indexOf(sh))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Unequip">✕</button>
          <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>Off-Hand</div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={sh.name}>{sh.name}</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', marginTop: '2px', lineHeight: 1.2 }}>+{sh.armorBonus + sh.enhancement} AC (Shield)</div>
          <div style={{ fontSize: '6.5px', color: 'var(--inkm)', lineHeight: 1 }}>ACP: -{sh.checkPenalty ?? 0}</div>
        </div>
      );
    }

    // Weapon in Offhand
    const seq = AttackEngine.calculateAttackSequence(pc, w, false, {
      isOffhandAttack: true,
      smite: pc.isSmiteActive,
      favoredEnemy: pc.isFavoredEnemyActive,
      sneakAttack: pc.isSneakAttacking
    });
    const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
    const hasImprovedCritical = pc.feats && pc.feats.some((f: any) => 
      (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
      matchesFeatOption(w, f.option)
    );
    const isDoubleThreat = w.isKeen || hasImprovedCritical;
    const doubledCritDisplay = getCritThreatDisplay(w.crit, isDoubleThreat);
    const dmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : (w.damage || '1w6');
    const extraDamage = w.extraDamage ? ` + ${w.extraDamage}` : '';
    const offhandLabel = isDoubleWielded ? 'Off-Hand (Offhand)' : 'Off-Hand';

    return (
      <div className={`arpg-slot off-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '88px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
        <button className="unequip-slot-btn" onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Unequip">✕</button>
        <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>{offhandLabel}</div>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={isDoubleWielded ? w.name + ' (Offhand)' : w.name}>
          {isDoubleWielded ? w.name + ' (Offhand)' : w.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0 3px' }}>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>{dmgDice}{extraDamage} • {doubledCritDisplay}</div>
          {!isDoubleWielded && !isWeaponTwoHanded(w) && (
            <select
              className="cinput weapon-hand-select"
              value="off"
              onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
              style={{ fontSize: '7px', padding: '0 1px', height: '12px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', background: 'white', color: 'var(--ink)', marginTop: '1px', cursor: 'pointer' }}
            >
              <option value="main">Main Hand</option>
              <option value="off">Off-Hand</option>
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: '2px', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <button className="xbtn xbtn-dmg roll-atk-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollAttack(w, true, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }} title="Roll attack">
            ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲
          </button>
          <button className="xbtn xbtn-heal roll-dmg-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollDamage(w, true, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, borderColor: '#2a6a2a', color: '#1a4a1a', whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}>
            DMG ({formatMod(stdAtkObj.dmgTotal)})
          </button>
        </div>
      </div>
    );
  };

  // Render Right Slot: Dynamic Class Combat Ability & Strike Slot (Smite, Sneak, Skirmish, Arcane Channeling, etc.)
  const renderClassAbilitySlot = () => {
    const activeACFs: string[] = Array.isArray(pc.acfs) ? pc.acfs : [];
    const hasChargingSmite = activeACFs.includes('paladin_charging_smite');
    const hasDisruptiveAttack = activeACFs.includes('rogue_disruptive_attack');
    const hasBerserkerStrength = activeACFs.includes('barbarian_berserker_strength');
    const hasDistractingAttack = activeACFs.includes('ranger_distracting_attack');
    const hasDecisiveStrike = activeACFs.includes('monk_decisive_strike');

    // 1. Paladin (Smite Evil / Charging Smite ACF)
    if (paladinLvl > 0 || !!smiteAbility) {
      const isSmiteActive = !!pc.isSmiteActive;
      const smiteTitle = hasChargingSmite ? 'Charging Smite' : 'Smite Evil';
      const smiteDmgText = hasChargingSmite ? `+${paladinLvl * 2} (Charge)` : `+${paladinLvl}`;
      return (
        <div
          className={`arpg-slot class-ability-slot ${isSmiteActive ? 'rarity-epic' : ''}`}
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: isSmiteActive ? '1px solid #ff4444' : '0.5px solid var(--pb)',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: isSmiteActive ? 'rgba(139, 26, 26, 0.12)' : 'rgba(200, 169, 110, 0.04)',
            boxShadow: isSmiteActive ? '0 0 8px rgba(255, 50, 50, 0.25)' : 'none'
          }}
        >
          <div style={{ fontSize: '6.5px', color: 'var(--red)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            {hasChargingSmite ? '⚡ ACF Strike' : '🌟 Class Strike'}
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={smiteTitle}>
            {smiteTitle}
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            +{Math.max(0, chaMod)} Atk / {smiteDmgText} Dmg
          </div>

          {/* Charge Bubbles */}
          <div style={{ display: 'flex', gap: '2px', margin: '2px 0' }}>
            {Array.from({ length: Math.min(6, smiteMax) }).map((_, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  border: '1px solid var(--red)',
                  background: i < smiteUsed ? 'var(--red)' : 'transparent'
                }}
              />
            ))}
          </div>

          <button
            className={`xbtn ${isSmiteActive ? 'xbtn-dmg' : ''}`}
            onClick={() => CombatState.updatePCField('isSmiteActive', !isSmiteActive)}
            style={{
              padding: '1px 4px',
              fontSize: '6.5px',
              fontWeight: 'bold',
              width: '100%',
              height: '16px',
              lineHeight: 1,
              borderColor: 'var(--red)',
              color: isSmiteActive ? '#fff' : 'var(--red)',
              background: isSmiteActive ? 'var(--red)' : 'rgba(139, 26, 26, 0.08)',
              cursor: 'pointer'
            }}
          >
            {isSmiteActive ? '🌟 SMITE ON' : '🌟 SMITE OFF'}
          </button>
        </div>
      );
    }

    // 2. Sneak Attack Classes (Rogue, Assassin, Arcane Trickster, Mountebank)
    if (sneakAttackDice > 0) {
      const isSneakActive = !!pc.isSneakAttacking;
      return (
        <div
          className={`arpg-slot class-ability-slot ${isSneakActive ? 'rarity-rare' : ''}`}
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: isSneakActive ? '1px solid #27ae60' : '0.5px solid var(--pb)',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: isSneakActive ? 'rgba(39, 174, 96, 0.12)' : 'rgba(200, 169, 110, 0.04)',
            boxShadow: isSneakActive ? '0 0 8px rgba(39, 174, 96, 0.25)' : 'none'
          }}
        >
          <div style={{ fontSize: '6.5px', color: '#1e824c', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            🗡️ Class Strike
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: '#1e824c', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
            Sneak Attack
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            +{sneakAttackDice}d6 Damage (Flank)
          </div>

          <div style={{ fontSize: '6.5px', color: '#27ae60', fontStyle: 'italic' }}>
            {isSneakActive ? '✓ Added to damage roll' : 'Target denied Dex'}
          </div>

          <button
            className={`xbtn ${isSneakActive ? 'xbtn-heal' : ''}`}
            onClick={() => CombatState.updatePCField('isSneakAttacking', !isSneakActive)}
            style={{
              padding: '1px 4px',
              fontSize: '6.5px',
              fontWeight: 'bold',
              width: '100%',
              height: '16px',
              lineHeight: 1,
              borderColor: '#27ae60',
              color: isSneakActive ? '#fff' : '#1e824c',
              background: isSneakActive ? '#27ae60' : 'rgba(39, 174, 96, 0.08)',
              cursor: 'pointer'
            }}
          >
            {isSneakActive ? '🗡️ SNEAK ON' : '🗡️ SNEAK OFF'}
          </button>
        </div>
      );
    }

    // 3. Duskblade (Arcane Channeling)
    if (duskbladeClass) {
      return (
        <div
          className="arpg-slot class-ability-slot"
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: '0.5px solid #8e44ad',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: 'rgba(142, 68, 173, 0.05)'
          }}
        >
          <div style={{ fontSize: '6.5px', color: '#8e44ad', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            ⚡ Duskblade Strike
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9px', fontWeight: 'bold', color: '#8e44ad', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
            Arcane Channeling
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            Channel touch spell via melee strike
          </div>
          <div style={{ fontSize: '6.5px', color: '#8e44ad', fontStyle: 'italic' }}>
            Standard Action (Lvl 3+)
          </div>
          <button
            className="xbtn"
            onClick={() => showCustomAlert("Arcane Channeling", "At 3rd level, a duskblade can cast any touch spell and deliver it through a melee weapon with a standard attack.", "Understood", "⚡")}
            style={{ padding: '1px 4px', fontSize: '6.5px', fontWeight: 'bold', width: '100%', height: '16px', lineHeight: 1, borderColor: '#8e44ad', color: '#8e44ad', cursor: 'pointer' }}
          >
            ⚡ CHANNEL INFO
          </button>
        </div>
      );
    }

    // 4. Scout (Skirmish Attack)
    if (scoutClass) {
      const skirmishLvl = scoutClass.level;
      const skirmishDice = 1 + Math.floor((skirmishLvl - 1) / 4);
      const skirmishAC = 1 + Math.floor((skirmishLvl - 1) / 4);
      return (
        <div
          className="arpg-slot class-ability-slot"
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: '0.5px solid #d4ac0d',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: 'rgba(212, 172, 13, 0.05)'
          }}
        >
          <div style={{ fontSize: '6.5px', color: '#b7950b', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            🏃 Scout Strike
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9px', fontWeight: 'bold', color: '#b7950b', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
            Skirmish Attack
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            +{skirmishDice}d6 Dmg / +{skirmishAC} AC
          </div>
          <div style={{ fontSize: '6.5px', color: '#b7950b', fontStyle: 'italic' }}>
            When moved $\ge$ 10 ft
          </div>
          <button
            className="xbtn"
            onClick={() => CombatState.updatePCField('isSneakAttacking', !pc.isSneakAttacking)}
            style={{ padding: '1px 4px', fontSize: '6.5px', fontWeight: 'bold', width: '100%', height: '16px', lineHeight: 1, borderColor: '#d4ac0d', color: '#b7950b', cursor: 'pointer' }}
          >
            {pc.isSneakAttacking ? '🏃 SKIRMISH ON' : '🏃 SKIRMISH OFF'}
          </button>
        </div>
      );
    }

    // 5. Ninja (Sudden Strike)
    if (ninjaClass) {
      const ninjaDice = 1 + Math.floor((ninjaClass.level - 1) / 2);
      return (
        <div
          className="arpg-slot class-ability-slot"
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: '0.5px solid #34495e',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: 'rgba(52, 73, 94, 0.05)'
          }}
        >
          <div style={{ fontSize: '6.5px', color: '#2c3e50', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            🥷 Ninja Strike
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9px', fontWeight: 'bold', color: '#2c3e50', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
            Sudden Strike
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            +{ninjaDice}d6 (Target denied Dex)
          </div>
          <button
            className="xbtn"
            onClick={() => CombatState.updatePCField('isSneakAttacking', !pc.isSneakAttacking)}
            style={{ padding: '1px 4px', fontSize: '6.5px', fontWeight: 'bold', width: '100%', height: '16px', lineHeight: 1, borderColor: '#34495e', color: '#2c3e50', cursor: 'pointer' }}
          >
            {pc.isSneakAttacking ? '🥷 STRIKE ON' : '🥷 STRIKE OFF'}
          </button>
        </div>
      );
    }

    // 6. Barbarian (Rage / Berserker Strength ACF)
    if (barbarianLvl > 0) {
      const barbTitle = hasBerserkerStrength ? 'Berserker Strength' : 'Kampfrausch (Rage)';
      const barbSubtitle = hasBerserkerStrength ? 'Auto when HP < ' + (5 * barbarianLvl) : '+4 STR / +4 CON / -2 AC';
      return (
        <div
          className={`arpg-slot class-ability-slot ${pc.isRaging ? 'rarity-epic' : ''}`}
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: pc.isRaging ? '1px solid var(--red)' : '0.5px solid var(--pb)',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: pc.isRaging ? 'rgba(139, 26, 26, 0.12)' : 'rgba(200, 169, 110, 0.04)'
          }}
        >
          <div style={{ fontSize: '6.5px', color: 'var(--red)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            {hasBerserkerStrength ? '⚡ ACF Berserk' : '🔥 Barbarian'}
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={barbTitle}>
            {barbTitle}
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            {barbSubtitle}
          </div>
          {hasBerserkerStrength ? (
            <button
              className="xbtn"
              onClick={() => showCustomAlert("Berserker Strength", "Whenever your current HP is below 5 × Barbarian level, you automatically gain +4 STR, +2 on all saves, DR 2/—, and -2 AC.", "Understood", "⚡")}
              style={{ padding: '1px 4px', fontSize: '6.5px', fontWeight: 'bold', width: '100%', height: '16px', lineHeight: 1, borderColor: 'var(--red)', color: 'var(--red)', cursor: 'pointer' }}
            >
              ⚡ BERSERK INFO
            </button>
          ) : (
            <button
              className={`xbtn ${pc.isRaging ? 'xbtn-dmg' : ''}`}
              onClick={() => CombatState.togglePCRage()}
              style={{ padding: '1px 4px', fontSize: '6.5px', fontWeight: 'bold', width: '100%', height: '16px', lineHeight: 1, borderColor: 'var(--red)', color: pc.isRaging ? '#fff' : 'var(--red)', background: pc.isRaging ? 'var(--red)' : 'transparent', cursor: 'pointer' }}
            >
              {pc.isRaging ? '🔴 END RAGE' : '🔥 RAGE ON'}
            </button>
          )}
        </div>
      );
    }

    // 7. Ranger (Favored Enemy / Distracting Attack ACF)
    if (rangerLvl > 0 || favoredEnemyBonus > 0) {
      return (
        <div
          className="arpg-slot class-ability-slot"
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: pc.isFavoredEnemyActive ? '1px solid #2a6a8a' : '0.5px solid var(--pb)',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: pc.isFavoredEnemyActive ? 'rgba(42, 106, 138, 0.12)' : 'rgba(200, 169, 110, 0.04)'
          }}
        >
          <div style={{ fontSize: '6.5px', color: '#2a6a8a', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            {hasDistractingAttack ? '⚡ ACF Ranger' : '🏹 Ranger'}
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: '#2a6a8a', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
            Favored Enemy
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            +{favoredEnemyBonus} Damage {hasDistractingAttack ? '(Flanks)' : 'Bonus'}
          </div>
          <button
            className="xbtn"
            onClick={() => CombatState.updatePCField('isFavoredEnemyActive', !pc.isFavoredEnemyActive)}
            style={{ padding: '1px 4px', fontSize: '6.5px', fontWeight: 'bold', width: '100%', height: '16px', lineHeight: 1, borderColor: '#2a6a8a', color: pc.isFavoredEnemyActive ? '#fff' : '#2a6a8a', background: pc.isFavoredEnemyActive ? '#2a6a8a' : 'transparent', cursor: 'pointer' }}
          >
            {pc.isFavoredEnemyActive ? '🏹 FE ACTIVE' : '🏹 FE OFF'}
          </button>
        </div>
      );
    }

    // 8. Monk (Flurry of Blows / Decisive Strike ACF)
    if (monkClass) {
      const isFlurryActive = !!pc.isFlurrying;
      const monkLvl = monkClass.level || 0;
      const flurryExtraAttacks = monkLvl >= 11 ? 2 : 1;
      const flurryPenalty = monkLvl >= 9 ? 0 : (monkLvl >= 5 ? -1 : -2);

      if (hasDecisiveStrike) {
        return (
          <div
            className="arpg-slot class-ability-slot"
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '88px',
              border: '0.5px solid var(--pb)',
              borderRadius: '4px',
              padding: '5px 6px',
              textAlign: 'center',
              background: 'rgba(200, 169, 110, 0.04)'
            }}
          >
            <div style={{ fontSize: '6.5px', color: 'var(--ink)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
              ⚡ ACF Strike
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
              Decisive Strike
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
              2x Damage Strike
            </div>
            <button
              className="xbtn"
              onClick={() => showCustomAlert("Decisive Strike", "Decisive Strike (PHB2): Full-round action to deliver a single strike for double damage.", "Understood", "🥋")}
              style={{ padding: '1px 4px', fontSize: '6.5px', fontWeight: 'bold', width: '100%', height: '16px', lineHeight: 1, borderColor: 'var(--pb)', color: 'var(--ink)', cursor: 'pointer' }}
            >
              🥋 STRIKE INFO
            </button>
          </div>
        );
      }

      return (
        <div
          className={`arpg-slot class-ability-slot ${isFlurryActive ? 'rarity-epic' : ''}`}
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: isFlurryActive ? '1px solid var(--red)' : '0.5px solid var(--pb)',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: isFlurryActive ? 'rgba(139, 26, 26, 0.12)' : 'rgba(200, 169, 110, 0.04)',
            boxShadow: isFlurryActive ? '0 0 8px rgba(139, 26, 26, 0.25)' : 'none'
          }}
        >
          <div style={{ fontSize: '6.5px', color: 'var(--red)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            🥋 Monk Flurry
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
            Flurry of Blows
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            +{flurryExtraAttacks} Extra Atk {flurryPenalty !== 0 ? `(${flurryPenalty})` : '(No Pen)'}
          </div>
          <div style={{ fontSize: '6.5px', color: isFlurryActive ? 'var(--red)' : 'var(--inkl)', fontStyle: 'italic' }}>
            {isFlurryActive ? '✓ Applied on Full Attack' : 'Full Attack only'}
          </div>
          <button
            className={`xbtn ${isFlurryActive ? 'xbtn-dmg' : ''}`}
            onClick={() => CombatState.updatePCField('isFlurrying', !isFlurryActive)}
            style={{
              padding: '1px 4px',
              fontSize: '6.5px',
              fontWeight: 'bold',
              width: '100%',
              height: '16px',
              lineHeight: 1,
              borderColor: 'var(--red)',
              color: isFlurryActive ? '#fff' : 'var(--red)',
              background: isFlurryActive ? 'var(--red)' : 'rgba(139, 26, 26, 0.08)',
              cursor: 'pointer'
            }}
          >
            {isFlurryActive ? '🥋 FLURRY ON' : '🥋 FLURRY OFF'}
          </button>
        </div>
      );
    }

    // 9. Bard (Inspire Courage)
    if (bardClass) {
      const isBardActive = !!pc.isBardInspireActive;
      let inspireBonus = 1;
      const bLvl = bardClass.level || 0;
      if (bLvl >= 20) inspireBonus = 4;
      else if (bLvl >= 14) inspireBonus = 3;
      else if (bLvl >= 8) inspireBonus = 2;

      return (
        <div
          className={`arpg-slot class-ability-slot ${isBardActive ? 'rarity-rare' : ''}`}
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: isBardActive ? '1px solid #c8a96e' : '0.5px solid var(--pb)',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: isBardActive ? 'rgba(200, 169, 110, 0.15)' : 'rgba(200, 169, 110, 0.04)',
            boxShadow: isBardActive ? '0 0 8px rgba(200, 169, 110, 0.3)' : 'none'
          }}
        >
          <div style={{ fontSize: '6.5px', color: '#8a6d3b', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            🎵 Bardic Music
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
            Inspire Courage
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            +{inspireBonus} Morale Atk &amp; Dmg
          </div>
          <div style={{ fontSize: '6.5px', color: isBardActive ? '#8a6d3b' : 'var(--inkl)', fontStyle: 'italic' }}>
            {isBardActive ? '✓ Active on Atk & Dmg' : 'Self & Allies'}
          </div>
          <button
            className="xbtn"
            onClick={() => CombatState.updatePCField('isBardInspireActive', !isBardActive)}
            style={{
              padding: '1px 4px',
              fontSize: '6.5px',
              fontWeight: 'bold',
              width: '100%',
              height: '16px',
              lineHeight: 1,
              borderColor: '#c8a96e',
              color: isBardActive ? '#fff' : '#8a6d3b',
              background: isBardActive ? '#c8a96e' : 'rgba(200, 169, 110, 0.08)',
              cursor: 'pointer'
            }}
          >
            {isBardActive ? '🎵 INSPIRE ON' : '🎵 INSPIRE OFF'}
          </button>
        </div>
      );
    }

    // 10. Knight (Knight's Challenge)
    if (knightClass) {
      return (
        <div
          className="arpg-slot class-ability-slot"
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '88px',
            border: '0.5px solid #2980b9',
            borderRadius: '4px',
            padding: '5px 6px',
            textAlign: 'center',
            background: 'rgba(41, 128, 185, 0.05)'
          }}
        >
          <div style={{ fontSize: '6.5px', color: '#2980b9', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
            🛡️ Knight Challenge
          </div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9px', fontWeight: 'bold', color: '#2980b9', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
            Fighting Challenge
          </div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
            +1 Morale Atk &amp; Dmg
          </div>
          <button
            className="xbtn"
            onClick={() => showCustomAlert("Fighting Challenge", "Grants +1 morale bonus on attack rolls and weapon damage against designated foes (PHB2).", "Understood", "🛡️")}
            style={{ padding: '1px 4px', fontSize: '6.5px', fontWeight: 'bold', width: '100%', height: '16px', lineHeight: 1, borderColor: '#2980b9', color: '#2980b9', cursor: 'pointer' }}
          >
            🛡️ CHALLENGE
          </button>
        </div>
      );
    }

    // Default / Fighter / Caster fallback
    return (
      <div
        className="arpg-slot class-ability-slot"
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '88px',
          border: '0.5px dashed var(--pb)',
          borderRadius: '4px',
          padding: '5px 6px',
          textAlign: 'center',
          background: 'rgba(200, 169, 110, 0.02)'
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>🎯</div>
        <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>Combat Stance</div>
        <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>Standard Strike</div>
      </div>
    );
  };

  if (pc.activeShape !== 'none') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ background: 'rgba(200, 169, 110, 0.04)', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '8px 10px', textAlign: 'center', fontStyle: 'italic', color: 'var(--inkl)', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', marginBottom: '8px' }}>
          In Wild Shape, manufactured weapons are inactive. Use your natural weapons.
        </div>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--inkl)', paddingBottom: '2px', borderBottom: '0.5px solid var(--pb)', marginBottom: '4px', fontWeight: 'bold' }}>
          🐾 Natural Attacks (Wild Shape)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(SHAPE_ATTACKS[pc.activeShape] || []).map((atk: any, idx: number) => {
            const w = {
              name:        atk.name,
              damageDice:  atk.damageDice,
              damage:      atk.damageDice,
              enhancement: 0,
              attackBonus: 0,
              isNatural:   true,
              isSecondary: atk.isSecondary,
              grip:        'unarmed',
              crit:        '20 / x2',
              type:        'unarmed'
            };
            const seq = AttackEngine.calculateAttackSequence(pc, w, false, {
              smite: pc.isSmiteActive,
              favoredEnemy: pc.isFavoredEnemyActive,
              sneakAttack: pc.isSneakAttacking
            });
            const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0 };
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', fontSize: '8.5px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>{w.name}</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button className="xbtn xbtn-dmg roll-atk-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollAttack(w, false, e)} style={{ padding: '1px 3px', fontSize: '7px', fontWeight: 'bold' }}>
                    ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲
                  </button>
                  <button className="xbtn xbtn-heal roll-dmg-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollDamage(w, false, e)} style={{ padding: '1px 3px', fontSize: '7px', fontWeight: 'bold' }}>
                    DMG ({formatMod(stdAtkObj.dmgTotal)})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
      {renderMainHandSlot()}
      {renderOffHandSlot()}
      {renderClassAbilitySlot()}
    </div>
  );
};
