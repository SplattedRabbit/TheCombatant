/**
 * @module    CharacterRosterDialog
 * @summary   Modal dialog for managing multi-character rosters (listing, creating, duplicating,
 *            deleting, importing, and instant zero-loss character switching).
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { CharacterSummary } from '../../types/character.ts';
import { characterService } from '../../services/character/CharacterService.ts';

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newCharName, setNewCharName] = useState<string>('');
  const [newCharClass, setNewCharClass] = useState<string>('Kämpfer');
  const [activeCharId, setActiveCharId] = useState<string | null>(null);

  const loadRoster = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await characterService.listCharacters();
      setCharacters(list);
      setActiveCharId(characterService.getActiveCharacterId());
    } catch (err) {
      console.error('[CharacterRosterDialog] Failed to load characters:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadRoster();
    }
  }, [isOpen, loadRoster]);

  if (!isOpen) return null;

  const filteredCharacters = characters.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.classSummary.toLowerCase().includes(q) ||
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
      await loadRoster();
    } catch (err) {
      alert('Fehler beim Duplizieren des Charakters: ' + String(err));
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDelete = async (charId: string, charName: string) => {
    const confirmed = window.confirm(`Möchtest du "${charName}" wirklich dauerhaft löschen?`);
    if (!confirmed) return;

    try {
      setIsActionInProgress(true);
      await characterService.deleteCharacter(charId);
      await loadRoster();
    } catch (err) {
      alert('Fehler beim Löschen des Charakters: ' + String(err));
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;

    try {
      setIsActionInProgress(true);
      const created = await characterService.createCharacter({
        name: newCharName.trim(),
        classSummary: newCharClass,
        level: 1,
      });
      setShowCreateModal(false);
      setNewCharName('');
      await characterService.switchActiveCharacter(created.id);
      onClose();
    } catch (err) {
      alert('Fehler beim Erstellen des Charakters: ' + String(err));
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleImportLocal = async () => {
    try {
      setIsActionInProgress(true);
      const imported = await characterService.importFromLocalStorage();
      if (imported) {
        await loadRoster();
        alert(`Held "${imported.name}" erfolgreich importiert!`);
      } else {
        alert('Keine gültigen lokalen Charakterdaten im Speicher gefunden.');
      }
    } finally {
      setIsActionInProgress(false);
    }
  };

  return (
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
                  fontFamily: "'IM Fell English SC', serif",
                  fontSize: '18px',
                  color: 'var(--red, #8b1a1a)',
                  lineHeight: 1.1,
                }}
              >
                Helden-Bibliothek
              </h2>
              <div style={{ fontSize: '10.5px', color: 'var(--inkm, #665c49)', fontFamily: "'Crimson Text', serif" }}>
                {characters.length} {characters.length === 1 ? 'Charakter' : 'Charaktere'} verfügbar
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="🔍 Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '4px 8px',
                fontSize: '11.5px',
                fontFamily: "'Crimson Text', serif",
                border: '1px solid var(--pb, #c8a96e)',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.8)',
                width: '140px',
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
              fontFamily: "'IM Fell English SC', serif",
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
              border: '1px solid #8b6914',
              color: '#ffffff',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            <span>➕</span>
            <span>Neuer Held</span>
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
                fontFamily: "'IM Fell English SC', serif",
                background: 'rgba(200, 169, 110, 0.2)',
                border: '1px solid var(--pb)',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              <span>🧙</span>
              <span>Mit Wizard erstellen</span>
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
              fontFamily: "'IM Fell English SC', serif",
              background: 'rgba(200, 169, 110, 0.1)',
              border: '1px solid var(--pb)',
              borderRadius: '3px',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
            title="Liest den aktuellen lokalen Charakter und sichert ihn als separaten Helden"
          >
            <span>📥</span>
            <span>Aus Lokalspeicher importieren</span>
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
              ⌛ Helden werden geladen...
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
              <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '15px', color: 'var(--red)' }}>
                Keine Helden gefunden
              </div>
              <div style={{ fontSize: '12px', color: 'var(--inkm)', marginTop: '4px' }}>
                Erstelle jetzt deinen ersten Charakter oder importiere einen bestehenden Helden!
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
              {filteredCharacters.map((char) => {
                const isActive = char.id === activeCharId || char.isCurrentActive;

                return (
                  <div
                    key={char.id}
                    style={{
                      background: isActive ? 'linear-gradient(135deg, #fbf2db, #f7e8c3)' : '#ffffff',
                      border: isActive ? '1.5px solid #065f46' : '1px solid var(--pb, #c8a96e)',
                      borderRadius: '6px',
                      padding: '12px',
                      boxShadow: isActive ? '0 3px 10px rgba(6, 95, 70, 0.15)' : '0 2px 5px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                      position: 'relative',
                    }}
                  >
                    {/* Active Badge */}
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: '#065f46',
                          color: '#ffffff',
                          fontSize: '8.5px',
                          fontFamily: "'IM Fell English SC', serif",
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                        }}
                      >
                        ⭐ Aktiv
                      </div>
                    )}

                    <div>
                      {/* Name & Race */}
                      <div
                        style={{
                          fontFamily: "'IM Fell English SC', serif",
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'var(--red, #8b1a1a)',
                          paddingRight: isActive ? '45px' : '0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={char.name}
                      >
                        {char.name}
                      </div>

                      {/* Class Summary & Level */}
                      <div
                        style={{
                          fontSize: '11px',
                          fontFamily: "'Crimson Text', serif",
                          color: 'var(--ink, #2c2214)',
                          marginTop: '2px',
                        }}
                      >
                        Stufe {char.level} {char.race ? `(${char.race})` : ''}
                      </div>

                      {char.classSummary && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: 'var(--inkm, #665c49)',
                            fontStyle: 'italic',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {char.classSummary}
                        </div>
                      )}

                      {/* HP Stats */}
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '10.5px',
                          color: '#854d0e',
                          fontWeight: 'bold',
                          fontFamily: "'Crimson Text', serif",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>❤️</span>
                        <span>
                          {char.hp.current} / {char.hp.max} HP
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        borderTop: '0.5px solid rgba(200, 169, 110, 0.4)',
                        paddingTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '4px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectCharacter(char.id)}
                        disabled={isActionInProgress || isActive}
                        className="btn btn-p"
                        style={{
                          flex: 1,
                          padding: '3px 6px',
                          fontSize: '10.5px',
                          fontFamily: "'IM Fell English SC', serif",
                          background: isActive ? '#065f46' : 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                          border: '1px solid #8b6914',
                          color: '#ffffff',
                          borderRadius: '3px',
                          cursor: isActive ? 'default' : 'pointer',
                          opacity: isActive ? 0.9 : 1,
                        }}
                      >
                        {isActive ? '✓ Ausgewählt' : '⚡ Laden'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(char.id)}
                        disabled={isActionInProgress}
                        className="btn"
                        style={{
                          padding: '3px 6px',
                          fontSize: '10px',
                          background: 'rgba(200, 169, 110, 0.2)',
                          border: '1px solid var(--pb)',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                        title="Charakter duplizieren"
                      >
                        📑
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(char.id, char.name)}
                        disabled={isActionInProgress}
                        className="btn"
                        style={{
                          padding: '3px 6px',
                          fontSize: '10px',
                          background: 'rgba(139, 26, 26, 0.1)',
                          borderColor: 'rgba(139, 26, 26, 0.3)',
                          color: 'var(--red)',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                        title="Charakter löschen"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Character Sub-Modal */}
        {showCreateModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <form
              onSubmit={handleCreateNew}
              style={{
                width: '320px',
                background: 'var(--parchment, #fdf6e2)',
                border: '2px solid var(--pb, #c8a96e)',
                borderRadius: '6px',
                padding: '16px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '15px', color: 'var(--red)', fontWeight: 'bold' }}>
                ➕ Neuer Held
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px' }}>
                  Heldenname:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="z.B. Valeros"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    fontSize: '12px',
                    border: '1px solid var(--pb)',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px' }}>
                  Startklasse:
                </label>
                <select
                  value={newCharClass}
                  onChange={(e) => setNewCharClass(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    fontSize: '12px',
                    border: '1px solid var(--pb)',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Kämpfer">Kämpfer</option>
                  <option value="Barbar">Barbar</option>
                  <option value="Kleriker">Kleriker</option>
                  <option value="Magier">Magier</option>
                  <option value="Schurke">Schurke</option>
                  <option value="Paladin">Paladin</option>
                  <option value="Waldläufer">Waldläufer</option>
                  <option value="Druide">Druide</option>
                  <option value="Barde">Barde</option>
                  <option value="Mönch">Mönch</option>
                  <option value="Hexenmeister">Hexenmeister</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn"
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={!newCharName.trim() || isActionInProgress}
                  className="btn btn-p"
                  style={{
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontFamily: "'IM Fell English SC', serif",
                    background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
                    border: '1px solid #8b6914',
                    color: '#ffffff',
                  }}
                >
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
