/**
 * @module    combat
 * @summary   TypeScript Domain-Interfaces für die D&D 3.5e CombatApp.
 *            Beschreibt die Datenformen der bestehenden Vanilla-Engine (js/models/, js/state/)
 *            ohne den Original-Code zu verändern.
 * @notHere   Berechnungslogik → js/rules/ | Mutationen → js/state/ | UI → src/components/
 */

// ---------------------------------------------------------------------------
// Grundlegende Attribut-Datenstrukturen
// ---------------------------------------------------------------------------

export interface StatBlock {
  base: number;
  bonus: number;
  total: number;
  mod: number;
  modifiers?: Array<{ source: string; value: number; type: string; isRace?: boolean }>;
}

export interface SavingThrow {
  base: number;
  misc: number;
  total: number;
}

export interface SavingThrows {
  fortitude: SavingThrow;
  reflex: SavingThrow;
  will: SavingThrow;
}

// ---------------------------------------------------------------------------
// Waffen & Ausrüstung
// ---------------------------------------------------------------------------

export interface Weapon {
  id: string;
  name: string;
  damage: string;
  critRange: number;
  critMult: number;
  type: string;
  equipped: boolean;
  isNatural?: boolean;
  extraDamageDice?: number;
  extraDamageType?: string;
}

export interface Armor {
  id: string;
  name: string;
  acBonus: number;
  equipped: boolean;
  typeKey: string;
}

export interface Item {
  id: string;
  name: string;
  slot: string;
  equipped: boolean;
  effects: ItemEffect[];
}

export interface ItemEffect {
  stat: string;
  value: number;
  type: string;
}

// ---------------------------------------------------------------------------
// Talente & Klassen
// ---------------------------------------------------------------------------

export interface Feat {
  id: string;
  name: string;
  option?: string;
}

export interface CharClass {
  classType: string;
  level: number;
}

// ---------------------------------------------------------------------------
// Zaubersystem
// ---------------------------------------------------------------------------

export interface SpellSlots {
  max: number[];
  used: number[];
}

export interface PreparedSpell {
  id: string;
  level: number;
  prepared: number;
  used: number;
}

// ---------------------------------------------------------------------------
// Zustände & Buffs
// ---------------------------------------------------------------------------

export interface Concentration {
  spellId: string;
  spellName: string;
  duration: number;
  roundsLeft: number;
}

export interface ActiveBuff {
  id: string;
  name: string;
  effects: Array<{ target: string; value: number; type: string; source?: string }>;
  durationRemainingRounds?: number;
  isSuppressed?: boolean;
}

// ---------------------------------------------------------------------------
// Combatant (Kern-Datenstruktur)
// ---------------------------------------------------------------------------

export type CombatantType = 'p' | 'e' | 'a'; // player / enemy / ally

export interface Combatant {
  id: string;
  name: string;
  type: CombatantType;
  hp: number;
  maxHp: number;
  maxHP: number;
  tempHp: number;
  ac: number;
  initiative: number;
  initiativeRoll: number;
  conditions: string[];

  // Attribute
  str: StatBlock;
  dex: StatBlock;
  con: StatBlock;
  int: StatBlock;
  wis: StatBlock;
  cha: StatBlock;

  // Kampf-Werte
  bab: number;
  cmb: number;
  cmd: number;
  saves: SavingThrows;

  // Klasse & Stufe
  classes: CharClass[];
  totalLevel: number;
  race: string;
  size: string;
  activeShape: string;
  alignment?: string;

  // Ausrüstung
  weapons: Weapon[];
  armor: Armor[];
  items: Item[];

  // Talente
  feats: Feat[];

  // Zauber
  spellSlots: SpellSlots;
  preparedSpells: PreparedSpell[];

  // Begleiter-Verweis (für Companion-Inline-Darstellung im DM-Screen)
  companionOf?: string;

  // Milestone 3 Ergänzungen für Rettung, Verteidigung & Buffs
  activeBuffs?: ActiveBuff[];
  autoAC?: boolean;
  acTouch?: any;
  acFlat?: any;
  acNatural?: any;
  acDeflection?: any;
  acMisc?: number;
  sr?: any;
  dr?: string;
  reach?: string;
  immunities?: string;
  resistances?: string;
  bw?: any;
  iniMisc?: any;
  init?: any;
  za?: any;
  ref?: any;
  wil?: any;
  baseZa?: any;
  baseRef?: any;
  baseWil?: any;
  zaMisc?: any;
  refMisc?: any;
  wilMisc?: any;
  levelAdjustment?: number;
}

// ---------------------------------------------------------------------------
// Encounter-Meta & Session
// ---------------------------------------------------------------------------

export interface EncounterMeta {
  round: number;
  currentTurn: number;
  begegnung: string;
  ort: string;
  xpBudget: string;
  xpVerteilt: string;
  sitzung: string;
}

export interface SessionInfo {
  active: boolean;
  role: 'host' | 'player' | 'choice' | 'wizard';
  roomCode: string;
}

// ---------------------------------------------------------------------------
// Globaler State-Snapshot (was der useCombatState Hook bereitstellt)
// ---------------------------------------------------------------------------

export interface CombatStateSnapshot {
  combatants: Combatant[];
  meta: EncounterMeta;
  session: SessionInfo;
  concentrations?: any[];
}

// ---------------------------------------------------------------------------
// Hook Return Type
// ---------------------------------------------------------------------------

export interface UseCombatStateReturn {
  /** Aktueller, unveränderlicher State-Snapshot */
  state: CombatStateSnapshot;
  /** Gibt den aktiven Spieler-Combatant zurück (null wenn Rolle = host) */
  activePC: Combatant | null;
  /** Gibt an, ob die Combat-Engine geladen und bereit ist */
  isReady: boolean;
}
