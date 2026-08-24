/**
 * @module    BaseDialogs
 * @summary   Base modals and dialog windows of CombatApp in React (Parchment/Pergament design).
 * @exports   CustomAlertModal, CustomConfirmModal, CustomPromptModal, NewDayTemplateDialog, RollBreakdownDialog, SampleChoiceDialog
 */

import React, { useState } from 'react';
import { sanitizeHtml } from '../../utils/sanitize';

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

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({ title, message, buttonText = "Understood", icon = "⚠️", onClose }) => {
  return (
    <DialogOverlay onClose={onClose} id="customAlertOverlay" width={420}>
      <div style={{ fontSize: '16px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span> {title}
      </div>
      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, var(--pb), transparent)', margin: '8px 0 12px' }} />
      <div 
        style={{ fontFamily: "'Crimson Text', serif", fontSize: '13px', color: 'var(--ink)', lineHeight: 1.5, marginBottom: '16px', fontWeight: 500, textAlign: 'left' }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(message) }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <button 
          onClick={onClose}
          className="btn btn-p pc-alert-close-btn" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '11px',
            padding: '4px 20px',
            cursor: 'pointer',
            background: 'var(--p)',
            border: '1.5px solid var(--pb)',
            borderRadius: '3px',
            color: 'var(--red)',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            outline: 'none'
          }}
        >
          {buttonText}
        </button>
      </div>
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
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(messageHtml) }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={onConfirm}
          className="btn btn-p confirm-dialog-yes" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 18px', cursor: 'pointer', borderRadius: '2px' }}
        >
          Yes
        </button>
        <button 
          onClick={onCancel}
          className="btn confirm-dialog-no" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 18px', cursor: 'pointer', borderRadius: '2px', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          No
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

export const CustomPromptModal: React.FC<CustomPromptModalProps> = ({ title, message, defaultValue, buttonText = "Submit", onConfirm, onCancel }) => {
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
          className="btn prompt-dialog-submit" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '9px',
            padding: '4px 18px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '1px solid #7d5e1f',
            color: '#1a1005',
            fontWeight: 'bold'
          }}
        >
          {buttonText}
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '4px 18px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          Cancel
        </button>
      </div>
    </DialogOverlay>
  );
};

// 3b. Dedicated Healing Roll Dialog with stylized dice breakdown
interface HealingRollModalProps {
  itemName: string;
  dice: string;
  bonus: number;
  formula: string;
  onConfirm: (val: string) => void;
  onCancel: () => void;
}

export const HealingRollModal: React.FC<HealingRollModalProps> = ({
  itemName,
  dice,
  bonus,
  formula,
  onConfirm,
  onCancel
}) => {
  const [val, setVal] = useState('');

  return (
    <DialogOverlay onClose={onCancel} width={340} id="healingRollOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '2px' }}>
        🍷 {itemName}
      </div>
      <div className="dialog-subtitle" style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '6px' }}>
        Healing Roll & Recovery
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 10px' }} />

      <div style={{
        textAlign: 'left',
        background: 'rgba(200, 169, 110, 0.04)',
        border: '1px solid var(--pb)',
        borderRadius: '3px',
        padding: '10px',
        fontFamily: "'Crimson Text', serif",
        marginBottom: '10px'
      }}>
        <div style={{
          fontFamily: "'IM Fell English SC', serif",
          fontSize: '11px',
          fontWeight: 'bold',
          color: 'var(--red)',
          marginBottom: '5px',
          borderBottom: '0.5px solid rgba(200,169,110,0.3)',
          paddingBottom: '3px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Healing Modifiers</span>
          <span style={{ fontSize: '10px', color: '#27ae60' }}>+HP Recovery</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9.5px', color: 'var(--inkm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', color: 'var(--inkm)' }}>Dice to Roll:</span>
            <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)' }}>{dice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', color: 'var(--inkm)' }}>Flat Bonus:</span>
            <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: '#27ae60' }}>+{bonus}</span>
          </div>
          <hr style={{ border: 'none', borderTop: '0.5px dashed rgba(200,169,110,0.3)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
            <span>ROLL FORMULA:</span>
            <span style={{ fontSize: '12px', color: '#27ae60', letterSpacing: '0.5px' }}>{formula}</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'left', marginBottom: '4px' }}>
        <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--ink)', display: 'block', marginBottom: '3px' }}>
          Enter your healing roll here:
        </label>
        <input 
          type="text" 
          className="cinput pc-prompt-input" 
          value={val}
          placeholder="e.g. 6 or 5+1"
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(val); if (e.key === 'Escape') onCancel(); }}
          autoFocus
          style={{
            width: '100%',
            boxSizing: 'border-box',
            fontSize: '12px',
            padding: '5px 8px',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid var(--pb)',
            borderRadius: '3px',
            color: 'var(--ink)',
            marginBottom: '12px',
            fontFamily: "'Crimson Text', serif",
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={() => onConfirm(val)}
          className="btn" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '9.5px',
            padding: '4px 18px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '1px solid #7d5e1f',
            color: '#1a1005',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}
        >
          🍷 Drink & Heal
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '9.5px',
            padding: '4px 18px',
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid var(--pb)',
            color: 'var(--ink)'
          }}
        >
          Cancel
        </button>
      </div>
    </DialogOverlay>
  );
};

