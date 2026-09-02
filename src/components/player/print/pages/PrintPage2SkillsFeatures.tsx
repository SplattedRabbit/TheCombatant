/**
 * @module    PrintPage2SkillsFeatures
 * @summary   Page 2 of the Printable D&D 3.5e Character Sheet (Skills, Feats, Skill Tricks, Features & ACFs).
 */

import React from 'react';
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
import { CombatFeats } from '@core/data/feats-data.js';
import { SKILL_TRICKS_REGISTRY } from '@core/data/skillTricks-data.js';
import { getACF } from '@core/data/acf-data.js';
import { CombatRules } from '@core/rules.js';

interface PrintPageProps {
  pc: any;
}

export const PrintPage2SkillsFeatures: React.FC<PrintPageProps> = ({ pc }) => {
  // Extract all skills and calculate totals
  const allSkills = Object.entries(SKILLS_REGISTRY).map(([key, def]: [string, any]) => {
    const rawSkill = pc.skills?.[key];
    const ranks = typeof rawSkill === 'object' ? (rawSkill.ranks || 0) : (Number(rawSkill) || 0);
    const keyAttr = (def.attribute || def.stat || 'str').toLowerCase();
    const attrMod = typeof pc.getAttributeMod === 'function' ? pc.getAttributeMod(keyAttr) : 0;
    const misc = typeof rawSkill === 'object' ? (rawSkill.misc || 0) : 0;
    const total = ranks > 0 || !def.trainedOnly ? ranks + attrMod + misc : attrMod + misc;
    
    // Check if class skill in any class
    const isClassSkill = (pc.classes || []).some((c: any) => {
      const clsSkills = CombatRules.CLASS_SKILLS?.[c.classType] || [];
      return clsSkills.includes(key) || (key.startsWith('knowledge_') && ['wizard', 'bard'].includes(c.classType));
    });

    return {
      key,
      name: def.nameEn || def.nameDe || key,
      attr: keyAttr.toUpperCase(),
      isClassSkill,
      trainedOnly: !!def.trainedOnly,
      armorCheck: !!def.armorCheck,
      ranks,
      attrMod,
      misc,
      total: total >= 0 ? `+${total}` : `${total}`,
    };
  });

  // Sort skills alphabetically
  allSkills.sort((a, b) => a.name.localeCompare(b.name));

  // Split skills into 2 columns for a clean 3.5e tabular layout
  const midIndex = Math.ceil(allSkills.length / 2);
  const leftSkills = allSkills.slice(0, midIndex);
  const rightSkills = allSkills.slice(midIndex);

  // Feats
  const featsList = (pc.feats || []).map((f: any) => {
    const fid = typeof f === 'object' ? f.id : f;
    const featDef = (CombatFeats.REGISTRY as any)[fid];
    return {
      id: fid,
      name: featDef?.nameEn || featDef?.nameDe || fid,
      category: featDef?.category || 'General',
      benefit: featDef?.benefitRaw || featDef?.benefitDe || featDef?.benefit || '—',
    };
  });

  // Skill Tricks
  const skillTricksList = (pc.skillTricks || []).map((t: any) => {
    const tid = typeof t === 'object' ? t.id : t;
    const trickDef = (SKILL_TRICKS_REGISTRY as any)[tid];
    return {
      id: tid,
      name: trickDef?.nameEn || trickDef?.nameDe || tid,
      type: trickDef?.type || 'Interaction',
      desc: trickDef?.description || trickDef?.benefit || '—',
    };
  });

  // ACFs
  const acfsList = (pc.acfs || []).map((aid: string) => {
    const acfDef = getACF(aid);
    return {
      id: aid,
      name: acfDef?.name || acfDef?.nameEn || acfDef?.nameDe || aid,
      replaces: acfDef?.replaces || '—',
      desc: acfDef?.description || acfDef?.desc || '—',
    };
  });

  const renderSkillTable = (skills: typeof allSkills) => (
    <table className="dnd-table" style={{ fontSize: '7.5pt' }}>
      <thead>
        <tr>
          <th style={{ width: '14px' }}>CS</th>
          <th style={{ textAlign: 'left' }}>Skill Name</th>
          <th style={{ width: '24px' }}>Attr</th>
          <th style={{ width: '24px' }}>Total</th>
          <th style={{ width: '20px' }}>Mod</th>
          <th style={{ width: '20px' }}>Ranks</th>
          <th style={{ width: '20px' }}>Misc</th>
        </tr>
      </thead>
      <tbody>
        {skills.map((s) => (
          <tr key={s.key}>
            <td style={{ textAlign: 'center' }}>
              <span className={`dnd-checkbox ${s.isClassSkill ? 'dnd-checkbox-checked' : ''}`}>
                {s.isClassSkill ? '✓' : ''}
              </span>
            </td>
            <td>
              <strong>{s.name}</strong>
              {s.armorCheck && <span style={{ color: 'var(--dnd-red)', marginLeft: '2px' }}>*</span>}
              {s.trainedOnly && <span style={{ color: 'var(--dnd-gray-med)', fontSize: '5.5pt', marginLeft: '2px' }}>†</span>}
            </td>
            <td style={{ textAlign: 'center', fontSize: '6pt', color: 'var(--dnd-gray-dark)' }}>{s.attr}</td>
            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{s.total}</td>
            <td style={{ textAlign: 'center' }}>{s.attrMod >= 0 ? `+${s.attrMod}` : s.attrMod}</td>
            <td style={{ textAlign: 'center' }}>{s.ranks > 0 ? s.ranks : '—'}</td>
            <td style={{ textAlign: 'center' }}>{s.misc !== 0 ? (s.misc > 0 ? `+${s.misc}` : s.misc) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="dnd-page">
      <div className="dnd-page-border" />

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 className="dnd-header-title">SKILLS &amp; FEATS</h1>
          <div className="dnd-header-subtitle">v.3.5 Character Record Sheet • Page 2: Abilities &amp; Features</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '7.5pt' }}>
          <strong>Character:</strong> {pc.name || 'Unknown'}
        </div>
      </div>

      {/* Skills Section (2 Columns) */}
      <div style={{ marginBottom: '8px' }}>
        <div className="dnd-section-banner">
          <span>Skills</span>
          <span style={{ fontSize: '5.5pt', fontWeight: 'normal', textTransform: 'none' }}>
            CS = Class Skill • * = Armor Check Penalty applies • † = Trained Only
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>{renderSkillTable(leftSkills)}</div>
          <div>{renderSkillTable(rightSkills)}</div>
        </div>
      </div>

      {/* Lower Section: Feats & Special Features */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
        
        {/* Left Column: Feats & Skill Tricks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="dnd-section-banner">Feats</div>
          <div className="dnd-box" style={{ flex: 1, padding: '4px', minHeight: '120px' }}>
            {featsList.length === 0 ? (
              <div style={{ fontSize: '7pt', color: 'var(--dnd-gray-med)', fontStyle: 'italic', padding: '6px' }}>No feats recorded.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {featsList.map((f: any) => (
                  <div key={f.id} style={{ borderBottom: '0.5pt solid var(--dnd-gray-light)', paddingBottom: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '7.5pt', color: 'var(--dnd-red)' }}>{f.name}</strong>
                      <span style={{ fontSize: '5.5pt', textTransform: 'uppercase', color: 'var(--dnd-gray-med)' }}>[{f.category}]</span>
                    </div>
                    <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-dark)', lineHeight: 1.15 }}>{f.benefit}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skill Tricks */}
          {skillTricksList.length > 0 && (
            <div>
              <div className="dnd-section-banner">Skill Tricks</div>
              <div className="dnd-box" style={{ padding: '4px' }}>
                {skillTricksList.map((st: any) => (
                  <div key={st.id} style={{ marginBottom: '3px' }}>
                    <strong style={{ fontSize: '7pt' }}>{st.name}</strong>
                    <span style={{ fontSize: '6pt', color: 'var(--dnd-gray-med)', marginLeft: '4px' }}>({st.type})</span>
                    <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-dark)' }}>{st.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Special Abilities, ACFs & Languages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="dnd-section-banner">Special Abilities &amp; Class Features</div>
          <div className="dnd-box" style={{ flex: 1, padding: '4px', minHeight: '120px' }}>
            {/* Active ACFs */}
            {acfsList.length > 0 && (
              <div style={{ marginBottom: '6px' }}>
                <div className="dnd-sub-banner" style={{ marginBottom: '3px' }}>Alternative Class Features (ACFs)</div>
                {acfsList.map((acf: any) => (
                  <div key={acf.id} style={{ marginBottom: '3px', borderBottom: '0.5pt dotted var(--dnd-gray-med)', paddingBottom: '2px' }}>
                    <strong style={{ fontSize: '7pt', color: 'var(--dnd-red)' }}>🎭 {acf.name}</strong>
                    <span style={{ fontSize: '5.5pt', color: '#b7950b', marginLeft: '4px' }}>(Replaces: {acf.replaces})</span>
                    <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-dark)' }}>{acf.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Daily Abilities / Core Features */}
            <div>
              <div className="dnd-sub-banner" style={{ marginBottom: '3px' }}>Class Abilities</div>
              {(pc.dailyAbilities || []).length > 0 ? (
                pc.dailyAbilities.map((ab: any) => (
                  <div key={ab.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7pt', padding: '1px 0' }}>
                    <span>✦ {ab.name}</span>
                    <span style={{ fontWeight: 'bold' }}>{ab.uses || ab.total || '—'} / Day</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-med)', fontStyle: 'italic' }}>Standard class features active.</div>
              )}
            </div>
          </div>

          {/* Languages & Racial Traits */}
          <div>
            <div className="dnd-section-banner">Languages &amp; Traits</div>
            <div className="dnd-box" style={{ padding: '4px' }}>
              <div className="dnd-label">Languages</div>
              <div className="dnd-value" style={{ fontSize: '7.5pt', marginBottom: '4px' }}>
                {Array.isArray(pc.languages) && pc.languages.length > 0 ? pc.languages.join(', ') : 'Common'}
              </div>
              <div className="dnd-label">Racial Traits</div>
              <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-dark)' }}>
                {pc.race === 'human' ? 'Bonus feat at 1st level, +4 skill points at 1st level, +1 skill point per level.' : 'Standard racial abilities.'}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Page Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5pt solid var(--dnd-gray-med)', paddingTop: '4px', marginTop: '6px', fontSize: '6.5pt', color: 'var(--dnd-gray-med)' }}>
        <span>The Combatant • D&amp;D 3.5e Automated Campaign Companion</span>
        <span>Character: {pc.name || 'Unknown'} • Page 2 of 4</span>
      </div>
    </div>
  );
};
