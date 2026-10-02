# Greywake Player Archive — v4 clean

This restores the original v1 information architecture and applies only the requested improvements:
- canon Tower establishing image
- approved Great-Shell / Cacklemaw / Stone-Lip imagery
- stronger Player Brain
- Latest Discoveries
- restrained field-archive visual treatment
- unchanged spoiler-safe data boundary

Brannic Hale now uses the same standard `assets/*.jpg` image path pattern as Great-Shell and Cacklemaw.

## Quick verification

Run `node tests/smoke.mjs` before publishing. It checks that navigation categories, relationships, discoveries, media, and files referenced by `index.html` still point to valid records and assets.

Navigation regression check: `node tests/navigation-lifecycle.mjs` verifies Character return, return after refresh, Back/Forward event handling and repeated navigation.

Player catch-up: Home and Updates remember reviewed changes per character on this browser. First visits establish a baseline; preview history is separate. Verify with `node tests/catch-up.mjs`.
