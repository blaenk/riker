import browser from 'webextension-polyfill';

import { Store, get } from './storage';

export async function disable(tabId) {
  return browser.browserAction.setIcon({
    path: '/images/plum/gray_128.png',
    tabId,
  });
}

export async function enable(tabId) {
  return browser.browserAction.setIcon({
    path: '/images/plum/purple_128.png',
    tabId,
  });
}

export async function update(tabId) {
  const tab = await browser.tabs.get(tabId);
  const { links } = await get(Store.links.key);

  if (links[tab.url]) {
    return enable(tabId);
  }

  return disable(tabId);
}
