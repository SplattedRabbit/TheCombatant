/**
 * @module    PCDefenses
 * @summary   Shell router tab coordinating between Rettung/Verteidigung (PCDefensesTab) and Buffs/Auren (PCBuffsTab).
 * @exports   renderPCDefenses(pc)
 */
import { renderPCDefensesTab, bindPCDefensesTabEvents } from './PCDefensesTab.js';
import { renderPCBuffsTab, bindPCBuffsEvents } from './PCBuffsTab.js';

// Local UI state for toggling between the defenses panel and buffs manager
let activeSubTab = 'defenses'; // 'defenses' or 'buffs'

export function renderPCDefenses(pc) {
  const defenses = document.getElementById('pcDefenses');
  if (!defenses) return;

  // Sub-Tab Navigation Bar
  const tabBarHtml = `
    <div class="panel-tab-bar">
      <button class="sub-tab-btn ${activeSubTab === 'defenses' ? 'active' : ''}" data-subtab="defenses">­ƒøí´©Å Rettung &amp; Verteidigung</button>
      <button class="sub-tab-btn ${activeSubTab === 'buffs' ? 'active' : ''}" data-subtab="buffs">Ô£¿ Buffs &amp; Auren (${Array.isArray(pc.activeBuffs) ? pc.activeBuffs.length : 0})</button>
    </div>
  `;

  // Render content depending on active sub-tab
  let bodyHtml = '';
  if (activeSubTab === 'defenses') {
    bodyHtml = renderPCDefensesTab(pc);
  } else {
    bodyHtml = renderPCBuffsTab(pc);
  }

  // Inject content to defenses container
  defenses.innerHTML = `
    ${tabBarHtml}
    <div class="pbody" style="display:flex; flex-direction:column; gap:6px;">
      ${bodyHtml}
    </div>
  `;

  // --- BIND EVENTS ---

  // Sub-Tab Toggle Buttons
  defenses.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeSubTab = btn.dataset.subtab;
      renderPCDefenses(pc);
    };
  });

  if (activeSubTab === 'defenses') {
    bindPCDefensesTabEvents(pc, defenses);
  } else {
    bindPCBuffsEvents(pc, defenses);
  }
}
