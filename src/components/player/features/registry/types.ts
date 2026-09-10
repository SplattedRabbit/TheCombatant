/**
 * @module    types
 * @summary   Type definitions for the Unified Feature Registry and Rules Inspector.
 */

export interface UnifiedFeature {
  id: string;
  name: string;
  source: string;
  sources?: string[];
  category: 'combat' | 'daily' | 'passive' | 'aura' | 'spell-like';
  typeLabel: string;
  summary: string;
  rawRules: string;
  actionType: 'Passive' | 'Free Action' | 'Swift Action' | 'Move Action' | 'Standard Action' | 'Full-Round Action' | 'Immediate Action' | 'Special';
  duration?: string;
  range?: string;
  saveThrow?: string;
  stackInfo?: string;
  interactive?: 'toggle' | 'counter' | 'none';
  dailyAbilityKey?: string;
}

export const FEATURE_CATEGORIES = ['combat', 'daily', 'passive', 'aura', 'spell-like'] as const;
