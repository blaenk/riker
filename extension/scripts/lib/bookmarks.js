import {
  getStore,
  setStore,
  getTags,
  mapLinks,
} from './storage';

/**
 * Perform a potentially-depth-limited Breadth-First-Search of the given tree.
 * @param {Object} node - An object with a children property.
 * @param {Function} predicate - A predicate function used to terminate the search.
 * @param {Number} maxDepth - Optional max depth to traverse.
 * @returns {Object} The found object or null.
 */
export async function breadthFirstSearch(node, predicate, maxDepth = -1) {
  const frontier = [node];

  let remainingNodesAtCurrentDepth = 1;
  let depth = 0;

  while (frontier.length > 0) {
    node = frontier.pop();

    if (predicate(node)) {
      return node;
    }

    if (maxDepth !== -1) {
      remainingNodesAtCurrentDepth--;

      if (remainingNodesAtCurrentDepth === 0) {
        depth++;

        if (depth > maxDepth) {
          return null;
        }

        remainingNodesAtCurrentDepth = node.children.length;
      }
    }

    if (node.children) {
      for (const child of node.children) {
        frontier.push(child);
      }
    }
  }

  return null;
}

/**
 * Perform a Breadth-First-Search of the entire bookmarks tree.
 * @param {Function} predicate - The search function.
 * @param {Number} maxDepth - Optional max depth to traverse.
 * @returns {Object} The found object or null.
 */
export async function breadthFirstSearchAll(predicate, maxDepth = -1) {
  const nodes = await browser.bookmarks.getTree();

  return breadthFirstSearch(nodes[0], predicate, maxDepth);
}

export async function breadthFirstSearchFrom(bookmarkId, predicate, maxDepth = -1) {
  const nodes = await browser.bookmarks.getSubTree(bookmarkId);

  return breadthFirstSearch(nodes[0], predicate, maxDepth);
}

export async function findFolderByName(name, maxDepth = -1) {
  return breadthFirstSearchAll((node) => !node.url && node.title === name, maxDepth);
}

/**
 * Attempt to locate the store by name.
 * @returns {BookmarkTreeNode} The tree node, if found. Null otherwise.
 */
export async function findStoreFolder() {
  const store = await getStore();

  return findFolderByName(store.name, 1);
}

// TODO
// Generalize below to getOrCreateFolder?

class BookmarkStoreUnavailableError extends Error {}

export async function getBookmarkStore(store) {
  if (store.bookmarkId) {
    try {
      const results = await browser.bookmarks.get(store.bookmarkId);

      return results[0];
    } catch (e) {
      // Bookmark folder was probably removed by the user. Attempt to recover it
      // by name, which is hard-coded, by proceeding to the next condition.
    }
  }

  if (store.name) {
    const folder = await findFolderByName(store.name, 1);

    if (folder) {
      return folder;
    }
  }

  // Couldn't find it by ID or by name.
  throw new BookmarkStoreUnavailableError();
}

export async function createBookmarkStore(store) {
  const storeBookmark = await browser.bookmarks.create({ title: store.name });

  store.id = storeBookmark.id;

  await setStore(store);

  return store;
}

export async function getOrCreateBookmarkStore() {
  const store = await getStore();

  let bookmarkStore;

  try {
    bookmarkStore = await getBookmarkStore();
  } catch (e) {
    if (e instanceof BookmarkStoreUnavailableError) {
      bookmarkStore = await createBookmarkStore(store);
    } else {
      throw e;
    }
  }

  return bookmarkStore;
}

export async function isWithinStore(bookmarkNode) {
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

export async function getOrCreateFolder(name, id) {
  // Get by id.
  let results = await browser.bookmarks.getSubTree(id);

  if (results.length > 0) {
    return results[0];
  }

  // Search by name.
  results = await browser.bookmarks.search({ title: name });

  results = results.filter(isWithinStore);

  if (results.length === 1) {
    return results[0];
  } else if (results.length > 1) {
    // TODO
    // Ensure this doesn't happen by using bookmark listeners?
    throw new Error(`There is more than one folder named '${name}' in the store!`);
  }

  // Create it.
  const store = await getOrCreateBookmarkStore();

  return browser.bookmarks.create({ parentId: store.id, title: name });
}

export async function addBookmark(mark) {
  const store = await getOrCreateBookmarkStore();

  let parentId = store.id;

  if (mark.tag) {
    const tags = await getTags();

    parentId = await getOrCreateFolder(mark.tag, tags[mark.tag]);
  }

  const bookmark = await browser.bookmarks.create({
    parentId,
    title: mark.title,
    url: mark.url,
  });

  return bookmark;
}

export async function removeBookmark(bookmarkId) {
  await mapLinks(async (links) => {
    if (bookmarkId in links) {
      await browser.bookmarks.remove(links[bookmarkId]);

      delete links[bookmarkId];
    }

    return links;
  });
}
