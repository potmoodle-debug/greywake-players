# Character-knowledge projection — isolated reference model

**Status: prototype only.** Not loaded by the current website, not an authorization implementation, not a data migration. Contains only fictional synthetic fixtures unrelated to the live campaign.

- Stable subject and claim identifiers; immutable revision history with one latest effective revision.
- Explicit publication status, scope, certainty, tier and internal source reference. Public output is tier-one approved common knowledge only. Individually known and shared-party information use explicit per-recipient grants with their own acquisition and tier.
- Grant a specific revision to an evidenced character; a new character does not inherit an earlier party's discoveries. A correction invalidates stale approvals. Keep old revisions as historical evidence.
- Production server resolves identities from verified credentials and authoritative membership; never accept role or character scope from a browser. Project only allowlisted fields before sending data. Private claims, source references and assets never enter static outputs.
- All subject views, search, relationships, updates, recap excerpts, map/route references and shop knowledge must consume the same authorized projection. Relationships themselves need audience-scoped evidence; the helper only filters endpoints of already-authorized edges.
- Preserve existing live data. Reconcile legacy knowledge rows and audience metadata before migration. Do not create a second independent knowledge store.
- Tests: `node tests/knowledge-projection.cjs`. These validate projection semantics using synthetic fixtures, not network authorization, SQL policies, actual character content, rendering, or deployment.
