import { CombatState } from '../../../state.js';
import { uiRegistry } from '../../ui-shared.js';

/**
 * Renders the full Diablo-style Health Globe panel, including waves, text values, and the control pedestal.
 */
export function renderPCHealthGlobe(pc) {
  const container = document.getElementById('pcHealthGlobe');
  if (!container) return;

  const tempHPObj = pc.conditions.find(c => c.n === 'Temp-HP');
  const tempHP = tempHPObj ? (parseInt(tempHPObj.tmpVal) || 0) : 0;
  
  const baseMaxHP = Math.max(1, pc.maxHP - tempHP);
  const baseHP = Math.max(0, pc.hp - tempHP);
  
  const basePct = Math.max(0, Math.min(100, Math.floor((baseHP / baseMaxHP) * 100)));
  const tempPct = Math.max(0, Math.min(100, Math.floor((tempHP / baseMaxHP) * 100)));

  container.innerHTML = `
    <div class="phdr"><h2>ÔØñ´©Å Vitalit├ñt</h2></div>
    <div class="pbody" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
      
      <!-- Globe visual container -->
      <div class="globe-wrapper">
        <div class="globe-ring"></div>
        <div class="liquid-chamber">
          <!-- Glass reflection specular highlight layers -->
          <div class="globe-glass"></div>
          <div class="globe-highlight"></div>
          
          <!-- Base Red Liquid Level -->
          <div class="liquid-base" style="height: ${basePct}%;">
            <!-- Parallax SVG waves translating in opposite directions -->
            <svg class="wave-svg wave-front" viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M 0,10 C 25,3 75,17 100,10 C 125,3 175,17 200,10 L 200,20 L 0,20 Z" fill="#ff2222" />
            </svg>
            <svg class="wave-svg wave-back" viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M 0,10 C 25,3 75,17 100,10 C 125,3 175,17 200,10 L 200,20 L 0,20 Z" fill="#8b0000" opacity="0.65" />
            </svg>
          </div>
          
          <!-- Temp Blue Liquid Level -->
          <div class="liquid-temp" style="height: ${tempPct}%; bottom: ${basePct}%; display: ${tempHP > 0 ? 'block' : 'none'};">
            <!-- Parallax SVG waves translating in opposite directions (blue/cyan) -->
            <svg class="wave-svg wave-front" viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M 0,10 C 25,3 75,17 100,10 C 125,3 175,17 200,10 L 200,20 L 0,20 Z" fill="#00e0ff" />
            </svg>
            <svg class="wave-svg wave-back" viewBox="0 0 200 20" preserveAspectRatio="none">
              <path d="M 0,10 C 25,3 75,17 100,10 C 125,3 175,17 200,10 L 200,20 L 0,20 Z" fill="#1b3d82" opacity="0.65" />
            </svg>
          </div>

          <!-- Glass Inner Shadow / 3D shading ring overlay -->
          <div style="position: absolute; inset: 0; border-radius: 50%; box-shadow: inset 0 0 15px rgba(0,0,0,0.65); pointer-events: none; z-index: 7;"></div>
          
          <!-- Numerical HP Values overlay inside the orb -->
          <div class="globe-text">
            <span style="font-size: 7px; color: rgba(255,255,255,0.7); letter-spacing: 1px; font-weight: bold; margin-bottom: 2px;">TREFFERP.</span>
            <input type="number" value="${pc.hp}" class="globe-hp-cur" title="Aktuelle TP direkt editieren">
            <div class="globe-hp-divider"></div>
            <input type="number" value="${pc.maxHP}" class="globe-hp-max" title="Maximal-TP direkt editieren">
            
            <!-- Temp HP Badge overlay inside the Globe -->
            <div class="globe-temp-hp-badge" style="display: ${tempHP > 0 ? 'block' : 'none'};">
              +${tempHP} Temp
            </div>
          </div>
        </div>
      </div>
      
      <!-- Control pedestal deck underneath the Globe -->
      <div class="globe-control-deck">
        <div class="globe-control-row">
          <input class="globe-dmg-input" type="number" placeholder="Wert" onclick="event.stopPropagation()">
          <button class="globe-btn globe-btn-dmg" title="Schaden abziehen">- Schad.</button>
          <button class="globe-btn globe-btn-heal" title="Heilung anwenden">+ Heil.</button>
          <button class="globe-btn globe-btn-temp" title="Tempor├ñre TP hinzuf├╝gen">+ Temp</button>
        </div>
        
        <div class="globe-chk-row">
          <label style="display: flex; align-items: center; gap: 3px; cursor: pointer;">
            <input type="checkbox" class="globe-dmg-half" style="width: 10px; height: 10px; cursor: pointer; margin: 0;">
            <span>Halbiert (Reflex)</span>
          </label>
          <label style="display: flex; align-items: center; gap: 3px; cursor: pointer;">
            <input type="checkbox" class="globe-dmg-double" style="width: 10px; height: 10px; cursor: pointer; margin: 0;">
            <span>Doppelt (Krit)</span>
          </label>
        </div>

      </div>
      
    </div>
  `;

  // Bind input changes to state updates
  const hpCurInput = container.querySelector('.globe-hp-cur');
  const hpMaxInput = container.querySelector('.globe-hp-max');
  const dmgInput = container.querySelector('.globe-dmg-input');
  const halfChk = container.querySelector('.globe-dmg-half');
  const doubleChk = container.querySelector('.globe-dmg-double');

  hpCurInput.onchange = (e) => {
    CombatState.updatePCNumber('hp', e.target.value);
    uiRegistry.updatePCHPDisplay?.(pc); // Syncs other displays (e.g. PCHeader)
  };

  hpMaxInput.onchange = (e) => {
    CombatState.updatePCNumber('maxHP', e.target.value);
    uiRegistry.updatePCHPDisplay?.(pc);
  };

  // Bind button actions
  container.querySelector('.globe-btn-dmg').onclick = () => {
    let val = parseInt(dmgInput.value) || 0;
    if (val > 0) {
      if (halfChk?.checked) val = Math.floor(val / 2);
      if (doubleChk?.checked) val = val * 2;
      CombatState.applyDamage(pc.id, val, false);
      uiRegistry.updatePCHPDisplay?.(pc);
      dmgInput.value = '';
    }
  };

  container.querySelector('.globe-btn-heal').onclick = () => {
    let val = parseInt(dmgInput.value) || 0;
    if (val > 0) {
      if (halfChk?.checked) val = Math.floor(val / 2);
      if (doubleChk?.checked) val = val * 2;
      CombatState.applyDamage(pc.id, val, true);
      uiRegistry.updatePCHPDisplay?.(pc);
      dmgInput.value = '';
    }
  };

  container.querySelector('.globe-btn-temp').onclick = () => {
    let val = parseInt(dmgInput.value) || 0;
    if (val > 0) {
      if (halfChk?.checked) val = Math.floor(val / 2);
      if (doubleChk?.checked) val = val * 2;
      CombatState.applyTempHP(pc.id, val);
      uiRegistry.updatePCHPDisplay?.(pc);
      dmgInput.value = '';
    }
  };


}

