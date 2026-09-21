import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

BASE = os.environ.get("GREYWAKE_SMOKE_BASE", "http://127.0.0.1:8765/index.html")
DELETED = [
    "gm-active-npcs.js",
    "gm-cockpit-media.js",
    "gm-cockpit-role-split.js",
    "gm-foundry-prep.js",
    "gm-inbox.js",
    "gm-mind-dashboard.js",
    "gm-navigation-authority.js",
    "gm-navigation-fix.js",
    "gm-player-priority.js",
    "gm-prep-live.js",
    "gm-preview-mind-direct.js",
    "player-feed.js",
    "gm-run-current-context.js",
    "gm-session-state.js",
    "gm-update-live.js",
    "gm-visual-cockpit.js",
]
ROUTES = {
    "#/gm-session": ("At the table.", ".gm-run-hero"),
    "#/gm-prep": ("Prepare only what may matter.", ".gm-player-cards"),
    "#/gm-update": ("Update Greywake.", "#gmRunUpdate"),
    "#/gm-world": ("Browse Greywake.", ".gm-world-grid"),
    "#/gm-inbox": ("What needs you?", "#gmInboxHost #playerGoals"),
    "#/gm-players": ("See exactly what they see.", ".gm-player-preview-cards"),
}

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=1440,1000")

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 20)

try:
    driver.get(BASE)
    driver.execute_script("localStorage.setItem('greywake-player-view-v1','gm'); sessionStorage.removeItem('greywake-gm-preview-v1');")
    driver.refresh()
    wait.until(lambda d: d.find_element(By.TAG_NAME, "body").get_attribute("data-role") == "gm")
    wait.until(lambda d: d.find_element(By.TAG_NAME, "body").get_attribute("data-gm-preview") == "false")

    expected_nav = ["RUN", "PREP", "UPDATE", "WORLD", "INBOX", "PLAYERS"]
    nav = [x.text.strip() for x in driver.find_elements(By.CSS_SELECTOR, "#primaryNav button") if x.is_displayed()]
    assert nav == expected_nav, f"GM navigation mismatch: {nav}"

    for route, (heading, marker) in ROUTES.items():
        driver.execute_script("location.hash = arguments[0]", route)
        wait.until(lambda d: d.current_url.endswith(route))
        wait.until(lambda d: d.find_elements(By.CSS_SELECTOR, "#gmOperationsView:not(.hidden) .gm-page-head h1"))
        actual = driver.find_element(By.CSS_SELECTOR, "#gmOperationsView .gm-page-head h1").text.strip()
        assert actual == heading, f"{route}: expected heading {heading!r}, got {actual!r}"
        wait.until(lambda d: d.find_elements(By.CSS_SELECTOR, marker))
        assert driver.find_element(By.CSS_SELECTOR, marker).is_displayed(), f"{route}: marker not visible: {marker}"

    driver.execute_script("location.hash = '#/gm-session'")
    wait.until(lambda d: d.current_url.endswith("#/gm-session"))
    wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, ".gm-live-npc")) >= 1)
    spencer = next((card for card in driver.find_elements(By.CSS_SELECTOR, ".gm-live-npc") if "Spencer Digger" in card.text), None)
    assert spencer is not None, "RUN page is missing the Spencer Digger card"
    spencer_img = spencer.find_element(By.TAG_NAME, "img")
    wait.until(lambda d: d.execute_script("return arguments[0].complete", spencer_img))
    natural_width = driver.execute_script("return arguments[0].naturalWidth", spencer_img)
    assert natural_width > 0, f"Spencer Digger portrait failed to load: {spencer_img.get_attribute('src')}"
    assert "spencer-digger-canon.jpg?v=spencer3" in spencer_img.get_attribute("src"), "GM RUN must use Spencer's canonical media reference"

    driver.execute_script("location.hash = '#/gm-players'")
    wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, "[data-preview-player]")) == 3)

    resources = driver.execute_script("return performance.getEntriesByType('resource').map(e => e.name)")
    legacy_loaded = [name for name in DELETED if any(name in url for url in resources)]
    assert not legacy_loaded, f"Deleted legacy GM scripts were requested: {legacy_loaded}"

    print("GM route smoke passed: RUN / PREP / UPDATE / WORLD / INBOX / PLAYERS.")
finally:
    driver.quit()
