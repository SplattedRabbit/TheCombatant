// ═══════════════════════════════════════════════════════════════
//  D&D CombatApp — Zoom Diagnostics v1.0
//  Ausführen in: F12 → Console → Paste → Enter
//  Kopiere danach die Ausgabe und schick sie dem Entwickler.
// ═══════════════════════════════════════════════════════════════

(function runDiagnostics() {
  const appRoot = document.getElementById('appRoot');
  const cs = getComputedStyle(document.documentElement);
  const appRootCS = appRoot ? getComputedStyle(appRoot) : null;
  const rect = appRoot ? appRoot.getBoundingClientRect() : null;

  // --- 1. Umgebungs-Metriken ---
  const env = {
    devicePixelRatio:        window.devicePixelRatio,
    innerWidth:              window.innerWidth,
    innerHeight:             window.innerHeight,
    screenWidth:             window.screen.width,
    screenHeight:            window.screen.height,
    screenAvailWidth:        window.screen.availWidth,
  };

  // --- 2. CSS-Variable ---
  const cssVars = {
    '--app-scale (computed)':  cs.getPropertyValue('--app-scale').trim() || '(not set)',
    '--app-scale (inline)':    document.documentElement.style.getPropertyValue('--app-scale').trim() || '(not set as inline)',
  };

  // --- 3. #appRoot computed styles ---
  const rootStyles = appRootCS ? {
    'transform':             appRootCS.transform,
    'zoom':                  appRootCS.zoom,
    'width (computed)':      appRootCS.width,
    'transformOrigin':       appRootCS.transformOrigin,
  } : { error: '#appRoot nicht gefunden!' };

  // --- 4. Bounding-Rectangle (visuell, post-transform) ---
  const bounding = rect ? {
    'rect.left':   rect.left.toFixed(2),
    'rect.top':    rect.top.toFixed(2),
    'rect.width':  rect.width.toFixed(2),
    'rect.height': rect.height.toFixed(2),
    'rect.right':  rect.right.toFixed(2),
  } : { error: '#appRoot nicht gefunden!' };

  // --- 5. Zoom-Buttons vorhanden? ---
  const btnIn  = document.getElementById('btnZoomIn');
  const btnOut = document.getElementById('btnZoomOut');
  const label  = document.getElementById('zoomValue');
  const uiState = {
    'btnZoomIn gefunden':   !!btnIn,
    'btnZoomOut gefunden':  !!btnOut,
    'zoomValue label text': label ? label.textContent : '(nicht gefunden)',
    'localStorage zoom':    localStorage.getItem('combat_app_scale_factor') || '(nicht gesetzt)',
  };

  // --- 6. Click-Koordinaten-Test (temporärer Event-Listener) ---
  //  → Der nächste Klick irgendwo auf die Seite wird gemessen.
  //  → DANACH den Listener wieder entfernen.
  let clickTestActive = true;
  function onNextClick(e) {
    if (!clickTestActive) return;
    clickTestActive = false;
    document.removeEventListener('click', onNextClick, true);

    const target = e.target;
    const targetRect = target.getBoundingClientRect();

    console.group('%c[Diagnostics] CLICK-TEST ERGEBNIS', 'color:#00ccff; font-weight:bold; font-size:13px');
    console.log('Geklicktes Element:   ', target.tagName, target.id ? '#'+target.id : '', target.className ? '.'+[...target.classList].join('.') : '');
    console.log('e.clientX / e.clientY:', e.clientX.toFixed(1), '/', e.clientY.toFixed(1));
    console.log('e.pageX / e.pageY:    ', e.pageX.toFixed(1), '/', e.pageY.toFixed(1));
    console.log('Target rect.left:     ', targetRect.left.toFixed(1));
    console.log('Target rect.top:      ', targetRect.top.toFixed(1));
    console.log('Target rect.width:    ', targetRect.width.toFixed(1));
    console.log('Target rect.height:   ', targetRect.height.toFixed(1));
    console.log('Klick INNERHALB rect?:', (
      e.clientX >= targetRect.left && e.clientX <= targetRect.right &&
      e.clientY >= targetRect.top  && e.clientY <= targetRect.bottom
    ) ? '✅ JA' : '❌ NEIN — HIER IST DER BUG!');
    console.groupEnd();

    console.log('%c→ Kopiere jetzt alles hier oben und schick es dem Entwickler.', 'color:#ffaa00; font-style:italic');
  }
  document.addEventListener('click', onNextClick, true);

  // --- 7. Ausgabe ---
  console.group('%c════ D&D CombatApp Zoom Diagnostics ════', 'color:#c8a96e; font-weight:bold; font-size:14px');

  console.group('%c[1] Umgebung (DPI / Viewport)', 'color:#90ee90; font-weight:bold');
  console.table(env);
  console.groupEnd();

  console.group('%c[2] CSS-Variable --app-scale', 'color:#90ee90; font-weight:bold');
  console.table(cssVars);
  console.groupEnd();

  console.group('%c[3] #appRoot Computed Styles', 'color:#90ee90; font-weight:bold');
  console.table(rootStyles);
  console.groupEnd();

  console.group('%c[4] #appRoot Bounding Rectangle (post-transform)', 'color:#90ee90; font-weight:bold');
  console.table(bounding);
  const viewportW = window.innerWidth;
  if (rect) {
    const overflowRight = rect.right - viewportW;
    const overflowLeft  = rect.left;
    console.log(`   Viewport-Breite: ${viewportW}px`);
    console.log(`   Overflow links:  ${overflowLeft.toFixed(1)}px  (negativ = Inhalt off-screen links)`);
    console.log(`   Overflow rechts: ${overflowRight.toFixed(1)}px (positiv = Inhalt off-screen rechts)`);
  }
  console.groupEnd();

  console.group('%c[5] UI-Zustand (Zoom-Buttons / localStorage)', 'color:#90ee90; font-weight:bold');
  console.table(uiState);
  console.groupEnd();

  console.log('%c[6] CLICK-TEST: Klicke jetzt auf einen Button der nicht funktioniert!', 'color:#ff9900; font-weight:bold; font-size:13px');
  console.log('    (Der nächste Klick wird automatisch gemessen und hier ausgegeben.)');

  console.groupEnd();
})();
