import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait

BASE = os.environ.get("GREYWAKE_SMOKE_BASE", "http://127.0.0.1:8765/index.html")

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--window-size=700,900")

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 20)

try:
    driver.get(BASE)
    driver.execute_script("localStorage.setItem('greywake-player-view-v1','gm'); sessionStorage.removeItem('greywake-gm-preview-v1');")
    driver.refresh()
    wait.until(lambda d: d.find_element(By.TAG_NAME, "body").get_attribute("data-role") == "gm")

    # Mobile/sidebar contract.
    driver.set_window_size(700, 900)
    menu = wait.until(lambda d: d.find_element(By.ID, "menuBtn"))
    sidebar = driver.find_element(By.ID, "sidebar")
    backdrop = driver.find_element(By.ID, "navBackdrop")
    assert "open" not in sidebar.get_attribute("class").split(), "Sidebar should start closed at mobile width"
    assert menu.get_attribute("aria-expanded") == "false", "Menu aria-expanded should start false"

    menu.click()
    wait.until(lambda d: "open" in d.find_element(By.ID, "sidebar").get_attribute("class").split())
    wait.until(lambda d: "nav-open" in d.find_element(By.TAG_NAME, "body").get_attribute("class").split())
    assert menu.get_attribute("aria-expanded") == "true", "Menu aria-expanded should track open sidebar"

    backdrop.click()
    wait.until(lambda d: "open" not in d.find_element(By.ID, "sidebar").get_attribute("class").split())
    assert menu.get_attribute("aria-expanded") == "false", "Backdrop close should restore aria-expanded"

    menu.click()
    wait.until(lambda d: "open" in d.find_element(By.ID, "sidebar").get_attribute("class").split())
    driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
    wait.until(lambda d: "open" not in d.find_element(By.ID, "sidebar").get_attribute("class").split())
    assert menu.get_attribute("aria-expanded") == "false", "Escape close should restore aria-expanded"

    # Sidebar search remains usable in GM mode.
    menu.click()
    search = wait.until(lambda d: d.find_element(By.ID, "searchInput"))
    driver.execute_script("arguments[0].value='Greywake'; arguments[0].dispatchEvent(new Event('input',{bubbles:true}));", search)
    wait.until(lambda d: "record" in d.find_element(By.ID, "searchStatus").text.lower())
    assert driver.find_elements(By.CSS_SELECTOR, "#nav .nav-link"), "Sidebar search should return record links"

    # Simulated Tampermonkey bridge contract. This proves the site-side event/UI contract;
    # it does not claim the browser userscript itself is installed in CI.
    driver.execute_script("""
      window.__greywakeSmokeRoles = {liveKey:'live-chat', updaterKey:'updater-chat'};
      window.__greywakeSmokeChats = [
        {key:'live-chat',title:'Greywake Live Session',messageCount:12,changedAt:new Date().toISOString()},
        {key:'updater-chat',title:'Greywake Updater',messageCount:4,changedAt:new Date().toISOString()}
      ];
      window.addEventListener('greywake:live-bridge-request', e => {
        window.dispatchEvent(new CustomEvent('greywake:live-bridge-response',{detail:{
          requestId:e.detail.requestId,
          ok:true,
          chats:window.__greywakeSmokeChats,
          roles:window.__greywakeSmokeRoles,
          status:{state:'queued',at:new Date().toISOString(),sourceTitle:'Greywake Live Session',targetTitle:'Greywake Updater',message:'Harmless smoke update queued.'},
          result:{}
        }}));
      });
    """)
    driver.execute_script("location.hash='#/gm-update'")
    wait.until(lambda d: d.find_elements(By.ID, "gmLiveBridgeTest"))
    wait.until(lambda d: "Connected" in d.find_element(By.ID, "gmLiveBridgeTest").text)
    panel = driver.find_element(By.ID, "gmLiveBridgeTest")
    text = panel.text
    assert "Greywake Live Session" in text, "Bridge panel should show live source chat"
    assert "Greywake Updater" in text, "Bridge panel should show updater target chat"
    assert "QUEUED" in text, "Bridge panel should show queued delivery state"

    smoke_result = "WHAT WAS UPDATED\\n- Smoke-test marker only; no campaign data changed.\\nWHAT COULD NOT BE UPDATED\\n- None.\\nDECISIONS QUEUED FOR CHRIS LATER\\n- None."
    driver.execute_script("""
      window.dispatchEvent(new CustomEvent('greywake:live-bridge-status',{detail:{
        state:'completed',at:new Date().toISOString(),sourceTitle:'Greywake Live Session',targetTitle:'Greywake Updater',message:'Harmless smoke update completed.'
      }}));
      window.dispatchEvent(new CustomEvent('greywake:live-bridge-result',{detail:{
        at:new Date().toISOString(),
        text:arguments[0]
      }}));
    """, smoke_result)
    wait.until(lambda d: "DONE" in d.find_element(By.ID, "gmLiveBridgeTest").text)
    result_text = driver.find_element(By.ID, "gmLiveBridgeTest").text
    assert "Smoke-test marker only" in result_text
    assert "None." in result_text

    print("DM sidebar and update bridge site-contract smoke passed.")
finally:
    driver.quit()
