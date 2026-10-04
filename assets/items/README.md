# Greywake Item Image Assets

This directory is the canonical home for carried-item artwork used by the player Backpack.

## Purpose

Item images should answer **“What does this object actually look like in Greywake?”** They are reference photographs/prop images first and decorative fantasy art second.

UI borders, labels, badges, rarity treatment and interaction controls belong in CSS/JavaScript, not inside the image.

## Required image spec

- Final format: **WebP**
- Final size: **1200 × 675 px**
- Aspect ratio: **16:9**
- Recommended source master: PNG or lossless source at equal or higher resolution
- Preferred final file size: roughly **70–250 KB**
- No text baked into the image
- No card frames or UI decoration baked into the image
- Keep the object readable when cropped with `object-fit: cover`
- Keep useful negative space around the object
- No modern objects visible
- No people or hands unless essential to understanding scale/function

## Shared Greywake visual language

Treat each image as a real object from Greywake photographed by an exceptional documentary/prop photographer:

- practical desert-fantasy construction
- dusty, sun-worn, repaired and repeatedly used
- tactile cloth, wood, leather, bone, ceramic and salvaged metal
- naturalistic directional light
- restrained earth palette
- realistic material wear
- no generic glowing loot effects
- no ornamental high-fantasy excess unless canon requires it
- no steampunk styling; Odie's prosthetic should look ingenious but built from ordinary Greywake materials

## Folder structure

```text
assets/items/
  common/
    torch.webp
    rope-50ft.webp
    basic-supplies.webp
    minor-health-potion.webp

  marek/
    shortstaff.webp
    round-shield.webp
    gambeson.webp
    rocks-and-bones.webp
    pale-thread-membrane.webp

  velmira/
    greatstaff.webp
    whip.webp
    leather-armor.webp
    leather-satchel.webp
    nomadic-pack.webp
    translation-book.webp

  odie/
    spear.webp
    small-dagger.webp
    grappling-hook.webp
    prosthetic-arm.webp
    oldwork-finger.webp
```

The existing permanent stamina potion remains at:

```text
assets/consumables/minor-stamina-potion.webp
```

Odie and Marek currently both use Gambeson Armor mechanically. Until there is a reason to depict visibly different personal sets, Marek's `gambeson.webp` can be reused by the card system or a dedicated Odie version can be added later without changing inventory logic.

## Integration

`item-visuals.js` is the single mapping between inventory names and artwork paths.

Each entry includes:

- `asset` — final WebP path
- `fallbackArt` — current self-contained placeholder art
- `meta` — short card description
- `story` — marks personal/story items where applicable
- `ready` — optional flag for an asset known to exist already

The Backpack should always render the fallback underneath the raster image. If a WebP is absent or fails to load, the image is removed and the placeholder remains visible. This means final assets can be added one by one without breaking the site.

## Priority order

1. Odie — prosthetic arm
2. Odie — Oldwork Finger
3. Marek — Pale Thread membrane sample
4. Velmira — Nomadic Pack
5. Velmira — translation book
6. Marek — rocks and bones
7. PC primary/secondary weapons
8. armor
9. common utility gear

## Naming rules

- lowercase
- hyphen-separated
- no spaces
- no version numbers in canonical filenames
- one canonical filename per object
- replace the file to revise artwork rather than creating `-v2`, `-final`, etc.

Cache-busting belongs in the page/script versioning, not the asset filename.
