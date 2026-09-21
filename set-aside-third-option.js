(() => {
  const STORAGE_PREFIX = 'greywake-set-aside-ui-v1:';
  let observer;
  let timer;

  function characterKey() {
    return String(document.body.dataset.character || window.GreywakePlayer?.character || 'player').toLowerCase();
  }

  function storageKey(wrap) {
    return STORAGE_PREFIX + characterKey() + ':' + String(wrap.dataset.contextMind || '');
  }

  function isPreview() {
    return document.body.dataset.gmPreview === 'true';
  }

  function markedAside(wrap) {
    try { return localStorage.getItem(storageKey(wrap)) === '1'; }
    catch { return false; }
  }

  function setMarkedAside(wrap, value) {
    try {
      if (value) localStorage.setItem(storageKey(wrap), '1');
      else localStorage.removeItem(storageKey(wrap));
    } catch {}
  }

  function waitFor(test, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        const value = test();
        if (value) return resolve(value);
        if (Date.now() - started > timeout) return reject(new Error('Greywake took too long to update that choice.'));
        setTimeout(tick, 80);
      };
      tick();
    });
  }

  function findCurrentWrap(sourceKey) {
    return [...document.querySelectorAll('.context-mind-action')]
      .find(node => node.dataset.contextMind === sourceKey);
  }

  async function setAside(wrap) {
    const sourceKey = wrap.dataset.contextMind;
    if (!sourceKey) return;
    const status = wrap.querySelector('.context-mind-status');
    wrap.querySelectorAll('button').forEach(button => { button.disabled = true; });
    if (status) status.textContent = 'Setting aside…';

    try {
      let current = findCurrentWrap(sourceKey) || wrap;
      let interested = current.querySelector('[data-context-interest]');
      let pursuing = current.querySelector('[data-context-pursue]');
      const active = interested?.classList.contains('is-active') || pursuing?.classList.contains('is-active');

      if (active) {
        interested?.click();
        await waitFor(() => {
          const next = findCurrentWrap(sourceKey);
          if (!next || next === current) return null;
          const i = next.querySelector('[data-context-interest]');
          const p = next.querySelector('[data-context-pursue]');
          return i && p && !i.classList.contains('is-active') && !p.classList.contains('is-active') ? next : null;
        });
      } else {
        interested?.click();
        current = await waitFor(() => {
          const next = findCurrentWrap(sourceKey);
          const i = next?.querySelector('[data-context-interest]');
          return i?.classList.contains('is-active') ? next : null;
        });
        current.querySelector('[data-context-interest]')?.click();
        await waitFor(() => {
          const next = findCurrentWrap(sourceKey);
          if (!next || next === current) return null;
          const i = next.querySelector('[data-context-interest]');
          const p = next.querySelector('[data-context-pursue]');
          return i && p && !i.classList.contains('is-active') && !p.classList.contains('is-active') ? next : null;
        });
      }

      const finalWrap = findCurrentWrap(sourceKey);
      if (finalWrap) {
        setMarkedAside(finalWrap, true);
        enhanceWrap(finalWrap);
      }
    } catch (error) {
      const current = findCurrentWrap(sourceKey) || wrap;
      current.querySelectorAll('button').forEach(button => { button.disabled = false; });
      const nextStatus = current.querySelector('.context-mind-status');
      if (nextStatus) nextStatus.textContent = error.message;
    }
  }

  function enhanceWrap(wrap) {
    if (!wrap?.isConnected) return;
    const interested = wrap.querySelector('[data-context-interest]');
    const pursuing = wrap.querySelector('[data-context-pursue]');
    if (!interested || !pursuing) return;

    const activeInterest = interested.classList.contains('is-active');
    const activePursuit = pursuing.classList.contains('is-active');
    if (activeInterest || activePursuit) setMarkedAside(wrap, false);

    let aside = wrap.querySelector('[data-context-set-aside]');
    if (!aside) {
      aside = document.createElement('button');
      aside.type = 'button';
      aside.className = 'context-set-aside-button';
      aside.dataset.contextSetAside = '';
      pursuing.insertAdjacentElement('afterend', aside);
    }

    const setAsideActive = !activeInterest && !activePursuit && markedAside(wrap);
    aside.textContent = setAsideActive ? '✓ Set Aside' : '— Set Aside';
    aside.classList.toggle('is-active', setAsideActive);
    aside.disabled = isPreview();

    if (!aside.dataset.bound) {
      aside.dataset.bound = 'true';
      aside.addEventListener('click', () => setAside(wrap));
      interested.addEventListener('click', () => setMarkedAside(wrap, false));
      pursuing.addEventListener('click', () => setMarkedAside(wrap, false));
    }

    if (setAsideActive) {
      const status = wrap.querySelector('.context-mind-status');
      if (status) status.textContent = 'Set aside for now. It stays in your Greywake history and can be brought back later.';
    }
  }

  function ensureStyles() {
    if (document.getElementById('set-aside-third-option-styles')) return;
    const style = document.createElement('style');
    style.id = 'set-aside-third-option-styles';
    style.textContent = `
      .context-set-aside-button{
        appearance:none;border:1px solid #5f594b;background:#181713;color:#b8b09c;
        padding:10px 13px;font:800 10px/1.1 inherit;letter-spacing:.06em;text-transform:uppercase;
        cursor:pointer;min-height:38px
      }
      .context-set-aside-button:hover{border-color:#9a8d6c;background:#242118;color:#eadfc2}
      .context-set-aside-button:focus-visible{outline:2px solid #c6ae69;outline-offset:2px}
      .context-set-aside-button:disabled{opacity:.72;cursor:default}
      .context-set-aside-button.is-active{border-color:#77705f;background:#201f1a;color:#d2cab7}
    `;
    document.head.appendChild(style);
  }

  function enhanceAll() {
    ensureStyles();
    document.querySelectorAll('.context-mind-action').forEach(enhanceWrap);
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(enhanceAll, 60);
  }

  document.addEventListener('DOMContentLoaded', () => {
    enhanceAll();
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
  });
  window.addEventListener('greywake:player-ready', schedule);
  window.addEventListener('greywake:engagement-changed', schedule);
  window.addEventListener('hashchange', schedule);
})();