/**
 * Performant targeted update of the globe's visual heights and inputs (prevents focus loss).
 */
export function updatePCHealthGlobeDisplay(pc) {
  const container = document.getElementById('pcHealthGlobe');
  if (!container) return;

  const tempHPObj = pc.conditions.find(c => c.n === 'Temp-HP');
  const tempHP = tempHPObj ? (parseInt(tempHPObj.tmpVal) || 0) : 0;
  
  const baseMaxHP = Math.max(1, pc.maxHP - tempHP);
  const baseHP = Math.max(0, pc.hp - tempHP);
  
  const basePct = Math.max(0, Math.min(100, Math.floor((baseHP / baseMaxHP) * 100)));
  const tempPct = Math.max(0, Math.min(100, Math.floor((tempHP / baseMaxHP) * 100)));

  // Update inputs if the user is not actively editing them
  const hpCurInput = container.querySelector('.globe-hp-cur');
  if (hpCurInput && document.activeElement !== hpCurInput) {
    hpCurInput.value = pc.hp;
  }
  
  const hpMaxInput = container.querySelector('.globe-hp-max');
  if (hpMaxInput && document.activeElement !== hpMaxInput) {
    hpMaxInput.value = pc.maxHP;
  }

  // Update liquid container heights and bottom coordinates
  const baseLiquid = container.querySelector('.liquid-base');
  if (baseLiquid) {
    baseLiquid.style.height = `${basePct}%`;
  }

  const tempLiquid = container.querySelector('.liquid-temp');
  if (tempLiquid) {
    tempLiquid.style.height = `${tempPct}%`;
    tempLiquid.style.bottom = `${basePct}%`;
    tempLiquid.style.display = tempHP > 0 ? 'block' : 'none';
  }

  // Update temp HP text badge
  const badge = container.querySelector('.globe-temp-hp-badge');
  if (badge) {
    badge.textContent = `+${tempHP} Temp`;
    badge.style.display = tempHP > 0 ? 'block' : 'none';
  }
}

// Register targeted update in public ui registry to resolve circular imports
uiRegistry.updatePCHealthGlobeDisplay = updatePCHealthGlobeDisplay;
