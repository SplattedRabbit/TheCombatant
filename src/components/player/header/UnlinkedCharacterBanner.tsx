/**
 * @module    UnlinkedCharacterBanner
 * @summary   Notifies authenticated users when the active in-memory character is not yet
 *            bound to a Supabase cloud character ID, offering 1-click save to cloud or roster switch.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { characterService } from '../../../services/character/CharacterService';
import { CharacterRosterDialog } from '../CharacterRosterDialog';
import { StateEvents, getActivePC } from '@core/state/state-core.js';

export const UnlinkedCharacterBanner: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeCharId, setActiveCharId] = useState<string | null>(characterService.getActiveCharacterId());
  const [cloudCharCount, setCloudCharCount] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRosterOpen, setIsRosterOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let mounted = true;
    const checkStatus = async () => {
      const currentId = characterService.getActiveCharacterId();
      const currentPC = getActivePC();
      const isLinked = Boolean(currentId && currentPC && currentPC.id === currentId);
      setActiveCharId(isLinked ? currentId : null);
      if (!isLinked) {
        try {
          const list = await characterService.listCharacters();
          if (mounted) {
            setCloudCharCount(list.length);
          }
        } catch {
          // ignore
        }
      }
    };

    checkStatus();

    const onStateChanged = () => {
      const currentId = characterService.getActiveCharacterId();
      const currentPC = getActivePC();
      const isLinked = Boolean(currentId && currentPC && currentPC.id === currentId);
      setActiveCharId(isLinked ? currentId : null);
    };

    StateEvents.on('pc_changed', onStateChanged);
    StateEvents.on('state_changed', onStateChanged);

    return () => {
      mounted = false;
      StateEvents.off('pc_changed', onStateChanged);
      StateEvents.off('state_changed', onStateChanged);
    };
  }, [isAuthenticated, user]);

  if (!isAuthenticated || activeCharId || isDismissed) {
    return null;
  }

  const handleSaveToCloud = async () => {
    try {
      setIsSaving(true);
      const res = await characterService.saveCurrentPCToCloud();
      if (res?.id) {
        setActiveCharId(res.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(200, 169, 110, 0.18), rgba(139, 26, 26, 0.12))',
          border: '1px solid var(--pb)',
          borderRadius: '4px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
          marginBottom: '4px',
          fontSize: '11px',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>☁️</span>
          <div>
            <strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-title)', fontSize: '12px' }}>
              Local Character Active
            </strong>
            <span style={{ color: 'var(--inkm)', marginLeft: '6px' }}>
              {cloudCharCount > 0
                ? `You have ${cloudCharCount} character${cloudCharCount > 1 ? 's' : ''} in your cloud. This hero is not yet linked.`
                : 'This character is not yet saved to your cloud roster.'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-p"
            onClick={handleSaveToCloud}
            disabled={isSaving}
            style={{ fontSize: '10px', padding: '3px 10px', height: 'auto' }}
            title="Save this character to your cloud roster"
          >
            {isSaving ? 'Saving...' : '💾 Save to Cloud'}
          </button>
          {cloudCharCount > 0 && (
            <button
              type="button"
              className="btn btn-s"
              onClick={() => setIsRosterOpen(true)}
              style={{ fontSize: '10px', padding: '3px 10px', height: 'auto' }}
              title="Open roster to load an existing cloud character"
            >
              📜 Open Roster
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--inkm)',
              fontSize: '14px',
              padding: '2px 6px',
            }}
            title="Dismiss notice"
          >
            ✕
          </button>
        </div>
      </div>

      <CharacterRosterDialog isOpen={isRosterOpen} onClose={() => setIsRosterOpen(false)} />
    </>
  );
};
