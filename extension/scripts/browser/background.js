import browser from 'webextension-polyfill';

import * as handlers from '../lib/handlers';

/**
 * Code to run whenever the background page is loaded.
 *
 * Note that this should re-register the event handlers.
 *
 * @return {void}
 */
function onLoad() {
  browser.runtime.onInstalled.addListener(handlers.onInstall);
  browser.runtime.onMessage.addListener(handlers.onMessage);

  browser.tabs.onUpdated.addListener(handlers.onTabUpdated);
  // TODO
  // Is this necessary? Isn't it already covered by onUpdated?
  browser.tabs.onActivated.addListener(handlers.onTabActivated);

  browser.commands.onCommand.addListener(handlers.onCommand);
}

onLoad();
