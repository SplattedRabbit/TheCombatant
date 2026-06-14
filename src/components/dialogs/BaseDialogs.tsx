/**
 * @module    BaseDialogs
 * @summary   Basis-Modals und Dialogfenster der CombatApp in React (Parchment/Pergament-Design).
 * @exports   CustomAlertModal, CustomConfirmModal, CustomPromptModal, NewDayTemplateDialog, RollBreakdownDialog, SampleChoiceDialog
 */

import React, { useState } from 'react';

// Common overlay wrapper component
const DialogOverlay: React.FC<{ children: React.ReactNode; onClose?: () => void; width?: number; id?: string }> = ({ children, onClose, width = 440, id }) => {
  return (
    <div 
      id={id}
      className="no-print" 
      onClick={(e) => { if (onClose && e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease-out forwards'
      }}
    >
      <div 
        className="custom-alert-box" 
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '16px 24px',
          width: `${width}px`,
          maxWidth: '92vw',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 15px rgba(200,169,110,0.08)',
          fontFamily: "'IM Fell English SC', serif",
          textAlign: 'center',
          position: 'relative',
          animation: 'scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }}></div>
        {children}
      </div>
    </div>
  );
};

// 1. Info / Alert Dialog
interface CustomAlertModalProps {
  title: string;
  message: string;
  buttonText?: string;
  icon?: string;
  onClose: () => void;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({ title, message, buttonText = "Verstanden", icon = "⚠️", onClose }) => {
  return (
    <DialogOverlay onClose={onClose} id="customAlertOverlay">
      <div style={{ fontSize: '15px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        {icon ? icon + ' ' : ''}{title}
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '6px 0 10px' }} />
      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '12px', color: 'var(--ink)', lineHeight: 1.4, marginBottom: '12px', fontWeight: 500, textAlign: 'center' }}>
        {message}
      </div>
      <button 
        onClick={onClose}
        className="btn btn-p pc-alert-close-btn" 
        style={{
          fontFamily: "'IM Fell English SC', serif",
          fontSize: '9px',
          padding: '3px 14px',
          cursor: 'pointer',
          background: 'rgba(244, 232, 193, 0.6)',
          border: '1px solid var(--pb)',
          borderRadius: '2px',
          color: 'var(--ink)',
          outline: 'none'
        }}
      >
        {buttonText}
      </button>
    </DialogOverlay>
  );
};

// 2. Confirm Dialog
interface CustomConfirmModalProps {
  title: string;
  messageHtml: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CustomConfirmModal: React.FC<CustomConfirmModalProps> = ({ title, messageHtml, onConfirm, onCancel }) => {
  return (
    <DialogOverlay onClose={onCancel} width={460} id="customConfirmOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.3px' }}>
        {title}
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      <div 
        className="info-dialog-body" 
        style={{ textAlign: 'left', marginBottom: '12px', fontSize: '10px', color: 'var(--ink)', fontFamily: "'Crimson Text', serif", lineHeight: 1.35 }}
        dangerouslySetInnerHTML={{ __html: messageHtml }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={onConfirm}
          className="btn btn-p confirm-dialog-yes" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 18px', cursor: 'pointer', borderRadius: '2px' }}
        >
          Ja
        </button>
        <button 
          onClick={onCancel}
          className="btn confirm-dialog-no" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 18px', cursor: 'pointer', borderRadius: '2px', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          Nein
        </button>
      </div>
    </DialogOverlay>
  );
};

// 3. Prompt Dialog (e.g., healing/damage inputs)
interface CustomPromptModalProps {
  title: string;
  message: string;
  defaultValue: string;
  buttonText?: string;
  onConfirm: (val: string) => void;
  onCancel: () => void;
}

export const CustomPromptModal: React.FC<CustomPromptModalProps> = ({ title, message, defaultValue, buttonText = "Absenden", onConfirm, onCancel }) => {
  const [val, setVal] = useState(defaultValue);

  return (
    <DialogOverlay onClose={onCancel} width={360} id="customPromptOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px' }}>
        {title}
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '11px', color: 'var(--inkm)', marginBottom: '8px', textAlign: 'left' }}>
        {message}
      </div>
      <input 
        type="text" 
        className="cinput pc-prompt-input" 
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(val); if (e.key === 'Escape') onCancel(); }}
        autoFocus
        style={{
          width: '100%',
          boxSizing: 'border-box',
          fontSize: '11px',
          padding: '4px 6px',
          background: 'rgba(255,255,255,0.4)',
          border: '1px solid var(--pb)',
          borderRadius: '2px',
          color: 'var(--ink)',
          marginBottom: '12px',
          fontFamily: 'monospace'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={() => onConfirm(val)}
          className="btn btn-p prompt-dialog-submit" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 18px', cursor: 'pointer' }}
        >
          {buttonText}
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 18px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          Abbrechen
        </button>
      </div>
    </DialogOverlay>
  );
};

