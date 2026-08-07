<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#11110e">
<meta name="description" content="Spoiler-safe player archive for the Greywake Daggerheart campaign.">
<title>Greywake — Player Archive</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="app">
<header class="site-header">
  <button id="menuBtn" class="menu-btn" aria-label="Open archive navigation">☰</button>
  <button id="homeBtn" class="brand-button">
    <span class="tower-sigil"></span>
    <span><strong>GREYWAKE</strong><small>PLAYER FIELD ARCHIVE</small></span>
  </button>
  <nav class="desktop-nav">
    <button data-home>Home</button><button data-cat="Locations">Locations</button>
    <button data-cat="People">People</button><button data-cat="Flora & Fauna">Flora & Fauna</button>
    <button data-cat="Sessions">Sessions</button><button data-cat="Player Characters">Characters</button>
  </nav>
  <button id="brainBtn" class="brain-button">✧ PLAYER BRAIN</button>
</header>

<aside class="drawer" id="drawer">
  <div class="drawer-head"><div><span class="kicker">PARTY-KNOWN RECORD</span><strong>Archive Index</strong></div><button id="closeDrawer">×</button></div>
  <label class="search"><span>Search the archive</span><input id="searchInput" type="search" placeholder="Place, person, creature…"></label>
  <nav id="nav"></nav>
  <p class="drawer-note">Only material safe for the whole party appears here. A missing entry does not imply anything about the world.</p>
</aside>
<div class="scrim" id="scrim"></div>

<main>
<section class="hero" id="homeView">
  <img class="hero-bg" src="assets/tower-distant.jpg" alt="">
  <div class="hero-shade"></div>
  <div class="hero-copy">
    <span class="kicker">A FRONTIER HOLD IN THE WASTES</span>
    <h1>What the party knows.</h1>
    <p>People, routes, creatures, places and events enter this field archive only when they are safe for the whole group to know.</p>
    <div class="hero-actions">
      <button class="primary" id="openBrainHero">✧ Open Player Brain</button>
      <button class="secondary" data-note="Greywake">Greywake field record</button>
    </div>
  </div>
  <div class="hero-plate">
    <span>FIELD PLATE 01</span>
    <b>GREYWAKE ACROSS THE WASTES</b>
    <small>Party-safe visual reference</small>
  </div>
</section>

<section class="latest" id="latestView">
  <div class="section-title">
    <div><span class="kicker">RECENTLY ADDED TO THE RECORD</span><h2>Latest discoveries</h2></div>
    <p>This section is driven by a separate player-safe discovery list, so new knowledge can be added without exposing the GM vault.</p>
  </div>
  <div id="discoveryGrid" class="discovery-grid"></div>
</section>

<section class="archive-strip">
  <aside class="paper-note">
    <span class="kicker dark">FIELD NOTE</span>
    <h3>The record only grows one way.</h3>
    <p>Something appears here after the party knows it, sees it, or earns it.</p>
    <p>Unrevealed theories, private character knowledge and GM material never enter this copy.</p>
    <strong>If it is not here, it is not safe to assume.</strong>
  </aside>
  <div class="category-panel">
    <span class="kicker">BROWSE THE FIELD ARCHIVE</span>
    <div class="category-grid">
      <button data-cat="Locations"><b>⌖</b><strong>Locations</strong><span>Known places and routes.</span></button>
      <button data-cat="People"><b>♟</b><strong>People</strong><span>People the party can name.</span></button>
      <button data-cat="Flora & Fauna"><b>✣</b><strong>Flora & Fauna</strong><span>Life encountered or commonly known.</span></button>
      <button data-cat="Sessions"><b>▤</b><strong>Session Records</strong><span>What actually happened.</span></button>
      <button data-cat="Player Characters"><b>◈</b><strong>Characters</strong><span>Public party profiles.</span></button>
      <button id="categoryBrain"><b>✧</b><strong>Player Brain</strong><span>See how known things connect.</span></button>
    </div>
  </div>
</section>

<section class="field-plates">
  <div class="section-title">
    <div><span class="kicker">APPROVED VISUAL REFERENCES</span><h2>From the field archive</h2></div>
    <p>These are known images, not speculative illustrations created for the website.</p>
  </div>
  <div class="plate-grid">
    <button data-note="Great-Shell"><img src="assets/great-shell-canon.jpg" alt="Great-Shell canon visual"><span><b>GREAT-SHELL</b><small>Canon fauna reference</small></span></button>
    <button data-note="Cacklemaw Pack"><img src="assets/cacklemaw-stonelip.jpg" alt="Cacklemaw pack at Stone-Lip"><span><b>CACKLEMAW PACK</b><small>Encountered near Stone-Lip</small></span></button>
    <button data-note="Stone-Lip Hollow"><img src="assets/stone-lip-approach.jpg" alt="Stone-Lip Hollow approach"><span><b>STONE-LIP HOLLOW</b><small>Approach from the runnels</small></span></button>
  </div>
</section>

<section class="party-section">
  <div class="section-title">
    <div><span class="kicker">THE PARTY</span><h2>People who go outside.</h2></div>
    <p>Public summaries only. Character-private knowledge stays in its own protected records.</p>
  </div>
  <div class="party-grid">
    <button data-note="Clay"><span>RIDGEBORNE RANGER</span><strong>Clay</strong><p>Great-Shell handler, caravan scout and judge of route risk.</p></button>
    <button data-note="Velmira"><span>WANDERBORNE WIZARD</span><strong>Velmira</strong><p>Trader and connector whose magic remains useful and grounded.</p></button>
    <button data-note="Odie"><span>UNDERBORNE ROGUE</span><strong>Odie</strong><p>Fixer and scavenger who keeps broken things working.</p></button>
  </div>
</section>

<section id="brainView" class="brain-view hidden">
  <div class="brain-hero">
    <div><span class="kicker">THE SHARED RELATIONSHIP MAP</span><h2>Player Brain</h2>
    <p>Every node and every visible connection is party-safe. Use it to move through Greywake by association instead of folders.</p></div>
    <div class="brain-stats"><strong id="nodeCount">0</strong><span>known records</span><strong id="edgeCount">0</strong><span>known links</span></div>
  </div>
  <div class="brain-toolbar">
    <button id="brainHome">← Archive home</button>
    <span>Click a node to open the field record</span>
    <button id="brainReset">Re-centre</button>
  </div>
  <div id="graph"></div>
</section>

<article id="article" class="article hidden"></article>

<footer>
  <div><strong>GREYWAKE PLAYER FIELD ARCHIVE</strong><span>What the party knows. Nothing more.</span></div>
  <div><small>PLAYER-SAFE BUILD • 07 AUG 2026</small></div>
</footer>
</main>
</div>
<script src="data.js"></script>
<script src="discoveries.js"></script>
<script src="media.js"></script>
<script src="app.js"></script>
</body>
</html>