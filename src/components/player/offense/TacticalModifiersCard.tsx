/**
 * @module    TacticalModifiersCard
 * @summary   Tactile sliders and toggles for combat maneuvers (Power Attack, Combat Expertise, Fighting Defensively, Total Defense).
 * @exports   TacticalModifiersCard
 * @reads     pc.bab, pc.feats, pc.powerAttackPenalty, pc.combatExpertisePenalty, pc.isDefensiveFighting, pc.isTotalDefense, pc.skills
 * @stateOps  CombatState.updatePCField, CombatState.togglePCDefensiveFighting, CombatState.togglePCTotalDefense
 * @depends   React, @core/state.js, src/components/shared/BaseCard
 */

import React from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
import { BaseCard } from '../../shared/BaseCard';
// @ts-ignore
import { showCustomAlert } from '@core/ui/components/dialogs.js';

interface TacticalModifiersCardProps {
  pc: any;
  babVal: number;
}

export const TacticalModifiersCard: React.FC<TacticalModifiersCardProps> = ({ pc, babVal }) => {
  const hasPowerAttack = pc.feats && pc.feats.some((f: any) => f.id === 'power_attack' || f.id === 'heftiger_angriff');
  const hasCombatExpertise = pc.feats && pc.feats.some((f: any) => f.id === 'combat_expertise' || f.id === 'kampfexpertise');

  const paVal = Math.max(0, Math.min(babVal, parseInt(pc.powerAttackPenalty) || 0));
  const maxCE = Math.min(5, babVal);
  const ceVal = Math.max(0, Math.min(maxCE, parseInt(pc.combatExpertisePenalty) || 0));

  // Tumble ranks synergy check (>= 5 ranks increases dodge bonuses)
  const tumbleSkill = Array.isArray(pc.skills) ? pc.skills.find((s: any) => s.id === 'tumble' || s.id === 'akrobatik') : null;
  const tumbleRanks = tumbleSkill ? (parseInt(tumbleSkill.ranks) || 0) : 0;
  const hasTumbleSynergy = tumbleRanks >= 5;

  const handlePowerAttackChange = (newVal: number) => {
    const penalty = Math.max(0, Math.min(babVal, newVal));
    CombatState.updatePCField('powerAttackPenalty', penalty);
  };

  const handleCombatExpertiseChange = (newVal: number) => {
    const penalty = Math.max(0, Math.min(maxCE, newVal));
    CombatState.updatePCField('combatExpertisePenalty', penalty);
  };

  const showPowerAttackRules = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showCustomAlert(
      "Power Attack (Heftiger Angriff)",
      `<div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
        <p><strong>Concept:</strong> Trade offensive accuracy for devastating blow damage.</p>
        <p><strong>Rule (D&D 3.5 RAW):</strong> On your action, before making attack rolls for a round, you may choose to subtract a number from all melee attack rolls and add the same number to all melee damage rolls.</p>
        <p><strong>Damage Multipliers:</strong></p>
        <ul style="margin: 4px 0 6px 14px;">
          <li><strong>One-Handed:</strong> +1 damage per -1 attack penalty (+1x).</li>
          <li><strong>Two-Handed:</strong> +2 damage per -1 attack penalty (+2x).</li>
          <li><strong>Light Weapons &amp; Off-hand:</strong> You cannot use Power Attack with light weapons (except unarmed strikes/natural attacks) or off-hand weapons.</li>
        </ul>
        <p><strong>Limit:</strong> The penalty cannot exceed your Base Attack Bonus (BAB: ${babVal}).</p>
      </div>`,
      "Understood",
      "⚔️"
    );
  };

  const showCombatExpertiseRules = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showCustomAlert(
      "Combat Expertise (Kampfexpertise)",
      `<div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
        <p><strong>Concept:</strong> Trade offensive accuracy to raise defensive guard.</p>
        <p><strong>Rule (D&D 3.5 RAW):</strong> When you make an attack or full-attack, you can choose to take a penalty on melee attack rolls (up to -5, limited by BAB). This penalty is added as a <strong>dodge bonus</strong> to your Armor Class (AC) and Touch AC until your next turn.</p>
        <p><strong>Limit:</strong> The penalty cannot exceed your Base Attack Bonus or 5 (Max: ${maxCE}).</p>
      </div>`,
      "Understood",
      "🛡️"
    );
  };

  const showDefensiveFightingRules = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showCustomAlert(
      "Fighting Defensively & Total Defense",
      `<div style="text-align: left; font-family: 'Crimson Text', serif; font-size: 11px;">
        <p><strong>Fighting Defensively:</strong> -4 penalty on all attacks in the round; gains a +2 dodge bonus to AC (+3 with 5+ ranks in Tumble: currently ${hasTumbleSynergy ? 'Active (+3 AC)' : 'Inactive (+2 AC)'}).</p>
        <p><strong>Total Defense:</strong> Standard action; gains a +4 dodge bonus to AC (+6 with 5+ ranks in Tumble: currently ${hasTumbleSynergy ? 'Active (+6 AC)' : 'Inactive (+4 AC)'}). You cannot make attacks or attacks of opportunity.</p>
      </div>`,
      "Understood",
      "🥋"
    );
  };

  return (
    <BaseCard title="🎛️ Tactical Modifiers &amp; Combat Stances">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Power Attack Slider */}
        {hasPowerAttack ? (
          <div
            style={{
              background: paVal > 0 ? 'rgba(139, 26, 26, 0.08)' : 'rgba(139, 26, 26, 0.03)',
              border: `1px solid ${paVal > 0 ? 'var(--red)' : 'rgba(139, 26, 26, 0.25)'}`,
              borderRadius: '4px',
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: 'var(--red)' }}>
                <span>⚔️ Power Attack</span>
                <button
                  onClick={showPowerAttackRules}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '8px', padding: 0, color: 'var(--red)', opacity: 0.8 }}
                  title="Show rules"
                >
                  📖 ↗
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    background: paVal > 0 ? 'var(--red)' : 'rgba(0,0,0,0.06)',
                    color: paVal > 0 ? '#fff' : 'var(--inkm)',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    padding: '1px 5px',
                    borderRadius: '2px',
                    fontFamily: 'monospace'
                  }}
                >
                  -{paVal} Atk
                </span>
                <span style={{ fontSize: '7.5px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", fontWeight: 'bold' }}>
                  (1H: +{paVal} | 2H: +{paVal * 2} Dmg)
                </span>
              </div>
            </div>

            {/* Slider & Stepper Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <button
                className="btn"
                onClick={() => handlePowerAttackChange(paVal - 1)}
                disabled={paVal <= 0}
                style={{ width: '18px', height: '18px', padding: 0, fontSize: '9px', lineHeight: 1, fontWeight: 'bold' }}
              >
                -
              </button>
              <input
                type="range"
                min="0"
                max={babVal}
                value={paVal}
                onChange={(e) => handlePowerAttackChange(parseInt(e.target.value) || 0)}
                style={{ flex: 1, accentColor: 'var(--red)', cursor: 'pointer', height: '4px' }}
              />
              <button
                className="btn"
                onClick={() => handlePowerAttackChange(paVal + 1)}
                disabled={paVal >= babVal}
                style={{ width: '18px', height: '18px', padding: 0, fontSize: '9px', lineHeight: 1, fontWeight: 'bold' }}
              >
                +
              </button>
              <span style={{ fontSize: '7.5px', color: 'var(--inkm)', minWidth: '35px', textAlign: 'right', fontFamily: "'IM Fell English SC', serif" }}>
                Max: {babVal}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px dashed rgba(200, 169, 110, 0.3)', borderRadius: '3px', padding: '4px 6px', fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚔️ Power Attack (Feat not learned)</span>
            <span style={{ fontSize: '7px', opacity: 0.7 }}>Requires STR 13+, BAB +1</span>
          </div>
        )}

        {/* Combat Expertise Slider */}
        {hasCombatExpertise ? (
          <div
            style={{
              background: ceVal > 0 ? 'rgba(42, 106, 138, 0.08)' : 'rgba(42, 106, 138, 0.03)',
              border: `1px solid ${ceVal > 0 ? '#2a6a8a' : 'rgba(42, 106, 138, 0.25)'}`,
              borderRadius: '4px',
              padding: '6px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'IM Fell English SC', serif", fontSize: '9px', fontWeight: 'bold', color: '#2a6a8a' }}>
                <span>🛡️ Combat Expertise</span>
                <button
                  onClick={showCombatExpertiseRules}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '8px', padding: 0, color: '#2a6a8a', opacity: 0.8 }}
                  title="Show rules"
                >
                  📖 ↗
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    background: ceVal > 0 ? '#2a6a8a' : 'rgba(0,0,0,0.06)',
                    color: ceVal > 0 ? '#fff' : 'var(--inkm)',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    padding: '1px 5px',
                    borderRadius: '2px',
                    fontFamily: 'monospace'
                  }}
                >
                  -{ceVal} Atk
                </span>
                <span style={{ fontSize: '7.5px', color: '#2a6a8a', fontFamily: "'Crimson Text', serif", fontWeight: 'bold' }}>
                  (+{ceVal} Dodge AC)
                </span>
              </div>
            </div>

            {/* Slider & Stepper Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <button
                className="btn"
                onClick={() => handleCombatExpertiseChange(ceVal - 1)}
                disabled={ceVal <= 0}
                style={{ width: '18px', height: '18px', padding: 0, fontSize: '9px', lineHeight: 1, fontWeight: 'bold' }}
              >
                -
              </button>
              <input
                type="range"
                min="0"
                max={maxCE}
                value={ceVal}
                onChange={(e) => handleCombatExpertiseChange(parseInt(e.target.value) || 0)}
                style={{ flex: 1, accentColor: '#2a6a8a', cursor: 'pointer', height: '4px' }}
              />
              <button
                className="btn"
                onClick={() => handleCombatExpertiseChange(ceVal + 1)}
                disabled={ceVal >= maxCE}
                style={{ width: '18px', height: '18px', padding: 0, fontSize: '9px', lineHeight: 1, fontWeight: 'bold' }}
              >
                +
              </button>
              <span style={{ fontSize: '7.5px', color: 'var(--inkm)', minWidth: '35px', textAlign: 'right', fontFamily: "'IM Fell English SC', serif" }}>
                Max: {maxCE}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px dashed rgba(200, 169, 110, 0.3)', borderRadius: '3px', padding: '4px 6px', fontSize: '7.5px', color: 'var(--inkl)', fontStyle: 'italic', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🛡️ Combat Expertise (Feat not learned)</span>
            <span style={{ fontSize: '7px', opacity: 0.7 }}>Requires INT 13+</span>
          </div>
        )}

        {/* Standard Defensive Maneuvers (Fight Defensively / Total Defense) */}
        <div
          style={{
            background: 'rgba(200, 169, 110, 0.05)',
            border: '1px solid var(--pb)',
            borderRadius: '4px',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '8.5px', fontWeight: 'bold', color: 'var(--ink)' }}>
              🥋 Defensive Stances
            </span>
            <button
              onClick={showDefensiveFightingRules}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '8px', padding: 0, color: 'var(--pb)' }}
              title="Show rules"
            >
              📖 ↗
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                color: pc.isDefensiveFighting ? 'var(--red)' : 'var(--inkm)',
                margin: 0,
                fontWeight: 'bold',
                fontSize: '8px',
                fontFamily: "'IM Fell English SC', serif"
              }}
            >
              <input
                type="checkbox"
                checked={!!pc.isDefensiveFighting}
                onChange={(e) => CombatState.togglePCDefensiveFighting(e.target.checked)}
                style={{ margin: 0, width: '11px', height: '11px', cursor: 'pointer' }}
              />
              ⚔️ Fight Defensively (-4 Atk / +{hasTumbleSynergy ? '3' : '2'} AC)
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                color: pc.isTotalDefense ? 'var(--red)' : 'var(--inkm)',
                margin: 0,
                fontWeight: 'bold',
                fontSize: '8px',
                fontFamily: "'IM Fell English SC', serif"
              }}
            >
              <input
                type="checkbox"
                checked={!!pc.isTotalDefense}
                onChange={(e) => CombatState.togglePCTotalDefense(e.target.checked)}
                style={{ margin: 0, width: '11px', height: '11px', cursor: 'pointer' }}
              />
              🛡️ Total Defense (+{hasTumbleSynergy ? '6' : '4'} AC / no attacks)
            </label>
          </div>

          {hasTumbleSynergy && (
            <div style={{ fontSize: '7px', color: '#27ae60', fontStyle: 'italic', fontFamily: "'Crimson Text', serif" }}>
              ✓ Tumble Mastery (5+ Ranks): Dodge bonus increased by +1 AC!
            </div>
          )}
        </div>

        {/* Total Defense Alert */}
        {pc.isTotalDefense && (
          <div
            style={{
              background: 'rgba(139, 26, 26, 0.1)',
              border: '1px solid var(--red)',
              borderRadius: '3px',
              padding: '4px 6px',
              textAlign: 'center',
              color: 'var(--red)',
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '8px',
              fontWeight: 'bold'
            }}
          >
            🛡️ Total Defense Active: Focus is entirely on defense. Attacks are locked!
          </div>
        )}

      </div>
    </BaseCard>
  );
};
