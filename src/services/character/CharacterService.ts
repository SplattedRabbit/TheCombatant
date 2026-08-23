/**
 * @module    CharacterService
 * @summary   Central service for player character roster management.
 *            Coordinates character listing, creation, duplication, deletion,
 *            1-click local import, and zero-loss character switching.
 */

import type { CharacterSummary, CharacterCreateInput, CharacterFilterOptions } from '../../types/character.ts';
import { storageService } from '../storage/StorageService.ts';
import { generateUUID } from '../../utils/uuid.ts';
// @ts-ignore
import { applyLoadedState } from '../../../js/state/StorageManager.js';
// @ts-ignore
import { createInitialState, createCombatant } from '../../../js/models/model-core.js';
// @ts-ignore
import { getState, StateEvents, getActivePC } from '../../../js/state/state-core.js';

export class CharacterService {
  private static instance: CharacterService | null = null;

  public static getInstance(): CharacterService {
    if (!CharacterService.instance) {
      CharacterService.instance = new CharacterService();
    }
    return CharacterService.instance;
  }

  /**
   * Returns list of all available characters from the active storage adapter.
   */
  public async listCharacters(filter?: CharacterFilterOptions): Promise<CharacterSummary[]> {
    const adapter = storageService.getAdapter();
    let characters: CharacterSummary[] = [];

    if (typeof adapter.listCharacters === 'function') {
      const res = adapter.listCharacters();
      characters = res instanceof Promise ? await res : res;
    }

    // Apply filtering & sorting
    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase().trim();
      characters = characters.filter((c) => c.name.toLowerCase().includes(q) || c.classSummary.toLowerCase().includes(q) || (c.race && c.race.toLowerCase().includes(q)));
    }

    if (filter?.sortBy) {
      const dir = filter.sortDirection === 'asc' ? 1 : -1;
      characters.sort((a, b) => {
        if (filter.sortBy === 'name') {
          return a.name.localeCompare(b.name) * dir;
        }
        if (filter.sortBy === 'level') {
          return (a.level - b.level) * dir;
        }
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
      });
    }

