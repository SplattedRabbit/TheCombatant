/**
 * @module    PCResources
 * @summary   Rendert Zauberbuch-, Kompendium- und Klassen-Features-Tab; orchestriert das Strategy-Pattern der ClassFeatureComponents.
 * @exports   renderPCSpells, renderPCFeatures, renderPCResources
 * @reads     pc.classes, pc.spellSlots, pc.learnedSpells, pc.dailyAbilities, pc.preparedSpells
 * @stateOps  CombatState.updatePCBatch, CombatState.saveToStorage, CombatState.resetDailyResources
 * @depends   CombatState, ClassFeature-Komponenten, PCSpellbookTab, PCCompendiumTab, PCSpellDialogs, dialogs
 * @notHere   Slot-Berechnung → SpellSlotCalculator.js | Regeln → rules.js | Zauber-Daten → spells.js
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { CompanionSheet } from '../CompanionSheet.js';
import { FamiliarSheet } from '../FamiliarSheet.js';
import { showCustomConfirm, showCustomAlert, showPrepareSpellDialog, showCastSpontaneousSpellDialog, showCustomPrompt, showNewDayTemplateDialog } from '../dialogs.js';

// Strategy-Pattern Polymorphic Class Feature Imports
import { GeneralFeatures } from '../class-features/GeneralFeatures.js';
import { BarbarianFeatures } from '../class-features/BarbarianFeatures.js';
import { BardFeatures } from '../class-features/BardFeatures.js';
import { PaladinFeatures } from '../class-features/PaladinFeatures.js';
import { ClericFeatures } from '../class-features/ClericFeatures.js';
import { MonkFeatures } from '../class-features/MonkFeatures.js';
import { RogueFeatures } from '../class-features/RogueFeatures.js';
import { DruidFeatures } from '../class-features/DruidFeatures.js';
import { RangerFeatures } from '../class-features/RangerFeatures.js';
import { WizardFeatures } from '../class-features/WizardFeatures.js';
import { SorcererFeatures } from '../class-features/SorcererFeatures.js';

import { renderSpellbookTab, findSpell, renderPreparedSlotsArea } from './PCSpellbookTab.js';
import { CombatRules } from '../../../rules.js';
import { getSpellSchoolCode, getSchoolCodeFromInput, getSchoolLabel } from '../../../spells.js';
import { 
  renderCompendiumTab,
  getSpellSearchQuery,
  setSpellSearchQuery,
  getSpellFilterLevel,
  setSpellFilterLevel,
  getShowAllSpells,
  setShowAllSpells
} from './PCCompendiumTab.js';
import { showSpellDetailsDialog, showSpellCreatorWizard } from './PCSpellDialogs.js';

const CLASS_FEATURE_REGISTRY = [
  new GeneralFeatures(),
  new BarbarianFeatures(),
  new BardFeatures(),
  new PaladinFeatures(),
  new ClericFeatures(),
  new MonkFeatures(),
  new RogueFeatures(),
  new DruidFeatures(),
  new RangerFeatures(),
  new WizardFeatures(),
  new SorcererFeatures()
];

let activeFeaturesTab = 'companion'; // 'companion' or 'familiar'
let activeRightSpellsTab = null; // 'prepared' or 'compendium'
let savedScrollPositions = {};

function saveScrolls() {
  const comp = document.querySelector('.pc-scroll-compendium');
  const book = document.querySelector('.pc-scroll-spellbook');
  const feat = document.querySelector('.pc-scroll-features');
  
  if (comp) savedScrollPositions.comp = comp.scrollTop;
  if (book) savedScrollPositions.book = book.scrollTop;
  if (feat) savedScrollPositions.feat = feat.scrollTop;
}

function restoreScrolls() {
  const comp = document.querySelector('.pc-scroll-compendium');
  const book = document.querySelector('.pc-scroll-spellbook');
  const feat = document.querySelector('.pc-scroll-features');
  
  if (comp && savedScrollPositions.comp !== undefined) comp.scrollTop = savedScrollPositions.comp;
  if (book && savedScrollPositions.book !== undefined) book.scrollTop = savedScrollPositions.book;
  if (feat && savedScrollPositions.feat !== undefined) feat.scrollTop = savedScrollPositions.feat;
}

/**
 * Renders the Spells Tab: Spellbook & Compendium side-by-side
 */
