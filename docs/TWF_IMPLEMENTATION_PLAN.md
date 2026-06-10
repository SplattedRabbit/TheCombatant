# Implementation Plan: Two-Weapon Fighting & Double Weapons (3.5e RAW)

Implement explicit Hand selection (Haupthand/Nebenhand) dropdowns, apply D&D 3.5e RAW two-weapon fighting attack roll penalties (including Ranger virtual combat style feats), warn users who equip off-hand weapons without two-weapon fighting feats, and support dual-wielding double weapons (e.g., Kampfstab).

## User Review Required

> [!IMPORTANT]
> **Ranger Combat Style Virtual Feats (3.5e RAW):**
> According to the D&D 3.5e Player's Handbook (page 48/5930), a Ranger of level 2+ with the `twoweapon` style is treated as having:
> - `two_weapon_fighting` (Level 2+)
> - `improved_two_weapon_fighting` (Level 6+)
> - `greater_two_weapon_fighting` (Level 11+)
> 
> *However*, these benefits apply **only when wearing light or no armor**. If wearing medium or heavy armor, they are suspended. 
> We will implement this check dynamically in the combat engine and warnings!
> 
> **Warning for Off-Hand Wielding without Feats:**
> When selecting "Nebenhand" or equipping an off-hand weapon, we will check if the character possesses the feat `two_weapon_fighting` (either as a regular feat or virtually via Ranger style in light/no armor). If not, we will display a custom confirmation warning about the severe attack penalties (`-4/-8` or `-6/-10`).
> 
> **Double Weapons Wielding Dialog:**
> Equipping a double weapon (registry has `isDouble: true`) will trigger a custom modal dialog overlay:
> 1. **Zweihändig (Einzelwaffe):** Equips the weapon normally in the Haupthand slot (two-handed grip, 1.5x Str bonus on damage).
> 2. **Doppelwaffe (Beide Enden):** Equips the weapon as a double weapon, rendering it in both slots, enabling dual-attack rolls (primary gets 1.0x Str bonus, off-hand gets 0.5x Str bonus and is treated as light).
> 3. **Abbrechen:** Aborts equipping.

---

## Proposed Changes

### Core Models

#### [MODIFY] [Weapon.js](file:///c:/Users/Juls/Desktop/CombatApp/js/models/Weapon.js)
- Add `isDouble: true` to the `quarterstaff` entry in `WeaponRegistry`.
- Extend the `Weapon` constructor to initialize two new fields:
  * `this.hand = w.hand || 'main';` (either `'main'` or `'off'`)
  * `this.isDoubleWielded = w.isDoubleWielded || false;` (boolean for double weapons)
- Include `hand` and `isDoubleWielded` in the `toJSON()` serialization.

---

### State Management

#### [MODIFY] [PCManager.js](file:///c:/Users/Juls/Desktop/CombatApp/js/state/PCManager.js)
- Refactor `togglePCWeaponEquip(idx)`:
  * If the weapon is two-handed (`2h`/`rng`), enforce `hand = 'main'` and `isDoubleWielded = false`, then unequip all other weapons/shields.
  * If the weapon is equipped as a double End (`isDoubleWielded === true`):
    * Enforce `hand = 'main'`.
    * Unequip all other weapons and shields.
    * Leave `isDoubleWielded = true`.
  * If one-handed/light:
    * If `hand === 'main'`, unequip other main-hand weapons.
    * If `hand === 'off'`, unequip other off-hand weapons and shields.
- Update `updatePCWeapon(idx, key, val)`:
  * Call `recalculatePCStats(pc)` to keep stats like AC in sync when `hand` or `isDoubleWielded` changes.

---

### Rules & Combat Engine

