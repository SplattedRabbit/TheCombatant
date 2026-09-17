/**
 * @module    LootRevealModal
 * @summary   Parchment modal pop-up displaying distributed loot items to players.
 *            Replaces the theatrical chest animation with a clean, instant parchment pop-up.
 */

import React from 'react';
import { DialogOverlay } from './DialogOverlay';

export interface LootRevealModalProps {
  item: any;
  category?: 'weapons' | 'armors' | 'items' | string;
  onClose: () => void;
}

export const LootRevealModal: React.FC<LootRevealModalProps> = ({
  item,
  category = 'items',
  onClose,
}) => {
  // Extract display information
  const itemName = item?.name || 'Magic Item';
  const enhancement = typeof item?.enhancement === 'number' && item.enhancement > 0 ? `+${item.enhancement} ` : '';
  const fullName = `${enhancement}${itemName}`;

  let categoryLabel = 'Wondrous Item';
  let categoryIcon = '🔮';
  let detailsText = '';
  let destinationText = 'Added to Armory Backpack and ready to use.';

  if (category === 'weapons') {
    categoryLabel = 'Weapon';
    categoryIcon = '⚔️';
    const dmg = item?.damage || '1d8';
    const crit = item?.critThreat ? `${item.critThreat}/x${item.critMult || 2}` : `20/x${item.critMult || 2}`;
    detailsText = `Damage: ${dmg} • Crit: ${crit}`;
    if (item?.extraDamage) detailsText += ` • Bonus: ${item.extraDamage}`;
    destinationText = 'Added to Weapons Arsenal (Offense Tab) and ready to equip.';
  } else if (category === 'armors') {
    categoryLabel = item?.armorType === 'shield' ? 'Shield' : 'Armor';
    categoryIcon = item?.armorType === 'shield' ? '🛡️' : '🥋';
    const ac = item?.acBonus ? `+${item.acBonus} AC` : '+2 AC';
    const maxDex = item?.maxDex !== undefined && item.maxDex !== null ? `Max Dex: +${item.maxDex}` : '';
    detailsText = [ac, maxDex].filter(Boolean).join(' • ');
    destinationText = 'Added to Armor & Shields (Offense Tab) and ready to equip.';
  } else {
    if (item?.slot && item.slot !== 'none') {
      categoryLabel = `Equipment (${item.slot})`;
    }
    if (item?.effectSummary) {
      detailsText = item.effectSummary;
    } else if (item?.description) {
      detailsText = item.description.slice(0, 100) + (item.description.length > 100 ? '...' : '');
    }
  }

  return (
    <DialogOverlay onClose={onClose} width={460} id="lootRevealOverlay" textAlign="center" padding="16px 20px">
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1.5px solid var(--pb, #c8a96e)',
            paddingBottom: '8px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🎁</span>
            <span
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '15px',
                fontWeight: 'bold',
                color: 'var(--red, #8b1a1a)',
                letterSpacing: '0.04em',
              }}
            >
              Dungeon Master's Reward
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="xbtn"
            style={{
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '3px',
              border: '1px solid var(--pb, #c8a96e)',
              background: 'rgba(200, 169, 110, 0.15)',
              color: 'var(--inkm, #665c49)',
              cursor: 'pointer',
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Informative Subtitle */}
        <p
          style={{
            fontSize: '11.5px',
            color: 'var(--inkm, #665c49)',
            margin: '0 0 14px',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.45,
          }}
        >
          The Dungeon Master has given you the following item:
        </p>

        {/* Item Card Container */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid var(--pb, #c8a96e)',
            borderRadius: '4px',
            padding: '14px 16px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.06)',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Category Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(139, 26, 26, 0.08)',
              border: '1px solid rgba(139, 26, 26, 0.25)',
              padding: '2px 10px',
              borderRadius: '10px',
              fontSize: '10px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              color: 'var(--red, #8b1a1a)',
              letterSpacing: '0.03em',
              marginBottom: '8px',
            }}
          >
            <span>{categoryIcon}</span>
            <span>{categoryLabel}</span>
          </div>

          {/* Item Full Name */}
          <h2
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '17px',
              fontWeight: 'bold',
              color: 'var(--red, #8b1a1a)',
              margin: '0 0 6px 0',
              lineHeight: 1.25,
            }}
          >
            {fullName}
          </h2>

          {/* Details / Stats */}
          {detailsText && (
            <div
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '11px',
                color: 'var(--ink, #2c2214)',
                fontWeight: 'bold',
                background: 'rgba(200, 169, 110, 0.12)',
                border: '1px solid rgba(200, 169, 110, 0.35)',
                borderRadius: '3px',
                padding: '5px 10px',
                margin: '6px 0 10px',
                letterSpacing: '0.02em',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {detailsText}
            </div>
          )}

          {/* Status Note */}
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '10.5px',
              color: 'var(--inkm, #665c49)',
              marginTop: '4px',
            }}
          >
            {destinationText}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-p"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '11.5px',
              fontWeight: 'bold',
              color: 'var(--red, #8b1a1a)',
              background: 'linear-gradient(180deg, #fefdf8 0%, #edd9b4 100%)',
              border: '1.5px solid var(--pb, #c8a96e)',
              borderRadius: '4px',
              padding: '6px 24px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✨</span>
            <span>Accept Item</span>
          </button>
        </div>
      </div>
    </DialogOverlay>
  );
};
