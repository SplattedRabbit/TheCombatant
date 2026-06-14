/**
 * @module    DMCombatantsTable
 * @summary   Renders player/enemy tables on DM Screen with damage controls, recall buttons, stats and inline companion nesting.
 * @exports   DMCombatantsTable
 * @reads     state.combatants
 * @stateOps  CombatState.updateCombatantField, CombatState.updateCombatantNumber, CombatState.applyDamage, CombatState.applyTempHP, CombatState.removeCombatant, CombatState.addCombatant
 * @depends   React, @core/state.js, @core/rules.js, @core/ui/components/CompanionSheet.js, @core/ui/components/FamiliarSheet.js
 */

import React, { useState, useEffect } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CombatRules } from '@core/rules.js';
// @ts-ignore
import { CompanionSheet } from '@core/ui/components/CompanionSheet.js';
// @ts-ignore
import { FamiliarSheet } from '@core/ui/components/FamiliarSheet.js';
import type { Combatant } from '../../types/combat';

interface DMCombatantsTableProps {
  side: 'p' | 'e';
  combatants: Combatant[];
}

const getVal = (field: any): number | string => {
  if (!field) return 0;
  if (typeof field.getValue === 'function') {
    return field.getValue();
      }
  return field;
};

// Custom input component that updates on Blur/Enter to match Vanilla .onchange
interface CombatantInputProps {
  value: any;
  onChange: (val: string) => void;
  className?: string;
  type?: string;
  style?: React.CSSProperties;
  title?: string;
  placeholder?: string;
}

const CombatantInput: React.FC<CombatantInputProps> = ({
  value,
  onChange,
  className,
  type = 'text',
  style,
  title,
  placeholder,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type={type}
      value={localValue ?? ''}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      style={style}
      title={title}
      placeholder={placeholder}
    />
  );
};

// Component for a single Combatant row
interface CombatantRowProps {
  c: Combatant;
  combatantsList: Combatant[];
}

