(() => {
  const POSSIBILITIES = [
    {
      id: 'something-moved-in',
      title: 'Something Moved In',
      status: 'RUMOUR / EXPEDITION LEAD',
      direction: 'SOUTH ↓',
      tone: 'rumour',
      image: 'assets/canon/sessions/session-02.webp',
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
      direction: 'EAST →',
      tone: 'open',
      image: 'assets/canon/sessions/session-01.webp',
      visibility: ['party'],
      summary: 'Significant expensive caravan freight was left behind when the group chose lives over cargo during the Kestrel Return.',
      known: 'Ash-Plate Groundfall is on the eastern Kestrel Return route corridor through Old Marker Wash. The party travelled this route during Sessions One to Three. The direction is known; what has happened to the freight since then is not.',
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
      direction: 'GREYWAKE FIRST / EASTERN SITES',
      tone: 'active',
      image: 'assets/canon/sessions/session-03.webp',
      visibility: ['party'],
      summary: 'At least two route markers were deliberately altered. The party still does not know who did it, when, why, or whether the same person was responsible for both.',
      known: 'This can begin as an investigation in Greywake by speaking to people, comparing route knowledge or examining what was brought back. The marker sites already encountered lie on the eastern Kestrel Return route corridor.',
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
      image: 'assets/canon/locations/valve-court-cistern-seal.webp',
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
      image: 'assets/canon/fauna/ash-plate.webp',
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
      image: 'assets/canon/locations/caravan-gate.webp',
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
      id: 'flickerfly-study',
      title: 'Find a Flickerfly',
      status: 'PLAYER PROPOSAL / NEW LEAD',
      direction: 'GREYWAKE FIRST / SOUTH ↓',
      tone: 'personal',
      image: 'assets/canon/sessions/session-01.webp',
      imageNote: 'South-wastes route imagery — nobody in the party has yet seen a confirmed flickerfly.',
      visibility: ['party'],
      proposedBy: 'Marek',
      summary: 'Marek wants the party to find a flickerfly so he can study one. Stories about them mostly seem to come from travellers returning from south of Greywake.',
      known: 'A Digger who returned recently is said to have brought back a thin translucent piece of wing caught among broken stone. Someone thought it might be from a flickerfly, but nobody is certain. The first step is to identify that Digger and learn exactly where the fragment was found.',
      relevance: {
        marek: 'This began with something you said you wanted to do: find and study a flickerfly.',
        velmira: 'If the group follows Marek’s lead, the first useful step is still in Greywake: finding the person who brought the fragment back and working out whether the story is credible.',
        odie: 'A Digger brought the possible fragment in, which gives you a practical route into the lead through people and places you already understand.'
      }
    },
    {
      id: 'earlier-stilling-case',
      title: 'An Earlier Stilling Case',
      status: 'PLAYER PROPOSAL / KNOWN LEAD',
      direction: 'OUTSIDE GREYWAKE / EXACT DIRECTION NOT YET ESTABLISHED',
      tone: 'personal',
      image: 'assets/npcs/hq-v3/nemi.webp',
      imageNote: 'Nemi is the reason Velmira cares about this lead; the historical case was someone else.',
      visibility: ['party'],
      proposedBy: 'Velmira',
      summary: 'One of the earlier publicly known Stilling cases apparently seemed to stabilise for a time after the person had been somewhere outside Greywake. Velmira wants to find that place and see whether anything there might help Nemi.',
      known: 'The apparent stabilisation followed a journey outside Greywake and the place visited is still identifiable. Nobody knows whether the journey caused the change, what happened there, or whether anything found would help Nemi. The exact direction has not yet been established.',
      relevance: {
        marek: 'If the group follows Velmira’s lead, the place may offer an environmental, biological or entirely coincidental clue worth examining carefully.',
        velmira: 'This came directly from you: follow the strongest known trace left by an earlier Stilling case and see whether it gives Nemi another possibility.',
        odie: 'A known place outside Greywake means this can become a practical expedition once the route and destination are established.'
      }
    },
    {
      id: 'tavi-faithful',
      title: 'Tavi and the Faithful',
      status: 'YOUR UNFINISHED BUSINESS',
      direction: 'GREYWAKE',
      tone: 'personal',
      image: 'assets/tower-close.jpg',
      imageNote: 'Greywake context — not a portrait of Tavi.',
      visibility: ['velmira'],
      summary: 'Tavi is being drawn toward the Faithful but is not fully committed. They remain reachable.',
      known: 'Known to Velmira: Tavi wants meaning, likes being listened to, and may be adopting other people’s certainty as a way to manage fear.',
      relevance: {
        velmira: 'This is a relationship, not a quest marker. You decide whether, when and how Velmira gets involved.'
      }
    },
    {
      id: 'closing-ways',
      title: 'The Closing Ways',
      status: 'PLAYER PROPOSAL / ACTIVE PROBLEM',
      direction: 'GREYWAKE',
      tone: 'personal',
      image: 'assets/canon/locations/caravan-gate.webp',
      imageNote: 'Greywake access imagery — the concealed Digger entrances remain hidden.',
      visibility: ['party'],
      proposedBy: 'Odie',
      summary: 'Several concealed Digger haul routes into Greywake are being deliberately closed, filled or braced shut. Odie wants to find out how their locations are being exposed and stop more of them being lost.',
      known: 'Different crews keep different routes quiet. At least one closure was precise enough that whoever arranged it had to know where an undocumented entrance was. Odie suspects someone is reporting the tunnels, but nobody yet knows who is exposing them, who is closing them, whether every closure is connected, or why it is happening now.',
      relevance: {
        marek: 'If the group follows Odie’s lead, this is a town-side mystery about hidden movement, changing access and who knows what.',
        velmira: 'The problem touches secrecy, trust and competing interests inside Greywake; people may have very different reasons for wanting those routes gone.',
        odie: 'Someone somewhere knows something they should not. You want to work out who is exposing the hidden routes and stop more of them from being closed.'
      }
    },
    {
      id: 'white-tunnel',
      title: 'The White Door',
      status: 'PRIVATE POSSIBILITY',
      direction: 'KNOWN PRIVATELY / NOT A WASTES CHOICE',
      tone: 'personal',
      image: null,
      visibility: ['odie', 'velmira'],
      summary: 'Odie found a pale, precisely made tunnel ending at a sealed white door. He saw no Digger marks, camp traces or obvious evidence of previous attempts around it. Velmira is the only other PC he has trusted with the discovery.',
      known: 'The door had no handle, bar or hinge Odie recognised. Neither of you knows who built it, what lies beyond it, whether it can open, or whether Odie’s Oldwork finger has any connection to it.',
      relevance: {
        odie: 'You found the place and chose to keep it quiet. Returning, leaving it alone, studying the finger first or telling someone else are all your choice.',
        velmira: 'Odie trusted you with this. You know what he told you, not the answer. Whether you encourage him to return, leave it alone or tell someone else is a character choice.'
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
    return user?.role === 'gm' || partyVisible(item) || (key && item.visibility.includes(key));
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
    const image = item.image
      ? `<img class="thread-card-image" src="${item.image}" alt="" loading="lazy" decoding="async">`
      : `<div class="thread-card-image thread-card-image-fallback" aria-hidden="true"></div>`;
    const origin = item.proposedBy
      ? `<span class="thread-origin">PROPOSED BY ${item.proposedBy.toUpperCase()}</span>`
      : '';
    return `<article class="thread-card thread-${item.tone}" data-thread="${item.id}">
      ${image}<div class="thread-card-shade"></div>
      <div class="thread-card-content">
        <div class="thread-topline"><span class="thread-status">${item.status}</span><span class="thread-scope">${partyVisible(item) ? 'KNOWN TO PARTY' : 'PERSONAL'}</span></div>
        ${origin}
        ${item.direction ? `<div class="thread-direction">${item.direction}</div>` : ''}
        <h3>${item.title}</h3>
        <p class="thread-summary">${item.summary}</p>
        <p class="thread-known">${item.known}</p>
        ${item.imageNote ? `<div class="thread-image-note">${item.imageNote}</div>` : ''}
        ${relevance ? `<div class="thread-relevance"><span>${relevance.label}</span><p>${relevance.text}</p></div>` : ''}
      </div>
    </article>`;
  }

  function render(user = window.GreywakePlayer) {
    const grid = document.getElementById('currentThreadsGrid');
    const count = document.getElementById('currentThreadsCount');
    if (!grid || !user) return;
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

  window.GreywakeCurrentThreads = { render };
  window.addEventListener('greywake:player-ready', event => render(event.detail));
  window.addEventListener('greywake:portal-live-mounted', event => {
    if (event.detail?.kind === 'threads') render(window.GreywakePlayer);
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (window.GreywakePlayer) render(window.GreywakePlayer);
  });
})();
