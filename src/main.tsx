/**
 * @module    main
 * @summary   React Entry Point — mountet die App-Komponente in #root.
 * @notHere   App-Logik → src/App.tsx | State-Bridge → src/hooks/useCombatState.ts
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App';

import { CombatEngineProvider } from './context/CombatEngineContext';
import { initReactDialogBridge } from './components/dialogs/ReactDialogBridge';
import { ErrorBoundary } from './components/ErrorBoundary';

// Initialize the React modal bridge for legacy calls
initReactDialogBridge();

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('[CombatApp] Root-Element #root nicht gefunden. Prüfe index.html.');
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <CombatEngineProvider>
        <App />
      </CombatEngineProvider>
    </ErrorBoundary>
  </StrictMode>,
);
