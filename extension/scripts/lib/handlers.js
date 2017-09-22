import * as icon from './icon';
import * as core from './core';

import {
  MESSAGE_SAVE_TAB,
  MESSAGE_DELETE_TAB,
} from './messages';

export function onTabUpdated(tabId, changeInfo, _tab) {
  const tabIsLoading = changeInfo.status && changeInfo.status === 'loading';

  if (!tabIsLoading) {
    return Promise.resolve();
  }

  return icon.update(tabId);
}

export function onTabActivated(activeInfo) {
  return icon.update(activeInfo.tabId);
}

export function onInstall() {
  // The extension was installed.
}

export function onCommand(_commandName) {
  // A command was emitted.
}

export async function onMessage(message, _sender) {
  switch (message.type) {
    case MESSAGE_SAVE_TAB:
      await core.saveTabs(message.tab);
      break;

    case MESSAGE_DELETE_TAB:
      await core.deleteTabs(message.tab);
      break;
  }
}