#### [MODIFY] [AttackEngine.js](file:///c:/Users/Juls/Desktop/CombatApp/js/rules/AttackEngine.js)
- Update `hasFeat` checker in `buildContext` (around line 20) to dynamically check for virtual feats:
  * If a character is a Ranger of level >= 2 with `rangerCombatStyle === 'twoweapon'`, and the equipped armor's `speedCategory` is NOT `'medium'` and NOT `'heavy'`, we treat them as having:
    * `two_weapon_fighting` (level 2+)
    * `improved_two_weapon_fighting` (level 6+)
    * `greater_two_weapon_fighting` (level 11+)
- Update off-hand weapon resolution in `calculateTWFPenalties` and `appendOffhandAttacks`:
  * Retrieve the off-hand weapon as either:
    1. A separate weapon with `isEquipped` and (`hand === 'off'` or `grip === 'sec'`).
    2. The main-hand weapon itself if `mainWeapon.isDoubleWielded` is true.
  * Adjust `isOhLight`:
    `const isOhLight = isLightWeapon(offhandWeapon) || offhandWeapon.isDoubleWielded;`
- Apply Two-Weapon Fighting penalties to attack sequences during full attack:
  * If `offhandWeapon` is present:
    * If has `two_weapon_fighting` feat (real or virtual):
      * If `isOhLight`: penalty is `-2` primary / `-2` offhand.
      * Else: penalty is `-4` primary / `-4` offhand.
    * If does NOT have feat:
      * If `isOhLight`: penalty is `-4` primary / `-8` offhand.
      * Else: penalty is `-6` primary / `-10` offhand.
    * Subtract the primary penalty from all primary hand attacks.
    * Subtract the off-hand penalty from all off-hand attacks.

---

### UI Components

#### [MODIFY] [BaseDialogs.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/dialogs/BaseDialogs.js)
- Modify `showCustomConfirm(title, message, onConfirm, onCancel)` to accept and execute `onCancel` when the "Nein" button is clicked.

#### [MODIFY] [PCOffense.js](file:///c:/Users/Juls/Desktop/CombatApp/js/ui/components/player/PCOffense.js)
- **Weapon Card rendering:**
  * Add the `Haupthand` / `Nebenhand` dropdown selection box next to the enhancement modifier in the inventory stash card.
  * Disable the dropdown (locking it to `Haupthand`) if the weapon grip is `2h` or `rng`.
  * Bind dropdown changes:
    * When selecting "Nebenhand", check if the PC has `two_weapon_fighting` (real or virtual). If missing, show `showCustomConfirm` warning. If canceled, reset selection to `Haupthand`.
    * Update the state via `CombatState.updatePCWeapon(idx, 'hand', value)`.
- **Equipping Logic:**
  * If equipping a double weapon (registry has `isDouble: true`), show a custom overlay choice dialog: "Zweihändig (Einzelwaffe)", "Doppelwaffe (Beide Enden)", or "Abbrechen".
  * If "Zweihändig", set `isDoubleWielded = false` and equip.
  * If "Doppelwaffe", set `isDoubleWielded = true` and equip.
- **Active Slot rendering:**
  * Render the slots based on hand choice:
    * Haupthand: weapon with `hand === 'main'` (or double weapon).
    * Nebenhand: weapon with `hand === 'off'` (or duplicate double weapon if `isDoubleWielded` is true).
  * If double wielded, display the weapon in the Nebenhand slot labeled "Nebenhand (Nebenseite)".
  * Ensure the attack and damage roll buttons on the Nebenhand slot trigger with `{ isOffhandAttack: true }` so the damage roll resolves with 0.5x Str modifier.

---

## Verification Plan

### Automated Tests
- Run `cmd.exe /c npm test` to ensure all 76 tests are green.
- Add test coverage verifying two-weapon fighting penalties, Ranger combat style suspension, and double weapons.

### Manual Verification
- Equip a weapon in the main hand and one in the off-hand, verify the correct penalties are added to the attack buttons.
- Equip a weapon in the offhand without the TWF feat, verify that a confirmation warning appears.
- Equip a Quarterstaff (Kampfstab) in both modes (single vs double) and check rendering and roll sequences.
- Equip medium/heavy armor on a Ranger, verify that combat style feats are suspended (penalties increase).
