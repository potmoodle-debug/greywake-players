(() => {
  const TRAITS = ['Agility','Strength','Finesse','Instinct','Presence','Knowledge'];
  const SPELLCAST_TRAIT = 'Instinct';
  let observedPanel = null;
  let observer = null;

  function isMarek(){
    return String(window.GreywakePlayer?.character || document.body.dataset.character || '').toLowerCase() === 'marek';
  }

  function esc(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function die(sides){
    if (window.crypto?.getRandomValues){
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      return (buf[0] % sides) + 1;
    }
    return Math.floor(Math.random() * sides) + 1;
  }

  function readModifier(text){
    const m = String(text || '').match(/[+−-]?\d+/);
    return m ? Number(m[0].replace('−','-')) : 0;
  }

  function currentTrait(name){
    const card = [...document.querySelectorAll('#characterSheet .sheet-grid.traits .sheet-card')]
      .find(c => c.querySelector('h4')?.textContent.trim() === name);
    return readModifier(card?.querySelector('.sheet-value')?.textContent);
  }

  function experiences(){
    const group = [...document.querySelectorAll('#characterSheet .sheet-group')]
      .find(g => g.querySelector('.sheet-group-head h3')?.textContent.trim() === 'Experiences');
    if (!group) return [];
    return [...group.querySelectorAll('.sheet-card')].map(card => ({
      name:card.querySelector('h4')?.textContent.trim() || 'Experience',
      bonus:readModifier(card.querySelector('.sheet-value')?.textContent)
    })).filter(x => x.bonus !== 0);
  }

  function actionDetail(){
    return document.querySelector('#activeActionsPanel .active-action-detail');
  }

  function inferSpec(detail){
    if (!detail) return null;
    const title = detail.querySelector('h3')?.textContent.trim() || 'Action';
    const kindText = detail.querySelector('.active-action-detail-copy > small')?.textContent || '';
    const isAttack = /ATTACK/i.test(kindText);
    const meta = detail.querySelector('.active-action-detail-meta')?.textContent || '';
    const body = [...detail.querySelectorAll('.active-action-detail-copy p')]
      .filter(p => !p.classList.contains('active-action-detail-meta'))
      .map(p => p.textContent).join(' ');
    const source = `${meta} ${body}`;

    let trait = TRAITS.find(t => new RegExp(`\\b${t}\\b`, 'i').test(source)) || null;
    const rollMatch = source.match(/\b(Agility|Strength|Finesse|Instinct|Presence|Knowledge|Spellcast)\s+Roll(?:\s*\((\d+)\))?/i);
    if (rollMatch){
      trait = /^spellcast$/i.test(rollMatch[1]) ? SPELLCAST_TRAIT : TRAITS.find(t => t.toLowerCase() === rollMatch[1].toLowerCase());
    }

    let difficulty = rollMatch?.[2] ? Number(rollMatch[2]) : null;
    if (!difficulty){
      const diffMatch = source.match(/\bDifficulty\s*(?:of\s*)?(\d+)\b/i);
      if (diffMatch) difficulty = Number(diffMatch[1]);
    }

    const damageMatch = source.match(/\b(\d*)d(\d+)([+-]\d+)?\s*(physical|magic(?:al)?)?\b/i);
    const damage = damageMatch ? {
      count:Number(damageMatch[1] || 1),
      sides:Number(damageMatch[2]),
      mod:Number(damageMatch[3] || 0),
      type:(damageMatch[4] || '').replace(/^magic$/i,'magical').toLowerCase()
    } : null;

    const formAdvantage = isAttack && [...document.querySelectorAll('#activeActionsPanel .active-actions-advantages b')]
      .some(node => node.textContent.trim().toLowerCase() === 'attack');

    const rollable = isAttack || Boolean(rollMatch);
    return { title, isAttack, trait, difficulty, damage, formAdvantage, rollable };
  }

  function experienceMarkup(){
    const items = experiences();
    if (!items.length) return '';
    return `<fieldset class="action-roll-experiences"><legend>Experiences <small>1 Hope each</small></legend>${items.map((item,i)=>`<label><input type="checkbox" data-roll-experience="${i}" data-bonus="${item.bonus}"><span><b>${esc(item.name)}</b><small>+${item.bonus}</small></span></label>`).join('')}</fieldset>`;
  }

  function rollerMarkup(spec){
    const traitValue = spec.trait ? currentTrait(spec.trait) : 0;
    const defaultMode = spec.formAdvantage ? 'advantage' : 'normal';
    return `<section class="action-roller" aria-label="Dice roller">
      <div class="action-roller-head"><div><span>DUALITY ROLLER</span><strong>${spec.isAttack ? 'Attack Roll' : `${esc(spec.trait || 'Action')} Roll`}</strong><small>${spec.trait ? `${esc(spec.trait)} ${traitValue >= 0 ? '+' : ''}${traitValue}` : 'No trait detected'}</small></div><div class="action-roll-dice-preview" aria-hidden="true"><i>H</i><i>F</i></div></div>
      <div class="action-roll-setup">
        ${experienceMarkup()}
        <div class="action-roll-fields">
          <label><span>Roll mode</span><select data-roll-mode><option value="normal" ${defaultMode==='normal'?'selected':''}>Normal</option><option value="advantage" ${defaultMode==='advantage'?'selected':''}>Advantage +d6</option><option value="disadvantage">Disadvantage −d6</option></select>${spec.formAdvantage ? '<small class="action-roll-auto">Beastform grants Advantage on attacks</small>' : ''}</label>
          <label><span>Other modifier</span><input data-roll-modifier type="number" value="0" min="-20" max="20" step="1" inputmode="numeric"></label>
          <label><span>Difficulty ${spec.difficulty ? '(default)' : '(optional)'}</span><input data-roll-difficulty type="number" value="${spec.difficulty ?? ''}" min="1" max="40" step="1" inputmode="numeric" placeholder="GM target"></label>
        </div>
      </div>
      <button class="action-roll-button" type="button" data-roll-action ${spec.trait ? '' : 'disabled'}>${spec.isAttack ? 'Roll Attack' : `Roll ${esc(spec.trait || 'Action')}`}</button>
      ${spec.trait ? '' : '<p class="action-roll-unavailable">This ability does not call for an action roll.</p>'}
      <div class="action-roll-result" data-roll-result aria-live="polite"></div>
    </section>`;
  }

  function rollDamage(spec, critical, host){
    if (!spec.damage) return;
    const rolls = Array.from({length:spec.damage.count}, () => die(spec.damage.sides));
    const normal = rolls.reduce((a,b)=>a+b,0) + spec.damage.mod;
    const criticalBonus = critical ? spec.damage.count * spec.damage.sides : 0;
    const total = normal + criticalBonus;
    host.innerHTML = `<div class="damage-roll-result ${critical?'critical':''}"><div><span>${critical?'CRITICAL DAMAGE':'DAMAGE'}</span><strong>${total}</strong><small>${esc(spec.damage.type || 'damage')}</small></div><p>${rolls.map(r=>`d${spec.damage.sides}: <b>${r}</b>`).join(' · ')}${spec.damage.mod ? ` · modifier <b>${spec.damage.mod>0?'+':''}${spec.damage.mod}</b>` : ''}${critical ? ` · critical maximum <b>+${criticalBonus}</b>` : ''}</p></div>`;
  }

  function performRoll(detail, spec){
    const trait = currentTrait(spec.trait);
    const hope = die(12);
    const fear = die(12);
    const critical = hope === fear;
    const axis = critical || hope > fear ? 'Hope' : 'Fear';

    const selectedExperiences = [...detail.querySelectorAll('[data-roll-experience]:checked')];
    const experienceBonus = selectedExperiences.reduce((sum,input)=>sum+Number(input.dataset.bonus || 0),0);
    const mode = detail.querySelector('[data-roll-mode]')?.value || 'normal';
    const advantageDie = mode === 'normal' ? 0 : die(6);
    const advantageBonus = mode === 'advantage' ? advantageDie : mode === 'disadvantage' ? -advantageDie : 0;
    const other = Math.max(-20, Math.min(20, Number(detail.querySelector('[data-roll-modifier]')?.value || 0)));
    const difficultyRaw = detail.querySelector('[data-roll-difficulty]')?.value;
    const difficulty = difficultyRaw ? Math.max(1, Math.min(40, Number(difficultyRaw))) : null;
    const total = hope + fear + trait + experienceBonus + advantageBonus + other;
    const success = critical ? true : difficulty == null ? null : total >= difficulty;

    let headline = critical ? 'CRITICAL SUCCESS' : success == null ? `${total} WITH ${axis.toUpperCase()}` : `${success?'SUCCESS':'FAILURE'} WITH ${axis.toUpperCase()}`;
    let consequence = critical ? 'Gain 1 Hope · clear 1 Stress' : axis === 'Hope' ? 'Gain 1 Hope' : 'GM gains 1 Fear';
    if (critical && spec.isAttack) consequence += ' · critical damage enabled';

    const expCost = selectedExperiences.length;
    const parts = [`${hope} Hope`, `${fear} Fear`, `${spec.trait} ${trait>=0?'+':''}${trait}`];
    if (experienceBonus) parts.push(`Experiences +${experienceBonus}`);
    if (mode !== 'normal') parts.push(`${mode === 'advantage'?'Advantage':'Disadvantage'} ${advantageBonus>=0?'+':''}${advantageBonus}`);
    if (other) parts.push(`Other ${other>=0?'+':''}${other}`);

    const result = detail.querySelector('[data-roll-result]');
    if (!result) return;
    result.innerHTML = `<div class="duality-result ${critical?'critical':axis.toLowerCase()}">
      <div class="duality-dice"><div class="hope-die"><span>HOPE</span><b>${hope}</b></div><div class="fear-die"><span>FEAR</span><b>${fear}</b></div></div>
      <div class="duality-outcome"><span>${esc(spec.title)}</span><strong>${headline}</strong><b>Total ${total}${difficulty ? ` / Difficulty ${difficulty}` : ''}</b><small>${consequence}</small></div>
      <p class="duality-breakdown">${parts.map(esc).join(' · ')}</p>
      ${expCost ? `<p class="duality-cost">Chosen Experiences cost <b>${expCost} Hope</b>. This roller does not mark that resource automatically.</p>` : ''}
      ${difficulty == null && !critical ? '<p class="duality-cost">No Difficulty entered: tell the GM the total and whether it rolled with Hope or Fear.</p>' : ''}
      ${spec.isAttack && spec.damage ? `<div class="damage-roll-controls"><button type="button" data-roll-damage ${success === false ? 'disabled' : ''}>${critical?'Roll Critical Damage':'Roll Damage'}</button><span>${success === false ? 'Attack failed against the entered Difficulty.' : `${spec.damage.count}d${spec.damage.sides}${spec.damage.mod ? (spec.damage.mod>0?'+':'')+spec.damage.mod : ''} ${esc(spec.damage.type)}`}</span></div><div data-damage-result></div>` : ''}
    </div>`;

    result.querySelector('[data-roll-damage]')?.addEventListener('click', () => {
      const host = result.querySelector('[data-damage-result]');
      if (host) rollDamage(spec, critical, host);
    });
  }

  function enhanceDetail(){
    if (!isMarek()) return;
    const detail = actionDetail();
    if (!detail || detail.dataset.rollerEnhanced === 'true') return;
    detail.dataset.rollerEnhanced = 'true';
    const spec = inferSpec(detail);
    if (!spec) return;
    const tools = detail.querySelector('.active-action-detail-tools');
    if (tools) tools.insertAdjacentHTML('beforebegin', rollerMarkup(spec));
    else detail.insertAdjacentHTML('beforeend', rollerMarkup(spec));
    detail.querySelector('[data-roll-action]')?.addEventListener('click', () => performRoll(detail, spec));
  }

  function observe(){
    const panel = document.getElementById('activeActionsPanel');
    if (!panel) return;
    if (panel !== observedPanel){
      observer?.disconnect();
      observedPanel = panel;
      observer = new MutationObserver(() => requestAnimationFrame(enhanceDetail));
      observer.observe(panel,{childList:true,subtree:true});
    }
    enhanceDetail();
  }

  function init(){
    if (!isMarek()) return;
    observe();
  }

  let timer;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(init,180)};
  window.addEventListener('greywake:player-ready',schedule);
  window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
})();
