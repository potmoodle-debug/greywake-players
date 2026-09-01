# P9 — Equipment Library & Item Usage

Goal: make equipment selection and use feel like a real character-sheet system without creating a second inventory owner.

## Current slice
- Adds a searchable known-item library to Backpack.
- Library only exposes official Daggerheart items that are also established as known in Greywake.
- Minor Health Potion and Minor Stamina Potion are automated: using them clears 1d4 HP or Stress and removes/decrements the carried item through the existing owners.
- Existing equipped/consumable controls remain owned by `equipment-system-v2.js`.
- Existing Backpack remains the owned inventory surface; P9 selects through its existing add/remove controls instead of writing a parallel inventory.
- GM preview remains read-only.

## Next P9 slices
- Expand known official catalogue deliberately, rather than exposing the full loot table.
- Fold official weapon/armor acquisition into the equipment owner so newly acquired weapons and armor can be equipped and alter the live sheet.
- Enforce the Daggerheart maximum of five copies per consumable.
- Add item-card art after mechanics are stable.
