import React, { useState } from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus.ts';
import { showCustomAlert } from '@core/ui/components/dialogs.js';

export const SyncIndicator: React.FC = () => {
  const { status, adapterName, lastSyncedAt, error, flushPendingSaves } = useSyncStatus();
  const [isFlushing, setIsFlushing] = useState(false);

  const handleManualSync = async () => {
    try {
      if (adapterName === 'local') {
        if (typeof showCustomAlert === 'function') {
          showCustomAlert(
            'Local Storage Mode',
            'Your characters and encounters are saved safely in your local browser storage. To sync across multiple devices and access live DM campaigns, click "Sign In" with Google.'
          );
        }
        return;
      }

      setIsFlushing(true);
      await flushPendingSaves();
      if (typeof showCustomAlert === 'function') {
        showCustomAlert(
          'Cloud Synchronization',
          'Cloud sync completed successfully. All active character changes are backed up.'
        );
      }
    } catch (err: any) {
      console.error('[SyncIndicator] Manual sync failed:', err);
      if (typeof showCustomAlert === 'function') {
        showCustomAlert(
          'Sync Error',
          `Could not synchronize with cloud: ${err?.message || 'Network error'}. Local cache is still active.`
        );
      }
    } finally {
      setTimeout(() => setIsFlushing(false), 500);
    }
  };

  // Format last sync time string
  const formatTime = (d: Date | null) => {
    if (!d) return null;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const timeStr = formatTime(lastSyncedAt);

  // Configuration based on adapter and status
  let icon = '☁️';
  let label = 'Cloud';
  let title = 'Cloud synchronization active. Click for details.';

  if (adapterName === 'local') {
    icon = '💾';
    label = 'Local';
    title = 'Local Guest Mode: Data stored in browser. Click for info.';
  } else if (status === 'saving' || isFlushing) {
    icon = '🔄';
    label = 'Saving...';
    title = 'Saving changes to cloud...';
  } else if (status === 'saved') {
    icon = '✓';
    label = 'Saved';
    title = timeStr ? `Saved to cloud (${timeStr}). Click to force sync.` : 'Saved to cloud. Click to force sync.';
  } else if (status === 'error') {
    icon = '⚠️';
    label = 'Offline';
    title = error ? `Sync Error: ${error.message}. Local cache active.` : 'Sync Error: Local cache active.';
  }

  return (
    <button
      type="button"
      onClick={handleManualSync}
      className="hdr-action-btn"
      title={title}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          fontSize: status === 'saved' ? '11px' : '10px',
          animation: status === 'saving' || isFlushing ? 'spin 1s linear infinite' : 'none',
        }}
      >
        {icon}
      </span>
      <span>{label}</span>
      {timeStr && status === 'saved' && (
        <span style={{ fontSize: '9px', opacity: 0.75, fontWeight: 'normal', fontFamily: 'var(--font-body)' }}>
          {timeStr}
        </span>
      )}
    </button>
  );
};
