import Vue from 'vue';

import Index from '../components/Index/Index.vue';

function onLoad(_event) {
  // eslint-disable-next-line no-unused-vars
  const vm = new Vue({
    el: '#root',
    render: (createElement) => createElement(Index),
  });
}

document.addEventListener('DOMContentLoaded', onLoad);
