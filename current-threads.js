(() => {
  const POSSIBILITIES = [
    {
      id: 'something-moved-in',
      title: 'Something Moved In',
      status: 'RUMOUR',
      tone: 'rumour',
      visibility: ['party'],
      summary: 'Diggers say something dangerous has occupied an old ruin and work has stopped. Nobody seems certain what it is or why it chose that site.',
      known: 'This is simply something the party has heard about. You can investigate it, ask questions, ignore it, or come back to it later.',
      relevance: {
        marek: 'Why this place? What biological problem does the creature solve there, and what changed to make the ruin useful to it?',
        velmira: 'The useful question may be who has actually seen it, who is repeating the story, and what the Diggers need before they return.',
        odie: 'If the dig has stopped, useful salvage and working access are also locked behind whatever moved in.'
      }
    },
    {
      id: 'wastes',
      title: 'Beyond Greywake',
      status: 'OPEN POSSIBILITY',
      tone: 'open',
      visibility: ['party'],
      summary: 'Routes, abandoned shelters, ruins, creature territories and places nobody has checked recently remain beyond the settlement.',
      known: 'There is no required destination. The party can choose a direction because something interests them, because Greywake needs something, or simply because they want to know what is there.',
      relevance: {
        marek: 'Changes in animal behaviour, habitat and movement can make the wastes themselves an investigation.',
        velmira: 'People, rumours, trade and favours can tell you which places matter before you ever leave the walls.',
        odie: 'Broken infrastructure and abandoned places may hold the parts Greywake cannot make for itself.'
      }
    },
    {
      id: 'greywake-work',
      title: 'Work in Greywake',
      status: 'OPEN POSSIBILITY',
      tone: 'active',
      visibility: ['party'],
      summary: 'Greywake always has practical problems: repairs, shortages, animals, trade, water, disputes, people who need help and work that has been left undone.',
      known: 'Not every problem is an adventure and not every request deserves a yes. The party can decide what, if anything, they want to become involved in.',
      relevance: {
        marek: 'Meren, Daro and the people who work with animals and medicine give you a natural way into problems without waiting for a formal job.',
        velmira: 'Your network of conversations, favours and relationships means town-side problems can become just as important as expeditions.',
        odie: 'Greywake survives because people keep damaged and failing things working. Repairs and shortages can lead outward when the necessary part does not exist inside the walls.'
      }
    },
    {
      id: 'nemi-stilling',
      title: 'Nemi and the Stilling',
      status: 'YOUR UNFINISHED BUSINESS',
      tone: 'personal',
      visibility: ['velmira'],
      summary: 'Nemi’s condition remains unresolved. Ordinary remedies, comfort, charms and small workings have not stopped it.',
      known: 'Possible avenues include previous cases, old records, Faithful claims, Watch observations, Digger finds and desert remedies. None is established as the answer.',
      relevance: {
        velmira: 'This belongs to Velmira because she cares about Nemi. It becomes campaign direction only if you decide to pursue it.'
      }
    },
    {
      id: 'tavi-faithful',
      title: 'Tavi and the Faithful',
      status: 'YOUR UNFINISHED BUSINESS',
      tone: 'personal',
      visibility: ['velmira'],
      summary: 'Tavi is being drawn toward the Faithful but is not fully committed. They remain reachable.',
      known: 'Known to Velmira: Tavi wants meaning, likes being listened to, and may be adopting other people’s certainty as a way to manage fear.',
      relevance: {
        velmira: 'This is a relationship, not a quest marker. You decide whether, when and how Velmira gets involved.'
      }
    },
    {
      id: 'white-tunnel',
      title: 'The White Tunnel',
      status: 'PRIVATE POSSIBILITY',
      tone: 'personal',
      visibility: ['odie', 'velmira'],
      summary: 'Odie found a clean white tunnel and a strange door. Velmira is the only other PC he has trusted with that knowledge.',
      known: 'Neither of you knows what the place truly is or what lies beyond the door. It remains yours to revisit, leave alone or reveal to others.',
      relevance: {
        odie: 'You found it. Nobody is assigning you to go back. If Odie wants answers, that choice can become the direction of play.',
        velmira: 'Odie trusted you with this. Whether you encourage him to return, leave it alone or tell someone else is a character choice.'
      }
    }
  ];

  const ACTIVE_CHARACTERS = ['marek', 'velmira', 'odie'];
  const partyVisible = item => item.visibility.includes('party');

  function characterKey(user) {
    const bodyCharacter = (document.body.dataset.character || '').toLowerCase();
    if (ACTIVE_CHARACTERS.includes(bodyCharacter)) return bodyCharacter;
    const userCharacter = (user?.character || '').toLowerCase();
    return ACTIVE_CHARACTERS.includes(userCharacter) ? userCharacter : null;
  }

  const visibleTo = (item, user) => {
    const key = characterKey(user);
    return user.role === 'gm' || partyVisible(item) || (key && item.visibility.includes(key));
  };

  function relevanceFor(item, user) {
    const key = characterKey(user);
    if (!key || !item.relevance[key]) return null;
    return {
      label: `WHY ${key.toUpperCase()} MIGHT CARE`,
      text: item.relevance[key]
    };
  }

  function card(item, user) {
    const relevance = relevanceFor(item, user);
    return `<article class="thread-card thread-${item.tone}" data-thread="${item.id}">
      <div class="thread-topline"><span class="thread-status">${item.status}</span><span class="thread-scope">${partyVisible(item) ? 'KNOWN TO PARTY' : 'PERSONAL'}</span></div>
      <h3>${item.title}</h3>
      <p class="thread-summary">${item.summary}</p>
      <p class="thread-known">${item.known}</p>
      ${relevance ? `<div class="thread-relevance"><span>${relevance.label}</span><p>${relevance.text}</p></div>` : ''}
    </article>`;
  }

  function render(user) {
    const grid = document.getElementById('currentThreadsGrid');
    const count = document.getElementById('currentThreadsCount');
    if (!grid) return;
    const visible = POSSIBILITIES.filter(item => visibleTo(item, user));
    grid.innerHTML = visible.map(item => card(item, user)).join('');
    if (count) count.textContent = `${visible.length} known possibilit${visible.length === 1 ? 'y' : 'ies'}`;

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
