import browser from 'webextension-polyfill';
import moment from 'moment';

import { Store, get } from '../../lib/storage';
import * as messages from '../../lib/messages';

// TODO
// browser.storage.onChanged to monitor changes?

export default {
  data() {
    return {
      links: {},
    };
  },
  filters: {
    formatDate(date) {
      return moment(date).fromNow();
    },
  },
  methods: {
    onStorageChanged(changes, _areaName) {
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
