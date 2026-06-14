/**
 * @module    PCOffenseTab
 * @summary   Rendert den Offense-Tab mit Ausrüstungsslots, Waffenkammer, Rüstungskammer, BAB-Anzeige und CMB/CMD Werten.
 * @exports   PCOffenseTab
 * @reads     pc.weapons, pc.armor, pc.activeShape, pc.feats, pc.bab, pc.str, pc.dex, pc.isTotalDefense, pc.isSmiteActive, pc.isFavoredEnemyActive, pc.isSneakAttacking, pc.autoAC
 * @stateOps  togglePCWeaponEquip, togglePCArmorEquip, updatePCWeapon, deletePCWeapon, addPCWeapon, addPCArmor, removePCArmor, updatePCArmorField, setPCAutoAC, updatePCBatch
 * @depends   React, @core/state.js, @core/rules/AttackEngine.js, @core/models/Weapon.js, src/components/shared/BaseCard, src/components/player/offense/ActiveEquipmentSlots, src/components/player/offense/WeaponStashCard, src/components/player/offense/ArmorStashCard
 * @notHere   Ausrüstungs-Slots -> ActiveEquipmentSlots.tsx | Waffen-Stash-Card -> WeaponStashCard.tsx | Rüstungs-Stash-Card -> ArmorStashCard.tsx
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../shared/BaseCard';
// @ts-ignore
import { AttackEngine } from '@core/rules/AttackEngine.js';
// @ts-ignore
import { WeaponRegistry, matchesFeatOption } from '@core/models/Weapon.js';
// @ts-ignore
import { showAttackChoiceDialog, showDamageChoiceDialog, showRollBreakdown, showCustomConfirm } from '@core/ui/components/dialogs.js';

import { ActiveEquipmentSlots } from './offense/ActiveEquipmentSlots';
import { WeaponStashCard } from './offense/WeaponStashCard';
import { ArmorStashCard } from './offense/ArmorStashCard';

interface PCOffenseTabProps {
  pc: any; // snapshotted instance runtime compatibility
}

export const PCOffenseTab: React.FC<PCOffenseTabProps> = ({ pc }) => {
  // Local UI States
  const [expandedWeaponIds, setExpandedWeaponIds] = useState<Record<string, boolean>>({});
  const [expandedArmorIds, setExpandedArmorIds] = useState<Record<string, boolean>>({});
  const [doubleWeaponIdx, setDoubleWeaponIdx] = useState<number | null>(null);

  // Hilfsfunktionen
  const formatMod = (val: number) => (val >= 0 ? `+${val}` : `${val}`);
  
  const getAblMod = (stat: any) => stat ? stat.mod : 0;
  const strMod = getAblMod(pc.str);
  const dexMod = getAblMod(pc.dex);
  const babVal = typeof pc.bab === 'number' ? pc.bab : (pc.bab?.total ?? 0);

  // CMB / CMD Berechnungen
  const getCMBSizeModifier = () => {
    if (pc.activeShape === 'bear') return 1; // Bär ist Large (+1 CMB/CMD)
    const race = (pc.race || '').toLowerCase();
    if (race === 'gnome' || race === 'halfling') return -1; // Klein (-1 CMB/CMD)
    return 0;
  };
  const sizeMod = getCMBSizeModifier();
  const cmb = babVal + strMod + sizeMod;
  const cmd = 10 + babVal + strMod + dexMod + sizeMod;

  // Equipment slots filtern
  const equippedWeapons = Array.isArray(pc.weapons) ? pc.weapons.filter((w: any) => w.equipped) : [];
  const mainHandWeapon = equippedWeapons.find((w: any) => w.hand === 'main') || equippedWeapons.find((w: any) => w.hand !== 'off') || null;
  let offHandWeapon = equippedWeapons.find((w: any) => w.hand === 'off' || w.grip === 'sec') || null;
  let isDoubleWielded = false;
  if (mainHandWeapon && (mainHandWeapon as any).isDoubleWielded) {
    offHandWeapon = mainHandWeapon;
    isDoubleWielded = true;
  }
  
  const equippedArmor = Array.isArray(pc.armor) ? pc.armor.find((a: any) => a.equipped && !(a as any).isShield) : null;
  const equippedShield = Array.isArray(pc.armor) ? pc.armor.find((a: any) => a.equipped && (a as any).isShield) : null;

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
    if (w.equipped) {
      CombatState.togglePCWeaponEquip(idx);
      return;
    }
    
    // Warnung bei Nebenhand-Waffe ohne TWF
    if (w.hand === 'off') {
      const hasTWF = pc.feats && (
        pc.feats.some((f: any) => f.id === 'two_weapon_fighting') ||
        (() => {
          const armor = typeof pc.getEquippedArmor === 'function' ? pc.getEquippedArmor() : null;
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
          "Kein Zwei-Waffen-Kampf",
          "Dein Charakter besitzt nicht das Talent 'Zwei-Waffen-Kampf'. Das Führen einer Waffe in der Nebenhand führt zu schweren Abzügen auf Angriffe. Trotzdem fortfahren?",
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

  const handleArmorEquipToggle = (idx: number, a: any) => {
    const equipping = !a.equipped;
    CombatState.togglePCArmorEquip(idx);
    
    if (equipping && !pc.autoAC) {
      showCustomConfirm(
        "Auto-RK aktivieren?",
        "Möchtest du die automatische Rüstungsklasse-Berechnung (Auto-RK) für diesen Charakter aktivieren?",
        () => {
          CombatState.setPCAutoAC(true);
        }
      );
    }
  };

  const handleHandSelectChange = (idx: number, val: string) => {
    const targetWeapon = pc.weapons[idx];
    if (!targetWeapon) return;
    
    const oldHand = targetWeapon.hand || 'main';
    if (oldHand === val) return;
    
    const otherWeapon = pc.weapons.find((w: any, i: number) => w.equipped && i !== idx && (w.hand === val || (val === 'main' && w.hand !== 'off')));
    const otherIdx = otherWeapon ? pc.weapons.indexOf(otherWeapon) : null;
    
    CombatState.updatePCBatch((freshPC: any) => {
      freshPC.weapons[idx].hand = val;
      if (otherIdx !== null) {
        freshPC.weapons[otherIdx].hand = oldHand;
      }
    });
  };

  // Roll Attack / Damage
  const handleRollAttack = (w: any, isOffhand = false, e: React.MouseEvent) => {
    if (pc.isTotalDefense) return;
    showAttackChoiceDialog(pc, w, e.nativeEvent, isOffhand ? { isOffhandAttack: true } : {});
  };

  const handleRollDamage = (w: any, isOffhand = false, e: React.MouseEvent) => {
    if (pc.isTotalDefense) return;
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
      const wName = isOffhand && isDoubleWielded ? `${w.name} (Nebenseite)` : w.name;
      showRollBreakdown(`${wName} (Schaden)`, stdAtkObj.damageDice, stdAtkObj.dmgBreakdown, e.nativeEvent);
    }
  };

  const handleDoubleWeaponOption = (isDouble: boolean) => {
    if (doubleWeaponIdx === null) return;
    CombatState.updatePCWeapon(doubleWeaponIdx, 'isDoubleWielded', isDouble);
    CombatState.togglePCWeaponEquip(doubleWeaponIdx);
    setDoubleWeaponIdx(null);
  };

  const cmbTooltip = `Kampfmanöver-Bonus (CMB):\nBasisangriffswert (BAB): ${formatMod(babVal)}\nStärke-Mod: ${formatMod(strMod)}\nGrößen-Mod: ${formatMod(sizeMod)}`;
  const cmdTooltip = `Kampfmanöver-Abwehr (CMD):\nBasiswert: 10\nBasisangriffswert (BAB): ${formatMod(babVal)}\nStärke-Mod: ${formatMod(strMod)}\nGeschick-Mod: ${formatMod(dexMod)}\nGrößen-Mod: ${formatMod(sizeMod)}`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Linke Spalte: Aktive Ausrüstung & Kampfbalken */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <BaseCard title="⚔️ Aktive Ausrüstung">
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

        {/* BAB / CMB / CMD */}
        <BaseCard title="🛡️ Kampfwerte">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: 'rgba(0,0,0,0.02)', border: '0.5px solid var(--pb)', borderRadius: '2px' }}>
              <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: 'var(--inkm)' }}>⚔️ Basisangriff (BAB):</span>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>{formatMod(babVal)}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '6px' }}>
              <div
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px', border: '0.5px solid var(--pb)', borderRadius: '2px', background: 'rgba(200,169,110,0.05)', cursor: 'help' }}
                title={cmbTooltip}
              >
                <span style={{ fontSize: '7px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase' }}>CMB</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", marginTop: '2px' }}>{formatMod(cmb)}</span>
              </div>
              
              <div
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px', border: '0.5px solid var(--pb)', borderRadius: '2px', background: 'rgba(200,169,110,0.05)', cursor: 'help' }}
                title={cmdTooltip}
              >
                <span style={{ fontSize: '7px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase' }}>CMD</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", marginTop: '2px' }}>{cmd}</span>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      {/* Rechte Spalte: Rucksack & Inventar */}
      <div>
        <BaseCard title="🎒 Rucksack &amp; Inventar">
          {pc.activeShape !== 'none' ? (
            <div style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic', color: 'var(--inkl)', fontSize: '8.5px' }}>
              In wilder Gestalt (Wild Shape) ist deine Ausrüstung inaktiv.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Waffenkammer */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--pb)', marginBottom: '4px', paddingBottom: '2px' }}>
                  <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>⚔️ Waffenkammer</span>
                  <button
                    className="btn"
                    onClick={() => CombatState.addPCWeapon()}
                    style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '7.5px', padding: '1px 5px', height: '14px', lineHeight: 1 }}
                  >
                    ➕ Waffe
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '220px', overflowY: 'auto', paddingRight: '2px' }}>
                  {Array.isArray(pc.weapons) && pc.weapons.map((w: any, idx: number) => (
                    <WeaponStashCard
                      key={w.id || idx}
                      w={w}
                      idx={idx}
                      isExpanded={!!expandedWeaponIds[w.id]}
                      onToggleExpand={() => setExpandedWeaponIds(prev => ({ ...prev, [w.id]: !prev[w.id] }))}
                      getRarityStyle={getRarityStyle}
                      handleHandSelectChange={handleHandSelectChange}
                      handleWeaponEquipToggle={handleWeaponEquipToggle}
                    />
                  ))}
                </div>
              </div>

              {/* Rüstungskammer */}
              <div style={{ marginTop: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--pb)', marginBottom: '4px', paddingBottom: '2px' }}>
                  <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>🛡️ Rüstungskammer</span>
                  <button
                    className="btn"
                    onClick={() => CombatState.addPCArmor('padded')}
                    style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '7.5px', padding: '1px 5px', height: '14px', lineHeight: 1 }}
                  >
                    ➕ Rüstung
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
                  {Array.isArray(pc.armor) && pc.armor.map((a: any, idx: number) => (
                    <ArmorStashCard
                      key={a.id || idx}
                      a={a}
                      idx={idx}
                      isExpanded={!!expandedArmorIds[a.id]}
                      onToggleExpand={() => setExpandedArmorIds(prev => ({ ...prev, [a.id]: !prev[a.id] }))}
                      getRarityStyle={getRarityStyle}
                      handleArmorEquipToggle={handleArmorEquipToggle}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
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
            <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }}></div>
            
            <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px' }}>
              Doppelwaffe ausrüsten
            </div>
            <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
            
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '11px', color: 'var(--ink)', lineHeight: '1.4', marginBottom: '12px', fontWeight: 500, textAlign: 'left' }}>
              Wie soll diese Waffe geführt werden?
              <ul style={{ margin: '6px 0', paddingLeft: '14px' }}>
                <li><strong>Zweihändig:</strong> Als Einzelwaffe geführt (1.5x Stärkebonus auf Schaden).</li>
                <li><strong>Doppelwaffe:</strong> Mit beiden Enden geführt (Hauptseite 1.0x Stärke, Nebenseite 0.5x Stärke als leichte Waffe).</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button className="btn btn-p" onClick={() => handleDoubleWeaponOption(false)} style={{ fontSize: '8.5px', padding: '4px', cursor: 'pointer' }}>Zweihändig (Einzelwaffe)</button>
              <button className="btn btn-p" onClick={() => handleDoubleWeaponOption(true)} style={{ fontSize: '8.5px', padding: '4px', cursor: 'pointer' }}>Doppelwaffe (Beide Enden)</button>
              <button className="btn" onClick={() => setDoubleWeaponIdx(null)} style={{ fontSize: '8.5px', padding: '4px', cursor: 'pointer', border: '1px solid var(--pb)', background: 'transparent', color: 'var(--inkl)' }}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
