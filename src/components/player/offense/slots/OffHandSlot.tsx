/**
 * @module    OffHandSlot
 * @summary   Renders the Off-Hand ARPG slot (Shield or secondary weapon).
 */

import React from 'react';
import { CombatState } from '@core/state.js';
import { AttackEngine } from '@core/rules/AttackEngine.js';
import { matchesFeatOption, getCritThreatDisplay } from '@core/models/Weapon.js';
import { ARMOR_REGISTRY } from '@core/data/armor-data.js';
import { isWeaponTwoHanded } from './slotsHelper';

export interface OffHandSlotProps {
  pc: any;
  offHandWeapon: any;
  equippedShield: any;
  isDoubleWielded: boolean;
  getRarityStyle: (enhancement: number) => { border: string; background: string; boxShadow: string; glowClass: string };
  formatMod: (val: number) => string;
  handleHandSelectChange: (idx: number, val: string) => void;
  handleRollAttack: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
  handleRollDamage: (w: any, isOffhand: boolean, e: React.MouseEvent, customOptions?: any) => void;
  onOpenWeaponStash?: () => void;
  onOpenArmorStash?: () => void;
}

export const OffHandSlot: React.FC<OffHandSlotProps> = ({
  pc,
  offHandWeapon,
  equippedShield,
  isDoubleWielded,
  getRarityStyle,
  formatMod,
  handleHandSelectChange,
  handleRollAttack,
  handleRollDamage,
  onOpenWeaponStash,
  onOpenArmorStash,
}) => {
  const w = offHandWeapon;
  const sh = equippedShield;
  const rStyle = getRarityStyle(sh ? sh.enhancement : w ? w.enhancement : 0);

  if (!sh && !w) {
    return (
      <div
        className="arpg-slot off-hand-slot"
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
          padding: '5px 4px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.7 }}>🛡️⚔️</div>
        <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
          Off-Hand
        </div>
        <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic', marginBottom: '4px' }}>(Empty)</div>
        <div style={{ display: 'flex', gap: '3px', width: '100%', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenArmorStash?.();
            }}
            title="Open Armor & Shields Arsenal"
            style={{
              fontSize: '6.5px',
              fontWeight: 'bold',
              padding: '1px 4px',
              height: '16px',
              lineHeight: 1,
              background: 'rgba(0,0,0,0.04)',
              border: '0.5px solid var(--pb)',
              borderRadius: '2px',
              cursor: 'pointer',
              color: 'var(--ink)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              whiteSpace: 'nowrap'
            }}
          >
            🛡️ Shield
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWeaponStash?.();
            }}
            title="Open Weapon Arsenal"
            style={{
              fontSize: '6.5px',
              fontWeight: 'bold',
              padding: '1px 4px',
              height: '16px',
              lineHeight: 1,
              background: 'rgba(0,0,0,0.04)',
              border: '0.5px solid var(--pb)',
              borderRadius: '2px',
              cursor: 'pointer',
              color: 'var(--ink)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              whiteSpace: 'nowrap'
            }}
          >
            ⚔️ Weapon
          </button>
        </div>
      </div>
    );
  }

  if (sh) {
    const typeDef = ARMOR_REGISTRY[sh.type] || {};
    const baseName = sh.name || typeDef.nameEn || typeDef.name || 'Shield';
    const totalAC = (sh.armorBonus !== undefined ? sh.armorBonus : (typeDef.armorBonus || 0)) + (parseInt(sh.enhancement) || 0);
    const maxDex = sh.maxDex !== undefined ? sh.maxDex : typeDef.maxDex;
    const checkPenalty = sh.checkPenalty !== undefined ? sh.checkPenalty : (typeDef.checkPenalty || 0);
    const spellFailure = sh.spellFailure !== undefined ? sh.spellFailure : (typeDef.spellFailure || 0);

    const isHeavy = (sh.type || '').includes('heavy');
    const isLight = (sh.type || '').includes('light');
    const isTower = (sh.type || '').includes('tower');
    const canBash = isHeavy || isLight;
    const bashDice = isHeavy ? '1d6' : '1d4';

    let stdBashObj = { atkTotal: 0, dmgTotal: 0 };
    let bashWeapon: any = null;

    if (canBash) {
      bashWeapon = {
        id: 'shield_bash_' + (sh.id || 'sh'),
        name: `${baseName} (Bash)`,
        type: 'martial',
        grip: '1h',
        hand: 'off',
        damageDice: bashDice,
        damage: bashDice,
        crit: '20 / x2',
        enhancement: 0,
        isEquipped: true,
      };
      const bashSeq = AttackEngine.calculateAttackSequence(pc, bashWeapon, false, {
        isOffhandAttack: true,
        smite: pc.isSmiteActive,
        favoredEnemy: pc.isFavoredEnemyActive,
        targetCreatureType: pc.activeFavoredEnemyTarget,
        sneakAttack: pc.isSneakAttacking,
      });
      stdBashObj = bashSeq[0] || { atkTotal: 0, dmgTotal: 0 };
    }

    return (
      <div
        className={`arpg-slot off-hand-slot ${rStyle.glowClass}`}
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '88px',
          border: rStyle.border,
          borderRadius: '4px',
          padding: '5px 6px',
          textAlign: 'center',
          background: rStyle.background,
          boxShadow: rStyle.boxShadow,
        }}
      >
        <button
          className="unequip-slot-btn"
          onClick={() => CombatState.togglePCArmorEquip(pc.armors.indexOf(sh))}
          style={{
            position: 'absolute',
            top: '2px',
            right: '4px',
            border: 'none',
            background: 'transparent',
            fontSize: '7.5px',
            cursor: 'pointer',
            color: 'var(--red)',
            padding: 0,
          }}
          title="Unequip shield"
        >
          ✕
        </button>

        {/* Top: Icon, Title & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '1px' }}>
            <span style={{ fontSize: '11px' }}>🛡️</span>
            <span
              style={{
                fontSize: '8px',
                fontFamily: 'var(--font-title)',
                fontWeight: 'bold',
                color: 'var(--red)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '95px',
              }}
              title={baseName}
            >
              {baseName}
            </span>
            {sh.enhancement > 0 && (
              <span style={{ fontSize: '7px', fontWeight: 'bold', color: 'var(--red)', background: 'rgba(139, 26, 26, 0.08)', padding: '0 3px', borderRadius: '2px' }}>
                +{sh.enhancement}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
            <span
              style={{
                fontSize: '7.5px',
                fontFamily: 'var(--font-title)',
                fontWeight: 'bold',
                color: 'var(--ink)',
                background: 'rgba(200, 169, 110, 0.2)',
                border: '0.5px solid var(--pb)',
                borderRadius: '2px',
                padding: '0 4px',
              }}
            >
              +{totalAC} AC
            </span>
            <span
              style={{
                fontSize: '6.5px',
                fontFamily: 'var(--font-title)',
                textTransform: 'uppercase',
                color: 'var(--inkm)',
                background: 'rgba(0,0,0,0.04)',
                borderRadius: '2px',
                padding: '0 3px',
              }}
            >
              Shield
            </span>
          </div>
        </div>

        {/* Middle: Tactical Action / Bash or Protection breakdown */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px 0' }}>
          {canBash ? (
            <>
              <div style={{ fontSize: '6.5px', color: 'var(--inkm)', fontStyle: 'italic', display: 'flex', justifyContent: 'space-between', padding: '0 2px' }}>
                <span>⚔️ Bash ({bashDice})</span>
                <span title="Shield bonus protects when flat-footed">🛡️ Flat: +{totalAC}</span>
              </div>
              <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
                <button
                  type="button"
                  className="xbtn xbtn-atk"
                  disabled={pc.isTotalDefense}
                  onClick={(e) => handleRollAttack(bashWeapon, true, e)}
                  style={{
                    flex: 1,
                    padding: '2px 0',
                    fontSize: '7px',
                    fontWeight: 'bold',
                    height: '17px',
                    lineHeight: 1,
                    opacity: pc.isTotalDefense ? 0.4 : 1,
                    cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer',
                  }}
                  title={`Roll Shield Bash Attack (${formatMod(stdBashObj.atkTotal)})`}
                >
                  BASH {formatMod(stdBashObj.atkTotal)}
                </button>
                <button
                  type="button"
                  className="xbtn xbtn-dmg"
                  disabled={pc.isTotalDefense}
                  onClick={(e) => handleRollDamage(bashWeapon, true, e)}
                  style={{
                    flex: 1,
                    padding: '2px 0',
                    fontSize: '7px',
                    fontWeight: 'bold',
                    height: '17px',
                    lineHeight: 1,
                    opacity: pc.isTotalDefense ? 0.4 : 1,
                    cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer',
                  }}
                  title={`Roll Shield Bash Damage (${bashDice} ${formatMod(stdBashObj.dmgTotal)})`}
                >
                  DMG {formatMod(stdBashObj.dmgTotal)}
                </button>
              </div>
            </>
          ) : isTower ? (
            <div style={{ padding: '2px 4px', background: 'rgba(0,0,0,0.02)', borderRadius: '2px', border: '0.5px solid rgba(200, 169, 110, 0.25)' }}>
              <div style={{ fontSize: '6.5px', fontWeight: 'bold', color: 'var(--red)' }}>🏰 Total Cover Action</div>
              <div style={{ fontSize: '5.5px', color: 'var(--inkm)' }}>Standard Action vs 1 edge</div>
            </div>
          ) : (
            <div style={{ padding: '2px 4px', background: 'rgba(0,0,0,0.02)', borderRadius: '2px', border: '0.5px solid rgba(200, 169, 110, 0.25)' }}>
              <div style={{ fontSize: '6.5px', fontWeight: 'bold', color: 'var(--ink)' }}>🏹 Free Off-Hand</div>
              <div style={{ fontSize: '5.5px', color: 'var(--inkm)' }}>Can wield bow/crossbow (-1 ATK)</div>
            </div>
          )}
        </div>

        {/* Bottom: 3-column stats matching ArmorSlot */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            fontSize: '6.5px',
            fontFamily: 'var(--font-body)',
            color: 'var(--inkm)',
            borderTop: '0.5px dashed rgba(200, 169, 110, 0.35)',
            paddingTop: '3px',
            marginTop: '3px',
          }}
        >
          <div title="Max Dexterity Bonus">
            <span style={{ display: 'block', fontSize: '5.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>MaxDex</span>
            <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{maxDex !== null && maxDex !== undefined ? `+${maxDex}` : '—'}</span>
          </div>
          <div title="Armor Check Penalty">
            <span style={{ display: 'block', fontSize: '5.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>ACP</span>
            <span style={{ fontWeight: 'bold', color: checkPenalty > 0 ? 'var(--red)' : 'var(--ink)' }}>{checkPenalty > 0 ? `-${checkPenalty}` : '0'}</span>
          </div>
          <div title="Arcane Spell Failure">
            <span style={{ display: 'block', fontSize: '5.5px', color: 'var(--inkl)', textTransform: 'uppercase' }}>Fail</span>
            <span style={{ fontWeight: 'bold', color: 'var(--ink)' }}>{spellFailure}%</span>
          </div>
        </div>
      </div>
    );
  }

  // Weapon in Offhand
  const seq = AttackEngine.calculateAttackSequence(pc, w, false, {
    isOffhandAttack: true,
    smite: pc.isSmiteActive,
    favoredEnemy: pc.isFavoredEnemyActive,
    targetCreatureType: pc.activeFavoredEnemyTarget,
    sneakAttack: pc.isSneakAttacking,
  });
  const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [] };
  const hasImprovedCritical =
    pc.feats &&
    pc.feats.some(
      (f: any) =>
        (f.id === 'improved_critical' || f.id === 'verbesserter_kritischer_treffer') &&
        matchesFeatOption(w, f.option),
    );
  const isDoubleThreat = w.isKeen || hasImprovedCritical;
  const doubledCritDisplay = getCritThreatDisplay(w.crit, isDoubleThreat);
  const dmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : w.damage || '1w6';
  const extraDamage = w.extraDamage ? ` + ${w.extraDamage}` : '';
  const offhandLabel = isDoubleWielded ? '⚔️ Off-Hand (2nd)' : '⚔️ Off-Hand';
  const feBonus = typeof pc.getFavoredEnemyBonus === 'function' ? pc.getFavoredEnemyBonus(pc.activeFavoredEnemyTarget) : 0;

  return (
    <div
      className={`arpg-slot off-hand-slot ${rStyle.glowClass}`}
      style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '88px',
        border: rStyle.border,
        borderRadius: '4px',
        padding: '5px 6px',
        textAlign: 'center',
        background: rStyle.background,
        boxShadow: rStyle.boxShadow,
      }}
    >
      <button
        className="unequip-slot-btn"
        onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))}
        style={{
          position: 'absolute',
          top: '2px',
          right: '4px',
          border: 'none',
          background: 'transparent',
          fontSize: '7.5px',
          cursor: 'pointer',
          color: 'var(--red)',
          padding: 0,
        }}
        title="Unequip"
      >
        ✕
      </button>
      <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-title)', opacity: 0.9 }}>
        {offhandLabel}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '9.5px',
          fontWeight: 'bold',
          color: 'var(--red)',
          textShadow: '0 0 1px rgba(139,26,26,0.1)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          width: '100%',
        }}
        title={isDoubleWielded ? w.name + ' (Offhand)' : w.name}
      >
        {isDoubleWielded ? w.name + ' (Offhand)' : w.name}
      </div>
      {pc.isFavoredEnemyActive && feBonus > 0 && (
        <div
          style={{
            fontSize: '6.5px',
            color: '#2a6a2a',
            fontWeight: 'bold',
            background: 'rgba(42, 106, 42, 0.08)',
            padding: '0 4px',
            borderRadius: '2px',
            border: '0.5px solid rgba(42, 106, 42, 0.3)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={`Favored Enemy active (+${feBonus} Damage)`}
        >
          🏹 {pc.activeFavoredEnemyTarget ? `vs ${pc.activeFavoredEnemyTarget}` : 'Favored Enemy'} (+{feBonus})
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0', fontSize: '7px', color: 'var(--inkm)' }}>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>
          {dmgDice}{extraDamage} • {doubledCritDisplay}
        </div>
        {!isDoubleWielded && !isWeaponTwoHanded(w) && (
          <select
            className="cinput weapon-hand-select"
            value="off"
            onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
            style={{
              fontSize: '6.5px',
              padding: '0 1px',
              height: '12px',
              lineHeight: 1,
              borderRadius: '1px',
              border: '0.5px solid var(--pb)',
              outline: 'none',
              background: 'white',
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
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
          style={{
            flex: 1,
            padding: '2px 0',
            fontSize: '7.5px',
            fontWeight: 'bold',
            height: '18px',
            lineHeight: 1,
            opacity: pc.isTotalDefense ? 0.4 : 1,
            cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer',
          }}
          title={`Roll Attack (${formatMod(stdAtkObj.atkTotal)})`}
        >
          ATK {formatMod(stdAtkObj.atkTotal)}
        </button>
        <button
          className="xbtn xbtn-dmg"
          disabled={pc.isTotalDefense}
          onClick={(e) => handleRollDamage(w, true, e)}
          style={{
            flex: 1,
            padding: '2px 0',
            fontSize: '7.5px',
            fontWeight: 'bold',
            height: '18px',
            lineHeight: 1,
            opacity: pc.isTotalDefense ? 0.4 : 1,
            cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer',
          }}
          title={`Roll Damage (${dmgDice}${extraDamage} ${formatMod(stdAtkObj.dmgTotal)})`}
        >
          DMG {formatMod(stdAtkObj.dmgTotal)}
        </button>
      </div>
    </div>
  );
};
