import React, { useState } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { getPrestigeClassFeatures } from '@core/rules/prestigeClassEngine.js';
// @ts-ignore
import { PRESTIGE_CLASSES_REGISTRY } from '@core/data/prestigeClasses-data.js';
// @ts-ignore
import { CLASSES } from '@core/rules/RulesData.js';

interface PrestigeClassFeaturesCardProps {
  pc: any;
  level: number;
  classKey: string;
}

const formatClassName = (key: string) => {
  if (!key) return 'Not selected';
  return key.charAt(0).toUpperCase() + key.slice(1);
};

function formatHeadline(format: string, value: any): string {
  switch (format) {
    case 'dc': return `DC ${value}`;
    case 'plus': return `+${value}`;
    case 'classLink': return formatClassName(value);
    case 'dualClassLink': {
      const links = value || {};
      return `Arcane: ${formatClassName(links.arcane)} / Divine: ${formatClassName(links.divine)}`;
    }
    default: return String(value ?? '');
  }
}

function formatRow(row: any, value: any, allFeatures: Record<string, any>): string | null {
  switch (row.format) {
    case 'plusd6': return `+${value}d6`;
    case 'plus': return `+${value}`;
    case 'perDay': return `${value}/day`;
    case 'activeFlag': return value ? row.activeText : null;
    case 'boolText': return value ? row.trueText : row.falseText;
    case 'plain': return String(value ?? '');
    case 'abilityBoosts': {
      const { strengthBoost = 0, constitutionBoost = 0, intelligenceBoost = 0, charismaBoost = 0 } = allFeatures;
      if (!strengthBoost && !constitutionBoost && !intelligenceBoost && !charismaBoost) return 'None';
      let text = '';
      if (strengthBoost > 0) text += `+${strengthBoost} STR `;
      if (constitutionBoost > 0) text += `+${constitutionBoost} CON `;
      if (intelligenceBoost > 0) text += `+${intelligenceBoost} INT `;
      if (charismaBoost > 0) text += `+${charismaBoost} CHA`;
      return text.trim();
    }
    default: return String(value ?? '');
  }
}

