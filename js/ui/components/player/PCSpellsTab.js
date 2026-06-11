/**
 * @module    PCSpellsTab
 * @summary   Rendert das Zauberbuch- & Dashboard-Layout für den Spells-Reiter. Delegiert alle Events an PCSpellsTabHandlers.
 * @exports   renderPCSpells(pc)
 * @reads     pc.classes, pc.spellSlots
 * @depends   PCSpellbookTab, PCCompendiumTab, PCSpellsTabHandlers
 */
import { renderSpellbookTab, renderPreparedSlotsArea } from './PCSpellbookTab.js';
import { renderCompendiumTab } from './PCCompendiumTab.js';
import { bindSpellsEvents, activeRightSpellsTab } from './PCSpellsTabHandlers.js';

let savedScrollPositions = {};

function saveScrolls() {
  const comp = document.querySelector('.pc-scroll-compendium');
  const book = document.querySelector('.pc-scroll-spellbook');
  
  if (comp) savedScrollPositions.comp = comp.scrollTop;
  if (book) savedScrollPositions.book = book.scrollTop;
}

function restoreScrolls() {
  const comp = document.querySelector('.pc-scroll-compendium');
  const book = document.querySelector('.pc-scroll-spellbook');
  
  if (comp && savedScrollPositions.comp !== undefined) comp.scrollTop = savedScrollPositions.comp;
  if (book && savedScrollPositions.book !== undefined) book.scrollTop = savedScrollPositions.book;
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

  const currentTab = activeRightSpellsTab === null ? (hasPrepared ? 'prepared' : 'compendium') : activeRightSpellsTab;

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
        <button class="btn right-spells-tab-btn ${currentTab === 'prepared' ? 'btn-p' : ''}" data-tab="prepared" style="font-size: 8.5px; padding: 2px 6px; line-height: 1; font-family: 'IM Fell English SC', serif; font-weight: bold;">🌅 Vorbereitung</button>
        <button class="btn right-spells-tab-btn ${currentTab === 'compendium' ? 'btn-p' : ''}" data-tab="compendium" style="font-size: 8.5px; padding: 2px 6px; line-height: 1; font-family: 'IM Fell English SC', serif; font-weight: bold;">📖 Kompendium</button>
      </div>
    </div>
    <div class="pbody" style="padding: 6px; display: flex; flex-direction: column; gap: 4px;">
      ${currentTab === 'prepared' ? renderPreparedSlotsArea(pc) : renderCompendiumTab(pc)}
    </div>
  `;

  const tabContainer = document.getElementById('pcSpellsTabContainer');
  if (tabContainer) {
    bindSpellsEvents(pc, tabContainer, renderPCSpells);
  }

  restoreScrolls();
}
