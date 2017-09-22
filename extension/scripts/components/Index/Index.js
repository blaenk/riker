import browser from 'webextension-polyfill';

import { Store, set, get } from '../../lib/storage';
import { Messages } from '../../lib/messages';

// TODO
// browser.storage.onChanged to monitor changes?

export default {
  data() {
    return {
      links: {},
    };
  },
  methods: {
    onStorageChanged(changes, _areaName) {
      console.info(changes);

      if (changes.links && changes.links.newValue) {
        this.links = changes.links.newValue;
      }
    },
  },
  computed: {
    linksList() {
      return Object.values(this.links);
    },
  },
  async created() {
    const { links } = await get(Store.links.key);

    this.links = links;

    browser.storage.onChanged.addListener(this.onStorageChanged);
  },
  destroyed() {
    browser.storage.onChanged.removeListener(this.onStorageChanged);
  },
};
