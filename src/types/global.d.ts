/**
 * CSS Module type declarations für TypeScript.
 * Erlaubt `import styles from '*.module.css'` ohne TS-Fehler.
 */
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

/**
 * CSS-Dateien als Side-Effect-Import deklarieren.
 * Erlaubt `import './styles/globals.css'` in main.tsx.
 */
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '@core/*';