export function renderPCSpells(pc) {
  const spellsTab = document.getElementById('tabPanelSpells');
  if (!spellsTab) return;

  const bookContainer = document.getElementById('pcSpellbookContainer');
  const compContainer = document.getElementById('pcCompendiumContainer');
  
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const isCaster = hasClasses && pc.classes.some(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType));

  if (!isCaster) {
    spellsTab.innerHTML = `
      <div class="panel" style="width: 100%;">
        <div class="phdr"><h2>🔮 Zauberbuch &amp; Slots</h2></div>
        <div class="pbody empty-msg" style="padding: 30px 10px; text-align: center; font-style: italic; color: var(--inkl);">
          Dieser Charakter besitzt keine Zauberklassen.
        </div>
      </div>
    `;
    return;
  }

  // Restore the normal grid layout if it was overwritten by the safety guard
  if (!bookContainer || !compContainer) {
    spellsTab.innerHTML = `
      <div class="overview-grid" id="pcSpellsTabContainer">
        <div class="panel" id="pcSpellbookContainer"></div>
        <div class="panel" id="pcCompendiumContainer"></div>
      </div>
    `;
    return renderPCSpells(pc);
  }

  const activeCasters = hasClasses ? pc.classes.filter(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType)) : [];
  const hasPrepared = activeCasters.some(c => ['wizard', 'cleric', 'druid', 'paladin', 'ranger'].includes(c.classType));

  if (activeRightSpellsTab === null) {
    activeRightSpellsTab = hasPrepared ? 'prepared' : 'compendium';
  }

  saveScrolls();

  // Render Spellbook (Left)
  bookContainer.innerHTML = `
    <div class="phdr">
      <h2>🔮 Zauberbuch &amp; Slots</h2>
      <button class="btn btn-new-day" style="font-size: 8px; padding: 2px 8px; font-family: 'IM Fell English SC', serif; font-weight: bold; background: linear-gradient(135deg, #c8a96e, #9a7a2e); color: white; border: 0.5px solid var(--red); border-radius: 2px; cursor: pointer; line-height: 1;" title="Zauberslots und tägliche Fähigkeiten wiederherstellen">
        Tagesreset 🌅
      </button>
    </div>
    <div class="pbody" style="padding: 6px; display: flex; flex-direction: column; gap: 6px;">
      ${renderSpellbookTab(pc)}
    </div>
  `;

  // Render Dashboard Tabs (Right)
  compContainer.innerHTML = `
    <div class="phdr" style="display: flex; justify-content: space-between; align-items: center;">
      <h2 style="font-size: 10px; margin: 0; line-height: 1;">🔮 Dashboard</h2>
      <div style="display: flex; gap: 3px;">
        <button class="btn right-spells-tab-btn ${activeRightSpellsTab === 'prepared' ? 'btn-p' : ''}" data-tab="prepared" style="font-size: 8.5px; padding: 2px 6px; line-height: 1; font-family: 'IM Fell English SC', serif; font-weight: bold;">🌅 Vorbereitung</button>
        <button class="btn right-spells-tab-btn ${activeRightSpellsTab === 'compendium' ? 'btn-p' : ''}" data-tab="compendium" style="font-size: 8.5px; padding: 2px 6px; line-height: 1; font-family: 'IM Fell English SC', serif; font-weight: bold;">📖 Kompendium</button>
      </div>
    </div>
    <div class="pbody" style="padding: 6px; display: flex; flex-direction: column; gap: 4px;">
      ${activeRightSpellsTab === 'prepared' ? renderPreparedSlotsArea(pc) : renderCompendiumTab(pc)}
    </div>
  `;

  const tabContainer = document.getElementById('pcSpellsTabContainer');
  if (tabContainer) {
    bindSpellsEvents(pc, tabContainer);
  }

  restoreScrolls();
}