// 3c. Dedicated Item Damage / Spell Effect Info Dialog (without input field)
interface ItemDamageModalProps {
  itemName: string;
  dice: string;
  bonus: number;
  formula: string;
  damageType?: string;
  effectDesc?: string;
  saveText?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ItemDamageModal: React.FC<ItemDamageModalProps> = ({
  itemName,
  dice,
  bonus,
  formula,
  damageType,
  effectDesc,
  saveText,
  onConfirm,
  onCancel
}) => {
  return (
    <DialogOverlay onClose={onCancel} width={340} id="itemDamageOverlay">
      <div style={{ fontSize: '13px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '2px' }}>
        💥 {itemName}
      </div>
      <div className="dialog-subtitle" style={{ fontSize: '8px', color: 'var(--inkl)', fontStyle: 'italic', marginBottom: '6px' }}>
        Damage & Spell Effect
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '4px 0 10px' }} />

      <div style={{
        textAlign: 'left',
        background: 'rgba(200, 169, 110, 0.04)',
        border: '1px solid var(--pb)',
        borderRadius: '3px',
        padding: '10px',
        fontFamily: "'Crimson Text', serif",
        marginBottom: '10px'
      }}>
        <div style={{
          fontFamily: "'IM Fell English SC', serif",
          fontSize: '11px',
          fontWeight: 'bold',
          color: 'var(--red)',
          marginBottom: '5px',
          borderBottom: '0.5px solid rgba(200,169,110,0.3)',
          paddingBottom: '3px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Damage Calculation</span>
          <span style={{ fontSize: '10px', color: '#c0392b' }}>{damageType ? damageType.toUpperCase() : 'DAMAGE'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9.5px', color: 'var(--inkm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', color: 'var(--inkm)' }}>Base Dice:</span>
            <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--ink)' }}>{dice}</span>
          </div>
          {bonus > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
              <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', color: 'var(--inkm)' }}>Flat Bonus:</span>
              <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: '#c0392b' }}>+{bonus}</span>
            </div>
          )}
          {saveText && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
              <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', color: 'var(--inkm)' }}>Saving Throw:</span>
              <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '9.5px', fontWeight: 'bold', color: 'var(--ink)' }}>{saveText}</span>
            </div>
          )}
          <hr style={{ border: 'none', borderTop: '0.5px dashed rgba(200,169,110,0.3)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
            <span>DAMAGE FORMULA:</span>
            <span style={{ fontSize: '12px', color: '#c0392b', letterSpacing: '0.5px' }}>{formula}</span>
          </div>
        </div>
      </div>

      {effectDesc && (
        <div style={{
          fontSize: '9.5px',
          fontFamily: "'Crimson Text', serif",
          color: 'var(--inkm)',
          fontStyle: 'italic',
          textAlign: 'center',
          marginBottom: '12px',
          padding: '0 4px'
        }}>
          "{effectDesc}"
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
        <button 
          onClick={onConfirm}
          className="btn" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '9.5px',
            padding: '4px 18px',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
            border: '1px solid #7d5e1f',
            color: '#1a1005',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}
        >
          💥 Cast / Use
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '9.5px',
            padding: '4px 18px',
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid var(--pb)',
            color: 'var(--ink)'
          }}
        >
          Cancel
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
        🌅 New Day & Spell Preparation
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      
      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '11px', color: 'var(--ink)', lineHeight: 1.4, marginBottom: '12px', textAlign: 'left' }}>
        Select which spell template should be prepared for the new day. Daily resources (Rage, Hit Dice, etc.) will be reset in any case.
      </div>

      <div style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px solid var(--pb)', padding: '10px', borderRadius: '3px', marginBottom: '12px', textAlign: 'left' }}>
        <label style={{ display: 'block', fontSize: '9.5px', fontWeight: 'bold', color: 'var(--red)', marginBottom: '4px' }}>Spell Setup for Today:</label>
        <select 
          value={selected} 
          onChange={(e) => setSelected(e.target.value)}
          className="cinput" 
          style={{ width: '100%', fontSize: '10px', height: '22px', padding: '2px 4px' }}
        >
          <option value="none">Do not prepare spells automatically (empty spellbook)</option>
          <option value="keep">Keep currently prepared spells (Default)</option>
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
          Start Day 🌅
        </button>
        <button 
          onClick={onCancel}
          className="btn" 
          style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '9px', padding: '5px 20px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--pb)', color: 'var(--ink)' }}
        >
          Cancel
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
}

