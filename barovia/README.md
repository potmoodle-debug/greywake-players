# Barovia — Daggerheart campaign site prototype

This folder is the first isolated build of a Barovia player site using the successful Greywake principles without changing the Greywake production site.

## Design goals

- Barovia is presented as a living campaign world, not a chapter menu.
- Daggerheart is the rules engine.
- Player-facing records only contain knowledge legitimately learned in play.
- Current possibilities are choices, not assignments.
- Unknown locations stay absent instead of appearing as locked spoilers.
- Relationships are navigable through a simple Player Brain.
- The data layer is deliberately separated from the presentation layer so live-update tooling can be added later.

## Files

- `index.html` — shell and player homepage.
- `style.css` — Gothic visual system.
- `data.js` — player-safe campaign state, records, threads, discoveries and relationships.
- `app.js` — routing, navigation, search, record rendering and Player Brain.

## Next implementation layer

The next layer should add:
1. Daggerheart character sheets and resource tracking.
2. Per-character knowledge.
3. GM-only campaign state.
4. Reactive NPC/faction clocks.
5. A Strahd pressure model.
6. Session journal/live-update bridge.
