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
import { AuthProvider } from './context/AuthContext';
import { DialogProvider } from './context/DialogContext';
import { ErrorBoundary } from './components/ErrorBoundary';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('[CombatApp] Root-Element #root nicht gefunden. Prüfe index.html.');
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <CombatEngineProvider>
          <DialogProvider>
            <App />
          </DialogProvider>
        </CombatEngineProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
