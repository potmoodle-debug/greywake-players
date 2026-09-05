(() => {
  const UPDATES = {
    'something-moved-in': {
      marek: 'You know the Diggers’ work south of Greywake has stopped because something dangerous is believed to have occupied an old ruin. You still have no confirmed identification, route or explanation for why it is there.',
      velmira: 'The useful lead remains the people behind the story — who actually saw something, who is repeating it, and what the Diggers need before they will return.',
      odie: 'The stopped dig means practical salvage and access are still unavailable. No reliable identification of the creature or its reason for being there has been established.'
    },
    'groundfall-freight': {
      marek: 'The abandoned freight may still be recoverable, but time, scavengers and animals may have changed the site. Its broad direction is still not established as a selectable expedition lead.',
      velmira: 'The freight still has owners, value and consequences. Who wants it back may matter as much as what remains at the Groundfall.',
      odie: 'The Groundfall still represents possible salvage, evidence and useful parts, but returning is not yet an established directional expedition choice.'
    },
    'route-markers': {
      marek: 'At least two route markers were deliberately altered. You do not yet know who did it or why; the change may have affected where travellers and animals now concentrate.',
      velmira: 'The surviving witnesses and physical evidence are back in Greywake. People who use, maintain or profit from routes remain the clearest human leads.',
      odie: 'The altered cuts are still physical evidence. Tool marks, repair habits and route craft may help distinguish rumour from what actually happened.'
    },
    'cistern-plate': {
      marek: 'The Cistern Plate reached Greywake intact. Its practical effect on the settlement is unresolved, including what it may eventually change for water, animals and ordinary work.',
      velmira: 'The Plate is back in Greywake, but custody, competing claims and who is trusted to examine it remain unresolved.',
      odie: 'The Plate is precisely made and relevant to Greywake’s waterworks, but its exact fit, function and compatibility are still not established.'
    },
    'ash-plate-recovery': {
      marek: 'Ash-Plate returned under her own strength but could not carry a load. Her injury, recent exertion and readiness to work again still need proper assessment.',
      velmira: 'Ash-Plate’s recovery affects the people, labour and obligations built around her as well as the animal herself.',
      odie: 'Ash-Plate is recovering. Harnessing, load balance and damaged equipment remain practical things worth checking alongside the injury.'
    },
    'greywake-work': {
      marek: 'Meren is now personally relevant: you have just returned from an unsuccessful retrieval trip for Meren. What that failure means between you has not yet been established in play.',
      velmira: 'Your existing relationships, favours and conversations remain the main way town-side problems reach you. No formal job is required for something to become important.',
      odie: 'Repairs and shortages remain ordinary Greywake pressure. When the needed part does not exist inside the settlement, practical work can still create reasons to go outward.'
    },
    'flickerfly-study': {
      marek: 'You still want to find and study a Flickerfly. No confirmed sighting, specimen, witness, route or direction has yet turned that interest into an actionable expedition.',
      velmira: 'Marek’s interest remains real, but the group still needs a credible in-world lead before treating a Flickerfly location as established.',
      odie: 'Marek wants to study a Flickerfly. A reliable witness or recovered evidence would be enough to turn that interest into a practical lead.'
    },
    'earlier-stilling-case': {
      marek: 'Velmira’s lead still points toward an identifiable place visited by an earlier Stilling case. Whether that place mattered biologically, environmentally or not at all remains unknown.',
      velmira: 'The earlier case apparently stabilised for a time after travelling outside Greywake. The place remains identifiable, but its direction and any causal link to the Stilling are still unproven.',
      odie: 'The historical place can become a practical expedition once its route and broad direction are established. No connection to a cure has been proven.'
    },
    'tavi-faithful': {
      velmira: 'Tavi remains reachable and is being drawn toward the Faithful without being fully committed. You know Tavi wants meaning and responds to being listened to; what Velmira does about that remains your choice.'
    },
    'closing-ways': {
      marek: 'While returning from an unsuccessful retrieval trip for Meren, you followed an unfamiliar creature trail into a concealed Digger way south of Greywake. You collected a pale translucent membrane fragment and established that the creature could compress through unusually tight spaces. The trail reached a recently and deliberately blocked way. You could not establish where the creature went. Your smallest Beastform could not squeeze through the intact seal, and when you tried to create a gap the blockage shifted noisily. You heard familiar voices on the far side, but have not yet established who they are.',
      velmira: 'Several concealed Digger routes are being deliberately closed. At least one affected person is angry enough to talk. You do not yet know who is exposing the routes, who is sealing them, whether every closure is connected or why it is happening now.',
      odie: 'Several concealed Digger routes are being deliberately closed, including one you know well enough to take the others to. At least one closure required exact knowledge of an undocumented entrance. You still do not know who is exposing the routes, who is sealing them, whether the closures are coordinated or why.'
    },
    'white-tunnel': {
      velmira: 'Odie trusted you with the existence of the pale tunnel and sealed white door. You know what he described, but not who built it, what lies beyond it or whether his Oldwork finger is connected.',
      odie: 'The pale tunnel and sealed white door remain your private discovery. No handle, bar, hinge, Digger marks or obvious previous attempts were recognised, and no connection to the Oldwork finger has been established.'
    }
  };

  const ACTIVE = ['marek', 'velmira', 'odie'];

  function characterKey() {
    const body = String(document.body.dataset.character || '').toLowerCase();
    if (ACTIVE.includes(body)) return body;
    const player = String(window.GreywakePlayer?.character || '').toLowerCase();
    return ACTIVE.includes(player) ? player : null;
  }

  function ensureStyles() {
    if (document.getElementById('currentPossibilityUpdateStyles')) return;
    const style = document.createElement('style');
    style.id = 'currentPossibilityUpdateStyles';
    style.textContent = `
      .thread-card[data-latest-enabled="true"]{cursor:pointer}
      .thread-card[data-latest-enabled="true"]:focus-visible{outline:2px solid #c9b06b;outline-offset:4px}
      .thread-latest-toggle{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:1rem;padding-top:.85rem;border-top:1px solid rgba(231,214,165,.22);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#d7c58e}
      .thread-latest-toggle b{font-size:1rem;line-height:1;transition:transform .16s ease}
      .thread-card.latest-open .thread-latest-toggle b{transform:rotate(90deg)}
      .thread-latest{margin-top:.8rem;padding:.9rem 1rem;border:1px solid rgba(213,190,119,.28);background:rgba(14,15,12,.78);box-shadow:inset 3px 0 0 rgba(213,190,119,.58)}
      .thread-latest[hidden]{display:none}
      .thread-latest span{display:block;margin-bottom:.4rem;font-size:.68rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#d7c58e}
      .thread-latest p{margin:0;line-height:1.55;color:#f0ead9}
    `;
    document.head.appendChild(style);
  }

  function enhanceCard(card, key) {
    const id = card.dataset.thread;
    const update = UPDATES[id]?.[key];
    if (!update || card.dataset.latestEnhanced === key) return;

    card.dataset.latestEnhanced = key;
    card.dataset.latestEnabled = 'true';
    card.tabIndex = 0;
    card.setAttribute('aria-expanded', 'false');

    const content = card.querySelector('.thread-card-content') || card;
    const toggle = document.createElement('div');
    toggle.className = 'thread-latest-toggle';
    toggle.innerHTML = `<span>Open latest for ${key}</span><b aria-hidden="true">›</b>`;

    const latest = document.createElement('div');
    latest.className = 'thread-latest';
    latest.hidden = true;
    latest.innerHTML = `<span>LATEST FOR ${key.toUpperCase()}</span><p></p>`;
    latest.querySelector('p').textContent = update;

    content.append(toggle, latest);

    const setOpen = open => {
      card.classList.toggle('latest-open', open);
      latest.hidden = !open;
      card.setAttribute('aria-expanded', String(open));
      toggle.querySelector('span').textContent = `${open ? 'Close' : 'Open'} latest for ${key}`;
    };

    card.addEventListener('click', event => {
      if (event.target.closest('button,a,input,select,textarea')) return;
      setOpen(latest.hidden);
    });

    card.addEventListener('keydown', event => {
      if (event.target !== card || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      setOpen(latest.hidden);
    });
  }

  function enhance() {
    ensureStyles();
    const key = characterKey();
    if (!key) return;
    document.querySelectorAll('#currentThreadsGrid .thread-card').forEach(card => enhanceCard(card, key));
  }

  let timer = null;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(enhance, 50);
  };

  function watchGrid() {
    const grid = document.getElementById('currentThreadsGrid');
    if (!grid || grid.dataset.latestObserver === 'true') return;
    grid.dataset.latestObserver = 'true';
    new MutationObserver(schedule).observe(grid, {childList:true, subtree:true});
  }

  window.addEventListener('greywake:player-ready', () => { watchGrid(); schedule(); });
  window.addEventListener('greywake:portal-live-mounted', event => {
    if (event.detail?.kind === 'threads') { watchGrid(); schedule(); }
  });
  window.addEventListener('greywake:engagement-changed', schedule);
  window.addEventListener('hashchange', () => setTimeout(schedule, 60));
  document.addEventListener('DOMContentLoaded', () => { watchGrid(); schedule(); });
  setTimeout(() => { watchGrid(); enhance(); }, 220);
})();
