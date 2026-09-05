(() => {
  const TEST_ID = 'marek-prologue-pale-thread';

  function characterKey() {
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase();
  }

  function isFullGM() {
    return document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  }

  function shouldShow() {
    return characterKey() === 'marek' || isFullGM();
  }

  function cardMarkup() {
    return `<article class="thread-card thread-personal" data-thread="${TEST_ID}" data-test-only="true">
      <div class="thread-card-image thread-card-image-fallback" aria-hidden="true"></div>
      <div class="thread-card-shade"></div>
      <div class="thread-card-content">
        <div class="thread-topline"><span class="thread-status">TEST SCENARIO · PERSONAL LEAD</span><span class="thread-scope">MAREK ONLY</span></div>
        <span class="thread-origin">TEST ONLY · NOT CANON</span>
        <div class="thread-direction">DIGGER HOLE · TEST PLAY</div>
        <h3>The Pale Thread</h3>
        <p class="thread-summary">Near a drag-groove in the salt-dry crust, something pale has snagged beside a narrow gap. Most people could dismiss it as rubbish. Marek has reason not to.</p>
        <p class="thread-known">It might be shed fibre, membrane, webbing, or material carried by a creature. If it is biological, its structure and condition could tell Marek what passed through here, whether it was injured or shedding, and whether the trace belongs to anything Greywake already knows.</p>
        <div class="thread-image-note">This card exists only for the Marek prologue test. Nothing on it becomes Greywake canon unless established in play and approved.</div>
        <div class="thread-relevance"><span>WHY MAREK MIGHT CARE</span><p>This is exactly the kind of trace his work depends on: identify an unfamiliar creature from what it leaves behind, judge whether it matters, and decide whether following or sampling it is worth the risk.</p></div>
      </div>
    </article>`;
  }

  function inject() {
    const grid = document.getElementById('currentThreadsGrid');
    if (!grid) return;
    grid.querySelector(`[data-thread="${TEST_ID}"]`)?.remove();
    if (!shouldShow()) return;
    grid.insertAdjacentHTML('afterbegin', cardMarkup());
    const count = document.getElementById('currentThreadsCount');
    if (count) {
      const n = grid.querySelectorAll('.thread-card').length;
      count.textContent = `${n} known possibilit${n === 1 ? 'y' : 'ies'}`;
    }
    // This card is inserted after the normal possibility render, so explicitly ask the
    // shared priority controller to add Interested / Pursue controls to it.
    setTimeout(() => window.GreywakeCardPriorities?.refresh?.(), 0);
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      inject();
    });
  }

  const grid = document.getElementById('currentThreadsGrid');
  if (grid) new MutationObserver(schedule).observe(grid, { childList: true });
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:portal-live-mounted', event => {
    if (event.detail?.kind === 'threads') setTimeout(schedule, 0);
  });
  window.addEventListener('hashchange', () => setTimeout(schedule, 60));
  document.addEventListener('DOMContentLoaded', schedule);
  setTimeout(schedule, 200);
})();
