(() => {
  function card(title, tag, body) {
    const el = document.createElement('article');
    el.className = 'personal-card';
    el.innerHTML = `<div class="personal-tag">${tag}</div><h4>${title}</h4><p>${body}</p>`;
    return el;
  }

  function findCard(title) {
    return [...document.querySelectorAll('#personalKnowledge .personal-card')].find(el => el.querySelector('h4')?.textContent.trim() === title);
  }

  function replaceBody(title, body) {
    const el = findCard(title);
    if (el) el.querySelector('p').textContent = body;
  }

  function addToGroup(groupTitle, title, tag, body) {
    const group = [...document.querySelectorAll('#personalKnowledge .personal-group')].find(g => g.querySelector('h3')?.textContent.trim() === groupTitle);
    if (!group || findCard(title)) return;
    group.querySelector('.personal-grid')?.appendChild(card(title, tag, body));
  }

  function apply(user) {
    const character = user.character?.toLowerCase();
    if (user.role === 'gm') return; // Full GM already sees the base profiles; use player previews for exact views.

    if (character === 'marek') {
      replaceBody('Meren', 'Meren is a 58-year-old practical medicinal practitioner and Marek’s former teacher. She remains a continuing professional contact, with strong expertise in everyday medicine, heat, dehydration, infection and local remedies — but she is careful about separating what she knows from what she only suspects.');
      replaceBody('Daro Pell', 'Daro Pell is a Greywake carcass processor, butcher, hide-worker and food-safety specialist. Marek knows him as a professional acquaintance and occasional collaborator: someone who thinks carefully about what from an animal is useful, contaminated, dangerous or safe to bring back into Greywake.');
    }

    if (character === 'velmira') {
      replaceBody('Nemi', 'Nemi is Lysa’s 11-year-old daughter, a child Velmira cared for before the current crisis. The Stilling has made her increasingly pale, dry, cold, heavy, slow and thirsty. She is currently in Stage 2 — Deepening Change, moving toward Stage 3, but remains responsive and recognisably herself. Ordinary remedies, water, salves, charms and small workings have not stopped the progression. The cause and cure remain unknown.');
      replaceBody('Tavi Is Not Lost', 'Tavin, usually called Tavi, is Velmira’s 18-year-old niece/nephew and works as a Patch Market stock-hand and stall assistant. Tavi has been spending increasing time around Faithful gatherings but is not formally committed. They are looking for meaning, belonging and reassurance rather than blindly accepting doctrine.');
      addToGroup('Nemi and the Stilling', 'Lysa', 'Personal · Nemi’s household', 'Lysa is Nemi’s mother and primary carer in the Tangle Lanes. She trusts practical help more than grand promises and is increasingly protective of who gets access to Nemi. The illness is already costing the household: Lysa has reduced work and quietly sold household goods to keep caring for her daughter.');
    }

    if (character === 'odie') {
      replaceBody('The White Tunnel', 'Odie discovered a clean white tunnel and a strange door. He knows they are unusual and has not established their purpose, origin or what lies beyond. Their true nature remains undefined.');
      replaceBody('Salvage Debt', 'Odie believes salvage once given to him proved more valuable than either party understood at the time. The debt is real, but the creditor’s identity, exact value and eventual demand remain undefined.');
      addToGroup('Debts, Favours and Secrets', 'Joric’s Parents', 'Personal connection', 'Odie regularly checks on Joric’s parents. That relationship existed before the caravan returned and is part of why Joric’s survival mattered to him personally.');
    }
  }

  window.addEventListener('greywake:player-ready', event => queueMicrotask(() => apply(event.detail)));
})();