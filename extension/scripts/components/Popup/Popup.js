import browser from 'webextension-polyfill';

import React from 'react';

import { Store, get } from '../../lib/storage';
import * as messages from '../../lib/messages';
import * as tabs from '../../lib/tabs';

export default class Popup extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      tab: null,
      link: null,
    };

    this.handleOpenIndex = this.handleOpenIndex.bind(this);
    this.handleSaveTab = this.handleSaveTab.bind(this);
    this.handleDeleteTab = this.handleDeleteTab.bind(this);
  }

  onStorageChanged() {
    // empty
  }

  async handleOpenIndex(_event) {
    await browser.tabs.create({
      url: browser.runtime.getURL('pages/index.html'),
    });
  }

  async handleSaveTab(_event) {
    try {
      const message = new messages.SaveTab(this.state.tab);

      await message.send();

      window.close();
    } catch (e) {
      // Display the error.
    }
  }

  async handleDeleteTab(_event) {
    try {
      const message = new messages.DeleteTab(this.state.tab);

      await message.send();

      window.close();
    } catch (e) {
      // Display the error.
    }
  }

  async componentDidMount() {
    const tab = await tabs.current();

    this.setState({ tab });

    const { links } = await get(Store.links.key);

    if (tab.url in links) {
      const link = links[tab.url];

      this.setState({ link });
    }

    browser.storage.onChanged.addListener(this.onStorageChanged);
  }

  componentWillUnmount() {
    browser.storage.onChanged.removeListener(this.onStorageChanged);
  }

  render() {
    if (!this.state.tab) {
      return null;
    }

    let actionButton;

    if (this.state.link) {
      actionButton = <button onClick={this.handleDeleteTab}>Delete</button>;
    } else {
      actionButton = <button onClick={this.handleSaveTab}>Save</button>;
    }

    return (
      <div>
        <div className='tab-info'>
          <img className='tab-favicon' src={this.state.tab.favIconUrl} width='16' height='16' />

          <div className='tab-title'>{this.state.tab.title}</div>
        </div>

        {actionButton}

        <button onClick={this.handleOpenIndex}>Index</button>
      </div>
    );
  }
}
