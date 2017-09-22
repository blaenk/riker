import browser from 'webextension-polyfill';
import _ from 'lodash';

import { Store, get, set } from './storage';
import * as icon from './icon';

function linkForTab(tab) {
  return {
    url: tab.url,
    title: tab.title,
    faviconUrl: tab.favIconUrl,
    date: (new Date()).toISOString(),
    tags: [],
  };
}

export async function saveTabs(tabs) {
  const store = await get(Store.links.key);

  tabs = Array.isArray(tabs) ? tabs : [tabs];

  for (const tab of tabs) {
    store.links[tab.url] = linkForTab(tab);

    // Optimistically assume the tabs made it and only if not go back and update
    // it. This should almost always work so this optimistic loop merging will
    // be beneficial.
    await icon.enable(tab.id);
  }

  try {
    await set(store);
  } catch (e) {
    // Saving the information to the store failed. Revert the optimistic
    // icon-enabling.
    for (const tab of tabs) {
      await icon.disable(tab.id);
    }
  }

  return Promise.resolve();
}

export async function deleteTabs(tabs) {
  const store = await get(Store.links.key);

  tabs = Array.isArray(tabs) ? tabs : [tabs];

  for (const tab of tabs) {
    delete store.links[tab.url];

    // If the tab is active, it won't take part in the lazy, automatic update of
    // the tab when it's activated, since it's already active. Do it manually.
    if (tab.active) {
      icon.disable(tab.id);
    }
  }

  return set(store);
}

// The difference between this and deleteTabs is that deleteTabs can only be
// used on open tabs, whereas deleteLinks can be used on stored links whether or
// not they have open tabs.
export async function deleteLinks(links) {
  const store = await get(Store.links.key);

  // The icon must be refreshed for any active tabs open for a URL that is being
  // deleted, since that icon wouldn't otherwise update until it became
  // re-activated or updated.
  const activeTabs = await browser.tabs.query({ active: true });
  const activeTabsForUrl = _.groupBy(activeTabs, (tab) => tab.url);

  links = Array.isArray(links) ? links : [links];

  for (const link of links) {
    delete store.links[link];

    if (activeTabsForUrl[link]) {
      for (const tab of activeTabsForUrl[link]) {
        icon.disable(tab.id);
      }
    }
  }

  return set(store);
}
