import browser from 'webextension-polyfill';

import { Store, get } from '../../lib/storage';
import * as messages from '../../lib/messages';
import * as tabs from '../../lib/tabs';

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
        const currentTab = await tabs.current();
        const message = new messages.SaveTab(currentTab);

        await message.send();

        window.close();
      } catch (e) {
        // Display the error.
      }
    },
    async deleteTab(_event) {
      try {
        const currentTab = await tabs.current();
        const message = messages.DeleteTab(currentTab);

        await message.send();

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
    this.tab = await tabs.current();

    // NOTE
    // If the tab can update under our nose while the popup is open, react to
    // that?

    const { links } = await get(Store.links.key);

    if (this.tab.url in links) {
      this.link = links[this.tab.url];
    }

    browser.storage.onChanged.addListener(this.onStorageChanged);
  },
  destroyed() {
    browser.storage.onChanged.removeListener(this.onStorageChanged);
  },
};
