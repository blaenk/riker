export const MESSAGE_SAVE_TAB = 'MESSAGE_SAVE_TAB';

// eslint-disable-next-line no-unused-vars
export class Messages {
  static saveTab(link) {
    return { type: MESSAGE_SAVE_TAB, link };
  }
}