    return characters;
  }

  /**
   * Fetches full character data by ID.
   */
  public async getCharacter(characterId: string): Promise<any | null> {
    const adapter = storageService.getAdapter();
    if (typeof adapter.loadCharacter === 'function') {
      const res = adapter.loadCharacter(characterId);
      return res instanceof Promise ? await res : res;
    }
    return null;
  }

  /**
   * Creates a new character in the active storage adapter.
   */
  public async createCharacter(input: CharacterCreateInput): Promise<CharacterSummary> {
    const adapter = storageService.getAdapter();
    const charId = generateUUID();

    let stateData = input.initialData;
    if (!stateData) {
      const fresh = createInitialState();
      const newPC = createCombatant({
        id: 'pc-' + Date.now(),
        name: input.name || 'Held',
        race: input.race || 'human',
        type: 'p',
      });
      fresh.combatants = [newPC];
      stateData = fresh;
    }

    if (typeof adapter.saveCharacter === 'function') {
      const res = adapter.saveCharacter(charId, stateData);
      if (res instanceof Promise) await res;
    }

    const summary: CharacterSummary = {
      id: charId,
      userId: storageService.getCurrentUserId() || 'local-guest',
      name: input.name,
      race: input.race || 'human',
      classSummary: input.classSummary || '',
      level: input.level || 1,
      hp: { current: 10, max: 10 },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCurrentActive: false,
    };

    return summary;
  }

  /**
   * Duplicates an existing character with a new ID and '(Kopie)' suffix.
   */
  public async duplicateCharacter(characterId: string, newName?: string): Promise<CharacterSummary> {
    const existing = await this.getCharacter(characterId);
    if (!existing) {
      throw new Error(`Charakter ${characterId} nicht gefunden.`);
    }

    const cloned = JSON.parse(JSON.stringify(existing));
    const oldPC = (cloned.combatants || []).find((c: any) => c.type === 'p') || cloned;
    const targetName = newName || `${oldPC?.name || 'Held'} (Kopie)`;

    if (oldPC) {
      oldPC.id = 'pc-' + Date.now();
      oldPC.name = targetName;
    }

    return this.createCharacter({
      name: targetName,
      race: oldPC?.race,
      classSummary: oldPC?.classSummary || oldPC?.class_summary,
      level: oldPC?.level || 1,
      initialData: cloned,
    });
  }

  /**
   * Deletes a character by ID. If active, switches to fallback or creates default.
   */
  public async deleteCharacter(characterId: string): Promise<void> {
    const adapter = storageService.getAdapter();
    const currentActiveId = typeof adapter.getActiveCharacterId === 'function' ? adapter.getActiveCharacterId() : null;

    if (typeof adapter.deleteCharacter === 'function') {
      const res = adapter.deleteCharacter(characterId);
      if (res instanceof Promise) await res;
    }

    if (currentActiveId === characterId) {
      const remaining = await this.listCharacters();
      if (remaining.length > 0) {
        await this.switchActiveCharacter(remaining[0].id);
      } else {
        const fresh = await this.createCharacter({ name: 'Held' });
        await this.switchActiveCharacter(fresh.id);
      }
    }
  }

  /**
   * Imports the current local active character into the active cloud adapter.
   */
  public async importFromLocalStorage(): Promise<CharacterSummary | null> {
    try {
      // 1. Read raw local storage data
      let rawData: string | null = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        rawData = window.localStorage.getItem('dd_combatsheet_state');
      } else if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        rawData = (globalThis as any).localStorage.getItem('dd_combatsheet_state');
      }

      if (!rawData) return null;
      const parsed = JSON.parse(rawData);
      if (!parsed || !Array.isArray(parsed.combatants)) return null;

      const pc = parsed.combatants.find((c: any) => c.type === 'p') || {};
      const charName = pc.name || 'Importierter Held';

      // 2. Create as new character in active cloud adapter
      const created = await this.createCharacter({
        name: charName,
        race: pc.race || 'human',
        classSummary: pc.classSummary || pc.class_summary || '',
        level: typeof pc.level === 'number' ? pc.level : 1,
        initialData: parsed,
      });

      // 3. Switch to it
      await this.switchActiveCharacter(created.id);
      return created;
    } catch (err) {
      console.error('[CharacterService] Error importing from local storage:', err);
      return null;
    }
  }

  /**
   * Zero-Loss character switching:
   * Flushes current character saves -> loads target character -> updates adapter pointer -> hydriert state.
   */
  public async switchActiveCharacter(characterId: string): Promise<boolean> {
    try {
      const adapter = storageService.getAdapter();

      // 1. Flush any pending saves on current character
      await storageService.flushPendingSaves();

      // 2. Load target character data
      let targetData = await this.getCharacter(characterId);
      if (!targetData) {
        console.warn(`[CharacterService] Could not find data for character ${characterId}`);
        return false;
      }

      // 3. Update adapter pointer
      if (typeof adapter.setActiveCharacterId === 'function') {
        adapter.setActiveCharacterId(characterId);
      }

      // 4. Hydrate in-memory state
      applyLoadedState(targetData);

      // 5. Emit events to re-render UI
      const currentPC = getActivePC();
      StateEvents.emit('pc_changed', currentPC);
      StateEvents.emit('state_changed', getState());

      return true;
    } catch (err) {
      console.error(`[CharacterService] Failed to switch to character ${characterId}:`, err);
      return false;
    }
  }

  /**
   * Returns current active character ID.
   */
  public getActiveCharacterId(): string | null {
    const adapter = storageService.getAdapter();
    if (typeof adapter.getActiveCharacterId === 'function') {
      return adapter.getActiveCharacterId();
    }
    return null;
  }
}

export const characterService = CharacterService.getInstance();
