import browser from 'webextension-polyfill';

// TODO
// Create an alias for storage.{local,sync} so that each occurrence doesn't have
// to be replaced when testing with one or another.

export const Store = Object.freeze({
  // FIXME
  // There are some issues with this design:
  //
  // * what about misses due to http-https?
  // * what about misses due to fragments?
  //
  // This maps a given URL to a link metadata entry, if any exists. The metadata
  // will contain:
  //
  //   * url:        The actual URL, so as to be self-contained.
  //   * title:      The page title of that URL.
  //   * faviconUrl: The page's favicon URL.
  //   * tag:        Optional: The name of the tag applied to this link.
  //   * dateAdded:  The timestamp when it was added.
  links: {
    key: 'links',
    create() {
      return {};
    },
  },

  // This maps the tag name to the bookmarkId of the folder corresponding to the
  // tag name. The folder will be named after the tag, so that if the tag is
  // renamed, so should the folder.
  tags: {
    key: 'tags',
    create() {
      return {};
    },
  },
});

function requestObjectForKeys(...keys) {
  const request = {};

  for (const key of keys) {
    if (key in Store) {
      request[key] = Store[key].create.call(null);
    }
  }

  return request;
}

/**
 * Get the given keys-values from storage.
 * @param {String} keys - The names of the keys.
 * @returns {Object} The object with the key-values.
 */
export function get(...keys) {
  const request = requestObjectForKeys(...keys);

  return browser.storage.sync.get(request);
}

export function set(object) {
  return browser.storage.sync.set(object);
}
