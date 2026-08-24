/**
 * @module    core-modules.d.ts
 * @summary   Ambient TypeScript module declarations for @core/* and relative js/ imports.
 */

// ---------------------------------------------------------------------------
// @core/* module declarations
// ---------------------------------------------------------------------------

declare module '@core/state.js' {
  export const CombatState: any;
  export const StateEvents: any;
  export const CombatEngine: any;
  export const PCClasses: any;
  export const PCManager: any;
  export const DMState: any;
  export const SyncProtocol: any;
  export const StorageService: any;
  export const getState: () => any;
  export const getActivePC: () => any;
}

declare module '@core/state/state-core.js' {
  export const StateEvents: {
    listeners?: Record<string, any[]>;
    on: (event: string, cb: (...args: any[]) => void) => void;
    off: (event: string, cb: (...args: any[]) => void) => void;
    emit: (event: string, data?: any) => void;
    [key: string]: any;
  };
  export const CombatState: any;
  export const getState: () => any;
  export const getActivePC: () => any;
}

declare module '@core/state/pc/PCClasses.js' {
  export const PCClasses: any;
}

declare module '@core/state/PCManager.js' {
  export const PCManager: any;
}

declare module '@core/state/StorageManager.js' {
  export const StorageManager: any;
  export const applyLoadedState: (...args: any[]) => any;
  export const onStateSave: (cb: () => void) => void;
  export const saveToStorage: (...args: any[]) => any;
}

declare module '@core/state/EncounterManager.js' {
  export const EncounterManager: any;
  export const setEncounterField: (...args: any[]) => any;
  export const mergeIncomingPC: (...args: any[]) => any;
}

declare module '@core/models/model-core.js' {
  export const Combatant: any;
  export const PlayerCharacter: any;
  export const Monster: any;
  export const Stat: any;
  export const Weapon: any;
  export const Armor: any;
  export const Item: any;
  export const createInitialState: (...args: any[]) => any;
  export const createCombatant: (...args: any[]) => any;
}

declare module '@core/network/SyncProtocol.js' {
  export const SyncProtocol: any;
  export const MESSAGE_TYPES: Record<string, string>;
  export const applyIncomingDelta: (...args: any[]) => any;
  export const getEncounterStateDiff: (...args: any[]) => any;
  export const getPCStateDiff: (...args: any[]) => any;
  export let isProcessingNetworkIncoming: boolean;
}

declare module '@core/rules.js' {
  export const CombatRules: any;
  export const getAllCompendiumSpells: (...args: any[]) => any[];
  export const isSpellEligibleForPC: (...args: any[]) => boolean;
  export const getEligibleSpellLevelsForPC: (...args: any[]) => number[];
  export const checkPrerequisites: (...args: any[]) => any;
  export const validatePrestigeClassPrereqs: (...args: any[]) => any;
  export const isOnlySpecialTextUnmet: (validation: { success: boolean; metDetails: any[] }) => boolean;
  export const getPrestigeClassFeatures: (...args: any[]) => any;
  export const getPrestigeClassAblMod: (stat: any) => number;
  export const getSneakAttackDiceFromPrestigeClasses: (pc: any) => number;
  export const calculateEquippedItemEffects: (pc: any) => any;
  export const getItemStackingBreakdown: (pc: any) => any;
  export const getAvailableEquipmentBuffs: (pc: any) => any;
  export const calculateItemSetBonuses: (pc: any) => any;
  export const PRESTIGE_CLASSES_REGISTRY: Record<string, any>;
  export const AssassinRules: any;
  export const ArcaneTricksterRules: any;
  export const ShadowbaneInquisitorRules: any;
  export const BattleTricksterRules: any;
  export const SpellwarpSniperRules: any;
  export const EldritchKnightRules: any;
}

declare module '@core/rules/AttackEngine.js' {
  export const AttackEngine: {
    calculateAttackSequence: (pc: any, weapon: any, isFullAttack?: boolean, options?: any) => any[];
    rollAttack: (pc: any, weapon: any, options?: any) => any;
    rollDamage: (pc: any, weapon: any, options?: any) => any;
    [key: string]: any;
  };
}

