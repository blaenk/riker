import browser from 'webextension-polyfill';

export class Message {
  constructor(type) {
    this.type = type;
    this.payload = { type };
  }

  type() {
    return this.type;
  }

  payload() {
    return this.payload;
  }

  send() {
    return browser.runtime.sendMessage(this.payload);
  }
}

export const MESSAGE_SAVE_TAB = 'MESSAGE_SAVE_TAB';

export class SaveTab extends Message {
  constructor(tab) {
    super(MESSAGE_SAVE_TAB);

    this.payload.tab = tab;
  }
}

export const MESSAGE_DELETE_TAB = 'MESSAGE_DELETE_TAB';

export class DeleteTab extends Message {
  constructor(tab) {
    super(MESSAGE_DELETE_TAB);

    this.payload.tab = tab;
  }
}

export const MESSAGE_DELETE_LINK = 'MESSAGE_DELETE_LINK';

export class DeleteLink extends Message {
  constructor(url) {
    super(MESSAGE_DELETE_LINK);

    this.payload.url = url;
  }
}
