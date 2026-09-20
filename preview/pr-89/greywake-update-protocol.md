# Greywake Live Update Protocol

This file defines the one-way handoff from live play into Greywake's private canon and player-facing site.

## Purpose

A live session produces events. Those events are not automatically canon and are not automatically player-facing. The update step classifies each event before anything is written anywhere.

The update pipeline is:

`LIVE PLAY CHAT -> UPDATE GREYWAKE -> OBSIDIAN PRIVATE CANON -> SAFE SITE CHANGES`

## Update payload

Each handoff should be represented in this shape:

```json
{
  "session": {
    "id": "YYYY-MM-DD-short-name",
    "source": "live-play-chat",
    "captured_at": "ISO-8601 timestamp"
  },
  "events": [
    {
      "summary": "What actually happened at the table",
      "status": "revealed|provisional|canon",
      "knowledge": {
        "marek": "known|partial|unknown",
        "odie": "known|partial|unknown",
        "velmira": "known|partial|unknown"
      },
      "obsidian": {
        "write": true,
        "targets": ["note/path-or-record-name"],
        "private_text": "GM-facing factual update only"
      },
      "site": {
        "publish": false,
        "targets": [],
        "player_text": ""
      }
    }
  ]
}
```

## Classification rules

### 1. What happened at the table

Record only events that were actually established in play. Do not promote an untested GM idea, possibility, interpretation or prediction into canon.

### 2. Private truth and provisional truth

GM-only material stays in the `obsidian` side of the payload.

It must never enter `site.player_text` unless it became knowable in play and is appropriate for the intended player/character audience.

### 3. Character knowledge

Knowledge is tracked separately for Marek, Odie and Velmira.

A fact known by one character is not assumed to be known by the others.

### 4. Site publication

`site.publish` is true only when the information is safe for the player-facing layer.

Safe means all of the following are true:

- it was established or revealed in play;
- it is not GM-only provisional truth;
- publishing it does not give a character knowledge they did not obtain;
- it belongs on the Greywake site rather than only in the private campaign record.

When in doubt, leave `site.publish` false.

### 5. Obsidian authority

Obsidian is the private campaign record and source of truth.

The Greywake site is a derived live/player-facing presentation layer. If site content conflicts with the Obsidian canon record, the private canon record wins and the site should be corrected.

## Update Greywake handoff prompt

The Live Play chat should hand the Update Greywake chat only the minimum factual record needed to perform the update:

```text
UPDATE GREYWAKE

Review the live-play events below and produce one Greywake update payload.

Rules:
- Separate established events from provisional GM truth.
- Never publish GM-only information to the player-facing site.
- Track Marek, Odie and Velmira knowledge separately.
- Obsidian is the private source of truth.
- The Greywake site receives only safe player-facing consequences and discoveries.
- Do not invent missing events or outcomes.
- If a fact was not established in play, leave it provisional or omit it.

LIVE EVENTS:
{{LIVE_PLAY_EVENTS}}
```

## Update chat completion checklist

Before reporting an update complete, the updater must confirm all four outcomes explicitly:

1. `Obsidian private canon` — what changed, or `no change`.
2. `Character knowledge` — Marek / Odie / Velmira.
3. `Greywake site` — what was published, or `no player-facing change`.
4. `Unresolved/provisional` — anything deliberately left outside canon.

An update is not complete merely because a summary was written in chat.

## Failure behaviour

If Obsidian cannot be written directly, do not pretend the update completed. Return the exact Obsidian patch required and mark the pipeline `OBSIDIAN WRITE PENDING`.

If the site cannot be written directly, keep Obsidian authoritative, return the exact safe site patch required, and mark `SITE WRITE PENDING`.

If neither destination can be written, classify the events and return both exact patches. Do not claim persistence.
