(() => {
  if (window.__GreywakeGMRunCurrentContext) return;
  window.__GreywakeGMRunCurrentContext = true;

  const onRun = () => location.hash === '#/gm-session';
  const fullGM = () => document.body.dataset.role === 'gm' && document.body.dataset.gmPreview !== 'true';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  let queued = false;

  function ensureStyles() {
    if (document.getElementById('gm-run-current-context-styles')) return;
    const style = document.createElement('style');
    style.id = 'gm-run-current-context-styles';
    style.textContent = `
      .gm-run-opening{grid-column:1/-1;border:1px solid #7b683c;background:linear-gradient(135deg,#211d13,#14150f);padding:18px}
      .gm-run-opening>small,.gm-run-now-grid small,.gm-run-route-card small,.gm-run-rule-card small{display:block;color:#a99459;font-size:8px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}
      .gm-run-opening h2{margin:5px 0 7px;color:#f0dfaa;font:700 27px/1.05 Georgia,serif}.gm-run-opening>p{margin:0;color:#b9b09c;font-size:11px;line-height:1.55;max-width:1000px}
      .gm-run-now-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:14px}.gm-run-now-grid article{border:1px solid #3f3a2d;background:#11120e;padding:12px}.gm-run-now-grid strong{display:block;color:#e2d8be;font:700 18px/1.1 Georgia,serif;margin:4px 0 6px}.gm-run-now-grid p{margin:0;color:#99917e;font-size:9px;line-height:1.48}
      .gm-run-immediate{grid-column:1/-1;display:grid;grid-template-columns:1.25fr .75fr;gap:14px}.gm-run-immediate>section{border:1px solid #403b2e;background:#171813;padding:16px}.gm-run-immediate h2{margin:5px 0 9px;color:#e8dec4;font:700 21px/1.1 Georgia,serif}.gm-run-immediate ul{margin:0;padding-left:18px;color:#a49c89;font-size:10px;line-height:1.55}.gm-run-immediate li+li{margin-top:5px}
      .gm-run-route-list,.gm-run-rule-list{display:grid;gap:8px}.gm-run-route-card,.gm-run-rule-card{border:1px solid #39362c;background:#11120e;padding:10px 11px}.gm-run-route-card strong,.gm-run-rule-card strong{display:block;color:#dcd1b6;font-size:11px;margin:4px 0}.gm-run-route-card span,.gm-run-rule-card span{display:block;color:#918977;font-size:9px;line-height:1.4}
      .gm-run-boundary{color:#d5bb75!important}.gm-run-deemphasised{opacity:.62}.gm-run-deemphasised .gm-pressure-list{grid-template-columns:repeat(4,minmax(0,1fr))}
      @media(max-width:900px){.gm-run-now-grid{grid-template-columns:1fr}.gm-run-immediate{grid-template-columns:1fr}.gm-run-deemphasised .gm-pressure-list{grid-template-columns:1fr 1fr}}
      @media(max-width:650px){.gm-run-deemphasised .gm-pressure-list{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function mount() {
    if (!fullGM() || !onRun()) {
      document.getElementById('gmRunOpeningContext')?.remove();
      document.getElementById('gmRunImmediateContext')?.remove();
      return;
    }
    ensureStyles();
    const root = document.getElementById('gmOperationsView');
    const grid = root?.querySelector('.gm-ops-grid');
    if (!grid || root.classList.contains('hidden')) return;

    let opening = document.getElementById('gmRunOpeningContext');
    if (!opening) {
      opening = document.createElement('section');
      opening.id = 'gmRunOpeningContext';
      opening.className = 'gm-run-opening';
      grid.prepend(opening);
    }
    opening.innerHTML = `
      <small>START HERE · SESSION OPENING</small>
      <h2>The party is split by the blocked Digger way</h2>
      <p>Resume immediately after Marek's attempt to make a gap large enough for his Agile Scout form. The blockage still holds. Do not jump ahead to The Closing Ways investigation until the table has actually resolved contact, recognition and getting through or around the obstruction.</p>
      <div class="gm-run-now-grid">
        <article><small>MAREK · INSIDE</small><strong>At the blockage</strong><p>He has inspected the masonry, tried his smallest Beastform, dropped Beastform, found a tool and attempted to open a scout-sized gap. His last roll was <b>Finesse 9 with Fear</b>. He knows Digger ways exist. He does <b>not</b> begin with Foldling knowledge.</p></article>
        <article><small>ODIE + VELMIRA · OTHER SIDE</small><strong>Greywake side</strong><p>They are on the opposite side of the same closure. Keep their knowledge to what they have actually perceived. Do not assume they identify Marek, understand what caused the closure, or know what is beyond it until established in play.</p></article>
        <article><small>BLOCKAGE · ESTABLISHED</small><strong>Still closed</strong><p>Marek's smallest form cannot simply squeeze through. The previous attempt disturbed the lower packing/older bracing but did not create a safe passage. Treat the exact state of any new gap or instability as the immediate consequence to resolve at the table.</p></article>
      </div>`;

    let immediate = document.getElementById('gmRunImmediateContext');
    if (!immediate) {
      immediate = document.createElement('div');
      immediate.id = 'gmRunImmediateContext';
      immediate.className = 'gm-run-immediate';
      opening.insertAdjacentElement('afterend', immediate);
    }
    immediate.innerHTML = `
      <section>
        <small>IMMEDIATE GM JOB</small><h2>Run the obstruction, not the whole adventure</h2>
        <ul>
          <li>Describe what changed after the <b>9 with Fear</b>; give useful physical information, not a dead end.</li>
          <li>Let the characters establish contact naturally. Ask what they are trying to determine or do and how — <span class="gm-run-boundary">do not ask them to define what success must produce.</span></li>
          <li>Only call for another roll when there is meaningful uncertainty or cost. Sensible investigation should reveal evidence; rolls can govern clarity, speed, danger, leverage or complication.</li>
          <li>Keep recognition and knowledge separate for Marek, Odie and Velmira until someone actually communicates or witnesses enough to know more.</li>
          <li>Once the party reconnects, present the available ways forward. Do not force The Closing Ways into one prescribed route.</li>
        </ul>
      </section>
      <section>
        <small>NEXT ROUTES</small><h2>What can become relevant next</h2>
        <div class="gm-run-route-list">
          <div class="gm-run-route-card"><small>1 · CURRENT</small><strong>Open / bypass / understand the blockage</strong><span>Stay here until the party has actually solved or abandoned this immediate problem.</span></div>
          <div class="gm-run-route-card"><small>2 · AFTER CONTACT</small><strong>Reconnect the party</strong><span>Recognition, explanations and what each character chooses to share happen in play.</span></div>
          <div class="gm-run-route-card"><small>3 · THEN</small><strong>The Closing Ways sandbox</strong><span>Use the linked adventure routes only after the opening naturally hands control back to the party.</span></div>
        </div>
      </section>`;

    const pressure = [...grid.querySelectorAll('.gm-panel')].find(panel => /ACTIVE PRESSURES/i.test(panel.querySelector('small')?.textContent || ''));
    if (pressure) {
      pressure.classList.add('gm-run-deemphasised');
      const small = pressure.querySelector('small');
      const h2 = pressure.querySelector('h2');
      if (small) small.textContent = 'BACKGROUND PRESSURES · NOT THE OPENING JOB';
      if (h2) h2.textContent = 'Keep in reserve';
    }

    const evidence = [...grid.querySelectorAll('.gm-panel')].find(panel => /^EVIDENCE$/i.test(panel.querySelector('small')?.textContent?.trim() || ''));
    if (evidence) {
      evidence.querySelector('h2').textContent = 'Do not collapse uncertainty';
      const legend = evidence.querySelector('.gm-evidence-legend');
      if (legend) legend.innerHTML = '<span>ESTABLISHED</span><span>PC THEORY</span><span>UNKNOWN</span><span>GM-ONLY PROVISIONAL</span>';
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mount(); });
  }

  const observer = new MutationObserver(() => {
    if (fullGM() && onRun()) schedule();
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
  window.addEventListener('hashchange', () => setTimeout(schedule, 50));
  window.addEventListener('greywake:player-ready', () => setTimeout(schedule, 100));
  document.addEventListener('DOMContentLoaded', () => setTimeout(schedule, 120));
  setTimeout(schedule, 500);
})();
