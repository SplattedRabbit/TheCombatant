import { CombatState } from '../../state.js';
import { renderPCHeader, triggerYouDiedOverlay } from './player/PCHeader.js';
import { renderPCAttributes } from './player/PCAttributes.js';
import { renderPCDefenses } from './player/PCDefenses.js';
import { renderPCOffense } from './player/PCOffense.js';
import { renderPCSpells, renderPCFeatures } from './player/PCResources.js';
import { renderPCFeats } from './player/PCFeatsTab.js';
import { renderPCSkills } from './player/PCSkillsTab.js';
import { renderPCHealthGlobe } from './player/PCHealthGlobe.js';

let activeTab = 'overview'; // 'overview', 'skills', 'offense', 'spells', 'features'

function renderPlayerTabBar(pc) {
  const container = document.getElementById('playerTabBar');
  if (!container) return;

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const isCaster = hasClasses && pc.classes.some(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType));

  const spellsTabHtml = isCaster ? `
    <button class="player-tab-btn ${activeTab === 'spells' ? 'active' : ''}" data-tab="spells">🔮 Zauberbuch</button>
  ` : '';

  container.innerHTML = `
    <button class="player-tab-btn ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">🛡️ Übersicht</button>
    <button class="player-tab-btn ${activeTab === 'skills' ? 'active' : ''}" data-tab="skills">📜 Skills &amp; Talente</button>
    <button class="player-tab-btn ${activeTab === 'offense' ? 'active' : ''}" data-tab="offense">⚔️ Waffen</button>
    ${spellsTabHtml}
    <button class="player-tab-btn ${activeTab === 'features' ? 'active' : ''}" data-tab="features">🐾 Klasse &amp; Begleiter</button>
    <button class="player-tab-btn" id="btnSystemMenuPlayer">⚙️ System</button>
  `;

  // Attach event listener via delegating click
  container.onclick = (e) => {
    const btn = e.target.closest('.player-tab-btn');
    if (btn) {
      if (btn.id === 'btnSystemMenuPlayer') {
        e.stopPropagation();
        window.toggleSystemDropdown?.(btn);
        return;
      }
      activeTab = btn.dataset.tab;
      renderPlayerScreen();
    }
  };
}

/**
 * Renders the dedicated Player Character Screen (Mediator / Coordinator)
 */
export function renderPlayerScreen() {
  const pc = CombatState.getActivePC();
  if (!pc) return;

  // Fallback for non-caster PCs if activeTab is 'spells'
  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const isCaster = hasClasses && pc.classes.some(c => ['cleric', 'wizard', 'sorcerer', 'bard', 'druid', 'paladin', 'ranger'].includes(c.classType));
  if (activeTab === 'spells' && !isCaster) {
    activeTab = 'overview';
  }

  renderPCHeader(pc, activeTab);
  renderPlayerTabBar(pc);

  // Toggle active tab panel CSS classes
  const panels = ['Overview', 'Skills', 'Offense', 'Spells', 'Features'];
  panels.forEach(p => {
    const el = document.getElementById(`tabPanel${p}`);
    if (el) {
      if (p.toLowerCase() === activeTab) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });

  // Render contents for the active panel
  if (activeTab === 'overview') {
    renderPCAttributes(pc);
    renderPCDefenses(pc);
    renderPCHealthGlobe(pc);
  } else if (activeTab === 'skills') {
    // Left side: Skills
    renderPCSkills(pc);
    // Right side: Feats/Talente
    renderPCFeats(pc);
  } else if (activeTab === 'offense') {
    renderPCOffense(pc);
  } else if (activeTab === 'spells') {
    renderPCSpells(pc);
  } else if (activeTab === 'features') {
    renderPCFeatures(pc);
  }

  // Dark Souls Easter Egg (-10 HP or below is dead in D&D 3.5e)
  if (pc.hp > -10) {
    if (pc.deathScreenShown) {
      pc.deathScreenShown = false;
      CombatState.saveToStorage();
      CombatState.syncPCToHost();
    }
  } else if (!pc.deathScreenShown) {
    pc.deathScreenShown = true;
    CombatState.saveToStorage();
    CombatState.syncPCToHost();
    triggerYouDiedOverlay(pc);
  }
}
