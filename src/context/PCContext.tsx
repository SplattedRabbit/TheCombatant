import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { CombatState } from '@core/state.js';
import { getAllCompendiumSpells } from '@core/rules/RulesSpells.js';
import { SpellSlotCalculator } from '@core/rules/SpellSlotCalculator.js';
import type { Combatant } from '../types/combat';

interface PCContextType {
  pc: Combatant;
}

const PCContext = createContext<PCContextType | undefined>(undefined);

interface PCProviderProps {
  pc: Combatant;
  children: ReactNode;
}

export const PCProvider: React.FC<PCProviderProps> = ({ pc, children }) => {
  useEffect(() => {
    if (!pc || !pc.id) return;
    
    // Background Migration for Missing Cantrips
    const hasWizard = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'wizard');
    const hasCleric = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'cleric');
    const hasDruid = Array.isArray(pc.classes) && pc.classes.some((c: any) => c.classType === 'druid');
    
    if (hasWizard || hasCleric || hasDruid) {
      const allSpells = getAllCompendiumSpells(pc);
      const cantripsToAdd: string[] = [];
      
      allSpells.forEach((s: any) => {
        const isWizCantrip = hasWizard && (Array.isArray(s.classLevels) 
          ? s.classLevels.some((cl: any) => cl.class === 'wizard' && cl.level === 0)
          : (s.level === 0 && Array.isArray(s.classes) && s.classes.includes('wizard')));
          
        const isClericCantrip = hasCleric && (Array.isArray(s.classLevels) 
          ? s.classLevels.some((cl: any) => cl.class === 'cleric' && cl.level === 0)
          : (s.level === 0 && Array.isArray(s.classes) && s.classes.includes('cleric')));
          
        const isDruidCantrip = hasDruid && (Array.isArray(s.classLevels) 
          ? s.classLevels.some((cl: any) => cl.class === 'druid' && cl.level === 0)
          : (s.level === 0 && Array.isArray(s.classes) && s.classes.includes('druid')));
          
        if (isWizCantrip || isClericCantrip || isDruidCantrip) {
          if (!Array.isArray(pc.learnedSpells) || !pc.learnedSpells.includes(s.id)) {
            if (hasWizard && isWizCantrip && !isClericCantrip && !isDruidCantrip) {
              if (pc.wizardProhibited1 && s.school && s.school.toLowerCase() === pc.wizardProhibited1.toLowerCase()) return;
              if (pc.wizardProhibited2 && s.school && s.school.toLowerCase() === pc.wizardProhibited2.toLowerCase()) return;
            }
            cantripsToAdd.push(s.id);
          }
        }
      });
      
      if (cantripsToAdd.length > 0) {
        CombatState.updatePCBatch((fresh: any) => {
          if (fresh.id === pc.id) {
            if (!Array.isArray(fresh.learnedSpells)) fresh.learnedSpells = [];
            const newSet = new Set([...fresh.learnedSpells, ...cantripsToAdd]);
            fresh.learnedSpells = Array.from(newSet);
          }
        });
      }
    }
    
    // Background Migration for Missing prestigeSpellLinks
    if (Array.isArray(pc.classes)) {
      let needsLinkMigration = false;
      const linksToMerge: Record<string, string> = {};
      
      pc.classes.forEach((c: any) => {
        if (['spellwarp_sniper', 'mystic_theurge', 'arcane_trickster'].includes(c.classType)) {
          if (!pc.prestigeSpellLinks || !pc.prestigeSpellLinks[c.classType]) {
            needsLinkMigration = true;
            // Guess the primary caster class
            const casters = pc.classes.filter((cls: any) => ['wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'duskblade', 'beguiler'].includes(cls.classType));
            if (casters.length > 0) {
              // Pick the first caster
              linksToMerge[c.classType] = casters[0].classType; 
            }
          }
        }
      });
      
      if (needsLinkMigration) {
        CombatState.updatePCBatch((fresh: any) => {
          if (fresh.id === pc.id) {
            fresh.prestigeSpellLinks = {
              ...(fresh.prestigeSpellLinks || {}),
              ...linksToMerge
            };
          }
        });
      }

      // Check if spell slots are out of sync with RAW calculations
      const calculatedSlots = SpellSlotCalculator.calculateSpellSlots(pc);
      if (calculatedSlots) {
        let slotsNeedUpdate = false;
        for (let lvl = 0; lvl <= 9; lvl++) {
          const expectedMax = calculatedSlots[lvl] || 0;
          const currentMax = pc.spellSlots?.[lvl]?.max ?? 0;
          if (expectedMax !== currentMax) {
            slotsNeedUpdate = true;
            break;
          }
        }
        if (slotsNeedUpdate) {
          CombatState.updatePCBatch((fresh: any) => {
            // updatePCBatch invokes recalculatePCStats which automatically synchronizes spellSlots.max
            if (fresh.id === pc.id) {
              for (let lvl = 0; lvl <= 9; lvl++) {
                if (!fresh.spellSlots) fresh.spellSlots = {};
                if (!fresh.spellSlots[lvl]) fresh.spellSlots[lvl] = { max: 0, used: 0 };
                fresh.spellSlots[lvl].max = calculatedSlots[lvl] || 0;
                fresh.spellSlots[lvl].used = Math.min(fresh.spellSlots[lvl].max, fresh.spellSlots[lvl].used || 0);
              }
            }
          });
        }
      }
    }
    
  }, [pc.id]);

  return <PCContext.Provider value={{ pc }}>{children}</PCContext.Provider>;
};

export const usePC = (): Combatant => {
  const context = useContext(PCContext);
  if (!context) {
    throw new Error('usePC must be used within a PCProvider');
  }
  return context.pc;
};
