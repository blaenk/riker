import browser from 'webextension-polyfill';

import {
  MESSAGE_SAVE_CURRENT_TAB,
  MESSAGE_DELETE_CURRENT_TAB,
} from '../lib/messages';

import { Store, get, set } from '../lib/storage';

async function disableIcon(tabId) {
  return browser.browserAction.setIcon({
    path: '/images/plum/gray_128.png',
    tabId,
  });
}

async function enableIcon(tabId) {
  return browser.browserAction.setIcon({
    path: '/images/plum/purple_128.png',
    tabId,
  });
}

async function updateIcon(tabId) {
  const tab = await browser.tabs.get(tabId);
  const { links } = await get(Store.links.key);

  if (links[tab.url]) {
    return enableIcon(tabId);
  }

  return disableIcon(tabId);
}

function linkForTab(tab) {
  return {
    url: tab.url,
    title: tab.title,
    faviconUrl: tab.favIconUrl,
    date: (new Date()).toISOString(),
    tags: [],
  };
}

async function saveTabs(tabs) {
  const store = await get(Store.links.key);

  for (const tab of tabs) {
    store.links[tab.url] = linkForTab(tab);

    // Optimistically assume the tabs made it and only if not go back and update
    // it. This should almost always work so this optimistic loop merging will
    // be beneficial.
    await enableIcon(tab.id);
  }

  try {
    await set(store);
  } catch (e) {
    // Saving the information to the store failed. Revert the optimistic
    // icon-enabling.
    for (const tab of tabs) {
      await disableIcon(tab.id);
    }
  }

  return Promise.resolve();
}

async function deleteTabs(tabs) {
  const store = await get(Store.links.key);

  for (const tab of tabs) {
    const result = delete store.links[tab.url];

    await disableIcon(tab.id);
  }

  return set(store);
}

async function handleSaveCurrentTab(_message, _sender) {
  const currentTab = await browser.tabs.query({
    currentWindow: true,
    windowType: 'normal',
    active: true,
  });

  await saveTabs(currentTab);
}

async function handleDeleteCurrentTab(_message, _sender) {
  const currentTab = await browser.tabs.query({
    currentWindow: true,
    windowType: 'normal',
    active: true,
  });

  await deleteTabs(currentTab);
}

function onInstall() {
  // The extension was installed.
}

function onCommand(_command) {
  // command is the name of the command.
}

async function onMessage(request, sender) {
  switch (request.type) {
    case MESSAGE_SAVE_CURRENT_TAB:
      await handleSaveCurrentTab(request, sender);
      break;
    case MESSAGE_DELETE_CURRENT_TAB:
      await handleDeleteCurrentTab(request, sender);
      break;
  }
}

function onTabUpdated(tabId, changeInfo, _tab) {
  if (!(changeInfo.status && changeInfo.status === 'loading')) {
    return Promise.resolve();
  }

  return updateIcon(tabId);
}

function onTabActivated(activeInfo) {
  return updateIcon(activeInfo.tabId);
}

/**
 * Code to run whenever the background page is loaded.
 *
 * Note that this should re-register the event handlers.
 *
 * @return {void}
 */
function onLoad() {
  browser.runtime.onInstalled.addListener(onInstall);
  browser.runtime.onMessage.addListener(onMessage);

  browser.tabs.onUpdated.addListener(onTabUpdated);
  // TODO
  // Is this necessary? Isn't it already covered by onUpdated?
  browser.tabs.onActivated.addListener(onTabActivated);

  browser.commands.onCommand.addListener(onCommand);
}

onLoad();
