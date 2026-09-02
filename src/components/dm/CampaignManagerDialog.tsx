/**
 * @module    CampaignManagerDialog
 * @summary   Modal dialog for Dungeon Masters to manage multi-campaign rosters,
 *            create/duplicate/delete encounters, copy invite codes, and switch between campaigns.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { CampaignSummary } from '../../types/campaign.ts';
import { campaignService, generateInviteCode } from '../../services/campaign/CampaignService.ts';
import { showCustomAlert, showCustomConfirm } from '@core/ui/components/dialogs.js';
import { CampaignCard } from './campaign/CampaignCard.tsx';
import { CreateCampaignModal } from './campaign/CreateCampaignModal.tsx';

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
  const [initialCode, setInitialCode] = useState<string>('');
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
    } catch (err: any) {
      showCustomAlert("Duplicate Campaign", `Error duplicating campaign:<br/>${err?.message || err}`, "OK", "⚠️");
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDelete = (campId: string, campName: string) => {
    showCustomConfirm(
      "Delete Campaign",
      `Are you sure you want to permanently delete campaign <strong>"${campName}"</strong>?<br/>All encounter states and combatants will be removed.`,
      async () => {
        try {
          setIsActionInProgress(true);
          await campaignService.deleteCampaign(campId);
          await loadCampaigns();
        } catch (err: any) {
          showCustomAlert("Delete Campaign", `Error deleting campaign:<br/>${err?.message || err}`, "OK", "⚠️");
        } finally {
          setIsActionInProgress(false);
        }
      }
    );
  };

  const handleCreateNew = async (name: string, desc: string, code: string) => {
    try {
      setIsActionInProgress(true);
      const created = await campaignService.createCampaign({
        name,
        description: desc,
        inviteCode: code || undefined,
      });
      setShowCreateModal(false);
      await campaignService.switchActiveCampaign(created.id);
      onClose();
    } catch (err: any) {
      const msg = err?.message || err?.error_description || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error('[CampaignManagerDialog] Error creating campaign:', err);
      showCustomAlert(
        "Create Campaign",
        `Could not create campaign:<br/><br/><strong>${msg}</strong>`,
        "OK",
        "⚠️"
      );
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
                  fontFamily: 'var(--font-title)',
                  fontSize: '18px',
                  color: 'var(--red, #8b1a1a)',
                  lineHeight: 1.1,
                }}
              >
                DM Campaign Dashboard
              </h2>
              <div style={{ fontSize: '10.5px', color: 'var(--inkm, #665c49)', fontFamily: 'var(--font-body)' }}>
                {campaigns.length} {campaigns.length === 1 ? 'Campaign' : 'Campaigns'} managed
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              className="modal-input"
              placeholder="🔍 Search campaigns..."
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
            onClick={() => {
              setInitialCode(generateInviteCode());
              setShowCreateModal(true);
            }}
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
            <span>New Campaign</span>
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
              ⌛ Loading campaigns...
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
              <div style={{ fontFamily: 'var(--font-title)', fontSize: '15px', color: 'var(--red)' }}>
                No Campaigns Found
              </div>
              <div style={{ fontSize: '12px', color: 'var(--inkm)', marginTop: '4px' }}>
                Create your first D&amp;D campaign and invite your players!
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
              {filteredCampaigns.map((camp) => (
                <CampaignCard
                  key={camp.id}
                  camp={camp}
                  isActive={Boolean(camp.id === activeCampId || camp.isCurrentActive)}
                  isCopied={copiedCodeId === camp.id}
                  isActionInProgress={isActionInProgress}
                  onSelect={handleSelectCampaign}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onCopyCode={handleCopyCode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Campaign Sub-Modal */}
        <CreateCampaignModal
          show={showCreateModal}
          initialInviteCode={initialCode}
          isActionInProgress={isActionInProgress}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateNew}
        />
      </div>
    </div>
  );
};
