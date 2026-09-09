/**
 * @module    PCCompactGrimoireView
 * @summary   High-density tablet-optimized Grimoire view (modular orchestrator):
 *            - Glanceable slot pips tracker (GrimoireSlotBar)
 *            - Quick level filter pills, search & template menu (GrimoireTemplateMenu)
 *            - Modular level grouping (GrimoireLevelGroup) with tabular spell rows (~22px)
 */

import React, { useState, useMemo } from 'react';
import { GrimoireTemplateMenu } from './grimoire/GrimoireTemplateMenu';
import { GrimoireLevelGroup } from './grimoire/GrimoireLevelGroup';

interface PCCompactGrimoireViewProps {
  pc: any;
  onOpenCompendium: () => void;
}

export const PCCompactGrimoireView: React.FC<PCCompactGrimoireViewProps> = ({
  pc,
  onOpenCompendium,
}) => {
  const [activeLevelFilter, setActiveLevelFilter] = useState<'all' | number>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const isWizard = hasClasses && pc.classes.some((c: any) => c.classType === 'wizard');
  const wizardSpecialization = pc.wizardSpecialization || 'none';
  const hasSpecSlot = isWizard && wizardSpecialization !== 'none';

  const activeCasters = useMemo(() => {
    if (!hasClasses) return [];
    return pc.classes.filter((c: any) =>
      [
        'cleric',
        'wizard',
        'sorcerer',
        'bard',
        'druid',
        'paladin',
        'ranger',
        'duskblade',
        'beguiler',
        'assassin',
      ].includes(c.classType)
    );
  }, [pc.classes, hasClasses]);

  const hasPrepared = activeCasters.some((c: any) =>
    ['wizard', 'cleric', 'druid', 'paladin', 'ranger', 'duskblade'].includes(c.classType)
  );
  const hasSpontaneous = activeCasters.some((c: any) =>
    ['sorcerer', 'bard', 'beguiler'].includes(c.classType)
  );

  const hasCantrips =
    !hasClasses ||
    pc.classes.some((c: any) =>
      ['cleric', 'wizard', 'sorcerer', 'bard', 'druid'].includes(c.classType)
    );

  const minLvl = hasCantrips ? 0 : 1;
  let maxLvl = 9;
  if (activeCasters.length === 1 && ['paladin', 'ranger'].includes(activeCasters[0].classType)) {
    maxLvl = 4;
  } else if (activeCasters.length === 1 && activeCasters[0].classType === 'bard') {
    maxLvl = 6;
  } else if (activeCasters.length === 1 && ['duskblade', 'beguiler'].includes(activeCasters[0].classType)) {
    maxLvl = 5;
  }

  // Active spell levels
  const allLevels = useMemo(() => {
    const list: number[] = [];
    for (let i = minLvl; i <= maxLvl; i++) {
      const slot = pc.spellSlots?.[i];
      if (slot && (slot.max > 0 || slot.used > 0 || i <= 3)) {
        list.push(i);
      }
    }
    if (list.length === 0) {
      for (let i = minLvl; i <= Math.min(3, maxLvl); i++) list.push(i);
    }
    return list;
  }, [pc.spellSlots, minLvl, maxLvl]);

  // Caster Modifier for Save DC
  const casterMod = useMemo(() => {
    const intScore = typeof pc.int?.getValue === 'function' ? pc.int.getValue() : (pc.int || 10);
    const wisScore = typeof pc.wis?.getValue === 'function' ? pc.wis.getValue() : (pc.wis || 10);
    const chaScore = typeof pc.cha?.getValue === 'function' ? pc.cha.getValue() : (pc.cha || 10);

    const intMod = Math.floor((intScore - 10) / 2);
    const wisMod = Math.floor((wisScore - 10) / 2);
    const chaMod = Math.floor((chaScore - 10) / 2);

    if (activeCasters.some((c: any) => ['wizard', 'duskblade', 'beguiler', 'assassin'].includes(c.classType))) {
      return intMod;
    }
    if (activeCasters.some((c: any) => ['cleric', 'druid', 'paladin', 'ranger'].includes(c.classType))) {
      return wisMod;
    }
    if (activeCasters.some((c: any) => ['sorcerer', 'bard'].includes(c.classType))) {
      return chaMod;
    }
    return Math.max(intMod, wisMod, chaMod);
  }, [pc, activeCasters]);

  // Filter levels for main list
  const displayedLevels = useMemo(() => {
    if (activeLevelFilter === 'all') return allLevels;
    return allLevels.filter((lvl) => lvl === activeLevelFilter);
  }, [activeLevelFilter, allLevels]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', minWidth: 0 }}>
      {/* 1. Sub-Bar: Quick Level Filters, Search & Templates */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '4px',
          flexWrap: 'wrap',
        }}
      >
        {/* Level Filters Pills */}
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveLevelFilter('all')}
            style={{
              fontSize: '7.5px',
              padding: '1px 5px',
              height: '17px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              borderRadius: '2px',
              background: activeLevelFilter === 'all' ? 'var(--red)' : 'rgba(200, 169, 110, 0.1)',
              border: activeLevelFilter === 'all' ? '0.5px solid var(--red)' : '0.5px solid var(--pb)',
              color: activeLevelFilter === 'all' ? '#ffffff' : 'var(--inkm)',
              cursor: 'pointer',
            }}
          >
            All
          </button>
          {allLevels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setActiveLevelFilter(lvl)}
              style={{
                fontSize: '7.5px',
                padding: '1px 4px',
                height: '17px',
                fontFamily: 'var(--font-title)',
                fontWeight: 'bold',
                borderRadius: '2px',
                background: activeLevelFilter === lvl ? 'var(--red)' : 'rgba(200, 169, 110, 0.1)',
                border: activeLevelFilter === lvl ? '0.5px solid var(--red)' : '0.5px solid var(--pb)',
                color: activeLevelFilter === lvl ? '#ffffff' : 'var(--inkm)',
                cursor: 'pointer',
              }}
            >
              {lvl === 0 ? '0' : lvl}
            </button>
          ))}
        </div>

        {/* Action Controls: Search & Templates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {/* Quick Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cinput"
              style={{
                fontSize: '7.5px',
                height: '17px',
                width: '75px',
                padding: '0 4px',
                borderRadius: '2px',
                borderColor: 'var(--pb)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '2px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--inkl)',
                  fontSize: '7px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Template Menu Popover */}
          {hasPrepared && (
            <GrimoireTemplateMenu
              pc={pc}
              isOpen={isTemplateMenuOpen}
              onToggle={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              onClose={() => setIsTemplateMenuOpen(false)}
            />
          )}
        </div>
      </div>

      {/* 3. Spell List by Level */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          overflowY: 'auto',
          maxHeight: '480px',
          paddingRight: '1px',
        }}
      >
        {displayedLevels.map((lvl) => (
          <GrimoireLevelGroup
            key={lvl}
            pc={pc}
            lvl={lvl}
            casterMod={casterMod}
            hasPrepared={hasPrepared}
            hasSpontaneous={hasSpontaneous}
            hasSpecSlot={hasSpecSlot}
            wizardSpecialization={wizardSpecialization}
            searchQuery={searchQuery}
            onOpenCompendium={onOpenCompendium}
          />
        ))}
      </div>
    </div>
  );
};
