import React from 'react';

interface EmptySlotCardProps {
  slotKey: string;
  slotDef: { nameEn: string; nameDe: string; icon: string };
  onClick: () => void;
}

export const EmptySlotCard: React.FC<EmptySlotCardProps> = ({
  slotDef,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px dashed var(--pb, #c8a96e)',
        borderRadius: '3px',
        background: 'rgba(253, 246, 226, 0.4)',
        padding: '5px 6px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2px',
        minHeight: '60px',
        boxSizing: 'border-box',
        transition: 'all 0.15s ease'
      }}
      className="empty-slot-card"
      title={`Click to equip an item into ${slotDef.nameEn}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1 }}>
        <span style={{ fontSize: '13px', opacity: 0.8 }}>{slotDef.icon}</span>
        <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', color: 'var(--inkm)', fontWeight: 'bold' }}>
          {slotDef.nameEn}
        </span>
      </div>
      <span style={{ fontSize: '8.5px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>
        + Equip
      </span>
    </div>
  );
};
