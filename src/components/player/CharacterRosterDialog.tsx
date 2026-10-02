/**
 * @module    CharacterRosterDialog
 * @summary   Modal dialog for managing multi-character rosters (listing, creating, duplicating,
 *            deleting, importing, and instant zero-loss character switching).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { CharacterSummary } from '../../types/character.ts';
import { characterService } from '../../services/character/CharacterService.ts';
import { showCustomAlert, showCustomConfirm, showCustomPrompt } from '@core/ui/components/dialogs.js';
import { CombatState } from '@core/state.js';
import { CharacterCard } from './roster/CharacterCard.tsx';
import { CreateCharacterModal } from './roster/CreateCharacterModal.tsx';
import { RosterToolbar } from './roster/RosterToolbar.tsx';

interface CharacterRosterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWizard?: () => void;
}

export const CharacterRosterDialog: React.FC<CharacterRosterDialogProps> = ({
  isOpen,
  onClose,
  onOpenWizard,
}) => {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const loadCharacters = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await characterService.listCharacters();
      setCharacters(list);
      const activeId = characterService.getActiveCharacterId();
      setActiveCharId(activeId);
    } catch (err) {
      console.warn('[CharacterRosterDialog] Failed to load characters:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCharacters();
    }
  }, [isOpen, loadCharacters]);

  if (!isOpen) return null;

  const filteredCharacters = characters.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.classSummary && c.classSummary.toLowerCase().includes(q)) ||
      (c.race && c.race.toLowerCase().includes(q))
    );
  });

  const handleSelectCharacter = async (charId: string) => {
    try {
      setIsActionInProgress(true);
      const success = await characterService.switchActiveCharacter(charId);
      if (success) {
        setActiveCharId(charId);
        onClose();
      }
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDuplicate = async (charId: string) => {
    try {
      setIsActionInProgress(true);
      await characterService.duplicateCharacter(charId);
      await loadCharacters();
    } catch (err: any) {
      showCustomAlert("Duplicate Character", `Error duplicating character:<br/>${err?.message || err}`, "OK", "⚠️");
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDelete = (charId: string, charName: string) => {
    showCustomConfirm(
      "Delete Character",
      `Are you sure you want to permanently delete <strong>"${charName}"</strong>?`,
      async () => {
        try {
          setIsActionInProgress(true);
          await characterService.deleteCharacter(charId);
          await loadCharacters();
        } catch (err: any) {
          showCustomAlert("Delete Character", `Error deleting character:<br/>${err?.message || err}`, "OK", "⚠️");
        } finally {
          setIsActionInProgress(false);
        }
      }
    );
  };

  const handleCreateNew = async (name: string, startingClass: string, mode: 'wizard' | 'empty') => {
    if (mode === 'wizard') {
      setShowCreateModal(false);
      onClose();
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (name.trim()) {
          window.sessionStorage.setItem('dd_wizard_preset_name', name.trim());
        } else {
          window.sessionStorage.removeItem('dd_wizard_preset_name');
        }
      }
      if (typeof onOpenWizard === 'function') {
        onOpenWizard();
      } else {
        CombatState.setRole('wizard');
      }
      return;
    }

    try {
      setIsActionInProgress(true);
      const created = await characterService.createCharacter({
        name: name.trim() || 'Hero',
        classSummary: startingClass,
        level: 1,
      });
      setShowCreateModal(false);
      await characterService.switchActiveCharacter(created.id);
      onClose();
    } catch (err: any) {
      showCustomAlert("Create Character", `Error creating character:<br/>${err?.message || err}`, "OK", "⚠️");
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleImportLocal = async () => {
    try {
      setIsActionInProgress(true);
      const imported = await characterService.importFromLocalStorage();
      if (imported) {
        await loadCharacters();
        showCustomAlert("Import Character", `Character <strong>"${imported.name}"</strong> successfully imported!`, "Great", "✨");
      } else {
        showCustomAlert("Import Character", "No valid local character data found in browser storage.", "OK", "ℹ️");
      }
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleImportJsonClick = () => {
    const picker = document.getElementById('rosterImportFileInput') as HTMLInputElement | null;
    if (picker) picker.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const rawContent = evt.target?.result as string;
        let parsedInfo;
        try {
          parsedInfo = characterService.parseImportData(rawContent);
        } catch (parseErr: any) {
          showCustomAlert("Import Character", "Invalid file format: " + parseErr.message, "OK", "⚠️");
          return;
        }

        const existing = await characterService.findExistingCharacterByName(parsedInfo.originalName);

        const executeImport = async (chosenName: string) => {
          try {
            setIsActionInProgress(true);
            const imported = await characterService.importCharacterFromJson(rawContent, chosenName);
            await loadCharacters();
            showCustomConfirm(
              "Import Character",
              `Character <strong>"${imported.name}"</strong> was successfully added to your Roster!<br/><br/>Would you like to switch to this character now?`,
              async () => {
                const success = await characterService.switchActiveCharacter(imported.id);
                if (success) {
                  setActiveCharId(imported.id);
                  onClose();
                }
              },
              () => {
                // Stay on current character
              }
            );
          } catch (err: any) {
            showCustomAlert("Import Error", "Failed to import character: " + (err.message || err), "OK", "⚠️");
          } finally {
            setIsActionInProgress(false);
          }
        };

        if (existing) {
          showCustomPrompt(
            "Character Already Exists",
            `You already have a Character named <strong>"${parsedInfo.originalName}"</strong> in your Roster.<br/><br/>Would you like to rename the imported character?`,
            `${parsedInfo.originalName} (Copy)`,
            "Import",
            (enteredName: string) => {
              executeImport(enteredName || parsedInfo.originalName);
            }
          );
        } else {
          await executeImport(parsedInfo.originalName);
        }
      } catch (err: any) {
        showCustomAlert("Import Error", "Error reading file: " + err.message, "OK", "⚠️");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveActiveToRoster = async () => {
    try {
      setIsActionInProgress(true);
      const activePC = CombatState.getActivePC();
      if (!activePC) {
        showCustomAlert("Save Character", "No active character loaded to save.", "OK", "⚠️");
        return;
      }
      const saved = await characterService.saveCurrentPCToCloud();
      if (saved) {
        await loadCharacters();
        setActiveCharId(saved.id);
        showCustomAlert(
          "Character Saved",
          `Character <strong>"${saved.name}"</strong> successfully saved to your roster!`,
          "Great",
          "💾"
        );
      } else {
        showCustomAlert("Save Error", "Failed to save character to roster.", "OK", "⚠️");
      }
    } catch (err: any) {
      showCustomAlert("Save Error", `Error saving character: ${err?.message || err}`, "OK", "⚠️");
    } finally {
      setIsActionInProgress(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 10, 5, 0.75)',
        backdropFilter: 'blur(3px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          background: 'var(--parchment, #fdf6e2)',
          border: '2px solid var(--pb, #c8a96e)',
          borderRadius: '8px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Action Bar Toolbar */}
        <RosterToolbar
          characterCount={characters.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClose={onClose}
          onOpenCreateModal={() => setShowCreateModal(true)}
          onOpenWizard={onOpenWizard}
          onSaveActiveToRoster={handleSaveActiveToRoster}
          onImportJsonClick={handleImportJsonClick}
          onImportFileChange={handleImportFileChange}
          onImportLocal={handleImportLocal}
          isActionInProgress={isActionInProgress}
        />

        {/* Content Body: Character Grid */}
        <div
          style={{
            padding: '16px 18px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--inkm)', fontStyle: 'italic' }}>
              ⌛ Loading characters...
            </div>
          ) : filteredCharacters.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1px dashed var(--pb)',
                borderRadius: '6px',
                background: 'rgba(200, 169, 110, 0.05)',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '15px', color: 'var(--red)' }}>
                No Characters Found
              </div>
              <div style={{ fontSize: '12px', color: 'var(--inkm)', marginTop: '4px' }}>
                Create your first character or import an existing one!
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: '12px',
              }}
            >
              {filteredCharacters.map((char) => (
                <CharacterCard
                  key={char.id}
                  char={char}
                  isActive={Boolean(char.id === activeCharId || char.isCurrentActive)}
                  isActionInProgress={isActionInProgress}
                  onSelect={handleSelectCharacter}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Character Sub-Modal */}
        <CreateCharacterModal
          show={showCreateModal}
          isActionInProgress={isActionInProgress}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNew}
        />
      </div>
    </div>,
    document.body
  );
};
