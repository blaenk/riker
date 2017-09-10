import { MESSAGE_SAVE_TAB } from './common';
import 'webextension-polyfill';

window.Riker = {
  links: [],
};

async function handleSaveTab(_message, _sender) {
  // FIXME
  // This selects a single active tab.
  //
  // Adapt this or also make it possible to apply to _selected_ tabs.
  const selectedTabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });

  const links = selectedTabs.map(tab => {
    return {
      url: tab.url,
      title: tab.title,
      faviconUrl: tab.favIconUrl,
    };
  });

  // TODO
  // Save the url, favicon, and title
  //
  // faviconUrl fallbacks:
  // - https://www.google.com/s2/favicons?domain=$url
  // - chrome://favicon/$url
  window.Riker.links.push(...links);

  return {
    success: true,
    links,
  };
}

function onInstall() {
  // The extension was installed.
}

async function onMessage(request, sender) {
  switch (request.type) {
    case MESSAGE_SAVE_TAB:
      await handleSaveTab(request, sender);
      break;
  }
}

/**
 * Code to run whenever the background page is loaded.
 *
 * Note that this should re-register the event handlers.
 *
 * @return {void}
 */
function onLoad() {
  // eslint-disable-next-line no-unused-vars
  const canvas = document.getElementById('canvas');

  browser.runtime.onInstalled.addListener(onInstall);

  browser.runtime.onMessage.addListener(onMessage);
}

onLoad();
