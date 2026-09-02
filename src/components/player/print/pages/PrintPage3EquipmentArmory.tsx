/**
 * @module    PrintPage3EquipmentArmory
 * @summary   Page 3 of the Printable D&D 3.5e Character Sheet (Armor, Magic Item Slots, Inventory, Encumbrance, Wealth).
 */

import React from 'react';

interface PrintPageProps {
  pc: any;
}

export const PrintPage3EquipmentArmory: React.FC<PrintPageProps> = ({ pc }) => {
  const strVal = typeof pc.str?.getValue === 'function' ? pc.str.getValue() : (pc.str?.base || pc.str || 10);
  
  // Calculate Carrying Capacity based on 3.5e tables
  const calculateLoad = (score: number) => {
    const light = Math.round(score <= 10 ? score * 3.3 : (score === 11 ? 38 : score === 12 ? 43 : score === 13 ? 50 : score === 14 ? 58 : score === 15 ? 66 : score === 16 ? 76 : score === 17 ? 86 : score === 18 ? 100 : score === 19 ? 116 : 133));
    const med = Math.round(light * 2);
    const heavy = Math.round(light * 3);
    return {
      light: `${light} lbs. or less`,
      medium: `${light + 1}–${med} lbs.`,
      heavy: `${med + 1}–${heavy} lbs.`,
      liftHead: `${heavy} lbs.`,
      liftGround: `${heavy * 2} lbs.`,
      pushDrag: `${heavy * 5} lbs.`,
    };
  };

  const loads = calculateLoad(strVal);

  // Equipped magic item slots
  const slots: Record<string, string> = {
    Head: pc.equipment?.head?.name || '—',
    Eyes: pc.equipment?.eyes?.name || pc.equipment?.face?.name || '—',
    Neck: pc.equipment?.neck?.name || pc.equipment?.throat?.name || '—',
    Shoulders: pc.equipment?.shoulders?.name || '—',
    Armor: pc.equipment?.armor?.name || pc.armor?.name || '—',
    Torso: pc.equipment?.torso?.name || pc.equipment?.body?.name || '—',
    Arms: pc.equipment?.arms?.name || pc.equipment?.bracers?.name || '—',
    Hands: pc.equipment?.hands?.name || pc.equipment?.gloves?.name || '—',
    'Ring 1': pc.equipment?.ring1?.name || '—',
    'Ring 2': pc.equipment?.ring2?.name || '—',
    Waist: pc.equipment?.waist?.name || pc.equipment?.belt?.name || '—',
    Feet: pc.equipment?.feet?.name || pc.equipment?.boots?.name || '—',
  };

  // Inventory items
  const inventory = (pc.inventory || []).slice(0, 18);
  while (inventory.length < 15) {
    inventory.push({ name: '', isPlaceholder: true });
  }

  // Belt slots (up to 4)
  const beltItems = (pc.beltItems || pc.belt || []).slice(0, 4);

  return (
    <div className="dnd-page">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 className="dnd-header-title">EQUIPMENT &amp; WEALTH</h1>
          <div className="dnd-header-subtitle">v.3.5 Character Record Sheet • Page 3: Gear, Magic Items &amp; Encumbrance</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '7.5pt' }}>
          <strong>Character:</strong> {pc.name || 'Unknown'}
        </div>
      </div>

      {/* Protective Items / Armor & Shield */}
      <div style={{ marginBottom: '8px' }}>
        <div className="dnd-section-banner">Armor &amp; Protective Items</div>
        <table className="dnd-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Item Name</th>
              <th style={{ width: '40px' }}>Type</th>
              <th style={{ width: '35px' }}>AC Bonus</th>
              <th style={{ width: '35px' }}>Max Dex</th>
              <th style={{ width: '40px' }}>Check Pen.</th>
              <th style={{ width: '45px' }}>Spell Fail.</th>
              <th style={{ width: '35px' }}>Weight</th>
              <th style={{ textAlign: 'left' }}>Properties / Special</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{pc.armor?.name || 'None'}</strong></td>
              <td style={{ textAlign: 'center' }}>{pc.armor?.type || '—'}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{pc.armor?.acBonus ? `+${pc.armor.acBonus}` : '—'}</td>
              <td style={{ textAlign: 'center' }}>{pc.armor?.maxDex ? `+${pc.armor.maxDex}` : '—'}</td>
              <td style={{ textAlign: 'center' }}>{pc.armor?.checkPenalty || '0'}</td>
              <td style={{ textAlign: 'center' }}>{pc.armor?.spellFailure ? `${pc.armor.spellFailure}%` : '0%'}</td>
              <td style={{ textAlign: 'center' }}>{pc.armor?.weight ? `${pc.armor.weight} lbs.` : '—'}</td>
              <td>{pc.armor?.notes || 'Equipped Body Armor'}</td>
            </tr>
            <tr>
              <td><strong>{pc.shield?.name || 'None / Off-Hand'}</strong></td>
              <td style={{ textAlign: 'center' }}>{pc.shield?.type || '—'}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{pc.shield?.acBonus ? `+${pc.shield.acBonus}` : '—'}</td>
              <td style={{ textAlign: 'center' }}>—</td>
              <td style={{ textAlign: 'center' }}>{pc.shield?.checkPenalty || '0'}</td>
              <td style={{ textAlign: 'center' }}>{pc.shield?.spellFailure ? `${pc.shield.spellFailure}%` : '0%'}</td>
              <td style={{ textAlign: 'center' }}>{pc.shield?.weight ? `${pc.shield.weight} lbs.` : '—'}</td>
              <td>{pc.shield?.notes || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Main Grid: Magic Item Slots vs Backpack Inventory */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px', flex: 1 }}>
        
        {/* Left Column: Magic Item Slots & Belt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div>
            <div className="dnd-section-banner">Magic Item Slots</div>
            <div className="dnd-box" style={{ padding: '4px' }}>
              {Object.entries(slots).map(([slotName, itemName]) => (
                <div
                  key={slotName}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '6.5pt',
                    borderBottom: '0.5pt solid var(--dnd-gray-light)',
                    padding: '1.5px 0',
                  }}
                >
                  <span style={{ fontWeight: 'bold', color: 'var(--dnd-gray-dark)', width: '45px' }}>{slotName}:</span>
                  <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {itemName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Belt & Quick Potions */}
          <div>
            <div className="dnd-section-banner">Tactical Belt</div>
            <div className="dnd-box" style={{ padding: '4px' }}>
              {beltItems.length === 0 ? (
                <div style={{ fontSize: '6.5pt', color: 'var(--dnd-gray-med)', fontStyle: 'italic' }}>No quick-use items in belt pouches.</div>
              ) : (
                beltItems.map((item: any, i: number) => (
                  <div key={i} style={{ fontSize: '6.5pt', display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                    <span>🧪 {item.name || item}</span>
                    <span style={{ fontWeight: 'bold' }}>x{item.quantity || 1}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Wealth */}
          <div>
            <div className="dnd-section-banner">Wealth &amp; Money</div>
            <div className="dnd-box" style={{ padding: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', textAlign: 'center' }}>
                <div>
                  <div className="dnd-label">PP</div>
                  <div className="dnd-value">{pc.currency?.pp || 0}</div>
                </div>
                <div>
                  <div className="dnd-label">GP</div>
                  <div className="dnd-value" style={{ fontWeight: 'bold', color: '#b7950b' }}>{pc.currency?.gp || pc.money?.gp || 0}</div>
                </div>
                <div>
                  <div className="dnd-label">SP</div>
                  <div className="dnd-value">{pc.currency?.sp || 0}</div>
                </div>
                <div>
                  <div className="dnd-label">CP</div>
                  <div className="dnd-value">{pc.currency?.cp || 0}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Inventory & Encumbrance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Inventory Table */}
          <div>
            <div className="dnd-section-banner">Possessions &amp; Backpack</div>
            <table className="dnd-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Item Description</th>
                  <th style={{ width: '50px' }}>Location</th>
                  <th style={{ width: '30px' }}>Qty</th>
                  <th style={{ width: '35px' }}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: item.isPlaceholder ? 'normal' : 'bold' }}>{item.name || ''}</td>
                    <td style={{ textAlign: 'center', fontSize: '6pt' }}>{item.location || (item.isPlaceholder ? '' : 'Backpack')}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity || (item.isPlaceholder ? '' : '1')}</td>
                    <td style={{ textAlign: 'center' }}>{item.weight ? `${item.weight} lbs.` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Carrying Capacity */}
          <div>
            <div className="dnd-section-banner">Carrying Capacity (STR {strVal})</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '3px' }}>
              <div className="dnd-box" style={{ textAlign: 'center' }}>
                <div className="dnd-label">Light Load</div>
                <div className="dnd-value" style={{ fontSize: '7.5pt' }}>{loads.light}</div>
              </div>
              <div className="dnd-box" style={{ textAlign: 'center' }}>
                <div className="dnd-label">Medium Load</div>
                <div className="dnd-value" style={{ fontSize: '7.5pt' }}>{loads.medium}</div>
              </div>
              <div className="dnd-box" style={{ textAlign: 'center' }}>
                <div className="dnd-label">Heavy Load</div>
                <div className="dnd-value" style={{ fontSize: '7.5pt' }}>{loads.heavy}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              <div className="dnd-box" style={{ textAlign: 'center' }}>
                <div className="dnd-label">Lift Over Head</div>
                <div className="dnd-value" style={{ fontSize: '7pt' }}>{loads.liftHead}</div>
              </div>
              <div className="dnd-box" style={{ textAlign: 'center' }}>
                <div className="dnd-label">Lift Off Ground</div>
                <div className="dnd-value" style={{ fontSize: '7pt' }}>{loads.liftGround}</div>
              </div>
              <div className="dnd-box" style={{ textAlign: 'center' }}>
                <div className="dnd-label">Push or Drag</div>
                <div className="dnd-value" style={{ fontSize: '7pt' }}>{loads.pushDrag}</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Page Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '0.5pt solid var(--dnd-gray-med)', paddingTop: '4px', marginTop: '6px', fontSize: '6.5pt', color: 'var(--dnd-gray-med)' }}>
        <span>The Combatant • D&amp;D 3.5e Automated Campaign Companion</span>
        <span>Character: {pc.name || 'Unknown'} • Page 3 of 4</span>
      </div>
    </div>
  );
};
