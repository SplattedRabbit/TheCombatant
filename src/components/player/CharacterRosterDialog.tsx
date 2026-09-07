/**
 * @module    CharacterRosterDialog
 * @summary   Modal dialog for managing multi-character rosters (listing, creating, duplicating,
 *            deleting, importing, and instant zero-loss character switching).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { CharacterSummary } from '../../types/character.ts';
import { characterService } from '../../services/character/CharacterService.ts';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';
import { CharacterCard } from './roster/CharacterCard.tsx';
import { CreateCharacterModal } from './roster/CreateCharacterModal.tsx';

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

  const handleCreateNew = async (name: string, startingClass: string) => {
    try {
      setIsActionInProgress(true);
      const created = await characterService.createCharacter({
        name,
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
        {/* Header */}
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1.5px solid var(--pb, #c8a96e)',
            background: 'linear-gradient(180deg, rgba(200, 169, 110, 0.25), rgba(200, 169, 110, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📜</span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-title)',
                  fontSize: '18px',
                  color: 'var(--red, #8b1a1a)',
                  lineHeight: 1.1,
                }}
              >
                Character Roster
              </h2>
              <div style={{ fontSize: '10.5px', color: 'var(--inkm, #665c49)', fontFamily: 'var(--font-body)' }}>
                {characters.length} {characters.length === 1 ? 'Character' : 'Characters'} available
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              className="modal-input"
              placeholder="🔍 Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '160px',
                minHeight: '26px',
                height: '26px',
                padding: '2px 8px',
                fontSize: '11.5px',
                background: 'rgba(255, 255, 255, 0.85)',
              }}
            />
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{
                padding: '3px 9px',
                fontSize: '14px',
                cursor: 'pointer',
                color: 'var(--ink, #2c2214)',
                border: '1px solid var(--pb)',
                background: 'transparent',
                borderRadius: '4px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div
          style={{
            padding: '8px 18px',
            borderBottom: '1px solid rgba(200, 169, 110, 0.4)',
            background: 'rgba(253, 246, 226, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-p"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
              border: '1px solid #8b6914',
              color: '#ffffff',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            <span>➕</span>
            <span>New Character</span>
          </button>

          {onOpenWizard && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWizard();
              }}
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontFamily: 'var(--font-title)',
                background: 'rgba(200, 169, 110, 0.2)',
                border: '1px solid var(--pb)',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              <span>🧙</span>
              <span>Create via Wizard</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleImportLocal}
            disabled={isActionInProgress}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'var(--font-title)',
              background: 'rgba(200, 169, 110, 0.1)',
              border: '1px solid var(--pb)',
              borderRadius: '3px',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
            title="Imports current local character into your cloud library"
          >
            <span>📥</span>
            <span>Import from LocalStorage</span>
          </button>
        </div>

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
