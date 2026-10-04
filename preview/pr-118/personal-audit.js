(() => {
  function makeCard(title, tag, body) {
    const el = document.createElement('article');
    el.className = 'personal-card';
    el.innerHTML = `<div class="personal-tag">${tag}</div><h4>${title}</h4><p>${body}</p>`;
    return el;
  }

  function findGroup(root, title) {
    return [...(root?.querySelectorAll(':scope > .personal-group') || [])].find(group =>
      group.querySelector(':scope > h3')?.textContent.trim() === title
    ) || null;
  }

  function ensurePeopleGroup(root, cards) {
    if (!root || findGroup(root, 'People You Know')) return;
    const group = document.createElement('section');
    group.className = 'personal-group personal-people-group';
    group.innerHTML = '<h3>People You Know</h3><div class="personal-grid"></div>';
    const grid = group.querySelector('.personal-grid');
    cards.forEach(card => grid.appendChild(makeCard(card.title, card.tag, card.body)));
    const firstGroup = root.querySelector(':scope > .personal-group');
    if (firstGroup) root.insertBefore(group, firstGroup);
    else root.appendChild(group);
  }

  function addPerson(root, card) {
    const group = findGroup(root, 'People You Know');
    const grid = group?.querySelector('.personal-grid');
    if (!grid) return;
    const exists = [...grid.querySelectorAll('.personal-card h4')].some(h => h.textContent.trim() === card.title);
    if (!exists) grid.appendChild(makeCard(card.title, card.tag, card.body));
  }

  function rootFor(user) {
    const section = document.getElementById('personalKnowledge');
    if (!section || user.role === 'gm') return null;
    return section;
  }

  function apply(user) {
    const root = rootFor(user);
    if (!root) return;
    const character = user.character?.toLowerCase();

    if (character === 'marek') {
      addPerson(root, {
        title: 'Daro Pell',
        tag: 'Carcass processor · professional acquaintance',
        body: 'Marek knows Daro Pell through Greywake’s practical work around animals and carcasses. Daro is a carcass processor, butcher, hide-worker and food-safety specialist: someone who thinks carefully about what from an animal is useful, contaminated, dangerous or safe to bring back into Greywake.'
      });
    }

    if (character === 'velmira') {
      const existing = findGroup(root, 'Nemi, Tavi and Lysa');
      if (existing) {
        existing.querySelector(':scope > h3').textContent = 'People You Know';
        existing.classList.add('personal-people-group');
      } else {
        ensurePeopleGroup(root, [
          { title: 'Nemi', tag: 'Personal · current Stilling case', body: 'Nemi is a child Velmira once cared for and is directly connected to her concern about the Stilling.' },
          { title: 'Tavi', tag: 'Personal · Faithful connection', body: 'Velmira knows Tavi through her own family and relationships.' },
          { title: 'Lysa', tag: 'Personal relationship', body: 'Lysa is part of Velmira’s established personal relationship network.' }
        ]);
      }
    }

    if (character === 'odie') {
      ensurePeopleGroup(root, [
        {
          title: 'Velmira',
          tag: 'Trusted companion',
          body: 'Odie trusted Velmira with the separate Oldwork finger, the clean white tunnel and the White Door. She knows what he told her, not what those things truly are.'
        },
        {
          title: 'Joric Noll',
          tag: 'Known through Kestrel Return',
          body: 'Odie knows Joric survived the caravan disaster and later rejoined the other survivors at Stone-Lip Hollow.'
        },
        {
          title: 'Marek',
          tag: 'Fellow PC',
          body: 'Marek is part of Odie’s current travelling group in Greywake. Their relationship can develop from what happens in play rather than inheriting Clay’s history.'
        }
      ]);
    }
  }

  window.addEventListener('greywake:player-ready', event => queueMicrotask(() => apply(event.detail)));
})();
