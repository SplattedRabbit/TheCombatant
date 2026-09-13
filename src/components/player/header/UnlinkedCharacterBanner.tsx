/**
 * @module    UnlinkedCharacterBanner
 * @summary   Notifies authenticated users when the active in-memory character is not yet
 *            bound to a Supabase cloud character ID, offering 1-click save to cloud or roster switch.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { characterService } from '../../../services/character/CharacterService';
import { CharacterRosterDialog } from '../CharacterRosterDialog';
import { StateEvents } from '@core/state/state-core.js';

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
      setActiveCharId(currentId);
      if (!currentId) {
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
      setActiveCharId(characterService.getActiveCharacterId());
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
              Lokaler Charakter aktiv
            </strong>
            <span style={{ color: 'var(--inkm)', marginLeft: '6px' }}>
              {cloudCharCount > 0
                ? `Du hast ${cloudCharCount} Charakter${cloudCharCount > 1 ? 'e' : ''} in der Cloud. Dieser Held ist noch nicht verknüpft.`
                : 'Dieser Charakter ist noch nicht in deiner Cloud gespeichert.'}
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
            title="Speichert diesen Charakter als neuen Eintrag in deiner Supabase-Cloud"
          >
            {isSaving ? 'Speichern...' : '💾 In Cloud sichern'}
          </button>
          {cloudCharCount > 0 && (
            <button
              type="button"
              className="btn btn-s"
              onClick={() => setIsRosterOpen(true)}
              style={{ fontSize: '10px', padding: '3px 10px', height: 'auto' }}
              title="Öffne das Roster um einen existierenden Cloud-Charakter zu laden"
            >
              📜 Roster öffnen
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
            title="Hinweis ausblenden"
          >
            ✕
          </button>
        </div>
      </div>

      <CharacterRosterDialog isOpen={isRosterOpen} onClose={() => setIsRosterOpen(false)} />
    </>
  );
};