export const PrestigeClassFeaturesCard: React.FC<PrestigeClassFeaturesCardProps> = ({ pc, level, classKey }) => {
  const [rulesOpen, setRulesOpen] = useState(false);
  const classDef = PRESTIGE_CLASSES_REGISTRY[classKey];
  if (!classDef || !classDef.ui) return null;

  const features = getPrestigeClassFeatures(pc, classKey);
  const ui = classDef.ui;
  const clsInfo = CLASSES.find((c: any) => c.key === classKey);
  const displayName = clsInfo?.nameEn || formatClassName(classKey);

  const hasSneakAttackPool = Object.values(classDef.features || {}).some(
    (f: any) => f.type === 'diceStack' && f.pool === 'sneakAttack'
  );
  const saDiceCount = hasSneakAttackPool ? features[Object.keys(classDef.features).find(
    (k) => classDef.features[k].type === 'diceStack' && classDef.features[k].pool === 'sneakAttack'
  ) as string] : 0;

  const handleToggleSneakAttack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activePC = CombatState.getActivePC();
    activePC.isSneakAttacking = e.target.checked;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  const handleToggleTrickyFighting = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activePC = CombatState.getActivePC();
    activePC.isTrickyFightingActive = e.target.checked;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
  };

  const empowerAbilityIdx = Array.isArray(pc.dailyAbilities)
    ? pc.dailyAbilities.findIndex((ab: any) => ab.name === 'Ray Mastery: Empower')
    : -1;
  const empowerAbility = empowerAbilityIdx >= 0 ? pc.dailyAbilities[empowerAbilityIdx] : null;
  const empowerAbilityUsed = empowerAbility ? empowerAbility.used : 0;

  const handleUpdateEmpowerUsed = (diff: number) => {
    if (empowerAbilityIdx >= 0) {
      CombatState.updatePCDailyAbilityUsed(empowerAbilityIdx, diff);
    }
  };

  const rows = (ui.rows || []).filter((row: any) => !row.showIf || row.showIf(features));

  return (
    <div className="class-card expanded" style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', marginBottom: '5px', background: 'rgba(200, 169, 110, 0.03)', width: '100%' }}>
      <div className="class-card-hdr" style={{ background: 'rgba(200, 169, 110, 0.1)', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>🎭 {displayName} (Level {level})</span>
      </div>
      <div className="class-card-body" style={{ display: 'flex', padding: '6px', alignItems: 'start', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8.5px', background: 'rgba(200,169,110,0.1)', border: '0.5px solid var(--pb)', borderRadius: '2px', padding: '4px 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>{ui.headlineLabel || 'Details'}:</span>
              <button
                onClick={() => setRulesOpen(!rulesOpen)}
                className="btn"
                style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '2px', cursor: 'pointer', background: 'rgba(200, 169, 110, 0.08)', border: '0.5px solid var(--pb)', color: 'var(--inkm)', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', height: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } as any}
                title="Show rules"
              >
                📖 {rulesOpen ? '▲' : '▼'}
              </button>
            </div>
            <span style={{ color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>
              {formatHeadline(ui.headline.format, features[ui.headline.featureKey])}
            </span>
          </div>

          {rulesOpen && ui.rawText && (
            <div style={{ background: 'rgba(0, 0, 0, 0.02)', border: '0.5px solid rgba(200, 169, 110, 0.25)', borderRadius: '2px', padding: '4px', fontSize: '7.5px', color: 'var(--inkm)', lineHeight: 1.25, marginTop: '1px', fontFamily: "'Crimson Text', serif" }}
              dangerouslySetInnerHTML={{ __html: ui.rawText }}
            />
          )}

          {rows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '8px', marginTop: '2px' }}>
              {rows.map((row: any) => {
                const display = formatRow(row, features[row.featureKey], features);
                if (display === null) return null;
                return (
                  <div key={row.featureKey} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px dashed rgba(200,169,110,0.15)', paddingBottom: '2px' }}>
                    <span>{row.label}:</span>
                    <strong style={row.highlight ? { color: 'var(--red)' } : undefined}>{display}</strong>
                  </div>
                );
              })}
            </div>
          )}

          {hasSneakAttackPool && saDiceCount > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', cursor: 'pointer', padding: '2px 0' }}>
              <input
                type="checkbox"
                checked={pc.isSneakAttacking || false}
                onChange={handleToggleSneakAttack}
                style={{ cursor: 'pointer', width: '10px', height: '10px' }}
              />
              <span><strong>Apply Sneak Attack to damage</strong></span>
            </label>
          )}

          {classKey === 'battle_trickster' && level >= 3 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', cursor: 'pointer', padding: '2px 0' }}>
              <input
                type="checkbox"
                checked={pc.isTrickyFightingActive || false}
                onChange={handleToggleTrickyFighting}
                style={{ cursor: 'pointer', width: '10px', height: '10px' }}
              />
              <span><strong>Tricky Fighting Active (+1 competence bonus to attack)</strong></span>
            </label>
          )}

          {classKey === 'spellwarp_sniper' && level >= 5 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '8px', borderTop: '0.5px dashed rgba(200,169,110,0.15)', paddingTop: '4px', marginTop: '4px' }}>
              <span><strong>Ray Mastery Empower (1/day):</strong></span>
              <button
                className="btn btn-p"
                disabled={empowerAbilityUsed >= 1}
                onClick={() => handleUpdateEmpowerUsed(1)}
                style={{ fontSize: '7.5px', padding: '1px 5px', cursor: 'pointer' }}
              >
                Use
              </button>
              <button
                className="btn"
                disabled={empowerAbilityUsed <= 0}
                onClick={() => handleUpdateEmpowerUsed(-1)}
                style={{ fontSize: '7.5px', padding: '1px 5px', cursor: 'pointer', background: 'transparent', border: '0.5px solid var(--pb)', color: 'var(--ink)' }}
              >
                Refill
              </button>
              <span style={{ marginLeft: '4px', fontSize: '7.5px' }}>({1 - empowerAbilityUsed} available)</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
