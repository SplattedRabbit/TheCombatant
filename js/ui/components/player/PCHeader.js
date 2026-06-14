import { CombatState } from '../../../state.js';
import { CombatRules } from '../../../rules.js';
import { uiRegistry } from '../../ui-shared.js';
import { fillCls, hpPct, getAblMod } from './PCUtils.js';
import { showCustomAlert, showCustomConfirm } from '../dialogs.js';

export function renderPCHeader(pc, activeTab) {
  const header = document.getElementById('playerHeader');
  if (!header) return;

  const dexMod = getAblMod(pc.dex);
  const hasImprovedInit = Array.isArray(pc.feats) && pc.feats.some(f => f.id === 'improved_initiative');
  const totIni = dexMod + (parseInt(pc.iniMisc) || 0) + (hasImprovedInit ? 4 : 0);
  const finalIni = (pc.init || 0) > 0 ? (pc.init || 0) + totIni : '--';

  // Retrieve temporary HP from conditions array
  const tempHPObj = pc.conditions.find(c => c.n === 'Temp-HP');
  const tempHP = tempHPObj ? (parseInt(tempHPObj.tmpVal) || 0) : 0;
  
  // Calculate base values (without Temp HP addition)
  const baseMaxHP = Math.max(1, pc.maxHP - tempHP);
  const baseHP = Math.max(0, pc.hp - tempHP);
  
  // Calculate health bar fill percentages
  const basePct = Math.max(0, Math.min(100, Math.floor((baseHP / baseMaxHP) * 100)));
  const tempPct = Math.max(0, Math.min(100, Math.floor((tempHP / baseMaxHP) * 100)));
  
  const pct = hpPct(pc);
  const fc = fillCls(pct, pc.hp);

  header.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; width:100%;">
      <!-- Left: Character Name -->
      <div style="flex: 1; min-width: 200px;">
        <h1 style="font-family:'IM Fell English SC', serif; font-size:18px; color:var(--red); margin: 0; display: flex; align-items: center; gap: 4px;">
          Charakterbogen: 
          <input type="text" value="${pc.name}" class="pc-name-field" style="background:transparent; border:none; border-bottom:1px solid var(--pb); font-family:'IM Fell English SC', serif; font-size:18px; color:var(--red); outline:none; width:180px;">
        </h1>
      </div>
      
      <!-- Right: Premium Status & Combat Widget -->
      <div style="display:${activeTab === 'overview' ? 'none' : 'flex'}; align-items:center; gap:12px; background: rgba(200, 169, 110, 0.08); border: 0.5px solid var(--pb); border-radius: 4px; padding: 4px 10px 4px 6px; box-shadow: inset 0 0 10px rgba(200, 169, 110, 0.05);">
        <!-- Circular Gold Shield HP Emblem -->
        <div style="position: relative;">
          <div class="hp-emblem" style="position: relative; width: 56px; height: 56px; border-radius: 50%; background: radial-gradient(circle, #f4e8c1 0%, #c8a96e 70%, #9a7a2e 100%); border: 2px double var(--red); box-shadow: 0 3px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4); display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'IM Fell English SC', serif; color: var(--red); text-shadow: 0 0.5px 0.5px rgba(255,255,255,0.5);">
            <span style="font-size: 8px; font-weight: bold; line-height: 1; color: var(--inkl); margin-top: 2px; letter-spacing: 0.5px;">HP</span>
            <div style="display: flex; align-items: center; justify-content: center; height: 16px; margin: 1px 0;">
              <input type="number" value="${pc.hp}" class="pc-hp-cur-field" style="width: 25px; text-align: center; background: transparent; border: none; font-family: 'IM Fell English SC', serif; font-size: 15px; outline: none; font-weight: bold; color: var(--red); padding: 0;" title="Aktuelle TP direkt editieren">
            </div>
            <span style="height: 0.5px; background: var(--red); width: 34px; opacity: 0.5;"></span>
            <div style="display: flex; align-items: center; justify-content: center; height: 12px; margin-top: 1px;">
              <input type="number" value="${pc.maxHP}" class="pc-hp-max-field" style="width: 25px; text-align: center; background: transparent; border: none; font-family: 'Crimson Text', serif; font-size: 9.5px; outline: none; color: var(--inkl); padding: 0;" title="Maximal-TP direkt editieren">
            </div>
          </div>
          
          <!-- Temp HP Badge Overlay -->
          ${tempHP > 0 ? `
            <div class="temp-hp-badge" style="position: absolute; top: -3px; right: -3px; background: linear-gradient(135deg, #1e3c72, #2a5298); border: 0.8px solid #00c0ff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: #00c0ff; font-family: 'IM Fell English SC', serif; font-size: 8.5px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,192,255,0.45), inset 0 1px 2px rgba(255,255,255,0.2); z-index: 15;" title="Aktive temporäre TP">+${tempHP}</div>
          ` : ''}
        </div>
        
        <!-- Double-Layered Health Bar -->
        <div style="display:flex; flex-direction:column; gap:2.5px; width:120px;">
          <div style="font-size: 8px; font-weight: bold; color: var(--inkl); font-family: 'IM Fell English SC', serif; display: flex; justify-content: space-between; line-height: 1; letter-spacing: 0.2px;">
            <span>Gesundheit</span>
            <span>${pct}%</span>
          </div>
          
          <div class="hp-bar-wrap" style="height: 10px; background: rgba(0,0,0,0.2); border-radius: 2px; overflow: hidden; position: relative; border: 0.5px solid var(--pb); width: 100%; margin-bottom: 2px;">
            <!-- Base HP Fill (Green/Yellow/Red based on status) -->
            <div class="hp-bar-fill ${fc}" style="width: ${basePct}%; height: 100%; transition: width 0.25s;"></div>
            <!-- Temp HP Fill (Glowing Cyan/Blue) -->
            ${tempHP > 0 ? `
              <div style="position: absolute; top: 0; left: ${basePct}%; width: ${tempPct}%; height: 100%; background: linear-gradient(90deg, #1f3d7a, #00b8f0); box-shadow: 0 0 5px #00b8f0; transition: left 0.25s, width 0.25s; opacity: 0.85;"></div>
            ` : ''}
          </div>
          <div class="pc-header-init-display" style="font-size: 8px; font-weight: bold; color: var(--red); font-family: 'IM Fell English SC', serif; text-align: left; line-height: 1; letter-spacing: 0.2px;">
            Initiative: ${finalIni}
          </div>
        </div>
        
        <!-- Elegant dividing border line -->
        <span style="width: 0.5px; height: 44px; background: rgba(200, 169, 110, 0.3);"></span>
        
        <!-- Combat Damage/Healing Controller Widget -->
        <div style="display: flex; flex-direction: column; gap: 4px; min-width: 145px;">
          <div style="display: flex; align-items: center; gap: 3px;">
            <input class="small-in pc-dmg-input" type="number" placeholder="Wert" style="width: 38px; height: 22px; text-align: center; border-radius: 2px; border: 0.5px solid var(--pb); font-family: 'Crimson Text', serif; font-size: 11px; outline: none; background: rgba(255,255,255,0.6);" onclick="event.stopPropagation()">
            
            <button class="xbtn xbtn-dmg pc-dmg-btn" style="height: 22px; padding: 0 6px; font-size: 8px; font-weight: bold; line-height: 20px; font-family: 'IM Fell English SC', serif; margin: 0;" title="Schaden abziehen">- Schad.</button>
            <button class="xbtn xbtn-heal pc-heal-btn" style="height: 22px; padding: 0 6px; font-size: 8px; font-weight: bold; line-height: 20px; font-family: 'IM Fell English SC', serif; margin: 0;" title="Heilung anwenden">+ Heil.</button>
            <button class="xbtn xbtn-temp-hp pc-temp-hp-btn" style="height: 22px; padding: 0 5px; font-size: 8px; font-weight: bold; line-height: 20px; font-family: 'IM Fell English SC', serif; background: rgba(42,74,138,0.06); border-color: #2a4a8a; color: #1a2a6a; margin: 0;" title="Temporäre TP hinzufügen">+ Temp</button>
          </div>
          
          <div style="display: flex; gap: 8px; font-size: 7.5px; color: var(--inkl); font-weight: 600; padding-left: 2px;">
            <label style="display: flex; align-items: center; gap: 3px; cursor: pointer; user-select: none;">
              <input type="checkbox" class="pc-dmg-half" style="width: 10px; height: 10px; cursor: pointer; margin: 0;">
              <span>Halbiert (Reflex)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 3px; cursor: pointer; user-select: none;">
              <input type="checkbox" class="pc-dmg-double" style="width: 10px; height: 10px; cursor: pointer; margin: 0;">
              <span>Doppelt (Krit)</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind header name input changes
  header.querySelector('.pc-name-field').onchange = (e) => {
    CombatState.updatePCField('name', e.target.value);
  };
  header.querySelector('.pc-hp-cur-field').onchange = (e) => {
    CombatState.updatePCNumber('hp', e.target.value);
    updatePCHPDisplay(pc);
  };
  header.querySelector('.pc-hp-max-field').onchange = (e) => {
    CombatState.updatePCNumber('maxHP', e.target.value);
    updatePCHPDisplay(pc);
  };

  // Damage, Healing, and Temp HP application
  const dmgInp = header.querySelector('.pc-dmg-input');
  const halfChk = header.querySelector('.pc-dmg-half');
  const doubleChk = header.querySelector('.pc-dmg-double');

  header.querySelector('.pc-dmg-btn').onclick = () => {
    let val = parseInt(dmgInp.value) || 0;
    if (val > 0) {
      if (halfChk?.checked) val = Math.floor(val / 2);
      if (doubleChk?.checked) val = val * 2;
      CombatState.applyDamage(pc.id, val, false);
      updatePCHPDisplay(pc);
      if (dmgInp) dmgInp.value = '';
    }
  };

  header.querySelector('.pc-heal-btn').onclick = () => {
    let val = parseInt(dmgInp.value) || 0;
    if (val > 0) {
      if (halfChk?.checked) val = Math.floor(val / 2);
      if (doubleChk?.checked) val = val * 2;
      CombatState.applyDamage(pc.id, val, true);
      updatePCHPDisplay(pc);
      if (dmgInp) dmgInp.value = '';
    }
  };

  header.querySelector('.pc-temp-hp-btn').onclick = () => {
    let val = parseInt(dmgInp.value) || 0;
    if (val > 0) {
      if (halfChk?.checked) val = Math.floor(val / 2);
      if (doubleChk?.checked) val = val * 2;
      CombatState.applyTempHP(pc.id, val);
      updatePCHPDisplay(pc);
      if (dmgInp) dmgInp.value = '';
    }
  };

}

