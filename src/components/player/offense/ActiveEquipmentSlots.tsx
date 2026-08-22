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
import { getAblMod } from '../attributeHelper';

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
      <div className={`arpg-slot main-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '88px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
        <button className="unequip-slot-btn" onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Unequip">✕</button>
        <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>⚔️ Main Hand</div>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={w.name}>{w.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0', fontSize: '7px', color: 'var(--inkm)' }}>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>{dmgDice}${extraDamage} • {doubledCritDisplay}</div>
          {w.type !== 'unarmed' && !isWeaponTwoHanded(w) && (
            <select
              className="cinput weapon-hand-select"
              value="main"
              onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
              style={{ fontSize: '6.5px', padding: '0 1px', height: '12px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', background: 'white', color: 'var(--ink)', cursor: 'pointer' }}
            >
              <option value="main">Main</option>
              <option value="off">Off</option>
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
          <button
            className="xbtn xbtn-atk"
            disabled={pc.isTotalDefense}
            onClick={(e) => handleRollAttack(w, false, e)}
            style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}
            title={`Roll Attack (${formatMod(stdAtkObj.atkTotal)})`}
          >
            ATK {formatMod(stdAtkObj.atkTotal)}
          </button>
          <button
            className="xbtn xbtn-dmg"
            disabled={pc.isTotalDefense}
            onClick={(e) => handleRollDamage(w, false, e)}
            style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}
            title={`Roll Damage (${dmgDice}${extraDamage} ${formatMod(stdAtkObj.dmgTotal)})`}
          >
            DMG {formatMod(stdAtkObj.dmgTotal)}
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
        <div className={`arpg-slot off-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '88px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
          <button className="unequip-slot-btn" onClick={() => CombatState.togglePCArmorEquip(pc.armors.indexOf(sh))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Unequip">✕</button>
          <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>🛡️ Off-Hand</div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={sh.name}>{sh.name}</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.1 }}>+{sh.armorBonus + sh.enhancement} AC (Shield)</div>
          <div style={{ fontSize: '6.5px', color: 'var(--inkm)', lineHeight: 1, fontStyle: 'italic' }}>ACP: -{sh.checkPenalty ?? 0}</div>
          <div style={{ width: '100%', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6.5px', color: 'var(--inkl)', fontStyle: 'italic' }}>🛡️ Guarding</div>
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
    const offhandLabel = isDoubleWielded ? '⚔️ Off-Hand (2nd)' : '⚔️ Off-Hand';

    return (
      <div className={`arpg-slot off-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: '88px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
        <button className="unequip-slot-btn" onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Unequip">✕</button>
        <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>{offhandLabel}</div>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={isDoubleWielded ? w.name + ' (Offhand)' : w.name}>
          {isDoubleWielded ? w.name + ' (Offhand)' : w.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0', fontSize: '7px', color: 'var(--inkm)' }}>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>{dmgDice}${extraDamage} • {doubledCritDisplay}</div>
          {!isDoubleWielded && !isWeaponTwoHanded(w) && (
            <select
              className="cinput weapon-hand-select"
              value="off"
              onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
              style={{ fontSize: '6.5px', padding: '0 1px', height: '12px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', background: 'white', color: 'var(--ink)', cursor: 'pointer' }}
            >
              <option value="main">Main</option>
              <option value="off">Off</option>
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
          <button
            className="xbtn xbtn-atk"
            disabled={pc.isTotalDefense}
            onClick={(e) => handleRollAttack(w, true, e)}
            style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}
            title={`Roll Attack (${formatMod(stdAtkObj.atkTotal)})`}
          >
            ATK {formatMod(stdAtkObj.atkTotal)}
          </button>
          <button
            className="xbtn xbtn-dmg"
            disabled={pc.isTotalDefense}
            onClick={(e) => handleRollDamage(w, true, e)}
            style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}
            title={`Roll Damage (${dmgDice}${extraDamage} ${formatMod(stdAtkObj.dmgTotal)})`}
          >
            DMG {formatMod(stdAtkObj.dmgTotal)}
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
    const hasDistractingAttack = activeACFs.includes('ranger_distracting_attack');

    const strikes: Array<{ id: string; name: string; render: (selectorDropdown?: JSX.Element) => JSX.Element }> = [];

    // 1. Paladin (Smite Evil / Charging Smite)
    if (paladinLvl > 0 || !!smiteAbility) {
      const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
      const smiteTitle = hasChargingSmite ? 'Charging Smite' : 'Smite Evil';
      const smiteSeq = AttackEngine.calculateAttackSequence(pc, w, false, { smite: true, noSneak: true });
      const stdSmite = smiteSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w8' };
      const smiteDmgText = hasChargingSmite ? `+${paladinLvl * 2}` : `+${paladinLvl}`;

      strikes.push({
        id: 'smite',
        name: smiteTitle,
        render: (selectorDropdown) => (
          <div
            className="arpg-slot class-ability-slot rarity-epic"
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '88px',
              border: '1px solid var(--red)',
              borderRadius: '4px',
              padding: '5px 6px',
              textAlign: 'center',
              background: 'rgba(139, 26, 26, 0.08)',
              boxShadow: '0 0 8px rgba(139, 26, 26, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '6.5px', color: 'var(--red)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
                {hasChargingSmite ? '⚡ ACF Strike' : '🌟 Class Strike'}
              </div>
              {selectorDropdown}
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={smiteTitle}>
              {smiteTitle}
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
              +{Math.max(0, chaMod)} Atk / {smiteDmgText} Dmg
            </div>

            {/* Charge Bubbles */}
            <div style={{ display: 'flex', gap: '2px', margin: '1px 0' }}>
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
                  title={i < smiteUsed ? 'Expended' : 'Ready'}
                />
              ))}
            </div>

            {/* Action Attack & Damage Buttons */}
            <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
              <button
                className="xbtn xbtn-atk"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollAttack(w, false, e, { smite: true })}
                style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
                title={`Roll Smite Attack (${formatMod(stdSmite.atkTotal)})`}
              >
                ATK {formatMod(stdSmite.atkTotal)}
              </button>
              <button
                className="xbtn xbtn-dmg"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollDamage(w, false, e, { smite: true })}
                style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
                title={`Roll Smite Damage (${stdSmite.damageDice} ${formatMod(stdSmite.dmgTotal)})`}
              >
                DMG {formatMod(stdSmite.dmgTotal)}
              </button>
            </div>
          </div>
        )
      });
    }

    // 2. Sneak Attack
    if (sneakAttackDice > 0) {
      const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
      const sneakSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, noSmite: true });
      const stdSneak = sneakSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };
      const baseDmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : (w.damage || '1w6');

      strikes.push({
        id: 'sneak',
        name: 'Sneak Attack',
        render: (selectorDropdown) => (
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
              border: '1px solid rgba(70, 105, 65, 0.5)',
              borderRadius: '4px',
              padding: '5px 6px',
              textAlign: 'center',
              background: 'rgba(70, 105, 65, 0.04)',
              boxShadow: '0 0 6px rgba(70, 105, 65, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '6.5px', color: '#3b5e38', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
                🗡️ Class Strike
              </div>
              {selectorDropdown}
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
              Sneak Attack
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
              +{sneakAttackDice}d6 (Flank / Denied Dex)
            </div>

            <div style={{ fontSize: '6.5px', color: '#3b5e38', fontStyle: 'italic' }}>
              Precision Strike
            </div>

            {/* Action Attack & Damage Buttons */}
            <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
              <button
                className="xbtn xbtn-atk"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollAttack(w, false, e, { sneakAttack: true })}
                style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
                title={`Roll Sneak Attack (${formatMod(stdSneak.atkTotal)})`}
              >
                ATK {formatMod(stdSneak.atkTotal)}
              </button>
              <button
                className="xbtn xbtn-dmg"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollDamage(w, false, e, { sneakAttack: true })}
                style={{ flex: 1.2, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
                title={`Roll Sneak Damage (${baseDmgDice}+${sneakAttackDice}d6 ${formatMod(stdSneak.dmgTotal)})`}
              >
                DMG +{sneakAttackDice}d6
              </button>
            </div>
          </div>
        )
      });
    }

    // 3. Duskblade (Arcane Channeling)
    if (duskbladeClass) {
      const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
      const duskSeq = AttackEngine.calculateAttackSequence(pc, w, false, {});
      const stdDusk = duskSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };

      strikes.push({
        id: 'duskblade',
        name: 'Arcane Channeling',
        render: (selectorDropdown) => (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '6.5px', color: '#8e44ad', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
                ⚡ Duskblade Strike
              </div>
              {selectorDropdown}
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9px', fontWeight: 'bold', color: '#8e44ad', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
              Arcane Channeling
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
              Channel spell through strike
            </div>
            <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
              <button
                className="xbtn xbtn-atk"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollAttack(w, false, e, { arcaneChanneling: true })}
                style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
              >
                ATK {formatMod(stdDusk.atkTotal)}
              </button>
              <button
                className="xbtn xbtn-dmg"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollDamage(w, false, e, { arcaneChanneling: true })}
                style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
              >
                DMG+Spell
              </button>
            </div>
          </div>
        )
      });
    }

    // 4. Scout (Skirmish Attack)
    if (scoutClass) {
      const skirmishLvl = scoutClass.level;
      const skirmishDice = 1 + Math.floor((skirmishLvl - 1) / 4);
      const skirmishAC = 1 + Math.floor((skirmishLvl - 1) / 4);
      const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
      const skirSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, skirmish: true });
      const stdSkir = skirSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };
      const baseDmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : (w.damage || '1w6');

      strikes.push({
        id: 'skirmish',
        name: 'Skirmish Attack',
        render: (selectorDropdown) => (
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
              border: '0.5px solid #8c734b',
              borderRadius: '4px',
              padding: '5px 6px',
              textAlign: 'center',
              background: 'rgba(140, 115, 75, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '6.5px', color: '#6d5734', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
                🏃 Scout Strike
              </div>
              {selectorDropdown}
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9px', fontWeight: 'bold', color: '#6d5734', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
              Skirmish Attack
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
              +{skirmishDice}d6 Dmg / +{skirmishAC} AC (10ft+)
            </div>
            <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
              <button
                className="xbtn xbtn-atk"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollAttack(w, false, e, { sneakAttack: true, skirmish: true })}
                style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
              >
                ATK {formatMod(stdSkir.atkTotal)}
              </button>
              <button
                className="xbtn xbtn-dmg"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollDamage(w, false, e, { sneakAttack: true, skirmish: true })}
                style={{ flex: 1.2, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
                title={`Roll Skirmish Damage (${baseDmgDice}+${skirmishDice}d6 ${formatMod(stdSkir.dmgTotal)})`}
              >
                DMG +{skirmishDice}d6
              </button>
            </div>
          </div>
        )
      });
    }

    // 5. Ninja (Sudden Strike)
    if (ninjaClass) {
      const ninjaDice = 1 + Math.floor((ninjaClass.level - 1) / 2);
      const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
      const sudSeq = AttackEngine.calculateAttackSequence(pc, w, false, { sneakAttack: true, suddenStrike: true });
      const stdSud = sudSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w6' };
      const baseDmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : (w.damage || '1w6');

      strikes.push({
        id: 'sudden_strike',
        name: 'Sudden Strike',
        render: (selectorDropdown) => (
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
              border: '0.5px solid #5a6b7c',
              borderRadius: '4px',
              padding: '5px 6px',
              textAlign: 'center',
              background: 'rgba(90, 107, 124, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '6.5px', color: '#4a5b6c', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
                🥷 Ninja Strike
              </div>
              {selectorDropdown}
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9px', fontWeight: 'bold', color: '#4a5b6c', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
              Sudden Strike
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
              +{ninjaDice}d6 (Denied Dex)
            </div>
            <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
              <button
                className="xbtn xbtn-atk"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollAttack(w, false, e, { sneakAttack: true, suddenStrike: true })}
                style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
              >
                ATK {formatMod(stdSud.atkTotal)}
              </button>
              <button
                className="xbtn xbtn-dmg"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollDamage(w, false, e, { sneakAttack: true, suddenStrike: true })}
                style={{ flex: 1.2, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
                title={`Roll Sudden Strike (${baseDmgDice}+${ninjaDice}d6 ${formatMod(stdSud.dmgTotal)})`}
              >
                DMG +{ninjaDice}d6
              </button>
            </div>
          </div>
        )
      });
    }

    // 6. Ranger (Favored Enemy Strike)
    if (rangerLvl > 0 || favoredEnemyBonus > 0) {
      const w = mainHandWeapon || { name: 'Unarmed Strike', damageDice: '1w3', damage: '1w3', crit: '20 / x2', grip: '1h', enhancement: 0 };
      const feSeq = AttackEngine.calculateAttackSequence(pc, w, false, { favoredEnemy: true });
      const stdFE = feSeq[0] || { atkTotal: 0, dmgTotal: 0, damageDice: '1w8' };

      strikes.push({
        id: 'favored_enemy',
        name: 'Favored Enemy',
        render: (selectorDropdown) => (
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
              border: '1px solid #4a6274',
              borderRadius: '4px',
              padding: '5px 6px',
              textAlign: 'center',
              background: 'rgba(74, 98, 116, 0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '6.5px', color: '#4a6274', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", opacity: 0.9 }}>
                {hasDistractingAttack ? '⚡ ACF Ranger' : '🏹 Ranger'}
              </div>
              {selectorDropdown}
            </div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: '#4a6274', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
              Favored Enemy
            </div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', lineHeight: 1.1 }}>
              +{favoredEnemyBonus} Damage {hasDistractingAttack ? '(Flanks)' : `vs ${pc.favoredEnemy || 'Enemy'}`}
            </div>
            <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
              <button
                className="xbtn xbtn-atk"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollAttack(w, false, e, { favoredEnemy: true })}
                style={{ flex: 1, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
              >
                ATK {formatMod(stdFE.atkTotal)}
              </button>
              <button
                className="xbtn xbtn-dmg"
                disabled={pc.isTotalDefense}
                onClick={(e) => handleRollDamage(w, false, e, { favoredEnemy: true })}
                style={{ flex: 1.2, padding: '2px 0', fontSize: '7.5px', fontWeight: 'bold', height: '18px', lineHeight: 1 }}
              >
                DMG +{favoredEnemyBonus}
              </button>
            </div>
          </div>
        )
      });
    }

    if (strikes.length === 0) {
      // Default fallback / Stance
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
    }

    const selectedStrikeId = pc.selectedClassStrike && strikes.some(s => s.id === pc.selectedClassStrike)
      ? pc.selectedClassStrike
      : strikes[0].id;
    const currentStrike = strikes.find(s => s.id === selectedStrikeId) || strikes[0];

    const selectorDropdown = strikes.length > 1 ? (
      <select
        value={selectedStrikeId}
        onChange={(e) => CombatState.updatePCField('selectedClassStrike', e.target.value)}
        style={{
          fontSize: '6.5px',
          padding: '0 1px',
          height: '12px',
          lineHeight: 1,
          borderRadius: '1px',
          border: '0.5px solid var(--pb)',
          background: 'white',
          color: 'var(--ink)',
          cursor: 'pointer',
          maxWidth: '55px'
        }}
      >
        {strikes.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    ) : undefined;

    return currentStrike.render(selectorDropdown);
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