function bindSpellsEvents(pc, container) {
  container.onclick = (e) => {
    if (_handleTabNavigationClick(pc, e)) return;
    if (_handleNewDayClick(pc, e)) return;
    if (_handleSpellBubbleClick(pc, e, container)) return;
    if (_handleSpellbookActionClick(pc, e)) return;
    if (_handleSpellTemplateClick(pc, e, container)) return;
    if (_handleSpellListClick(pc, e)) return;
  };

  container.onchange = (e) => {
    _handleSpellChange(pc, e, container);
  };

  container.oninput = (e) => {
    _handleSpellInput(pc, e, container);
  };
}

function _handleTabNavigationClick(pc, e) {
  const tabBtn = e.target.closest('.right-spells-tab-btn');
  if (tabBtn) {
    e.stopPropagation();
    activeRightSpellsTab = tabBtn.dataset.tab;
    renderPCSpells(pc);
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
      // Check spells known limit (Bug #8)
      if (spell) {
        const check = CombatRules.checkSpellKnownLimit(activePC, spell, (k) => findSpell(activePC, k));
        if (!check.success) {
          showCustomAlert("Zauberlimit überschritten", check.error || "Du kannst keine weiteren bekannten Zauber dieses Grades lernen.");
          return true;
        }
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

function _handleSpellChange(pc, e, container) {
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
    renderPCSpells(pc);
    return;
  }

  const classFilterChk = e.target.closest('.comp-filter-class-chk');
  if (classFilterChk) {
    setShowAllSpells(!e.target.checked);
    renderPCSpells(pc);
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

/**
 * Renders the Features Tab: Class Features & Companions side-by-side
 */
export function renderPCFeatures(pc) {
  const featuresTab = document.getElementById('tabPanelFeatures');
  if (!featuresTab) return;

  const featuresContainer = document.getElementById('pcFeaturesContainer');
  const companionsContainer = document.getElementById('pcCompanionsContainer');
  if (!featuresContainer || !companionsContainer) return;

  saveScrolls();

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const hasCompanion = (hasClasses && pc.classes.some(c => ['druid', 'ranger'].includes(c.classType))) || (pc.companionType && pc.companionType !== 'none');
  const hasFamiliar = (hasClasses && pc.classes.some(c => ['wizard', 'sorcerer'].includes(c.classType))) || (pc.familiarType && pc.familiarType !== 'none');

  // Left Column: Class Features
  const activeComponents = CLASS_FEATURE_REGISTRY.filter(comp => comp.isEligible(pc));
  let cardsHtml = activeComponents.map(comp => {
    const clsInfo = pc.classes ? pc.classes.find(c => c.classType === comp.classKey) : null;
    const level = clsInfo ? clsInfo.level : 1;
    return `<div class="feature-comp-wrapper" data-class="${comp.classKey}">${comp.render(pc, level)}</div>`;
  }).join('');

  featuresContainer.innerHTML = `
    <div class="phdr">
      <h2>⚔️ Klassen-Features</h2>
      <button class="btn btn-new-day" style="font-size: 8px; padding: 2px 8px; font-family: 'IM Fell English SC', serif; font-weight: bold; background: linear-gradient(135deg, #c8a96e, #9a7a2e); color: white; border: 0.5px solid var(--red); border-radius: 2px; cursor: pointer; line-height: 1;" title="Tägliche Fähigkeiten wiederherstellen">
        Tagesreset 🌅
      </button>
    </div>
    <div class="pbody" style="padding: 6px;">
      <div style="display: flex; flex-direction: column; gap: 6px; max-height: 520px; overflow-y: auto; padding-right: 2px;" class="pc-scroll-features">
        ${cardsHtml || '<div style="font-size: 8.5px; color: var(--inkl); font-style: italic; text-align: center; padding: 30px 10px;">Keine aktiven Klassenfeatures.</div>'}
      </div>
    </div>
  `;

  // Right Column: Companions
  let companionTabHtml = '';
  if (hasCompanion && hasFamiliar) {
    companionTabHtml = `
      <div style="display: flex; gap: 3px; border-bottom: 0.5px solid var(--pb); padding-bottom: 3.5px; margin-bottom: 6px;">
        <button class="btn companion-sub-tab-btn ${activeFeaturesTab === 'companion' ? 'btn-p' : ''}" data-tab="companion" style="font-size: 7.5px; padding: 2px 6px;">🐾 Tierbegleiter</button>
        <button class="btn companion-sub-tab-btn ${activeFeaturesTab === 'familiar' ? 'btn-p' : ''}" data-tab="familiar" style="font-size: 7.5px; padding: 2px 6px;">🦇 Vertrauter</button>
      </div>
    `;
    if (activeFeaturesTab !== 'companion' && activeFeaturesTab !== 'familiar') {
      activeFeaturesTab = 'companion';
    }
  } else if (hasCompanion) {
    activeFeaturesTab = 'companion';
  } else if (hasFamiliar) {
    activeFeaturesTab = 'familiar';
  } else {
    activeFeaturesTab = 'none';
  }

  let companionBodyHtml = '';
  if (activeFeaturesTab === 'companion') {
    companionBodyHtml = CompanionSheet.render(pc);
  } else if (activeFeaturesTab === 'familiar') {
    companionBodyHtml = FamiliarSheet.render(pc);
  } else {
    companionBodyHtml = `
      <div style="font-size: 8.5px; color: var(--inkl); font-style: italic; text-align: center; padding: 35px 10px; background: rgba(0,0,0,0.02); border: 0.5px dashed var(--pb); border-radius: 2px;">
        🐾 Kein aktiver Tierbegleiter oder Vertrauter.
      </div>
    `;
  }

  companionsContainer.innerHTML = `
    <div class="phdr"><h2>🐾 Begleiter &amp; Vertraute</h2></div>
    <div class="pbody" style="padding: 6px; display: flex; flex-direction: column; gap: 4px;">
      ${companionTabHtml}
      <div class="companion-panel-content">
        ${companionBodyHtml}
      </div>
    </div>
  `;

  bindFeaturesEvents(pc, featuresTab);

  restoreScrolls();
}

function bindFeaturesEvents(pc, container) {
  container.onclick = (e) => {
    // 1. Companion sub-tab buttons
    const tabBtn = e.target.closest('.companion-sub-tab-btn');
    if (tabBtn) {
      e.stopPropagation();
      activeFeaturesTab = tabBtn.dataset.tab;
      renderPCFeatures(pc);
      return;
    }

    // 2. New Day button
    const newDayBtn = e.target.closest('.btn-new-day');
    if (newDayBtn) {
      e.stopPropagation();
      showCustomConfirm("Ein neuer Tag! 🌅", "Möchtest du alle verbrauchten Zauberslots und täglichen Klassenfähigkeiten wiederherstellen und einen neuen Tag beginnen?", () => {
        const activeComponents = CLASS_FEATURE_REGISTRY.filter(comp => comp.isEligible(pc));
        activeComponents.forEach(comp => {
          const clsInfo = pc.classes ? pc.classes.find(c => c.classType === comp.classKey) : null;
          const level = clsInfo ? clsInfo.level : 1;
          comp.onNewDay(pc, level);
        });

        CombatState.resetDailyResources();
        uiRegistry.renderPlayerScreen();
      });
      return;
    }
  };

  if (activeFeaturesTab === 'companion') {
    CompanionSheet.bindEvents(pc, container, () => renderPCFeatures(pc));
  } else if (activeFeaturesTab === 'familiar') {
    FamiliarSheet.bindEvents(pc, container, () => renderPCFeatures(pc));
  }

  // Bind active components feature events
  const activeComponents = CLASS_FEATURE_REGISTRY.filter(comp => comp.isEligible(pc));
  activeComponents.forEach(comp => {
    const wrapper = container.querySelector(`.feature-comp-wrapper[data-class="${comp.classKey}"]`);
    if (wrapper) {
      const clsInfo = pc.classes ? pc.classes.find(c => c.classType === comp.classKey) : null;
      const level = clsInfo ? clsInfo.level : 1;
      comp.bindEvents(pc, level, wrapper, () => uiRegistry.renderPlayerScreen());
    }
  });
}

/**
 * Backward compatibility stub
 */
export function renderPCResources(pc) {
  renderPCSpells(pc);
  renderPCFeatures(pc);
}
