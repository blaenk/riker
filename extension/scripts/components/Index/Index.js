import browser from 'webextension-polyfill';
import React from 'react';
import moment from 'moment';

import { Store, get } from '../../lib/storage';
import * as messages from '../../lib/messages';

class LinkItem extends React.Component {
  constructor(props) {
    super(props);

    this.handleDeleteLink = this.handleDeleteLink.bind(this);
  }

  async handleDeleteLink() {
    const message = new messages.DeleteLink(this.props.link.url);

    await message.send();
  }

  render() {
    return (
      <li>
        <button onClick={this.handleDeleteLink}>Delete</button>
        <img src={this.props.link.url} width='16' height='16' />
        <a href={this.props.link.url}>{this.props.link.title}</a>
        saved {moment(this.props.link.date).fromNow()}
      </li>
    );
  }
}

export default class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      links: [],
    };

    this.onStorageChanged = this.onStorageChanged.bind(this);
  }

  async componentWillMount() {
    const { links } = await get(Store.links.key);

    this.setState({ links });

    browser.storage.onChanged.addListener(this.onStorageChanged);
  }

  componentWillUnmount() {
    browser.storage.onChanged.removeListener(this.onStorageChanged);
  }

  onStorageChanged(changes, _areaName) {
    if (changes.links && changes.links.newValue) {
      this.setState({ links: changes.links.newValue });
    }
  }

  render() {
    const linksValues = Object.values(this.state.links);

    const links = linksValues.map((link) => <LinkItem link={link} key={link.url} />);

    const linkList = (
      <ul>
        {links}
      </ul>
    );

    const noLinks = (
      <p>No links!</p>
    );

    return (
      <div>
        {linksValues.length > 0 ? linkList : noLinks}
      </div>
    );
  }
}
