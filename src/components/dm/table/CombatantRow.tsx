/**
 * @module    CombatantRow
 * @summary   Single combatant row in DM screen table: initiative, HP bar, AC triple box, saving throws, damage controls, effects.
 */

import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { CombatRules } from '@core/rules.js';
import { CompanionRules } from '@core/rules/CompanionRules.js';
import { FamiliarRules } from '@core/rules/FamiliarRules.js';
import type { Combatant } from '../../../types/combat';
import { CombatantInput } from './CombatantInput.tsx';

export const getVal = (field: any): number => {
  if (field === null || field === undefined) return 0;
  if (typeof field === 'number') return field;
  if (typeof field === 'string') {
    const parsed = parseInt(field);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof field.getValue === 'function') {
    return field.getValue();
  }
  if (typeof field === 'object') {
    const base = typeof field.base === 'number' ? field.base : (parseInt(field.base) || 0);
    const modifiers = Array.isArray(field.modifiers) ? field.modifiers : [];
    const grouped: Record<string, number> = {};
    let penaltiesSum = 0;
    
    modifiers.forEach((m: any) => {
      if (!m) return;
      const val = parseInt(m.value) || 0;
      if (val < 0) {
        penaltiesSum += val;
      } else if (m.type === 'dodge' || m.type === 'untyped') {
        grouped[m.type] = (grouped[m.type] || 0) + val;
      } else {
        grouped[m.type] = Math.max(grouped[m.type] || 0, val);
      }
    });
    const totalMod = Object.values(grouped).reduce((sum, val) => sum + val, 0);
    return base + totalMod + penaltiesSum;
  }
  return 0;
};

export interface CombatantRowProps {
  c: Combatant;
  combatantsList: Combatant[];
}

