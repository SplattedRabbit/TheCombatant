/**
 * @module    PrintableCharacterSheetModal
 * @summary   Interactive Print Preview Modal & PDF export container for the D&D 3.5e Character Sheet Folio.
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PrintPage1CoreCombat } from './pages/PrintPage1CoreCombat';
import { PrintPage2SkillsFeatures } from './pages/PrintPage2SkillsFeatures';
import { PrintPage3EquipmentArmory } from './pages/PrintPage3EquipmentArmory';
import { PrintPage4SpellsCompanion } from './pages/PrintPage4SpellsCompanion';
import './styles/printableSheet.css';

export interface PrintableCharacterSheetModalProps {
  pc: any;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableCharacterSheetModal: React.FC<PrintableCharacterSheetModalProps> = ({
  pc,
  isOpen,
  onClose,
}) => {
  const [theme, setTheme] = useState<'parchment' | 'ink'>('parchment');
  const [zoom, setZoom] = useState<number>(100);
  const [selectedPages, setSelectedPages] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  // Automatically determine if page 4 (Spells/Companion) is relevant
  useEffect(() => {
    if (pc) {
      const casterClasses = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'paladin', 'ranger', 'beguiler', 'duskblade', 'mystic_theurge', 'arcane_trickster'];
      const isCaster = (pc.classes || []).some((c: any) => casterClasses.includes(c.classType)) || (pc.spells && Object.keys(pc.spells).length > 0);
      const hasPet = (pc.companionType && pc.companionType !== 'none') || (pc.familiarType && pc.familiarType !== 'none');
      setSelectedPages(prev => ({
        ...prev,
        4: isCaster || hasPet,
      }));
    }
  }, [pc]);

  if (!isOpen || !pc) return null;

  const handlePrint = () => {
    window.print();
  };

  const togglePage = (pageNumber: number) => {
    setSelectedPages(prev => ({ ...prev, [pageNumber]: !prev[pageNumber] }));
  };

  return ReactDOM.createPortal(
    <div className={`print-modal-overlay theme-${theme}`}>
      {/* Floating Top Control Toolbar (Hidden in @media print) */}
      <div className="print-toolbar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>📜</span>
          <div>
            <div style={{ fontFamily: 'var(--font-dnd-title)', fontSize: '13px', fontWeight: 'bold', color: '#c8a96e', letterSpacing: '0.5px' }}>
              D&amp;D 3.5e Character Sheet Print Preview
            </div>
            <div style={{ fontSize: '10px', color: '#a0907a' }}>
              Optimized for DIN A4 / Letter • {pc.name || 'Adventurer'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Page Toggles */}
          <div style={{ display: 'flex', gap: '3px', background: 'rgba(0,0,0,0.4)', padding: '2px 4px', borderRadius: '4px', border: '0.5px solid rgba(200,169,110,0.3)' }}>
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => togglePage(num)}
                className="print-toolbar-btn"
                style={{
                  padding: '3px 8px',
                  fontSize: '9.5px',
                  background: selectedPages[num] ? '#8b1a1a' : 'transparent',
                  color: selectedPages[num] ? '#fff' : '#c8a96e',
                  border: selectedPages[num] ? '0.5px solid #c8a96e' : '0.5px solid transparent',
                }}
              >
                Page {num}
              </button>
            ))}
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'parchment' ? 'ink' : 'parchment')}
            className="print-toolbar-btn print-toolbar-btn-secondary"
          >
            {theme === 'parchment' ? '📜 Parchment' : '🖨️ Ink-Friendly (B&W)'}
          </button>

          {/* Zoom Buttons */}
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setZoom(Math.max(60, zoom - 15))}
              className="print-toolbar-btn print-toolbar-btn-secondary"
              style={{ padding: '4px 8px' }}
            >
              −
            </button>
            <span style={{ fontSize: '10px', color: '#c8a96e', minWidth: '35px', textAlign: 'center', fontFamily: 'var(--font-dnd-title)' }}>
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(150, zoom + 15))}
              className="print-toolbar-btn print-toolbar-btn-secondary"
              style={{ padding: '4px 8px' }}
            >
              +
            </button>
          </div>

          {/* Primary Print / Save as PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="print-toolbar-btn print-toolbar-btn-primary"
            style={{ fontSize: '12px', padding: '6px 16px' }}
          >
            🖨️ Print / Save as PDF
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="print-toolbar-btn print-toolbar-btn-secondary"
            style={{ padding: '6px 10px', fontSize: '14px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Viewport for Rendered A4 Folio Pages */}
      <div className="print-viewport">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {selectedPages[1] && <PrintPage1CoreCombat pc={pc} />}
          {selectedPages[2] && <PrintPage2SkillsFeatures pc={pc} />}
          {selectedPages[3] && <PrintPage3EquipmentArmory pc={pc} />}
          {selectedPages[4] && <PrintPage4SpellsCompanion pc={pc} />}
        </div>
      </div>
    </div>,
    document.body
  );
};
