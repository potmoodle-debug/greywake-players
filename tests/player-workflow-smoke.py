"""Read-only local browser checks. Requires Playwright and a Chromium binary.

Run a server from the repository root, then run this file. Remote campaign
requests are blocked: these checks never update the shared campaign state.
No access credentials are supplied or stored by this test.
"""
import os
from urllib.parse import quote, urlsplit
from playwright.sync_api import sync_playwright

BASE = os.environ.get('GREYWAKE_SMOKE_BASE', 'http://127.0.0.1:8000/')
if urlsplit(BASE).hostname not in ('localhost', '127.0.0.1'):
    raise SystemExit('This isolated workflow check requires a local server.')

OBSERVER_PROBE = """
window.__mapObservers = [];
const Original = window.ResizeObserver;
window.ResizeObserver = class extends Original {
  observe(element, ...args) {
    if (element.matches('.gw-map-viewport')) {
      this.active = true;
      window.__mapObservers.push(this);
    }
    return super.observe(element, ...args);
  }
  disconnect() { this.active = false; return super.disconnect(); }
};
"""


def navigate(page, route):
    page.evaluate('(route) => window.GreywakeNavigation.navigate(route)', route)
    page.wait_for_function('(route) => location.hash === route', arg=route)
    # Wait for the navigation's animation-frame batching and mounted modules.
    page.evaluate('() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')


