/**
 * @module    PCAttributes
 * @summary   Renders the attribute section (STR/DEX/CON/INT/WIS/CHA, BAB), race selection, and multiclass manager of the player character.
 * @exports   PCAttributes
 * @reads     pc.str, pc.dex, pc.con, pc.int, pc.wis, pc.cha, pc.bab, pc.classes, pc.race
 * @stateOps  updatePCNumber, addPCClass, removePCClass, updatePCClassLevel, updatePCClassType, clearPCClasses, updatePCBatch
 * @depends   React, @core/state.js, @core/rules.js, @core/ui/components/dialogs.js, src/components/shared/BaseCard
 * @notHere   Offense -> PCOffenseTab.tsx | Skills -> PCSkillsTab.tsx
 */

import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../shared/BaseCard';
// @ts-ignore
import { CombatRules } from '@core/rules.js';
// @ts-ignore
import { showCustomAlert, showCustomConfirm, showRollBreakdown } from '@core/ui/components/dialogs.js';
import { showAttributeExplanation } from './attributeHelper';

interface PCAttributesProps {
  pc: any;
}

export const PCAttributes: React.FC<PCAttributesProps> = ({ pc }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClassKey, setNewClassKey] = useState('fighter');
  const [newClassLvl, setNewClassLvl] = useState(1);

  const classesCount = Array.isArray(pc.classes) ? pc.classes.length : 0;

  // Format modifier (+X or -X)
  const formatMod = (val: number) => {
    return val >= 0 ? `+${val}` : `${val}`;
  };

  // Generate BAB sequence (e.g. +6 / +1)
  const getBabSequence = (bab: number) => {
    const seq = [formatMod(bab)];
    if (bab >= 6) seq.push(formatMod(bab - 5));
    if (bab >= 11) seq.push(formatMod(bab - 10));
    if (bab >= 16) seq.push(formatMod(bab - 15));
    return seq.join(' / ');
  };

  // Render a validation result's requirement list as colored HTML lines (met = green, unmet = red)
  const formatPrereqLines = (validation: any) => {
    return (validation.metDetails || []).map((req: any) => {
      const color = req.met ? '#2e7d32' : '#d32f2f';
      return `<div style="color: ${color}; margin-bottom: 10px;"><strong>${req.label}</strong><br/>[Current: ${req.current} / Required: ${req.required}]</div>`;
    }).join('');
  };

  // Validate and apply attribute change
  const handleAbilityChange = (key: string, val: string) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 10;
    if (num < 3) {
      showCustomAlert("Warning!", "Talk to your DM, you have a problem.");
      num = 3;
    }
    CombatState.updatePCNumber(key, num);
  };

  // Roll ability check
  const handleRollAttribute = (label: string, key: string, e: React.MouseEvent) => {
    const stat = pc[key];
    const score = stat?.getValue?.() ?? stat?.total ?? 0;
    const baseVal = stat?.base ?? 0;
    const mod = stat?.mod ?? 0;
    
    let detailParts: string[] = [];
    if (baseVal > 0) {
      detailParts.push(`${baseVal} Base`);
    }
    
    if (Array.isArray(stat?.modifiers)) {
      stat.modifiers.forEach((m: any) => {
        if (m.value !== 0) {
          const sign = m.value > 0 ? '+' : '';
          detailParts.push(`${sign}${m.value} ${m.source || 'Mod'}`);
        }
      });
    }
    
    const detailStr = detailParts.length > 1 ? ` (Value: ${score} = ${detailParts.join(' ')})` : ` (Value: ${score})`;

    showRollBreakdown(`${label} Roll${detailStr}`, '1d20', [
      { label: `${label} Modifier`, value: mod }
    ], e.nativeEvent);
  };

  // Change race
  const handleRaceChange = (val: string) => {
    CombatState.updatePCBatch((freshPC: any) => {
      freshPC.race = val;
      freshPC.isHuman = (val === 'human');
      const lowSpeedRaces = ['dwarf', 'gnome', 'halfling'];
      freshPC.baseBw = lowSpeedRaces.includes(val) ? 20 : 30;
      freshPC.levelAdjustment = (val === 'tiefling') ? 1 : 0;
      if (val === 'tiefling') {
        freshPC.resistances = 'Cold 5, Electricity 5, Fire 5';
      } else if (freshPC.resistances === 'Cold 5, Electricity 5, Fire 5') {
        freshPC.resistances = '';
      }
    });
  };

  // Add class
  const handleAddClass = () => {
    if (classesCount >= 5) {
      showCustomAlert("Class Limit", "More than 5 classes are not supported.");
      return;
    }
    const clsDef = availableClasses.find((x: any) => x.key === newClassKey);
    const isAlreadyChosen = pc.classes?.some((c: any) => c.classType === newClassKey);
    const validation = CombatRules.validatePrestigeClassPrereqs(pc, newClassKey);
    const isAvailable = !clsDef?.isPrestige || isAlreadyChosen || validation.success;

    const addClassNow = (specialTextConfirmed?: boolean) => {
      CombatState.updatePCBatch((freshPC: any) => {
        if (specialTextConfirmed) {
          freshPC.prestigeSpecialTextConfirmed = { ...freshPC.prestigeSpecialTextConfirmed, [newClassKey]: true };
        }
        if (!Array.isArray(freshPC.classes)) freshPC.classes = [];
        freshPC.classes.push({ classType: newClassKey, level: newClassLvl });
        freshPC.rebuildStatModifiers();
      });
      setShowAddForm(false);
    };

    if (!isAvailable) {
      const lines = formatPrereqLines(validation);
      if (CombatRules.isOnlySpecialTextUnmet(validation)) {
        showCustomConfirm(
          `Prerequisites for ${clsDef?.nameEn || newClassKey}`,
          `<div style="text-align: left; max-height: 300px; overflow-y: auto; padding: 4px;"><p style="margin-bottom: 12px; color: var(--ink);">All requirements are met except for one special condition that must be manually confirmed:</p>${lines}<p style="margin-top: 12px; color: var(--ink);">Do you confirm that this condition is met?</p></div>`,
          () => addClassNow(true)
        );
      } else {
        showCustomAlert(
          `Prerequisites for ${clsDef?.nameEn || newClassKey}`,
          `<div style="text-align: left; max-height: 300px; overflow-y: auto; padding: 4px;"><p style="margin-bottom: 12px; color: var(--ink);">You do not yet meet the prerequisites for this prestige class:</p>${lines}</div>`,
          "OK",
          "🔒"
        );
      }
      return;
    }
    addClassNow(false);
  };

  // Remove class
  const handleRemoveClass = (idx: number) => {
    CombatState.updatePCBatch((freshPC: any) => {
      if (Array.isArray(freshPC.classes)) {
        freshPC.classes.splice(idx, 1);
        freshPC.rebuildStatModifiers();
      }
    });
  };

  // Helper component for attributes
  const renderAttributeBox = (key: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', label: string, icon: string) => {
    const stat = pc[key];
    const score = stat?.getValue?.() ?? stat?.total ?? 0;
    const mod = stat?.mod ?? 0;
    const hasModifiers = Array.isArray(stat?.modifiers) && stat.modifiers.some((m: any) => m.value !== 0);

    let tooltip = `${label} Score`;
    if (hasModifiers && stat.modifiers) {
      const activeMods = stat.modifiers.filter((m: any) => m.value !== 0);
      tooltip += `\nBase Value: ${stat.base}\nActive Value: ${score}\nActive Bonuses:\n` + 
        activeMods.map((m: any) => `• ${m.source}: ${formatMod(m.value)}`).join('\n');
    }

    return (
      <div
        className="attr-box"
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(200, 169, 110, 0.1)',
          border: '0.5px solid var(--pb)',
          borderRadius: '2px',
          padding: '3px',
          position: 'relative'
        }}
        title={tooltip}
      >
        <label 
          style={{ 
            fontSize: '8px', 
            fontWeight: 600, 
            color: 'var(--inkl)',
            cursor: 'pointer'
          }}
          onClick={() => showAttributeExplanation(key)}
          title="Click for a brief explanation"
        >
          {icon} {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px', justifyContent: 'space-between' }}>
          <input
            type="number"
            value={score}
            onChange={(e) => handleAbilityChange(key, e.target.value)}
            className={`cinput pc-${key}-inp`}
            style={{
              width: '24px',
              fontSize: '9px',
              height: '14px',
              textAlign: 'center',
              padding: 0,
              color: 'var(--ink)',
              fontWeight: 'normal',
              borderColor: 'var(--pb)'
            }}
            title={tooltip}
          />
          <input
            type="text"
            value={formatMod(mod)}
            readOnly
            className="cinput"
            style={{
              width: '20px',
              fontSize: '8.5px',
              height: '14px',
              textAlign: 'center',
              padding: 0,
              fontWeight: 'bold',
              borderColor: 'var(--pb)',
              background: 'rgba(0,0,0,0.05)',
              color: 'var(--inkl)'
            }}
            title="Modifier"
          />
          <button
            className="xbtn roll-attr-btn"
            onClick={(e) => handleRollAttribute(label, key, e)}
            style={{ padding: 0, width: '16px', height: '14px', fontSize: '8px', lineHeight: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${label} Roll (Formula)`}
          >
            🎲
          </button>
        </div>
      </div>
    );
  };

  const availableClasses = (CombatRules.CLASSES as any[]) || [];

  return (
    <BaseCard title="✨ Attributes & BAB">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        
        {/* Rasse & Multiclassing Manager */}
        <div
          style={{
            background: 'rgba(139,26,26,0.04)',
            border: '0.5px solid rgba(139,26,26,0.15)',
            borderRadius: '2px',
            padding: '5px 6px',
            marginBottom: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {/* Rasse Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(139,26,26,0.1)', paddingBottom: '4px', marginBottom: '2px' }}>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 600, letterSpacing: '0.3px' }}>🧬 Race</span>
            <select
              id="pcRaceSelect"
              value={pc.race || 'human'}
              onChange={(e) => handleRaceChange(e.target.value)}
              className="cinput"
              style={{ fontSize: '8px', height: '14px', padding: '0 2px', width: '80px', textAlign: 'center', outline: 'none', cursor: 'pointer' }}
            >
              <option value="human">Human</option>
              <option value="elf">Elf</option>
              <option value="dwarf">Dwarf</option>
              <option value="gnome">Gnome</option>
              <option value="halfling">Halfling</option>
              <option value="half_elf">Half-Elf</option>
              <option value="half_orc">Half-Orc</option>
              <option value="tiefling">Tiefling</option>
            </select>
          </div>

          {/* Klassen & Stufen Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 600, letterSpacing: '0.3px' }}>🎭 Classes &amp; Levels</span>
            {classesCount < 4 && !showAddForm && (
              <button
                className="btn btn-p"
                onClick={() => setShowAddForm(true)}
                style={{ fontSize: '7px', padding: '1px 4px', lineHeight: 1, borderColor: 'var(--pb)', background: 'rgba(139,26,26,0.05)', color: 'var(--red)' }}
              >
                + Class
              </button>
            )}
          </div>
          
          {/* Klassenliste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {classesCount > 0 ? (
              pc.classes.map((c: any, idx: number) => (
                <div
                  key={idx}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(200, 169, 110, 0.1)', border: '0.5px solid var(--pb)', borderRadius: '1px', padding: '2px 4px', fontSize: '8px' }}
                >
                  <select
                    className="cinput pc-class-type-select"
                    value={c.classType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const clsDef = availableClasses.find((x: any) => x.key === newType);
                      const isAlreadyChosen = pc.classes?.some((x: any) => x.classType === newType);
                      const validation = CombatRules.validatePrestigeClassPrereqs(pc, newType);
                      const isAvailable = !clsDef?.isPrestige || isAlreadyChosen || validation.success;
                      if (!isAvailable) {
                        const lines = formatPrereqLines(validation);
                        if (CombatRules.isOnlySpecialTextUnmet(validation)) {
                          showCustomConfirm(
                            `Prerequisites for ${clsDef?.nameEn || newType}`,
                            `<div style="text-align: left; max-height: 300px; overflow-y: auto; padding: 4px;"><p style="margin-bottom: 12px; color: var(--ink);">All requirements are met except for one special condition that must be manually confirmed:</p>${lines}<p style="margin-top: 12px; color: var(--ink);">Do you confirm that this condition is met?</p></div>`,
                            () => {
                              CombatState.updatePCBatch((freshPC: any) => {
                                freshPC.prestigeSpecialTextConfirmed = { ...freshPC.prestigeSpecialTextConfirmed, [newType]: true };
                              });
                              CombatState.updatePCClassType(idx, newType);
                            }
                          );
                        } else {
                          showCustomAlert(
                            `Prerequisites for ${clsDef?.nameEn || newType}`,
                            `<div style="text-align: left; max-height: 300px; overflow-y: auto; padding: 4px;"><p style="margin-bottom: 12px; color: var(--ink);">You do not yet meet the prerequisites for this prestige class:</p>${lines}</div>`,
                            "OK",
                            "🔒"
                          );
                        }
                        return;
                      }
                      CombatState.updatePCClassType(idx, newType);
                    }}
                    style={{ fontSize: '8px', height: '13px', padding: 0, flex: 1, border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--inkm)', outline: 'none', cursor: 'pointer' }}
                  >
                    {availableClasses
                      .filter((x: any) => x.key !== 'custom')
                      .map((cls: any) => {
                        const isAlreadyChosen = pc.classes?.some((x: any) => x.classType === cls.key);
                        const validation = CombatRules.validatePrestigeClassPrereqs(pc, cls.key);
                        const isAvailable = !cls.isPrestige || isAlreadyChosen || validation.success;
                        // Only hard-disable the <option> when locked for reasons other than the
                        // specialText confirmation gate — a native disabled option can never fire
                        // onChange, which would make the confirm-dialog flow unreachable.
                        const hardLocked = !isAvailable && !CombatRules.isOnlySpecialTextUnmet(validation);
                        const suffix = hardLocked ? ' (Locked)' : (!isAvailable ? ' (Confirm Required)' : '');
                        return (
                          <option key={cls.key} value={cls.key} disabled={hardLocked}>
                            {cls.nameEn || cls.nameDe}{suffix}
                          </option>
                        );
                      })}
                  </select>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <select
                      className="cinput pc-class-lvl-select"
                      value={c.level}
                      onChange={(e) => CombatState.updatePCClassLevel(idx, parseInt(e.target.value) || 1)}
                      style={{ fontSize: '8px', height: '14px', padding: 0, width: '44px', textAlign: 'center', lineHeight: 1.2, cursor: 'pointer' }}
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                    <button
                      className="xbtn xbtn-del btn-remove-class"
                      onClick={() => handleRemoveClass(idx)}
                      style={{ padding: '0 3px', fontSize: '7.5px', height: '13px', lineHeight: '11px' }}
                      title="Remove Class"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '2px 0' }}>
                Custom Levels / Custom
              </div>
            )}
          </div>
          
          {/* Add Class Formular */}
          {showAddForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', background: 'rgba(200,169,110,0.15)', border: '0.5px solid var(--pb)', borderRadius: '1.5px', padding: '3px', marginTop: '2px' }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                <select
                  value={newClassKey}
                  onChange={(e) => setNewClassKey(e.target.value)}
                  className="cinput"
                  style={{ fontSize: '7.5px', height: '14px', padding: '0 2px', flex: 1, cursor: 'pointer' }}
                >
                  {availableClasses
                    .filter((cls: any) => cls.key !== 'custom')
                    .map((cls: any) => {
                      const isAlreadyChosen = pc.classes?.some((x: any) => x.classType === cls.key);
                      const validation = CombatRules.validatePrestigeClassPrereqs(pc, cls.key);
                      const isAvailable = !cls.isPrestige || isAlreadyChosen || validation.success;
                      const hardLocked = !isAvailable && !CombatRules.isOnlySpecialTextUnmet(validation);
                      const suffix = hardLocked ? ' (Locked)' : (!isAvailable ? ' (Confirm Required)' : '');
                      return (
                        <option key={cls.key} value={cls.key} disabled={hardLocked}>
                          {cls.nameEn || cls.nameDe}{suffix}
                        </option>
                      );
                    })}
                </select>
                <select
                  value={newClassLvl}
                  onChange={(e) => setNewClassLvl(parseInt(e.target.value) || 1)}
                  className="cinput"
                  style={{ fontSize: '7.5px', height: '14px', padding: 0, width: '28px', textAlign: 'center', cursor: 'pointer' }}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2px' }}>
                <button className="btn btn-p" onClick={handleAddClass} style={{ fontSize: '7px', padding: '1px 5px' }}>Add</button>
                <button className="btn" onClick={() => setShowAddForm(false)} style={{ fontSize: '7px', padding: '1px 5px' }}>✕</button>
              </div>
            </div>
          )}
        </div>

        {/* Attribute Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {renderAttributeBox('str', 'Strength', '⚔️')}
          {renderAttributeBox('dex', 'Dexterity', '🎯')}
          {renderAttributeBox('con', 'Constitution', '🛡️')}
          {renderAttributeBox('int', 'Intelligence', '🧠')}
          {renderAttributeBox('wis', 'Wisdom', '🔮')}
          {renderAttributeBox('cha', 'Charisma', '✨')}
        </div>

        {/* BAB */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px', background: 'rgba(139,26,26,0.05)', border: '0.5px solid rgba(139,26,26,0.2)', borderRadius: '2px', padding: '4px' }}>
          <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>⚔️ Base Attack Bonus (BAB):</label>
          <input
            type="text"
            value={getBabSequence(typeof pc.bab === 'number' ? pc.bab : (typeof pc.bab?.getValue === 'function' ? pc.bab.getValue() : 0))}
            onChange={(e) => {
              CombatState.clearPCClasses();
              CombatState.updatePCNumber('bab', e.target.value);
            }}
            className="cinput pc-bab-inp"
            disabled={classesCount > 0}
            style={{
              width: '100px',
              fontSize: '9px',
              fontWeight: 'bold',
              textAlign: 'center',
              height: '14px',
              padding: 0,
              background: classesCount > 0 ? 'rgba(0,0,0,0.05)' : 'white',
              color: 'var(--red)',
              borderColor: 'var(--pb)',
              cursor: classesCount > 0 ? 'not-allowed' : 'text'
            }}
          />
        </div>
      </div>
    </BaseCard>
  );
};