declare module '@core/rules/SpellRules.js' {
  export const cleanProhibitedSpells: (pc: any) => string[];
  export const calculateSpellDC: (...args: any[]) => number;
  export const calculateCasterLevel: (...args: any[]) => number;
}

declare module '@core/rules/classValidation.js' {
  export const validatePrestigeClassPrereqs: (pc: any, classKey: string) => { success: boolean; metDetails: any[] };
  export const isOnlySpecialTextUnmet: (validation: { success: boolean; metDetails: any[] }) => boolean;
}

declare module '@core/rules/prestigeClassEngine.js' {
  export const getPrestigeClassFeatures: (pc: any, classKey: string) => Record<string, any>;
  export const getAblMod: (stat: any) => number;
  export const getSneakAttackDiceFromPrestigeClasses: (pc: any) => number;
}

declare module '@core/rules/CompanionRules.js' {
  export const CompanionRules: any;
}

declare module '@core/rules/FamiliarRules.js' {
  export const FamiliarRules: any;
}

declare module '@core/rules/RulesFeats.js' {
  export const checkPrerequisites: (feat: any, pc: any) => any;
  export const calculateMaxFeats: (...args: any[]) => any;
  export const validateFeatsAssignment: (...args: any[]) => any;
}

declare module '@core/rules/RulesData.js' {
  export const CONDITIONS: any[];
  export const CLASSES: any[];
  export const CLASS_SKILLS: Record<string, string[]>;
  export const CLASS_PROFILES: Record<string, any>;
  export const CLASS_BASE_SKILLS: Record<string, number>;
  export const WIZ_CLER_DRU_TABLE: any[];
  export const SORCERER_TABLE: any[];
  export const BARD_TABLE: any[];
  export const PALADIN_RANGER_TABLE: any[];
  export const SORCERER_KNOWN_TABLE: any[];
  export const BARD_KNOWN_TABLE: any[];
  export const ASSASSIN_TABLE: any[];
}

declare module '@core/spells.js' {
  export const CombatSpells: any;
  export const SpellsRegistry: Record<string, any>;
  export const getSchoolCodeFromInput: (input: string) => string;
  export const getSchoolLabel: (code: string) => string;
  export const getSpellById: (id: string) => any;
  export const getSpellSchoolCode: (...args: any[]) => string;
}

declare module '@core/data/skills-data.js' {
  export const SKILLS_REGISTRY: Record<string, any>;
}

declare module '@core/data/skillTricks-data.js' {
  export const SKILL_TRICKS_REGISTRY: Record<string, any>;
}

declare module '@core/data/feats-data.js' {
  export const CombatFeats: {
    REGISTRY: Record<string, any>;
    [key: string]: any;
  };
  export const checkFeatPrerequisites: (...args: any[]) => any;
}

declare module '@core/data/magicItems-data.js' {
  export const MAGIC_ITEMS_REGISTRY: Record<string, any>;
  export const ITEM_SLOTS: Record<string, any>;
  export const CONSOLIDATED_COMPENDIUM: any[];
}

declare module '@core/data/prestigeClasses-data.js' {
  export const PRESTIGE_CLASSES_REGISTRY: Record<string, any>;
}

declare module '@core/data/acfs-data.js' {
  export const ACFS_REGISTRY: Record<string, any>;
}

declare module '@core/models/Weapon.js' {
  export const WeaponRegistry: Record<string, any>;
  export const matchesFeatOption: (weapon: any, option?: string) => boolean;
  export const getCritThreatDisplay: (crit?: string, isDoubleThreat?: boolean) => string;
}

declare module '@core/models/helpers/skills/CombatantSkills.js' {
  export const calculateSkillModifier: (pc: any, skillKey: string) => number;
}

declare module '@core/models/helpers/skills/SkillFeatApplier.js' {
  export const applyFeatSkillBonuses: (pc: any, skillKey: string, skillDef?: any) => number;
}

declare module '@core/models/helpers/classes/DruidHelper.js' {
  export const SHAPE_ATTACKS: Record<string, any[]>;
}

