(() => {
  const PROFILES = {
    marek: {
      kicker: 'MAREK · PERSONAL KNOWLEDGE',
      title: 'The people and work that are yours.',
      intro: 'Marek’s archive begins with the parts of Greywake he has a direct reason to care about. It will grow as his own history is established in play rather than inheriting Clay’s knowledge.',
      groups: [
        {
          title: 'People You Know',
          cards: [
            {
              title: 'Daro Pell',
              tag: 'Carcass processor · practical contact',
              image: 'assets/canon/characters/daro-pell.webp',
              body: 'Daro is one of the people who keeps Greywake from wasting what it kills. He decides what from a carcass becomes food, hide, fat, tendon, bone or useful material — and, just as importantly, what is contaminated and must never enter the food supply.'
            },
            {
              title: 'Meren',
              tag: 'Medicinal practitioner · practical contact',
              image: 'assets/canon/characters/meren.webp',
              body: 'Meren is a practical healer whose knowledge is built around problems that become deadly when water, food and rest are scarce: infected cuts, heat sickness, usable remedies and the small biological warnings people ignore until they become serious.'
            }
          ]
        },
        {
          title: 'Your Greywake Lens',
          cards: [
            {
              title: 'Animals Are Evidence',
              tag: 'Working instinct',
              body: 'When a creature changes its behaviour, nests somewhere unusual, abandons food or moves into a ruin, the useful question is not only how to kill it. The useful question is what changed around it.'
            },
            {
              title: 'Nothing Useful Is Just Waste',
              tag: 'Greywake reality',
              body: 'Animals, remedies and recovered materials sit inside Greywake’s survival economy. A carcass, a nest site or an abandoned dig can tell you about food, contamination, medicine, territory and what has shifted beyond the settlement.'
            }
          ]
        }
      ]
    },
    velmira: {
      kicker: 'VELMIRA · PERSONAL KNOWLEDGE',
      title: 'People reveal pressure before they reveal truth.',
      intro: 'Velmira knows Greywake through conversations, favours, market whispers, ration queues and the difference between what someone says and what they are frightened to say.',
      groups: [
        {
          title: 'Nemi and the Stilling',
          cards: [
            {
              title: 'Nemi',
              tag: 'Personal · urgent',
              body: 'Nemi is a child Velmira once cared for. Their body is becoming pale, heavy, dry and slow, as though warmth and water are leaving them. Roots, salves, water, charms, comfort and small workings have not stopped it.'
            },
            {
              title: 'What You Refuse',
              tag: 'The Faithful',
              body: 'Some among the Faithful call the Stilling a blessing. Velmira refuses that completely. Nemi is not a sign or proof of anything to her. Nemi is a child who is suffering.'
            },
            {
              title: 'Where Answers Might Be',
              tag: 'Open investigation',
              body: 'Possible leads include previous cases, old records, Faithful claims, Tower Watch observations, Digger finds, strange plants or minerals, desert remedies, survivor accounts and buried sites. Velmira does not begin knowing which lead is true.'
            }
          ]
        },
        {
          title: 'Tavi and the Faithful',
          cards: [
            {
              title: 'Tavi Is Not Lost',
              tag: 'Personal · town-side pressure',
              body: 'Tavi is being drawn toward the Faithful but is not fully committed. They are frightened, want meaning and like being listened to. Every day Velmira spends away gives other people more time to explain the world to them.'
            },
            {
              title: 'What You Notice',
              tag: 'Social instinct',
              body: 'Velmira notices rituals changing, borrowed phrases, grief becoming obedience, doubt being treated as betrayal, sudden certainty and moments where comfort starts becoming control.'
            }
          ]
        },
        {
          title: 'Secrets and Unfinished Questions',
          cards: [
            {
              title: 'The Thing That Followed You',
              tag: 'Private memory',
              body: 'Something followed Velmira across the wastes for an entire day — on ridges, in reflections and at the edge of sight. It was close enough to kill her and did not. What frightens her most is that it appeared to choose not to.'
            },
            {
              title: 'Odie’s Confidence',
              tag: 'Shared only with Odie',
              body: 'Odie trusted Velmira with the Oldwork finger, the clean white tunnel and the strange door. She does not know what they truly are or what the finger can do. She knows only that Odie trusted her with the fear of it.'
            },
            {
              title: 'Brannic Hale',
              tag: 'Tower Watch',
              body: 'Velmira knows Brannic through reputation and public behaviour. To her he represents guarded knowledge: someone more likely to contain panic than volunteer an explanation.'
            }
          ]
        }
      ]
    },
    odie: {
      kicker: 'ODIE · PERSONAL KNOWLEDGE',
      title: 'Broken things leave evidence.',
      intro: 'Odie knows Greywake through repair, salvage, failing structures and the physical clues left behind when something stops working the way it should.',
      groups: [
        {
          title: 'Your Work',
          cards: [
            {
              title: 'Fixer First, Digger When Needed',
              tag: 'Practical identity',
              body: 'Odie goes into buried places and beyond the walls when a repair needs parts. He is not hunting treasure. He is looking for the pin, brace, hinge, seal, plate, cord or surviving piece of metal that buys Greywake another day.'
            },
            {
              title: 'What You Are Good At',
              tag: 'Lived expertise',
              body: 'Weak points, temporary repairs, useful scrap, unsafe structures, improvised fixes and knowing what can still be saved. Odie cannot make Greywake safe, but he can make something hold long enough for people to survive.'
            }
          ]
        },
        {
          title: 'Your Arm',
          cards: [
            {
              title: 'Salvage-Built Prosthetic',
              tag: 'Personal',
              body: 'Odie lost his arm a few years before the campaign and built a rough replacement from practical material. It can grip and brace well, but grit, strain, alignment and delicate work remain real problems. Odie maintains it because he has to.'
            },
            {
              title: 'Oldwork Finger',
              tag: 'Private',
              body: 'Odie possesses an unusual Oldwork finger that he has not fully understood. It is one of the clearest pieces of genuine Oldwork in his own experience.'
            }
          ]
        },
        {
          title: 'Debts, Favours and Secrets',
          cards: [
            {
              title: 'The White Tunnel',
              tag: 'Private mystery',
              body: 'Odie discovered a clean white tunnel and a strange door. He believes something useful or important lies beyond it, but the true function of the place remains unknown.'
            },
            {
              title: 'Velmira Knows',
              tag: 'Trusted secret',
              body: 'Velmira is the person Odie trusted with the Oldwork finger and the White Tunnel door. She helped keep him alive after the injury that cost him his arm; the secret sits inside that older trust.'
            },
            {
              title: 'Salvage Debt',
              tag: 'Personal obligation',
              body: 'A salvage merchant once gave Odie material that later proved more valuable to his arm than either of them understood at the time. Odie considers the imbalance a real debt.'
            },
            {
              title: 'A Guard Owes You',
              tag: 'Personal favour',
              body: 'Odie once gave water and shade to a guard collapsing from heat exhaustion. He expects respect and reciprocity rather than a formal reward.'
            }
          ]
        }
      ]
    }
  };

  function cardHTML(card) {
    const image=card.image?`<img class="personal-card-image" src="${card.image}" alt="" loading="lazy" decoding="async">`:'';
    return `<article class="personal-card${card.image?' has-image':''}">${image}<div class="personal-tag">${card.tag}</div><h4>${card.title}</h4><p>${card.body}</p></article>`;
  }

  function profileHTML(profile) {
    return `<div class="section-head personal-head"><div><div class="eyebrow">${profile.kicker}</div><h2>${profile.title}</h2></div><p>${profile.intro}</p></div>` +
      profile.groups.map(group => `<section class="personal-group"><h3>${group.title}</h3><div class="personal-grid">${group.cards.map(cardHTML).join('')}</div></section>`).join('');
  }

  function render(user) {
    const home = document.getElementById('home');
    if (!home) return;
    let section = document.getElementById('personalKnowledge');
    if (!section) {
      section = document.createElement('section');
      section.id = 'personalKnowledge';
      section.className = 'personal-knowledge';
      const discoveries = home.querySelector('.discoveries');
      if (discoveries) discoveries.insertAdjacentElement('afterend', section);
      else home.prepend(section);
    }

    if (user.role === 'gm') {
      section.innerHTML = `<div class="section-head personal-head"><div><div class="eyebrow">GM · PLAYER PERSPECTIVES</div><h2>Private knowledge by character</h2></div><p>This preview shows the material currently attached to each active PC. Players only see their own section.</p></div>` +
        Object.entries(PROFILES).map(([key, profile]) => `<section class="gm-profile-block"><div class="gm-profile-label">${key.toUpperCase()}</div>${profileHTML(profile)}</section>`).join('');
      return;
    }

    const key = user.character.toLowerCase();
    const profile = PROFILES[key];
    if (!profile) {
      section.innerHTML = '';
      section.classList.add('hidden');
      return;
    }
    section.classList.remove('hidden');
    section.innerHTML = profileHTML(profile);
  }

  window.addEventListener('greywake:player-ready', event => render(event.detail));
  document.addEventListener('DOMContentLoaded', () => {
    if (window.GreywakePlayer) render(window.GreywakePlayer);
  });
})();
