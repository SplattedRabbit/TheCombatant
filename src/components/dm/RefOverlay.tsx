/**
 * @module    RefOverlay
 * @summary   Rules Reference modal popup overlay for D&D conditions details.
 * @exports   RefOverlay
 * @reads     CombatRules.CONDITIONS
 * @stateOps  none
 * @depends   React, @core/rules.js
 */

import React from 'react';
// @ts-ignore
import { CombatRules } from '@core/rules.js';

interface RefOverlayProps {
  condName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RefOverlay: React.FC<RefOverlayProps> = ({ condName, isOpen, onClose }) => {
  if (!isOpen || !condName) return null;

  const condition = CombatRules.CONDITIONS.find((x: any) => x.n === condName);
  const title = condName;
  const descriptionHtml = condition ? condition.r : 'Keine Beschreibung gefunden.';

  return (
    <div 
      className={`ref-overlay ${isOpen ? 'open' : ''}`} 
      id="refOverlay"
      onClick={onClose}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(5, 3, 1, 0.85)',
        backdropFilter: 'blur(5px)'
      }}
    >
      <div 
        className="ref-modal" 
        id="refModal"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        style={{
          position: 'relative',
          maxWidth: '440px',
          width: '90%',
          maxHeight: '80%',
          overflowY: 'auto',
          background: 'var(--p)',
          border: '1.5px solid var(--pb)',
          borderRadius: '4px',
          padding: '20px 24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.7)'
        }}
      >
        <button 
          className="ref-close" 
          id="btnCloseRef" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--red)',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 'bold',
            outline: 'none'
          }}
        >
          ✕
        </button>
        <h3 
          id="refTitle" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
            color: 'var(--red)',
            fontSize: '18px',
            margin: '0 0 12px 0',
            borderBottom: '0.5px solid var(--pb)',
            paddingBottom: '4px'
          }}
        >
          {title}
        </h3>
        <div 
          className="ref-body" 
          id="refBody" 
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          style={{
            fontFamily: "'Crimson Text', serif",
            fontSize: '12px',
            color: 'var(--inkm)',
            lineHeight: 1.5
          }}
        />
      </div>
    </div>
  );
};
