# Greywake Players stability audit

Audit date: 5 October 2026. Review branch: `audit/greywake-stability`.

## Project organisation

The current website starts at the root `index.html`. It is a static site, with no
package installation or application build needed for local development.

| Area | Existing owner modules |
| --- | --- |
| Access gates, player identity and GM previews | `player-access.js` |
| Navigation, archive records and search | `navigation.js`, `app.js`, `visual-refresh.js` |
| Player hubs, campaign, questions and updates | `player-portal.js`, `home-dashboard.js`, `catch-up.js`, `player-goals.js` |
| Character sheets and live play controls | `character-page.js`, `character-professional.js`, `resource-tracker.js`, `p10-live-play-usability.js` |
| Backpacks and equipment | `backpack-system.js`, `equipment-system-v4.js` and their existing bridges |
| Player map | `player-map.js`, `player-map.css` |
| GM Run, Prep, Update, World, Inbox and Players | `gm-operations.js` and supporting GM modules |
| Shared Fear and cross-device state | `fear-tracker.js`, the existing `*-sync.js` modules, Supabase functions |
| Records, session recaps and personal knowledge | `data.js`, `session03.js`, `session04.js`, `current-state-audit.js`, `personal-knowledge.js`, `personal-audit.js` |
| Artwork and fallbacks | `media.js`, `image-restore.js`, `embedded-images.js`, `lightbox.js`, portrait/thread loaders and `assets/` |

`v2/`, `v3/` and `preview/` contain separate older versions or published PR
previews. GitHub workflows also cover those versions. They were inspected as
separate systems; they were not deleted, merged into the current application,
or used as evidence that the root site works. The Pages deployment workflow
includes asset generation and source transformations, so it was not run in the
checkout. Local testing preserves campaign information and existing artwork.

## Confirmed problems and targeted fixes

- Returning to the map left old resize handlers active. Three map visits left
  five active observers after leaving. The map now disconnects its observer
  when the route changes, and before mounting another map in the same host.
  The same reproduction now leaves zero active observers; the active map keeps
  exactly one.
- The map heading inherited a vertical offset from the general portal header.
  It covered the map toolbar and prevented mouse clicks on zoom controls. The
  map-specific header now resets that offset. Browser checks use actual clicks
  on zoom and Fit, rather than invoking button handlers directly.
- Failed record previews and enlarged artwork had no unavailable-image message.
  They now hide the broken-image icon, retain the existing caption, and show a
  short unavailable notice. A later successful load restores the artwork and
  clears the notice. No substitute artwork was invented.
- Asset version labels were updated for the changed map scripts and stylesheet
  so returning browsers request the fixes.

No campaign facts, artwork selections, access rules, character resources or
working features were changed. No large refactor was justified. Organisation
was limited to this system inventory and a repeatable browser regression check.

## Verification

All 16 existing Node checks passed before and after the fixes. They cover the
archive smoke check, navigation, personal-content boundaries, campaign and
player choices, usability, equipment, armour, mechanics, live play, catch-up,
preview routes, cross-player effects and bridge result detection.

A separate local real-browser audit accepted each supplied test identity,
rejected incorrect input, visited all six GM pages, and verified all three GM
player previews entered the isolated preview mode. No testing credentials were
saved in the test files or this report. No uncaught JavaScript errors were found
in that audit.

The new `tests/player-workflow-smoke.py` covers local player navigation,
backpack opening/filtering/closing, map observer lifetime, mouse and keyboard
zoom, Fit, location links, record headings and loaded artwork, mobile overflow,
menu opening/Escape closing, and hiding GM tools from player views. It also
checks repeated artwork opening/closing and the failed-preview caption
and new fallback/recovery behaviour. Shared service requests are intercepted; tests never update the
real campaign server. Fear-control checks use an isolated simulated server.

The three player views expose 94, 93 and 93 records respectively. Artwork
checks exercise 77 image instances per view (231 total, including repeated
images across views). These counts refer to loaded record artwork, not unique
art assets or separate confirmations of campaign canon.

## Repeating the checks

From the repository root, run each `node tests/*.mjs` file individually and
require each command to succeed. To run the browser checks, start
`python3 -m http.server 8000 --bind 127.0.0.1` from this same directory. In another
terminal:

```sh
python3 -m venv /tmp/greywake-audit-venv
/tmp/greywake-audit-venv/bin/pip install playwright==1.63.0
/tmp/greywake-audit-venv/bin/python tests/player-workflow-smoke.py
```

The verified browser is `/usr/bin/chromium`. Set `GREYWAKE_CHROMIUM` if its
location differs. `GREYWAKE_SMOKE_BASE` can select another local server port.
The new test deliberately refuses a remote base address. Existing Selenium
browser tests were not executed: Selenium's compatible driver download was
blocked by the environment network policy. The local Playwright audit provides
separate browser evidence; it is not a claim that those Selenium runners passed.

## Remaining limits and publication

The live GitHub Pages address was blocked by the environment proxy (403 on the
CONNECT request; browser tunnel failure). Domain requirements were saved in the
cloud environment draft for `potmoodle-debug.github.io` and
`tmqxxgzqiccclcjagdsh.supabase.co`; saving that draft does not apply access to the
running environment or publish anything.

Real shared Fear, cross-device inventory/resources, posting questions or GM
replies, Supabase authorisation and the installed live-chat userscript are not
verified end to end. Simulated-server checks only verify local UI behaviour.
The GM-only interface is hidden from tested player views. These checks do not
establish server-side privacy for static client code or remote APIs.

No missing or broken record artwork was found in the loaded local record
checks. No artwork selection or information mismatch was confirmed against the
repository's mappings and existing content-boundary tests. The private Obsidian
canon and a separately approved artwork inventory were not available, so exact
canon accuracy and intended artwork cannot be independently certified. The
older sites, arbitrary button combinations, all breakpoints, and remote
integrations were not exhaustively tested.

The branch is ready for review, but the full audit is blocked on live access.
Do not treat it as cleared to publish until the live checks and shared-state
checks are completed. No merge or publication was performed.
