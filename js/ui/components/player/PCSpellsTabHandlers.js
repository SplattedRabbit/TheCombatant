/**
 * @module    PCSpellsTabHandlers
 * @summary   Kapselt alle Event-Listener und Aktions-Handler (Zaubern, Vorbereiten, Vorlagen, Tagesreset) für das Zauberbuch-Dashboard.
 * @exports   bindSpellsEvents(pc, container, renderSpellsFn), activeRightSpellsTab, setActiveRightSpellsTab(val)
 * @reads     pc.classes, pc.spellSlots, pc.preparedSpells, pc.spellTemplates, pc.name
 * @stateOps  CombatState.updatePCSpellSlotsUsed, CombatState.updatePCSpellSlotsMax, CombatState.applyPCSpellTemplate, CombatState.clearPreparedSpells, CombatState.resetDailyResources
 * @depends   CombatState, ClassFeaturesRegistry, PCSpellbookTab, PCCompendiumTab, PCSpellDialogs, dialogs, CombatRules, spells
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { showCustomConfirm, showCustomAlert, showPrepareSpellDialog, showCastSpontaneousSpellDialog, showCustomPrompt, showNewDayTemplateDialog } from '../dialogs.js';
import { findSpell } from './PCSpellbookTab.js';
import { showCastSuccessDialog } from './PCBuffsDialog.js';
import { CombatRules } from '../../../rules.js';
import { getSpellSchoolCode, getSchoolCodeFromInput, getSchoolLabel } from '../../../spells.js';
import { 
  getSpellSearchQuery,
  setSpellSearchQuery,
  setSpellFilterLevel,
  setShowAllSpells
} from './PCCompendiumTab.js';
import { showSpellDetailsDialog, showSpellCreatorWizard } from './PCSpellDialogs.js';
import { CLASS_FEATURE_REGISTRY } from './ClassFeaturesRegistry.js';

export let activeRightSpellsTab = null; // 'prepared' or 'compendium'

export function setActiveRightSpellsTab(val) {
  activeRightSpellsTab = val;
}

export function bindSpellsEvents(pc, container, renderSpellsFn) {
  container.onclick = (e) => {
    if (_handleTabNavigationClick(pc, e, renderSpellsFn)) return;
    if (_handleNewDayClick(pc, e)) return;
    if (_handleSpellBubbleClick(pc, e, container)) return;
    if (_handleSpellbookActionClick(pc, e)) return;
    if (_handleSpellTemplateClick(pc, e, container)) return;
    if (_handleSpellListClick(pc, e)) return;
  };

  container.onchange = (e) => {
    _handleSpellChange(pc, e, container, renderSpellsFn);
  };

  container.oninput = (e) => {
    _handleSpellInput(pc, e, container);
  };
}

function _handleTabNavigationClick(pc, e, renderSpellsFn) {
  const tabBtn = e.target.closest('.right-spells-tab-btn');
  if (tabBtn) {
    e.stopPropagation();
    activeRightSpellsTab = tabBtn.dataset.tab;
    renderSpellsFn(pc);
    return true;
  }
  return false;
}

function _handleNewDayClick(pc, e) {
  const newDayBtn = e.target.closest('.btn-new-day');
  if (newDayBtn) {
    e.stopPropagation();
    
    const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
    const activeCasters = hasClasses ? pc.classes.filter(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType)) : [];
    const hasPrepared = activeCasters.some(c => ['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType));

    const performNewDayReset = (templateChoice = 'keep') => {
      if (templateChoice === 'empty') {
        CombatState.clearPreparedSpells();
      } else if (templateChoice !== 'keep') {
        // Reset all slots used count to 0 first
        for (let lvl = 0; lvl <= 9; lvl++) {
          if (pc.spellSlots[lvl]) {
            pc.spellSlots[lvl].used = 0;
          }
        }
        const res = CombatState.applyPCSpellTemplate(templateChoice);
        if (res && res.unplaced && res.unplaced.length > 0) {
          showCustomAlert("Vorlage geladen!", `Einige Zauber konnten nicht platziert werden (Slots voll):<br>${res.unplaced.join(', ')}`);
        }
      }

      const activeComponents = CLASS_FEATURE_REGISTRY.filter(comp => comp.isEligible(pc));
      activeComponents.forEach(comp => {
        const clsInfo = pc.classes ? pc.classes.find(c => c.classType === comp.classKey) : null;
        const level = clsInfo ? clsInfo.level : 1;
        comp.onNewDay(pc, level);
      });

      CombatState.resetDailyResources();
      uiRegistry.renderPlayerScreen();
    };

    if (hasPrepared) {
      showNewDayTemplateDialog(pc, pc.spellTemplates || {}, (choice) => {
        performNewDayReset(choice);
      });
    } else {
      showCustomConfirm("Ein neuer Tag! 🌅", "Möchtest du alle verbrauchten Zauberslots und täglichen Klassenfähigkeiten wiederherstellen und einen neuen Tag beginnen?", () => {
        performNewDayReset('keep');
      });
    }
    return true;
  }
  return false;
}

function _handleSpellBubbleClick(pc, e, container) {
  const spellBubble = e.target.closest('.spell-bubble');
  if (spellBubble) {
    e.stopPropagation();
    const lvl = spellBubble.dataset.lvl;
    const idx = parseInt(spellBubble.dataset.idx);
    const currentUsed = pc.spellSlots[lvl]?.used || 0;
    const newUsed = idx <= currentUsed ? idx - 1 : idx;
    
    CombatState.updatePCSpellSlotsUsed(lvl, newUsed);
    
    const bubbles = container.querySelectorAll(`.spell-bubble[data-lvl="${lvl}"]`);
    bubbles.forEach((b, i) => {
      if (i < newUsed) {
        b.classList.add('used');
      } else {
        b.classList.remove('used');
      }
    });
    return true;
  }
  return false;
}

function _handleSpellbookActionClick(pc, e) {
  // Remove spell from spellbook
  const removeSpellBtn = e.target.closest('.remove-spell-btn');
  if (removeSpellBtn) {
    e.stopPropagation();
    e.preventDefault();
    const key = removeSpellBtn.dataset.key;
    const activePC = CombatState.getActivePC();
    if (!activePC) return true;
    if (!Array.isArray(activePC.learnedSpells)) activePC.learnedSpells = [];
    const idx = activePC.learnedSpells.indexOf(key);
    if (idx > -1) {
      activePC.learnedSpells.splice(idx, 1);
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
      uiRegistry.renderPlayerScreen();
    }
    return true;
  }

  // Prepare spell button
  const prepareSpellBtn = e.target.closest('.prepare-spell-btn');
  if (prepareSpellBtn) {
    e.stopPropagation();
    e.preventDefault();
    const key = prepareSpellBtn.dataset.key;
    showPrepareSpellDialog(pc, key, () => {
      uiRegistry.renderPlayerScreen();
    });
    return true;
  }

  // Cast spontaneous spell button
  const castSpontaneousBtn = e.target.closest('.cast-spontaneous-btn');
  if (castSpontaneousBtn) {
    e.stopPropagation();
    e.preventDefault();
    const key = castSpontaneousBtn.dataset.key;
    showCastSpontaneousSpellDialog(pc, key, () => {
      uiRegistry.renderPlayerScreen();
    });
    return true;
  }

  // Cast prepared spell button
  const castPreparedBtn = e.target.closest('.cast-prepared-btn');
  if (castPreparedBtn) {
    e.stopPropagation();
    e.preventDefault();
    const id = castPreparedBtn.dataset.id;
    const prep = pc.castPreparedSpell(id);
    if (prep) {
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
      
      const spell = findSpell(pc, prep.spellKey);
      if (spell) {
        if (spell.effects && spell.effects.length > 0) {
          showCastSuccessDialog(pc, spell, prep.spellKey, prep.metamagic || [], () => {
            uiRegistry.renderPlayerScreen();
          });
        } else {
          const METAMAGIC_COSTS = { extend_spell: 1, empower_spell: 2, maximize_spell: 3, quicken_spell: 4 };
          const metamagicNames = { extend_spell: 'Verlängert', empower_spell: 'Verstärkt', maximize_spell: 'Maximiert', quicken_spell: 'Beschleunigt' };
          const appliedMeta = prep.metamagic.map(mId => metamagicNames[mId] || mId);
          const metaSuffix = appliedMeta.length > 0 ? ` (${appliedMeta.join(', ')})` : '';
          
          const metamagicAdjustment = prep.metamagic.reduce((sum, fId) => sum + (METAMAGIC_COSTS[fId] || 0), 0);
          const finalLevel = spell.level + metamagicAdjustment;

          showCustomAlert("Zauber gewirkt! ✨", `
            <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
              <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
                ${pc.name} wirkt vorbereiteten Zauber: ${spell.nameDe}${metaSuffix}!
              </div>
              • <strong>Schule:</strong> ${spell.school}<br>
              • <strong>Effektiver Grad:</strong> Grad ${finalLevel} (Basis ${spell.level})<br>
              • <strong>Zeitaufwand:</strong> ${spell.castingTime || '1 Standardaktion'}<br>
              • <strong>Reichweite:</strong> ${spell.range || 'Berührung'}<br>
              • <strong>Rettungswurf:</strong> ${spell.savingThrow || 'Keiner'}<br><br>
              <div style="font-size: 8px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px; border-radius: 2px; line-height: 1.25;">
                ${spell.description}
              </div>
            </div>
          `, "Fertig!", "");
        }
      }
      uiRegistry.renderPlayerScreen();
    }
    return true;
  }

  // Unprepare prepared spell button
  const unpreparePreparedBtn = e.target.closest('.unprepare-prepared-btn');
  if (unpreparePreparedBtn) {
    e.stopPropagation();
    e.preventDefault();
    const id = unpreparePreparedBtn.dataset.id;
    
    const prep = pc.preparedSpells.find(s => s.id === id);
    if (prep) {
      if (prep.isUsed) {
        const spell = findSpell(pc, prep.spellKey);
        if (spell) {
          const METAMAGIC_COSTS = { extend_spell: 1, empower_spell: 2, maximize_spell: 3, quicken_spell: 4 };
          const metamagicLevelAdjustment = prep.metamagic.reduce((sum, fId) => sum + (METAMAGIC_COSTS[fId] || 0), 0);
          const adjustedLevel = spell.level + metamagicLevelAdjustment;
          if (pc.spellSlots && pc.spellSlots[adjustedLevel]) {
            pc.spellSlots[adjustedLevel].used = Math.max(0, (pc.spellSlots[adjustedLevel].used || 0) - 1);
          }
        }
      }
      pc.unprepareSpell(id);
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
      uiRegistry.renderPlayerScreen();
    }
    return true;
  }

  // Placeholder slots button
  const placeholderBtn = e.target.closest('.prepare-slot-placeholder-btn, .prepare-specialist-placeholder-btn');
  if (placeholderBtn) {
    e.stopPropagation();
    e.preventDefault();
    showCustomAlert("Zauber vorbereiten", "Tippe unten in deiner <strong>Zauberbibliothek</strong> auf den Button <strong>[Vorbereiten]</strong> des gewünschten Zaubers, um ihn zu konfigurieren.");
    return true;
  }

  // Clear prepared spells button
  const clearPrepsBtn = e.target.closest('.clear-prepared-spells-btn');
  if (clearPrepsBtn) {
    e.stopPropagation();
    e.preventDefault();
    if (!pc.preparedSpells || pc.preparedSpells.length === 0) return true;
    showCustomConfirm("Slots leeren?", "Möchtest du alle vorbereiteten Zauber aus deinen Slots entfernen?", () => {
      CombatState.clearPreparedSpells();
      uiRegistry.renderPlayerScreen();
    });
    return true;
  }

  return false;
}

function _handleSpellTemplateClick(pc, e, container) {
  // Save spell template button
  const saveTemplateBtn = e.target.closest('.save-spell-template-btn');
  if (saveTemplateBtn) {
    e.stopPropagation();
    e.preventDefault();
    if (!pc.preparedSpells || pc.preparedSpells.length === 0) {
      showCustomAlert("Keine Zauber", "Bereite zuerst Zauber vor, um sie als Vorlage zu speichern.");
      return true;
    }
    showCustomPrompt("Vorlage speichern 💾", "Bitte gib einen Namen für dein Zaubertemplate ein:", "z.B. Standard-Kampf", (name) => {
      if (!name) return;
      const exists = pc.spellTemplates && pc.spellTemplates[name];
      const saveAction = () => {
        CombatState.savePCSpellTemplate(name, pc.preparedSpells);
        showCustomAlert("Gespeichert", `Die Vorlage "${name}" wurde erfolgreich gespeichert.`, "Super", "✨", () => {
          uiRegistry.renderPlayerScreen();
        });
      };

      if (exists) {
        showCustomConfirm("Vorlage überschreiben?", `Eine Vorlage namens "${name}" existiert bereits. Möchtest du sie überschreiben?`, () => {
          saveAction();
        });
      } else {
        saveAction();
      }
    });
    return true;
  }

  // Delete spell template button
  const deleteTemplateBtn = e.target.closest('.delete-spell-template-btn');
  if (deleteTemplateBtn) {
    e.stopPropagation();
    e.preventDefault();
    const selectEl = container.querySelector('.select-spell-template');
    const selectedName = selectEl ? selectEl.value : "";
    if (!selectedName) {
      showCustomAlert("Keine Auswahl", "Bitte wähle zuerst eine Vorlage im Dropdown aus, die du löschen möchtest.");
      return true;
    }
    showCustomConfirm("Vorlage löschen?", `Möchtest du die Vorlage "${selectedName}" wirklich unwiderruflich löschen?`, () => {
      CombatState.deletePCSpellTemplate(selectedName);
      uiRegistry.renderPlayerScreen();
    });
    return true;
  }

  return false;
}

function _handleSpellListClick(pc, e) {
  // Cast spell button
  const castSpellBtn = e.target.closest('.cast-spell-btn');
  if (castSpellBtn) {
    e.stopPropagation();
    e.preventDefault();
    const key = castSpellBtn.dataset.key;
    const lvl = parseInt(castSpellBtn.dataset.lvl);
    const spell = findSpell(pc, key);
    if (!spell) return true;

    const maxSlots = pc.spellSlots[lvl]?.max || 0;
    const usedSlots = pc.spellSlots[lvl]?.used || 0;

    const performCast = () => {
      let newUsed = usedSlots;
      if (maxSlots > 0 && usedSlots < maxSlots) {
        newUsed = usedSlots + 1;
        CombatState.updatePCSpellSlotsUsed(lvl, newUsed);
      }
      
      if (spell.effects && spell.effects.length > 0) {
        showCastSuccessDialog(pc, spell, key, [], () => {
          uiRegistry.renderPlayerScreen();
        });
      } else {
        showCustomAlert("Zauber gewirkt! ✨", `
          <div style="font-family:'Crimson Text', serif; font-size:10px; text-align:left; color:var(--ink); line-height:1.35;">
            <div style="border-bottom: 0.5px solid var(--pb); padding-bottom: 2px; margin-bottom: 4px; font-weight: bold; text-align: center; font-family:'IM Fell English SC', serif; color: var(--red); font-size: 11px;">
              ${pc.name} wirkt ${spell.nameDe}!
            </div>
            • <strong>Schule:</strong> ${spell.school}<br>
            • <strong>Grad:</strong> Grad ${spell.level}<br>
            • <strong>Zeitaufwand:</strong> ${spell.castingTime || '1 Standardaktion'}<br>
            • <strong>Reichweite:</strong> ${spell.range || 'Berührung'}<br>
            • <strong>Rettungswurf:</strong> ${spell.savingThrow || 'Keiner'}<br><br>
            <div style="font-size: 8px; font-style: italic; background: rgba(0,0,0,0.02); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px; border-radius: 2px; line-height: 1.25;">
              ${spell.description}
            </div>
          </div>
        `, "Fertig!", "");
      }
    };

    if (maxSlots > 0 && usedSlots >= maxSlots) {
      showCustomConfirm("Keine Zauberslots!", `Du hast keine freien Zauberslots des Grades ${lvl} mehr übrig. Möchtest du "${spell.nameDe}" trotzdem wirken?`, () => {
        performCast();
      });
    } else {
      performCast();
    }
    return true;
  }

  // View spell details
  const viewSpellBtn = e.target.closest('.view-spell-details-btn');
  if (viewSpellBtn && !e.target.closest('button')) {
    e.stopPropagation();
    e.preventDefault();
    const key = viewSpellBtn.dataset.key;
    const spell = findSpell(pc, key);
    if (spell) {
      showSpellDetailsDialog(spell, key, pc);
    }
    return true;
  }

  // Spell Creator Wizard launch
  const wizardBtn = e.target.closest('.wizard-open-btn');
  if (wizardBtn) {
    e.stopPropagation();
    showSpellCreatorWizard(pc);
    return true;
  }

  // Learn spell
  const learnBtn = e.target.closest('.learn-spell-btn');
  if (learnBtn) {
    e.stopPropagation();
    e.preventDefault();
    const key = learnBtn.dataset.key;
    const activePC = CombatState.getActivePC();
    if (!activePC) return true;

    const spell = findSpell(activePC, key);
    if (spell) {
      const isWizard = activePC.classes && activePC.classes.some(c => c.classType === 'wizard');
      if (isWizard) {
        const schoolCode = getSpellSchoolCode(spell.school, spell.id, spell.nameDe || spell.nameEn);
        if (schoolCode && schoolCode !== 'univ') {
          const prob1 = getSchoolCodeFromInput(activePC.wizardProhibited1);
          const prob2 = getSchoolCodeFromInput(activePC.wizardProhibited2);
          if (schoolCode === prob1 || schoolCode === prob2) {
            showCustomAlert(
              "Bannschule",
              `Du kannst den Zauber "${spell.nameDe}" nicht lernen, da er zur Bannschule "${getSchoolLabel(schoolCode)}" gehört!`
            );
            return true;
          }
        }
      }
      // Check spells known limit (Bug #8)
      const check = CombatRules.checkSpellKnownLimit(activePC, spell, (k) => findSpell(activePC, k));
      if (!check.success) {
        showCustomAlert("Zauberlimit überschritten", check.error || "Du kannst keine weiteren bekannten Zauber dieses Grades lernen.");
        return true;
      }
    }

    if (!Array.isArray(activePC.learnedSpells)) activePC.learnedSpells = [];
    if (!activePC.learnedSpells.includes(key)) {
      activePC.learnedSpells.push(key);
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
      uiRegistry.renderPlayerScreen();
    }
    return true;
  }

  // Delete custom spell
  const deleteCustomSpellBtn = e.target.closest('.delete-custom-spell-btn');
  if (deleteCustomSpellBtn) {
    e.stopPropagation();
    e.preventDefault();
    const key = deleteCustomSpellBtn.dataset.key;
    const activePC = CombatState.getActivePC();
    if (!activePC) return true;
    const spell = findSpell(activePC, key);
    if (spell) {
      showCustomConfirm("Zauber löschen?", `Möchtest du deinen eigenen Zauber "${spell.nameDe}" unwiderruflich aus der Datenbank löschen?`, () => {
        CombatState.updatePCBatch(freshPC => {
          if (Array.isArray(freshPC.customSpells)) {
            freshPC.customSpells = freshPC.customSpells.filter(s => s.id !== key);
          }
          if (Array.isArray(freshPC.learnedSpells)) {
            freshPC.learnedSpells = freshPC.learnedSpells.filter(k => k !== key);
          }
        });
        uiRegistry.renderPlayerScreen();
      });
    }
    return true;
  }

  return false;
}

function _handleSpellChange(pc, e, container, renderSpellsFn) {
  const templateSelect = e.target.closest('.select-spell-template');
  if (templateSelect) {
    const selectedName = e.target.value;
    if (!selectedName) return;
    
    showCustomConfirm("Vorlage laden?", `Möchtest du die Vorlage "${selectedName}" laden? Deine aktuelle Zaubervorbereitung wird überschrieben.`, () => {
      // Reset all slot usages to 0 when template is loaded
      for (let lvl = 0; lvl <= 9; lvl++) {
        if (pc.spellSlots[lvl]) {
          pc.spellSlots[lvl].used = 0;
        }
      }
      const res = CombatState.applyPCSpellTemplate(selectedName);
      if (res.success) {
        if (res.unplaced && res.unplaced.length > 0) {
          showCustomAlert("Vorlage geladen!", `Einige Zauber der Vorlage konnten nicht vorbereitet werden, da deine Zauberslots überschritten wurden:<br>${res.unplaced.join(', ')}`, "Verstanden", "⚠️", () => {
            uiRegistry.renderPlayerScreen();
          });
        } else {
          uiRegistry.renderPlayerScreen();
        }
      } else {
        showCustomAlert("Fehler", res.error || "Vorlage konnte nicht geladen werden.");
      }
    });
    
    templateSelect.value = "";
    return;
  }

  const maxInput = e.target.closest('.max-slots-inp');
  if (maxInput) {
    const lvl = maxInput.dataset.lvl;
    CombatState.updatePCSpellSlotsMax(lvl, e.target.value);
    uiRegistry.renderPlayerScreen();
    return;
  }

  const compLvlSelect = e.target.closest('.comp-level-select');
  if (compLvlSelect) {
    setSpellFilterLevel(e.target.value);
    renderSpellsFn(pc);
    return;
  }

  const classFilterChk = e.target.closest('.comp-filter-class-chk');
  if (classFilterChk) {
    setShowAllSpells(!e.target.checked);
    renderSpellsFn(pc);
    return;
  }
}

function _handleSpellInput(pc, e, container) {
  const compSearch = e.target.closest('.comp-search-input');
  if (compSearch) {
    setSpellSearchQuery(e.target.value);
    const q = getSpellSearchQuery().toLowerCase().trim();
    const items = container.querySelectorAll('.compendium-spell-item');
    items.forEach(item => {
      const nameDe = item.dataset.nameDe || '';
      const nameEn = item.dataset.nameEn || '';
      const matches = nameDe.includes(q) || nameEn.includes(q);
      item.style.display = matches ? 'flex' : 'none';
    });
  }
}
