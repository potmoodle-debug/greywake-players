(() => {
  function card(title, tag, body) {
    const el = document.createElement('article');
    el.className = 'personal-card';
    el.innerHTML = `<div class="personal-tag">${tag}</div><h4>${title}</h4><p>${body}</p>`;
    return el;
  }

  function findCard(root, title) {
    if (!root) return null;
    return [...root.querySelectorAll('.personal-card')].find(el => el.querySelector('h4')?.textContent.trim() === title);
  }

  function replaceBody(root, title, body) {
    const el = findCard(root, title);
    if (el) el.querySelector('p').textContent = body;
  }

  function ensureGroup(root, groupTitle) {
    if (!root) return null;
    let group = [...root.querySelectorAll(':scope > .personal-group')].find(g => g.querySelector(':scope > h3')?.textContent.trim() === groupTitle);
    if (group) return group;

    group = document.createElement('section');
    group.className = 'personal-group';
    group.innerHTML = `<h3>${groupTitle}</h3><div class="personal-grid"></div>`;
    root.appendChild(group);
    return group;
  }

  function addToGroup(root, groupTitle, title, tag, body) {
    if (!root || findCard(root, title)) return;
    const group = ensureGroup(root, groupTitle);
    group?.querySelector('.personal-grid')?.appendChild(card(title, tag, body));
  }

  function rootFor(character, user) {
    const section = document.getElementById('personalKnowledge');
    if (!section) return null;
    if (user.role !== 'gm') return section;

    const wanted = character.toUpperCase();
    return [...section.querySelectorAll('.gm-profile-block')].find(block =>
      block.querySelector('.gm-profile-label')?.textContent.trim() === wanted
    ) || null;
  }

  function applyMarek(root) {
    replaceBody(root, 'Meren', 'Meren is a 58-year-old practical medicinal practitioner and Marek’s former teacher. She remains a continuing professional contact, with strong expertise in everyday medicine, heat, dehydration, infection and local remedies — but she is careful about separating what she knows from what she only suspects.');
    replaceBody(root, 'Daro Pell', 'Daro Pell is a Greywake carcass processor, butcher, hide-worker and food-safety specialist. Marek knows him as a professional acquaintance and occasional collaborator: someone who thinks carefully about what from an animal is useful, contaminated, dangerous or safe to bring back into Greywake.');

    addToGroup(root, 'Unfinished Questions', 'The Unknown Beastform', 'Private memory · unresolved', 'During his training, Marek once transformed into something he had never seen or studied. His body seemed to know the form before he did, and he has never been able to reproduce it properly. Marek knows the event happened; he does not know what the creature was, whether it exists, or why the transformation occurred.');
    addToGroup(root, 'Unfinished Questions', 'What Is Not Established', 'Knowledge boundary', 'Marek has no confirmed link between the unknown Beastform and the Tower, Dead Ground, Oldwork, or any other cause. Those explanations remain unknown rather than clues he already possesses.');
  }

  function applyVelmira(root) {
    replaceBody(root, 'Nemi', 'Nemi is Lysa’s 11-year-old daughter, a child Velmira cared for before the current crisis. The Stilling has made her increasingly pale, dry, cold, heavy, slow and thirsty. She is currently in Stage 2 — Deepening Change, moving toward Stage 3, but remains responsive and recognisably herself. Ordinary remedies, water, salves, charms and small workings have not stopped the progression. The cause and cure remain unknown.');
    replaceBody(root, 'Tavi Is Not Lost', 'Tavin, usually called Tavi, is Velmira’s 18-year-old niece/nephew and works as a Patch Market stock-hand and stall assistant. Tavi has been spending increasing time around Faithful gatherings but is not formally committed. They are looking for meaning, belonging and reassurance rather than blindly accepting doctrine.');

    addToGroup(root, 'Nemi and the Stilling', 'Lysa', 'Personal · Nemi’s household', 'Lysa is Nemi’s mother and primary carer in the Tangle Lanes. She trusts practical help more than grand promises and is increasingly protective of who gets access to Nemi. The illness is already costing the household: Lysa has reduced work and quietly sold household goods to keep caring for her daughter.');

    addToGroup(root, 'People You Know', 'Sister Elowen', 'The Faithful · public voice', 'Velmira knows Sister Elowen as a visible voice among the Faithful and understands the comfort, certainty and social influence she can offer. That familiarity does not give Velmira access to hidden doctrine, private conclusions or proof about the Tower or the Stilling.');
    addToGroup(root, 'People You Know', 'Mara Vell', 'Dust Broker · information contact', 'Velmira knows Mara Vell as a Dust Broker near Valve Court: someone who trades in route rumours, warnings, names, favours and useful information. Velmira can know Mara’s public trade and reputation without assuming every rumour Mara carries is true.');
  }

  function applyOdie(root) {
    replaceBody(root, 'What You Found', 'Odie discovered a clean white tunnel and a strange sealed door. He knows the construction is unusually precise and unlike ordinary Greywake work, but he has not established its purpose, origin or what lies beyond. Its true nature remains undefined.');
    replaceBody(root, 'Salvage Debt', 'Odie believes salvage once given to him proved more valuable than either party understood at the time. The debt is real, but the creditor’s identity, exact value and eventual demand remain undefined.');

    addToGroup(root, 'Your Work', 'The Failed Marker', 'Physical evidence · inference', 'Odie has examined enough of the failed route marker to know its repair or alteration was poor and worth questioning. That is evidence of a bad or mismatched intervention, not proof of sabotage, motive or who was responsible.');

    addToGroup(root, 'The Closing Ways', 'Hidden Digger Haul Ways', 'Local knowledge · firsthand', 'Odie knows some Digger crews use concealed unofficial tunnels and old buried passages to bring salvage into Greywake without using the normal gates, public unloading points or immediate scrutiny. He does not know every route, and no complete map should be assumed.');
    addToGroup(root, 'The Closing Ways', 'Entrances Are Being Sealed', 'Current discovery', 'Several concealed entrances are being deliberately closed or filled. At least one closure was targeted precisely enough that whoever directed it knew where an undocumented entrance was.');
    addToGroup(root, 'The Closing Ways', 'Someone Knows Too Much', 'Odie’s suspicion', 'Odie suspects somebody is reporting the hidden tunnel locations and wants to identify the source before more routes are lost. This is his current interpretation, not an established fact.');
    addToGroup(root, 'The Closing Ways', 'What You Do Not Know Yet', 'Knowledge boundary', 'Odie does not yet know who is responsible, why the routes are being closed, whether one person or faction is behind every closure, or whether the people revealing entrances and the people sealing them are the same.');

    addToGroup(root, 'Debts and Favours', 'Joric’s Parents', 'Personal connection', 'Odie regularly checks on Joric’s parents. That relationship existed before the caravan returned and is part of why Joric’s survival mattered to him personally.');
  }

  function apply(user) {
    const character = user.character?.toLowerCase();

    if (user.role === 'gm') {
      applyMarek(rootFor('marek', user));
      applyVelmira(rootFor('velmira', user));
      applyOdie(rootFor('odie', user));
      return;
    }

    const root = rootFor(character, user);
    if (character === 'marek') applyMarek(root);
    if (character === 'velmira') applyVelmira(root);
    if (character === 'odie') applyOdie(root);
  }

  window.addEventListener('greywake:player-ready', event => queueMicrotask(() => apply(event.detail)));
})();