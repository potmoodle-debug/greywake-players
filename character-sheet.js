(() => {
  const SHEETS = {
    velmira: {
      name: 'Velmira',
      subtitle: 'Wizard · School of Knowledge · Wanderborne Human',
      portrait: 'assets/canon/characters/velmira-poster.webp',
      note: 'Reference view only for this first version. Live HP, Hope, Stress and Armor marks should still be tracked on the main play sheet until Greywake becomes the agreed source of truth.',
      stats: [
        ['Level','1'],['Evasion','11'],['Armor','3'],['HP max','5'],['Stress max','7'],['Proficiency','1']
      ],
      traits: [
        ['Agility','−1','Sprint · Leap · Maneuver'],['Strength','0','Lift · Smash · Grapple'],['Finesse','0','Control · Hide · Tinker'],['Instinct','+1','Perceive · Sense · Navigate'],['Presence','+1','Charm · Perform · Deceive'],['Knowledge','+2','Recall · Analyze · Comprehend']
      ],
      experiences: [
        ['Friend to All','+2','Spend a Hope when this Experience genuinely applies to an action roll. Velmira commonly leans on it to calm people, find common ground and gently gather information.'],
        ['Fake It Till You Make It','+2','Spend a Hope when Velmira is bluffing, improvising confidence, acting as though she belongs, or buying time by sounding more certain than she feels.']
      ],
      features: [
        ['Not This Time','Hope feature · 3 Hope','Force an adversary within Far range to reroll an attack or damage roll.'],
        ['Prestidigitation','Wizard class feature','Perform harmless, subtle magical effects at will: small lights, smells, colour changes, tiny floating objects and similarly minor workings.'],
        ['Strange Patterns','Wizard class feature','Choose a number from 1–12. When that number appears on a Duality Die, gain a Hope or clear a Stress. The chosen number can change on a long rest.'],
        ['Prepared','School of Knowledge','Take one additional domain card of your level or lower from a domain you can access.'],
        ['Adept','School of Knowledge','When using an Experience, you may mark a Stress instead of spending Hope; if you do, double that Experience modifier for the roll.'],
        ['Human · Adaptability','Ancestry','After failing a roll that used one of your Experiences, you may mark a Stress to reroll.'],
        ['Human · High Stamina','Ancestry','Velmira began with one additional Stress slot.'],
        ['Nomadic Pack','Wanderborne community','Once per session, spend a Hope to pull a useful mundane item from the pack, agreeing the item with the GM.']
      ],
      domains: [
        ['Mending Touch','Splendor · Spell · Recall 1','Spend 2 Hope after a few minutes of focused healing to clear 1 HP or 1 Stress from a creature. Once per long rest, a meaningful shared moment can improve that healing.'],
        ['Reassurance','Splendor · Ability · Recall 0','Once per rest, after an ally attempts an action roll but before consequences resolve, offer support so they may reroll.'],
        ['Book of Ava','Codex · Grimoire · Recall 2','Contains Power Push, Tava’s Armor and Velmira’s Greywake-flavoured Dust Spike working. Open this card when those options matter in play.']
      ],
      gear: [
        ['Greatstaff','Primary weapon','Knowledge · Very Far · 1d6 magic. Powerful: on a successful attack, roll an additional damage die and discard the lowest result.'],
        ['Leather Armor','Active armor','Armor Score 3 · base thresholds 6 / 13; current level-adjusted damage thresholds are 7 / 14.'],
        ['Whip','Inventory weapon','Presence · Very Close · 1d6 physical. Startling: mark a Stress to crack the whip and force adversaries within Melee range back to Close range.'],
        ['Nomadic Pack','Inventory','Wanderborne pack used by the Nomadic Pack community feature.']
      ]
    },
    odie: {
      name: 'Odie',
      subtitle: 'Rogue · Nightwalker · Underborne Mixed Ancestry',
      portrait: 'assets/canon/characters/odie-canon.webp',
      note: 'Reference view only for this first version. Live HP, Hope, Stress and Armor marks should still be tracked on the main play sheet until Greywake becomes the agreed source of truth.',
      stats: [
        ['Level','1'],['Evasion','13'],['Armor','3'],['HP max','6'],['Stress max','6'],['Proficiency','1']
      ],
      traits: [
        ['Agility','+1','Sprint · Leap · Maneuver'],['Strength','+1','Lift · Smash · Grapple'],['Finesse','+2','Control · Hide · Tinker'],['Instinct','0','Perceive · Sense · Navigate'],['Presence','−1','Charm · Perform · Deceive'],['Knowledge','0','Recall · Analyze · Comprehend']
      ],
      experiences: [
        ['Repair','+3','Odie’s Purposeful Design ancestry feature permanently increases this Experience. Spend a Hope when his repair expertise genuinely applies to an action roll.'],
        ['Scavenger','+2','Spend a Hope when Odie’s salvage knowledge, search habits or experience judging discarded material genuinely applies to an action roll.']
      ],
      features: [
        ['Rogue’s Dodge','Hope feature · 3 Hope','Gain +2 Evasion until the next successful attack against Odie; if no attack succeeds, the bonus lasts until the next rest.'],
        ['Cloaked','Rogue class feature','When Odie would become Hidden, he becomes Cloaked instead. Remaining still can keep him unseen even when a foe moves where they would normally spot him.'],
        ['Sneak Attack','Rogue class feature','On a successful attack while Cloaked, or while an ally is in Melee range of the target, add extra d6 damage based on tier.'],
        ['Shadow Stepper','Nightwalker','Enter darkness or another creature/object’s shadow, mark a Stress, and reappear in another shadow within Far range while Cloaked.'],
        ['Pick and Pull','Midnight ability','Odie has advantage on action rolls to pick nonmagical locks, disarm nonmagical traps or steal items.'],
        ['Purposeful Design','Mixed Ancestry','Repair is the Experience tied to Odie’s designed purpose and has a permanent +1 bonus.'],
        ['Adaptability','Mixed Ancestry','After failing a roll that used one of Odie’s Experiences, he may mark a Stress to reroll.'],
        ['Low-Light Living','Underborne community','In low light or heavy shadow, Odie has advantage on rolls to hide, investigate or perceive details.']
      ],
      domains: [
        ['Pick and Pull','Midnight · Ability · Recall 0','Advantage on action rolls to pick nonmagical locks, disarm nonmagical traps or steal an item through stealth or force.'],
        ['Rain of Blades','Midnight · Spell · Recall 1','Spend a Hope and make a Spellcast Roll against targets within Very Close range. Successful targets take d8+2 magic damage using Proficiency; Vulnerable targets take additional damage.']
      ],
      gear: [
        ['Spear','Primary weapon','Finesse · Very Close · 1d8+3 physical.'],
        ['Gambeson Armor','Active armor','Armor Score 3 · base thresholds 5 / 11; current level-adjusted damage thresholds are 6 / 12. Flexible grants +1 Evasion.'],
        ['Small Dagger','Inventory weapon','Finesse · Melee · 1d8 physical. Paired: adds +2 primary-weapon damage against targets within Melee range.'],
        ['Working kit','Inventory','Torch · 50 ft rope · basic supplies · grappling hook · Minor Health Potion. Odie’s salvage-built prosthetic and Oldwork finger remain character-specific equipment rather than generic loot.']
      ]
    },
    marek: {
      name: 'Marek',
      subtitle: 'Druid · Warden of Renewal · Wildborne Mixed Ancestry',
      portrait: 'assets/canon/characters/marek-canon.jpg',
      note: 'Imported from Marek’s current Demiplane sheet. This Greywake page is still a reference view: Demiplane remains the live source for changing Hope, HP, Stress and Armor marks for now.',
      stats: [
        ['Level','1'],['Evasion','12'],['Armor','4'],['HP','0 / 6 marked'],['Stress','0 / 7 marked'],['Hope','2 / 6']
      ],
      traits: [
        ['Agility','+1','Sprint · Dodge · Leap'],['Strength','0','Lift · Smash · Grapple'],['Finesse','+1','Control · Hide · Tinker'],['Instinct','+2','Perceive · Sense · Navigate'],['Presence','−1','Charm · Perform · Deceive'],['Knowledge','0','Recall · Analyze · Comprehend']
      ],
      experiences: [
        ['Body Language','+2','Marek reads posture, weight distribution, head angle, movement and muscular tension as practical evidence. Spend a Hope when that lived expertise genuinely applies to an action roll.'],
        ['Let Me Try Something','+2','Marek’s experimental instinct. Spend a Hope when trying, testing or improvising a practical biological solution genuinely draws on this Experience.']
      ],
      features: [
        ['Evolution','Druid Hope feature · 3 Hope','Spend 3 Hope to transform into a Beastform without marking Stress. When you do, choose one trait to raise by +1 until you drop out of that Beastform.'],
        ['Beastform','Druid class feature','Mark a Stress to transform into a creature of your tier or lower from the Beastform list. You gain that form’s features and Evasion; armor becomes part of the form, and already-marked Armor Slots remain marked when you return.'],
        ['Clarity of Nature','Warden of Renewal','Once per long rest, create a small space of natural serenity; after a few minutes resting there, clear Stress equal to Marek’s Instinct, distributed among Marek and allies.'],
        ['Regeneration','Warden of Renewal · 3 Hope','Touch a creature and spend 3 Hope so it clears 1d4 Hit Points.'],
        ['Anatomical Beastform','Greywake flavour','Marek’s change is fast, physical and anatomical rather than hidden by light or smoke. His amber-gold eyes remain recognisably his. This changes flavour, not mechanics.']
      ],
      domains: [
        ['Nature’s Tongue','Sage · Ability','Speak the language of the natural world. To speak to nearby plants or animals, make an Instinct Roll (12); on success they give the information they know, while Fear can limit knowledge or impose a cost. Before a Spellcast Roll in a natural environment, spend a Hope for +2 to the roll.'],
        ['Wall Walk','Arcana · Spell','Spend a Hope to allow a creature you can touch to climb walls and ceilings as easily as walking on the ground until the end of the scene or until you cast Wall Walk again.']
      ],
      gear: [
        ['Shortstaff','Primary weapon','Instinct · Close · 1d8+1 magical. No additional weapon feature is shown on the current sheet.'],
        ['Round Shield','Secondary weapon','Strength · Melee · 1d4 physical. Protective (Melee): +1 to Armor Score.'],
        ['Damage thresholds','Armor reference','Current visible thresholds: 6 / 12. Armor Score is 4 with 0 of 4 Armor Slots currently marked.']
      ]
    }
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function statStrip(stats) {
    return `<div class="character-stat-strip">${stats.map(([label,value]) => `<div class="character-stat"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div>`;
  }

  function detailCard(item) {
    const [title,value,body] = item;
    return `<details class="sheet-card personal-card"><summary><h4>${esc(title)}</h4><span class="sheet-value">${esc(value || '')}</span></summary><div class="sheet-card-body"><p>${esc(body || '')}</p></div></details>`;
  }

  function group(title, items, options = {}) {
    if (!items || !items.length) return '';
    const cls = options.traits ? 'sheet-grid traits' : 'sheet-grid';
    return `<section class="sheet-group"><div class="sheet-group-head"><h3>${esc(title)}</h3>${options.hint ? `<p>${esc(options.hint)}</p>` : ''}</div><div class="${cls}">${items.map(detailCard).join('')}</div></section>`;
  }

  function playerSheet(sheet) {
    const portrait = sheet.portrait
      ? `<img class="character-sheet-portrait" src="${esc(sheet.portrait)}" alt="${esc(sheet.name)}" loading="lazy" decoding="async">`
      : `<div class="character-sheet-monogram" aria-hidden="true">${esc(sheet.name.slice(0,1))}</div>`;
    return `<div class="character-sheet-shell">
      <div class="character-sheet-hero">
        ${portrait}
        <div class="character-sheet-identity">
          <div class="character-sheet-eyebrow">CLICKABLE CHARACTER REFERENCE</div>
          <h2>${esc(sheet.name)}</h2>
          <p class="character-sheet-subtitle">${esc(sheet.subtitle)}</p>
          ${statStrip(sheet.stats)}
          <p class="character-sheet-note">${esc(sheet.note)}</p>
        </div>
      </div>
      <div class="character-sheet-body">
        ${sheet.traits ? group('Traits', sheet.traits, { traits: true, hint: 'Tap a trait for its common uses' }) : `<section class="sheet-group"><div class="sheet-group-head"><h3>Traits & exact loadout</h3></div><div class="sheet-incomplete"><strong>Not imported yet.</strong> This character’s full mechanical loadout has not yet been imported.</div></section>`}
        ${group('Experiences', sheet.experiences, { hint: 'Tap to see when it matters' })}
        ${group('Features', sheet.features, { hint: 'Class, subclass, ancestry and community' })}
        ${group('Domain cards', sheet.domains, { hint: 'Rules reference' })}
        ${group('Weapons, armor & inventory', sheet.gear, { hint: 'Reference, not live marks' })}
      </div>
    </div>`;
  }

  function ensureSection() {
    const home = document.getElementById('home');
    if (!home) return null;
    let section = document.getElementById('characterSheet');
    if (!section) {
      section = document.createElement('section');
      section.id = 'characterSheet';
      section.className = 'character-sheet-section';
      section.setAttribute('aria-label', 'Character sheet');
      const goals = document.getElementById('playerGoals');
      if (goals) goals.insertAdjacentElement('afterend', section);
      else home.prepend(section);
    }
    return section;
  }

  function ensureTopbarButton() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    let button = document.getElementById('characterSheetBtn');
    if (!button) {
      button = document.createElement('button');
      button.id = 'characterSheetBtn';
      button.type = 'button';
      button.className = 'brain-cta sheet-topbar-button';
      button.textContent = 'Character';
      const brain = document.getElementById('brainBtn');
      topbar.insertBefore(button, brain || null);
      button.addEventListener('click', () => {
        const reveal = () => document.getElementById('characterSheet')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (location.hash && location.hash !== '#/' && location.hash !== '#') {
          location.hash = '#/';
          setTimeout(reveal, 90);
        } else {
          reveal();
        }
      });
    }
  }

  function render(user) {
    const section = ensureSection();
    if (!section || !user) return;
    ensureTopbarButton();
    if (user.role === 'gm') {
      section.innerHTML = `<div class="sheet-gm-empty"><div class="character-sheet-eyebrow">GM · CHARACTER SHEETS</div><h2>Preview the sheet as a player.</h2><p>Use the existing GM preview bar to switch to Marek, Velmira or Odie. The character reference will then render exactly as that player sees it.</p></div>`;
      return;
    }
    const key = String(user.character || '').toLowerCase();
    const sheet = SHEETS[key];
    section.innerHTML = sheet ? playerSheet(sheet) : '';
    section.classList.toggle('hidden', !sheet);
  }

  window.addEventListener('greywake:player-ready', event => render(event.detail));
  document.addEventListener('DOMContentLoaded', () => {
    ensureTopbarButton();
    if (window.GreywakePlayer) render(window.GreywakePlayer);
  });
})();