// 4. New Day Reset Template Dialog
interface NewDayTemplateDialogProps {
  templates: Record<string, any>;
  onConfirm: (choice: string) => void;
  onCancel: () => void;
}

export const NewDayTemplateDialog: React.FC<NewDayTemplateDialogProps> = ({ templates, onConfirm, onCancel }) => {
  const [selected, setSelected] = useState('none');
  const templateKeys = Object.keys(templates || {});

  return (
    <DialogOverlay onClose={onCancel} width={450} id="newDayTemplateOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px' }}>
        🌅 Tageswechsel & Zauber-Vorbereitung
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      
      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '11px', color: 'var(--ink)', lineHeight: 1.4, marginBottom: '12px', textAlign: 'left' }}>
        Wähle aus, welches Zauber-Template für den neuen Tag vorbereitet werden soll. 
        Tägliche Ressourcen (Zorn, Trefferwürfel etc.) werden in jedem Fall zurückgesetzt.
      </div>

      <div style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px solid var(--pb)', padding: '10px', borderRadius: '3px', marginBottom: '12px', textAlign: 'left' }}>
        <label style={{ display: 'block', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px' }}>Zauber-Setup für heute:</label>
        <select 
          value={selected} 
          onChange={(e) => setSelected(e.target.value)}
          className="cinput" 
          style={{ width: '100%', fontSize: '10px', height: '22px', padding: '2px 4px' }}
        >
          <option value="none">Keine Zauber automatisch vorbereiten (Zauberbuch leeren)</option>
          <option value="keep">Aktuell vorbereitete Zauber behalten (Standard)</option>
          {templateKeys.map(key => (
            <option key={key} value={key}>Template: {key}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={() => onConfirm(selected)}
          className="btn btn-p" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '5px 20px', cursor: 'pointer' }}
        >
          Tag beginnen 🌅
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '5px 20px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          Abbrechen
        </button>
      </div>
    </DialogOverlay>
  );
};

// 5. Roll Breakdown Dialog
interface RollBreakdownDialogProps {
  title: string;
  diceFormula: string;
  breakdownItems: Array<{ label: string; value: number }>;
  onClose: () => void;
  onRollClick?: (rollVal: number) => void;
}

export const RollBreakdownDialog: React.FC<RollBreakdownDialogProps> = ({ title, diceFormula, breakdownItems, onClose, onRollClick }) => {
  let modsSum = 0;
  const listItems = (breakdownItems || []).map((item, idx) => {
    const val = parseInt(item.value as any) || 0;
    modsSum += val;
    const sign = val >= 0 ? '+' : '';
    return (
      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
        <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', color: 'var(--inkm)' }}>{item.label}:</span>
        <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)' }}>{sign}{val}</span>
      </div>
    );
  });

  const modsFormatted = modsSum >= 0 ? `+${modsSum}` : `${modsSum}`;
  const formulaFormatted = modsSum === 0 ? diceFormula : `${diceFormula} ${modsFormatted}`;

  const triggerRoll = () => {
    if (onRollClick) {
      // Simulate/Trigger a 1d20 roll
      const roll = Math.floor(Math.random() * 20) + 1;
      onRollClick(roll);
    }
    onClose();
  };

  return (
    <DialogOverlay onClose={onClose} width={255} id="rollBreakdown">
      <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.3px' }}>
        {title.startsWith('🎲') ? title : `🎲 ${title}`}
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {listItems}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px dashed rgba(200,169,110,0.4)', marginTop: '4px', paddingTop: '4px' }}>
          <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', color: 'var(--inkm)' }}>Gesamt-Modifikator:</span>
          <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>{modsFormatted}</span>
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200,169,110,0.4)', margin: '8px 0' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>WURF-FORMEL:</span>
        <span style={{ fontSize: '13px' }}>{formulaFormatted}</span>
      </div>

      {onRollClick && (
        <button 
          onClick={triggerRoll}
          className="btn btn-p" 
          style={{ width: '100%', marginTop: '12px', fontSize: '9.5px', padding: '4px 0', fontWeight: 'bold', fontFamily: "'IM Fell English SC', serif" }}
        >
          Jetzt Würfeln 🎲
        </button>
      )}
    </DialogOverlay>
  );
};

