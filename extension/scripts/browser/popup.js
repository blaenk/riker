import Vue from 'vue';

import Popup from '../components/Popup/Popup.vue';

function onLoad(_event) {
  // eslint-disable-next-line no-unused-vars
  const vm = new Vue({
    el: '#root',
    render: (createElement) => createElement(Popup),
  });
}

document.addEventListener('DOMContentLoaded', onLoad);
