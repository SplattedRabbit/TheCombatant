/**
 * @module    logger
 * @summary   Strukturierter Logger für die CombatApp. Schaltet Debug- und Info-Logs
 *            im Produktiv-Build automatisch stumm und behält Fehler/Warnungen bei.
 */

const isDev = Boolean(
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')
);

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
