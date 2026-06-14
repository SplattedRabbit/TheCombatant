/**
 * @module    DMHeader
 * @summary   Verwaltet das Runden-Display und die Synchronisation der Begegnungs-Metadaten auf dem Spielleiter-Bildschirm.
 * @exports   renderDMHeader
 * @reads     state.round, state.meta
 * @stateOps  keine
 * @depends   keine
 * @notHere   Event-Bindings der Runden-Buttons → js/app.js | Rendern der Kämpfer-Tabellen → DMCombatantsTable.js
 */

/**
 * Renders the DM header elements (round counter and metadata fields)
 * @param {Object} state - The global combat state
 */
export function renderDMHeader(state) {
  const roundDisp = document.getElementById('roundDisp');
  if (roundDisp) {
    roundDisp.textContent = state.round;
  }
  
  // Sync DM meta fields with state
  const metaBegegnung = document.getElementById('metaBegegnung');
  if (metaBegegnung) {
    metaBegegnung.value = state.meta.begegnung || '';
  }
  const metaOrt = document.getElementById('metaOrt');
  if (metaOrt) {
    metaOrt.value = state.meta.ort || '';
  }
  const metaXpBudget = document.getElementById('metaXpBudget');
  if (metaXpBudget) {
    metaXpBudget.value = state.meta.xpBudget || '';
  }
  const metaXpVerteilt = document.getElementById('metaXpVerteilt');
  if (metaXpVerteilt) {
    metaXpVerteilt.value = state.meta.xpVerteilt || '';
  }
  const metaSitzung = document.getElementById('metaSitzung');
  if (metaSitzung) {
    metaSitzung.value = state.meta.sitzung || '';
  }
}
