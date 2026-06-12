/**
 * @module    PCFeatsTab
 * @summary   Rendert den Talente-Tab mit erlernten Talenten (links) und interaktivem Kompendium (rechts). Prüft Voraussetzungen und zeigt Bonus-Talente nach Klasse.
 * @exports   renderPCFeats(pc), checkPrerequisites(feat, pc)
 * @reads     pc.feats, pc.classes, pc.bab, pc.str/dex/con/int/wis/cha, pc.skills, pc.level
 * @stateOps  addPCFeat, removePCFeat (via showFeatScrollDialog → CombatState)
 * @depends   CombatState (state.js), uiRegistry, CombatFeats (feats-data.js), dialogs.js
 * @notHere   Talent-Definitionen → feats-data.js | Angriffs-Effekte der Talente → AttackEngine.js
 */
import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';
import { CombatFeats } from '../../../data/feats-data.js';
import { showCustomAlert, showFeatScrollDialog } from '../dialogs.js';
import { CombatRules } from '../../../rules.js';

// Global state for search and filter within the tab
let featSearchQuery = '';
let featCategoryFilter = 'all';

/**
 * Evaluates D&D 3.5e prerequisites for a given feat against the PC's stats and classes.
 */
export function checkPrerequisites(feat, pc) {
  if (!feat.prereqs || feat.prereqs.length === 0) return { met: true, details: [] };
  
  let met = true;
  const details = [];
  const learnedIds = Array.isArray(pc.feats) ? pc.feats.map(f => f.id) : [];
  
  feat.prereqs.forEach(pr => {
    let prMet = false;
    let desc = '';
    
    if (pr.type === 'bab') {
      const pcBab = pc.bab ? pc.bab.getValue() : 0;
      prMet = pcBab >= pr.value;
      desc = `Grundangriffsbonus (BAB) +${pr.value} (Aktuell: +${pcBab})`;
    } else if (pr.type === 'feat') {
      prMet = learnedIds.includes(pr.id);
      const parentFeat = CombatFeats.REGISTRY[pr.id];
      const parentName = parentFeat ? parentFeat.nameDe : pr.id;
      desc = `Talent: ${parentName}`;
    } else if (pr.type === 'classLevel') {
      const cls = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === pr.class) : null;
      const lvl = cls ? cls.level : 0;
      prMet = lvl >= pr.value;
      const classNameDe = pr.class === 'fighter' ? 'Kämpfer' : pr.class === 'wizard' ? 'Magier' : pr.class;
      desc = `${classNameDe} Stufe ${pr.value} (Aktuell: Stufe ${lvl})`;
    } else if (pr.type === 'class') {
      const hasCls = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === pr.class);
      prMet = hasCls;
      const classNameDe = pr.class === 'wizard' ? 'Magier' : pr.class;
      desc = `Klasse: ${classNameDe}`;
    } else if (pr.type === 'stat') {
      const nameMap = { str: 'Stärke', dex: 'Geschicklichkeit', con: 'Konstitution', int: 'Intelligenz', wis: 'Weisheit', cha: 'Charisma' };
      const pcStat = pc[pr.name] ? pc[pr.name].getValue() : 10;
      prMet = pcStat >= pr.value;
      desc = `${nameMap[pr.name] || pr.name} ${pr.value}+ (Aktuell: ${pcStat})`;
    } else if (pr.type === 'level') {
      const pcLevel = pc.level || 1;
      prMet = pcLevel >= pr.value;
      desc = `Charakterstufe ${pr.value} (Aktuell: ${pcLevel})`;
    } else if (pr.type === 'casterLevel') {
      let maxCL = 0;
      if (Array.isArray(pc.classes)) {
        pc.classes.forEach(c => {
          if (['wizard', 'cleric', 'druid', 'sorcerer', 'bard'].includes(c.classType)) {
            maxCL = Math.max(maxCL, c.level);
          } else if (['paladin', 'ranger'].includes(c.classType) && c.level >= 4) {
            maxCL = Math.max(maxCL, Math.floor(c.level / 2));
          }
        });
      }
      prMet = maxCL >= pr.value;
      desc = `Zaubererstufe ${pr.value} (Aktuell: ${maxCL})`;
    } else if (pr.type === 'custom') {
      if (pr.desc === 'Fähigkeit, Untote zu vertreiben') {
        const clericClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'cleric') : null;
        const paladinClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'paladin') : null;
        const clericLvl = clericClass ? clericClass.level : 0;
        const paladinLvl = paladinClass ? paladinClass.level : 0;
        prMet = clericLvl >= 1 || paladinLvl >= 4;
        desc = `Spezial: ${pr.desc} (Kleriker 1+ oder Paladin 4+)`;
      } else if (pr.desc === 'Bardenmusik') {
        const bardClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'bard') : null;
        const bardLvl = bardClass ? bardClass.level : 0;
        prMet = bardLvl >= 1;
        desc = `Spezial: ${pr.desc} (Barde 1+)`;
      } else if (pr.desc === 'Tiergestalt (Wild Shape)') {
        const druidClass = Array.isArray(pc.classes) ? pc.classes.find(c => c.classType === 'druid') : null;
        const druidLvl = druidClass ? druidClass.level : 0;
        prMet = druidLvl >= 5;
        desc = `Spezial: ${pr.desc} (Druide 5+)`;
      } else if (pr.desc === 'Reiten 1 Rang') {
        let ranks = 0;
        if (typeof pc.getSkillRanks === 'function') {
          ranks = pc.getSkillRanks('ride');
        } else if (pc.skills && pc.skills['ride']) {
          ranks = parseFloat(pc.skills['ride'].ranks) || 0;
        }
        prMet = ranks >= 1;
        desc = `Spezial: ${pr.desc} (aktuell: ${ranks})`;
      } else {
        prMet = true;
        desc = `Spezial: ${pr.desc}`;
      }
    }
    
    if (!prMet) met = false;
    details.push({ met: prMet, desc });
  });
  
  return { met, details };
}

