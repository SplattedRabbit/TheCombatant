/**
 * @module    PCClasses
 * @summary   State mutations for Player Character class configurations.
 * @exports   addPCClass, removePCClass, updatePCClassLevel, updatePCClassType, clearPCClasses
 */

import { updatePCBatch } from './PCGeneral.js';
import { getFeatIdsByClassPrereq } from '../../data/feats-data.js';
import { getConflictingACFs } from '../../data/acf-data.js';

/**
 * Bug 3 Fix: Removes any feats from the PC that require a specific class
 * (via a prereq of type 'class') which is no longer active after a class swap.
 * Called inside updatePCClassType before the old class is overwritten.
 */
function cleanupFeatsDependingOnClass(pc, removedClassType) {
  if (!Array.isArray(pc.feats) || !removedClassType) return;

  // Get all feat IDs that require the removed class as a prerequisite
  const affectedFeatIds = getFeatIdsByClassPrereq(removedClassType);
  if (affectedFeatIds.length === 0) return;

  // Check whether the same class is still present under another multiclass slot
  const activeClasses = Array.isArray(pc.classes) ? pc.classes.map(c => c.classType) : [];
  if (activeClasses.includes(removedClassType)) return; // still active — nothing to clean

  pc.feats = pc.feats.filter(featInst => !affectedFeatIds.includes(featInst.id));
}

export function addPCClass(classType, level) {
  updatePCBatch(pc => {
    if (!Array.isArray(pc.classes)) pc.classes = [];
    if (pc.classes.length >= 4) return;
    
    const existing = pc.classes.find(c => c.classType === classType);
    if (existing) {
      existing.level = Math.min(20, existing.level + (parseInt(level) || 1));
    } else {
      pc.classes.push({ classType, level: parseInt(level) || 1 });
    }
  });
}

export function removePCClass(idx) {
  updatePCBatch(pc => {
    if (Array.isArray(pc.classes) && pc.classes[idx]) {
      pc.classes.splice(idx, 1);
    }
  });
}

export function updatePCClassLevel(idx, level) {
  updatePCBatch(pc => {
    if (Array.isArray(pc.classes) && pc.classes[idx]) {
      pc.classes[idx].level = Math.max(1, Math.min(20, parseInt(level) || 1));
    }
  });
}

export function updatePCClassType(idx, classType) {
  updatePCBatch(pc => {
    if (Array.isArray(pc.classes) && pc.classes[idx]) {
      const oldClassType = pc.classes[idx].classType;
      pc.classes[idx].classType = classType;

      // Bug 3 Fix: remove feats that depended on the old class before recalculating
      if (oldClassType && oldClassType !== classType) {
        cleanupFeatsDependingOnClass(pc, oldClassType);
      }
    }
  });
}

export function clearPCClasses() {
  updatePCBatch(pc => {
    pc.classes = [];
    pc.classType = 'custom';
  });
}

export function togglePCACF(acfId) {
  updatePCBatch(pc => {
    if (!Array.isArray(pc.acfs)) pc.acfs = [];
    const idx = pc.acfs.indexOf(acfId);
    if (idx >= 0) {
      pc.acfs.splice(idx, 1);
    } else {
      // Auto-remove any conflicting ACFs that replace the exact same feature
      const conflicting = getConflictingACFs(acfId, pc.acfs);
      if (conflicting && conflicting.length > 0) {
        pc.acfs = pc.acfs.filter(id => !conflicting.includes(id));
      }
      pc.acfs.push(acfId);

      // Handle feature restrictions/replacements
      if (['ranger_distracting_attack', 'ranger_spiritual_guide', 'druid_shapeshift'].includes(acfId)) {
        pc.companionType = 'none';
      }
      if (['wizard_immediate_magic', 'sorcerer_metamagic_specialist', 'hexblade_dark_companion'].includes(acfId)) {
        pc.familiarType = 'none';
      }
      if (acfId === 'barbarian_berserker_strength' && pc.isRaging) {
        if (typeof pc.exitRage === 'function') pc.exitRage();
      }
      if (acfId === 'druid_shapeshift' && pc.activeShape && pc.activeShape !== 'none') {
        if (typeof pc.exitShape === 'function') pc.exitShape();
      }
    }
    if (typeof pc.rebuildStatModifiers === 'function') {
      pc.rebuildStatModifiers();
    }
  });
}

/**
 * Updates Wizard Specialization and cleans prohibited spells from learned list.
 * @returns {string[]} List of removed prohibited spell names
 */
export function updatePCWizardSpecialization(specialization, prohibited1 = '', prohibited2 = '') {
  let removedSpells = [];
  updatePCBatch(pc => {
    pc.wizardSpecialization = specialization;
    if (specialization === 'none') {
      pc.wizardProhibited1 = '';
      pc.wizardProhibited2 = '';
    } else if (specialization === 'div') {
      pc.wizardProhibited1 = prohibited1;
      pc.wizardProhibited2 = '';
    } else {
      if (prohibited1) pc.wizardProhibited1 = prohibited1;
      if (prohibited2) pc.wizardProhibited2 = prohibited2;
    }
  });
  return removedSpells;
}

export function updatePCWizardProhibited1(school) {
  updatePCBatch(pc => {
    pc.wizardProhibited1 = school || '';
  });
}

export function updatePCWizardProhibited2(school) {
  updatePCBatch(pc => {
    pc.wizardProhibited2 = school || '';
  });
}

export function togglePCSneakAttack(isActive) {
  updatePCBatch(pc => {
    pc.isSneakAttacking = !!isActive;
  });
}

export function togglePCTrickyFighting(isActive) {
  updatePCBatch(pc => {
    pc.isTrickyFightingActive = !!isActive;
  });
}

export function updatePCDeity(deityId) {
  updatePCBatch(pc => {
    pc.deity = deityId || '';
  });
}

export function updatePCClericDomains(domains) {
  updatePCBatch(pc => {
    pc.clericDomains = Array.isArray(domains) ? [...domains] : [];
  });
}

