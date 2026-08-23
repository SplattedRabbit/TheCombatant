/**
 * @module    CampaignManagerDialog
 * @summary   Modal dialog for Dungeon Masters to manage multi-campaign rosters,
 *            create/duplicate/delete encounters, copy invite codes, and switch between campaigns.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { CampaignSummary } from '../../types/campaign.ts';
import { campaignService, generateInviteCode } from '../../services/campaign/CampaignService.ts';

interface CampaignManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignManagerDialog: React.FC<CampaignManagerDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newCampName, setNewCampName] = useState<string>('');
  const [newCampDesc, setNewCampDesc] = useState<string>('');
  const [newCampCode, setNewCampCode] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [activeCampId, setActiveCampId] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await campaignService.listCampaigns();
      setCampaigns(list);
      setActiveCampId(campaignService.getActiveCampaignId());
    } catch (err) {
      console.error('[CampaignManagerDialog] Failed to load campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadCampaigns();
    }
  }, [isOpen, loadCampaigns]);

  if (!isOpen) return null;

  const filteredCampaigns = campaigns.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      c.inviteCode.toLowerCase().includes(q) ||
      (c.location && c.location.toLowerCase().includes(q))
    );
  });

  const handleSelectCampaign = async (campId: string) => {
    try {
      setIsActionInProgress(true);
      const success = await campaignService.switchActiveCampaign(campId);
      if (success) {
        setActiveCampId(campId);
        onClose();
      }
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDuplicate = async (campId: string) => {
    try {
      setIsActionInProgress(true);
      await campaignService.duplicateCampaign(campId);
      await loadCampaigns();
    } catch (err) {
      alert('Fehler beim Duplizieren der Kampagne: ' + String(err));
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDelete = async (campId: string, campName: string) => {
    const confirmed = window.confirm(`Möchtest du die Kampagne "${campName}" wirklich löschen?`);
    if (!confirmed) return;

    try {
      setIsActionInProgress(true);
      await campaignService.deleteCampaign(campId);
      await loadCampaigns();
    } catch (err) {
      alert('Fehler beim Löschen der Kampagne: ' + String(err));
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;

    try {
      setIsActionInProgress(true);
      const created = await campaignService.createCampaign({
        name: newCampName.trim(),
        description: newCampDesc.trim(),
        inviteCode: newCampCode.trim() || undefined,
      });
      setShowCreateModal(false);
      setNewCampName('');
      setNewCampDesc('');
      setNewCampCode('');
      await campaignService.switchActiveCampaign(created.id);
      onClose();
    } catch (err) {
      alert('Fehler beim Erstellen der Kampagne: ' + String(err));
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    });
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
          maxWidth: '820px',
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
            <span style={{ fontSize: '20px' }}>🏰</span>
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
                DM Kampagnen-Dashboard
              </h2>
              <div style={{ fontSize: '10.5px', color: 'var(--inkm, #665c49)', fontFamily: "'Crimson Text', serif" }}>
                {campaigns.length} {campaigns.length === 1 ? 'Kampagne' : 'Kampagnen'} verwaltet
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
                width: '150px',
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
            onClick={() => {
              setNewCampCode(generateInviteCode());
              setShowCreateModal(true);
            }}
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
            <span>Neue Kampagne</span>
          </button>
        </div>

        {/* Content Body: Campaign Grid */}
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
              ⌛ Kampagnen werden geladen...
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1px dashed var(--pb)',
                borderRadius: '6px',
                background: 'rgba(200, 169, 110, 0.05)',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏰</div>
              <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '15px', color: 'var(--red)' }}>
                Keine Kampagnen gefunden
              </div>
              <div style={{ fontSize: '12px', color: 'var(--inkm)', marginTop: '4px' }}>
                Erstelle jetzt deine erste D&amp;D-Kampagne und lade deine Spieler ein!
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))',
                gap: '12px',
              }}
            >
              {filteredCampaigns.map((camp) => {
                const isActive = camp.id === activeCampId || camp.isCurrentActive;
                const isCopied = copiedCodeId === camp.id;

                return (
                  <div
                    key={camp.id}
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
                        ⭐ Aktive Runde
                      </div>
                    )}

                    <div>
                      {/* Campaign Name */}
                      <div
                        style={{
                          fontFamily: "'IM Fell English SC', serif",
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'var(--red, #8b1a1a)',
                          paddingRight: isActive ? '75px' : '0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={camp.name}
                      >
                        {camp.name}
                      </div>

                      {/* Description */}
                      {camp.description && (
                        <div
                          style={{
                            fontSize: '10.5px',
                            color: 'var(--inkm, #665c49)',
                            fontStyle: 'italic',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {camp.description}
                        </div>
                      )}

                      {/* Invite Code Pill */}
                      <div
                        style={{
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{ fontSize: '10px', color: 'var(--inkm)' }}>Code:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(camp.inviteCode, camp.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '1px 6px',
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            background: isCopied ? '#065f46' : 'rgba(200, 169, 110, 0.15)',
                            color: isCopied ? '#ffffff' : 'var(--red)',
                            border: '1px solid var(--pb)',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                          title="Einladungscode in Zwischenablage kopieren"
                        >
                          <span>{isCopied ? '✓' : '📋'}</span>
                          <span>{camp.inviteCode}</span>
                        </button>
                      </div>

                      {/* Encounter Stats */}
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '10.5px',
                          fontFamily: "'Crimson Text', serif",
                          color: 'var(--ink, #2c2214)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>⚔️ Runde {camp.round}</span>
                        <span>👾 {camp.combatantCount} Kämpfer</span>
                        {camp.location && <span>📍 {camp.location}</span>}
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
                        onClick={() => handleSelectCampaign(camp.id)}
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
                        {isActive ? '✓ Geladen' : '⚡ Öffnen'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(camp.id)}
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
                        title="Kampagne duplizieren"
                      >
                        📑
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(camp.id, camp.name)}
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
                        title="Kampagne löschen"
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

        {/* Create Campaign Sub-Modal */}
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
                width: '340px',
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
                ➕ Neue Kampagne erstellen
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px' }}>
                  Kampagnenname:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="z. B. Fluch des Strahd"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
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
                  Beschreibung / Notizen:
                </label>
                <textarea
                  rows={2}
                  placeholder="z. B. Mittwochsrunde, Level 3-7..."
                  value={newCampDesc}
                  onChange={(e) => setNewCampDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    fontSize: '11px',
                    border: '1px solid var(--pb)',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--inkm)', display: 'block', marginBottom: '3px' }}>
                  Einladungscode:
                </label>
                <input
                  type="text"
                  placeholder="z. B. STRAHD-42"
                  value={newCampCode}
                  onChange={(e) => setNewCampCode(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    border: '1px solid var(--pb)',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
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
                  disabled={!newCampName.trim() || isActionInProgress}
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