/**
 * Determines if a feat is a bonus feat for an active class level of the PC.
 */
function getBonusFeatClass(feat) {
  if (feat.category === 'combat') return 'fighter';
  if (feat.category === 'metamagic' || feat.category === 'item_creation') return 'wizard';
  const monkBonusIds = ['improved_unarmed_strike', 'improved_grapple', 'deflect_arrows', 'snatch_arrows', 'stunning_fist', 'improved_trip', 'improved_overrun'];
  if (monkBonusIds.includes(feat.id)) return 'monk';
  return null;
}

/**
 * Builds the tree list of feats to display in the compendium.
 * Hides child feats unless their parent is erlernt.
 */
function getCompendiumFeatList(pc) {
  const list = [];
  const learnedIds = Array.isArray(pc.feats) ? pc.feats.map(f => f.id) : [];
  
  function addFeatWithChildren(featId, depth) {
    const feat = CombatFeats.REGISTRY[featId];
    if (!feat) return;
    
    list.push({ feat, depth });
    
    // If parent is learned, display children beneath it recursively
    if (learnedIds.includes(featId)) {
      Object.keys(CombatFeats.REGISTRY).forEach(childId => {
        const child = CombatFeats.REGISTRY[childId];
        if (child.parent === featId) {
          addFeatWithChildren(childId, depth + 1);
        }
      });
    }
  }
  
  // Root feats first
  Object.keys(CombatFeats.REGISTRY).forEach(featId => {
    const feat = CombatFeats.REGISTRY[featId];
    if (!feat.parent) {
      addFeatWithChildren(featId, 0);
    }
  });
  
  return list;
}

/**
 * Renders the interactive Feats tab panel.
 */
