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

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('[CombatApp] Root-Element #root nicht gefunden. Prüfe index-react.html.');
}

createRoot(rootEl).render(
  <StrictMode>
    <CombatEngineProvider>
      <App />
    </CombatEngineProvider>
  </StrictMode>,
);
