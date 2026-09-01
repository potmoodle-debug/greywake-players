(() => {
  const PROFILES = {
    marek: {
      kicker: 'MAREK · PERSONAL KNOWLEDGE',
      title: 'Bodies are evidence.',
      intro: 'Marek reads Greywake through fauna, anatomy and biological adaptation. His archive starts with what belongs to him personally and deliberately does not inherit Clay’s history.',
      groups: [
        {
          title: 'People You Know',
          cards: [
            {
              title: 'Meren',
              tag: 'Former teacher · continuing contact',
              image: 'assets/canon/characters/meren.webp',
              body: 'Meren trained Marek. Her speciality is herbs, medicine and medicinal biology, which complements his fauna and anatomy focus. She respects his ability but is cautious about his habit of experimenting before he fully understands a phenomenon.'
            },
            {
              title: 'Odie',
              tag: 'Fellow PC · difficult body to read',
              body: 'Marek finds Odie unusually difficult to read because the prosthetic arm changes his weight distribution and years of compensation make his movement depart from the patterns Marek expects.'
            },
            {
              title: 'Velmira',
              tag: 'Fellow PC · social interpreter',
              body: 'Velmira helps Marek interpret social intent and subtext. He is strong at reading bodies but less reliable at reading what people mean.'
            }
          ]
        },
        {
          title: 'The Unknown Beastform',
          cards: [
            {
              title: 'Your Body Knew First',
              tag: 'Private memory · confirmed event',
              body: 'During training, Marek once transformed into something he had never seen or studied. Normally he understands the anatomy he is trying to reproduce. This time his body seemed to know what it was becoming before he did.'
            },
            {
              title: 'Still Unanswered',
              tag: 'World truth deliberately undefined',
              body: 'Marek has never reproduced the form properly. He does not know what the creature was, whether it genuinely exists, why the transformation happened, or whether anything in Greywake or the wastes influenced it.'
            }
          ]
        },
        {
          title: 'Your Greywake Lens',
          cards: [
            {
              title: 'Animals Tell You First',
              tag: 'Working instinct',
              body: 'Changes in animal behaviour can reveal danger before people recognise it. Posture, weight distribution, head angle, feeding, movement and tension are all evidence.'
            },
            {
              title: 'What Problem Does This Body Solve?',
              tag: 'Druid speciality',
              body: 'Marek studies how creatures move, feed, hunt, defend themselves, regulate heat and sense danger. He is interested in the biological problem each adaptation solves, not simply in collecting impressive forms.'
            }
          ]
        }
      ]
    },
    velmira: {
      kicker: 'VELMIRA · PERSONAL KNOWLEDGE',
      title: 'People reveal pressure before they reveal truth.',
      intro: 'Velmira knows Greywake through relationships, trade, observation and conversation. She is good at recognising fear, need, pressure and contradiction without automatically knowing which interpretation is objectively true.',
      groups: [
        {
          title: 'Nemi, Tavi and Lysa',
          cards: [
            {
              title: 'Nemi',
              tag: 'Personal · current Stilling case',
              body: 'Nemi is a child Velmira once cared for and is directly connected to Velmira’s current concern about the Stilling. Exact hidden truths about the condition remain outside Velmira’s knowledge unless she discovers them in play.'
            },
            {
              title: 'Tavi',
              tag: 'Personal · Faithful connection',
              body: 'Velmira knows Tavi through her own family and relationships and can recognise the visible social pressure around the Faithful without automatically knowing their private conclusions.'
            },
            {
              title: 'Lysa',
              tag: 'Personal relationship',
              body: 'Lysa is part of Velmira’s established personal relationship network. What Lysa privately believes or knows still has to come from conversation or play rather than being assumed.'
            }
          ]
        },
        {
          title: 'What You Saw on Kestrel Return',
          cards: [
            {
              title: 'Wrong Lower Line',
              tag: 'Firsthand',
              body: 'Velmira knows the caravan was sent onto the wrong lower line after a route marker proved wrong, and that the groundfall happened before the cacklemaw attack.'
            },
            {
              title: 'Survivors and Great-Shells',
              tag: 'Firsthand',
              body: 'Joric survived and rejoined the others. The surviving crew reached Stone-Lip Hollow. Ash-Plate survived the groundfall, while Lowbell remained the viable loaded Great-Shell.'
            },
            {
              title: 'The Pale Case',
              tag: 'Firsthand · limits matter',
              body: 'Velmira saw Odie open the heavy pale case and knows it contained a large intact precision-made ceramic waterworks plate. Rennic believed it could matter to Greywake’s waterworks. She does not automatically know its exact function, compatibility, manufacture history or final value.'
            }
          ]
        },
        {
          title: 'Secrets and Unfinished Questions',
          cards: [
            {
              title: 'The Thing That Followed You',
              tag: 'Private memory',
              body: 'Velmira survived a desert journey while an unidentified presence followed her for much of the day without attacking. What it was remains unknown.'
            },
            {
              title: 'Odie’s Confidence',
              tag: 'Private trusted knowledge',
              body: 'Odie trusted Velmira with the separate Oldwork finger, the clean white tunnel and the White Door. She knows those facts because Odie told her; their true nature remains undefined.'
            },
            {
              title: 'The Faithful',
              tag: 'Tier 2 lived familiarity',
              body: 'Velmira can reasonably know the Faithful’s public rituals, language, gathering habits, visible personalities and social influence. Private interpretations, internal disagreements and hidden conclusions still require a source or investigation.'
            }
          ]
        }
      ]
    },
    odie: {
      kicker: 'ODIE · PERSONAL KNOWLEDGE',
      title: 'Broken things leave evidence.',
      intro: 'Odie knows Greywake through repair, salvage and structural failure. His expertise tells him how something is made, broken, repaired, adapted or mismatched; it does not automatically reveal hidden ownership, motive or original purpose.',
      groups: [
        {
          title: 'Your Work',
          cards: [
            {
              title: 'Repair and Salvage',
              tag: 'Tier 2 practical knowledge',
              body: 'Odie is particularly good at recognising wear, bad repair, improvised repair, mismatched parts, usable material and what can plausibly be made to hold with the means available.'
            },
            {
              title: 'The Failed Marker',
              tag: 'Physical inference · not proof',
              body: 'Odie has seen evidence that the failed route marker’s repair or alteration was poor enough to question. That is evidence of bad work or alteration, not proof of sabotage, a culprit or intent.'
            }
          ]
        },
        {
          title: 'The Closing Ways',
          cards: [
            {
              title: 'Hidden Haul Routes Exist',
              tag: 'Firsthand / local Digger knowledge',
              body: 'Odie knows some Digger crews use concealed unofficial tunnels and old buried passages to bring salvage into Greywake without using normal gates, public unloading points or immediate scrutiny. He does not know every route and nobody should be assumed to possess a complete map.'
            },
            {
              title: 'Entrances Are Being Closed',
              tag: 'Known fact',
              body: 'Several concealed entrances are being deliberately closed or filled. At least one closure was targeted precisely enough that whoever arranged it had specific knowledge of an undocumented entrance.'
            },
            {
              title: 'Someone Is Reporting Them?',
              tag: 'Odie’s suspicion · not established fact',
              body: 'Odie suspects somebody is reporting tunnel locations and wants to identify the source and stop further closures. He does not yet know who is responsible, why, whether one person or faction is involved, or whether every closure is connected.'
            }
          ]
        },
        {
          title: 'Oldwork and the White Door',
          cards: [
            {
              title: 'Oldwork Finger',
              tag: 'Private · separate object',
              body: 'Odie possesses a separate Oldwork finger. It is not fitted to his salvage prosthetic. Its original owner, origin, purpose and capabilities remain unknown.'
            },
            {
              title: 'What You Found',
              tag: 'Private discovery',
              image: 'assets/generated/odie-white-door-dark.webp',
              body: 'Odie knows directly about the clean white tunnel and the White Door. Their builders, purpose, operation and connection—if any—to the Oldwork finger remain unexplained.'
            },
            {
              title: 'Velmira Knows',
              tag: 'Trusted secret',
              body: 'Velmira also knows about the separate Oldwork finger, the clean white tunnel and the White Door because Odie chose to trust her with them.'
            }
          ]
        },
        {
          title: 'What You Saw on Kestrel Return',
          cards: [
            {
              title: 'The Pale Case',
              tag: 'Firsthand · repair perspective',
              body: 'Odie opened the heavy pale case without damaging it. Inside was a large intact precision-made ceramic waterworks plate marked with unfamiliar water-channel diagrams. Rennic believed it could matter to Greywake’s waterworks.'
            },
            {
              title: 'What You Still Do Not Know',
              tag: 'Knowledge boundary',
              body: 'Odie does not automatically know the plate’s exact function, compatibility, manufacture history or final value to Greywake.'
            }
          ]
        },
        {
          title: 'Debts and Favours',
          cards: [
            {
              title: 'Salvage Debt',
              tag: 'Personal obligation',
              body: 'Odie knows he owes a debt connected to salvage that proved more valuable than expected. The creditor’s identity, exact value and eventual demand remain undefined.'
            },
            {
              title: 'A Guard Owes You',
              tag: 'Personal favour',
              body: 'Odie knows a Greywake guard owes him a favour after he saved them from heat exhaustion. The guard’s identity, current position and reasonable limits of that favour remain undefined.'
            }
          ]
        }
      ]
    }
  };

  function cardHTML(card) {
    const normalImage=card.image?`<img class="personal-card-image" src="${card.image}" alt="" loading="lazy" decoding="async">`:'';
    const encodedImage=card.imageData?`<img class="personal-card-image" data-b64-image="${card.imageData}" alt="The dark, sealed White Door as Odie remembers it" loading="lazy" decoding="async">`:'';
    const image=normalImage||encodedImage;
    return `<article class="personal-card${image?' has-image':''}">${image}<div class="personal-tag">${card.tag}</div><h4>${card.title}</h4><p>${card.body}</p></article>`;
  }

  function profileHTML(profile) {
    return `<div class="section-head personal-head"><div><div class="eyebrow">${profile.kicker}</div><h2>${profile.title}</h2></div><p>${profile.intro}</p></div>` +
      profile.groups.map(group => `<section class="personal-group"><h3>${group.title}</h3><div class="personal-grid">${group.cards.map(cardHTML).join('')}</div></section>`).join('');
  }

  function hydrateEncodedImages(root) {
    root.querySelectorAll('img[data-b64-image]').forEach(img => {
      const path = img.dataset.b64Image;
      fetch(path)
        .then(response => {
          if (!response.ok) throw new Error(`Image data unavailable: ${response.status}`);
          return response.text();
        })
        .then(encoded => {
          img.src = `data:image/webp;base64,${encoded.trim()}`;
          img.removeAttribute('data-b64-image');
        })
        .catch(() => img.remove());
    });
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
      hydrateEncodedImages(section);
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
    hydrateEncodedImages(section);
  }

  window.addEventListener('greywake:player-ready', event => render(event.detail));
  document.addEventListener('DOMContentLoaded', () => {
    if (window.GreywakePlayer) render(window.GreywakePlayer);
  });
})();
