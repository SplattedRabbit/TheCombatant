import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { uiRegistry } from '@core/ui/ui-shared.js';
import { CombatSpells } from '@core/spells.js';
import { CLASS_BUFFS } from '@core/data/class-buffs-data.js';
import {
  translateTarget,
  translateType,
  checkBuffConflict,
  resolveSpellEffectValue,
  calculateDurationRounds,
  activateBuffByKey
} from '@core/rules/BuffRules.js';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';

function findSpell(pc: any, key: string) {
  if (CombatSpells.REGISTRY[key]) {
    return CombatSpells.REGISTRY[key];
  }
  if (pc && Array.isArray(pc.customSpells)) {
    const found = pc.customSpells.find((s: any) => s.id === key || s.nameDe === key);
    if (found) return found;
  }
  return null;
}

interface BuffDetailsDialogProps {
  pc: any;
  spellKey: string;
  isClass: boolean;
  isAlreadyActiveIndex?: number | null;
  onClose: () => void;
}

export const BuffDetailsDialog: React.FC<BuffDetailsDialogProps> = ({
  pc,
  spellKey,
  isClass,
  isAlreadyActiveIndex = null,
  onClose
}) => {
  let displayName = '';
  let effectsList: any[] = [];
  let durationStr = '—';
  let description = '';
  let school = '';
  let classBuff = null;
  let spell = null;

  if (isClass) {
    classBuff = CLASS_BUFFS.find((b: any) => b.key === spellKey);
    if (classBuff) {
      displayName = classBuff.name;
      effectsList = classBuff.effects || [];
      durationStr = classBuff.duration || '—';
      description = classBuff.description || 'Klassenspezifischer Buff- oder Auren-Effekt.';
      school = classBuff.school || 'Klassenfähigkeit';
    }
  } else if (spellKey) {
    classBuff = CLASS_BUFFS.find((b: any) => b.key === spellKey);
    if (classBuff) {
      displayName = classBuff.name;
      effectsList = classBuff.effects || [];
      durationStr = classBuff.duration || '—';
      description = classBuff.description || 'Klassenspezifischer Buff- oder Auren-Effekt.';
      school = classBuff.school || 'Klassenfähigkeit';
      isClass = true;
    } else {
      spell = CombatSpells.REGISTRY?.[spellKey];
      if (spell) {
        displayName = spell.nameDe || spell.nameEn || spellKey;
        effectsList = spell.effects || [];
        durationStr = spell.duration || '—';
        description = spell.description || '';
        school = spell.school || 'Zauber';
      }
    }
  }

  if (isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]) {
    const activeInstance = pc.activeBuffs[isAlreadyActiveIndex];
    displayName = activeInstance.name;
    if (Array.isArray(activeInstance.effects)) {
      effectsList = activeInstance.effects;
    }
    if (activeInstance.durationFormula) {
      durationStr = activeInstance.durationFormula;
    }
  }

  if (!displayName) {
    if (isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]) {
      const activeInstance = pc.activeBuffs[isAlreadyActiveIndex];
      displayName = activeInstance.name || 'Eigener Buff';
      effectsList = activeInstance.effects || [];
    } else {
      return null;
    }
  }

  const inQuickSelection = Array.isArray(pc.quickBuffs) && pc.quickBuffs.some((b: any) => b.key === spellKey);

  const handleActivate = () => {
    onClose();
    // Use window dialogue facade prompts
    activateBuffByKey(pc, spellKey, isClass, {
      showCustomConfirm,
      showCustomAlert,
      showCustomPrompt: (title: string, msg: string, def: string, onConfirm: (val: string) => void) => {
        const bridge = (window as any).__REACT_DIALOG_BRIDGE__;
        if (bridge && bridge.showCustomPrompt) {
          bridge.showCustomPrompt(title, msg, def, "OK", onConfirm);
        }
      },
      renderPlayerScreen: () => {
        if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
          uiRegistry.renderPlayerScreen();
        }
      }
    });
  };

  const handleToggleFavorite = () => {
    onClose();
    CombatState.updatePCBatch((freshPc: any) => {
      if (!Array.isArray(freshPc.quickBuffs)) freshPc.quickBuffs = [];
      const index = freshPc.quickBuffs.findIndex((b: any) => b.key === spellKey);
      if (index >= 0) {
        freshPc.quickBuffs.splice(index, 1);
      } else {
        freshPc.quickBuffs.push({ key: spellKey, name: displayName, isClass });
      }
    });
    if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
      uiRegistry.renderPlayerScreen();
    }
  };

  return (
    <div
      id="buffDetails"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 20px',
          width: '580px',
          maxWidth: '92vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1)',
          fontFamily: "'IM Fell English SC', serif",
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontSize: '15px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.8px' }}>
          ✨ Buff-Regeln: {displayName}
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />

        <div className="info-dialog-body" style={{ textAlign: 'left', marginBottom: '12px' }}>
          <div
            className="ancient-parchment"
            style={{
              background: '#f4e8c1',
              border: '2px solid #8b1a1a',
              padding: '16px 20px',
              borderRadius: '4px',
              boxShadow: 'inset 0 0 35px rgba(139, 26, 26, 0.15)',
              fontFamily: "'Crimson Text', serif",
              color: '#1a0f00',
              lineHeight: 1.45,
              textAlign: 'left',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ fontStyle: 'italic', fontSize: '10px', color: '#8b1a1a', fontWeight: 'bold', borderBottom: '1px solid rgba(139,26,26,0.3)', paddingBottom: '4px', marginBottom: '8px' }}>
              {school || 'Effekt'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', fontSize: '10px', borderBottom: '0.5px dashed rgba(139, 26, 26, 0.4)', paddingBottom: '8px', marginBottom: '10px', fontWeight: 600 }}>
              <div><strong>Zeitdauer:</strong> {durationStr}</div>
              {(isAlreadyActiveIndex !== null && pc.activeBuffs?.[isAlreadyActiveIndex]?.casterLevel) && (
                <div><strong>Wirker-Stufe (Caster Level):</strong> {pc.activeBuffs[isAlreadyActiveIndex].casterLevel}</div>
              )}
            </div>
            {description && (
              <div style={{ fontSize: '11px', lineHeight: 1.5, color: '#2a1b0a', marginBottom: '10px', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                {description}
              </div>
            )}
            {effectsList.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <strong style={{ color: '#8b1a1a', fontSize: '11.5px', fontFamily: "'IM Fell English SC', serif", letterSpacing: '0.4px' }}>
                  Aktive Modifikatoren:
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  {effectsList.map((eff: any, idx: number) => {
                    const sign = eff.value >= 0 ? '+' : '';
                    return (
                      <div key={idx} style={{ fontSize: '10.5px', background: 'rgba(139, 26, 26, 0.03)', border: '0.5px solid rgba(139, 26, 26, 0.25)', borderRadius: '2px', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>• <strong>{translateTarget(eff.target)}:</strong></span>
                        <strong>{sign}{eff.value} ({translateType(eff.type)})</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
          {spellKey && (
            <>
              <button
                onClick={handleActivate}
                className="btn btn-p"
                style={{
                  fontFamily: "'IM Fell English SC', serif",
                  fontSize: '9.5px',
                  padding: '4px 22px',
                  cursor: 'pointer',
                  background: 'rgba(139, 26, 26, 0.1)',
                  border: '1px solid var(--pb)',
                  borderRadius: '2px',
                  color: 'var(--red)',
                  fontWeight: 'bold'
                }}
              >
                Aktivieren
              </button>
              <button
                onClick={handleToggleFavorite}
                className="btn btn-p"
                style={{
                  fontFamily: "'IM Fell English SC', serif",
                  fontSize: '9.5px',
                  padding: '4px 22px',
                  cursor: 'pointer',
                  background: 'rgba(139, 26, 26, 0.1)',
                  border: '1px solid var(--pb)',
                  borderRadius: '2px',
                  color: 'var(--red)',
                  fontWeight: 'bold'
                }}
              >
                {inQuickSelection ? 'Aus Schnellauswahl entfernen' : 'Hinzufügen'}
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="btn"
            style={{
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '9.5px',
              padding: '4px 22px',
              cursor: 'pointer',
              border: '1px solid var(--pb)',
              background: 'rgba(0,0,0,0.03)',
              color: 'var(--ink)'
            }}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};


interface CastSuccessDialogProps {
  pc: any;
  spellKey: string;
  metamagic?: string[];
  onClose: () => void;
}

export const CastSuccessDialog: React.FC<CastSuccessDialogProps> = ({
  pc,
  spellKey,
  metamagic = [],
  onClose
}) => {
  const spell = findSpell(pc, spellKey);
  if (!spell) return null;

  let defaultCL = 1;
  if (Array.isArray(pc.classes)) {
    pc.classes.forEach((c: any) => {
      if (['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'bard'].includes(c.classType)) {
        if (c.level > defaultCL) defaultCL = c.level;
      }
    });
  }

  const METAMAGIC_COSTS = { extend_spell: 1, empower_spell: 2, maximize_spell: 3, quicken_spell: 4 };
  const metamagicNames = { extend_spell: 'Verlängert', empower_spell: 'Verstärkt', maximize_spell: 'Maximiert', quicken_spell: 'Beschleunigt' };
  const appliedMeta = metamagic.map(mId => (metamagicNames as any)[mId] || mId);
  const metaSuffix = appliedMeta.length > 0 ? ` (${appliedMeta.join(', ')})` : '';
  const metamagicAdjustment = metamagic.reduce((sum, fId) => sum + ((METAMAGIC_COSTS as any)[fId] || 0), 0);
  const finalLevel = spell.level + metamagicAdjustment;
  const spellName = spell.nameDe || spell.nameEn || spellKey;

  const allPcs = CombatState.getState().combatants || [];
  const allies = allPcs.filter((c: any) => c.type === 'p' && c.id !== pc.id);

  const [casterLevel, setCasterLevel] = useState<number>(defaultCL);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([pc.id]);

  const handleTargetToggle = (tId: string) => {
    setSelectedTargets(prev =>
      prev.includes(tId) ? prev.filter(id => id !== tId) : [...prev, tId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTargets([pc.id, ...allies.map((a: any) => a.id)]);
  };

  const handleSelectNone = () => {
    setSelectedTargets([]);
  };

  const handleApplyBuff = () => {
    const cl = casterLevel;
    let rounds = calculateDurationRounds(spell.duration, cl);
    if (rounds !== null && metamagic.includes('extend_spell')) {
      rounds = rounds * 2;
    }

    const effects = spell.effects || [];
    const resolvedEffects = effects.map((eff: any) => {
      let val = parseInt(eff.value) || 0;
      if (eff.valueFormula) {
        val = resolveSpellEffectValue(eff.valueFormula, cl, val);
      }
      return {
        target: eff.target,
        value: val,
        type: eff.type,
        source: eff.source || spellName
      };
    });

    const activate = () => {
      CombatState.updatePCBatch((freshPc: any) => {
        if (!Array.isArray(freshPc.activeBuffs)) freshPc.activeBuffs = [];
        freshPc.activeBuffs = freshPc.activeBuffs.filter((b: any) => b.spellKey !== spellKey);

        freshPc.activeBuffs.push({
          id: 'spell_' + spellKey + '_' + Date.now(),
          spellKey: spellKey,
          name: spellName + metaSuffix,
          durationFormula: spell.duration,
          casterLevel: cl,
          durationMaxRounds: rounds,
          durationRemainingRounds: rounds,
          effects: resolvedEffects,
          sharedWith: selectedTargets
        });
      });

      if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
        uiRegistry.renderPlayerScreen();
      }
      onClose();
    };

    // Stacking conflict check on caster (if Self is selected)
    const isSelfTarget = selectedTargets.includes(pc.id);
    const conflict = isSelfTarget ? checkBuffConflict(pc, spellKey, resolvedEffects) : { status: 'ok' };

    if (conflict.status === 'suppressed') {
      showCustomConfirm(
        "Stacking-Konflikt",
        `Ein stärkerer oder gleichwertiger Buff (<strong>${(conflict as any).conflictingBuffName}</strong>) ist bereits aktiv.<br><br>Dein neuer Buff <strong>${(conflict as any).buffName}</strong> (+${(conflict as any).newValue} auf ${(conflict as any).targetLabel}) hat denselben Bonus-Typ und würde daher <strong>keine Wirkung</strong> zeigen.<br><br>Möchtest du den Buff dennoch aktivieren?`,
        () => {
          activate();
        }
      );
    } else if (conflict.status === 'overrides') {
      activate();
      showCustomAlert(
        "Buff überlagert",
        `Durch das Aktivieren von <strong>${(conflict as any).buffName}</strong> (+${(conflict as any).newValue}) wird der schwächere aktive Buff <strong>${(conflict as any).conflictingBuffName}</strong> (+${(conflict as any).activeValue}) auf <strong>${(conflict as any).targetLabel}</strong> überlagert.`,
        "Verstanden",
        "✨"
      );
    } else {
      activate();
    }
  };

  return (
    <div
      id="castSuccessDialogOverlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        className="custom-alert-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 20px',
          width: '520px',
          maxWidth: '95vw',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: "'Crimson Text', serif",
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          textAlign: 'left'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center' }}>
          Zauber erfolgreich gewirkt! ✨
        </div>
        <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 8px' }} />

        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', textAlign: 'center', fontFamily: "'IM Fell English SC', serif" }}>
          {spellName}{metaSuffix}
        </div>
        <div style={{ fontSize: '8.5px', color: 'var(--inkl)', textAlign: 'center', marginBottom: '8px', fontStyle: 'italic' }}>
          {spell.school} • Grad {finalLevel}
        </div>
        <div style={{ fontSize: '8px', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', border: '0.5px solid rgba(200, 169, 110, 0.2)', padding: '4px', borderRadius: '2px', lineHeight: 1.25, marginBottom: '10px', maxHeight: '80px', overflowY: 'auto', color: 'var(--ink)' }}>
          {spell.description}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px', fontSize: '9px', color: 'var(--ink)' }}>
          <strong>Wirkerstufe (Caster Level):</strong>
          <input
            type="number"
            className="cast-cl-input"
            value={casterLevel}
            onChange={(e) => setCasterLevel(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="40"
            style={{
              width: '40px',
              height: '16px',
              fontSize: '9px',
              textAlign: 'center',
              border: '0.5px solid var(--pb)',
              borderRadius: '2px',
              background: 'rgba(0,0,0,0.03)',
              color: 'var(--ink)',
              fontWeight: 'bold'
            }}
          />
        </div>

        <div style={{ marginBottom: '12px', color: 'var(--ink)' }}>
          <strong style={{ fontSize: '9px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif", display: 'block', marginBottom: '4px' }}>Ziele für den Buff / die Aura:</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto', padding: '4px', border: '0.5px solid rgba(200, 169, 110, 0.2)', background: 'rgba(0,0,0,0.01)', borderRadius: '2px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', cursor: 'pointer', color: 'var(--ink)' }}>
              <input
                type="checkbox"
                checked={selectedTargets.includes(pc.id)}
                onChange={() => handleTargetToggle(pc.id)}
                style={{ margin: 0 }}
              />
              <span><strong>{pc.name}</strong> (Selbst)</span>
            </label>
            {allies.map((ally: any) => (
              <label key={ally.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', cursor: 'pointer', color: 'var(--ink)' }}>
                <input
                  type="checkbox"
                  checked={selectedTargets.includes(ally.id)}
                  onChange={() => handleTargetToggle(ally.id)}
                  style={{ margin: 0 }}
                />
                <span>{ally.name}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSelectAll}
              className="btn btn-group-toggle"
              style={{ fontSize: '7.5px', padding: '2px 6px', border: '0.5px solid var(--pb)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer' }}
            >
              Ganze Gruppe
            </button>
            <button
              type="button"
              onClick={handleSelectNone}
              className="btn btn-none-toggle"
              style={{ fontSize: '7.5px', padding: '2px 6px', border: '0.5px solid var(--pb)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer' }}
            >
              Zurücksetzen
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={handleApplyBuff}
            className="btn btn-p apply-buff-btn"
            style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 14px', cursor: 'pointer' }}
          >
            Als Buff anwenden
          </button>
          <button
            onClick={onClose}
            className="btn close-dialog-btn"
            style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 14px', cursor: 'pointer', borderColor: 'var(--pb)', background: 'transparent', color: 'var(--ink)' }}
          >
            Nur zaubern (Kein Buff)
          </button>
        </div>
      </div>
    </div>
  );
};
