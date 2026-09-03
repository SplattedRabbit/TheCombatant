import React from 'react';
import { ARMOR_REGISTRY } from '@core/data/armor-data.js';
import { extractStatValue } from '../../attributeHelper';
import { isConsumableItem } from '../../armory/armoryHelpers';

interface PrintPageProps {
  pc: any;
}

export const PrintPage3EquipmentArmory: React.FC<PrintPageProps> = ({ pc }) => {
  const strVal = extractStatValue(pc.str, 10);
  
  // Calculate Carrying Capacity based on D&D 3.5e tables
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

  // Armor & Shield data resolution
  const armorsList = Array.isArray(pc.armors) ? pc.armors : [];
  const equippedArmor = armorsList.find((a: any) => a.isEquipped && !a.isShield) || pc.armor || null;
  const equippedShield = armorsList.find((a: any) => a.isEquipped && a.isShield) || pc.shield || null;

  const getArmorName = (a: any) => {
    if (!a) return 'None';
    const reg = (ARMOR_REGISTRY as any)[a.type];
    const baseName = a.name || reg?.nameEn || reg?.nameDe || a.type;
    const enh = a.enhancement ? `+${a.enhancement} ` : '';
    return `${enh}${baseName}`;
  };

  const getArmorBonus = (a: any) => {
    if (!a) return '—';
    const baseBonus = typeof a.armorBonus === 'number' ? a.armorBonus : (a.bonus || a.acBonus || 0);
    const enh = a.enhancement || 0;
    const total = baseBonus + enh;
    return total > 0 ? `+${total}` : '0';
  };

  const getArmorType = (a: any) => {
    if (!a) return '—';
    if (a.isShield) return 'Shield';
    const reg = (ARMOR_REGISTRY as any)[a.type];
    return reg?.speedCategory ? reg.speedCategory.charAt(0).toUpperCase() + reg.speedCategory.slice(1) : (a.type || 'Armor');
  };

  const getArmorMaxDex = (a: any) => {
    if (!a) return '—';
    return a.maxDex !== null && a.maxDex !== undefined ? `+${a.maxDex}` : '—';
  };

  const getArmorCheckPenalty = (a: any) => {
    if (!a) return '0';
    return a.checkPenalty ? `${a.checkPenalty}` : '0';
  };

  const getArmorSpellFailure = (a: any) => {
    if (!a) return '0%';
    return a.spellFailure ? `${a.spellFailure}%` : '0%';
  };

  const getArmorWeight = (a: any) => {
    if (!a) return '—';
    return a.weight ? `${a.weight} lbs.` : '—';
  };

  // Magic item items list
  const items: any[] = Array.isArray(pc.items) ? pc.items : (Array.isArray(pc.inventory) ? pc.inventory : []);

  // Helper to find equipped item in a specific body slot
  const getEquippedInSlot = (slotKey: string, ...aliases: string[]) => {
    const allKeys = [slotKey, ...aliases];
    const found = items.find((i: any) => i && i.isEquipped && !isConsumableItem(i) && allKeys.includes(i.slot));
    if (found) return found.name || '—';
    for (const k of allKeys) {
      if (pc.equipment?.[k]?.name) return pc.equipment[k].name;
    }
    return '—';
  };

  // 12 Body Slots
  const slots: Record<string, string> = {
    Head: getEquippedInSlot('head'),
    Eyes: getEquippedInSlot('eyes', 'face'),
    Neck: getEquippedInSlot('neck', 'throat'),
    Shoulders: getEquippedInSlot('shoulders'),
    Armor: equippedArmor ? getArmorName(equippedArmor) : getEquippedInSlot('body', 'armor'),
    Torso: getEquippedInSlot('torso'),
    Arms: getEquippedInSlot('wrists', 'arms', 'bracers'),
    Hands: getEquippedInSlot('hands', 'gloves'),
    'Ring 1': getEquippedInSlot('ring1', 'ring'),
    'Ring 2': getEquippedInSlot('ring2'),
    Waist: getEquippedInSlot('waist', 'belt'),
    Feet: getEquippedInSlot('feet', 'boots'),
  };

  // Tactical Belt items
  const rawBeltItems = items.filter((i: any) => i && (i.isTacticalBelt || i.slot === 'belt_quick'));
  const beltItems = rawBeltItems.length > 0 
    ? rawBeltItems.slice(0, 4)
    : items.filter((i: any) => isConsumableItem(i)).slice(0, 4);

  // Possessions & Backpack Inventory items
  const backpackItems = items.filter((i: any) => !i.isEquipped || isConsumableItem(i) || (!i.slot || i.slot === 'slotless'));
  const inventory = [...backpackItems.slice(0, 15)];
  while (inventory.length < 13) {
    inventory.push({ name: '', isPlaceholder: true });
  }

  // Currency & Total Carried Weight
  const pp = pc.currency?.pp || 0;
  const gp = pc.currency?.gp || pc.money?.gp || pc.gp || 0;
  const sp = pc.currency?.sp || pc.money?.sp || pc.sp || 0;
  const cp = pc.currency?.cp || pc.money?.cp || pc.cp || 0;

  const armorWeight = (parseFloat(equippedArmor?.weight) || 0) + (parseFloat(equippedShield?.weight) || 0);
  const weaponsWeight = (pc.weapons || []).reduce((sum: number, w: any) => sum + (parseFloat(w.weight) || 0), 0);
  const itemsWeight = items.reduce((sum: number, i: any) => sum + ((parseFloat(i.weight) || 0) * (parseInt(i.count) || parseInt(i.quantity) || 1)), 0);
  const coinsWeight = Math.floor((pp + gp + sp + cp) / 50);
  const totalWeight = Math.round((armorWeight + weaponsWeight + itemsWeight + coinsWeight) * 10) / 10;

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
              <th style={{ width: '45px' }}>Type</th>
              <th style={{ width: '35px' }}>AC Bonus</th>
              <th style={{ width: '35px' }}>Max Dex</th>
              <th style={{ width: '40px' }}>Check Pen.</th>
              <th style={{ width: '45px' }}>Spell Fail.</th>
              <th style={{ width: '35px' }}>Weight</th>
              <th style={{ textAlign: 'left' }}>Properties / Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{getArmorName(equippedArmor)}</strong></td>
              <td style={{ textAlign: 'center' }}>{getArmorType(equippedArmor)}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{getArmorBonus(equippedArmor)}</td>
              <td style={{ textAlign: 'center' }}>{getArmorMaxDex(equippedArmor)}</td>
              <td style={{ textAlign: 'center' }}>{getArmorCheckPenalty(equippedArmor)}</td>
              <td style={{ textAlign: 'center' }}>{getArmorSpellFailure(equippedArmor)}</td>
              <td style={{ textAlign: 'center' }}>{getArmorWeight(equippedArmor)}</td>
              <td>{equippedArmor?.notes || (equippedArmor ? 'Equipped Body Armor' : '—')}</td>
            </tr>
            <tr>
              <td><strong>{getArmorName(equippedShield)}</strong></td>
              <td style={{ textAlign: 'center' }}>{getArmorType(equippedShield)}</td>
              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{getArmorBonus(equippedShield)}</td>
              <td style={{ textAlign: 'center' }}>{getArmorMaxDex(equippedShield)}</td>
              <td style={{ textAlign: 'center' }}>{getArmorCheckPenalty(equippedShield)}</td>
              <td style={{ textAlign: 'center' }}>{getArmorSpellFailure(equippedShield)}</td>
              <td style={{ textAlign: 'center' }}>{getArmorWeight(equippedShield)}</td>
              <td>{equippedShield?.notes || (equippedShield ? 'Equipped Shield' : '—')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Main Grid: Magic Item Slots vs Backpack Inventory */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px', flex: 1 }}>
        
        {/* Left Column: Magic Item Slots & Belt & Wealth */}
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
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>
                      🧪 {item.name || item}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>x{item.count || item.quantity || 1}</span>
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
                  <div className="dnd-value">{pp}</div>
                </div>
                <div>
                  <div className="dnd-label">GP</div>
                  <div className="dnd-value" style={{ fontWeight: 'bold', color: '#b7950b' }}>{gp}</div>
                </div>
                <div>
                  <div className="dnd-label">SP</div>
                  <div className="dnd-value">{sp}</div>
                </div>
                <div>
                  <div className="dnd-label">CP</div>
                  <div className="dnd-value">{cp}</div>
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
                  <th style={{ width: '55px' }}>Location</th>
                  <th style={{ width: '30px' }}>Qty</th>
                  <th style={{ width: '35px' }}>Weight</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item: any, idx: number) => {
                  const qty = item.isPlaceholder ? '' : (item.count || item.quantity || 1);
                  const wt = item.isPlaceholder || !item.weight ? '' : `${item.weight * (parseInt(qty) || 1)} lbs.`;
                  const loc = item.isPlaceholder ? '' : (item.location || (item.slot && item.slot !== 'slotless' ? item.slot : 'Backpack'));

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: item.isPlaceholder ? 'normal' : 'bold' }}>{item.name || ''}</td>
                      <td style={{ textAlign: 'center', fontSize: '6pt', textTransform: 'capitalize' }}>{loc}</td>
                      <td style={{ textAlign: 'center' }}>{qty}</td>
                      <td style={{ textAlign: 'center' }}>{wt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Carrying Capacity & Total Weight */}
          <div>
            <div className="dnd-section-banner">
              <span>Carrying Capacity (STR {strVal})</span>
              <span style={{ fontSize: '5.5pt', fontWeight: 'normal', textTransform: 'none' }}>
                Total Carried: <strong>{totalWeight} lbs.</strong>
              </span>
            </div>
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