export function triggerYouDiedOverlay(pc) {
  if (document.getElementById('you-died-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'you-died-overlay';
  overlay.style = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0, 0, 0, 0.85); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; opacity:0; transition:opacity 1.5s ease-in-out; pointer-events:all;';
  
  overlay.innerHTML = `
    <div style="text-align:center; transform:scale(0.9); transition:transform 3s ease-out; display:flex; flex-direction:column; align-items:center;" id="you-died-content">
      <h1 style="font-family:'IM Fell English SC', 'Times New Roman', serif; font-size:52px; color:#8b1a1a; text-shadow:0 0 15px rgba(139, 26, 26, 0.6), 0 0 35px rgba(0,0,0,0.9); letter-spacing:10px; margin:0 0 25px 0; font-weight:500; text-transform:uppercase; animation:fadeLetter 3s forwards;">YOU DIED</h1>
      <button id="you-died-btn" style="background:transparent; border:1px solid rgba(200, 169, 110, 0.4); color:#c8a96e; font-family:'IM Fell English SC', serif; font-size:12px; letter-spacing:2px; padding:8px 24px; cursor:pointer; outline:none; border-radius:2px; transition:all 0.3s; opacity:0; animation:fadeInButton 2s 1.5s forwards;">Ich weiß...</button>
    </div>
    
    <style>
      @keyframes fadeLetter {
        from { letter-spacing: 3px; opacity: 0; }
        to { letter-spacing: 10px; opacity: 1; }
      }
      @keyframes fadeInButton {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      #you-died-btn:hover {
        background: rgba(200, 169, 110, 0.1);
        border-color: #c8a96e;
        box-shadow: 0 0 8px rgba(200, 169, 110, 0.3);
      }
    </style>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = '1';
    const content = document.getElementById('you-died-content');
    if (content) content.style.transform = 'scale(1.05)';
  }, 50);

  overlay.querySelector('#you-died-btn').onclick = () => {
    overlay.style.transition = 'opacity 0.8s ease-in-out';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 800);
  };
}

export function updatePCHPDisplay(pc) {
  const hpCur = document.querySelector('.pc-hp-cur-field');
  const hpMax = document.querySelector('.pc-hp-max-field');
  if (hpCur) hpCur.value = pc.hp;
  if (hpMax) hpMax.value = pc.maxHP;
  
  // Retrieve temporary HP from conditions array
  const tempHPObj = pc.conditions.find(c => c.n === 'Temp-HP');
  const tempHP = tempHPObj ? (parseInt(tempHPObj.tmpVal) || 0) : 0;
  
  // 1. Update circular HP shield badge
  const badge = document.querySelector('.temp-hp-badge');
  if (tempHP > 0) {
    if (badge) {
      badge.textContent = `+${tempHP}`;
    } else {
      const hpEmblem = document.querySelector('.hp-emblem');
      if (hpEmblem && hpEmblem.parentElement) {
        const newBadge = document.createElement('div');
        newBadge.className = 'temp-hp-badge';
        newBadge.style = 'position: absolute; top: -3px; right: -3px; background: linear-gradient(135deg, #1e3c72, #2a5298); border: 0.8px solid #00c0ff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: #00c0ff; font-family: \'IM Fell English SC\', serif; font-size: 8.5px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,192,255,0.45), inset 0 1px 2px rgba(255,255,255,0.2); z-index: 15;';
        newBadge.title = 'Aktive temporäre TP';
        newBadge.textContent = `+${tempHP}`;
        hpEmblem.parentElement.appendChild(newBadge);
      }
    }
  } else if (badge) {
    badge.remove();
  }

  // 2. Update health bar
  const baseMaxHP = Math.max(1, pc.maxHP - tempHP);
  const baseHP = Math.max(0, pc.hp - tempHP);
  const basePct = Math.max(0, Math.min(100, Math.floor((baseHP / baseMaxHP) * 100)));
  const tempPct = Math.max(0, Math.min(100, Math.floor((tempHP / baseMaxHP) * 100)));
  const pct = hpPct(pc);
  
  const pctLabel = document.querySelector('.hp-bar-wrap')?.previousElementSibling?.lastElementChild;
  if (pctLabel) pctLabel.textContent = `${pct}%`;

  const baseBar = document.querySelector('.hp-bar-fill');
  if (baseBar) {
    baseBar.style.width = `${basePct}%`;
    baseBar.className = `hp-bar-fill ${fillCls(pct, pc.hp)}`;
  }

  // Update temp HP fill
  const barWrap = document.querySelector('.hp-bar-wrap');
  if (barWrap) {
    let tempFill = barWrap.querySelector('.temp-hp-fill-bar');
    if (tempHP > 0) {
      if (tempFill) {
        tempFill.style.left = `${basePct}%`;
        tempFill.style.width = `${tempPct}%`;
      } else {
        const newFill = document.createElement('div');
        newFill.className = 'temp-hp-fill-bar';
        newFill.style = `position: absolute; top: 0; left: ${basePct}%; width: ${tempPct}%; height: 100%; background: linear-gradient(90deg, #1f3d7a, #00b8f0); box-shadow: 0 0 5px #00b8f0; transition: left 0.25s, width 0.25s; opacity: 0.85;`;
        barWrap.appendChild(newFill);
      }
    } else if (tempFill) {
      tempFill.remove();
    }
  }



  // 4. Update the Diablo health globe (if active)
  uiRegistry.updatePCHealthGlobeDisplay?.(pc);

  // 5. Check You Died animation
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

// Register targeted update in public ui registry to resolve circular imports
uiRegistry.updatePCHPDisplay = updatePCHPDisplay;