declare module '@core/ui/components/dialogs.js' {
  export const showCustomAlert: (title: string, message: string, btnText?: string, icon?: string, ...rest: any[]) => void;
  export const showCustomConfirm: (title: string, message: string, onConfirm?: any, onCancel?: any, confirmText?: string, cancelText?: string, ...rest: any[]) => void;
  export const showCustomPrompt: (title: string, message: string, defaultValue?: any, onConfirm?: any, ...rest: any[]) => void;
  export const showRollBreakdown: (title: string, formula: string, breakdown: Array<{ label: string; value: number }>, eventOrEl?: any, ...rest: any[]) => void;
  export const showHealingRollDialog: (...args: any[]) => void;
  export const showItemDamageDialog: (...args: any[]) => void;
  export const showNewDayTemplateDialog: (...args: any[]) => void;
  export const showSampleChoiceDialog: (...args: any[]) => void;
  export const showFeatScrollDialog: (...args: any[]) => void;
  export const showAttackChoiceDialog: (...args: any[]) => void;
  export const showDamageChoiceDialog: (...args: any[]) => void;
  export const showPrepareSpellDialog: (...args: any[]) => void;
  export const showCastSpontaneousSpellDialog: (...args: any[]) => void;
  export const showSpellDetailsDialog: (...args: any[]) => void;
  export const showSpellCreatorWizard: (...args: any[]) => void;
}

// ---------------------------------------------------------------------------
// Relative module declarations for native Node.js ESM test execution
// ---------------------------------------------------------------------------

declare module '*js/state/StorageManager.js' {
  export const StorageManager: any;
  export const applyLoadedState: (...args: any[]) => any;
  export const onStateSave: (cb: () => void) => void;
  export const saveToStorage: (...args: any[]) => any;
}

declare module '*js/models/model-core.js' {
  export const Combatant: any;
  export const PlayerCharacter: any;
  export const Monster: any;
  export const createInitialState: (...args: any[]) => any;
  export const createCombatant: (...args: any[]) => any;
}

declare module '*js/state/state-core.js' {
  export const getState: () => any;
  export const getActivePC: () => any;
  export const StateEvents: any;
  export const CombatState: any;
}

declare module '*js/state/EncounterManager.js' {
  export const EncounterManager: any;
  export const mergeIncomingPC: (...args: any[]) => any;
  export const setEncounterField: (...args: any[]) => any;
}

declare module '*js/network/SyncProtocol.js' {
  export const SyncProtocol: any;
  export const MESSAGE_TYPES: Record<string, string>;
  export const applyIncomingDelta: (...args: any[]) => any;
  export const getEncounterStateDiff: (...args: any[]) => any;
  export const getPCStateDiff: (...args: any[]) => any;
  export let isProcessingNetworkIncoming: boolean;
}

declare module '*js/ui/components/dialogs.js' {
  export const showCustomAlert: (title: string, message: string, btnText?: string, icon?: string, ...rest: any[]) => void;
  export const showCustomConfirm: (title: string, message: string, onConfirm?: any, onCancel?: any, confirmText?: string, cancelText?: string, ...rest: any[]) => void;
  export const showCustomPrompt: (title: string, message: string, defaultValue?: any, onConfirm?: any, ...rest: any[]) => void;
  export const showRollBreakdown: (title: string, formula: string, breakdown: Array<{ label: string; value: number }>, eventOrEl?: any, ...rest: any[]) => void;
  export const showHealingRollDialog: (...args: any[]) => void;
  export const showItemDamageDialog: (...args: any[]) => void;
  export const showNewDayTemplateDialog: (...args: any[]) => void;
  export const showSampleChoiceDialog: (...args: any[]) => void;
  export const showFeatScrollDialog: (...args: any[]) => void;
  export const showAttackChoiceDialog: (...args: any[]) => void;
  export const showDamageChoiceDialog: (...args: any[]) => void;
  export const showPrepareSpellDialog: (...args: any[]) => void;
  export const showCastSpontaneousSpellDialog: (...args: any[]) => void;
  export const showSpellDetailsDialog: (...args: any[]) => void;
  export const showSpellCreatorWizard: (...args: any[]) => void;
}
