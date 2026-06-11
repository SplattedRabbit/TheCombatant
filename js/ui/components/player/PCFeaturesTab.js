/**
 * @module    PCFeaturesTab
 * @summary   Rendert Klassen-Features, Volksmerkmale und Begleiter/Vertrauten-Sheets für den Features-Reiter.
 * @exports   renderPCFeatures(pc)
 * @reads     pc.classes, pc.race, pc.companionType, pc.familiarType, pc.dailyAbilities
 * @stateOps  CombatState.resetDailyResources
 * @depends   CombatState, ClassFeaturesRegistry, CompanionSheet, FamiliarSheet, dialogs
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { CompanionSheet } from '../CompanionSheet.js';
import { FamiliarSheet } from '../FamiliarSheet.js';
import { showCustomConfirm } from '../dialogs.js';
import { CLASS_FEATURE_REGISTRY } from './ClassFeaturesRegistry.js';

let activeFeaturesTab = 'companion'; // 'companion' or 'familiar'
let savedScrollPositions = {};

function saveScrolls() {
  const feat = document.querySelector('.pc-scroll-features');
  if (feat) savedScrollPositions.feat = feat.scrollTop;
}

function restoreScrolls() {
  const feat = document.querySelector('.pc-scroll-features');
  if (feat && savedScrollPositions.feat !== undefined) feat.scrollTop = savedScrollPositions.feat;
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

  // Left Column: Class Features & Racial Features
  const activeComponents = CLASS_FEATURE_REGISTRY.filter(comp => comp.isEligible(pc));
  let classCardsHtml = activeComponents.map(comp => {
    const clsInfo = pc.classes ? pc.classes.find(c => c.classType === comp.classKey) : null;
    const level = clsInfo ? clsInfo.level : 1;
    return `<div class="feature-comp-wrapper" data-class="${comp.classKey}">${comp.render(pc, level)}</div>`;
  }).join('');

  // Racial Features Card
  const race = (pc.race || 'human').toLowerCase();
  const raceNames = { human: 'Mensch', elf: 'Elf', dwarf: 'Zwerg', gnome: 'Gnom', halfling: 'Halbling', half_elf: 'Halbelf', half_orc: 'Halbork' };
  const raceName = raceNames[race] || 'Mensch';
  
  let traitsHtml = '';
  if (race === 'human') {
    traitsHtml = `
      <ul style="margin: 0; padding-left: 12px; font-size: 8px; font-family: 'Crimson Text', serif; line-height: 1.3; color: var(--inkm);">
        <li><strong>Zusätzliches Talent:</strong> 1 zusätzliches Talent auf Stufe 1.</li>
        <li><strong>Zusätzliche Skillpunkte:</strong> +4 Skillpunkte auf Stufe 1, +1 auf jeder weiteren Stufe.</li>
      </ul>
    `;
  } else if (race === 'dwarf') {
    traitsHtml = `
      <ul style="margin: 0; padding-left: 12px; font-size: 8px; font-family: 'Crimson Text', serif; line-height: 1.3; color: var(--inkm);">
        <li><strong>Attributsmodifikationen:</strong> +2 Konstitution, -2 Charisma (bereits eingerechnet).</li>
        <li><strong>Dunkelsicht (Darkvision):</strong> Kann im Dunkeln bis zu 60 Fuß weit sehen.</li>
        <li><strong>Fester Stand (Stability):</strong> +4 auf Würfe zur Abwehr von Ansturm (Bull Rush) oder Niederwerfen (Trip).</li>
        <li><strong>Volksboni gegen Gift/Zauber:</strong> +2 Rettungswurf-Bonus gegen Gifte, Zauber und zauberähnliche Effekte.</li>
        <li><strong>Steingefühl (Stonecunning):</strong> +2 auf Suchen-Würfe bezüglich ungewöhnlicher Steinarbeiten.</li>
        <li><strong>Rüstungsresistenz:</strong> Bewegungsrate wird durch schwere Rüstung oder schwere Last nicht reduziert.</li>
      </ul>
    `;
  } else if (race === 'elf') {
    traitsHtml = `
      <ul style="margin: 0; padding-left: 12px; font-size: 8px; font-family: 'Crimson Text', serif; line-height: 1.3; color: var(--inkm);">
        <li><strong>Attributsmodifikationen:</strong> +2 Geschicklichkeit, -2 Konstitution (bereits eingerechnet).</li>
        <li><strong>Immunitäten:</strong> Immun gegen magische Schlafeffekte.</li>
        <li><strong>Volksboni gegen Verzauberung:</strong> +2 Rettungswurf-Bonus gegen Verzauberungszauber oder -effekte.</li>
        <li><strong>Geschärfte Sinne:</strong> +2 Volksbonus auf Suchen, Entdecken und Lauschen (bereits eingerechnet).</li>
        <li><strong>Umgang mit Waffen:</strong> Automatisch geübt mit Langschwert, Rapier, Langbogen und Kurzbogen.</li>
      </ul>
    `;
  } else if (race === 'gnome') {
    traitsHtml = `
      <ul style="margin: 0; padding-left: 12px; font-size: 8px; font-family: 'Crimson Text', serif; line-height: 1.3; color: var(--inkm);">
        <li><strong>Attributsmodifikationen:</strong> +2 Konstitution, -2 Stärke (bereits eingerechnet).</li>
        <li><strong>Größenkategorie Klein:</strong> +1 Größenbonus auf RK, +1 Größenbonus auf Angriffswürfe, +4 auf Verstecken (bereits eingerechnet).</li>
        <li><strong>Volksboni gegen Illusion:</strong> +2 Rettungswurf-Bonus gegen Illusionen.</li>
        <li><strong>Ausweichen gegen Riesen:</strong> +4 Ausweichbonus auf RK gegen Gegner der Kategorie Riese.</li>
        <li><strong>Geschärfte Sinne:</strong> +2 Volksbonus auf Lauschen und Handwerk (Alchemie).</li>
      </ul>
    `;
  } else if (race === 'halfling') {
    traitsHtml = `
      <ul style="margin: 0; padding-left: 12px; font-size: 8px; font-family: 'Crimson Text', serif; line-height: 1.3; color: var(--inkm);">
        <li><strong>Attributsmodifikationen:</strong> +2 Geschicklichkeit, -2 Stärke (bereits eingerechnet).</li>
        <li><strong>Größenkategorie Klein:</strong> +1 Größenbonus auf RK, +1 Größenbonus auf Angriffswürfe, +4 auf Verstecken (bereits eingerechnet).</li>
        <li><strong>Glückspilz:</strong> +1 Volksbonus auf alle Rettungswürfe (bereits eingerechnet).</li>
        <li><strong>Furchtlosigkeit:</strong> +2 Moralbonus auf Rettungswürfe gegen Furcht.</li>
        <li><strong>Geschärfte Sinne:</strong> +2 Volksbonus auf Klettern, Springen, Lauschen und Leise bewegen (bereits eingerechnet).</li>
      </ul>
    `;
  } else if (race === 'half_elf') {
    traitsHtml = `
      <ul style="margin: 0; padding-left: 12px; font-size: 8px; font-family: 'Crimson Text', serif; line-height: 1.3; color: var(--inkm);">
        <li><strong>Immunitäten:</strong> Immun gegen magische Schlafeffekte, +2 Rettungswurf-Bonus gegen Verzauberungszauber oder -effekte.</li>
        <li><strong>Geschärfte Sinne:</strong> +1 Volksbonus auf Lauschen, Entdecken und Suchen (bereits eingerechnet).</li>
        <li><strong>Diplomatisches Geschick:</strong> +2 Volksbonus auf Diplomatie und Informationen sammeln (bereits eingerechnet).</li>
        <li><strong>Elbisches Blut:</strong> Gilt in allen Belangen als Elf.</li>
      </ul>
    `;
  } else if (race === 'half_orc') {
    traitsHtml = `
      <ul style="margin: 0; padding-left: 12px; font-size: 8px; font-family: 'Crimson Text', serif; line-height: 1.3; color: var(--inkm);">
        <li><strong>Attributsmodifikationen:</strong> +2 Stärke, -2 Intelligenz, -2 Charisma (bereits eingerechnet).</li>
        <li><strong>Dunkelsicht (Darkvision):</strong> Kann im Dunkeln bis zu 60 Fuß weit sehen.</li>
        <li><strong>Orkisches Blut:</strong> Gilt in allen Belangen als Ork.</li>
      </ul>
    `;
  }

  const raceCardHtml = `
    <div class="class-feature-card" style="border: 0.5px solid var(--pb); border-radius: 3px; padding: 6px 8px; background: rgba(200, 169, 110, 0.03); margin-bottom: 6px; display: flex; flex-direction: column; gap: 3.5px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 0.5px solid rgba(200, 169, 110, 0.2); padding-bottom: 2px;">
        <span style="font-family: 'IM Fell English SC', serif; font-size: 10px; font-weight: bold; color: var(--red);">🧬 Volksmerkmale: ${raceName}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        ${traitsHtml}
      </div>
    </div>
  `;

  const cardsHtml = raceCardHtml + classCardsHtml;

  featuresContainer.innerHTML = `
    <div class="phdr">
      <h2>⚔️ Klassen-Features</h2>
      <button class="btn btn-new-day" style="font-size: 8px; padding: 2px 8px; font-family: 'IM Fell English SC', serif; font-weight: bold; background: linear-gradient(135deg, #c8a96e, #9a7a2e); color: white; border: 0.5px solid var(--red); border-radius: 2px; cursor: pointer; line-height: 1;" title="Tägliche Fähigkeiten wiederherstellen">
        Tagesreset 🌅
      </button>
    </div>
    <div class="pbody" style="padding: 6px;">
      <div style="display: flex; flex-direction: column; gap: 6px; max-height: 520px; overflow-y: auto; padding-right: 2px;" class="pc-scroll-features">
        ${cardsHtml}
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