// 6. Sample choice dialog
interface SampleChoiceDialogProps {
  isPlayer: boolean;
  onConfirm: (choice: string) => void;
  onCancel: () => void;
}

export const SampleChoiceDialog: React.FC<SampleChoiceDialogProps> = ({ isPlayer, onConfirm, onCancel }) => {
  return (
    <DialogOverlay onClose={onCancel} width={450} id="sampleChoiceDialogOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px' }}>
        🏰 Beispieldaten laden
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      
      {isPlayer ? (
        <>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '13px', color: 'var(--ink)', lineHeight: 1.45, marginBottom: '16px', fontWeight: 500, textAlign: 'left' }}>
            Wähle einen Stufe 10 Beispielcharakter mit passenden Werten, Waffen und Zaubern aus, der geladen werden soll:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => onConfirm('wizard_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🔮 Magier (Elf, Stufe 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                Ein spezialisierter Magier (Hervorrufung) mit einer Eule als Vertrautem und einem gefüllten Zauberbuch.
              </span>
            </button>

            <button 
              onClick={() => onConfirm('ranger_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🏹 Waldläufer (Mensch, Stufe 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                Ein wendiger Fernkämpfer mit Tierbegleiter (Wolf) und passenden Kampf-Feats für Zweiwaffenkampf / Bogenschießen.
              </span>
            </button>

            <button 
              onClick={() => onConfirm('paladin_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🛡️ Paladin (Mensch, Stufe 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                Ein ehrenhafter Ritter mit göttlicher Magie, Auren und mächtigen Nahkampfangriffen (Smite Evil).
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '13px', color: 'var(--ink)', lineHeight: 1.45, marginBottom: '16px', fontWeight: 500, textAlign: 'left' }}>
            Wähle aus, welche Begegnung und Charaktere geladen werden sollen. Für den Spielleiter werden alle drei Helden gleichzeitig angelegt:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => onConfirm('party_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🐉 Stufe 10 Helden-Encounter</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                Erstellt 3 Stufe 10 Helden (Magier, Waldläufer, Paladin) und positioniert sie gegen einen Drachen und Riesen.
              </span>
            </button>

            <button 
              onClick={() => onConfirm('aranis_only')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🛡️ Nur Aranis (Paladin Stufe 3)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                Lädt einen einzelnen Paladin auf Stufe 3 für kleinere Test-Szenarien.
              </span>
            </button>
          </div>
        </>
      )}

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '5px 25px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          Schließen
        </button>
      </div>
    </DialogOverlay>
  );
};
