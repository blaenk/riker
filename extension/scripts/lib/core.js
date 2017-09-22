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

    await icon.disable(tab.id);
  }

  return set(store);
}
