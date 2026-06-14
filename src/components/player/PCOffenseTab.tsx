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
import { showAttackChoiceDialog, showDamageChoiceDialog, showRollBreakdown, showCustomConfirm, showCustomAlert } from '@core/ui/components/dialogs.js';

import { ActiveEquipmentSlots } from './offense/ActiveEquipmentSlots';
import { WeaponStashCard } from './offense/WeaponStashCard';
import { ArmorStashCard } from './offense/ArmorStashCard';

const getEquippedArmorFallback = (pc: any) => {
  if (typeof pc.getEquippedArmor === 'function') return pc.getEquippedArmor();
  if (Array.isArray(pc.armors)) {
    return pc.armors.find((a: any) => a.isEquipped && !a.isShield) || null;
  }
  return null;
};

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
  

  const babVal = typeof pc.bab === 'number' ? pc.bab : (typeof pc.bab?.getValue === 'function' ? pc.bab.getValue() : 0);



  // Equipment slots filtern
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
    
    // Warnung bei Nebenhand-Waffe ohne TWF
    if (w.hand === 'off') {
      const hasTWF = pc.feats && (
        pc.feats.some((f: any) => f.id === 'two_weapon_fighting') ||
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
    const equipping = !a.isEquipped;
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
    
    const otherWeapon = pc.weapons.find((w: any, i: number) => w.isEquipped && i !== idx && (w.hand === val || (val === 'main' && w.hand !== 'off')));
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

  const handleDefensiveFightingChange = (checked: boolean) => {
    CombatState.togglePCDefensiveFighting(checked);
  };

  const handleTotalDefenseChange = (checked: boolean) => {
    CombatState.togglePCTotalDefense(checked);
  };

  const handlePowerAttackChange = (val: number) => {
    const limit = babVal;
    const penalty = Math.max(0, Math.min(limit, val || 0));
    CombatState.updatePCField('powerAttackPenalty', penalty);
  };

  const handleCombatExpertiseChange = (val: number) => {
    const limit = Math.min(5, babVal);
    const penalty = Math.max(0, Math.min(limit, val || 0));
    CombatState.updatePCField('combatExpertisePenalty', penalty);
  };

  const handleSmiteChange = (checked: boolean) => {
    CombatState.updatePCField('isSmiteActive', checked);
  };

  const handleFavoredEnemyChange = (checked: boolean) => {
    CombatState.updatePCField('isFavoredEnemyActive', checked);
  };

  const handleSneakAttackChange = (checked: boolean) => {
    CombatState.updatePCField('isSneakAttacking', checked);
  };

  const showCombatExpertiseRules = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showCustomAlert(
      "Kampfgetümmel (Combat Expertise)",
      `<div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
        <p><strong>Konzept:</strong> Du kannst deine offensive Genauigkeit opfern, um eine stärkere Rüstungsklasse aufzubauen.</p>
        <p><strong>Regel (D&D 3.5 RAW):</strong> Wenn du einen Angriff oder einen vollen Angriff deklarierst, kannst du einen Malus auf deine Angriffswürfe (bis zu deinem aktuellen GAB, maximal jedoch -5) wählen. Dieser Malus wird als Ausweichbonus (Dodge) auf deine Rüstungsklasse (RK) und Berührungs-RK bis zu deiner nächsten Runde addiert.</p>
        <p><strong>Obergrenzen:</strong> Der gewählte Malus darf deinen Grundangriffsbonus (GAB) nicht überschreiten und ist generell durch das Talent auf maximal -5 begrenzt.</p>
      </div>`,
      "Verstanden",
      "🛡️"
    );
  };

  const showDefensiveFightingRules = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showCustomAlert(
      "Verteidigend kämpfen (Defensive Fighting)",
      `<div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
        <p><strong>Konzept:</strong> Ein grundlegendes Kampfmanöver, das jeder Charakter im Nahkampf (auch ohne spezielle Talente) ausführen kann.</p>
        <p><strong>Regel (D&D 3.5 RAW):</strong> Wenn du angreifst (als Standardaktion oder voller Angriff), kannst du dich entscheiden, verteidigend zu kämpfen. Du erleidest einen Malus von <strong>-4</strong> auf alle Angriffswürfe in dieser Runde, erhältst dafür aber einen Ausweichbonus (Dodge) von <strong>+2</strong> auf deine RK und Berührungs-RK bis zu deiner nächsten Runde.</p>
        <p><strong>Akrobatik-Synergie (Tumble):</strong> Wenn du <strong>5 oder mehr Ränge</strong> in der Fertigkeit Akrobatik hast, erhöht sich der gewehrte RK-Ausweichbonus von +2 auf <strong>+3</strong>.</p>
      </div>`,
      "Verstanden",
      "⚔️"
    );
  };

  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const paladinLvl = (activeClasses.find((c: any) => c.classType === 'paladin') || {}).level || 0;
  const rangerLvl = (activeClasses.find((c: any) => c.classType === 'ranger') || {}).level || 0;
  const rogueLvl = (activeClasses.find((c: any) => c.classType === 'rogue') || {}).level || 0;

  const hasPowerAttack = pc.feats && pc.feats.some((f: any) => f.id === 'power_attack' || f.id === 'heftiger_angriff');
  const hasCombatExpertise = pc.feats && pc.feats.some((f: any) => f.id === 'combat_expertise' || f.id === 'kampfexpertise');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Linke Spalte: Aktive Ausrüstung & Kampfbalken */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <BaseCard title="⚔️ Aktive Ausrüstung &amp; Kampf">
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

          {/* Combat Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
            {hasPowerAttack && (
              <div style={{ background: 'rgba(139, 26, 26, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px' }}>
                <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>⚔️ Heftiger Angriff (Power Attack)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--inkm)', fontSize: '7.5px' }}>Malus (Max {babVal}):</span>
                  <input
                    type="number"
                    min="0"
                    max={babVal}
                    value={pc.powerAttackPenalty ?? 0}
                    onChange={(e) => handlePowerAttackChange(parseInt(e.target.value))}
                    className="cinput"
                    style={{ width: '35px', fontSize: '8px', textAlign: 'center', height: '16px', padding: 0 }}
                  />
                </div>
              </div>
            )}

            {hasCombatExpertise && (
              <div style={{ background: 'rgba(42, 106, 138, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px' }}>
                <span style={{ color: '#2a6a8a', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  🛡️ Kampfgetümmel (Combat Expertise)
                  <button
                    onClick={showCombatExpertiseRules}
                    style={{ background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', padding: '1px 4px', cursor: 'pointer', fontSize: '8px', color: 'var(--pb)', height: '14px', borderRadius: '1.5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '10px', marginLeft: '4px' }}
                    title="Regeln anzeigen"
                  >
                    📖 ↗
                  </button>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--inkm)', fontSize: '7.5px' }}>Malus (Max {Math.min(5, babVal)}):</span>
                  <input
                    type="number"
                    min="0"
                    max={Math.min(5, babVal)}
                    value={pc.combatExpertisePenalty ?? 0}
                    onChange={(e) => handleCombatExpertiseChange(parseInt(e.target.value))}
                    className="cinput"
                    style={{ width: '35px', fontSize: '8px', textAlign: 'center', height: '16px', padding: 0 }}
                  />
                </div>
              </div>
            )}

            {/* Defensive Fighting & Total Defense Toggles */}
            <div style={{ background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '4px 8px', display: 'flex', gap: '10px', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '8px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--inkm)', margin: 0, fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    checked={!!pc.isDefensiveFighting}
                    onChange={(e) => handleDefensiveFightingChange(e.target.checked)}
                    style={{ margin: 0, width: '10px', height: '10px' }}
                  />
                  ⚔️ Verteidigend kämpfen (-4 Atk / +RK)
                </label>
                <button
                  onClick={showDefensiveFightingRules}
                  style={{ background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', padding: '1px 4px', cursor: 'pointer', fontSize: '8px', color: 'var(--pb)', height: '14px', borderRadius: '1.5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: '10px', marginLeft: '4px' }}
                  title="Regeln anzeigen"
                >
                  📖 ↗
                </button>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--inkm)', margin: 0, fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={!!pc.isTotalDefense}
                  onChange={(e) => handleTotalDefenseChange(e.target.checked)}
                  style={{ margin: 0, width: '10px', height: '10px' }}
                />
                🛡️ Volle Abwehr (+RK / keine Angr.)
              </label>
            </div>

            {/* Class Specific Toggles */}
            {(paladinLvl >= 1 || rangerLvl >= 1 || rogueLvl >= 1) && (
              <div style={{ background: 'rgba(200, 169, 110, 0.05)', border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '4px 8px', display: 'flex', gap: '10px', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '8px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                {paladinLvl >= 1 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--red)', margin: 0, fontWeight: 'bold' }}>
                    <input
                      type="checkbox"
                      checked={!!pc.isSmiteActive}
                      onChange={(e) => handleSmiteChange(e.target.checked)}
                      style={{ margin: 0, width: '10px', height: '10px' }}
                    />
                    🌟 Böses niederstrecken (Smite)
                  </label>
                )}
                {rangerLvl >= 1 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--inkm)', margin: 0, fontWeight: 'bold' }}>
                    <input
                      type="checkbox"
                      checked={!!pc.isFavoredEnemyActive}
                      onChange={(e) => handleFavoredEnemyChange(e.target.checked)}
                      style={{ margin: 0, width: '10px', height: '10px' }}
                    />
                    🏹 Gegen Erzfeind (+X Schaden)
                  </label>
                )}
                {rogueLvl >= 1 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--inkm)', margin: 0, fontWeight: 'bold' }}>
                    <input
                      type="checkbox"
                      checked={!!pc.isSneakAttacking}
                      onChange={(e) => handleSneakAttackChange(e.target.checked)}
                      style={{ margin: 0, width: '10px', height: '10px' }}
                    />
                    🗡️ Hinterhältiger Angriff
                  </label>
                )}
              </div>
            )}

            {pc.isTotalDefense && (
              <div style={{ background: 'rgba(139, 26, 26, 0.08)', border: '0.5px solid var(--red)', borderRadius: '3px', padding: '4px 8px', textAlign: 'center', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px', fontWeight: 'bold' }}>
                🛡️ Volle Abwehr aktiv — keine Angriffe möglich!
              </div>
            )}
          </div>

          {/* Rules Reference */}
          <div style={{ marginTop: '10px', borderTop: '1px double var(--pb)', paddingTop: '8px' }}>
            <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              📜 Regelwerk-Referenz (D&D 3.5 RAW)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '7.5px', fontFamily: "'Crimson Text', serif", lineHeight: 1.25, color: 'var(--ink)' }}>
              {/* Waffen-Werte Column */}
              <div style={{ background: 'rgba(200, 169, 110, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.15)', borderRadius: '3px', padding: '5px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--red)', borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)', marginBottom: '4px', paddingBottom: '1px', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>⚔️ Waffen-Werte</div>
                <ul style={{ margin: 0, paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '3px', listStyleType: 'square' }}>
                  <li><strong>Zusatz-Atk:</strong> Manueller Bonus auf Angriffe (z.B. durch <em>Waffenfokus</em> <code>+1</code>, Magie oder Meisterarbeit).</li>
                  <li><strong>Scharf (Keen):</strong> Verdoppelt den kritischen Bedrohungsbereich (z.B. 19-20 wird zu 17-20). Stackt <u>nicht</u> mit dem Talent <em>Verbesserter Kritischer Treffer</em>.</li>
                  <li><strong>Grip-Abw. (Händigkeit):</strong> Überschreibt die Trageweise: Einhändig (1H), Zweihändig (2H: gewährt 1.5x Stärkebonus auf Schaden), Schildhand (Sec: Zweitwaffe), Fernkampf (Rng) oder Waffenlos (Unarmed).</li>
                  <li><strong>Schadens-Abw.:</strong> Überschreibt den Basis-Schadenswürfel der Waffe (z.B. <code>1w8</code>, <code>2w6</code>).</li>
                  <li><strong>Krit-Abw.:</strong> Überschreibt den kritischen Multiplikator und Bedrohungsbereich (z.B. <code>20 / x3</code>).</li>
                </ul>
              </div>
              
              {/* Rüstungs-Werte Column */}
              <div style={{ background: 'rgba(200, 169, 110, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.15)', borderRadius: '3px', padding: '5px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--red)', borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)', marginBottom: '4px', paddingBottom: '1px', fontFamily: "'IM Fell English SC', serif", fontSize: '8px' }}>🛡️ Rüstungs-Werte</div>
                <ul style={{ margin: 0, paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '3px', listStyleType: 'square' }}>
                  <li><strong>RK-Abw.:</strong> Überschreibt den Rüstungsbonus. Keine Rüstungsboni stacken (z.B. Magische Rüstung und Zauber <em>Mage Armor</em>).</li>
                  <li><strong>MaxDex (Max. Geschick):</strong> Begrenzt den Geschicklichkeitsbonus auf die Rüstungsklasse (RK), da schwere Rüstung die Ausweichfähigkeit einschränkt.</li>
                  <li><strong>Malus-Abw.:</strong> Rüstungsmalus auf Fertigkeiten für Stärke und Geschicklichkeit (Akrobatik, Klettern etc.). Doppelt beim Schwimmen.</li>
                  <li><strong>Zauberpatzer-Abw.:</strong> Prozentuale Chance, dass ein arkaner Gestenzauber (Somatic) fehlschlägt. Gilt nicht für göttliche Magie.</li>
                </ul>
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
                  {Array.isArray(pc.armors) && pc.armors.map((a: any, idx: number) => (
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
