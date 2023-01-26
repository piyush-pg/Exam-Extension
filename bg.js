const STORAGE_KEY = "mouse-block-enabled-7874031313"; // must be unique to extension and match contest.js

/**
 * See https://developer.chrome.com/docs/extensions/reference/tabs/#type-Tab
 * for full type definition
 * @typedef {Object} Tab
 * @property {number=} id
 * @property {string=} url
 */

/**
 * @returns {Promise<Tab>}
 */
const getActiveTab = async () => {
  return new Promise(resolve => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      resolve(tabs[0]);
    });
  });
};

/**
 * @param {Tab} tab
 */
const runContentScript = (tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
};

/**
 * @param {Tab} tab
 */
const shouldRunContentScript = (tab) => {
  if (!tab) return false;

  const { url } = tab;

  return url && url.length && !url.startsWith("chrome://");
};

const attemptContentScript = async () => {
  const activeTab = await getActiveTab();

  if (shouldRunContentScript(activeTab)) {
    runContentScript(activeTab);
  }
};

/**
 * @returns {Promise<boolean>}
 */
const getStorageValue = async () => {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY]);
    });
  });
};

/**
 * @param {boolean} value
 */
const setStorageValue = (value) => {
  chrome.storage.local.set({ [STORAGE_KEY]: value });
};

const toggleStorageValue = async () => {
  const oldValue = await getStorageValue();
  const newValue = !oldValue;
  setStorageValue(newValue);
};

/**
 * @param {boolean} enabled
 */
const setBadge = (enabled) => {
  const text = enabled ? "ON" : "";
  chrome.action.setBadgeText({ text });
};

const handleInstalled = async () => {
  const initialValue = await getStorageValue();

  if (typeof initialValue === "boolean") {
    setBadge(initialValue);
    attemptContentScript();
  } else {
    setStorageValue(false);
  }
};

const handleActivated = () => {
  attemptContentScript();
};

const handleDOMContentLoaded = () => {
  attemptContentScript();
};

const handleClicked = () => {
  toggleStorageValue();
};

const handleStorageChanged = (changes, area) => {
  if (area === "local" && STORAGE_KEY in changes) {
    const { newValue } = changes[STORAGE_KEY];
    setBadge(newValue);
    attemptContentScript();
  }
};

chrome.runtime.onInstalled.addListener(handleInstalled);
chrome.tabs.onActivated.addListener(handleActivated);
chrome.webNavigation.onDOMContentLoaded.addListener(handleDOMContentLoaded);
chrome.action.onClicked.addListener(handleClicked);
chrome.storage.onChanged.addListener(handleStorageChanged);
