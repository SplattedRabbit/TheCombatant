/**
 * @module    combat
 * @summary   TypeScript Domain-Interfaces für die D&D 3.5e CombatApp.
 *            Beschreibt die Datenformen der bestehenden Vanilla-Engine (js/models/, js/state/)
 *            ohne den Original-Code zu verändern.
 * @notHere   Berechnungslogik → js/rules/ | Mutationen → js/state/ | UI → src/components/
 */

// ---------------------------------------------------------------------------
// Grundlegende Attribut- und Stat-Datenstrukturen
// ---------------------------------------------------------------------------

export interface StatModifier {
  source: string;
  value: number;
  type: string;
  isRace?: boolean;
}

export interface StatBlock {
  base: number;
  bonus: number;
  total: number;
  mod: number;
  modifiers?: StatModifier[];
  getValue?: () => number;
}

export type StatValue = any;

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
// Fertigkeiten (Skills & Tricks)
// ---------------------------------------------------------------------------

export interface SkillEntry {
  ranks: number;
  misc: number;
}

export interface SkillDefinition {
  nameDe: string;
  nameEn?: string;
  abl: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  trainedOnly?: boolean;
  hasACP?: boolean;
}

export interface LearnedSkillTrick {
  id: string;
  isBonus?: boolean;
}

// ---------------------------------------------------------------------------
// Waffen & Ausrüstung
// ---------------------------------------------------------------------------

export interface Weapon {
  id?: string;
  name: string;
  damage?: string;
  damageDice?: string;
  crit?: string;
  critRange?: number;
  critMult?: number;
  type?: string;
  grip?: string;
  enhancement?: number;
  attackBonus?: number;
  equipped?: boolean;
  isEquipped?: boolean;
  isNatural?: boolean;
  isSecondary?: boolean;
  isKeen?: boolean;
  extraDamage?: string;
  extraDamageDice?: number;
  extraDamageType?: string;
  [key: string]: any;
}

export interface Armor {
  id?: string;
  name: string;
  armorBonus: number;
  enhancement?: number;
  checkPenalty?: number;
  checkPenaltyOverride?: number;
  equipped?: boolean;
  isEquipped?: boolean;
  typeKey?: string;
  isShield?: boolean;
  [key: string]: any;
}

export interface ItemEffect {
  stat?: string;
  target?: string;
  value: number | string;
  type?: string;
  source?: string;
}

export interface Item {
  id?: string;
  name: string;
  slot?: string;
  type?: string;
  equipped?: boolean;
  isEquipped?: boolean;
  description?: string;
  aura?: string;
  healingFormula?: string;
  damageFormula?: string;
  charges?: { current: number; max: number };
  dailyUses?: { current: number; max: number };
  activation?: {
    isUsable?: boolean;
    actionType?: string;
    effectDescription?: string;
    appliedBuffKey?: string;
  };
  effects?: ItemEffect[];
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// Talente, Klassen & Tägliche Fähigkeiten
// ---------------------------------------------------------------------------

export interface Feat {
  id: string;
  name?: string;
  option?: string;
}

export interface CharClass {
  classType: string;
  level: number;
}

export interface DailyAbility {
  name: string;
  max: number;
  used: number;
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
  initiativeRoll?: number;
  conditions: any[];

  // Attribute
  str: any;
  dex: any;
  con: any;
  int: any;
  wis: any;
  cha: any;

  // Kampf-Werte
  bab: number;
  cmb?: number;
  cmd?: number;
  saves?: SavingThrows;

  // Klasse & Stufe
  classes: CharClass[];
  totalLevel: number;
  race: string;
  size: string;
  activeShape: string;
  alignment?: string;
  favoredEnemy?: string;

  // Ausrüstung
  weapons: Weapon[];
  armor?: Armor[];
  armors?: Armor[];
  items: Item[];

  // Talente & ACFs
  feats: Feat[];
  acfs?: string[];
  skills?: Record<string, SkillEntry>;
  skillTricks?: Array<string | LearnedSkillTrick>;

  // Zauber
  spellSlots?: SpellSlots;
  preparedSpells?: PreparedSpell[];
  knownSpells?: any[];
  dailyAbilities?: DailyAbility[];

  // Prestige & ACFs State Flags
  selectedClassStrike?: string;
  wizardSpecialization?: string;
  wizardProhibited1?: string;
  wizardProhibited2?: string;
  prestigeSpellLinks?: Record<string, any>;
  prestigeSpecialTextConfirmed?: Record<string, boolean>;

  // Combat Toggles
  isTotalDefense?: boolean;
  isSmiteActive?: boolean;
  isFavoredEnemyActive?: boolean;
  isSneakAttacking?: boolean;
  isTrickyFightingActive?: boolean;

  // Begleiter-Verweis (für Companion-Inline-Darstellung im DM-Screen)
  companionOf?: string;

  // Verteidigung, Rettungswürfe & Boni
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
  rawInit?: any;
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

  // Methoden & zusätzliche Flags
  [key: string]: any;
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
  mode?: string;
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
