/**
 * @module    PCOffenseTab
 * @summary   The Tactical Combat Action Hub: Renders active weapon loadout, tactile combat sliders, class powers, Diablo 2 style potion belt, and weapon arsenal.
 * @exports   PCOffenseTab
 * @reads     pc.weapons, pc.armor, pc.activeShape, pc.feats, pc.bab, pc.str, pc.dex, pc.isTotalDefense, pc.isSmiteActive, pc.isFavoredEnemyActive, pc.isSneakAttacking, pc.autoAC
 * @stateOps  togglePCWeaponEquip, togglePCArmorEquip, updatePCWeapon, deletePCWeapon, addPCWeapon, setPCAutoAC, updatePCBatch, consumeSmiteEvilCharge
 * @depends   React, @core/state.js, @core/rules/AttackEngine.js, @core/models/Weapon.js, src/components/shared/BaseCard, ActiveEquipmentSlots, TacticalModifiersCard, ClassCombatAbilitiesCard, TacticalBeltCard, WeaponStashCard
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../shared/BaseCard';
// @ts-ignore
import { AttackEngine } from '@core/rules/AttackEngine.js';
// @ts-ignore
import { WeaponRegistry } from '@core/models/Weapon.js';
// @ts-ignore
import { showAttackChoiceDialog, showDamageChoiceDialog, showRollBreakdown, showCustomConfirm } from '@core/ui/components/dialogs.js';

import { ActiveEquipmentSlots } from './offense/ActiveEquipmentSlots';
import { TacticalModifiersCard } from './offense/TacticalModifiersCard';
import { ClassCombatAbilitiesCard } from './offense/ClassCombatAbilitiesCard';
import { TacticalBeltCard } from './offense/TacticalBeltCard';
import { WeaponStashCard } from './offense/WeaponStashCard';

const getEquippedArmorFallback = (pc: any) => {
  if (typeof pc.getEquippedArmor === 'function') return pc.getEquippedArmor();
  if (Array.isArray(pc.armors)) {
    return pc.armors.find((a: any) => a.isEquipped && !a.isShield) || null;
  }
  return null;
};

interface PCOffenseTabProps {
  pc: any;
}

export const PCOffenseTab: React.FC<PCOffenseTabProps> = ({ pc }) => {
  const [expandedWeaponIds, setExpandedWeaponIds] = useState<Record<string, boolean>>({});
  const [doubleWeaponIdx, setDoubleWeaponIdx] = useState<number | null>(null);
  const [weaponSearchQuery, setWeaponSearchQuery] = useState('');

  const formatMod = (val: number) => (val >= 0 ? `+${val}` : `${val}`);
  const babVal = typeof pc.bab === 'number' ? pc.bab : (typeof pc.bab?.getValue === 'function' ? pc.bab.getValue() : 0);

  // Filter equipped weapons
  const equippedWeapons = Array.isArray(pc.weapons) ? pc.weapons.filter((w: any) => w.isEquipped) : [];
  const mainHandWeapon = equippedWeapons.find((w: any) => w.hand === 'main') || equippedWeapons.find((w: any) => w.hand !== 'off') || null;
  let offHandWeapon = equippedWeapons.find((w: any) => w.hand === 'off' || w.grip === 'sec') || null;
  let isDoubleWielded = false;
  if (mainHandWeapon && (mainHandWeapon as any).isDoubleWielded) {
    offHandWeapon = mainHandWeapon;
    isDoubleWielded = true;
  }
  
  const equippedArmor = Array.isArray(pc.armors) ? pc.armors.find((a: any) => a.isEquipped && !(a as any).isShield) : null;
  const equippedShield = Array.isArray(pc.armors) ? pc.armors.find((a: any) => a.isEquipped && (a as any).isShield) : null;

  // Rarity style helper
  const getRarityStyle = (enhancement: number) => {
    if (enhancement >= 5) {
      return { border: '1px solid #ff00ff', background: 'rgba(255, 0, 255, 0.04)', boxShadow: '0 0 8px rgba(255, 0, 255, 0.15)', glowClass: 'rarity-epic' };
    }
    if (enhancement >= 3) {
      return { border: '1px solid #00c0ff', background: 'rgba(0, 192, 255, 0.04)', boxShadow: '0 0 6px rgba(0, 192, 255, 0.1)', glowClass: 'rarity-rare' };
    }
    if (enhancement >= 1) {
      return { border: '1px solid #c8a96e', background: 'rgba(200, 169, 110, 0.06)', boxShadow: 'none', glowClass: 'rarity-uncommon' };
    }
    return { border: '0.5px solid var(--pb)', background: 'transparent', boxShadow: 'none', glowClass: '' };
  };

  const handleWeaponEquipToggle = (idx: number, w: any) => {
    if (w.isEquipped) {
      CombatState.togglePCWeaponEquip(idx);
      return;
    }
    
    // Warning for off-hand weapon without TWF
    if (w.hand === 'off') {
      const hasTWF = pc.feats && (
        pc.feats.some((f: any) => f.id === 'two_weapon_fighting' || f.id === 'zwei_waffen_kampf') ||
        (() => {
          const armor = getEquippedArmorFallback(pc);
          const speedCategory = armor ? armor.speedCategory : '';
          const isWearingMediumOrHeavy = speedCategory === 'medium' || speedCategory === 'heavy';
          if (!isWearingMediumOrHeavy) {
            const rangerClass = Array.isArray(pc.classes) && pc.classes.find((c: any) => c.classType === 'ranger');
            const rangerLvl = rangerClass ? rangerClass.level : 0;
            return rangerLvl >= 2 && pc.rangerCombatStyle === 'twoweapon';
          }
          return false;
        })()
      );
      if (!hasTWF) {
        showCustomConfirm(
          "No Two-Weapon Fighting",
          "Your character does not possess the 'Two-Weapon Fighting' feat. Wielding a weapon in your off-hand will result in severe penalties to attack rolls. Do you still wish to proceed?",
          () => {
            const def = WeaponRegistry[w.type] || WeaponRegistry.longsword;
            if (def.isDouble) {
              setDoubleWeaponIdx(idx);
            } else {
              CombatState.togglePCWeaponEquip(idx);
            }
          }
        );
        return;
      }
    }

    const def = WeaponRegistry[w.type] || WeaponRegistry.longsword;
    if (def.isDouble) {
      setDoubleWeaponIdx(idx);
      return;
    }
    CombatState.togglePCWeaponEquip(idx);
  };

  const handleHandSelectChange = (idx: number, val: string) => {
    const targetWeapon = pc.weapons[idx];
    if (!targetWeapon) return;
    
    const oldHand = targetWeapon.hand || 'main';
    if (oldHand === val) return;
    
    const otherWeapon = pc.weapons.find((w: any, i: number) => w.isEquipped && i !== idx && (w.hand === val || (val === 'main' && w.hand !== 'off')));
    const otherIdx = otherWeapon ? pc.weapons.indexOf(otherWeapon) : null;
    
    CombatState.updatePCBatch((freshPC: any) => {
      freshPC.weapons[idx].hand = val;
      if (otherIdx !== null) {
        freshPC.weapons[otherIdx].hand = oldHand;
      }
    });
  };

  // Roll Attack / Damage with Smite Evil auto-consumption
  const handleRollAttack = (w: any, isOffhand = false, e: React.MouseEvent) => {
    if (pc.isTotalDefense) return;
    if (pc.isSmiteActive) {
      const res = CombatState.consumeSmiteEvilCharge();
      if (res && res.remaining === 0) {
        CombatState.updatePCField('isSmiteActive', false);
      }
    }
    showAttackChoiceDialog(pc, w, e.nativeEvent, isOffhand ? { isOffhandAttack: true } : {});
  };

  const handleRollDamage = (w: any, isOffhand = false, e: React.MouseEvent) => {
    if (pc.isTotalDefense) return;
    if (pc.isSmiteActive) {
      const res = CombatState.consumeSmiteEvilCharge();
      if (res && res.remaining === 0) {
        CombatState.updatePCField('isSmiteActive', false);
      }
    }
    const hasPaladin = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'paladin');
    const favoredEnemyBonus = typeof pc.getFavoredEnemyBonus === 'function' ? pc.getFavoredEnemyBonus() : 0;
    const sneakAttackDice = typeof pc.getSneakAttackDiceCount === 'function' ? pc.getSneakAttackDiceCount() : 0;
    const hasDmgToggles = (hasPaladin && w.grip !== 'rng') || favoredEnemyBonus > 0 || sneakAttackDice > 0;
    
    if (hasDmgToggles) {
      showDamageChoiceDialog(pc, w, e.nativeEvent, isOffhand ? { isOffhandAttack: true } : {});
    } else {
      const seq = AttackEngine.calculateAttackSequence(pc, w, false, isOffhand ? {
        isOffhandAttack: true,
        smite: pc.isSmiteActive,
        favoredEnemy: pc.isFavoredEnemyActive,
        sneakAttack: pc.isSneakAttacking
      } : {
        smite: pc.isSmiteActive,
        favoredEnemy: pc.isFavoredEnemyActive,
        sneakAttack: pc.isSneakAttacking
      });
      const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0, dmgBreakdown: [], atkBreakdown: [], damageDice: '1w6' };
      const wName = isOffhand && isDoubleWielded ? `${w.name} (Off-hand)` : w.name;
      showRollBreakdown(`${wName} (Damage)`, stdAtkObj.damageDice, stdAtkObj.dmgBreakdown, e.nativeEvent);
    }
  };

  const handleDoubleWeaponOption = (isDouble: boolean) => {
    if (doubleWeaponIdx === null) return;
    CombatState.updatePCWeapon(doubleWeaponIdx, 'isDoubleWielded', isDouble);
    CombatState.togglePCWeaponEquip(doubleWeaponIdx);
    setDoubleWeaponIdx(null);
  };

  // Filtered weapons for stash
  const filteredWeapons = Array.isArray(pc.weapons) ? pc.weapons.filter((w: any) => {
    if (!weaponSearchQuery) return true;
    return (w.name || '').toLowerCase().includes(weaponSearchQuery.toLowerCase()) ||
           (w.type || '').toLowerCase().includes(weaponSearchQuery.toLowerCase());
  }) : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Left Column: Active Loadout, Tactical Modifiers & Class Powers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* 1. Active Equipment & Attacks */}
        <BaseCard title="⚔️ Active Loadout &amp; Attacks">
          <ActiveEquipmentSlots
            pc={pc}
            mainHandWeapon={mainHandWeapon}
            offHandWeapon={offHandWeapon}
            equippedShield={equippedShield}
            equippedArmor={equippedArmor}
            isDoubleWielded={isDoubleWielded}
            getRarityStyle={getRarityStyle}
            formatMod={formatMod}
            handleHandSelectChange={handleHandSelectChange}
            handleRollAttack={handleRollAttack}
            handleRollDamage={handleRollDamage}
          />
        </BaseCard>

        {/* 2. Tactical Modifiers & Stances (Power Attack, Combat Expertise Sliders) */}
        <TacticalModifiersCard pc={pc} babVal={babVal} />

        {/* 3. Dynamic Class Powers Hub (Smite Evil, Sneak Attack, Favored Enemy, Rage) */}
        <ClassCombatAbilitiesCard pc={pc} />

      </div>

      {/* Right Column: Diablo 2 Tactical Belt & Weapon Arsenal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* 1. Tactical Combat Belt (Quick Pouch) */}
        <TacticalBeltCard pc={pc} />

        {/* 2. Weapons Arsenal & Stash */}
        <BaseCard title="🗡️ Weapons Arsenal &amp; Quick-Swap">
          {pc.activeShape !== 'none' ? (
            <div style={{ padding: '16px', textAlign: 'center', fontStyle: 'italic', color: 'var(--inkl)', fontSize: '8.5px', fontFamily: "'Crimson Text', serif" }}>
              In Wild Shape, manufactured weapons are inactive. Use natural attacks from the loadout panel.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* Header Bar with Search & Add Weapon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="🔍 Search weapons..."
                  value={weaponSearchQuery}
                  onChange={(e) => setWeaponSearchQuery(e.target.value)}
                  className="cinput"
                  style={{ flex: 1, fontSize: '8px', height: '18px', padding: '1px 6px' }}
                />
                <button
                  className="btn"
                  onClick={() => CombatState.addPCWeapon()}
                  style={{
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '7.5px',
                    fontWeight: 'bold',
                    padding: '1px 8px',
                    height: '18px',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                    border: '0.5px solid #8b6914',
                    color: '#ffffff',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Weapon
                </button>
              </div>

              {/* Weapons List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '340px', overflowY: 'auto', paddingRight: '2px' }}>
                {filteredWeapons.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--inkl)', fontStyle: 'italic', fontSize: '8px' }}>
                    {weaponSearchQuery ? 'No weapons match your search.' : 'No weapons in stash. Click "+ Weapon" to add one.'}
                  </div>
                ) : (
                  filteredWeapons.map((w: any) => {
                    const originalIdx = pc.weapons.indexOf(w);
                    return (
                      <WeaponStashCard
                        key={w.id || originalIdx}
                        w={w}
                        idx={originalIdx}
                        isExpanded={!!expandedWeaponIds[w.id]}
                        onToggleExpand={() => setExpandedWeaponIds(prev => ({ ...prev, [w.id]: !prev[w.id] }))}
                        getRarityStyle={getRarityStyle}
                        handleHandSelectChange={handleHandSelectChange}
                        handleWeaponEquipToggle={handleWeaponEquipToggle}
                      />
                    );
                  })
                )}
              </div>

            </div>
          )}
        </BaseCard>

        {/* 3. D&D 3.5e RAW Combat Quick-Rules Reference */}
        <BaseCard title="📜 D&amp;D 3.5e Combat Rules Reference">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '7.5px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--ink)' }}>
            <div style={{ background: 'rgba(200, 169, 110, 0.03)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '3px', padding: '4px 6px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px', marginBottom: '2px' }}>
                ⚔️ Melee &amp; Grips
              </div>
              <ul style={{ margin: 0, paddingLeft: '10px' }}>
                <li><strong>2-Hand (2H):</strong> Grants 1.5x STR bonus to damage.</li>
                <li><strong>Off-Hand:</strong> Grants 0.5x STR bonus to damage.</li>
                <li><strong>Keen:</strong> Doubles threat range (does not stack with <em>Imp. Critical</em>).</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(200, 169, 110, 0.03)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderRadius: '3px', padding: '4px 6px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8px', marginBottom: '2px' }}>
                🏹 Ranged &amp; Ammo
              </div>
              <ul style={{ margin: 0, paddingLeft: '10px' }}>
                <li><strong>Bows:</strong> No STR bonus to damage unless Composite.</li>
                <li><strong>Crossbows:</strong> No STR modifier to damage.</li>
                <li><strong>Point Blank:</strong> +1 Atk &amp; +1 Dmg within 30 ft.</li>
              </ul>
            </div>
          </div>
        </BaseCard>

      </div>

      {/* Double Weapon Selection Modal */}
      {doubleWeaponIdx !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(18, 11, 5, 0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 2500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="custom-alert-box"
            style={{
              background: 'var(--p)',
              border: '2px solid var(--pb)',
              borderRadius: '4px',
              padding: '16px 20px',
              width: '280px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              fontFamily: "'IM Fell English SC', serif",
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />
            
            <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px' }}>
              Equip Double Weapon
            </div>
            <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
            
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '11px', color: 'var(--ink)', lineHeight: '1.4', marginBottom: '12px', fontWeight: 500, textAlign: 'left' }}>
              How should this weapon be wielded?
              <ul style={{ margin: '6px 0', paddingLeft: '14px' }}>
                <li><strong>Two-handed:</strong> Wielded as a single weapon (1.5x Str bonus to damage).</li>
                <li><strong>Double weapon:</strong> Wielded with both ends (Primary side 1.0x Str, Off-hand side 0.5x Str as a light weapon).</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button className="btn btn-p" onClick={() => handleDoubleWeaponOption(false)} style={{ fontSize: '8.5px', padding: '4px', cursor: 'pointer' }}>Two-handed (Single Weapon)</button>
              <button className="btn btn-p" onClick={() => handleDoubleWeaponOption(true)} style={{ fontSize: '8.5px', padding: '4px', cursor: 'pointer' }}>Double Weapon (Both Ends)</button>
              <button className="btn" onClick={() => setDoubleWeaponIdx(null)} style={{ fontSize: '8.5px', padding: '4px', cursor: 'pointer', border: '1px solid var(--pb)', background: 'transparent', color: 'var(--inkl)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