const CombatantRow: React.FC<CombatantRowProps> = ({ c, combatantsList }) => {
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
      const name = matched ? matched.nameDe : cl.classType;
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
    if (c.activeShape === 'bear') shapeLabel = 'Bär';
    if (c.activeShape === 'leopard') shapeLabel = 'Leopard';
    shapeBadge = <span className="dm-effect-badge badge-shape">🐾 Gestalt: {shapeLabel}</span>;
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
          title="Tierbegleiter rufen"
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

            const companionStats = CompanionSheet.getCompanionBaseStats(companionType, companionLevel) || {};
            const finalAC = companionStats.ac || 15;

            CombatState.addCombatant({
              id: companionId,
              name: (c as any).companionName || companionStats.name || 'Tierbegleiter',
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
          🐾 {(c as any).companionName || 'Begleiter'}
        </button>
      );
    } else if ((c as any).familiarType && (c as any).familiarType !== 'none' && !familiarExists) {
      recallButton = (
        <button 
          className="recall-btn familiar-recall-btn" 
          style={{ fontSize: '7px', padding: '1px 3px', marginLeft: '3px', cursor: 'pointer' }} 
          title="Vertrauten rufen"
          onClick={() => {
            const familiarType = (c as any).familiarType;
            const familiarStats = FamiliarSheet.getFamiliarBaseStats(familiarType) || {};
            const finalAC = familiarStats.ac || 15;
            const maxHP = Math.floor(c.maxHp / 2);
            const curHP = (c as any).familiarHP !== undefined ? Math.min(maxHP, (c as any).familiarHP) : maxHP;

            CombatState.addCombatant({
              id: familiarId,
              name: (c as any).familiarName || familiarStats.name || 'Vertrauter',
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
          🐾 {(c as any).familiarName || 'Vertrauter'}
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
              title="Aktuelle TP"
            />
            <span className="hp-sep">/</span>
            <span className="hp-max-txt" title="Max TP">{c.maxHp}</span>
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

        <div className="ac-triple-box" title="RK: Standard / Berührung / Flacher Fuß">
          <div className="ac-sub-box standard">
            <span className="ac-sub-lbl">RK</span>
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
          title="Bewegungsweite (ft)"
        />
        <CombatantInput 
          type="number"
          value={getVal(c.za)}
          onChange={(val) => CombatState.updateCombatantNumber(c.id, 'za', val)}
          className="cinput cinput-c char-stat-input"
          title="Zähigkeit"
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
          title="Willen"
        />

        <div className="action-col">
          <div className="dmg-row">
            <input 
              type="number" 
              value={dmgInput}
              onChange={(e) => setDmgInput(e.target.value)}
              className="small-in dmg-val-input" 
              placeholder="0" 
              title="Schadenswert" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyDamage();
              }}
            />
            <button className="xbtn xbtn-dmg deal-dmg-btn" onClick={handleApplyDamage}>Schaden</button>
            <button className="xbtn xbtn-heal deal-heal-btn" onClick={handleApplyHealing}>Heilen</button>
            <button 
              className="xbtn xbtn-temp-hp deal-temp-btn" 
              style={{ background: 'rgba(42,74,138,0.06)', borderColor: '#2a4a8a', color: '#1a2a6a' }}
              onClick={handleApplyTempHP}
            >
              +Temp
            </button>
            <button className="xbtn xbtn-del delete-char-btn no-print" title="Entfernen" onClick={handleDelete}>✕</button>
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

export const DMCombatantsTable: React.FC<DMCombatantsTableProps> = ({ side, combatants }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [addName, setAddName] = useState('');
  const [addInit, setAddInit] = useState('');
  const [addHp, setAddHp] = useState('');
  const [addAc, setAddAc] = useState('');
  
  // Player specific form states
  const [addClass, setAddClass] = useState('custom');
  const [addLevel, setAddLevel] = useState('1');

  // Enemy specific form states
  const [addEnemyType, setAddEnemyType] = useState('e');

  // Filter list of combatants to display
  let list: Combatant[] = [];
  if (side === 'p') {
    const players = combatants.filter(c => c.type === 'p');
    players.forEach(p => {
      list.push(p);
      const companion = combatants.find(x => x.id === `${p.id}-companion`);
      if (companion) list.push(companion);
      const familiar = combatants.find(x => x.id === `${p.id}-familiar`);
      if (familiar) list.push(familiar);
    });
  } else {
    list = combatants.filter(c => c.type !== 'p' && !c.id.endsWith('-companion') && !c.id.endsWith('-familiar'));
  }

  const handleConfirmAdd = () => {
    if (side === 'p') {
      const name = addName || 'Charakter';
      const init = parseInt(addInit) || 0;
      const hp = parseInt(addHp) || 10;
      const ac = parseInt(addAc) || 10;
      const level = parseInt(addLevel) || 1;

      const classes = addClass !== 'custom' ? [{ classType: addClass, level }] : [];

      CombatState.addCombatant({
        name,
        init,
        hp,
        maxHP: hp,
        ac,
        classType: addClass,
        level,
        classes,
        type: 'p'
      });

      // Reset states
      setAddName('');
      setAddInit('');
      setAddHp('');
      setAddAc('');
      setAddClass('custom');
      setAddLevel('1');
      setShowAddForm(false);
    } else {
      const name = addName || 'Gegner';
      const init = parseInt(addInit) || 0;
      const hp = parseInt(addHp) || 8;
      const ac = parseInt(addAc) || 10;

      CombatState.addCombatant({
        name,
        init,
        hp,
        maxHP: hp,
        ac,
        type: addEnemyType
      });

      // Reset states
      setAddName('');
      setAddInit('');
      setAddHp('');
      setAddAc('');
      setAddEnemyType('e');
      setShowAddForm(false);
    }
  };

  return (
    <div className="panel">
      <div className="phdr">
        <h2>{side === 'p' ? '⚔ Spielercharaktere' : '💀 Gegner & NSC'}</h2>
        <button className="btn no-print" onClick={() => setShowAddForm(!showAddForm)}>
          + Hinzufügen
        </button>
      </div>
      <div className="pbody">
        <div className="col-hdr">
          <span>Name</span>
          <span style={{ textAlign: 'center' }}>Init</span>
          <span style={{ textAlign: 'center' }}>TP</span>
          <span style={{ textAlign: 'center' }}>RK</span>
          <span style={{ textAlign: 'center' }}>BW</span>
          <span style={{ textAlign: 'center' }}>ZÄ</span>
          <span style={{ textAlign: 'center' }}>REF</span>
          <span style={{ textAlign: 'center' }}>WIL</span>
          <span>Schaden · Heilen</span>
        </div>

        {list.length === 0 ? (
          <div className="empty-msg">
            Noch keine {side === 'p' ? 'Spielercharaktere' : 'Gegner'} hinzugefügt
          </div>
        ) : (
          <div id={side === 'p' ? 'pRows' : 'eRows'}>
            {list.map(c => (
              <CombatantRow key={c.id} c={c} combatantsList={combatants} />
            ))}
          </div>
        )}

        {/* Add Form */}
        {side === 'p' ? (
          <div 
            className="add-form no-print" 
            style={{ 
              display: showAddForm ? 'flex' : 'none', 
              flexWrap: 'wrap', 
              gap: '3px', 
              alignItems: 'center',
              marginTop: '8px'
            }}
          >
            <label>Name:</label>
            <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} style={{ width: '65px' }} placeholder="Aranis" />
            <label>Init:</label>
            <input type="number" value={addInit} onChange={(e) => setAddInit(e.target.value)} style={{ width: '25px' }} placeholder="12" />
            <label>TP:</label>
            <input type="number" value={addHp} onChange={(e) => setAddHp(e.target.value)} style={{ width: '25px' }} placeholder="28" />
            <label>RK:</label>
            <input type="number" value={addAc} onChange={(e) => setAddAc(e.target.value)} style={{ width: '25px' }} placeholder="15" />
            <label style={{ marginLeft: '2px' }}>Klasse:</label>
            <select value={addClass} onChange={(e) => setAddClass(e.target.value)} style={{ width: '80px', fontSize: '8px', height: '14px', padding: '0 1px' }}>
              <option value="custom">Benutzerdefiniert</option>
              <option value="fighter">Kämpfer</option>
              <option value="cleric">Kleriker</option>
              <option value="rogue">Schurke</option>
              <option value="wizard">Magier</option>
              <option value="barbarian">Barbar</option>
              <option value="bard">Barde</option>
              <option value="druid">Druide</option>
              <option value="monk">Mönch</option>
              <option value="paladin">Paladin</option>
              <option value="ranger">Waldläufer</option>
              <option value="sorcerer">Hexenmeister</option>
            </select>
            <label>Stufe:</label>
            <select value={addLevel} onChange={(e) => setAddLevel(e.target.value)} style={{ width: '30px', fontSize: '8px', height: '14px', padding: '0' }}>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(lv => (
                <option key={lv} value={String(lv)}>{lv}</option>
              ))}
            </select>
            <button className="btn btn-p" onClick={handleConfirmAdd} style={{ padding: '1px 5px', height: '14px', lineHeight: '10px' }}>Einfügen</button>
            <button className="btn" onClick={() => setShowAddForm(false)} style={{ padding: '1px 4px', height: '14px', lineHeight: '10px' }}>✕</button>
          </div>
        ) : (
          <div 
            className="add-form no-print" 
            style={{ 
              display: showAddForm ? 'flex' : 'none', 
              flexWrap: 'wrap', 
              gap: '3px', 
              alignItems: 'center',
              marginTop: '8px'
            }}
          >
            <label>Name:</label>
            <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} style={{ width: '70px' }} placeholder="Goblin #1" />
            <label>Init:</label>
            <input type="number" value={addInit} onChange={(e) => setAddInit(e.target.value)} style={{ width: '28px' }} placeholder="8" />
            <label>TP:</label>
            <input type="number" value={addHp} onChange={(e) => setAddHp(e.target.value)} style={{ width: '28px' }} placeholder="12" />
            <label>RK:</label>
            <input type="number" value={addAc} onChange={(e) => setAddAc(e.target.value)} style={{ width: '28px' }} placeholder="13" />
            <select value={addEnemyType} onChange={(e) => setAddEnemyType(e.target.value)} style={{ height: '14px', fontSize: '8.5px', padding: '0 1px' }}>
              <option value="e">Gegner</option>
              <option value="n">NSC</option>
            </select>
            <button className="btn btn-p" onClick={handleConfirmAdd} style={{ padding: '1px 5px', height: '14px', lineHeight: '10px' }}>Einfügen</button>
            <button className="btn" onClick={() => setShowAddForm(false)} style={{ padding: '1px 4px', height: '14px', lineHeight: '10px' }}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
};
