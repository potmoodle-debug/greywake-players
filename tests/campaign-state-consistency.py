#!/usr/bin/env python3
"""Fail deployment if the live campaign snapshot disagrees across GM and player surfaces.

This is a release-consistency test, not an Obsidian sync. Canon must first be
reconciled into the site's source file; after that this test prevents a partial
website release that updates only the session recap.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
state = (ROOT / "current-state-audit.js").read_text(encoding="utf-8")
recap = (ROOT / "session05.js").read_text(encoding="utf-8")
page = (ROOT / "index.html").read_text(encoding="utf-8")
errors = []

def check(condition, message):
    if not condition:
        errors.append(message)

def between(text, start, end):
    a = text.find(start)
    b = text.find(end, a + len(start))
    if a < 0 or b < 0:
        errors.append(f"Missing authoritative block: {start}")
        return ""
    return text[a:b]

gm = between(state, "window.GREYWAKE_GM_STATE = {", "// Current state after Session Three.")
home = between(state, "window.GREYWAKE_HOME_STATE = {", "window.GREYWAKE_GM_STATE = {")
recap_title = re.search(r'title: "([^"]+)"', recap)
gm_session = re.search(r"session:'([^']+)'", gm)
check(bool(recap_title and gm_session), "Recap or GM session heading is missing")
if recap_title and gm_session:
    check("Session 05" in recap_title.group(1), "Player recap has unexpected session identity")
    check("Session Five complete" in gm_session.group(1), "GM state must reflect the completed Session Five")
    check("Session Six next" in gm_session.group(1), "GM state must identify the next session")
    check("Fear 12" in gm_session.group(1), "GM session Fear does not match the verified close")

check("In Progress" not in recap, "Player recap still claims Session Five is in progress")
check("Session Five complete" in recap or "Session Five" in recap, "Completed recap missing")
check("activeParty:['Marek','Odie','Velmira']" in gm, "Active party in GM state is out of sync")
check("backgroundParty:[]" in gm, "GM snapshot still has a background PC")
check("C['Player Characters'] = ['Marek','Odie','Velmira']" in state,
      "Player Character index differs from active GM party")
check("D['Velmira'].category = 'Player Characters'" in state, "Velmira classification is stale")
check("C['People'] = C['People'].filter(name => name !== 'Velmira')" in state,
      "Velmira remains duplicated in background People index")
check("Session Four · ended early" not in gm, "Old GM operational state is still loaded")
check("The Stripped Yards" in gm and "Fear 12" in gm, "GM opening lacks location or Fear")
check("stone-striking" in gm.lower(), "GM opening is missing the actual Session Five closing hook")
check("Thirst-Marrow" in gm, "GM objective missing")

for pc in ("marek", "odie", "velmira"):
    section = re.search(r"\b" + pc + r":\s*\{([^}]+)\}", home)
    check(bool(section), f"{pc} has no current player home state")
    if section:
        check("Stripped Yards" in section.group(1), f"{pc} player home location is stale")

check(page.index('src="session05.js?') < page.index('src="current-state-audit.js?')
      < page.index('src="gm-operations.js?'), "Site script order is wrong")
check('current-state-audit.js?v=session6-' in page,
      "State script cache version missing; browser may retain stale snapshot")

if errors:
    print("FAIL: Greywake campaign-state consistency checks:")
    for error in errors:
        print(" -", error)
    sys.exit(1)
print("PASS: Current recap, all three PC views, GM Run and GM Prep share Session Six state.")
