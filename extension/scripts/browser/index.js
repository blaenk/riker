import React from 'react';
import ReactDOM from 'react-dom';

import Index from '../components/Index/Index';

function onLoad(_event) {
  ReactDOM.render(<Index />, document.querySelector('#root'));
}

document.addEventListener('DOMContentLoaded', onLoad);
