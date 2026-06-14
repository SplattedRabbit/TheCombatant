/**
 * @module    PCAttributes
 * @summary   Rendert die Attribut-Sektion (STR/DEX/CON/INT/WIS/CHA, BAB), Volk-Selektion und Multiclass-Manager des Spielercharakters.
 * @exports   PCAttributes
 * @reads     pc.str, pc.dex, pc.con, pc.int, pc.wis, pc.cha, pc.bab, pc.classes, pc.race
 * @stateOps  updatePCNumber, addPCClass, removePCClass, updatePCClassLevel, updatePCClassType, clearPCClasses, updatePCBatch
 * @depends   React, @core/state.js, @core/rules.js, @core/ui/components/dialogs.js, src/components/shared/BaseCard
 * @notHere   Angriffe -> PCOffenseTab.tsx | Fertigkeiten -> PCSkillsTab.tsx
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

  // Modifikator formatieren (+X oder -X)
  const formatMod = (val: number) => {
    return val >= 0 ? `+${val}` : `${val}`;
  };

  // BAB Sequenz erzeugen (z.B. +6 / +1)
  const getBabSequence = (bab: number) => {
    const seq = [formatMod(bab)];
    if (bab >= 6) seq.push(formatMod(bab - 5));
    if (bab >= 11) seq.push(formatMod(bab - 10));
    if (bab >= 16) seq.push(formatMod(bab - 15));
    return seq.join(' / ');
  };

  // Attribut-Änderung validieren und anwenden
  const handleAbilityChange = (key: string, val: string) => {
    let num = parseInt(val);
    if (isNaN(num)) num = 10;
    if (num < 3) {
      showCustomAlert("Achtung!", "Sprich mit deinem SL, du hast ein Problem.");
      num = 3;
    }
    CombatState.updatePCNumber(key, num);
  };

  // Attributswurf ausführen
  const handleRollAttribute = (label: string, key: string, e: React.MouseEvent) => {
    const stat = pc[key];
    const score = stat?.getValue?.() ?? stat?.total ?? 0;
    const baseVal = stat?.base ?? 0;
    const mod = stat?.mod ?? 0;
    
    let detailParts: string[] = [];
    if (baseVal > 0) {
      detailParts.push(`${baseVal} Basis`);
    }
    
    if (Array.isArray(stat?.modifiers)) {
      stat.modifiers.forEach((m: any) => {
        if (m.value !== 0) {
          const sign = m.value > 0 ? '+' : '';
          detailParts.push(`${sign}${m.value} ${m.source || 'Mod'}`);
        }
      });
    }
    
    const detailStr = detailParts.length > 1 ? ` (Wert: ${score} = ${detailParts.join(' ')})` : ` (Wert: ${score})`;

    showRollBreakdown(`${label}-Wurf${detailStr}`, '1W20', [
      { label: `${label}-Modifikator`, value: mod }
    ], e.nativeEvent);
  };

  // Volk / Rasse ändern
  const handleRaceChange = (val: string) => {
    CombatState.updatePCBatch((freshPC: any) => {
      freshPC.race = val;
      freshPC.isHuman = (val === 'human');
      const lowSpeedRaces = ['dwarf', 'gnome', 'halfling'];
      freshPC.baseBw = lowSpeedRaces.includes(val) ? 20 : 30;
    });
  };

  // Klasse hinzufügen
  const handleAddClass = () => {
    if (classesCount >= 5) {
      showCustomAlert("Klassenlimit", "Mehr als 5 Klassen werden nicht unterstützt.");
      return;
    }
    CombatState.updatePCBatch((freshPC: any) => {
      if (!Array.isArray(freshPC.classes)) freshPC.classes = [];
      freshPC.classes.push({ classType: newClassKey, level: newClassLvl });
      freshPC.rebuildStatModifiers();
    });
    setShowAddForm(false);
  };

  // Klasse entfernen
  const handleRemoveClass = (idx: number) => {
    CombatState.updatePCBatch((freshPC: any) => {
      if (Array.isArray(freshPC.classes)) {
        freshPC.classes.splice(idx, 1);
        freshPC.rebuildStatModifiers();
      }
    });
  };

  // Hilfskomponente für Attribut
  const renderAttributeBox = (key: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', label: string, icon: string) => {
    const stat = pc[key];
    const score = stat?.getValue?.() ?? stat?.total ?? 0;
    const mod = stat?.mod ?? 0;
    const hasModifiers = Array.isArray(stat?.modifiers) && stat.modifiers.some((m: any) => m.value !== 0);

    let tooltip = `${label}wert`;
    if (hasModifiers && stat.modifiers) {
      const activeMods = stat.modifiers.filter((m: any) => m.value !== 0);
      tooltip += `\nBasiswert: ${stat.base}\nAktiver Wert: ${score}\nAktive Boni:\n` + 
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
          title="Klicke für eine kurze Erläuterung"
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
            title="Modifikator"
          />
          <button
            className="xbtn roll-attr-btn"
            onClick={(e) => handleRollAttribute(label, key, e)}
            style={{ padding: 0, width: '16px', height: '14px', fontSize: '8px', lineHeight: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`${label}wurf (Formel)`}
          >
            🎲
          </button>
        </div>
      </div>
    );
  };

  const availableClasses = (CombatRules.CLASSES as any[]) || [];

  return (
    <BaseCard title="✨ Attribute & Kompetenz">
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
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 600, letterSpacing: '0.3px' }}>🧬 Volk / Rasse</span>
            <select
              id="pcRaceSelect"
              value={pc.race || 'human'}
              onChange={(e) => handleRaceChange(e.target.value)}
              className="cinput"
              style={{ fontSize: '8px', height: '14px', padding: '0 2px', width: '80px', textAlign: 'center', outline: 'none', cursor: 'pointer' }}
            >
              <option value="human">Mensch</option>
              <option value="elf">Elf</option>
              <option value="dwarf">Zwerg</option>
              <option value="gnome">Gnom</option>
              <option value="halfling">Halbling</option>
              <option value="half_elf">Halbelf</option>
              <option value="half_orc">Halbork</option>
            </select>
          </div>

          {/* Klassen & Stufen Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', color: 'var(--red)', fontWeight: 600, letterSpacing: '0.3px' }}>🎭 Klassen &amp; Stufen</span>
            {classesCount < 4 && !showAddForm && (
              <button
                className="btn btn-p"
                onClick={() => setShowAddForm(true)}
                style={{ fontSize: '7px', padding: '1px 4px', lineHeight: 1, borderColor: 'var(--pb)', background: 'rgba(139,26,26,0.05)', color: 'var(--red)' }}
              >
                + Klasse
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
                    onChange={(e) => CombatState.updatePCClassType(idx, e.target.value)}
                    style={{ fontSize: '8px', height: '13px', padding: 0, flex: 1, border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--inkm)', outline: 'none', cursor: 'pointer' }}
                  >
                    {availableClasses
                      .filter((x: any) => x.key !== 'custom')
                      .map((cls: any) => (
                        <option key={cls.key} value={cls.key}>
                          {cls.nameDe} ({cls.nameEn})
                        </option>
                      ))}
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
                      title="Klasse entfernen"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '2px 0' }}>
                Benutzerdefinierte Stufen / Custom
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
                    .map((cls: any) => (
                      <option key={cls.key} value={cls.key}>
                        {cls.nameDe} ({cls.nameEn})
                      </option>
                    ))}
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
                <button className="btn btn-p" onClick={handleAddClass} style={{ fontSize: '7px', padding: '1px 5px' }}>Hinzufügen</button>
                <button className="btn" onClick={() => setShowAddForm(false)} style={{ fontSize: '7px', padding: '1px 5px' }}>✕</button>
              </div>
            </div>
          )}
        </div>

        {/* Attribute Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          {renderAttributeBox('str', 'Stärke', '⚔️')}
          {renderAttributeBox('dex', 'Geschick', '🎯')}
          {renderAttributeBox('con', 'Konstitution', '🛡️')}
          {renderAttributeBox('int', 'Intelligenz', '🧠')}
          {renderAttributeBox('wis', 'Weisheit', '🔮')}
          {renderAttributeBox('cha', 'Charisma', '✨')}
        </div>

        {/* BAB */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px', background: 'rgba(139,26,26,0.05)', border: '0.5px solid rgba(139,26,26,0.2)', borderRadius: '2px', padding: '4px' }}>
          <label style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>⚔️ Basisangriff (BAB):</label>
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
