/**
 * @module    PCHeader
 * @summary   Header component for the player character with name, race, class/level, alignment, initiative, HP display, and damage controller.
 * @exports   PCHeader
/**
 * @module    PCHeader
 * @summary   Header component for the player character with name, race, class/level, alignment, initiative, HP display, and damage controller.
 * @exports   PCHeader
 * @reads     pc.name, pc.race, pc.classes, pc.size, pc.alignment, pc.hp, pc.maxHP, pc.conditions, pc.init, pc.iniMisc, pc.dex, pc.feats
 * @stateOps  updatePCField, updatePCNumber, applyDamage, applyTempHP
 * @depends   React, @core/state.js, src/hooks/useCombatState
 * @notHere   Attributes & Multiclass Manager -> PCAttributes.tsx | HP Globe -> PCHealthGlobe.tsx
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Combatant } from '../../types/combat';
// @ts-ignore
import { CombatState } from '@core/state.js';

interface PCHeaderProps {
  pc: Combatant;
  activeTab: string;
}

export const PCHeader: React.FC<PCHeaderProps> = ({ pc, activeTab }) => {
  const [dmgValue, setDmgValue] = useState<string>('');
  const [isHalf, setIsHalf] = useState<boolean>(false);
  const [isDouble, setIsDouble] = useState<boolean>(false);
  const [showYouDied, setShowYouDied] = useState<boolean>(false);
  const [youDiedStep, setYouDiedStep] = useState<number>(0); // 0: hidden, 1: fade-in, 2: visible

  // Helper functions similar to PCUtils.js / PCHeader.js
  const getAblMod = (stat: any) => {
    const score = typeof stat?.getValue === 'function' ? stat.getValue() : (stat ?? 10);
    return Math.floor((score - 10) / 2);
  };

  const dexMod = getAblMod(pc.dex);
  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some(f => f.id === 'improved_initiative');
  const totIni = dexMod + (parseInt((pc as any).iniMisc) || 0) + (hasImprovedInit ? 4 : 0);
  const finalIni = (pc.initiative || 0) > 0 ? (pc.initiative || 0) + totIni : '--';

  // Get Temp HP
  const tempHPObj = pc.conditions.find((c: any) => c === 'Temp-HP' || (c && c.n === 'Temp-HP'));
  const tempHP = tempHPObj ? (parseInt((tempHPObj as any).tmpVal) || 0) : 0;

  const baseMaxHP = Math.max(1, pc.maxHP - tempHP);
  const baseHP = Math.max(0, pc.hp - tempHP);
  const basePct = Math.max(0, Math.min(100, Math.floor((baseHP / baseMaxHP) * 100)));
  const tempPct = Math.max(0, Math.min(100, Math.floor((tempHP / baseMaxHP) * 100)));
  const totalPct = Math.max(0, Math.min(100, Math.floor((pc.hp / pc.maxHP) * 100)));

  // Health-bar color class
  const getFillCls = (pct: number, hp: number) => {
    if (hp <= 0) return 'fill-dead';
    if (pct <= 25) return 'fill-crit';
    if (pct <= 50) return 'fill-warn';
    return 'fill-ok';
  };
  const fc = getFillCls(totalPct, pc.hp);

  // Translate Race
  const getRaceName = (race: string) => {
    const names: Record<string, string> = {
      human: 'Human',
      elf: 'Elf',
      dwarf: 'Dwarf',
      gnome: 'Gnome',
      halfling: 'Halfling',
      half_elf: 'Half-Elf',
      half_orc: 'Half-Orc',
      tiefling: 'Tiefling',
    };
    return names[race.toLowerCase()] || race;
  };

  // Generate Class String
  const getClassesString = () => {
    if (!Array.isArray(pc.classes) || pc.classes.length === 0) return 'Level 1';
    return pc.classes
      .map((c: any) => {
        const clsNames: Record<string, string> = {
          barbarian: 'Barbarian',
          bard: 'Bard',
          cleric: 'Cleric',
          druid: 'Druid',
          fighter: 'Fighter',
          monk: 'Monk',
          paladin: 'Paladin',
          ranger: 'Ranger',
          rogue: 'Rogue',
          sorcerer: 'Sorcerer',
          wizard: 'Wizard',
          // PHB2
          duskblade: 'Duskblade',
          beguiler: 'Beguiler',
          knight: 'Knight',
          dragon_shaman: 'Dragon Shaman',
          // Complete Adventurer
          ninja: 'Ninja',
          scout: 'Scout',
          spellthief: 'Spellthief',
          // Prestige
          mystic_theurge: 'Mystic Theurge',
          arcane_trickster: 'Arcane Trickster',
          dragon_disciple: 'Dragon Disciple',
          assassin: 'Assassin',
          battle_trickster: 'Battle Trickster',
          spellwarp_sniper: 'Spellwarp Sniper',
          custom: 'Custom',
        };
        const name = clsNames[c.classType.toLowerCase()] || c.classType
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return `${name} ${c.level}`;
      })
      .join(' / ');
  };

  // Translate Size
  const getSizeName = (size: string) => {
    const sizes: Record<string, string> = {
      medium: 'Medium',
      small: 'Small',
      large: 'Large',
      tiny: 'Tiny',
    };
    return sizes[size.toLowerCase()] || size || 'Medium';
  };

  // Damage / Healing / TempHP Handler
  const getCalculatedValue = () => {
    let val = parseInt(dmgValue) || 0;
    if (val > 0) {
      if (isHalf) val = Math.floor(val / 2);
      if (isDouble) val = val * 2;
    }
    return val;
  };

  const handleApplyDamage = () => {
    const val = getCalculatedValue();
    if (val > 0) {
      CombatState.applyDamage(pc.id, val, false);
      setDmgValue('');
    }
  };

  const handleApplyHeal = () => {
    const val = getCalculatedValue();
    if (val > 0) {
      CombatState.applyDamage(pc.id, val, true);
      setDmgValue('');
    }
  };

  const handleApplyTempHP = () => {
    const val = getCalculatedValue();
    if (val > 0) {
      CombatState.applyTempHP(pc.id, val);
      setDmgValue('');
    }
  };

  // You Died Overlay monitoring
  useEffect(() => {
    if (pc.hp <= -10 && !(pc as any).deathScreenShown) {
      CombatState.updatePCField('deathScreenShown', true);
      setShowYouDied(true);
      setYouDiedStep(1);
      setTimeout(() => setYouDiedStep(2), 50);
    } else if (pc.hp > -10 && (pc as any).deathScreenShown) {
      CombatState.updatePCField('deathScreenShown', false);
      setShowYouDied(false);
      setYouDiedStep(0);
    }
  }, [pc.hp, (pc as any).deathScreenShown]);

  const handleYouDiedDismiss = () => {
    setYouDiedStep(1);
    setTimeout(() => {
      setShowYouDied(false);
      setYouDiedStep(0);
    }, 800);
  };

  return (
    <div
      className="player-hdr-bar no-print"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {pc.name === 'Held' && (
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(139, 26, 26, 0.08) 0%, rgba(200, 169, 110, 0.15) 100%)',
            border: '1px solid var(--pb)',
            borderRadius: '4px',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🧙‍♂️</span>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", fontSize: '13px', display: 'block' }}>
                Character Wizard
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif" }}>
                Create your D&D 3.5e character step-by-step with the guided, rules-compliant assistant.
              </span>
            </div>
          </div>
          <button 
            className="btn btn-p" 
            onClick={() => CombatState.setRole('wizard')}
            style={{ fontSize: '11px', padding: '4px 12px', whiteSpace: 'nowrap' }}
          >
            Start Assistant
          </button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
        {/* Left: Character Name & Metadata */}
        <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <h1
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '18px',
              color: 'var(--red)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Character Sheet:
            <input
              type="text"
              value={pc.name}
              onChange={(e) => CombatState.updatePCField('name', e.target.value)}
              className="pc-name-field"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--pb)',
                fontFamily: "'IM Fell English SC', serif",
                fontSize: '18px',
                color: 'var(--red)',
                outline: 'none',
                width: '180px',
              }}
            />
          </h1>

          {/* Race, Classes, Size, Alignment */}
          <div
            style={{
              fontSize: '8.5px',
              color: 'var(--inkm)',
              fontFamily: "'Crimson Text', serif",
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginTop: '2px',
            }}
          >
            <span style={{ background: 'rgba(200, 169, 110, 0.08)', padding: '1px 4px', borderRadius: '2px', border: '0.5px solid var(--pb)' }}>
              🧬 {getRaceName(pc.race || 'human')}{pc.levelAdjustment ? ` (ECL ${(pc.classes || []).reduce((sum: number, c: any) => sum + (c.level || 0), 0) + pc.levelAdjustment})` : ''}
            </span>
            <span style={{ background: 'rgba(139, 26, 26, 0.05)', color: 'var(--red)', padding: '1px 4px', borderRadius: '2px', border: '0.5px solid rgba(139, 26, 26, 0.2)', fontWeight: 'bold' }}>
              🎭 {getClassesString()}
            </span>
            <span style={{ background: 'rgba(200, 169, 110, 0.08)', padding: '1px 4px', borderRadius: '2px', border: '0.5px solid var(--pb)' }}>
              📏 {getSizeName(pc.size || 'medium')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>Alignment:</span>
              <input
                type="text"
                placeholder="e.g. LG"
                value={pc.alignment || ''}
                onChange={(e) => CombatState.updatePCField('alignment', e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '0.5px solid var(--pb)',
                  fontFamily: "'Crimson Text', serif",
                  fontSize: '8.5px',
                  color: 'var(--inkl)',
                  outline: 'none',
                  width: '80px',
                  textAlign: 'center',
                }}
              />
            </span>
          </div>
        </div>

        {/* Right: Premium Status & Combat Widget */}
        <div
          style={{
            display: activeTab === 'overview' ? 'none' : 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(200, 169, 110, 0.08)',
            border: '0.5px solid var(--pb)',
            borderRadius: '4px',
            padding: '4px 10px 4px 6px',
            boxShadow: 'inset 0 0 10px rgba(200, 169, 110, 0.05)',
          }}
        >
          {/* Circular Gold Shield HP Emblem */}
          <div style={{ position: 'relative' }}>
            <div
              className="hp-emblem"
              style={{
                position: 'relative',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%)',
                border: '2px double var(--red)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: "'IM Fell English SC', serif",
                color: 'var(--red)',
                textShadow: '0 0.5px 0.5px rgba(255,255,255,0.5)',
              }}
            >
              <span style={{ fontSize: '8px', fontWeight: 'bold', lineHeight: 1, color: 'var(--inkl)', marginTop: '2px', letterSpacing: '0.5px' }}>HP</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16px', margin: '1px 0' }}>
                <input
                  type="number"
                  value={pc.hp}
                  onChange={(e) => CombatState.updatePCNumber('hp', e.target.value)}
                  style={{
                    width: '28px',
                    textAlign: 'center',
                    background: 'transparent',
                    border: 'none',
                    fontFamily: "'IM Fell English SC', serif",
                    fontSize: '14px',
                    outline: 'none',
                    fontWeight: 'bold',
                    color: 'var(--red)',
                    padding: 0,
                  }}
                  title="Edit current HP directly"
                />
              </div>
              <span style={{ height: '0.5px', background: 'var(--red)', width: '34px', opacity: 0.5 }}></span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '12px', marginTop: '1px' }}>
                <input
                  type="number"
                  value={pc.maxHP}
                  onChange={(e) => CombatState.updatePCNumber('maxHP', e.target.value)}
                  style={{
                    width: '28px',
                    textAlign: 'center',
                    background: 'transparent',
                    border: 'none',
                    fontFamily: "'Crimson Text', serif",
                    fontSize: '9.5px',
                    outline: 'none',
                    color: 'var(--inkl)',
                    padding: 0,
                  }}
                  title="Edit max HP directly"
                />
              </div>
            </div>

            {/* Temp HP Badge Overlay */}
            {tempHP > 0 && (
              <div
                className="temp-hp-badge"
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
                  border: '0.8px solid #00c0ff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00c0ff',
                  fontFamily: "'IM Fell English SC', serif",
                  fontSize: '8.5px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 5px rgba(0,192,255,0.45), inset 0 1px 2px rgba(255,255,255,0.2)',
                  zIndex: 15,
                }}
                title="Active temporary HP"
              >
                +{tempHP}
              </div>
            )}
          </div>

          {/* Double-Layered Health Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5px', width: '120px' }}>
            <div style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--inkl)', fontFamily: "'IM Fell English SC', serif", display: 'flex', justifyContent: 'space-between', lineHeight: 1, letterSpacing: '0.2px' }}>
              <span>Health</span>
              <span>{totalPct}%</span>
            </div>

            <div
              className="hp-bar-wrap"
              style={{
                height: '10px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '2px',
                overflow: 'hidden',
                position: 'relative',
                border: '0.5px solid var(--pb)',
                width: '100%',
                marginBottom: '2px',
              }}
            >
              {/* Base HP Fill */}
              <div
                className={`hp-bar-fill ${fc}`}
                style={{
                  width: `${basePct}%`,
                  height: '100%',
                  transition: 'width 0.25s',
                }}
              ></div>
              {/* Temp HP Fill */}
              {tempHP > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: `${basePct}%`,
                    width: `${tempPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #1f3d7a, #00b8f0)',
                    boxShadow: '0 0 5px #00b8f0',
                    transition: 'left 0.25s, width 0.25s',
                    opacity: 0.85,
                  }}
                ></div>
              )}
            </div>
            <div style={{ fontSize: '8px', fontWeight: 'bold', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", textAlign: 'left', lineHeight: 1, letterSpacing: '0.2px' }}>
              Initiative: {finalIni}
            </div>
          </div>

          {/* Elegant dividing border line */}
          <span style={{ width: '0.5px', height: '44px', background: 'rgba(200, 169, 110, 0.3)' }}></span>

          {/* Combat Damage/Healing Controller Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '145px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <input
                type="number"
                placeholder="Val"
                value={dmgValue}
                onChange={(e) => setDmgValue(e.target.value)}
                style={{
                  width: '38px',
                  height: '22px',
                  textAlign: 'center',
                  borderRadius: '2px',
                  border: '0.5px solid var(--pb)',
                  fontFamily: "'Crimson Text', serif",
                  fontSize: '11px',
                  outline: 'none',
                  background: 'rgba(255,255,255,0.6)',
                }}
              />

              <button
                className="xbtn xbtn-dmg pc-dmg-btn"
                style={{ height: '22px', padding: '0 6px', fontSize: '8px', fontWeight: 'bold', lineHeight: '20px', fontFamily: "'IM Fell English SC', serif", margin: 0 }}
                onClick={handleApplyDamage}
                title="Subtract damage"
              >
                - Damage
              </button>
              <button
                className="xbtn xbtn-heal pc-heal-btn"
                style={{ height: '22px', padding: '0 6px', fontSize: '8px', fontWeight: 'bold', lineHeight: '20px', fontFamily: "'IM Fell English SC', serif", margin: 0 }}
                onClick={handleApplyHeal}
                title="Apply healing"
              >
                + Heal
              </button>
              <button
                className="xbtn xbtn-temp-hp pc-temp-hp-btn"
                style={{
                  height: '22px',
                  padding: '0 5px',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  lineHeight: '20px',
                  fontFamily: "'IM Fell English SC', serif",
                  background: 'rgba(42,74,138,0.06)',
                  borderColor: '#2a4a8a',
                  color: '#1a2a6a',
                  margin: 0,
                }}
                onClick={handleApplyTempHP}
                title="Add temporary HP"
              >
                + Temp
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', fontSize: '7.5px', color: 'var(--inkl)', fontWeight: 600, paddingLeft: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={isHalf}
                  onChange={(e) => setIsHalf(e.target.checked)}
                  style={{ width: '10px', height: '10px', cursor: 'pointer', margin: 0 }}
                />
                <span>Half (Reflex)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={isDouble}
                  onChange={(e) => setIsDouble(e.target.checked)}
                  style={{ width: '10px', height: '10px', cursor: 'pointer', margin: 0 }}
                />
                <span>Double (Crit)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* You Died Overlay (Dark Souls Style Easter Egg) */}
      {showYouDied && createPortal(
        <div
          id="you-died-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: youDiedStep === 2 ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            pointerEvents: 'all',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              transform: youDiedStep === 2 ? 'scale(1.05)' : 'scale(0.9)',
              transition: 'transform 3s ease-out',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <h1
              style={{
                fontFamily: "'IM Fell English SC', 'Times New Roman', serif",
                fontSize: '52px',
                color: '#8b1a1a',
                textShadow: '0 0 15px rgba(139, 26, 26, 0.6), 0 0 35px rgba(0,0,0,0.9)',
                letterSpacing: '10px',
                margin: '0 0 25px 0',
                fontWeight: 500,
                textTransform: 'uppercase',
                animation: 'fadeLetter 3s forwards',
              }}
            >
              YOU DIED
            </h1>
            <button
              id="you-died-btn"
              onClick={handleYouDiedDismiss}
              style={{
                background: 'transparent',
                border: '1px solid rgba(200, 169, 110, 0.4)',
                color: '#c8a96e',
                fontFamily: "'IM Fell English SC', serif",
                fontSize: '12px',
                letterSpacing: '2px',
                padding: '8px 24px',
                cursor: 'pointer',
                outline: 'none',
                borderRadius: '2px',
                transition: 'all 0.3s',
                animation: 'fadeInButton 2s 1.5s forwards',
              }}
            >
              I know...
            </button>
          </div>

          <style>
            {`
              @keyframes fadeLetter {
                from { letter-spacing: 3px; opacity: 0; }
                to { letter-spacing: 10px; opacity: 1; }
              }
              @keyframes fadeInButton {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
              }
              #you-died-btn:hover {
                background: rgba(200, 169, 110, 0.1);
                border-color: #c8a96e;
                box-shadow: 0 0 8px rgba(200, 169, 110, 0.3);
              }
            `}
          </style>
        </div>,
        document.body
      )}
    </div>
  );
};
