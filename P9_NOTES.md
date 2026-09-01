# P9 — Equipment Library & Item Usage

Goal: make equipment selection and use feel like a real character-sheet system without creating a second inventory owner.

## Current slice
- Backpack is the single full inventory-management surface; Ready Gear is summary-only.
- Adds a searchable known-item library to Backpack.
- Library only exposes official Daggerheart items that are also established as known in Greywake.
- Minor Health Potion and Minor Stamina Potion are automated: using them clears 1d4 HP or Stress and decrements the quantity.
- Consumables show quantity controls and can be increased up to the Daggerheart maximum of five copies.
- Official Tier 1 weapons can be acquired, equipped and used through the live sheet.
- Official Tier 1 armor can be acquired first, stored when not worn, then equipped when safe.
- Starting equipment is not permanently protected: once an active weapon/armor is replaced, it can be removed like other equipment. Ordinary starting gear can also be removed.
- Equipped gear must be replaced/unequipped before removal so stale mechanical effects cannot remain on the live sheet.
- GM preview remains read-only.

## Next P9 slices
- Expand the known official catalogue deliberately, rather than exposing the full loot table.
- Consolidate remaining equipment-state compatibility layers after the player-facing flow is proven.
- Add item-card art after mechanics are stable.
