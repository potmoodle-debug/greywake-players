# P0 working notes

High-risk overlap zones:

1. Character rendering and enhancement stack
   - character-sheet.js
   - character-page.js
   - character-professional.js
   - marek-sheet-extra.js
   - velmira-play-view.js
   - character-layout-order.js

2. Resource/action stack
   - resource-tracker.js
   - resource-sync.js
   - active-actions.js
   - action-roller.js
   - trait-roller.js
   - damage-system-v2.js
   - rest-system-v2.js
   - rest-dialog-fix.js
   - equipment-system-v2.js
   - companion-play.js
   - companion-sync.js
   - beastform.js
   - beastform-resource-bridge.js

3. Router/navigation stack
   - app.js
   - player-portal.js
   - player-mind-view.js
   - card-questions.js
   - card-priorities.js

Audit rule: one owner per UI responsibility; enhancement scripts may subscribe to stable events, but should not independently rebuild the same root view or replace another module's handlers.
