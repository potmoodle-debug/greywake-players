# Greywake Pages publication

One authoritative workflow: **Deploy Greywake Pages** (`.github/workflows/pages.yml`).
It runs on main changes and manual dispatch, validates campaign data before building assets,
then uploads the site. Build-generated files stay in the artifact; the workflow does not push commits.
The former v3 publishing workflow is retired; v3 files are included in the same build.

## Required repository setting (one-time)

In Settings → Pages → Build and deployment, set Source to **GitHub Actions**.
Do not use Deploy from a branch in parallel: it can publish unvalidated content.
Verify a successful run of Deploy Greywake Pages and open the live site.

## Session rollover

Update the release object in the campaign state along with the recap, active party,
GM preparation and player home references. The validator checks these relationships
without hardcoding the current session, characters or location.
Run `python3 tests/campaign-state-consistency.py` locally (requires Node.js).

The validator checks structural consistency, not narrative truth or private-content security.
