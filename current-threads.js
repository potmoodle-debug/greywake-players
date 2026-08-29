(() => {
  const POSSIBILITIES = [
    {
      id: 'something-moved-in',
      title: 'Something Moved In',
      status: 'RUMOUR / EXPEDITION LEAD',
      direction: 'SOUTH ↓',
      tone: 'rumour',
      visibility: ['party'],
      summary: 'Diggers say something dangerous has occupied an old ruin and work has stopped. Nobody seems certain what it is or why it chose that site.',
      known: 'The dig site is south of Greywake. You can investigate it, ask questions first, ignore it, or come back to it later. The exact route and what is inside remain uncertain.',
      relevance: {
        marek: 'Why this place? What biological problem does the creature solve there, and what changed to make the ruin useful to it?',
        velmira: 'The useful question may be who has actually seen it, who is repeating the story, and what the Diggers need before they return.',
        odie: 'If the dig has stopped, useful salvage and working access are also locked behind whatever moved in.'
      }
    },
    {
      id: 'groundfall-freight',
      title: 'Freight at Ash-Plate Groundfall',
      status: 'POTENTIALLY RECOVERABLE',
      direction: '? DIRECTION NOT YET ESTABLISHED',
      tone: 'open',
      visibility: ['party'],
      summary: 'Significant expensive caravan freight was left behind when the group chose lives over cargo during the Kestrel Return.',
      known: 'The party knows how the Groundfall relates to the route they travelled, but its broad compass direction from Greywake has not been established in the shared record. It is not presented as a selectable Wastes expedition until that is clear.',
      relevance: {
        marek: 'Time, scavengers and animals may already have changed the site since the caravan left it.',
        velmira: 'The freight has owners, value and consequences. Who wants it back may matter as much as what is there.',
        odie: 'Abandoned freight and a damaged route can mean salvage, evidence and practical parts — if returning is worth the risk.'
      }
    },
    {
      id: 'route-markers',
      title: 'The Altered Route Markers',
      status: 'UNRESOLVED',
      direction: 'GREYWAKE FIRST',
      tone: 'active',
      visibility: ['party'],
      summary: 'At least two route markers were deliberately altered. The party still does not know who did it, when, why, or whether the same person was responsible for both.',
      known: 'This can begin as an investigation in Greywake by speaking to people, comparing route knowledge or examining what was brought back. If it later requires travel, the broad direction should be known before it becomes an expedition choice.',
      relevance: {
        marek: 'A changed route affects animals, travellers and where danger concentrates, even before anyone knows the motive.',
        velmira: 'People who use, maintain or profit from routes may know who had reason or opportunity to alter them.',
        odie: 'The physical cuts in the markers are evidence. Tool marks, repair habits and route craft may say more than rumours do.'
      }
    },
    {
      id: 'cistern-plate',
      title: 'The Cistern Plate',
      status: 'BACK IN GREYWAKE',
      direction: 'GREYWAKE',
      tone: 'active',
      visibility: ['party'],
      summary: 'The precision-made ceramic waterworks plate reached Greywake intact, but what it can actually do and who takes responsibility for it remain unresolved.',
      known: 'This is a town-side situation, not a Wastes expedition. Greywake may act on it whether or not the party chooses to become involved.',
      relevance: {
        marek: 'Anything affecting water distribution eventually affects animals, food, medicine and the settlement’s ability to endure.',
        velmira: 'Custody, competing claims and who is trusted to examine the Plate may matter before its technical use is even understood.',
        odie: 'It is a precision-made component intended to interface with Greywake’s waterworks. Understanding how it fits is a practical problem.'
      }
    },
    {
      id: 'ash-plate-recovery',
      title: "Ash-Plate's Recovery",
      status: 'RECOVERING',
      direction: 'GREYWAKE',
      tone: 'active',
      visibility: ['party'],
      summary: 'Ash-Plate made it home under her own strength but carried no load and needs proper assessment before returning to work.',
      known: 'This is part of Greywake’s continuing life rather than an assignment. The party can become involved if they care to.',
      relevance: {
        marek: 'Her recovery is an animal-health problem with a known injury, recent overexertion and practical consequences for future hauling.',
        velmira: 'Her condition affects the people and work built around her, not just the animal herself.',
        odie: 'Harnessing, load balance and damaged equipment may matter alongside the injury itself.'
      }
    },
    {
      id: 'greywake-work',
      title: 'Work in Greywake',
      status: 'OPEN POSSIBILITY',
      direction: 'GREYWAKE',
      tone: 'active',
      visibility: ['party'],
      summary: 'Greywake always has practical problems: repairs, shortages, animals, trade, water, disputes, people who need help and work that has been left undone.',
      known: 'Not every problem is an adventure and not every request deserves a yes. Talking to people your characters already know is enough to discover what currently matters to them.',
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
      direction: '? NO EXTERNAL DESTINATION KNOWN',
      tone: 'personal',
      visibility: ['velmira'],
      summary: 'Nemi’s condition remains unresolved. Ordinary remedies, comfort, charms and small workings have not stopped it.',
      known: 'Possible avenues include previous cases, old records, Faithful claims, Watch observations, Digger finds and desert remedies. None currently establishes an external destination or direction.',
      relevance: {
        velmira: 'This belongs to Velmira because she cares about Nemi. It becomes campaign direction only if you decide to pursue it.'
      }
    },
    {
      id: 'tavi-faithful',
      title: 'Tavi and the Faithful',
      status: 'YOUR UNFINISHED BUSINESS',
      direction: 'GREYWAKE',
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
      direction: 'KNOWN PRIVATELY / NOT A WASTES CHOICE',
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
      ${item.direction ? `<div class="thread-direction">${item.direction}</div>` : ''}
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