export const CombatantRow: React.FC<CombatantRowProps> = ({ c, combatantsList }) => {
  const [dmgInput, setDmgInput] = useState('');

  const pct = c.maxHp > 0 ? Math.max(0, Math.min(100, c.hp / c.maxHp * 100)) : 0;
  
  const fillCls = (percentage: number, hp: number) => {
    if (hp <= 0) return 'fill-dead';
    if (percentage > 50) return 'fill-ok';
    if (percentage > 25) return 'fill-warn';
    return 'fill-crit';
  };

  const dotCls = (t: string) => {
    return t === 'p' ? 'dot-p' : t === 'n' ? 'dot-n' : 'dot-e';
  };

  const hpColor = c.hp < 0 ? { color: 'var(--red)' } : {};
  const tempHPObj = Array.isArray(c.conditions) 
    ? (c.conditions as any[]).find((x: any) => typeof x === 'object' && x.n === 'Temp-HP')
    : null;
  const tempHP = tempHPObj ? (parseInt(tempHPObj.tmpVal) || 0) : 0;

  // Class Description for player character
  let classBadge = null;
  if (c.type === 'p' && Array.isArray(c.classes) && c.classes.length > 0) {
    const classStr = c.classes.map(cl => {
      const matched = CombatRules.CLASSES.find((x: any) => x.key === cl.classType);
      const name = matched ? (matched.nameEn || matched.nameDe) : cl.classType;
      return `${name} ${cl.level}`;
    }).join(' / ');
    classBadge = (
      <div 
        style={{
          fontSize: '7px', 
          color: 'var(--red)', 
          fontStyle: 'italic', 
          marginTop: '1px', 
          maxWidth: '110px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap', 
          lineHeight: '1'
        }} 
        title={classStr}
      >
        {classStr}
      </div>
    );
  }

  // Active shape badge
  let shapeBadge = null;
  if (c.activeShape && c.activeShape !== 'none') {
    let shapeLabel = c.activeShape;
    if (c.activeShape === 'wolf') shapeLabel = 'Wolf';
    if (c.activeShape === 'bear') shapeLabel = 'Bear';
    if (c.activeShape === 'leopard') shapeLabel = 'Leopard';
    shapeBadge = <span className="dm-effect-badge badge-shape">🐾 Shape: {shapeLabel}</span>;
  }

  // Active buffs badges
  let buffBadges = null;
  if (Array.isArray(c.activeBuffs) && c.activeBuffs.length > 0) {
    buffBadges = c.activeBuffs.map(b => {
      const auraPrefix = (b as any).sharedWith ? '✦ ' : '';
      return (
        <span key={b.id} className="dm-effect-badge badge-buff">
          {auraPrefix}{b.name}{' '}
          <span 
            className="remove-effect-btn" 
            onClick={(e) => {
              e.stopPropagation();
              const state = CombatState.getState();
              const found = state.combatants.find((x: any) => x.id === c.id);
              if (found) {
                found.activeBuffs = (found.activeBuffs || []).filter((x: any) => x.id !== b.id);
                CombatState.saveToStorage();
                CombatState.updateMeta('sitzung', state.meta.sitzung);
              }
            }}
            style={{ marginLeft: '3px', cursor: 'pointer' }}
          >
            ✕
          </span>
        </span>
      );
    });
  }

  // Recall companion/familiar buttons
  let recallButton = null;
  if (c.type === 'p') {
    const companionId = `${c.id}-companion`;
    const familiarId = `${c.id}-familiar`;
    const companionExists = combatantsList.some(x => x.id === companionId);
    const familiarExists = combatantsList.some(x => x.id === familiarId);

    if ((c as any).companionType && (c as any).companionType !== 'none' && !companionExists) {
      recallButton = (
        <button 
          className="recall-btn companion-recall-btn" 
          style={{ fontSize: '7px', padding: '1px 3px', marginLeft: '3px', cursor: 'pointer' }} 
          title="Summon animal companion"
          onClick={() => {
            const companionType = (c as any).companionType;
            const level = c.totalLevel || 1;
            const rangerClass = c.classes?.find(cl => cl.classType === 'ranger');
            const druidClass = c.classes?.find(cl => cl.classType === 'druid');
            let companionLevel = level;
            if (rangerClass) {
              companionLevel = Math.max(1, Math.floor(rangerClass.level / 2));
            } else if (druidClass) {
              companionLevel = druidClass.level;
            }

            const companionStats = CompanionRules.getCompanionBaseStats(companionType, companionLevel) || {};
            const finalAC = companionStats.ac || 15;

            CombatState.addCombatant({
              id: companionId,
              name: (c as any).companionName || companionStats.name || 'Animal Companion',
              type: 'n',
              hp: (c as any).companionHP || companionStats.maxHP || 10,
              maxHP: (c as any).companionMaxHP || companionStats.maxHP || 10,
              init: c.init || 0,
              ac: finalAC,
              bw: companionStats.bw || 30,
              za: getVal(c.za),
              ref: getVal(c.ref),
              wil: getVal(c.wil)
            });
          }}
        >
          🐾 {(c as any).companionName || 'Companion'}
        </button>
      );
    } else if ((c as any).familiarType && (c as any).familiarType !== 'none' && !familiarExists) {
      recallButton = (
        <button 
          className="recall-btn familiar-recall-btn" 
          style={{ fontSize: '7px', padding: '1px 3px', marginLeft: '3px', cursor: 'pointer' }} 
          title="Summon familiar"
          onClick={() => {
            const familiarType = (c as any).familiarType;
            const familiarStats = FamiliarRules.getFamiliarBaseStats(familiarType) || {};
            const finalAC = familiarStats.ac || 15;
            const maxHP = Math.floor(c.maxHp / 2);
            const curHP = (c as any).familiarHP !== undefined ? Math.min(maxHP, (c as any).familiarHP) : maxHP;

            CombatState.addCombatant({
              id: familiarId,
              name: (c as any).familiarName || familiarStats.name || 'Familiar',
              type: 'n',
              hp: curHP,
              maxHP: maxHP,
              init: c.init || 0,
              ac: finalAC,
              bw: familiarStats.bw || 30,
              za: getVal(c.za),
              ref: getVal(c.ref),
              wil: getVal(c.wil)
            });
          }}
        >
          🐾 {(c as any).familiarName || 'Familiar'}
        </button>
      );
    }
  }

  const isCompanionOrFamiliar = c.id.endsWith('-companion') || c.id.endsWith('-familiar');
  const hasEffects = shapeBadge || buffBadges;

  // Damage & Healing actions
  const handleApplyDamage = () => {
    const val = parseInt(dmgInput) || 0;
    if (val > 0) {
      CombatState.applyDamage(c.id, val, false);
      setDmgInput('');
    }
  };

  const handleApplyHealing = () => {
    const val = parseInt(dmgInput) || 0;
    if (val > 0) {
      CombatState.applyDamage(c.id, val, true);
      setDmgInput('');
    }
  };

  const handleApplyTempHP = () => {
    const val = parseInt(dmgInput) || 0;
    if (val > 0) {
      CombatState.applyTempHP(c.id, val);
      setDmgInput('');
    }
  };

  const handleDelete = () => {
    CombatState.removeCombatant(c.id);
  };

  return (
    <div className="crow" id={`crow-${c.id}`}>
      <div className="crow-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', minWidth: 0, boxSizing: 'border-box', paddingLeft: isCompanionOrFamiliar ? '14px' : '0px' }}>
          <div className={`init-dot ${dotCls(c.type)}`} style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', width: '100%' }}>
              <CombatantInput 
                value={c.name} 
                onChange={(val) => CombatState.updateCombatantField(c.id, 'name', val)}
                className="cinput char-name-input"
                style={{ flex: 1, minWidth: 0, height: '12px', fontSize: '8.5px', padding: '0 2px' }}
              />
              {recallButton}
            </div>
            {classBadge}
          </div>
        </div>

        <CombatantInput 
          type="number"
          value={c.init}
          onChange={(val) => {
            CombatState.updateCombatantNumber(c.id, 'init', val);
            CombatState.sortCombatants();
          }}
          className="cinput cinput-c char-init-input"
          title="Initiative"
        />

        <div className="hp-wrap">
          <div className="hp-nums">
            <CombatantInput 
              type="number"
              value={c.hp}
              onChange={(val) => CombatState.updateCombatantNumber(c.id, 'hp', val)}
              className="cinput cinput-c hp-cur-in"
              style={hpColor}
              title="Current HP"
            />
            <span className="hp-sep">/</span>
            <span className="hp-max-txt" title="Max HP">{c.maxHp}</span>
            {tempHP > 0 && (
              <span className="hp-temp-txt" style={{ color: '#00b8f0', fontSize: '7.5px', fontWeight: 'bold', marginLeft: '2px' }}>
                (+{tempHP})
              </span>
            )}
          </div>
          <div className="hp-bar-wrap">
            <div className={`hp-bar-fill ${fillCls(pct, c.hp)}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="ac-triple-box" title="AC: Standard / Touch / Flat-footed">
          <div className="ac-sub-box standard">
            <span className="ac-sub-lbl">AC</span>
            <span className="ac-sub-val">{getVal(c.ac)}</span>
          </div>
          <div className="ac-sub-box touch">
            <span className="ac-sub-lbl">Tch</span>
            <span className="ac-sub-val">{getVal(c.acTouch)}</span>
          </div>
          <div className="ac-sub-box flat">
            <span className="ac-sub-lbl">Flat</span>
            <span className="ac-sub-val">{getVal(c.acFlat)}</span>
          </div>
        </div>

        <CombatantInput 
          type="number"
          value={getVal(c.bw)}
          onChange={(val) => CombatState.updateCombatantNumber(c.id, 'bw', val)}
          className="cinput cinput-c char-stat-input"
          title="Speed (ft)"
        />
        <CombatantInput 
          type="number"
          value={getVal(c.za)}
          onChange={(val) => CombatState.updateCombatantNumber(c.id, 'za', val)}
          className="cinput cinput-c char-stat-input"
          title="Fortitude"
        />
        <CombatantInput 
          type="number"
          value={getVal(c.ref)}
          onChange={(val) => CombatState.updateCombatantNumber(c.id, 'ref', val)}
          className="cinput cinput-c char-stat-input"
          title="Reflex"
        />
        <CombatantInput 
          type="number"
          value={getVal(c.wil)}
          onChange={(val) => CombatState.updateCombatantNumber(c.id, 'wil', val)}
          className="cinput cinput-c char-stat-input"
          title="Will"
        />

        <div className="action-col">
          <div className="dmg-row">
            <input 
              type="number" 
              value={dmgInput}
              onChange={(e) => setDmgInput(e.target.value)}
              className="small-in dmg-val-input" 
              placeholder="0" 
              title="Damage value" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyDamage();
              }}
            />
            <button className="xbtn xbtn-dmg deal-dmg-btn" onClick={handleApplyDamage}>Damage</button>
            <button className="xbtn xbtn-heal deal-heal-btn" onClick={handleApplyHealing}>Heal</button>
            <button 
              className="xbtn xbtn-temp-hp deal-temp-btn" 
              style={{ background: 'rgba(42,74,138,0.06)', borderColor: '#2a4a8a', color: '#1a2a6a' }}
              onClick={handleApplyTempHP}
            >
              +Temp
            </button>
            <button className="xbtn xbtn-del delete-char-btn no-print" title="Remove" onClick={handleDelete}>✕</button>
          </div>
        </div>
      </div>

      {hasEffects && (
        <div className="crow-effects-row">
          {shapeBadge}
          {buffBadges}
        </div>
      )}
    </div>
  );
};
