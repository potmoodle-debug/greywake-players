# Greywake journal — unchanged player login

## Fixed user requirement
Keep the existing Greywake entrance exactly unchanged: same player selection, same character passwords, no email, no added PIN, no second sign-in. This branch does **not** modify `player-access.js`.

## In-progress work
- Character sheets gain a Journal tab.
- Journal UI uses `window.GreywakePlayer` for the existing character selection.
- Notes are grouped by Velmira, Odie, and Marek; GM can select and read all three; player edits remain restricted to the selected character at the API layer.
- A separate database table `public.greywake_character_journal` has been created in the existing GREYWAKE Supabase project, with public access revoked and RLS enabled.
- Browser UI calls the intended `/functions/v1/character-journal` endpoint.

## Blocking work before publishing
**The `character-journal` Edge Function has not been deployed. The attempted deployment was blocked; consequently notes cannot currently be loaded or saved.** Do not merge or publish this branch until the endpoint has been successfully implemented and tested.

The intended server function should:
1. Validate the supplied existing character code and character name on every request.
2. Never accept a player-selected alternate character slug for reads or writes.
3. Allow the verified GM code to read all three journals, never edit them.
4. Perform all database access server-side using a service credential that is never sent to the browser.
5. Limit text lengths, validate UUIDs, filter UPDATE/DELETE by both ID and owner character, and use only allowed methods.
6. Rate-limit access attempts and avoid accidental exposure through caching or logs.
7. Test cross-player access including direct HTTP requests, not just hidden UI controls.

### Known security tradeoff
The existing site defines its character codes in browser-delivered JavaScript. They are not secret from someone who inspects the source. Therefore server checks using those same codes offer **trust-based separation, not strong access control**. The user explicitly prioritised unchanged player login over upgrading authentication. Do not advertise the journals as secure against malicious player impersonation under this model.

## Verification
- Confirm the original entry screen and password behaviour are unchanged.
- Confirm the Journal tab appears on all three sheets and no email form appears anywhere.
- Check note create, refresh, edit and delete on a real device.
- Check GM can read each character's notes but cannot edit them.
- Verify direct API access rejects another character with a mismatched code, and confirm no unauthenticated anonymous database reads.
- Verify original character stats, ability rendering and all tab navigation still work.
