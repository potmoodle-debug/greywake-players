(() => {
  // app.js owns Home, Brain and Record routes. character-page.js owns #/character.
  // Remove app.js's unconditional hashchange handler and replace it with one
  // that leaves the character route alone.
  if (typeof window.renderRoute !== 'function') return;
  window.removeEventListener('hashchange', window.renderRoute);
  window.addEventListener('hashchange', () => {
    if ((location.hash || '') === '#/character') return;
    window.renderRoute();
  });
})();
