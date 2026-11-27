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

## Permanent card design standard

The existing player-facing Campaign → What could happen next possibility cards are the visual reference for Greywake cards. Apply this standard to Campaign, PREP, RUN and WORLD, across all future sessions.

- Reuse the existing card styling and shared components wherever practical: artwork proportions, typography, colours, spacing, category/status labels, title, description and action placement. Inspect the actual reference implementation before changing it; avoid inventing competing card styles.
- Use progressive disclosure: essential information first, with expandable context, guidance and related records. Avoid unnecessary scrolling and navigation during play.
- Adapt density and actions to the workspace: Campaign supports player interest and pursuit; PREP is visually rich and exploratory, with private pinning and shared activation clearly distinct; RUN is a compact, practical variant with focus, encounter controls and resolution; WORLD supports reference browsing.
- New content must inherit the design without session-specific code. Use approved artwork and meaningful placeholders when unavailable.
- Preserve existing interaction behavior, accessibility, responsive layouts and information boundaries. GM-only content must never be included in player-facing payloads or exposed through shared components; client-side hiding is not authorization.
- Review representative cards at desktop and narrow widths, including long text, missing art, expanded details and relevant controls. Verify visual consistency against the player reference and functionality independently before declaring completion.

This is a standing design requirement, not authorization to rewrite existing cards or change campaign state.