export const RollBreakdownDialog: React.FC<RollBreakdownDialogProps> = ({ title, diceFormula, breakdownItems, onClose }) => {
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

  return (
    <DialogOverlay onClose={onClose} width={255} id="rollBreakdown">
      <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.3px' }}>
        {title.startsWith('🎲') ? title : `🎲 ${title}`}
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {listItems}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5px dashed rgba(200,169,110,0.4)', marginTop: '4px', paddingTop: '4px' }}>
          <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', color: 'var(--inkm)' }}>Total Modifier:</span>
          <span style={{ fontFamily: "'Crimson Text', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>{modsFormatted}</span>
        </div>
      </div>
      
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '8px 0' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'IM Fell English SC', serif", fontSize: '11px', fontWeight: 'bold', color: 'var(--red)' }}>
        <span>ROLL FORMULA:</span>
        <span style={{ fontSize: '13px' }}>{formulaFormatted}</span>
      </div>
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
        🏰 Load Sample Data
      </div>
      <hr style={{ border: 'none', borderTop: '0.5px solid rgba(200, 169, 110, 0.4)', margin: '5px 0 10px' }} />
      
      {isPlayer ? (
        <>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '13px', color: 'var(--ink)', lineHeight: 1.45, marginBottom: '16px', fontWeight: 500, textAlign: 'left' }}>
            Select a sample character with appropriate stats, weapons, and spells to load:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => onConfirm('wizard_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🔮 Wizard (Elf, Level 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                A specialized wizard (Evocation) with an owl familiar and a filled spellbook.
              </span>
            </button>

            <button 
              onClick={() => onConfirm('ranger_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🏹 Ranger (Human, Level 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                An agile ranged combatant with an animal companion (wolf) and matching combat feats for Two-Weapon Fighting / Archery.
              </span>
            </button>

            <button 
              onClick={() => onConfirm('paladin_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🛡️ Paladin (Human, Level 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                An honorable knight with divine magic, auras, and powerful melee attacks (Smite Evil).
              </span>
            </button>

            <button
              onClick={() => onConfirm('trickster_lvl11')}
              className="btn"
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🗡️ Arcane Trickster (Human, Level 11)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                A Rogue 3 / Wizard 5 / Arcane Trickster 3 with sneak attack, spellcasting, and Ranged Legerdemain ready to go.
              </span>
            </button>

            <button
              onClick={() => onConfirm('spellwarp_lvl10')}
              className="btn"
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🎯 Spellwarp Sniper (Human, Level 10)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                A Rogue 1 / Wizard 5 / Spellwarp Sniper 4 with Sudden Raystrike (+2d6), Spellwarp, Ray spells, and 2 Skill Tricks (Spot the Weak Point & Collector of Stories).
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: '13px', color: 'var(--ink)', lineHeight: 1.45, marginBottom: '16px', fontWeight: 500, textAlign: 'left' }}>
            Select which encounter and characters should be loaded. For the Dungeon Master, all three heroes will be created simultaneously:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => onConfirm('party_lvl10')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🐉 Level 10 Hero Encounter</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                Creates 3 level 10 heroes (Wizard, Ranger, Paladin) and positions them against a dragon and giants.
              </span>
            </button>

            <button 
              onClick={() => onConfirm('aranis_only')}
              className="btn" 
              style={{ display: 'flex', flexDirection: 'column', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', background: 'rgba(200,169,110,0.06)', border: '0.5px solid var(--pb)', borderRadius: '3px' }}
            >
              <strong style={{ fontSize: '10px', color: 'var(--red)', fontFamily: "'IM Fell English SC', serif" }}>🛡️ Aranis Only (Paladin Level 3)</strong>
              <span style={{ fontSize: '7.8px', color: 'var(--inkm)', fontFamily: "'Crimson Text', serif", marginTop: '2px' }}>
                Loads a single level 3 paladin for smaller test scenarios.
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
          Close
        </button>
      </div>
    </DialogOverlay>
  );
};

// 7. Parchment Message Dialog (secret message from the Dungeon Master)
interface ParchmentMessageModalProps {
  text: string;
  sender?: string;
  onClose: () => void;
}

export const ParchmentMessageModal: React.FC<ParchmentMessageModalProps> = ({ text, sender = 'Dungeon Master', onClose }) => {
  return (
    <DialogOverlay onClose={onClose} width={480} id="parchmentMessageOverlay">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <h2 style={{ 
          fontFamily: "'IM Fell English SC', serif", 
          color: 'var(--red)', 
          fontSize: '18px', 
          marginBottom: '8px', 
          letterSpacing: '1px',
          borderBottom: '1px solid var(--pb)',
          paddingBottom: '4px',
          width: '100%',
          textAlign: 'center'
        }}>
          ✉️ Message from: {sender}
        </h2>
        
        <div 
          className="parchment-box-inner" 
          style={{ 
            fontFamily: "'Crimson Text', serif", 
            fontSize: '14px', 
            color: 'var(--ink)', 
            lineHeight: 1.5, 
            margin: '15px 0 25px 0',
            textAlign: 'left',
            maxHeight: '300px',
            overflowY: 'auto',
            width: '100%',
            padding: '5px 10px',
            whiteSpace: 'pre-wrap',
            fontStyle: 'italic',
            borderLeft: '3px solid var(--red)',
            paddingLeft: '15px',
            background: 'rgba(200, 169, 110, 0.05)'
          }}
        >
          {text}
        </div>

        <button 
          onClick={onClose}
          className="parchment-close-btn"
          style={{ 
            fontFamily: "'IM Fell English SC', serif", 
            fontSize: '10px', 
            padding: '6px 24px', 
            cursor: 'pointer', 
            background: '#e5cf9c', 
            border: '1px solid #784818', 
            borderRadius: '3px', 
            color: '#482a0e', 
            fontWeight: 'bold', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            outline: 'none'
          }}
        >
          Close
        </button>
      </div>
    </DialogOverlay>
  );
};

