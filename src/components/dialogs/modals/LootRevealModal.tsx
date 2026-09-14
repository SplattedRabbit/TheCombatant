/**
 * @module    LootRevealModal
 * @summary   Theatrical medieval treasure chest lootbox reveal animation for distributed items.
 *            Features 3D lid flip, golden light burst, floating particle rays, and relic card display.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  // Stages: 'closed' -> 'opening' -> 'revealed'
  const [stage, setStage] = useState<'closed' | 'opening' | 'revealed'>('closed');

  // Automatic progression:
  useEffect(() => {
    // Shaking chest for 1.1s, then opens
    const openTimer = setTimeout(() => {
      setStage('opening');
    }, 1100);

    // After 0.7s of opening burst, reveal card
    const revealTimer = setTimeout(() => {
      setStage('revealed');
    }, 1800);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  const handleManualOpen = () => {
    if (stage === 'closed') {
      setStage('opening');
      setTimeout(() => setStage('revealed'), 700);
    }
  };

  // Extract display information
  const itemName = item?.name || 'Magischer Gegenstand';
  const enhancement = typeof item?.enhancement === 'number' && item.enhancement > 0 ? `+${item.enhancement} ` : '';
  const fullName = `${enhancement}${itemName}`;

  let categoryLabel = 'Wundersamer Gegenstand';
  let categoryIcon = '🔮';
  let detailsText = '';

  if (category === 'weapons') {
    categoryLabel = 'Waffe';
    categoryIcon = '⚔️';
    const dmg = item?.damage || '1d8';
    const crit = item?.critThreat ? `${item.critThreat}/x${item.critMult || 2}` : `20/x${item.critMult || 2}`;
    detailsText = `Schaden: ${dmg} • Kritisch: ${crit}`;
    if (item?.extraDamage) detailsText += ` • Bonus: ${item.extraDamage}`;
  } else if (category === 'armors') {
    categoryLabel = item?.armorType === 'shield' ? 'Schild' : 'Rüstung';
    categoryIcon = item?.armorType === 'shield' ? '🛡️' : '🥋';
    const ac = item?.acBonus ? `+${item.acBonus} RK` : '+2 RK';
    const maxDex = item?.maxDex !== undefined && item.maxDex !== null ? `Max Dex: +${item.maxDex}` : '';
    detailsText = [ac, maxDex].filter(Boolean).join(' • ');
  } else {
    if (item?.slot && item.slot !== 'none') {
      categoryLabel = `Ausrüstung (${item.slot})`;
    }
    if (item?.effectSummary) {
      detailsText = item.effectSummary;
    } else if (item?.description) {
      detailsText = item.description.slice(0, 80) + (item.description.length > 80 ? '...' : '');
    }
  }

  const content = (
    <div
      id="lootRevealOverlay"
      className="no-print"
      onClick={() => {
        if (stage === 'revealed') onClose();
        else handleManualOpen();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8, 4, 2, 0.88)',
        backdropFilter: 'blur(5px)',
        zIndex: 250000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Keyframe Styles */}
      <style>{`
        @keyframes chestRumble {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          20% { transform: translateY(-3px) rotate(-2deg) scale(1.02); }
          40% { transform: translateY(2px) rotate(2deg) scale(1.01); }
          60% { transform: translateY(-4px) rotate(-3deg) scale(1.03); }
          80% { transform: translateY(3px) rotate(3deg) scale(1.02); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }

        @keyframes sunburstSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes lightBurstPulse {
          0% { transform: scale(0.6); opacity: 0; }
          40% { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        @keyframes relicFloat {
          0% { transform: translateY(40px) scale(0.85); opacity: 0; }
          60% { transform: translateY(-16px) scale(1.04); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        @keyframes gentleHover {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes sparklesAscend {
          0% { transform: translateY(20px) scale(0.5); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
        }
      `}</style>

      {/* Sunburst Rays on Open */}
      {(stage === 'opening' || stage === 'revealed') && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '600px',
            height: '600px',
            pointerEvents: 'none',
            backgroundImage: 'repeating-conic-gradient(from 0deg, rgba(255, 215, 0, 0.18) 0deg 15deg, transparent 15deg 30deg)',
            borderRadius: '50%',
            animation: 'sunburstSpin 24s linear infinite',
            zIndex: 1,
          }}
        />
      )}

      {/* Light Burst Wave */}
      {stage === 'opening' && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '280px',
            height: '280px',
            marginLeft: '-140px',
            marginTop: '-140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 240, 160, 0.9) 0%, rgba(218, 165, 32, 0.6) 45%, transparent 75%)',
            animation: 'lightBurstPulse 0.9s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {/* Floating Sparkles */}
      {(stage === 'opening' || stage === 'revealed') && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${25 + (i * 5)}%`,
                top: `${40 + (i % 5) * 6}%`,
                color: '#ffe066',
                fontSize: `${14 + (i % 3) * 6}px`,
                textShadow: '0 0 8px #ffcc00',
                animation: `sparklesAscend ${1.4 + (i % 4) * 0.4}s ease-out infinite`,
                animationDelay: `${(i * 0.15)}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Main Presentation Stage */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '480px',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Upper Title */}
        <div
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '15px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#f3da92',
            textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 12px rgba(243, 218, 146, 0.5)',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {stage === 'revealed' ? '🎁 Belohnung des Spielleiters' : 'Ein Schatz öffnet sich...'}
        </div>

        {/* The Animated SVG Treasure Chest */}
        <div
          style={{
            width: '190px',
            height: '140px',
            position: 'relative',
            cursor: stage === 'closed' ? 'pointer' : 'default',
            animation: stage === 'closed' ? 'chestRumble 0.3s ease-in-out infinite' : undefined,
            transition: 'transform 0.4s ease, opacity 0.4s ease',
            transform: stage === 'revealed' ? 'scale(0.8) translateY(50px)' : 'scale(1)',
            opacity: stage === 'revealed' ? 0.75 : 1,
          }}
          title={stage === 'closed' ? 'Klicke, um die Truhe zu öffnen!' : ''}
          onClick={handleManualOpen}
        >
          <svg viewBox="0 0 200 150" width="100%" height="100%">
            <defs>
              <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#874e1d" />
                <stop offset="50%" stopColor="#5c3413" />
                <stop offset="100%" stopColor="#3d210b" />
              </linearGradient>
              <linearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4a4d50" />
                <stop offset="50%" stopColor="#8a8f94" />
                <stop offset="100%" stopColor="#35383a" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe478" />
                <stop offset="50%" stopColor="#cda135" />
                <stop offset="100%" stopColor="#876211" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Seam Light */}
            {stage === 'closed' && (
              <path
                d="M 18 78 Q 100 86 182 78"
                stroke="#ffe680"
                strokeWidth="7"
                fill="none"
                filter="url(#glow)"
                opacity="0.9"
              />
            )}

            {/* Chest Body (Lower Section) */}
            <path
              d="M 20 80 L 30 135 Q 100 144 170 135 L 180 80 Z"
              fill="url(#woodGrad)"
              stroke="#261304"
              strokeWidth="3.5"
            />

            {/* Iron Bands on Body */}
            <path d="M 45 81 L 52 137" stroke="url(#ironGrad)" strokeWidth="8" strokeLinecap="round" />
            <path d="M 155 81 L 148 137" stroke="url(#ironGrad)" strokeWidth="8" strokeLinecap="round" />
            <path d="M 100 82 L 100 139" stroke="url(#ironGrad)" strokeWidth="9" />

            {/* Golden Lock Base */}
            <rect x="88" y="76" width="24" height="22" rx="4" fill="url(#goldGrad)" stroke="#59400a" strokeWidth="2" />
            <circle cx="100" cy="85" r="3.5" fill="#261304" />
            <path d="M 100 88 L 100 94" stroke="#261304" strokeWidth="2.5" />

            {/* Chest Lid (Top Section with perspective opening) */}
            <g
              style={{
                transformOrigin: '100px 76px',
                transition: 'transform 0.65s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                transform: stage === 'closed' ? 'rotate(0deg)' : 'translateY(-30px) rotate(-65deg) scaleY(0.65)',
              }}
            >
              <path
                d="M 15 78 Q 100 50 185 78 Q 100 84 15 78 Z"
                fill="url(#woodGrad)"
                stroke="#261304"
                strokeWidth="3"
              />
              <path
                d="M 15 78 Q 100 24 185 78"
                fill="url(#woodGrad)"
                stroke="#261304"
                strokeWidth="3.5"
              />
              {/* Iron Bands on Lid */}
              <path d="M 43 76 Q 47 42 55 28" stroke="url(#ironGrad)" strokeWidth="7" fill="none" />
              <path d="M 157 76 Q 153 42 145 28" stroke="url(#ironGrad)" strokeWidth="7" fill="none" />
              <path d="M 100 78 Q 100 45 100 25" stroke="url(#ironGrad)" strokeWidth="8" fill="none" />
            </g>
          </svg>
        </div>

        {/* Click to open hint for closed stage */}
        {stage === 'closed' && (
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-title)',
              color: 'rgba(255, 235, 180, 0.7)',
              marginTop: '12px',
              letterSpacing: '0.04em',
            }}
          >
            Tippe, um die Truhe zu öffnen...
          </div>
        )}

        {/* Rising Relic Card (Stage 'revealed') */}
        {stage === 'revealed' && (
          <div
            style={{
              marginTop: '-50px',
              width: '100%',
              maxWidth: '430px',
              background: 'var(--p, #f5edd6)',
              backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.65) 0%, rgba(200, 169, 110, 0.15) 100%)',
              border: '2px solid var(--pb, #c8a96e)',
              borderRadius: '6px',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 215, 0, 0.25)',
              padding: '18px 22px',
              boxSizing: 'border-box',
              textAlign: 'center',
              position: 'relative',
              animation: 'relicFloat 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.15) forwards, gentleHover 3.5s ease-in-out infinite 0.6s',
            }}
          >
            {/* Inner dashed accent line */}
            <div
              style={{
                position: 'absolute',
                inset: '4px',
                border: '0.5px dashed rgba(200, 169, 110, 0.45)',
                borderRadius: '4px',
                pointerEvents: 'none',
              }}
            />

            {/* Category Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(139, 26, 26, 0.1)',
                border: '1px solid rgba(139, 26, 26, 0.3)',
                padding: '3px 12px',
                borderRadius: '12px',
                fontSize: '10px',
                fontFamily: 'var(--font-title)',
                fontWeight: 'bold',
                color: 'var(--red, #8b1a1a)',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              <span>{categoryIcon}</span>
              <span>{categoryLabel}</span>
            </div>

            {/* Item Name */}
            <h2
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '19px',
                color: 'var(--red, #8b1a1a)',
                margin: '0 0 6px 0',
                lineHeight: 1.2,
                textShadow: '0 1px 2px rgba(200, 169, 110, 0.3)',
              }}
            >
              {fullName}
            </h2>

            {/* Stats / Details */}
            {detailsText && (
              <div
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '11.5px',
                  color: 'var(--ink, #2c2214)',
                  fontWeight: 'bold',
                  background: 'rgba(255, 255, 255, 0.5)',
                  border: '1px solid rgba(200, 169, 110, 0.4)',
                  borderRadius: '3px',
                  padding: '6px 10px',
                  margin: '8px 0 12px',
                  letterSpacing: '0.02em',
                }}
              >
                {detailsText}
              </div>
            )}

            {/* Flavour Note */}
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
                fontSize: '10.5px',
                color: 'var(--inkm, #665c49)',
                marginBottom: '16px',
              }}
            >
              In dein Inventar übergeben und bereit zur Verwendung.
            </div>

            {/* Action Buttons */}
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
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>✨</span>
                <span>In Empfang nehmen</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
