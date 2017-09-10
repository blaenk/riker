import { MESSAGE_SAVE_TAB } from './common';

import 'webextension-polyfill';

// The bookmark-backing strategy poses questions of source-of-truth and
// disparate data synchronization. It may have been preferable if metadata could
// be attached to individual bookmarks.
//
// There are two sources of data:
//
// 1. Bookmarks, which store the saved URL.
// 2. Extension data which correlates favicon URL, tag, alarm, etc. The favicon
//    URL can be delegated to chrome://favicon/ but it seems unreliable and
//    inconsistent, and given that at the favicon URL is known at time that the
//    URL is saved, we might as well store it. This can be joined with the
//    bookmark either by URL or by node ID.
//
// Since the core data is stored as bookmarks, certain possibilities for data
// corruption exist:
//
// 1. Users may ignorantly modify, remove, or save to the extension's tree.
// 2. The extension may be removed and re-installed, resulting in an empty state
//    and an orphaned tree.
//
// One option would be to choose the bookmarks as the source of truth, which
// complements the choice of using bookmarks as a store to begin with. In this
// case we could emulate metadata-on-bookmarks by simply maintaining a key-value
// store mapping bookmark node IDs to metadata.
//
// Event listeners would be registered to monitor bookmarks both to warn (and
// prevent, if possible) about manual modification of the store as well as to
// re-synchronize the extension-side data. New bookmarks would get default
// metadata. Metadata for node IDs that no longer exist would be removed (option
// to prompt user to restore? Like the firefox/chrome crash handler page?).

// TODO
// Replace this with storage API.
window.Riker = {
  links: [],
};

const STORE_NAME = 'Riker-Storage';

let STORE_ID;

const METADATA = {
  links: {},

  // Maps tag names to folder bookmarkIds.
  tags: {},
};

async function handleSaveCurrentTab(_message, _sender) {
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
      await handleSaveCurrentTab(request, sender);
      break;
  }
}

// TODO
// Generalize below to getOrCreateFolder?

// NOTE
// 1. If we know ID, search for it.
// 2. If we didn't find it, user removed it. Create and sync back.
// 3. If we didn't know ID, search by name 'Riker-Storage'.
// 4. If we didn't find it, create it.
async function getOrCreateBookmarkStore() {
  let results;

  // We remember an ID, meaning it did exist and may yet. Get it.
  if (STORE_ID) {
    try {
      results = await browser.bookmarks.get(STORE_ID);

      return results[0];
    } catch (e) {
      // TODO
      // We did know the ID but the entry doesn't exist, which means it's likely
      // that the user removed it manually. Warn the user of this and sync
      // storage back to bookmarks.
    }
  }

  // We don't remember an ID, maybe we forgot it? Search by exact name. Perhaps
  // the extension data was wiped but the bookmarks weren't (is that possible?).
  results = await browser.bookmarks.search({ title: STORE_NAME });

  if (results.length > 0) {
    const shallowStore = results[0].id;

    STORE_ID = shallowStore.id;

    // Search results are missing the `children` property, so use `getSubTree`
    // to get a complete tree node.
    return browser.bookmarks.getSubTree(shallowStore);
  }

  // Couldn't find it by ID or by name, so create it.
  const store = await browser.bookmarks.create({ title: STORE_NAME });

  STORE_ID = store.id;

  return store;
}

async function isWithinStore(bookmarkNode) {
  const store = await getOrCreateBookmarkStore();

  while (bookmarkNode) {
    try {
      if (bookmarkNode.id === store.id) {
        return true;
      }

      const results = await browser.bookmarks.get(bookmarkNode.parentId);

      if (results.length > 0) {
        bookmarkNode = results[0];
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  return false;
}

async function getOrCreateFolder(name, id) {
  // Get by id.
  let results = await browser.bookmarks.getSubTree(id);

  if (results.length > 0) {
    return results[0];
  }

  // Search by name.
  results = await browser.bookmarks.search({ title: name });

  results = results.filter(isWithinStore);

  if (results.length === 1) {
    return results[1];
  } else if (results.length > 1) {
    // TODO
    // Ensure this doesn't happen by using bookmark listeners?
    throw new Error(`There is more than one folder named '${name}' in the store!`);
  }

  // Create it.
  const store = await getOrCreateBookmarkStore();

  return browser.bookmarks.create({ parentId: store.id, title: name });
}

async function addBookmark(mark) {
  const store = await getOrCreateBookmarkStore();

  let parentId = store.id;

  if (mark.tag) {
    parentId = await getOrCreateFolder(mark.tag, METADATA.tags[mark.tag]);
  }

  const bookmark = await browser.bookmarks.create({
    parentId,
    title: mark.title,
    url: mark.url,
  });

  METADATA.links[mark.url].bookmarkId = bookmark.id;

  return bookmark;
}

function removeBookmark(url) {
  if (url in METADATA.links) {
    return browser.bookmarks.remove(METADATA.links[url].bookmarkId);
  }

  return Promise.resolve();
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

  // TODO
  // browser.runtime.onRemove? bookmarks.removeTree
  // browser.bookmarks.onRemoved et al to warn user
}

onLoad();
