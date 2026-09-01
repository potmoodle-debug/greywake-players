# P9 — Equipment Library & Item Usage

Goal: make equipment selection and use feel like a real character-sheet system without creating a second inventory owner.

## Mechanics-complete scope
- Backpack is the single full inventory-management surface; Ready Gear is summary-only.
- Searchable known-item library supports official Tier 1 weapons, Tier 1 armor, known consumables, ordinary gear, personal gear, and an explicit Other / custom item path.
- Minor Health Potion and Minor Stamina Potion are automated: using one clears 1d4 HP or Stress and decrements quantity.
- Consumables show quantities and support Add one / Use / Remove one, capped at the Daggerheart maximum of five copies.
- Official Tier 1 weapons can be acquired, carried in the two inventory-weapon slots, equipped, switched under pressure for 1 Stress, removed, reacquired, and used through the live sheet.
- Weapon features only apply while equipped. Starting weapons route to their established character action rollers so existing character mechanics are preserved.
- Greatstaff Powerful, Whip Startling, Odie Sneak Attack and Small Dagger Paired are supported through the live weapon flow; Velmira’s Strange Patterns, Adept and Adaptability remain available on applicable rolls.
- Official Tier 1 armor can be acquired first, stored when not worn, then equipped when safe. Active armor updates thresholds, Armor Score, Evasion and Full Plate’s Agility penalty.
- Starting equipment is not permanently protected: once active weapon/armor is replaced, it can be removed like other equipment. Ordinary and personal starting gear can also be removed and added back.
- Removed equipment is included in the synced equipment snapshot so a discarded starting item does not reappear on another device.
- Removing gear that grants an action affects that action; for example, Velmira’s Nomadic Pack action is unavailable while the pack is not carried.
- Lethal damage stores a combined resource/damage checkpoint. Normal Undo or the accidental-death correction control can restore HP and death state together.
- GM preview remains read-only.

## Deliberately deferred
- Visual redesign and item-card artwork. Mechanics are being stabilised before the aesthetic pass.
- Broader future-tier/special-loot catalogue. Availability should remain campaign- and knowledge-driven rather than exposing every item automatically.
