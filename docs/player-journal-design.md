# Greywake — Player Journal and Personal Explanations

Status: implementation design, not deployed. Requested after 11 October 2026 session from Carla's Velmira feedback.

## User need
- Players write their own session notes, ideas, reminders, relationships, and suspicions directly on their character sheets.
- Players can add a plain-language explanation beside an existing spell, ability, item, or description.
- Notes are persistent across devices.

## Access rule (approved)
- A player can create/read/update/delete only their own notes.
- GM can read notes from every player.
- One player cannot read another player's notes.
- Personal notes never automatically become canon and never modify base mechanics or official rules text.
- GM may see all notes; player UI must make this clear, not label them 'private'.

## Interface
- Add a quiet 'Journal' tab or equivalent section on each character sheet, avoiding a large intrusive button.
- At the top, provide a quick 'Write a note...' area with autosave indication and last-saved state.
- Notes can have headings, body text, session date, optional categories: Session, People, Places, Clues, To remember, Character thoughts.
- Chronological order by default, with search, edit, delete and optional pinning.
- Add small 'Add my note' affordance to abilities/spells/items/known people/places; create a contextual note tied to a stable record ID.
- Show the original rule/description unchanged and a clearly separated 'In my words' player-authored section.
- On GM side provide a consolidated read-only player-notes view grouped by character; GM should not silently alter player-authored notes.
- Inline copy warns: 'Your notes are visible to the GM, but not to other players.'

## Storage and security
- Do not use localStorage as the sole store: it won't sync between devices and does not enforce privacy.
- Prefer the site's existing authenticated backend if one exists; first audit identity/role and persistence architecture.
- Server-enforce row-level permissions: player_id = authenticated user for player access, or verified GM role for GM read.
- Never rely solely on hidden UI routes or client-side filters to protect other players' notes.
- Store at least: id, campaign_id, owner_user_id, character_id, body, title, category, linked_entity_type, linked_entity_id, session_date, created_at, updated_at.
- Keep journal data separate from canonical content and gameplay mechanics.
- Handle save failures without losing typed text; support keyboard/mobile usage and accessible labels.

## Rollout / acceptance
1. Verify which repository and backend power the current live character sheets before editing production code.
2. Confirm actual login identity for Velmira, Odie, Marek and GM; do not equate selected-character UI with authentication.
3. Create a note as Velmira, refresh and sign in on another device: note remains.
4. Sign in as Odie and Marek: neither can access Velmira's note via UI or direct API request.
5. Sign in as GM: can read Velmira's note with correct attribution.
6. Add a personal rewrite of a spell; original Daggerheart rule wording is untouched.
7. Verify notes cannot write to canon records or update gameplay stats.
8. Verify navigation, sheet rendering, responsiveness, and existing player catch-up functions remain unchanged.

## Non-goals
- No automatic lore promotion or AI assumption that player theories are facts.
- No shared party notes in first release.
- No GM edit of player journal entries.
