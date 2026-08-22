/**
 * @module    ACFsTabContent
 * @summary   Wizard sub-tab component for viewing, filtering, and selecting Alternative Class Features (ACFs).
 * @exports   ACFsTabContent
 * @depends   React, @core/data/acf-data.js, @core/ui/components/dialogs.js
 */

import React, { useState } from 'react';
// @ts-ignore
import { ACF_REGISTRY } from '@core/data/acf-data.js';

interface ACFsTabContentProps {
  currentConfig: any;
  levelConfigs: any[];
  currentLevelIndex: number;
  currentDraft: any;
  updateLevelConfig: (idx: number, key: string, val: any) => void;
}

export const ACFsTabContent: React.FC<ACFsTabContentProps> = ({
  currentConfig,
  levelConfigs,
  currentLevelIndex,
  currentDraft,
  updateLevelConfig
}) => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Collect all active classes in the draft up to current level
  const activeClassTypes = currentDraft?.classes?.map((c: any) => c.classType) || [];
  if (currentConfig.classType && !activeClassTypes.includes(currentConfig.classType)) {
    activeClassTypes.push(currentConfig.classType);
  }

  // ACFs selected at previous levels
  const priorSelectedACFs: string[] = [];
  for (let i = 0; i < currentLevelIndex; i++) {
    const cfg = levelConfigs[i];
    if (cfg && Array.isArray(cfg.acfs)) {
      cfg.acfs.forEach((id: string) => {
        if (!priorSelectedACFs.includes(id)) priorSelectedACFs.push(id);
      });
    }
  }

  const currentLevelACFs: string[] = Array.isArray(currentConfig.acfs) ? currentConfig.acfs : [];
  const allSelectedACFs = Array.from(new Set([...priorSelectedACFs, ...currentLevelACFs]));

  const handleToggleACF = (acfId: string) => {
    let next: string[];
    if (currentLevelACFs.includes(acfId)) {
      next = currentLevelACFs.filter(id => id !== acfId);
    } else {
      next = [...currentLevelACFs, acfId];
    }
    updateLevelConfig(currentLevelIndex, 'acfs', next);
  };

  const allACFEntries = Object.values(ACF_REGISTRY) as any[];

  // Filter ACFs by character classes and level requirement
  const filteredACFs = allACFEntries.filter(acf => {
    // Class match: if classFilter is all, match any active class of PC
    if (classFilter === 'all') {
      if (activeClassTypes.length > 0 && !activeClassTypes.includes(acf.classKey)) return false;
    } else if (acf.classKey !== classFilter) {
      return false;
    }

    // Level requirement relative to current total character level
    const currentClassLevel = currentDraft?.classes?.find((c: any) => c.classType === acf.classKey)?.level || (currentConfig.classType === acf.classKey ? 1 : 0);
    if (currentClassLevel < acf.minLevel) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (acf.name && acf.name.toLowerCase().includes(q)) ||
                        (acf.nameEn && acf.nameEn.toLowerCase().includes(q)) ||
                        (acf.nameDe && acf.nameDe.toLowerCase().includes(q));
      const matchDesc = (acf.description && acf.description.toLowerCase().includes(q)) ||
                        (acf.desc && acf.desc.toLowerCase().includes(q));
      const matchReplaces = acf.replaces && acf.replaces.toLowerCase().includes(q);
      return matchName || matchDesc || matchReplaces;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '420px' }}>
      {!currentConfig.classType ? (
        <div style={{ padding: '40px', fontSize: '12px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center' }}>
          Select a class on the left to configure Alternative Class Features.
        </div>
      ) : (
        <>
          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="🔍 Search Alternative Class Features (ACFs)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="cinput"
                style={{ width: '100%', height: '24px', fontSize: '11px', padding: '2px 6px', boxSizing: 'border-box' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '11px', color: 'var(--inkm)' }}
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="cinput"
              style={{ width: '120px', height: '24px', fontSize: '10px', padding: '0 4px', boxSizing: 'border-box' }}
            >
              <option value="all">All My Classes</option>
              {activeClassTypes.map((cKey: string) => (
                <option key={cKey} value={cKey}>{cKey.charAt(0).toUpperCase() + cKey.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* ACFs List */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '380px',
              overflowY: 'auto',
              paddingRight: '2px'
            }}
            className="pc-scroll-features"
          >
            {filteredACFs.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--inkl)', fontSize: '11px', fontStyle: 'italic' }}>
                No Alternative Class Features available for your current class and level ({activeClassTypes.join(', ')}).
              </div>
            ) : (
              filteredACFs.map(acf => {
                const isSelected = allSelectedACFs.includes(acf.id);
                const isSelectedAtCurrentLevel = currentLevelACFs.includes(acf.id);
                const isPrior = priorSelectedACFs.includes(acf.id);

                return (
                  <div
                    key={acf.id}
                    style={{
                      border: isSelected ? '1px solid var(--red)' : '0.5px solid var(--pb)',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      background: isSelected ? 'rgba(139, 26, 26, 0.06)' : 'rgba(200, 169, 110, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px' }}>🎭</span>
                        <div>
                          <strong style={{ fontSize: '11px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>
                            {acf.name || acf.nameEn || acf.nameDe}
                          </strong>
                          <span style={{ fontSize: '9px', color: 'var(--inkl)', marginLeft: '6px', fontFamily: "'IM Fell English SC', serif" }}>
                            ({acf.classKey.toUpperCase()} • Min Level {acf.minLevel} • {acf.source?.toUpperCase() || ''})
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleACF(acf.id)}
                        className={`xbtn ${isSelected ? 'xbtn-dmg' : ''}`}
                        style={{
                          fontSize: '8px',
                          padding: '2px 10px',
                          fontWeight: 'bold',
                          fontFamily: "'IM Fell English SC', serif",
                          cursor: 'pointer',
                          borderRadius: '2px',
                          border: isSelected ? '0.5px solid var(--red)' : '0.5px solid var(--pb)',
                          background: isSelected ? 'var(--red)' : 'rgba(200, 169, 110, 0.08)',
                          color: isSelected ? '#fff' : 'var(--ink)',
                          height: '20px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          lineHeight: 1
                        }}
                      >
                        {isSelected ? '✓ Selected' : '+ Select ACF'}
                      </button>
                    </div>

                    <div style={{ fontSize: '9px', color: '#b7950b', fontWeight: 'bold' }}>
                      ⚡ Replaces: <span style={{ color: 'var(--ink)' }}>{acf.replaces}</span>
                    </div>

                    <div style={{ fontSize: '9.5px', color: 'var(--inkm)', lineHeight: 1.3, fontFamily: "'Crimson Text', serif" }}>
                      {acf.description || acf.desc}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
