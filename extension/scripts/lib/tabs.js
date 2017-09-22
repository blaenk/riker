import browser from 'webextension-polyfill';

export async function current() {
  const result = await browser.tabs.query({
    currentWindow: true,
    windowType: 'normal',
    active: true,
  });

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

export async function getAll(ids) {
  return Promise.all(ids.map(browser.tabs.get));
}
