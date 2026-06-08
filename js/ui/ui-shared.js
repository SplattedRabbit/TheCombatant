/**
 * Shared UI Registry to solve circular dependencies in native ES modules.
 * This registry holds dynamic references to rendering pipelines and is populated by ui-core.js.
 */
export const uiRegistry = {
  renderAll: null,
  renderPlayerScreen: null,
  renderInitBar: null,
  renderConc: null
};
