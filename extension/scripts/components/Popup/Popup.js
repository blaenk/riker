import browser from 'webextension-polyfill';

import { Store, set, get } from '../../lib/storage';
import { Messages } from '../../lib/messages';

// TODO
// browser.storage.onChanged to monitor changes?

export default {
  data() {
    return {
      tab: {},
      link: {},
    };
  },
  computed: {
    linkExists() {
      return Object.keys(this.link).length !== 0;
    },
  },
  methods: {
    async saveTab(_event) {
      try {
        const response = await browser.runtime.sendMessage(Messages.saveTab());

        window.close();
      } catch (e) {
        // Display the error.
      }
    },
    async deleteTab(_event) {
      try {
        const response = await browser.runtime.sendMessage(Messages.deleteTab());

        window.close();
      } catch (e) {
        // Display the error.
      }
    },
    async openIndex(_event) {
      await browser.tabs.create({
        url: browser.runtime.getURL('pages/index.html'),
      });
    },
    onStorageChanged(_changes, _areaName) {},
  },
  async created() {
    // See if this link already exists.
    const queryResult = await browser.tabs.query({
      currentWindow: true,
      active: true,
    });

    const currentTab = queryResult[0];

    this.tab = currentTab;

    // NOTE
    // If the tab can update under our nose while the popup is open, react to
    // that?

    const { links } = await get(Store.links.key);

    if (currentTab.url in links) {
      this.link = links[currentTab.url];
    }

    browser.storage.onChanged.addListener(this.onStorageChanged);
  },
  destroyed() {
    console.log('Destroyed');
    browser.storage.onChanged.removeListener(this.onStorageChanged);
  },
};
