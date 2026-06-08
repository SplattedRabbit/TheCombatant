/**
 * D&D 3.5e System Reference Document (SRD) Spell Database & Active Buff Modifiers
 * All core spell data is legally open-source under the Open Game License (OGL).
 * Loaded dynamically from an externalized JSON file.
 */
export const CombatSpells = {
  REGISTRY: {},
  
  /**
   * Asynchronously loads the spell library from the static JSON file.
   */
  async loadSpells() {
    try {
      const response = await fetch('./data/spells_de.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Clear existing entries and merge new data to maintain identical object reference
      for (const key in CombatSpells.REGISTRY) {
        delete CombatSpells.REGISTRY[key];
      }
      Object.assign(CombatSpells.REGISTRY, data);
      
      console.log('Spell database loaded successfully:', Object.keys(CombatSpells.REGISTRY).length, 'spells.');
      return true;
    } catch (e) {
      console.error('Failed to load spells asynchronously:', e);
      return false;
    }
  }
};

export function getSpellSchoolCode(schoolStr, id, name) {
  if (!schoolStr) return null;
  const s = schoolStr.toLowerCase().trim();
  
  if (s.startsWith('abj') || s.startsWith('abbeschwörung') || s.startsWith('abbeschwoerung')) return 'abj';
  if (s.startsWith('conj') || s.startsWith('beschwörung') || s.startsWith('beschwoerung')) return 'con';
  if (s.startsWith('div') || s.startsWith('erkenntnis')) return 'div';
  if (s.startsWith('enc') || s.startsWith('verzauberung')) return 'enc';
  if (s.startsWith('evo') || s.startsWith('hervorrufung')) return 'evo';
  if (s.startsWith('ill') || s.startsWith('illusion')) return 'ill';
  if (s.startsWith('nec') || s.startsWith('nekromantie') || s.startsWith('nekro')) return 'nec';
  if (s.startsWith('tra') || s.startsWith('verwandlung')) return 'tra';

  if (s.includes('abj') || s.includes('schutz') || s.includes('abbeschw')) return 'abj';
  if (s.includes('conj') || s.includes('beschw')) return 'con';
  if (s.includes('div') || s.includes('erkennt')) return 'div';
  if (s.includes('ench') || s.includes('verzaub')) return 'enc';
  if (s.includes('evoc') || s.includes('hervor')) return 'evo';
  if (s.includes('illu')) return 'ill';
  if (s.includes('necr') || s.includes('nekro')) return 'nec';
  if (s.includes('trans') || s.includes('verwand')) return 'tra';

  if (s.includes('universal') || s.includes('universell')) return 'univ';

  // ID or name checks as fallback
  const lowerId = (id || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();
  if (lowerId.startsWith('enchantment') || lowerName.includes('enchantment') || lowerName.includes('verzauberung')) return 'enc';
  if (lowerId.startsWith('illusion') || lowerName.includes('illusion')) return 'ill';
  if (lowerId.startsWith('abjuration') || lowerName.includes('abjuration') || lowerName.includes('schutzmagie')) return 'abj';
  if (lowerId.startsWith('conjuration') || lowerName.includes('conjuration') || lowerName.includes('beschwörung')) return 'con';
  if (lowerId.startsWith('divination') || lowerName.includes('divination') || lowerName.includes('erkenntnis')) return 'div';
  if (lowerId.startsWith('evocation') || lowerName.includes('evocation') || lowerName.includes('hervorrufung')) return 'evo';
  if (lowerId.startsWith('necromancy') || lowerName.includes('necromancy') || lowerName.includes('nekromantie')) return 'nec';
  if (lowerId.startsWith('transmutation') || lowerName.includes('transmutation') || lowerName.includes('verwandlung')) return 'tra';

  return null;
}

export function getSchoolCodeFromInput(inputStr) {
  if (!inputStr) return null;
  return getSpellSchoolCode(inputStr);
}

export function getSchoolLabel(code) {
  const labels = {
    abj: 'Schutzmagie',
    con: 'Beschwörung',
    div: 'Erkenntnismagie',
    enc: 'Verzauberung',
    evo: 'Hervorrufung',
    ill: 'Illusion',
    nec: 'Nekromantie',
    tra: 'Verwandlung',
    univ: 'Allgemein'
  };
  return labels[code] || code;
}
