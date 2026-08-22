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
        border: '1.5px dashed rgba(200, 169, 110, 0.65)',
        borderRadius: '4px',
        background: 'rgba(253, 246, 226, 0.4)',
        padding: '10px 12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4px',
        minHeight: '94px',
        boxSizing: 'border-box',
        transition: 'all 0.15s ease'
      }}
      className="empty-slot-card"
      title={`Click to equip an item into ${slotDef.nameEn}`}
    >
      <span style={{ fontSize: '20px', opacity: 0.8 }}>{slotDef.icon}</span>
      <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '12px', color: 'var(--inkm)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
        {slotDef.nameEn}
      </div>
      <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}>
        + Equip Item
      </span>
    </div>
  );
};
