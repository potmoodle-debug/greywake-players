(() => {
  const THREADS = [
    {
      id: 'route-markers',
      title: 'The Altered Route Markers',
      status: 'OPEN',
      tone: 'danger',
      visibility: ['party'],
      summary: 'At least two route markers were deliberately changed. Nobody knows who did it, when, or why.',
      known: 'Known: deliberate workmanship, more than one marker, and a safer route was made to read as the worse choice.',
      relevance: {
        marek: 'Changing a route also changes what travellers are exposed to. What did the altered path put people into the territory of?',
        velmira: 'Someone wanted travellers to read the landscape incorrectly. Who benefits from that story being believed?',
        odie: 'You physically examined one altered marker and established that the change was deliberate workmanship.'
      }
    },
    {
      id: 'cistern-plate',
      title: 'The Cistern Plate',
      status: 'DEVELOPING',
      tone: 'active',
      visibility: ['party'],
      summary: 'The Plate reached Greywake intact. Its custody, examination and practical consequences have not been settled in play.',
      known: 'Known: it is not Oldwork, present Greywake cannot reproduce it, and it was recovered from an abandoned route cistern.',
      relevance: {
        marek: 'This matters to Greywake even if it is not your speciality: whatever happens to the Plate may change the settlement around you.',
        velmira: 'Watch who becomes interested, who speaks with sudden certainty, and who tries to control the explanation.',
        odie: 'It is a precision-made working object tied to infrastructure Greywake can use but cannot reproduce.'
      }
    },
    {
      id: 'something-moved-in',
      title: 'Something Moved In',
      status: 'RUMOUR',
      tone: 'rumour',
      visibility: ['party'],
      summary: 'Diggers say something dangerous has occupied an old ruin and work has stopped. Nobody seems certain what it is or why it chose that site.',
      known: 'Known: the site is abandoned for now, and clearing it need not mean simply killing the animal.',
      relevance: {
        marek: 'Why this place? What biological problem does the creature solve there, and what changed to make the ruin useful to it?',
        velmira: 'The most useful question may be who has actually seen it, and which parts of the rumour are repeating too neatly.',
        odie: 'If the dig has stopped, useful salvage and working access are also locked behind whatever moved in.'
      }
    },
    {
      id: 'lost-freight',
      title: 'Freight at Ash-Plate Groundfall',
      status: 'UNRESOLVED',
      tone: 'open',
      visibility: ['party'],
      summary: 'Significant expensive freight was deliberately left behind to get people and animals home alive.',
      known: 'Known: it remains a possible recovery opportunity, but nobody has established what has happened to it since the party left.',
      relevance: {
        marek: 'Anything left in the wastes becomes part of the local ecology: shelter, food, scent, territory or disturbance.',
        velmira: 'The freight has owners, losses and obligations attached to it. Someone in Greywake will care what happens next.',
        odie: 'Abandoned cargo means salvage, components and damaged equipment — but recovery only matters if the risk is worth it.'
      }
    },
    {
      id: 'nemi-stilling',
      title: 'Nemi and the Stilling',
      status: 'PERSONAL · URGENT',
      tone: 'personal',
      visibility: ['velmira'],
      summary: 'Nemi’s condition remains unresolved. Ordinary remedies, comfort, charms and small workings have not stopped it.',
      known: 'Possible leads include previous cases, old records, Faithful claims, Watch observations, Digger finds and desert remedies. None is established as the answer.',
      relevance: {
        velmira: 'This is why leaving Greywake can matter — and why time spent elsewhere can feel expensive.'
      }
    },
    {
      id: 'tavi-faithful',
      title: 'Tavi and the Faithful',
      status: 'PERSONAL · OPEN',
      tone: 'personal',
      visibility: ['velmira'],
      summary: 'Tavi is being drawn toward the Faithful but is not fully committed. They remain reachable.',
      known: 'Known to Velmira: Tavi wants meaning, likes being listened to, and may be adopting other people’s certainty as a way to manage fear.',
      relevance: {
        velmira: 'Every trip outside Greywake competes with the time you could spend understanding what Tavi is being offered at home.'
      }
    }
  ];

  const partyVisible = thread => thread.visibility.includes('party');
  const visibleTo = (thread, user) => user.role === 'gm' || partyVisible(thread) || thread.visibility.includes(user.character.toLowerCase());

  function relevanceFor(thread, user) {
    if (user.role === 'gm') return 'GM view: this card is player-facing only; hidden causes and undiscovered connections remain outside the site.';
    return thread.relevance[user.character.toLowerCase()] || '';
  }

  function threadCard(thread, user) {
    const relevance = relevanceFor(thread, user);
    return `<article class="thread-card thread-${thread.tone}" data-thread="${thread.id}">
      <div class="thread-topline"><span class="thread-status">${thread.status}</span><span class="thread-scope">${partyVisible(thread) ? 'PARTY' : 'YOUR THREAD'}</span></div>
      <h3>${thread.title}</h3>
      <p class="thread-summary">${thread.summary}</p>
      <p class="thread-known">${thread.known}</p>
      ${relevance ? `<div class="thread-relevance"><span>WHY THIS MAY MATTER TO ${user.role === 'gm' ? 'THE PLAYER' : 'YOU'}</span><p>${relevance}</p></div>` : ''}
    </article>`;
  }

  function render(user) {
    const grid = document.getElementById('currentThreadsGrid');
    const count = document.getElementById('currentThreadsCount');
    if (!grid) return;
    const visible = THREADS.filter(thread => visibleTo(thread, user));
    grid.innerHTML = visible.map(thread => threadCard(thread, user)).join('');
    if (count) count.textContent = `${visible.length} visible thread${visible.length === 1 ? '' : 's'}`;

    const openAll = document.getElementById('openAllThreads');
    if (openAll && !openAll.dataset.wired) {
      openAll.dataset.wired = 'true';
      openAll.addEventListener('click', () => {
        location.hash = '#/record/' + encodeURIComponent('Jobs & Open Threads');
      });
    }
  }

  window.addEventListener('greywake:player-ready', event => render(event.detail));
  document.addEventListener('DOMContentLoaded', () => {
    if (window.GreywakePlayer) render(window.GreywakePlayer);
  });
})();