export function renderPCFeats(pc) {
  const container = document.getElementById('pcFeatsTab');
  if (!container) return;

  const hasFighter = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'fighter');
  const hasWizard = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'wizard');
  const hasMonk = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'monk');
  const activeFeats = Array.isArray(pc.feats) ? pc.feats : [];

  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const totalLevel = activeClasses.reduce((sum, c) => sum + (c.level || 0), 0) || 1;
  const raceStr = (pc.race || '').toLowerCase();
  const isHuman = pc.isHuman !== undefined ? !!pc.isHuman : (raceStr === 'human' || raceStr === 'mensch' || raceStr === '');

  const generalMax = 1 + Math.floor((totalLevel - 1) / 3) + (isHuman ? 1 : 0);
  const fighterClass = activeClasses.find(c => c.classType === 'fighter');
  const fighterMax = fighterClass ? 1 + Math.floor(fighterClass.level / 2) : 0;
  const wizardClass = activeClasses.find(c => c.classType === 'wizard');
  const wizardMax = wizardClass ? 1 + Math.floor(wizardClass.level / 5) : 0;
  const monkClass = activeClasses.find(c => c.classType === 'monk');
  const monkMax = monkClass ? (monkClass.level >= 6 ? 3 : (monkClass.level >= 2 ? 2 : (monkClass.level >= 1 ? 1 : 0))) : 0;

  const totalMax = generalMax + fighterMax + wizardMax + monkMax;

  // Distribute chosen feats to slots to show detailed slot usage
  const monkBonusIds = ['improved_unarmed_strike', 'improved_grapple', 'deflect_arrows', 'snatch_arrows', 'stunning_fist', 'improved_trip', 'improved_overrun'];
  let monkFilled = 0;
  let wizardFilled = 0;
  let fighterFilled = 0;
  let generalFilled = 0;

  for (const f of activeFeats) {
    const featDef = CombatFeats.REGISTRY[f.id];
    if (!featDef) continue;
    if (monkMax > 0 && monkFilled < monkMax && monkBonusIds.includes(f.id)) {
      monkFilled++;
    } else if (wizardMax > 0 && wizardFilled < wizardMax && (featDef.category === 'metamagic' || featDef.category === 'item_creation')) {
      wizardFilled++;
    } else if (fighterMax > 0 && fighterFilled < fighterMax && featDef.category === 'combat') {
      fighterFilled++;
    } else {
      generalFilled++;
    }
  }

  const legendHtml = _renderFeatsLegendHtml(hasFighter, hasWizard, hasMonk);
  const activeFeatsHtml = _renderLearnedFeatsListHtml(pc, activeFeats, hasFighter, hasWizard, hasMonk);
  const compendiumHtml = _renderCompendiumListHtml(pc, activeFeats, hasFighter, hasWizard, hasMonk);

  // Set container innerHTML
  container.innerHTML = `
    ${legendHtml}
    
    <div style="display:flex; gap:10px; height:100%; min-height: 380px;">
      <!-- Left Column: Active Feats (40%) -->
      <div style="width: 40%; display:flex; flex-direction:column; gap:4px; border-right: 0.5px solid var(--pb); padding-right: 8px;">
        <h3 style="font-family:'IM Fell English SC', serif; font-size: 11px; color: var(--red); border-bottom: 1px solid var(--pb); padding-bottom: 2px; margin: 0 0 4px 0; font-weight:bold; text-align: center;">
          🎓 Talente (${activeFeats.length} / ${totalMax})
        </h3>
        <div style="font-size: 7.5px; font-weight: normal; color: var(--inkm); margin-bottom: 6px; display: flex; flex-direction: column; gap: 2.5px; background: rgba(0,0,0,0.01); border: 0.5px solid rgba(200, 169, 110, 0.2); padding: 4px 6px; border-radius: 2px;">
          <div style="display:flex; justify-content:space-between;"><span>Allgemeine Slots:</span> <strong style="color:var(--red);">${generalFilled} / ${generalMax}</strong></div>
          ${fighterMax > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Kämpfer-Slots:</span> <strong style="color:var(--red);">${fighterFilled} / ${fighterMax}</strong></div>` : ''}
          ${wizardMax > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Magier-Slots:</span> <strong style="color:var(--red);">${wizardFilled} / ${wizardMax}</strong></div>` : ''}
          ${monkMax > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Mönch-Slots:</span> <strong style="color:var(--red);">${monkFilled} / ${monkMax}</strong></div>` : ''}
        </div>
        <div class="active-feats-list" style="flex:1; overflow-y:auto; max-height:360px; box-sizing:border-box;">
          ${activeFeatsHtml}
        </div>
      </div>
      
      <!-- Right Column: Compendium (60%) -->
      <div style="width: 60%; display:flex; flex-direction:column; gap:4px;">
        <!-- Filters Header -->
        <div style="display:flex; gap:4px; margin-bottom: 4px;">
          <input type="text" id="compendiumFeatSearch" value="${featSearchQuery}" placeholder="Suchen..." class="cinput" style="flex:1; font-size: 11px; height: 18px; padding: 0 4px; font-family: 'Crimson Text', serif; box-sizing: border-box;">
          <select id="compendiumFeatCategory" class="cinput" style="flex:1; font-size: 11px; height: 18px; padding: 0 2px; font-family: 'Crimson Text', serif; box-sizing: border-box;">
            <option value="all" ${featCategoryFilter === 'all' ? 'selected' : ''}>Alle Klassen</option>
            <option value="general" ${featCategoryFilter === 'general' ? 'selected' : ''}>Allgemein</option>
            <option value="combat" ${featCategoryFilter === 'combat' ? 'selected' : ''}>Kampftalente</option>
            <option value="metamagic" ${featCategoryFilter === 'metamagic' ? 'selected' : ''}>Metamagie</option>
            <option value="item_creation" ${featCategoryFilter === 'item_creation' ? 'selected' : ''}>Erschaffung</option>
          </select>
        </div>
        
        <div class="compendium-feats-list" style="flex:1; overflow-y:auto; max-height:340px; box-sizing:border-box; border: 0.5px dashed rgba(200,169,110,0.2); padding: 4px; border-radius: 2px;">
          ${compendiumHtml}
        </div>
      </div>
    </div>
  `;

  _bindFeatsTabEvents(pc, container, activeFeats);
}

function _renderFeatsLegendHtml(hasFighter, hasWizard, hasMonk) {
  return `
    <div class="feats-legend" style="margin-bottom: 8px; padding: 5px 8px; background: rgba(200, 169, 110, 0.05); border: 0.5px solid var(--pb); border-radius: 2px; font-size: 8px; display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap;">
      <span style="font-weight: bold; color: var(--red); font-family: 'IM Fell English SC', serif; font-size: 8.5px;">Legende:</span>
      <span style="display: inline-flex; align-items: center; gap: 4px; opacity: ${hasFighter ? 1 : 0.5};">
        <span style="display: inline-block; width: 8px; height: 6px; border: 1.2px solid #2a6a2a; background: rgba(42, 106, 42, 0.1); border-left-width: 3px;"></span>
        <span>Kämpfer-Bonus (Kategorie Kampf ${hasFighter ? '🟢 Aktiv' : '❌ Inaktiv'})</span>
      </span>
      <span style="display: inline-flex; align-items: center; gap: 4px; opacity: ${hasWizard ? 1 : 0.5};">
        <span style="display: inline-block; width: 8px; height: 6px; border: 1.2px solid #2a6a2a; background: rgba(42, 106, 42, 0.1); border-left-width: 3px;"></span>
        <span>Magier-Bonus (Metamagie/Gegenstand ${hasWizard ? '🟢 Aktiv' : '❌ Inaktiv'})</span>
      </span>
      <span style="display: inline-flex; align-items: center; gap: 4px; opacity: ${hasMonk ? 1 : 0.5};">
        <span style="display: inline-block; width: 8px; height: 6px; border: 1.2px solid #2a6a2a; background: rgba(42, 106, 42, 0.1); border-left-width: 3px;"></span>
        <span>Mönch-Bonus (Mönch-Talente ${hasMonk ? '🟢 Aktiv' : '❌ Inaktiv'})</span>
      </span>
    </div>
  `;
}

function _renderLearnedFeatsListHtml(pc, activeFeats, hasFighter, hasWizard, hasMonk) {
  if (activeFeats.length === 0) {
    return `
      <div style="font-family:'Crimson Text', serif; font-size: 10px; color: var(--inkl); font-style: italic; text-align: center; padding: 15px;">
        Keine Talente erlernt. Wähle Talente aus dem Kompendium rechts.
      </div>
    `;
  }

  return activeFeats.map((featInst, idx) => {
    const feat = CombatFeats.REGISTRY[featInst.id];
    if (!feat) return '';
    
    const optionLabel = featInst.option ? ` (${featInst.option})` : '';
    const categoryDe = { combat: 'Kampftalent', metamagic: 'Metamagie', item_creation: 'Gegenstandserschaffung', general: 'Allgemein' }[feat.category] || 'Allgemein';
    const isClassBonus = (getBonusFeatClass(feat) === 'fighter' && hasFighter) ||
                         (getBonusFeatClass(feat) === 'wizard' && hasWizard) ||
                         (getBonusFeatClass(feat) === 'monk' && hasMonk);

    const bonusBorder = isClassBonus ? 'border: 1px solid #2a6a2a; border-left: 3px solid #2a6a2a; background: rgba(42,106,42,0.03);' : 'border: 0.5px solid var(--pb);';

    return `
      <div class="active-feat-card" data-id="${feat.id}" data-option="${featInst.option || ''}" data-idx="${idx}" style="
        padding: 6px 8px;
        margin-bottom: 4px;
        border-radius: 2px;
        cursor: pointer;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 2px;
        transition: transform 0.15s, background-color 0.15s;
        ${bonusBorder}
      ">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-family:'IM Fell English SC', serif; font-size: 9.5px; font-weight: bold; color: var(--red);">${feat.nameDe}${optionLabel}</span>
          <span style="font-size: 7px; color: var(--inkm); background: rgba(0,0,0,0.05); padding: 0 4px; border-radius: 1px;">${categoryDe}</span>
        </div>
        <div style="font-family:'Crimson Text', serif; font-size: 8.5px; color: var(--inkm); line-height: 1.25; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;" title="${feat.benefitDe}">
          ${feat.benefitDe}
        </div>
      </div>
    `;
  }).join('');
}

function _renderCompendiumListHtml(pc, activeFeats, hasFighter, hasWizard, hasMonk) {
  const compList = getCompendiumFeatList(pc);
  
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];
  const totalLevel = activeClasses.reduce((sum, c) => sum + (c.level || 0), 0) || 1;
  const raceStr = (pc.race || '').toLowerCase();
  const isHuman = pc.isHuman !== undefined ? !!pc.isHuman : (raceStr === 'human' || raceStr === 'mensch' || raceStr === '');

  const generalMax = 1 + Math.floor((totalLevel - 1) / 3) + (isHuman ? 1 : 0);
  const fighterClass = activeClasses.find(c => c.classType === 'fighter');
  const fighterMax = fighterClass ? 1 + Math.floor(fighterClass.level / 2) : 0;
  const wizardClass = activeClasses.find(c => c.classType === 'wizard');
  const wizardMax = wizardClass ? 1 + Math.floor(wizardClass.level / 5) : 0;
  const monkClass = activeClasses.find(c => c.classType === 'monk');
  const monkMax = monkClass ? (monkClass.level >= 6 ? 3 : (monkClass.level >= 2 ? 2 : (monkClass.level >= 1 ? 1 : 0))) : 0;

  const totalMax = generalMax + fighterMax + wizardMax + monkMax;
  const isLimitReached = activeFeats.length >= totalMax;
  
  let limitWarningHtml = '';
  if (isLimitReached) {
    limitWarningHtml = `
      <div style="background: rgba(139, 26, 26, 0.08); border: 0.5px solid var(--red); border-radius: 2px; padding: 4px; margin-bottom: 4px; font-family: 'Crimson Text', serif; font-size: 8px; color: var(--red); text-align: center; font-weight: bold;">
        ⚠️ Talentlimit erreicht (${activeFeats.length} / ${totalMax}). Du musst erst ein Talent verlernen, um ein neues auszuwählen.
      </div>
    `;
  }

  // Apply filtering
  const filteredCompList = compList.filter(item => {
    if (featSearchQuery) {
      const q = featSearchQuery.toLowerCase();
      const matchName = item.feat.nameDe.toLowerCase().includes(q) || item.feat.nameEn.toLowerCase().includes(q);
      const matchBenefit = item.feat.benefitDe.toLowerCase().includes(q) || item.feat.benefitRaw.toLowerCase().includes(q);
      if (!matchName && !matchBenefit) return false;
    }
    if (featCategoryFilter !== 'all') {
      if (item.feat.category !== featCategoryFilter) return false;
    }
    return true;
  });

  if (filteredCompList.length === 0) {
    return `
      <div style="font-family:'Crimson Text', serif; font-size: 10px; color: var(--inkl); font-style: italic; text-align: center; padding: 15px;">
        Keine Talente gefunden (Filter aktiv).
      </div>
    `;
  }

  return limitWarningHtml + filteredCompList.map(item => {
    const feat = item.feat;
    const depth = item.depth;
    
    const { met } = checkPrerequisites(feat, pc);
    const isAlreadyLearned = activeFeats.some(f => f.id === feat.id);
    
    const bonusClass = getBonusFeatClass(feat);
    const isClassBonus = (bonusClass === 'fighter' && hasFighter) ||
                         (bonusClass === 'wizard' && hasWizard) ||
                         (bonusClass === 'monk' && hasMonk);

    const isBlocked = (!met || isLimitReached) && !isAlreadyLearned;
    
    let borderStyle = isClassBonus ? 'border: 1px solid #2a6a2a; border-left: 3.5px solid #2a6a2a;' : 'border: 0.5px solid var(--pb);';
    let backgroundStyle = isClassBonus ? 'background: rgba(42, 106, 42, 0.04);' : 'background: transparent;';
    let opacityStyle = isBlocked ? 'opacity: 0.5; cursor: not-allowed;' : 'cursor: pointer;';
    
    let icon = '⚪';
    if (isAlreadyLearned) icon = '🟢';
    else if (isBlocked) icon = '🔒';
    
    const categoryDe = { combat: 'Kampf', metamagic: 'Metamagie', item_creation: 'Erschaffung', general: 'Allgemein' }[feat.category] || 'Allgemein';
    const depthPadding = depth * 14;

    return `
      <div class="comp-feat-row" data-id="${feat.id}" style="
        padding: 4px 6px;
        margin-bottom: 3px;
        border-radius: 2px;
        margin-left: ${depthPadding}px;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.15s, opacity 0.15s;
        ${borderStyle}
        ${backgroundStyle}
        ${opacityStyle}
      ">
        <span style="font-size: 8px; flex-shrink: 0;">${icon}</span>
        <div style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-family:'IM Fell English SC', serif; font-size: 9px; font-weight: bold; color: var(--red);">${feat.nameDe}</span>
            <span style="font-size: 6.5px; color: var(--inkm); background: rgba(0,0,0,0.05); padding: 0 3px; border-radius: 1px;">${categoryDe}</span>
          </div>
          <div style="font-family:'Crimson Text', serif; font-size: 8px; color: var(--inkm); line-height: 1.25; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;" title="${feat.benefitDe}">
            ${feat.benefitDe}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function _bindFeatsTabEvents(pc, container, activeFeats) {
  const searchInput = container.querySelector('#compendiumFeatSearch');
  if (searchInput) {
    searchInput.oninput = (e) => {
      featSearchQuery = e.target.value;
      renderCompendiumOnly(pc, container);
    };
  }

  const categorySelect = container.querySelector('#compendiumFeatCategory');
  if (categorySelect) {
    categorySelect.onchange = (e) => {
      featCategoryFilter = e.target.value;
      renderCompendiumOnly(pc, container);
    };
  }

  container.querySelectorAll('.active-feat-card').forEach(card => {
    card.onclick = () => {
      const featId = card.dataset.id;
      const option = card.dataset.option || '';
      const feat = CombatFeats.REGISTRY[featId];
      if (feat) {
        showFeatScrollDialog(feat, pc, true, option);
      }
    };
  });

  container.querySelectorAll('.comp-feat-row').forEach(row => {
    row.onclick = () => {
      const featId = row.dataset.id;
      const feat = CombatFeats.REGISTRY[featId];
      if (feat) {
        const isLearned = activeFeats.some(f => f.id === feat.id);
        const matchingInstance = activeFeats.find(f => f.id === feat.id);
        const option = matchingInstance ? matchingInstance.option : '';
        showFeatScrollDialog(feat, pc, isLearned, option);
      }
    };
  });
}

function renderCompendiumOnly(pc, container) {
  const activeFeats = Array.isArray(pc.feats) ? pc.feats : [];
  const hasFighter = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'fighter');
  const hasWizard  = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'wizard');
  const hasMonk    = Array.isArray(pc.classes) && pc.classes.some(c => c.classType === 'monk');

  const compendiumHtml = _renderCompendiumListHtml(pc, activeFeats, hasFighter, hasWizard, hasMonk);

  const listNode = container.querySelector('.compendium-feats-list');
  if (listNode) {
    listNode.innerHTML = compendiumHtml;

    listNode.querySelectorAll('.comp-feat-row').forEach(row => {
      row.onclick = () => {
        const featId = row.dataset.id;
        const feat   = CombatFeats.REGISTRY[featId];
        if (feat) {
          const isLearned       = activeFeats.some(f => f.id === feat.id);
          const matchingInstance = activeFeats.find(f => f.id === feat.id);
          const option          = matchingInstance ? matchingInstance.option : '';
          showFeatScrollDialog(feat, pc, isLearned, option);
        }
      };
    });
  }
}

