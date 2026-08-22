import React from 'react';

interface EmptySlotCardProps {
  slotKey: string;
  slotDef: { nameEn: string; nameDe: string; icon: string };
  onClick: () => void;
}

export const EmptySlotCard: React.FC<EmptySlotCardProps> = ({
  slotKey,
  slotDef,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px dashed var(--pb, #c8a96e)',
        borderRadius: '4px',
        background: 'rgba(253, 246, 226, 0.45)',
        padding: '6px 8px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2px',
        minHeight: '76px',
        boxSizing: 'border-box',
        transition: 'all 0.15s ease'
      }}
      className="empty-slot-card"
      title={`Click to equip an item into ${slotDef.nameEn}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '13px', opacity: 0.85 }}>{slotDef.icon}</span>
        <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '11px', color: 'var(--inkm)', fontWeight: 'bold', letterSpacing: '0.4px' }}>
          {slotDef.nameEn}
        </span>
      </div>
      <span style={{ fontSize: '9px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>
        + Equip Item
      </span>
    </div>
  );
};
