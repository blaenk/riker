import $ from 'jquery';

import 'webextension-polyfill';

import { Messages } from './common';

function render() {
  const backgroundPage = browser.extension.getBackgroundPage();

  const items = backgroundPage.Riker.links.map((link) => {
    return `<li>
              <img src="${link.faviconUrl}" width="16" height="16" />
              -
              <a href="${link.url}">${link.title}</a>
            </li>`;
  });

  $('#list').html(`<ul>${items.join('')}</ul>`);
}

render();

$('#save_tab').click(async function(_event) {
  const response = await browser.runtime.sendMessage(Messages.saveTab());

  if (response.success) {
    render();
  }
});
