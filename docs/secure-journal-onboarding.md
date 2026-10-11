# Secure Greywake player-journal onboarding

Implemented on branch `feature/secure-journal-20261011`, not deployed.

The live player gate in `player-access.js` uses public, hardcoded character-name codes and localStorage. **It is not authentication.** The journal therefore uses a separate Supabase email one-time-code session. All journal records are protected by database row-level security, not by client filtering.

Backend: existing GREYWAKE Supabase project `tmqxxgzqiccclcjagdsh`.
Tables created by migration `greywake_secure_player_journals`:
- `greywake_journal_members`: only administrators can assign trusted user UUIDs to roles/characters
- `greywake_journal_notes`: players can write their own, GM reads all, no peer reading.

## Required account setup before publishing
1. Ask Carla, Ritchie, Martin and the GM to sign in with their preferred email using the journal sign-in screen. They will initially see "Account not yet connected".
2. The GM or database administrator must confirm each email address and assign the exact Auth user ID to exactly one character/GM role; **never infer role from an unverified email or the client-supplied character code**.
3. In the Supabase SQL editor, after checking identity, run one statement per person:

```sql
insert into public.greywake_journal_members (user_id, character_slug)
values ('REPLACE-WITH-VERIFIED-AUTH-USER-UUID'::uuid, 'velmira');
-- Repeat for 'odie', 'marek' and 'gm' with their respective verified UUIDs.
```

Do not put people's real emails or tokens in the repo. Users can sign out of journal authentication without signing out of the existing Greywake player gate.

## Verification required
- Run local JS syntax check and site navigation/regression tests before merge.
- Confirm email OTP delivery, session refresh and journal rendering.
- As Velmira, create, edit and delete note; refresh and verify persistence.
- Verify HTTP API attempts with the Velmira JWT cannot read, update, or delete Odie/Marek notes or membership records.
- Verify the GM JWT can SELECT notes from all player characters but cannot modify them.
- Confirm no login/notes in GM preview bypass player authentication.
- Verify character sheet tabs, responsive layout, saved state, and existing play resource syncing.
- Do not merge until the authenticated users have been assigned and tested.

## Known limits
- The original player gate remains insecure for existing player-facing material; this change secures **journal records only**.
- Linked notes currently use a text label, not an inline affordance inside each spell/item card.
- No automatic promotion of player-written notes into campaign canon.
