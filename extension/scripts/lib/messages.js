export const MESSAGE_SAVE_CURRENT_TAB = 'MESSAGE_SAVE_CURRENT_TAB';
export const MESSAGE_DELETE_CURRENT_TAB = 'MESSAGE_DELETE_CURRENT_TAB';

// eslint-disable-next-line no-unused-vars
export class Messages {
  static saveTab() {
    return { type: MESSAGE_SAVE_CURRENT_TAB };
  }

  static deleteTab() {
    return { type: MESSAGE_DELETE_CURRENT_TAB };
  }
}
