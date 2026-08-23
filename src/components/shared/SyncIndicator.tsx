/**
 * @module    SyncIndicator
 * @summary   Visual storage sync status pill and manual flush trigger.
 *            Displays cloud sync status ('idle' | 'saving' | 'saved' | 'error')
 *            or local guest mode with animated feedback and tooltips.
 */

import React, { useState } from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus.ts';

export const SyncIndicator: React.FC = () => {
  const { status, adapterName, lastSyncedAt, error, flushPendingSaves } = useSyncStatus();
  const [isFlushing, setIsFlushing] = useState(false);

  const handleManualSync = async () => {
    try {
      setIsFlushing(true);
      await flushPendingSaves();
    } finally {
      setTimeout(() => setIsFlushing(false), 600);
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
  let badgeColor = '#065f46'; // Dark Emerald
  let bgStyle = 'rgba(6, 95, 70, 0.08)';
  let borderColor = 'rgba(6, 95, 70, 0.3)';
  let title = 'Cloud synchronization active';

  if (adapterName === 'local') {
    icon = '💾';
    label = 'Local';
    badgeColor = '#854d0e'; // Warm Amber
    bgStyle = 'rgba(133, 77, 14, 0.08)';
    borderColor = 'rgba(133, 77, 14, 0.3)';
    title = 'Guest Mode: Data saved locally in browser';
  } else if (status === 'saving' || isFlushing) {
    icon = '🔄';
    label = 'Saving...';
    badgeColor = '#1e40af'; // Indigo
    bgStyle = 'rgba(30, 64, 175, 0.08)';
    borderColor = 'rgba(30, 64, 175, 0.3)';
    title = 'Saving changes to cloud...';
  } else if (status === 'saved') {
    icon = '✓';
    label = 'Saved';
    badgeColor = '#065f46';
    bgStyle = 'rgba(6, 95, 70, 0.12)';
    borderColor = 'rgba(6, 95, 70, 0.4)';
    title = timeStr ? `Saved to cloud (${timeStr})` : 'Saved to cloud';
  } else if (status === 'error') {
    icon = '⚠️';
    label = 'Offline';
    badgeColor = '#991b1b'; // Red
    bgStyle = 'rgba(153, 27, 27, 0.1)';
    borderColor = 'rgba(153, 27, 27, 0.4)';
    title = error ? `Sync Error: ${error.message} (Local cache active)` : 'Sync Error: Local cache active';
  }

  return (
    <button
      type="button"
      onClick={handleManualSync}
      title={`${title} (Click to force sync)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 7px',
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        background: bgStyle,
        color: badgeColor,
        fontSize: '10.5px',
        fontFamily: "'IM Fell English SC', serif",
        fontWeight: 'bold',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        lineHeight: 1,
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
        <span style={{ fontSize: '9px', opacity: 0.8, fontWeight: 'normal', fontFamily: "'Crimson Text', serif" }}>
          {timeStr}
        </span>
      )}
    </button>
  );
};
