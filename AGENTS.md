# Greywake — Standing development instructions

## Permanent campaign workspace architecture

Apply these requirements to every change, regardless of the current campaign session.

- PREP and RUN are permanent, session-independent workspaces. New sessions require content and state changes, not website code changes.
- Do not hardcode session numbers, specific card IDs, locations, characters, source paths or scenario-specific guidance in generic interface logic. Migrate legacy dependencies safely rather than extending them.
- Use stable content identifiers, explicit session or reusable scope, data-driven context and per-card source references.
- PREP must surface immediately relevant material by default while retaining a searchable, reusable preparation library. Unused material remains available until deliberately revised, retired or archived. Relevance follows established world state and player decisions, not a predetermined storyline.
- RUN must support reusable scene, encounter, reference, character-context and capture components. Preserve working reference order, focus and collapsed state across navigation and refresh. Explain unavailable sources instead of silently losing the workspace.
- Session rollover must archive previous play without discarding reusable preparation or carrying stale active encounters forward.
- New locations, creatures, factions, hazards, characters and encounters must integrate through existing extensible systems. Conversational reference sets and rehearsal tools follow the same requirements.
- Keep GM preparation, actual play, established canon and player knowledge distinct. Never publish private material, sensitive paths or credentials in public code, static assets or served fields. Client-side role switching is not an authorization boundary. Rehearsal must not modify real campaign state.
- Preserve existing functionality and data. Inspect current implementation and sources before changing them. Do not overwrite concurrent work. Keep changes scoped and report unverified stages.

## Required acceptance gate

Would the feature still work in Session Fifty, somewhere completely different, with different characters, encounters and objectives, without rewriting the website?

If not, generalize the implementation or explicitly report the limitation before declaring it complete.

Test both the current workflow and an isolated hypothetical future session. Cover reuse, rollover, source resolution, privacy, and workspace persistence where affected. Run applicable existing regression tests. Distinguish code committed, tests executed, deployment verified and live acceptance verified. Never represent a commit alone as successful deployment.

The private campaign operating protocol remains authoritative for private-source and publication workflows. Do not copy private content into this repository.
