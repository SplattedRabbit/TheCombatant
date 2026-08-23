/**
 * @module    character
 * @summary   Type definitions and contracts for character summaries, metadata, and roster operations.
 */

export interface CharacterSummary {
  id: string;
  userId: string;
  name: string;
  race?: string;
  classSummary: string;
  level: number;
  hp: {
    current: number;
    max: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isCurrentActive?: boolean;
}

export interface CharacterCreateInput {
  name: string;
  race?: string;
  classSummary?: string;
  level?: number;
  initialData?: any;
}

export interface CharacterFilterOptions {
  searchQuery?: string;
  sortBy?: 'updated_at' | 'name' | 'level';
  sortDirection?: 'asc' | 'desc';
}
