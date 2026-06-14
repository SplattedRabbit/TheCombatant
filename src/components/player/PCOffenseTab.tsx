/**
 * @module    PCOffenseTab
 * @summary   Rendert den Offense-Tab mit Ausrüstungsslots (Haupthand, Nebenhand, Rüstung), Waffenkammer, Rüstungskammer, BAB-Anzeige und CMB/CMD Werten.
 * @exports   PCOffenseTab
 * @reads     pc.weapons, pc.armors, pc.activeShape, pc.feats, pc.bab, pc.str, pc.dex, pc.isTotalDefense, pc.isSmiteActive, pc.isFavoredEnemyActive, pc.isSneakAttacking, pc.autoAC
 * @stateOps  togglePCWeaponEquip, togglePCArmorEquip, updatePCWeapon, deletePCWeapon, addPCWeapon, addPCArmor, removePCArmor, updatePCArmorField, setPCAutoAC, updatePCBatch
 * @depends   React, @core/state.js, @core/rules/AttackEngine.js, @core/models/Weapon.js, @core/data/armor-data.js, @core/ui/components/dialogs.js, src/components/shared/BaseCard
 * @notHere   Attribute & Multiclass -> PCAttributes.tsx | Fertigkeiten -> PCSkillsTab.tsx
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../shared/BaseCard';
// @ts-ignore
import { AttackEngine } from '@core/rules/AttackEngine.js';
// @ts-ignore
import { WeaponRegistry, matchesFeatOption, getCritThreatDisplay } from '@core/models/Weapon.js';
// @ts-ignore
import { ARMOR_REGISTRY } from '@core/data/armor-data.js';
// @ts-ignore
import { showAttackChoiceDialog, showDamageChoiceDialog, showRollBreakdown, showCustomConfirm } from '@core/ui/components/dialogs.js';

interface PCOffenseTabProps {
  pc: any; // Als any deklariert zur Laufzeit-Kompatibilität mit snapshot-serialisierten Klasseninstanzen
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
    
    // Finde Waffe in der Zielhand zum Tauschen
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

  // Double Weapon Ausrüstungsentscheidung bestätigen
  const handleDoubleWeaponOption = (isDouble: boolean) => {
    if (doubleWeaponIdx === null) return;
    CombatState.updatePCWeapon(doubleWeaponIdx, 'isDoubleWielded', isDouble);
    CombatState.togglePCWeaponEquip(doubleWeaponIdx);
    setDoubleWeaponIdx(null);
  };

  // Slot-Renderer (Haupthand, Nebenhand, Rüstung)
  const renderActiveSlot = (type: 'main' | 'off' | 'armor') => {
    if (type === 'main') {
      const w = mainHandWeapon;
      const rStyle = getRarityStyle(w ? w.enhancement : 0);
      if (!w) {
        return (
          <div className="arpg-slot main-hand-slot" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '5px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>⚔️</div>
            <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>Haupthand</div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Unbewaffnet)</div>
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
      const doubledCritDisplay = w.isNatural ? 'x2' : getCritThreatDisplay(w.critRange, w.critMult, isDoubleThreat);
      const dmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : (w.damage || '1w6');
      const extraDamage = w.extraDamage ? ` + ${w.extraDamage}` : '';

      return (
        <div className={`arpg-slot main-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
          <button className="unequip-slot-btn" onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Ablegen">✕</button>
          <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>Haupthand</div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={w.name}>{w.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0 3px' }}>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>{dmgDice}${extraDamage} • {doubledCritDisplay}</div>
            {w.type !== 'unarmed' && w.grip !== '2h' && w.grip !== '2H' && (
              <select
                className="cinput weapon-hand-select"
                value="main"
                onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
                style={{ fontSize: '7px', padding: '0 1px', height: '12px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', background: 'white', color: 'var(--ink)', marginTop: '1px', cursor: 'pointer' }}
              >
                <option value="main">Haupthand</option>
                <option value="off">Nebenhand</option>
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: '2px', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <button className="xbtn xbtn-dmg roll-atk-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollAttack(w, false, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }} title="Angriff ausführen">
              ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲
            </button>
            <button className="xbtn xbtn-heal roll-dmg-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollDamage(w, false, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, borderColor: '#2a6a2a', color: '#1a4a1a', whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}>
              DMG ({formatMod(stdAtkObj.dmgTotal)})
            </button>
          </div>
        </div>
      );
    }
    
    if (type === 'off') {
      const w = offHandWeapon;
      const sh = equippedShield;
      const rStyle = getRarityStyle(sh ? sh.enhancement : (w ? w.enhancement : 0));

      if (!sh && !w) {
        return (
          <div className="arpg-slot off-hand-slot" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '5px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>🛡️</div>
            <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>Nebenhand</div>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Leer)</div>
          </div>
        );
      }

      if (sh) {
        return (
          <div className={`arpg-slot off-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
            <button className="unequip-slot-btn" onClick={() => CombatState.togglePCArmorEquip(pc.armor.indexOf(sh))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Ablegen">✕</button>
            <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>Nebenhand</div>
            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={sh.name}>{sh.name}</div>
            <div style={{ fontSize: '7.5px', color: 'var(--inkm)', marginTop: '2px', lineHeight: 1.2 }}>+{sh.acBonus} RK (Schild)</div>
            <div style={{ fontSize: '6.5px', color: 'var(--inkm)', lineHeight: 1 }}>Malus: -{sh.checkPenalty ?? 0}</div>
          </div>
        );
      }

      // Waffe in Nebenhand
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
      const doubledCritDisplay = getCritThreatDisplay(w.critRange, w.critMult, isDoubleThreat);
      const dmgDice = typeof pc.getWeaponDamageDice === 'function' ? pc.getWeaponDamageDice(w) : (w.damage || '1w6');
      const extraDamage = w.extraDamage ? ` + ${w.extraDamage}` : '';
      const offhandLabel = isDoubleWielded ? 'Nebenhand (Nebenseite)' : 'Nebenhand';

      return (
        <div className={`arpg-slot off-hand-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
          <button className="unequip-slot-btn" onClick={() => CombatState.togglePCWeaponEquip(pc.weapons.indexOf(w))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Ablegen">✕</button>
          <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>{offhandLabel}</div>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={isDoubleWielded ? w.name + ' (Nebenseite)' : w.name}>
            {isDoubleWielded ? w.name + ' (Nebenseite)' : w.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', margin: '1px 0 3px' }}>
            <div style={{ fontSize: '7px', color: 'var(--inkm)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} title={`${dmgDice}${extraDamage} • ${doubledCritDisplay}`}>{dmgDice}${extraDamage} • {doubledCritDisplay}</div>
            {!isDoubleWielded && w.grip !== '2h' && w.grip !== '2H' && (
              <select
                className="cinput weapon-hand-select"
                value="off"
                onChange={(e) => handleHandSelectChange(pc.weapons.indexOf(w), e.target.value)}
                style={{ fontSize: '7px', padding: '0 1px', height: '12px', lineHeight: 1, borderRadius: '1px', border: '0.5px solid var(--pb)', outline: 'none', background: 'white', color: 'var(--ink)', marginTop: '1px', cursor: 'pointer' }}
              >
                <option value="main">Haupthand</option>
                <option value="off">Nebenhand</option>
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: '2px', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <button className="xbtn xbtn-dmg roll-atk-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollAttack(w, true, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }} title="Angriff ausführen">
              ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲
            </button>
            <button className="xbtn xbtn-heal roll-dmg-btn" disabled={pc.isTotalDefense} onClick={(e) => handleRollDamage(w, true, e)} style={{ padding: '1px 2px', fontSize: '6.5px', fontWeight: 'bold', flex: 1, borderColor: '#2a6a2a', color: '#1a4a1a', whiteSpace: 'nowrap', height: '15px', lineHeight: 1, opacity: pc.isTotalDefense ? 0.4 : 1, cursor: pc.isTotalDefense ? 'not-allowed' : 'pointer' }}>
              DMG ({formatMod(stdAtkObj.dmgTotal)})
            </button>
          </div>
        </div>
      );
    }

    // armor
    const a = equippedArmor;
    const rStyle = getRarityStyle(a ? a.enhancement : 0);
    if (!a) {
      return (
        <div className="arpg-slot armor-slot" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '5px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--inkl)', marginBottom: '1px', opacity: 0.6 }}>👕</div>
          <div style={{ fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif" }}>Rüstung</div>
          <div style={{ fontSize: '7px', color: 'var(--inkm)', fontStyle: 'italic' }}>(Keine)</div>
        </div>
      );
    }

    const maxDexDisplay = a.maxDex !== null && a.maxDex !== undefined ? a.maxDex : '—';
    return (
      <div className={`arpg-slot armor-slot ${rStyle.glowClass}`} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '82px', border: rStyle.border, borderRadius: '4px', padding: '5px 6px', textAlign: 'center', background: rStyle.background, boxShadow: rStyle.boxShadow }}>
        <button className="unequip-slot-btn" onClick={() => CombatState.togglePCArmorEquip(pc.armor.indexOf(a))} style={{ position: 'absolute', top: '2px', right: '4px', border: 'none', background: 'transparent', fontSize: '7.5px', cursor: 'pointer', color: 'var(--red)', padding: 0 }} title="Ablegen">✕</button>
        <div style={{ fontSize: '6.5px', color: 'var(--inkl)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: "'IM Fell English SC', serif", marginBottom: '1px', opacity: 0.8 }}>Rüstung</div>
        <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', textShadow: '0 0 1px rgba(139,26,26,0.1)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }} title={a.name}>{a.name}</div>
        <div style={{ fontSize: '7.5px', color: 'var(--inkm)', marginTop: '2px', lineHeight: 1.2 }}>+{a.acBonus} RK</div>
        <div style={{ fontSize: '6.5px', color: 'var(--inkm)', lineHeight: 1 }}>Dex-Lim: {maxDexDisplay} | Malus: -{a.checkPenalty ?? 0}</div>
      </div>
    );
  };

  const cmbTooltip = `Kampfmanöver-Bonus (CMB):\nBasisangriffswert (BAB): ${formatMod(babVal)}\nStärke-Mod: ${formatMod(strMod)}\nGrößen-Mod: ${formatMod(sizeMod)}`;
  const cmdTooltip = `Kampfmanöver-Abwehr (CMD):\nBasiswert: 10\nBasisangriffswert (BAB): ${formatMod(babVal)}\nStärke-Mod: ${formatMod(strMod)}\nGeschick-Mod: ${formatMod(dexMod)}\nGrößen-Mod: ${formatMod(sizeMod)}`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Linke Spalte: Aktive Ausrüstung & Kampfbalken */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <BaseCard title="⚔️ Aktive Ausrüstung">
          {pc.activeShape !== 'none' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ background: 'rgba(200, 169, 110, 0.04)', border: '0.5px solid var(--pb)', borderRadius: '4px', padding: '8px 10px', textAlign: 'center', fontStyle: 'italic', color: 'var(--inkl)', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', marginBottom: '8px' }}>
                In wilder Gestalt (Wild Shape) ist deine normale Ausrüstung inaktiv. Verwende deine natürlichen Waffen.
              </div>
              <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8px', color: 'var(--inkl)', paddingBottom: '2px', borderBottom: '0.5px solid var(--pb)', marginBottom: '4px', fontWeight: 'bold' }}>
                🐾 Natürliche Angriffe (Wild Shape)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {equippedWeapons.filter((w: any) => w.isNatural).map((w: any, idx: number) => {
                  const seq = AttackEngine.calculateAttackSequence(pc, w, false);
                  const stdAtkObj = seq[0] || { atkTotal: 0, dmgTotal: 0 };
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', borderRadius: '2px', fontSize: '8.5px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--red)' }}>{w.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="xbtn xbtn-dmg" onClick={(e) => handleRollAttack(w, false, e)} style={{ fontSize: '7.5px', padding: '2px 4px' }}>ATK ({formatMod(stdAtkObj.atkTotal)}) 🎲</button>
                        <button className="xbtn xbtn-heal" onClick={(e) => handleRollDamage(w, false, e)} style={{ fontSize: '7.5px', padding: '2px 4px', borderColor: '#2a6a2a', color: '#1a4a1a' }}>DMG ({w.damage})</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '6px', background: 'rgba(200, 169, 110, 0.04)', border: '0.5px solid var(--pb)', borderRadius: '4px' }}>
              {renderActiveSlot('main')}
              {renderActiveSlot('armor')}
              {renderActiveSlot('off')}
            </div>
          )}
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
                  {Array.isArray(pc.weapons) && pc.weapons.map((w: any, idx: number) => {
                    const rStyle = getRarityStyle(w.enhancement);
                    const isExpanded = !!expandedWeaponIds[w.id];
                    return (
                      <div key={w.id || idx} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <div
                          className={`stash-item-card ${rStyle.glowClass}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            border: rStyle.border,
                            borderRadius: '4px',
                            padding: '5px 6px',
                            background: rStyle.background,
                            boxShadow: rStyle.boxShadow,
                            position: 'relative',
                            marginTop: w.equipped ? '6px' : 0
                          }}
                        >
                          {w.equipped && (
                            <span style={{ position: 'absolute', top: '-6px', left: '8px', fontSize: '6px', color: '#ffffff', background: '#2a6a2a', borderRadius: '2px', padding: '1px 4px', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', zIndex: 10 }}>Ausgerüstet</span>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <input
                              type="text"
                              value={w.name}
                              onChange={(e) => CombatState.updatePCWeapon(idx, 'name', e.target.value)}
                              className="cinput"
                              placeholder="Name"
                              style={{ fontSize: '9px', height: '18px', padding: '0 4px', flex: 1, fontWeight: 'bold', borderColor: 'rgba(200, 169, 110, 0.25)' }}
                            />
                            <button
                              onClick={() => CombatState.deletePCWeapon(idx)}
                              style={{ border: 'none', background: 'transparent', fontSize: '10px', cursor: 'pointer', height: '18px', width: '18px', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              ✕
                            </button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <select
                              value={w.type}
                              onChange={(e) => CombatState.updatePCWeapon(idx, 'type', e.target.value)}
                              className="cinput"
                              style={{ fontSize: '7.5px', padding: '0 2px', height: '16px', flex: 1.2, cursor: 'pointer' }}
                            >
                              {Object.values(WeaponRegistry).map((def: any) => (
                                <option key={def.key} value={def.key}>{def.nameDe}</option>
                              ))}
                            </select>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1px', flex: 0.6 }}>
                              <span style={{ fontSize: '7.5px', color: 'var(--inkm)' }}>+</span>
                              <input
                                type="number"
                                value={w.enhancement}
                                onChange={(e) => CombatState.updatePCWeapon(idx, 'enhancement', parseInt(e.target.value) || 0)}
                                className="cinput"
                                style={{ fontSize: '8px', height: '16px', width: '20px', padding: 0, textAlign: 'center' }}
                              />
                            </div>
                            {w.grip === '2h' || w.grip === '2H' ? (
                              <select className="cinput" disabled style={{ fontSize: '7.5px', height: '16px', flex: 1.1, opacity: 0.65, background: 'rgba(200,169,110,0.05)', textAlign: 'center' }}>
                                <option>Zweihändig</option>
                              </select>
                            ) : w.grip === 'rng' ? (
                              <select className="cinput" disabled style={{ fontSize: '7.5px', height: '16px', flex: 1.1, opacity: 0.65, background: 'rgba(200,169,110,0.05)', textAlign: 'center' }}>
                                <option>Fernkampf</option>
                              </select>
                            ) : (
                              <select
                                value={w.hand || 'main'}
                                onChange={(e) => handleHandSelectChange(idx, e.target.value)}
                                className="cinput"
                                style={{ fontSize: '7.5px', padding: '0 1px', height: '16px', flex: 1.1, cursor: 'pointer' }}
                              >
                                <option value="main">Haupthand</option>
                                <option value="off">Nebenhand</option>
                              </select>
                            )}
                            <button
                              className="xbtn equip-btn"
                              onClick={() => handleWeaponEquipToggle(idx, w)}
                              style={{ padding: '0 6px', fontSize: '7.5px', fontWeight: 'bold', height: '16px', borderRadius: '2px' }}
                            >
                              {w.equipped ? 'Ablegen' : 'Anlegen'}
                            </button>
                            <button
                              className="xbtn"
                              onClick={() => setExpandedWeaponIds(prev => ({ ...prev, [w.id]: !prev[w.id] }))}
                              style={{ padding: 0, border: 'none', background: 'transparent', fontSize: '11px', cursor: 'pointer', height: '16px', width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--inkm)' }}
                            >
                              ⚙️
                            </button>
                          </div>
                        </div>

                        {/* Weapon Detail Drawer */}
                        {isExpanded && (
                          <div style={{ display: 'flex', background: 'rgba(200,169,110,0.02)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderTop: 'none', padding: '4px 6px', fontSize: '8px', marginTop: '-2px', marginBottom: '2px', borderRadius: '0 0 3px 3px', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ color: 'var(--inkl)' }}>Zusatz-Atk:</span>
                                <input
                                  type="text"
                                  value={w.attackBonus || ''}
                                  onChange={(e) => CombatState.updatePCWeapon(idx, 'attackBonus', e.target.value)}
                                  className="cinput"
                                  placeholder="+0"
                                  style={{ width: '32px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
                                />
                              </div>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', color: 'var(--inkm)', margin: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={w.isKeen || false}
                                  onChange={(e) => CombatState.updatePCWeapon(idx, 'isKeen', e.target.checked)}
                                  style={{ margin: 0, width: '10px', height: '10px' }}
                                />
                                Scharf (Keen)
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, minWidth: '150px' }}>
                                <span style={{ color: 'var(--inkl)', flexShrink: 0 }}>Zusatz-Schaden:</span>
                                <select
                                  value={w.extraDamageDice || ''}
                                  onChange={(e) => CombatState.updatePCWeapon(idx, 'extraDamageDice', e.target.value)}
                                  className="cinput"
                                  style={{ fontSize: '7.5px', height: '14px', padding: '0 1px', width: '45px', flexShrink: 0, cursor: 'pointer' }}
                                >
                                  <option value="">Kein</option>
                                  {['1w2', '1w3', '1w4', '1w6', '1w8', '1w10', '1w12', '2w4', '2w6', '2w8', '2w10', '3w6', '3w8', '4w6'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                                <select
                                  value={w.extraDamageType || ''}
                                  onChange={(e) => CombatState.updatePCWeapon(idx, 'extraDamageType', e.target.value)}
                                  className="cinput"
                                  style={{ fontSize: '7.5px', height: '14px', padding: '0 1px', flex: 1, minWidth: 0, cursor: 'pointer' }}
                                >
                                  <option value="">—</option>
                                  {['Feuer', 'Kälte', 'Elektrizität', 'Säure', 'Schall', 'Wucht', 'Stich', 'Schnitt', 'Kraft', 'Gottgeweiht'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ color: 'var(--inkl)' }}>Grip-Abw.:</span>
                                <select
                                  value={w.gripOverride || ''}
                                  onChange={(e) => CombatState.updatePCWeapon(idx, 'gripOverride', e.target.value)}
                                  className="cinput"
                                  style={{ fontSize: '7.5px', height: '14px', padding: '0 1px', cursor: 'pointer' }}
                                >
                                  <option value="">Standard</option>
                                  <option value="1h">1-Hand</option>
                                  <option value="2h">2-Hand</option>
                                  <option value="sec">Schildh</option>
                                  <option value="rng">Fernk</option>
                                  <option value="unarmed">Waffenlos</option>
                                </select>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ color: 'var(--inkl)' }}>Schadens-Abw.:</span>
                                <select
                                  value={w.damageDiceOverride || ''}
                                  onChange={(e) => CombatState.updatePCWeapon(idx, 'damageDiceOverride', e.target.value)}
                                  className="cinput"
                                  style={{ fontSize: '7.5px', height: '14px', padding: '0 1px', cursor: 'pointer' }}
                                >
                                  <option value="">Standard</option>
                                  {['1w2', '1w3', '1w4', '1w6', '1w8', '1w10', '1w12', '2w4', '2w6', '2w8', '2w10', '3w6', '3w8', '4w6'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ color: 'var(--inkl)' }}>Krit-Abw.:</span>
                                <input
                                  type="text"
                                  value={w.critOverride || ''}
                                  onChange={(e) => CombatState.updatePCWeapon(idx, 'critOverride', e.target.value)}
                                  className="cinput"
                                  placeholder="Standard"
                                  style={{ width: '70px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                  {Array.isArray(pc.armor) && pc.armor.map((a: any, idx: number) => {
                    const rStyle = getRarityStyle(a.enhancement);
                    const isExpanded = !!expandedArmorIds[a.id];
                    return (
                      <div key={a.id || idx} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <div
                          className={`stash-item-card ${rStyle.glowClass}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            border: rStyle.border,
                            borderRadius: '4px',
                            padding: '5px 6px',
                            background: rStyle.background,
                            boxShadow: rStyle.boxShadow,
                            position: 'relative',
                            marginTop: a.equipped ? '6px' : 0
                          }}
                        >
                          {a.equipped && (
                            <span style={{ position: 'absolute', top: '-6px', left: '8px', fontSize: '6px', color: '#ffffff', background: '#2a6a2a', borderRadius: '2px', padding: '1px 4px', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', zIndex: 10 }}>Ausgerüstet</span>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <input
                              type="text"
                              value={a.name}
                              onChange={(e) => CombatState.updatePCArmorField(idx, 'name', e.target.value)}
                              className="cinput"
                              placeholder="Name"
                              style={{ fontSize: '9px', height: '18px', padding: '0 4px', flex: 1, fontWeight: 'bold', borderColor: 'rgba(200, 169, 110, 0.25)' }}
                            />
                            <button
                              onClick={() => CombatState.removePCArmor(idx)}
                              style={{ border: 'none', background: 'transparent', fontSize: '10px', cursor: 'pointer', height: '18px', width: '18px', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              ✕
                            </button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <select
                              value={a.type}
                              onChange={(e) => CombatState.updatePCArmorField(idx, 'type', e.target.value)}
                              className="cinput"
                              style={{ fontSize: '7.5px', padding: '0 2px', height: '16px', flex: 1.2, cursor: 'pointer' }}
                            >
                              {Object.values(ARMOR_REGISTRY).map((def: any) => (
                                <option key={def.key} value={def.key}>{def.nameDe}</option>
                              ))}
                            </select>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1px', flex: 0.8 }}>
                              <span style={{ fontSize: '7.5px', color: 'var(--inkm)' }}>+</span>
                              <input
                                type="number"
                                value={a.enhancement}
                                onChange={(e) => CombatState.updatePCArmorField(idx, 'enhancement', parseInt(e.target.value) || 0)}
                                className="cinput"
                                style={{ fontSize: '8px', height: '16px', width: '22px', padding: 0, textAlign: 'center' }}
                              />
                            </div>
                            <button
                              className="xbtn equip-btn"
                              onClick={() => handleArmorEquipToggle(idx, a)}
                              style={{ padding: '0 6px', fontSize: '7.5px', fontWeight: 'bold', height: '16px', borderRadius: '2px' }}
                            >
                              {a.equipped ? 'Ablegen' : 'Anlegen'}
                            </button>
                            <button
                              className="xbtn"
                              onClick={() => setExpandedArmorIds(prev => ({ ...prev, [a.id]: !prev[a.id] }))}
                              style={{ padding: 0, border: 'none', background: 'transparent', fontSize: '11px', cursor: 'pointer', height: '16px', width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--inkm)' }}
                            >
                              ⚙️
                            </button>
                          </div>
                        </div>

                        {/* Armor Detail Drawer */}
                        {isExpanded && (
                          <div style={{ display: 'flex', background: 'rgba(200,169,110,0.02)', border: '0.5px solid rgba(200, 169, 110, 0.2)', borderTop: 'none', padding: '4px 6px', fontSize: '8px', marginTop: '-2px', marginBottom: '2px', borderRadius: '0 0 3px 3px', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ color: 'var(--inkl)' }}>RK-Abw.:</span>
                                <input
                                  type="text"
                                  value={a.armorBonusOverride || ''}
                                  onChange={(e) => CombatState.updatePCArmorField(idx, 'armorBonusOverride', e.target.value)}
                                  className="cinput"
                                  placeholder="Standard"
                                  style={{ width: '45px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ color: 'var(--inkl)' }}>MaxDex-Abw.:</span>
                                <input
                                  type="text"
                                  value={a.maxDexOverride || ''}
                                  onChange={(e) => CombatState.updatePCArmorField(idx, 'maxDexOverride', e.target.value)}
                                  className="cinput"
                                  placeholder="Standard"
                                  style={{ width: '45px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ color: 'var(--inkl)' }}>Malus-Abw.:</span>
                                <input
                                  type="text"
                                  value={a.checkPenaltyOverride || ''}
                                  onChange={(e) => CombatState.updatePCArmorField(idx, 'checkPenaltyOverride', e.target.value)}
                                  className="cinput"
                                  placeholder="Standard"
                                  style={{ width: '45px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
                                />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ color: 'var(--inkl)' }}>Zauberpatzer-Abw.:</span>
                                <input
                                  type="text"
                                  value={a.spellFailureOverride || ''}
                                  onChange={(e) => CombatState.updatePCArmorField(idx, 'spellFailureOverride', e.target.value)}
                                  className="cinput"
                                  placeholder="Standard"
                                  style={{ width: '45px', fontSize: '8px', height: '14px', textAlign: 'center', padding: 0 }}
                                />
                                <span style={{ color: 'var(--inkm)' }}>%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