def active_map_observers(page):
    return page.evaluate('window.__mapObservers.filter(o => o.active).length')


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path=os.environ.get('GREYWAKE_CHROMIUM', '/usr/bin/chromium'),
        args=['--no-sandbox'],
    )
    try:
        # Verify the initial gate hides the application and rejects bad input.
        context = browser.new_context()
        context.route('**/*.supabase.co/**', lambda route: route.abort())
        page = context.new_page()
        page.goto(BASE, wait_until='domcontentloaded')
        assert page.locator('.player-gate').is_visible()
        assert page.locator('.shell').get_attribute('inert') is not None
        page.locator('[data-user="martin"]').click()
        page.locator('#playerCode').fill('invalid-smoke-entry')
        page.locator('#playerCodeForm button').click()
        assert page.locator('#codeError').inner_text()
        assert page.locator('.player-gate').is_visible()
        context.close()

        for user in ('martin', 'carla', 'ritchie'):
            context = browser.new_context(viewport={'width': 1440, 'height': 1000})
            context.route('**/*.supabase.co/**', lambda route: route.abort())
            # Use the existing local-session fixture pattern used by GM tests.
            context.add_init_script(f"localStorage.setItem('greywake-player-view-v1', '{user}');")
            context.add_init_script(OBSERVER_PROBE)
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(error))
            page.goto(BASE, wait_until='domcontentloaded')
            page.wait_for_function("document.body.dataset.role === 'player'")

            for route in ('#/', '#/character', '#/my-greywake', '#/map',
                          '#/campaign', '#/updates', '#/inbox', '#/mind', '#/brain'):
                navigate(page, route)
                assert page.locator('#gmOperationsView:visible').count() == 0
                assert page.locator('#mainContent').inner_text().strip()

            navigate(page, '#/character')
            page.locator('.p10-backpack-button:visible').click()
            assert page.locator('#p7BackpackDialog').is_visible()
            filters = page.locator('[data-pack-filter]').evaluate_all(
                '(buttons) => buttons.map(b => b.dataset.packFilter)')
            for value in filters:
                button = page.locator(f'[data-pack-filter="{value}"]')
                button.click()
                assert button.get_attribute('aria-pressed') == 'true'
            page.locator('[data-pack-close]').click()
            assert not page.locator('#p7BackpackDialog').is_visible()

            for _ in range(3):
                navigate(page, '#/map')
                assert active_map_observers(page) == 1, 'Only the current map should observe resizing.'
                stage = page.locator('.gw-map-stage')
                page.wait_for_function("document.querySelector('.gw-map-image').naturalWidth > 0")
                before = stage.evaluate('(e) => e.style.transform')
                page.locator('[data-map-action="in"]').click()
                assert stage.evaluate('(e) => e.style.transform') != before
                page.locator('[data-map-action="reset"]').click()
                page.locator('.gw-map-viewport').focus()
                page.keyboard.press('+')
                assert stage.evaluate('(e) => e.style.transform') != before
                navigate(page, '#/campaign')
                assert active_map_observers(page) == 0, 'Leaving the map must disconnect its observer.'
            navigate(page, '#/map')
            page.locator('.gw-map-hotspot').first.click()
            page.wait_for_function("location.hash.startsWith('#/record/')")
            page.wait_for_function("!document.querySelector('#article').classList.contains('hidden')")
            assert page.locator('#article').is_visible()

            records = page.evaluate('Object.keys(window.GREYWAKE_DATA)')
            artwork_count = 0
            for record in records:
                navigate(page, '#/record/' + quote(record, safe=''))
                assert page.locator('#article h1').is_visible(), 'Record heading is hidden.'
                assert page.locator('#article h1').inner_text().strip(), 'Record has no heading.'
                images = page.locator('#article img')
                images.evaluate_all('(imgs) => imgs.forEach(i => i.loading = "eager")')
                page.wait_for_function("Array.from(document.querySelectorAll('#article img')).every(i => i.complete)")
                assert images.evaluate_all('(imgs) => imgs.every(i => i.naturalWidth > 0)'), 'Record artwork failed to load.'
                artwork_count += images.count()

            navigate(page, '#/record/Odie')
            artwork = page.locator('#article .article-media img:visible').first
            for _ in range(2):
                artwork.click()
                assert page.locator('.image-lightbox:visible').count() == 1
                page.keyboard.press('Escape')
                assert page.locator('.image-lightbox:visible').count() == 0
                assert not page.locator('body').evaluate('e => e.classList.contains("lightbox-open")')

            # A failed preview must retain its caption and show the
            # fallback message. Restore the real artwork before continuing.
            artwork.evaluate('(img) => img.dataset.smokeArtwork = "true"')
            artwork = page.locator('[data-smoke-artwork="true"]')
            original_source = artwork.get_attribute('src')
            artwork.evaluate('(img) => img.src = "missing-smoke-artwork.webp"')
            page.wait_for_function("document.querySelector('#article .media-image-unavailable') !== null")
            assert not artwork.is_visible(), 'Failed artwork should not show a broken-image icon.'
            assert artwork.locator('..').locator('figcaption').inner_text().strip()
            artwork.evaluate('(img, src) => img.src = src', original_source)
            page.wait_for_function("document.querySelector('#article .media-image-unavailable') === null")
            assert artwork.is_visible(), 'Recovered artwork must be visible again.'

            page.set_viewport_size({'width': 390, 'height': 844})
            for route in ('#/', '#/character', '#/map', '#/campaign', '#/inbox'):
                navigate(page, route)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Page overflows mobile width.'
            navigate(page, '#/')
            page.locator('#menuBtn').click()
            assert page.locator('#menuBtn').get_attribute('aria-expanded') == 'true'
            page.keyboard.press('Escape')
            assert page.locator('#menuBtn').get_attribute('aria-expanded') == 'false'
            navigate(page, '#/gm-session')
            assert page.locator('#gmOperationsView:visible').count() == 0
            assert not errors, 'Unexpected JavaScript error during player workflow.'
            print(f'{user}: navigation, backpack, map lifecycle/controls, {len(records)} records, '
                  f'{artwork_count} artwork instances, mobile layout and GM gate passed.')
            context.close()

        # Exercise Fear controls against an isolated fake server, never the
        # campaign server. This checks UI behaviour, not real synchronisation.
        context = browser.new_context(viewport={'width': 1440, 'height': 1000})
        context.add_init_script("localStorage.setItem('greywake-player-view-v1', 'gm');")
        state = {'fear': 3}

        def fake_server(route):
            if urlsplit(route.request.url).path.endswith('/live-session-state'):
                if route.request.method == 'PATCH':
                    state['fear'] = route.request.post_data_json['fear']
                route.fulfill(json=state, headers={'Access-Control-Allow-Origin': '*'})
            else:
                route.abort()

        context.route('**/*.supabase.co/**', fake_server)
        page = context.new_page()
        page.goto(BASE, wait_until='domcontentloaded')
        for route in ('#/gm-session', '#/gm-prep', '#/gm-update',
                      '#/gm-world', '#/gm-inbox', '#/gm-players'):
            navigate(page, route)
            assert page.locator('#gmOperationsView').is_visible()
            assert page.locator('#gmOperationsView h1').inner_text().strip()
        navigate(page, '#/gm-session')
        page.wait_for_function("document.querySelector('.gm-fear-total strong')?.textContent === '3'")
        page.locator('[data-set-fear="0"]').click()
        page.wait_for_function("document.querySelector('.gm-fear-total strong')?.textContent === '0'")
        assert page.locator('[data-fear-change="-1"]').is_disabled()
        page.locator('[data-fear-change="1"]').click()
        page.wait_for_function("document.querySelector('.gm-fear-total strong')?.textContent === '1'")
        page.locator('[data-set-fear="12"]').click()
        page.wait_for_function("document.querySelector('.gm-fear-total strong')?.textContent === '12'")
        assert page.locator('[data-fear-change="1"]').is_disabled()
        page.locator('[data-fear-change="-1"]').click()
        page.wait_for_function("document.querySelector('.gm-fear-total strong')?.textContent === '11'")
        print('GM routes and Fear controls/bounds passed against an isolated fake server.')
        context.close()
    finally:
        browser.close()
