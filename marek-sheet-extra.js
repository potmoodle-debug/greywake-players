(() => {
  const EXTRA_FEATURES = [
    ['Wildtouch','Druid class feature','Marek can create harmless, subtle effects involving nature at will: encourage small plant growth, stir a light gust, start a campfire and similar minor workings.'],
    ['High Stamina','Mixed Ancestry','Marek gained one additional Stress slot at character creation.'],
    ['Nimble','Mixed Ancestry','Marek gained a permanent +1 bonus to Evasion at character creation.'],
    ['Lightfoot','Wildborne community','Marek’s movement is naturally quiet; he has advantage on rolls to move without being heard.']
  ];

  const EXTRA_GEAR = [
    ['Gambeson Armor','Armor','Carried armor on Marek’s current Demiplane equipment list. His current overall sheet shows Armor 4 and damage thresholds 6 / 12 with the Round Shield active.'],
    ['Torch','Equipment','A standard torch carried in Marek’s equipment.'],
    ['50 ft of Rope','Equipment','Fifty feet of rope carried in Marek’s equipment.'],
    ['Basic Supplies','Equipment','General adventuring and field supplies carried by Marek.'],
    ['Minor Stamina Potion','Consumable','A consumable that immediately clears all Stress.'],
    ['Small Bag of Rocks and Bones','Personal item','A small bag of rocks and bones carried among Marek’s equipment.']
  ];

  const DETAILS = [
    ['Pronouns','He / Him',''],
    ['Clothes','Appearance','Sand-coloured, layered and patched for hard travel.'],
    ['Eyes','Appearance','Amber gold, always studying something.'],
    ['Body','Appearance','Lean, wiry and slightly long-limbed.'],
    ['Colour & materials','Appearance','Sun-warmed skin and dust-faded cloth.'],
    ['Attitude','Appearance','Curious, practical and a little unsettling.']
  ];

  const BACKGROUND = [
    ['Why his community relied on nature','Background','Their work often took them beyond Greywake’s walls, where animal behaviour could warn of danger before people noticed it.'],
    ['First wild animal bond','Background','A young Cacklemaw Marek studied closely. The bond ended when observation gave way to understanding rather than companionship.'],
    ['Who is hunting him?','Background','No one in particular. Marek’s story is not driven by being hunted, but by the unknown Beastform he once became.']
  ];

  const CONNECTIONS = [
    ['What did you confide in me that makes me leap into danger for you every time?','Unanswered','This connection prompt is still blank on Marek’s Demiplane sheet.'],
    ['What animal do I say you remind me of?','Unanswered','This connection prompt is still blank on Marek’s Demiplane sheet.'],
    ['What affectionate nickname have you given me?','Unanswered','This connection prompt is still blank on Marek’s Demiplane sheet.']
  ];

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function card([title, value, body]) {
    return `<details class="sheet-card personal-card marek-extra-card"><summary><h4>${esc(title)}</h4><span class="sheet-value">${esc(value || '')}</span></summary><div class="sheet-card-body"><p>${esc(body || '')}</p></div></details>`;
  }

  function findGroup(title) {
    return [...document.querySelectorAll('#characterSheet .sheet-group')].find(group => group.querySelector('h3')?.textContent.trim() === title);
  }

  function addCardsToGroup(title, items) {
    const group = findGroup(title);
    const grid = group?.querySelector('.sheet-grid');
    if (!grid) return false;
    let changed = false;
    items.forEach(item => {
      const name = item[0];
      if ([...grid.querySelectorAll('h4')].some(h => h.textContent.trim() === name)) return;
      grid.insertAdjacentHTML('beforeend', card(item));
      changed = true;
    });
    return changed;
  }

  function addGroup(title, hint, items) {
    const body = document.querySelector('#characterSheet .character-sheet-body');
    if (!body || findGroup(title)) return false;
    body.insertAdjacentHTML('beforeend', `<section class="sheet-group marek-extra-group"><div class="sheet-group-head"><h3>${esc(title)}</h3><p>${esc(hint)}</p></div><div class="sheet-grid">${items.map(card).join('')}</div></section>`);
    return true;
  }

  function enhance() {
    if ((document.body.dataset.character || '').toLowerCase() !== 'marek') return;
    const sheet = document.querySelector('#characterSheet .character-sheet-shell');
    if (!sheet) return;

    let changed = false;
    changed = addCardsToGroup('Features', EXTRA_FEATURES) || changed;
    changed = addCardsToGroup('Weapons, armor & inventory', EXTRA_GEAR) || changed;
    changed = addGroup('Character details', 'From Marek’s Demiplane details tab', DETAILS) || changed;
    changed = addGroup('Background', 'Answers already written on the sheet', BACKGROUND) || changed;
    changed = addGroup('Connections', 'Not yet answered', CONNECTIONS) || changed;

    if (changed) window.dispatchEvent(new CustomEvent('greywake:sheet-enhanced'));
  }

  let timer;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(enhance, 80);
  };

  window.addEventListener('greywake:player-ready', schedule);
  document.addEventListener('DOMContentLoaded', schedule);
  if (document.readyState !== 'loading') schedule();
})();
